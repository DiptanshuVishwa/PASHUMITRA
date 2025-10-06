const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class GmailEmailService {
  constructor() {
    // Gmail SMTP configuration
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || process.env.EMAIL_FROM,
        pass: process.env.GMAIL_APP_PASSWORD // This will need to be set
      }
    });

    this.fromEmail = process.env.EMAIL_FROM || 'team.pashumitra@gmail.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'PashuMitra Portal';
  }

  /**
   * Send email using Gmail SMTP
   */
  async sendEmail(emailData) {
    try {
      const { to, subject, htmlContent, textContent, replyTo, ccEmails, bccEmails } = emailData;

      if (!to || !subject || (!htmlContent && !textContent)) {
        throw new Error('Missing required email parameters: to, subject, and content');
      }

      const mailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject: subject,
        ...(replyTo && { replyTo }),
        ...(ccEmails && { cc: Array.isArray(ccEmails) ? ccEmails.join(', ') : ccEmails }),
        ...(bccEmails && { bcc: Array.isArray(bccEmails) ? bccEmails.join(', ') : bccEmails })
      };

      // Add content
      if (textContent) {
        mailOptions.text = textContent;
      }
      if (htmlContent) {
        mailOptions.html = htmlContent;
      }

      const result = await this.transporter.sendMail(mailOptions);

      logger.info(`Gmail email sent successfully: ${result.messageId}`, {
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        messageId: result.messageId
      });

      return {
        success: true,
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error sending Gmail email:', {
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
   * Test Gmail SMTP connection
   */
  async testConnection() {
    try {
      await this.transporter.verify();
      logger.info('Gmail SMTP connection verified successfully');
      return { success: true, message: 'Gmail SMTP connection verified' };
    } catch (error) {
      logger.error('Gmail SMTP connection failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email using Gmail SMTP
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
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; font-size: 12px; color: #666; }
        .highlight { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐄 Welcome to PashuMitra Portal!</h1>
        </div>
        <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for joining PashuMitra Portal, India's leading livestock disease monitoring and management system.</p>
            
            <div class="highlight">
                <h3>🎯 What you can do with PashuMitra Portal:</h3>
                <ul>
                    <li>📊 Monitor your livestock health in real-time</li>
                    <li>🚨 Receive instant alerts for health issues</li>
                    <li>🩺 Connect with certified veterinarians</li>
                    <li>📈 Track health trends and analytics</li>
                    <li>📁 Manage medical records and documents</li>
                </ul>
            </div>
            
            <p>Your account is now active and ready to use. Please verify your email address to access all features.</p>
            
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
            
            <p>If you have any questions or need assistance, our support team is here to help you 24/7.</p>
            
            <p>Best regards,<br>The PashuMitra Team</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} PashuMitra Portal. All rights reserved.</p>
            <p>Made with ❤️ for Indian farmers and livestock owners</p>
        </div>
    </div>
</body>
</html>`;

    const textContent = `
Welcome to PashuMitra Portal!

Hello ${name}!

Thank you for joining PashuMitra Portal, India's leading livestock disease monitoring and management system.

What you can do with PashuMitra Portal:
- Monitor your livestock health in real-time
- Receive instant alerts for health issues
- Connect with certified veterinarians
- Track health trends and analytics
- Manage medical records and documents

Your account is now active and ready to use. Please verify your email address to access all features.

Visit your dashboard: ${process.env.FRONTEND_URL}/dashboard

If you have any questions or need assistance, our support team is here to help you 24/7.

Best regards,
The PashuMitra Team

© ${new Date().getFullYear()} PashuMitra Portal. All rights reserved.
Made with ❤️ for Indian farmers and livestock owners`;

    return await this.sendEmail({
      to: email,
      subject,
      htmlContent,
      textContent
    });
  }

  /**
   * Send email verification using Gmail SMTP
   */
  async sendEmailVerification(userData, verificationToken) {
    const { email, name } = userData;
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    const subject = 'Verify Your Email - PashuMitra Portal';
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Email Verification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>📧 Email Verification Required</h2>
        </div>
        <div class="content">
            <h3>Hello ${name}!</h3>
            <p>Thank you for registering with PashuMitra Portal. To complete your registration and secure your account, please verify your email address.</p>
            
            <p><a href="${verificationUrl}" class="button">Verify Email Address</a></p>
            
            <p>If the button doesn't work, please copy and paste this link into your browser:</p>
            <p><code>${verificationUrl}</code></p>
            
            <p>This verification link will expire in 24 hours for security reasons.</p>
            
            <p>If you didn't create this account, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} PashuMitra Portal</p>
        </div>
    </div>
</body>
</html>`;

    const textContent = `
Email Verification Required

Hello ${name}!

Thank you for registering with PashuMitra Portal. To complete your registration and secure your account, please verify your email address.

Click here to verify: ${verificationUrl}

This verification link will expire in 24 hours for security reasons.

If you didn't create this account, please ignore this email.

© ${new Date().getFullYear()} PashuMitra Portal`;

    return await this.sendEmail({
      to: email,
      subject,
      htmlContent,
      textContent
    });
  }
}

// Export singleton instance
module.exports = new GmailEmailService();