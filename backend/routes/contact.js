const express = require('express');
const router = express.Router();

// Import controllers
const {
  submitContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  addResponse,
  resolveContact,
  getContactStatistics,
  getCategories
} = require('../controllers/contactController');

// Import middlewares
const { protect, optionalAuth, authorize, authRateLimit, logActivity } = require('../middleware/auth');
const {
  validateSubmitContact,
  validateUpdateContact,
  validateAddResponse,
  validateResolveContact,
  validateGetContacts,
  validateGetStatistics,
  validateObjectId
} = require('../middlewares/contactValidator');

// Simple rate limiting middleware
const rateLimiter = authRateLimit(100, 15 * 60 * 1000); // 100 requests per 15 minutes
const strictRateLimit = authRateLimit(20, 15 * 60 * 1000); // 20 requests per 15 minutes
const submitRateLimit = authRateLimit(5, 60 * 60 * 1000); // 5 submissions per hour

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - subject
 *         - message
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique contact form ID
 *         name:
 *           type: string
 *           description: Sender's full name
 *         email:
 *           type: string
 *           format: email
 *           description: Sender's email address
 *         phone:
 *           type: string
 *           description: Sender's phone number
 *         subject:
 *           type: string
 *           description: Subject of the inquiry
 *         message:
 *           type: string
 *           description: Message content
 *         category:
 *           type: string
 *           enum: [general, technical_support, veterinary_consultation, feedback, complaint, feature_request, bug_report, account_issue, billing, partnership]
 *           description: Type of inquiry
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: Priority level
 *         status:
 *           type: string
 *           enum: [open, in_progress, resolved, closed]
 *           description: Current status
 *         location:
 *           type: object
 *           properties:
 *             state:
 *               type: string
 *             district:
 *               type: string
 *             city:
 *               type: string
 *         responses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               respondedBy:
 *                 type: string
 *               message:
 *                 type: string
 *               isInternal:
 *                 type: boolean
 *               respondedAt:
 *                 type: string
 *                 format: date-time
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
 *   name: Contact
 *   description: Contact form management and customer support
 */

/**
 * @swagger
 * /api/contact/categories:
 *   get:
 *     summary: Get list of contact form categories
 *     tags: [Contact]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
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
 */
router.get('/categories', rateLimiter, getCategories);

/**
 * @swagger
 * /api/contact/statistics:
 *   get:
 *     summary: Get contact form statistics (Admin/Staff only)
 *     tags: [Contact]
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
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
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
 *                     total:
 *                       type: number
 *                     open:
 *                       type: number
 *                     inProgress:
 *                       type: number
 *                     resolved:
 *                       type: number
 *                     closed:
 *                       type: number
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin/Staff access required
 */
router.get('/statistics', 
  rateLimiter, 
  protect, 
  authorize('admin', 'staff'), 
  validateGetStatistics, 
  getContactStatistics
);

/**
 * @swagger
 * /api/contact:
 *   get:
 *     summary: Get all contact forms with filtering (Admin/Staff only)
 *     tags: [Contact]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, in_progress, resolved, closed]
 *         description: Filter by status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by priority
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Text search query
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: Contact forms retrieved successfully
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
 *                     $ref: '#/components/schemas/Contact'
 *   post:
 *     summary: Submit a new contact form
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - message
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *               subject:
 *                 type: string
 *                 example: "Issue with veterinarian search"
 *               message:
 *                 type: string
 *                 example: "I am unable to find veterinarians in my area. The search function seems to be not working properly."
 *               category:
 *                 type: string
 *                 enum: [general, technical_support, veterinary_consultation, feedback, complaint, feature_request, bug_report, account_issue, billing, partnership]
 *                 example: "technical_support"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 example: "medium"
 *               location:
 *                 type: object
 *                 properties:
 *                   state:
 *                     type: string
 *                   district:
 *                     type: string
 *                   city:
 *                     type: string
 *     responses:
 *       201:
 *         description: Contact form submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     ticketId:
 *                       type: string
 *                     status:
 *                       type: string
 *                     category:
 *                       type: string
 *                     priority:
 *                       type: string
 *                     submittedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation errors
 *       429:
 *         description: Rate limit exceeded
 */
router.route('/')
  .get(rateLimiter, protect, authorize('admin', 'staff'), validateGetContacts, getContacts)
  .post(submitRateLimit, optionalAuth, validateSubmitContact, submitContact);

/**
 * @swagger
 * /api/contact/{id}:
 *   get:
 *     summary: Get a specific contact form by ID
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact form ID
 *     responses:
 *       200:
 *         description: Contact form retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       404:
 *         description: Contact form not found
 *       403:
 *         description: Not authorized to view this contact form
 *   put:
 *     summary: Update a contact form (Admin/Staff only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact form ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, in_progress, resolved, closed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               assignedTo:
 *                 type: string
 *                 description: User ID to assign the ticket
 *     responses:
 *       200:
 *         description: Contact form updated successfully
 *       400:
 *         description: Validation errors
 *       404:
 *         description: Contact form not found
 *   delete:
 *     summary: Delete a contact form (Admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact form ID
 *     responses:
 *       200:
 *         description: Contact form deleted successfully
 *       404:
 *         description: Contact form not found
 *       403:
 *         description: Admin access required
 */
router.route('/:id')
  .get(rateLimiter, protect, validateObjectId, getContact)
  .put(strictRateLimit, protect, authorize('admin', 'staff'), validateObjectId, validateUpdateContact, updateContact)
  .delete(strictRateLimit, protect, authorize('admin'), validateObjectId, deleteContact);

/**
 * @swagger
 * /api/contact/{id}/response:
 *   post:
 *     summary: Add a response to a contact form (Admin/Staff only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact form ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Thank you for contacting us. We have received your inquiry and will get back to you within 24 hours."
 *               isInternal:
 *                 type: boolean
 *                 default: false
 *                 description: Whether this response is internal (not visible to user)
 *     responses:
 *       201:
 *         description: Response added successfully
 *       400:
 *         description: Validation errors
 *       404:
 *         description: Contact form not found
 *       403:
 *         description: Admin/Staff access required
 */
router.post('/:id/response', 
  strictRateLimit, 
  protect, 
  authorize('admin', 'staff'), 
  validateObjectId, 
  validateAddResponse, 
  addResponse
);

/**
 * @swagger
 * /api/contact/{id}/resolve:
 *   put:
 *     summary: Resolve a contact form (Admin/Staff only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact form ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resolutionNotes
 *             properties:
 *               resolutionNotes:
 *                 type: string
 *                 example: "Issue resolved. User was guided to use the correct search filters for finding veterinarians in their area."
 *     responses:
 *       200:
 *         description: Contact form resolved successfully
 *       400:
 *         description: Validation errors
 *       404:
 *         description: Contact form not found
 *       403:
 *         description: Admin/Staff access required
 */
router.put('/:id/resolve', 
  strictRateLimit, 
  protect, 
  authorize('admin', 'staff'), 
  validateObjectId, 
  validateResolveContact, 
  resolveContact
);

module.exports = router;
