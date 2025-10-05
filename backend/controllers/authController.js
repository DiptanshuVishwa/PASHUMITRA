const crypto = require('crypto');
const User = require('../models/User');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');

// Send verification email function
const sendVerificationEmail = async (user, verificationToken, req) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #27ae60; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="margin: 0;">🎉 Welcome to PashuMitra Portal!</h2>
        </div>
        
        <div style="border: 1px solid #ddd; border-top: none; padding: 30px; border-radius: 0 0 8px 8px;">
          <p>Dear ${user.name},</p>
          
          <p>Thank you for registering with PashuMitra Portal - Your Partner in Farm Protection! 🐄</p>
          
          <p>To complete your registration and access all features, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #27ae60; color: white; padding: 15px 35px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
              ✅ Verify Email Address
            </a>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">What's waiting for you:</h3>
            <ul style="color: #555; line-height: 1.6;">
              <li>🚨 Report livestock health alerts instantly</li>
              <li>🗺️ Access real-time disease outbreak maps</li>
              <li>👨‍⚕️ Connect with verified veterinarians</li>
              <li>📊 View personalized farm health dashboard</li>
              <li>💬 Get expert support for your livestock</li>
            </ul>
          </div>
          
          <div style="border-left: 4px solid #3498db; padding: 15px; background-color: #f0f8ff; margin: 20px 0;">
            <p style="margin: 0; color: #2c3e50;"><strong>Can't click the button?</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Copy and paste this URL into your browser:</p>
            <p style="word-break: break-all; color: #3498db; font-size: 14px; margin: 10px 0 0 0;">${resetUrl}</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;"><strong>⏰ Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
          </div>
          
          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; color: #666; font-size: 14px;">
            <p>If you didn't create an account with PashuMitra Portal, please ignore this email.</p>
            <p>Need help? Contact our support team at <a href="mailto:team.pashumitra@gmail.com">team.pashumitra@gmail.com</a></p>
            <p>Best regards,<br><strong>The PashuMitra Team</strong> 🌾</p>
          </div>
        </div>
      </div>
    `;

    // Use AWS SES email service for verification email
    try {
      await emailService.sendEmailVerification(
        { email: user.email, name: user.name },
        verificationToken
      );
      logger.info(`Verification email sent successfully to: ${user.email}`);
    } catch (emailError) {
      logger.error(`Failed to send verification email to ${user.email}:`, emailError.message);
      // Don't fail registration if email fails
    }
    
    logger.info(`Verification email sent to: ${user.email}`);
  } catch (error) {
    logger.error(`Failed to send verification email to ${user.email}:`, error.message);
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'user',
      location
    });

    // Generate email verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    logger.info(`New user registered: ${email}`, {
      userId: user._id,
      role: user.role,
      ip: req.ip
    });

// Send verification email (don't wait for it)
    sendVerificationEmail(user, verificationToken, req).catch(error => {
      logger.error('Failed to send verification email:', error.message);
    });

    // Create token
    const token = user.getSignedJwtToken();

    // Remove password from response
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    delete userResponse.emailVerificationToken;
    delete userResponse.resetPasswordToken;

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      token,
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    logger.error('Registration failed:', {
      error: error.message,
      email: req.body.email,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists and get password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`, {
        ip: req.ip
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      logger.warn(`Login attempt on locked account: ${email}`, {
        userId: user._id,
        ip: req.ip
      });
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      logger.warn(`Login attempt on inactive account: ${email}`, {
        userId: user._id,
        ip: req.ip
      });
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      logger.warn(`Failed login attempt: ${email}`, {
        userId: user._id,
        ip: req.ip
      });

      // Increment login attempts
      await user.incLoginAttempts();

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts and update last login
    await user.resetLoginAttempts();
    await user.updateLastLogin();

    logger.info(`Successful login: ${email}`, {
      userId: user._id,
      ip: req.ip
    });

    // Create token
    const token = user.getSignedJwtToken();

    // Remove sensitive fields from response
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    delete userResponse.emailVerificationToken;
    delete userResponse.resetPasswordToken;
    delete userResponse.loginAttempts;
    delete userResponse.lockUntil;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    logger.error('Login failed:', {
      error: error.message,
      email: req.body.email,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    logger.error('Get current user failed:', {
      error: error.message,
      userId: req.user?._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'location', 'preferences'];
    const updates = {};

    // Only allow specific fields to be updated
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    logger.info(`Profile updated: ${user.email}`, {
      userId: user._id,
      updatedFields: Object.keys(updates),
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    logger.error('Profile update failed:', {
      error: error.message,
      userId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Profile update failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password field
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed: ${user.email}`, {
      userId: user._id,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    logger.error('Password change failed:', {
      error: error.message,
      userId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Password change failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    logger.info(`Password reset requested: ${email}`, {
      userId: user._id,
      ip: req.ip
    });

    // Send reset email (don't wait for it)
    sendPasswordResetEmail(user, resetToken, req);

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    logger.error('Forgot password failed:', {
      error: error.message,
      email: req.body.email,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      message: 'Email could not be sent'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    logger.info(`Password reset completed: ${user.email}`, {
      userId: user._id,
      ip: req.ip
    });

    // Create token
    const jwtToken = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token: jwtToken
    });
  } catch (error) {
    logger.error('Password reset failed:', {
      error: error.message,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // Get hashed token
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    logger.info(`Email verified: ${user.email}`, {
      userId: user._id,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    logger.error('Email verification failed:', {
      error: error.message,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      message: 'Email verification failed'
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    logger.info(`Verification email resent: ${email}`, {
      userId: user._id,
      ip: req.ip
    });

    // Send verification email
    sendVerificationEmail(user, verificationToken, req);

    res.status(200).json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    logger.error('Resend verification failed:', {
      error: error.message,
      email: req.body.email
    });

    res.status(500).json({
      success: false,
      message: 'Failed to send verification email'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    logger.info(`User logged out: ${req.user.email}`, {
      userId: req.user._id,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout failed:', {
      error: error.message,
      userId: req.user?._id
    });

    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};


// Helper function to send password reset email
const sendPasswordResetEmail = async (user, token, req) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const message = `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>You are receiving this email because you (or someone else) requested a password reset for your PashuMitra Portal account.</p>
      <p>Please click the button below to reset your password:</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${resetUrl}" style="background-color: #f44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
      <br>
      <p>Best regards,<br>The PashuMitra Team</p>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request - PashuMitra Portal',
      message
    });
  } catch (error) {
    logger.error('Failed to send password reset email:', {
      error: error.message,
      userId: user._id
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  logout
};