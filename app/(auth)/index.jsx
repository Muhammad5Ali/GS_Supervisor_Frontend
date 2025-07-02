import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import styles from "../../assets/styles/login.styles";
import { Image } from 'react-native';
import COLORS from '../../constants/colors';
import { Ionicons } from "@expo/vector-icons"
import { Link, useRouter, useLocalSearchParams } from "expo-router"; // Added useLocalSearchParams
import { KeyboardAvoidingView } from 'react-native';
import useAuthStore from '../../store/authStore';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, login, isCheckingAuth, user } = useAuthStore();
  const router = useRouter();
  const params = useLocalSearchParams(); // Get route parameters

  // Show logout confirmation message
  useEffect(() => {
    if (params.logout) {
      Alert.alert("Logged Out", "You've been successfully logged out");
    }
  }, [params.logout]);

  // Handle navigation for already verified/logged in users
  useEffect(() => {
    // Check verification status from multiple possible properties
    const isVerified = user?.verified || user?.accountVerified;
    
    if (user && isVerified) {
      // Clear navigation history and refresh the tabs screen
      router.replace({
        pathname: "/(tabs)",
        params: { refresh: Date.now() }
      });
    }
  }, [user]);

  const handleLogin = async () => {
    const result = await login(email, password);
    
    if (result.success) {
      // Explicit navigation to home screen after successful login
      // This will be handled by the useEffect above
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
              <Link href="/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}> Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}