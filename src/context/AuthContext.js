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

  useEffect(() => {
    // Check for existing session and validate with backend
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('pashumitra_user');
      const token = localStorage.getItem('pashumitra_token');
      
      if (savedUser && token) {
        try {
          // Validate token with backend
          const userData = await authAPI.getProfile();
          setUser(userData.user);
          setIsAuthenticated(true);
          
          // Check if user has completed questionnaire
          const userId = userData.user.id || userData.user._id;
          const questionnaire = localStorage.getItem(`pashumitra_questionnaire_${userId}`);
          setHasCompletedQuestionnaire(!!questionnaire);
          
          // Update stored user data with fresh data
          localStorage.setItem('pashumitra_user', JSON.stringify(userData.user));
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
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('pashumitra_user', JSON.stringify(response.data.user));
        
        // Check if user has completed questionnaire
        const userId = response.data.user.id || response.data.user._id;
        const questionnaire = localStorage.getItem(`pashumitra_questionnaire_${userId}`);
        setHasCompletedQuestionnaire(!!questionnaire);
        
        return { success: true, user: response.data.user };
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
    return await login(userData, true);
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
      
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('pashumitra_user', JSON.stringify(response.user));
        return { success: true, user: response.user };
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
    completeQuestionnaire
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};