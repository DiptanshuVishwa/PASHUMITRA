const mongoose = require('mongoose');

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
 *       properties:
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
 *           enum: [general, technical, veterinary, feedback, complaint]
 *           description: Type of inquiry
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: Priority level
 *         status:
 *           type: string
 *           enum: [open, in_progress, resolved, closed]
 *           description: Current status
 */

const contactSchema = new mongoose.Schema({
  // Contact Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  
  // Message Details
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot be more than 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [2000, 'Message cannot be more than 2000 characters']
  },
  
  // Classification
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'general',
        'technical_support',
        'veterinary_consultation',
        'feedback',
        'complaint',
        'feature_request',
        'bug_report',
        'account_issue',
        'billing',
        'partnership'
      ],
      message: 'Invalid category'
    }
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Priority must be one of: low, medium, high, urgent'
    },
    default: 'medium'
  },
  
  // Status and Assignment
  status: {
    type: String,
    enum: {
      values: ['open', 'in_progress', 'resolved', 'closed'],
      message: 'Status must be one of: open, in_progress, resolved, closed'
    },
    default: 'open'
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  
  // Location (if provided)
  location: {
    state: {
      type: String,
      trim: true
    },
    district: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    }
  },
  
  // User Reference (if logged in user)
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  
  // Related Alert (if inquiry is about specific alert)
  relatedAlert: {
    type: mongoose.Schema.ObjectId,
    ref: 'Alert'
  },
  
  // Attachments
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Communication History
  responses: [{
    respondedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [2000, 'Response cannot be more than 2000 characters']
    },
    isInternal: {
      type: Boolean,
      default: false // false means visible to user, true means internal note
    },
    respondedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Follow-up
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    scheduledFor: {
      type: Date
    },
    notes: {
      type: String,
      maxlength: [500, 'Follow-up notes cannot be more than 500 characters']
    }
  },
  
  // Resolution
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    resolvedAt: {
      type: Date
    },
    resolutionNotes: {
      type: String,
      maxlength: [1000, 'Resolution notes cannot be more than 1000 characters']
    },
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5
    },
    satisfactionFeedback: {
      type: String,
      maxlength: [500, 'Satisfaction feedback cannot be more than 500 characters']
    }
  },
  
  // Metadata
  source: {
    type: String,
    enum: ['web', 'mobile', 'email', 'phone', 'social_media'],
    default: 'web'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  
  // Timestamps
  closedAt: {
    type: Date
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ category: 1, priority: 1 });
contactSchema.index({ assignedTo: 1, status: 1 });
contactSchema.index({ userId: 1, createdAt: -1 });
contactSchema.index({ email: 1 });

// Text index for search
contactSchema.index({
  name: 'text',
  email: 'text',
  subject: 'text',
  message: 'text'
});

// Virtual for response time (hours)
contactSchema.virtual('responseTime').get(function() {
  if (this.responses.length === 0) {
    return null;
  }
  const firstResponse = this.responses[0];
  return Math.round((firstResponse.respondedAt - this.createdAt) / (1000 * 60 * 60) * 100) / 100;
});

// Virtual for resolution time (hours)
contactSchema.virtual('resolutionTime').get(function() {
  if (!this.resolution.resolvedAt) {
    return null;
  }
  return Math.round((this.resolution.resolvedAt - this.createdAt) / (1000 * 60 * 60) * 100) / 100;
});

// Virtual for days open
contactSchema.virtual('daysOpen').get(function() {
  const endDate = this.closedAt || new Date();
  return Math.ceil((endDate - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for total responses
contactSchema.virtual('totalResponses').get(function() {
  return this.responses.length;
});

// Virtual for public responses (visible to user)
contactSchema.virtual('publicResponses').get(function() {
  return this.responses.filter(response => !response.isInternal);
});

// Pre-save middleware to update status dates
contactSchema.pre('save', function(next) {
  // Update lastActivityAt when responses are added
  if (this.isModified('responses')) {
    this.lastActivityAt = new Date();
  }
  
  // Set resolvedAt when status changes to resolved
  if (this.isModified('status')) {
    if (this.status === 'resolved' && !this.resolution.resolvedAt) {
      this.resolution.resolvedAt = new Date();
    } else if (this.status === 'closed' && !this.closedAt) {
      this.closedAt = new Date();
    }
  }
  
  next();
});

// Method to add response
contactSchema.methods.addResponse = function(respondedBy, message, isInternal = false) {
  this.responses.push({
    respondedBy,
    message,
    isInternal,
    respondedAt: new Date()
  });
  
  if (this.status === 'open') {
    this.status = 'in_progress';
  }
  
  this.lastActivityAt = new Date();
  return this.save();
};

// Method to resolve ticket
contactSchema.methods.resolve = function(resolvedBy, resolutionNotes) {
  this.status = 'resolved';
  this.resolution.resolvedBy = resolvedBy;
  this.resolution.resolvedAt = new Date();
  this.resolution.resolutionNotes = resolutionNotes;
  this.lastActivityAt = new Date();
  
  return this.save();
};

// Method to close ticket
contactSchema.methods.close = function() {
  this.status = 'closed';
  this.closedAt = new Date();
  this.lastActivityAt = new Date();
  
  return this.save();
};

// Static method to get support statistics
contactSchema.statics.getStatistics = function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        open: {
          $sum: {
            $cond: [{ $eq: ['$status', 'open'] }, 1, 0]
          }
        },
        inProgress: {
          $sum: {
            $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0]
          }
        },
        resolved: {
          $sum: {
            $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
          }
        },
        closed: {
          $sum: {
            $cond: [{ $eq: ['$status', 'closed'] }, 1, 0]
          }
        },
        urgent: {
          $sum: {
            $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0]
          }
        },
        high: {
          $sum: {
            $cond: [{ $eq: ['$priority', 'high'] }, 1, 0]
          }
        }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Static method to get category breakdown
contactSchema.statics.getCategoryBreakdown = function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        resolved: {
          $sum: {
            $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        category: '$_id',
        count: 1,
        resolved: 1,
        resolutionRate: {
          $multiply: [
            { $divide: ['$resolved', '$count'] },
            100
          ]
        }
      }
    },
    { $sort: { count: -1 } }
  ];
  
  return this.aggregate(pipeline);
};

module.exports = mongoose.model('Contact', contactSchema);