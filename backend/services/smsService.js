const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const logger = require('../utils/logger');
const twilio = require('twilio');

class SMSService {
  constructor() {
    // Check if AWS credentials are available
    this.isAwsSnsConfigured = Boolean(
      process.env.AWS_ACCESS_KEY_ID && 
      process.env.AWS_SECRET_ACCESS_KEY && 
      process.env.AWS_REGION
    );

    if (this.isAwsSnsConfigured) {
      // Initialize AWS SNS client
      this.snsClient = new SNSClient({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
      logger.info('SMS Service initialized with AWS SNS');
    } else {
      logger.warn('SMS Service initialized without AWS credentials - AWS SNS functionality disabled');
      this.snsClient = null;
    }

    // Check if Twilio credentials are available
    this.isTwilioConfigured = Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN
    );

    if (this.isTwilioConfigured) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      this.client = twilio(accountSid, authToken);
      logger.info('SMS Service initialized with Twilio');
    } else {
      logger.warn('SMS Service initialized without Twilio credentials - Twilio functionality disabled. getAccountInfo and getMessageStatus will be disabled.');
      this.snsClient = null;
    }
  }

  /**
   * Send SMS message via AWS SNS
   * @param {Object} messageData - SMS configuration
   */
  async sendSMS(messageData) {
    try {
      if (!this.isAwsSnsConfigured) {
        logger.warn('AWS SNS service not configured - skipping SMS send');
        return {
          success: false,
          error: 'AWS SNS service not configured',
          code: 'AWS_SNS_NOT_CONFIGURED'
        };
      }

      const { to, message } = messageData;

      if (!to || !message) {
        throw new Error('Missing required SMS parameters: to and message');
      }

      // Ensure phone number is in international format
      const formattedTo = this.formatPhoneNumber(to);

      const command = new PublishCommand({
        PhoneNumber: formattedTo,
        Message: message,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional' // Use Transactional for higher delivery rate
          }
        }
      });

      const response = await this.snsClient.send(command);

      logger.info(`SMS sent successfully via AWS SNS: ${response.MessageId}`, {
        to: formattedTo,
        messageId: response.MessageId
      });

