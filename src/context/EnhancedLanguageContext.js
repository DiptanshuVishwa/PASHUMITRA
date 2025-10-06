import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import i18n from '../utils/i18n';
import { aiTranslationService } from '../services/aiTranslationService';
import { showInfo, showSuccess, showError } from '../services/notificationService';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Supported languages - English + 9 Indian languages in specified order
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' }
];

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isFirstTimeLanguage, setIsFirstTimeLanguage] = useState(false);

  // Track languages that have been loaded (models warmed up)
  const [warmLanguages, setWarmLanguages] = useState(new Set(['en', 'hi'])); // English and Hindi are fast

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('pashumitra_language');
    if (savedLanguage && SUPPORTED_LANGUAGES.find(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    }

    // Listen to i18n language change events
    const handleLanguageChanged = (lng) => {
      setCurrentLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChanged);

    // Cleanup event listener
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  // Preload common translations for a language
  const preloadLanguage = useCallback(async (languageCode) => {
    if (languageCode === 'en' || warmLanguages.has(languageCode)) {
      return; // Already warm
    }

    try {
      setLoadingMessage(`Warming up ${SUPPORTED_LANGUAGES.find(l => l.code === languageCode)?.name} translation models...`);
      setLoadingProgress(30);

      // Preload common UI texts
      const commonTexts = [
        "Welcome to PashuMitra Portal",
        "Dashboard", 
        "Alerts",
        "Profile",
        "Settings",
        "Loading...",
        "Save",
        "Cancel",
        "Submit"
      ];

      setLoadingProgress(60);
      await aiTranslationService.translateBatch(commonTexts, languageCode);
      
      setLoadingProgress(90);
      
      // Mark language as warm
      setWarmLanguages(prev => new Set([...prev, languageCode]));
      
      setLoadingProgress(100);
      console.log(`✅ ${languageCode} language models preloaded and ready!`);
      
    } catch (error) {
      console.warn(`⚠️ Failed to preload ${languageCode}:`, error);
      showError(`Failed to prepare ${languageCode} translation. Using fallback.`);
    }
  }, [warmLanguages]);

  const changeLanguage = async (languageCode) => {
    if (currentLanguage === languageCode) {
      return; // Same language
    }

    console.log('🌍 Changing language to:', languageCode);
    
    const langInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
    const isFirstTime = !warmLanguages.has(languageCode) && languageCode !== 'en';
    
    setIsLoading(true);
    setLoadingProgress(0);
    setIsFirstTimeLanguage(isFirstTime);

    try {
      if (isFirstTime) {
        // Show user-friendly message for first-time language loading
        showInfo(`Loading ${langInfo?.nativeName || languageCode} for the first time. This may take 20-30 seconds.`);
        setLoadingMessage(`Loading ${langInfo?.name} language models...`);
        setLoadingProgress(10);
      }

      // Change i18n language first (instant for static translations)
      await i18n.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      localStorage.setItem('pashumitra_language', languageCode);
      
      setLoadingProgress(isFirstTime ? 20 : 80);

      // For non-English languages, preload AI translation models
      if (languageCode !== 'en' && !warmLanguages.has(languageCode)) {
        await preloadLanguage(languageCode);
        showSuccess(`${langInfo?.nativeName} translation is now ready!`);
      }

      setLoadingProgress(100);
      console.log('✅ Language changed successfully to:', languageCode);
      
    } catch (error) {
      console.error('❌ Error changing language:', error);
      showError(`Failed to change language to ${langInfo?.name}. Please try again.`);
    } finally {
      // Smooth loading completion
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
        setLoadingMessage('');
        setIsFirstTimeLanguage(false);
      }, 500);
    }
  };

  const getCurrentLanguage = () => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  };

  const isLanguageReady = (langCode) => {
    return langCode === 'en' || warmLanguages.has(langCode);
  };

  const t = (key, options = {}) => {
    return i18n.t(key, options);
  };

  const value = {
    currentLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    changeLanguage,
    getCurrentLanguage,
    isLoading,
    loadingProgress,
    loadingMessage,
    isFirstTimeLanguage,
    isLanguageReady,
    warmLanguages: Array.from(warmLanguages),
    preloadLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};