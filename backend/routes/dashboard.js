const express = require('express');
const router = express.Router();

// Import controllers
const {
  getDashboardOverview,
  getUserAnalytics,
  getContactAnalytics,
  getSystemMetrics,
  getRealTimeData,
  exportDashboardData
} = require('../controllers/dashboardController');

// Import middlewares
const { protect, authorize, authRateLimit, logActivity } = require('../middleware/auth');
const {
  validateUserAnalytics,
  validateContactAnalytics,
  validateSystemMetrics,
  validateRealTimeData,
  validateExportDashboardData,
  validateOverview
} = require('../middlewares/dashboardValidator');

// Rate limiting middleware
const rateLimiter = authRateLimit(150, 15 * 60 * 1000); // 150 requests per 15 minutes
const strictRateLimit = authRateLimit(50, 15 * 60 * 1000); // 50 requests per 15 minutes

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardOverview:
 *       type: object
 *       properties:
 *         users:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *             active:
 *               type: number
 *             verified:
 *               type: number
 *             newThisMonth:
 *               type: number
 *             growthRate:
 *               type: number
 *             roleDistribution:
 *               type: object
 *         contacts:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *             pending:
 *               type: number
 *             resolved:
 *               type: number
 *             newThisMonth:
 *               type: number
 *             categoryDistribution:
 *               type: object
 *         systemHealth:
 *           type: object
 *           properties:
 *             activeUsersPercentage:
 *               type: string
 *             verificationRate:
 *               type: string
 *             contactResolutionRate:
 *               type: string
 *     UserAnalytics:
 *       type: object
 *       properties:
 *         registrations:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               period:
 *                 type: string
 *               count:
 *                 type: number
 *         roleActivity:
 *           type: array
 *         geographicDistribution:
 *           type: array
 *         engagementMetrics:
 *           type: object
 *     ContactAnalytics:
 *       type: object
 *       properties:
 *         submissions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               period:
 *                 type: string
 *               count:
 *                 type: number
 *         resolutionMetrics:
 *           type: object
 *         categoryPerformance:
 *           type: array
 *         responseMetrics:
 *           type: object
 */

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard analytics and statistics
 */

/**
 * @swagger
 * /api/dashboard/overview:
 *   get:
 *     summary: Get dashboard overview statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeCharts
 *         schema:
 *           type: boolean
 *         description: Include chart data in response
 *       - in: query
 *         name: timeZone
 *         schema:
 *           type: string
 *         description: Time zone for date calculations
 *     responses:
 *       200:
 *         description: Overview statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DashboardOverview'
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Staff/Admin access required
 */
router.get('/overview', 
  rateLimiter, 
  protect, 
  authorize('admin', 'staff'), 
  validateOverview, 
  getDashboardOverview
);

/**
 * @swagger
 * /api/dashboard/user-analytics:
 *   get:
 *     summary: Get user analytics data with trends and insights
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [1month, 3months, 6months, 1year]
 *           default: 6months
 *         description: Time period for analytics
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, month]
 *           default: month
 *         description: Group data by day or month
 *     responses:
 *       200:
 *         description: User analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserAnalytics'
 *                 period:
 *                   type: string
 *                 groupBy:
 *                   type: string
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Staff/Admin access required
 */
router.get('/user-analytics', 
  rateLimiter, 
  protect, 
  authorize('admin', 'staff'), 
  validateUserAnalytics, 
  getUserAnalytics
);

/**
 * @swagger
 * /api/dashboard/contact-analytics:
 *   get:
 *     summary: Get contact analytics with resolution metrics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [1month, 3months, 6months, 1year]
 *           default: 6months
 *         description: Time period for analytics
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, month]
 *           default: month
 *         description: Group data by day or month
 *     responses:
 *       200:
 *         description: Contact analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ContactAnalytics'
 *                 period:
 *                   type: string
 *                 groupBy:
 *                   type: string
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Staff/Admin access required
 */
router.get('/contact-analytics', 
  rateLimiter, 
  protect, 
  authorize('admin', 'staff'), 
  validateContactAnalytics, 
  getContactAnalytics
);

/**
 * @swagger
 * /api/dashboard/system-metrics:
 *   get:
 *     summary: Get system performance metrics and health indicators
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeDetails
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include detailed system metrics
 *       - in: query
 *         name: refreshCache
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Force refresh cached metrics
 *     responses:
 *       200:
 *         description: System metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                     recentActivity:
 *                       type: object
 *                     systemHealth:
 *                       type: object
 *                     performance:
 *                       type: object
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/system-metrics', 
  strictRateLimit, 
  protect, 
  authorize('admin'), 
  validateSystemMetrics, 
  getSystemMetrics
);

/**
 * @swagger
 * /api/dashboard/realtime:
 *   get:
 *     summary: Get real-time dashboard data with live updates
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Limit for activity timeline items
 *       - in: query
 *         name: includeActivities
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include recent activity timeline
 *     responses:
 *       200:
 *         description: Real-time data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         onlineUsers:
 *                           type: number
 *                         newContactsToday:
 *                           type: number
 *                         pendingContacts:
 *                           type: number
 *                         activeStaff:
 *                           type: number
 *                     quickStats:
 *                       type: object
 *                     activityTimeline:
 *                       type: array
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Staff/Admin access required
 */
router.get('/realtime', 
  rateLimiter, 
  protect, 
  authorize('admin', 'staff'), 
  validateRealTimeData, 
  getRealTimeData
);

/**
 * @swagger
 * /api/dashboard/export:
 *   get:
 *     summary: Export dashboard data in various formats
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *         description: Export format
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [overview, users, contacts]
 *           default: overview
 *         description: Data type to export
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for export data
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for export data
 *       - in: query
 *         name: includeDetails
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include detailed information in export
 *     responses:
 *       200:
 *         description: Data exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *           text/csv:
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid export parameters
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       501:
 *         description: CSV export not implemented
 */
router.get('/export', 
  strictRateLimit, 
  protect, 
  authorize('admin'), 
  validateExportDashboardData, 
  logActivity('export_dashboard_data'),
  exportDashboardData
);

module.exports = router;
