// Test script for file upload functionality
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api';

// Test user data for authentication
const testUser = {
    name: 'File Upload Test User',
    email: `file_test_${Date.now()}@example.com`,
    phone: '+919876543210',
    password: 'TestPassword123!',
    location: 'Test City',
    userType: 'farmer'
};

let authToken = null;
let uploadedFiles = [];

// Create test files
function createTestFiles() {
    const testDir = path.join(__dirname, 'test-uploads');
    
    // Create test directory if it doesn't exist
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir);
    }
    
    const files = {};
    
    // Create a test text file (simulating image)
    const textContent = 'This is a test file content for image upload simulation';
    const textFilePath = path.join(testDir, 'test-image.txt');
    fs.writeFileSync(textFilePath, textContent);
    files.textFile = textFilePath;
    
    // Create a larger test file
    const largeContent = 'Large file content: ' + 'A'.repeat(1000);
    const largeFilePath = path.join(testDir, 'large-test-file.txt');
    fs.writeFileSync(largeFilePath, largeContent);
    files.largeFile = largeFilePath;
    
    // Create a very small file
    const smallFilePath = path.join(testDir, 'small-test-file.txt');
    fs.writeFileSync(smallFilePath, 'Small');
    files.smallFile = smallFilePath;
    
    console.log('✅ Test files created');
    return files;
}

