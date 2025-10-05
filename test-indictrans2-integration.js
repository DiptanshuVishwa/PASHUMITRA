const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

// Test data for translation
const testCases = [
    {
        text: "Welcome to PashuMitra Portal",
        targetLanguage: "hi",
        description: "English to Hindi"
    },
    {
        text: "Livestock health monitoring system",
        targetLanguage: "hi", 
        description: "Technical term translation"
    },
    {
        text: "Disease alert notification",
        targetLanguage: "bn",
        description: "English to Bengali"
    },
    {
        text: "Veterinarian consultation available",
        targetLanguage: "ta",
        description: "English to Tamil"
    },
    {
        text: "Report your animal's health status",
        targetLanguage: "te",
        description: "English to Telugu"
    }
];

const batchTestData = [
    "Welcome to PashuMitra Portal",
    "Livestock health monitoring",
    "Disease alert system",
    "Veterinarian consultation",
    "Health status report"
];

async function testTranslationAPI() {
    console.log('🚀 Testing IndicTrans2 Integration with PashuMitra Portal Backend\n');

    try {
        // 1. Test service status
        console.log('1️⃣ Testing Translation Service Status...');
        try {
            const statusResponse = await axios.get(`${API_BASE}/translation/status`);
            console.log('✅ Status Response:', JSON.stringify(statusResponse.data, null, 2));
        } catch (error) {
            console.log('❌ Status check failed:', error.response?.data || error.message);
        }
        console.log('\n' + '='.repeat(60) + '\n');

        // 2. Test supported languages
        console.log('2️⃣ Testing Supported Languages...');
        try {
            const languagesResponse = await axios.get(`${API_BASE}/translation/languages`);
            console.log('✅ Supported Languages:');
            languagesResponse.data.languages.forEach(lang => {
                console.log(`   - ${lang.name} (${lang.code}): ${lang.nativeName}`);
            });
        } catch (error) {
            console.log('❌ Languages fetch failed:', error.response?.data || error.message);
        }
        console.log('\n' + '='.repeat(60) + '\n');

        // 3. Test individual translations
        console.log('3️⃣ Testing Individual Translations...');
        for (const testCase of testCases) {
            console.log(`\n📝 Testing: ${testCase.description}`);
            console.log(`   Original: "${testCase.text}"`);
            
            try {
                const translationResponse = await axios.post(`${API_BASE}/translation/translate`, {
                    text: testCase.text,
                    targetLanguage: testCase.targetLanguage
                });

                if (translationResponse.data.success) {
                    console.log(`   ✅ Translated: "${translationResponse.data.translated}"`);
                    console.log(`   🔧 Processing time: ${translationResponse.data.processingTime}ms`);
                    console.log(`   💾 Cached: ${translationResponse.data.cached || false}`);
                } else {
                    console.log(`   ❌ Translation failed: ${translationResponse.data.error}`);
                }
            } catch (error) {
                console.log(`   ❌ API call failed:`, error.response?.data || error.message);
            }
        }
        console.log('\n' + '='.repeat(60) + '\n');

        // 4. Test batch translation
        console.log('4️⃣ Testing Batch Translation...');
        console.log('📦 Batch texts:', batchTestData);
        
        try {
            const batchResponse = await axios.post(`${API_BASE}/translation/batch`, {
                texts: batchTestData,
                targetLanguage: "hi"
            });

            if (batchResponse.data.success) {
                console.log('✅ Batch Translation Results:');
                batchResponse.data.results.forEach((result, index) => {
                    console.log(`   ${index + 1}. "${result.original}" → "${result.translated}"`);
                });
                console.log(`   🔧 Total processing time: ${batchResponse.data.processingTime}ms`);
                console.log(`   📊 Total texts processed: ${batchResponse.data.totalTexts}`);
            } else {
                console.log('❌ Batch translation failed:', batchResponse.data.error);
            }
        } catch (error) {
            console.log('❌ Batch API call failed:', error.response?.data || error.message);
        }
        console.log('\n' + '='.repeat(60) + '\n');

        // 5. Test object translation
        console.log('5️⃣ Testing Object Translation...');
        const sampleObject = {
            title: "Animal Health Alert",
            description: "Your livestock requires immediate veterinary attention",
            message: "Please contact your veterinarian as soon as possible",
            severity: "high",
            timestamp: new Date().toISOString()
        };

        console.log('📄 Sample object:', JSON.stringify(sampleObject, null, 2));
        
        try {
            const objectResponse = await axios.post(`${API_BASE}/translation/object`, {
                data: sampleObject,
                targetLanguage: "hi",
                keyPaths: ["title", "description", "message"] // Only translate these fields
            });

            if (objectResponse.data.success) {
                console.log('✅ Translated Object:');
                console.log(JSON.stringify(objectResponse.data.translatedData, null, 2));
                console.log(`   🔧 Processing time: ${objectResponse.data.processingTime}ms`);
            } else {
                console.log('❌ Object translation failed:', objectResponse.data.error);
            }
        } catch (error) {
            console.log('❌ Object API call failed:', error.response?.data || error.message);
        }
        console.log('\n' + '='.repeat(60) + '\n');

        // 6. Test service test endpoint
        console.log('6️⃣ Testing Service Test Endpoint...');
        try {
            const testResponse = await axios.get(`${API_BASE}/translation/test?lang=hi&text=Welcome to PashuMitra`);
            console.log('✅ Service Test Result:', JSON.stringify(testResponse.data, null, 2));
        } catch (error) {
            console.log('❌ Service test failed:', error.response?.data || error.message);
        }

        console.log('\n🎉 IndicTrans2 Integration Testing Complete!');

    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
}

// Performance testing function
async function performanceTest() {
    console.log('\n🏃‍♂️ Running Performance Test...');
    
    const testText = "Livestock health monitoring system with real-time alerts";
    const iterations = 5;
    const results = [];

    for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        try {
            const response = await axios.post(`${API_BASE}/translation/translate`, {
                text: testText,
                targetLanguage: "hi"
            });
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            results.push(duration);
            
            console.log(`   Run ${i + 1}: ${duration}ms ${response.data.cached ? '(cached)' : '(fresh)'}`);
        } catch (error) {
            console.log(`   Run ${i + 1}: Failed - ${error.message}`);
        }
    }

    if (results.length > 0) {
        const avg = results.reduce((a, b) => a + b, 0) / results.length;
        const min = Math.min(...results);
        const max = Math.max(...results);
        
        console.log(`\n📊 Performance Summary:`);
        console.log(`   Average: ${avg.toFixed(2)}ms`);
        console.log(`   Minimum: ${min}ms`);
        console.log(`   Maximum: ${max}ms`);
    }
}

// Main execution
async function main() {
    console.log('Starting IndicTrans2 Integration Tests...\n');
    
    // Check if server is running
    try {
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('🟢 Backend server is running');
        console.log(`   Environment: ${healthResponse.data.environment}`);
        console.log(`   Uptime: ${healthResponse.data.uptime}s\n`);
    } catch (error) {
        console.log('🔴 Backend server is not running or not accessible');
        console.log('   Please start the backend server with: npm run dev (in backend directory)\n');
        process.exit(1);
    }

    await testTranslationAPI();
    await performanceTest();
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Test interrupted by user');
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Run the tests
main();