import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PendingReports from './tabs/pending';
import ResolvedReports from './tabs/resolved';
import InProgressReports from './tabs/in-progress'; // NEW IMPORT
import COLORS from '../../constants/colors';

export default function SupervisorDashboard() {
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <View style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeText]}>
            Pending
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'in-progress' && styles.activeTab]}
          onPress={() => setActiveTab('in-progress')}
        >
          <Text style={[styles.tabText, activeTab === 'in-progress' && styles.activeText]}>
            In Progress
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'resolved' && styles.activeTab]}
          onPress={() => setActiveTab('resolved')}
        >
          <Text style={[styles.tabText, activeTab === 'resolved' && styles.activeText]}>
            Resolved
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'pending' && <PendingReports />}
        {activeTab === 'in-progress' && <InProgressReports />}
        {activeTab === 'resolved' && <ResolvedReports />}
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
    justifyContent: 'space-between', // Ensures tabs are equally spaced
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
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