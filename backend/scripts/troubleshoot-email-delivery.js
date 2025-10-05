const { SESClient, GetSendStatisticsCommand, GetAccountSendingEnabledCommand } = require('@aws-sdk/client-ses');
const emailService = require('../services/emailService');
require('dotenv').config();

async function troubleshootEmailDelivery() {
    console.log('🔍 ADVANCED EMAIL DELIVERY TROUBLESHOOTING\n');
    
    try {
        const sesClient = new SESClient({
            region: process.env.AWS_REGION || 'ap-south-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });

        // Check sending statistics
        console.log('📊 AWS SES DELIVERY STATISTICS:');
        try {
            const statsResult = await sesClient.send(new GetSendStatisticsCommand({}));
            
            if (statsResult.SendDataPoints && statsResult.SendDataPoints.length > 0) {
                const recentStats = statsResult.SendDataPoints.slice(-3); // Last 3 data points
                
                recentStats.forEach((point, index) => {
                    console.log(`\n📈 Data Point ${index + 1}:`);
                    console.log(`   Timestamp: ${point.Timestamp}`);
                    console.log(`   Delivery Attempts: ${point.DeliveryAttempts}`);
                    console.log(`   Bounces: ${point.Bounces}`);
                    console.log(`   Complaints: ${point.Complaints}`);
                    console.log(`   Rejects: ${point.Rejects}`);
                    
                    // Calculate delivery rate
                    const successRate = ((point.DeliveryAttempts - point.Bounces - point.Complaints - point.Rejects) / point.DeliveryAttempts * 100).toFixed(2);
                    console.log(`   Success Rate: ${successRate}%`);
                    
                    if (point.Bounces > 0) {
                        console.log('   ⚠️ BOUNCES detected - emails are being rejected by recipient server');
                    }
                    if (point.Complaints > 0) {
                        console.log('   ⚠️ COMPLAINTS detected - emails marked as spam');
                    }
                    if (point.Rejects > 0) {
                        console.log('   ⚠️ REJECTS detected - emails rejected by Amazon SES');
                    }
                });
            } else {
                console.log('No recent sending statistics available');
            }
        } catch (error) {
            console.log(`❌ Error getting statistics: ${error.message}`);
        }

        console.log('\n🎯 COMMON GMAIL + AWS SES ISSUES:\n');
        
        console.log('1. 📁 Gmail Filtering Issues:');
        console.log('   - Gmail may silently filter AWS SES emails');
        console.log('   - Check: Gmail Settings > Filters and Blocked Addresses');
        console.log('   - Check: Gmail Settings > Forwarding and POP/IMAP');
        console.log('   - Search in Gmail: "from:team.pashumitra@gmail.com"');
        
        console.log('\n2. 🏷️ Gmail Labels/Categories:');
        console.log('   - Check: Promotions tab');
        console.log('   - Check: Social tab');
        console.log('   - Check: Updates tab');
        console.log('   - Check: All Mail folder');
        
        console.log('\n3. 🚫 Gmail Spam Detection:');
        console.log('   - AWS SES sender reputation may be flagged');
        console.log('   - Gmail may silently drop emails without moving to spam');
        console.log('   - Self-sending (same sender/recipient) often triggers filters');
        
        console.log('\n4. 📧 SPF/DKIM/DMARC Issues:');
        console.log('   - Gmail.com domain has strict email policies');
        console.log('   - AWS SES may not align with Gmail.com authentication');

        // Send a test with different content to avoid spam filters
        console.log('\n📤 SENDING SIMPLE TEST EMAIL:');
        try {
            const simpleTestResult = await emailService.sendEmail({
                to: process.env.EMAIL_FROM,
                subject: 'Simple Test - ' + new Date().toISOString(),
                textContent: 'This is a simple plain text test email sent at ' + new Date().toLocaleString(),
                htmlContent: `
                    <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 20px; padding: 20px; border: 1px solid #ccc;">
                        <h3>Simple Test Email</h3>
                        <p>Sent at: ${new Date().toLocaleString()}</p>
                        <p>From: AWS SES</p>
                        <p>To: ${process.env.EMAIL_FROM}</p>
                        <p>If you receive this, AWS SES is working.</p>
                    </div>
                `
            });

            if (simpleTestResult.success) {
                console.log('✅ Simple test email sent successfully!');
                console.log(`   Message ID: ${simpleTestResult.messageId}`);
                console.log('   Wait 2-3 minutes, then check all Gmail folders');
            } else {
                console.log('❌ Simple test failed:', simpleTestResult.error);
            }
        } catch (error) {
            console.log('❌ Simple test error:', error.message);
        }

        console.log('\n🔧 IMMEDIATE SOLUTIONS:\n');
        
        console.log('Option 1: Use Gmail SMTP Instead');
        console.log('- More reliable for Gmail recipients');
        console.log('- Requires Gmail App Password setup');
        console.log('- Will definitely work with Gmail');
        
        console.log('\nOption 2: Use Different Email Provider');
        console.log('- SendGrid, Mailgun, or similar');
        console.log('- Better deliverability to Gmail');
        
        console.log('\nOption 3: Alternative Testing Method');
        console.log('- Use a different email provider for testing');
        console.log('- Yahoo, Outlook, or custom domain email');
        
        console.log('\n💡 DEBUGGING STEPS:');
        console.log('1. Check Gmail search: from:noreply@amazonaws.com');
        console.log('2. Check Gmail search: "AWS" OR "SES" OR "Amazon"');
        console.log('3. Log into Gmail web interface (not mobile app)');
        console.log('4. Check Gmail Settings > Filters');
        console.log('5. Try sending to a different email address');

    } catch (error) {
        console.log(`❌ Error in troubleshooting: ${error.message}`);
    }
}

troubleshootEmailDelivery().catch(console.error);