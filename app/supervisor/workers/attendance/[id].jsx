import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, TouchableOpacity, 
  StyleSheet, FlatList, Alert, 
  RefreshControl 
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'; // Added useFocusEffect
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../../../store/authStore';
import { API_URL } from '../../../../constants/api';
import COLORS from '../../../../constants/colors';
import Loader from '../../../../components/Loader';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ActivityIndicator } from 'react-native';

export default function WorkerAttendanceScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [worker, setWorker] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loadingWorker, setLoadingWorker] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const { token } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [errorWorker, setErrorWorker] = useState(null);

  const fetchWorkerDetails = useCallback(async () => {
    try {
      setErrorWorker(null);
      setLoadingWorker(true);
      
      const response = await fetch(`${API_URL}/workers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch worker (Status: ${response.status})`);
      }
      
      const data = await response.json();
      setWorker(data.worker);
    } catch (error) {
      setErrorWorker(error.message);
    } finally {
      setLoadingWorker(false);
    }
  }, [id, token]);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoadingAttendance(true);
      const response = await fetch(
        `${API_URL}/attendance/worker/${id}/by-date?month=${selectedMonth}&year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch attendance (Status: ${response.status})`);
      }
      
      const data = await response.json();
      setAttendance(data.attendance || []);
      
      // Check if today's attendance exists
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      const todayRecord = data.attendance.find(record => 
        format(new Date(record.date), 'yyyy-MM-dd') === todayStr
      );
      setTodayAttendance(todayRecord);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoadingAttendance(false);
      setRefreshing(false);
    }
  }, [id, selectedMonth, selectedYear, token]);

  useEffect(() => {
    if (id && token) {
      fetchWorkerDetails();
      fetchAttendance();
    }
  }, [id, token, fetchWorkerDetails, fetchAttendance]);

  // Handle refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (id && token) {
        fetchWorkerDetails();
        fetchAttendance();
      }
    }, [id, token, fetchWorkerDetails, fetchAttendance])
  );

  const retryFetchWorker = () => {
    setErrorWorker(null);
    fetchWorkerDetails();
  };

  const handleMonthChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedMonth(selectedDate.getMonth() + 1);
      setSelectedYear(selectedDate.getFullYear());
    }
  };

  const markTodaysAttendance = () => {
    router.push(`/supervisor/workers/mark-attendance/${id}`);
  };

  const showAttendanceHistory = () => {
    router.push(`/supervisor/workers/attendance-history/${id}`);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return COLORS.success;
      case 'absent': return COLORS.error;
      case 'on-leave': return COLORS.warning;
      default: return COLORS.textSecondary;
    }
  };

  // Handle refresh action
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWorkerDetails();
    fetchAttendance();
  }, [fetchWorkerDetails, fetchAttendance]);

  // Show loader while loading worker details
  if (loadingWorker) {
    return <Loader />;
  }

  // Show error if worker fetch failed
  if (errorWorker) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {errorWorker}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={retryFetchWorker}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Header component for FlatList
  const HeaderComponent = () => (
    <>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>{worker?.name || 'Worker Details'}</Text>
          {worker && (
            <Text style={styles.workerDetails}>{worker.phone} • {worker.area}</Text>
          )}
        </View>
      </View>

      {/* Date selector */}
      <View style={styles.dateSelector}>
        <Text style={styles.monthText}>
          {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { 
            month: 'long', year: 'numeric' 
          })}
        </Text>
        <TouchableOpacity 
          onPress={() => setShowDatePicker(true)}
          style={styles.datePickerButton}
        >
          <Ionicons name="calendar" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={new Date(selectedYear, selectedMonth - 1)}
          mode="date"
          display="default"
          onChange={handleMonthChange}
        />
      )}

      {/* Action buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            styles.markButton,
            todayAttendance && styles.disabledButton
          ]}
          onPress={markTodaysAttendance}
          disabled={!!todayAttendance}
        >
          <Ionicons 
            name="checkmark-circle" 
            size={24} 
            color={todayAttendance ? COLORS.lightGray : 'white'} 
          />
          <Text style={[
            styles.buttonText,
            todayAttendance && styles.disabledText
          ]}>
            {todayAttendance ? 'Attendance Marked' : "Mark Today's Attendance"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.historyButton]}
          onPress={showAttendanceHistory}
        >
          <Ionicons name="time-outline" size={24} color="white" />
          <Text style={styles.buttonText}>Attendance History</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  // Empty state component
  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {loadingAttendance ? (
        <>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading attendance...</Text>
        </>
      ) : (
        <>
          <Ionicons name="calendar-outline" size={48} color={COLORS.lightGray} />
          <Text style={styles.emptyText}>No attendance records for this month</Text>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
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
        ListHeaderComponent={<HeaderComponent />}
        ListEmptyComponent={<EmptyComponent />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={attendance.length === 0 && styles.emptyListContainer}
      />
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
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
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
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  datePickerButton: {
    padding: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
    paddingHorizontal: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markButton: {
    backgroundColor: COLORS.primary,
  },
  historyButton: {
    backgroundColor: '#6c757d',
  },
  disabledButton: {
    backgroundColor: '#e9ecef',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 10,
    marginHorizontal: 16,
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.textSecondary,
  },
  emptyListContainer: {
    flexGrow: 1,
  }
});