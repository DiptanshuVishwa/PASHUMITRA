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

    const subject = '🔐 Verify Your Email - PashuMitra Portal';
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Email Verification - PashuMitra Portal</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        /* Base styles */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f7fa;
            margin: 0;
            padding: 0;
        }
        
        .email-wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f4f7fa;
            padding: 20px 0;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
            color: white;
            text-align: center;
            padding: 40px 30px 30px;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 20px;
            background: white;
            border-radius: 50% 50% 0 0 / 20px 20px 0 0;
        }
        
        .header-icon {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .content {
            padding: 40px 30px;
            background: white;
        }
        
        .greeting {
            font-size: 20px;
            color: #2E7D32;
            margin-bottom: 20px;
            font-weight: 600;
        }
        
        .message {
            font-size: 16px;
            line-height: 1.6;
            color: #555;
            margin-bottom: 30px;
        }
        
        .cta-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
            color: white !important;
            text-decoration: none;
            padding: 18px 40px;
            border-radius: 50px;
            font-size: 18px;
            font-weight: 600;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
            border: none;
            cursor: pointer;
        }
        
        .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
        }
        
        .backup-link {
            background: #f8f9fa;
            border: 2px dashed #ddd;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
        }
        
        .backup-link p {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #666;
        }
        
        .backup-link code {
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 10px;
            font-size: 12px;
            color: #333;
            word-break: break-all;
            display: block;
            margin-top: 10px;
        }
        
        .security-notice {
            background: linear-gradient(135deg, #fff3e0 0%, #ffe0b3 100%);
            border-left: 4px solid #ff9800;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }
        
        .security-notice-title {
            color: #f57c00;
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
        }
        
        .security-notice-title::before {
            content: '🔒';
            margin-right: 8px;
        }
        
        .security-notice p {
            color: #bf5000;
            margin: 5px 0;
            font-size: 14px;
        }
        
        .benefits {
            background: #f1f8e9;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .benefits h3 {
            color: #2E7D32;
            font-size: 18px;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .benefits-list {
            list-style: none;
            padding: 0;
        }
        
        .benefits-list li {
            padding: 8px 0;
            display: flex;
            align-items: center;
            color: #4CAF50;
            font-size: 14px;
        }
        
        .benefits-list li::before {
            content: '✓';
            background: #4CAF50;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            font-weight: bold;
            font-size: 12px;
        }
        
        .footer {
            background: #f8f9fa;
            text-align: center;
            padding: 30px;
            border-top: 1px solid #eee;
        }
        
        .footer p {
            margin: 5px 0;
            color: #666;
            font-size: 12px;
        }
        
        .social-links {
            margin: 20px 0;
        }
        
        .social-links a {
            display: inline-block;
            width: 36px;
            height: 36px;
            background: #ddd;
            border-radius: 50%;
            margin: 0 8px;
            text-decoration: none;
            color: white;
            line-height: 36px;
            font-size: 16px;
        }
        
        /* Mobile responsiveness */
        @media screen and (max-width: 600px) {
            .email-container {
                max-width: 100%;
                margin: 0 10px;
                border-radius: 8px;
            }
            
            .header, .content, .footer {
                padding: 20px 15px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .verify-button {
                padding: 16px 30px;
                font-size: 16px;
                display: block;
                margin: 0 auto;
                max-width: 280px;
            }
            
            .greeting {
                font-size: 18px;
            }
            
            .message {
                font-size: 15px;
            }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .backup-link {
                background: #2a2a2a;
                border-color: #555;
            }
            
            .backup-link code {
                background: #1a1a1a;
                border-color: #555;
                color: #ccc;
            }
        }
    </style>
</head>
<body>
    <table class="email-wrapper" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td align="center">
                <div class="email-container">
                    <div class="header">
                        <div class="header-icon">🔐</div>
                        <h1>Email Verification</h1>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">Hello ${name}!</div>
                        
                        <div class="message">
                            Welcome to <strong>PashuMitra Portal</strong> - India's most trusted livestock management platform! 
                            To get started and secure your account, please verify your email address.
                        </div>
                        
                        <div class="benefits">
                            <h3>🎯 What's waiting for you:</h3>
                            <ul class="benefits-list">
                                <li>Real-time livestock health monitoring</li>
                                <li>Instant disease outbreak alerts</li>
                                <li>Direct access to certified veterinarians</li>
                                <li>Comprehensive health analytics dashboard</li>
                                <li>Digital medical records management</li>
                            </ul>
                        </div>
                        
                        <div class="cta-container">
                            <a href="${verificationUrl}" class="verify-button">🔓 Verify Email Address</a>
                        </div>
                        
                        <div class="backup-link">
                            <p><strong>Can't click the button?</strong></p>
                            <p>Copy and paste this link into your browser:</p>
                            <code>${verificationUrl}</code>
                        </div>
                        
                        <div class="security-notice">
                            <div class="security-notice-title">Security Information</div>
                            <p>• This verification link expires in <strong>24 hours</strong></p>
                            <p>• If you didn't create this account, simply ignore this email</p>
                            <p>• Never share this link with anyone else</p>
                        </div>
                        
                        <p style="margin-top: 30px; color: #666; font-size: 14px; text-align: center;">
                            Need help? Contact our support team at 
                            <a href="mailto:team.pashumitra@gmail.com" style="color: #4CAF50;">team.pashumitra@gmail.com</a>
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p><strong>PashuMitra Portal</strong></p>
                        <p>Protecting livestock, empowering farmers</p>
                        <div class="social-links">
                            <a href="#" style="background: #1877f2;">📘</a>
                            <a href="#" style="background: #1da1f2;">🐦</a>
                            <a href="#" style="background: #0077b5;">💼</a>
                        </div>
                        <p>© ${new Date().getFullYear()} PashuMitra Portal. All rights reserved.</p>
                        <p>Made with ❤️ for Indian farmers and livestock owners</p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`;

    const textContent = `
🔐 EMAIL VERIFICATION REQUIRED

Hello ${name}!

Welcome to PashuMitra Portal - India's most trusted livestock management platform!

To get started and secure your account, please verify your email address.

🎯 What's waiting for you:
• Real-time livestock health monitoring
• Instant disease outbreak alerts  
• Direct access to certified veterinarians
• Comprehensive health analytics dashboard
• Digital medical records management

🔗 VERIFY YOUR EMAIL:
Click here: ${verificationUrl}

🔒 SECURITY INFORMATION:
• This verification link expires in 24 hours
• If you didn't create this account, simply ignore this email
• Never share this link with anyone else

Need help? Contact our support team at team.pashumitra@gmail.com

© ${new Date().getFullYear()} PashuMitra Portal - Made with ❤️ for Indian farmers`;

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