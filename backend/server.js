// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('./config/passport');
require('dotenv').config();

const connectDB = require('./config/database');
const logger = require('./utils/logger');
const serviceManager = require('./services');
const { trackAPIRequest, trackError, trackPerformance } = require('./middleware/monitoring');

// Import route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const alertRoutes = require('./routes/alerts');
const veterinarianRoutes = require('./routes/veterinarians');
const contactRoutes = require('./routes/contact');
const dashboardRoutes = require('./routes/dashboard');
const uploadRoutes = require('./routes/upload');
const translationRoutes = require('./routes/translation');

const app = express();

// Trust proxy for deployment platforms like Render
app.set('trust proxy', true);

// Connect to MongoDB
connectDB();

// Initialize global cloud services
serviceManager.initializeServices().catch(error => {
  logger.error('Failed to initialize global services:', error);
  // Continue startup even if some services fail
});

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://192.168.44.1:3000', // Local network access for mobile
    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:3000$/, // Any 192.168.x.x:3000
    /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:3000$/, // Any 10.x.x.x:3000
    /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}:3000$/ // Private range 172.16.0.0-172.31.255.255:3000
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'pashumitra-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// API request tracking middleware
app.use('/api', trackAPIRequest);

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const serviceHealth = await serviceManager.getServiceHealth();
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: serviceHealth
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Service statistics endpoint
app.get('/api/services/stats', async (req, res) => {
  try {
    const stats = await serviceManager.getServiceStatistics();
    res.status(200).json({
      success: true,
      ...stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/veterinarians', veterinarianRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/translation', translationRoutes);

// API documentation (Swagger)
if (process.env.NODE_ENV !== 'production') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = require('./config/swagger');
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Error tracking middleware
app.use(trackError);

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  
  // Shutdown services first
  await serviceManager.shutdown();
  
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Bind to all interfaces for network access

const server = app.listen(PORT, HOST, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on ${HOST}:${PORT}`);
  logger.info(`Network access available at: http://10.117.158.60:${PORT}`);
  
  // Start performance monitoring
  const performanceMonitor = trackPerformance();
  performanceMonitor.start();
  
  // Track active connections
  global.activeConnections = 0;
  server.on('connection', (socket) => {
    global.activeConnections++;
    socket.on('close', () => {
      global.activeConnections--;
    });
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;