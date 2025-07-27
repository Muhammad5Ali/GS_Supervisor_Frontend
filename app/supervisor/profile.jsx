import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  RefreshControl,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';
import { API_URL } from '../../constants/api';
import ReportCard from '../../components/ReportCard';
import COLORS from '../../constants/colors';
import { formatMemberSince, getImageUrl } from '../../lib/utils';
import LogoutButton from '../../components/LogoutButton';

export default function SupervisorProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('resolved');
  const { token, user } = useAuthStore();
  const router = useRouter();

  // const fetchProfile = async () => {
  //   try {
  //     setRefreshing(true);
  //     const response = await fetch(`${API_URL}/supervisor/profile`, {
  //       headers: { Authorization: `Bearer ${token}` }
  //     });
      
  //     const data = await response.json();
  //     if (!response.ok) throw new Error(data.message || 'Failed to fetch profile');
      
  //     setProfileData(data);
  //   } catch (error) {
  //     console.error('Profile fetch error:', error);
  //   } finally {
  //     setLoading(false);
  //     setRefreshing(false);
  //   }
  // };

  // In fetchProfile function:
const fetchProfile = async () => {
  try {
    setRefreshing(true);
    const response = await fetch(`${API_URL}/supervisor/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch profile');
    
    // Map to expected frontend structure
    setProfileData({
      supervisor: data.supervisor,
      resolvedReports: data.resolvedReports || [],
      rejectedReports: data.rejectedReports || [],
      stats: data.stats || {
        resolved: 0,
        rejected: 0,
        inProgress: 0,
        successRate: 0,
        workerCount: 0
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load profile data</Text>
      </View>
    );
  }

  const { supervisor, resolvedReports, rejectedReports, stats } = profileData;
  const activeReports = activeTab === 'resolved' ? resolvedReports : rejectedReports;
  const status = activeTab === 'resolved' ? 'resolved' : 'rejected';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={fetchProfile}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {supervisor.profileImage ? (
            <Image 
              source={{ uri: getImageUrl(supervisor.profileImage) }} 
              style={styles.avatar} 
            />
          ) : (
            <Ionicons name="person-circle" size={80} color={COLORS.primary} />
          )}
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={16} color="white" />
            <Text style={styles.badgeText}>Supervisor</Text>
          </View>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{supervisor.username}</Text>
          <Text style={styles.email}>{supervisor.email}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.resolved}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
              <View style={styles.statItem}>
      <Text style={styles.statValue}>{stats.rejected}</Text>
      <Text style={styles.statLabel}>Rejected</Text>
    </View>
           <View style={styles.statItem}>
      <Text style={styles.statValue}>{stats.permanentResolved}</Text>
      <Text style={styles.statLabel}>Per-Resolved</Text>
    </View>
    
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.inProgress}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.successRate}%</Text>
              <Text style={styles.statLabel}>Success</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.workerCount}</Text>
              <Text style={styles.statLabel}>Workers</Text>
            </View>
          </View>
          
          <View style={styles.joinDate}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.joinDateText}>
              Joined {formatMemberSince(supervisor.createdAt)}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push("/supervisor/tabs/workers")}
        >
          <Ionicons name="people-outline" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Manage Workers</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.lightGray} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push("/supervisor/analytics")}
        >
          <Ionicons name="analytics-outline" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Performance Analytics</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.lightGray} />
        </TouchableOpacity>
        
        {/* New Out of Scope Reports Button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push("/supervisor/out-of-scope-reports")}
        >
          <Ionicons name="earth-outline" size={20} color={COLORS.warning} />
          <Text style={styles.actionButtonText}>Out of Scope Reports</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.lightGray} />
        </TouchableOpacity>
        
        <TouchableOpacity 
  style={styles.actionButton}
  onPress={() => router.push("/supervisor/permanent-resolved-reports")}
>
  <Ionicons name="checkmark-done-circle-outline" size={20} color={COLORS.info} />
  <Text style={styles.actionButtonText}>Permanent Resolved Reports</Text>
  <Ionicons name="chevron-forward" size={20} color={COLORS.lightGray} />
</TouchableOpacity>
      </View>
      
      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <LogoutButton />
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'resolved' && styles.activeTab
          ]}
          onPress={() => setActiveTab('resolved')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'resolved' && styles.activeTabText
          ]}>
            Resolved Reports
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'rejected' && styles.activeTab
          ]}
          onPress={() => setActiveTab('rejected')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'rejected' && styles.activeTabText
          ]}>
            Rejected Reports
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Reports Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {activeTab === 'resolved' ? 'Resolved Reports' : 'Rejected Reports'}
        </Text>
        <TouchableOpacity onPress={() => 
          router.push({
            pathname: "/supervisor/dashboard",
            params: { tab: activeTab }
          })
        }>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      
      {activeReports.length > 0 ? (
        <FlatList
          scrollEnabled={false}
          data={activeReports}
          renderItem={({ item }) => (
            <ReportCard 
              report={item} 
              onPress={() => router.push(
                activeTab === 'resolved' 
                  ? `/supervisor/resolved-report-details/${item._id}`
                  : `/supervisor/rejected-report-details/${item._id}`
              )}
              showStatus={true}
              status={status}
            />
          )}
          keyExtractor={item => item._id}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name={activeTab === 'resolved' ? "checkmark-done-outline" : "close-circle-outline"} 
            size={60} 
            color={COLORS.lightGray} 
          />
          <Text style={styles.emptyText}>
            {activeTab === 'resolved' 
              ? 'No resolved reports yet' 
              : 'No rejected reports'}
          </Text>
          <Text style={styles.emptySubtext}>
            {activeTab === 'resolved' 
              ? 'Reports you resolve will appear here' 
              : 'Reports you reject will appear here'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: COLORS.lightBackground,
    borderRadius: 10,
    padding: 8,
    width: '48%',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  joinDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  joinDateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  actionButtonsContainer: {
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  logoutContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  seeAll: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: COLORS.white,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.lightGray,
    marginTop: 4,
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});