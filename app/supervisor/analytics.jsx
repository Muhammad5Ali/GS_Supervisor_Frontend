import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  Dimensions,
  ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-chart-kit';
import useAuthStore from '../../store/authStore';
import { API_URL } from '../../constants/api';
import COLORS from '../../constants/colors';
import { TouchableOpacity } from 'react-native';

export default function SupervisorAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/supervisor/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch analytics');
      setStats(data.stats);
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Pie chart includes Permanent Resolved
  const pieChartData = [
    { name: 'Resolved',         count: stats.resolved,          color: COLORS.success,     legendFontColor: COLORS.textPrimary, legendFontSize: 14 },
    { name: 'Per-Resolved', count: stats.permanentResolved, color: COLORS.persuccess,        legendFontColor: COLORS.textPrimary, legendFontSize: 14 },
    { name: 'Rejected',         count: stats.rejected,          color: COLORS.error,       legendFontColor: COLORS.textPrimary, legendFontSize: 14 },
    { name: 'In Progress',      count: stats.inProgress,       color: COLORS.warning,     legendFontColor: COLORS.textPrimary, legendFontSize: 14 },
  ];

  // Bar chart for Success Rate (single bar)
  const successBarData = {
    labels: ['Success Rate'],
    datasets: [{ data: [stats.successRate] }]
  };

  // Bar chart for Permanent Resolved count
  const permanentBarData = {
    labels: ['Permanent Resolved'],
    datasets: [{ data: [stats.permanentResolved] }]
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Performance Analytics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Pie Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Report Status Distribution</Text>
          <PieChart
            data={pieChartData}
            width={screenWidth - 32}
            height={220}
            chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            hasLegend
          />
        </View>

        {/* Success Rate Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Success Rate</Text>
          <BarChart
            data={successBarData}
            width={screenWidth - 32}
            height={200}
            yAxisSuffix="%"
            fromZero
            showValuesOnTopOfBars
            chartConfig={{
              backgroundColor: COLORS.white,
              backgroundGradientFrom: COLORS.white,
              backgroundGradientTo: COLORS.white,
              decimalPlaces: 0,
              color: (opacity = 1) => COLORS.primary,
              barPercentage: 0.5,
              propsForLabels: { fontSize: 12 }
            }}
            style={styles.barChart}
          />
        </View>

        {/* Permanent Resolved Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Permanent Resolved Count</Text>
          <BarChart
            data={permanentBarData}
            width={screenWidth - 32}
            height={200}
            fromZero
            showValuesOnTopOfBars
            chartConfig={{
              backgroundColor: COLORS.white,
              backgroundGradientFrom: COLORS.white,
              backgroundGradientTo: COLORS.white,
              decimalPlaces: 0,
              color: (opacity = 1) => COLORS.info,
              barPercentage: 0.5,
              propsForLabels: { fontSize: 12 }
            }}
            style={styles.barChart}
          />
        </View>

        {/* Workforce & Summary */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Workforce & Summary</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.workerCount}</Text>
              <Text style={styles.statLabel}>Total Workers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.resolved}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.permanentResolved}</Text>
              <Text style={styles.statLabel}>Permanent Resolved</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.inProgress}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.rejected}</Text>
              <Text style={styles.statLabel}>Rejected</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.successRate}%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray
  },
  backButton: { marginRight: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
  scrollContainer: { padding: 16 },
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center'
  },
  barChart: { marginVertical: 8, borderRadius: 16 },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: 'center'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: COLORS.lightBackground,
    borderRadius: 10,
    padding: 12,
    width: '48%'
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center'
  }
});
