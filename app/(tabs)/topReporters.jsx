  import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
  import React, { useEffect, useState } from 'react';
  import { API_URL } from '../../constants/api';
import useAuthStore from '../../store/authStore';
  import COLORS from '../../constants/colors';
  import { getImageUrl } from '../../lib/utils';
  import styles from '../../assets/styles/topReporters.styles';
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
      console.log('Fetching from:', url); // Debug log
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText); // Debug log
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      const data = JSON.parse(responseText);
      setTopReporters(data);
    } catch (error) {
      console.error('Full fetch error:', error);
      setError(error.message.startsWith('<') 
        ? 'Server returned HTML instead of JSON' 
        : error.message);
    } finally {
      setLoading(false);
    }
  };

    const onRefresh = async () => {
      setRefreshing(true);
      await fetchTopReporters();
      setRefreshing(false);
    };

    useEffect(() => {
      fetchTopReporters();
    }, []);

  //   const renderItem = ({ item, index }) => (
  //     <View style={styles.reporterCard}>
  //       <Text style={styles.rank}>{index + 1}</Text>
  //       <Image 
  // //        source={{ 
  // //   uri: item.profileImage 
  // //     ? `https://api.dicebear.com/7.x/avataaars/png?seed=${item.username}`
  // //     : 'https://via.placeholder.com/50'
  // // }}
  // source={{ uri: getImageUrl(item.profileImage) || 'https://via.placeholder.com/50' }}
  //   style={styles.avatar}
  //       />
  //       <View style={styles.reporterInfo}>
  //         <Text style={styles.username}>{item.username}</Text>
  //         <Text style={styles.reportsCount}>Reports: {item.reportCount}</Text>
  //         <Text style={styles.points}>Points: {item.points}</Text>
  //       </View>
  //     </View>
  //   );
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
          // Trophy icons for top 3
          <>
            {index === 0 && <MaterialIcons name="emoji-events" size={24} color="#FFD700" />}
            {index === 1 && <MaterialIcons name="emoji-events" size={20} color="#C0C0C0" />}
            {index === 2 && <MaterialIcons name="emoji-events" size={16} color="#CD7F32" />}
          </>
        ) : (
          // Rank number for positions 4+
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
            <Ionicons name="star" size={16} color={index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32"} />
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
            <Ionicons name="star" size={16} color={COLORS.accent} />
            <Text style={styles.statText}>{item.points} points</Text>
          </View>
        </View>
      </View>
    </View>
  );


    if (loading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.container}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Ionicons name="trophy" size={32} color={COLORS.gold} style={styles.trophyIcon} />
          <Text style={styles.headerTitle}>Top Reporters</Text>
          <Ionicons name="trophy" size={32} color={COLORS.gold} style={styles.trophyIcon} />
        </View>
        <Text style={styles.subHeader}>Community leaders making a difference</Text>
        
        <FlatList
          refreshing={refreshing}
          onRefresh={onRefresh}
          data={topReporters}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No top reporters yet</Text>
              <Text style={styles.emptySubtext}>Be the first to make a report!</Text>
            </View>
          }
        />
      </View>
    );
  }

  