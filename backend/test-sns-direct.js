require('dotenv').config();
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

async function testSNSPublishOnly() {
  console.log('🧪 SNS Direct Publish Test\n');
  console.log('='.repeat(50));
  
  try {
    console.log('🔧 AWS Configuration:');
    console.log(`   Region: ${process.env.AWS_REGION}`);
    console.log(`   Access Key: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing'}`);
    
    const snsClient = new SNSClient({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    
    // Test publishing to each configured topic
    const topics = {
      'Critical Alerts': process.env.SNS_TOPIC_ALERT_CRITICAL,
      'Warning Alerts': process.env.SNS_TOPIC_ALERT_WARNING,
      'Appointment Reminders': process.env.SNS_TOPIC_APPOINTMENT,
      'Veterinarian Notifications': process.env.SNS_TOPIC_VETERINARIAN,
      'General Notifications': process.env.SNS_TOPIC_GENERAL
    };
    
    console.log('\n📨 Testing direct message publishing...');
    
    for (const [topicName, topicArn] of Object.entries(topics)) {
      if (topicArn) {
        console.log(`\n🎯 Testing ${topicName}:`);
        console.log(`   Topic ARN: ${topicArn}`);
        
        try {
          const publishCommand = new PublishCommand({
            TopicArn: topicArn,
            Subject: `🧪 Test: ${topicName} - PashuMitra Portal`,
            Message: `Test message for ${topicName}\n\nTimestamp: ${new Date().toISOString()}\nTopic: ${topicName}\n\nThis is a test to verify SNS publishing works for PashuMitra Portal.`
          });
          
          const result = await snsClient.send(publishCommand);
          console.log(`   ✅ SUCCESS - Message ID: ${result.MessageId}`);
        } catch (error) {
          console.log(`   ❌ FAILED: ${error.message}`);
          if (error.name === 'AuthorizationErrorException') {
            console.log(`   🔧 Permission issue: Need SNS:Publish permission`);
          } else if (error.name === 'NotFound') {
            console.log(`   🔧 Topic not found: Check if topic exists`);
          }
        }
      } else {
        console.log(`\n⚠️  ${topicName}: Not configured in .env`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 SNS Topic Configuration Summary:');
    console.log('\n🎯 Your SNS Topics:');
    Object.entries(topics).forEach(([name, arn]) => {
      if (arn) {
        const icon = name.includes('Critical') ? '🚨' : 
                    name.includes('Warning') ? '⚠️' : 
                    name.includes('Appointment') ? '📅' : 
                    name.includes('Veterinarian') ? '🩺' : '📢';
        console.log(`   ${icon} ${name}`);
        console.log(`      ${arn}`);
      }
    });
    
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
  }
}

// Show IAM policy recommendation
function showIAMPolicyRecommendation() {
  console.log('\n' + '='.repeat(50));
  console.log('🔧 REQUIRED AWS IAM PERMISSIONS');
  console.log('='.repeat(50));
  
  console.log('\nYour current IAM user "file-upload" needs these additional permissions:');
  
  console.log('\n📋 Required IAM Policy JSON:');
  console.log('\n```json');
  console.log(`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PashuMitraSNSAccess",
      "Effect": "Allow",
      "Action": [
        "sns:Publish",
        "sns:ListTopics",
        "sns:GetTopicAttributes",
        "sns:CreateTopic",
        "sns:Subscribe",
        "sns:Unsubscribe"
      ],
      "Resource": [
        "arn:aws:sns:ap-south-1:360121241405:PashuMitra-*"
      ]
    },
    {
      "Sid": "PashuMitraSESAccess",
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendBulkEmail",
        "ses:SendRawEmail",
        "ses:GetSendQuota",
        "ses:GetSendStatistics"
      ],
      "Resource": "*"
    },
    {
      "Sid": "PashuMitraCloudWatchAccess",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutMetricData",
        "cloudwatch:GetMetricStatistics",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams"
      ],
      "Resource": "*"
    }
  ]
}`);
  console.log('```');
  
  console.log('\n🔧 How to apply these permissions:');
  console.log('   1. Go to AWS IAM Console');
  console.log('   2. Find your "file-upload" user');
  console.log('   3. Click "Add permissions" → "Create inline policy"');
  console.log('   4. Switch to "JSON" tab and paste the policy above');
  console.log('   5. Name the policy "PashuMitra-Services-Policy"');
  console.log('   6. Click "Create policy"');
  
  console.log('\n✅ Alternative: Update your existing policy to include these permissions');
  console.log('⚠️  Note: Your current user only has S3 permissions, needs SNS/SES/CloudWatch');
}

// Run the test
testSNSPublishOnly().then(() => {
  showIAMPolicyRecommendation();
}).catch(console.error);