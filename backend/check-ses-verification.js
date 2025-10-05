require('dotenv').config();
const { SESClient, ListVerifiedEmailAddressesCommand, ListIdentitiesCommand } = require('@aws-sdk/client-ses');

async function checkSESVerification() {
  console.log('🔍 Checking AWS SES Email Verification Status\n');
  console.log('='.repeat(60));
  
  console.log('📧 Email Configuration:');
  console.log(`   Target Email: ${process.env.EMAIL_FROM}`);
  console.log(`   AWS Region: ${process.env.AWS_REGION}`);
  
  try {
    const sesClient = new SESClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    console.log('\n🔍 Checking verified email addresses...');
    
    // Check verified email addresses (legacy method)
    try {
      const verifiedEmailsCommand = new ListVerifiedEmailAddressesCommand({});
      const verifiedEmailsResult = await sesClient.send(verifiedEmailsCommand);
      
      console.log('\n📋 Legacy Verified Email Addresses:');
      if (verifiedEmailsResult.VerifiedEmailAddresses.length === 0) {
        console.log('   ❌ No verified email addresses found');
      } else {
        verifiedEmailsResult.VerifiedEmailAddresses.forEach(email => {
          const isOurEmail = email === process.env.EMAIL_FROM;
          console.log(`   ${isOurEmail ? '✅' : '📧'} ${email}${isOurEmail ? ' (CONFIGURED)' : ''}`);
        });
      }
    } catch (error) {
      console.log('   ⚠️  Could not retrieve legacy verified emails');
    }

    // Check all identities (modern method)
    try {
      const identitiesCommand = new ListIdentitiesCommand({});
      const identitiesResult = await sesClient.send(identitiesCommand);
      
      console.log('\n📋 All Verified Identities:');
      if (identitiesResult.Identities.length === 0) {
        console.log('   ❌ No verified identities found');
      } else {
        identitiesResult.Identities.forEach(identity => {
          const isOurEmail = identity === process.env.EMAIL_FROM;
          console.log(`   ${isOurEmail ? '✅' : '📧'} ${identity}${isOurEmail ? ' (CONFIGURED)' : ''}`);
        });
      }

      // Check if our email is verified
      const isEmailVerified = identitiesResult.Identities.includes(process.env.EMAIL_FROM);
      
      console.log('\n' + '='.repeat(60));
      
      if (isEmailVerified) {
        console.log('✅ SUCCESS: Your email is verified in AWS SES!');
        console.log('\n🤔 If you\'re not receiving emails, check:');
        console.log('   1. Gmail spam/junk folder');
        console.log('   2. Gmail promotions tab');
        console.log('   3. Email filters blocking the messages');
        console.log('   4. Try sending to a different email address for testing');
      } else {
        console.log('❌ EMAIL NOT VERIFIED: Your email needs to be verified in AWS SES');
        console.log('\n🔧 TO FIX THIS:');
        console.log('   1. Go to AWS SES Console: https://console.aws.amazon.com/ses/');
        console.log('   2. Navigate to "Verified identities"');
        console.log('   3. Click "Create identity"');
        console.log('   4. Select "Email address"');
        console.log(`   5. Enter: ${process.env.EMAIL_FROM}`);
        console.log('   6. Click "Create identity"');
        console.log(`   7. Check the Gmail inbox for ${process.env.EMAIL_FROM}`);
        console.log('   8. Click the verification link in the email');
        console.log('   9. Run this script again to verify: node check-ses-verification.js');
        console.log('\n⏱️  Estimated time: 2-3 minutes');
        console.log('\n💡 Note: AWS SES requires email verification for security.');
        console.log('   This prevents spam and ensures you own the email address.');
      }

    } catch (error) {
      console.log('   ⚠️  Could not retrieve identities:', error.message);
    }

  } catch (error) {
    console.log('❌ Failed to connect to AWS SES:', error.message);
    
    console.log('\n🔧 Debug Info:');
    console.log(`   Error Type: ${error.name}`);
    console.log(`   Error Code: ${error.code || 'N/A'}`);
    
    if (error.message.includes('credentials')) {
      console.log('\n🔑 Credentials Issue:');
      console.log('   Check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env');
    }
  }
}

// Run the check
checkSESVerification().catch(console.error);