import 'react-native-gesture-handler'; // Add this at the very top
import { Slot, SplashScreen } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";

import useAuthStore from '../store/authStore';
import SafeScreen from "../components/SafeScreen";
import NavigationHandler from "../components/NavigationHandler";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { checkAuth, isCheckingAuth } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      setIsReady(true);
    };
    init();
  }, []);

  if (!fontsLoaded || !isReady || isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeScreen>
          <StatusBar style="auto" />
          <NavigationHandler />
          <Slot />
        </SafeScreen>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}