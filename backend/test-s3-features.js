const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Test user credentials  
const TEST_USER = {
    email: 'testuser@pashumnitra.com',
    password: 'TestPass123!'
};

let authToken = null;

// Helper function to authenticate
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

// Test S3 signed URL functionality
async function testS3SignedUrls() {
    try {
        console.log('\n🔗 Testing S3 signed URL functionality...');
        
        // Create a test file
        const testContent = 'This is a test file for S3 signed URL testing.';
        const testFilePath = path.join(__dirname, 'temp-s3-test.txt');
        fs.writeFileSync(testFilePath, testContent);
        
        // Upload file
        const formData = new FormData();
        formData.append('file', fs.createReadStream(testFilePath));
        formData.append('category', 'document');
        formData.append('description', 'S3 signed URL test file');
        
        const uploadResponse = await axios.post(
            `${API_URL}/upload/single`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );
        
        if (uploadResponse.data.success) {
            const fileData = uploadResponse.data.data;
            console.log('✅ File uploaded to S3 successfully!');
            console.log(`   File ID: ${fileData.id}`);
            console.log(`   S3 Key: ${fileData.s3Key}`);
            console.log(`   Cloud URL: ${fileData.cloudUrl}`);
            
            // Test signed URL access
            if (fileData.signedUrl) {
                console.log('\n🔐 Testing signed URL access...');
                try {
                    const signedUrlResponse = await axios.get(fileData.signedUrl, {
                        timeout: 10000
                    });
                    console.log('✅ Signed URL access successful!');
                    console.log(`   Content length: ${signedUrlResponse.data.length} characters`);
                    console.log(`   Content preview: "${signedUrlResponse.data.substring(0, 30)}..."`);
                } catch (urlError) {
                    console.log('❌ Signed URL access failed:', urlError.message);
                }
            } else {
                console.log('⚠️  No signed URL provided in response');
            }
            
            // Test download through API
            console.log('\n⬇️  Testing API download...');
            try {
                const downloadResponse = await axios.get(
                    `${API_URL}/upload/download/${fileData.id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${authToken}`
                        }
                    }
                );
                console.log('✅ API download successful!');
                console.log(`   Content length: ${downloadResponse.data.length} characters`);
            } catch (downloadError) {
                console.log('❌ API download failed:', downloadError.response?.data?.message || downloadError.message);
            }
            
            // Clean up test file
            fs.unlinkSync(testFilePath);
            
        } else {
            console.log('❌ File upload failed:', uploadResponse.data.message);
        }
    } catch (error) {
        console.log('❌ S3 signed URL test error:', error.response?.data?.message || error.message);
    }
}

// Test file categories and filtering
async function testFileFiltering() {
    try {
        console.log('\n📂 Testing file categorization and filtering...');
        
        // Test different categories
        const categories = ['image', 'document', 'video', 'audio', 'general'];
        
        for (const category of categories) {
            console.log(`\n📋 Fetching files in category: ${category}`);
            try {
                const response = await axios.get(
                    `${API_URL}/upload/files?category=${category}&limit=3`,
                    {
                        headers: {
                            'Authorization': `Bearer ${authToken}`
                        }
                    }
                );
                
                if (response.data.success) {
                    console.log(`✅ Found ${response.data.count} files in ${category} category`);
                    response.data.data.forEach((file, index) => {
                        console.log(`   ${index + 1}. ${file.originalName} (${(file.size / 1024).toFixed(2)} KB)`);
                    });
                } else {
                    console.log(`❌ Failed to fetch ${category} files:`, response.data.message);
                }
            } catch (error) {
                console.log(`❌ Error fetching ${category} files:`, error.response?.data?.message || error.message);
            }
        }
    } catch (error) {
        console.log('❌ File filtering test error:', error.message);
    }
}

// Test file search functionality
async function testFileSearch() {
    try {
        console.log('\n🔍 Testing file search functionality...');
        
        const searchTerms = ['test', 'document', '.txt'];
        
        for (const term of searchTerms) {
            console.log(`\n🔎 Searching for: "${term}"`);
            try {
                const response = await axios.get(
                    `${API_URL}/upload/files?search=${encodeURIComponent(term)}&limit=5`,
                    {
                        headers: {
                            'Authorization': `Bearer ${authToken}`
                        }
                    }
                );
                
                if (response.data.success) {
                    console.log(`✅ Found ${response.data.count} files matching "${term}"`);
                    response.data.data.forEach((file, index) => {
                        console.log(`   ${index + 1}. ${file.originalName} - ${file.category}`);
                    });
                } else {
                    console.log(`❌ Search failed for "${term}":`, response.data.message);
                }
            } catch (error) {
                console.log(`❌ Search error for "${term}":`, error.response?.data?.message || error.message);
            }
        }
    } catch (error) {
        console.log('❌ File search test error:', error.message);
    }
}

// Main test function
async function runS3Tests() {
    console.log('🧪 Starting S3 Feature Tests\n');
    console.log('='.repeat(60));
    
    // Authenticate first
    const authenticated = await authenticate();
    if (!authenticated) {
        console.log('\n❌ Cannot proceed without authentication.');
        return;
    }
    
    // Run S3-specific tests
    await testS3SignedUrls();
    await testFileFiltering(); 
    await testFileSearch();
    
    console.log('\n' + '='.repeat(60));
    console.log('🧪 S3 Feature Tests Completed');
}

// Run tests if this script is executed directly
if (require.main === module) {
    runS3Tests().catch(console.error);
}

module.exports = {
    runS3Tests,
    testS3SignedUrls,
    testFileFiltering,
    testFileSearch
};