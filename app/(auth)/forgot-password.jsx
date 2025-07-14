import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import useAuthStore from '../../store/authStore';
import styles from '../../assets/styles/forgot-password.styles';
import COLORS from '../../constants/colors';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const { isLoading, forgotPassword } = useAuthStore();
  const router = useRouter();

  const Logo = () => (
    <View style={styles.logoContainer}>
      <View style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15
      }}>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 30 }}>GS</Text>
      </View>
    </View>
  );

  const handleSubmit = async () => {
    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }
    
    const result = await forgotPassword(email);
    
    if (result.success) {
      // Navigate to OTP verification for password reset
      router.push({
        pathname: "/reset-otp-verification",
        params: { 
          email,
          isReset: true  // Add flag to indicate password reset flow
        }
      });
    } else {
      Alert.alert("Error", result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Logo />
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Enter your email to receive password reset instructions
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Your email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading 
          ? <ActivityIndicator color="white" /> 
          : <Text style={styles.buttonText}>Send Reset Email</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}