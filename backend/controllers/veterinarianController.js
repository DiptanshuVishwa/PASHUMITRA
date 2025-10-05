const Veterinarian = require('../models/Veterinarian');
const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Get all veterinarians with filtering, pagination and search
// @route   GET /api/veterinarians
// @access  Public
const getVeterinarians = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      specialization,
      state,
      district,
      city,
      search,
      isVerified,
      availabilityStatus,
      sortBy = 'rating.average',
      sortOrder = 'desc',
      lat,
      lng,
      radius = 50000 // 50km default radius
    } = req.query;

    // Build filter object
    const filters = {
      isActive: true
    };
    
    if (specialization) {
      filters.specialization = { $in: [specialization] };
    }
    if (state) filters['location.state'] = new RegExp(state, 'i');
    if (district) filters['location.district'] = new RegExp(district, 'i');
    if (city) filters['location.city'] = new RegExp(city, 'i');
    if (isVerified !== undefined) filters.isVerified = isVerified === 'true';
    if (availabilityStatus) filters['availability.status'] = availabilityStatus;

    // Text search
    if (search) {
      filters.$text = { $search: search };
    }

    // Geospatial search
    if (lat && lng) {
      filters['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const veterinarians = await Veterinarian.find(filters)
      .populate('userId', 'name email lastLogin')
      .sort(sortOptions)
      .limit(limitNum)
      .skip(skip)
      .select('-verificationDocuments -stats.responseTime'); // Hide sensitive fields

    // Get total count for pagination
    const total = await Veterinarian.countDocuments(filters);
    const totalPages = Math.ceil(total / limitNum);

    logger.info('Veterinarians retrieved', {
      count: veterinarians.length,
      total,
      page: pageNum,
      filters,
      userId: req.user?._id
    });

    res.status(200).json({
      success: true,
      count: veterinarians.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages,
        total,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      data: veterinarians
    });
  } catch (error) {
    logger.error('Get veterinarians failed:', {
      error: error.message,
      query: req.query,
      userId: req.user?._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve veterinarians',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single veterinarian by ID
// @route   GET /api/veterinarians/:id
// @access  Public
const getVeterinarian = async (req, res) => {
  try {
    const veterinarian = await Veterinarian.findById(req.params.id)
      .populate('userId', 'name email lastLogin');

    if (!veterinarian) {
      return res.status(404).json({
        success: false,
        message: 'Veterinarian not found'
      });
    }

    // Hide verification documents from public view
    const vetData = veterinarian.toObject();
    delete vetData.verificationDocuments;
    if (req.user?.role !== 'admin') {
      delete vetData.stats.responseTime;
    }

    logger.info('Veterinarian retrieved', {
      vetId: veterinarian._id,
      userId: req.user?._id
    });

    res.status(200).json({
      success: true,
      data: vetData
    });
  } catch (error) {
    logger.error('Get veterinarian failed:', {
      error: error.message,
      vetId: req.params.id,
      userId: req.user?._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve veterinarian',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new veterinarian profile
// @route   POST /api/veterinarians
// @access  Private
const createVeterinarian = async (req, res) => {
  try {
    // Check if veterinarian profile already exists for this user
    const existingVet = await Veterinarian.findOne({ 
      $or: [
        { userId: req.user._id },
        { email: req.body.email },
        { registrationNumber: req.body.registrationNumber }
      ]
    });

    if (existingVet) {
      return res.status(400).json({
        success: false,
        message: 'Veterinarian profile already exists with this information'
      });
    }

    // Add user reference
    req.body.userId = req.user._id;

    // Transform coordinates from array [lng, lat] to object {lng, lat}
    if (req.body.location && req.body.location.coordinates && Array.isArray(req.body.location.coordinates)) {
      const [lng, lat] = req.body.location.coordinates;
      req.body.location.coordinates = { lng, lat };
    }

    const veterinarian = await Veterinarian.create(req.body);

    logger.info('Veterinarian profile created', {
      vetId: veterinarian._id,
      userId: req.user._id,
      email: veterinarian.email
    });

    res.status(201).json({
      success: true,
      message: 'Veterinarian profile created successfully. Please wait for verification.',
      data: veterinarian
    });
  } catch (error) {
    logger.error('Create veterinarian failed:', {
      error: error.message,
      userId: req.user._id,
      vetData: req.body
    });

    res.status(500).json({
      success: false,
      message: 'Failed to create veterinarian profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update veterinarian profile
// @route   PUT /api/veterinarians/:id
// @access  Private (Owner or Admin)
const updateVeterinarian = async (req, res) => {
  try {
    let veterinarian = await Veterinarian.findById(req.params.id);

    if (!veterinarian) {
      return res.status(404).json({
        success: false,
        message: 'Veterinarian not found'
      });
    }

    // Check ownership or admin role
    if (veterinarian.userId?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this veterinarian profile'
      });
    }

    // Transform coordinates from array [lng, lat] to object {lng, lat}
    if (req.body.location && req.body.location.coordinates && Array.isArray(req.body.location.coordinates)) {
      const [lng, lat] = req.body.location.coordinates;
      req.body.location.coordinates = { lng, lat };
    }

    // Update veterinarian
    veterinarian = await Veterinarian.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('userId', 'name email');

    logger.info('Veterinarian profile updated', {
      vetId: veterinarian._id,
      userId: req.user._id,
      updatedFields: Object.keys(req.body)
    });

    res.status(200).json({
      success: true,
      message: 'Veterinarian profile updated successfully',
      data: veterinarian
    });
  } catch (error) {
    logger.error('Update veterinarian failed:', {
      error: error.message,
      vetId: req.params.id,
      userId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to update veterinarian profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete veterinarian profile
// @route   DELETE /api/veterinarians/:id
// @access  Private (Owner or Admin)
const deleteVeterinarian = async (req, res) => {
  try {
    const veterinarian = await Veterinarian.findById(req.params.id);

    if (!veterinarian) {
      return res.status(404).json({
        success: false,
        message: 'Veterinarian not found'
      });
    }

    // Check ownership or admin role
    if (veterinarian.userId?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this veterinarian profile'
      });
    }

    await veterinarian.deleteOne();

    logger.info('Veterinarian profile deleted', {
      vetId: req.params.id,
      userId: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Veterinarian profile deleted successfully'
    });
  } catch (error) {
    logger.error('Delete veterinarian failed:', {
      error: error.message,
      vetId: req.params.id,
      userId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to delete veterinarian profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get veterinarians near location
// @route   GET /api/veterinarians/nearby
// @access  Public
const getNearbyVeterinarians = async (req, res) => {
  try {
    const { lat, lng, radius = 50000, limit = 20, specialization } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const filters = {
      isActive: true,
      isVerified: true
    };

    if (specialization) {
      filters.specialization = { $in: [specialization] };
    }

    const veterinarians = await Veterinarian.findNearLocation(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(radius),
      filters
    )
      .populate('userId', 'name email')
      .limit(parseInt(limit))
      .sort({ 'rating.average': -1 })
      .select('-verificationDocuments -stats.responseTime');

    logger.info('Nearby veterinarians retrieved', {
      count: veterinarians.length,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radius: parseInt(radius)
    });

    res.status(200).json({
      success: true,
      count: veterinarians.length,
      data: veterinarians
    });
  } catch (error) {
    logger.error('Get nearby veterinarians failed:', {
      error: error.message,
      query: req.query
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve nearby veterinarians',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update veterinarian availability
// @route   PUT /api/veterinarians/:id/availability
// @access  Private (Owner only)
const updateAvailability = async (req, res) => {
  try {
    const veterinarian = await Veterinarian.findById(req.params.id);

    if (!veterinarian) {
      return res.status(404).json({
        success: false,
        message: 'Veterinarian not found'
      });
    }

    // Check ownership
    if (veterinarian.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update availability for this profile'
      });
    }

    // Update availability
    const { status, schedule, emergencyAvailable } = req.body;
    
    if (status) veterinarian.availability.status = status;
    if (schedule) veterinarian.availability.schedule = { ...veterinarian.availability.schedule, ...schedule };
    if (emergencyAvailable !== undefined) veterinarian.availability.emergencyAvailable = emergencyAvailable;

    await veterinarian.save();

    logger.info('Veterinarian availability updated', {
      vetId: veterinarian._id,
      userId: req.user._id,
      status: veterinarian.availability.status
    });

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: {
        availability: veterinarian.availability
      }
    });
  } catch (error) {
    logger.error('Update availability failed:', {
      error: error.message,
      vetId: req.params.id,
      userId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to update availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Add rating to veterinarian
// @route   POST /api/veterinarians/:id/rating
// @access  Private
const addRating = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const veterinarian = await Veterinarian.findById(req.params.id);

    if (!veterinarian) {
      return res.status(404).json({
        success: false,
        message: 'Veterinarian not found'
      });
    }

    // Prevent self-rating
    if (veterinarian.userId?.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot rate your own profile'
      });
    }

    // Update rating using the model method
    await veterinarian.updateRating(rating);

    logger.info('Rating added to veterinarian', {
      vetId: veterinarian._id,
      userId: req.user._id,
      rating: rating,
      newAverage: veterinarian.rating.average
    });

    res.status(201).json({
      success: true,
      message: 'Rating added successfully',
      data: {
        rating: {
          average: veterinarian.rating.average,
          count: veterinarian.rating.count
        }
      }
    });
  } catch (error) {
    logger.error('Add rating failed:', {
      error: error.message,
      vetId: req.params.id,
      userId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to add rating',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get specializations list
// @route   GET /api/veterinarians/specializations
// @access  Public
const getSpecializations = async (req, res) => {
  try {
    const specializations = [
      { key: 'large_animal', label: 'Large Animal Medicine' },
      { key: 'small_animal', label: 'Small Animal Medicine' },
      { key: 'poultry', label: 'Poultry Medicine' },
      { key: 'aquaculture', label: 'Aquaculture' },
      { key: 'wildlife', label: 'Wildlife Medicine' },
      { key: 'dairy_cattle', label: 'Dairy Cattle' },
      { key: 'beef_cattle', label: 'Beef Cattle' },
      { key: 'swine', label: 'Swine Medicine' },
      { key: 'sheep_goat', label: 'Sheep & Goat Medicine' },
      { key: 'equine', label: 'Equine Medicine' },
      { key: 'surgery', label: 'Veterinary Surgery' },
      { key: 'reproduction', label: 'Animal Reproduction' },
      { key: 'pathology', label: 'Veterinary Pathology' },
      { key: 'public_health', label: 'Public Health' },
      { key: 'nutrition', label: 'Animal Nutrition' },
      { key: 'general_practice', label: 'General Practice' }
    ];

    res.status(200).json({
      success: true,
      data: specializations
    });
  } catch (error) {
    logger.error('Get specializations failed:', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve specializations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getVeterinarians,
  getVeterinarian,
  createVeterinarian,
  updateVeterinarian,
  deleteVeterinarian,
  getNearbyVeterinarians,
  updateAvailability,
  addRating,
  getSpecializations
};