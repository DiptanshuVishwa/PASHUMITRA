const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Test user credentials
const TEST_USER = {
    name: 'Test User',
    email: 'testuser@pashumnitra.com',
    password: 'TestPass123!',
    phone: '+1234567890',
    role: 'user',
    location: 'Test City'
};

let authToken = null;
let uploadedFileId = null;

// Helper function to create a test file
function createTestFile(filename, content = 'This is a test file for upload testing.') {
    const testFilePath = path.join(__dirname, 'test-files', filename);
    
    // Create test-files directory if it doesn't exist
    const dir = path.dirname(testFilePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(testFilePath, content);
    return testFilePath;
}

// Helper function to register test user
async function registerTestUser() {
    try {
        console.log('👤 Registering test user...');
        const response = await axios.post(`${API_URL}/auth/register`, TEST_USER);
        
        if (response.data.success && response.data.token) {
            authToken = response.data.token;
            console.log('✅ Test user registered successfully');
            return true;
        } else {
            console.log('❌ Test user registration failed:', response.data.message);
            return false;
        }
    } catch (error) {
        if (error.response?.data?.message?.includes('already exists')) {
            console.log('ℹ️  Test user already exists, attempting login...');
            return await authenticate();
        } else {
            console.log('❌ Test user registration error:', error.response?.data?.message || error.message);
            return false;
        }
    }
}

// Helper function to authenticate and get token
async function authenticate() {
    try {
        console.log('🔐 Authenticating user...');
        const response = await axios.post(`${API_URL}/auth/login`, TEST_USER);
        
        if (response.data.success && response.data.token) {
            authToken = response.data.token;
            console.log('✅ Authentication successful');
            return true;
        } else {
            console.log('❌ Authentication failed:', response.data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ Authentication error:', error.response?.data?.message || error.message);
        return false;
    }
}

// Test single file upload
async function testSingleFileUpload() {
    try {
        console.log('\n📁 Testing single file upload...');
        
        // Create a test text file
        const testFilePath = createTestFile('test-document.txt', 'This is a test document for single file upload.');
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream(testFilePath));
        formData.append('category', 'document');
        formData.append('description', 'Test document for API testing');
        formData.append('tags', 'test,document,api');
        
        const response = await axios.post(
            `${API_URL}/upload/single`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );
        
        if (response.data.success) {
            uploadedFileId = response.data.data.id;
            console.log('✅ Single file upload successful!');
            console.log(`   File ID: ${uploadedFileId}`);
            console.log(`   Original Name: ${response.data.data.originalName}`);
            console.log(`   Filename: ${response.data.data.filename}`);
            console.log(`   Size: ${(response.data.data.size / 1024).toFixed(2)} KB`);
            console.log(`   Category: ${response.data.data.category}`);
            console.log(`   S3 URL: ${response.data.data.cloudUrl}`);
            
            // Clean up test file
            fs.unlinkSync(testFilePath);
        } else {
            console.log('❌ Single file upload failed:', response.data.message);
        }
    } catch (error) {
        console.log('❌ Single file upload error:', error.response?.data?.message || error.message);
    }
}

// Test multiple file upload
async function testMultipleFileUpload() {
    try {
        console.log('\n📁 Testing multiple file upload...');
        
        // Create multiple test files
        const testFile1 = createTestFile('test-image.txt', 'This is a test image file (simulated).');
        const testFile2 = createTestFile('test-document-2.txt', 'This is another test document.');
        
        const formData = new FormData();
        formData.append('files', fs.createReadStream(testFile1));
        formData.append('files', fs.createReadStream(testFile2));
        formData.append('category', 'general');
        formData.append('description', 'Multiple test files for API testing');
        
        const response = await axios.post(
            `${API_URL}/upload/multiple`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );
        
        if (response.data.success) {
            console.log('✅ Multiple file upload successful!');
            console.log(`   Uploaded: ${response.data.data.summary.successful} files`);
            console.log(`   Failed: ${response.data.data.summary.failed} files`);
            
            response.data.data.uploadedFiles.forEach((file, index) => {
                console.log(`   File ${index + 1}: ${file.originalName} (${(file.size / 1024).toFixed(2)} KB)`);
            });
        } else {
            console.log('❌ Multiple file upload failed:', response.data.message);
        }
        
        // Clean up test files
        fs.unlinkSync(testFile1);
        fs.unlinkSync(testFile2);
    } catch (error) {
        console.log('❌ Multiple file upload error:', error.response?.data?.message || error.message);
    }
}

// Test file list retrieval
async function testGetFiles() {
    try {
        console.log('\n📋 Testing file list retrieval...');
        
        const response = await axios.get(
            `${API_URL}/upload/files?limit=5&sortBy=uploadDate&sortOrder=desc`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );
        
        if (response.data.success) {
            console.log('✅ File list retrieval successful!');
            console.log(`   Total files: ${response.data.count}`);
            console.log(`   Page: ${response.data.pagination.currentPage}/${response.data.pagination.totalPages}`);
            
            response.data.data.forEach((file, index) => {
                console.log(`   ${index + 1}. ${file.originalName} (${(file.size / 1024).toFixed(2)} KB) - ${file.category}`);
            });
        } else {
            console.log('❌ File list retrieval failed:', response.data.message);
        }
    } catch (error) {
        console.log('❌ File list retrieval error:', error.response?.data?.message || error.message);
    }
}

// Test file download
async function testFileDownload() {
    if (!uploadedFileId) {
        console.log('\n⚠️  Skipping file download test - no uploaded file ID available');
        return;
    }
    
    try {
        console.log('\n⬇️  Testing file download...');
        
        const response = await axios.get(
            `${API_URL}/upload/download/${uploadedFileId}`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                responseType: 'stream'
            }
        );
        
        console.log('✅ File download successful!');
        console.log(`   Content-Type: ${response.headers['content-type']}`);
        console.log(`   Content-Length: ${response.headers['content-length']} bytes`);
        
    } catch (error) {
        console.log('❌ File download error:', error.response?.data?.message || error.message);
    }
}

// Test file statistics (requires admin/staff role)
async function testFileStats() {
    try {
        console.log('\n📊 Testing file statistics...');
        
        const response = await axios.get(
            `${API_URL}/upload/stats?period=month&detailed=true`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );
        
        if (response.data.success) {
            console.log('✅ File statistics retrieval successful!');
            console.log(`   Total files: ${response.data.data.overview.totalFiles}`);
            console.log(`   Total size: ${(response.data.data.overview.totalSize / (1024 * 1024)).toFixed(2)} MB`);
            console.log(`   Average file size: ${(response.data.data.overview.averageFileSize / 1024).toFixed(2)} KB`);
        } else {
            console.log('❌ File statistics retrieval failed:', response.data.message);
        }
    } catch (error) {
        console.log('⚠️  File statistics error (may require admin/staff role):', error.response?.data?.message || error.message);
    }
}

// Main test function
async function runTests() {
    console.log('🧪 Starting Upload API Tests\n');
    console.log('='.repeat(50));
    
    // Register/authenticate test user first
    const authenticated = await registerTestUser();
    if (!authenticated) {
        console.log('\n❌ Cannot proceed without authentication. User registration/login failed.');
        return;
    }
    
    // Run all tests
    await testSingleFileUpload();
    await testMultipleFileUpload();
    await testGetFiles();
    await testFileDownload();
    await testFileStats();
    
    console.log('\n' + '='.repeat(50));
    console.log('🧪 Upload API Tests Completed');
    
    // Clean up test-files directory
    const testFilesDir = path.join(__dirname, 'test-files');
    if (fs.existsSync(testFilesDir)) {
        fs.rmSync(testFilesDir, { recursive: true, force: true });
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    runTests,
    testSingleFileUpload,
    testMultipleFileUpload,
    testGetFiles,
    testFileDownload,
    testFileStats
};