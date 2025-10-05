# PashuMitra Portal API Testing Guide

## 🚀 Authentication API Endpoints

Base URL: `http://localhost:5000/api/auth`

### 📋 **Available Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | User login | ❌ |
| GET | `/me` | Get current user | ✅ |
| PUT | `/profile` | Update profile | ✅ |
| PUT | `/password` | Change password | ✅ |
| POST | `/forgot-password` | Request password reset | ❌ |
| PUT | `/reset-password` | Reset password with token | ❌ |
| POST | `/verify-email` | Verify email address | ❌ |
| POST | `/resend-verification` | Resend verification email | ❌ |
| POST | `/logout` | User logout | ✅ |

---

## 🧪 **Test Examples**

### 1. **User Registration**
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -ContentType "application/json" -Body '{
  "name": "John Farmer",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+919876543210",
  "location": {
    "state": "Maharashtra",
    "district": "Pune",
    "village": "Hadapsar",
    "coordinates": {
      "lat": 18.5204,
      "lng": 73.8567
    }
  }
}'

# cURL
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Farmer",
    "email": "john@example.com", 
    "password": "SecurePass123",
    "phone": "+919876543210",
    "location": {
      "state": "Maharashtra",
      "district": "Pune", 
      "village": "Hadapsar"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "653f8a2b1234567890abcdef",
      "name": "John Farmer",
      "email": "john@example.com",
      "role": "user",
      "isActive": true,
      "emailVerified": false,
      "createdAt": "2025-10-03T14:29:05.123Z"
    }
  }
}
```

### 2. **User Login**
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{
  "email": "john@example.com",
  "password": "SecurePass123"
}'

# cURL
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "653f8a2b1234567890abcdef",
      "name": "John Farmer",
      "email": "john@example.com",
      "role": "user",
      "lastLogin": "2025-10-03T14:30:15.456Z"
    }
  }
}
```

### 3. **Get Current User Profile** (Protected Route)
```bash
# PowerShell (replace TOKEN with actual JWT token)
$headers = @{ Authorization = "Bearer YOUR_JWT_TOKEN_HERE" }
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method GET -Headers $headers

# cURL
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 4. **Update Profile** (Protected Route)
```bash
# PowerShell
$headers = @{ Authorization = "Bearer YOUR_JWT_TOKEN_HERE" }
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/profile" -Method PUT -ContentType "application/json" -Headers $headers -Body '{
  "name": "John Updated Farmer",
  "phone": "+919876543211",
  "preferences": {
    "language": "hi",
    "notifications": {
      "email": true,
      "sms": true
    }
  }
}'
```

### 5. **Change Password** (Protected Route)
```bash
# PowerShell
$headers = @{ Authorization = "Bearer YOUR_JWT_TOKEN_HERE" }
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/password" -Method PUT -ContentType "application/json" -Headers $headers -Body '{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass456",
  "confirmPassword": "NewSecurePass456"
}'
```

### 6. **Forgot Password**
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/forgot-password" -Method POST -ContentType "application/json" -Body '{
  "email": "john@example.com"
}'
```

### 7. **Test Health Check**
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET

# cURL
curl -X GET http://localhost:5000/health
```

---

## 🔐 **JWT Token Usage**

After successful login/registration, you'll receive a JWT token. Use this token in the Authorization header for protected routes:

**Header Format:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1M2Y4YTJiMTIzNDU2Nzg5MGFiY2RlZiIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjk4NzUwMzQ1LCJleHAiOjE3MDEzNDIzNDV9.signature
```

---

## 🛡️ **Security Features Implemented**

### ✅ **Rate Limiting**
- **Registration/Login:** 5 attempts per 15 minutes
- **Password Reset:** 3 attempts per 15 minutes  
- **Email Verification:** 3 attempts per 15 minutes

### ✅ **Account Security**
- **Password Requirements:** Min 6 chars, uppercase, lowercase, number
- **Account Lockout:** 5 failed attempts locks account for 2 hours
- **Password Hashing:** bcryptjs with 12 salt rounds
- **JWT Expiration:** 30 days (configurable)

### ✅ **Validation**
- **Input Validation:** All endpoints have comprehensive validation
- **Email Format:** Valid email format required
- **Phone Format:** International phone number format
- **Location Validation:** Coordinate bounds checking

---

## 🌟 **Success Indicators**

### ✅ **Server Successfully Running:**
- MongoDB Atlas connected ✅
- All routes loaded without errors ✅
- Security middleware active ✅
- Validation middleware working ✅

### ✅ **Ready for Testing:**
- User registration working ✅
- JWT token generation ✅
- Password hashing ✅
- Email verification system ✅
- Protected routes secured ✅

---

## 📊 **API Documentation**

### **Swagger Documentation Available at:**
`http://localhost:5000/api/docs` (when server is running)

### **Postman Collection:**
Import the following endpoints into Postman for easier testing.

---

## 🔧 **Environment Configuration**

Make sure these environment variables are properly set in your `.env` file:

```env
JWT_SECRET=your_jwt_secret_key_here_please_change_in_production
JWT_EXPIRE=30d
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
```

---

## 🚨 **Error Handling**

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed validation errors if applicable"]
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request/Validation Error  
- `401` - Unauthorized
- `403` - Forbidden
- `423` - Account Locked
- `429` - Too Many Requests (Rate Limited)
- `500` - Internal Server Error

---

## 🎉 **Authentication System Complete!**

The authentication system is now fully functional with:
- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Password reset functionality
- ✅ Email verification
- ✅ Profile management
- ✅ Security features (rate limiting, account lockout)
- ✅ Comprehensive validation
- ✅ MongoDB Atlas integration
- ✅ Swagger documentation