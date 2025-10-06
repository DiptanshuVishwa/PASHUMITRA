const { Resend } = require('resend');
const logger = require('../utils/logger');

class ResendEmailService {
  constructor() {
    this.apiKey = process.env.RESEND_API_KEY;
    this.resend = this.apiKey ? new Resend(this.apiKey) : null;
    this.fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    this.fromName = process.env.EMAIL_FROM_NAME || 'PashuMitra Portal';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  /**
   * Send email using Resend
   */
  async sendEmail(emailData) {
    try {
      if (!this.apiKey || !this.resend) {
        throw new Error('RESEND_API_KEY not configured in environment variables');
      }

      const { to, subject, htmlContent, textContent, html, text } = emailData;
      const htmlToSend = html || htmlContent;
      const textToSend = text || textContent;

      if (!to || !subject || !htmlToSend) {
        throw new Error('Missing required email parameters: to, subject, html');
      }

      const emailPayload = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: htmlToSend,
        ...(textToSend && { text: textToSend })
      };

      logger.info('📧 Sending email via Resend SDK...', {
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        from: emailPayload.from
      });

      const data = await this.resend.emails.send(emailPayload);

      logger.info('✅ Email sent successfully via Resend', {
        messageId: data.id,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject
      });

      return {
        success: true,
        messageId: data.id,
        service: 'resend',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('❌ Failed to send email via Resend:', {
        error: error.message,
        to: emailData.to,
        subject: emailData.subject,
        stack: error.stack
      });

      return {
        success: false,
        error: error.message,
        service: 'resend'
      };
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(userData) {
    const { email, name } = userData;

    const subject = 'Welcome to PashuMitra Portal! 🐄';
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Welcome to PashuMitra Portal</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">🐄 Welcome to PashuMitra Portal!</h1>
            </div>
            
            <div style="padding: 30px;">
                <h2 style="color: #4CAF50; margin-top: 0;">Hello ${name}!</h2>
                <p>Thank you for joining PashuMitra Portal, India's leading livestock disease monitoring and management system.</p>
                
                <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #2E7D32; margin-top: 0;">🎯 What you can do with PashuMitra Portal:</h3>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li>📊 Monitor your livestock health in real-time</li>
                        <li>🚨 Receive instant alerts for health issues</li>
                        <li>🩺 Connect with certified veterinarians</li>
                        <li>📈 Track health trends and analytics</li>
                        <li>📁 Manage medical records and documents</li>
                    </ul>
                </div>
                
                <p>Your account is now active and ready to use. Please verify your email address to access all features.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/dashboard" 
                       style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Go to Dashboard
                    </a>
                </div>
                
                <p>If you have any questions or need assistance, our support team is here to help you 24/7.</p>
                
                <p>Best regards,<br><strong>The PashuMitra Team</strong></p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #666; text-align: center;">
                    © ${new Date().getFullYear()} PashuMitra Portal. All rights reserved.<br>
                    Made with ❤️ for Indian farmers and livestock owners
                </p>
            </div>
        </div>
    </body>
    </html>`;

    const textContent = `Welcome to PashuMitra Portal!\n\nHello ${name}!\n\nThank you for joining PashuMitra Portal, India's leading livestock disease monitoring and management system.\n\nWhat you can do with PashuMitra Portal:\n- Monitor your livestock health in real-time\n- Receive instant alerts for health issues\n- Connect with certified veterinarians\n- Track health trends and analytics\n- Manage medical records and documents\n\nYour account is now active and ready to use. Please verify your email address to access all features.\n\nVisit your dashboard: ${process.env.FRONTEND_URL}/dashboard\n\nIf you have any questions or need assistance, our support team is here to help you 24/7.\n\nBest regards,\nThe PashuMitra Team\n\n© ${new Date().getFullYear()} PashuMitra Portal. All rights reserved.\nMade with ❤️ for Indian farmers and livestock owners`;

    return await this.sendEmail({
      to: email,
      subject,
      htmlContent,
      textContent
    });
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(userData, verificationToken) {
    const { email, name } = userData;
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${verificationToken}`;

    const subject = 'Verify Your Email - PashuMitra Portal';
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Email Verification - PashuMitra Portal</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: #4CAF50; color: white; padding: 20px; text-align: center;">
                <h2 style="margin: 0;">📧 Email Verification Required</h2>
            </div>
            
            <div style="padding: 30px;">
                <h3>Hello ${name}!</h3>
                <p>Thank you for registering with PashuMitra Portal. To complete your registration and secure your account, please verify your email address.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" 
                       style="background: #4CAF50; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        ✅ Verify Email Address
                    </a>
                </div>
                
                <p>If the button doesn't work, please copy and paste this link into your browser:</p>
                <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all; font-family: monospace;">
                    ${verificationUrl}
                </p>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <p style="margin: 0;"><strong>⏰ Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
                </div>
                
                <p>If you didn't create an account with PashuMitra Portal, please ignore this email.</p>
                <p>Need help? Contact our support team at <a href="mailto:${this.fromEmail}">${this.fromEmail}</a></p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #666; text-align: center;">
                    © ${new Date().getFullYear()} PashuMitra Portal<br>
                    Powered by Resend
                </p>
            </div>
        </div>
    </body>
    </html>`;

    const textContent = `Email Verification Required\n\nHello ${name}!\n\nThank you for registering with PashuMitra Portal. To complete your registration and secure your account, please verify your email address.\n\nClick here to verify: ${verificationUrl}\n\nThis verification link will expire in 24 hours for security reasons.\n\nIf you didn't create this account, please ignore this email.\n\n© ${new Date().getFullYear()} PashuMitra Portal`;

    return await this.sendEmail({
      to: email,
      subject,
      htmlContent,
      textContent
    });
  }

  /**
   * Test connection
   */
  async testConnection() {
    try {
      if (!this.apiKey) {
        throw new Error('Resend API key not configured');
      }

      // Test with a simple API call to verify the key
      const testResult = await this.sendEmail({
        to: this.fromEmail,
        subject: 'Resend Connection Test',
        textContent: 'This is a connection test email.',
        htmlContent: '<p>This is a connection test email.</p>'
      });

      return testResult;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ResendEmailService();