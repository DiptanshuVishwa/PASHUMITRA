# Veterinarian API Testing Guide

This guide provides comprehensive testing examples for all veterinarian API endpoints in the PashuMitra Portal backend.

## Base URL
```
http://localhost:5000/api/veterinarians
```

## Authentication
Some endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Get Specializations List

**GET** `/api/veterinarians/specializations`

Gets the list of available veterinary specializations.

```bash
curl -X GET "http://localhost:5000/api/veterinarians/specializations" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {"key": "large_animal", "label": "Large Animal Medicine"},
    {"key": "small_animal", "label": "Small Animal Medicine"},
    {"key": "poultry", "label": "Poultry Medicine"},
    {"key": "general_practice", "label": "General Practice"}
  ]
}
```

### 2. Get Nearby Veterinarians

**GET** `/api/veterinarians/nearby`

Find veterinarians near a specific location.

```bash
curl -X GET "http://localhost:5000/api/veterinarians/nearby?lat=28.7041&lng=77.1025&radius=50000&limit=10&specialization=large_animal" \
  -H "Content-Type: application/json"
```

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude  
- `radius` (optional): Search radius in meters (default: 50000)
- `limit` (optional): Maximum results (default: 20, max: 50)
- `specialization` (optional): Filter by specialization

### 3. Get All Veterinarians with Filtering

**GET** `/api/veterinarians`

Get all veterinarians with advanced filtering, search, and pagination.

```bash
# Basic request
curl -X GET "http://localhost:5000/api/veterinarians" \
  -H "Content-Type: application/json"

# With filters and search
curl -X GET "http://localhost:5000/api/veterinarians?page=1&limit=10&state=Uttar%20Pradesh&specialization=large_animal&isVerified=true&availabilityStatus=available&sortBy=rating.average&sortOrder=desc&search=cattle" \
  -H "Content-Type: application/json"

# Location-based search
curl -X GET "http://localhost:5000/api/veterinarians?lat=28.7041&lng=77.1025&radius=30000" \
  -H "Content-Type: application/json"
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `specialization` (optional): Filter by specialization
- `state`, `district`, `city` (optional): Location filters
- `search` (optional): Text search in name, bio, specializations
- `isVerified` (optional): Filter by verification status
- `availabilityStatus` (optional): available|unavailable|busy
- `sortBy` (optional): rating.average|experience|createdAt|name
- `sortOrder` (optional): asc|desc
- `lat`, `lng`, `radius` (optional): Geospatial filtering

### 4. Create Veterinarian Profile

**POST** `/api/veterinarians`

Create a new veterinarian profile (authentication required).

```bash
curl -X POST "http://localhost:5000/api/veterinarians" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "name": "Dr. Rajesh Kumar",
    "email": "rajesh.kumar@vet.com",
    "phone": "+919876543210",
    "registrationNumber": "VET/UP/2020/12345",
    "specialization": ["large_animal", "dairy_cattle"],
    "experience": 8,
    "qualifications": [
      {
        "degree": "B.V.Sc & A.H.",
        "institution": "Indian Veterinary Research Institute",
        "year": 2015
      },
      {
        "degree": "M.V.Sc (Animal Medicine)",
        "institution": "IVRI",
        "year": 2017
      }
    ],
    "location": {
      "address": "123 Main Street, Veterinary Hospital",
      "city": "Bareilly",
      "district": "Bareilly",
      "state": "Uttar Pradesh",
      "pincode": "243122",
      "coordinates": [79.4304, 28.3670]
    },
    "bio": "Experienced veterinarian specializing in large animal medicine with 8+ years of experience in dairy cattle health management and emergency care.",
    "services": [
      {
        "name": "General Health Checkup",
        "description": "Comprehensive health examination for livestock",
        "price": 500
      },
      {
        "name": "Vaccination",
        "description": "Preventive vaccination for cattle and buffalo",
        "price": 300
      },
      {
        "name": "Emergency Care",
        "description": "24/7 emergency veterinary services",
        "price": 1000
      }
    ],
    "availability": {
      "status": "available",
      "emergencyAvailable": true,
      "schedule": {
        "monday": {"isWorking": true, "startTime": "09:00", "endTime": "18:00"},
        "tuesday": {"isWorking": true, "startTime": "09:00", "endTime": "18:00"},
        "wednesday": {"isWorking": true, "startTime": "09:00", "endTime": "18:00"},
        "thursday": {"isWorking": true, "startTime": "09:00", "endTime": "18:00"},
        "friday": {"isWorking": true, "startTime": "09:00", "endTime": "18:00"},
        "saturday": {"isWorking": true, "startTime": "09:00", "endTime": "14:00"},
        "sunday": {"isWorking": false}
      }
    }
  }'
