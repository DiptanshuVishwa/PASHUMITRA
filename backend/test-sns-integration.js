const serviceManager = require('./services');
const logger = require('./utils/logger');

async function testSNSIntegration() {
  console.log('🧪 Testing AWS SNS Integration with Updated Topic ARNs\n');
  console.log('='.repeat(60));

  try {
    // Initialize services
    console.log('🔧 Initializing services...');
    await serviceManager.initializeServices();
    
    // Test SNS connectivity
    console.log('\n🔍 Testing SNS connectivity...');
    const notificationService = serviceManager.getService('notification');
    
    // Get topic statistics
    const stats = await notificationService.getTopicStatistics();
    console.log('✅ SNS connection successful!');
    console.log(`📊 Total topics available: ${stats.totalTopics}`);
    console.log(`🎯 Configured topics: ${stats.configuredTopics}`);
    
    // Test sending a critical alert notification
    console.log('\n📨 Testing critical alert notification...');
    
    const testAlertData = {
      animalId: 'TEST001',
      alertType: 'System Test',
      severity: 'Critical',
      description: 'This is a test notification to verify SNS integration',
      location: 'Test Farm',
      ownerName: 'Test Owner'
    };
    
    const alertResult = await notificationService.sendCriticalAlert(testAlertData);
    
    if (alertResult.success) {
      console.log('✅ Critical alert notification sent successfully!');
      console.log(`📝 Message ID: ${alertResult.messageId}`);
      console.log(`🎯 Topic: ${alertResult.topic}`);
    } else {
      console.log('❌ Critical alert notification failed:', alertResult.error);
    }
    
    // Test sending appointment reminder
    console.log('\n📅 Testing appointment reminder notification...');
    
    const testAppointmentData = {
      appointmentId: 'APPT001',
      veterinarianName: 'Dr. Test Vet',
      animalId: 'TEST001',
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      location: 'Test Clinic',
      ownerName: 'Test Owner'
    };
    
    const appointmentResult = await notificationService.sendAppointmentReminder(testAppointmentData);
    
    if (appointmentResult.success) {
      console.log('✅ Appointment reminder sent successfully!');
      console.log(`📝 Message ID: ${appointmentResult.messageId}`);
    } else {
      console.log('❌ Appointment reminder failed:', appointmentResult.error);
    }
    
    // Test comprehensive notification system
    console.log('\n🚀 Testing comprehensive notification system...');
    
    const testRecipient = {
      email: 'test@pashumnitra.com',
      phone: '+919876543210',
      name: 'Test User'
    };
    
    const comprehensiveResult = await serviceManager.sendComprehensiveNotification({
      type: 'critical_alert',
      recipient: testRecipient,
      alertData: testAlertData
    });
    
    console.log('📊 Comprehensive notification results:');
    console.log(`   📧 Email: ${comprehensiveResult.results.email?.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   📱 SMS: ${comprehensiveResult.results.sms?.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   📲 WhatsApp: ${comprehensiveResult.results.whatsapp?.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   📨 Push: ${comprehensiveResult.results.push?.success ? '✅ Success' : '❌ Failed'}`);
    
    console.log('\n📈 Summary:');
    console.log(`   Total channels: ${comprehensiveResult.summary.total}`);
    console.log(`   Successful: ${comprehensiveResult.summary.successful}`);
    console.log(`   Failed: ${comprehensiveResult.summary.failed}`);
    
    // Test service health
    console.log('\n🏥 Checking service health...');
    const health = await serviceManager.getServiceHealth();
    
    console.log(`🔍 Overall health: ${health.overall}`);
    if (health.services) {
      console.log('   📊 Individual services:');
      Object.entries(health.services).forEach(([service, status]) => {
        const icon = status === 'healthy' ? '✅' : status === 'degraded' ? '⚠️' : '❌';
        console.log(`      ${icon} ${service}: ${status}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SNS Integration Test Completed Successfully!');
    
    // Display configured topics
    console.log('\n📋 Configured SNS Topics:');
    console.log('   🚨 Critical Alerts: arn:aws:sns:ap-south-1:360121241405:PashuMitra-Critical-Alerts');
    console.log('   ⚠️  Warning Alerts: arn:aws:sns:ap-south-1:360121241405:PashuMitra-Warning-Alerts');
    console.log('   📅 Appointments: arn:aws:sns:ap-south-1:360121241405:PashuMitra-Appointment-Reminders');
    console.log('   🩺 Veterinarian: arn:aws:sns:ap-south-1:360121241405:PashuMitra-Veterinarian-Notification');
    console.log('   📢 General: arn:aws:sns:ap-south-1:360121241405:PashuMitra-General-Notifications');
    
    console.log('\n✨ Your PashuMitra Portal is now ready for global notifications!');
    
  } catch (error) {
    console.log('\n❌ SNS Integration Test Failed:', error.message);
    console.log('🔧 Please check:');
    console.log('   • AWS credentials have SNS permissions');
    console.log('   • SNS topics exist in the specified region');
    console.log('   • Network connectivity to AWS services');
    
    if (error.code) {
      console.log(`   • Error code: ${error.code}`);
    }
  }
}

// Run the test
if (require.main === module) {
  testSNSIntegration().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

module.exports = { testSNSIntegration };