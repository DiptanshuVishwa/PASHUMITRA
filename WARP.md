# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

PashuMitra Portal is a comprehensive full-stack livestock disease monitoring system designed to help farmers implement, monitor, and maintain robust biosecurity practices for their pig and poultry farms. The application consists of a React frontend and Node.js/Express backend with AWS cloud services integration, MongoDB Atlas database, and support for mobile device access.

## Common Development Commands

### Full Stack Development Workflow

**Frontend Development:**
```bash
# Install dependencies
npm install

# Start development server (localhost only)
npm start
# Opens http://localhost:3000 in development mode with hot reload

# Start with network access (for mobile testing)
npm run start:network
# Accessible from mobile devices on same WiFi

# Start with mobile API configuration
npm run start:mobile
# Uses network IP for API calls instead of localhost

# Build for production
npm run build
# Creates optimized production build in ./build directory

# Build for mobile deployment
npm run build:mobile
# Build with mobile-optimized API endpoints
```

**Backend Development:**
```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Start development server with auto-reload
npm run dev
# Server runs on http://localhost:5000 with nodemon

# Start production server
npm start
# Production server without auto-reload

# Run backend tests
npm test
# Executes Jest test suite for backend

# Database seeding
npm run seed
# Populates database with initial data
```

**Testing and Development:**
```bash
# Test API connectivity
node test-backend-connection.js

# Test mobile network connectivity
node test-mobile-connectivity.js

# Test authentication flow
node test-auth-flow.js

# Test file upload functionality
node test-file-upload.js

# Test alert system
node test-alert-flow.js
```

### Project Setup (Full Stack)
```bash
# First time setup after cloning
# 1. Install frontend dependencies
npm install

# 2. Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env file with your configuration

# 3. Start both servers
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
npm start
```

## Architecture Overview

### Technology Stack

**Frontend Stack:**
- **React 19.2.0** with Create React App
- **Routing**: React Router DOM v7.9.3
- **Styling**: Styled Components v6.1.19
- **Animations**: Framer Motion v12.23.22
- **HTTP Client**: Axios v1.12.2 with interceptors
- **Internationalization**: i18next + react-i18next (22+ languages)
- **Maps**: Leaflet + React Leaflet v5.0.0
- **Icons**: React Icons v5.5.0
- **File Handling**: React Dropzone v14.3.8
- **Notifications**: React Hot Toast v2.6.0
- **Charts**: Recharts v3.2.1
- **PDF Generation**: jsPDF v3.0.3
- **Canvas**: html2canvas v1.4.1

**Backend Stack:**
- **Runtime**: Node.js >=16.0.0
- **Framework**: Express 4.18.2
- **Database**: MongoDB Atlas (Cloud)
- **ODM**: Mongoose 8.0.3
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer + Multer-S3
- **Validation**: Joi 17.11.0 + Express Validator 7.0.1
- **Security**: Helmet 7.1.0 + Rate Limiting
- **Logging**: Winston 3.11.0
- **Testing**: Jest 29.7.0 + Supertest 6.3.3

**AWS Cloud Services:**
- **AWS S3**: File storage and management
- **AWS SES**: Email delivery service
- **AWS SNS**: SMS and push notifications
- **AWS CloudWatch**: Monitoring and logging

### Full Stack Project Structure

**Frontend Structure:**
```
src/
├── components/             # Reusable UI components
│   ├── AIBot.js           # AI chatbot with voice integration
│   ├── Footer.js          # Application footer
│   ├── Navbar.js          # Navigation component
│   └── LiveHeatMap.js     # Real-time disease outbreak visualization
├── context/               # React Context providers
│   ├── AuthContext.js     # Authentication state with backend integration
│   └── LanguageContext.js # Multi-language support (22+ languages)
├── pages/                 # Application pages
│   ├── Auth.js           # Login/Signup with backend auth
│   ├── Dashboard.js      # Main dashboard with live data
│   ├── EnhancedDashboard.js # Advanced dashboard features
│   ├── AnalyticsDashboard.js # Data analytics and charts
│   ├── RaiseAlertPage.js # Disease alert reporting with file upload
│   ├── WeatherDashboard.js # Weather integration for disease prediction
│   ├── FarmManagementPage.js # Farm inventory and management
│   ├── ContactVetPage.js # Veterinarian directory and booking
│   └── NotificationsPage.js # Alert and notification center
├── services/              # API integration layer
│   ├── api.js            # Centralized Axios configuration
│   ├── alertService.js   # Alert system API calls
│   ├── fileUpload.js     # File upload with progress tracking
│   ├── notificationService.js # Notification management
│   └── errorHandler.js   # Centralized error handling
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
│   └── i18n.js           # Internationalization configuration
└── locales/              # Translation files for 22+ languages
```

