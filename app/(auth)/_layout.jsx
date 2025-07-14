import { Slot, Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="otp-verification" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-otp-verification" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="reset-password-success" />
    </Stack>
  );
}