const { body, query, param, validationResult } = require('express-validator');
const path = require('path');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));
    
    console.log('File upload validation errors:', extractedErrors);
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors
    });
  }
  
  return next();
};

// File upload validation
const validateFileUpload = [
  body('category')
    .optional()
    .isIn(['image', 'document', 'video', 'audio', 'general'])
    .withMessage('Category must be one of: image, document, video, audio, general'),
    
  body('description')
    .optional()
    .isLength({ min: 0, max: 1000 })
    .trim()
    .withMessage('Description cannot exceed 1000 characters'),
    
  body('tags')
    .optional()
    .custom((value) => {
      if (value && typeof value === 'string') {
        // Parse comma-separated tags
        const tags = value.split(',').map(tag => tag.trim());
        if (tags.length > 10) {
          throw new Error('Cannot have more than 10 tags');
        }
        if (tags.some(tag => tag.length > 50)) {
          throw new Error('Each tag cannot exceed 50 characters');
        }
      }
      return true;
    }),

  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value'),

  body('expiresIn')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Expiration must be between 1 and 365 days'),
    
  handleValidationErrors
];

// Multiple file upload validation
const validateMultipleFileUpload = [
  body('category')
    .optional()
    .isIn(['image', 'document', 'video', 'audio', 'general'])
    .withMessage('Category must be one of: image, document, video, audio, general'),
    
  body('description')
    .optional()
    .isLength({ min: 0, max: 1000 })
    .trim()
    .withMessage('Description cannot exceed 1000 characters'),
    
  body('maxFiles')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Maximum files must be between 1 and 10'),
    
  handleValidationErrors
];

// File list query validation
const validateFileQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('category')
    .optional()
    .isIn(['image', 'document', 'video', 'audio', 'general'])
    .withMessage('Category must be one of: image, document, video, audio, general'),
    
  query('mimetype')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Mimetype must be a string between 1 and 100 characters'),
    
  query('uploadedBy')
    .optional()
    .isMongoId()
    .withMessage('UploadedBy must be a valid MongoDB ObjectId'),
    
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('DateFrom must be a valid ISO date'),
    
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('DateTo must be a valid ISO date')
    .custom((value, { req }) => {
      if (value && req.query.dateFrom) {
        const dateFrom = new Date(req.query.dateFrom);
        const dateTo = new Date(value);
        if (dateFrom >= dateTo) {
          throw new Error('DateTo must be after DateFrom');
        }
      }
      return true;
    }),
    
  query('search')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage('Search must be a string between 1 and 100 characters'),
    
  query('sortBy')
    .optional()
    .isIn(['originalName', 'filename', 'size', 'uploadDate', 'category', 'mimetype'])
    .withMessage('SortBy must be one of: originalName, filename, size, uploadDate, category, mimetype'),
    
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('SortOrder must be either asc or desc'),
    
  handleValidationErrors
];

// File ID validation
const validateFileId = [
  param('id')
    .isMongoId()
    .withMessage('File ID must be a valid MongoDB ObjectId'),
    
  handleValidationErrors
];

// File permission update validation
const validateFilePermissions = [
  param('id')
    .isMongoId()
    .withMessage('File ID must be a valid MongoDB ObjectId'),
    
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value'),
    
  body('allowedRoles')
    .optional()
    .isArray()
    .withMessage('allowedRoles must be an array')
    .custom((roles) => {
      const validRoles = ['user', 'veterinarian', 'admin', 'staff'];
      const invalidRoles = roles.filter(role => !validRoles.includes(role));
      if (invalidRoles.length > 0) {
        throw new Error(`Invalid roles: ${invalidRoles.join(', ')}`);
      }
      return true;
    }),
    
  body('allowedUsers')
    .optional()
    .isArray()
    .withMessage('allowedUsers must be an array')
    .custom((users) => {
      const mongoose = require('mongoose');
      const invalidUsers = users.filter(userId => !mongoose.Types.ObjectId.isValid(userId));
      if (invalidUsers.length > 0) {
        throw new Error('All user IDs must be valid MongoDB ObjectIds');
      }
      return true;
    }),
    
  handleValidationErrors
];

// File metadata update validation
const validateFileMetadata = [
  param('id')
    .isMongoId()
    .withMessage('File ID must be a valid MongoDB ObjectId'),
    
  body('description')
    .optional()
    .isLength({ min: 0, max: 1000 })
    .trim()
    .withMessage('Description cannot exceed 1000 characters'),
    
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags.length > 10) {
        throw new Error('Cannot have more than 10 tags');
      }
      if (tags.some(tag => typeof tag !== 'string' || tag.length > 50)) {
        throw new Error('Each tag must be a string and cannot exceed 50 characters');
      }
      return true;
    }),
    
  body('category')
    .optional()
    .isIn(['image', 'document', 'video', 'audio', 'general'])
    .withMessage('Category must be one of: image, document, video, audio, general'),
    
  handleValidationErrors
];

// Custom middleware to validate file types
const validateFileType = (allowedTypes = []) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files || [req.file];
    
    for (const file of files) {
      const extension = path.extname(file.originalname).toLowerCase();
      
      if (allowedTypes.length > 0 && !allowedTypes.includes(extension)) {
        return res.status(400).json({
          success: false,
          message: `File type ${extension} not allowed. Allowed types: ${allowedTypes.join(', ')}`
        });
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: `File ${file.originalname} exceeds size limit of 10MB`
        });
      }

      // Basic security check - reject executable files
      const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.js', '.jar', '.sh'];
      if (dangerousExtensions.includes(extension)) {
        return res.status(400).json({
          success: false,
          message: `File type ${extension} is not allowed for security reasons`
        });
      }
    }

    next();
  };
};

// Custom middleware to validate file content
const validateFileContent = (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  const files = req.files || [req.file];
  
  for (const file of files) {
    // Check if file has content
    if (!file.size || file.size === 0) {
      return res.status(400).json({
        success: false,
        message: `File ${file.originalname} is empty`
      });
    }

    // Check filename length
    if (file.originalname.length > 255) {
      return res.status(400).json({
        success: false,
        message: `Filename ${file.originalname} is too long (max 255 characters)`
      });
    }

    // Check for suspicious filenames
    const suspiciousPatterns = [
      /\.\./,  // Path traversal
      /[<>:"|?*]/,  // Windows invalid characters
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i  // Windows reserved names
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(file.originalname))) {
      return res.status(400).json({
        success: false,
        message: `Filename ${file.originalname} contains invalid characters`
      });
    }
  }

  next();
};

// Statistics query validation
const validateStatsQuery = [
  query('period')
    .optional()
    .isIn(['week', 'month', 'quarter', 'year'])
    .withMessage('Period must be one of: week, month, quarter, year'),
    
  query('category')
    .optional()
    .isIn(['image', 'document', 'video', 'audio', 'general'])
    .withMessage('Category must be one of: image, document, video, audio, general'),
    
  query('detailed')
    .optional()
    .isBoolean()
    .withMessage('Detailed must be a boolean value'),
    
  handleValidationErrors
];

module.exports = {
  validateFileUpload,
  validateMultipleFileUpload,
  validateFileQuery,
  validateFileId,
  validateFilePermissions,
  validateFileMetadata,
  validateFileType,
  validateFileContent,
  validateStatsQuery,
  handleValidationErrors
};