const express = require('express');
const router = express.Router();

// Import controllers
const {
  getVeterinarians,
  getVeterinarian,
  createVeterinarian,
  updateVeterinarian,
  deleteVeterinarian,
  getNearbyVeterinarians,
  updateAvailability,
  addRating,
  getSpecializations
} = require('../controllers/veterinarianController');

// Import middlewares
const { protect, optionalAuth, authorize, authRateLimit, logActivity } = require('../middleware/auth');
const {
  validateCreateVeterinarian,
  validateUpdateVeterinarian,
  validateUpdateAvailability,
  validateAddRating,
  validateGetVeterinarians,
  validateNearbyVeterinarians,
  validateObjectId
} = require('../middlewares/veterinarianValidator');

// Simple rate limiting middleware
const rateLimiter = authRateLimit(100, 15 * 60 * 1000); // 100 requests per 15 minutes
const strictRateLimit = authRateLimit(20, 15 * 60 * 1000); // 20 requests per 15 minutes

/**
 * @swagger
 * components:
 *   schemas:
 *     Veterinarian:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phone
 *         - registrationNumber
 *         - specialization
 *         - experience
 *         - qualifications
 *         - location
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique veterinarian ID
 *         name:
 *           type: string
 *           description: Veterinarian's full name
 *         email:
 *           type: string
 *           description: Email address
 *         phone:
 *           type: string
 *           description: Contact phone number
 *         registrationNumber:
 *           type: string
 *           description: Veterinary registration number
 *         specialization:
 *           type: array
 *           items:
 *             type: string
 *           description: Areas of specialization
 *         experience:
 *           type: number
 *           description: Years of experience
 *         qualifications:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               degree:
 *                 type: string
 *               institution:
 *                 type: string
 *               year:
 *                 type: number
 *         location:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *             city:
 *               type: string
 *             district:
 *               type: string
 *             state:
 *               type: string
 *             pincode:
 *               type: string
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *         rating:
 *           type: object
 *           properties:
 *             average:
 *               type: number
 *             count:
 *               type: number
 *         availability:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum: [available, unavailable, busy]
 *             emergencyAvailable:
 *               type: boolean
 *         isVerified:
 *           type: boolean
 *         isActive:
 *           type: boolean
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
 *   name: Veterinarians
 *   description: Veterinarian directory and profile management
 */

/**
 * @swagger
 * /api/veterinarians/specializations:
 *   get:
 *     summary: Get list of veterinary specializations
 *     tags: [Veterinarians]
 *     responses:
 *       200:
 *         description: List of specializations retrieved successfully
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
router.get('/specializations', rateLimiter, getSpecializations);

/**
 * @swagger
 * /api/veterinarians/nearby:
 *   get:
 *     summary: Get veterinarians near a specific location
 *     tags: [Veterinarians]
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
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *         description: Filter by specialization
 *     responses:
 *       200:
 *         description: Nearby veterinarians retrieved successfully
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
 *                     $ref: '#/components/schemas/Veterinarian'
 *       400:
 *         description: Invalid coordinates
 */
router.get('/nearby', rateLimiter, validateNearbyVeterinarians, getNearbyVeterinarians);

/**
 * @swagger
 * /api/veterinarians:
 *   get:
 *     summary: Get all veterinarians with filtering and pagination
 *     tags: [Veterinarians]
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
 *         name: specialization
 *         schema:
 *           type: string
 *         description: Filter by specialization
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
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Text search query
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *       - in: query
 *         name: availabilityStatus
 *         schema:
 *           type: string
 *           enum: [available, unavailable, busy]
 *         description: Filter by availability
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [rating.average, experience, createdAt, name]
 *           default: rating.average
 *         description: Sort by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitude for location-based sorting
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitude for location-based sorting
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 50000
 *         description: Search radius in meters
 *     responses:
 *       200:
 *         description: Veterinarians retrieved successfully
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
 *                   properties:
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *                     total:
 *                       type: number
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Veterinarian'
 */
router.get('/', rateLimiter, optionalAuth, validateGetVeterinarians, getVeterinarians);

