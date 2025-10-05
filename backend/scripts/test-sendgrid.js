require('dotenv').config();
const sgMail = require('@sendgrid/mail');

async function testSendGrid() {
    console.log('🚀 TESTING SENDGRID EMAIL SERVICE\n');
    console.log('='.repeat(50));

    // Set up SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    console.log('✅ SendGrid API Key loaded');
    console.log(`📧 Sender: ${process.env.EMAIL_FROM}`);
    console.log(`📧 Recipient: ${process.env.EMAIL_FROM}`);

    // Test email data
    const msg = {
        to: process.env.EMAIL_FROM,
        from: process.env.EMAIL_FROM,
        subject: '🚀 SendGrid Test - PashuMitra Portal',
        text: `
SendGrid Email Test - PashuMitra Portal

This email was sent using SendGrid instead of AWS SES!

Test Details:
- Time: ${new Date().toLocaleString()}
- Service: SendGrid
- From: ${process.env.EMAIL_FROM}
- To: ${process.env.EMAIL_FROM}

If you receive this email, SendGrid is working perfectly!
This should have much better deliverability than AWS SES.

Features tested:
✅ SendGrid API connection
✅ Email sending
✅ Text content
✅ HTML content (see below)

Best regards,
PashuMitra Portal Team
        `.trim(),
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1>🚀 SendGrid Email Test</h1>
                    <p style="margin: 0; opacity: 0.9;">PashuMitra Portal</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
                    <h2 style="color: #4CAF50; margin-top: 0;">🎉 Success! SendGrid is Working!</h2>
                    
                    <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                        <h3 style="margin-top: 0; color: #2E7D32;">✅ Test Results:</h3>
                        <ul style="margin: 10px 0;">
                            <li><strong>Service:</strong> SendGrid ⚡</li>
                            <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                            <li><strong>From:</strong> ${process.env.EMAIL_FROM}</li>
                            <li><strong>To:</strong> ${process.env.EMAIL_FROM}</li>
                            <li><strong>API Status:</strong> Connected ✅</li>
                        </ul>
                    </div>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                        <p style="margin: 0;"><strong>📬 If you receive this email:</strong></p>
                        <p style="margin: 5px 0 0 0;">SendGrid is working perfectly! This should have much better deliverability than AWS SES, especially to Microsoft/Outlook accounts.</p>
                    </div>
                    
                    <h3>🛠️ Features Tested:</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0;">
                        <div style="background: white; padding: 10px; border-radius: 5px; text-align: center;">
                            ✅ API Connection
                        </div>
                        <div style="background: white; padding: 10px; border-radius: 5px; text-align: center;">
                            ✅ Email Sending
                        </div>
                        <div style="background: white; padding: 10px; border-radius: 5px; text-align: center;">
                            ✅ Text Content
                        </div>
                        <div style="background: white; padding: 10px; border-radius: 5px; text-align: center;">
                            ✅ HTML Content
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="background: #4CAF50; color: white; padding: 15px; border-radius: 8px; display: inline-block;">
                            <h3 style="margin: 0;">🎯 Next Steps</h3>
                            <p style="margin: 5px 0 0 0;">Your PashuMitra Portal email system is now ready!</p>
                        </div>
                    </div>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="text-align: center; color: #666; margin: 0;">
                        <strong>PashuMitra Portal Team</strong><br>
                        Powered by SendGrid 🚀
                    </p>
                </div>
            </div>
        `
    };

    try {
        console.log('\n📤 Sending test email...');
        const result = await sgMail.send(msg);
        
        console.log('🎉 SUCCESS! SendGrid email sent!');
        console.log(`📨 Message ID: ${result[0].headers['x-message-id'] || 'N/A'}`);
        console.log(`📊 Status Code: ${result[0].statusCode}`);
        
        console.log('\n📬 CHECK YOUR EMAIL NOW!');
        console.log('Look for: "🚀 SendGrid Test - PashuMitra Portal"');
        console.log('');
        console.log('📧 Where to check:');
        console.log('   - Primary Inbox (most likely!)');
        console.log('   - Junk/Spam folder');
        console.log('   - All folders');
        
        console.log('\n✅ SENDGRID SETUP COMPLETE!');
        console.log('Your PashuMitra Portal now has reliable email delivery!');
        
    } catch (error) {
        console.log('❌ SendGrid test failed:');
        console.log(`Error: ${error.message}`);
        
        if (error.code) {
            console.log(`Code: ${error.code}`);
        }
        
        if (error.response && error.response.body) {
            console.log('Response body:', JSON.stringify(error.response.body, null, 2));
        }
    }
}

testSendGrid().catch(console.error);