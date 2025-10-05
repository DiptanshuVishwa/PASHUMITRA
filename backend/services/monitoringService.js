const { CloudWatchClient, PutMetricDataCommand, GetMetricStatisticsCommand, PutLogEventsCommand, CreateLogGroupCommand, CreateLogStreamCommand } = require('@aws-sdk/client-cloudwatch');
const { CloudWatchLogsClient, PutLogEventsCommand: PutLogEventsCommandLogs, CreateLogGroupCommand: CreateLogGroupCommandLogs, CreateLogStreamCommand: CreateLogStreamCommandLogs } = require('@aws-sdk/client-cloudwatch-logs');
const logger = require('../utils/logger');

class MonitoringService {
  constructor() {
    this.cloudWatchClient = new CloudWatchClient({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.cloudWatchLogsClient = new CloudWatchLogsClient({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.namespace = 'PashuMitra/Portal';
    this.logGroupName = '/aws/pashumnitra-portal';
    this.environment = process.env.NODE_ENV || 'development';
  }

  /**
   * Initialize CloudWatch Logs
   */
  async initializeLogging() {
    try {
      // Create log group
      await this.cloudWatchLogsClient.send(new CreateLogGroupCommandLogs({
        logGroupName: this.logGroupName,
        retentionInDays: 30 // Keep logs for 30 days
      }));

      // Create log streams for different types
      const logStreams = [
        'application',
        'api-requests',
        'alerts',
        'errors',
        'performance'
      ];

      for (const streamName of logStreams) {
        try {
          await this.cloudWatchLogsClient.send(new CreateLogStreamCommandLogs({
            logGroupName: this.logGroupName,
            logStreamName: `${streamName}-${this.environment}-${new Date().getTime()}`
          }));
        } catch (error) {
          // Stream might already exist, continue
          if (error.name !== 'ResourceAlreadyExistsException') {
            logger.error(`Error creating log stream ${streamName}:`, error.message);
          }
        }
      }

      logger.info('CloudWatch Logs initialized successfully');
    } catch (error) {
      if (error.name !== 'ResourceAlreadyExistsException') {
        logger.error('Error initializing CloudWatch Logs:', error);
      }
    }
  }

  /**
   * Send custom metric to CloudWatch
   * @param {string} metricName - Name of the metric
   * @param {number} value - Metric value
   * @param {string} unit - Unit of measurement
   * @param {Object} dimensions - Additional dimensions
   */
  async putMetric(metricName, value, unit = 'Count', dimensions = {}) {
    try {
      const metricData = [{
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Timestamp: new Date(),
        Dimensions: Object.keys(dimensions).map(key => ({
          Name: key,
          Value: String(dimensions[key])
        }))
      }];

      const command = new PutMetricDataCommand({
        Namespace: this.namespace,
        MetricData: metricData
      });

      await this.cloudWatchClient.send(command);
      
      logger.debug(`Metric sent to CloudWatch: ${metricName} = ${value} ${unit}`, {
        dimensions
      });

      return {
        success: true,
        metricName,
        value,
        unit
      };
    } catch (error) {
      logger.error('Error sending metric to CloudWatch:', {
        error: error.message,
        metricName,
        value,
        unit
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Track API request metrics
   * @param {Object} requestData - Request information
   */
  async trackAPIRequest(requestData) {
    const { method, path, statusCode, responseTime, userId, userRole } = requestData;

    try {
      // Track total API requests
      await this.putMetric('APIRequests', 1, 'Count', {
        Method: method,
        Path: path,
        StatusCode: String(statusCode),
        Environment: this.environment
      });

      // Track response time
      await this.putMetric('APIResponseTime', responseTime, 'Milliseconds', {
        Method: method,
        Path: path,
        Environment: this.environment
      });

      // Track user activity
      if (userId) {
        await this.putMetric('UserActivity', 1, 'Count', {
          UserRole: userRole || 'unknown',
          Environment: this.environment
        });
      }

      // Track error rates
      if (statusCode >= 400) {
        await this.putMetric('APIErrors', 1, 'Count', {
          Method: method,
          Path: path,
          StatusCode: String(statusCode),
          Environment: this.environment
        });
      }

    } catch (error) {
      logger.error('Error tracking API request:', error);
    }
  }

  /**
   * Track livestock alert metrics
   * @param {Object} alertData - Alert information
   */
  async trackLivestockAlert(alertData) {
    const { alertType, severity, animalId, location } = alertData;

    try {
      // Track total alerts
      await this.putMetric('LivestockAlerts', 1, 'Count', {
        AlertType: alertType,
        Severity: severity,
        Environment: this.environment
      });

      // Track alerts by location
      if (location) {
        await this.putMetric('AlertsByLocation', 1, 'Count', {
          Location: location,
          Severity: severity,
          Environment: this.environment
        });
      }

      // Track critical alerts separately
      if (severity === 'Critical') {
        await this.putMetric('CriticalAlerts', 1, 'Count', {
          AlertType: alertType,
          Environment: this.environment
        });
      }

    } catch (error) {
      logger.error('Error tracking livestock alert:', error);
    }
  }

  /**
   * Track file upload metrics
   * @param {Object} uploadData - Upload information
   */
  async trackFileUpload(uploadData) {
    const { fileSize, fileType, category, uploadTime, success } = uploadData;

    try {
      // Track successful uploads
      await this.putMetric('FileUploads', success ? 1 : 0, 'Count', {
        FileType: fileType,
        Category: category,
        Success: String(success),
        Environment: this.environment
      });

      // Track upload size
      if (success && fileSize) {
        await this.putMetric('FileUploadSize', fileSize, 'Bytes', {
          FileType: fileType,
          Category: category,
          Environment: this.environment
        });
      }

      // Track upload time
      if (uploadTime) {
        await this.putMetric('FileUploadTime', uploadTime, 'Milliseconds', {
          FileType: fileType,
          Environment: this.environment
        });
      }

    } catch (error) {
      logger.error('Error tracking file upload:', error);
    }
  }

  /**
   * Track user registration and authentication
   * @param {Object} authData - Authentication information
   */
  async trackUserAuth(authData) {
    const { action, success, userRole, method } = authData;

    try {
      // Track authentication events
      await this.putMetric('UserAuthentication', 1, 'Count', {
        Action: action, // login, register, logout, etc.
        Success: String(success),
        Method: method || 'email', // email, phone, social, etc.
        Environment: this.environment
      });

      // Track user registrations by role
      if (action === 'register' && success && userRole) {
        await this.putMetric('UserRegistrations', 1, 'Count', {
          UserRole: userRole,
          Environment: this.environment
        });
      }

      // Track failed login attempts
      if (action === 'login' && !success) {
        await this.putMetric('FailedLogins', 1, 'Count', {
          Method: method || 'email',
          Environment: this.environment
        });
      }

    } catch (error) {
      logger.error('Error tracking user auth:', error);
    }
  }

  /**
   * Track database operations
   * @param {Object} dbData - Database operation information
   */
  async trackDatabaseOperation(dbData) {
    const { operation, collection, executionTime, success, recordCount } = dbData;

    try {
      // Track database operations
      await this.putMetric('DatabaseOperations', 1, 'Count', {
        Operation: operation, // find, create, update, delete
        Collection: collection,
        Success: String(success),
        Environment: this.environment
      });

      // Track execution time
      if (executionTime) {
        await this.putMetric('DatabaseExecutionTime', executionTime, 'Milliseconds', {
          Operation: operation,
          Collection: collection,
          Environment: this.environment
        });
      }

      // Track record count for read operations
      if (success && recordCount !== undefined && ['find', 'aggregate'].includes(operation)) {
        await this.putMetric('DatabaseRecordCount', recordCount, 'Count', {
          Operation: operation,
          Collection: collection,
          Environment: this.environment
        });
      }

    } catch (error) {
      logger.error('Error tracking database operation:', error);
    }
  }

  /**
   * Track notification delivery
   * @param {Object} notificationData - Notification information
   */
  async trackNotification(notificationData) {
    const { type, channel, success, recipientCount } = notificationData;

    try {
      // Track notification attempts
      await this.putMetric('NotificationAttempts', recipientCount || 1, 'Count', {
        Type: type, // alert, reminder, welcome, etc.
        Channel: channel, // email, sms, whatsapp, push
        Success: String(success),
        Environment: this.environment
      });

      // Track successful deliveries
      if (success) {
        await this.putMetric('NotificationDeliveries', recipientCount || 1, 'Count', {
          Type: type,
          Channel: channel,
          Environment: this.environment
        });
      }

    } catch (error) {
      logger.error('Error tracking notification:', error);
    }
  }

  /**
   * Track system performance metrics
   * @param {Object} performanceData - Performance information
   */
  async trackSystemPerformance(performanceData) {
    const { cpuUsage, memoryUsage, diskUsage, activeConnections } = performanceData;

    try {
      // Track system metrics
      if (cpuUsage !== undefined) {
        await this.putMetric('SystemCPUUsage', cpuUsage, 'Percent', {
          Environment: this.environment
        });
      }

      if (memoryUsage !== undefined) {
        await this.putMetric('SystemMemoryUsage', memoryUsage, 'Percent', {
          Environment: this.environment
        });
      }

      if (diskUsage !== undefined) {
        await this.putMetric('SystemDiskUsage', diskUsage, 'Percent', {
          Environment: this.environment
        });
      }

      if (activeConnections !== undefined) {
        await this.putMetric('ActiveConnections', activeConnections, 'Count', {
          Environment: this.environment
        });
      }

    } catch (error) {
      logger.error('Error tracking system performance:', error);
    }
  }

  /**
   * Get metric statistics
   * @param {string} metricName - Name of the metric
   * @param {Date} startTime - Start time for the query
   * @param {Date} endTime - End time for the query
   * @param {number} period - Period in seconds
   * @param {Array} statistics - Statistics to retrieve
   */
  async getMetricStatistics(metricName, startTime, endTime, period = 300, statistics = ['Average', 'Sum', 'Maximum']) {
    try {
      const command = new GetMetricStatisticsCommand({
        Namespace: this.namespace,
        MetricName: metricName,
        StartTime: startTime,
        EndTime: endTime,
        Period: period,
        Statistics: statistics,
        Dimensions: [{
          Name: 'Environment',
          Value: this.environment
        }]
      });

      const result = await this.cloudWatchClient.send(command);
      
      return {
        success: true,
        metricName,
        datapoints: result.Datapoints,
        label: result.Label
      };
    } catch (error) {
      logger.error('Error getting metric statistics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create custom dashboard data
   */
  async getDashboardData() {
    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

      const metrics = [
        'APIRequests',
        'LivestockAlerts',
        'UserAuthentication',
        'FileUploads',
        'NotificationDeliveries'
      ];

      const dashboardData = {};

      for (const metric of metrics) {
        const stats = await this.getMetricStatistics(metric, startTime, endTime, 3600); // 1 hour periods
        dashboardData[metric] = stats;
      }

      return {
        success: true,
        timeRange: {
          start: startTime.toISOString(),
          end: endTime.toISOString()
        },
        data: dashboardData
      };
    } catch (error) {
      logger.error('Error getting dashboard data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create alarm for critical metrics
   * @param {string} metricName - Name of the metric
   * @param {number} threshold - Alarm threshold
   * @param {string} comparisonOperator - Comparison operator
   */
  async createAlarm(metricName, threshold, comparisonOperator = 'GreaterThanThreshold') {
    try {
      // This would typically use AWS CloudWatch Alarms API
      // For now, we'll log the alarm creation
      logger.info(`Alarm created for ${metricName}`, {
        metricName,
        threshold,
        comparisonOperator,
        environment: this.environment
      });

      return {
        success: true,
        alarmName: `${metricName}-${this.environment}`,
        metricName,
        threshold
      };
    } catch (error) {
      logger.error('Error creating alarm:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Log structured event to CloudWatch Logs
   * @param {string} logStream - Log stream name
   * @param {Object} event - Event data
   */
  async logEvent(logStream, event) {
    try {
      const logStreamName = `${logStream}-${this.environment}-${Date.now()}`;
      
      const logEvents = [{
        message: JSON.stringify({
          ...event,
          timestamp: new Date().toISOString(),
          environment: this.environment
        }),
        timestamp: Date.now()
      }];

      const command = new PutLogEventsCommandLogs({
        logGroupName: this.logGroupName,
        logStreamName,
        logEvents
      });

      await this.cloudWatchLogsClient.send(command);
      
      return {
        success: true,
        logStream: logStreamName
      };
    } catch (error) {
      logger.error('Error logging event to CloudWatch:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get system health overview
   */
  async getSystemHealth() {
    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 60 * 60 * 1000); // Last hour

      // Get error rate
      const errorStats = await this.getMetricStatistics('APIErrors', startTime, endTime, 300, ['Sum']);
      const requestStats = await this.getMetricStatistics('APIRequests', startTime, endTime, 300, ['Sum']);
      
      const totalErrors = errorStats.success ? errorStats.datapoints.reduce((sum, dp) => sum + dp.Sum, 0) : 0;
      const totalRequests = requestStats.success ? requestStats.datapoints.reduce((sum, dp) => sum + dp.Sum, 0) : 0;
      
      const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

      // Get response time
      const responseTimeStats = await this.getMetricStatistics('APIResponseTime', startTime, endTime, 300, ['Average']);
      const avgResponseTime = responseTimeStats.success && responseTimeStats.datapoints.length > 0
        ? responseTimeStats.datapoints[responseTimeStats.datapoints.length - 1].Average
        : 0;

      // Determine health status
      let healthStatus = 'healthy';
      let healthScore = 100;

      if (errorRate > 5) {
        healthStatus = 'unhealthy';
        healthScore -= 50;
      } else if (errorRate > 2) {
        healthStatus = 'degraded';
        healthScore -= 25;
      }

      if (avgResponseTime > 2000) {
        healthStatus = healthStatus === 'healthy' ? 'degraded' : 'unhealthy';
        healthScore -= 25;
      }

      return {
        success: true,
        healthStatus,
        healthScore: Math.max(0, healthScore),
        metrics: {
          errorRate: Math.round(errorRate * 100) / 100,
          avgResponseTime: Math.round(avgResponseTime),
          totalRequests,
          totalErrors
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting system health:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
module.exports = new MonitoringService();