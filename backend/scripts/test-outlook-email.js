const emailService = require('../services/emailService');
require('dotenv').config();

async function testOutlookEmail() {
    console.log('🧪 TESTING AWS SES WITH VERIFIED OUTLOOK EMAIL\n');
    console.log(`✅ Verified sender: ${process.env.EMAIL_FROM}`);
    console.log(`✅ Verified recipient: ${process.env.EMAIL_FROM}`);
    console.log(`✅ AWS SES ARN: arn:aws:ses:ap-south-1:360121241405:identity/${process.env.EMAIL_FROM}\n`);

    const testUserData = {
        name: 'PashuMitra Test User',
        email: process.env.EMAIL_FROM, // Using verified Outlook email
        id: 'outlook_test_' + Date.now()
    };

    console.log('📧 Test 1: Simple Delivery Test');
    try {
        const simpleResult = await emailService.sendEmail({
            to: testUserData.email,
            subject: '✅ PashuMitra Email Test - ' + new Date().toLocaleString(),
            textContent: `This is a test email sent at ${new Date().toLocaleString()} to verify AWS SES + Outlook integration.`,
            htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 20px auto; padding: 20px; border: 2px solid #4CAF50; border-radius: 10px;">
                    <h2 style="color: #4CAF50; text-align: center;">✅ Email Test Successful!</h2>
                    <p><strong>Sender:</strong> ${process.env.EMAIL_FROM}</p>
                    <p><strong>Recipient:</strong> ${testUserData.email}</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Service:</strong> AWS SES</p>
                    <p style="background: #e8f5e8; padding: 10px; border-radius: 5px;">
                        🎉 If you received this email, your PashuMitra email system is working perfectly!
                    </p>
                </div>
            `
        });

        if (simpleResult.success) {
            console.log('✅ SUCCESS! Email sent successfully');
            console.log(`   📨 Message ID: ${simpleResult.messageId}`);
            console.log('   🎯 Check your Outlook inbox immediately!');
        } else {
            console.log('❌ Failed:', simpleResult.error);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n📧 Test 2: Welcome Email Template');
    try {
        const welcomeResult = await emailService.sendWelcomeEmail(testUserData);
        if (welcomeResult.success) {
            console.log('✅ Welcome email sent successfully!');
            console.log(`   📨 Message ID: ${welcomeResult.messageId}`);
        } else {
            console.log('❌ Welcome email failed:', welcomeResult.error);
        }
    } catch (error) {
        console.log('❌ Welcome email error:', error.message);
    }

    console.log('\n📧 Test 3: Email Verification Template');
    try {
        const verificationToken = 'outlook_test_token_' + Date.now();
        const verificationResult = await emailService.sendEmailVerification(testUserData, verificationToken);
        if (verificationResult.success) {
            console.log('✅ Verification email sent successfully!');
            console.log(`   📨 Message ID: ${verificationResult.messageId}`);
            console.log(`   🔗 Verification link: ${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`);
        } else {
            console.log('❌ Verification email failed:', verificationResult.error);
        }
    } catch (error) {
        console.log('❌ Verification email error:', error.message);
    }

    console.log('\n📧 Test 4: Critical Alert Email');
    try {
        const alertData = {
            animalId: 'TEST_COW_001',
            alertType: 'Health Alert Test',
            severity: 'Critical',
            description: 'This is a test alert to verify the email system is working properly',
            location: 'Test Farm Location',
            timestamp: new Date()
        };
        
        const alertResult = await emailService.sendAlertNotificationEmail(alertData, testUserData);
        if (alertResult.success) {
            console.log('✅ Alert email sent successfully!');
            console.log(`   📨 Message ID: ${alertResult.messageId}`);
        } else {
            console.log('❌ Alert email failed:', alertResult.error);
        }
    } catch (error) {
        console.log('❌ Alert email error:', error.message);
    }

    console.log('\n🎯 TESTING COMPLETED!');
    console.log('='.repeat(50));
    console.log('📬 CHECK YOUR OUTLOOK INBOX NOW!');
    console.log(`📧 Email: ${process.env.EMAIL_FROM}`);
    console.log('📂 You should have received 4 test emails');
    console.log('');
    console.log('✅ If you received the emails, your system is working!');
    console.log('📧 You can now use this setup for user registrations');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. Check your Outlook inbox');
    console.log('2. Test user registration flow');
    console.log('3. Update frontend to handle email verification');
    console.log('4. For production: Consider adding SendGrid as backup');
    console.log('');
    console.log('💡 Note: Outlook emails have excellent deliverability!');
}

testOutlookEmail().catch(console.error);