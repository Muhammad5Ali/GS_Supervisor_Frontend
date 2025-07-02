import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

export default function DeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      console.log('Handling deep link:', url);
      
      // Handle both production and development URLs
      const isProdLink = url.includes('greensnap://reset-password');
      const isDevLink = url.includes('/reset-password?token=');
      
      if (isProdLink || isDevLink) {
        // Extract token from different URL formats
        let token;
        
        if (isProdLink) {
          token = Linking.parse(url).queryParams?.token;
        } else {
          const tokenMatch = url.match(/token=([^&]+)/);
          token = tokenMatch ? tokenMatch[1] : null;
        }
        
        if (token) {
          Alert.alert('Password Reset', 'Redirecting to password reset screen');
          router.replace({
            pathname: '/reset-password',
            params: { token }
          });
        }
      }
    };

    // Handle initial URL
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });

    // Listen for incoming links
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    return () => subscription.remove();
  }, []);

  return null;
}