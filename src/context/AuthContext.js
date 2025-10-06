import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, handleApiError } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);
  const [isSettingAuthData, setIsSettingAuthData] = useState(false); // Prevent concurrent calls

  useEffect(() => {
    // Check for existing session and validate with backend
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('pashumitra_user');
      const token = localStorage.getItem('pashumitra_token');
      
      if (savedUser && token) {
        try {
          // Validate token with backend
          const userData = await authAPI.getProfile();
          if (userData.success && userData.data && userData.data.user) {
            setUser(userData.data.user);
            setIsAuthenticated(true);
            
            // Check if user has completed questionnaire
            const userId = userData.data.user.id || userData.data.user._id;
            const questionnaire = localStorage.getItem(`pashumitra_questionnaire_${userId}`);
            setHasCompletedQuestionnaire(!!questionnaire);
            
            // Update stored user data with fresh data
            localStorage.setItem('pashumitra_user', JSON.stringify(userData.data.user));
          } else {
            throw new Error('Invalid user data response');
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          // Clear invalid session
          localStorage.removeItem('pashumitra_user');
          localStorage.removeItem('pashumitra_token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials, isRegistration = false) => {
    try {
      setLoading(true);
      
      const response = isRegistration 
        ? await authAPI.register(credentials)
        : await authAPI.login(credentials);
      
      if (response.success) {
        // Handle registration that requires email verification
        if (isRegistration && response.requiresVerification) {
          return {
            success: true,
            requiresVerification: true,
            user: response.data.user,
            message: response.message
          };
        }
        
        // Handle successful login or verified registration
        if (response.data?.user && response.token) {
          setUser(response.data.user);
          setIsAuthenticated(true);
          localStorage.setItem('pashumitra_user', JSON.stringify(response.data.user));
          
          // Check if user has completed questionnaire
          const userId = response.data.user.id || response.data.user._id;
          const questionnaire = localStorage.getItem(`pashumitra_questionnaire_${userId}`);
          setHasCompletedQuestionnaire(!!questionnaire);
          
          return { success: true, user: response.data.user };
        }
        
        throw new Error(response.message || 'Authentication failed');
      } else {
        throw new Error(response.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = handleApiError(error, 'Login failed');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state regardless of API call success
      setUser(null);
      setIsAuthenticated(false);
      setHasCompletedQuestionnaire(false);
      localStorage.removeItem('pashumitra_user');
      localStorage.removeItem('pashumitra_token');
      localStorage.removeItem('pashumitra_questionnaire');
      setLoading(false);
    }
  };

  const register = async (userData) => {
    console.log('🔍 AuthContext register called with:', userData);
    const result = await login(userData, true);
    console.log('🔍 AuthContext register result:', result);
    return result;
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await authAPI.forgotPassword(email);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = handleApiError(error, 'Failed to send reset email');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      const response = await authAPI.resetPassword(token, newPassword);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = handleApiError(error, 'Failed to reset password');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      const response = await authAPI.changePassword(currentPassword, newPassword);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Change password error:', error);
      const errorMessage = handleApiError(error, 'Failed to change password');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(profileData);
      
      if (response.success && response.data && response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('pashumitra_user', JSON.stringify(response.data.user));
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMessage = handleApiError(error, 'Failed to update profile');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const completeQuestionnaire = (questionnaireData) => {
    const userId = user?.id || user?._id || 'anonymous';
    localStorage.setItem(`pashumitra_questionnaire_${userId}`, JSON.stringify(questionnaireData));
    setHasCompletedQuestionnaire(true);
  };

  const verifyEmail = async (token) => {
    try {
      setLoading(true);
      const response = await authAPI.verifyEmail(token);
      
      // If verification is successful and we received a token, return it for auto-login
      if (response.success) {
        // If we have a token, this is the new format with auto-login capability
        if (response.token) {
          console.log('AuthContext - verifyEmail received token for auto-login');
          return { 
            success: true, 
            message: response.message,
            token: response.token,
            data: response.data 
          };
        } else {
          // Old format - just update user data if available
          if (user) {
            const updatedUser = { ...user, emailVerified: true };
            setUser(updatedUser);
            localStorage.setItem('pashumitra_user', JSON.stringify(updatedUser));
          }
          return { success: true, message: response.message };
        }
      }
      
      return { success: false, error: response.message || 'Verification failed' };
    } catch (error) {
      console.error('Email verification error:', error);
      const errorMessage = handleApiError(error, 'Email verification failed');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  const resendVerification = async (email) => {
    try {
      setLoading(true);
      const response = await authAPI.resendVerification(email);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Resend verification error:', error);
      const errorMessage = handleApiError(error, 'Failed to send verification email');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const setAuthData = async ({ token }) => {
    // Prevent concurrent calls
    if (isSettingAuthData) {
      console.log('AuthContext - setAuthData already in progress, skipping...');
      return { success: false, error: 'Authentication already in progress' };
    }
    
    try {
      console.log('AuthContext - setAuthData called with token:', token ? 'Present' : 'Missing');
      setIsSettingAuthData(true);
      setLoading(true);
      
      // Store token in localStorage with the expected key
      localStorage.setItem('pashumitra_token', token);
      console.log('AuthContext - Token stored in localStorage');
      
      // Fetch user data using the token
      console.log('AuthContext - Fetching user profile...');
      const userData = await authAPI.getProfile();
      console.log('AuthContext - Profile API response:', userData);
      
      if (userData.success && userData.data && userData.data.user) {
        const user = userData.data.user;
        console.log('AuthContext - Setting user data:', user.name, user.email);
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('pashumitra_user', JSON.stringify(user));
        
        // Check if user has completed questionnaire
        const userId = user.id || user._id;
        const questionnaire = localStorage.getItem(`pashumitra_questionnaire_${userId}`);
        setHasCompletedQuestionnaire(!!questionnaire);
        
        console.log('AuthContext - Authentication state updated successfully');
        return { success: true, user: user };
      } else {
        console.error('AuthContext - Invalid API response:', userData);
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('AuthContext - setAuthData error:', error);
      console.error('AuthContext - Error details:', error.response?.data);
      // Clear invalid data
      localStorage.removeItem('pashumitra_token');
      localStorage.removeItem('pashumitra_user');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
      setIsSettingAuthData(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    hasCompletedQuestionnaire,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
    completeQuestionnaire,
    setAuthData,
    verifyEmail,
    resendVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};