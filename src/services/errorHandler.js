// Enhanced error handling service with user feedback
import { 
  showError, 
  showWarning, 
  showInfo, 
  connectionNotifications 
} from './notificationService';

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

class ErrorHandler {
  constructor() {
    this.errorHistory = [];
    this.maxErrorHistory = 50;
    this.retryAttempts = new Map();
    this.maxRetryAttempts = 3;
  }

  // Main error handling method
  handleError(error, context = {}) {
    const errorInfo = this.analyzeError(error, context);
    
    // Log error
    this.logError(errorInfo);
    
    // Show user notification
    this.showUserNotification(errorInfo);
    
    // Store in history
    this.addToHistory(errorInfo);
    
    // Handle specific error actions
    this.handleSpecificError(errorInfo);
    
    return errorInfo;
  }

  // Analyze error to determine type and severity
  analyzeError(error, context) {
    const errorInfo = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      context,
      originalError: error,
      message: 'An unexpected error occurred',
      type: ERROR_TYPES.UNKNOWN,
      severity: ERROR_SEVERITY.MEDIUM,
      statusCode: null,
      isRetryable: false,
      userAction: null,
      technicalDetails: null
    };

    if (error?.response) {
      // HTTP response error
      errorInfo.statusCode = error.response.status;
      errorInfo.message = error.response.data?.message || error.response.statusText || errorInfo.message;
      errorInfo.technicalDetails = error.response.data;

      switch (error.response.status) {
        case 400:
          errorInfo.type = ERROR_TYPES.VALIDATION;
          errorInfo.severity = ERROR_SEVERITY.LOW;
          errorInfo.message = this.formatValidationError(error.response.data);
          errorInfo.userAction = 'Please check your input and try again';
          break;
          
        case 401:
          errorInfo.type = ERROR_TYPES.AUTH;
          errorInfo.severity = ERROR_SEVERITY.HIGH;
          errorInfo.message = 'Authentication required. Please log in again.';
          errorInfo.userAction = 'redirectToLogin';
          break;
          
        case 403:
          errorInfo.type = ERROR_TYPES.PERMISSION;
          errorInfo.severity = ERROR_SEVERITY.MEDIUM;
          errorInfo.message = 'You do not have permission to perform this action';
          errorInfo.userAction = 'Contact administrator if you believe this is an error';
          break;
          
        case 404:
          errorInfo.type = ERROR_TYPES.NOT_FOUND;
          errorInfo.severity = ERROR_SEVERITY.LOW;
          errorInfo.message = 'The requested resource was not found';
          errorInfo.userAction = 'Please check if the item still exists';
          break;
          
        case 408:
        case 504:
          errorInfo.type = ERROR_TYPES.TIMEOUT;
          errorInfo.severity = ERROR_SEVERITY.MEDIUM;
          errorInfo.message = 'Request timed out. Please try again.';
          errorInfo.isRetryable = true;
          errorInfo.userAction = 'retry';
          break;
          
        case 429:
          errorInfo.type = ERROR_TYPES.NETWORK;
          errorInfo.severity = ERROR_SEVERITY.MEDIUM;
          errorInfo.message = 'Too many requests. Please wait a moment and try again.';
          errorInfo.isRetryable = true;
          errorInfo.userAction = 'waitAndRetry';
          break;
          
        case 500:
        case 502:
        case 503:
          errorInfo.type = ERROR_TYPES.SERVER;
          errorInfo.severity = ERROR_SEVERITY.HIGH;
          errorInfo.message = 'Server error. Please try again later.';
          errorInfo.isRetryable = true;
          errorInfo.userAction = 'retry';
          break;
          
        default:
          errorInfo.message = `Request failed with status ${error.response.status}`;
      }
    } else if (error?.request) {
      // Network error
      errorInfo.type = ERROR_TYPES.NETWORK;
      errorInfo.severity = ERROR_SEVERITY.HIGH;
      errorInfo.message = 'Network error. Please check your internet connection.';
      errorInfo.isRetryable = true;
      errorInfo.userAction = 'checkConnection';
    } else if (error?.code === 'ECONNABORTED') {
      // Timeout error
      errorInfo.type = ERROR_TYPES.TIMEOUT;
      errorInfo.severity = ERROR_SEVERITY.MEDIUM;
      errorInfo.message = 'Request timed out. Please try again.';
      errorInfo.isRetryable = true;
      errorInfo.userAction = 'retry';
    } else if (error?.message) {
      // JavaScript error
      errorInfo.message = error.message;
      errorInfo.technicalDetails = error.stack;
    }

