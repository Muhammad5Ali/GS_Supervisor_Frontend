import { View, Text, Platform, KeyboardAvoidingView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import styles from "../../assets/styles/signup.styles"
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import { useRouter } from 'expo-router';
import useAuthStore from '../../store/authStore';

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const { isLoading, isCheckingAuth, register } = useAuthStore();
  const router = useRouter();

  // Function to validate username
  const validateUsername = (username) => {
    if (!username) {
      return { isValid: false, message: "Username is required" };
    } else if (username.length < 3) {
      return { isValid: false, message: "Username must be at least 3 characters" };
    } else if (username.length > 32) {
      return { isValid: false, message: "Username cannot exceed 32 characters" };
    }
    return { isValid: true, message: "" };
  };

  // Function to validate email format with specific rules
  const validateEmail = (email) => {
    if (!email) {
      return { isValid: false, message: "Email is required" };
    }
    
    // Check for exactly one @ symbol
    const atSymbolCount = (email.match(/@/g) || []).length;
    if (atSymbolCount > 1) {
      return { isValid: false, message: "Email can only contain one @ symbol" };
    }
    
    // If no @ symbol yet, don't show error about other validations
    if (atSymbolCount === 0) {
      return { isValid: false, message: "Email must contain an @ symbol" };
    }
    
    // Split email into local part and domain
    const [localPart, domain] = email.split('@');
    
    // Check local part is not empty
    if (!localPart) {
      return { isValid: false, message: "Email must contain text before the @ symbol" };
    }
    
    // Check local part contains at least one alphabet character
    const hasAlphabet = /[A-Za-z]/.test(localPart);
    if (!hasAlphabet) {
      return { isValid: false, message: "Email must contain at least one letter before the @ symbol" };
    }
    
    // Check local part contains only alphanumeric characters
    const isLocalPartValid = /^[A-Za-z0-9]+$/.test(localPart);
    if (!isLocalPartValid) {
      return { isValid: false, message: "Email can only contain letters and numbers before the @ symbol" };
    }
    
    // Check domain is not empty
    if (!domain) {
      return { isValid: false, message: "Email must contain a domain after the @ symbol" };
    }
    
    // Check domain is allowed
    const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'iiu.edu.pk'];
    if (!allowedDomains.includes(domain)) {
      return { isValid: false, message: "We only accept Gmail, Yahoo, Outlook, Hotmail, and IIU addresses" };
    }
    
    return { isValid: true, message: "" };
  };

  // Function to validate password
  const validatePassword = (password) => {
    if (!password) {
      return { isValid: false, message: "Password is required" };
    } else if (password.length < 8) {
      return { isValid: false, message: "Password must be at least 8 characters" };
    } else if (password.length > 32) {
      return { isValid: false, message: "Password cannot exceed 32 characters" };
    }
    return { isValid: true, message: "" };
  };

  // Handle email input changes with validation
  const handleEmailChange = (text) => {
    setEmail(text);
    
    // Only validate if the field has been touched (user has focused then unfocused)
    if (emailTouched) {
      const validation = validateEmail(text);
      setEmailError(validation.message);
    }
  };

  // Handle email blur (when user leaves the field)
  const handleEmailBlur = () => {
    setEmailTouched(true);
    const validation = validateEmail(email);
    setEmailError(validation.message);
  };

  // Handle username input changes with validation
  const handleUsernameChange = (text) => {
    setUsername(text);
    const validation = validateUsername(text);
    setUsernameError(validation.message);
  };

  // Handle username blur
  const handleUsernameBlur = () => {
    const validation = validateUsername(username);
    setUsernameError(validation.message);
  };

  // Handle password input changes with validation
  const handlePasswordChange = (text) => {
    setPassword(text);
    const validation = validatePassword(text);
    setPasswordError(validation.message);
  };

  // Handle password blur
  const handlePasswordBlur = () => {
    const validation = validatePassword(password);
    setPasswordError(validation.message);
  };

  const handleSignUp = async () => {
    // Validate all fields before submitting
    const usernameValidation = validateUsername(username);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    
    setUsernameError(usernameValidation.message);
    setEmailError(emailValidation.message);
    setPasswordError(passwordValidation.message);
    
    // Ensure email is marked as touched to show errors
    setEmailTouched(true);
    
    if (!usernameValidation.isValid || !emailValidation.isValid || !passwordValidation.isValid) {
      return;
    }

    const result = await register(username, email, password);
    if (result.success) {
      router.push({
        pathname: "/otp-verification",
        params: { email }
      });
    } else {
      Alert.alert("Error", result.error);
    }
  };

  // Check if form is valid
  const isFormValid = validateUsername(username).isValid && 
                     validateEmail(email).isValid && 
                     validatePassword(password).isValid;

  if (isCheckingAuth) {
    return (
      <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
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
        <View style={styles.card}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>GreenSnap</Text>
            <Text style={styles.subtitle}>Your one report can help make the community clean</Text>
          </View>

          <View style={styles.formContainer}>
            {/* USERNAME INPUT */}
            <View style={styles.inputGroup}> 
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, usernameError ? styles.inputError : null]}
                  placeholder="MohammedAli"
                  placeholderTextColor={COLORS.placeholderText}
                  value={username}
                  onChangeText={handleUsernameChange}
                  onBlur={handleUsernameBlur}
                  autoCapitalize="none"
                />
              </View>
              {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
              <Text style={styles.hintText}>
                Minimum 3 characters, maximum 32 characters
              </Text>
            </View>

            {/* EMAIL INPUT */}
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
                  style={[styles.input, emailError ? styles.inputError : null]}
                  placeholder="username123@gmail.com"
                  value={email}
                  placeholderTextColor={COLORS.placeholderText}
                  onChangeText={handleEmailChange}
                  onBlur={handleEmailBlur}
                  keyboardType='email-address'
                  autoCapitalize="none"
                />  
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              {/* Hint about email requirements */}
              <Text style={styles.hintText}>
                Use only letters and numbers before @ (e.g., john123)
              </Text>
              <Text style={styles.hintText}>
                Accepted domains: Gmail, Yahoo, Outlook, Hotmail, IIU.edu.pk
              </Text>
            </View>
            
            {/* PASSWORD INPUT */}
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
                  style={[styles.input, passwordError ? styles.inputError : null]}
                  placeholder="*********"
                  value={password}
                  placeholderTextColor={COLORS.placeholderText}
                  onChangeText={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              <Text style={styles.hintText}>
                Minimum 8 characters, maximum 32 characters
              </Text>
            </View>

            {/* SIGNUP BUTTON */}
            <TouchableOpacity 
              style={[styles.button, !isFormValid && styles.buttonDisabled]}
              onPress={handleSignUp} 
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
            
            {/* LOGIN LINK */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.link}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}