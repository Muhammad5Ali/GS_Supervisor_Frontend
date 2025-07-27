import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import PendingReports from './tabs/pending';
import ResolvedReports from './tabs/resolved';
import InProgressReports from './tabs/in-progress';
import SupervisorProfile from './profile';
import WorkerList from './tabs/workers';
import RejectedReports from './tabs/rejected'; 
import COLORS from '../../constants/colors';

export default function SupervisorDashboard() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState(params.tab || 'pending');

  useEffect(() => {
    if (params.tab) {
      setActiveTab(params.tab);
    }
  }, [params.tab]);

  const handleTabPress = (tabId) => {
    router.setParams({ tab: tabId });
  };

  // Updated tabs array with new "Rejected" tab
  const tabs = [
    { id: 'pending', label: 'Pending' },
    { id: 'in-progress', label: 'In-Prog' },
    { id: 'resolved', label: 'Resolved' },
    { id: 'rejected', label: 'Rejected' }, // New tab
    { id: 'workers', label: 'Workers' },
    { id: 'profile', label: 'Profile' },
  ];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'pending': return <PendingReports />;
      case 'in-progress': return <InProgressReports />;
      case 'resolved': return <ResolvedReports />;
      case 'rejected': return <RejectedReports />; // New tab content
      case 'workers': return <WorkerList />;
      case 'profile': return <SupervisorProfile />;
      default: return <PendingReports />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton, 
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => handleTabPress(tab.id)}
          >
            <Text style={[
              styles.tabText, 
              activeTab === tab.id && styles.activeText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tabContent}>
        {renderTabContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  activeText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
  },
});