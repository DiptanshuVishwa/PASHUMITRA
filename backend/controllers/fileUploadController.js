const asyncHandler = require('express-async-handler');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const crypto = require('crypto');

// File model
const File = require('../models/File');

// Import S3 configuration
const {
  s3Storage,
  fileFilter,
  generateSignedUrl,
  deleteFromS3,
  getFileMetadata,
  getBucketInfo
} = require('../config/s3Config');

// Configure multer with S3 storage
const upload = multer({
  storage: s3Storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for S3
    files: 5 // Maximum 5 files per request
  }
});

// @desc    Upload single file to S3
// @route   POST /api/upload/single
// @access  Private
const uploadSingleFile = asyncHandler(async (req, res) => {
  try {
    console.log('Processing single file upload to S3...');

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const { category = 'general', description, tags } = req.body;
    const file = req.file;

    console.log('S3 file details:', {
      key: file.key,
      bucket: file.bucket,
      location: file.location,
      size: file.size
    });

    // Process tags if provided
    let fileTags = [];
    if (tags) {
      fileTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }

    // Generate file hash for integrity (S3 provides ETag but we can also store our own)
    const fileHash = file.etag ? file.etag.replace(/"/g, '') : crypto.randomBytes(16).toString('hex');

    // Create thumbnail for images (this would need separate S3 processing)
    let thumbnailS3Key = null;
    if (file.mimetype.startsWith('image/')) {
      try {
        // For now, we'll mark that thumbnail processing is needed
        // In production, you'd use AWS Lambda or similar for image processing
        thumbnailS3Key = file.key.replace(/([^/]+)$/, 'thumbnails/thumb_$1');
        console.log('Image file detected, thumbnail processing scheduled');
      } catch (imageError) {
        console.error('Error scheduling thumbnail processing:', imageError);
      }
    }

    // Save file metadata to database
    const fileRecord = await File.create({
      originalName: file.originalname,
      filename: path.basename(file.key),
      path: file.location, // S3 URL
      s3Key: file.key,
      s3Bucket: file.bucket,
      cloudUrl: file.location,
      thumbnailS3Key,
      mimetype: file.mimetype,
      size: file.size,
      category,
      description: description || '',
      tags: fileTags,
      hash: fileHash,
      uploadedBy: req.user.id,
      uploadDate: new Date()
    });

    console.log('File uploaded to S3 and saved to database successfully');

    // Generate signed URL for secure access
    const signedUrl = await generateSignedUrl(file.key, 3600); // 1 hour expiry

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully to S3',
      data: {
        id: fileRecord._id,
        originalName: fileRecord.originalName,
        filename: fileRecord.filename,
        s3Key: fileRecord.s3Key,
        cloudUrl: fileRecord.cloudUrl,
        signedUrl: signedUrl,
        size: fileRecord.size,
        mimetype: fileRecord.mimetype,
        category: fileRecord.category,
        description: fileRecord.description,
        tags: fileRecord.tags,
        uploadDate: fileRecord.uploadDate,
        downloadUrl: `/api/upload/download/${fileRecord._id}`,
        ...(thumbnailS3Key && { thumbnailUrl: `/api/upload/thumbnail/${fileRecord._id}` })
      }
    });
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    
    // S3 cleanup is handled automatically by multer-s3 on failure
    // But we might want to delete the file if it was uploaded but DB save failed
    if (req.file && req.file.key) {
      try {
        await deleteFromS3(req.file.key);
        console.log('Cleaned up S3 file after error');
      } catch (s3Error) {
        console.error('Error cleaning up S3 file:', s3Error);
      }
    }

    res.status(500).json({
      success: false,
      message: 'File upload to S3 failed',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
});

// @desc    Upload multiple files
// @route   POST /api/upload/multiple
// @access  Private
const uploadMultipleFiles = asyncHandler(async (req, res) => {
  try {
    console.log('Processing multiple file upload...');

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided'
      });
    }

    const { category = 'general', description } = req.body;
    const uploadedFiles = [];
    const failedFiles = [];

    for (const file of req.files) {
      try {
        // Process each file similar to single upload
        let processedPath = file.path;
        let thumbnailPath = null;

        if (file.mimetype.startsWith('image/')) {
          try {
            const thumbnailDir = path.join(path.dirname(file.path), 'thumbnails');
            await fs.mkdir(thumbnailDir, { recursive: true });
            
            thumbnailPath = path.join(thumbnailDir, `thumb_${file.filename}`);
            
            await sharp(file.path)
              .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
              .jpeg({ quality: 80 })
              .toFile(thumbnailPath);
          } catch (imageError) {
            console.error('Error processing image:', imageError);
          }
        }

        const fileBuffer = await fs.readFile(file.path);
        const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

        const fileRecord = await File.create({
          originalName: file.originalname,
          filename: file.filename,
          path: processedPath,
          thumbnailPath,
          mimetype: file.mimetype,
          size: file.size,
          category,
          description: description || '',
          hash: fileHash,
          uploadedBy: req.user.id,
          uploadDate: new Date()
        });

        uploadedFiles.push({
          id: fileRecord._id,
          originalName: fileRecord.originalName,
          filename: fileRecord.filename,
          size: fileRecord.size,
          mimetype: fileRecord.mimetype,
          category: fileRecord.category,
          uploadDate: fileRecord.uploadDate,
          downloadUrl: `/api/upload/download/${fileRecord._id}`,
          ...(thumbnailPath && { thumbnailUrl: `/api/upload/thumbnail/${fileRecord._id}` })
        });
      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
        
        failedFiles.push({
          originalName: file.originalname,
          error: fileError.message
        });

        // Clean up failed file
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up failed file:', unlinkError);
        }
      }
    }

    console.log(`Multiple file upload completed: ${uploadedFiles.length} successful, ${failedFiles.length} failed`);

    res.status(201).json({
      success: uploadedFiles.length > 0,
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: {
        uploadedFiles,
        failedFiles,
        summary: {
          total: req.files.length,
          successful: uploadedFiles.length,
          failed: failedFiles.length
        }
      }
    });
  } catch (error) {
    console.error('Error in multiple file upload:', error);
    
    // Clean up all files if upload failed
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
    }

    res.status(500).json({
      success: false,
      message: 'Multiple file upload failed',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
});