**Backend Structure:**
```
backend/
├── config/               # Configuration files
│   ├── database.js      # MongoDB Atlas connection
│   └── swagger.js       # API documentation setup
├── controllers/          # Request handlers
│   ├── authController.js # Authentication logic
│   ├── alertController.js # Alert system logic
│   ├── userController.js # User management
│   └── dashboardController.js # Dashboard data aggregation
├── models/              # MongoDB schemas
│   ├── User.js          # User model with geolocation
│   ├── Alert.js         # Disease alert model
│   ├── Veterinarian.js  # Vet directory model
│   └── Contact.js       # Support ticket model
├── routes/              # API route definitions
│   ├── auth.js          # Authentication endpoints
│   ├── alerts.js        # Alert system endpoints
│   ├── users.js         # User management endpoints
│   ├── dashboard.js     # Dashboard data endpoints
│   ├── upload.js        # File upload endpoints
│   └── veterinarians.js # Veterinarian directory
├── services/            # Business logic services
│   ├── emailService.js  # AWS SES integration
│   ├── smsService.js    # AWS SNS integration
│   ├── fileService.js   # AWS S3 file management
│   └── monitoringService.js # CloudWatch integration
├── middleware/          # Express middleware
│   ├── auth.js          # JWT authentication middleware
│   ├── upload.js        # Multer file upload middleware
│   ├── validation.js    # Input validation middleware
│   └── monitoring.js    # Request tracking and metrics
├── utils/               # Utility functions
│   ├── logger.js        # Winston logging configuration
│   └── seedDatabase.js  # Database seeding script
└── server.js            # Express server entry point
```

### State Management Architecture

**Authentication Flow:**
- `AuthContext` manages user authentication state using localStorage
- Stores user data, authentication status, and questionnaire completion
- Provides login/logout methods and questionnaire completion tracking

**Language Management:**
- `LanguageContext` supports 22+ Indian languages
- Uses i18next for translation keys and locale switching
- Stores language preference in localStorage
- Languages include: English, Hindi, Bengali, Telugu, Marathi, Tamil, and more regional languages

**Route Protection:**
- Authentication-aware routing in App.js
- Questionnaire completion gates access to dashboard
- Warning page for high-risk biosecurity scores

### Key Application Flows

**User Onboarding:**
1. Landing page requests browser permissions (location, camera, microphone)
2. Language selection from 22+ supported languages
3. User authentication (login/signup)
4. Biosecurity questionnaire assessment
5. Based on score: Dashboard access or Warning page

**Permission System:**
- Location: For farm mapping and alert proximity
- Camera: For farm photos and documentation
- Microphone: For voice commands and AI bot interactions

**Scoring System:**
- Questionnaire evaluates biosecurity practices
- Score ≥7: Good practices → Dashboard access
- Score <7: High risk → Warning page with recommendations

### Component Patterns

**Styled Components:**
- All styling uses styled-components with CSS-in-JS
- Design system uses CSS custom properties for colors
- Responsive design with mobile-first approach
- Animation integration with Framer Motion

**Context Patterns:**
- Custom hooks (useAuth, useLanguage) for context access
- Error boundaries for context usage validation
- Local storage persistence for state management

**API Integration:**
- Axios for HTTP requests (ready for backend integration)
- Mock responses in development
- Error handling and loading states
## Development Guidelines

### Full Stack Integration Patterns

**API Integration:**
- All API calls use centralized `services/api.js` with Axios interceptors
- Automatic JWT token management and refresh
- Error handling with automatic logout on 401 responses
- Request/response logging for development debugging

**Authentication Flow:**
```javascript
// Login with backend validation
const { user, token } = await login({ email, password });

// Registration with farm location
const result = await register({ 
  name, email, password, phone, farmLocation 
});

// Automatic token refresh on API calls
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

**File Upload Integration:**
```javascript
// Upload with progress tracking
const uploadResult = await uploadSingleFile(fileData, (progress) => {
  console.log(`Upload: ${progress.uploadProgress}%`);
});