```

### 5. Get Specific Veterinarian

**GET** `/api/veterinarians/{id}`

Get details of a specific veterinarian by ID.

```bash
curl -X GET "http://localhost:5000/api/veterinarians/670f7e4b8e8c8b12a5c3d4e5" \
  -H "Content-Type: application/json"
```

### 6. Update Veterinarian Profile

**PUT** `/api/veterinarians/{id}`

Update veterinarian profile (authentication required, owner or admin only).

```bash
curl -X PUT "http://localhost:5000/api/veterinarians/670f7e4b8e8c8b12a5c3d4e5" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "phone": "+919876543211",
    "experience": 9,
    "bio": "Updated bio with more experience in animal health management.",
    "services": [
      {
        "name": "Advanced Surgery",
        "description": "Complex surgical procedures for livestock",
        "price": 5000
      }
    ]
  }'
```

### 7. Delete Veterinarian Profile

**DELETE** `/api/veterinarians/{id}`

Delete veterinarian profile (authentication required, owner or admin only).

```bash
curl -X DELETE "http://localhost:5000/api/veterinarians/670f7e4b8e8c8b12a5c3d4e5" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 8. Update Availability

**PUT** `/api/veterinarians/{id}/availability`

Update veterinarian availability status and schedule (authentication required, owner only).

```bash
curl -X PUT "http://localhost:5000/api/veterinarians/670f7e4b8e8c8b12a5c3d4e5/availability" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "status": "busy",
    "emergencyAvailable": false,
    "schedule": {
      "monday": {"isWorking": true, "startTime": "10:00", "endTime": "17:00"},
      "tuesday": {"isWorking": true, "startTime": "10:00", "endTime": "17:00"}
    }
  }'
```

### 9. Add Rating

**POST** `/api/veterinarians/{id}/rating`

Add a rating to a veterinarian (authentication required, cannot rate own profile).

```bash
curl -X POST "http://localhost:5000/api/veterinarians/670f7e4b8e8c8b12a5c3d4e5/rating" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "rating": 4.5,
    "comment": "Excellent service and very knowledgeable about cattle health."
  }'
```

## Testing Sequence

### 1. Authentication Setup
First, register/login to get a JWT token:

```bash
# Register a new user
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Raj Veterinarian",
    "email": "dr.raj@vet.com",
    "password": "StrongPass123!",
    "phone": "+919876543210",
    "role": "veterinarian"
  }'

# Login to get token
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.raj@vet.com",
    "password": "StrongPass123!"
  }'
```

### 2. Test Public Endpoints
- Get specializations
- Search veterinarians (various filters)
- Get nearby veterinarians
- Get specific veterinarian profile

### 3. Test Protected Endpoints
- Create veterinarian profile
- Update profile
- Update availability
- Add rating (need two different users)
- Delete profile

## Error Testing

### Invalid Data
```bash
# Missing required fields
curl -X POST "http://localhost:5000/api/veterinarians" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "name": "Dr. Test"
  }'

# Invalid specialization
curl -X POST "http://localhost:5000/api/veterinarians" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "name": "Dr. Test",
    "email": "test@vet.com",
    "phone": "+919876543210",
    "registrationNumber": "VET123",
    "specialization": ["invalid_specialization"]
  }'
```

### Authentication Errors
```bash
# No token
curl -X POST "http://localhost:5000/api/veterinarians" \
  -H "Content-Type: application/json" \
  -d '{}'

# Invalid token
curl -X POST "http://localhost:5000/api/veterinarians" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_token" \
  -d '{}'
```

## Expected Responses

### Success Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ },
  "count": 10, // for list endpoints
  "pagination": { /* pagination info */ } // for paginated endpoints
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* validation errors array */ ]
}
```

## Rate Limiting
- General endpoints: 100 requests per 15 minutes per IP
- Strict endpoints (POST, PUT, DELETE): 20 requests per 15 minutes per IP

## Notes
- Replace `<your-jwt-token>` with actual JWT token from login
- Replace veterinarian IDs with actual IDs from your database
- All timestamps are in UTC
- Coordinates are in [longitude, latitude] format (GeoJSON standard)
- Distance is measured in meters
- Phone numbers should include country code

## Swagger Documentation
When running in development mode, API documentation is available at:
```
http://localhost:5000/api/docs
```