/**
 * @swagger
 * /api/veterinarians:
 *   post:
 *     summary: Create a new veterinarian profile
 *     tags: [Veterinarians]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - registrationNumber
 *               - specialization
 *               - experience
 *               - qualifications
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Dr. Rajesh Kumar"
 *               email:
 *                 type: string
 *                 example: "rajesh.kumar@vet.com"
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *               registrationNumber:
 *                 type: string
 *                 example: "VET/UP/2020/12345"
 *               specialization:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["large_animal", "dairy_cattle"]
 *               experience:
 *                 type: number
 *                 example: 8
 *               qualifications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     degree:
 *                       type: string
 *                     institution:
 *                       type: string
 *                     year:
 *                       type: number
 *                 example: [{"degree": "B.V.Sc & A.H.", "institution": "IVRI", "year": 2015}]
 *               location:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   district:
 *                     type: string
 *                   state:
 *                     type: string
 *                   pincode:
 *                     type: string
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *               bio:
 *                 type: string
 *                 description: Professional bio (50-1000 characters)
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Veterinarian profile created successfully
 *       400:
 *         description: Validation errors or profile already exists
 *       401:
 *         description: Authentication required
 */
router.post('/', strictRateLimit, protect, validateCreateVeterinarian, createVeterinarian);

/**
 * @swagger
 * /api/veterinarians/{id}:
 *   get:
 *     summary: Get a specific veterinarian by ID
 *     tags: [Veterinarians]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Veterinarian ID
 *     responses:
 *       200:
 *         description: Veterinarian retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Veterinarian'
 *       404:
 *         description: Veterinarian not found
 */
router.get('/:id', rateLimiter, optionalAuth, validateObjectId, getVeterinarian);

/**
 * @swagger
 * /api/veterinarians/{id}:
 *   put:
 *     summary: Update a veterinarian profile
 *     tags: [Veterinarians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Veterinarian ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               specialization:
 *                 type: array
 *                 items:
 *                   type: string
 *               experience:
 *                 type: number
 *               bio:
 *                 type: string
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation errors
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not authorized to update this profile
 *       404:
 *         description: Veterinarian not found
 */
router.put('/:id', strictRateLimit, protect, validateObjectId, validateUpdateVeterinarian, updateVeterinarian);

/**
 * @swagger
 * /api/veterinarians/{id}:
 *   delete:
 *     summary: Delete a veterinarian profile
 *     tags: [Veterinarians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Veterinarian ID
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not authorized to delete this profile
 *       404:
 *         description: Veterinarian not found
 */
router.delete('/:id', strictRateLimit, protect, validateObjectId, deleteVeterinarian);

/**
 * @swagger
 * /api/veterinarians/{id}/availability:
 *   put:
 *     summary: Update veterinarian availability
 *     tags: [Veterinarians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Veterinarian ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, unavailable, busy]
 *               emergencyAvailable:
 *                 type: boolean
 *               schedule:
 *                 type: object
 *                 properties:
 *                   monday:
 *                     type: object
 *                     properties:
 *                       isWorking:
 *                         type: boolean
 *                       startTime:
 *                         type: string
 *                         example: "09:00"
 *                       endTime:
 *                         type: string
 *                         example: "18:00"
 *     responses:
 *       200:
 *         description: Availability updated successfully
 *       400:
 *         description: Validation errors
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not authorized to update availability
 *       404:
 *         description: Veterinarian not found
 */
router.put('/:id/availability', strictRateLimit, protect, validateObjectId, validateUpdateAvailability, updateAvailability);

/**
 * @swagger
 * /api/veterinarians/{id}/rating:
 *   post:
 *     summary: Add a rating to a veterinarian
 *     tags: [Veterinarians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Veterinarian ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4.5
 *               comment:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Excellent service and very knowledgeable"
 *     responses:
 *       201:
 *         description: Rating added successfully
 *       400:
 *         description: Validation errors or cannot rate own profile
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Veterinarian not found
 */
router.post('/:id/rating', strictRateLimit, protect, validateObjectId, validateAddRating, addRating);

module.exports = router;
