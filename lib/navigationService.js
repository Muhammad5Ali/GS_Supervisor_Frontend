// lib/navigationService.js
import { router } from 'expo-router';

export function navigate(routeName, params) {
  router.navigate({ pathname: routeName, params });
}

export const logoutRedirect = () => {
  // Reset navigation to auth screen
  router.replace('/(auth)');
};

export const goBack = () => {
  router.back();
};

export const replace = (routeName, params) => {
  router.replace({ pathname: routeName, params });
};

// Optional: Add navigation state helpers
export const getCurrentRoute = () => {
  return router.canGoBack() ? router.getState()?.routes[router.getState().index]?.name : null;
};