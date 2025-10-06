/**
 * Test Translation Fix Implementation
 * Verifies that the enhanced translation system is working
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';

async function testTranslationFix() {
    console.log('🧪 Testing Translation Fix Implementation');
    console.log('========================================\n');

    try {
        // Test 1: Verify backend is running
        console.log('1. Checking backend connection...');
        await axios.get(`${BACKEND_URL}/health`);
        console.log('✅ Backend is running\n');

        // Test 2: Test Bengali translation (the problem case)
        console.log('2. Testing Bengali translation (the issue you experienced)...');
        const start = Date.now();
        
        const response = await axios.post(`${BACKEND_URL}/api/translation/translate`, {
            text: "Dashboard",
            targetLanguage: "bn"
        });
        
        const duration = Date.now() - start;
        
        if (response.data.success) {
            console.log(`✅ Translation successful!`);
            console.log(`   Original: "${response.data.original}"`);
            console.log(`   Bengali: "${response.data.translated}"`);
            console.log(`   Time taken: ${duration}ms`);
            console.log(`   Cached: ${response.data.cached}`);
        }
        
        // Test 3: Test the same translation again (should be cached/faster)
        console.log('\n3. Testing cached translation...');
        const start2 = Date.now();
        
        const response2 = await axios.post(`${BACKEND_URL}/api/translation/translate`, {
            text: "Dashboard",
            targetLanguage: "bn"
        });
        
        const duration2 = Date.now() - start2;
        
        if (response2.data.success) {
            console.log(`✅ Cached translation successful!`);
            console.log(`   Bengali: "${response2.data.translated}"`);
            console.log(`   Time taken: ${duration2}ms (should be much faster)`);
            console.log(`   Cached: ${response2.data.cached}`);
        }

        // Test 4: Test multiple navigation terms
        console.log('\n4. Testing navigation terms translation...');
        
        const navTerms = ['Home', 'Dashboard', 'Compliance', 'Risk Assessment', 'Raise an Alert'];
        
        const batchResponse = await axios.post(`${BACKEND_URL}/api/translation/batch`, {
            texts: navTerms,
            targetLanguage: "bn"
        });
        
        if (batchResponse.data.success) {
            console.log('✅ Batch navigation translation successful!');
            batchResponse.data.results.forEach((result, index) => {
                console.log(`   ${navTerms[index]} → ${result.translated}`);
            });
        }

        console.log('\n🎉 Translation Fix Verification Complete!');
        console.log('==========================================\n');
        
        console.log('📋 Next Steps:');
        console.log('1. Open your browser to http://localhost:3000');
        console.log('2. Select Bengali (বাংলা) from the language dropdown');
        console.log('3. You should now see:');
        console.log('   • Beautiful loading modal with progress bar');
        console.log('   • Toast notification: "Loading বাংলা for the first time..."');
        console.log('   • Progress updates and completion message');
        console.log('   • Smooth transition to Bengali interface');
        console.log('\n💡 The loading will only happen ONCE per language.');
        console.log('   Subsequent switches to Bengali will be instant!');

    } catch (error) {
        console.log('❌ Test failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure your backend server is running:');
            console.log('   cd backend && npm run dev');
        }
    }
}

// Run the test
testTranslationFix();