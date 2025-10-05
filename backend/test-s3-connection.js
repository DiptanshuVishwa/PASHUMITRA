require('dotenv').config();
const AWS = require('aws-sdk');

// Test AWS S3 configuration
async function testS3Connection() {
  try {
    console.log('🔧 Testing AWS S3 Connection...');
    console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing');
    console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Missing');
    console.log('AWS_REGION:', process.env.AWS_REGION);
    console.log('AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME);

    // Configure S3
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'ap-south-1'
    });

    // Test 1: List buckets (permissions test)
    console.log('\n1️⃣ Testing bucket access...');
    try {
      const buckets = await s3.listBuckets().promise();
      console.log('✅ Successfully connected to S3');
      console.log('Available buckets:', buckets.Buckets.map(b => b.Name));
      
      // Check if our bucket exists
      const ourBucket = buckets.Buckets.find(b => b.Name === process.env.AWS_S3_BUCKET_NAME);
      if (ourBucket) {
        console.log('✅ Target bucket found:', process.env.AWS_S3_BUCKET_NAME);
      } else {
        console.log('❌ Target bucket not found:', process.env.AWS_S3_BUCKET_NAME);
      }
    } catch (error) {
      console.log('❌ Failed to list buckets:', error.message);
    }

    // Test 2: Check bucket location and permissions
    console.log('\n2️⃣ Testing bucket permissions...');
    try {
      const location = await s3.getBucketLocation({
        Bucket: process.env.AWS_S3_BUCKET_NAME
      }).promise();
      console.log('✅ Bucket location:', location.LocationConstraint || 'us-east-1');
      
      // Test write permissions with a small test file
      console.log('\n3️⃣ Testing write permissions...');
      const testKey = 'test/connection-test-' + Date.now() + '.txt';
      await s3.putObject({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: testKey,
        Body: 'This is a test file to verify S3 upload functionality',
        ContentType: 'text/plain'
      }).promise();
      console.log('✅ Successfully uploaded test file:', testKey);
      
      // Test read permissions
      console.log('\n4️⃣ Testing read permissions...');
      const object = await s3.getObject({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: testKey
      }).promise();
      console.log('✅ Successfully read test file');
      
      // Clean up test file
      console.log('\n5️⃣ Cleaning up test file...');
      await s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: testKey
      }).promise();
      console.log('✅ Successfully deleted test file');
      
    } catch (error) {
      console.log('❌ Bucket operation failed:', error.message);
      console.log('Error code:', error.code);
      console.log('Status code:', error.statusCode);
    }

    console.log('\n🎉 S3 connectivity test completed!');
    
  } catch (error) {
    console.error('💥 S3 connection test failed:', error.message);
  }
}

testS3Connection();