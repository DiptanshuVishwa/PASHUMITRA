const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: [true, 'Original filename is required'],
    trim: true,
    maxLength: [255, 'Filename cannot exceed 255 characters']
  },
  filename: {
    type: String,
    required: [true, 'Generated filename is required'],
    unique: true,
    trim: true
  },
  path: {
    type: String,
    required: [true, 'File path is required'],
    trim: true
  },
  s3Key: {
    type: String,
    required: [true, 'S3 key is required for cloud storage'],
    trim: true
  },
  s3Bucket: {
    type: String,
    required: [true, 'S3 bucket is required'],
    trim: true
  },
  cloudUrl: {
    type: String,
    trim: true,
    default: null
  },
  thumbnailPath: {
    type: String,
    default: null,
    trim: true
  },
  thumbnailS3Key: {
    type: String,
    default: null,
    trim: true
  },
  mimetype: {
    type: String,
    required: [true, 'File mimetype is required'],
    trim: true,
    lowercase: true
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'File category is required'],
    enum: {
      values: ['image', 'document', 'video', 'audio', 'general'],
      message: 'Category must be one of: image, document, video, audio, general'
    },
    default: 'general'
  },
  description: {
    type: String,
    maxLength: [1000, 'Description cannot exceed 1000 characters'],
    default: '',
    trim: true
  },
  hash: {
    type: String,
    required: [true, 'File hash is required for integrity'],
    trim: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader information is required']
  },
  uploadDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  accessCount: {
    type: Number,
    default: 0,
    min: 0
  },
  tags: [{
    type: String,
    trim: true,
    maxLength: [50, 'Each tag cannot exceed 50 characters']
  }],
  metadata: {
    width: {
      type: Number,
      min: 0
    },
    height: {
      type: Number,
      min: 0
    },
    duration: {
      type: Number,
      min: 0
    },
    pages: {
      type: Number,
      min: 1
    },
    encoding: {
      type: String,
      trim: true
    }
  },
  permissions: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowedRoles: [{
      type: String,
      enum: ['user', 'veterinarian', 'admin', 'staff']
    }],
    allowedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  virus_scan: {
    status: {
      type: String,
      enum: ['pending', 'clean', 'infected', 'error'],
      default: 'pending'
    },
    scanDate: {
      type: Date
    },
    scanResult: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'active', 'deleted', 'quarantined'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    default: null // null means no expiration
  },
  downloadUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Remove sensitive information when converting to JSON
      delete ret.path;
      delete ret.hash;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for better performance
fileSchema.index({ uploadedBy: 1 });
fileSchema.index({ category: 1 });
fileSchema.index({ mimetype: 1 });
fileSchema.index({ uploadDate: -1 });
fileSchema.index({ hash: 1 });
fileSchema.index({ status: 1 });

// Compound indexes for common queries
fileSchema.index({ uploadedBy: 1, category: 1 });
fileSchema.index({ uploadedBy: 1, uploadDate: -1 });
fileSchema.index({ status: 1, uploadDate: -1 });

// Virtual for formatted file size
fileSchema.virtual('formattedSize').get(function() {
  if (this.size === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(this.size) / Math.log(k));
  return parseFloat((this.size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for file extension
fileSchema.virtual('extension').get(function() {
  return this.originalName.split('.').pop().toLowerCase();
});

// Virtual to check if file is image
fileSchema.virtual('isImage').get(function() {
  return this.mimetype.startsWith('image/');
});

// Virtual to check if file is video
fileSchema.virtual('isVideo').get(function() {
  return this.mimetype.startsWith('video/');
});

// Virtual to check if file is document
fileSchema.virtual('isDocument').get(function() {
  const documentTypes = ['application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'text/csv'];
  return documentTypes.includes(this.mimetype);
});

// Pre-save middleware
fileSchema.pre('save', function(next) {
  // Update lastAccessed if this is not a new document
  if (!this.isNew) {
    this.lastAccessed = new Date();
  }
  
  // Set download URL
  if (this._id) {
    this.downloadUrl = `/api/upload/download/${this._id}`;
  }
  
  next();
});

// Method to increment access count
fileSchema.methods.incrementAccess = async function() {
  this.accessCount += 1;
  this.lastAccessed = new Date();
  return await this.save();
};

// Method to check if user has access to file
fileSchema.methods.hasAccess = function(user) {
  // File owner always has access
  if (this.uploadedBy.toString() === user._id.toString()) {
    return true;
  }
  
  // Admin and staff always have access
  if (['admin', 'staff'].includes(user.role)) {
    return true;
  }
  
  // Check if file is public
  if (this.permissions.isPublic) {
    return true;
  }
  
  // Check allowed roles
  if (this.permissions.allowedRoles.includes(user.role)) {
    return true;
  }
  
  // Check specifically allowed users
  if (this.permissions.allowedUsers.includes(user._id)) {
    return true;
  }
  
  return false;
};

// Static method to get files by category
fileSchema.statics.getByCategory = function(category, options = {}) {
  return this.find({ category, status: 'active' })
    .populate('uploadedBy', 'name email')
    .sort(options.sort || { uploadDate: -1 })
    .limit(options.limit || 10);
};

// Static method to get recent files
fileSchema.statics.getRecent = function(days = 7, options = {}) {
  const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.find({ 
    uploadDate: { $gte: dateFrom },
    status: 'active'
  })
    .populate('uploadedBy', 'name email')
    .sort({ uploadDate: -1 })
    .limit(options.limit || 10);
};

// Static method to clean up expired files
fileSchema.statics.cleanupExpired = function() {
  const now = new Date();
  return this.updateMany(
    { 
      expiresAt: { $lte: now },
      status: { $ne: 'deleted' }
    },
    { status: 'deleted' }
  );
};

// Static method to get storage statistics
fileSchema.statics.getStorageStats = async function() {
  const stats = await this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        totalSize: { $sum: '$size' },
        avgSize: { $avg: '$size' },
        maxSize: { $max: '$size' },
        minSize: { $min: '$size' }
      }
    }
  ]);
  
  const categoryStats = await this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalSize: { $sum: '$size' }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  return {
    overview: stats[0] || {
      totalFiles: 0,
      totalSize: 0,
      avgSize: 0,
      maxSize: 0,
      minSize: 0
    },
    byCategory: categoryStats
  };
};

// TTL index for expired files cleanup (runs every 60 seconds)
fileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('File', fileSchema);