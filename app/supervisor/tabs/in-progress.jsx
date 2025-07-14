import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import useAuthStore from '../../../store/authStore';
import ReportCard from '../../../components/ReportCard';
import styles from '../../../assets/styles/dashboard.styles';
import { API_URL } from '../../../constants/api';
import { RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function InProgressReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuthStore();
  const router = useRouter();

  const fetchInProgressReports = async () => {
    try {
      const response = await fetch(`${API_URL}/supervisor/reports/in-progress`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch reports');
      
      const data = await response.json();
      setReports(data.reports);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInProgressReports();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInProgressReports();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        renderItem={({ item }) => (
          <ReportCard 
            report={item} 
            onPress={() => router.push(`/supervisor/resolve-report/${item._id}`)}
            showStatus={true}
            status="in-progress"
          />
        )}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="build-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No in-progress reports</Text>
            <Text style={styles.emptySubtext}>No reports are currently being worked on</Text>
          </View>
        }
      />
    </View>
  );
}