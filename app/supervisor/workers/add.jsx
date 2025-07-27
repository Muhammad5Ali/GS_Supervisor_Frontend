import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useAuthStore from '../../../store/authStore';
import { API_URL } from '../../../constants/api';
import COLORS from '../../../constants/colors';

export default function AddWorkerScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();

  const handleSubmit = async () => {
    if (!name || !phone || !area) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    
    // Frontend validation
    if (name.length > 15) {
      Alert.alert('Error', 'Name must be 15 characters or less');
      return;
    }
    
    if (phone.length !== 11 || !/^\d+$/.test(phone)) {
      Alert.alert('Error', 'Phone must be exactly 11 digits');
      return;
    }
    
    if (area.length > 20) {
      Alert.alert('Error', 'Area must be 20 characters or less');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Authentication token missing');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/workers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone, area })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to add worker');
      }
      
      Alert.alert('Success', 'Worker added successfully');
      setName('');
      setPhone('');
      setArea('');
    } catch (error) {
      console.error('Add worker error:', error);
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
        <Text style={styles.title}>Add Worker</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Full Name (max 15 chars)"
        value={name}
        onChangeText={setName}
        maxLength={15}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone (11 digits)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={11}
      />
      <TextInput
        style={styles.input}
        placeholder="Work Area (max 20 chars)"
        value={area}
        onChangeText={setArea}
        maxLength={20}
      />
      
      {/* Custom Button with Primary Color */}
      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Add Worker</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 16,
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  // Custom button styles
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.primaryLight, // Lighter version when disabled
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});