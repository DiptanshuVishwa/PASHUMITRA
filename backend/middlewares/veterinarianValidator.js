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

// Create veterinarian validation
const validateCreateVeterinarian = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[A-Za-z\s.]+$/)
    .withMessage('Name can only contain letters, spaces, and periods'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),

  body('registrationNumber')
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('Registration number must be between 5 and 20 characters')
    .matches(/^[A-Z0-9\-/]+$/)
    .withMessage('Registration number can only contain uppercase letters, numbers, hyphens, and forward slashes'),

  body('specialization')
    .isArray({ min: 1 })
    .withMessage('At least one specialization must be selected')
    .custom((specializations) => {
      const validSpecializations = [
        'large_animal', 'small_animal', 'poultry', 'aquaculture', 'wildlife',
        'dairy_cattle', 'beef_cattle', 'swine', 'sheep_goat', 'equine',
        'surgery', 'reproduction', 'pathology', 'public_health', 'nutrition',
        'general_practice'
      ];
      
      for (const spec of specializations) {
        if (!validSpecializations.includes(spec)) {
          throw new Error(`Invalid specialization: ${spec}`);
        }
      }
      return true;
    }),

  body('experience')
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience must be between 0 and 50 years'),

  body('qualifications')
    .isArray({ min: 1 })
    .withMessage('At least one qualification must be provided'),

  body('qualifications.*.degree')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Qualification degree must be between 2 and 100 characters'),

  body('qualifications.*.institution')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Institution name must be between 2 and 200 characters'),

  body('qualifications.*.year')
    .isInt({ min: 1950, max: new Date().getFullYear() })
    .withMessage('Year must be between 1950 and current year'),

  // Location validation
  body('location.address')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),

  body('location.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters')
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('City can only contain letters and spaces'),

  body('location.district')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('District must be between 2 and 50 characters')
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('District can only contain letters and spaces'),

  body('location.state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters')
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('State can only contain letters and spaces'),

  body('location.pincode')
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be a 6-digit number'),

  body('location.coordinates')
    .optional()
    .custom((coordinates) => {
      if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        throw new Error('Coordinates must be an array of [longitude, latitude]');
      }
      const [lng, lat] = coordinates;
      if (lng < -180 || lng > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      if (lat < -90 || lat > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      return true;
    }),

  // Services validation
  body('services')
    .optional()
    .isArray()
    .withMessage('Services must be an array'),

  body('services.*.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2 and 100 characters'),

  body('services.*.description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Service description must be between 10 and 500 characters'),

  body('services.*.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Service price must be a positive number'),

  // Availability validation
  body('availability.status')
    .optional()
    .isIn(['available', 'unavailable', 'busy'])
    .withMessage('Availability status must be available, unavailable, or busy'),

  body('availability.emergencyAvailable')
    .optional()
    .isBoolean()
    .withMessage('Emergency availability must be a boolean'),

  body('bio')
    .optional()
    .trim()
    .isLength({ min: 50, max: 1000 })
    .withMessage('Bio must be between 50 and 1000 characters'),

  handleValidationErrors
];

// Update veterinarian validation (all fields optional)
const validateUpdateVeterinarian = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[A-Za-z\s.]+$/)
    .withMessage('Name can only contain letters, spaces, and periods'),

  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),

  body('specialization')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one specialization must be selected')
    .custom((specializations) => {
      const validSpecializations = [
        'large_animal', 'small_animal', 'poultry', 'aquaculture', 'wildlife',
        'dairy_cattle', 'beef_cattle', 'swine', 'sheep_goat', 'equine',
        'surgery', 'reproduction', 'pathology', 'public_health', 'nutrition',
        'general_practice'
      ];
      
      for (const spec of specializations) {
        if (!validSpecializations.includes(spec)) {
          throw new Error(`Invalid specialization: ${spec}`);
        }
      }
      return true;
    }),

  body('experience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience must be between 0 and 50 years'),

  body('bio')
    .optional()
    .trim()
    .isLength({ min: 50, max: 1000 })
    .withMessage('Bio must be between 50 and 1000 characters'),

  body('location.city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),

  body('services')
    .optional()
    .isArray()
    .withMessage('Services must be an array'),

  handleValidationErrors
];

// Availability update validation
const validateUpdateAvailability = [
  body('status')
    .optional()
    .isIn(['available', 'unavailable', 'busy'])
    .withMessage('Status must be available, unavailable, or busy'),

  body('emergencyAvailable')
    .optional()
    .isBoolean()
    .withMessage('Emergency availability must be a boolean'),

  body('schedule')
    .optional()
    .custom((schedule) => {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      for (const day in schedule) {
        if (!days.includes(day.toLowerCase())) {
          throw new Error(`Invalid day: ${day}`);
        }
        
        const daySchedule = schedule[day];
        if (typeof daySchedule !== 'object') {
          throw new Error(`Schedule for ${day} must be an object`);
        }
        
        if (daySchedule.isWorking && (!daySchedule.startTime || !daySchedule.endTime)) {
          throw new Error(`Working hours required for ${day} when isWorking is true`);
        }
      }
      return true;
    }),

  handleValidationErrors
];

// Rating validation
const validateAddRating = [
  body('rating')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment must not exceed 500 characters'),

  handleValidationErrors
];

// Query parameters validation for getting veterinarians
const validateGetVeterinarians = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('specialization')
    .optional()
    .custom((specialization) => {
      const validSpecializations = [
        'large_animal', 'small_animal', 'poultry', 'aquaculture', 'wildlife',
        'dairy_cattle', 'beef_cattle', 'swine', 'sheep_goat', 'equine',
        'surgery', 'reproduction', 'pathology', 'public_health', 'nutrition',
        'general_practice'
      ];
      
      if (!validSpecializations.includes(specialization)) {
        throw new Error('Invalid specialization');
      }
      return true;
    }),

  query('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean'),

  query('availabilityStatus')
    .optional()
    .isIn(['available', 'unavailable', 'busy'])
    .withMessage('Availability status must be available, unavailable, or busy'),

  query('sortBy')
    .optional()
    .isIn(['rating.average', 'experience', 'createdAt', 'name'])
    .withMessage('sortBy must be one of: rating.average, experience, createdAt, name'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be asc or desc'),

  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  query('radius')
    .optional()
    .isInt({ min: 1000, max: 100000 })
    .withMessage('Radius must be between 1000m and 100000m'),

  handleValidationErrors
];

// Nearby veterinarians validation
const validateNearbyVeterinarians = [
  query('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude is required and must be between -90 and 90'),

  query('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude is required and must be between -180 and 180'),

  query('radius')
    .optional()
    .isInt({ min: 1000, max: 100000 })
    .withMessage('Radius must be between 1000m and 100000m'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),

  query('specialization')
    .optional()
    .custom((specialization) => {
      const validSpecializations = [
        'large_animal', 'small_animal', 'poultry', 'aquaculture', 'wildlife',
        'dairy_cattle', 'beef_cattle', 'swine', 'sheep_goat', 'equine',
        'surgery', 'reproduction', 'pathology', 'public_health', 'nutrition',
        'general_practice'
      ];
      
      if (!validSpecializations.includes(specialization)) {
        throw new Error('Invalid specialization');
      }
      return true;
    }),

  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid veterinarian ID'),

  handleValidationErrors
];

module.exports = {
  validateCreateVeterinarian,
  validateUpdateVeterinarian,
  validateUpdateAvailability,
  validateAddRating,
  validateGetVeterinarians,
  validateNearbyVeterinarians,
  validateObjectId,
  handleValidationErrors
};