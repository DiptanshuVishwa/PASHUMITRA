const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Contact = require('../models/Contact');
const { startOfMonth, endOfMonth, subMonths, format } = require('date-fns');

// @desc    Get dashboard overview statistics
// @route   GET /api/dashboard/overview
// @access  Admin/Staff
const getDashboardOverview = asyncHandler(async (req, res) => {
  try {
    console.log('Fetching dashboard overview statistics...');

    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));
    const endOfLastMonth = endOfMonth(subMonths(now, 1));

    // User Statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfCurrentMonth }
    });
    const newUsersLastMonth = await User.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    // Contact Statistics
    const totalContacts = await Contact.countDocuments();
    const pendingContacts = await Contact.countDocuments({ status: 'pending' });
    const resolvedContacts = await Contact.countDocuments({ status: 'resolved' });
    const newContactsThisMonth = await Contact.countDocuments({
      createdAt: { $gte: startOfCurrentMonth }
    });

    // Role Distribution
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Contact Category Distribution
    const contactCategoryDistribution = await Contact.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Calculate growth rates
    const userGrowthRate = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(1)
      : newUsersThisMonth > 0 ? 100 : 0;

    const overview = {
      users: {
        total: totalUsers,
        active: activeUsers,
        verified: verifiedUsers,
        newThisMonth: newUsersThisMonth,
        growthRate: parseFloat(userGrowthRate),
        roleDistribution: roleDistribution.reduce((acc, role) => {
          acc[role._id] = role.count;
          return acc;
        }, {})
      },
      contacts: {
        total: totalContacts,
        pending: pendingContacts,
        resolved: resolvedContacts,
        newThisMonth: newContactsThisMonth,
        categoryDistribution: contactCategoryDistribution.reduce((acc, cat) => {
          acc[cat._id] = cat.count;
          return acc;
        }, {})
      },
      systemHealth: {
        activeUsersPercentage: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0,
        verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : 0,
        contactResolutionRate: totalContacts > 0 ? ((resolvedContacts / totalContacts) * 100).toFixed(1) : 0
      }
    };

    console.log('Dashboard overview statistics retrieved successfully');

    res.status(200).json({
      success: true,
      data: overview,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard overview',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
});

