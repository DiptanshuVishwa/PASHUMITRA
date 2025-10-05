const sgMail = require('@sendgrid/mail');
const logger = require('../utils/logger');

class SendGridEmailService {
  constructor() {
    // SendGrid API Key - you'll need to set this in .env
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    this.fromEmail = process.env.EMAIL_FROM || 'team.pashumitra@gmail.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'PashuMitra Portal';
  }

  /**
   * Send email using SendGrid
   */
  async sendEmail(emailData) {
    try {
      const { to, subject, htmlContent, textContent, replyTo } = emailData;

      if (!to || !subject || (!htmlContent && !textContent)) {
        throw new Error('Missing required email parameters: to, subject, and content');
      }

      const msg = {
        to: Array.isArray(to) ? to : [to],
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: subject,
        ...(textContent && { text: textContent }),
        ...(htmlContent && { html: htmlContent }),
        ...(replyTo && { replyTo: replyTo })
      };

      const result = await sgMail.send(msg);

      logger.info(`SendGrid email sent successfully`, {
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        messageId: result[0].headers['x-message-id']
      });

      return {
        success: true,
        messageId: result[0].headers['x-message-id'],
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error sending SendGrid email:', {
        error: error.message,
        to: emailData.to,
        subject: emailData.subject
      });

      return {
        success: false,
        error: error.message
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 30px; text-align: center;">
        <h1>🐄 Welcome to PashuMitra Portal!</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2>Hello ${name}!</h2>
        <p>Thank you for joining PashuMitra Portal, India's leading livestock disease monitoring system.</p>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3>🎯 What you can do:</h3>
          <ul>
            <li>📊 Monitor livestock health in real-time</li>
            <li>🚨 Receive instant health alerts</li>
            <li>🩺 Connect with certified veterinarians</li>
            <li>📈 Track health trends and analytics</li>
          </ul>
        </div>
        
        <p>Your account is ready to use!</p>
        <p>Best regards,<br>The PashuMitra Team</p>
      </div>
    </div>`;

    const textContent = `Welcome to PashuMitra Portal!\n\nHello ${name}!\n\nThank you for joining PashuMitra Portal. Your account is ready to use!\n\nBest regards,\nThe PashuMitra Team`;

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
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const subject = 'Verify Your Email - PashuMitra Portal';
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #4CAF50; color: white; padding: 20px; text-align: center;">
        <h2>📧 Email Verification Required</h2>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h3>Hello ${name}!</h3>
        <p>Please verify your email address to complete registration.</p>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${verificationUrl}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a>
        </div>
        
        <p>Or copy this link: <br><code>${verificationUrl}</code></p>
        <p><small>This link expires in 24 hours.</small></p>
      </div>
    </div>`;

    const textContent = `Email Verification Required\n\nHello ${name}!\n\nPlease verify your email: ${verificationUrl}\n\nThis link expires in 24 hours.`;

    return await this.sendEmail({
      to: email,
      subject,
      htmlContent,
      textContent
    });
  }
}

module.exports = new SendGridEmailService();