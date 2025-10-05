require('dotenv').config();
const { SESClient, ListIdentitiesCommand, GetIdentityVerificationAttributesCommand, GetIdentityDkimAttributesCommand, GetIdentityMailFromDomainAttributesCommand, GetIdentityNotificationAttributesCommand } = require('@aws-sdk/client-ses');

async function diagnoseSESIdentity() {
    console.log('🔍 AWS SES IDENTITY DIAGNOSTIC\n');
    console.log('='.repeat(60));

    const sesClient = new SESClient({
        region: process.env.AWS_REGION || 'ap-south-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });

    const emailToCheck = process.env.EMAIL_FROM;
    console.log(`🎯 Checking identity: ${emailToCheck}\n`);

    try {
        // 1. List all identities
        console.log('📋 STEP 1: Listing all verified identities...');
        const identitiesResult = await sesClient.send(new ListIdentitiesCommand({}));
        
        console.log(`Found ${identitiesResult.Identities.length} identities:`);
        identitiesResult.Identities.forEach((identity, index) => {
            console.log(`   ${index + 1}. ${identity}`);
        });

        if (!identitiesResult.Identities.includes(emailToCheck)) {
            console.log(`\n❌ CRITICAL ISSUE: ${emailToCheck} is NOT in the verified identities list!`);
            console.log('\n🔧 TO FIX THIS:');
            console.log('1. Go to AWS SES Console: https://console.aws.amazon.com/ses/');
            console.log(`2. Navigate to region: ${process.env.AWS_REGION || 'ap-south-1'}`);
            console.log('3. Go to "Verified identities" in the left sidebar');
            console.log('4. Click "Create identity"');
            console.log('5. Select "Email address"');
            console.log(`6. Enter: ${emailToCheck}`);
            console.log('7. Click "Create identity"');
            console.log('8. Check your email and click the verification link');
            return;
        }

        // 2. Get detailed verification status
        console.log(`\n🔍 STEP 2: Getting detailed verification status for ${emailToCheck}...`);
        const verificationResult = await sesClient.send(new GetIdentityVerificationAttributesCommand({
            Identities: [emailToCheck]
        }));

        const verificationData = verificationResult.VerificationAttributes[emailToCheck];
        if (verificationData) {
            console.log(`✅ Verification Status: ${verificationData.VerificationStatus}`);
            if (verificationData.VerificationToken) {
                console.log(`🔑 Verification Token: ${verificationData.VerificationToken}`);
            }

            if (verificationData.VerificationStatus !== 'Success') {
                console.log(`\n❌ PROBLEM FOUND: Email verification status is "${verificationData.VerificationStatus}"`);
                console.log('\n🔧 TO FIX THIS:');
                console.log('1. Check your email for verification message from AWS');
                console.log('2. Click the verification link in that email');
                console.log('3. Wait for status to change to "Success"');
                return;
            }
        } else {
            console.log('❌ No verification data found for this identity');
            return;
        }

        // 3. Check DKIM settings
        console.log(`\n🔐 STEP 3: Checking DKIM authentication...`);
        try {
            const dkimResult = await sesClient.send(new GetIdentityDkimAttributesCommand({
                Identities: [emailToCheck]
            }));

            const dkimData = dkimResult.DkimAttributes[emailToCheck];
            if (dkimData) {
                console.log(`DKIM Enabled: ${dkimData.DkimEnabled ? '✅ YES' : '❌ NO'}`);
                console.log(`DKIM Verification Status: ${dkimData.DkimVerificationStatus || 'Not set'}`);
                
                if (dkimData.DkimTokens && dkimData.DkimTokens.length > 0) {
                    console.log('DKIM Tokens:');
                    dkimData.DkimTokens.forEach((token, index) => {
                        console.log(`   ${index + 1}. ${token}`);
                    });
                }
            }
        } catch (error) {
            console.log('⚠️ Could not check DKIM settings:', error.message);
        }

        // 4. Check Mail-From domain settings
        console.log(`\n📬 STEP 4: Checking Mail-From domain settings...`);
        try {
            const mailFromResult = await sesClient.send(new GetIdentityMailFromDomainAttributesCommand({
                Identities: [emailToCheck]
            }));

            const mailFromData = mailFromResult.MailFromDomainAttributes[emailToCheck];
            if (mailFromData && mailFromData.MailFromDomain) {
                console.log(`Mail-From Domain: ${mailFromData.MailFromDomain}`);
                console.log(`Mail-From Domain Status: ${mailFromData.MailFromDomainStatus}`);
                console.log(`Behavior on MX Failure: ${mailFromData.BehaviorOnMXFailure}`);
            } else {
                console.log('✅ Using default Mail-From domain (amazonses.com)');
            }
        } catch (error) {
            console.log('⚠️ Could not check Mail-From settings:', error.message);
        }

        // 5. Check notification settings
        console.log(`\n🔔 STEP 5: Checking notification settings...`);
        try {
            const notificationResult = await sesClient.send(new GetIdentityNotificationAttributesCommand({
                Identities: [emailToCheck]
            }));

            const notificationData = notificationResult.NotificationAttributes[emailToCheck];
            if (notificationData) {
                console.log('Notification Settings:');
                console.log(`   Bounce Topic: ${notificationData.BounceTopic || 'Not set'}`);
                console.log(`   Complaint Topic: ${notificationData.ComplaintTopic || 'Not set'}`);
                console.log(`   Delivery Topic: ${notificationData.DeliveryTopic || 'Not set'}`);
                console.log(`   Forwarding Enabled: ${notificationData.ForwardingEnabled ? 'YES' : 'NO'}`);
                console.log(`   Headers in Bounce: ${notificationData.HeadersInBounceNotificationsEnabled ? 'YES' : 'NO'}`);
                console.log(`   Headers in Complaint: ${notificationData.HeadersInComplaintNotificationsEnabled ? 'YES' : 'NO'}`);
                console.log(`   Headers in Delivery: ${notificationData.HeadersInDeliveryNotificationsEnabled ? 'YES' : 'NO'}`);
            }
        } catch (error) {
            console.log('⚠️ Could not check notification settings:', error.message);
        }

        console.log(`\n🎯 STEP 6: Domain analysis...`);
        const domain = emailToCheck.split('@')[1];
        console.log(`Email domain: ${domain}`);
        
        if (domain === 'outlook.com' || domain === 'hotmail.com' || domain === 'live.com') {
            console.log('📧 Microsoft email domain detected');
            console.log('💡 Common issues with Microsoft domains:');
            console.log('   - Aggressive spam filtering');
            console.log('   - May require additional domain verification');
            console.log('   - Check Junk Email folder thoroughly');
            console.log('   - Consider adding AWS SES domains to safe senders');
        }

        console.log(`\n📋 STEP 7: Troubleshooting recommendations...`);
        console.log('If all verification checks pass but emails still don\'t arrive:');
        console.log('');
        console.log('1. 📧 EMAIL CLIENT ISSUES:');
        console.log('   - Check ALL folders (Inbox, Junk, Spam, Clutter, Deleted)');
        console.log('   - Try both web and mobile versions of Outlook');
        console.log('   - Check if any email rules are filtering messages');
        console.log('');
        console.log('2. 🛡️ SPAM FILTERING:');
        console.log('   - Add *.amazonses.com to safe senders');
        console.log('   - Add your own email to safe senders');
        console.log('   - Disable aggressive spam filtering temporarily');
        console.log('');
        console.log('3. 🔄 AWS SES ISSUES:');
        console.log('   - Try sending from AWS Console again');
        console.log('   - Wait 10-15 minutes for delivery');
        console.log('   - Check AWS SES sending statistics for bounces');
        console.log('');
        console.log('4. 🆔 IDENTITY ISSUES:');
        console.log('   - Re-verify your email address');
        console.log('   - Try verifying a different email address');
        console.log('   - Check if your domain needs additional verification');

        console.log(`\n✅ IDENTITY DIAGNOSTIC COMPLETE`);

    } catch (error) {
        console.log(`❌ Error during diagnostic: ${error.message}`);
        console.log(`Stack: ${error.stack}`);
    }
}

diagnoseSESIdentity().catch(console.error);