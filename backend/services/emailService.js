const { SESClient, SendEmailCommand, SendBulkEmailCommand, GetSendQuotaCommand, GetSendStatisticsCommand } = require('@aws-sdk/client-ses');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.sesClient = new SESClient({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.fromEmail = process.env.EMAIL_FROM || 'noreply@pashumnitra.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'PashuMitra Portal';
    this.replyToEmail = process.env.EMAIL_REPLY_TO || this.fromEmail;
  }

  /**
   * Send single email using AWS SES
   * @param {Object} emailData - Email configuration
   */
  async sendEmail(emailData) {
    try {
      const { to, subject, htmlContent, textContent, replyTo, ccEmails, bccEmails } = emailData;

      if (!to || !subject || (!htmlContent && !textContent)) {
        throw new Error('Missing required email parameters: to, subject, and content');
      }

      const params = {
        Source: `${this.fromName} <${this.fromEmail}>`,
        Destination: {
          ToAddresses: Array.isArray(to) ? to : [to],
          ...(ccEmails && { CcAddresses: Array.isArray(ccEmails) ? ccEmails : [ccEmails] }),
          ...(bccEmails && { BccAddresses: Array.isArray(bccEmails) ? bccEmails : [bccEmails] })
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8'
          },
          Body: {}
        },
        ...(replyTo && { ReplyToAddresses: [replyTo] })
      };

      // Add HTML content if provided
      if (htmlContent) {
        params.Message.Body.Html = {
          Data: htmlContent,
          Charset: 'UTF-8'
        };
      }

      // Add text content if provided
      if (textContent) {
        params.Message.Body.Text = {
          Data: textContent,
          Charset: 'UTF-8'
        };
      }

      const command = new SendEmailCommand(params);
      const result = await this.sesClient.send(command);

      logger.info(`Email sent successfully: ${result.MessageId}`, {
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        messageId: result.MessageId
      });

      return {
        success: true,
        messageId: result.MessageId,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error sending email:', {
        error: error.message,
        errorCode: error.Code,
        errorType: error.name,
        to: emailData.to,
        subject: emailData.subject,
        fromEmail: this.fromEmail
      });
      
      console.error('Full email error details:', error);

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(userData) {
    const { email, name } = userData;

    const subject = 'Welcome to PashuMitra Portal! 🐄';
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
   * Send email verification
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

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(userData, resetToken) {
    const { email, name } = userData;
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const subject = 'Reset Your Password - PashuMitra Portal';
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Password Reset</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .button { display: inline-block; background: #f44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🔐 Password Reset Request</h2>
        </div>
        <div class="content">
            <h3>Hello ${name}!</h3>
            <p>We received a request to reset your password for your PashuMitra Portal account.</p>
            
            <p><a href="${resetUrl}" class="button">Reset Password</a></p>
            
            <p>If the button doesn't work, please copy and paste this link into your browser:</p>
            <p><code>${resetUrl}</code></p>
            
            <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                    <li>This link will expire in 10 minutes for security</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>Your current password will remain active until reset</li>
                </ul>
            </div>
            
            <p>If you continue to have problems, please contact our support team.</p>
        </div>
    </div>
</body>
</html>`;

    return await this.sendEmail({
      to: email,
      subject,
      htmlContent,
      textContent: `Password Reset Request\n\nHello ${name}!\n\nWe received a request to reset your password for your PashuMitra Portal account.\n\nClick here to reset: ${resetUrl}\n\nThis link will expire in 10 minutes for security.\n\nIf you didn't request this reset, please ignore this email.`
    });
  }

  /**
   * Send critical alert notification email
   */
  async sendAlertNotificationEmail(alertData, recipientData) {
    const { animalId, alertType, severity, description, location, timestamp } = alertData;
    const { email, name } = recipientData;

    const subject = `🚨 URGENT: ${alertType} Alert - Animal ${animalId}`;
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Critical Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .alert-header { background: #f44336; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .alert-details { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 15px 0; }
        .severity-${severity?.toLowerCase()} { border-color: ${severity === 'Critical' ? '#f44336' : '#ff9800'}; }
        .action-needed { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="alert-header">
            <h2>🚨 LIVESTOCK ALERT</h2>
        </div>
        <div class="content">
            <h3>Hello ${name}!</h3>
            <p>An urgent alert has been triggered for one of your livestock animals. Immediate attention may be required.</p>
            
            <div class="alert-details severity-${severity?.toLowerCase()}">
                <h4>Alert Details:</h4>
                <ul>
                    <li><strong>Animal ID:</strong> ${animalId}</li>
                    <li><strong>Alert Type:</strong> ${alertType}</li>
                    <li><strong>Severity:</strong> ${severity}</li>
                    <li><strong>Location:</strong> ${location}</li>
                    <li><strong>Time:</strong> ${new Date(timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</li>
                </ul>
                <p><strong>Description:</strong> ${description}</p>
            </div>
            
            ${severity === 'Critical' ? `
            <div class="action-needed">
                <h4>⚠️ Immediate Action Required:</h4>
                <ul>
                    <li>Contact a veterinarian immediately</li>
                    <li>Isolate the animal if necessary</li>
                    <li>Monitor vital signs closely</li>
                    <li>Document any changes in condition</li>
                </ul>
            </div>
            ` : ''}
            
            <p><a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">View Dashboard</a></p>
        </div>
    </div>
</body>
</html>`;

    return await this.sendEmail({
      to: email,
      subject,
      htmlContent,
      textContent: `LIVESTOCK ALERT\n\nHello ${name}!\n\nAn urgent alert has been triggered:\n\nAnimal ID: ${animalId}\nAlert Type: ${alertType}\nSeverity: ${severity}\nLocation: ${location}\nTime: ${new Date(timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n\nDescription: ${description}\n\n${severity === 'Critical' ? 'IMMEDIATE ACTION REQUIRED - Contact a veterinarian immediately!' : 'Please monitor the situation closely.'}`
    });
  }

  /**
   * Send appointment confirmation email
   */
  async sendAppointmentConfirmationEmail(appointmentData, userData) {
    const { appointmentId, veterinarianName, scheduledTime, location, animalId } = appointmentData;
    const { email, name } = userData;

    const subject = `✅ Appointment Confirmed - Dr. ${veterinarianName}`;
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Appointment Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .appointment-details { background: #e8f5e8; padding: 20px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>✅ Appointment Confirmed</h2>
        </div>
        <div class="content">
            <h3>Hello ${name}!</h3>
            <p>Your veterinary appointment has been successfully confirmed.</p>
            
            <div class="appointment-details">
                <h4>📅 Appointment Details:</h4>
                <ul>
                    <li><strong>Appointment ID:</strong> ${appointmentId}</li>
                    <li><strong>Veterinarian:</strong> Dr. ${veterinarianName}</li>
                    <li><strong>Animal ID:</strong> ${animalId}</li>
                    <li><strong>Date & Time:</strong> ${new Date(scheduledTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</li>
                    <li><strong>Location:</strong> ${location}</li>
                </ul>
            </div>
            
            <p><strong>⏰ Please arrive 10 minutes early for your appointment.</strong></p>
            <p>We'll send you a reminder 24 hours before your scheduled appointment.</p>
            
            <p>If you need to reschedule or cancel, please contact us at least 2 hours before the appointment time.</p>
        </div>
    </div>
</body>
</html>`;

    return await this.sendEmail({
      to: email,
      subject,
      htmlContent,
      textContent: `Appointment Confirmed\n\nHello ${name}!\n\nAppointment Details:\nID: ${appointmentId}\nVeterinarian: Dr. ${veterinarianName}\nAnimal ID: ${animalId}\nDate & Time: ${new Date(scheduledTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\nLocation: ${location}\n\nPlease arrive 10 minutes early.\n\nFor changes, contact us at least 2 hours before the appointment.`
    });
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmail(emailData) {
    try {
      const { recipients, subject, htmlContent, textContent } = emailData;

      if (!recipients || recipients.length === 0) {
        throw new Error('Recipients list is required for bulk email');
      }

      const destinations = recipients.map(recipient => ({
        Destination: {
          ToAddresses: [recipient.email]
        },
        ReplacementTemplateData: JSON.stringify(recipient.templateData || {})
      }));

      const params = {
        Source: `${this.fromName} <${this.fromEmail}>`,
        Destinations: destinations,
        DefaultTemplateData: JSON.stringify({}),
        Template: {
          TemplateName: 'PashuMitra-Bulk-Template',
          Subject: subject,
          HtmlPart: htmlContent,
          TextPart: textContent
        }
      };

      const command = new SendBulkEmailCommand(params);
      const result = await this.sesClient.send(command);

      logger.info(`Bulk email sent to ${recipients.length} recipients`, {
        subject,
        messageId: result.MessageId
      });

      return {
        success: true,
        messageId: result.MessageId,
        recipientCount: recipients.length
      };

    } catch (error) {
      logger.error('Error sending bulk email:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get sending statistics
   */
  async getSendingStatistics() {
    try {
      const [quotaResult, statsResult] = await Promise.all([
        this.sesClient.send(new GetSendQuotaCommand({})),
        this.sesClient.send(new GetSendStatisticsCommand({}))
      ]);

      return {
        quota: {
          max24HourSend: quotaResult.Max24HourSend,
          maxSendRate: quotaResult.MaxSendRate,
          sentLast24Hours: quotaResult.SentLast24Hours
        },
        statistics: statsResult.SendDataPoints,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting SES statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new EmailService();