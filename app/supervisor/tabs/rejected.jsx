import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import useAuthStore from '../../../store/authStore';
import ReportCard from '../../../components/ReportCard';
import styles from '../../../assets/styles/dashboard.styles';
import { API_URL } from '../../../constants/api';
import { RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RejectedReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuthStore();
  const router = useRouter();

  const fetchRejectedReports = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/supervisor/reports/rejected`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch reports');
      
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      setError(error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRejectedReports();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRejectedReports();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRejectedReports}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
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
            onPress={() => router.push(`/supervisor/rejected-report-details/${item._id}`)}
            showStatus={true}
            status="rejected"
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
            <Ionicons name="close-circle-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No rejected reports</Text>
            <Text style={styles.emptySubtext}>No reports have been rejected yet</Text>
          </View>
        }
      />
    </View>
  );
}