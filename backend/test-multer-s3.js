// Isolated test for multer-S3 configuration
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const path = require('path');
require('dotenv').config();

// Configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    signatureVersion: 'v4'
});

const s3 = new AWS.S3();

console.log('🔄 Testing Multer-S3 Configuration...\n');
console.log(`AWS Region: ${process.env.AWS_REGION}`);
console.log(`S3 Bucket: ${process.env.AWS_S3_BUCKET_NAME}`);
console.log(`AWS SDK Version: ${AWS.VERSION}\n`);

// Test 1: Basic S3 connection
async function testBasicS3() {
    console.log('1. Testing basic S3 connection...');
    try {
        const result = await s3.listBuckets().promise();
        console.log('✅ S3 connection working');
        
        const bucket = result.Buckets.find(b => b.Name === process.env.AWS_S3_BUCKET_NAME);
        if (bucket) {
            console.log(`✅ Target bucket found: ${bucket.Name}`);
            return true;
        } else {
            console.log('❌ Target bucket not found');
            return false;
        }
    } catch (error) {
        console.log(`❌ S3 connection failed: ${error.message}`);
        return false;
    }
}

// Test 2: Multer-S3 configuration
function testMulterS3Config() {
    console.log('\n2. Testing Multer-S3 configuration...');
    
    try {
        // Create multer-s3 storage configuration
        const storage = multerS3({
            s3: s3,
            bucket: process.env.AWS_S3_BUCKET_NAME,
            acl: 'private',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: function (req, file, cb) {
                const timestamp = Date.now();
                const filename = `test/${timestamp}-${file.originalname}`;
                console.log(`   Generated S3 key: ${filename}`);
                cb(null, filename);
            }
        });
        
        console.log('✅ Multer-S3 storage configuration created successfully');
        
        // Create multer instance
        const upload = multer({
            storage: storage,
            limits: {
                fileSize: 10 * 1024 * 1024 // 10MB limit
            },
            fileFilter: function (req, file, cb) {
                console.log(`   File filter check: ${file.originalname} (${file.mimetype})`);
                cb(null, true);
            }
        });
        
        console.log('✅ Multer instance created successfully');
        return { storage, upload };
        
    } catch (error) {
        console.log(`❌ Multer-S3 configuration failed: ${error.message}`);
        console.log(`   Stack: ${error.stack}`);
        return null;
    }
}

// Test 3: Create test Express app to simulate upload
function createTestApp(upload) {
    console.log('\n3. Creating test Express app...');
    
    const app = express();
    
    app.post('/test-upload', upload.single('testfile'), (req, res) => {
        console.log('   Upload handler called');
        
        if (!req.file) {
            console.log('   ❌ No file in request');
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        console.log('   ✅ File uploaded successfully');
        console.log('   File details:', {
            key: req.file.key,
            bucket: req.file.bucket,
            location: req.file.location,
            size: req.file.size,
            mimetype: req.file.mimetype
        });
        
        res.json({
            success: true,
            file: {
                key: req.file.key,
                bucket: req.file.bucket,
                location: req.file.location,
                size: req.file.size
            }
        });
    });
    
    // Error handling middleware
    app.use((error, req, res, next) => {
        console.log('   ❌ Upload error occurred:', error.message);
        console.log('   Error code:', error.code);
        console.log('   Error stack:', error.stack);
        
        res.status(500).json({
            error: error.message,
            code: error.code
        });
    });
    
    console.log('✅ Test Express app created');
    return app;
}

// Test 4: Manual file upload simulation
async function testManualUpload() {
    console.log('\n4. Testing manual S3 upload (without multer)...');
    
    try {
        const testContent = 'This is a test file content for manual upload test';
        const testKey = `manual-test/test-${Date.now()}.txt`;
        
        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: testKey,
            Body: testContent,
            ContentType: 'text/plain',
            ACL: 'private'
        };
        
        const result = await s3.upload(uploadParams).promise();
        console.log('✅ Manual upload successful');
        console.log(`   Location: ${result.Location}`);
        console.log(`   ETag: ${result.ETag}`);
        console.log(`   Key: ${result.Key}`);
        
        // Clean up
        await s3.deleteObject({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: testKey
        }).promise();
        
        console.log('✅ Test file cleaned up');
        return true;
        
    } catch (error) {
        console.log(`❌ Manual upload failed: ${error.message}`);
        console.log(`   Code: ${error.code}`);
        return false;
    }
}

// Test 5: Check multer-s3 version compatibility
function checkVersionCompatibility() {
    console.log('\n5. Checking version compatibility...');
    
    try {
        const multerVersion = require('multer/package.json').version;
        const multerS3Version = require('multer-s3/package.json').version;
        const awsVersion = require('aws-sdk/package.json').version;
        
        console.log(`   Multer version: ${multerVersion}`);
        console.log(`   Multer-S3 version: ${multerS3Version}`);
        console.log(`   AWS SDK version: ${awsVersion}`);
        
        // Check if we have AWS SDK v3 packages that might conflict
        const v3Packages = [];
        const packageJson = require('./package.json');
        
        Object.keys(packageJson.dependencies || {}).forEach(pkg => {
            if (pkg.startsWith('@aws-sdk/')) {
                v3Packages.push(pkg);
            }
        });
        
        if (v3Packages.length > 0) {
            console.log('⚠️  Found AWS SDK v3 packages that might conflict:');
            v3Packages.forEach(pkg => console.log(`     - ${pkg}`));
            console.log('   Consider using only AWS SDK v2 OR only AWS SDK v3');
        } else {
            console.log('✅ No AWS SDK v3 conflicts detected');
        }
        
        return true;
        
    } catch (error) {
        console.log(`❌ Version check failed: ${error.message}`);
        return false;
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting Multer-S3 Diagnosis Tests\n');
    console.log('=' .repeat(50));
    
    // Run tests in sequence
    const s3Working = await testBasicS3();
    if (!s3Working) {
        console.log('\n❌ S3 not working, stopping tests');
        return;
    }
    
    const multerConfig = testMulterS3Config();
    if (!multerConfig) {
        console.log('\n❌ Multer-S3 config failed, stopping tests');
        return;
    }
    
    const app = createTestApp(multerConfig.upload);
    
    const manualWorking = await testManualUpload();
    
    const versionsOk = checkVersionCompatibility();
    
    // Summary
    console.log('\n' + '=' .repeat(50));
    console.log('📋 Test Summary:');
    console.log(`   S3 Connection: ${s3Working ? '✅' : '❌'}`);
    console.log(`   Multer-S3 Config: ${multerConfig ? '✅' : '❌'}`);
    console.log(`   Manual Upload: ${manualWorking ? '✅' : '❌'}`);
    console.log(`   Version Compatibility: ${versionsOk ? '✅' : '❌'}`);
    
    if (s3Working && multerConfig && manualWorking) {
        console.log('\n🎉 All tests passed! Multer-S3 should be working.');
        console.log('   The issue might be in how the upload middleware is used in routes.');
        console.log('   Try creating a simple test endpoint to verify.');
    } else {
        console.log('\n⚠️  Some tests failed. Check the specific errors above.');
    }
    
    console.log('\n💡 Next steps:');
    console.log('   1. If all tests pass, check your route configuration');
    console.log('   2. If multer-s3 config failed, check AWS SDK versions');  
    console.log('   3. If S3 failed, check credentials and permissions');
    console.log('   4. Consider using AWS SDK v3 for newer features');
}

// Run if called directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    runTests,
    testBasicS3,
    testMulterS3Config,
    testManualUpload,
    checkVersionCompatibility
};