const express = require('express');
const router = express.Router();

// Import controllers
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  changeUserRole,
  getUserStatistics,
  getUserRoles,
  bulkUpdateUsers
} = require('../controllers/userController');

// Import middlewares
const { protect, authorize, authRateLimit, logActivity } = require('../middleware/auth');
const {
  validateUpdateUser,
  validateChangeUserRole,
  validateBulkUpdateUsers,
  validateGetUsers,
  validateGetUserStatistics,
  validateObjectId
} = require('../middlewares/userValidator');

// Simple rate limiting middleware
const rateLimiter = authRateLimit(100, 15 * 60 * 1000); // 100 requests per 15 minutes
const strictRateLimit = authRateLimit(20, 15 * 60 * 1000); // 20 requests per 15 minutes

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - role
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique user ID
 *         name:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         phone:
 *           type: string
 *           description: User's phone number
 *         role:
 *           type: string
 *           enum: [user, veterinarian, admin, staff]
 *           description: User role
 *         isActive:
 *           type: boolean
 *           description: Whether the user account is active
 *         isEmailVerified:
 *           type: boolean
 *           description: Whether the email is verified
 *         location:
 *           type: object
 *           properties:
 *             state:
 *               type: string
 *             district:
 *               type: string
 *             village:
 *               type: string
 *             coordinates:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                 lng:
 *                   type: number
 *         preferences:
 *           type: object
 *           properties:
 *             language:
 *               type: string
 *             theme:
 *               type: string
 *               enum: [light, dark, auto]
 *             notifications:
 *               type: object
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and administration
 */

/**
 * @swagger
 * /api/users/roles:
 *   get:
 *     summary: Get list of user roles (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       key:
 *                         type: string
 *                       label:
 *                         type: string
 *                       description:
 *                         type: string
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/roles', 
  rateLimiter, 
  protect, 
  authorize('admin'), 
  getUserRoles
);

/**
 * @swagger
 * /api/users/statistics:
 *   get:
 *     summary: Get user statistics (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                     totalUsers:
 *                       type: number
 *                     activeUsers:
 *                       type: number
 *                     inactiveUsers:
 *                       type: number
 *                     verifiedUsers:
 *                       type: number
 *                     unverifiedUsers:
 *                       type: number
 *                     adminUsers:
 *                       type: number
 *                     vetUsers:
 *                       type: number
 *                     regularUsers:
 *                       type: number
 *                     recentRegistrations:
 *                       type: number
 *                     monthlyRegistrations:
 *                       type: array
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/statistics', 
  rateLimiter, 
  protect, 
  authorize('admin'), 
  validateGetUserStatistics, 
  getUserStatistics
);

/**
 * @swagger
 * /api/users/bulk-update:
 *   put:
 *     summary: Bulk update multiple users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *               - updates
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60f7b3b3b3b3b3b3b3b3b3b3", "60f7b3b3b3b3b3b3b3b3b3b4"]
 *               updates:
 *                 type: object
 *                 properties:
 *                   role:
 *                     type: string
 *                     enum: [user, veterinarian, admin, staff]
 *                   isActive:
 *                     type: boolean
 *                   isEmailVerified:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Users updated successfully
 *       400:
 *         description: Validation errors
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.put('/bulk-update', 
  strictRateLimit, 
  protect, 
  authorize('admin'), 
  validateBulkUpdateUsers, 
  logActivity('bulk_update_users'),
  bulkUpdateUsers
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with filtering and pagination (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, veterinarian, admin, staff]
 *         description: Filter by user role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: isEmailVerified
 *         schema:
 *           type: boolean
 *         description: Filter by email verification status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by registration date (from)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by registration date (to)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, name, email, role, lastLogin]
 *           default: createdAt
 *         description: Sort by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 pagination:
 *                   type: object
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/', 
  rateLimiter, 
  protect, 
  authorize('admin'), 
  validateGetUsers, 
  getUsers
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       403:
 *         description: Not authorized to access this user
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, veterinarian, admin, staff]
 *                 description: Admin only
 *               isActive:
 *                 type: boolean
 *                 description: Admin only
 *               location:
 *                 type: object
 *                 properties:
 *                   state:
 *                     type: string
 *                   district:
 *                     type: string
 *                   village:
 *                     type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation errors
 *       404:
 *         description: User not found
 *       403:
 *         description: Not authorized to update this user
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Cannot delete own account
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */
router.route('/:id')
  .get(rateLimiter, protect, validateObjectId, getUser)
  .put(strictRateLimit, protect, validateObjectId, validateUpdateUser, logActivity('update_user'), updateUser)
  .delete(strictRateLimit, protect, authorize('admin'), validateObjectId, logActivity('delete_user'), deleteUser);

/**
 * @swagger
 * /api/users/{id}/toggle-status:
 *   put:
 *     summary: Toggle user active status (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Cannot deactivate own account
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */
router.put('/:id/toggle-status', 
  strictRateLimit, 
  protect, 
  authorize('admin'), 
  validateObjectId, 
  logActivity('toggle_user_status'),
  toggleUserStatus
);

/**
 * @swagger
 * /api/users/{id}/role:
 *   put:
 *     summary: Change user role (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, veterinarian, admin, staff]
 *                 example: "veterinarian"
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Cannot change own role
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */
router.put('/:id/role', 
  strictRateLimit, 
  protect, 
  authorize('admin'), 
  validateObjectId, 
  validateChangeUserRole, 
  logActivity('change_user_role'),
  changeUserRole
);

module.exports = router;
