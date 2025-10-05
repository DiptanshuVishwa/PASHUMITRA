// Test script for S3 configuration
const AWS = require('aws-sdk');
require('dotenv').config();

// Test S3 configuration
async function testS3Configuration() {
    console.log('🔄 Testing S3 Configuration...\n');
    
    console.log('Environment Variables:');
    console.log(`  AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`  AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`  AWS_REGION: ${process.env.AWS_REGION || 'Using default'}`);
    console.log(`  AWS_S3_BUCKET_NAME: ${process.env.AWS_S3_BUCKET_NAME || '❌ Missing'}`);
    console.log('');
    
    // Configure AWS with explicit endpoint and signature version
    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'ap-south-1',
        signatureVersion: 'v4',
        s3ForcePathStyle: true
    });
    
    const s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        region: process.env.AWS_REGION || 'ap-south-1'
    });
    
    // Test 1: Check S3 connection and try different regions
    console.log('1. Testing S3 Connection...');
    
    const regionsToTry = ['ap-south-1', 'us-east-1', 'us-west-2', 'eu-west-1'];
    let successfulRegion = null;
    
    for (const region of regionsToTry) {
        console.log(`   Trying region: ${region}`);
        
        const regionS3 = new AWS.S3({
            apiVersion: '2006-03-01',
            region: region
        });
        
        try {
            const result = await regionS3.listBuckets().promise();
            console.log(`✅ S3 Connection successful in region: ${region}`);
            console.log(`   Available buckets: ${result.Buckets.length}`);
            
            const bucketNames = result.Buckets.map(bucket => bucket.Name);
            console.log(`   Bucket names: ${bucketNames.join(', ')}`);
            
            // Check if our target bucket exists
            const targetBucket = process.env.AWS_S3_BUCKET_NAME;
            if (bucketNames.includes(targetBucket)) {
                console.log(`✅ Target bucket '${targetBucket}' found in region: ${region}`);
                successfulRegion = region;
                // Update our main S3 client to use this region
                s3.config.region = region;
                break;
            }
            
            if (!successfulRegion) {
                successfulRegion = region; // At least we have a working connection
            }
            
        } catch (error) {
            console.log(`   ❌ Failed to connect to region ${region}: ${error.code}`);
        }
    }
    
    if (!successfulRegion) {
        console.log('❌ Could not connect to S3 in any region');
        return false;
    }
    
    console.log(`\n   Using region: ${successfulRegion}`);
    
    // Update environment if we found the bucket in a different region
    if (successfulRegion !== process.env.AWS_REGION) {
        console.log(`⚠️  Note: Bucket found in ${successfulRegion}, but config uses ${process.env.AWS_REGION}`);
        console.log('   Consider updating AWS_REGION in your .env file');
    }
    console.log('');
    
    // Test 2: Check bucket permissions
    console.log('2. Testing Bucket Permissions...');
    try {
        const bucketName = process.env.AWS_S3_BUCKET_NAME;
        
        // Try to list objects (read permission)
        const listResult = await s3.listObjectsV2({
            Bucket: bucketName,
            MaxKeys: 1
        }).promise();
        
        console.log('✅ Bucket read permission working');
        console.log(`   Objects in bucket: ${listResult.KeyCount}`);
        
        // Try to get bucket location
        const locationResult = await s3.getBucketLocation({
            Bucket: bucketName
        }).promise();
        
        const region = locationResult.LocationConstraint || 'us-east-1';
        console.log(`✅ Bucket location: ${region}`);
        
        // Check if bucket region matches our config
        if (region === process.env.AWS_REGION) {
            console.log('✅ Bucket region matches configuration');
        } else {
            console.log(`⚠️  Bucket region (${region}) differs from config (${process.env.AWS_REGION})`);
        }
        
    } catch (error) {
        console.log('❌ Bucket permission test failed');
        console.log(`   Error: ${error.message}`);
        console.log(`   Code: ${error.code}`);
    }
    console.log('');
    
    // Test 3: Try a simple file upload
    console.log('3. Testing File Upload...');
    try {
        const testFileContent = 'This is a test file for S3 configuration';
        const testKey = `test/config-test-${Date.now()}.txt`;
        
        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: testKey,
            Body: testFileContent,
            ContentType: 'text/plain',
            ACL: 'private'
        };
        
        const uploadResult = await s3.upload(uploadParams).promise();
        console.log('✅ Test file upload successful');
        console.log(`   File URL: ${uploadResult.Location}`);
        console.log(`   ETag: ${uploadResult.ETag}`);
        
        // Test generating signed URL
        const signedUrl = await s3.getSignedUrlPromise('getObject', {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: testKey,
            Expires: 60 // 1 minute
        });
        
        console.log('✅ Signed URL generation successful');
        console.log(`   Signed URL: ${signedUrl.substring(0, 100)}...`);
        
        // Clean up test file
        await s3.deleteObject({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: testKey
        }).promise();
        
        console.log('✅ Test file cleanup successful');
        
    } catch (error) {
        console.log('❌ File upload test failed');
        console.log(`   Error: ${error.message}`);
        console.log(`   Code: ${error.code}`);
        
        if (error.code === 'AccessDenied') {
            console.log('   💡 This might be a permissions issue. Check your IAM policy.');
        }
    }
    console.log('');
    
    // Test 4: Check AWS SDK version compatibility
    console.log('4. Testing AWS SDK Version Compatibility...');
    try {
        console.log(`   AWS SDK Version: ${AWS.VERSION}`);
        console.log('✅ AWS SDK v2 is properly loaded');
        
        // Test if multer-s3 can work with this configuration
        const multerS3 = require('multer-s3');
        console.log('✅ multer-s3 module loaded successfully');
        
        // Create a test multer-s3 storage configuration
        const testStorage = multerS3({
            s3: s3,
            bucket: process.env.AWS_S3_BUCKET_NAME,
            acl: 'private',
            key: function (req, file, cb) {
                cb(null, `test/multer-test-${Date.now()}`);
            }
        });
        
        console.log('✅ multer-s3 storage configuration created successfully');
        
    } catch (error) {
        console.log('❌ AWS SDK compatibility test failed');
        console.log(`   Error: ${error.message}`);
    }
    console.log('');
    
    // Final summary
    console.log('🎯 S3 Configuration Test Summary:');
    console.log('   If all tests above passed, S3 should be working correctly.');
    console.log('   If any tests failed, please check the specific error messages above.');
}

