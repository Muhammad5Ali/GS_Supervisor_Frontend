import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import useAuthStore from '../../store/authStore';
import { API_URL } from '../../constants/api';
import ReportCard from '../../components/ReportCard';
import COLORS from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function OutOfScopeReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuthStore();
  const router = useRouter();

  const fetchOutOfScopeReports = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${API_URL}/supervisor/reports/out-of-scope`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch reports');
      
      const data = await response.json();
      setReports(data.reports);
    } catch (error) {
      console.error('Out-of-scope reports fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOutOfScopeReports();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Out of Scope Reports</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="earth-outline" size={60} color={COLORS.lightGray} />
          <Text style={styles.emptyText}>No out-of-scope reports</Text>
          <Text style={styles.emptySubtext}>Reports marked as out of scope will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={({ item }) => (
         <ReportCard 
  report={item} 
  onPress={() => router.push(`/supervisor/out-of-scope-details/${item._id}`)}
  showStatus={true}
  status="out-of-scope"
/>
          )}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchOutOfScopeReports}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.lightGray,
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
});