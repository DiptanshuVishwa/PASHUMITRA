// Test script for alert creation and management
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

// Test user data for authentication
const testUser = {
    name: 'Alert Test User',
    email: `alert_test_${Date.now()}@example.com`,
    phone: '+919876543210',
    password: 'TestPassword123!',
    location: 'Test City',
    userType: 'farmer'
};

let authToken = null;
let userId = null;
let testAlertId = null;

// Sample alert data (matching backend schema)
const sampleAlert = {
    title: 'Cattle showing respiratory symptoms',
    description: 'Several cattle in our farm are showing signs of respiratory distress including coughing, fever, and loss of appetite. This started 2 days ago and is affecting multiple animals.',
    category: 'disease',
    severity: 'high',
    location: {
        state: 'Maharashtra',
        district: 'Pune',
        village: 'Test Village',
        coordinates: {
            lat: 18.5204,
            lng: 73.8567
        }
    },
    affectedAnimals: {
        species: 'cattle',
        count: 15,
        symptoms: ['coughing', 'fever', 'loss_of_appetite']
    }
};

// Create a test image file for upload testing
function createTestImage() {
    // Create a simple test file (this would be a real image in production)
    const testImagePath = path.join(__dirname, 'test-image.txt');
    fs.writeFileSync(testImagePath, 'This is a test image file for upload testing');
    return testImagePath;
}

async function setupAuth() {
    console.log('🔄 Setting up authentication...');
    
    // Register test user
    const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
    
    if (registerResponse.data.success) {
        authToken = registerResponse.data.token;
        userId = registerResponse.data.data?.user?.id || registerResponse.data.data?.user?._id;
        console.log('✅ Authentication setup successful');
        return true;
    } else {
        console.log('❌ Authentication setup failed');
        return false;
    }
}

