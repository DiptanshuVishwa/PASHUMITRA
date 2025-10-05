const Alert = require('../models/Alert');
const User = require('../models/User');
const logger = require('../utils/logger');
const { sendAlertNotification } = require('../utils/sendEmail');

// @desc    Get all alerts with filtering, pagination and search
// @route   GET /api/alerts
// @access  Public
const getAlerts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      severity,
      state,
      district,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      lat,
      lng,
      radius = 50000 // 50km default radius
    } = req.query;

    // Build filter object
    const filters = {};
    
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (severity) filters.severity = severity;
    if (state) filters['location.state'] = new RegExp(state, 'i');
    if (district) filters['location.district'] = new RegExp(district, 'i');

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
    const alerts = await Alert.find(filters)
      .populate('reportedBy', 'name email location')
      .populate('assignedTo', 'name email')
      .sort(sortOptions)
      .limit(limitNum)
      .skip(skip);

    // Get total count for pagination
    const total = await Alert.countDocuments(filters);
    const totalPages = Math.ceil(total / limitNum);

    logger.info('Alerts retrieved', {
      count: alerts.length,
      total,
      page: pageNum,
      filters,
      userId: req.user?._id
    });

    res.status(200).json({
      success: true,
      count: alerts.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages,
        total,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      data: alerts
    });
  } catch (error) {
    logger.error('Get alerts failed:', {
      error: error.message,
      query: req.query,
      userId: req.user?._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve alerts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single alert by ID
// @route   GET /api/alerts/:id
// @access  Public
const getAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('reportedBy', 'name email phone location')
      .populate('assignedTo', 'name email phone')
      .populate('comments.user', 'name email')
      .populate('actions.performedBy', 'name email');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    logger.info('Alert retrieved', {
      alertId: alert._id,
      userId: req.user?._id
    });

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    logger.error('Get alert failed:', {
      error: error.message,
      alertId: req.params.id,
      userId: req.user?._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve alert',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new alert
// @route   POST /api/alerts
// @access  Private
const createAlert = async (req, res) => {
  try {
    // Add the user who created the alert
    req.body.reportedBy = req.user._id;

    const alert = await Alert.create(req.body);

    // Populate the created alert
    await alert.populate('reportedBy', 'name email location');

    logger.info('Alert created', {
      alertId: alert._id,
      userId: req.user._id,
      category: alert.category,
      severity: alert.severity
    });

    // Send notifications to users in the same district (async)
    notifyNearbyUsers(alert);

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: alert
    });
  } catch (error) {
    logger.error('Create alert failed:', {
      error: error.message,
      userId: req.user._id,
      alertData: req.body
    });

    res.status(500).json({
      success: false,
      message: 'Failed to create alert',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update alert
// @route   PUT /api/alerts/:id
// @access  Private (Owner or Admin)
const updateAlert = async (req, res) => {
  try {
    let alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Check ownership or admin role
    if (alert.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this alert'
      });
    }

    // Update alert
    alert = await Alert.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('reportedBy', 'name email').populate('assignedTo', 'name email');

    logger.info('Alert updated', {
      alertId: alert._id,
      userId: req.user._id,
      updatedFields: Object.keys(req.body)
    });

    res.status(200).json({
      success: true,
      message: 'Alert updated successfully',
      data: alert
    });
  } catch (error) {
    logger.error('Update alert failed:', {
      error: error.message,
      alertId: req.params.id,
      userId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to update alert',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private (Owner or Admin)
const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Check ownership or admin role
    if (alert.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this alert'
      });
    }

    await alert.deleteOne();

    logger.info('Alert deleted', {
      alertId: req.params.id,
      userId: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    logger.error('Delete alert failed:', {
      error: error.message,
      alertId: req.params.id,
      userId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to delete alert',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Add comment to alert
// @route   POST /api/alerts/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    const comment = {
      user: req.user._id,
      content: req.body.content,
      createdAt: new Date()
    };

    alert.comments.push(comment);
    await alert.save();

    // Populate the new comment
    await alert.populate('comments.user', 'name email');

    logger.info('Comment added to alert', {
      alertId: req.params.id,
      userId: req.user._id,
      commentLength: req.body.content.length
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: alert.comments[alert.comments.length - 1]
    });
  } catch (error) {
    logger.error('Add comment failed:', {
      error: error.message,
      alertId: req.params.id,
      userId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Add action to alert
// @route   POST /api/alerts/:id/actions
// @access  Private (Veterinarian or Admin)
const addAction = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Only veterinarians and admins can add actions
    if (req.user.role !== 'veterinarian' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only veterinarians can add actions to alerts'
      });
    }

    const action = {
      type: req.body.type,
      description: req.body.description,
      performedBy: req.user._id,
      performedAt: new Date()
    };

    alert.actions.push(action);
    await alert.save();

    // Populate the new action
    await alert.populate('actions.performedBy', 'name email');

    logger.info('Action added to alert', {
      alertId: req.params.id,
      userId: req.user._id,
      actionType: req.body.type
    });

    res.status(201).json({
      success: true,
      message: 'Action added successfully',
      data: alert.actions[alert.actions.length - 1]
    });
  } catch (error) {
    logger.error('Add action failed:', {
      error: error.message,
      alertId: req.params.id,
      userId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to add action',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get alerts near location
// @route   GET /api/alerts/nearby
// @access  Public
const getNearbyAlerts = async (req, res) => {
  try {
    const { lat, lng, radius = 50000, limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const alerts = await Alert.findNearLocation(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(radius)
    )
      .populate('reportedBy', 'name location')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    logger.info('Nearby alerts retrieved', {
      count: alerts.length,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radius: parseInt(radius)
    });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    logger.error('Get nearby alerts failed:', {
      error: error.message,
      query: req.query
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve nearby alerts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get alert statistics
// @route   GET /api/alerts/statistics
// @access  Public
const getAlertStatistics = async (req, res) => {
  try {
    const { state, district, timeframe = '30d' } = req.query;

    // Build filters
    const filters = {};
    if (state) filters['location.state'] = new RegExp(state, 'i');
    if (district) filters['location.district'] = new RegExp(district, 'i');

    // Add time filter
    const timeframeDays = parseInt(timeframe.replace('d', '')) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframeDays);
    filters.createdAt = { $gte: startDate };

    const stats = await Alert.getStatistics(filters);

    logger.info('Alert statistics retrieved', {
      filters,
      timeframe: timeframeDays
    });

    res.status(200).json({
      success: true,
      timeframe: `${timeframeDays} days`,
      data: stats[0] || {
        total: 0,
        active: 0,
        investigating: 0,
        resolved: 0,
        critical: 0,
        high: 0,
        totalAffectedAnimals: 0,
        totalMortality: 0
      }
    });
  } catch (error) {
    logger.error('Get alert statistics failed:', {
      error: error.message,
      query: req.query
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve alert statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to notify nearby users about new alerts
const notifyNearbyUsers = async (alert) => {
  try {
    // Find users in the same district who want notifications
    const nearbyUsers = await User.find({
      'location.state': alert.location.state,
      'location.district': alert.location.district,
      'preferences.notifications.email': true,
      isActive: true,
      emailVerified: true,
      _id: { $ne: alert.reportedBy } // Don't notify the reporter
    });

    // Send notifications asynchronously
    const notificationPromises = nearbyUsers.map(user => 
      sendAlertNotification(user, alert).catch(error => {
        logger.error('Failed to send alert notification:', {
          error: error.message,
          userId: user._id,
          alertId: alert._id
        });
      })
    );

    await Promise.allSettled(notificationPromises);

    logger.info('Alert notifications sent', {
      alertId: alert._id,
      recipientCount: nearbyUsers.length
    });
  } catch (error) {
    logger.error('Failed to notify nearby users:', {
      error: error.message,
      alertId: alert._id
    });
  }
};

module.exports = {
  getAlerts,
  getAlert,
  createAlert,
  updateAlert,
  deleteAlert,
  addComment,
  addAction,
  getNearbyAlerts,
  getAlertStatistics
};