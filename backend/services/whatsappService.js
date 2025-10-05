const axios = require('axios');
const logger = require('../utils/logger');

class WhatsAppService {
  constructor() {
    // Using WhatsApp Business API (you can use services like Twilio, MessageBird, or direct Meta API)
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  }

  /**
   * Send WhatsApp message
   */
  async sendMessage(phoneNumber, message, templateName = null) {
    try {
      if (!this.accessToken || !this.phoneNumberId) {
        throw new Error('WhatsApp API credentials not configured');
      }

      // Clean phone number (remove +, spaces, etc.)
      const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, '');

      const payload = {
        messaging_product: 'whatsapp',
        to: cleanPhoneNumber,
        type: 'text',
        text: {
          body: message
        }
      };

      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`WhatsApp message sent successfully to ${cleanPhoneNumber}`, {
        messageId: response.data.messages[0].id,
        status: response.data.messages[0].message_status
      });

      return {
        success: true,
        messageId: response.data.messages[0].id,
        status: response.data.messages[0].message_status,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error sending WhatsApp message:', {
        error: error.message,
        phoneNumber,
        response: error.response?.data
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send welcome message via WhatsApp
   */
  async sendWelcomeMessage(userData) {
    const { phoneNumber, name } = userData;

    const message = `🐄 Welcome to PashuMitra Portal, ${name}!

Thank you for joining India's leading livestock disease monitoring system.

✅ Your account is now active
📱 You'll receive health alerts via WhatsApp
🩺 Connect with certified veterinarians
📊 Monitor your livestock in real-time

Need help? Reply to this message anytime.

- The PashuMitra Team`;

    return await this.sendMessage(phoneNumber, message);
  }

  /**
   * Send verification message via WhatsApp
   */
  async sendVerificationMessage(userData, verificationCode) {
    const { phoneNumber, name } = userData;

    const message = `📧 Email Verification - PashuMitra Portal

Hello ${name}!

Your verification code is: *${verificationCode}*

Please enter this code in the app to verify your account.

This code expires in 10 minutes for security.

- PashuMitra Team`;

    return await this.sendMessage(phoneNumber, message);
  }

  /**
   * Send critical alert via WhatsApp
   */
  async sendCriticalAlert(alertData, userData) {
    const { phoneNumber, name } = userData;
    const { animalId, alertType, severity, description, location } = alertData;

    const message = `🚨 URGENT LIVESTOCK ALERT

${name}, immediate attention required!

🐄 Animal: ${animalId}
⚠️ Alert: ${alertType}
🔥 Severity: ${severity}
📍 Location: ${location}

Details: ${description}

Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

${severity === 'Critical' ? '🩺 Contact veterinarian IMMEDIATELY!' : '👀 Please check on your animal'}

- PashuMitra Alert System`;

    return await this.sendMessage(phoneNumber, message);
  }
}

module.exports = new WhatsAppService();