import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../assets/styles/dashboard.styles';
import COLORS from '../constants/colors';

export default function ReportCard({ report, onPress, showStatus = false, status }) {
  const getStatusStyles = () => {
    switch(status) {
      case 'pending': 
        return [styles.badge, styles.badgePending];
      case 'in-progress':
        return [styles.badge, styles.badgeInProgress];
      case 'resolved':
        return [styles.badge, styles.badgeResolved];
      default:
        return styles.badge;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {showStatus && (
        <View style={getStatusStyles()}>
          <Text style={styles.badgeText}>
            {status === 'in-progress' ? 'In Progress' : status}
          </Text>
        </View>
      )}
      
      {/* Reporter Info Section */}
      <View style={styles.reporterContainer}>
        <Image 
          source={{ uri: report.user.profileImage }} 
          style={styles.profileImage}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>{report.user.username}</Text>
          {report.resolvedBy && (
            <Text style={styles.resolvedBy}>
              Resolved by: {report.resolvedBy.username}
            </Text>
          )}
        </View>
      </View>

      {/* Report Image */}
      <Image 
        source={{ uri: report.image }} 
        style={styles.image}
      />
      
      {/* Report Details */}
      <View style={styles.content}>
        <Text style={styles.title}>{report.title}</Text>
        <Text style={styles.details} numberOfLines={2}>
          {report.details}
        </Text>
        <Text style={styles.location}>{report.address}</Text>
        
        {report.status === 'resolved' ? (
          <Text style={styles.date}>
            Resolved on: {new Date(report.resolvedAt).toLocaleDateString()}
          </Text>
        ) : (
          <Text style={styles.date}>
            Reported on: {new Date(report.createdAt).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}