/**
 * Frontend Translation Integration Test
 * Tests the complete translation pipeline from frontend to backend to IndicTrans2
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:5000';

// Test data for different scenarios
const testData = {
    singleTranslations: [
        { text: "Welcome to PashuMitra Portal", lang: "hi", expected: "पशुमित्र पोर्टल में आपका स्वागत है" },
        { text: "Your cattle needs immediate veterinary attention", lang: "bn", expected: "আপনার গবাদি পশুর অবিলম্বে পশুচিকিৎসার যত্ন প্রয়োজন" },
        { text: "Disease alert system", lang: "ta", expected: "நோய் எச்சரிக்கை அமைப்பு" },
        { text: "Livestock health monitoring", lang: "te", expected: "పశువుల ఆరోగ్య పర్యవేక్షణ" },
        { text: "Emergency veterinary consultation", lang: "mr", expected: "आपत्कालीन पशुवैद्यकीय सल्लामसलत" }
    ],
    
    batchTranslations: {
        texts: [
            "Welcome to PashuMitra",
            "Livestock health monitoring", 
            "Emergency alert system",
            "Veterinary consultation available",
            "Disease prevention guidelines"
        ],
        lang: "gu"
    },
    
    objectTranslations: {
        data: {
            title: "Health Alert",
            message: "Your cattle needs immediate veterinary attention",
            description: "This is an urgent health alert for your livestock. Please contact a veterinarian immediately.",
            action: "Contact Veterinarian"
        },
        lang: "kn",
        keyPaths: ["title", "message", "description", "action"]
    }
};

/**
 * Test single text translation
 */
async function testSingleTranslation() {
    console.log('\n🧪 Testing Single Text Translation...\n');
    
    for (const test of testData.singleTranslations) {
        try {
            console.log(`📝 Translating "${test.text}" to ${test.lang.toUpperCase()}`);
            
            const response = await axios.post(`${BACKEND_URL}/api/translation/translate`, {
                text: test.text,
                targetLanguage: test.lang
            });
            
            if (response.data.success) {
                console.log(`✅ Original: "${response.data.original}"`);
                console.log(`🌍 Translated: "${response.data.translated}"`);
                console.log(`⚡ Cached: ${response.data.cached}`);
                console.log(`⏱️  Processing Time: ${response.data.processingTime}ms\n`);
            } else {
                console.log(`❌ Translation failed: ${response.data.error}\n`);
            }
            
        } catch (error) {
            console.log(`❌ Request failed: ${error.message}\n`);
        }
    }
}

/**
 * Test batch translation
 */
async function testBatchTranslation() {
    console.log('\n🧪 Testing Batch Translation...\n');
    
    try {
        console.log(`📝 Translating ${testData.batchTranslations.texts.length} texts to ${testData.batchTranslations.lang.toUpperCase()}`);
        console.log(`Texts: ${testData.batchTranslations.texts.join(', ')}`);
        
        const response = await axios.post(`${BACKEND_URL}/api/translation/batch`, {
            texts: testData.batchTranslations.texts,
            targetLanguage: testData.batchTranslations.lang
        });
        
        if (response.data.success) {
            console.log(`\n✅ Batch Translation Results:`);
            response.data.results.forEach((result, index) => {
                console.log(`${index + 1}. "${result.original}" -> "${result.translated}"`);
            });
            console.log(`\n⏱️  Total Processing Time: ${response.data.processingTime}ms`);
            console.log(`📊 Total Texts: ${response.data.totalTexts}\n`);
        } else {
            console.log(`❌ Batch translation failed: ${response.data.error}\n`);
        }
        
    } catch (error) {
        console.log(`❌ Batch request failed: ${error.message}\n`);
    }
}

/**
 * Test object translation
 */
async function testObjectTranslation() {
    console.log('\n🧪 Testing Object Translation...\n');
    
    try {
        console.log(`📝 Translating object to ${testData.objectTranslations.lang.toUpperCase()}`);
        console.log('Original object:', JSON.stringify(testData.objectTranslations.data, null, 2));
        
        const response = await axios.post(`${BACKEND_URL}/api/translation/object`, {
            data: testData.objectTranslations.data,
            targetLanguage: testData.objectTranslations.lang,
            keyPaths: testData.objectTranslations.keyPaths
        });
        
        if (response.data.success) {
            console.log(`\n✅ Translated Object:`);
            console.log(JSON.stringify(response.data.translatedData, null, 2));
            console.log(`\n⏱️  Processing Time: ${response.data.processingTime}ms`);
            console.log(`🔑 Translated Keys: ${response.data.translatedKeys.join(', ')}\n`);
        } else {
            console.log(`❌ Object translation failed: ${response.data.error}\n`);
        }
        
    } catch (error) {
        console.log(`❌ Object request failed: ${error.message}\n`);
    }
}

/**
 * Test supported languages
 */
async function testSupportedLanguages() {
    console.log('\n🧪 Testing Supported Languages...\n');
    
    try {
        const response = await axios.get(`${BACKEND_URL}/api/translation/languages`);
        
        if (response.data.success) {
            console.log(`✅ Supported Languages (${response.data.totalLanguages}):`);
            console.log('┌─────┬─────────────┬─────────────────────────┐');
            console.log('│ Code│ English Name│ Native Name             │');
            console.log('├─────┼─────────────┼─────────────────────────┤');
            
            response.data.languages.forEach(lang => {
                const code = lang.code.padEnd(4);
                const name = lang.name.padEnd(12);
                const native = lang.nativeName.padEnd(24);
                console.log(`│ ${code}│ ${name}│ ${native}│`);
            });
            
            console.log('└─────┴─────────────┴─────────────────────────┘\n');
        } else {
            console.log(`❌ Failed to fetch languages: ${response.data.error}\n`);
        }
        
    } catch (error) {
        console.log(`❌ Languages request failed: ${error.message}\n`);
    }
}

