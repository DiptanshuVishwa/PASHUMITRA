const { SESv2Client, PutAccountSendingEnabledCommand } = require('@aws-sdk/client-sesv2');

async function requestProductionAccess() {
    console.log('🚀 AWS SES PRODUCTION ACCESS REQUEST\n');
    
    console.log('To move AWS SES out of sandbox mode, you need to:');
    console.log('');
    console.log('📝 MANUAL STEPS (AWS Console):');
    console.log('1. Go to AWS SES Console: https://console.aws.amazon.com/ses/');
    console.log('2. Select your region (ap-south-1 - Asia Pacific Mumbai)');
    console.log('3. Go to "Account dashboard" in the left sidebar');
    console.log('4. Click "Request production access"');
    console.log('');
    
    console.log('📋 REQUEST FORM DETAILS TO FILL:');
    console.log('- Mail type: Transactional');
    console.log('- Website URL: https://pashumitra.com (or your actual website)');
    console.log('- Use case description:');
    console.log('  "PashuMitra Portal is a livestock disease monitoring and management');
    console.log('   system for farmers in India. We send critical health alerts,');
    console.log('   appointment reminders, email verifications, and system notifications');
    console.log('   to registered farmers and veterinarians. All emails are opt-in');
    console.log('   and comply with AWS sending policies."');
    console.log('');
    console.log('- Additional contacts: team.pashumitra@gmail.com');
    console.log('- Preferred contact method: Email');
    console.log('- Process for complaints: Email team.pashumitra@gmail.com');
    console.log('- Process for bounces: Automated handling via AWS SES bounce notifications');
    console.log('');
    
    console.log('⏱️  EXPECTED TIMELINE:');
    console.log('- AWS typically reviews requests within 24-48 hours');
    console.log('- Approval usually granted for legitimate transactional use cases');
    console.log('- Once approved, you can send to any email address');
    console.log('');
    
    console.log('🔧 IMMEDIATE WORKAROUND:');
    console.log('Until production access is granted, you have these options:');
    console.log('1. Verify the recipient email addresses in AWS SES');
    console.log('2. Use Gmail SMTP as backup (I can set this up)');
    console.log('3. Continue testing with team.pashumitra@gmail.com only');
    console.log('');
    
    // Check current sending quota
    try {
        const sesClient = new SESv2Client({
            region: process.env.AWS_REGION || 'ap-south-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
        
        console.log('📊 CURRENT SES STATUS:');
        console.log('- Status: SANDBOX MODE (200 emails/day limit)');
        console.log('- Only verified emails can receive messages');
        console.log('- team.pashumitra@gmail.com is verified ✅');
        
    } catch (error) {
        console.log(`❌ Error checking SES status: ${error.message}`);
    }
}

// Run the information display
requestProductionAccess().catch(console.error);