// Bucket creation helper (in case bucket doesn't exist)
async function createBucketIfNotExists() {
    console.log('🔄 Checking if S3 bucket needs to be created...\n');
    
    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'ap-south-1'
    });
    
    const s3 = new AWS.S3();
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    
    try {
        // Check if bucket exists
        await s3.headBucket({ Bucket: bucketName }).promise();
        console.log(`✅ Bucket '${bucketName}' already exists`);
        return true;
    } catch (error) {
        if (error.code === 'NotFound') {
            console.log(`❌ Bucket '${bucketName}' does not exist`);
            console.log('Creating bucket...');
            
            try {
                const createParams = {
                    Bucket: bucketName,
                    CreateBucketConfiguration: {
                        LocationConstraint: process.env.AWS_REGION
                    }
                };
                
                // Don't set LocationConstraint for us-east-1
                if (process.env.AWS_REGION === 'us-east-1') {
                    delete createParams.CreateBucketConfiguration;
                }
                
                await s3.createBucket(createParams).promise();
                console.log(`✅ Bucket '${bucketName}' created successfully`);
                
                // Set bucket versioning
                await s3.putBucketVersioning({
                    Bucket: bucketName,
                    VersioningConfiguration: {
                        Status: 'Enabled'
                    }
                }).promise();
                
                console.log('✅ Bucket versioning enabled');
                return true;
                
            } catch (createError) {
                console.log(`❌ Failed to create bucket: ${createError.message}`);
                return false;
            }
        } else {
            console.log(`❌ Error checking bucket: ${error.message}`);
            return false;
        }
    }
}

// Run tests
async function runS3Tests() {
    console.log('🚀 Starting S3 Configuration Tests\n');
    console.log('=' .repeat(50));
    
    await createBucketIfNotExists();
    console.log('');
    await testS3Configuration();
    
    console.log('=' .repeat(50));
    console.log('S3 configuration test completed!');
}

// Export for use in other scripts
module.exports = {
    testS3Configuration,
    createBucketIfNotExists
};

// Run if called directly
if (require.main === module) {
    runS3Tests().catch(console.error);
}