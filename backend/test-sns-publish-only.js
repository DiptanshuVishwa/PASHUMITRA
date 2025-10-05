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
    
    console.log('\\n📨 Testing direct message publishing...');
    
    for (const [topicName, topicArn] of Object.entries(topics)) {
      if (topicArn) {
        console.log(`\\n🎯 Testing ${topicName}:`);\n        console.log(`   Topic ARN: ${topicArn}`);\n        \n        try {\n          const publishCommand = new PublishCommand({\n            TopicArn: topicArn,\n            Subject: `🧪 Test: ${topicName} - PashuMitra Portal`,\n            Message: `Test message for ${topicName}\\n\\nTimestamp: ${new Date().toISOString()}\\nTopic: ${topicName}\\n\\nThis is a test to verify SNS publishing works for PashuMitra Portal.`\n          });\n          \n          const result = await snsClient.send(publishCommand);\n          console.log(`   ✅ SUCCESS - Message ID: ${result.MessageId}`);\n        } catch (error) {\n          console.log(`   ❌ FAILED: ${error.message}`);\n          if (error.name === 'AuthorizationErrorException') {\n            console.log(`   🔧 Permission issue: Need SNS:Publish permission`);\n          } else if (error.name === 'NotFound') {\n            console.log(`   🔧 Topic not found: Check if topic exists`);\n          }\n        }\n      } else {\n        console.log(`\\n⚠️  ${topicName}: Not configured in .env`);\n      }\n    }\n    \n    console.log('\\n' + '='.repeat(50));\n    console.log('📊 SNS Topic Configuration Summary:');\n    console.log('\\n🎯 Your SNS Topics:');\n    Object.entries(topics).forEach(([name, arn]) => {\n      if (arn) {\n        const icon = name.includes('Critical') ? '🚨' : \n                    name.includes('Warning') ? '⚠️' : \n                    name.includes('Appointment') ? '📅' : \n                    name.includes('Veterinarian') ? '🩺' : '📢';\n        console.log(`   ${icon} ${name}`);\n        console.log(`      ${arn}`);\n      }\n    });\n    \n  } catch (error) {\n    console.log('\\n❌ Test failed:', error.message);\n  }\n}\n\n// Also provide AWS IAM policy recommendation\nfunction showIAMPolicyRecommendation() {\n  console.log('\\n' + '='.repeat(50));\n  console.log('🔧 REQUIRED AWS IAM PERMISSIONS');\n  console.log('='.repeat(50));\n  \n  console.log('\\nYour current IAM user \"file-upload\" needs these additional permissions:');\n  \n  const policy = {\n    \"Version\": \"2012-10-17\",\n    \"Statement\": [\n      {\n        \"Sid\": \"PashuMitraSNSAccess\",\n        \"Effect\": \"Allow\",\n        \"Action\": [\n          \"sns:Publish\",\n          \"sns:ListTopics\",\n          \"sns:GetTopicAttributes\",\n          \"sns:CreateTopic\",\n          \"sns:Subscribe\",\n          \"sns:Unsubscribe\"\n        ],\n        \"Resource\": [\n          \"arn:aws:sns:ap-south-1:360121241405:PashuMitra-*\"\n        ]\n      },\n      {\n        \"Sid\": \"PashuMitraSESAccess\",\n        \"Effect\": \"Allow\",\n        \"Action\": [\n          \"ses:SendEmail\",\n          \"ses:SendBulkEmail\",\n          \"ses:SendRawEmail\",\n          \"ses:GetSendQuota\",\n          \"ses:GetSendStatistics\"\n        ],\n        \"Resource\": \"*\"\n      },\n      {\n        \"Sid\": \"PashuMitraCloudWatchAccess\",\n        \"Effect\": \"Allow\",\n        \"Action\": [\n          \"cloudwatch:PutMetricData\",\n          \"cloudwatch:GetMetricStatistics\",\n          \"logs:CreateLogGroup\",\n          \"logs:CreateLogStream\",\n          \"logs:PutLogEvents\",\n          \"logs:DescribeLogGroups\",\n          \"logs:DescribeLogStreams\"\n        ],\n        \"Resource\": \"*\"\n      }\n    ]\n  };\n  \n  console.log('\\n📋 Copy this IAM Policy JSON:');\n  console.log('\\n```json');\n  console.log(JSON.stringify(policy, null, 2));\n  console.log('```');\n  \n  console.log('\\n🔧 How to apply these permissions:');\n  console.log('   1. Go to AWS IAM Console');\n  console.log('   2. Find your \"file-upload\" user');\n  console.log('   3. Click \"Add permissions\" → \"Attach existing policies directly\"');\n  console.log('   4. Create a new policy with the JSON above');\n  console.log('   5. Attach the policy to your user');\n  \n  console.log('\\n⚠️  Alternative: Create a new IAM user specifically for PashuMitra Portal');\n  console.log('   with all required permissions from the start.');\n}\n\n// Run the test\ntestSNSPublishOnly().then(() => {\n  showIAMPolicyRecommendation();\n}).catch(console.error);