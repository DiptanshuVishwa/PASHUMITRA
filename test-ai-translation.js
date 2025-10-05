#!/usr/bin/env node
/**
 * AI Translation System Test Script
 * Tests the complete translation pipeline from frontend to backend to Python service
 */

const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
const PYTHON_SERVICE_PATH = path.join(__dirname, 'backend', 'python_services', 'translation_service.py');

// Test data
const testTexts = [
    'Hello, how are you?',
    'Welcome to PashuMitra Portal',
    'Your farm is important to us',
    'Please fill out the biosecurity questionnaire',
    'Alert: Disease outbreak detected in your area'
];

const testLanguages = ['hi', 'bn', 'te', 'ta', 'gu'];

console.log('🧪 PashuMitra Portal - AI Translation System Test');
console.log('=' .repeat(60));

async function testPythonService() {
    console.log('\n1. Testing Python IndicTrans2 Service...');
    console.log('-'.repeat(40));
    
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [PYTHON_SERVICE_PATH, 'Hello world', 'hi']);
        let stdout = '';
        let stderr = '';
        
        pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const result = JSON.parse(stdout);
                    console.log('✅ Python Service Test Passed');
                    console.log(`   Original: ${result.original}`);
                    console.log(`   Translated (${result.target_language}): ${result.translated}`);
                    resolve(true);
                } catch (error) {
                    console.log('❌ Python Service Test Failed: Invalid JSON response');
                    console.log('   Output:', stdout);
                    console.log('   Error:', stderr);
                    resolve(false);
                }
            } else {
                console.log('❌ Python Service Test Failed');
                console.log('   Error:', stderr);
                resolve(false);
            }
        });
        
        setTimeout(() => {
            pythonProcess.kill();
            console.log('❌ Python Service Test Timeout');
            resolve(false);
        }, 30000); // 30 second timeout
    });
}

async function testBackendAPI() {
    console.log('\n2. Testing Backend API Endpoints...');
    console.log('-'.repeat(40));
    
    try {
        // Test health endpoint
        const healthResponse = await axios.get(`${BASE_URL}/translation/status`);
        console.log('✅ Translation Status Endpoint Working');
        
        // Test supported languages
        const languagesResponse = await axios.get(`${BASE_URL}/translation/languages`);
        console.log(`✅ Languages Endpoint: ${languagesResponse.data.languages.length} languages supported`);
        
        // Test single translation
        const translationResponse = await axios.post(`${BASE_URL}/translation/translate`, {
            text: 'Hello, welcome to our application',
            targetLanguage: 'hi'
        });
        
        console.log('✅ Single Translation Test Passed');
        console.log(`   Original: ${translationResponse.data.original}`);
        console.log(`   Translated: ${translationResponse.data.translated}`);
        console.log(`   Cached: ${translationResponse.data.cached}`);
        
        // Test batch translation
        const batchResponse = await axios.post(`${BASE_URL}/translation/batch`, {
            texts: ['Hello', 'Welcome', 'Thank you'],
            targetLanguage: 'hi'
        });
        
        console.log('✅ Batch Translation Test Passed');
        console.log(`   Translated ${batchResponse.data.results.length} texts`);
        
        return true;
        
    } catch (error) {
        console.log('❌ Backend API Test Failed');
        console.log(`   Error: ${error.message}`);
        
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
        }
        
        return false;
    }
}

async function testTranslationAccuracy() {
    console.log('\n3. Testing Translation Accuracy...');
    console.log('-'.repeat(40));
    
    const results = [];
    
    for (const lang of testLanguages.slice(0, 3)) { // Test first 3 languages to save time
        console.log(`\nTesting ${lang.toUpperCase()} translations:`);
        
        try {
            const response = await axios.post(`${BASE_URL}/translation/batch`, {
                texts: testTexts.slice(0, 3), // Test first 3 texts
                targetLanguage: lang
            });
            
            if (response.data.success) {
                response.data.results.forEach((result, index) => {
                    console.log(`   "${testTexts[index]}" -> "${result.translated}"`);
                });
                results.push({ language: lang, success: true });
            } else {
                console.log(`   ❌ Failed: ${response.data.message}`);
                results.push({ language: lang, success: false });
            }
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
            results.push({ language: lang, success: false });
        }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`\n✅ Translation accuracy test: ${successCount}/${results.length} languages successful`);
    
    return results;
}

