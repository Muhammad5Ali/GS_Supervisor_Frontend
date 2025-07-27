import { useSegments, useRouter } from 'expo-router';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

export default function NavigationHandler() {
  const segments = useSegments();
  const { user, token, isCheckingAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Add check for token at the very top
    if (!token || isCheckingAuth) return;
    
    // Add check for report-details
    const isOnReportDetails = segments[0] === 'report-details';
    
    // Add check for worker routes
    const isOnWorkerRoute = segments[0] === 'supervisor' && segments[1] === 'workers';
    
    // Check for nested worker screens (attendance, mark-attendance, etc.)
    const isOnNestedWorkerScreen = isOnWorkerRoute && segments[2];
    
    // Allow report-details screen for all authenticated users
    if (isOnReportDetails && user) {
      return; // Don't redirect
    }
    
    // Allow all nested worker screens for supervisors
    if (isOnNestedWorkerScreen && user?.role === 'supervisor') {
      return; // Don't redirect - allow navigation
    }
    
    // Existing segment checks
    const inAuthGroup = segments[0] === '(auth)';
    const inProtectedGroup = segments[0] === '(tabs)';
    const inSupervisorGroup = segments[0] === 'supervisor';
    const isOnOTPPage = segments[1] === 'otp-verification';
    const isSupervisor = user?.role === 'supervisor' || false;
    
    const isVerified = (user?.verified || user?.accountVerified) || false;
    
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
    
    // 5. Redirect non-supervisors from worker routes
    if (isOnWorkerRoute && user && !isSupervisor) {
      router.replace('/(tabs)');
      return;
    }
    
    // 6. Redirect non-supervisors from supervisor routes
    if (user && !isSupervisor && inSupervisorGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments, isCheckingAuth, token]); // Added token to dependencies
  
  return null;
}