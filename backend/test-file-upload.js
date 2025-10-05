const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test file upload functionality with S3
async function testFileUpload() {
  console.log('🔄 Testing File Upload with S3 Configuration...\n');

  try {
    // First, create a test file
    const testFilePath = path.join(__dirname, 'test-s3-upload.txt');
    const testContent = `Test file for S3 upload - ${new Date().toISOString()}
This file is used to test the file upload functionality with AWS S3 integration.
The upload should work without SDK conflicts after the configuration updates.`;

    fs.writeFileSync(testFilePath, testContent);
    console.log('✅ Test file created successfully');

    // Login to get authentication token
    console.log('\n📝 Authenticating...');
    // Try to register a test user first
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'testpass123',
        role: 'user'
      });
      console.log('✅ Test user registered');
    } catch (regError) {
      // User might already exist, which is fine
      console.log('ℹ️  Test user registration skipped (may already exist)');
    }

    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testuser@example.com',
      password: 'testpass123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Authentication successful');

    // Test single file upload
    console.log('\n📤 Testing single file upload to S3...');
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('category', 'document');
    formData.append('description', 'Test file upload to S3 with updated configuration');
    formData.append('tags', 'test,s3,upload');

    const uploadResponse = await axios.post('http://localhost:5000/api/upload/single', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    if (uploadResponse.data.success) {
      console.log('✅ File upload successful!');
      console.log('📄 Upload Details:');
      console.log(`   - File ID: ${uploadResponse.data.data.id}`);
      console.log(`   - Original Name: ${uploadResponse.data.data.originalName}`);
      console.log(`   - S3 Key: ${uploadResponse.data.data.s3Key}`);
      console.log(`   - Cloud URL: ${uploadResponse.data.data.cloudUrl}`);
      console.log(`   - Size: ${uploadResponse.data.data.size} bytes`);
      console.log(`   - Category: ${uploadResponse.data.data.category}`);
      console.log(`   - Signed URL: ${uploadResponse.data.data.signedUrl ? 'Generated' : 'Not available'}`);

      // Test file retrieval
      console.log('\n📋 Testing file retrieval...');
      const filesResponse = await axios.get('http://localhost:5000/api/upload/files', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (filesResponse.data.success && filesResponse.data.data.length > 0) {
        console.log('✅ File retrieval successful');
        console.log(`📊 Total files: ${filesResponse.data.count}`);
        
        const uploadedFile = filesResponse.data.data.find(f => f.id === uploadResponse.data.data.id);
        if (uploadedFile) {
          console.log('✅ Uploaded file found in database');
        }
      }

      // Test file download
      console.log('\n📥 Testing file download...');
      try {
        const downloadResponse = await axios.get(`http://localhost:5000/api/upload/download/${uploadResponse.data.data.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          responseType: 'stream'
        });

        if (downloadResponse.status === 200) {
          console.log('✅ File download successful');
        }
      } catch (downloadError) {
        console.log('⚠️  File download test failed:', downloadError.response?.data?.message || downloadError.message);
      }

      // Clean up test file
      console.log('\n🗑️  Cleaning up test file...');
      try {
        await axios.delete(`http://localhost:5000/api/upload/${uploadResponse.data.data.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ Test file cleaned up successfully');
      } catch (cleanupError) {
        console.log('⚠️  Cleanup failed:', cleanupError.response?.data?.message || cleanupError.message);
      }

    } else {
      console.log('❌ File upload failed:', uploadResponse.data.message);
    }

    // Clean up local test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log('✅ Local test file cleaned up');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    // Clean up local test file on error
    const testFilePath = path.join(__dirname, 'test-s3-upload.txt');
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log('🗑️  Local test file cleaned up after error');
    }
  }
}

// Test S3 configuration separately
async function testS3Config() {
  console.log('\n🔧 Testing S3 Configuration...');
  
  try {
    const { s3, s3Storage, generateSignedUrl, deleteFromS3 } = require('./config/s3Config');
    
    console.log('✅ S3 config imported successfully');
    console.log(`   - S3 client: ${s3 ? 'Available' : 'Not available'}`);
    console.log(`   - S3 storage: ${s3Storage ? 'Available' : 'Not available'}`);
    console.log(`   - Generate signed URL function: ${generateSignedUrl ? 'Available' : 'Not available'}`);
    console.log(`   - Delete from S3 function: ${deleteFromS3 ? 'Available' : 'Not available'}`);
    
    // Test bucket access if S3 is available
    if (s3) {
      console.log('\n🪣 Testing S3 bucket access...');
      const bucketName = process.env.AWS_S3_BUCKET_NAME;
      
      if (bucketName) {
        try {
          const headResult = await s3.headBucket({ Bucket: bucketName }).promise();
          console.log('✅ S3 bucket accessible');
        } catch (s3Error) {
          console.log('⚠️  S3 bucket access issue:', s3Error.message);
        }
      } else {
        console.log('⚠️  AWS_S3_BUCKET_NAME not configured');
      }
    }
    
  } catch (configError) {
    console.error('❌ S3 config test failed:', configError.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting File Upload Tests with S3\n');
  console.log('=' .repeat(50));
  
  await testS3Config();
  console.log('\n' + '=' .repeat(50));
  await testFileUpload();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Tests completed!');
}

runTests().catch(console.error);