// @desc    Get user analytics data
// @route   GET /api/dashboard/user-analytics
// @access  Admin/Staff
const getUserAnalytics = asyncHandler(async (req, res) => {
  try {
    const { period = '6months', groupBy = 'month' } = req.query;

    console.log(`Fetching user analytics for period: ${period}, grouped by: ${groupBy}`);

    let dateRange;
    const now = new Date();

    // Set date range based on period
    switch (period) {
      case '1month':
        dateRange = { $gte: subMonths(now, 1) };
        break;
      case '3months':
        dateRange = { $gte: subMonths(now, 3) };
        break;
      case '6months':
        dateRange = { $gte: subMonths(now, 6) };
        break;
      case '1year':
        dateRange = { $gte: subMonths(now, 12) };
        break;
      default:
        dateRange = { $gte: subMonths(now, 6) };
    }

    // User registrations over time
    const userRegistrations = await User.aggregate([
      { $match: { createdAt: dateRange } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            ...(groupBy === 'day' && { day: { $dayOfMonth: '$createdAt' } })
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // User activity by role
    const roleActivity = await User.aggregate([
      { $match: { lastLogin: dateRange } },
      {
        $group: {
          _id: '$role',
          activeUsers: { $sum: 1 },
          avgLoginFrequency: { $avg: 1 } // This would need more complex calculation in real scenario
        }
      }
    ]);

    // Geographic distribution (if location data exists)
    const geographicDistribution = await User.aggregate([
      { $match: { 'location.state': { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$location.state',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // User engagement metrics
    const engagementMetrics = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          verifiedUsers: { $sum: { $cond: ['$isEmailVerified', 1, 0] } },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          usersWithLocation: { $sum: { $cond: [{ $ne: ['$location.state', null] }, 1, 0] } }
        }
      }
    ]);

    const analytics = {
      registrations: userRegistrations.map(reg => ({
        period: groupBy === 'day' 
          ? `${reg._id.year}-${String(reg._id.month).padStart(2, '0')}-${String(reg._id.day).padStart(2, '0')}`
          : `${reg._id.year}-${String(reg._id.month).padStart(2, '0')}`,
        count: reg.count
      })),
      roleActivity,
      geographicDistribution,
      engagementMetrics: engagementMetrics[0] || {
        totalUsers: 0,
        verifiedUsers: 0,
        activeUsers: 0,
        usersWithLocation: 0
      }
    };

    console.log('User analytics retrieved successfully');

    res.status(200).json({
      success: true,
      data: analytics,
      period,
      groupBy,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user analytics',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
});

// @desc    Get contact analytics data
// @route   GET /api/dashboard/contact-analytics
// @access  Admin/Staff
const getContactAnalytics = asyncHandler(async (req, res) => {
  try {
    const { period = '6months', groupBy = 'month' } = req.query;

    console.log(`Fetching contact analytics for period: ${period}, grouped by: ${groupBy}`);

    let dateRange;
    const now = new Date();

    // Set date range based on period
    switch (period) {
      case '1month':
        dateRange = { $gte: subMonths(now, 1) };
        break;
      case '3months':
        dateRange = { $gte: subMonths(now, 3) };
        break;
      case '6months':
        dateRange = { $gte: subMonths(now, 6) };
        break;
      case '1year':
        dateRange = { $gte: subMonths(now, 12) };
        break;
      default:
        dateRange = { $gte: subMonths(now, 6) };
    }

    // Contact submissions over time
    const contactSubmissions = await Contact.aggregate([
      { $match: { createdAt: dateRange } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            ...(groupBy === 'day' && { day: { $dayOfMonth: '$createdAt' } })
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Resolution time analysis
    const resolutionTimeAnalysis = await Contact.aggregate([
      { $match: { status: 'resolved', resolvedAt: { $exists: true } } },
      {
        $addFields: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$resolvedAt', '$createdAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: '$resolutionTime' },
          minResolutionTime: { $min: '$resolutionTime' },
          maxResolutionTime: { $max: '$resolutionTime' },
          totalResolved: { $sum: 1 }
        }
      }
    ]);

    // Category performance
    const categoryPerformance = await Contact.aggregate([
      { $match: { createdAt: dateRange } },
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } }
        }
      },
      {
        $addFields: {
          resolutionRate: {
            $multiply: [
              { $divide: ['$resolved', '$total'] },
              100
            ]
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Response time metrics
    const responseTimeMetrics = await Contact.aggregate([
      { $match: { responses: { $exists: true, $ne: [] } } },
      { $unwind: '$responses' },
      {
        $addFields: {
          responseTime: {
            $divide: [
              { $subtract: ['$responses.createdAt', '$createdAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgFirstResponseTime: { $avg: '$responseTime' },
          totalResponses: { $sum: 1 }
        }
      }
    ]);

    const analytics = {
      submissions: contactSubmissions.map(sub => ({
        period: groupBy === 'day' 
          ? `${sub._id.year}-${String(sub._id.month).padStart(2, '0')}-${String(sub._id.day).padStart(2, '0')}`
          : `${sub._id.year}-${String(sub._id.month).padStart(2, '0')}`,
        count: sub.count
      })),
      resolutionMetrics: resolutionTimeAnalysis[0] || {
        avgResolutionTime: 0,
        minResolutionTime: 0,
        maxResolutionTime: 0,
        totalResolved: 0
      },
      categoryPerformance,
      responseMetrics: responseTimeMetrics[0] || {
        avgFirstResponseTime: 0,
        totalResponses: 0
      }
    };

    console.log('Contact analytics retrieved successfully');

    res.status(200).json({
      success: true,
      data: analytics,
      period,
      groupBy,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching contact analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact analytics',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
});

// @desc    Get system performance metrics
// @route   GET /api/dashboard/system-metrics
// @access  Admin only
const getSystemMetrics = asyncHandler(async (req, res) => {
  try {
    console.log('Fetching system performance metrics...');

    // Database statistics
    const dbStats = {
      collections: {
        users: await User.countDocuments(),
        contacts: await Contact.countDocuments(),
        // Add more collections as they become available
      }
    };

    // Recent activity (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentActivity = {
      newUsers: await User.countDocuments({ createdAt: { $gte: last24Hours } }),
      newContacts: await Contact.countDocuments({ createdAt: { $gte: last24Hours } }),
      resolvedContacts: await Contact.countDocuments({ 
        resolvedAt: { $gte: last24Hours } 
      }),
      activeUsers: await User.countDocuments({ 
        lastLogin: { $gte: last24Hours } 
      })
    };

    // System health indicators
    const systemHealth = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || 'development'
    };

    // Error and performance tracking (would need actual logging system)
    const performanceMetrics = {
      averageResponseTime: '250ms', // This would come from actual monitoring
      errorRate: '0.1%', // This would come from actual error tracking
      requestsPerMinute: 45, // This would come from actual analytics
      lastHealthCheck: new Date().toISOString()
    };

    const metrics = {
      database: dbStats,
      recentActivity,
      systemHealth,
      performance: performanceMetrics
    };

    console.log('System metrics retrieved successfully');

    res.status(200).json({
      success: true,
      data: metrics,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve system metrics',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
});

// @desc    Get real-time dashboard data
// @route   GET /api/dashboard/realtime
// @access  Admin/Staff
const getRealTimeData = asyncHandler(async (req, res) => {
  try {
    console.log('Fetching real-time dashboard data...');

    const now = new Date();
    const last1Hour = new Date(now.getTime() - 60 * 60 * 1000);
    const last1Day = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Real-time counters
    const realTimeStats = {
      onlineUsers: await User.countDocuments({ 
        lastLogin: { $gte: last1Hour } 
      }),
      newContactsToday: await Contact.countDocuments({
        createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
      }),
      pendingContacts: await Contact.countDocuments({ 
        status: 'pending' 
      }),
      activeStaff: await User.countDocuments({
        role: { $in: ['admin', 'staff'] },
        lastLogin: { $gte: last1Day }
      })
    };

    // Recent activities
    const recentActivities = await Promise.all([
      // Recent user registrations
      User.find({ createdAt: { $gte: last1Day } })
        .select('name email role createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Recent contacts
      Contact.find({ createdAt: { $gte: last1Day } })
        .select('name email category status createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    const [recentUsers, recentContacts] = recentActivities;

    // Format activities for timeline
    const activityTimeline = [
      ...recentUsers.map(user => ({
        type: 'user_registration',
        title: `New ${user.role} registered`,
        description: `${user.name} (${user.email})`,
        timestamp: user.createdAt,
        icon: 'user-plus'
      })),
      ...recentContacts.map(contact => ({
        type: 'contact_submission',
        title: `New ${contact.category} inquiry`,
        description: `From ${contact.name} (${contact.email})`,
        timestamp: contact.createdAt,
        status: contact.status,
        icon: 'message-circle'
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    // Quick stats for cards
    const quickStats = {
      totalUsers: await User.countDocuments(),
      totalContacts: await Contact.countDocuments(),
      pendingItems: realTimeStats.pendingContacts,
      systemStatus: 'healthy' // This would come from health checks
    };

    const realTimeData = {
      stats: realTimeStats,
      quickStats,
      activityTimeline,
      lastUpdated: new Date().toISOString()
    };

    console.log('Real-time data retrieved successfully');

    res.status(200).json({
      success: true,
      data: realTimeData,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching real-time data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve real-time data',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
});

// @desc    Export dashboard data
// @route   GET /api/dashboard/export
// @access  Admin only
const exportDashboardData = asyncHandler(async (req, res) => {
  try {
    const { format = 'json', type = 'overview' } = req.query;

    console.log(`Exporting dashboard data - Format: ${format}, Type: ${type}`);

    let exportData = {};

    switch (type) {
      case 'overview':
        // Get overview data (similar to getDashboardOverview but more detailed)
        exportData = {
          users: await User.find({}).select('-password').lean(),
          contacts: await Contact.find({}).lean(),
          exportedAt: new Date().toISOString(),
          exportedBy: req.user.id
        };
        break;

      case 'users':
        exportData = {
          users: await User.find({}).select('-password').lean(),
          totalCount: await User.countDocuments(),
          exportedAt: new Date().toISOString()
        };
        break;

      case 'contacts':
        exportData = {
          contacts: await Contact.find({}).lean(),
          totalCount: await Contact.countDocuments(),
          exportedAt: new Date().toISOString()
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type. Use: overview, users, or contacts'
        });
    }

    // Set appropriate headers for file download
    if (format === 'csv') {
      // For CSV export, you'd implement CSV conversion here
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-export-${Date.now()}.csv"`);
      // CSV conversion logic would go here
      return res.status(501).json({
        success: false,
        message: 'CSV export not implemented yet'
      });
    }

    // JSON export
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-export-${Date.now()}.json"`);

    console.log(`Dashboard data exported successfully - Type: ${type}`);

    res.status(200).json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Error exporting dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export dashboard data',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
});

module.exports = {
  getDashboardOverview,
  getUserAnalytics,
  getContactAnalytics,
  getSystemMetrics,
  getRealTimeData,
  exportDashboardData
};