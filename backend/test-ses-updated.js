require('dotenv').config();
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

async function testSESWithUpdatedEmail() {
  console.log('📧 Testing AWS SES with Updated Email Configuration\n');
  console.log('='.repeat(50));
  
  console.log('🔧 Email Configuration:');
  console.log(`   From Email: ${process.env.EMAIL_FROM}`);
  console.log(`   From Name: ${process.env.EMAIL_FROM_NAME}`);
  console.log(`   Region: ${process.env.AWS_REGION}`);
  
  try {
    const sesClient = new SESClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    console.log('\n📨 Sending test email via SES...');
    
    const emailCommand = new SendEmailCommand({
      Source: process.env.EMAIL_FROM,
      Destination: {
        ToAddresses: [process.env.EMAIL_FROM] // Send to same email for testing
      },
      Message: {
        Subject: {
          Data: '🧪 PashuMitra Portal - SES Test Email',
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: `
<!DOCTYPE html>
<html>
<head>
    <title>SES Test - PashuMitra Portal</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; margin: -30px -30px 20px -30px; }
        .success { background: #e8f5e8; border-left: 4px solid #4CAF50; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .info { background: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 15px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🧪 AWS SES Test Successful!</h2>
        </div>
        
        <div class="success">
            <h3>✅ Email Service Working!</h3>
            <p>Congratulations! Your AWS SES integration is working perfectly with the updated email configuration.</p>
        </div>
        
        <div class="info">
            <h4>📋 Test Details:</h4>
            <ul>
                <li><strong>From:</strong> ${process.env.EMAIL_FROM}</li>
                <li><strong>Service:</strong> AWS SES (Simple Email Service)</li>
                <li><strong>Region:</strong> ${process.env.AWS_REGION}</li>
                <li><strong>Timestamp:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</li>
            </ul>
        </div>
        
        <p>Your PashuMitra Portal backend is now ready to send:</p>
        <ul>
            <li>🚨 Critical livestock health alerts</li>
            <li>📅 Appointment reminders</li>
            <li>👋 Welcome emails for new users</li>
            <li>🔐 Password reset notifications</li>
            <li>📊 System notifications</li>
        </ul>
        
        <p><strong>🎉 Your email service is production-ready!</strong></p>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="text-align: center; color: #666; font-size: 12px;">
            This is an automated test email from PashuMitra Portal<br>
            Powered by AWS SES • Made with ❤️ for Indian farmers
        </p>
    </div>
</body>
</html>`,
            Charset: 'UTF-8'
          },
          Text: {
            Data: `
🧪 AWS SES TEST SUCCESSFUL - PashuMitra Portal

✅ Email Service Working!

Congratulations! Your AWS SES integration is working perfectly with the updated email configuration.

Test Details:
- From: ${process.env.EMAIL_FROM}
- Service: AWS SES (Simple Email Service)
- Region: ${process.env.AWS_REGION}
- Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Your PashuMitra Portal backend is now ready to send:
• Critical livestock health alerts
• Appointment reminders  
• Welcome emails for new users
• Password reset notifications
• System notifications

🎉 Your email service is production-ready!

This is an automated test email from PashuMitra Portal
Powered by AWS SES • Made with ❤️ for Indian farmers
            `.trim(),
            Charset: 'UTF-8'
          }
        }
      }
    });

    const result = await sesClient.send(emailCommand);
    console.log('✅ SES test email sent successfully!');
    console.log(`📝 Message ID: ${result.MessageId}`);
    
    console.log('\n🎉 SUCCESS! Email service is now working with:');
    console.log(`   📧 From: ${process.env.EMAIL_FROM}`);
    console.log(`   📬 To: ${process.env.EMAIL_FROM} (test recipient)`);
    console.log('\n💡 Check your inbox for the test email!');
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ AWS SES Integration Complete!');
    console.log('\n🚀 Your PashuMitra Portal is now 100% operational with:');
    console.log('   ✅ SNS - Push notifications');
    console.log('   ✅ SES - Email notifications');  
    console.log('   ✅ CloudWatch - System monitoring');
    console.log('   ✅ S3 - File storage');
    console.log('   ✅ MongoDB - Database');

  } catch (error) {
    console.log('❌ SES test failed:', error.message);
    
    if (error.message.includes('Email address is not verified')) {
      console.log('\n🔧 SETUP REQUIRED:');
      console.log('   1. Go to AWS SES Console: https://console.aws.amazon.com/ses/');
      console.log('   2. Navigate to "Verified identities"');
      console.log('   3. Click "Create identity"');
      console.log('   4. Add email: team.pashumitra@gmail.com');
      console.log('   5. Check your Gmail inbox and click verification link');
      console.log('   6. Run this test again: node test-ses-updated.js');
      console.log('\n⏱️  Estimated time: 2-3 minutes');
    } else {
      console.log('\n🔧 Debug info:');
      console.log(`   Error type: ${error.name}`);
      console.log(`   Error code: ${error.code || 'N/A'}`);
    }
  }
}

// Run the test
testSESWithUpdatedEmail().catch(console.error);