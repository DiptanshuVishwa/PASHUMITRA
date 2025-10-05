# PashuMitra Portal Backend API

A comprehensive livestock disease monitoring system backend built with Node.js, Express, and MongoDB Atlas.

## 🚀 Features

- **MongoDB Atlas Integration** - Cloud database with global accessibility
- **JWT Authentication** - Secure user authentication and authorization
- **Geospatial Queries** - Location-based alert and veterinarian searches
- **File Upload System** - Image and document management
- **Email Notifications** - Automated alerts and communications
- **API Documentation** - Swagger/OpenAPI documentation
- **Comprehensive Logging** - Winston-based logging system
- **Security Middleware** - Helmet, rate limiting, CORS protection

## 🏗️ Database Models

### User Model
- User authentication and profiles
- Location tracking with coordinates
- Preferences and notification settings
- Account security with login attempt tracking

### Alert Model
- Disease outbreak reporting
- Geospatial indexing for location queries
- Status tracking (active, investigating, resolved, closed)
- Animal species and symptom tracking
- Image and document attachments

### Veterinarian Model
- Professional vet directory
- Specialization and qualification tracking
- Availability scheduling
- Rating and review system
- Service pricing and duration

### Contact Model
- Support ticket system
- Category-based inquiry handling
- Response tracking and resolution
- Customer satisfaction ratings

## 🌐 Database Configuration

**MongoDB Atlas Cluster:** `pashumitra.vkz14sd.mongodb.net`
**Database Name:** `PashuMitra`
**Connection:** Global cloud hosting with automatic scaling

## 🔧 Environment Setup

1. Copy `.env.example` to `.env`
2. Update with your specific configuration values
3. Ensure MongoDB Atlas cluster is accessible

### Required Environment Variables

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# MongoDB Atlas (Already Configured)
MONGODB_URI=mongodb+srv://prachikhatri2506_db_user:E6VkPi8KBJOHwabP@pashumitra.vkz14sd.mongodb.net/PashuMitra?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_please_change_in_production
JWT_EXPIRE=30d

# Email Configuration
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
```

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test
```

## 🛣️ API Routes

### Health Check
- `GET /health` - Server health status

### Authentication (In Development)
- `GET /api/auth/test` - Test auth routes

### Users (In Development)
- `GET /api/users/test` - Test user routes

### Alerts (In Development)
- `GET /api/alerts/test` - Test alert routes

### Veterinarians (In Development)
- `GET /api/veterinarians/test` - Test vet routes

### Contact (In Development)
- `GET /api/contact/test` - Test contact routes

### Dashboard (In Development)
- `GET /api/dashboard/test` - Test dashboard routes

### Upload (In Development)
- `GET /api/upload/test` - Test upload routes

## 📚 API Documentation

When running in development mode, API documentation is available at:
`http://localhost:5000/api/docs`

## 🔐 Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - 100 requests per 15 minutes
- **CORS** - Configured for frontend integration
- **Input Validation** - Mongoose schema validation
- **Password Hashing** - bcryptjs with salt rounds
- **JWT Tokens** - Secure authentication

## 🗄️ Database Indexes

### Optimized for Performance
- Geospatial indexes for location queries
- Text indexes for search functionality
- Compound indexes for common query patterns
- User-specific indexes for faster lookups

## 📊 Monitoring

- **Winston Logging** - File and console logging
- **Connection Monitoring** - Database connection status
- **Error Tracking** - Comprehensive error handling
- **Application Metrics** - Performance monitoring ready

## 🚀 Deployment Ready

- **Environment Configuration** - Production/development configs
- **Database Migration** - Schema versioning support
- **Health Checks** - Container orchestration ready
- **Graceful Shutdown** - Proper cleanup on termination

---

## Status: 🟡 In Development

**✅ Completed:**
- MongoDB Atlas integration
- Database models and schemas
- Basic Express server setup
- Security middleware configuration
- Logging system
- API documentation framework

**🚧 In Progress:**
- Authentication system
- REST API endpoints
- File upload functionality
- Email notification system

**📋 Next Steps:**
- Complete authentication routes
- Build CRUD endpoints for all models
- Implement file upload with multer
- Set up email notification service
- Frontend API integration