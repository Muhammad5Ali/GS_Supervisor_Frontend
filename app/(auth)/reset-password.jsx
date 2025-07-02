import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useAuthStore from '../../store/authStore';
import styles from '../../assets/styles/reset-password.styles';

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const { token: urlToken } = useLocalSearchParams();
  const { isLoading, resetPassword } = useAuthStore();
  const router = useRouter();

  // Use token from URL or manual input
  const activeToken = urlToken || manualToken;

  const handleSubmit = async () => {
    if (!activeToken) {
      Alert.alert("Error", "Please enter a reset token");
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }
    
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }
    
    try {
      const result = await resetPassword(activeToken, password, confirmPassword);
      
      if (result.success) {
        Alert.alert(
          "Success", 
          "Password reset successfully",
          [{ text: "OK", onPress: () => router.replace("/login") }]
        );
      } else {
        Alert.alert("Error", result.error || "Password reset failed");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      
      {/* Manual token input for fallback */}
      {!urlToken && (
        <>
          <Text style={styles.subtitle}>Enter your reset token:</Text>
          <TextInput
            style={styles.input}
            placeholder="Paste reset token here"
            value={manualToken}
            onChangeText={setManualToken}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#999"
          />
        </>
      )}

      <Text style={styles.subtitle}>Enter your new password:</Text>

      <TextInput
        style={styles.input}
        placeholder="New Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor="#999"
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor="#999"
      />

      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={() => setShowPassword(!showPassword)}
      >
        <Text style={styles.toggleText}>
          {showPassword ? "Hide" : "Show"} Password
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmit}
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