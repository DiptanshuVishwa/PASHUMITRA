const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Test S3 Configuration and Upload
const testS3Upload = async () => {
  console.log('🔍 Testing S3 Configuration and Upload...\n');

  // 1. Check Environment Variables
  console.log('1. Environment Variables:');
  console.log('   AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing');
  console.log('   AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing');
  console.log('   AWS_REGION:', process.env.AWS_REGION || '❌ Missing');
  console.log('   AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME || '❌ Missing');
  console.log('');

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET_NAME) {
    console.error('❌ Missing required AWS environment variables');
    return;
  }

  // 2. Configure S3 Client
  console.log('2. Configuring S3 Client...');
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'ap-south-1',
    apiVersion: '2006-03-01',
    signatureVersion: 'v4'
  });

  try {
    // 3. Test S3 Connection
    console.log('3. Testing S3 Connection...');
    const buckets = await s3.listBuckets().promise();
    console.log('   ✅ S3 Connection successful');
    console.log('   Available buckets:', buckets.Buckets.map(b => b.Name).join(', '));

    // 4. Check if our bucket exists
    console.log('\n4. Checking bucket access...');
    const bucketExists = buckets.Buckets.find(bucket => bucket.Name === process.env.AWS_S3_BUCKET_NAME);
    if (bucketExists) {
      console.log(`   ✅ Bucket "${process.env.AWS_S3_BUCKET_NAME}" exists and accessible`);
    } else {
      console.log(`   ❌ Bucket "${process.env.AWS_S3_BUCKET_NAME}" not found or not accessible`);
      return;
    }

    // 5. Test bucket permissions
    console.log('\n5. Testing bucket permissions...');
    try {
      await s3.getBucketLocation({ Bucket: process.env.AWS_S3_BUCKET_NAME }).promise();
      console.log('   ✅ Read permission: OK');
    } catch (error) {
      console.log('   ❌ Read permission: Failed -', error.message);
    }

    // 6. Test file upload
    console.log('\n6. Testing file upload...');
    const testContent = 'This is a test file for PashuMitra upload functionality';
    const testKey = `test-uploads/test-${Date.now()}.txt`;
    
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: testKey,
      Body: Buffer.from(testContent, 'utf8'),
      ContentType: 'text/plain',
      ACL: 'private',
      Metadata: {
        uploadedBy: 'test-script',
        testRun: 'true'
      }
    };

    try {
      const uploadResult = await s3.upload(uploadParams).promise();
      console.log('   ✅ Upload successful!');
      console.log('   Location:', uploadResult.Location);
      console.log('   ETag:', uploadResult.ETag);
      console.log('   Key:', uploadResult.Key);

      // 7. Test signed URL generation
      console.log('\n7. Testing signed URL generation...');
      try {
        const signedUrl = await s3.getSignedUrlPromise('getObject', {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: testKey,
          Expires: 3600
        });
        console.log('   ✅ Signed URL generated successfully');
        console.log('   URL length:', signedUrl.length, 'characters');
      } catch (urlError) {
        console.log('   ❌ Signed URL generation failed:', urlError.message);
      }

      // 8. Clean up test file
      console.log('\n8. Cleaning up test file...');
      try {
        await s3.deleteObject({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: testKey
        }).promise();
        console.log('   ✅ Test file cleaned up successfully');
      } catch (deleteError) {
        console.log('   ⚠️  Warning: Could not delete test file:', deleteError.message);
      }

    } catch (uploadError) {
      console.log('   ❌ Upload failed:', uploadError.message);
      console.log('   Error code:', uploadError.code);
      console.log('   Status code:', uploadError.statusCode);
    }

  } catch (error) {
    console.error('❌ S3 Connection failed:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Status code:', error.statusCode);
  }

  console.log('\n✅ S3 test completed!');
};

// Run the test
if (require.main === module) {
  testS3Upload().catch(console.error);
}

module.exports = testS3Upload;