      return {
        success: true,
        messageId: response.MessageId,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error sending SMS via AWS SNS:', {
        error: error.message,
        to: messageData.to,
        code: error.code
      });

      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // WhatsApp is not supported via AWS SNS directly; provide a stub or route via SMS
  async sendWhatsApp() {
    logger.warn('WhatsApp messaging is not supported with AWS SNS. Consider using SMS or another service.');
    return {
      success: false,
      error: 'WhatsApp not supported with current configuration',
      code: 'WHATSAPP_NOT_SUPPORTED'
    };
  }

  /**
   * Send critical livestock alert via SMS
   * @param {Object} alertData - Alert information
   * @param {string} recipientPhone - Recipient phone number
   */
  async sendCriticalAlertSMS(alertData, recipientPhone) {
    const { animalId, alertType, severity, location, ownerName } = alertData;
    
    const message = `🚨 CRITICAL ALERT - PashuMitra Portal

Animal ID: ${animalId}
Alert: ${alertType}
Severity: ${severity}
Location: ${location}
Owner: ${ownerName}

IMMEDIATE ACTION REQUIRED!
Contact veterinarian immediately.

Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Dashboard: ${process.env.FRONTEND_URL}/dashboard`;

    return await this.sendSMS({
      to: recipientPhone,
      message
    });
  }

  /**
   * Send critical livestock alert via SMS (enhanced format)
   * @param {Object} alertData - Alert information
   * @param {string} recipientPhone - Recipient phone number
   */
  async sendCriticalAlertEnhanced(alertData, recipientPhone) {
    const { animalId, alertType, severity, description, location, ownerName } = alertData;
    
    const message = `🚨 CRITICAL LIVESTOCK ALERT\nPashuMitra Portal\n\nAnimal ID: ${animalId}\nAlert: ${alertType}\nSeverity: ${severity}\nLocation: ${location}\nOwner: ${ownerName}\n\nDescription: ${description}\n\n⚠️ IMMEDIATE ACTION REQUIRED\n• Contact veterinarian immediately\n• Isolate animal if necessary\n• Monitor vital signs\n• Document changes\n\nTime: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n\nDashboard: ${process.env.FRONTEND_URL}/dashboard`;

    return await this.sendSMS({
      to: recipientPhone,
      message
    });
  }

  /**
   * Send appointment reminder via SMS
   * @param {Object} appointmentData - Appointment information
   * @param {string} recipientPhone - Recipient phone number
   */
  async sendAppointmentReminderSMS(appointmentData, recipientPhone) {
    const { appointmentId, veterinarianName, animalId, scheduledTime, location } = appointmentData;

    const message = `📅 APPOINTMENT REMINDER - PashuMitra Portal

Appointment ID: ${appointmentId}
Veterinarian: Dr. ${veterinarianName}
Animal ID: ${animalId}
Time: ${new Date(scheduledTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
Location: ${location}

Please arrive 10 minutes early.

Dashboard: ${process.env.FRONTEND_URL}/dashboard`;

    return await this.sendSMS({
      to: recipientPhone,
      message
    });
  }

  /**
   * Send appointment reminder via WhatsApp
   * @param {Object} appointmentData - Appointment information
   * @param {string} recipientPhone - Recipient phone number
   */
  async sendAppointmentReminderWhatsApp(appointmentData, recipientPhone) {
    const { appointmentId, veterinarianName, animalId, scheduledTime, location, ownerName } = appointmentData;

    const message = `📅 *APPOINTMENT REMINDER*
PashuMitra Portal

*Appointment ID:* ${appointmentId}
*Veterinarian:* Dr. ${veterinarianName}
*Animal ID:* ${animalId}
*Owner:* ${ownerName}
*Date & Time:* ${new Date(scheduledTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
*Location:* ${location}

⏰ Please arrive 10 minutes early for your appointment.

For any changes, contact us at least 2 hours before the appointment time.

View Dashboard: ${process.env.FRONTEND_URL}/dashboard`;

    return await this.sendWhatsApp({
      to: recipientPhone,
      message
    });
  }

  /**
   * Send vaccination reminder via SMS
   * @param {Object} vaccinationData - Vaccination information
   * @param {string} recipientPhone - Recipient phone number
   */
  async sendVaccinationReminderSMS(vaccinationData, recipientPhone) {
    const { animalId, vaccinationType, dueDate, location } = vaccinationData;

    const message = `💉 VACCINATION REMINDER - PashuMitra Portal

Animal ID: ${animalId}
Vaccination: ${vaccinationType}
Due Date: ${new Date(dueDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
Location: ${location}

Please schedule with your veterinarian.

Dashboard: ${process.env.FRONTEND_URL}/dashboard`;

    return await this.sendSMS({
      to: recipientPhone,
      message
    });
  }

  /**
   * Send OTP via SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} otp - OTP code
   */
  async sendOTP(phoneNumber, otp) {
    const message = `Your PashuMitra Portal verification code is: ${otp}

This code will expire in 5 minutes.

Do not share this code with anyone.

- PashuMitra Team`;

    return await this.sendSMS({
      to: phoneNumber,
      message
    });
  }

  /**
   * Send emergency broadcast to multiple numbers
   * @param {Array} phoneNumbers - Array of phone numbers
   * @param {string} emergencyMessage - Emergency message
   * @param {string} method - 'sms' or 'whatsapp'
   */
  async sendEmergencyBroadcast(phoneNumbers, emergencyMessage, method = 'sms') {
    try {
      const results = [];
      
      for (const phoneNumber of phoneNumbers) {
        try {
          const result = method === 'whatsapp' 
            ? await this.sendWhatsApp({ to: phoneNumber, message: emergencyMessage })
            : await this.sendSMS({ to: phoneNumber, message: emergencyMessage });
          
          results.push({
            phoneNumber,
            success: result.success,
            sid: result.sid,
            error: result.error
          });
        } catch (error) {
          results.push({
            phoneNumber,
            success: false,
            error: error.message
          });
        }
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;

      logger.info(`Emergency broadcast completed: ${successful} successful, ${failed} failed`, {
        method,
        totalRecipients: phoneNumbers.length,
        successful,
        failed
      });

      return {
        success: true,
        totalSent: successful,
        totalFailed: failed,
        results
      };

    } catch (error) {
      logger.error('Error sending emergency broadcast:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Format phone number to international format
   * @param {string} phoneNumber - Phone number to format
   */
  formatPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it's an Indian number without country code, add +91
    if (cleaned.length === 10 && cleaned.match(/^[6-9]/)) {
      return `+91${cleaned}`;
    }
    
    // If it already has country code but no +, add it
    if (cleaned.length > 10 && !phoneNumber.startsWith('+')) {
      return `+${cleaned}`;
    }
    
    // If it already has +, return as is
    if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }
    
    return `+${cleaned}`;
  }

  /**
   * Check message delivery status
   * @param {string} messageSid - Message SID from Twilio
   */
  async getMessageStatus(messageSid) {
    try {
      if (!this.isTwilioConfigured) {
        logger.warn('Twilio service not configured - skipping message status fetch');
        return {
          success: false,
          error: 'Twilio service not configured',
          code: 'TWILIO_NOT_CONFIGURED'
        };
      }
      const message = await this.client.messages(messageSid).fetch();
      
      return {
        success: true,
        status: message.status,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        dateUpdated: message.dateUpdated,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
        price: message.price,
        priceUnit: message.priceUnit
      };
    } catch (error) {
      logger.error('Error fetching message status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get account information and usage statistics
   */
  async getAccountInfo() {
    try {
      if (!this.isTwilioConfigured) {
        logger.warn('Twilio service not configured - skipping account info fetch');
        return {
          success: false,
          error: 'Twilio service not configured',
          code: 'TWILIO_NOT_CONFIGURED'
        };
      }
      const account = await this.client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      const usage = await this.client.usage.records.list({ limit: 10 });
      
      return {
        success: true,
        account: {
          sid: account.sid,
          friendlyName: account.friendlyName,
          status: account.status,
          dateCreated: account.dateCreated,
          dateUpdated: account.dateUpdated
        },
        usage: usage.map(record => ({
          category: record.category,
          description: record.description,
          usage: record.usage,
          usageUnit: record.usageUnit,
          count: record.count,
          countUnit: record.countUnit,
          price: record.price,
          priceUnit: record.priceUnit,
          startDate: record.startDate,
          endDate: record.endDate
        })),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error fetching account info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate phone number format
   * @param {string} phoneNumber - Phone number to validate
   */
  isValidPhoneNumber(phoneNumber) {
    // Basic validation for international phone numbers
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Indian mobile number validation (10 digits starting with 6,7,8,9)
    const indianMobileRegex = /^[6-9]\d{9}$/;
    
    if (cleaned.length === 10 && indianMobileRegex.test(cleaned)) {
      return true;
    }
    
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  }
}

// Export singleton instance
module.exports = new SMSService();