import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useAuthStore from '../../store/authStore';
import styles from '../../assets/styles/otp.styles';
import COLORS from '../../constants/colors';

export default function ResetOtpVerification() {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes (matches backend expiration)
  const [isResending, setIsResending] = useState(false);
  const [cooldownError, setCooldownError] = useState('');
  const { email, isReset } = useLocalSearchParams();
  const { isLoading, verifyResetOTP, resendResetPasswordOTP } = useAuthStore();
  const router = useRouter();

  // Validate access to this screen
  useEffect(() => {
    console.log("Reset OTP Verification Params:", { email, isReset });
    
    if (!isReset) {
      Alert.alert(
        "Invalid Access",
        "Please start the password reset process from the beginning",
        [{ text: "OK", onPress: () => router.replace("/forgot-password") }]
      );
    }
  }, [isReset]);

  // Check for valid email
  useEffect(() => {
    if (!email) {
      Alert.alert(
        "Email Required", 
        "Email address not found. Please start the password reset process again.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    }
  }, [email]);

  // Format time to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer countdown
  useEffect(() => {
    let interval;
    
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [timer]);

  // Enhanced verification with clean error messages
  const handleVerify = async () => {
    if (otp.length !== 5) {
      Alert.alert('Error', 'OTP must be 5 digits');
      return;
    }

    try {
      const result = await verifyResetOTP(email, otp);
      
      if (result.success) {
        router.push({ pathname: "/reset-password", params: { email } });
      } else {
        // Clean up error message
        let message = result.error || 'Verification failed';
        message = message.replace(/\n/g, ''); // Remove newline characters
        
        // Handle specific cases
        if (message.includes('expired')) {
          Alert.alert(
            'OTP Expired',
            'This code has expired. Would you like a new one?',
            [
              { 
                text: "Get New Code", 
                onPress: handleResendOTP 
              },
              { 
                text: "Cancel", 
                style: "cancel" 
              }
            ]
          );
        } else if (message.includes('Invalid') || message.includes('invalid')) {
          Alert.alert('Invalid Code', 'Please check the OTP and try again');
        } else {
          Alert.alert('Error', message);
        }
      }
    } catch (error) {
      // Clean up error message
      let message = error.message || 'An unexpected error occurred';
      message = message.replace(/\n/g, '');
      Alert.alert('Error', message);
    }
  };

  // Dedicated function for resending OTP
  const handleResendOTP = async () => {
    setIsResending(true);
    setCooldownError(''); // Clear previous errors
    
    try {
      const result = await resendResetPasswordOTP(email);
      
      if (result.success) {
        Alert.alert('New Code Sent', 'A new verification code has been sent to your email');
        setTimer(300); // Reset to 5 minutes
        setOtp(''); // Clear the input field
      } else {
        // Handle cooldown errors
        if (result.error && result.error.includes("maximum")) {
          setCooldownError(result.error);
        } else {
          Alert.alert('Error', result.error || 'Failed to send new code');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Password Reset Verification</Text>
      <Text style={styles.subtitle}>
        Enter the 5-digit OTP sent to {email}
      </Text>

      <Text style={[
        styles.timerText,
        timer > 0 && timer < 60 && { 
          color: COLORS.error, // Use error color from COLORS
          fontWeight: 'bold',
          fontSize: 16
        }
      ]}>
        {timer > 0 
          ? `OTP Expires in ${formatTime(timer)}` 
          : "OTP expired. Tap 'Resend' to get a new code"}
      </Text>

      {/* Cooldown error message */}
      {cooldownError && (
        <Text style={[styles.cooldownText, { color: COLORS.error }]}>
          {cooldownError}
        </Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={5}
        autoFocus
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: COLORS.primary }]}
        onPress={handleVerify}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Verify OTP</Text>
        )}
      </TouchableOpacity>

      {/* Resend button */}
      {timer <= 0 && (
        <TouchableOpacity 
          style={[styles.resendButton, { 
            backgroundColor: COLORS.lightBackground,
            borderColor: COLORS.primary 
          }]}
          onPress={handleResendOTP}
          disabled={isResending}
        >
          {isResending ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Text style={[styles.resendText, { color: COLORS.primary }]}>
              Resend OTP
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}