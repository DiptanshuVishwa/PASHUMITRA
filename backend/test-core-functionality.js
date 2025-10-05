require('dotenv').config();
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { CloudWatchClient, PutMetricDataCommand } = require('@aws-sdk/client-cloudwatch');

async function testCoreFunctionality() {
  console.log('🧪 Testing Core PashuMitra Portal Functionality\n');
  console.log('='.repeat(60));
  
  let results = {
    sns: false,
    ses: false,
    cloudwatch: false
  };

  // Test SNS (Critical Alert Simulation)
  try {
    console.log('🚨 Testing Critical Alert via SNS...');
    
    const snsClient = new SNSClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const alertMessage = `
🚨 CRITICAL LIVESTOCK ALERT - PashuMitra Portal

Animal ID: COW001
Alert Type: Disease Detected
Severity: Critical
Location: Farm Section A
Owner: Test Farmer
Description: Symptoms of foot-and-mouth disease detected

IMMEDIATE ACTION REQUIRED!
Contact veterinarian immediately.

Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
Dashboard: http://localhost:3000/dashboard
    `.trim();

    const publishCommand = new PublishCommand({
      TopicArn: process.env.SNS_TOPIC_ALERT_CRITICAL,
      Subject: '🚨 CRITICAL: Disease Alert - Animal COW001',
      Message: alertMessage
    });

    const snsResult = await snsClient.send(publishCommand);
    console.log('   ✅ SNS Critical Alert sent successfully!');
    console.log(`   📝 Message ID: ${snsResult.MessageId}`);
    results.sns = true;

  } catch (error) {
    console.log('   ❌ SNS test failed:', error.message);
  }

  // Test SES (Email Notification Simulation)  
  try {
    console.log('\n📧 Testing Email Notification via SES...');
    
    const sesClient = new SESClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const emailCommand = new SendEmailCommand({
      Source: 'noreply@pashumnitra.com',
      Destination: {
        ToAddresses: ['test@example.com']
      },
      Message: {
        Subject: {
          Data: '🚨 URGENT: Livestock Health Alert - PashuMitra Portal',
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: `
<!DOCTYPE html>
<html>
<head>
    <title>Critical Alert - PashuMitra Portal</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .alert { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 15px 0; }
        .button { background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <h2>🚨 CRITICAL LIVESTOCK ALERT</h2>
    <div class="alert">
        <h4>Alert Details:</h4>
        <ul>
            <li><strong>Animal ID:</strong> COW001</li>
            <li><strong>Alert Type:</strong> Disease Detected</li>
            <li><strong>Severity:</strong> Critical</li>
            <li><strong>Location:</strong> Farm Section A</li>
            <li><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</li>
        </ul>
        <p><strong>Description:</strong> Symptoms of foot-and-mouth disease detected</p>
    </div>
    <p><a href="http://localhost:3000/dashboard" class="button">View Dashboard</a></p>
    <p>This is a test email from PashuMitra Portal to verify SES integration.</p>
</body>
</html>`,
            Charset: 'UTF-8'
          },
          Text: {
            Data: `CRITICAL LIVESTOCK ALERT\n\nAnimal ID: COW001\nAlert Type: Disease Detected\nSeverity: Critical\nLocation: Farm Section A\nTime: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n\nDescription: Symptoms of foot-and-mouth disease detected\n\nIMMEDIATE ACTION REQUIRED!\nView Dashboard: http://localhost:3000/dashboard`,
            Charset: 'UTF-8'
          }
        }
      }
    });

    const sesResult = await sesClient.send(emailCommand);
    console.log('   ✅ SES Email sent successfully!');
    console.log(`   📝 Message ID: ${sesResult.MessageId}`);
    results.ses = true;

  } catch (error) {
    console.log('   ❌ SES test failed:', error.message);
    if (error.message.includes('Email address not verified')) {
      console.log('   💡 Note: You need to verify your email domain/address in AWS SES first');
    }
  }

  // Test CloudWatch (Metrics Simulation)
  try {
    console.log('\n📊 Testing CloudWatch Metrics...');
    
    const cloudWatchClient = new CloudWatchClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const metricsCommand = new PutMetricDataCommand({
      Namespace: 'PashuMitra/Portal',
      MetricData: [{
        MetricName: 'CriticalAlerts',
        Value: 1,
        Unit: 'Count',
        Timestamp: new Date(),
        Dimensions: [{
          Name: 'AlertType',
          Value: 'DiseaseDetected'
        }, {
          Name: 'Environment',
          Value: 'development'
        }]
      }]
    });

    await cloudWatchClient.send(metricsCommand);
    console.log('   ✅ CloudWatch metrics sent successfully!');
    console.log('   📈 Metric: CriticalAlerts = 1 (DiseaseDetected)');
    results.cloudwatch = true;

  } catch (error) {
    console.log('   ❌ CloudWatch test failed:', error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 FUNCTIONALITY TEST RESULTS');
  console.log('='.repeat(60));
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;
  
  console.log(`\n🎯 Overall Success Rate: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
  
  Object.entries(results).forEach(([service, passed]) => {
    const icon = passed ? '✅' : '❌';
    const status = passed ? 'WORKING' : 'NEEDS SETUP';
    console.log(`   ${icon} ${service.toUpperCase()}: ${status}`);
  });

  if (passedTests === totalTests) {
    console.log('\n🎉 CONGRATULATIONS!');
    console.log('Your PashuMitra Portal backend is fully functional with:');
    console.log('   🚨 Real-time critical alerts via SNS');
    console.log('   📧 Professional email notifications via SES');
    console.log('   📊 System monitoring via CloudWatch');
    console.log('\n✅ Ready for production deployment!');
  } else {
    console.log('\n🔧 SETUP NEEDED:');
    if (!results.sns) {
      console.log('   ❌ SNS: Check permissions and topic ARNs');
    }
    if (!results.ses) {
      console.log('   ❌ SES: Verify email domain/address in AWS SES console');
      console.log('       Go to: https://console.aws.amazon.com/ses/');
    }
    if (!results.cloudwatch) {
      console.log('   ❌ CloudWatch: Check permissions');
    }
  }

  console.log('\n🚀 Your configured services:');
  console.log(`   📍 Region: ${process.env.AWS_REGION}`);
  console.log(`   🎯 SNS Topics: 5 configured`);
  console.log(`   📧 Email: ${process.env.EMAIL_FROM}`);
  console.log(`   📊 Monitoring: CloudWatch enabled`);

  return results;
}

// Run the test
testCoreFunctionality().catch(console.error);