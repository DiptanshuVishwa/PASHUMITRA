require('dotenv').config();
const serviceManager = require('./services');
const emailService = serviceManager.getService('email');

async function testEmailVerification() {
  console.log('📧 Testing Email Verification System');
  console.log('='.repeat(60));
  
  console.log('🔧 Configuration Check:');
  console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM}`);
  console.log(`   AWS_REGION: ${process.env.AWS_REGION}`);
  console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL}`);
  
  try {
    console.log('\n📨 Testing Direct Email Service...');
    
    // Test 1: Direct email send
    const testEmailResult = await emailService.sendEmail({
      to: 'team.pashumitra@gmail.com',
      subject: '🧪 Test Email - PashuMitra Portal',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4CAF50;">✅ Email Service Test</h2>
          <p>This is a test email to verify that the AWS SES email service is working correctly.</p>
          <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Test Details:</strong>
            <ul>
              <li>Service: AWS SES</li>
              <li>Region: ${process.env.AWS_REGION}</li>
              <li>From: ${process.env.EMAIL_FROM}</li>
              <li>Timestamp: ${new Date().toISOString()}</li>
            </ul>
          </div>
          <p>If you received this email, the AWS SES integration is working correctly!</p>
        </div>
      `,
      textContent: `
Email Service Test - PashuMitra Portal

This is a test email to verify that the AWS SES email service is working correctly.

Test Details:
- Service: AWS SES
- Region: ${process.env.AWS_REGION}
- From: ${process.env.EMAIL_FROM}
- Timestamp: ${new Date().toISOString()}

If you received this email, the AWS SES integration is working correctly!
      `
    });

    if (testEmailResult.success) {
      console.log('✅ Direct email test passed!');
      console.log(`   Message ID: ${testEmailResult.messageId}`);
    } else {
      console.log('❌ Direct email test failed:', testEmailResult.error);
      return;
    }

    console.log('\n📧 Testing Email Verification Function...');
    
    // Test 2: Email verification function
    const mockVerificationToken = 'test-verification-token-12345';
    const mockUserData = {
      email: 'team.pashumitra@gmail.com',
      name: 'Test User'
    };

    const verificationResult = await emailService.sendEmailVerification(
      mockUserData,
      mockVerificationToken
    );

    if (verificationResult.success) {
      console.log('✅ Email verification test passed!');
      console.log(`   Message ID: ${verificationResult.messageId}`);
    } else {
      console.log('❌ Email verification test failed:', verificationResult.error);
    }

    console.log('\n📋 Testing Email Service Stats...');
    
    // Test 3: Get email stats
    try {
      const stats = await emailService.getEmailStats();
      console.log('✅ Email stats retrieved successfully:');
      console.log(`   Max Send Rate: ${stats.Max24HourSend}/24h`);
      console.log(`   Max Send Rate: ${stats.MaxSendRate}/sec`);
      console.log(`   Sent Last 24h: ${stats.SentLast24Hours}`);
    } catch (error) {
      console.log('⚠️  Could not retrieve email stats:', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Email Verification Test Complete!');
    console.log('\n📬 Next Steps:');
    console.log('1. Check your Gmail inbox: team.pashumitra@gmail.com');
    console.log('2. Look for emails with subjects:');
    console.log('   - "🧪 Test Email - PashuMitra Portal"');
    console.log('   - "Verify Your Email - PashuMitra Portal"');
    console.log('3. Check spam folder if emails are not in inbox');

  } catch (error) {
    console.error('❌ Email verification test failed:', error);
    
    console.log('\n🔧 Debug Information:');
    console.log(`   Error type: ${error.name}`);
    console.log(`   Error message: ${error.message}`);
    
    if (error.message.includes('not verified')) {
      console.log('\n🚨 Email verification required:');
      console.log('   The sender email needs to be verified in AWS SES');
      console.log('   1. Go to AWS SES Console: https://console.aws.amazon.com/ses/');
      console.log('   2. Verify the email address: team.pashumitra@gmail.com');
    }
  }
}

// Additional function to test with real registration data
async function testRegistrationEmail() {
  console.log('\n🆕 Testing Registration Email Flow...');
  console.log('-'.repeat(50));
  
  try {
    // Simulate the exact data structure used in registration
    const mockUser = {
      email: 'team.pashumitra@gmail.com',
      name: 'Test Farmer',
      _id: 'mock-user-id-12345'
    };
    
    const mockToken = 'mock-verification-token-' + Date.now();
    
    console.log('📤 Sending registration verification email...');
    console.log(`   User: ${mockUser.name}`);
    console.log(`   Email: ${mockUser.email}`);
    console.log(`   Token: ${mockToken}`);
    
    const result = await emailService.sendEmailVerification(mockUser, mockToken);
    
    if (result.success) {
      console.log('✅ Registration email sent successfully!');
      console.log(`   Message ID: ${result.messageId}`);
    } else {
      console.log('❌ Registration email failed:', result.error);
    }
    
  } catch (error) {
    console.log('❌ Registration email test failed:', error.message);
  }
}

// Run tests
async function runAllTests() {
  await testEmailVerification();
  await testRegistrationEmail();
}

runAllTests().catch(console.error);