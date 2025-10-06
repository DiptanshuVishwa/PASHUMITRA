const { SESClient, GetIdentityVerificationAttributesCommand, ListIdentitiesCommand, GetSendQuotaCommand } = require('@aws-sdk/client-ses');
require('dotenv').config();

class SESVerificationChecker {
  constructor() {
    this.sesClient = new SESClient({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async checkVerificationStatus() {
    console.log('🔍 CHECKING AWS SES EMAIL VERIFICATION STATUS\n');
    console.log('='.repeat(60));
    
    try {
      // Check current configuration
      console.log('📋 Current Configuration:');
      console.log(`   Region: ${process.env.AWS_REGION}`);
      console.log(`   Sender Email: ${process.env.EMAIL_FROM}`);
      console.log(`   Sender Name: ${process.env.EMAIL_FROM_NAME}`);
      console.log('');

      // Get all identities
      console.log('🔎 Checking all verified identities...');
      const listCommand = new ListIdentitiesCommand({});
      const identitiesResult = await this.sesClient.send(listCommand);
      
      console.log('✅ Found identities in SES:');
      if (identitiesResult.Identities && identitiesResult.Identities.length > 0) {
        identitiesResult.Identities.forEach((identity, index) => {
          console.log(`   ${index + 1}. ${identity}`);
        });
      } else {
        console.log('   No verified identities found!');
      }
      console.log('');

      // Check verification status for our specific email
      const emailsToCheck = [
        process.env.EMAIL_FROM,
        'team.pashumitra@gmail.com',
        'noreply@pashumnitra.com'
      ];

      console.log('📧 Checking verification status for specific emails:');
      
      for (const email of emailsToCheck) {
        if (email) {
          try {
            const verificationCommand = new GetIdentityVerificationAttributesCommand({
              Identities: [email]
            });
            const verificationResult = await this.sesClient.send(verificationCommand);
            
            const attributes = verificationResult.VerificationAttributes[email];
            if (attributes) {
              console.log(`   ${email}:`);
              console.log(`     Status: ${attributes.VerificationStatus}`);
              if (attributes.VerificationToken) {
                console.log(`     Token: ${attributes.VerificationToken}`);
              }
            } else {
              console.log(`   ${email}: Not found in SES`);
            }
          } catch (error) {
            console.log(`   ${email}: Error - ${error.message}`);
          }
        }
      }
      console.log('');

      // Get sending quota
      console.log('📊 Checking SES sending limits...');
      try {
        const quotaCommand = new GetSendQuotaCommand({});
        const quotaResult = await this.sesClient.send(quotaCommand);
        
        console.log('✅ Current SES sending limits:');
        console.log(`   Max 24-hour send: ${quotaResult.Max24HourSend} emails`);
        console.log(`   Max send rate: ${quotaResult.MaxSendRate} emails/second`);
        console.log(`   Sent in last 24h: ${quotaResult.SentLast24Hours} emails`);
        console.log('');
      } catch (error) {
        console.log(`❌ Could not get sending quota: ${error.message}`);
      }

      // Check if we're in sandbox mode
      if (identitiesResult.Identities && identitiesResult.Identities.length === 0) {
        console.log('🚨 IMPORTANT: Your AWS SES account appears to be in sandbox mode!');
        console.log('   In sandbox mode, you can only send emails to verified addresses.');
        console.log('');
      }

      console.log('='.repeat(60));
      console.log('🛠️  NEXT STEPS TO FIX EMAIL VERIFICATION:');
      console.log('');
      
      console.log('1. 📧 VERIFY YOUR SENDER EMAIL:');
      console.log('   a) Go to AWS SES Console: https://console.aws.amazon.com/ses/');
      console.log('   b) Navigate to "Identities" → "Email addresses"');
      console.log('   c) Click "Verify a New Email Address"');
      console.log(`   d) Enter: ${process.env.EMAIL_FROM}`);
      console.log('   e) Check the email inbox and click the verification link');
      console.log('');

      console.log('2. 🏢 REQUEST PRODUCTION ACCESS (if needed):');
      console.log('   a) In SES Console, go to "Account dashboard"');
      console.log('   b) Click "Request production access"');
      console.log('   c) Fill out the form with your use case details');
      console.log('   d) Wait for AWS approval (usually 24-48 hours)');
      console.log('');

      console.log('3. 🔄 ALTERNATIVE: Use Gmail SMTP (for testing):');
      console.log('   If AWS SES verification takes time, you can temporarily use Gmail:');
      console.log('   - Enable 2-factor authentication on Gmail');
      console.log('   - Generate app-specific password');
      console.log('   - Update your .env file with Gmail SMTP settings');
      console.log('');

      console.log('4. ✅ TEST AFTER VERIFICATION:');
      console.log('   Run this script again after verifying your email address');
      console.log('   Then test: npm run test:email');
      console.log('');

      console.log('💡 TIP: For development, consider using a service like MailHog');
      console.log('   or Ethereal Email to catch emails without sending real ones.');

    } catch (error) {
      console.error('❌ Error checking SES status:', error.message);
      
      if (error.message.includes('credentials')) {
        console.log('');
        console.log('🔑 CREDENTIAL ISSUE DETECTED:');
        console.log('   Please check your AWS credentials in the .env file:');
        console.log('   - AWS_ACCESS_KEY_ID');
        console.log('   - AWS_SECRET_ACCESS_KEY');
        console.log('   - AWS_REGION');
      }
    }
  }

  // Method to verify a new email address
  async verifyEmailAddress(emailAddress) {
    try {
      const { SESClient, VerifyEmailIdentityCommand } = require('@aws-sdk/client-ses');
      
      const command = new VerifyEmailIdentityCommand({
        EmailAddress: emailAddress
      });
      
      await this.sesClient.send(command);
      console.log(`✅ Verification email sent to: ${emailAddress}`);
      console.log('   Please check the inbox and click the verification link.');
      
    } catch (error) {
      console.error(`❌ Error sending verification email to ${emailAddress}:`, error.message);
    }
  }
}

// Run the checker
async function main() {
  const checker = new SESVerificationChecker();
  await checker.checkVerificationStatus();
  
  // If command line arguments provided, try to verify those emails
  const emailsToVerify = process.argv.slice(2);
  if (emailsToVerify.length > 0) {
    console.log('\n🔄 Attempting to verify provided email addresses...\n');
    for (const email of emailsToVerify) {
      await checker.verifyEmailAddress(email);
    }
  }
}

main().catch(console.error);