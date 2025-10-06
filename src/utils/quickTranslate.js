/**
 * Quick AI Translation Utility
 * Simple helper to translate navigation and UI elements immediately
 */

import { aiTranslationService } from '../services/aiTranslationService';

// Cache for immediate translation results
const translationCache = new Map();

/**
 * Quick translate function that returns translated text or fallback immediately
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @param {string} fallback - Fallback text (defaults to original text)
 * @returns {string} Translated text or fallback
 */
export const quickTranslate = async (text, targetLang, fallback = text) => {
  // Return original for English
  if (targetLang === 'en' || !text) {
    return text;
  }

  // Check cache first
  const cacheKey = `${targetLang}:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    // Try AI translation
    const translated = await aiTranslationService.translateText(text, targetLang);
    
    // Cache the result
    translationCache.set(cacheKey, translated);
    
    return translated;
  } catch (error) {
    console.warn(`Quick translate failed for "${text}" to ${targetLang}:`, error);
    return fallback;
  }
};

/**
 * Navigation items with their translations
 * Pre-defined translations for common navigation items
 */
export const navTranslations = {
  'en': {
    'Home': 'Home',
    'Dashboard': 'Dashboard',
    'Compliance': 'Compliance',
    'Risk Assessment': 'Risk Assessment',
    'Raise an Alert': 'Raise an Alert',
    'Profile': 'Profile',
    'Settings': 'Settings',
    'Logout': 'Logout',
    'Login': 'Login',
    'Sign Up': 'Sign Up'
  },
  'hi': {
    'Home': 'होम',
    'Dashboard': 'डैशबोर्ड',
    'Compliance': 'अनुपालन',
    'Risk Assessment': 'जोखिम मूल्यांकन',
    'Raise an Alert': 'अलर्ट भेजें',
    'Profile': 'प्रोफाइल',
    'Settings': 'सेटिंग्स',
    'Logout': 'लॉगआउट',
    'Login': 'लॉगिन',
    'Sign Up': 'साइन अप'
  },
  'bn': {
    'Home': 'হোম',
    'Dashboard': 'ড্যাশবোর্ড',
    'Compliance': 'মেনে চলা',
    'Risk Assessment': 'ঝুঁকি মূল্যায়ন',
    'Raise an Alert': 'সতর্কতা পাঠান',
    'Profile': 'প্রোফাইল',
    'Settings': 'সেটিংস',
    'Logout': 'লগআউট',
    'Login': 'লগিন',
    'Sign Up': 'সাইন আপ'
  },
  'te': {
    'Home': 'హోమ్',
    'Dashboard': 'డాష్‌బోర్డ్',
    'Compliance': 'సంబంధం',
    'Risk Assessment': 'ప్రమాద అంచనా',
    'Raise an Alert': 'అలర్ట్ పంపండి',
    'Profile': 'ప్రొఫైల్',
    'Settings': 'సెట్టింగులు',
    'Logout': 'లాగౌట్',
    'Login': 'లాగిన్',
    'Sign Up': 'సైన్ అప్'
  }
};

/**
 * Get translation for navigation item (with fallback to static translations)
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @returns {string} Translated text
 */
export const getNavTranslation = (text, targetLang) => {
  // Return original for English
  if (targetLang === 'en') {
    return text;
  }

  // Check static translations first (fast)
  if (navTranslations[targetLang] && navTranslations[targetLang][text]) {
    return navTranslations[targetLang][text];
  }

  // Check AI translation cache
  const cacheKey = `${targetLang}:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  // Trigger AI translation in background (don't wait for result)
  quickTranslate(text, targetLang).then(translated => {
    if (translated !== text) {
      // Force re-render by triggering a custom event
      window.dispatchEvent(new CustomEvent('translation-ready', {
        detail: { text, targetLang, translated }
      }));
    }
  });

  // Return original text while waiting for AI translation
  return text;
};