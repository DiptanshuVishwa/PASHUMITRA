import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { aiTranslationService } from '../services/aiTranslationService';
import i18n from '../utils/i18n';

/**
 * Enhanced translation hook that combines static i18n with dynamic AI translation
 * This hook provides both synchronous and asynchronous translation capabilities
 */
export const useSmartTranslation = () => {
  const { currentLanguage } = useLanguage();
  const [translations, setTranslations] = useState(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // Synchronous translation function for immediate rendering
  const t = useCallback((key, options = {}) => {
    // For English, always use i18n
    if (currentLanguage === 'en') {
      return i18n.t(key, options);
    }

    // For Hindi, prefer static i18n translations if available
    if (currentLanguage === 'hi') {
      const staticTranslation = i18n.t(key, options);
      if (staticTranslation !== key) {
        return staticTranslation;
      }
    }

    // Check if we have a cached AI translation
    const cacheKey = `${currentLanguage}:${key}`;
    if (translations.has(cacheKey)) {
      return translations.get(cacheKey);
    }

    // Check AI service cache
    const englishText = i18n.t(key, { ...options, lng: 'en' });
    const aiCacheKey = aiTranslationService.getCacheKey(englishText, currentLanguage);
    if (aiTranslationService.cache && aiTranslationService.cache.has(aiCacheKey)) {
      const cachedTranslation = aiTranslationService.cache.get(aiCacheKey);
      // Store in local state for faster future access
      setTranslations(prev => new Map(prev.set(cacheKey, cachedTranslation)));
      return cachedTranslation;
    }

    // If not in cache, trigger async translation and return fallback
    if (englishText !== key) {
      // Trigger async translation (don't await to avoid blocking render)
      aiTranslationService.translateText(englishText, currentLanguage)
        .then(translatedText => {
          setTranslations(prev => new Map(prev.set(cacheKey, translatedText)));
        })
        .catch(error => {
          console.warn(`Translation failed for key "${key}":`, error);
          // Store fallback in cache to avoid repeated failures
          setTranslations(prev => new Map(prev.set(cacheKey, englishText)));
        });

      // Return English text as immediate fallback
      return englishText;
    }

    // Ultimate fallback
    return key;
  }, [currentLanguage, translations]);

  // Batch translation function for preloading
  const preloadTranslations = useCallback(async (keys) => {
    if (currentLanguage === 'en') return;

    setIsLoading(true);
    const translationsToLoad = [];
    const englishTexts = [];

    // Collect keys that need translation
    for (const key of keys) {
      const cacheKey = `${currentLanguage}:${key}`;
      if (!translations.has(cacheKey)) {
        const englishText = i18n.t(key, { lng: 'en' });
        if (englishText !== key) {
          translationsToLoad.push({ key, englishText, cacheKey });
          englishTexts.push(englishText);
        }
      }
    }

    if (translationsToLoad.length > 0) {
      try {
        // Use batch translation for efficiency
        const translatedTexts = await aiTranslationService.translateBatch(
          englishTexts,
          currentLanguage
        );

        // Update translations state
        setTranslations(prev => {
          const newTranslations = new Map(prev);
          translationsToLoad.forEach((item, index) => {
            newTranslations.set(item.cacheKey, translatedTexts[index] || item.englishText);
          });
          return newTranslations;
        });

        console.log(`✅ Preloaded ${translatedTexts.length} translations for ${currentLanguage}`);
      } catch (error) {
        console.warn('Batch translation preloading failed:', error);
      }
    }

    setIsLoading(false);
  }, [currentLanguage, translations]);

  // Clear translations when language changes
  useEffect(() => {
    setTranslations(new Map());
  }, [currentLanguage]);

  // Auto-preload common UI translations
  useEffect(() => {
    const commonUIKeys = [
      'nav.dashboard',
      'nav.compliance', 
      'nav.learning',
      'nav.riskAssessment',
      'nav.raiseAlert',
      'nav.notifications',
      'nav.profile',
      'nav.settings',
      'nav.logout',
      'nav.faq',
      'nav.privacy',
      'nav.feedback',
      'nav.contactVet',
      'nav.contactUs',
      'common.loading',
      'common.error',
      'common.success',
      'common.warning',
      'common.yes',
      'common.no',
      'common.submit',
      'common.cancel',
      'common.save',
      'common.delete',
      'common.edit',
      'landing.title',
      'landing.tagline'
    ];

    if (currentLanguage !== 'en') {
      preloadTranslations(commonUIKeys);
    }
  }, [currentLanguage, preloadTranslations]);

  // Get translation progress for debugging
  const getTranslationStats = useCallback(() => {
    return {
      currentLanguage,
      totalCached: translations.size,
      aiServiceStats: aiTranslationService.getCacheStats ? aiTranslationService.getCacheStats() : null,
      isLoading
    };
  }, [currentLanguage, translations.size, isLoading]);

  return {
    t,                        // Main translation function (synchronous)
    preloadTranslations,      // Preload multiple translations
    getTranslationStats,      // Debug information
    isLoading,               // Loading state for preloading
    currentLanguage          // Current language code
  };
};

export default useSmartTranslation;
