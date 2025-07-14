import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useEffect, useState, useCallback, useRef, memo } from 'react';
import useAuthStore from '../../store/authStore';
import styles from '../../assets/styles/home.styles';
import { API_URL } from '../../constants/api';
import { formatPublishDate, getImageUrl } from '../../lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import COLORS from '../../constants/colors';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { isJwtExpired } from '../../lib/jwtUtils';
import { useFocusEffect } from 'expo-router';

const HeaderWithIcon = memo(() => (
  <View style={styles.header}>
    <View style={styles.headerTitleContainer}>
      <Text style={styles.headerTitle}>GreenSnap</Text>
      <Ionicons 
        name="leaf" 
        size={26} 
        color={COLORS.primary} 
        style={styles.headerIcon} 
      />
    </View>
    <Text style={styles.headerSubtitle}>Explore the latest reports shared by our community</Text>
  </View>
));

const ReportCard = memo(({ item }) => {
  const user = item.user || { username: "Unknown", profileImage: null };
  
  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'in-progress': return COLORS.info;
      case 'resolved': return COLORS.success;
      default: return COLORS.gray;
    }
  };

  // Function to format status text
  const formatStatusText = (status) => {
    switch (status) {
      case 'in-progress': return 'In Progress';
      default: return status;
    }
  };

  return (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.userInfo}>
          {user.profileImage && (
            <Image 
              source={{ uri: getImageUrl(user.profileImage) }} 
              style={styles.avatar}
              onError={(e) => console.log("Avatar error:", e.nativeEvent.error)}
            />
          )}
          <Text style={styles.username}>{user.username}</Text>
        </View>
        
        {/* Status Badge */}
        {item.status && (
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusBadgeText}>
              {formatStatusText(item.status)}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.reportImageContainer}>
        {item.image && (
          <Image 
            source={{ uri: getImageUrl(item.image) }} 
            style={styles.reportImage}
            onError={(e) => console.log("Image error:", e.nativeEvent.error)}
          />
        )}
      </View>
      <View style={styles.reportDetails}>
        <Text style={styles.reportTitle}>{item.title}</Text>
        <Text style={styles.reportDetails}>{item.details}</Text>
        <Text style={styles.date}>Shared on {formatPublishDate(item.createdAt)}</Text>
      </View>
    </View>
  );
});

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {
  const { isCheckingAuth, user, token } = useAuthStore();
  const [reports, setReports] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(true);
  const [rateLimited, setRateLimited] = useState(false);
  const lastFetchTime = useRef(0);
  const isMounted = useRef(true);
  const retryCount = useRef(0); // Track retry attempts

  const fetchReports = useCallback(async (pageNum = 1, refresh = false) => {
    const now = Date.now();
    if (now - lastFetchTime.current < 1000) {
      return;
    }
    
    lastFetchTime.current = now;
    setIsFetching(true);
    
    if (!token || isJwtExpired(token)) {
      console.warn("Token expired or invalid - logging out");
      Alert.alert("Session Expired", "Your session has expired. Please login again.");
      await useAuthStore.getState().logout();
      router.replace('/login');
      setIsFetching(false);
      return;
    }

    try {
      if (refresh) setRefreshing(true);

      const response = await fetch(`${API_URL}/report?page=${pageNum}&limit=2`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '10', 10);
          
          // Implement exponential backoff
          const backoffTime = Math.min(30000, Math.pow(2, retryCount.current) * 1000);
          retryCount.current++;
          
          console.warn(`Rate limited. Retrying in ${backoffTime/1000} seconds`);
          setRateLimited(true);
          await sleep(backoffTime);
          return fetchReports(pageNum, refresh);
        }
        
        if (response.status === 401) {
          console.warn("Token rejected by server");
          await useAuthStore.getState().logout();
          router.replace("/login");
          return;
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Reset retry counter on successful request
      retryCount.current = 0;
      setRateLimited(false);

      const data = await response.json();

      if (!data.reports || !Array.isArray(data.reports)) {
        console.error("Invalid response format:", data);
        throw new Error("Invalid reports data format");
      }

      setReports(prev => {
        if (refresh || pageNum === 1) {
          return data.reports;
        }
        
        // Merge and deduplicate reports
        const existingIds = new Set(prev.map(r => r._id));
        const newReports = data.reports.filter(r => !existingIds.has(r._id));
        return [...prev, ...newReports];
      });
      
      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching reports:", error.message);
      
      if (!error.message.includes('HTTP 429')) {
        Alert.alert(
          "Error", 
          "Failed to load reports. Please try again.",
          [{ text: "OK", onPress: () => setRateLimited(false) }]
        );
      }
    } finally {
      setIsFetching(false);
      if (refresh) setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      isMounted.current = true;
      
      if (user && token && reports.length === 0) {
        fetchReports();
      }

      return () => {
        isMounted.current = false;
      };
    }, [user, token, fetchReports, reports.length])
  );

  // Memoized render function for FlatList
  const renderItem = useCallback(({ item }) => (
    <ReportCard item={item} />
  ), []);

  // Memoized key extractor
  const keyExtractor = useCallback((item) => item._id, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isFetching && !refreshing && !rateLimited) {
      fetchReports(page + 1);
    }
  }, [hasMore, isFetching, refreshing, page, fetchReports, rateLimited]);

  if (isCheckingAuth || (isFetching && reports.length === 0)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        {rateLimited && (
          <Text style={{ marginTop: 10, color: COLORS.warning }}>
            Rate limited, retrying...
          </Text>
        )}
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>User not authenticated. Please login.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              retryCount.current = 0;
              fetchReports(1, true);
            }}
            tintColor={COLORS.primary}
            enabled={!rateLimited}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={<HeaderWithIcon />}
        ListFooterComponent={
          hasMore && reports.length > 0 && !refreshing ? (
            <View style={styles.footerContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              {rateLimited && (
                <Text style={styles.rateLimitText}>
                  Rate limited, retrying in {Math.pow(2, retryCount.current)} seconds...
                </Text>
              )}
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isFetching && (
            <View style={styles.emptyContainer}>
              <Ionicons name="trash-sharp" size={60} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No reports found</Text>
              <Text style={styles.emptySubtext}>Be the first to share a report</Text>
              {rateLimited && (
                <Text style={[styles.emptySubtext, { color: COLORS.warning, marginTop: 10 }]}>
                  Server is busy, please try again later
                </Text>
              )}
            </View>
          )
        }
        // Performance optimizations
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        updateCellsBatchingPeriod={100}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
}