const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');

// Common validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Update user profile validation
const validateUpdateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[A-Za-z\s.'-]+$/)
    .withMessage('Name can only contain letters, spaces, periods, hyphens and apostrophes'),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),

  body('role')
    .optional()
    .isIn(['user', 'veterinarian', 'admin', 'staff'])
    .withMessage('Role must be one of: user, veterinarian, admin, staff'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  body('isEmailVerified')
    .optional()
    .isBoolean()
    .withMessage('isEmailVerified must be a boolean'),

  // Location validation
  body('location.state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters')
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('State can only contain letters and spaces'),

  body('location.district')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('District must be between 2 and 50 characters')
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('District can only contain letters and spaces'),

  body('location.village')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Village must be between 2 and 50 characters')
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('Village can only contain letters and spaces'),

  body('location.coordinates.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('location.coordinates.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  // Preferences validation
  body('preferences.language')
    .optional()
    .isIn(['en', 'hi', 'bn', 'te', 'ta', 'gu', 'kn', 'ml', 'or', 'pa', 'mr', 'ur'])
    .withMessage('Invalid language preference'),

  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification preference must be a boolean'),

  body('preferences.notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notification preference must be a boolean'),

  body('preferences.notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notification preference must be a boolean'),

  handleValidationErrors
];

// Change user role validation
const validateChangeUserRole = [
  body('role')
    .isIn(['user', 'veterinarian', 'admin', 'staff'])
    .withMessage('Role must be one of: user, veterinarian, admin, staff'),

  handleValidationErrors
];

// Bulk update users validation
const validateBulkUpdateUsers = [
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('User IDs array is required and must contain at least one ID'),

  body('userIds.*')
    .isMongoId()
    .withMessage('Each user ID must be a valid MongoDB ObjectId'),

  body('updates')
    .isObject()
    .withMessage('Updates object is required'),

  body('updates.role')
    .optional()
    .isIn(['user', 'veterinarian', 'admin', 'staff'])
    .withMessage('Role must be one of: user, veterinarian, admin, staff'),

  body('updates.isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  body('updates.isEmailVerified')
    .optional()
    .isBoolean()
    .withMessage('isEmailVerified must be a boolean'),

  handleValidationErrors
];

// Query parameters validation for getting users
const validateGetUsers = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('role')
    .optional()
    .isIn(['user', 'veterinarian', 'admin', 'staff'])
    .withMessage('Role must be one of: user, veterinarian, admin, staff'),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  query('isEmailVerified')
    .optional()
    .isBoolean()
    .withMessage('isEmailVerified must be a boolean'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search term must be between 2 and 100 characters'),

  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO date'),

  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO date'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'name', 'email', 'role', 'lastLogin'])
    .withMessage('SortBy must be one of: createdAt, name, email, role, lastLogin'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('SortOrder must be asc or desc'),

  handleValidationErrors
];

// Statistics query validation
const validateGetUserStatistics = [
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO date'),

  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO date'),

  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),

  handleValidationErrors
];

// User preferences update validation
const validateUpdateUserPreferences = [
  body('preferences.language')
    .optional()
    .isIn(['en', 'hi', 'bn', 'te', 'ta', 'gu', 'kn', 'ml', 'or', 'pa', 'mr', 'ur'])
    .withMessage('Invalid language preference'),

  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Theme must be one of: light, dark, auto'),

  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification preference must be a boolean'),

  body('preferences.notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notification preference must be a boolean'),

  body('preferences.notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notification preference must be a boolean'),

  body('preferences.notifications.alerts')
    .optional()
    .isBoolean()
    .withMessage('Alerts notification preference must be a boolean'),

  body('preferences.notifications.veterinarian')
    .optional()
    .isBoolean()
    .withMessage('Veterinarian notification preference must be a boolean'),

  body('preferences.notifications.newsletter')
    .optional()
    .isBoolean()
    .withMessage('Newsletter preference must be a boolean'),

  body('preferences.privacy.profileVisibility')
    .optional()
    .isIn(['public', 'private', 'registered_users'])
    .withMessage('Profile visibility must be one of: public, private, registered_users'),

  body('preferences.privacy.showLocation')
    .optional()
    .isBoolean()
    .withMessage('Show location preference must be a boolean'),

  body('preferences.privacy.showPhone')
    .optional()
    .isBoolean()
    .withMessage('Show phone preference must be a boolean'),

  body('preferences.privacy.allowMessages')
    .optional()
    .isBoolean()
    .withMessage('Allow messages preference must be a boolean'),

  handleValidationErrors
];

// Admin action validation (for audit log)
const validateAdminAction = [
  body('action')
    .isIn([
      'user_created', 'user_updated', 'user_deleted', 'user_activated', 'user_deactivated',
      'role_changed', 'bulk_update', 'account_locked', 'account_unlocked'
    ])
    .withMessage('Invalid admin action type'),

  body('targetUserId')
    .optional()
    .isMongoId()
    .withMessage('Target user ID must be a valid MongoDB ObjectId'),

  body('details')
    .optional()
    .isObject()
    .withMessage('Action details must be an object'),

  handleValidationErrors
];

module.exports = {
  validateUpdateUser,
  validateChangeUserRole,
  validateBulkUpdateUsers,
  validateGetUsers,
  validateGetUserStatistics,
  validateObjectId,
  validateUpdateUserPreferences,
  validateAdminAction,
  handleValidationErrors
};