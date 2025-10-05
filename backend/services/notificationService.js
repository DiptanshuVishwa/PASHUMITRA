const { SNSClient, PublishCommand, CreateTopicCommand, SubscribeCommand, ListTopicsCommand } = require('@aws-sdk/client-sns');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.snsClient = new SNSClient({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Topic ARNs for different notification types
    this.topics = {
      ALERT_CRITICAL: process.env.SNS_TOPIC_ALERT_CRITICAL,
      ALERT_WARNING: process.env.SNS_TOPIC_ALERT_WARNING,
      APPOINTMENT_REMINDER: process.env.SNS_TOPIC_APPOINTMENT,
      VETERINARIAN_NOTIFICATION: process.env.SNS_TOPIC_VETERINARIAN,
      GENERAL_NOTIFICATION: process.env.SNS_TOPIC_GENERAL,
    };
  }

  /**
   * Create SNS topics for the application
   */
  async initializeTopics() {
    try {
      const topicNames = {
        ALERT_CRITICAL: 'PashuMitra-Critical-Alerts',
        ALERT_WARNING: 'PashuMitra-Warning-Alerts',
        APPOINTMENT_REMINDER: 'PashuMitra-Appointment-Reminders',
        VETERINARIAN_NOTIFICATION: 'PashuMitra-Veterinarian-Notifications',
        GENERAL_NOTIFICATION: 'PashuMitra-General-Notifications',
      };

      const createdTopics = {};

      for (const [key, topicName] of Object.entries(topicNames)) {
        try {
          const command = new CreateTopicCommand({
            Name: topicName,
            Attributes: {
              DisplayName: topicName.replace(/-/g, ' '),
              DeliveryPolicy: JSON.stringify({
                'http': {
                  'defaultHealthyRetryPolicy': {
                    'minDelayTarget': 20,
                    'maxDelayTarget': 20,
                    'numRetries': 3,
                    'numMaxDelayRetries': 0,
                    'numMinDelayRetries': 0,
                    'numNoDelayRetries': 0,
                    'backoffFunction': 'linear'
                  }
                }
              })
            }
          });

          const result = await this.snsClient.send(command);
          createdTopics[key] = result.TopicArn;
          
          logger.info(`SNS Topic created: ${topicName} - ${result.TopicArn}`);
        } catch (error) {
          logger.error(`Error creating SNS topic ${topicName}:`, error.message);
        }
      }

      return createdTopics;
    } catch (error) {
      logger.error('Error initializing SNS topics:', error);
      throw error;
    }
  }

  /**
   * Send push notification via SNS
   * @param {string} topicType - Type of notification (ALERT_CRITICAL, etc.)
   * @param {string} message - Notification message
   * @param {string} subject - Subject line
   * @param {Object} attributes - Additional message attributes
   */
  async sendPushNotification(topicType, message, subject, attributes = {}) {
    try {
      const topicArn = this.topics[topicType];
      
      if (!topicArn) {
        throw new Error(`Topic ARN not found for type: ${topicType}`);
      }

      const messageAttributes = {};
      
      // Convert attributes to SNS message attributes format
      Object.keys(attributes).forEach(key => {
        messageAttributes[key] = {
          DataType: 'String',
          StringValue: String(attributes[key])
        };
      });

      const command = new PublishCommand({
        TopicArn: topicArn,
        Message: message,
        Subject: subject,
        MessageAttributes: messageAttributes,
      });

      const result = await this.snsClient.send(command);
      
      logger.info(`Push notification sent: ${result.MessageId}`, {
        topic: topicType,
        subject,
        messageId: result.MessageId
      });

      return {
        success: true,
        messageId: result.MessageId,
        topic: topicType
      };
    } catch (error) {
      logger.error('Error sending push notification:', {
        error: error.message,
        topicType,
        subject
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send critical livestock alert
   * @param {Object} alertData - Alert information
   */
  async sendCriticalAlert(alertData) {
    const { animalId, alertType, severity, description, location, ownerName } = alertData;
    
    const subject = `🚨 CRITICAL: ${alertType} Alert for Animal ${animalId}`;
    const message = `
CRITICAL LIVESTOCK ALERT

Animal ID: ${animalId}
Alert Type: ${alertType}
Severity: ${severity}
Location: ${location}
Owner: ${ownerName}

Description: ${description}

Immediate action required. Please contact a veterinarian immediately.

Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
    `.trim();

    return await this.sendPushNotification('ALERT_CRITICAL', message, subject, {
      animalId: String(animalId),
      alertType,
      severity,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send warning alert
   * @param {Object} alertData - Alert information
   */
  async sendWarningAlert(alertData) {
    const { animalId, alertType, description, location, ownerName } = alertData;
    
    const subject = `⚠️ WARNING: ${alertType} Alert for Animal ${animalId}`;
    const message = `
LIVESTOCK WARNING ALERT

Animal ID: ${animalId}
Alert Type: ${alertType}
Location: ${location}
Owner: ${ownerName}

Description: ${description}

Please monitor the situation and consider veterinary consultation if symptoms persist.

Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
    `.trim();

    return await this.sendPushNotification('ALERT_WARNING', message, subject, {
      animalId: String(animalId),
      alertType,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send appointment reminder
   * @param {Object} appointmentData - Appointment information
   */
  async sendAppointmentReminder(appointmentData) {
    const { appointmentId, veterinarianName, animalId, scheduledTime, location, ownerName } = appointmentData;
    
    const subject = `📅 Appointment Reminder - ${veterinarianName}`;
    const message = `
APPOINTMENT REMINDER

Appointment ID: ${appointmentId}
Veterinarian: Dr. ${veterinarianName}
Animal ID: ${animalId}
Owner: ${ownerName}
Scheduled Time: ${new Date(scheduledTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
Location: ${location}

Please ensure you arrive 10 minutes early for your appointment.

For any changes, please contact us immediately.
    `.trim();

    return await this.sendPushNotification('APPOINTMENT_REMINDER', message, subject, {
      appointmentId: String(appointmentId),
      animalId: String(animalId),
      veterinarianName,
      scheduledTime: new Date(scheduledTime).toISOString()
    });
  }

  /**
   * Send notification to veterinarians
   * @param {Object} notificationData - Notification information
   */
  async sendVeterinarianNotification(notificationData) {
    const { type, message, data } = notificationData;
    
    const subject = `🩺 PashuMitra: ${type}`;
    
    return await this.sendPushNotification('VETERINARIAN_NOTIFICATION', message, subject, {
      notificationType: type,
      ...data
    });
  }

  /**
   * Send general notification
   * @param {Object} notificationData - Notification information
   */
  async sendGeneralNotification(notificationData) {
    const { message, subject, userId, type } = notificationData;
    
    return await this.sendPushNotification('GENERAL_NOTIFICATION', message, subject, {
      userId: String(userId),
      notificationType: type,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Subscribe endpoint to a topic
   * @param {string} topicType - Topic type
   * @param {string} protocol - Protocol (email, sms, http, https, etc.)
   * @param {string} endpoint - Endpoint (email address, phone number, URL, etc.)
   */
  async subscribeToTopic(topicType, protocol, endpoint) {
    try {
      const topicArn = this.topics[topicType];
      
      if (!topicArn) {
        throw new Error(`Topic ARN not found for type: ${topicType}`);
      }

      const command = new SubscribeCommand({
        TopicArn: topicArn,
        Protocol: protocol,
        Endpoint: endpoint,
      });

      const result = await this.snsClient.send(command);
      
      logger.info(`Subscription created: ${result.SubscriptionArn}`, {
        topic: topicType,
        protocol,
        endpoint: protocol === 'email' ? endpoint : '***masked***'
      });

      return {
        success: true,
        subscriptionArn: result.SubscriptionArn,
        topic: topicType
      };
    } catch (error) {
      logger.error('Error subscribing to topic:', {
        error: error.message,
        topicType,
        protocol,
        endpoint: protocol === 'email' ? endpoint : '***masked***'
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get topic statistics
   */
  async getTopicStatistics() {
    try {
      const command = new ListTopicsCommand({});
      const result = await this.snsClient.send(command);
      
      const stats = {
        totalTopics: result.Topics ? result.Topics.length : 0,
        topics: result.Topics || [],
        configuredTopics: Object.keys(this.topics).length,
        timestamp: new Date().toISOString()
      };

      return stats;
    } catch (error) {
      logger.error('Error getting topic statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new NotificationService();