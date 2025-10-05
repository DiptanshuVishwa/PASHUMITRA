const mongoose = require('mongoose');

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
 *         - specialization
 *         - location
 *       properties:
 *         name:
 *           type: string
 *           description: Veterinarian's full name
 *         email:
 *           type: string
 *           format: email
 *           description: Contact email address
 *         phone:
 *           type: string
 *           description: Contact phone number
 *         alternatePhone:
 *           type: string
 *           description: Alternate contact number
 *         specialization:
 *           type: array
 *           items:
 *             type: string
 *           description: Areas of specialization
 *         qualifications:
 *           type: array
 *           items:
 *             type: string
 *           description: Educational qualifications
 *         experience:
 *           type: number
 *           description: Years of experience
 *         languages:
 *           type: array
 *           items:
 *             type: string
 *           description: Languages spoken
 *         location:
 *           type: object
 *           properties:
 *             state:
 *               type: string
 *             district:
 *               type: string
 *             address:
 *               type: string
 *             coordinates:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                 lng:
 *                   type: number
 *         availability:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum: [available, busy, offline]
 *             schedule:
 *               type: object
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         isVerified:
 *           type: boolean
 */

const veterinarianSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Veterinarian name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  alternatePhone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  
  // Professional Information
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  licenseNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  specialization: [{
    type: String,
    required: true,
    enum: {
      values: [
        'large_animal',
        'small_animal', 
        'poultry',
        'aquaculture',
        'wildlife',
        'dairy_cattle',
        'beef_cattle',
        'swine',
        'sheep_goat',
        'equine',
        'surgery',
        'reproduction',
        'pathology',
        'public_health',
        'nutrition',
        'general_practice'
      ],
      message: 'Invalid specialization'
    }
  }],
  qualifications: [{
    degree: {
      type: String,
      required: true,
      trim: true
    },
    institution: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      min: [1950, 'Year must be after 1950'],
      max: [new Date().getFullYear(), 'Year cannot be in the future']
    }
  }],
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative'],
    max: [60, 'Experience cannot exceed 60 years']
  },
  languages: [{
    type: String,
    enum: {
      values: ['english', 'hindi', 'bengali', 'telugu', 'tamil', 'gujarati', 'kannada', 'malayalam', 'odia', 'punjabi', 'marathi', 'urdu'],
      message: 'Invalid language'
    }
  }],
  
  // Location and Contact
  location: {
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      maxlength: [500, 'Address cannot be more than 500 characters']
    },
    pincode: {
      type: String,
      trim: true,
      match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    }
  },
  
  // Clinic/Hospital Information
  clinicName: {
    type: String,
    trim: true,
    maxlength: [200, 'Clinic name cannot be more than 200 characters']
  },
  clinicType: {
    type: String,
    enum: ['private_clinic', 'government_hospital', 'mobile_service', 'research_institute', 'university'],
    default: 'private_clinic'
  },
  
  // Services and Pricing
  services: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      maxlength: [500, 'Service description cannot be more than 500 characters']
    },
    price: {
      min: {
        type: Number,
        min: 0
      },
      max: {
        type: Number,
        min: 0
      },
      currency: {
        type: String,
        default: 'INR'
      }
    },
    duration: {
      type: Number, // in minutes
      min: 15
    }
  }],
  
  // Availability
  availability: {
    status: {
      type: String,
      enum: {
        values: ['available', 'busy', 'offline', 'emergency_only'],
        message: 'Status must be one of: available, busy, offline, emergency_only'
      },
      default: 'available'
    },
    emergencyAvailable: {
      type: Boolean,
      default: false
    },
    schedule: {
      monday: {
        isWorking: { type: Boolean, default: true },
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '17:00' },
        lunchBreak: {
          start: { type: String, default: '13:00' },
          end: { type: String, default: '14:00' }
        }
      },
      tuesday: {
        isWorking: { type: Boolean, default: true },
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '17:00' },
        lunchBreak: {
          start: { type: String, default: '13:00' },
          end: { type: String, default: '14:00' }
        }
      },
      wednesday: {
        isWorking: { type: Boolean, default: true },
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '17:00' },
        lunchBreak: {
          start: { type: String, default: '13:00' },
          end: { type: String, default: '14:00' }
        }
      },
      thursday: {
        isWorking: { type: Boolean, default: true },
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '17:00' },
        lunchBreak: {
          start: { type: String, default: '13:00' },
          end: { type: String, default: '14:00' }
        }
      },
      friday: {
        isWorking: { type: Boolean, default: true },
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '17:00' },
        lunchBreak: {
          start: { type: String, default: '13:00' },
          end: { type: String, default: '14:00' }
        }
      },
      saturday: {
        isWorking: { type: Boolean, default: true },
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '15:00' }
      },
      sunday: {
        isWorking: { type: Boolean, default: false }
      }
    },
    lastActiveAt: {
      type: Date,
      default: Date.now
    }
  },
  
  // Profile Information
  profileImage: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot be more than 1000 characters']
  },
  website: {
    type: String,
    match: [
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      'Please enter a valid website URL'
    ]
  },
  
  // Rating and Reviews
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // Status and Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  verificationDocuments: [{
    type: {
      type: String,
      enum: ['license', 'degree', 'registration_certificate', 'identity_proof', 'address_proof'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verifiedAt: {
      type: Date
    },
    verifiedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  }],
  
  // Statistics
  stats: {
    totalConsultations: {
      type: Number,
      default: 0
    },
    totalAlerts: {
      type: Number,
      default: 0
    },
    responseTime: {
      average: {
        type: Number, // in minutes
        default: 0
      }
    },
    consultationFees: {
      average: {
        type: Number,
        default: 0
      }
    }
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date
  },
  
  // User reference (if vet is also a system user)
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
veterinarianSchema.index({ 'location.coordinates': '2dsphere' });
veterinarianSchema.index({ 
  'location.state': 1, 
  'location.district': 1, 
  'availability.status': 1 
});
veterinarianSchema.index({ 
  specialization: 1, 
  'rating.average': -1 
});
veterinarianSchema.index({ 
  isVerified: 1, 
  isActive: 1, 
  'availability.status': 1 
});

