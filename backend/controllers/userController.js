const User = require('../models/User');
const logger = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all users with filtering and pagination (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      isActive,
      isEmailVerified,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo
    } = req.query;

    // Build filter object
    const filters = {};
    
    if (role) filters.role = role;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (isEmailVerified !== undefined) filters.isEmailVerified = isEmailVerified === 'true';
    
    // Date range filter
    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) filters.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filters.createdAt.$lte = new Date(dateTo);
    }

    // Text search across name and email
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const users = await User.find(filters)
      .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken')
      .sort(sortOptions)
      .limit(limitNum)
      .skip(skip);

    // Get total count for pagination
    const total = await User.countDocuments(filters);
    const totalPages = Math.ceil(total / limitNum);

    logger.info('Users retrieved by admin', {
      count: users.length,
      total,
      page: pageNum,
      filters,
      adminId: req.user._id
    });

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages,
        total,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      data: users
    });
  } catch (error) {
    logger.error('Get users failed:', {
      error: error.message,
      query: req.query,
      adminId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private (Admin or Self)
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can access this profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this user profile'
      });
    }

    logger.info('User profile accessed', {
      userId: user._id,
      accessedBy: req.user._id,
      isAdmin: req.user.role === 'admin'
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Get user failed:', {
      error: error.message,
      userId: req.params.id,
      accessedBy: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private (Admin or Self)
const updateUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can update this profile
    const isAdmin = req.user.role === 'admin';
    const isOwner = req.user._id.toString() === user._id.toString();
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user profile'
      });
    }

    // Restrict role changes to admin only
    if (req.body.role && !isAdmin) {
      delete req.body.role;
    }

    // Restrict certain admin-only fields
    if (!isAdmin) {
      delete req.body.isActive;
      delete req.body.isEmailVerified;
      delete req.body.failedLoginAttempts;
      delete req.body.lockUntil;
      delete req.body.lastLogin;
    }

    // Update user
    user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken');

    logger.info('User profile updated', {
      userId: user._id,
      updatedBy: req.user._id,
      isAdmin: req.user.role === 'admin',
      updatedFields: Object.keys(req.body)
    });

    res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: user
    });
  } catch (error) {
    logger.error('Update user failed:', {
      error: error.message,
      userId: req.params.id,
      updatedBy: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to update user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await user.deleteOne();

    logger.info('User deleted by admin', {
      deletedUserId: user._id,
      deletedUserEmail: user.email,
      adminId: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user failed:', {
      error: error.message,
      userId: req.params.id,
      adminId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Toggle user active status (Admin only)
// @route   PUT /api/users/:id/toggle-status
// @access  Private (Admin)
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    // Toggle status
    user.isActive = !user.isActive;
    await user.save();

    // Send notification email if deactivated
    if (!user.isActive) {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Account Status Changed - PashuMitra Portal',
          template: 'accountDeactivated',
          data: {
            name: user.name
          }
        });
      } catch (emailError) {
        logger.warn('Failed to send account deactivation email:', {
          userId: user._id,
          error: emailError.message
        });
      }
    }

    logger.info('User status toggled', {
      userId: user._id,
      newStatus: user.isActive ? 'active' : 'inactive',
      adminId: req.user._id
    });

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        userId: user._id,
        isActive: user.isActive
      }
    });
  } catch (error) {
    logger.error('Toggle user status failed:', {
      error: error.message,
      userId: req.params.id,
      adminId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Change user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from changing their own role
    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Send notification email about role change
    try {
      await sendEmail({
        to: user.email,
        subject: 'Role Changed - PashuMitra Portal',
        template: 'roleChanged',
        data: {
          name: user.name,
          oldRole: oldRole,
          newRole: role,
          adminName: req.user.name
        }
      });
    } catch (emailError) {
      logger.warn('Failed to send role change email:', {
        userId: user._id,
        error: emailError.message
      });
    }

    logger.info('User role changed', {
      userId: user._id,
      oldRole,
      newRole: role,
      adminId: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        userId: user._id,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Change user role failed:', {
      error: error.message,
      userId: req.params.id,
      adminId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/statistics
// @access  Private (Admin)
const getUserStatistics = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.createdAt.$lte = new Date(dateTo);
    }

    // Aggregate statistics
    const statistics = await User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          inactiveUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
          },
          verifiedUsers: {
            $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] }
          },
          unverifiedUsers: {
            $sum: { $cond: [{ $eq: ['$isEmailVerified', false] }, 1, 0] }
          },
          adminUsers: {
            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
          },
          vetUsers: {
            $sum: { $cond: [{ $eq: ['$role', 'veterinarian'] }, 1, 0] }
          },
          regularUsers: {
            $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] }
          },
          lockedUsers: {
            $sum: { $cond: [{ $gt: ['$lockUntil', new Date()] }, 1, 0] }
          }
        }
      }
    ]);

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get user registrations by month (last 12 months)
    const twelveMonthsAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const monthlyRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const stats = statistics[0] || {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      verifiedUsers: 0,
      unverifiedUsers: 0,
      adminUsers: 0,
      vetUsers: 0,
      regularUsers: 0,
      lockedUsers: 0
    };

    logger.info('User statistics retrieved', {
      adminId: req.user._id,
      totalUsers: stats.totalUsers
    });

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        recentRegistrations,
        monthlyRegistrations
      }
    });
  } catch (error) {
    logger.error('Get user statistics failed:', {
      error: error.message,
      adminId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user roles list
// @route   GET /api/users/roles
// @access  Private (Admin)
const getUserRoles = async (req, res) => {
  try {
    const roles = [
      { key: 'user', label: 'Regular User', description: 'Standard user with basic permissions' },
      { key: 'veterinarian', label: 'Veterinarian', description: 'Licensed veterinarian with professional features' },
      { key: 'admin', label: 'Administrator', description: 'Full system access and management capabilities' },
      { key: 'staff', label: 'Staff Member', description: 'Staff with limited administrative access' }
    ];

    res.status(200).json({
      success: true,
      data: roles
    });
  } catch (error) {
    logger.error('Get user roles failed:', {
      error: error.message,
      adminId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user roles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Bulk update users (Admin only)
// @route   PUT /api/users/bulk-update
// @access  Private (Admin)
const bulkUpdateUsers = async (req, res) => {
  try {
    const { userIds, updates } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    // Prevent admin from bulk updating themselves
    if (userIds.includes(req.user._id.toString())) {
      return res.status(400).json({
        success: false,
        message: 'Cannot bulk update your own account'
      });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updates,
      { runValidators: true }
    );

    logger.info('Bulk user update performed', {
      adminId: req.user._id,
      userIds: userIds,
      updates: updates,
      modifiedCount: result.modifiedCount
    });

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} users updated successfully`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    logger.error('Bulk update users failed:', {
      error: error.message,
      adminId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to bulk update users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  changeUserRole,
  getUserStatistics,
  getUserRoles,
  bulkUpdateUsers
};