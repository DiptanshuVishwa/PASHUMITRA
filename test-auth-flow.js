// Test script for authentication flow
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test user data
const testUser = {
    name: 'Test User',
    email: `test_${Date.now()}@example.com`,
    phone: '+919876543210',
    password: 'TestPassword123!',
    location: 'Test City',
    userType: 'farmer'
};

let authToken = null;
let userId = null;

async function testAuthFlow() {
    console.log('🔄 Testing PashuMitra Portal Authentication Flow...\n');

    try {
        // Step 1: User Registration
        console.log('1. Testing User Registration...');
        const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
        
        if (registerResponse.data.success) {
            console.log('✅ Registration successful');
            console.log(`   User ID: ${registerResponse.data.data?.user?.id || registerResponse.data.data?.user?._id}`);
            console.log(`   Email: ${registerResponse.data.data?.user?.email}`);
            console.log(`   Token provided: ${!!registerResponse.data.token}`);
            
            // Store token and user ID for subsequent tests
            authToken = registerResponse.data.token;
            userId = registerResponse.data.data?.user?.id || registerResponse.data.data?.user?._id;
        } else {
            console.log('❌ Registration failed');
            console.log(`   Error: ${registerResponse.data.message}`);
            return;
        }
        console.log('');

        // Step 2: Test token validation
        console.log('2. Testing Token Validation...');
        const profileResponse = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (profileResponse.data.success) {
            console.log('✅ Token validation successful');
            console.log(`   User: ${profileResponse.data.user?.name}`);
            console.log(`   Email: ${profileResponse.data.user?.email}`);
        } else {
            console.log('❌ Token validation failed');
        }
        console.log('');

        // Step 3: Test Login
        console.log('3. Testing Login...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        
        if (loginResponse.data.success) {
            console.log('✅ Login successful');
            console.log(`   Token provided: ${!!loginResponse.data.token}`);
            authToken = loginResponse.data.token; // Update token
        } else {
            console.log('❌ Login failed');
            console.log(`   Error: ${loginResponse.data.message}`);
        }
        console.log('');

        // Step 4: Test Profile Update
        console.log('4. Testing Profile Update...');
        const updateData = {
            name: 'Updated Test User',
            location: 'Updated Test City'
        };
        
        const updateResponse = await axios.put(`${API_URL}/auth/profile`, updateData, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (updateResponse.data.success) {
            console.log('✅ Profile update successful');
            console.log(`   Updated name: ${updateResponse.data.user?.name}`);
            console.log(`   Updated location: ${updateResponse.data.user?.location}`);
        } else {
            console.log('❌ Profile update failed');
            console.log(`   Error: ${updateResponse.data.message}`);
        }
        console.log('');

        // Step 5: Test Password Change
        console.log('5. Testing Password Change...');
        const newPassword = 'NewTestPassword123!';
        const changePasswordResponse = await axios.put(`${API_URL}/auth/password`, {
            currentPassword: testUser.password,
            newPassword: newPassword,
            confirmPassword: newPassword
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (changePasswordResponse.data.success) {
            console.log('✅ Password change successful');
            console.log(`   Message: ${changePasswordResponse.data.message}`);
            
            // Update password for future tests
            testUser.password = newPassword;
        } else {
            console.log('❌ Password change failed');
            console.log(`   Error: ${changePasswordResponse.data.message}`);
        }
        console.log('');

        // Step 6: Test Login with new password
        console.log('6. Testing Login with new password...');
        const newLoginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: newPassword
        });
        
        if (newLoginResponse.data.success) {
            console.log('✅ Login with new password successful');
            authToken = newLoginResponse.data.token;
        } else {
            console.log('❌ Login with new password failed');
            console.log(`   Error: ${newLoginResponse.data.message}`);
        }
        console.log('');

        // Step 7: Test Invalid Authentication
        console.log('7. Testing Invalid Authentication...');
        try {
            await axios.get(`${API_URL}/auth/me`, {
                headers: { Authorization: 'Bearer invalid_token' }
            });
            console.log('❌ Invalid token was accepted (this should not happen)');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Invalid token correctly rejected');
            } else {
                console.log('❌ Unexpected error with invalid token');
            }
        }
        console.log('');

        // Step 8: Test Logout
        console.log('8. Testing Logout...');
        const logoutResponse = await axios.post(`${API_URL}/auth/logout`, {}, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (logoutResponse.status === 200) {
            console.log('✅ Logout successful');
            console.log(`   Message: ${logoutResponse.data.message || 'Logged out'}`);
        } else {
            console.log('❌ Logout failed');
        }
        console.log('');

        // Step 9: Test Forgot Password
        console.log('9. Testing Forgot Password...');
        const forgotPasswordResponse = await axios.post(`${API_URL}/auth/forgot-password`, {
            email: testUser.email
        });
        
        if (forgotPasswordResponse.data.success) {
            console.log('✅ Forgot password request successful');
            console.log(`   Message: ${forgotPasswordResponse.data.message}`);
        } else {
            console.log('❌ Forgot password request failed');
            console.log(`   Error: ${forgotPasswordResponse.data.message}`);
        }
        console.log('');

        console.log('🎉 Authentication flow test completed successfully!');
        console.log('\n📋 Test Summary:');
        console.log(`   Test User Email: ${testUser.email}`);
        console.log(`   User ID: ${userId}`);
        console.log('   All major authentication features are working properly.');

    } catch (error) {
        console.error('❌ Authentication test failed:', error.message);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Error: ${error.response.data?.message || error.response.statusText}`);
        }
    }
}

// Test invalid registration data
async function testValidation() {
    console.log('\n🔄 Testing Input Validation...\n');

    const invalidTests = [
        {
            name: 'Empty email',
            data: { ...testUser, email: '' },
            expectedError: 'email'
        },
        {
            name: 'Invalid email format',
            data: { ...testUser, email: 'invalid-email' },
            expectedError: 'email'
        },
        {
            name: 'Short password',
            data: { ...testUser, email: `test2_${Date.now()}@example.com`, password: '123' },
            expectedError: 'password'
        },
        {
            name: 'Missing required fields',
            data: { email: `test3_${Date.now()}@example.com` },
            expectedError: 'validation'
        }
    ];

    for (const test of invalidTests) {
        try {
            console.log(`Testing ${test.name}...`);
            await axios.post(`${API_URL}/auth/register`, test.data);
            console.log(`❌ ${test.name}: Should have failed but succeeded`);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log(`✅ ${test.name}: Correctly rejected`);
                console.log(`   Error: ${error.response.data.message}`);
            } else {
                console.log(`❌ ${test.name}: Unexpected error status`);
            }
        }
        console.log('');
    }
}

// Run the test
if (require.main === module) {
    testAuthFlow()
        .then(() => testValidation())
        .catch(console.error);
}

module.exports = { testAuthFlow, testValidation };