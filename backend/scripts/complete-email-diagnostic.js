require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function completeEmailDiagnostic() {
    console.log('🔍 COMPLETE EMAIL SYSTEM DIAGNOSTIC\n');
    console.log('='.repeat(60));

    // Step 1: Check .env file exists and content
    console.log('📁 STEP 1: Checking .env file...');
    const envPath = path.join(__dirname, '../.env');
    
    if (!fs.existsSync(envPath)) {
        console.log('❌ .env file does not exist!');
        return;
    } else {
        console.log('✅ .env file exists');
        
        // Read and display relevant env variables (masked for security)
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envLines = envContent.split('\n').filter(line => 
            line.includes('EMAIL_FROM') || 
            line.includes('AWS_REGION') || 
            line.includes('AWS_ACCESS_KEY_ID') ||
            line.includes('AWS_SECRET_ACCESS_KEY')
        );
        
        console.log('📋 Relevant .env variables:');
        envLines.forEach(line => {
            if (line.includes('AWS_SECRET_ACCESS_KEY') || line.includes('AWS_ACCESS_KEY_ID')) {
                const [key, value] = line.split('=');
                console.log(`   ${key}=${value ? '***MASKED***' : 'NOT SET'}`);
            } else {
                console.log(`   ${line}`);
            }
        });
    }

    console.log('\n📋 STEP 2: Environment Variables Check...');
    const envVars = {
        EMAIL_FROM: process.env.EMAIL_FROM,
        AWS_REGION: process.env.AWS_REGION,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        FRONTEND_URL: process.env.FRONTEND_URL
    };

    Object.entries(envVars).forEach(([key, value]) => {
        if (key.includes('SECRET') || key.includes('KEY')) {
            console.log(`${key}: ${value ? '✅ SET (masked)' : '❌ NOT SET'}`);
        } else {
            console.log(`${key}: ${value || '❌ NOT SET'}`);
        }
    });

    if (!envVars.EMAIL_FROM) {
        console.log('\n❌ EMAIL_FROM is not set! This is required.');
        return;
    }

    if (!envVars.AWS_ACCESS_KEY_ID || !envVars.AWS_SECRET_ACCESS_KEY) {
        console.log('\n❌ AWS credentials are not set! These are required.');
        return;
    }

    console.log('\n🔌 STEP 3: Testing AWS SES Connection...');
    
    try {
        const { SESClient, GetSendQuotaCommand, ListVerifiedEmailAddressesCommand } = require('@aws-sdk/client-ses');
        
        const sesClient = new SESClient({
            region: envVars.AWS_REGION || 'ap-south-1',
            credentials: {
                accessKeyId: envVars.AWS_ACCESS_KEY_ID,
                secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
            },
        });

        // Test 1: Get sending quota
        const quotaResult = await sesClient.send(new GetSendQuotaCommand({}));
        console.log('✅ AWS SES Connection: SUCCESS');
        console.log(`   📊 Daily sending quota: ${quotaResult.Max24HourSend}`);
        console.log(`   📈 Emails sent in last 24h: ${quotaResult.SentLast24Hours}`);
        console.log(`   🚀 Sending rate: ${quotaResult.MaxSendRate}/second`);
        
        if (quotaResult.Max24HourSend === 200) {
            console.log('   ⚠️  SANDBOX MODE: Can only send to verified emails');
        }

        // Test 2: Check verified emails
        try {
            const { SESClient, ListIdentitiesCommand } = require('@aws-sdk/client-ses');
            const identitiesResult = await sesClient.send(new ListIdentitiesCommand({}));
            
            console.log(`\n📧 Verified Email Addresses (${identitiesResult.Identities.length}):`);
            identitiesResult.Identities.forEach(email => {
                console.log(`   ${email === envVars.EMAIL_FROM ? '✅' : '📧'} ${email}`);
            });

            if (!identitiesResult.Identities.includes(envVars.EMAIL_FROM)) {
                console.log(`\n❌ CRITICAL: Your EMAIL_FROM (${envVars.EMAIL_FROM}) is NOT verified in AWS SES!`);
                console.log('   This is why emails are not being sent.');
                console.log('   Go to AWS SES Console and verify this email address.');
                return;
            } else {
                console.log(`\n✅ Your EMAIL_FROM (${envVars.EMAIL_FROM}) is verified in AWS SES`);
            }

        } catch (error) {
            console.log('❌ Could not check verified emails:', error.message);
        }

    } catch (error) {
        console.log('❌ AWS SES Connection: FAILED');
        console.log(`   Error: ${error.message}`);
        
        if (error.message.includes('Invalid credentials')) {
            console.log('   💡 Your AWS credentials might be incorrect');
        } else if (error.message.includes('region')) {
            console.log('   💡 Check your AWS region setting');
        }
        return;
    }

    console.log('\n📤 STEP 4: Testing Email Service...');
    
    try {
        const emailService = require('../services/emailService');
        
        // Test simple email
        const testResult = await emailService.sendEmail({
            to: envVars.EMAIL_FROM,
            subject: `🔧 Diagnostic Test - ${new Date().toISOString()}`,
            textContent: `This is a diagnostic test email sent at ${new Date().toLocaleString()}`,
            htmlContent: `
                <div style="padding: 20px; font-family: Arial, sans-serif;">
                    <h2 style="color: #4CAF50;">🔧 Email Diagnostic Test</h2>
                    <p>This email was sent during a diagnostic test.</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>From:</strong> ${envVars.EMAIL_FROM}</p>
                    <p><strong>To:</strong> ${envVars.EMAIL_FROM}</p>
                    <p style="background: #f0f8ff; padding: 10px; border-radius: 5px;">
                        ✅ If you receive this email, your email system is working!
                    </p>
                </div>
            `
        });

        if (testResult.success) {
            console.log('✅ Email Service Test: SUCCESS');
            console.log(`   📨 Message ID: ${testResult.messageId}`);
            console.log(`   ⏰ Timestamp: ${testResult.timestamp}`);
        } else {
            console.log('❌ Email Service Test: FAILED');
            console.log(`   Error: ${testResult.error}`);
        }

        // Test verification email specifically
        console.log('\n📧 Testing Verification Email Template...');
        
        const verifyResult = await emailService.sendEmailVerification(
            { name: 'Test User', email: envVars.EMAIL_FROM }, 
            'diagnostic_token_' + Date.now()
        );

        if (verifyResult.success) {
            console.log('✅ Verification Email Test: SUCCESS');
            console.log(`   📨 Message ID: ${verifyResult.messageId}`);
        } else {
            console.log('❌ Verification Email Test: FAILED');
            console.log(`   Error: ${verifyResult.error}`);
        }

    } catch (error) {
        console.log('❌ Email Service Test: ERROR');
        console.log(`   Error: ${error.message}`);
        console.log(`   Stack: ${error.stack}`);
    }

    console.log('\n🔍 STEP 5: Email Delivery Troubleshooting...');
    
    // Check email provider
    const emailDomain = envVars.EMAIL_FROM.split('@')[1];
    console.log(`📧 Email domain: ${emailDomain}`);
    
    if (emailDomain === 'gmail.com') {
        console.log('⚠️  Gmail often filters AWS SES emails aggressively');
        console.log('   Check: Spam/Junk folder, Promotions tab, All Mail');
    } else if (emailDomain === 'outlook.com' || emailDomain === 'hotmail.com') {
        console.log('✅ Outlook generally has good AWS SES compatibility');
        console.log('   Check: Junk Email folder, Focused/Other inbox tabs');
    }

    console.log('\n📋 STEP 6: Final Recommendations...');
    console.log('1. Check your email inbox thoroughly (all folders)');
    console.log('2. Wait 2-5 minutes for delivery');
    console.log('3. Check spam/junk folders');
    console.log('4. If using Gmail, check Promotions/Social tabs');
    console.log('5. Search your email for "PashuMitra" or "verification"');
    
    console.log('\n🎯 SUMMARY:');
    console.log('If all tests above show SUCCESS, then emails are being sent correctly.');
    console.log('If you still don\'t receive emails, it\'s likely a delivery/filtering issue.');
    
    console.log('\n⏱️  Please wait 2-3 minutes and check ALL your email folders!');
}

completeEmailDiagnostic().catch(console.error);