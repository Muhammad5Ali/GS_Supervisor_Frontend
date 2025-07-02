import { useAuthStore } from '../store/authStore';

export const API_URL = "https://greensnapbackend.onrender.com/api";

export const authFetch = async (url, options = {}) => {
  const { token, logout } = useAuthStore.getState();
  
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    });

    // Handle token expiration
    if (response.status === 401) {
      await logout();
      throw new Error('Session expired');
    }

    return response;
  } catch (error) {
     if (error.message.includes('401')) {
      useAuthStore.getState().logout();
      router.replace('/login');
    }
    throw error;
  }
};