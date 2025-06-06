import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native'
import React, { useState } from 'react'
import styles from "../../assets/styles/login.styles";
import { Image } from 'react-native';
import COLORS from '../../constants/colors';
import {Ionicons} from "@expo/vector-icons"
import { Link } from "expo-router"; 
import { KeyboardAvoidingView } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [showPassword,setShowPassword]=useState(false);
 const {isLoading,login,isCheckingAuth}=useAuthStore();

  const handleLogin=async()=>{
    const result=await login(email,password);
    if(!result.success) Alert.alert("Error","Invalid credentials");
   
  };

  if(isCheckingAuth) return null; // Optionally show a loading state while checking auth
  return (
    <KeyboardAvoidingView
    style={{flex:1}}
    behavior={Platform.OS==="ios"?"padding":"height"}
    >
    <View style={styles.container}>
       {/* ILLUSTRATION */}
       <View style={styles.topIllustration}>
        <Image
       // source={require("../../assets/images/Reading glasses-bro.png")}
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
          {/* LEFT ICON */}
        <Ionicons
        name="lock-closed-outline"
        size={20}
        color={COLORS.primary}
        style={styles.inputIcon}
        />
        {/* INPUT */}
        <TextInput
         style={styles.input}
         placeholder="Enter your password"
         placeholderTextColor={COLORS.placeholderText}
         value={password}
         onChangeText={setPassword}
         secureTextEntry={!showPassword}
        />
        <TouchableOpacity
         onPress={()=>setShowPassword(!showPassword)}
         style={styles.inputIcon}
         >
        <Ionicons
        name={showPassword?"eye-outline":"eye-off-outline"}
        size={20}
        color={COLORS.primary}
       
        />
        </TouchableOpacity>
        </View>
       </View>
       <TouchableOpacity style={styles.button} onPress={handleLogin}
       disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ):(
          <Text style={styles.buttonText}>Login</Text>
        )}
</TouchableOpacity>
      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account</Text>
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

