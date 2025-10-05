const axios = require('axios');
const os = require('os');

// Get network interfaces
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

async function testMobileConnectivity() {
  console.log('🔍 Testing Mobile Network Connectivity...\n');
  
  const localIP = getLocalIP();
  console.log(`📱 Your Local IP Address: ${localIP}`);
  console.log(`🌐 Mobile should connect to: http://${localIP}:3000`);
  console.log(`🔌 Backend should be accessible at: http://${localIP}:5000\n`);
  
  // Test backend health endpoint
  console.log('🏥 Testing Backend Health...');
  try {
    const response = await axios.get(`http://${localIP}:5000/health`, {
      timeout: 5000
    });
    
    if (response.status === 200) {
      console.log('✅ Backend is accessible from network');
      console.log(`   Status: ${response.data.status}`);
      console.log(`   Environment: ${response.data.environment}`);
      console.log(`   Uptime: ${Math.round(response.data.uptime)}s\n`);
    }
  } catch (error) {
    console.log('❌ Backend health check failed:');
    if (error.code === 'ECONNREFUSED') {
      console.log('   - Backend server is not running');
      console.log('   - Start the backend with: npm run dev (in backend directory)');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   - DNS resolution failed');
      console.log('   - Check your network configuration');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('   - Request timed out');
      console.log('   - Check firewall settings');
    } else {
      console.log(`   - Error: ${error.message}`);
    }
    console.log('');
  }
  
  // Test auth endpoint
  console.log('🔐 Testing Authentication Endpoint...');
  try {
    // This should return a 400 or validation error (which means the endpoint is accessible)
    await axios.post(`http://${localIP}:5000/api/auth/login`, {});
  } catch (error) {
    if (error.response) {
      // We got a response, so the endpoint is accessible
      if (error.response.status === 400) {
        console.log('✅ Authentication endpoint is accessible');
        console.log('   (Expected validation error for empty credentials)');
      } else {
        console.log(`✅ Authentication endpoint responded with status: ${error.response.status}`);
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Cannot connect to auth endpoint');
      console.log('   - Backend server may not be running');
    } else {
      console.log(`❌ Auth endpoint error: ${error.message}`);
    }
  }
  
  console.log('\n📋 Mobile Setup Checklist:');
  console.log('   1. ✅ Update .env file with your IP address');
  console.log('   2. ✅ Backend CORS configured for network access');
  console.log('   3. ✅ Server binding to 0.0.0.0 (all interfaces)');
  console.log(`   4. 📱 Connect mobile to same WiFi network`);
  console.log(`   5. 🌐 Access http://${localIP}:3000 from mobile browser\n`);
  
  console.log('🚨 Troubleshooting:');
  console.log('   - Ensure both devices are on the same WiFi network');
  console.log('   - Check Windows Firewall settings');
  console.log('   - Try disabling firewall temporarily for testing');
  console.log('   - Some antivirus software may block network access');
  console.log('   - Router may have client isolation enabled\n');
  
  console.log('🛠️  Quick Commands:');
  console.log('   Frontend (network mode): npm run start:network');
  console.log('   Backend (network mode): npm run dev');
  console.log(`   Mobile URL: http://${localIP}:3000`);
}

testMobileConnectivity().catch(console.error);