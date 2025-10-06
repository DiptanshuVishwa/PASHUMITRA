import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { getTranslation } from '../utils/translations';

/**
 * Enhanced translation hook for page-level translations
 * Provides simple translation function and language info
 */
export const usePageTranslation = () => {
  const { currentLanguage, setLanguage, languages } = useContext(LanguageContext);
  
  // Translation function with fallback
  const t = (text, fallback = null) => {
    if (!text) return fallback || '';
    
    // Get translation or return original text
    const translated = getTranslation(text, currentLanguage);
    return translated !== text ? translated : (fallback || text);
  };
  
  // Check if translation exists
  const hasTranslation = (text) => {
    if (!text || currentLanguage === 'en') return true;
    return getTranslation(text, currentLanguage) !== text;
  };
  
  // Get current language info
  const getCurrentLanguageInfo = () => {
    return languages?.find(lang => lang.code === currentLanguage) || {
      code: 'en',
      name: 'English',
      nativeName: 'English'
    };
  };
  
  return {
    t,                    // Main translation function
    hasTranslation,       // Check if translation exists
    currentLanguage,      // Current language code
    setLanguage,          // Function to change language
    languages,            // Available languages
    languageInfo: getCurrentLanguageInfo(), // Current language details
    isTranslatable: currentLanguage !== 'en' // Whether current language needs translation
  };
};

export default usePageTranslation;