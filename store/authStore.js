import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../constants/api";
import { decodeJwt, isJwtExpired } from "../lib/jwtUtils";
import { router } from 'expo-router';
import { logoutRedirect } from '../lib/navigationService';

const TOKEN_KEY = "auth_token";
const USER_KEY  = "auth_user";

// Create the store without export keyword
const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isCheckingAuth: true,

  register: async (username, email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");
      return { success: true, email };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  verifyOTP: async (email, otp) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/verifyOTP`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      
      const data = await response.json();
      return { success: !!data.success };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Network error' 
      };
    } finally {
      set({ isLoading: false });
    }
  },
  
  resendOTP: async (email) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/resendOTP`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to resend OTP");
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

 resendResetPasswordOTP: async (email) => {
  set({ isLoading: true });
  try {
    const response = await fetch(`${API_URL}/auth/password/forgot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        error: data.message || "Failed to resend OTP" 
      };
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || "Network error" 
    };
  } finally {
    set({ isLoading: false });
  }
},

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          error: data.message || 'Login failed' 
        };
      }

      if (data.token) {
        const payload = decodeJwt(data.token);
        
        if (!payload.verified) {
          return { 
            success: false, 
            error: 'Account not verified',
            requiresVerification: true,
            email
          };
        }

        // Add role with default fallback to 'user'
        const verifiedUser = {
          ...data.user,
          createdAt: data.user.createdAt,
          verified: payload.verified,
          role: data.user.role || 'user'
        };

        await SecureStore.setItemAsync(TOKEN_KEY, data.token);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(verifiedUser));

        set({
          user: verifiedUser,
          token: data.token,
        });

        return { 
          success: true, 
          user: verifiedUser
        };
      } else {
        return { 
          success: false, 
          error: 'Authentication token missing' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Network error' 
      };
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const [token, userJson] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY)
      ]);
      
      if (!token || !userJson) {
        set({ user: null, token: null });
        return;
      }

      if (isJwtExpired(token)) {
        console.warn("Token expired - clearing auth data");
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
        set({ user: null, token: null });
        return;
      }

      const decoded = decodeJwt(token);
      const user = JSON.parse(userJson);
      
      const updatedUser = {
        ...user,
          createdAt: user.createdAt, 
        verified: decoded.verified
      };

      set({ user: updatedUser, token });

    } catch (error) {
      console.error("Auth check error:", error);
      set({ user: null, token: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      // Ensure proper error handling
      if (!response.ok) {
        return { 
          success: false, 
          error: data.message || "Password reset request failed" 
        };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

 verifyResetOTP: async (email, otp) => {
  set({ isLoading: true });
  try {
    const response = await fetch(`${API_URL}/auth/password/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    
    const data = await response.json();
    
    // Handle non-2xx responses
    if (!response.ok) {
      // Return error message from server if available
      return { 
        success: false, 
        error: data.message || `OTP verification failed (${response.status})`
      };
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || "Network error" 
    };
  } finally {
    set({ isLoading: false });
  }
},

  resetPassword: async (email, password) => {
    set({ isLoading: true });
    try {
      console.log("[AuthStore] Resetting password for:", email);
      
      const response = await fetch(`${API_URL}/auth/password/reset`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("[AuthStore] Reset password response status:", response.status);
      
      const data = await response.json();
      console.log("[AuthStore] Reset password response data:", data);
      
      if (!response.ok) {
        return { 
          success: false, 
          error: data.message || "Password reset failed" 
        };
      }

      return { success: true };
    } catch (error) {
      console.error("[AuthStore] Password reset error:", error);
      return { 
        success: false, 
        error: error.message || "Password reset failed" 
      };
    } finally {
      set({ isLoading: false });
    }
  },
  
  logout: async () => {
    const { token } = get(); // Get current token from state
    
    // Add token invalidation
    try {
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.log("Logout API error:", error);
    }
    
    // Clear local storage
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    
    // Reset state
    set({ user: null, token: null, isLoading: false });
    
    // Use Expo Router for redirect
    router.replace('/(auth)');
    //  router.replace('/login');
  },

  // Supervisor detection function
  isSupervisor: () => {
    const user = get().user;
    return user?.role === 'supervisor';
  }

}));

// Export as default
export default useAuthStore;