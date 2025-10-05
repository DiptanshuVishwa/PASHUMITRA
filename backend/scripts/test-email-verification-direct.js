const emailService = require('../services/emailService');
require('dotenv').config();

async function testEmailVerificationDirect() {
    console.log('🧪 TESTING EMAIL VERIFICATION DIRECTLY\n');
    
    console.log('📋 Configuration Check:');
    console.log(`- EMAIL_FROM: ${process.env.EMAIL_FROM}`);
    console.log(`- AWS_REGION: ${process.env.AWS_REGION}`);
    console.log(`- AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? 'SET ✅' : 'NOT SET ❌'}`);
    console.log(`- AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? 'SET ✅' : 'NOT SET ❌'}`);
    console.log('');

    const testUser = {
        name: 'Verification Test User',
        email: process.env.EMAIL_FROM
    };
    
    const testToken = 'test_verification_token_' + Date.now();
    
    console.log('📧 Test Data:');
    console.log(`- User Name: ${testUser.name}`);
    console.log(`- User Email: ${testUser.email}`);
    console.log(`- Verification Token: ${testToken}`);
    console.log('');

    try {
        console.log('🔄 Attempting to send verification email...');
        
        // Test the exact same call used in the auth controller
        const result = await emailService.sendEmailVerification(testUser, testToken);
        
        if (result.success) {
            console.log('✅ EMAIL VERIFICATION SENT SUCCESSFULLY!');
            console.log(`   📨 Message ID: ${result.messageId}`);
            console.log(`   ⏰ Timestamp: ${result.timestamp}`);
            console.log('');
            console.log('📬 CHECK YOUR OUTLOOK INBOX NOW!');
            console.log(`   Email: ${testUser.email}`);
            console.log('   Subject: "Verify Your Email - PashuMitra Portal"');
        } else {
            console.log('❌ EMAIL VERIFICATION FAILED!');
            console.log(`   Error: ${result.error}`);
        }
        
    } catch (error) {
        console.log('❌ EXCEPTION OCCURRED!');
        console.log(`   Error: ${error.message}`);
        console.log(`   Stack: ${error.stack}`);
    }

    // Also test the basic sendEmail function
    console.log('\n📧 Testing Basic sendEmail Function:');
    try {
        const basicResult = await emailService.sendEmail({
            to: testUser.email,
            subject: 'Direct Email Test - PashuMitra',
            textContent: 'This is a direct test of the sendEmail function.',
            htmlContent: '<h3>Direct Email Test</h3><p>This is a direct test of the sendEmail function.</p>'
        });

        if (basicResult.success) {
            console.log('✅ Basic email sent successfully!');
            console.log(`   📨 Message ID: ${basicResult.messageId}`);
        } else {
            console.log('❌ Basic email failed!');
            console.log(`   Error: ${basicResult.error}`);
        }
    } catch (error) {
        console.log('❌ Basic email exception!');
        console.log(`   Error: ${error.message}`);
    }

    console.log('\n🔍 DIAGNOSIS:');
    console.log('If the basic email works but verification email fails,');
    console.log('then there\'s an issue with the sendEmailVerification method.');
    console.log('');
    console.log('If both fail, there\'s an AWS SES configuration issue.');
    console.log('If both succeed, then the issue is in the auth controller.');
}

testEmailVerificationDirect().catch(console.error);