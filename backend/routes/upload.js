const express = require('express');
const router = express.Router();

// Import controllers and multer config
const {
  upload,
  uploadSingleFile,
  uploadMultipleFiles,
  getFiles,
  downloadFile,
  getFileThumbnail,
  deleteFile,
  getFileStats
} = require('../controllers/fileUploadController');

// Import middlewares
const { protect, authorize, authRateLimit, logActivity } = require('../middleware/auth');
const {
  validateFileUpload,
  validateMultipleFileUpload,
  validateFileQuery,
  validateFileId,
  validateFileType,
  validateFileContent,
  validateStatsQuery
} = require('../middlewares/fileUploadValidator');

// Rate limiting middleware
const rateLimiter = authRateLimit(50, 15 * 60 * 1000); // 50 requests per 15 minutes
const strictRateLimit = authRateLimit(10, 15 * 60 * 1000); // 10 requests per 15 minutes
const downloadRateLimit = authRateLimit(100, 15 * 60 * 1000); // 100 downloads per 15 minutes

/**
 * @swagger
 * components:
 *   schemas:
 *     FileUpload:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique file ID
 *         originalName:
 *           type: string
 *           description: Original filename
 *         filename:
 *           type: string
 *           description: Generated unique filename
 *         size:
 *           type: number
 *           description: File size in bytes
 *         mimetype:
 *           type: string
 *           description: File MIME type
 *         category:
 *           type: string
 *           enum: [image, document, video, audio, general]
 *           description: File category
 *         description:
 *           type: string
 *           description: File description
 *         uploadedBy:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         uploadDate:
 *           type: string
 *           format: date-time
 *         downloadUrl:
 *           type: string
 *           description: URL to download the file
 *         thumbnailUrl:
 *           type: string
 *           description: URL to thumbnail (if image)
 *         formattedSize:
 *           type: string
 *           description: Human-readable file size
 *         extension:
 *           type: string
 *           description: File extension
 */

/**
 * @swagger
 * tags:
 *   name: File Upload
 *   description: File upload and management system
 */

/**
 * @swagger
 * /api/upload/single:
 *   post:
 *     summary: Upload a single file
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *               category:
 *                 type: string
 *                 enum: [image, document, video, audio, general]
 *                 default: general
 *                 description: File category
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: File description
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags
 *               isPublic:
 *                 type: boolean
 *                 default: false
 *                 description: Make file publicly accessible
 *               expiresIn:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 365
 *                 description: Expiration in days
 *     responses:
 *       201:
 *         description: File uploaded successfully
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
 *                   $ref: '#/components/schemas/FileUpload'
 *       400:
 *         description: Validation error or no file provided
 *       401:
 *         description: Authentication required
 *       413:
 *         description: File too large
 *       415:
 *         description: Unsupported file type
 */
router.post('/single',
  rateLimiter,
  protect,
  upload.single('file'),
  validateFileType(['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.txt', '.mp4', '.mp3']),
  validateFileContent,
  validateFileUpload,
  logActivity('upload_single_file'),
  uploadSingleFile
);

/**
 * @swagger
 * /api/upload/multiple:
 *   post:
 *     summary: Upload multiple files (max 5)
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 5
 *                 description: Files to upload (max 5)
 *               category:
 *                 type: string
 *                 enum: [image, document, video, audio, general]
 *                 default: general
 *                 description: Category for all files
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Description for all files
 *               maxFiles:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Maximum files to accept
 *     responses:
 *       201:
 *         description: Files uploaded successfully
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
 *                     uploadedFiles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FileUpload'
 *                     failedFiles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           originalName:
 *                             type: string
 *                           error:
 *                             type: string
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         successful:
 *                           type: number
 *                         failed:
 *                           type: number
 *       400:
 *         description: Validation error or no files provided
 *       401:
 *         description: Authentication required
 */
router.post('/multiple',
  rateLimiter,
  protect,
  upload.array('files', 5),
  validateFileType(['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.txt', '.mp4', '.mp3']),
  validateFileContent,
  validateMultipleFileUpload,
  logActivity('upload_multiple_files'),
  uploadMultipleFiles
);

/**
 * @swagger
 * /api/upload/files:
 *   get:
 *     summary: Get file list with filtering and pagination
 *     tags: [File Upload]
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
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [image, document, video, audio, general]
 *         description: Filter by category
 *       - in: query
 *         name: mimetype
 *         schema:
 *           type: string
 *         description: Filter by MIME type
 *       - in: query
 *         name: uploadedBy
 *         schema:
 *           type: string
 *         description: Filter by uploader ID (Admin/Staff only)
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by upload date from
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by upload date to
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in filename or description
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [originalName, filename, size, uploadDate, category, mimetype]
 *           default: uploadDate
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
 *         description: Files retrieved successfully
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
 *                     currentPage:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *                     totalCount:
 *                       type: number
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FileUpload'
 *       401:
 *         description: Authentication required
 */
router.get('/files',
  rateLimiter,
  protect,
  validateFileQuery,
  getFiles
);

/**
 * @swagger
 * /api/upload/download/{id}:
 *   get:
 *     summary: Download file by ID
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 *       403:
 *         description: Not authorized to download this file
 *       401:
 *         description: Authentication required
 */
router.get('/download/:id',
  downloadRateLimit,
  protect,
  validateFileId,
  downloadFile
);

/**
 * @swagger
 * /api/upload/thumbnail/{id}:
 *   get:
 *     summary: Get file thumbnail by ID
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     responses:
 *       200:
 *         description: Thumbnail retrieved successfully
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Thumbnail not found
 *       403:
 *         description: Not authorized to access this thumbnail
 *       401:
 *         description: Authentication required
 */
router.get('/thumbnail/:id',
  downloadRateLimit,
  protect,
  validateFileId,
  getFileThumbnail
);

/**
 * @swagger
 * /api/upload/stats:
 *   get:
 *     summary: Get file storage statistics
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *         description: Statistics period
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [image, document, video, audio, general]
 *         description: Filter by category
 *       - in: query
 *         name: detailed
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include detailed statistics
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
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalFiles:
 *                           type: number
 *                         totalSize:
 *                           type: number
 *                         averageFileSize:
 *                           type: number
 *                         recentUploads:
 *                           type: number
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: number
 *                           totalSize:
 *                             type: number
 *                     mimetypes:
 *                       type: array
 *                     storageInfo:
 *                       type: object
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Staff/Admin access required
 */
router.get('/stats',
  rateLimiter,
  protect,
  authorize('admin', 'staff'),
  validateStatsQuery,
  getFileStats
);

/**
 * @swagger
 * /api/upload/{id}:
 *   delete:
 *     summary: Delete file by ID
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: File not found
 *       403:
 *         description: Not authorized to delete this file
 *       401:
 *         description: Authentication required
 */
router.delete('/:id',
  strictRateLimit,
  protect,
  validateFileId,
  logActivity('delete_file'),
  deleteFile
);

module.exports = router;
