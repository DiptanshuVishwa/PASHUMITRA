require('dotenv').config();
const { SESClient, PutIdentityDkimAttributesCommand, SendEmailCommand } = require('@aws-sdk/client-ses');

async function enableDKIMAndTest() {
    console.log('🔐 ENABLING DKIM AND TESTING EMAIL DELIVERY\n');
    console.log('='.repeat(60));

    const sesClient = new SESClient({
        region: process.env.AWS_REGION || 'ap-south-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });

    const emailToCheck = process.env.EMAIL_FROM;
    console.log(`🎯 Working with: ${emailToCheck}\n`);

    try {
        // Step 1: Enable DKIM
        console.log('🔐 STEP 1: Enabling DKIM authentication...');
        
        const dkimCommand = new PutIdentityDkimAttributesCommand({
            Identity: emailToCheck,
            DkimEnabled: true
        });

        await sesClient.send(dkimCommand);
        console.log('✅ DKIM enabled successfully!');
        console.log('⏱️ Note: DKIM propagation can take 24-48 hours for full effect');

        // Step 2: Send a test email with improved headers
        console.log('\n📧 STEP 2: Sending enhanced test email...');
        
        const testEmailCommand = new SendEmailCommand({
            Source: emailToCheck,
            Destination: {
                ToAddresses: [emailToCheck]
            },
            Message: {
                Subject: {
                    Data: '🔐 DKIM Enabled Test - PashuMitra Portal',
                    Charset: 'UTF-8'
                },
                Body: {
                    Html: {
                        Data: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                                <div style="background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                                    <h1>🔐 DKIM Authentication Test</h1>
                                </div>
                                <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
                                    <h2>Email Delivery Test</h2>
                                    <p>This email was sent with <strong>DKIM authentication enabled</strong> to improve deliverability.</p>
                                    
                                    <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                        <h3>✅ Test Details:</h3>
                                        <ul>
                                            <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                                            <li><strong>From:</strong> ${emailToCheck}</li>
                                            <li><strong>Authentication:</strong> DKIM Enabled</li>
                                            <li><strong>Service:</strong> AWS SES</li>
                                        </ul>
                                    </div>
                                    
                                    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
                                        <p><strong>📬 If you receive this email:</strong></p>
                                        <p>Your email delivery system is now working correctly with improved authentication!</p>
                                    </div>
                                    
                                    <p>Best regards,<br>
                                    <strong>PashuMitra Portal Team</strong></p>
                                </div>
                            </div>
                        `,
                        Charset: 'UTF-8'
                    },
                    Text: {
                        Data: `DKIM Authentication Test - PashuMitra Portal

This email was sent with DKIM authentication enabled to improve deliverability.

Test Details:
- Time: ${new Date().toLocaleString()}
- From: ${emailToCheck}
- Authentication: DKIM Enabled
- Service: AWS SES

If you receive this email, your email delivery system is now working correctly with improved authentication!

Best regards,
PashuMitra Portal Team`,
                        Charset: 'UTF-8'
                    }
                }
            }
        });

        const result = await sesClient.send(testEmailCommand);
        console.log('✅ Enhanced test email sent successfully!');
        console.log(`📨 Message ID: ${result.MessageId}`);

        // Step 3: Recommendations
        console.log('\n🎯 STEP 3: Next Actions...');
        console.log('');
        console.log('✅ IMMEDIATE:');
        console.log('1. Check your Outlook inbox (including Junk folder) in 2-3 minutes');
        console.log('2. If still no emails, wait 15-20 minutes for DKIM to take effect');
        console.log('3. Add these to Outlook safe senders:');
        console.log('   - *.amazonses.com');
        console.log('   - amazonses.com');
        console.log(`   - ${emailToCheck}`);
        console.log('');
        console.log('🔄 LONG-TERM (24-48 hours):');
        console.log('1. DKIM will fully propagate and improve deliverability');
        console.log('2. Microsoft will trust your emails more');
        console.log('3. Delivery rates should significantly improve');
        console.log('');
        console.log('🆘 IF STILL NO EMAILS:');
        console.log('1. Try creating a new Gmail account for testing');
        console.log('2. Contact AWS Support about SES deliverability');
        console.log('3. Consider using SendGrid as an alternative');

        console.log('\n📬 CHECK YOUR EMAIL NOW!');
        console.log('Look for: "🔐 DKIM Enabled Test - PashuMitra Portal"');

    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        if (error.message.includes('already enabled')) {
            console.log('💡 DKIM might already be enabled. That\'s good!');
        }
    }
}

enableDKIMAndTest().catch(console.error);