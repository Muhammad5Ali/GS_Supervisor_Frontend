import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useAuthStore from '../../store/authStore';
import styles from '../../assets/styles/otp.styles';
import SuccessModal from '../../components/SuccessModal';

// Timer duration (10 minutes)
const OTP_TIMEOUT = 5 * 60; // 5 minutes in seconds

export default function OTPVerification() {
  const [otp, setOtp] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [timer, setTimer] = useState(OTP_TIMEOUT);
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const { email } = useLocalSearchParams();
  const { isLoading, verifyOTP, resendOTP, logout } = useAuthStore();
  const router = useRouter();

  // Validate email format on mount
  useEffect(() => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('Error', 'Invalid email address');
      router.replace('/login');
    } else {
      setIsEmailValid(true);
    }
  }, [email]);

  // Reset timer when email changes
  useEffect(() => {
    setTimer(OTP_TIMEOUT);
    setCanResend(false);
  }, [email]);

  // Format time to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (otp.length !== 5) {
      Alert.alert('Error', 'OTP must be 5 digits');
      return;
    }

    try {
      const result = await verifyOTP(email, otp);
      if (result.success) {
        setShowSuccess(true);
      } else {
        Alert.alert('Error', result.error || 'Verification failed');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to verify OTP');
    }
  };

  // Handle OTP resend
  const handleResend = async () => {
    if (!canResend) return;
    
    setIsResending(true);
    try {
      const result = await resendOTP(email);
      if (result.success) {
        Alert.alert("Success", "New OTP sent to your email");
        setTimer(OTP_TIMEOUT);
        setCanResend(false);
      } else {
        Alert.alert("Error", result.error || "Failed to resend OTP");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval;
    
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    
    return () => clearInterval(interval);
  }, [timer]);

  const handleModalClose = () => {
    setShowSuccess(false);
    logout();
    router.replace("/(auth)/");
  };

  // While validating email, show loader
  if (!isEmailValid) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        Enter the 5‑digit code sent to {email}
      </Text>

    {/* Timer display */}
<Text style={[
  styles.timerText,
  timer > 0 && timer < 60 && { 
    color: 'red', 
    fontWeight: 'bold' 
  }
]}>
  {timer > 0 
    ? `OTP Expires in ${formatTime(timer)}` 
    : "OTP expired"}
</Text>

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
        style={styles.button}
        onPress={handleVerify}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Verify Account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[
          styles.resendButton, 
          (!canResend || isResending) && styles.disabledButton
        ]} 
        onPress={handleResend}
        disabled={!canResend || isResending}
      >
        {isResending ? (
          <ActivityIndicator color="#007AFF" />
        ) : (
          <Text style={styles.resendText}>
            {canResend 
              ? "Resend Code" 
              : `Resend available in ${formatTime(timer)}`
            }
          </Text>
        )}
      </TouchableOpacity>
      
      {/* Success Modal */}
      <SuccessModal 
        visible={showSuccess}
        title="OTP Verified!"
        message="Your account has been successfully verified. Please login to continue."
        onClose={handleModalClose}
      />
    </View>
  );
}