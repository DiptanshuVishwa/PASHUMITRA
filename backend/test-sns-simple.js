require('dotenv').config();
const { SNSClient, ListTopicsCommand, PublishCommand } = require('@aws-sdk/client-sns');

async function testSimpleSNS() {
  console.log('🧪 Simple AWS SNS Test\n');
  console.log('='.repeat(40));
  
  try {
    console.log('🔧 Testing AWS credentials...');
    console.log(`   Access Key ID: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`   Secret Key: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`   Region: ${process.env.AWS_REGION || 'Not set'}`);
    
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials are missing from .env file');
    }
    
    const snsClient = new SNSClient({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    
    console.log('\n🔍 Testing SNS connection...');
    const listCommand = new ListTopicsCommand({});
    const response = await snsClient.send(listCommand);
    
    console.log('✅ SNS connection successful!');
    console.log(`📊 Total topics found: ${response.Topics ? response.Topics.length : 0}`);
    
    if (response.Topics && response.Topics.length > 0) {
      console.log('\n📋 Available topics:');
      response.Topics.forEach((topic, index) => {
        const topicName = topic.TopicArn.split(':').pop();
        console.log(`   ${index + 1}. ${topicName}`);
        console.log(`      ARN: ${topic.TopicArn}`);
      });
    }
    
    // Test publishing to critical alerts topic
    const criticalTopicArn = process.env.SNS_TOPIC_ALERT_CRITICAL;
    if (criticalTopicArn) {
      console.log('\n📨 Testing message publishing...');
      console.log(`   Target topic: ${criticalTopicArn}`);
      
      try {
        const publishCommand = new PublishCommand({
          TopicArn: criticalTopicArn,
          Subject: '🧪 Test Notification - PashuMitra Portal',
          Message: `Test notification sent at ${new Date().toISOString()}\n\nThis is a test message to verify SNS integration for PashuMitra Portal.\n\nIf you receive this, your SNS setup is working correctly!`
        });
        
        const publishResult = await snsClient.send(publishCommand);
        console.log('✅ Test message published successfully!');
        console.log(`   Message ID: ${publishResult.MessageId}`);
        
        console.log('\n🎯 Configured SNS Topics:');
        console.log(`   🚨 Critical: ${process.env.SNS_TOPIC_ALERT_CRITICAL}`);
        console.log(`   ⚠️  Warning: ${process.env.SNS_TOPIC_ALERT_WARNING}`);
        console.log(`   📅 Appointment: ${process.env.SNS_TOPIC_APPOINTMENT}`);
        console.log(`   🩺 Veterinarian: ${process.env.SNS_TOPIC_VETERINARIAN}`);
        console.log(`   📢 General: ${process.env.SNS_TOPIC_GENERAL}`);
        
      } catch (publishError) {
        console.log('❌ Failed to publish test message:', publishError.message);
        if (publishError.name === 'NotFound') {
          console.log('   The topic ARN might not exist or be accessible');
        }
      }
    } else {
      console.log('\n⚠️  SNS_TOPIC_ALERT_CRITICAL not configured in .env');
    }
    
    console.log('\n' + '='.repeat(40));
    console.log('✅ Simple SNS test completed successfully!');
    
  } catch (error) {
    console.log('\n❌ SNS test failed:', error.message);
    
    if (error.name === 'CredentialsProviderError') {
      console.log('\n🔧 Credential issues detected:');
      console.log('   • Check that AWS_ACCESS_KEY_ID is correct');
      console.log('   • Check that AWS_SECRET_ACCESS_KEY is correct');
      console.log('   • Ensure the credentials have SNS permissions');
    } else if (error.name === 'UnknownEndpoint') {
      console.log('\n🔧 Region issues detected:');
      console.log('   • Check that AWS_REGION is correct');
      console.log('   • Ensure the region supports SNS');
    } else {
      console.log('\n🔧 Debugging info:');
      console.log(`   Error type: ${error.name}`);
      console.log(`   Error code: ${error.code || 'N/A'}`);
    }
  }
}

// Run the test
testSimpleSNS().catch(console.error);