#!/usr/bin/env node

/**
 * AWS S3 Bucket Setup Script for PashuMitra Portal
 * 
 * This script helps set up the S3 bucket with proper configuration
 * Run with: node scripts/setupS3.js
 */

require('dotenv').config();
const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();
const bucketName = process.env.AWS_S3_BUCKET_NAME;

async function setupS3Bucket() {
  try {
    console.log('🚀 Setting up S3 bucket for PashuMitra Portal...\n');

    if (!bucketName) {
      throw new Error('AWS_S3_BUCKET_NAME not found in environment variables');
    }

    // Check if bucket exists
    console.log('📍 Checking if bucket exists...');
    try {
      await s3.headBucket({ Bucket: bucketName }).promise();
      console.log('✅ Bucket already exists:', bucketName);
    } catch (error) {
      if (error.statusCode === 404) {
        console.log('📦 Creating bucket:', bucketName);
        
        const createParams = {
          Bucket: bucketName,
          ACL: 'private'
        };

        // Add location constraint for regions other than us-east-1
        if (process.env.AWS_REGION && process.env.AWS_REGION !== 'us-east-1') {
          createParams.CreateBucketConfiguration = {
            LocationConstraint: process.env.AWS_REGION
          };
        }

        await s3.createBucket(createParams).promise();
        console.log('✅ Bucket created successfully');
      } else {
        throw error;
      }
    }

    // Set up bucket policy for secure access
    console.log('🔒 Setting up bucket policy...');
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowApplicationAccess',
          Effect: 'Allow',
          Principal: {
            AWS: `arn:aws:iam::*:user/*`
          },
          Action: [
            's3:GetObject',
            's3:PutObject',
            's3:DeleteObject'
          ],
          Resource: `arn:aws:s3:::${bucketName}/*`
        }
      ]
    };

    try {
      await s3.putBucketPolicy({
        Bucket: bucketName,
        Policy: JSON.stringify(bucketPolicy)
      }).promise();
      console.log('✅ Bucket policy configured');
    } catch (error) {
      console.log('⚠️  Warning: Could not set bucket policy:', error.message);
    }

    // Enable versioning (optional but recommended)
    console.log('📋 Enabling bucket versioning...');
    try {
      await s3.putBucketVersioning({
        Bucket: bucketName,
        VersioningConfiguration: {
          Status: 'Enabled'
        }
      }).promise();
      console.log('✅ Bucket versioning enabled');
    } catch (error) {
      console.log('⚠️  Warning: Could not enable versioning:', error.message);
    }

    // Set up CORS configuration
    console.log('🌐 Setting up CORS configuration...');
    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          AllowedOrigins: [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'https://pashumnitra.com',
            'https://*.pashumnitra.com'
          ],
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3000
        }
      ]
    };

    try {
      await s3.putBucketCors({
        Bucket: bucketName,
        CORSConfiguration: corsConfiguration
      }).promise();
      console.log('✅ CORS configuration applied');
    } catch (error) {
      console.log('⚠️  Warning: Could not set CORS:', error.message);
    }

    // Set up lifecycle policy to clean up multipart uploads
    console.log('♻️  Setting up lifecycle policy...');
    const lifecycleConfiguration = {
      Rules: [
        {
          ID: 'CleanupIncompleteMultipartUploads',
          Status: 'Enabled',
          Filter: {},
          AbortIncompleteMultipartUpload: {
            DaysAfterInitiation: 1
          }
        },
        {
          ID: 'DeleteOldVersions',
          Status: 'Enabled',
          Filter: {},
          NoncurrentVersionExpiration: {
            NoncurrentDays: 30
          }
        }
      ]
    };

    try {
      await s3.putBucketLifecycleConfiguration({
        Bucket: bucketName,
        LifecycleConfiguration: lifecycleConfiguration
      }).promise();
      console.log('✅ Lifecycle policy configured');
    } catch (error) {
      console.log('⚠️  Warning: Could not set lifecycle policy:', error.message);
    }

    // Create folder structure
    console.log('📁 Creating folder structure...');
    const folders = ['image/', 'document/', 'video/', 'audio/', 'general/', 'thumbnails/'];
    
    for (const folder of folders) {
      try {
        await s3.putObject({
          Bucket: bucketName,
          Key: folder,
          Body: ''
        }).promise();
        console.log(`✅ Created folder: ${folder}`);
      } catch (error) {
        console.log(`⚠️  Warning: Could not create folder ${folder}:`, error.message);
      }
    }

    console.log('\n🎉 S3 bucket setup completed successfully!');
    console.log('\n📋 Configuration Summary:');
    console.log(`   Bucket Name: ${bucketName}`);
    console.log(`   Region: ${process.env.AWS_REGION || 'us-east-1'}`);
    console.log(`   Access: Private (signed URLs)`);
    console.log(`   Versioning: Enabled`);
    console.log(`   CORS: Configured`);
    console.log(`   Lifecycle: Configured`);

    console.log('\n🔧 Next Steps:');
    console.log('   1. Update your .env file with the correct AWS credentials');
    console.log('   2. Test file upload functionality');
    console.log('   3. Monitor S3 costs and usage');

  } catch (error) {
    console.error('\n❌ Error setting up S3 bucket:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Check your AWS credentials are correct');
    console.error('   2. Ensure you have S3 permissions');
    console.error('   3. Verify the bucket name is unique globally');
    console.error('   4. Check your AWS region is correct');
    process.exit(1);
  }
}

// Test S3 connectivity
async function testS3Connection() {
  try {
    console.log('🧪 Testing S3 connection...');
    
    // List buckets to test connectivity
    const result = await s3.listBuckets().promise();
    console.log('✅ S3 connection successful');
    console.log(`   Found ${result.Buckets.length} buckets in your account`);
    
    return true;
  } catch (error) {
    console.error('❌ S3 connection failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔧 PashuMitra Portal S3 Setup\n');
  
  // Test connection first
  const connectionOk = await testS3Connection();
  if (!connectionOk) {
    console.log('\n💡 Please check your AWS configuration and try again.');
    process.exit(1);
  }
  
  // Setup bucket
  await setupS3Bucket();
}

// Handle command line execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { setupS3Bucket, testS3Connection };