const emailManager = require('./services/emailManager');
const resendEmailService = require('./services/resendEmailService');
require('dotenv').config();

async function testResendIntegration() {
  console.log('🧪 Testing Resend Email Integration...\n');

  // Test 1: Environment variables
  console.log('📋 Environment Check:');
  console.log(`  RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`  EMAIL_FROM: ${process.env.EMAIL_FROM || 'onboarding@resend.dev'}`);
  console.log(`  EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || 'ses'}`);
  console.log(`  FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}\n`);

  // Test 2: Email Manager Status
  console.log('🔍 Email Manager Status:');
  const status = emailManager.getStatus();
  console.log('  Primary Service:', status.primaryService);
  console.log('  Fallback Service:', status.fallbackService);
  console.log('  Resend Configured:', status.resendConfigured ? '✅' : '❌');
  console.log('  SES Configured:', status.sesConfigured ? '✅' : '❌');
  console.log();

  // Test 3: Service Connection Test
  console.log('🔗 Testing Service Connections...');
  try {
    const connectionTest = await emailManager.testConnection();
    console.log('Connection Test Results:', JSON.stringify(connectionTest, null, 2));
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
  console.log();

  // Test 4: Direct Resend Service Test
  if (process.env.RESEND_API_KEY) {
    console.log('📧 Testing Direct Resend Service...');
    try {
      const directTest = await resendEmailService.testConnection();
      console.log('Direct Resend Test:', JSON.stringify(directTest, null, 2));
    } catch (error) {
      console.error('❌ Direct Resend test failed:', error.message);
    }
    console.log();
  }

  // Test 5: Test Verification Email (Mock User)
  console.log('📬 Testing Verification Email...');
  try {
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com' // Won't actually send to this email
    };
    const mockToken = 'test-verification-token-123';

    const result = await emailManager.sendVerificationEmail(mockUser, mockToken);
    console.log('Verification Email Test:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Verification email test passed!');
    } else {
      console.log('❌ Verification email test failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Verification email test error:', error.message);
  }
  console.log();

  // Test 6: Summary
  console.log('📊 Test Summary:');
  console.log('==================');
  if (process.env.RESEND_API_KEY) {
    console.log('✅ Resend API Key: Configured');
  } else {
    console.log('❌ Resend API Key: Missing');
    console.log('   Please add RESEND_API_KEY to your environment variables');
  }
  
  if (process.env.EMAIL_SERVICE === 'resend') {
    console.log('✅ Email Service: Set to Resend');
  } else {
    console.log(`⚠️ Email Service: Set to ${process.env.EMAIL_SERVICE || 'ses'}`);
    console.log('   Change EMAIL_SERVICE=resend to use Resend as primary');
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Set EMAIL_SERVICE=resend in Render environment');
  console.log('2. Ensure RESEND_API_KEY is configured');
  console.log('3. Set EMAIL_FROM=onboarding@resend.dev');
  console.log('4. Test with actual user registration');
  console.log('\n✨ Integration test completed!');
}

testResendIntegration().catch(console.error);