    return errorInfo;
  }

  // Format validation errors for user display
  formatValidationError(errorData) {
    if (errorData?.errors && Array.isArray(errorData.errors)) {
      const messages = errorData.errors.map(err => err.message || err.msg).filter(Boolean);
      if (messages.length > 0) {
        return messages.length === 1 ? messages[0] : `Validation errors: ${messages.join(', ')}`;
      }
    }
    
    return errorData?.message || 'Please check your input and try again';
  }

  // Show appropriate user notification
  showUserNotification(errorInfo) {
    const options = {
      duration: this.getNotificationDuration(errorInfo.severity)
    };

    switch (errorInfo.type) {
      case ERROR_TYPES.NETWORK:
        if (errorInfo.message.includes('internet connection')) {
          connectionNotifications.offline();
        } else {
          connectionNotifications.timeout();
        }
        break;
        
      case ERROR_TYPES.AUTH:
        showError(errorInfo.message, options);
        break;
        
      case ERROR_TYPES.VALIDATION:
        showWarning(errorInfo.message, options);
        break;
        
      case ERROR_TYPES.PERMISSION:
        showWarning(errorInfo.message, options);
        break;
        
      case ERROR_TYPES.NOT_FOUND:
        showInfo(errorInfo.message, options);
        break;
        
      case ERROR_TYPES.SERVER:
        connectionNotifications.serverError();
        break;
        
      default:
        showError(errorInfo.message, options);
    }
  }

  // Get notification duration based on severity
  getNotificationDuration(severity) {
    switch (severity) {
      case ERROR_SEVERITY.LOW: return 4000;
      case ERROR_SEVERITY.MEDIUM: return 6000;
      case ERROR_SEVERITY.HIGH: return 8000;
      case ERROR_SEVERITY.CRITICAL: return 0; // Never auto-dismiss
      default: return 5000;
    }
  }

  // Handle specific error actions
  handleSpecificError(errorInfo) {
    switch (errorInfo.userAction) {
      case 'redirectToLogin':
        // Clear auth data and redirect
        localStorage.removeItem('pashumitra_user');
        localStorage.removeItem('pashumitra_token');
        window.location.href = '/auth';
        break;
        
      case 'retry':
        if (this.shouldRetry(errorInfo)) {
          this.scheduleRetry(errorInfo);
        }
        break;
        
      case 'waitAndRetry':
        // Wait for rate limit to reset
        setTimeout(() => {
          if (this.shouldRetry(errorInfo)) {
            this.scheduleRetry(errorInfo);
          }
        }, 30000); // Wait 30 seconds
        break;
        
      default:
        // No specific action required
        break;
    }
  }

  // Check if error should be retried
  shouldRetry(errorInfo) {
    const key = `${errorInfo.context.endpoint || 'unknown'}-${errorInfo.context.method || 'unknown'}`;
    const attempts = this.retryAttempts.get(key) || 0;
    return errorInfo.isRetryable && attempts < this.maxRetryAttempts;
  }

  // Schedule retry attempt
  scheduleRetry(errorInfo) {
    const key = `${errorInfo.context.endpoint || 'unknown'}-${errorInfo.context.method || 'unknown'}`;
    const attempts = this.retryAttempts.get(key) || 0;
    
    this.retryAttempts.set(key, attempts + 1);
    
    const delay = Math.pow(2, attempts) * 1000; // Exponential backoff
    
    setTimeout(() => {
      if (errorInfo.context.retryCallback) {
        errorInfo.context.retryCallback();
      }
    }, delay);
  }

  // Generate unique error ID
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Log error for debugging
  logError(errorInfo) {
    const logLevel = this.getLogLevel(errorInfo.severity);
    
    console[logLevel](`[Error Handler] ${errorInfo.type}:`, {
      id: errorInfo.id,
      message: errorInfo.message,
      context: errorInfo.context,
      technicalDetails: errorInfo.technicalDetails,
      timestamp: errorInfo.timestamp
    });
  }

  // Get console log level based on severity
  getLogLevel(severity) {
    switch (severity) {
      case ERROR_SEVERITY.LOW: return 'info';
      case ERROR_SEVERITY.MEDIUM: return 'warn';
      case ERROR_SEVERITY.HIGH: 
      case ERROR_SEVERITY.CRITICAL: return 'error';
      default: return 'warn';
    }
  }

  // Add error to history
  addToHistory(errorInfo) {
    this.errorHistory.unshift(errorInfo);
    
    if (this.errorHistory.length > this.maxErrorHistory) {
      this.errorHistory = this.errorHistory.slice(0, this.maxErrorHistory);
    }
  }

  // Get error history
  getErrorHistory() {
    return [...this.errorHistory];
  }

  // Clear error history
  clearErrorHistory() {
    this.errorHistory = [];
    this.retryAttempts.clear();
  }

  // Get error statistics
  getErrorStats() {
    const totalErrors = this.errorHistory.length;
    const typeCount = {};
    const severityCount = {};
    
    this.errorHistory.forEach(error => {
      typeCount[error.type] = (typeCount[error.type] || 0) + 1;
      severityCount[error.severity] = (severityCount[error.severity] || 0) + 1;
    });
    
    return {
      totalErrors,
      typeCount,
      severityCount,
      recentErrors: this.errorHistory.slice(0, 5)
    };
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Convenience functions
export const handleError = (error, context = {}) => errorHandler.handleError(error, context);
export const getErrorHistory = () => errorHandler.getErrorHistory();
export const clearErrorHistory = () => errorHandler.clearErrorHistory();
export const getErrorStats = () => errorHandler.getErrorStats();

// API request wrapper with error handling
export const withErrorHandling = (apiCall, context = {}) => {
  return async (...args) => {
    try {
      return await apiCall(...args);
    } catch (error) {
      const errorInfo = handleError(error, {
        ...context,
        endpoint: apiCall.name,
        arguments: args
      });
      throw errorInfo;
    }
  };
};

export default errorHandler;