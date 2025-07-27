import useAuthStore from '../store/authStore';

const setupApiInterceptor = () => {
  const originalFetch = global.fetch;
  
  global.fetch = async (url, options = {}) => {
    // Skip interception for auth-related endpoints
    if (url.includes('/auth/')) {
      return originalFetch(url, options);
    }
    
    try {
      const response = await originalFetch(url, options);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        const authStore = useAuthStore.getState();
        
        // Handle non-JSON responses safely
        let errorData = {};
        try {
          errorData = await response.clone().json();
        } catch (e) {
          console.warn("Non-JSON error response", e);
        }
        
        // Check both message text and custom error code
        if (
          errorData.message?.includes('Session expired') || 
          errorData.message?.includes('Token expired') ||
          errorData.code === 'SESSION_EXPIRED' ||
          errorData.error === 'TOKEN_EXPIRED'
        ) {
          authStore.logout(true);
        }
      }
      
      return response;
    } catch (error) {
      // Handle network errors
      if (error.message.includes('401')) {
        useAuthStore.getState().logout(true);
      }
      throw error;
    }
  };
};

export default setupApiInterceptor;