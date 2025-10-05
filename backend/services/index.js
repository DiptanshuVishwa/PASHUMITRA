// Centralized service manager for all global cloud services
const notificationService = require('./notificationService');
const emailService = require('./emailService');
const smsService = require('./smsService');
const monitoringService = require('./monitoringService');
const logger = require('../utils/logger');

class ServiceManager {
  constructor() {
    this.services = {
      notification: notificationService,
      email: emailService,
      sms: smsService,
      monitoring: monitoringService
    };
    
    this.initialized = false;
  }

  /**
   * Initialize all global services
   */
  async initializeServices() {
    try {
      logger.info('🚀 Initializing global cloud services...');

      // Initialize CloudWatch Logs
      await this.services.monitoring.initializeLogging();
      
      // Initialize SNS topics
      const snsTopics = await this.services.notification.initializeTopics();
      logger.info('SNS topics initialized', { topics: Object.keys(snsTopics) });

      // Test basic connectivity
      await this.testServicesConnectivity();

      this.initialized = true;
      logger.info('✅ All global services initialized successfully');

      // Track initialization
      await this.services.monitoring.putMetric('ServiceInitialization', 1, 'Count', {
        Status: 'Success',
        Environment: process.env.NODE_ENV || 'development'
      });

    } catch (error) {
      logger.error('❌ Error initializing global services:', error);
      
      // Track initialization failure
      await this.services.monitoring.putMetric('ServiceInitialization', 1, 'Count', {
        Status: 'Failed',
        Environment: process.env.NODE_ENV || 'development'
      });

      throw error;
    }
  }

