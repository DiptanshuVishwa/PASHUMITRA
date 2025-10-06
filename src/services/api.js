import axios from 'axios';
import { handleError } from './errorHandler';

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}`,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const getToken = () => {
  // First try to get token from dedicated token storage
  const directToken = localStorage.getItem('pashumitra_token');
  if (directToken) {
    return directToken;
  }
  
  // Fallback to user object token (legacy)
  try {
    const user = JSON.parse(localStorage.getItem('pashumitra_user') || '{}');
    return user.token || null;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
};

const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('pashumitra_token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('pashumitra_token');
  }
};

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (process.env.REACT_APP_DEBUG_MODE === 'true') {
      console.log('🔄 API Request:', config.method?.toUpperCase(), config.url, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle common responses
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.REACT_APP_DEBUG_MODE === 'true') {
      console.log('✅ API Response:', response.config.method?.toUpperCase(), response.config.url, response.data);
    }
    
    return response;
  },
  (error) => {
    // Use enhanced error handling
    handleError(error, {
      endpoint: error.config?.url,
      method: error.config?.method,
      data: error.config?.data
    });
    
    return Promise.reject(error);
  }
);

// API Service Functions
export const authAPI = {
  // User Registration
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  // User Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    return response.data;
  },
  
  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAuthToken(null);
      localStorage.removeItem('pashumitra_user');
      localStorage.removeItem('pashumitra_questionnaire');
    }
  },
  
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
  
  // Password reset request
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
  
  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/password', { 
      currentPassword, 
      newPassword,
      confirmPassword: newPassword 
    });
    return response.data;
  },
  
  // Verify email
  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },
  
  // Resend verification email
  resendVerification: async (email) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  }
};

export const alertAPI = {
  // Create new alert
  create: async (alertData) => {
    const response = await api.post('/alerts', alertData);
    return response.data;
  },
  
  // Get user alerts (using main alerts endpoint)
  getMyAlerts: async (params = {}) => {
    const response = await api.get('/alerts', { params });
    return response.data;
  },
  
  // Get all alerts (admin/staff)
  getAllAlerts: async (params = {}) => {
    const response = await api.get('/alerts', { params });
    return response.data;
  },
  
  // Get alert by ID
  getById: async (alertId) => {
    const response = await api.get(`/alerts/${alertId}`);
    return response.data;
  },
  
  // Update alert (including status)
  update: async (alertId, updateData) => {
    const response = await api.put(`/alerts/${alertId}`, updateData);
    return response.data;
  },
  
  // Update alert status (convenience method)
  updateStatus: async (alertId, status) => {
    const response = await api.put(`/alerts/${alertId}`, { status });
    return response.data;
  },
  
  // Delete alert
  delete: async (alertId) => {
    const response = await api.delete(`/alerts/${alertId}`);
    return response.data;
  }
};

export const fileAPI = {
  // Upload single file
  uploadSingle: async (file, onProgress = null) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      };
    }
    
    const response = await api.post('/upload/single', formData, config);
    return response.data;
  },
  
  // Upload multiple files
  uploadMultiple: async (files, onProgress = null) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      };
    }
    
    const response = await api.post('/upload/multiple', formData, config);
    return response.data;
  },
  
  // Get user files
  getMyFiles: async (params = {}) => {
    const response = await api.get('/upload/files', { params });
    return response.data;
  },
  
  // Get file by ID
  getFile: async (fileId) => {
    const response = await api.get(`/upload/files/${fileId}`);
    return response.data;
  },
  
  // Download file
  downloadFile: async (fileId) => {
    const response = await api.get(`/upload/download/${fileId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  // Get file stats
  getStats: async () => {
    const response = await api.get('/upload/stats');
    return response.data;
  },
  
  // Delete file
  deleteFile: async (fileId) => {
    const response = await api.delete(`/upload/${fileId}`);
    return response.data;
  }
};

