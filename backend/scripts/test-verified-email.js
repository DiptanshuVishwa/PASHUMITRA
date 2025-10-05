const emailService = require('../services/emailService');
require('dotenv').config();

async function testVerifiedEmailFlow() {
    console.log('🧪 TESTING EMAIL FLOW WITH VERIFIED ADDRESS\n');
    console.log(`Using verified email: ${process.env.EMAIL_FROM}\n`);

    const testUserData = {
        name: 'Test User',
        email: process.env.EMAIL_FROM, // Use the verified email as recipient
        id: 'test_user_123'
    };

    console.log('📧 Test 1: Welcome Email');
    try {
        const welcomeResult = await emailService.sendWelcomeEmail(testUserData);
        if (welcomeResult.success) {
            console.log('✅ Welcome email sent successfully!');
            console.log(`   Message ID: ${welcomeResult.messageId}`);
        } else {
            console.log('❌ Welcome email failed:', welcomeResult.error);
        }
    } catch (error) {
        console.log('❌ Welcome email error:', error.message);
    }

    console.log('\n📧 Test 2: Email Verification');
    try {
        const verificationToken = 'test_token_' + Date.now();
        const verificationResult = await emailService.sendEmailVerification(testUserData, verificationToken);
        if (verificationResult.success) {
            console.log('✅ Verification email sent successfully!');
            console.log(`   Message ID: ${verificationResult.messageId}`);
            console.log(`   Verification link: ${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`);
        } else {
            console.log('❌ Verification email failed:', verificationResult.error);
        }
    } catch (error) {
        console.log('❌ Verification email error:', error.message);
    }

    console.log('\n📧 Test 3: Password Reset Email');
    try {
        const resetToken = 'reset_token_' + Date.now();
        const resetResult = await emailService.sendPasswordResetEmail(testUserData, resetToken);
        if (resetResult.success) {
            console.log('✅ Password reset email sent successfully!');
            console.log(`   Message ID: ${resetResult.messageId}`);
            console.log(`   Reset link: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`);
        } else {
            console.log('❌ Password reset email failed:', resetResult.error);
        }
    } catch (error) {
        console.log('❌ Password reset email error:', error.message);
    }

    console.log('\n📧 Test 4: Critical Alert Email');
    try {
        const alertData = {
            animalId: 'COW_001',
            alertType: 'Health Alert',
            severity: 'Critical',
            description: 'Abnormal vital signs detected - temperature spike observed',
            location: 'Farm Section A',
            timestamp: new Date()
        };
        
        const alertResult = await emailService.sendAlertNotificationEmail(alertData, testUserData);
        if (alertResult.success) {
            console.log('✅ Alert notification email sent successfully!');
            console.log(`   Message ID: ${alertResult.messageId}`);
        } else {
            console.log('❌ Alert notification email failed:', alertResult.error);
        }
    } catch (error) {
        console.log('❌ Alert notification email error:', error.message);
    }

    console.log('\n📧 Test 5: Appointment Confirmation Email');
    try {
        const appointmentData = {
            appointmentId: 'APPT_001',
            veterinarianName: 'Dr. Rajesh Kumar',
            scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            location: 'Veterinary Clinic, Main Road',
            animalId: 'COW_001'
        };
        
        const appointmentResult = await emailService.sendAppointmentConfirmationEmail(appointmentData, testUserData);
        if (appointmentResult.success) {
            console.log('✅ Appointment confirmation email sent successfully!');
            console.log(`   Message ID: ${appointmentResult.messageId}`);
        } else {
            console.log('❌ Appointment confirmation email failed:', appointmentResult.error);
        }
    } catch (error) {
        console.log('❌ Appointment confirmation email error:', error.message);
    }

    console.log('\n🎯 SUMMARY:');
    console.log('All test emails have been sent to: ' + process.env.EMAIL_FROM);
    console.log('Please check your Gmail inbox, spam folder, and other tabs.');
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Check your Gmail account for all the test emails');
    console.log('2. Test the registration flow with the verified email address');
    console.log('3. For production: either request domain verification or use Gmail SMTP');
    console.log('4. Current AWS SES limit: 200 emails/day (sandbox mode)');
}

testVerifiedEmailFlow().catch(console.error);