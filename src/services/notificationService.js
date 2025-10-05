// Notification service for user feedback and alerts
import { toast } from 'react-hot-toast';

// Configuration for different notification types
const notificationConfig = {
  success: {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#10b981',
      color: 'white',
    },
    iconTheme: {
      primary: 'white',
      secondary: '#10b981',
    },
  },
  error: {
    duration: 6000,
    position: 'top-right',
    style: {
      background: '#ef4444',
      color: 'white',
    },
    iconTheme: {
      primary: 'white',
      secondary: '#ef4444',
    },
  },
  loading: {
    duration: Infinity,
    position: 'top-right',
    style: {
      background: '#3b82f6',
      color: 'white',
    },
  },
  warning: {
    duration: 5000,
    position: 'top-right',
    style: {
      background: '#f59e0b',
      color: 'white',
    },
  },
  info: {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#6366f1',
      color: 'white',
    },
  }
};

// Show success notification
export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    ...notificationConfig.success,
    ...options
  });
};

// Show error notification
export const showError = (message, options = {}) => {
  return toast.error(message, {
    ...notificationConfig.error,
    ...options
  });
};

// Show loading notification
export const showLoading = (message, options = {}) => {
  return toast.loading(message, {
    ...notificationConfig.loading,
    ...options
  });
};

// Show warning notification
export const showWarning = (message, options = {}) => {
  return toast(message, {
    ...notificationConfig.warning,
    icon: '⚠️',
    ...options
  });
};

// Show info notification
export const showInfo = (message, options = {}) => {
  return toast(message, {
    ...notificationConfig.info,
    icon: 'ℹ️',
    ...options
  });
};

// Dismiss a specific notification
export const dismiss = (toastId) => {
  toast.dismiss(toastId);
};

// Dismiss all notifications
export const dismissAll = () => {
  toast.dismiss();
};

// Custom notification with custom styling
export const showCustom = (message, options = {}) => {
  return toast(message, options);
};

// Promise-based notification (for async operations)
export const showPromise = (promise, messages, options = {}) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Something went wrong!',
    },
    {
      ...notificationConfig.loading,
      ...options
    }
  );
};

// API Response handler - automatically shows appropriate notification
export const handleApiResponse = (response, successMessage = null, showSuccessNotification = true) => {
  if (response?.success) {
    if (showSuccessNotification && successMessage) {
      showSuccess(successMessage);
    }
    return response;
  } else {
    const errorMessage = response?.message || response?.error || 'An error occurred';
    showError(errorMessage);
    throw new Error(errorMessage);
  }
};

// API Error handler
export const handleApiError = (error, defaultMessage = 'Something went wrong') => {
  let errorMessage = defaultMessage;
  
  if (error?.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error?.response?.data?.error) {
    errorMessage = error.response.data.error;
  } else if (error?.message) {
    errorMessage = error.message;
  }
  
  showError(errorMessage);
  return errorMessage;
};

// Network error handler
export const handleNetworkError = () => {
  showError('Network error. Please check your connection and try again.');
};

// Validation error handler
export const handleValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    errors.forEach(error => showError(error));
  } else if (typeof errors === 'object') {
    Object.values(errors).forEach(error => showError(error));
  } else {
    showError(errors || 'Validation failed');
  }
};

// Upload progress notification
export const showUploadProgress = (message = 'Uploading files...') => {
  return showLoading(message);
};

// Update upload progress
export const updateUploadProgress = (toastId, message, progress) => {
  toast.loading(`${message} ${Math.round(progress)}%`, { id: toastId });
};

// Complete upload
export const completeUpload = (toastId, message = 'Upload completed successfully!') => {
  toast.success(message, { id: toastId });
};

// Fail upload
export const failUpload = (toastId, message = 'Upload failed') => {
  toast.error(message, { id: toastId });
};

// Authentication notifications
export const authNotifications = {
  loginSuccess: (userName) => showSuccess(`Welcome back, ${userName}!`),
  loginError: (message) => showError(message || 'Login failed'),
  logoutSuccess: () => showSuccess('Logged out successfully'),
  registerSuccess: () => showSuccess('Account created successfully!'),
  registerError: (message) => showError(message || 'Registration failed'),
  passwordChanged: () => showSuccess('Password changed successfully'),
  profileUpdated: () => showSuccess('Profile updated successfully'),
  emailVerified: () => showSuccess('Email verified successfully'),
  passwordResetSent: (email) => showSuccess(`Password reset link sent to ${email}`),
};

// Alert-specific notifications
export const alertNotifications = {
  created: () => showSuccess('Alert submitted successfully! You will receive updates on this issue.'),
  updated: () => showSuccess('Alert updated successfully'),
  deleted: () => showSuccess('Alert deleted successfully'),
  statusChanged: (status) => showInfo(`Alert status changed to: ${status}`),
  creationError: (message) => showError(message || 'Failed to create alert'),
};

// File upload notifications
export const fileNotifications = {
  uploadStart: (count) => showLoading(`Uploading ${count} file${count > 1 ? 's' : ''}...`),
  uploadComplete: (count) => showSuccess(`${count} file${count > 1 ? 's' : ''} uploaded successfully`),
  uploadFailed: (count) => showError(`Failed to upload ${count} file${count > 1 ? 's' : ''}`),
  fileTooLarge: (maxSize) => showError(`File size too large. Maximum size: ${maxSize}`),
  fileTypeInvalid: (allowedTypes) => showError(`Invalid file type. Allowed types: ${allowedTypes}`),
};

// Connection notifications
export const connectionNotifications = {
  offline: () => showWarning('You are offline. Some features may not work.'),
  online: () => showSuccess('Connection restored'),
  serverError: () => showError('Server error. Please try again later.'),
  timeout: () => showError('Request timeout. Please check your connection.'),
};

const notificationService = {
  showSuccess,
  showError,
  showLoading,
  showWarning,
  showInfo,
  dismiss,
  dismissAll,
  showCustom,
  showPromise,
  handleApiResponse,
  handleApiError,
  handleNetworkError,
  handleValidationErrors,
  showUploadProgress,
  updateUploadProgress,
  completeUpload,
  failUpload,
  authNotifications,
  alertNotifications,
  fileNotifications,
  connectionNotifications,
};

export default notificationService;