// @desc    Get file list with pagination and filtering
// @route   GET /api/upload/files
// @access  Private
const getFiles = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      mimetype,
      uploadedBy,
      dateFrom,
      dateTo,
      search,
      sortBy = 'uploadDate',
      sortOrder = 'desc'
    } = req.query;

    console.log('Fetching files with filters...');

    // Build query
    const query = {};

    // Permission check - users can only see their own files unless admin/staff
    if (!['admin', 'staff'].includes(req.user.role)) {
      query.uploadedBy = req.user.id;
    } else if (uploadedBy) {
      query.uploadedBy = uploadedBy;
    }

    if (category) {
      query.category = category;
    }

    if (mimetype) {
      query.mimetype = { $regex: mimetype, $options: 'i' };
    }

    if (dateFrom || dateTo) {
      query.uploadDate = {};
      if (dateFrom) query.uploadDate.$gte = new Date(dateFrom);
      if (dateTo) query.uploadDate.$lte = new Date(dateTo);
    }

    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const [files, totalCount] = await Promise.all([
      File.find(query)
        .populate('uploadedBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      File.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    // Add download URLs
    const filesWithUrls = files.map(file => ({
      ...file,
      downloadUrl: `/api/upload/download/${file._id}`,
      ...(file.thumbnailPath && { thumbnailUrl: `/api/upload/thumbnail/${file._id}` })
    }));

    console.log(`Retrieved ${files.length} files`);

    res.status(200).json({
      success: true,
      count: files.length,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      },
      data: filesWithUrls
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve files',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
});

// @desc    Download file from S3
// @route   GET /api/upload/download/:id
// @access  Private
const downloadFile = asyncHandler(async (req, res) => {
  try {
    const fileRecord = await File.findById(req.params.id);

    if (!fileRecord) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Permission check
    if (!['admin', 'staff'].includes(req.user.role) && 
        fileRecord.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this file'
      });
    }

    // Check if file exists in S3
    try {
      await getFileMetadata(fileRecord.s3Key);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'File not found in cloud storage'
      });
    }

    console.log(`S3 file download requested: ${fileRecord.originalName}`);

    // Generate signed URL for secure download
    const signedUrl = await generateSignedUrl(fileRecord.s3Key, 900); // 15 minutes expiry for downloads

    // Update access count and last accessed time
    await fileRecord.incrementAccess();

    // Return signed URL for download
    res.status(200).json({
      success: true,
      message: 'Download URL generated successfully',
      data: {
        downloadUrl: signedUrl,
        filename: fileRecord.originalName,
        size: fileRecord.size,
        mimetype: fileRecord.mimetype,
        expiresIn: 900 // seconds
      }
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate download URL',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
});

// @desc    Get file thumbnail
// @route   GET /api/upload/thumbnail/:id
// @access  Private
const getFileThumbnail = asyncHandler(async (req, res) => {
  try {
    const fileRecord = await File.findById(req.params.id);

    if (!fileRecord || !fileRecord.thumbnailPath) {
      return res.status(404).json({
        success: false,
        message: 'Thumbnail not found'
      });
    }

    // Permission check
    if (!['admin', 'staff'].includes(req.user.role) && 
        fileRecord.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this thumbnail'
      });
    }

    // Check if thumbnail exists
    try {
      await fs.access(fileRecord.thumbnailPath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'Thumbnail not found on server'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

    // Send thumbnail
    res.sendFile(path.resolve(fileRecord.thumbnailPath));
  } catch (error) {
    console.error('Error getting thumbnail:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve thumbnail',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
});

// @desc    Delete file
// @route   DELETE /api/upload/:id
// @access  Private
const deleteFile = asyncHandler(async (req, res) => {
  try {
    const fileRecord = await File.findById(req.params.id);

    if (!fileRecord) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Permission check
    if (!['admin', 'staff'].includes(req.user.role) && 
        fileRecord.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this file'
      });
    }

    // Delete file from S3
    try {
      await deleteFileFromS3(fileRecord.s3Key);
      console.log('File deleted from S3');
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      // Continue with database deletion even if S3 deletion fails
    }

    // Delete thumbnail from S3 if exists
    if (fileRecord.thumbnailS3Key) {
      try {
        await deleteFileFromS3(fileRecord.thumbnailS3Key);
        console.log('Thumbnail deleted from S3');
      } catch (error) {
        console.error('Error deleting thumbnail from S3:', error);
      }
    }

    // Delete from database
    await File.findByIdAndDelete(req.params.id);

    console.log(`File deleted: ${fileRecord.originalName}`);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
});

// @desc    Get file storage statistics
// @route   GET /api/upload/stats
// @access  Admin/Staff
const getFileStats = asyncHandler(async (req, res) => {
  try {
    console.log('Fetching file storage statistics...');

    const [
      totalFiles,
      totalSize,
      filesByCategory,
      filesByMimetype,
      recentUploads
    ] = await Promise.all([
      File.countDocuments(),
      File.aggregate([
        { $group: { _id: null, totalSize: { $sum: '$size' } } }
      ]),
      File.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, totalSize: { $sum: '$size' } } },
        { $sort: { count: -1 } }
      ]),
      File.aggregate([
        { $group: { _id: '$mimetype', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      File.countDocuments({
        uploadDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    const stats = {
      overview: {
        totalFiles,
        totalSize: totalSize[0]?.totalSize || 0,
        averageFileSize: totalFiles > 0 ? (totalSize[0]?.totalSize || 0) / totalFiles : 0,
        recentUploads
      },
      categories: filesByCategory,
      mimetypes: filesByMimetype.slice(0, 10), // Top 10 file types
      storageInfo: {
        totalSizeFormatted: formatBytes(totalSize[0]?.totalSize || 0),
        freeSpace: 'N/A' // This would require system-level checks
      }
    };

    console.log('File statistics retrieved successfully');

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching file stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve file statistics',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
});

// Helper function to format bytes
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// @desc    Upload user avatar
// @route   POST /api/upload/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
  try {
    console.log('Processing avatar upload...');

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No avatar file provided'
      });
    }

    const file = req.file;
    const User = require('../models/User');

    // Validate file is an image
    if (!file.mimetype.startsWith('image/')) {
      // Clean up uploaded file
      try {
        await deleteFromS3(file.key);
      } catch (cleanupError) {
        console.error('Error cleaning up invalid file:', cleanupError);
      }
      return res.status(400).json({
        success: false,
        message: 'Avatar must be an image file'
      });
    }

    // Check file size (5MB limit for avatars)
    if (file.size > 5 * 1024 * 1024) {
      try {
        await deleteFromS3(file.key);
      } catch (cleanupError) {
        console.error('Error cleaning up oversized file:', cleanupError);
      }
      return res.status(400).json({
        success: false,
        message: 'Avatar file size must be less than 5MB'
      });
    }

    console.log('Avatar S3 details:', {
      key: file.key,
      bucket: file.bucket,
      location: file.location,
      size: file.size
    });

    // Generate file hash
    const fileHash = file.etag ? file.etag.replace(/"/g, '') : crypto.randomBytes(16).toString('hex');

    // Create thumbnail for avatar (smaller size)
    const thumbnailS3Key = file.key.replace(/([^/]+)$/, 'thumbnails/thumb_$1');
    
    // Save file metadata to database with avatar category
    const fileRecord = await File.create({
      originalName: file.originalname,
      filename: path.basename(file.key),
      path: file.location,
      s3Key: file.key,
      s3Bucket: file.bucket,
      cloudUrl: file.location,
      thumbnailS3Key,
      mimetype: file.mimetype,
      size: file.size,
      category: 'avatar',
      description: 'User avatar image',
      tags: ['avatar', 'profile'],
      hash: fileHash,
      uploadedBy: req.user.id,
      uploadDate: new Date()
    });

    // Update user's avatar URL
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: file.location },
      { new: true, select: '-password' }
    );

    if (!user) {
      // Clean up if user update fails
      try {
        await deleteFromS3(file.key);
        await File.findByIdAndDelete(fileRecord._id);
      } catch (cleanupError) {
        console.error('Error cleaning up after user update failure:', cleanupError);
      }
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Avatar uploaded and user profile updated successfully');

    // Generate signed URLs for secure access
    const signedUrl = await generateSignedUrl(file.key, 3600); // 1 hour expiry
    const thumbnailSignedUrl = await generateSignedUrl(thumbnailS3Key, 3600);

    res.status(201).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        },
        file: {
          id: fileRecord._id,
          originalName: fileRecord.originalName,
          filename: fileRecord.filename,
          s3Key: fileRecord.s3Key,
          avatarUrl: file.location,
          signedUrl: signedUrl,
          thumbnailUrl: `/api/upload/thumbnail/${fileRecord._id}`,
          thumbnailSignedUrl: thumbnailSignedUrl,
          size: fileRecord.size,
          mimetype: fileRecord.mimetype,
          uploadDate: fileRecord.uploadDate
        }
      }
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    
    // Clean up S3 file if it was uploaded but process failed
    if (req.file && req.file.key) {
      try {
        await deleteFromS3(req.file.key);
        console.log('Cleaned up S3 file after error');
      } catch (s3Error) {
        console.error('Error cleaning up S3 file:', s3Error);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Avatar upload failed',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
});

module.exports = {
  upload,
  uploadSingleFile,
  uploadMultipleFiles,
  uploadAvatar,
  getFiles,
  downloadFile,
  getFileThumbnail,
  deleteFile,
  getFileStats
};