// Alert creation with files
const alertResult = await createAlert(
  alertData, images, audioRecording, progressCallback
);
```

### Mobile Development Guidelines

**Network Configuration:**
- Use `npm run start:network` for mobile testing
- Backend binds to `0.0.0.0:5000` for network access
- CORS configured for private IP ranges
- Environment switching with `.env.mobile`

**Mobile Testing Workflow:**
```bash
# Start backend for network access
cd backend && npm run dev

# Start frontend for mobile access
npm run start:network

# Test connectivity
node test-mobile-connectivity.js
```

### Backend Development Patterns

**MongoDB Integration:**
- Use Mongoose schemas with validation
- Geospatial indexing for location-based queries
- Aggregation pipelines for dashboard analytics
- Connection pooling with Atlas cloud database

**AWS Services Integration:**
- S3 for file storage with presigned URLs
- SES for transactional emails
- SNS for SMS and push notifications
- CloudWatch for monitoring and logging

**API Endpoint Patterns:**
```javascript
// Controller pattern with validation
const createAlert = async (req, res) => {
  try {
    const validatedData = await alertSchema.validateAsync(req.body);
    const alert = await Alert.create(validatedData);
    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
```

### Frontend Development Patterns

**Internationalization:**
- All user-facing text uses `t()` function
- Translation keys: `section.subsection.key`
- 22+ supported languages including regional Indian languages
- Context-aware language switching with localStorage persistence

**State Management:**
- React Context for global state (Auth, Language)
- Local state for component-specific data
- Backend integration through service layer
- Error boundaries for service failures

**Component Architecture:**
- Functional components with hooks
- Styled-components for CSS-in-JS
- Framer Motion for animations
- Responsive design with mobile-first approach
- Form state management with local component state

## Feature Development Status

### Implemented Features
- User authentication flow with Google OAuth preparation
- Multilingual support with 22+ Indian languages
- Biosecurity questionnaire with scoring system
- Permission management system
- AI chatbot UI (voice integration pending)
- Responsive landing page with animations

### In Development
- Dashboard with live map and alerts
- Compliance tracking and certification
- Risk assessment tools
- Learning resources section
- Alert system for biosecurity threats
- Backend API integration

### Planned Integrations
- Deepgram Nova for AI voice interactions
- Leaflet maps for farm location and alert visualization
- Camera integration for farm documentation
- Real-time alert system
- Government compliance APIs

## Testing Strategy

### Current Test Setup
- Jest + React Testing Library
- Test files: `*.test.js` pattern
- Focus on critical user journeys
- Component rendering and interaction testing

### Key Test Areas
- Authentication flows
- Language switching functionality
- Questionnaire scoring logic
- Permission request handling
- Route navigation and protection

## Browser Compatibility

### Production Targets
- \>0.2% market share
- Not dead browsers
- Not Opera Mini

### Development Targets
- Latest Chrome, Firefox, Safari versions
- Modern JavaScript features (ES2020+)
- CSS Grid and Flexbox support

## Environment Configuration

### Frontend Environment Variables

**Development (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
```

**Mobile Development (.env.mobile):**
```env
REACT_APP_API_URL=http://192.168.44.1:5000/api
REACT_APP_ENVIRONMENT=mobile
```

### Backend Environment Variables

**Required Configuration (backend/.env):**
```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=0.0.0.0
FRONTEND_URL=http://localhost:3000

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://prachikhatri2506_db_user:E6VkPi8KBJOHwabP@pashumitra.vkz14sd.mongodb.net/PashuMitra?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_jwt_secret_key_here_please_change_in_production
JWT_EXPIRE=30d

# AWS Services
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_preferred_region
AWS_S3_BUCKET=your_s3_bucket_name

# Email Service (AWS SES)
SES_FROM_EMAIL=noreply@yourdomain.com
SES_REGION=us-west-2

# SMS Service (AWS SNS)
SNS_REGION=us-west-2

# Monitoring
CLOUDWATCH_LOG_GROUP=/aws/lambda/pashumnitra
```

### Environment Setup Commands
```bash
# Copy backend environment template
cd backend
cp .env.example .env

# Copy mobile environment for frontend
cp .env.mobile .env  # When developing with mobile devices
```

## Performance Considerations

### Optimization Features
- Code splitting with React.lazy (ready for implementation)
- Bundle analysis available with `npm run build`
- Image optimization for farm photos
- Lazy loading for maps and heavy components

### Monitoring
- Web Vitals integration for performance metrics
- Error reporting setup ready for production
- Analytics preparation for user behavior tracking