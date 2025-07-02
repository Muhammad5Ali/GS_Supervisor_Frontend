import { useSegments, useRouter } from 'expo-router';
import useAuthStore from '../store/authStore';
import { useEffect } from 'react';

export default function NavigationHandler() {
  const segments = useSegments();
  const { user, isCheckingAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isCheckingAuth) return;
    
    const inAuthGroup = segments[0] === '(auth)';
    const inProtectedGroup = segments[0] === '(tabs)';
    const isOnOTPPage = segments[1] === 'otp-verification';
    
    // Combined verification check
    const isVerified = user?.verified || user?.accountVerified;
    
    // 1. Redirect unverified users to OTP screen
    if (user && !isVerified && !isOnOTPPage) {
      router.replace({ 
        pathname: "/otp-verification",
        params: { email: user.email }
      });
    }
    // 2. Redirect verified users to main app
    else if (user && isVerified && inAuthGroup) {
      router.replace('/(tabs)');
    }
    // 3. Redirect unauthenticated users to login
    else if (!user && inProtectedGroup) {
      router.replace('/login');
    }
  }, [user, segments, isCheckingAuth]);
  
  return null;
}