  /**
   * Test connectivity to all services
   */
  async testServicesConnectivity() {
    try {
      logger.info('🔍 Testing service connectivity...');

      const tests = {
        sns: false,
        ses: false,
        twilio: false,
        cloudwatch: false
      };

      // Test SNS
      try {
        await this.services.notification.getTopicStatistics();
        tests.sns = true;
        logger.info('✅ SNS connectivity test passed');
      } catch (error) {
        logger.warn('⚠️  SNS connectivity test failed:', error.message);
      }

      // Test SES
      try {
        await this.services.email.getSendingStatistics();
        tests.ses = true;
        logger.info('✅ SES connectivity test passed');
      } catch (error) {
        logger.warn('⚠️  SES connectivity test failed:', error.message);
      }

      // Test Twilio (if credentials are available)
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        try {
          await this.services.sms.getAccountInfo();
          tests.twilio = true;
          logger.info('✅ Twilio connectivity test passed');
        } catch (error) {
          logger.warn('⚠️  Twilio connectivity test failed:', error.message);
        }
      }

      // Test CloudWatch
      try {
        await this.services.monitoring.putMetric('ConnectivityTest', 1, 'Count');
        tests.cloudwatch = true;
        logger.info('✅ CloudWatch connectivity test passed');
      } catch (error) {
        logger.warn('⚠️  CloudWatch connectivity test failed:', error.message);
      }

      logger.info('🔍 Service connectivity tests completed', tests);
      return tests;

    } catch (error) {
      logger.error('Error testing service connectivity:', error);
      return null;
    }
  }

  /**
   * Send comprehensive notification (email, SMS, push)
   * @param {Object} notificationData - Notification configuration
   */
  async sendComprehensiveNotification(notificationData) {
    const {
      type, // 'critical_alert', 'appointment_reminder', 'general'
      recipient,
      alertData,
      appointmentData,
      preferences = {}
    } = notificationData;

    const results = {
      email: null,
      sms: null,
      whatsapp: null,
      push: null
    };

    try {
      logger.info(`📢 Sending comprehensive ${type} notification`, {
        recipientEmail: recipient.email,
        recipientPhone: recipient.phone
      });

      // Send push notification via SNS
      if (type === 'critical_alert' && alertData) {
        try {
          results.push = await this.services.notification.sendCriticalAlert(alertData);
          logger.info('📨 Push notification sent via SNS');
        } catch (error) {
          logger.error('❌ Push notification failed:', error.message);
        }
      }

      // Send email notification
      if (recipient.email && (!preferences.email || preferences.email !== 'disabled')) {
        try {
          if (type === 'critical_alert' && alertData) {
            results.email = await this.services.email.sendAlertNotificationEmail(alertData, recipient);
          } else if (type === 'appointment_reminder' && appointmentData) {
            results.email = await this.services.email.sendAppointmentConfirmationEmail(appointmentData, recipient);
          } else if (type === 'welcome') {
            results.email = await this.services.email.sendWelcomeEmail(recipient);
          }
          
          if (results.email?.success) {
            logger.info('📧 Email notification sent successfully');
          }
        } catch (error) {
          logger.error('❌ Email notification failed:', error.message);
        }
      }

      // Send SMS notification
      if (recipient.phone && (!preferences.sms || preferences.sms !== 'disabled')) {
        try {
          if (type === 'critical_alert' && alertData) {
            results.sms = await this.services.sms.sendCriticalAlertSMS(alertData, recipient.phone);
          } else if (type === 'appointment_reminder' && appointmentData) {
            results.sms = await this.services.sms.sendAppointmentReminderSMS(appointmentData, recipient.phone);
          }

          if (results.sms?.success) {
            logger.info('📱 SMS notification sent successfully');
          }
        } catch (error) {
          logger.error('❌ SMS notification failed:', error.message);
        }
      }

      // Send WhatsApp notification (for critical alerts)
      if (recipient.phone && type === 'critical_alert' && alertData && 
          (!preferences.whatsapp || preferences.whatsapp !== 'disabled')) {
        try {
          results.whatsapp = await this.services.sms.sendCriticalAlertWhatsApp(alertData, recipient.phone);
          
          if (results.whatsapp?.success) {
            logger.info('📲 WhatsApp notification sent successfully');
          }
        } catch (error) {
          logger.error('❌ WhatsApp notification failed:', error.message);
        }
      }

      // Track notification metrics
      const successCount = Object.values(results).filter(r => r?.success).length;
      const totalAttempts = Object.values(results).filter(r => r !== null).length;

      await this.services.monitoring.trackNotification({
        type,
        channel: 'comprehensive',
        success: successCount > 0,
        recipientCount: 1
      });

      logger.info(`📊 Comprehensive notification completed: ${successCount}/${totalAttempts} successful`, {
        type,
        results: Object.keys(results).reduce((acc, key) => {
          acc[key] = results[key]?.success || false;
          return acc;
        }, {})
      });

      return {
        success: successCount > 0,
        results,
        summary: {
          total: totalAttempts,
          successful: successCount,
          failed: totalAttempts - successCount
        }
      };

    } catch (error) {
      logger.error('❌ Comprehensive notification error:', error);
      return {
        success: false,
        error: error.message,
        results
      };
    }
  }

  /**
   * Send emergency broadcast to multiple recipients
   * @param {Object} broadcastData - Broadcast configuration
   */
  async sendEmergencyBroadcast(broadcastData) {
    const { recipients, alertData, channels = ['email', 'sms', 'push'] } = broadcastData;

    try {
      logger.info(`🚨 Starting emergency broadcast to ${recipients.length} recipients`, {
        channels,
        alertType: alertData.alertType
      });

      const results = [];

      for (const recipient of recipients) {
        const notificationResult = await this.sendComprehensiveNotification({
          type: 'critical_alert',
          recipient,
          alertData,
          preferences: {} // Override preferences for emergency
        });

        results.push({
          recipient: recipient.email || recipient.phone,
          ...notificationResult
        });
      }

      const totalSuccessful = results.filter(r => r.success).length;
      const totalFailed = results.length - totalSuccessful;

      logger.info(`🚨 Emergency broadcast completed: ${totalSuccessful}/${results.length} successful`);

      // Track broadcast metrics
      await this.services.monitoring.putMetric('EmergencyBroadcast', 1, 'Count', {
        AlertType: alertData.alertType,
        Recipients: String(recipients.length),
        Success: String(totalSuccessful),
        Environment: process.env.NODE_ENV || 'development'
      });

      return {
        success: totalSuccessful > 0,
        summary: {
          total: results.length,
          successful: totalSuccessful,
          failed: totalFailed
        },
        results
      };

    } catch (error) {
      logger.error('❌ Emergency broadcast error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get service health status
   */
  async getServiceHealth() {
    try {
      const health = {
        overall: 'healthy',
        services: {},
        timestamp: new Date().toISOString()
      };

      // Check individual services
      const connectivity = await this.testServicesConnectivity();
      
      if (connectivity) {
        health.services = {
          sns: connectivity.sns ? 'healthy' : 'unhealthy',
          ses: connectivity.ses ? 'healthy' : 'unhealthy',
          twilio: connectivity.twilio ? 'healthy' : 'degraded',
          cloudwatch: connectivity.cloudwatch ? 'healthy' : 'unhealthy'
        };

        // Determine overall health
        const healthyServices = Object.values(health.services).filter(s => s === 'healthy').length;
        const totalServices = Object.values(health.services).length;
        
        if (healthyServices === totalServices) {
          health.overall = 'healthy';
        } else if (healthyServices >= totalServices * 0.5) {
          health.overall = 'degraded';
        } else {
          health.overall = 'unhealthy';
        }
      }

      // Get system health from monitoring service
      const systemHealth = await this.services.monitoring.getSystemHealth();
      if (systemHealth.success) {
        health.system = systemHealth;
      }

      return health;

    } catch (error) {
      logger.error('Error getting service health:', error);
      return {
        overall: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get service statistics
   */
  async getServiceStatistics() {
    try {
      const stats = {
        timestamp: new Date().toISOString(),
        services: {}
      };

      // Get SNS statistics
      try {
        stats.services.sns = await this.services.notification.getTopicStatistics();
      } catch (error) {
        logger.warn('Could not get SNS statistics:', error.message);
      }

      // Get SES statistics
      try {
        stats.services.ses = await this.services.email.getSendingStatistics();
      } catch (error) {
        logger.warn('Could not get SES statistics:', error.message);
      }

      // Get Twilio statistics
      try {
        stats.services.twilio = await this.services.sms.getAccountInfo();
      } catch (error) {
        logger.warn('Could not get Twilio statistics:', error.message);
      }

      // Get CloudWatch dashboard data
      try {
        stats.services.cloudwatch = await this.services.monitoring.getDashboardData();
      } catch (error) {
        logger.warn('Could not get CloudWatch statistics:', error.message);
      }

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      logger.error('Error getting service statistics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if services are initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Get specific service instance
   * @param {string} serviceName - Name of the service
   */
  getService(serviceName) {
    return this.services[serviceName];
  }

  /**
   * Shutdown all services gracefully
   */
  async shutdown() {
    try {
      logger.info('🔄 Shutting down global services...');
      
      // Log final metrics
      await this.services.monitoring.putMetric('ServiceShutdown', 1, 'Count', {
        Environment: process.env.NODE_ENV || 'development'
      });

      this.initialized = false;
      logger.info('✅ Global services shut down successfully');

    } catch (error) {
      logger.error('❌ Error shutting down services:', error);
    }
  }
}

// Export singleton instance
module.exports = new ServiceManager();