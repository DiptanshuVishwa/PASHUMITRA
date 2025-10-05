const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // MongoDB Atlas connection options
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      retryWrites: true, // Enable retryable writes
      w: 'majority', // Write concern
      appName: 'PashuMitra-Portal', // Application name for monitoring
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    // Extract cluster info from Atlas URI
    const clusterInfo = process.env.MONGODB_URI.includes('mongodb+srv://') 
      ? 'MongoDB Atlas Cluster' 
      : `${conn.connection.host}:${conn.connection.port}`;
    
    logger.info(`✅ MongoDB Connected: ${clusterInfo}/${conn.connection.name}`);
    logger.info(`📊 Database: ${conn.connection.db.databaseName}`);
    
    // Handle connection events
    mongoose.connection.on('connected', () => {
      logger.info('🔗 Mongoose connected to MongoDB Atlas');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ Mongoose disconnected from MongoDB Atlas');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 Mongoose reconnected to MongoDB Atlas');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      logger.info('🛑 Received SIGINT signal, closing database connection...');
      await mongoose.connection.close();
      logger.info('💤 Mongoose connection closed due to app termination');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('🛑 Received SIGTERM signal, closing database connection...');
      await mongoose.connection.close();
      logger.info('💤 Mongoose connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('💥 Database connection failed:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    process.exit(1);
  }
};

module.exports = connectDB;