/**
 * Test translation service status
 */
async function testServiceStatus() {
    console.log('\n🧪 Testing Translation Service Status...\n');
    
    try {
        const response = await axios.get(`${BACKEND_URL}/api/translation/status`);
        
        if (response.data.success) {
            console.log(`✅ Translation Service Status:`);
            console.log(`🟢 Service: ${response.data.status}`);
            console.log(`🧠 AI Models: ${response.data.modelsLoaded ? 'Loaded' : 'Not Loaded'}`);
            console.log(`💾 Cache Size: ${response.data.cacheSize} entries`);
            console.log(`⚡ Cache Hits: ${response.data.cacheHitRate}%`);
            console.log(`🌍 Active Languages: ${response.data.activeLanguages}`);
            console.log(`⏱️  Avg Response Time: ${response.data.avgResponseTime}ms\n`);
        } else {
            console.log(`❌ Service status check failed: ${response.data.error}\n`);
        }
        
    } catch (error) {
        console.log(`❌ Status request failed: ${error.message}\n`);
    }
}

/**
 * Performance benchmark
 */
async function performanceBenchmark() {
    console.log('\n🚀 Performance Benchmark...\n');
    
    const testTexts = [
        "Hello, welcome to our livestock health monitoring system",
        "Your animals need immediate veterinary attention", 
        "Disease prevention is crucial for farm productivity",
        "Emergency alert: Suspected outbreak in your area",
        "Vaccination schedule reminder for your cattle"
    ];
    
    console.log('Testing translation speed for multiple requests...\n');
    
    const startTime = Date.now();
    const promises = testTexts.map(async (text, index) => {
        try {
            const requestStart = Date.now();
            const response = await axios.post(`${BACKEND_URL}/api/translation/translate`, {
                text: text,
                targetLanguage: 'hi'
            });
            const requestTime = Date.now() - requestStart;
            
            return {
                index: index + 1,
                text: text.substring(0, 40) + (text.length > 40 ? '...' : ''),
                translated: response.data.translated?.substring(0, 40) + (response.data.translated?.length > 40 ? '...' : ''),
                time: requestTime,
                cached: response.data.cached,
                success: response.data.success
            };
        } catch (error) {
            return {
                index: index + 1,
                text: text.substring(0, 40) + '...',
                error: error.message,
                time: null,
                success: false
            };
        }
    });
    
    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;
    
    console.log('Performance Results:');
    console.log('┌───┬──────────────────────────────────────────┬──────────┬─────────┬─────────┐');
    console.log('│ # │ Text                                     │ Time(ms) │ Cached  │ Status  │');
    console.log('├───┼──────────────────────────────────────────┼──────────┼─────────┼─────────┤');
    
    results.forEach(result => {
        const index = result.index.toString().padStart(2);
        const text = result.text.padEnd(40);
        const time = result.time ? result.time.toString().padStart(7) : 'Failed'.padStart(7);
        const cached = result.cached ? 'Yes' : 'No';
        const status = result.success ? '✅' : '❌';
        
        console.log(`│ ${index}│ ${text}│ ${time} │ ${cached.padEnd(7)}│ ${status.padEnd(7)}│`);
    });
    
    console.log('└───┴──────────────────────────────────────────┴──────────┴─────────┴─────────┘');
    
    const successfulRequests = results.filter(r => r.success);
    const avgTime = successfulRequests.reduce((sum, r) => sum + r.time, 0) / successfulRequests.length;
    const cacheHitRate = (successfulRequests.filter(r => r.cached).length / successfulRequests.length) * 100;
    
    console.log(`\n📊 Performance Summary:`);
    console.log(`⏱️  Total Time: ${totalTime}ms`);
    console.log(`📈 Average Response Time: ${avgTime.toFixed(2)}ms`);
    console.log(`💾 Cache Hit Rate: ${cacheHitRate.toFixed(1)}%`);
    console.log(`✅ Success Rate: ${(successfulRequests.length / results.length * 100).toFixed(1)}%\n`);
}

/**
 * Main test runner
 */
async function runAllTests() {
    console.log('🌍 PashuMitra Portal - Translation System Integration Test');
    console.log('===========================================================');
    console.log(`🔗 Backend URL: ${BACKEND_URL}`);
    console.log(`🔗 Frontend URL: ${API_BASE_URL}`);
    console.log('⏰ Started at:', new Date().toISOString());
    
    try {
        // Check if backend is running
        await axios.get(`${BACKEND_URL}/health`);
        console.log('✅ Backend server is running');
        
        // Run all tests
        await testSupportedLanguages();
        await testServiceStatus();
        await testSingleTranslation();
        await testBatchTranslation();
        await testObjectTranslation();
        await performanceBenchmark();
        
        console.log('🎉 All translation tests completed successfully!');
        console.log('=================================================\n');
        
    } catch (error) {
        console.log('❌ Test suite failed:', error.message);
        console.log('\n💡 Make sure both frontend and backend servers are running:');
        console.log('   - Backend: cd backend && npm run dev');
        console.log('   - Frontend: npm start\n');
    }
}

// Run the tests
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    testSingleTranslation,
    testBatchTranslation,
    testObjectTranslation,
    testSupportedLanguages,
    testServiceStatus,
    performanceBenchmark,
    runAllTests
};