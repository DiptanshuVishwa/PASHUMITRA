const serviceManager = require('../services');
const logger = require('../utils/logger');

/**
 * Middleware to track API requests and performance
 */
const trackAPIRequest = (req, res, next) => {
  const startTime = Date.now();
  
  // Capture original end function
  const originalEnd = res.end;
  
  // Override end function to capture metrics
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    // Track the request metrics asynchronously
    setImmediate(async () => {
      try {
        await serviceManager.getService('monitoring').trackAPIRequest({
          method: req.method,
          path: req.route?.path || req.path,
          statusCode: res.statusCode,
          responseTime,
          userId: req.user?.id,
          userRole: req.user?.role,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        });
      } catch (error) {
        logger.error('Error tracking API request:', error);
      }
    });
    
    // Call original end function
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

/**
 * Middleware to track user authentication events
 */
const trackUserAuth = (action, success = true, method = 'email') => {
  return (req, res, next) => {
    setImmediate(async () => {
      try {
        await serviceManager.getService('monitoring').trackUserAuth({
          action,
          success,
          userRole: req.body?.role || req.user?.role,
          method,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
      } catch (error) {
        logger.error('Error tracking user auth:', error);
      }
    });
    
    next();
  };
};

/**
 * Middleware to track file uploads
 */
const trackFileUpload = (req, res, next) => {
  const originalEnd = res.end;
  
  res.end = function(chunk, encoding) {
    if (req.file || req.files) {
      setImmediate(async () => {
        try {
          const files = req.files ? req.files : [req.file];
          
          for (const file of files) {
            if (file) {
              await serviceManager.getService('monitoring').trackFileUpload({
                fileSize: file.size,
                fileType: file.mimetype,
                category: req.body?.category || 'general',
                uploadTime: Date.now() - req.uploadStartTime,
                success: res.statusCode < 400,
                userId: req.user?.id
              });
            }
          }
        } catch (error) {
          logger.error('Error tracking file upload:', error);
        }
      });
    }
    
    originalEnd.call(this, chunk, encoding);
  };
  
  // Mark upload start time
  req.uploadStartTime = Date.now();
  next();
};

/**
 * Middleware to track database operations
 */
const trackDatabaseOperation = (operation, collection) => {
  return {
    pre: function() {
      this._startTime = Date.now();
    },
    post: function() {
      const executionTime = Date.now() - this._startTime;
      
      setImmediate(async () => {
        try {
          await serviceManager.getService('monitoring').trackDatabaseOperation({
            operation,
            collection,
            executionTime,
            success: true,
            recordCount: this.getQuery ? Object.keys(this.getQuery()).length : undefined
          });
        } catch (error) {
          logger.error('Error tracking database operation:', error);
        }
      });
    }
  };
};

/**
 * Error tracking middleware
 */
const trackError = (error, req, res, next) => {
  setImmediate(async () => {
    try {
      // Log error to CloudWatch
      await serviceManager.getService('monitoring').logEvent('errors', {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
          code: error.code
        },
        request: {
          method: req.method,
          path: req.path,
          url: req.url,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          userId: req.user?.id
        },
        response: {
          statusCode: res.statusCode
        }
      });
      
      // Track error metric
      await serviceManager.getService('monitoring').putMetric('ApplicationErrors', 1, 'Count', {
        ErrorType: error.name || 'UnknownError',
        Path: req.path,
        Method: req.method,
        Environment: process.env.NODE_ENV || 'development'
      });
    } catch (trackingError) {
      logger.error('Error tracking error:', trackingError);
    }
  });
  
  next(error);
};

/**
 * Performance monitoring middleware
 */
const trackPerformance = () => {
  let performanceInterval;
  
  const collectPerformanceMetrics = async () => {
    try {
      const usage = process.cpuUsage();
      const memUsage = process.memoryUsage();
      
      // Calculate CPU usage percentage (approximation)
      const cpuUsage = (usage.user + usage.system) / 1000000; // Convert to seconds
      
      // Calculate memory usage percentage
      const totalMemory = memUsage.rss + memUsage.heapTotal + memUsage.external;
      const memoryUsage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      
      await serviceManager.getService('monitoring').trackSystemPerformance({
        cpuUsage,
        memoryUsage,
        activeConnections: global.activeConnections || 0
      });
      
    } catch (error) {
      logger.error('Error collecting performance metrics:', error);
    }
  };
  
  return {
    start: () => {
      // Collect performance metrics every 30 seconds
      performanceInterval = setInterval(collectPerformanceMetrics, 30000);
    },
    stop: () => {
      if (performanceInterval) {
        clearInterval(performanceInterval);
      }
    }
  };
};

/**
 * Custom metric tracking function
 */
const trackCustomMetric = (metricName, value, unit = 'Count', dimensions = {}) => {
  return async (req, res, next) => {
    setImmediate(async () => {
      try {
        await serviceManager.getService('monitoring').putMetric(metricName, value, unit, {
          ...dimensions,
          Environment: process.env.NODE_ENV || 'development'
        });
      } catch (error) {
        logger.error(`Error tracking custom metric ${metricName}:`, error);
      }
    });
    
    next();
  };
};

module.exports = {
  trackAPIRequest,
  trackUserAuth,
  trackFileUpload,
  trackDatabaseOperation,
  trackError,
  trackPerformance,
  trackCustomMetric
};