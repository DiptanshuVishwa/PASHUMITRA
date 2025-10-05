const { body, param, query, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    // Enhanced logging for alert validation failures
    const logData = {
      ip: req.ip,
      endpoint: `${req.method} ${req.path}`,
      errors: errorMessages,
      userId: req.user?._id,
      userAgent: req.headers['user-agent']
    };

    // For alert creation failures, include full request body (sanitized)
    if (req.path.includes('/alerts') && req.method === 'POST') {
      logData.requestBody = {
        ...req.body,
        // Don't log sensitive data
        password: req.body.password ? '[REDACTED]' : undefined
      };
      logData.validationContext = 'ALERT_CREATION';
    }

    // Enhanced logging with full details
    logger.warn('========== VALIDATION FAILED ==========');
    logger.warn('Endpoint:', `${req.method} ${req.path}`);
    logger.warn('User ID:', req.user?._id);
    logger.warn('Validation Errors:', JSON.stringify(errorMessages, null, 2));
    if (req.path.includes('/alerts') && req.method === 'POST') {
      logger.warn('Request Body:', JSON.stringify(req.body, null, 2));
    }
    logger.warn('=========================================');
    
    // Also log using the original format
    logger.warn('Validation failed:', logData);
    
    // Backup console logging for immediate visibility
    console.log('\n========== VALIDATION ERROR DEBUG ==========');
    console.log('Errors:', errorMessages);
    console.log('Request Body:', req.body);
    console.log('==========================================\n');

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages,
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          receivedData: req.body,
          validationErrors: errors.array()
        }
      })
    });
  }
  
  next();
};

// User registration validation
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email is too long'),

  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),

  body('role')
    .optional()
    .isIn(['user', 'admin', 'veterinarian'])
    .withMessage('Role must be user, admin, or veterinarian'),

  body('location.state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),

  body('location.district')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('District must be between 2 and 100 characters'),

  body('location.village')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Village name is too long'),

  body('location.pincode')
    .optional()
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be a 6-digit number'),

  body('location.coordinates.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('location.coordinates.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

// Password reset request validation
const validateForgotPassword = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address'),

  handleValidationErrors
];

// Password reset validation
const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),

  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  handleValidationErrors
];

// Update profile validation
const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),

  body('location.state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),

  body('location.district')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('District must be between 2 and 100 characters'),

  body('location.village')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Village name is too long'),

  body('location.pincode')
    .optional()
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be a 6-digit number'),

  body('location.coordinates.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('location.coordinates.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('preferences.language')
    .optional()
    .isIn(['en', 'hi', 'bn', 'te', 'ta', 'gu', 'kn', 'ml', 'or'])
    .withMessage('Invalid language selection'),

  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Theme must be light or dark'),

  handleValidationErrors
];

// Change password validation
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('New password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),

  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage(`Invalid ${paramName} format`),

  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be a positive integer between 1 and 1000'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a positive integer between 1 and 100'),

  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'name', '-name'])
    .withMessage('Invalid sort parameter'),

  handleValidationErrors
];

// Search validation
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .escape(), // Escape HTML characters for security

  query('category')
    .optional()
    .isAlpha()
    .withMessage('Category must contain only letters'),

  handleValidationErrors
];

// Email verification validation
const validateEmailVerification = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required')
    .isLength({ min: 40, max: 40 })
    .withMessage('Invalid verification token format'),

  handleValidationErrors
];

// Resend verification email validation
const validateResendVerification = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address'),

  handleValidationErrors
];

