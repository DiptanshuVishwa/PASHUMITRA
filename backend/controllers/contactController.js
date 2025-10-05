const Contact = require('../models/Contact');
const logger = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');

// @desc    Submit a new contact form
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res) => {
  try {
    // Add request metadata
    const contactData = {
      ...req.body,
      source: 'web',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId: req.user?._id // If user is logged in
    };

    const contact = await Contact.create(contactData);

    // Send confirmation email to user
    try {
      await sendEmail({
        to: contact.email,
        subject: `Contact Form Received - ${contact.subject}`,
        template: 'contactConfirmation',
        data: {
          name: contact.name,
          ticketId: contact._id,
          subject: contact.subject,
          message: contact.message,
          category: contact.category
        }
      });
    } catch (emailError) {
      logger.warn('Failed to send confirmation email:', {
        contactId: contact._id,
        email: contact.email,
        error: emailError.message
      });
    }

    // Send notification to admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@pashumnitra.com',
        subject: `New Contact Form: ${contact.category.toUpperCase()} - ${contact.subject}`,
        template: 'newContactNotification',
        data: {
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
          message: contact.message,
          category: contact.category,
          priority: contact.priority,
          ticketId: contact._id
        }
      });
    } catch (emailError) {
      logger.warn('Failed to send admin notification:', {
        contactId: contact._id,
        error: emailError.message
      });
    }

    logger.info('Contact form submitted', {
      contactId: contact._id,
      category: contact.category,
      priority: contact.priority,
      email: contact.email
    });

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully. We will get back to you soon!',
      data: {
        ticketId: contact._id,
        status: contact.status,
        category: contact.category,
        priority: contact.priority,
        submittedAt: contact.createdAt
      }
    });
  } catch (error) {
    logger.error('Submit contact failed:', {
      error: error.message,
      contactData: req.body
    });

    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all contact forms with filtering and pagination
// @route   GET /api/contact
// @access  Private (Admin/Staff)
const getContacts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      assignedTo,
      search,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filters = {};
    
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (priority) filters.priority = priority;
    if (assignedTo) filters.assignedTo = assignedTo;
    
    // Date range filter
    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) filters.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filters.createdAt.$lte = new Date(dateTo);
    }

    // Text search
    if (search) {
      filters.$text = { $search: search };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const contacts = await Contact.find(filters)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .populate('responses.respondedBy', 'name email')
      .sort(sortOptions)
      .limit(limitNum)
      .skip(skip);

    // Get total count for pagination
    const total = await Contact.countDocuments(filters);
    const totalPages = Math.ceil(total / limitNum);

    logger.info('Contacts retrieved', {
      count: contacts.length,
      total,
      page: pageNum,
      filters,
      adminId: req.user._id
    });

    res.status(200).json({
      success: true,
      count: contacts.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages,
        total,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      data: contacts
    });
  } catch (error) {
    logger.error('Get contacts failed:', {
      error: error.message,
      query: req.query,
      adminId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contacts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single contact form by ID
// @route   GET /api/contact/:id
// @access  Private (Admin/Staff) or Public (if user owns it)
const getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .populate('responses.respondedBy', 'name email')
      .populate('relatedAlert', 'title type location');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    // Check permissions - admin/staff can view all, users can only view their own
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      if (!contact.userId || contact.userId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this contact form'
        });
      }
    }

    // Hide internal responses from regular users
    let contactData = contact.toObject();
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      contactData.responses = contact.publicResponses;
    }

    logger.info('Contact retrieved', {
      contactId: contact._id,
      userId: req.user._id
    });

    res.status(200).json({
      success: true,
      data: contactData
    });
  } catch (error) {
    logger.error('Get contact failed:', {
      error: error.message,
      contactId: req.params.id,
      userId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact form',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update contact form (admin only)
// @route   PUT /api/contact/:id
// @access  Private (Admin/Staff)
const updateContact = async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    // Update contact
    contact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email');

    logger.info('Contact updated', {
      contactId: contact._id,
      adminId: req.user._id,
      updatedFields: Object.keys(req.body)
    });

    res.status(200).json({
      success: true,
      message: 'Contact form updated successfully',
      data: contact
    });
  } catch (error) {
    logger.error('Update contact failed:', {
      error: error.message,
      contactId: req.params.id,
      adminId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to update contact form',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete contact form (admin only)
// @route   DELETE /api/contact/:id
// @access  Private (Admin)
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    await contact.deleteOne();

    logger.info('Contact deleted', {
      contactId: req.params.id,
      adminId: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Contact form deleted successfully'
    });
  } catch (error) {
    logger.error('Delete contact failed:', {
      error: error.message,
      contactId: req.params.id,
      adminId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to delete contact form',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Add response to contact form
// @route   POST /api/contact/:id/response
// @access  Private (Admin/Staff)
const addResponse = async (req, res) => {
  try {
    const { message, isInternal = false } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    // Add response using model method
    await contact.addResponse(req.user._id, message, isInternal);

    // Send email to user if response is public
    if (!isInternal && contact.email) {
      try {
        await sendEmail({
          to: contact.email,
          subject: `Response to your inquiry - ${contact.subject}`,
          template: 'contactResponse',
          data: {
            name: contact.name,
            ticketId: contact._id,
            subject: contact.subject,
            response: message,
            respondedBy: req.user.name
          }
        });
      } catch (emailError) {
        logger.warn('Failed to send response email:', {
          contactId: contact._id,
          error: emailError.message
        });
      }
    }

    const updatedContact = await Contact.findById(req.params.id)
      .populate('responses.respondedBy', 'name email');

    logger.info('Response added to contact', {
      contactId: contact._id,
      respondedBy: req.user._id,
      isInternal
    });

    res.status(201).json({
      success: true,
      message: 'Response added successfully',
      data: {
        status: updatedContact.status,
        totalResponses: updatedContact.totalResponses,
        lastResponse: updatedContact.responses[updatedContact.responses.length - 1]
      }
    });
  } catch (error) {
    logger.error('Add response failed:', {
      error: error.message,
      contactId: req.params.id,
      adminId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to add response',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Resolve contact form
// @route   PUT /api/contact/:id/resolve
// @access  Private (Admin/Staff)
const resolveContact = async (req, res) => {
  try {
    const { resolutionNotes } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    // Resolve using model method
    await contact.resolve(req.user._id, resolutionNotes);

    // Send resolution email to user
    if (contact.email) {
      try {
        await sendEmail({
          to: contact.email,
          subject: `Your inquiry has been resolved - ${contact.subject}`,
          template: 'contactResolution',
          data: {
            name: contact.name,
            ticketId: contact._id,
            subject: contact.subject,
            resolutionNotes,
            resolvedBy: req.user.name
          }
        });
      } catch (emailError) {
        logger.warn('Failed to send resolution email:', {
          contactId: contact._id,
          error: emailError.message
        });
      }
    }

    logger.info('Contact resolved', {
      contactId: contact._id,
      resolvedBy: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Contact form resolved successfully',
      data: {
        status: contact.status,
        resolvedAt: contact.resolution.resolvedAt,
        resolutionTime: contact.resolutionTime
      }
    });
  } catch (error) {
    logger.error('Resolve contact failed:', {
      error: error.message,
      contactId: req.params.id,
      adminId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to resolve contact form',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get contact form statistics
// @route   GET /api/contact/statistics
// @access  Private (Admin/Staff)
const getContactStatistics = async (req, res) => {
  try {
    const { dateFrom, dateTo, category } = req.query;
    
    // Build filters
    const filters = {};
    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) filters.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filters.createdAt.$lte = new Date(dateTo);
    }
    if (category) filters.category = category;

    const statistics = await Contact.getStatistics(filters);

    logger.info('Contact statistics retrieved', {
      filters,
      adminId: req.user._id
    });

    res.status(200).json({
      success: true,
      data: statistics[0] || {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        averageResolutionTime: 0,
        totalResponseTime: 0
      }
    });
  } catch (error) {
    logger.error('Get contact statistics failed:', {
      error: error.message,
      adminId: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get contact categories
// @route   GET /api/contact/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = [
      { key: 'general', label: 'General Inquiry' },
      { key: 'technical_support', label: 'Technical Support' },
      { key: 'veterinary_consultation', label: 'Veterinary Consultation' },
      { key: 'feedback', label: 'Feedback' },
      { key: 'complaint', label: 'Complaint' },
      { key: 'feature_request', label: 'Feature Request' },
      { key: 'bug_report', label: 'Bug Report' },
      { key: 'account_issue', label: 'Account Issue' },
      { key: 'billing', label: 'Billing' },
      { key: 'partnership', label: 'Partnership' }
    ];

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('Get categories failed:', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  submitContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  addResponse,
  resolveContact,
  getContactStatistics,
  getCategories
};