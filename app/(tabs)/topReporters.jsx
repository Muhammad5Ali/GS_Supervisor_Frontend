import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import { API_URL } from '../../constants/api';
import useAuthStore from '../../store/authStore';
import COLORS from '../../constants/colors';
import { getImageUrl } from '../../lib/utils';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function TopReporters() {
  const [topReporters, setTopReporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const fetchTopReporters = async () => {
    try {
      const url = `${API_URL}/users/top-reporters`;
      setRefreshing(true);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTopReporters(data);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTopReporters();
  }, []);

  const renderItem = ({ item, index }) => (
    <View style={[
      styles.reporterCard,
      index === 0 && styles.firstPlace,
      index === 1 && styles.secondPlace,
      index === 2 && styles.thirdPlace
    ]}>
      {/* Rank Badge */}
      <View style={[
        styles.rankBadge,
        index === 0 && styles.firstBadge,
        index === 1 && styles.secondBadge,
        index === 2 && styles.thirdBadge
      ]}>
        {index < 3 ? (
          <>
            {index === 0 && <MaterialIcons name="emoji-events" size={24} color={COLORS.warning} />}
            {index === 1 && <MaterialIcons name="emoji-events" size={20} color={COLORS.textSecondary} />}
            {index === 2 && <MaterialIcons name="emoji-events" size={16} color={COLORS.darkGray} />}
          </>
        ) : (
          <Text style={styles.rankText}>{index + 1}</Text>
        )}
      </View>
      
      {/* User Avatar */}
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: getImageUrl(item.profileImage) || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        {index < 3 && (
          <View style={styles.crownContainer}>
            <Ionicons 
              name="star" 
              size={16} 
              color={
                index === 0 ? COLORS.warning : 
                index === 1 ? COLORS.textSecondary : 
                COLORS.darkGray
              } 
            />
          </View>
        )}
      </View>
      
      {/* User Info */}
      <View style={styles.reporterInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="document-text" size={16} color={COLORS.primary} />
            <Text style={styles.statText}>{item.reportCount} reports</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color={COLORS.primary} />
            <Text style={styles.statText}>{item.points} points</Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTopReporters}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Ionicons name="trophy" size={32} color={COLORS.primary} style={styles.trophyIcon} />
        <Text style={styles.headerTitle}>Top Reporters</Text>
        <Ionicons name="trophy" size={32} color={COLORS.primary} style={styles.trophyIcon} />
      </View>
      <Text style={styles.subHeader}>Community leaders making a difference</Text>
      
      <FlatList
        refreshing={refreshing}
        onRefresh={fetchTopReporters}
        data={topReporters}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={60} color={COLORS.lightGray} />
            <Text style={styles.emptyText}>No top reporters yet</Text>
            <Text style={styles.emptySubtext}>Be the first to make a report!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  trophyIcon: {
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  reporterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  firstPlace: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  secondPlace: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.textSecondary,
  },
  thirdPlace: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.darkGray,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.lightBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  firstBadge: {
    backgroundColor: `${COLORS.warning}20`,
  },
  secondBadge: {
    backgroundColor: `${COLORS.textSecondary}20`,
  },
  thirdBadge: {
    backgroundColor: `${COLORS.darkGray}20`,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  crownContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 3,
  },
  reporterInfo: {
    flex: 1,
    marginLeft: 15,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 5,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textPrimary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  retryButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignSelf: 'center',
  },
  retryText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});