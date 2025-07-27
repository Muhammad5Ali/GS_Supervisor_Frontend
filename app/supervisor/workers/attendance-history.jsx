import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, 
  StyleSheet, ActivityIndicator, Dimensions, ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../../store/authStore';
import { API_URL } from '../../../constants/api';
import COLORS from '../../../constants/colors';
import { format } from 'date-fns';
import { BarChart, PieChart } from 'react-native-chart-kit';

export default function AttendanceHistoryScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [showAllWorkers, setShowAllWorkers] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'attendance', 'tasks'
  const { token } = useAuthStore();
  const router = useRouter();

  const screenWidth = Dimensions.get('window').width;

  // Fetch attendance data for selected date
  const fetchAttendanceData = async (date) => {
    try {
      setLoading(true);
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await fetch(`${API_URL}/attendance/by-date?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      setAttendanceData(data.attendance || []);
    } catch (error) {
      console.error("Attendance fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all workers
  const fetchAllWorkers = async () => {
    try {
      setLoadingWorkers(true);
      const response = await fetch(`${API_URL}/workers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      setAllWorkers(data.workers || []);
    } catch (error) {
      console.error("Workers fetch error:", error);
    } finally {
      setLoadingWorkers(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData(selectedDate);
    fetchAllWorkers();
  }, []);

  useEffect(() => {
    fetchAttendanceData(selectedDate);
  }, [selectedDate]);

  const handleDayPress = (day) => {
    setSelectedDate(new Date(day.dateString));
    setShowAllWorkers(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return COLORS.success;
      case 'absent': return COLORS.error;
      case 'on-leave': return COLORS.warning;
      case 'not-marked': return COLORS.lightGray;
      default: return COLORS.textSecondary;
    }
  };

  // Create combined data for display
  const displayedData = useMemo(() => {
    if (showAllWorkers) {
      return allWorkers.map(worker => {
        const attendance = attendanceData.find(a => a.worker._id === worker._id);
        return {
          worker,
          status: attendance ? attendance.status : 'not-marked',
          tasksCompleted: attendance ? attendance.tasksCompleted : 0
        };
      });
    } else {
      return attendanceData.map(item => ({
        worker: item.worker,
        status: item.status,
        tasksCompleted: item.tasksCompleted
      }));
    }
  }, [showAllWorkers, allWorkers, attendanceData]);

  // Prepare chart data
  const attendanceChartData = {
    labels: ["Present", "Absent", "On Leave"],
    datasets: [
      {
        data: [
          attendanceData.filter(a => a.status === 'present').length,
          attendanceData.filter(a => a.status === 'absent').length,
          attendanceData.filter(a => a.status === 'on-leave').length
        ],
        colors: [
          () => COLORS.success,
          () => COLORS.error,
          () => COLORS.warning
        ]
      }
    ]
  };

  // Prepare task data
  const taskChartData = {
    labels: ["0 Tasks", "1-3 Tasks", "4+ Tasks"],
    datasets: [
      {
        data: [
          attendanceData.filter(a => a.tasksCompleted === 0).length,
          attendanceData.filter(a => a.tasksCompleted >= 1 && a.tasksCompleted <= 3).length,
          attendanceData.filter(a => a.tasksCompleted >= 4).length
        ]
      }
    ]
  };

  // Get top performers
  const topPerformers = [...attendanceData]
    .filter(a => a.status === 'present')
    .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
    .slice(0, 5);

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance History</Text>
      </View>

      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [format(selectedDate, 'yyyy-MM-dd')]: { selected: true }
        }}
        theme={{
          selectedDayBackgroundColor: COLORS.primary,
          todayTextColor: COLORS.primary,
          arrowColor: COLORS.primary,
        }}
      />
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'list' && styles.activeTab]}
          onPress={() => setActiveTab('list')}
        >
          <Text style={styles.tabText}>Worker List</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'attendance' && styles.activeTab]}
          onPress={() => setActiveTab('attendance')}
        >
          <Text style={styles.tabText}>Attendance Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'tasks' && styles.activeTab]}
          onPress={() => setActiveTab('tasks')}
        >
          <Text style={styles.tabText}>Task Stats</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'list' ? (
        <>
          {/* Toggle button */}
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowAllWorkers(!showAllWorkers)}
          >
            <Text style={styles.toggleButtonText}>
              {showAllWorkers ? 'Show Only Marked Workers' : 'View All Workers'}
            </Text>
          </TouchableOpacity>

          {loading || loadingWorkers ? (
            <ActivityIndicator size="large" style={styles.loader} />
          ) : (
            <FlatList
              data={displayedData}
              keyExtractor={item => item.worker._id}
              extraData={showAllWorkers}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.card}
                  onPress={() => router.push(`/supervisor/workers/attendance/${item.worker._id}`)}
                >
                  <Text style={styles.name}>{item.worker.name}</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.phone}>{item.worker.phone}</Text>
                    <Text style={styles.area}>{item.worker.area}</Text>
                  </View>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                      <Text style={styles.statusText}>
                        {item.status === 'not-marked' ? 'NOT MARKED' : item.status.toUpperCase()}
                      </Text>
                    </View>
                    {item.status !== 'not-marked' && (
                      <Text style={styles.tasks}>Tasks: {item.tasksCompleted}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {showAllWorkers 
                    ? "No workers available" 
                    : "No attendance marked for selected date"}
                </Text>
              }
            />
          )}
        </>
      ) : activeTab === 'attendance' ? (
        <ScrollView>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Attendance Distribution</Text>
            <PieChart
              data={attendanceChartData.datasets[0].data.map((value, index) => ({
                name: attendanceChartData.labels[index],
                population: value,
                color: attendanceChartData.datasets[0].colors[index](),
                legendFontColor: COLORS.textPrimary,
                legendFontSize: 14
              }))}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: COLORS.white,
                backgroundGradientFrom: COLORS.white,
                backgroundGradientTo: COLORS.white,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Attendance Breakdown</Text>
            <BarChart
              data={attendanceChartData}
              width={screenWidth - 40}
              height={250}
              yAxisLabel=""
              chartConfig={{
                backgroundColor: COLORS.white,
                backgroundGradientFrom: COLORS.white,
                backgroundGradientTo: COLORS.white,
                decimalPlaces: 0,
                color: (opacity = 1) => COLORS.primary,
                barPercentage: 0.5,
                propsForLabels: {
                  fontSize: 12
                }
              }}
              verticalLabelRotation={0}
              fromZero
            />
          </View>
        </ScrollView>
      ) : (
        <ScrollView>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Task Completion Distribution</Text>
            <BarChart
              data={taskChartData}
              width={screenWidth - 40}
              height={250}
              yAxisLabel=""
              chartConfig={{
                backgroundColor: COLORS.white,
                backgroundGradientFrom: COLORS.white,
                backgroundGradientTo: COLORS.white,
                decimalPlaces: 0,
                color: (opacity = 1) => COLORS.secondary,
                barPercentage: 0.5
              }}
              verticalLabelRotation={0}
              fromZero
            />
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Top Performers</Text>
            {topPerformers.length > 0 ? (
              topPerformers.map((performer, index) => (
                <View key={performer._id} style={styles.performerCard}>
                  <Text style={styles.rank}>#{index + 1}</Text>
                  <Text style={styles.performerName}>{performer.worker.name}</Text>
                  <Text style={styles.taskCount}>{performer.tasksCompleted} tasks</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyChartText}>No data available</Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 5,
  },
  tabButton: {
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  toggleButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: COLORS.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  phone: {
    color: COLORS.textSecondary,
  },
  area: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  tasks: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  loader: {
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: COLORS.textSecondary,
  },
  emptyChartText: {
    textAlign: 'center',
    marginVertical: 20,
    color: COLORS.textSecondary,
  },
  performerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: 15,
  },
  performerName: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  taskCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
});