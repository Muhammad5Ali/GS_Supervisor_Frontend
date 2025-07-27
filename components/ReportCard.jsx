import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../assets/styles/dashboard.styles';
import COLORS from '../constants/colors';

export default function ReportCard({ report, onPress, showStatus = false, status }) {
  // Status color mapping
  const statusColors = {
    pending: '#FFC107',     // Amber
    'in-progress': '#2196F3', // Blue
    resolved: '#4CAF50',     // Green
    'out-of-scope': '#FF9800', // Orange
    rejected: '#F44336',      // Red
    'permanent-resolved': '#2E7D32', // Dark green
  };

  // Get formatted status text
  const getStatusText = (statusValue) => {
    switch(statusValue) {
      case 'in-progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Pending';
      case 'out-of-scope': return 'Out of Scope';
      case 'permanent-resolved': return 'Permanently Resolved';
      default: return statusValue;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Status badge positioned at the top */}
      {showStatus && status && (
        <View style={[styles.statusBadge, { backgroundColor: statusColors[status] }]}>
          <Text style={styles.statusText}>
            {getStatusText(status)}
          </Text>
        </View>
      )}
      
      {/* Reporter Info Section */}
      <View style={styles.reporterContainer}>
        <Image 
          source={{ uri: report.user?.profileImage || 'https://via.placeholder.com/150' }} 
          style={styles.profileImage}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>{report.user?.username || 'Unknown'}</Text>
          
          {/* Show rejected by info for rejected reports */}
          {status === 'rejected' && report.rejectedBy && (
            <View style={styles.actionInfo}>
              <Ionicons name="close-circle" size={14} color={COLORS.error} />
              <Text style={styles.actionText}>
                Rejected by: {report.rejectedBy.username}
              </Text>
            </View>
          )}
          
          {/* Show resolved by info for resolved reports */}
          {status === 'resolved' && report.resolvedBy && (
            <View style={styles.actionInfo}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
              <Text style={styles.actionText}>
                Resolved by: {report.resolvedBy.username}
              </Text>
            </View>
          )}
          
          {/* Show marked by info for out-of-scope reports */}
          {status === 'out-of-scope' && report.outOfScopeBy && (
            <View style={styles.actionInfo}>
              <Ionicons name="earth" size={14} color={COLORS.warning} />
              <Text style={styles.actionText}>
                Marked by: {report.outOfScopeBy.username}
              </Text>
            </View>
          )}
          
          {/* Show permanent resolved by info */}
          {status === 'permanent-resolved' && report.permanentlyResolvedBy && (
            <View style={styles.actionInfo}>
              <Ionicons name="shield-checkmark" size={14} color={COLORS.persuccess} />
              <Text style={styles.actionText}>
                Permanently resolved by: {report.permanentlyResolvedBy.username}
              </Text>
            </View>
          )}
          
          {/* NEW: Show in progress by info for in-progress reports */}
          {status === 'in-progress' && report.assignedTo && (
            <View style={styles.actionInfo}>
              <Ionicons name="hourglass" size={14} color={COLORS.inprogress} />
              <Text style={styles.actionText}>
                Assigned Supervisor: {report.assignedTo.username}
              </Text>
            </View>
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
        
        {/* Location with icon */}
        <View style={styles.locationContainer}>
          <Ionicons 
            name="location-outline" 
            size={16} 
            color={COLORS.darkGray} 
            style={styles.iconSpacing}
          />
          <Text style={styles.location} numberOfLines={null}>
            {report.address}
          </Text>
        </View>
        
        {/* Show rejected date for rejected reports */}
        {status === 'rejected' && report.rejectedAt ? (
          <View style={styles.dateContainer}>
            <Ionicons 
              name="calendar-outline" 
              size={16} 
              color={COLORS.error} 
              style={styles.iconSpacing}
            />
            <Text style={[styles.date, { color: COLORS.error }]}>
              Rejected on: {new Date(report.rejectedAt).toLocaleDateString()}
            </Text>
          </View>
        ) : null}
        
        {/* Show resolved date for resolved reports */}
        {status === 'resolved' && report.resolvedAt ? (
          <View style={styles.dateContainer}>
            <Ionicons 
              name="calendar-outline" 
              size={16} 
              color={COLORS.primary} 
              style={styles.iconSpacing}
            />
            <Text style={[styles.date, { color: COLORS.primary }]}>
              Resolved on: {new Date(report.resolvedAt).toLocaleDateString()}
            </Text>
          </View>
        ) : null}
        
        {/* Show out-of-scope date */}
        {status === 'out-of-scope' && report.outOfScopeAt ? (
          <View style={styles.dateContainer}>
            <Ionicons 
              name="calendar-outline" 
              size={16} 
              color={COLORS.warning} 
              style={styles.iconSpacing}
            />
            <Text style={[styles.date, { color: COLORS.warning }]}>
              Marked on: {new Date(report.outOfScopeAt).toLocaleDateString()}
            </Text>
          </View>
        ) : null}
        
        {/* Show permanent resolved date */}
        {status === 'permanent-resolved' && report.permanentlyResolvedAt ? (
          <View style={styles.dateContainer}>
            <Ionicons 
              name="calendar-outline" 
              size={16} 
              color={COLORS.persuccess} 
              style={styles.iconSpacing}
            />
            <Text style={[styles.date, { color: COLORS.persuccess }]}>
              Permanently resolved on: {new Date(report.permanentlyResolvedAt).toLocaleDateString()}
            </Text>
          </View>
        ) : null}
        
        {/* NEW: Show in progress date */}
        {status === 'in-progress' && report.assignedAt ? (
          <View style={styles.dateContainer}>
            <Ionicons 
              name="calendar-outline" 
              size={16} 
              color={COLORS.inprogress} 
              style={styles.iconSpacing}
            />
            <Text style={[styles.date, { color: COLORS.inprogress }]}>
              In Progress on: {new Date(report.assignedAt).toLocaleDateString()}
            </Text>
          </View>
        ) : null}
        
        {/* Show creation date for other reports */}
        {!['rejected', 'resolved', 'out-of-scope', 'permanent-resolved', 'in-progress'].includes(status) && report.createdAt && (
          <View style={styles.dateContainer}>
            <Ionicons 
              name="calendar-outline" 
              size={16} 
              color={COLORS.darkGray} 
              style={styles.iconSpacing}
            />
            <Text style={styles.date}>
              Reported on: {new Date(report.createdAt).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
