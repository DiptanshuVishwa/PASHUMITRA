const { body, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));
    
    console.log('Dashboard validation errors:', extractedErrors);
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors
    });
  }
  
  return next();
};

// Validation for user analytics query parameters
const validateUserAnalytics = [
  query('period')
    .optional()
    .isIn(['1month', '3months', '6months', '1year'])
    .withMessage('Period must be one of: 1month, 3months, 6months, 1year'),
    
  query('groupBy')
    .optional()
    .isIn(['day', 'month'])
    .withMessage('GroupBy must be either day or month'),
    
  handleValidationErrors
];

// Validation for contact analytics query parameters  
const validateContactAnalytics = [
  query('period')
    .optional()
    .isIn(['1month', '3months', '6months', '1year'])
    .withMessage('Period must be one of: 1month, 3months, 6months, 1year'),
    
  query('groupBy')
    .optional()
    .isIn(['day', 'month'])
    .withMessage('GroupBy must be either day or month'),
    
  handleValidationErrors
];

// Validation for system metrics query parameters
const validateSystemMetrics = [
  query('includeDetails')
    .optional()
    .isBoolean()
    .withMessage('Include details must be a boolean value'),
    
  query('refreshCache')
    .optional()
    .isBoolean()
    .withMessage('Refresh cache must be a boolean value'),
    
  handleValidationErrors
];

// Validation for real-time data query parameters
const validateRealTimeData = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
    
  query('includeActivities')
    .optional()
    .isBoolean()
    .withMessage('Include activities must be a boolean value'),
    
  handleValidationErrors
];

// Validation for export dashboard data
const validateExportDashboardData = [
  query('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage('Format must be either json or csv'),
    
  query('type')
    .optional()
    .isIn(['overview', 'users', 'contacts'])
    .withMessage('Type must be one of: overview, users, contacts'),
    
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO date'),
    
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO date'),
    
  query('includeDetails')
    .optional()
    .isBoolean()
    .withMessage('Include details must be a boolean value'),
    
  handleValidationErrors
];

// Validation for date range queries (common for many endpoints)
const validateDateRange = [
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO date')
    .custom((value, { req }) => {
      if (value && req.query.dateTo) {
        const dateFrom = new Date(value);
        const dateTo = new Date(req.query.dateTo);
        if (dateFrom >= dateTo) {
          throw new Error('Date from must be earlier than date to');
        }
      }
      return true;
    }),
    
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO date')
    .custom((value) => {
      if (value) {
        const dateTo = new Date(value);
        const now = new Date();
        if (dateTo > now) {
          throw new Error('Date to cannot be in the future');
        }
      }
      return true;
    }),
    
  handleValidationErrors
];

// Validation for overview query parameters
const validateOverview = [
  query('includeCharts')
    .optional()
    .isBoolean()
    .withMessage('Include charts must be a boolean value'),
    
  query('timeZone')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Time zone must be a valid string between 1 and 50 characters'),
    
  handleValidationErrors
];

// Custom validation for complex analytics queries
const validateAdvancedAnalytics = [
  query('metrics')
    .optional()
    .isArray()
    .withMessage('Metrics must be an array')
    .custom((value) => {
      if (value) {
        const validMetrics = [
          'user_growth',
          'contact_volume', 
          'resolution_rate',
          'response_time',
          'category_distribution',
          'geographic_distribution',
          'role_activity'
        ];
        
        const invalidMetrics = value.filter(metric => !validMetrics.includes(metric));
        if (invalidMetrics.length > 0) {
          throw new Error(`Invalid metrics: ${invalidMetrics.join(', ')}. Valid options are: ${validMetrics.join(', ')}`);
        }
      }
      return true;
    }),
    
  query('aggregation')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'quarterly'])
    .withMessage('Aggregation must be one of: daily, weekly, monthly, quarterly'),
    
  query('comparison')
    .optional()
    .isBoolean()
    .withMessage('Comparison must be a boolean value'),
    
  handleValidationErrors
];

// Validation for filtering and pagination (reusable)
const validateFilterAndPagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('sortBy')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Sort by must be a string between 1 and 50 characters'),
    
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),
    
  query('search')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage('Search must be a string between 1 and 100 characters'),
    
  handleValidationErrors
];

// Validation for specific dashboard widgets
const validateWidgetData = [
  query('widget')
    .notEmpty()
    .isIn([
      'user_stats',
      'contact_stats', 
      'system_health',
      'recent_activity',
      'performance_metrics',
      'geographic_chart',
      'category_chart',
      'trend_chart'
    ])
    .withMessage('Widget must be a valid widget type'),
    
  query('refresh')
    .optional()
    .isBoolean()
    .withMessage('Refresh must be a boolean value'),
    
  query('timeRange')
    .optional()
    .isIn(['1h', '24h', '7d', '30d', '90d'])
    .withMessage('Time range must be one of: 1h, 24h, 7d, 30d, 90d'),
    
  handleValidationErrors
];

module.exports = {
  validateUserAnalytics,
  validateContactAnalytics,
  validateSystemMetrics,
  validateRealTimeData,
  validateExportDashboardData,
  validateDateRange,
  validateOverview,
  validateAdvancedAnalytics,
  validateFilterAndPagination,
  validateWidgetData,
  handleValidationErrors
};