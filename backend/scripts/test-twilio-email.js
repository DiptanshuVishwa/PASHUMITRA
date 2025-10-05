require('dotenv').config();
const twilioEmailService = require('../services/twilioEmailService');

async function testTwilioEmail() {
    console.log('🚀 TESTING TWILIO EMAIL SERVICE\n');
    console.log('='.repeat(60));

    console.log('📋 Configuration Check:');
    console.log(`- Account SID: ${process.env.TWILIO_ACCOUNT_SID ? process.env.TWILIO_ACCOUNT_SID.substring(0, 10) + '...' : 'NOT SET'}`);
    console.log(`- Auth Token: ${process.env.TWILIO_AUTH_TOKEN ? '✅ SET (masked)' : '❌ NOT SET'}`);
    console.log(`- From Email: ${process.env.EMAIL_FROM}`);
    console.log(`- To Email: ${process.env.EMAIL_FROM}`);
    console.log('');

    // Test 1: Connection Test
    console.log('🔌 Step 1: Testing Twilio Connection...');
    try {
        const connectionResult = await twilioEmailService.testConnection();
        
        if (connectionResult.success) {
            console.log('✅ Twilio connection successful!');
            console.log(`   Account SID: ${connectionResult.accountSid}`);
            console.log(`   Status: ${connectionResult.status}`);
        } else {
            console.log('❌ Twilio connection failed:', connectionResult.error);
            return;
        }
    } catch (error) {
        console.log('❌ Connection test error:', error.message);
        return;
    }

    console.log('');

    // Test 2: Simple Email Test
    console.log('📧 Step 2: Sending test email...');
    try {
        const testResult = await twilioEmailService.sendEmail({
            to: process.env.EMAIL_FROM,
            subject: '🚀 Twilio Email Test - PashuMitra Portal',
            textContent: `
Twilio Email Test - PashuMitra Portal

This email was sent using Twilio!

Test Details:
- Service: Twilio SendGrid
- Time: ${new Date().toLocaleString()}
- From: ${process.env.EMAIL_FROM}
- To: ${process.env.EMAIL_FROM}

✅ If you receive this email, Twilio is working perfectly!
This should have excellent deliverability to all email providers.

Best regards,
PashuMitra Portal Team
            `.trim(),
            htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1>🚀 Twilio Email Test</h1>
                        <p style="margin: 0; opacity: 0.9;">PashuMitra Portal</p>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                        <h2 style="color: #6366f1; margin-top: 0;">🎉 Twilio Email Working!</h2>
                        
                        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                            <h3 style="margin-top: 0; color: #065f46;">✅ Test Results:</h3>
                            <ul style="margin: 10px 0;">
                                <li><strong>Service:</strong> Twilio SendGrid 🚀</li>
                                <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                                <li><strong>From:</strong> ${process.env.EMAIL_FROM}</li>
                                <li><strong>To:</strong> ${process.env.EMAIL_FROM}</li>
                                <li><strong>Status:</strong> Connected ✅</li>
                            </ul>
                        </div>
                        
                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                            <p style="margin: 0;"><strong>📬 Success!</strong></p>
                            <p style="margin: 5px 0 0 0;">If you receive this email, Twilio is working perfectly! This service has excellent deliverability to all email providers, especially Microsoft/Outlook.</p>
                        </div>
                        
                        <h3>🛠️ Features Available:</h3>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 15px 0;">
                            <div style="background: white; padding: 15px; border-radius: 5px; text-align: center; border: 1px solid #e2e8f0;">
                                📧<br><strong>Email</strong>
                            </div>
                            <div style="background: white; padding: 15px; border-radius: 5px; text-align: center; border: 1px solid #e2e8f0;">
                                📱<br><strong>SMS</strong>
                            </div>
                            <div style="background: white; padding: 15px; border-radius: 5px; text-align: center; border: 1px solid #e2e8f0;">
                                📞<br><strong>Voice</strong>
                            </div>
                            <div style="background: white; padding: 15px; border-radius: 5px; text-align: center; border: 1px solid #e2e8f0;">
                                💬<br><strong>WhatsApp</strong>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="background: #6366f1; color: white; padding: 15px; border-radius: 8px; display: inline-block;">
                                <h3 style="margin: 0;">🎯 Ready for Production!</h3>
                                <p style="margin: 5px 0 0 0;">Your PashuMitra Portal email system is now enterprise-ready!</p>
                            </div>
                        </div>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
                        <p style="text-align: center; color: #6b7280; margin: 0;">
                            <strong>PashuMitra Portal Team</strong><br>
                            Powered by Twilio 🚀 • 25,000 emails/month FREE
                        </p>
                    </div>
                </div>
            `
        });

        if (testResult.success) {
            console.log('🎉 SUCCESS! Twilio email sent perfectly!');
            console.log(`   📨 Message ID: ${testResult.messageId}`);
            console.log(`   📊 Status Code: ${testResult.statusCode}`);
            console.log(`   ⏰ Timestamp: ${testResult.timestamp}`);
        } else {
            console.log('❌ Email sending failed:', testResult.error);
            if (testResult.code) {
                console.log(`   Error Code: ${testResult.code}`);
            }
            return;
        }
    } catch (error) {
        console.log('❌ Email test error:', error.message);
        return;
    }

    console.log('');

    // Test 3: Welcome Email Template
    console.log('📧 Step 3: Testing welcome email template...');
    try {
        const welcomeResult = await twilioEmailService.sendWelcomeEmail({
            name: 'Test User',
            email: process.env.EMAIL_FROM
        });

        if (welcomeResult.success) {
            console.log('✅ Welcome email sent successfully!');
            console.log(`   📨 Message ID: ${welcomeResult.messageId}`);
        } else {
            console.log('❌ Welcome email failed:', welcomeResult.error);
        }
    } catch (error) {
        console.log('❌ Welcome email error:', error.message);
    }

    console.log('');

    // Test 4: Verification Email Template
    console.log('📧 Step 4: Testing verification email template...');
    try {
        const verificationResult = await twilioEmailService.sendEmailVerification(
            { name: 'Test User', email: process.env.EMAIL_FROM },
            'twilio_test_token_' + Date.now()
        );

        if (verificationResult.success) {
            console.log('✅ Verification email sent successfully!');
            console.log(`   📨 Message ID: ${verificationResult.messageId}`);
        } else {
            console.log('❌ Verification email failed:', verificationResult.error);
        }
    } catch (error) {
        console.log('❌ Verification email error:', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 TWILIO TEST RESULTS SUMMARY:');
    console.log('');
    console.log('📬 CHECK YOUR EMAIL NOW!');
    console.log(`   Email: ${process.env.EMAIL_FROM}`);
    console.log('   Look for: "🚀 Twilio Email Test - PashuMitra Portal"');
    console.log('   Also check for: Welcome and Verification emails');
    console.log('');
    console.log('📧 Where to check:');
    console.log('   - 📥 Primary Inbox (most likely!)');
    console.log('   - 📂 Other/Focused inbox');
    console.log('   - 🗑️ Junk/Spam folder (less likely with Twilio)');
    console.log('');
    console.log('✅ TWILIO ADVANTAGES:');
    console.log('   - Better deliverability than AWS SES');
    console.log('   - Excellent Microsoft/Outlook compatibility');
    console.log('   - Professional sender reputation');
    console.log('   - 25,000 emails/month free');
    console.log('   - SMS and WhatsApp capabilities');
    console.log('');
    console.log('🚀 YOUR PASHUMNITRA PORTAL IS NOW EMAIL-READY!');
}

testTwilioEmail().catch(console.error);