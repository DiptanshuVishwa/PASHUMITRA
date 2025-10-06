const express = require('express');
const {
  getAlerts,
  getAlert,
  createAlert,
  updateAlert,
  deleteAlert,
  addComment,
  addAction,
  getNearbyAlerts,
  getAlertHeatmapData,
  getAlertStatistics
} = require('../controllers/alertController');

const { protect, authorize, optionalAuth, logActivity } = require('../middleware/auth');
const {
  validateCreateAlert,
  validateUpdateAlert,
  validateAlertComment,
  validateAlertAction,
  validateObjectId,
  validatePagination,
  validateSearch
} = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Alert:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - category
 *         - severity
 *         - location
 *         - affectedAnimals
 *       properties:
 *         title:
 *           type: string
 *           description: Alert title
 *           example: "Cattle showing respiratory symptoms"
 *         description:
 *           type: string
 *           description: Detailed description of the alert
 *           example: "Several cattle in our farm are showing signs of respiratory distress"
 *         category:
 *           type: string
 *           enum: [disease, injury, death, vaccination, general]
 *           example: "disease"
 *         severity:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           example: "high"
 *         status:
 *           type: string
 *           enum: [active, investigating, resolved, closed]
 *           example: "active"
 *         location:
 *           type: object
 *           properties:
 *             state:
 *               type: string
 *               example: "Maharashtra"
 *             district:
 *               type: string
 *               example: "Pune"
 *             village:
 *               type: string
 *               example: "Hadapsar"
 *             coordinates:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                   example: 18.5204
 *                 lng:
 *                   type: number
 *                   example: 73.8567
 *         affectedAnimals:
 *           type: object
 *           properties:
 *             species:
 *               type: string
 *               enum: [cattle, buffalo, goat, sheep, pig, poultry, other]
 *               example: "cattle"
 *             count:
 *               type: number
 *               example: 15
 *             symptoms:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["coughing", "fever", "loss of appetite"]
 *     
 *     AlertList:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         count:
 *           type: number
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: number
 *             limit:
 *               type: number
 *             totalPages:
 *               type: number
 *             total:
 *               type: number
 *             hasNext:
 *               type: boolean
 *             hasPrev:
 *               type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Alert'
 */

// Special routes first (before parameterized routes)
/**
 * @swagger
 * /api/alerts/nearby:
 *   get:
 *     summary: Get alerts near a location
 *     tags: [Alerts]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 50000
 *         description: Search radius in meters
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Nearby alerts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Alert'
 */
router.get('/nearby', getNearbyAlerts);

/**
 * @swagger
 * /api/alerts/heatmap:
 *   get:
 *     summary: Get clustered alert data for heatmap visualization
 *     tags: [Alerts]
 *     parameters:
 *       - in: query
 *         name: bounds
 *         schema:
 *           type: string
 *         description: Map bounds in format "north,south,east,west"
 *       - in: query
 *         name: zoom
 *         schema:
 *           type: number
 *           default: 10
 *         description: Map zoom level for clustering precision
 *       - in: query
 *         name: clusterRadius
 *         schema:
 *           type: number
 *           default: 50000
 *         description: Clustering radius in meters
 *     responses:
 *       200:
 *         description: Heatmap data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       coordinates:
 *                         type: object
 *                         properties:
 *                           lat:
 *                             type: number
 *                           lng:
 *                             type: number
 *                       count:
 *                         type: number
 *                       maxSeverity:
 *                         type: string
 *                       riskScore:
 *                         type: number
 *                       categories:
 *                         type: array
 *                       alerts:
 *                         type: array
 */
router.get('/heatmap', getAlertHeatmapData);

/**
 * @swagger
 * /api/alerts/statistics:
 *   get:
 *     summary: Get alert statistics
 *     tags: [Alerts]
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *         description: Filter by district
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           default: "30d"
 *         description: Time range (e.g., "7d", "30d", "90d")
 *     responses:
 *       200:
 *         description: Alert statistics retrieved successfully
 */
router.get('/statistics', getAlertStatistics);

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Get all alerts with filtering and pagination
 *     tags: [Alerts]
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
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, investigating, resolved, closed]
 *         description: Filter by status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [disease, injury, death, vaccination, general]
 *         description: Filter by category
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter by severity
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *         description: Filter by district
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Text search in title and description
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Alerts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AlertList'
 *   post:
 *     summary: Create a new alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Alert'
 *     responses:
 *       201:
 *         description: Alert created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized
 */
router.route('/')
  .get(optionalAuth, validatePagination, validateSearch, getAlerts)
  .post(protect, validateCreateAlert, logActivity('create_alert'), createAlert);

/**
 * @swagger
 * /api/alerts/{id}:
 *   get:
 *     summary: Get alert by ID
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Alert'
 *       404:
 *         description: Alert not found
 *   put:
 *     summary: Update alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Alert'
 *     responses:
 *       200:
 *         description: Alert updated successfully
 *       403:
 *         description: Not authorized to update this alert
 *       404:
 *         description: Alert not found
 *   delete:
 *     summary: Delete alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alert deleted successfully
 *       403:
 *         description: Not authorized to delete this alert
 *       404:
 *         description: Alert not found
 */
router.route('/:id')
  .get(validateObjectId('id'), getAlert)
  .put(protect, validateObjectId('id'), validateUpdateAlert, logActivity('update_alert'), updateAlert)
  .delete(protect, validateObjectId('id'), logActivity('delete_alert'), deleteAlert);

/**
 * @swagger
 * /api/alerts/{id}/comments:
 *   post:
 *     summary: Add comment to alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Comment content
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       404:
 *         description: Alert not found
 */
router.post('/:id/comments', 
  protect, 
  validateObjectId('id'), 
  validateAlertComment, 
  logActivity('add_comment'),
  addComment
);

/**
 * @swagger
 * /api/alerts/{id}/actions:
 *   post:
 *     summary: Add action to alert (Veterinarians only)
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [investigation_started, sample_collected, treatment_given, resolved, escalated]
 *               description:
 *                 type: string
 *                 description: Action description
 *     responses:
 *       201:
 *         description: Action added successfully
 *       403:
 *         description: Only veterinarians can add actions
 *       404:
 *         description: Alert not found
 */
router.post('/:id/actions', 
  protect, 
  authorize('veterinarian', 'admin'), 
  validateObjectId('id'), 
  validateAlertAction, 
  logActivity('add_action'),
  addAction
);

// @route   GET /api/alerts/test
// @desc    Test alerts routes (development only)
// @access  Public
if (process.env.NODE_ENV === 'development') {
  router.get('/test', (req, res) => {
    res.json({
      success: true,
      message: 'Alerts routes working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  });
}

module.exports = router;
