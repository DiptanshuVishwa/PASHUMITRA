const axios = require('axios');
require('dotenv').config();

async function testRegistrationFlow() {
    console.log('🧪 TESTING COMPLETE USER REGISTRATION FLOW\n');
    
    const baseUrl = 'http://localhost:5000/api/auth';
    
    // Test user data - using verified email for testing
    const testUser = {
        name: 'Test User',
        email: process.env.EMAIL_FROM, // Using verified Outlook email
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        userType: 'farmer',
        phoneNumber: '+91-9876543210',
        location: {
            state: 'Karnataka',
            district: 'Bangalore',
            village: 'Test Village'
        }
    };

    console.log('📝 Test User Data:');
    console.log(`   Name: ${testUser.name}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   User Type: ${testUser.userType}`);
    console.log(`   Phone: ${testUser.phoneNumber}`);
    console.log('');

    try {
        console.log('🔄 Step 1: Attempting User Registration...');
        
        const registerResponse = await axios.post(`${baseUrl}/register`, testUser);
        
        if (registerResponse.status === 201) {
            console.log('✅ Registration successful!');
            console.log(`   Status: ${registerResponse.data.success ? 'Success' : 'Failed'}`);
            console.log(`   Message: ${registerResponse.data.message}`);
            
            if (registerResponse.data.user) {
                console.log(`   User ID: ${registerResponse.data.user.id || registerResponse.data.user._id}`);
                console.log(`   Email Verified: ${registerResponse.data.user.emailVerified || 'false'}`);
            }
            
            if (registerResponse.data.token) {
                console.log(`   JWT Token: ${registerResponse.data.token.substring(0, 50)}...`);
            }
            
            console.log('');
            console.log('📧 CHECK YOUR OUTLOOK INBOX!');
            console.log(`   Email: ${testUser.email}`);
            console.log('   You should have received a verification email');
            console.log('   Subject: "Verify Your Email - PashuMitra Portal"');
            console.log('');
            
        } else {
            console.log(`❌ Unexpected status: ${registerResponse.status}`);
        }
        
    } catch (error) {
        if (error.response) {
            console.log('❌ Registration failed!');
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Error: ${error.response.data.message || error.response.data.error}`);
            
            if (error.response.data.details) {
                console.log('   Details:');
                error.response.data.details.forEach(detail => {
                    console.log(`     - ${detail.message || detail}`);
                });
            }
        } else if (error.code === 'ECONNREFUSED') {
            console.log('❌ Cannot connect to backend server');
            console.log('   Make sure the backend server is running on port 5000');
            console.log('   Run: npm start');
        } else {
            console.log('❌ Network error:', error.message);
        }
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Check if registration was successful');
    console.log('2. Check Outlook inbox for verification email');
    console.log('3. If successful, test the verification endpoint');
    console.log('4. Test login flow');
    console.log('');
    
    console.log('💡 TIPS:');
    console.log('- Make sure backend server is running (npm start)');
    console.log('- Check MongoDB connection in server logs');
    console.log('- Verification email will contain a clickable link');
}

// Check if server is running first
async function checkServerStatus() {
    try {
        console.log('🔍 Checking if backend server is running...');
        const response = await axios.get('http://localhost:5000/api/health');
        console.log('✅ Server is running!');
        return true;
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Backend server is not running');
            console.log('Please start the server first:');
            console.log('   npm start');
            return false;
        } else {
            console.log('⚠️ Server health check failed, but continuing...');
            return true;
        }
    }
}

async function runTest() {
    const serverRunning = await checkServerStatus();
    console.log('');
    
    if (serverRunning) {
        await testRegistrationFlow();
    }
}

runTest().catch(console.error);