// Custom validation for file uploads
const validateFileUpload = (allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const files = req.files || [req.file];
    
    for (const file of files) {
      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
        });
      }

      // Check file size
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File size ${file.size} bytes exceeds maximum allowed size of ${maxSize} bytes`
        });
      }
    }

    next();
  };
};

// Alert creation validation
const validateCreateAlert = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Alert title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Alert description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),

  body('category')
    .isIn(['disease', 'injury', 'death', 'vaccination', 'general'])
    .withMessage('Category must be one of: disease, injury, death, vaccination, general'),

  body('severity')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Severity must be one of: low, medium, high, critical'),

  body('location.state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),

  body('location.district')
    .trim()
    .notEmpty()
    .withMessage('District is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('District must be between 2 and 100 characters'),

  body('location.coordinates.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('location.coordinates.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('affectedAnimals.species')
    .optional()
    .isIn(['cattle', 'buffalo', 'goat', 'sheep', 'pig', 'poultry', 'other'])
    .withMessage('Species must be one of: cattle, buffalo, goat, sheep, pig, poultry, other'),

  body('affectedAnimals.count')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Animal count must be between 1 and 10,000'),

  body('affectedAnimals.symptoms')
    .optional()
    .isArray()
    .withMessage('Symptoms must be an array')
    .custom((symptoms) => {
      if (symptoms && symptoms.length > 10) {
        throw new Error('Cannot have more than 10 symptoms');
      }
      return true;
    }),

  handleValidationErrors
];

// Alert update validation
const validateUpdateAlert = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),

  body('category')
    .optional()
    .isIn(['disease', 'injury', 'death', 'vaccination', 'general'])
    .withMessage('Category must be one of: disease, injury, death, vaccination, general'),

  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Severity must be one of: low, medium, high, critical'),

  body('status')
    .optional()
    .isIn(['active', 'investigating', 'resolved', 'closed'])
    .withMessage('Status must be one of: active, investigating, resolved, closed'),

  handleValidationErrors
];

// Alert comment validation
const validateAlertComment = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),

  handleValidationErrors
];

// Alert action validation
const validateAlertAction = [
  body('type')
    .isIn(['investigation_started', 'sample_collected', 'treatment_given', 'resolved', 'escalated'])
    .withMessage('Action type must be one of: investigation_started, sample_collected, treatment_given, resolved, escalated'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Action description cannot exceed 500 characters'),

  handleValidationErrors
];

// Veterinarian validation
const validateCreateVeterinarian = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Veterinarian name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('phone')
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),

  body('registrationNumber')
    .trim()
    .notEmpty()
    .withMessage('Registration number is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Registration number must be between 3 and 50 characters'),

  body('specialization')
    .isArray({ min: 1 })
    .withMessage('At least one specialization is required')
    .custom((specializations) => {
      const validSpecializations = [
        'large_animal', 'small_animal', 'poultry', 'aquaculture', 'wildlife',
        'dairy_cattle', 'beef_cattle', 'swine', 'sheep_goat', 'equine',
        'surgery', 'reproduction', 'pathology', 'public_health', 'nutrition', 'general_practice'
      ];
      
      for (const spec of specializations) {
        if (!validSpecializations.includes(spec)) {
          throw new Error(`Invalid specialization: ${spec}`);
        }
      }
      return true;
    }),

  body('experience')
    .isInt({ min: 0, max: 60 })
    .withMessage('Experience must be between 0 and 60 years'),

  body('location.coordinates.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('location.coordinates.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  handleValidationErrors
];

// Contact form validation
const validateContactForm = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),

  body('category')
    .isIn([
      'general', 'technical_support', 'veterinary_consultation',
      'feedback', 'complaint', 'feature_request', 'bug_report',
      'account_issue', 'billing', 'partnership'
    ])
    .withMessage('Invalid category'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),

  handleValidationErrors
];

// Rate limiting validation (check if user is within rate limits)
const validateRateLimit = (identifier = 'ip') => {
  return (req, res, next) => {
    // This would integrate with a rate limiting service or Redis
    // For now, just pass through
    next();
  };
};

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile,
  validateChangePassword,
  validateObjectId,
  validatePagination,
  validateSearch,
  validateEmailVerification,
  validateResendVerification,
  validateFileUpload,
  validateRateLimit,
  validateCreateAlert,
  validateUpdateAlert,
  validateAlertComment,
  validateAlertAction,
  validateCreateVeterinarian,
  validateContactForm
};
