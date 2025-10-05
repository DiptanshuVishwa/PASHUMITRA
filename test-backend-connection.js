// Test script to verify backend connectivity and API endpoints
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testBackendConnection() {
    console.log('🔄 Testing PashuMitra Portal Backend Connection...\n');
    
    const tests = [
        {
            name: 'Health Check',
            url: 'http://localhost:5000/health',
            method: 'GET'
        },
        {
            name: 'Service Stats',
            url: `${API_URL}/services/stats`,
            method: 'GET'
        },
        {
            name: 'API Documentation',
            url: `${API_URL}/docs`,
            method: 'GET'
        }
    ];

    for (const test of tests) {
        try {
            console.log(`Testing ${test.name}...`);
            const response = await axios({
                method: test.method,
                url: test.url,
                timeout: 5000
            });
            
            console.log(`✅ ${test.name}: Status ${response.status}`);
            if (response.data) {
                console.log(`   Response:`, JSON.stringify(response.data, null, 2));
            }
            console.log('');
        } catch (error) {
            console.log(`❌ ${test.name}: Failed`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Error: ${error.response.data?.message || error.response.statusText}`);
            } else if (error.request) {
                console.log(`   Error: No response received - Backend might be down`);
            } else {
                console.log(`   Error: ${error.message}`);
            }
            console.log('');
        }
    }

    // Test authentication endpoints (should return error without credentials)
    console.log('Testing Authentication Endpoints (expect 401/400 errors):');
    const authTests = [
        {
            name: 'Get Profile (without auth)',
            url: `${API_URL}/auth/me`,
            method: 'GET'
        },
        {
            name: 'Login (without data)',
            url: `${API_URL}/auth/login`,
            method: 'POST'
        }
    ];

    for (const test of authTests) {
        try {
            console.log(`Testing ${test.name}...`);
            const response = await axios({
                method: test.method,
                url: test.url,
                timeout: 5000
            });
            
            console.log(`⚠️  ${test.name}: Unexpected success - Status ${response.status}`);
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 400)) {
                console.log(`✅ ${test.name}: Expected error - Status ${error.response.status}`);
                console.log(`   Message: ${error.response.data?.message || 'No message'}`);
            } else {
                console.log(`❌ ${test.name}: Unexpected error`);
                console.log(`   Status: ${error.response?.status || 'No status'}`);
                console.log(`   Error: ${error.message}`);
            }
            console.log('');
        }
    }

    console.log('Backend connection test completed!');
}

// Run the test
if (require.main === module) {
    testBackendConnection().catch(console.error);
}

module.exports = { testBackendConnection };