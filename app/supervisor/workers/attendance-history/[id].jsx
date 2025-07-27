import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, ActivityIndicator, 
  StyleSheet, FlatList, Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../../../store/authStore';
import { API_URL } from '../../../../constants/api';
import COLORS from '../../../../constants/colors';
import { format } from 'date-fns';

export default function WorkerAttendanceHistoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [worker, setWorker] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  const fetchWorkerDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/workers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch worker');
      
      const data = await response.json();
      setWorker(data.worker);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/attendance/worker/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!response.ok) throw new Error('Failed to fetch attendance');
      
      const data = await response.json();
      setAttendance(data.attendance || []);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && token) {
      fetchWorkerDetails();
      fetchAttendanceHistory();
    }
  }, [id, token]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return COLORS.success;
      case 'absent': return COLORS.error;
      case 'on-leave': return COLORS.warning;
      default: return COLORS.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>{worker?.name || 'Attendance History'}</Text>
          {worker && (
            <Text style={styles.workerDetails}>{worker.phone} • {worker.area}</Text>
          )}
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Records:</Text>
          <Text style={styles.summaryValue}>{attendance.length}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Last Record:</Text>
          <Text style={styles.summaryValue}>
            {attendance.length > 0 
              ? format(new Date(attendance[0].date), 'dd MMM yyyy') 
              : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Attendance list */}
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : attendance.length > 0 ? (
        <FlatList
          data={attendance}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.attendanceItem}>
              <Text style={styles.date}>
                {format(new Date(item.date), 'dd MMM yyyy')}
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) }
              ]}>
                <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
              </View>
              <Text style={styles.tasksText}>
                {item.tasksCompleted} tasks
              </Text>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color={COLORS.lightGray} />
          <Text style={styles.emptyText}>No attendance records found</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  workerDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  date: {
    flex: 2,
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center'
  },
  tasksText: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    color: COLORS.textSecondary,
    fontSize: 16,
  }
});