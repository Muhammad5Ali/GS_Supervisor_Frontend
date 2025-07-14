import { useSegments, useRouter } from 'expo-router';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

export default function NavigationHandler() {
  const segments = useSegments();
  const { user, isCheckingAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isCheckingAuth) return;
    
    const inAuthGroup = segments[0] === '(auth)';
    const inProtectedGroup = segments[0] === '(tabs)';
    const inSupervisorGroup = segments[0] === 'supervisor';
    const isOnOTPPage = segments[1] === 'otp-verification';
    const isSupervisor = user?.role === 'supervisor';
    
    const isVerified = user?.verified || user?.accountVerified;
    
    // 1. Redirect unverified users to OTP screen
    if (user && !isVerified && !isOnOTPPage) {
      router.replace({ 
        pathname: "/otp-verification",
        params: { email: user.email }
      });
      return;
    }
    
    // 2. Redirect verified users to appropriate dashboard
    if (user && isVerified) {
      if (inAuthGroup) {
        if (isSupervisor) {
          router.replace('/supervisor/dashboard');
        } else {
          router.replace('/(tabs)');
        }
      }
      return;
    }
    
    // 3. Redirect unauthenticated users to login
    if (!user && (inProtectedGroup || inSupervisorGroup)) {
      router.replace('/login');
      return;
    }
    
    // 4. Redirect supervisors from regular user routes
    if (isSupervisor && inProtectedGroup) {
      router.replace('/supervisor/dashboard');
      return;
    }
    
    // 5. Redirect non-supervisors from supervisor routes
    if (user && !isSupervisor && inSupervisorGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments, isCheckingAuth]);
  
  return null;
}