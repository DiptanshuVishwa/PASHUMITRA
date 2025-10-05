const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const logger = require('../utils/logger');

class OAuth2GmailService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URL || 'https://developers.google.com/oauthplayground'
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });

    this.fromEmail = process.env.EMAIL_FROM || 'team.pashumitra@gmail.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'PashuMitra Portal';
  }

  async getAccessToken() {
    try {
      const { token } = await this.oauth2Client.getAccessToken();
      return token;
    } catch (error) {
      logger.error('Error getting Gmail access token:', error.message);
      throw error;
    }
  }

  async sendEmail(emailData) {
    try {
      const accessToken = await this.getAccessToken();
      
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: this.fromEmail,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });

      const { to, subject, htmlContent, textContent, replyTo } = emailData;

      const mailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject: subject,
        ...(textContent && { text: textContent }),
        ...(htmlContent && { html: htmlContent }),
        ...(replyTo && { replyTo })
      };

      const result = await transporter.sendMail(mailOptions);
      
      logger.info(`OAuth2 Gmail email sent successfully: ${result.messageId}`, {
        to: Array.isArray(to) ? to.join(', ') : to,
        subject
      });

      return {
        success: true,
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error sending OAuth2 Gmail email:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new OAuth2GmailService();