const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Middleware to check if user's email is verified
 * Use this on routes that require email verification
 */
const requireEmailVerification = async (req, res, next) => {
  try {
    // Check if user is authenticated first
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Get fresh user data to check verification status
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      logger.warn(`Access denied for unverified email: ${user.email}`, {
        userId: user._id,
        route: req.path,
        method: req.method,
        ip: req.ip
      });

      return res.status(403).json({
        success: false,
        message: 'Email verification required to access this feature',
        code: 'EMAIL_NOT_VERIFIED',
        data: {
          email: user.email,
          verificationRequired: true,
          verificationSentAt: user.emailVerificationToken ? 'pending' : null
        }
      });
    }

    // Email is verified, proceed to next middleware
    next();

  } catch (error) {
    logger.error('Error in email verification middleware:', {
      error: error.message,
      userId: req.user?._id,
      route: req.path
    });

    return res.status(500).json({
      success: false,
      message: 'Server error during email verification check',
      code: 'VERIFICATION_CHECK_ERROR'
    });
  }
};

/**
 * Middleware to warn about unverified email (doesn't block access)
 * Use this on routes where email verification is recommended but not required
 */
const warnEmailVerification = async (req, res, next) => {
  try {
    if (req.user && req.user._id) {
      const user = await User.findById(req.user._id);
      
      if (user && !user.emailVerified) {
        // Add warning to response headers
        res.set('X-Email-Verification-Warning', 'Email verification recommended');
        
        // Add verification info to request object for later use
        req.emailVerificationWarning = {
          email: user.email,
          verificationRequired: false,
          verificationRecommended: true
        };

        logger.info(`User accessing with unverified email: ${user.email}`, {
          userId: user._id,
          route: req.path,
          method: req.method
        });
      }
    }

    next();

  } catch (error) {
    logger.error('Error in email verification warning middleware:', {
      error: error.message,
      userId: req.user?._id,
      route: req.path
    });

    // Don't block the request on error, just log and continue
    next();
  }
};

/**
 * Check email verification status for current user
 */
const checkEmailVerificationStatus = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const verificationStatus = {
      email: user.email,
      isVerified: user.emailVerified,
      hasPendingVerification: !!user.emailVerificationToken,
      verificationTokenExpiry: user.emailVerificationExpire || null,
      canResendVerification: true
    };

    // Check if token has expired
    if (user.emailVerificationExpire && user.emailVerificationExpire < Date.now()) {
      verificationStatus.hasPendingVerification = false;
      verificationStatus.tokenExpired = true;
    }

    return res.status(200).json({
      success: true,
      message: 'Email verification status retrieved',
      data: verificationStatus
    });

  } catch (error) {
    logger.error('Error checking email verification status:', {
      error: error.message,
      userId: req.user?._id
    });

    return res.status(500).json({
      success: false,
      message: 'Server error checking verification status',
      code: 'STATUS_CHECK_ERROR'
    });
  }
};

/**
 * Middleware to automatically refresh verification status in user object
 */
const refreshVerificationStatus = async (req, res, next) => {
  try {
    if (req.user && req.user._id) {
      const freshUser = await User.findById(req.user._id);
      
      if (freshUser) {
        // Update the req.user with fresh verification status
        req.user.emailVerified = freshUser.emailVerified;
        req.user.emailVerificationToken = freshUser.emailVerificationToken;
        req.user.emailVerificationExpire = freshUser.emailVerificationExpire;
      }
    }

    next();

  } catch (error) {
    logger.error('Error refreshing verification status:', {
      error: error.message,
      userId: req.user?._id
    });

    // Don't block the request on error
    next();
  }
};

/**
 * Get verification statistics (for admin dashboard)
 */
const getVerificationStatistics = async (req, res) => {
  try {
    // Check if user has admin permissions
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        code: 'ADMIN_REQUIRED'
      });
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get verification statistics
    const stats = await Promise.all([
      // Total users
      User.countDocuments({}),
      
      // Verified users
      User.countDocuments({ emailVerified: true }),
      
      // Unverified users
      User.countDocuments({ emailVerified: false }),
      
      // Users with pending verification
      User.countDocuments({ 
        emailVerificationToken: { $exists: true, $ne: null },
        emailVerificationExpire: { $gt: now }
      }),
      
      // Users with expired verification tokens
      User.countDocuments({
        emailVerificationToken: { $exists: true, $ne: null },
        emailVerificationExpire: { $lt: now }
      }),
      
      // Users registered in last 24 hours
      User.countDocuments({ 
        createdAt: { $gte: twentyFourHoursAgo }
      }),
      
      // Users verified in last 7 days
      User.countDocuments({ 
        emailVerified: true,
        updatedAt: { $gte: sevenDaysAgo }
      })
    ]);

    const [
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      pendingVerification,
      expiredTokens,
      newRegistrations24h,
      recentVerifications7d
    ] = stats;

    const verificationRate = totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(2) : 0;

    return res.status(200).json({
      success: true,
      message: 'Verification statistics retrieved',
      data: {
        totalUsers,
        verifiedUsers,
        unverifiedUsers,
        pendingVerification,
        expiredTokens,
        verificationRate: parseFloat(verificationRate),
        newRegistrations24h,
        recentVerifications7d,
        timestamp: now.toISOString()
      }
    });

  } catch (error) {
    logger.error('Error getting verification statistics:', {
      error: error.message,
      userId: req.user?._id
    });

    return res.status(500).json({
      success: false,
      message: 'Server error retrieving statistics',
      code: 'STATS_ERROR'
    });
  }
};

module.exports = {
  requireEmailVerification,
  warnEmailVerification,
  checkEmailVerificationStatus,
  refreshVerificationStatus,
  getVerificationStatistics
};