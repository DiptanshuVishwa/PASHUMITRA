const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Alert:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - location
 *         - reportedBy
 *       properties:
 *         title:
 *           type: string
 *           description: Alert title
 *         description:
 *           type: string
 *           description: Detailed description of the issue
 *         category:
 *           type: string
 *           enum: [disease, injury, death, vaccination, general]
 *           description: Type of alert
 *         severity:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           description: Severity level of the alert
 *         status:
 *           type: string
 *           enum: [active, investigating, resolved, closed]
 *           description: Current status of the alert
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
 *         affectedAnimals:
 *           type: object
 *           properties:
 *             species:
 *               type: string
 *               enum: [cattle, buffalo, goat, sheep, pig, poultry, other]
 *             breed:
 *               type: string
 *             count:
 *               type: number
 *             ageGroup:
 *               type: string
 *               enum: [young, adult, old, mixed]
 *             symptoms:
 *               type: array
 *               items:
 *                 type: string
 */

const alertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Alert description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Alert category is required'],
    enum: {
      values: ['disease', 'injury', 'death', 'vaccination', 'general'],
      message: 'Category must be one of: disease, injury, death, vaccination, general'
    }
  },
  severity: {
    type: String,
    required: [true, 'Alert severity is required'],
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Severity must be one of: low, medium, high, critical'
    },
    default: 'medium'
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'investigating', 'resolved', 'closed'],
      message: 'Status must be one of: active, investigating, resolved, closed'
    },
    default: 'active'
  },
  location: {
    state: {
      type: String,
      trim: true
    },
    district: {
      type: String,
      trim: true
    },
    village: {
      type: String,
      trim: true
    },
    pincode: {
      type: String,
      trim: true,
      match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
    },
    address: {
      type: String,
      maxlength: [500, 'Address cannot be more than 500 characters']
    },
    coordinates: {
      lat: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      lng: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    }
  },
  affectedAnimals: {
    species: {
      type: String,
      enum: {
        values: ['cattle', 'buffalo', 'goat', 'sheep', 'pig', 'poultry', 'other'],
        message: 'Species must be one of: cattle, buffalo, goat, sheep, pig, poultry, other'
      }
    },
    breed: {
      type: String,
      trim: true
    },
    count: {
      type: Number,
      min: [1, 'Count must be at least 1'],
      max: [10000, 'Count cannot exceed 10,000']
    },
    ageGroup: {
      type: String,
      enum: {
        values: ['young', 'adult', 'old', 'mixed'],
        message: 'Age group must be one of: young, adult, old, mixed'
      },
      default: 'mixed'
    },
    symptoms: [{
      type: String,
      trim: true,
      maxlength: [100, 'Each symptom cannot be more than 100 characters']
    }],
    mortality: {
      count: {
        type: Number,
        default: 0,
        min: [0, 'Mortality count cannot be negative']
      },
      percentage: {
        type: Number,
        default: 0,
        min: [0, 'Mortality percentage cannot be negative'],
        max: [100, 'Mortality percentage cannot exceed 100']
      }
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      maxlength: [200, 'Caption cannot be more than 200 characters']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
    url: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['pdf', 'doc', 'docx', 'txt', 'other'],
      default: 'other'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // New fields for file attachments
  attachments: {
    images: [{
      filename: String,
      url: String,
      s3Key: String,
      fileId: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    audio: {
      filename: String,
      url: String,
      s3Key: String,
      fileId: String,
      duration: Number,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  },
  
  // Issue type and contact information
  issueType: {
    type: String,
    enum: ['disease-outbreak', 'animal-death', 'feed-contamination', 'water-issues', 
           'biosecurity-breach', 'pest-infestation', 'equipment-failure', 'weather-damage', 'other']
  },
  
  customIssue: {
    type: String,
    maxlength: [200, 'Custom issue cannot be more than 200 characters']
  },
  
  contactInfo: {
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  
  // Additional metadata
  metadata: {
    detectedLocation: String,
    reportSource: {
      type: String,
      enum: ['web_portal', 'mobile_app', 'api', 'phone'],
      default: 'web_portal'
    },
    userAgent: String,
    submittedAt: Date
  },
  reportedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Alert must have a reporter']
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  comments: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot be more than 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  actions: [{
    type: {
      type: String,
      enum: ['investigation_started', 'sample_collected', 'treatment_given', 'resolved', 'escalated'],
      required: true
    },
    description: {
      type: String,
      maxlength: [500, 'Action description cannot be more than 500 characters']
    },
    performedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    performedAt: {
      type: Date,
      default: Date.now
    }
  }],
  priority: {
    type: Number,
    min: [1, 'Priority must be between 1 and 10'],
    max: [10, 'Priority must be between 1 and 10'],
    default: 5
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  resolvedAt: {
    type: Date
  },
  closedAt: {
    type: Date
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create geospatial index for location queries
alertSchema.index({ 'location.coordinates': '2dsphere' });

// Create compound indexes for common queries
alertSchema.index({ status: 1, createdAt: -1 });
alertSchema.index({ category: 1, severity: 1 });
alertSchema.index({ reportedBy: 1, createdAt: -1 });
alertSchema.index({ assignedTo: 1, status: 1 });
alertSchema.index({ 'location.state': 1, 'location.district': 1 });

// Text index for search functionality
alertSchema.index({
  title: 'text',
  description: 'text',
  'affectedAnimals.symptoms': 'text',
  tags: 'text'
});

// Virtual for days since created
alertSchema.virtual('daysOpen').get(function() {
  return Math.ceil((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for mortality rate
alertSchema.virtual('mortalityRate').get(function() {
  if (this.affectedAnimals.count === 0) return 0;
  return (this.affectedAnimals.mortality.count / this.affectedAnimals.count) * 100;
});

// Pre-save middleware to update resolved/closed dates
alertSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = new Date();
    } else if (this.status === 'closed' && !this.closedAt) {
      this.closedAt = new Date();
    }
  }
  next();
});

// Static method to get alerts near a location
alertSchema.statics.findNearLocation = function(lat, lng, maxDistance = 50000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistance
      }
    }
  });
};

// Static method to get alert statistics
alertSchema.statics.getStatistics = function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        },
        investigating: {
          $sum: {
            $cond: [{ $eq: ['$status', 'investigating'] }, 1, 0]
          }
        },
        resolved: {
          $sum: {
            $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
          }
        },
        critical: {
          $sum: {
            $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0]
          }
        },
        high: {
          $sum: {
            $cond: [{ $eq: ['$severity', 'high'] }, 1, 0]
          }
        },
        totalAffectedAnimals: { $sum: '$affectedAnimals.count' },
        totalMortality: { $sum: '$affectedAnimals.mortality.count' }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

module.exports = mongoose.model('Alert', alertSchema);