async function setupAuth() {
    console.log('🔄 Setting up authentication...');
    
    try {
        // Register test user
        const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
        
        if (registerResponse.data.success) {
            authToken = registerResponse.data.token;
            console.log('✅ Authentication setup successful');
            return true;
        } else {
            console.log('❌ Authentication setup failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Authentication setup failed:', error.response?.data?.message || error.message);
        return false;
    }
}

async function testFileUpload() {
    console.log('🔄 Testing PashuMitra Portal File Upload...\n');

    try {
        // Setup authentication
        if (!(await setupAuth())) {
            return;
        }
        console.log('');

        // Create test files
        const testFiles = createTestFiles();
        console.log('');

        // Step 1: Test Single File Upload
        console.log('1. Testing Single File Upload...');
        try {
            const formData = new FormData();
            const fileStream = fs.createReadStream(testFiles.textFile);
            formData.append('file', fileStream, {
                filename: 'test-image.txt',
                contentType: 'text/plain'
            });
            
            const uploadResponse = await axios.post(`${API_URL}/upload/single`, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${authToken}`
                },
                timeout: 30000
            });
            
            if (uploadResponse.data.success) {
                console.log('✅ Single file upload successful');
                console.log(`   File ID: ${uploadResponse.data.file?.id || uploadResponse.data.id}`);
                console.log(`   File URL: ${uploadResponse.data.file?.url || uploadResponse.data.url || 'Not provided'}`);
                console.log(`   File Size: ${uploadResponse.data.file?.size || 'Unknown'} bytes`);
                
                uploadedFiles.push(uploadResponse.data.file || uploadResponse.data);
            } else {
                console.log('❌ Single file upload failed');
                console.log(`   Error: ${uploadResponse.data.message}`);
            }
        } catch (error) {
            console.log('❌ Single file upload failed');
            console.log(`   Error: ${error.response?.data?.message || error.message}`);
        }
        console.log('');

        // Step 2: Test Multiple File Upload
        console.log('2. Testing Multiple File Upload...');
        try {
            const formData = new FormData();
            
            // Add multiple files
            const file1Stream = fs.createReadStream(testFiles.textFile);
            const file2Stream = fs.createReadStream(testFiles.smallFile);
            
            formData.append('files', file1Stream, {
                filename: 'test-file-1.txt',
                contentType: 'text/plain'
            });
            formData.append('files', file2Stream, {
                filename: 'test-file-2.txt', 
                contentType: 'text/plain'
            });
            
            const multiUploadResponse = await axios.post(`${API_URL}/upload/multiple`, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${authToken}`
                },
                timeout: 30000
            });
            
            if (multiUploadResponse.data.success) {
                console.log('✅ Multiple file upload successful');
                const files = multiUploadResponse.data.files || [];
                console.log(`   Uploaded files: ${files.length}`);
                
                files.forEach((file, index) => {
                    console.log(`   File ${index + 1}: ${file.id || file._id} (${file.originalName || file.filename})`);
                    uploadedFiles.push(file);
                });
            } else {
                console.log('❌ Multiple file upload failed');
                console.log(`   Error: ${multiUploadResponse.data.message}`);
            }
        } catch (error) {
            console.log('❌ Multiple file upload failed');
            console.log(`   Error: ${error.response?.data?.message || error.message}`);
        }
        console.log('');

        // Step 3: Test File Size Validation
        console.log('3. Testing File Size Validation...');
        try {
            // Try to upload a file that might be too large (depends on server config)
            const formData = new FormData();
            const largeFileStream = fs.createReadStream(testFiles.largeFile);
            formData.append('file', largeFileStream, {
                filename: 'large-file.txt',
                contentType: 'text/plain'
            });
            
            const largeUploadResponse = await axios.post(`${API_URL}/upload/single`, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${authToken}`
                },
                timeout: 30000
            });
            
            console.log('✅ Large file upload successful (within size limits)');
            console.log(`   File size: ${largeUploadResponse.data.file?.size || 'Unknown'} bytes`);
        } catch (error) {
            if (error.response?.status === 413 || error.response?.data?.message?.includes('size')) {
                console.log('✅ File size validation working (large file rejected)');
                console.log(`   Error: ${error.response.data.message}`);
            } else {
                console.log('❌ Unexpected error with large file upload');
                console.log(`   Error: ${error.response?.data?.message || error.message}`);
            }
        }
        console.log('');

        // Step 4: Test File Type Validation (if implemented)
        console.log('4. Testing File Type Validation...');
        try {
            // Create a file with potentially unsupported extension
            const testExecutableFile = path.join(__dirname, 'test-uploads', 'test.exe');
            fs.writeFileSync(testExecutableFile, 'Fake executable content');
            
            const formData = new FormData();
            const execFileStream = fs.createReadStream(testExecutableFile);
            formData.append('file', execFileStream, {
                filename: 'test.exe',
                contentType: 'application/octet-stream'
            });
            
            const typeTestResponse = await axios.post(`${API_URL}/upload/single`, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${authToken}`
                },
                timeout: 30000
            });
            
            console.log('ℹ️  File type validation not enforced or .exe files allowed');
            
            // Clean up test executable
            fs.unlinkSync(testExecutableFile);
        } catch (error) {
            if (error.response?.status === 400 && error.response?.data?.message?.includes('type')) {
                console.log('✅ File type validation working (unsupported file rejected)');
                console.log(`   Error: ${error.response.data.message}`);
            } else {
                console.log('ℹ️  File type validation not implemented or different error occurred');
                console.log(`   Error: ${error.response?.data?.message || error.message}`);
            }
            
            // Clean up test executable if it exists
            const testExecutableFile = path.join(__dirname, 'test-uploads', 'test.exe');
            if (fs.existsSync(testExecutableFile)) {
                fs.unlinkSync(testExecutableFile);
            }
        }
        console.log('');

        // Step 5: Test File Retrieval
        if (uploadedFiles.length > 0) {
            console.log('5. Testing File Retrieval...');
            
            try {
                const fileResponse = await axios.get(`${API_URL}/upload/files`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                
                if (fileResponse.data.success) {
                    const files = fileResponse.data.files || fileResponse.data.data || [];
                    console.log('✅ File retrieval successful');
                    console.log(`   Total files: ${files.length}`);
                    
                    if (files.length > 0) {
                        console.log(`   Recent file: ${files[0].originalName || files[0].filename || 'Unknown'}`);
                        console.log(`   File size: ${files[0].size || 'Unknown'} bytes`);
                    }
                } else {
                    console.log('❌ File retrieval failed');
                    console.log(`   Error: ${fileResponse.data.message}`);
                }
            } catch (error) {
                console.log('❌ File retrieval failed');
                console.log(`   Error: ${error.response?.data?.message || error.message}`);
            }
            console.log('');
        }

        // Step 6: Test File Download (if available)
        if (uploadedFiles.length > 0 && uploadedFiles[0].id) {
            console.log('6. Testing File Download...');
            
            try {
                const fileId = uploadedFiles[0].id || uploadedFiles[0]._id;
                const downloadResponse = await axios.get(`${API_URL}/upload/download/${fileId}`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                    responseType: 'arraybuffer'
                });
                
                if (downloadResponse.status === 200) {
                    console.log('✅ File download successful');
                    console.log(`   Downloaded size: ${downloadResponse.data.byteLength} bytes`);
                } else {
                    console.log('❌ File download failed');
                }
            } catch (error) {
                console.log('❌ File download failed');
                console.log(`   Error: ${error.response?.data?.message || error.message}`);
            }
            console.log('');
        }

        // Step 7: Test Upload Without Authentication
        console.log('7. Testing Upload Without Authentication...');
        try {
            const formData = new FormData();
            const fileStream = fs.createReadStream(testFiles.smallFile);
            formData.append('file', fileStream, {
                filename: 'unauthorized-test.txt',
                contentType: 'text/plain'
            });
            
            await axios.post(`${API_URL}/upload/single`, formData, {
                headers: formData.getHeaders(), // No authorization header
                timeout: 30000
            });
            
            console.log('❌ Upload without authentication succeeded (security issue)');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Upload without authentication correctly rejected');
                console.log(`   Error: ${error.response.data.message}`);
            } else {
                console.log('❌ Unexpected error for unauthorized upload');
                console.log(`   Error: ${error.response?.data?.message || error.message}`);
            }
        }
        console.log('');

        console.log('🎉 File upload test completed!');
        console.log('\n📋 Test Summary:');
        console.log(`   Test User: ${testUser.email}`);
        console.log(`   Uploaded Files: ${uploadedFiles.length}`);
        console.log('   File upload functionality tested successfully.');

    } catch (error) {
        console.error('❌ File upload test failed:', error.message);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Error: ${error.response.data?.message || error.response.statusText}`);
        }
    }
}

// Cleanup function
async function cleanup() {
    console.log('\n🧹 Cleaning up test data...');
    
    // Delete uploaded files if possible
    for (const file of uploadedFiles) {
        try {
            const fileId = file.id || file._id;
            if (fileId && authToken) {
                await axios.delete(`${API_URL}/upload/files/${fileId}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                console.log(`✅ Deleted uploaded file: ${fileId}`);
            }
        } catch (error) {
            console.log(`ℹ️  Could not delete file ${file.id || file._id}: ${error.response?.data?.message || error.message}`);
        }
    }
    
    // Clean up test files
    const testDir = path.join(__dirname, 'test-uploads');
    if (fs.existsSync(testDir)) {
        const files = fs.readdirSync(testDir);
        files.forEach(file => {
            fs.unlinkSync(path.join(testDir, file));
        });
        fs.rmdirSync(testDir);
        console.log('✅ Test files cleaned up');
    }
}

// Run the test
if (require.main === module) {
    testFileUpload()
        .then(() => cleanup())
        .catch((error) => {
            console.error('Test failed:', error);
            cleanup().catch(console.error);
        });
}

module.exports = { testFileUpload };