const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BASE_URL = process.env.FRONTEND_URL?.replace('3000', '5000') || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

console.log('🔍 Testing File Upload Authentication...\n');
console.log('API URL:', API_URL);

// Create test file
const createTestFile = () => {
  const testContent = 'Test file content for upload testing';
  const testFilePath = path.join(__dirname, 'test-file.txt');
  fs.writeFileSync(testFilePath, testContent);
  return testFilePath;
};

const testUploadAuth = async () => {
  try {
    console.log('1. Testing backend health...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('   ✅ Backend is running');
      console.log('   Status:', healthResponse.data.status);
      console.log('   Environment:', healthResponse.data.environment);
    } catch (healthError) {
      console.log('   ❌ Backend health check failed:', healthError.message);
      return;
    }

    console.log('\n2. Testing file upload without authentication...');
    const testFilePath = createTestFile();
    
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(testFilePath));
      formData.append('category', 'general');
      formData.append('description', 'Test file upload');

      const uploadResponse = await axios.post(
        `${API_URL}/upload/single`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          timeout: 30000
        }
      );
      
      console.log('   ❌ Upload succeeded without auth (this should not happen!)');
      console.log('   Response:', uploadResponse.data);
    } catch (uploadError) {
      if (uploadError.response?.status === 401) {
        console.log('   ✅ Upload correctly rejected without authentication');
        console.log('   Status:', uploadError.response.status);
        console.log('   Message:', uploadError.response.data.message);
      } else {
        console.log('   ❌ Upload failed with unexpected error:', uploadError.message);
        console.log('   Status:', uploadError.response?.status);
        console.log('   Data:', uploadError.response?.data);
      }
    }

    console.log('\n3. Testing alert creation without authentication...');
    try {
      const alertData = {
        title: 'Test Alert',
        description: 'Test alert description',
        category: 'disease',
        severity: 'high',
        status: 'active',
        location: {
          state: 'Test State',
          district: 'Test District',
          village: 'Test Village',
          coordinates: { lat: 18.5204, lng: 73.8567 }
        },
        contactInfo: {
          name: 'Test User',
          phone: '+91 9876543210',
          email: 'test@example.com'
        }
      };

      const alertResponse = await axios.post(`${API_URL}/alerts`, alertData);
      console.log('   ❌ Alert creation succeeded without auth (this should not happen!)');
      console.log('   Response:', alertResponse.data);
    } catch (alertError) {
      if (alertError.response?.status === 401) {
        console.log('   ✅ Alert creation correctly rejected without authentication');
        console.log('   Status:', alertError.response.status);
        console.log('   Message:', alertError.response.data.message);
      } else {
        console.log('   ❌ Alert creation failed with unexpected error:', alertError.message);
        console.log('   Status:', alertError.response?.status);
        console.log('   Data:', alertError.response?.data);
      }
    }

    console.log('\n4. Testing user registration (to get a token)...');
    const testUser = {
      name: 'Test User ' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'TestPass123!',
      phone: '+919876543210',
      role: 'farmer',
      location: {
        state: 'Maharashtra',
        district: 'Pune',
        pincode: '411001'
      }
    };

    let authToken = null;
    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
      console.log('   ✅ User registration successful');
      authToken = registerResponse.data.token;
      console.log('   Token received:', authToken ? '✅ Yes' : '❌ No');
    } catch (regError) {
      console.log('   ❌ Registration failed:', regError.response?.data?.message || regError.message);
      
      // Try to login instead
      console.log('\n   Attempting login with default credentials...');
      try {
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: 'test@example.com',
          password: 'password123'
        });
        console.log('   ✅ Login successful');
        authToken = loginResponse.data.token;
      } catch (loginError) {
        console.log('   ❌ Login also failed:', loginError.response?.data?.message || loginError.message);
      }
    }

    if (!authToken) {
      console.log('   ❌ Could not obtain authentication token');
      return;
    }

    console.log('\n5. Testing file upload with authentication...');
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(testFilePath));
      formData.append('category', 'general');
      formData.append('description', 'Test file upload with auth');

      const authUploadResponse = await axios.post(
        `${API_URL}/upload/single`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${authToken}`
          },
          timeout: 30000
        }
      );
      
      console.log('   ✅ Upload with auth successful!');
      console.log('   File uploaded to S3:', authUploadResponse.data.data.cloudUrl);
      console.log('   File ID:', authUploadResponse.data.data.id);
    } catch (authUploadError) {
      console.log('   ❌ Upload with auth failed:', authUploadError.message);
      console.log('   Status:', authUploadError.response?.status);
      console.log('   Data:', authUploadError.response?.data);
    }

    console.log('\n6. Testing alert creation with authentication...');
    try {
      const alertData = {
        title: 'Test Alert with Auth',
        description: 'Test alert description with proper authentication',
        category: 'disease',
        severity: 'high',
        status: 'active',
        location: {
          state: 'Test State',
          district: 'Test District',
          village: 'Test Village',
          coordinates: { lat: 18.5204, lng: 73.8567 }
        },
        contactInfo: {
          name: 'Test User',
          phone: '+91 9876543210',
          email: 'test@example.com'
        }
      };

      const authAlertResponse = await axios.post(`${API_URL}/alerts`, alertData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('   ✅ Alert creation with auth successful!');
      console.log('   Alert ID:', authAlertResponse.data.data._id);
    } catch (authAlertError) {
      console.log('   ❌ Alert creation with auth failed:', authAlertError.message);
      console.log('   Status:', authAlertError.response?.status);
      console.log('   Data:', authAlertError.response?.data);
    }

    // Clean up
    try {
      fs.unlinkSync(testFilePath);
      console.log('\n✅ Test file cleaned up');
    } catch (cleanupError) {
      console.log('\n⚠️  Could not clean up test file');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
};

// Run the test
if (require.main === module) {
  testUploadAuth().catch(console.error);
}

module.exports = testUploadAuth;