export const userAPI = {
  // Get all users (admin only)
  getAll: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  
  // Get user by ID
  getById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  // Update user
  update: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },
  
  // Delete user
  delete: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
  
  // Get user statistics
  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  }
};

export const dashboardAPI = {
  // Get dashboard overview
  getOverview: async () => {
    const response = await api.get('/dashboard/overview');
    return response.data;
  },
  
  // Get user dashboard
  getUserDashboard: async () => {
    const response = await api.get('/dashboard/user');
    return response.data;
  },
  
  // Get admin dashboard
  getAdminDashboard: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },
  
  // Get dashboard statistics
  getStats: async (timeRange = '7d') => {
    const response = await api.get(`/dashboard/stats?range=${timeRange}`);
    return response.data;
  }
};

export const contactAPI = {
  // Submit contact form
  submit: async (contactData) => {
    const response = await api.post('/contact', contactData);
    return response.data;
  },
  
  // Get contact submissions (admin)
  getAll: async (params = {}) => {
    const response = await api.get('/contact', { params });
    return response.data;
  },
  
  // Get contact by ID
  getById: async (contactId) => {
    const response = await api.get(`/contact/${contactId}`);
    return response.data;
  },
  
  // Update contact status
  updateStatus: async (contactId, status) => {
    const response = await api.put(`/contact/${contactId}/status`, { status });
    return response.data;
  }
};

export const veterinarianAPI = {
  // Get all veterinarians
  getAll: async (params = {}) => {
    const response = await api.get('/veterinarians', { params });
    return response.data;
  },
  
  // Get veterinarian by ID
  getById: async (vetId) => {
    const response = await api.get(`/veterinarians/${vetId}`);
    return response.data;
  },
  
  // Search veterinarians by location
  searchByLocation: async (location, radius = 50) => {
    const response = await api.get(`/veterinarians/search?location=${location}&radius=${radius}`);
    return response.data;
  },
  
  // Book appointment
  bookAppointment: async (vetId, appointmentData) => {
    const response = await api.post(`/veterinarians/${vetId}/book`, appointmentData);
    return response.data;
  }
};

// Translation API
export const translationAPI = {
  // Get supported languages
  getSupportedLanguages: async () => {
    const response = await api.get('/translation/languages');
    return response.data;
  },
  
  // Translate single text
  translate: async (text, targetLanguage, sourceLanguage = 'en') => {
    const response = await api.post('/translation/translate', {
      text,
      targetLanguage,
      sourceLanguage
    });
    return response.data;
  },
  
  // Batch translate
  translateBatch: async (texts, targetLanguage, sourceLanguage = 'en') => {
    const response = await api.post('/translation/batch', {
      texts,
      targetLanguage,
      sourceLanguage
    });
    return response.data;
  },
  
  // Translate object
  translateObject: async (data, targetLanguage, keyPaths = [], sourceLanguage = 'en') => {
    const response = await api.post('/translation/object', {
      data,
      targetLanguage,
      keyPaths,
      sourceLanguage
    });
    return response.data;
  },
  
  // Get service status
  getStatus: async () => {
    const response = await api.get('/translation/status');
    return response.data;
  },
  
  // Test translation
  test: async (lang = 'hi', text = 'Hello World') => {
    const response = await api.get(`/translation/test?lang=${lang}&text=${encodeURIComponent(text)}`);
    return response.data;
  },
  
  // Clear cache (admin)
  clearCache: async () => {
    const response = await api.post('/translation/cache/clear');
    return response.data;
  }
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
  
  stats: async () => {
    const response = await api.get('/health/stats');
    return response.data;
  }
};

// Utility functions
export const formatError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export const handleApiError = (error, defaultMessage = 'Something went wrong') => {
  const message = formatError(error);
  console.error('API Error:', message);
  
  // You can integrate with your notification system here
  // showNotification({ type: 'error', message });
  
  return message;
};

// Initialize auth token on app start
const token = localStorage.getItem('pashumitra_token');
if (token) {
  setAuthToken(token);
}

export { setAuthToken };
export default api;