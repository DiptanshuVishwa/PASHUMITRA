const { SESClient, GetSendQuotaCommand, GetSendStatisticsCommand, ListIdentitiesCommand, GetIdentityVerificationAttributesCommand } = require('@aws-sdk/client-ses');
const emailService = require('../services/emailService');

async function diagnoseEmailIssues() {
    console.log('🔍 DIAGNOSING EMAIL CONFIGURATION...\n');
    
    // Check environment variables
    console.log('📋 ENVIRONMENT CONFIGURATION:');
    console.log(`- AWS_REGION: ${process.env.AWS_REGION || 'NOT SET'}`);
    console.log(`- AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? 'SET ✅' : 'NOT SET ❌'}`);
    console.log(`- AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? 'SET ✅' : 'NOT SET ❌'}`);
    console.log(`- EMAIL_FROM: ${process.env.EMAIL_FROM || 'NOT SET'}`);
    console.log(`- EMAIL_FROM_NAME: ${process.env.EMAIL_FROM_NAME || 'NOT SET'}\n`);
    
    try {
        const sesClient = new SESClient({
            region: process.env.AWS_REGION || 'ap-south-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });

        // 1. Check SES quota and statistics
        console.log('📊 AWS SES QUOTA & STATISTICS:');
        try {
            const quotaResult = await sesClient.send(new GetSendQuotaCommand({}));
            console.log(`- Max 24-Hour Send: ${quotaResult.Max24HourSend}`);
            console.log(`- Max Send Rate: ${quotaResult.MaxSendRate} emails/second`);
            console.log(`- Sent Last 24 Hours: ${quotaResult.SentLast24Hours}`);
            
            // Check if in sandbox mode
            if (quotaResult.Max24HourSend === 200 && quotaResult.MaxSendRate === 1) {
                console.log('⚠️  WARNING: AWS SES is in SANDBOX MODE!');
                console.log('   You can only send to verified email addresses.');
                console.log('   To send to any email, you need to request production access.');
            } else {
                console.log('✅ AWS SES is in PRODUCTION MODE');
            }
        } catch (error) {
            console.log(`❌ Error checking SES quota: ${error.message}`);
        }
        console.log('');

        // 2. Check verified identities
        console.log('📧 VERIFIED EMAIL IDENTITIES:');
        try {
            const identitiesResult = await sesClient.send(new ListIdentitiesCommand({}));
            console.log(`- Total verified identities: ${identitiesResult.Identities.length}`);
            
            if (identitiesResult.Identities.length === 0) {
                console.log('❌ NO VERIFIED EMAIL IDENTITIES FOUND!');
                console.log('   You need to verify your sender email address in AWS SES.');
            } else {
                console.log('✅ Verified identities:');
                identitiesResult.Identities.forEach(identity => {
                    console.log(`   - ${identity}`);
                });
                
                // Check if our sender email is verified
                const senderEmail = process.env.EMAIL_FROM;
                const isVerified = identitiesResult.Identities.includes(senderEmail);
                console.log(`\n📨 Sender email (${senderEmail}): ${isVerified ? '✅ VERIFIED' : '❌ NOT VERIFIED'}`);
                
                if (!isVerified) {
                    console.log('⚠️  WARNING: Your sender email is not verified in AWS SES!');
                    console.log('   This is likely why emails are not being sent.');
                }
            }

            // Get detailed verification status
            if (identitiesResult.Identities.length > 0) {
                const verificationResult = await sesClient.send(new GetIdentityVerificationAttributesCommand({
                    Identities: identitiesResult.Identities
                }));
                
                console.log('\n🔍 DETAILED VERIFICATION STATUS:');
                Object.entries(verificationResult.VerificationAttributes).forEach(([identity, attributes]) => {
                    console.log(`- ${identity}:`);
                    console.log(`  Status: ${attributes.VerificationStatus}`);
                    if (attributes.VerificationToken) {
                        console.log(`  Token: ${attributes.VerificationToken}`);
                    }
                });
            }
        } catch (error) {
            console.log(`❌ Error checking identities: ${error.message}`);
        }
        console.log('');

        // 3. Test email sending
        console.log('📤 TESTING EMAIL SENDING:');
        try {
            const testResult = await emailService.sendEmail({
                to: process.env.EMAIL_FROM, // Send to the same address that should be verified
                subject: 'AWS SES Diagnostic Test',
                htmlContent: `
                    <h2>🔧 AWS SES Diagnostic Test</h2>
                    <p>This is a test email sent at ${new Date().toLocaleString()} to verify your AWS SES configuration.</p>
                    <p>If you received this email, AWS SES is working correctly!</p>
                `,
                textContent: `AWS SES Diagnostic Test\n\nThis is a test email sent at ${new Date().toLocaleString()} to verify your AWS SES configuration.\n\nIf you received this email, AWS SES is working correctly!`
            });

            if (testResult.success) {
                console.log('✅ Test email sent successfully!');
                console.log(`   Message ID: ${testResult.messageId}`);
                console.log(`   Check ${process.env.EMAIL_FROM} for the test email.`);
            } else {
                console.log('❌ Test email failed:');
                console.log(`   Error: ${testResult.error}`);
            }
        } catch (error) {
            console.log(`❌ Error sending test email: ${error.message}`);
        }

    } catch (error) {
        console.log(`❌ Failed to connect to AWS SES: ${error.message}`);
        console.log('Check your AWS credentials and region configuration.');
    }

    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Verify your sender email address in AWS SES Console');
    console.log('2. If in sandbox mode, request production access or verify recipient email');
    console.log('3. Check spam/junk folder in your email client');
    console.log('4. Verify AWS credentials have SES permissions');
    console.log('5. Check AWS CloudWatch logs for detailed error messages');
}

// Run diagnostics
diagnoseEmailIssues().catch(console.error);