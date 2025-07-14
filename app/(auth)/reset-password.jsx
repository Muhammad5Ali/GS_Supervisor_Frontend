import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useAuthStore from '../../store/authStore';
import styles from '../../assets/styles/reset-password.styles';
import COLORS from '../../constants/colors';
import { Ionicons } from "@expo/vector-icons";

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { email } = useLocalSearchParams();
  const { isLoading, resetPassword } = useAuthStore();
  const router = useRouter();

  const handleReset = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    const result = await resetPassword(email, password);
    
    if (result.success) {
      // Updated navigation to success screen
      router.replace({
        pathname: "/reset-password-success"
      });
    } else {
      Alert.alert('Error', result.error || 'Failed to reset password');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your new password</Text>

      {/* New Password Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleReset}
        disabled={isLoading}
      >
        {isLoading 
          ? <ActivityIndicator color="white" /> 
          : <Text style={styles.buttonText}>Reset Password</Text>
        }
      </TouchableOpacity>
    </View>
  );
}