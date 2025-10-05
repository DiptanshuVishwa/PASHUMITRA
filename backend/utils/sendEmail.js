const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async (options) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Email options
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      html: options.message,
      // Text fallback
      text: options.message.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    logger.info('Email sent successfully', {
      messageId: info.messageId,
      to: options.email,
      subject: options.subject,
      response: info.response
    });

    return info;
  } catch (error) {
    logger.error('Email sending failed:', {
      error: error.message,
      to: options.email,
      subject: options.subject,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    throw new Error('Email could not be sent');
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Welcome to PashuMitra Portal!</h2>
      
      <p>Dear ${user.name},</p>
      
      <p>Welcome to PashuMitra Portal - your comprehensive livestock disease monitoring and management platform.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2c3e50; margin-top: 0;">What you can do with your account:</h3>
        <ul style="color: #555; line-height: 1.6;">
          <li>🚨 Report livestock disease alerts in your area</li>
          <li>🗺️ View real-time disease outbreak maps</li>
          <li>👨‍⚕️ Connect with verified veterinarians</li>
          <li>📊 Access dashboard with disease statistics</li>
          <li>💬 Get support for your livestock concerns</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/dashboard" 
           style="background-color: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Go to Dashboard
        </a>
      </div>
      
      <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; color: #666; font-size: 14px;">
        <p>Need help getting started? Contact our support team at <a href="mailto:support@pashumnitra.com">support@pashumnitra.com</a></p>
        <p>Best regards,<br>The PashuMitra Team</p>
      </div>
    </div>
  `;

  return await sendEmail({
    email: user.email,
    subject: 'Welcome to PashuMitra Portal! 🐄🎉',
    message
  });
};

// Send alert notification email
const sendAlertNotification = async (user, alert) => {
  const severityColors = {
    low: '#28a745',
    medium: '#ffc107', 
    high: '#fd7e14',
    critical: '#dc3545'
  };

  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: ${severityColors[alert.severity]}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">🚨 New ${alert.severity.toUpperCase()} Alert</h2>
      </div>
      
      <div style="border: 1px solid #ddd; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
        <h3 style="color: #2c3e50; margin-top: 0;">${alert.title}</h3>
        
        <p style="color: #555; line-height: 1.6;">${alert.description}</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="color: #2c3e50; margin: 0 0 10px 0;">Alert Details:</h4>
          <p style="margin: 5px 0; color: #555;"><strong>Category:</strong> ${alert.category}</p>
          <p style="margin: 5px 0; color: #555;"><strong>Location:</strong> ${alert.location.village ? alert.location.village + ', ' : ''}${alert.location.district}, ${alert.location.state}</p>
          <p style="margin: 5px 0; color: #555;"><strong>Affected Animals:</strong> ${alert.affectedAnimals.count} ${alert.affectedAnimals.species}</p>
          <p style="margin: 5px 0; color: #555;"><strong>Status:</strong> ${alert.status}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/alerts/${alert._id}" 
             style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Full Alert
          </a>
        </div>
        
        <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; color: #666; font-size: 14px;">
          <p>You're receiving this notification because you've subscribed to alerts in your area.</p>
          <p>Stay informed, stay protected.</p>
          <p>Best regards,<br>The PashuMitra Team</p>
        </div>
      </div>
    </div>
  `;

  return await sendEmail({
    email: user.email,
    subject: `🚨 ${alert.severity.toUpperCase()} Alert: ${alert.title}`,
    message
  });
};

// Send contact form acknowledgment
const sendContactAcknowledgment = async (contact) => {
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Thank you for contacting us!</h2>
      
      <p>Dear ${contact.name},</p>
      
      <p>We have received your message and will get back to you as soon as possible.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2c3e50; margin-top: 0;">Your Message Details:</h3>
        <p style="margin: 5px 0; color: #555;"><strong>Subject:</strong> ${contact.subject}</p>
        <p style="margin: 5px 0; color: #555;"><strong>Category:</strong> ${contact.category}</p>
        <p style="margin: 5px 0; color: #555;"><strong>Priority:</strong> ${contact.priority}</p>
        <p style="margin: 15px 0 5px 0; color: #555;"><strong>Message:</strong></p>
        <p style="color: #666; font-style: italic; padding: 10px; background-color: #fff; border-left: 4px solid #3498db;">${contact.message}</p>
      </div>
      
      <div style="background-color: #e8f5e8; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; color: #155724;"><strong>What happens next?</strong></p>
        <p style="margin: 5px 0 0 0; color: #155724;">Our support team will review your message and respond within 24-48 hours. For urgent matters, please call our helpline.</p>
      </div>
      
      <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; color: #666; font-size: 14px;">
        <p>If you have any additional questions, feel free to reach out to us at <a href="mailto:support@pashumnitra.com">support@pashumnitra.com</a></p>
        <p>Best regards,<br>The PashuMitra Support Team</p>
      </div>
    </div>
  `;

  return await sendEmail({
    email: contact.email,
    subject: 'We received your message - PashuMitra Portal',
    message
  });
};

// Send newsletter/updates email
const sendNewsletterEmail = async (users, content) => {
  const promises = users.map(user => {
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${content.replace('{{user.name}}', user.name)}
        
        <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; color: #666; font-size: 14px; text-align: center;">
          <p>You're receiving this because you subscribed to PashuMitra Portal updates.</p>
          <p><a href="${process.env.FRONTEND_URL}/unsubscribe?token=${user._id}" style="color: #666;">Unsubscribe</a></p>
        </div>
      </div>
    `;

    return sendEmail({
      email: user.email,
      subject: 'PashuMitra Portal Newsletter',
      message
    });
  });

  return await Promise.allSettled(promises);
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    });

    await transporter.verify();
    logger.info('Email configuration is valid');
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    logger.error('Email configuration test failed:', error);
    return { success: false, message: 'Email configuration is invalid', error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendAlertNotification,
  sendContactAcknowledgment,
  sendNewsletterEmail,
  testEmailConfig
};