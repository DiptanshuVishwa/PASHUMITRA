const logger = require('./logger');

/**
 * Email service error categories and their handling
 */
const EMAIL_ERROR_TYPES = {
  // AWS SES specific errors
  IDENTITY_NOT_VERIFIED: 'IDENTITY_NOT_VERIFIED',
  SENDING_QUOTA_EXCEEDED: 'SENDING_QUOTA_EXCEEDED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  BOUNCE_COMPLAINT: 'BOUNCE_COMPLAINT',
  SES_CONFIG_ERROR: 'SES_CONFIG_ERROR',
  
  // General email errors
  INVALID_EMAIL_ADDRESS: 'INVALID_EMAIL_ADDRESS',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  TEMPLATE_ERROR: 'TEMPLATE_ERROR',
  
  // System errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  TOKEN_GENERATION_ERROR: 'TOKEN_GENERATION_ERROR',
  
  // Rate limiting
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  
  // Unknown errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Classify email errors based on error messages and codes
 */
const classifyEmailError = (error) => {
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code || error.statusCode;

  // AWS SES specific errors
  if (errorMessage.includes('email address is not verified') || 
      errorMessage.includes('identities failed the check')) {
    return EMAIL_ERROR_TYPES.IDENTITY_NOT_VERIFIED;
  }
  
  if (errorMessage.includes('sending quota exceeded') || 
      errorCode === 'SendingQuotaExceeded') {
    return EMAIL_ERROR_TYPES.SENDING_QUOTA_EXCEEDED;
  }
  
  if (errorMessage.includes('throttling') || 
      errorMessage.includes('rate exceeded') ||
      errorCode === 'Throttling') {
    return EMAIL_ERROR_TYPES.RATE_LIMIT_EXCEEDED;
  }
  
  if (errorMessage.includes('bounce') || errorMessage.includes('complaint')) {
    return EMAIL_ERROR_TYPES.BOUNCE_COMPLAINT;
  }
  
  // Network and connection errors
  if (errorMessage.includes('network') || 
      errorMessage.includes('connection') ||
      errorMessage.includes('econnrefused') ||
      errorMessage.includes('enotfound')) {
    return EMAIL_ERROR_TYPES.NETWORK_ERROR;
  }
  
  if (errorMessage.includes('timeout') || 
      errorCode === 'ETIMEDOUT') {
    return EMAIL_ERROR_TYPES.TIMEOUT_ERROR;
  }
  
  // Validation errors
  if (errorMessage.includes('invalid email') || 
      errorMessage.includes('invalid format')) {
    return EMAIL_ERROR_TYPES.INVALID_EMAIL_ADDRESS;
  }
  
  // Database errors
  if (errorMessage.includes('user not found')) {
    return EMAIL_ERROR_TYPES.USER_NOT_FOUND;
  }
  
  // Rate limiting
  if (errorMessage.includes('too many requests') ||
      errorCode === 429) {
    return EMAIL_ERROR_TYPES.TOO_MANY_REQUESTS;
  }
  
  // AWS config errors
  if (errorMessage.includes('credentials') || 
      errorMessage.includes('access denied') ||
      errorMessage.includes('signature')) {
    return EMAIL_ERROR_TYPES.SES_CONFIG_ERROR;
  }
  
  return EMAIL_ERROR_TYPES.UNKNOWN_ERROR;
};

/**
 * Generate user-friendly error messages based on error type
 */
const generateUserFriendlyMessage = (errorType, originalError) => {
  const messages = {
    [EMAIL_ERROR_TYPES.IDENTITY_NOT_VERIFIED]: {
      user: 'Our email service is currently being configured. Please try again in a few minutes.',
      admin: 'The sender email address needs to be verified in AWS SES. Please verify the email address in the AWS console.',
      action: 'VERIFY_SENDER_EMAIL'
    },
    
    [EMAIL_ERROR_TYPES.SENDING_QUOTA_EXCEEDED]: {
      user: 'We\'re experiencing high email volume. Please try again in an hour.',
      admin: 'AWS SES daily sending quota has been exceeded. Consider requesting a quota increase.',
      action: 'REQUEST_QUOTA_INCREASE'
    },
    
    [EMAIL_ERROR_TYPES.RATE_LIMIT_EXCEEDED]: {
      user: 'Please wait a moment before requesting another verification email.',
      admin: 'AWS SES rate limit exceeded. Implement exponential backoff or request rate increase.',
      action: 'IMPLEMENT_BACKOFF'
    },
    
    [EMAIL_ERROR_TYPES.BOUNCE_COMPLAINT]: {
      user: 'There was an issue delivering the email. Please check your email address.',
      admin: 'Email bounced or received complaint. Check SES bounce/complaint handling.',
      action: 'CHECK_BOUNCE_HANDLING'
    },
    
    [EMAIL_ERROR_TYPES.INVALID_EMAIL_ADDRESS]: {
      user: 'Please check your email address and try again.',
      admin: 'Invalid email address format provided.',
      action: 'VALIDATE_EMAIL_FORMAT'
    },
    
    [EMAIL_ERROR_TYPES.NETWORK_ERROR]: {
      user: 'Connection issue detected. Please try again in a few moments.',
      admin: 'Network connectivity issue with AWS SES. Check internet connection and AWS service status.',
      action: 'CHECK_CONNECTIVITY'
    },
    
    [EMAIL_ERROR_TYPES.TIMEOUT_ERROR]: {
      user: 'Request timed out. Please try again.',
      admin: 'Email service request timed out. Consider increasing timeout values.',
      action: 'INCREASE_TIMEOUT'
    },
    
    [EMAIL_ERROR_TYPES.USER_NOT_FOUND]: {
      user: 'Account not found. Please register first.',
      admin: 'User record not found in database.',
      action: 'VERIFY_USER_EXISTS'
    },
    
    [EMAIL_ERROR_TYPES.TOO_MANY_REQUESTS]: {
      user: 'Too many requests. Please wait a moment before trying again.',
      admin: 'Rate limiting triggered. User is making too many verification requests.',
      action: 'IMPLEMENT_RATE_LIMITING'
    },
    
    [EMAIL_ERROR_TYPES.SES_CONFIG_ERROR]: {
      user: 'Email service configuration issue. Please contact support.',
      admin: 'AWS SES configuration error. Check credentials, region, and permissions.',
      action: 'CHECK_AWS_CONFIG'
    },
    
    [EMAIL_ERROR_TYPES.UNKNOWN_ERROR]: {
      user: 'An unexpected error occurred. Please try again or contact support.',
      admin: `Unknown error occurred: ${originalError?.message || 'No details available'}`,
      action: 'INVESTIGATE_ERROR'
    }
  };
  
  return messages[errorType] || messages[EMAIL_ERROR_TYPES.UNKNOWN_ERROR];
};

/**
 * Log email errors with appropriate detail level
 */
const logEmailError = (error, context = {}) => {
  const errorType = classifyEmailError(error);
  const errorDetails = generateUserFriendlyMessage(errorType, error);
  
  const logData = {
    errorType,
    errorMessage: error.message,
    errorCode: error.code || error.statusCode,
    stack: error.stack,
    context,
    adminMessage: errorDetails.admin,
    recommendedAction: errorDetails.action,
    timestamp: new Date().toISOString()
  };
  
  // Log with appropriate level based on error severity
  if ([EMAIL_ERROR_TYPES.SES_CONFIG_ERROR, EMAIL_ERROR_TYPES.SENDING_QUOTA_EXCEEDED].includes(errorType)) {
    logger.error('Critical email service error:', logData);
  } else if ([EMAIL_ERROR_TYPES.RATE_LIMIT_EXCEEDED, EMAIL_ERROR_TYPES.NETWORK_ERROR].includes(errorType)) {
    logger.warn('Email service warning:', logData);
  } else {
    logger.info('Email service info:', logData);
  }
  
  return { errorType, errorDetails };
};

/**
 * Handle email verification errors with automatic retry logic
 */
const handleEmailVerificationError = async (error, userData, verificationToken, retryCount = 0) => {
  const maxRetries = 3;
  const { errorType, errorDetails } = logEmailError(error, {
    userEmail: userData?.email,
    userId: userData?.id || userData?._id,
    retryCount,
    operation: 'email_verification'
  });
  
  // Determine if error is retryable
  const retryableErrors = [
    EMAIL_ERROR_TYPES.NETWORK_ERROR,
    EMAIL_ERROR_TYPES.TIMEOUT_ERROR,
    EMAIL_ERROR_TYPES.RATE_LIMIT_EXCEEDED
  ];
  
  const isRetryable = retryableErrors.includes(errorType) && retryCount < maxRetries;
  
  // Calculate retry delay with exponential backoff
  const getRetryDelay = (attempt) => {
    const baseDelay = 1000; // 1 second
    return baseDelay * Math.pow(2, attempt); // 1s, 2s, 4s, 8s...
  };
  
  const response = {
    success: false,
    errorType,
    userMessage: errorDetails.user,
    adminMessage: errorDetails.admin,
    recommendedAction: errorDetails.action,
    isRetryable,
    retryCount,
    maxRetries,
    retryAfter: isRetryable ? getRetryDelay(retryCount) : null
  };
  
  // Add specific guidance based on error type
  switch (errorType) {
    case EMAIL_ERROR_TYPES.IDENTITY_NOT_VERIFIED:
      response.instructions = [
        'Verify the sender email address in AWS SES console',
        'Ensure the email domain is properly configured',
        'Check if account is in sandbox mode'
      ];
      break;
      
    case EMAIL_ERROR_TYPES.SENDING_QUOTA_EXCEEDED:
      response.instructions = [
        'Request sending quota increase from AWS',
        'Monitor daily sending limits',
        'Implement email queuing system'
      ];
      break;
      
    case EMAIL_ERROR_TYPES.SES_CONFIG_ERROR:
      response.instructions = [
        'Verify AWS credentials in .env file',
        'Check AWS region configuration',
        'Ensure proper IAM permissions for SES'
      ];
      break;
      
    case EMAIL_ERROR_TYPES.TOO_MANY_REQUESTS:
      response.rateLimitInfo = {
        message: 'Rate limit exceeded for email verification',
        waitTime: response.retryAfter,
        dailyLimit: process.env.DAILY_EMAIL_LIMIT || 'Not configured'
      };
      break;
  }
  
  return response;
};

/**
 * Enhanced email service wrapper with error handling
 */
const sendEmailWithErrorHandling = async (emailService, emailData, context = {}) => {
  const startTime = Date.now();
  
  try {
    logger.info('Attempting to send email:', {
      to: emailData.to,
      subject: emailData.subject,
      context
    });
    
    const result = await emailService.sendEmail(emailData);
    
    if (result.success) {
      logger.info('Email sent successfully:', {
        to: emailData.to,
        subject: emailData.subject,
        messageId: result.messageId,
        duration: Date.now() - startTime,
        context
      });
    }
    
    return result;
    
  } catch (error) {
    const errorHandling = await handleEmailVerificationError(
      error,
      { email: emailData.to },
      null,
      context.retryCount || 0
    );
    
    return {
      success: false,
      error: error.message,
      errorHandling,
      duration: Date.now() - startTime
    };
  }
};

/**
 * Validate email address format and deliverability
 */
const validateEmailAddress = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const disposableEmailDomains = [
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'tempmail.org',
    'throawaymail.com'
  ];
  
  const validation = {
    isValid: false,
    issues: [],
    recommendations: []
  };
  
  if (!email || typeof email !== 'string') {
    validation.issues.push('Email is required');
    return validation;
  }
  
  if (!emailRegex.test(email)) {
    validation.issues.push('Invalid email format');
    validation.recommendations.push('Please enter a valid email address');
    return validation;
  }
  
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (disposableEmailDomains.includes(domain)) {
    validation.issues.push('Disposable email address detected');
    validation.recommendations.push('Please use a permanent email address');
    return validation;
  }
  
  validation.isValid = true;
  return validation;
};

module.exports = {
  EMAIL_ERROR_TYPES,
  classifyEmailError,
  generateUserFriendlyMessage,
  logEmailError,
  handleEmailVerificationError,
  sendEmailWithErrorHandling,
  validateEmailAddress
};