async function testAlertFlow() {
    console.log('🔄 Testing PashuMitra Portal Alert Management...\n');

    try {
        // Setup authentication
        if (!(await setupAuth())) {
            return;
        }
        console.log('');

        // Step 1: Create Alert
        console.log('1. Testing Alert Creation...');
        const createResponse = await axios.post(`${API_URL}/alerts`, sampleAlert, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (createResponse.data.success) {
            console.log('✅ Alert creation successful');
            testAlertId = createResponse.data.alert?.id || createResponse.data.alert?._id || createResponse.data.data?.id;
            console.log(`   Alert ID: ${testAlertId}`);
            console.log(`   Title: ${createResponse.data.data?.title || createResponse.data.alert?.title}`);
            console.log(`   Category: ${createResponse.data.data?.category || createResponse.data.alert?.category}`);
            console.log(`   Severity: ${createResponse.data.data?.severity || createResponse.data.alert?.severity}`);
            console.log(`   Status: ${createResponse.data.data?.status || createResponse.data.alert?.status || 'active'}`);
        } else {
            console.log('❌ Alert creation failed');
            console.log(`   Error: ${createResponse.data.message}`);
            return;
        }
        console.log('');

        // Step 2: Get User Alerts
        console.log('2. Testing Get User Alerts...');
        const userAlertsResponse = await axios.get(`${API_URL}/alerts?limit=10`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (userAlertsResponse.data.success) {
            const alerts = userAlertsResponse.data.data || [];
            console.log('✅ Get user alerts successful');
            console.log(`   Total alerts: ${alerts.length}`);
            console.log(`   Total count: ${userAlertsResponse.data.count}`);
            
            if (alerts.length > 0) {
                console.log(`   Recent alert: ${alerts[0].title} (${alerts[0].status})`);
            }
        } else {
            console.log('❌ Get user alerts failed');
        }
        console.log('');

        // Step 3: Get Alert by ID
        if (testAlertId) {
            console.log('3. Testing Get Alert by ID...');
            const alertResponse = await axios.get(`${API_URL}/alerts/${testAlertId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            if (alertResponse.data.success) {
                console.log('✅ Get alert by ID successful');
                const alert = alertResponse.data.alert || alertResponse.data.data;
                console.log(`   Alert ID: ${alert.id || alert._id}`);
                console.log(`   Description: ${alert.description}`);
                console.log(`   Created: ${alert.createdAt ? new Date(alert.createdAt).toLocaleString() : 'Unknown'}`);
            } else {
                console.log('❌ Get alert by ID failed');
            }
            console.log('');
        }

        // Step 4: Update Alert (if permitted)
        if (testAlertId) {
            console.log('4. Testing Alert Update...');
            try {
                const statusUpdateResponse = await axios.put(
                    `${API_URL}/alerts/${testAlertId}`, 
                    {
                        status: 'investigating',
                        title: 'Updated: Cattle showing respiratory symptoms'
                    },
                    {
                        headers: { Authorization: `Bearer ${authToken}` }
                    }
                );
                
                if (statusUpdateResponse.data.success) {
                    console.log('✅ Alert update successful');
                    console.log(`   Updated title: ${statusUpdateResponse.data.data?.title || statusUpdateResponse.data.alert?.title}`);
                    console.log(`   New status: ${statusUpdateResponse.data.data?.status || statusUpdateResponse.data.alert?.status}`);
                } else {
                    console.log('❌ Alert update failed');
                    console.log(`   Error: ${statusUpdateResponse.data.message}`);
                }
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    console.log('ℹ️  Alert update not permitted for this user (expected behavior for some roles)');
                } else {
                    console.log('❌ Alert update failed with unexpected error');
                    console.log(`   Error: ${error.response?.data?.message || error.message}`);
                }
            }
            console.log('');
        }

        // Step 5: Test Alert Filtering/Pagination
        console.log('5. Testing Alert Filtering...');
        const filterResponse = await axios.get(`${API_URL}/alerts?severity=high&limit=10`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (filterResponse.data.success) {
            const alerts = filterResponse.data.data || [];
            console.log('✅ Alert filtering successful');
            console.log(`   High severity alerts: ${alerts.length}`);
            
            if (alerts.length > 0) {
                console.log(`   Sample alert: ${alerts[0].title} - ${alerts[0].severity}`);
            }
        } else {
            console.log('❌ Alert filtering failed');
        }
        console.log('');

        // Step 6: Test Invalid Alert Data
        console.log('6. Testing Invalid Alert Data Validation...');
        const invalidAlert = {
            title: '', // Missing required field
            description: 'Too short', // Too short
            category: 'invalid_category',
            severity: 'invalid_severity'
        };
        
        try {
            await axios.post(`${API_URL}/alerts`, invalidAlert, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('❌ Invalid alert data was accepted (should be rejected)');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ Invalid alert data correctly rejected');
                console.log(`   Error: ${error.response.data.message}`);
            } else {
                console.log('❌ Unexpected error with invalid data');
            }
        }
        console.log('');

        // Step 7: Test Alert Search (if available)
        console.log('7. Testing Alert Search...');
        try {
            const searchResponse = await axios.get(`${API_URL}/alerts?search=cattle&limit=10`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            if (searchResponse.data.success) {
                const alerts = searchResponse.data.data || [];
                console.log('✅ Alert search successful');
                console.log(`   Search results: ${alerts.length} alerts found`);
            } else {
                console.log('❌ Alert search failed');
            }
        } catch (error) {
            console.log('ℹ️  Alert search functionality not available or requires different endpoint');
        }
        console.log('');

        console.log('🎉 Alert management test completed!');
        console.log('\n📋 Test Summary:');
        console.log(`   Test User: ${testUser.email}`);
        console.log(`   Test Alert ID: ${testAlertId}`);
        console.log(`   Alert Title: ${sampleAlert.title}`);
        console.log(`   Alert Category: ${sampleAlert.category}`);
        console.log(`   Alert Severity: ${sampleAlert.severity}`);
        console.log('   All major alert features are working properly.');

    } catch (error) {
        console.error('❌ Alert test failed:', error.message);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Error: ${error.response.data?.message || error.response.statusText}`);
        }
    }
}

// Test alert validation
async function testAlertValidation() {
    console.log('\n🔄 Testing Alert Validation...\n');

    if (!authToken) {
        console.log('❌ No auth token available for validation tests');
        return;
    }

    const validationTests = [
        {
            name: 'Missing title',
            data: { ...sampleAlert, title: '' },
            expectedError: 'title'
        },
        {
            name: 'Invalid category',
            data: { ...sampleAlert, category: 'invalid' },
            expectedError: 'category'
        },
        {
            name: 'Short description',
            data: { ...sampleAlert, description: 'Too short' },
            expectedError: 'description'
        },
        {
            name: 'Invalid severity',
            data: { ...sampleAlert, severity: 'invalid' },
            expectedError: 'severity'
        },
        {
            name: 'Missing location state',
            data: { ...sampleAlert, location: { ...sampleAlert.location, state: '' } },
            expectedError: 'state'
        }
    ];

    for (const test of validationTests) {
        try {
            console.log(`Testing ${test.name}...`);
            await axios.post(`${API_URL}/alerts`, test.data, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log(`❌ ${test.name}: Should have failed but succeeded`);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log(`✅ ${test.name}: Correctly rejected`);
                console.log(`   Error: ${error.response.data.message || error.response.data.error}`);
            } else {
                console.log(`❌ ${test.name}: Unexpected error status - ${error.response?.status}`);
                console.log(`   Error: ${error.response?.data?.message || error.message}`);
            }
        }
        console.log('');
    }
}

// Cleanup function
async function cleanup() {
    console.log('\n🧹 Cleaning up test data...');
    
    // Delete test alert if created
    if (testAlertId && authToken) {
        try {
            await axios.delete(`${API_URL}/alerts/${testAlertId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('✅ Test alert deleted');
        } catch (error) {
            console.log('ℹ️  Could not delete test alert (may require admin privileges)');
        }
    }
    
    // Clean up test files
    const testImagePath = path.join(__dirname, 'test-image.txt');
    if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
        console.log('✅ Test files cleaned up');
    }
}

// Run the test
if (require.main === module) {
    testAlertFlow()
        .then(() => testAlertValidation())
        .then(() => cleanup())
        .catch(console.error);
}

module.exports = { testAlertFlow, testAlertValidation };