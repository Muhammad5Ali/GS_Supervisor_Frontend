import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../../../store/authStore';
import { API_URL } from '../../../../constants/api';
import COLORS from '../../../../constants/colors';

const statusOptions = [
  { id: 'present', label: 'Present', icon: 'checkmark-circle', color: COLORS.success },
  { id: 'absent', label: 'Absent', icon: 'close-circle', color: COLORS.error },
  { id: 'on-leave', label: 'On Leave', icon: 'airplane', color: COLORS.warning }
];

export default function MarkAttendanceScreen() {
  const { id } = useLocalSearchParams();
  const [status, setStatus] = useState('present');
  const [tasksCompleted, setTasksCompleted] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!tasksCompleted || isNaN(tasksCompleted)) {
      Alert.alert('Error', 'Please enter a valid number of tasks');
      return;
    }
    
    if (!token) {
      Alert.alert('Error', 'Authentication token missing');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          workerId: id,
          status,
          tasksCompleted: parseInt(tasksCompleted)
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to mark attendance');
      }
      
      Alert.alert('Success', 'Attendance marked successfully');
      router.back();
    } catch (error) {
      console.error('Mark attendance error:', error);
      Alert.alert('Error', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Mark Attendance</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.statusContainer}>
          {statusOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.statusOption,
                status === option.id && { borderColor: option.color }
              ]}
              onPress={() => setStatus(option.id)}
            >
              <Ionicons 
                name={option.icon} 
                size={32} 
                color={status === option.id ? option.color : COLORS.textSecondary} 
              />
              <Text style={[
                styles.statusLabel,
                status === option.id && { color: option.color }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.taskContainer}>
          <Text style={styles.label}>Tasks Completed:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={tasksCompleted}
            onChangeText={setTasksCompleted}
            placeholder="Enter number"
            placeholderTextColor={COLORS.placeholderText}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.submitText}>Processing...</Text>
          ) : (
            <Text style={styles.submitText}>Submit Attendance</Text>
          )}
        </TouchableOpacity>
      </View>
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
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  content: {
    padding: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  statusOption: {
    alignItems: 'center',
    padding: 15,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderRadius: 10,
    width: '30%',
    backgroundColor: COLORS.white,
  },
  statusLabel: {
    marginTop: 10,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  taskContainer: {
    marginBottom: 30
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: COLORS.white,
    color: COLORS.textPrimary,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
  },
  submitText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16
  }
});