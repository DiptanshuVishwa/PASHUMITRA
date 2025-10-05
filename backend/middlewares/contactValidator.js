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

// Submit contact form validation
const validateSubmitContact = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[A-Za-z\s.'-]+$/)
    .withMessage('Name can only contain letters, spaces, periods, hyphens and apostrophes'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),

  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),

  body('message')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Message must be between 20 and 2000 characters'),

  body('category')
    .isIn([
      'general',
      'technical_support',
      'veterinary_consultation',
      'feedback',
      'complaint',
      'feature_request',
      'bug_report',
      'account_issue',
      'billing',
      'partnership'
    ])
    .withMessage('Invalid category selected'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),

  // Location fields (optional)
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

  body('location.city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters')
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('City can only contain letters and spaces'),

  // Related alert (optional)
  body('relatedAlert')
    .optional()
    .isMongoId()
    .withMessage('Invalid alert ID'),

  handleValidationErrors
];

// Update contact validation (admin only)
const validateUpdateContact = [
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed'])
    .withMessage('Status must be one of: open, in_progress, resolved, closed'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),

  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID for assignment'),

  body('category')
    .optional()
    .isIn([
      'general',
      'technical_support',
      'veterinary_consultation',
      'feedback',
      'complaint',
      'feature_request',
      'bug_report',
      'account_issue',
      'billing',
      'partnership'
    ])
    .withMessage('Invalid category selected'),

  body('followUp.required')
    .optional()
    .isBoolean()
    .withMessage('Follow-up required must be a boolean'),

  body('followUp.scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Follow-up scheduled date must be a valid ISO date'),

  body('followUp.notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Follow-up notes cannot exceed 500 characters'),

  handleValidationErrors
];

// Add response validation
const validateAddResponse = [
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Response message must be between 10 and 2000 characters'),

  body('isInternal')
    .optional()
    .isBoolean()
    .withMessage('isInternal must be a boolean'),

  handleValidationErrors
];

// Resolve contact validation
const validateResolveContact = [
  body('resolutionNotes')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Resolution notes must be between 10 and 1000 characters'),

  handleValidationErrors
];

// Query parameters validation for getting contacts
const validateGetContacts = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed'])
    .withMessage('Status must be one of: open, in_progress, resolved, closed'),

  query('category')
    .optional()
    .isIn([
      'general',
      'technical_support',
      'veterinary_consultation',
      'feedback',
      'complaint',
      'feature_request',
      'bug_report',
      'account_issue',
      'billing',
      'partnership'
    ])
    .withMessage('Invalid category'),

  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),

  query('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),

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
    .isIn(['createdAt', 'priority', 'status', 'category', 'lastActivityAt'])
    .withMessage('SortBy must be one of: createdAt, priority, status, category, lastActivityAt'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('SortOrder must be asc or desc'),

  handleValidationErrors
];

// Statistics query validation
const validateGetStatistics = [
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO date'),

  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO date'),

  query('category')
    .optional()
    .isIn([
      'general',
      'technical_support',
      'veterinary_consultation',
      'feedback',
      'complaint',
      'feature_request',
      'bug_report',
      'account_issue',
      'billing',
      'partnership'
    ])
    .withMessage('Invalid category'),

  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid contact ID'),

  handleValidationErrors
];

// Satisfaction rating validation
const validateSatisfactionRating = [
  body('satisfactionRating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Satisfaction rating must be between 1 and 5'),

  body('satisfactionFeedback')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Satisfaction feedback cannot exceed 500 characters'),

  handleValidationErrors
];

module.exports = {
  validateSubmitContact,
  validateUpdateContact,
  validateAddResponse,
  validateResolveContact,
  validateGetContacts,
  validateGetStatistics,
  validateObjectId,
  validateSatisfactionRating,
  handleValidationErrors
};