import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import styles from "../../assets/styles/login.styles";
import { Image } from 'react-native';
import COLORS from '../../constants/colors';
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router";
import { KeyboardAvoidingView } from 'react-native';
import useAuthStore from '../../store/authStore';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { 
    isLoading, 
    login, 
    isCheckingAuth, 
    user, 
    sessionExpired, 
    clearSessionExpired
  } = useAuthStore();
  
  const router = useRouter();
  const initialMount = useRef(true);
  
  // Show messages based on session status
  useEffect(() => {
    if (sessionExpired) {
      Alert.alert("Session Expired", "Your session has expired. Please login again.");
      clearSessionExpired(); // Use the new clear method
    }
  }, [sessionExpired]);

  // Handle initial navigation for already verified/logged in users
  useEffect(() => {
    const isVerified = user?.verified || user?.accountVerified;
    
    if (initialMount.current && user && isVerified) {
      if (user.role === 'supervisor') {
        router.replace('/supervisor-dashboard');
      } else {
        router.replace('/(tabs)');
      }
    }
    initialMount.current = false;
  }, [user]);

  const handleLogin = async () => {
    const result = await login(email, password);
    
    if (result.success) {
      if (result.user.role === 'supervisor') {
        router.replace('/supervisor');
      } else {
        router.replace('/(tabs)');
      }
    } else if (result.requiresVerification) {
      router.push({
        pathname: "/otp-verification",
        params: { email }
      });
    } else {
      Alert.alert("Error", result.error || "Invalid credentials");
    }
  };

  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        {/* ILLUSTRATION */}
        <View style={styles.topIllustration}>
          <Image
            source={require("../../assets/images/i.png")}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        {/* Session expired message */}
        {sessionExpired && (
          <View style={styles.expiredSessionMessage}>
            <Text style={styles.expiredSessionText}>
              Your session has expired. Please login again.
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.formContainer}>
            {/* EMAIL */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.placeholderText}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* PASSWORD */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.placeholderText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.inputIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* FORGOT PASSWORD LINK */}
            <TouchableOpacity 
              style={styles.forgotPassword} 
              onPress={() => router.push("/forgot-password")}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* LOGIN BUTTON */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* SIGN UP LINK */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text style={styles.link}> Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}