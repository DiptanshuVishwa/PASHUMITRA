require('dotenv').config();

async function fixDKIMAndTest() {
    console.log('🔐 DKIM AUTHENTICATION FIX\n');
    console.log('='.repeat(50));

    console.log('❌ ISSUE IDENTIFIED: DKIM is disabled for your Outlook email');
    console.log('This is likely why Microsoft is blocking your emails.\n');

    console.log('🛠️ MANUAL FIX REQUIRED:');
    console.log('');
    console.log('1. 🌐 Go to AWS SES Console:');
    console.log('   https://console.aws.amazon.com/ses/');
    console.log('');
    console.log('2. 📍 Select correct region:');
    console.log('   ap-south-1 (Asia Pacific Mumbai)');
    console.log('');
    console.log('3. 🔍 Navigate to Verified identities:');
    console.log('   - Click "Verified identities" in left sidebar');
    console.log('   - Click on "team.pashumitra@outlook.com"');
    console.log('');
    console.log('4. 🔐 Enable DKIM:');
    console.log('   - Go to "Authentication" tab');
    console.log('   - In DKIM section, click "Edit"');
    console.log('   - Check "Enabled" checkbox');
    console.log('   - Click "Save changes"');
    console.log('');
    console.log('5. ⏱️ Wait for propagation:');
    console.log('   - DKIM can take 15 minutes to 24 hours to activate');
    console.log('   - Status will change from "Pending" to "Successful"');

    console.log('\n🚀 ALTERNATIVE QUICK SOLUTION:');
    console.log('While waiting for DKIM, try these immediate fixes:');
    console.log('');
    console.log('📧 IN YOUR OUTLOOK ACCOUNT:');
    console.log('1. Add to Safe Senders:');
    console.log('   - team.pashumitra@outlook.com');
    console.log('   - *.amazonses.com');
    console.log('   - amazonses.com');
    console.log('');
    console.log('2. Check these locations thoroughly:');
    console.log('   - 📥 Focused inbox');
    console.log('   - 📂 Other inbox');
    console.log('   - 🗑️ Junk email folder');
    console.log('   - 🗂️ Deleted items');
    console.log('   - 📁 All folders');
    console.log('');
    console.log('3. Search your email for:');
    console.log('   - "PashuMitra"');
    console.log('   - "AWS"');
    console.log('   - "amazonses"');
    console.log('   - Your own email address');

    console.log('\n📤 TESTING WITH SIMPLE EMAIL:');
    
    // Send a very simple test email
    try {
        const emailService = require('../services/emailService');
        
        const result = await emailService.sendEmail({
            to: process.env.EMAIL_FROM,
            subject: 'Simple Test - No HTML',
            textContent: `Simple plain text test email sent at ${new Date().toLocaleString()}. If you receive this, basic email delivery is working.`
        });

        if (result.success) {
            console.log('✅ Simple test email sent!');
            console.log(`📨 Message ID: ${result.messageId}`);
            console.log('\n📬 CHECK YOUR EMAIL NOW!');
            console.log('This simple email has the best chance of delivery.');
        } else {
            console.log('❌ Even simple email failed:', result.error);
        }
    } catch (error) {
        console.log('❌ Error sending simple email:', error.message);
    }

    console.log('\n🎯 SUMMARY:');
    console.log('1. ✅ Your AWS SES is configured correctly');
    console.log('2. ❌ DKIM authentication is disabled (main issue)');
    console.log('3. 🛡️ Microsoft is likely filtering your emails');
    console.log('4. 🔧 Enable DKIM in AWS SES Console (see steps above)');
    console.log('5. 📧 Check ALL Outlook folders thoroughly');
    console.log('6. ⏱️ Wait 15-30 minutes, then try again');

    console.log('\n💡 IF STILL NO EMAILS AFTER DKIM:');
    console.log('Consider switching to Gmail temporarily for testing,');
    console.log('or use SendGrid which has better Microsoft deliverability.');
}

fixDKIMAndTest().catch(console.error);