const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

console.log('🔍 Testing File Upload Authentication...\n');

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
    } catch (healthError) {
      console.log('   ❌ Backend not running. Please start the backend server.');
      return;
    }

    const testFilePath = createTestFile();

    console.log('\n2. Testing file upload without authentication...');
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(testFilePath));
      formData.append('category', 'general');

      const uploadResponse = await axios.post(
        `${API_URL}/upload/single`,
        formData,
        { headers: formData.getHeaders(), timeout: 30000 }
      );
      
      console.log('   ❌ Upload succeeded without auth (unexpected!)');
    } catch (uploadError) {
      if (uploadError.response?.status === 401) {
        console.log('   ✅ Upload correctly rejected without authentication');
      } else {
        console.log('   ❌ Upload failed with unexpected error:', uploadError.message);
        console.log('   Status:', uploadError.response?.status);
      }
    }

    console.log('\n3. Testing user registration...');
    const testUser = {
      name: 'Test User ' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'TestPass123!',
      phone: '+919876543210',
      role: 'farmer',
      location: { state: 'Maharashtra', district: 'Pune', pincode: '411001' }
    };

    let authToken = null;
    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
      console.log('   ✅ User registration successful');
      authToken = registerResponse.data.token;
    } catch (regError) {
      console.log('   ❌ Registration failed, trying login...');
      try {
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: 'test@example.com',
          password: 'password123'
        });
        authToken = loginResponse.data.token;
        console.log('   ✅ Login successful');
      } catch (loginError) {
        console.log('   ❌ Login also failed');
      }
    }

    if (!authToken) {
      console.log('   ❌ Could not obtain authentication token');
      return;
    }

    console.log('\n4. Testing file upload with authentication...');
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(testFilePath));
      formData.append('category', 'general');

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
      console.log('   File ID:', authUploadResponse.data.data?.id);
    } catch (authUploadError) {
      console.log('   ❌ Upload with auth failed:', authUploadError.message);
      console.log('   Status:', authUploadError.response?.status);
      console.log('   Response:', authUploadError.response?.data);
    }

    // Clean up
    try {
      fs.unlinkSync(testFilePath);
      console.log('\n✅ Test completed and cleaned up');
    } catch (cleanupError) {
      console.log('\n⚠️  Could not clean up test file');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
};

// Run the test
testUploadAuth().catch(console.error);