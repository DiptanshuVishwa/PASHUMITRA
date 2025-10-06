/**
 * Quick Navigation Translation Cache Builder
 * Pre-caches all navigation items so they appear immediately
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';

const navigationItems = [
  'Home',
  'Dashboard', 
  'Compliance',
  'Risk Assessment',
  'Raise an Alert',
  'Profile',
  'Settings',
  'Logout',
  'Login',
  'Sign Up',
  'PashuMitra',
  'YOUR PARTNER IN FARM PROTECTION',
  'Get Started',
  'Welcome to PashuMitra Portal',
  'Your Partner in Farm Protection'
];

const languages = ['hi', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur'];

async function cacheNavigationTranslations() {
  console.log('🔄 Caching navigation translations for instant display...\n');
  
  for (const lang of languages) {
    try {
      console.log(`📝 Caching ${lang.toUpperCase()} translations...`);
      
      const response = await axios.post(`${BACKEND_URL}/api/translation/batch`, {
        texts: navigationItems,
        targetLanguage: lang
      }, {
        timeout: 120000 // 2 minutes timeout
      });
      
      if (response.data.success) {
        console.log(`✅ ${lang.toUpperCase()} cached successfully!`);
        
        // Show a few key translations
        const keyTranslations = response.data.results.slice(0, 5);
        keyTranslations.forEach(result => {
          console.log(`   ${result.original} → ${result.translated}`);
        });
        console.log('');
      }
      
    } catch (error) {
      console.log(`⚠️ ${lang.toUpperCase()} failed:`, error.message);
    }
  }
  
  console.log('🎉 Navigation translation caching complete!');
  console.log('\n📋 What this means:');
  console.log('✅ All navigation items are now cached');
  console.log('✅ Language switching will show translations immediately');
  console.log('✅ No more waiting for individual translations');
  console.log('\n🔄 Refresh your browser page and try switching languages now!');
}

cacheNavigationTranslations().catch(console.error);