const resendEmailService = require('./resendEmailService');
const emailService = require('./emailService'); // AWS SES
const logger = require('../utils/logger');

/**
 * Email Manager - Routes emails to the appropriate service based on configuration
 */
class EmailManager {
  constructor() {
    this.primaryService = process.env.EMAIL_SERVICE || 'ses'; // 'resend', 'ses', or 'sendgrid'
    this.fallbackService = 'ses'; // Always fallback to SES if available
    
    logger.info(`📧 Email Manager initialized with primary service: ${this.primaryService}`);
  }

  /**
   * Send email using the configured service
   */
  async sendEmail(emailData) {
    try {
      let result;
      
      // Try primary service first
      if (this.primaryService === 'resend') {
        logger.info('📧 Attempting email via Resend (primary)...');
        result = await resendEmailService.sendEmail(emailData);
      } else {
        logger.info('📧 Attempting email via AWS SES (primary)...');
        // Convert format for SES service
        const sesEmailData = {
          ...emailData,
          htmlContent: emailData.html || emailData.htmlContent,
          textContent: emailData.text || emailData.textContent
        };
        result = await emailService.sendEmail(sesEmailData);
      }
      
      // If primary service failed, try fallback
      if (!result.success && this.primaryService !== this.fallbackService) {
        logger.warn(`⚠️ Primary email service (${this.primaryService}) failed, trying fallback (${this.fallbackService})...`);
        
        if (this.fallbackService === 'ses') {
          const sesEmailData = {
            ...emailData,
            htmlContent: emailData.html || emailData.htmlContent,
            textContent: emailData.text || emailData.textContent
          };
          result = await emailService.sendEmail(sesEmailData);
        } else if (this.fallbackService === 'resend') {
          result = await resendEmailService.sendEmail(emailData);
        }
      }
      
      if (result.success) {
        logger.info(`✅ Email sent successfully via ${result.service || this.primaryService}`);
      } else {
        logger.error(`❌ All email services failed: ${result.error}`);
      }
      
      return result;
      
    } catch (error) {
      logger.error('💥 Email Manager error:', { error: error.message, stack: error.stack });
      return {
        success: false,
        error: error.message,
        service: 'email-manager'
      };
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(user, verificationToken) {
    try {
      logger.info(`📧 Sending verification email to: ${user.email}`);
      
      let result;
      
      if (this.primaryService === 'resend') {
        result = await resendEmailService.sendEmailVerification(user, verificationToken);
      } else {
        result = await emailService.sendEmailVerification(user, verificationToken);
      }
      
      if (!result.success && this.primaryService !== this.fallbackService) {
        logger.warn('⚠️ Primary service failed for verification email, trying fallback...');
        
        if (this.fallbackService === 'ses') {
          result = await emailService.sendEmailVerification(user, verificationToken);
        } else if (this.fallbackService === 'resend') {
          result = await resendEmailService.sendEmailVerification(user, verificationToken);
        }
      }
      
      return result;
      
    } catch (error) {
      logger.error('💥 Verification email error:', { error: error.message, user: user.email });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(user) {
    try {
      logger.info(`📧 Sending welcome email to: ${user.email}`);
      
      let result;
      
      if (this.primaryService === 'resend') {
        result = await resendEmailService.sendWelcomeEmail(user);
      } else {
        result = await emailService.sendWelcomeEmail(user);
      }
      
      if (!result.success && this.primaryService !== this.fallbackService) {
        logger.warn('⚠️ Primary service failed for welcome email, trying fallback...');
        
        if (this.fallbackService === 'ses') {
          result = await emailService.sendWelcomeEmail(user);
        } else if (this.fallbackService === 'resend') {
          result = await resendEmailService.sendWelcomeEmail(user);
        }
      }
      
      return result;
      
    } catch (error) {
      logger.error('💥 Welcome email error:', { error: error.message, user: user.email });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test email service connection
   */
  async testConnection() {
    try {
      logger.info('🧪 Testing email service connections...');
      
      const results = {
        primary: null,
        fallback: null,
        timestamp: new Date().toISOString()
      };
      
      // Test primary service
      if (this.primaryService === 'resend') {
        results.primary = await resendEmailService.testConnection();
      } else {
        // Create a simple test for SES
        results.primary = {
          success: !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY,
          service: 'ses',
          message: 'SES credentials configured'
        };
      }
      
      // Test fallback if different
      if (this.fallbackService !== this.primaryService) {
        if (this.fallbackService === 'resend') {
          results.fallback = await resendEmailService.testConnection();
        } else {
          results.fallback = {
            success: !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY,
            service: 'ses',
            message: 'SES credentials configured'
          };
        }
      }
      
      logger.info('🧪 Email service test completed', results);
      return results;
      
    } catch (error) {
      logger.error('❌ Email service test failed:', { error: error.message });
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get current service status
   */
  getStatus() {
    return {
      primaryService: this.primaryService,
      fallbackService: this.fallbackService,
      resendConfigured: !!process.env.RESEND_API_KEY,
      sesConfigured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new EmailManager();