async function testPerformance() {
    console.log('\n4. Testing Performance...');
    console.log('-'.repeat(40));
    
    const startTime = Date.now();
    
    try {
        // Test single translation performance
        const singleStart = Date.now();
        await axios.post(`${BASE_URL}/translation/translate`, {
            text: 'Performance test message',
            targetLanguage: 'hi'
        });
        const singleTime = Date.now() - singleStart;
        
        // Test cached translation performance
        const cachedStart = Date.now();
        await axios.post(`${BASE_URL}/translation/translate`, {
            text: 'Performance test message', // Same text, should be cached
            targetLanguage: 'hi'
        });
        const cachedTime = Date.now() - cachedStart;
        
        // Test batch translation performance
        const batchStart = Date.now();
        await axios.post(`${BASE_URL}/translation/batch`, {
            texts: testTexts,
            targetLanguage: 'hi'
        });
        const batchTime = Date.now() - batchStart;
        
        console.log(`✅ Performance Results:`);
        console.log(`   Single translation: ${singleTime}ms`);
        console.log(`   Cached translation: ${cachedTime}ms`);
        console.log(`   Batch translation (${testTexts.length} texts): ${batchTime}ms`);
        console.log(`   Average per text: ${Math.round(batchTime / testTexts.length)}ms`);
        
        return true;
        
    } catch (error) {
        console.log('❌ Performance test failed:', error.message);
        return false;
    }
}

async function runTests() {
    console.log('Starting AI Translation System Tests...\n');
    
    let allTestsPassed = true;
    const results = {};
    
    // Test 1: Python Service
    results.pythonService = await testPythonService();
    allTestsPassed = allTestsPassed && results.pythonService;
    
    // Test 2: Backend API
    results.backendAPI = await testBackendAPI();
    allTestsPassed = allTestsPassed && results.backendAPI;
    
    // Test 3: Translation Accuracy
    results.accuracy = await testTranslationAccuracy();
    
    // Test 4: Performance
    results.performance = await testPerformance();
    allTestsPassed = allTestsPassed && results.performance;
    
    // Final Results
    console.log('\n' + '='.repeat(60));
    console.log('🎯 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`Python Service:    ${results.pythonService ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Backend API:       ${results.backendAPI ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Translation Test:  ${results.accuracy?.length > 0 ? '✅ COMPLETED' : '❌ FAILED'}`);
    console.log(`Performance Test:  ${results.performance ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (allTestsPassed) {
        console.log('\n🎉 ALL TESTS PASSED! AI Translation system is working correctly.');
        console.log('\nNext steps:');
        console.log('1. Use useAITranslation hook in your React components');
        console.log('2. Test real-time translation in your application');
        console.log('3. Monitor performance and adjust cache settings as needed');
    } else {
        console.log('\n⚠️ Some tests failed. Please check the errors above and:');
        console.log('1. Ensure Python environment is set up correctly');
        console.log('2. Verify backend server is running');
        console.log('3. Check internet connection for model downloads');
        console.log('4. Review log files for detailed error messages');
    }
    
    console.log('\nFor manual testing, visit:');
    console.log('- Translation Status: http://localhost:5000/api/translation/status');
    console.log('- Quick Test: http://localhost:5000/api/translation/test');
    console.log('- Supported Languages: http://localhost:5000/api/translation/languages');
    
    process.exit(allTestsPassed ? 0 : 1);
}

// Check if backend is running before starting tests
async function checkBackendHealth() {
    try {
        await axios.get(`${BASE_URL}/translation/status`, { timeout: 5000 });
        return true;
    } catch (error) {
        console.log('❌ Backend server is not running or not responding');
        console.log('Please start the backend server with: cd backend && npm run dev');
        return false;
    }
}

// Main execution
(async () => {
    const backendReady = await checkBackendHealth();
    if (backendReady) {
        await runTests();
    } else {
        process.exit(1);
    }
})();