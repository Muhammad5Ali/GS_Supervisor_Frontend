import { Slot, SplashScreen } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import useAuthStore from '../store/authStore';
import { useEffect, useState } from "react";
import SafeScreen from "../components/SafeScreen";
import { useFonts } from "expo-font";
import { View, ActivityIndicator } from "react-native";
import DeepLinkHandler from '../components/DeepLinkHandler';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { checkAuth, isCheckingAuth } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  const [fontLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  // Hide splash screen when fonts are loaded
  useEffect(() => {
    if (fontLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontLoaded]);

  // Initialize authentication state
  useEffect(() => {
    const init = async () => {
      await checkAuth();
      setIsReady(true);
    };
    init();
  }, []);

  // Show loading indicator while initializing
  if (!fontLoaded || !isReady || isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Main layout with DeepLinkHandler and Slot
  return (
    <SafeAreaProvider>
      <SafeScreen>
        <StatusBar style="auto" />
        <DeepLinkHandler />
        <Slot />
      </SafeScreen>
    </SafeAreaProvider>
  );
}