// Text index for search
veterinarianSchema.index({
  name: 'text',
  specialization: 'text',
  'location.city': 'text',
  'location.district': 'text',
  'location.state': 'text',
  clinicName: 'text',
  bio: 'text'
});

// Virtual for full address
veterinarianSchema.virtual('fullAddress').get(function() {
  const parts = [
    this.location.address,
    this.location.city,
    this.location.district,
    this.location.state
  ].filter(Boolean);
  return parts.join(', ');
});

// Virtual for availability status
veterinarianSchema.virtual('isAvailable').get(function() {
  return this.availability.status === 'available' && this.isActive && this.isVerified;
});

// Static method to find vets near location
veterinarianSchema.statics.findNearLocation = function(lat, lng, maxDistance = 50000, filters = {}) {
  const query = {
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true,
    ...filters
  };
  
  return this.find(query);
};

// Method to update rating
veterinarianSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + newRating) / this.rating.count;
  return this.save();
};

// Method to check availability for a specific time
veterinarianSchema.methods.isAvailableAt = function(dayOfWeek, time) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const daySchedule = this.availability.schedule[days[dayOfWeek]];
  
  if (!daySchedule || !daySchedule.isWorking) {
    return false;
  }
  
  // Check if time falls within working hours (simplified check)
  const startTime = daySchedule.startTime.replace(':', '');
  const endTime = daySchedule.endTime.replace(':', '');
  const checkTime = time.replace(':', '');
  
  return checkTime >= startTime && checkTime <= endTime;
};

// Pre-save middleware to update lastActiveAt
veterinarianSchema.pre('save', function(next) {
  if (this.isModified('availability.status')) {
    this.availability.lastActiveAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Veterinarian', veterinarianSchema);