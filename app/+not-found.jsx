import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      if (url?.startsWith('greensnap://reset-password/')) {
        const token = url.split('/').pop();
        router.push(`/reset-password?token=${token}`);
      }
    };

    // Subscribe to incoming deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Handle the case where the app is launched from a link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      // Clean up the subscription on unmount
      subscription.remove();
    };
  }, [router]);

  return null;
}
