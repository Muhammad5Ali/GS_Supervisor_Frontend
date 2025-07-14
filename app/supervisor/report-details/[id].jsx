import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styles from '../../../assets/styles/reportDetail.styles';
import useAuthStore from '../../../store/authStore';
import { API_URL } from '../../../constants/api';

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      const response = await fetch(`${API_URL}/supervisor/reports/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      Alert.alert('Success', `Report status has been set to ${status}`);
      router.back();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Report Status</Text>
      
      <TouchableOpacity 
        style={[styles.button, styles.inProgressButton]}
        onPress={() => updateStatus('in-progress')}
        disabled={updating}
      >
        {updating ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Mark as In Progress</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.resolvedButton]}
        onPress={() => router.push(`/supervisor/resolve-report/${id}`)}
        disabled={updating}
      >
        <Text style={styles.buttonText}>Mark as Resolved</Text>
      </TouchableOpacity>
    </View>
  );
}