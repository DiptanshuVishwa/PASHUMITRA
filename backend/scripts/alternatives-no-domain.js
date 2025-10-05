require('dotenv').config();

async function alternativesWithoutDomain() {
    console.log('🔍 EMAIL DELIVERY SOLUTIONS WITHOUT DOMAIN OWNERSHIP\n');
    console.log('='.repeat(60));

    console.log('❌ LIMITATION CONFIRMED:');
    console.log('You cannot enable DKIM for team.pashumitra@outlook.com');
    console.log('because you don\'t own the outlook.com domain.\n');

    console.log('🚀 SOLUTION OPTIONS:\n');

    console.log('📧 OPTION 1: Switch to SendGrid (RECOMMENDED)');
    console.log('✅ Pros:');
    console.log('   - 100 emails/day free forever');
    console.log('   - Excellent deliverability to Microsoft/Outlook');
    console.log('   - Better reputation than AWS SES sandbox');
    console.log('   - No domain ownership required');
    console.log('   - 5-minute setup');
    console.log('❌ Cons:');
    console.log('   - Requires creating a SendGrid account');
    console.log('');

    console.log('📧 OPTION 2: Test with Gmail Address');
    console.log('✅ Pros:');
    console.log('   - Gmail has better AWS SES compatibility');
    console.log('   - Can verify immediately in AWS SES');
    console.log('   - Good for testing/development');
    console.log('❌ Cons:');
    console.log('   - May still have filtering issues');
    console.log('   - Gmail can be unpredictable with AWS SES');
    console.log('');

    console.log('📧 OPTION 3: Use Different Email Provider for Testing');
    console.log('✅ Pros:');
    console.log('   - Yahoo, ProtonMail, or custom domain emails');
    console.log('   - Often have better AWS SES compatibility');
    console.log('❌ Cons:');
    console.log('   - Need to create new accounts');
    console.log('   - Still no guarantee of delivery');
    console.log('');

    console.log('📧 OPTION 4: Continue with Current Setup + Manual Checks');
    console.log('✅ Pros:');
    console.log('   - No additional setup required');
    console.log('   - AWS SES is actually working (emails are being sent)');
    console.log('❌ Cons:');
    console.log('   - Microsoft filtering will continue');
    console.log('   - Unreliable for production use');
    console.log('');

    console.log('🎯 RECOMMENDED APPROACH: Try SendGrid\n');

    console.log('🚀 SENDGRID SETUP (5 minutes):');
    console.log('1. Go to https://signup.sendgrid.com/');
    console.log('2. Sign up with team.pashumitra@gmail.com');
    console.log('3. Verify your email');
    console.log('4. Go to Settings > API Keys');
    console.log('5. Create new API key with "Full Access"');
    console.log('6. Copy the API key');
    console.log('7. Add to .env: SENDGRID_API_KEY=your_api_key_here');
    console.log('8. Install package: npm install @sendgrid/mail');

    console.log('\n🔄 LET\'S TEST CURRENT SETUP ONE MORE TIME:');
    
    // Final test with current AWS SES setup
    try {
        const emailService = require('../services/emailService');
        
        const result = await emailService.sendEmail({
            to: process.env.EMAIL_FROM,
            subject: `Final AWS SES Test - ${new Date().getHours()}:${new Date().getMinutes()}`,
            textContent: `
FINAL TEST EMAIL - AWS SES

Time: ${new Date().toLocaleString()}
To: ${process.env.EMAIL_FROM}
From: ${process.env.EMAIL_FROM}

This is the last test with AWS SES before switching to alternatives.

If you receive this email:
✅ AWS SES is working, but Microsoft is filtering emails

If you don't receive this email:
❌ Confirms Microsoft is blocking AWS SES emails

NEXT STEPS:
1. Check your Outlook thoroughly (ALL folders)
2. Wait 10 minutes
3. If no email, let's set up SendGrid

---
PashuMitra Portal Team
            `.trim(),
            htmlContent: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; border: 2px solid #4CAF50; border-radius: 10px;">
                    <h2 style="color: #4CAF50; text-align: center;">📧 Final AWS SES Test</h2>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>To:</strong> ${process.env.EMAIL_FROM}</p>
                        <p><strong>From:</strong> ${process.env.EMAIL_FROM}</p>
                    </div>
                    <p>This is the <strong>last test</strong> with AWS SES before switching to alternatives.</p>
                    <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; border-left: 4px solid #4CAF50;">
                        <p><strong>✅ If you receive this email:</strong><br>
                        AWS SES is working, but Microsoft is filtering emails</p>
                    </div>
                    <div style="background: #ffebee; padding: 15px; border-radius: 5px; border-left: 4px solid #f44336; margin-top: 10px;">
                        <p><strong>❌ If you don't receive this email:</strong><br>
                        Confirms Microsoft is blocking AWS SES emails</p>
                    </div>
                    <h3>🎯 Next Steps:</h3>
                    <ol>
                        <li>Check your Outlook thoroughly (ALL folders)</li>
                        <li>Wait 10 minutes</li>
                        <li>If no email, let's set up SendGrid</li>
                    </ol>
                    <hr>
                    <p style="text-align: center; color: #666;"><strong>PashuMitra Portal Team</strong></p>
                </div>
            `
        });

        if (result.success) {
            console.log('✅ Final test email sent successfully!');
            console.log(`📨 Message ID: ${result.messageId}`);
            console.log('\n📬 CHECK YOUR OUTLOOK NOW!');
            console.log('Look for: "Final AWS SES Test"');
            console.log('Check: Inbox, Junk, Other, Deleted, ALL folders');
        } else {
            console.log('❌ Final test email failed:', result.error);
        }
    } catch (error) {
        console.log('❌ Error sending final test:', error.message);
    }

    console.log('\n⏱️ WAIT 10 MINUTES THEN DECIDE:');
    console.log('');
    console.log('✅ If you receive the email:');
    console.log('   - AWS SES works, but Microsoft filters aggressively');
    console.log('   - For production, consider SendGrid or domain purchase');
    console.log('   - For development, this setup can work with manual checking');
    console.log('');
    console.log('❌ If you don\'t receive the email:');
    console.log('   - Microsoft is completely blocking AWS SES');
    console.log('   - SendGrid is the best immediate solution');
    console.log('   - Or switch to Gmail for testing');

    console.log('\n💡 MY RECOMMENDATION:');
    console.log('Set up SendGrid as your primary email service.');
    console.log('It has excellent Microsoft deliverability and is free for your needs.');
    console.log('');
    console.log('Would you like me to help you set up SendGrid?');
}

alternativesWithoutDomain().catch(console.error);