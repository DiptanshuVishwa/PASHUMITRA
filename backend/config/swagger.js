const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PashuMitra Portal API',
      version: '1.0.0',
      description: 'API documentation for PashuMitra Portal - Livestock Disease Monitoring System',
      contact: {
        name: 'PashuMitra Team',
        email: 'support@pashumnitra.com',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.pashumnitra.com' 
          : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin', 'veterinarian'],
              description: 'User role',
            },
            phone: {
              type: 'string',
              description: 'User phone number',
            },
            location: {
              type: 'object',
              properties: {
                state: { type: 'string' },
                district: { type: 'string' },
                village: { type: 'string' },
                coordinates: {
                  type: 'object',
                  properties: {
                    lat: { type: 'number' },
                    lng: { type: 'number' },
                  },
                },
              },
            },
            isActive: {
              type: 'boolean',
              description: 'Account status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
          },
        },
        Alert: {
          type: 'object',
          required: ['title', 'description', 'location', 'reportedBy'],
          properties: {
            id: {
              type: 'string',
              description: 'Alert ID',
            },
            title: {
              type: 'string',
              description: 'Alert title',
            },
            description: {
              type: 'string',
              description: 'Alert description',
            },
            category: {
              type: 'string',
              enum: ['disease', 'injury', 'death', 'vaccination', 'general'],
              description: 'Alert category',
            },
            severity: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'Alert severity level',
            },
            status: {
              type: 'string',
              enum: ['active', 'investigating', 'resolved', 'closed'],
              description: 'Alert status',
            },
            location: {
              type: 'object',
              properties: {
                state: { type: 'string' },
                district: { type: 'string' },
                village: { type: 'string' },
                coordinates: {
                  type: 'object',
                  properties: {
                    lat: { type: 'number' },
                    lng: { type: 'number' },
                  },
                },
              },
            },
            affectedAnimals: {
              type: 'object',
              properties: {
                species: { type: 'string' },
                count: { type: 'number' },
                symptoms: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
            images: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of image URLs',
            },
            reportedBy: {
              type: 'string',
              description: 'User ID who reported the alert',
            },
            assignedTo: {
              type: 'string',
              description: 'Veterinarian ID assigned to this alert',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Veterinarian: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Veterinarian ID',
            },
            name: {
              type: 'string',
              description: 'Veterinarian full name',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            phone: {
              type: 'string',
              description: 'Contact phone number',
            },
            specialization: {
              type: 'array',
              items: { type: 'string' },
              description: 'Areas of specialization',
            },
            experience: {
              type: 'number',
              description: 'Years of experience',
            },
            location: {
              type: 'object',
              properties: {
                state: { type: 'string' },
                district: { type: 'string' },
                address: { type: 'string' },
                coordinates: {
                  type: 'object',
                  properties: {
                    lat: { type: 'number' },
                    lng: { type: 'number' },
                  },
                },
              },
            },
            availability: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['available', 'busy', 'offline'],
                },
                schedule: {
                  type: 'object',
                  description: 'Weekly schedule',
                },
              },
            },
            rating: {
              type: 'number',
              minimum: 0,
              maximum: 5,
              description: 'Average rating',
            },
            isVerified: {
              type: 'boolean',
              description: 'Verification status',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            errors: {
              type: 'array',
              items: { type: 'string' },
              description: 'Detailed error messages',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              description: 'Success message',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Alerts',
        description: 'Alert management endpoints',
      },
      {
        name: 'Veterinarians',
        description: 'Veterinarian directory endpoints',
      },
      {
        name: 'Contact',
        description: 'Contact and support endpoints',
      },
      {
        name: 'Dashboard',
        description: 'Dashboard analytics endpoints',
      },
      {
        name: 'Upload',
        description: 'File upload endpoints',
      },
    ],
  },
  apis: ['./routes/*.js', './models/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

module.exports = specs;