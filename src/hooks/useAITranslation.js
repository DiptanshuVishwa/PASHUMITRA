import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { aiTranslationService, aiTranslate } from '../services/aiTranslationService';

/**
 * Hybrid Translation Hook
 * Combines AI-powered IndicTrans2 translations with i18next fallback
 */
export const useAITranslation = () => {
    const { t: i18nTranslate, i18n } = useTranslation();
    const { currentLanguage } = useLanguage();
    const [isAITranslationReady, setIsAITranslationReady] = useState(false);
    const [translationCache, setTranslationCache] = useState(new Map());
    
    useEffect(() => {
        // Initialize AI translation service
        const initializeAI = async () => {
            try {
                await aiTranslationService.initialize();
                setIsAITranslationReady(aiTranslationService.isInitialized);
            } catch (error) {
                console.warn('AI translation initialization failed:', error);
            }
        };
        
        initializeAI();
    }, []);
    
    /**
     * Hybrid translation function
     * Tries AI translation first, falls back to i18next if needed
     */
    const t = useCallback(async (key, options = {}) => {
        // For English, use i18next directly
        if (currentLanguage === 'en') {
            return i18nTranslate(key, options);
        }
        
        // Check if we have a translation key from i18next
        let sourceText = i18nTranslate(key, { ...options, lng: 'en' });
        
        // If i18next doesn't have the key, use the key itself
        if (sourceText === key && typeof key === 'string') {
            sourceText = key;
        }
        
        // If AI translation is not ready, fallback to i18next
        if (!isAITranslationReady || !aiTranslationService.isLanguageSupported(currentLanguage)) {
            return i18nTranslate(key, options);
        }
        
        try {
            // Use AI translation
            const aiTranslated = await aiTranslate(sourceText, currentLanguage);
            return aiTranslated;
        } catch (error) {
            console.warn('AI translation failed, using i18next fallback:', error);
            return i18nTranslate(key, options);
        }
    }, [currentLanguage, i18nTranslate, isAITranslationReady]);
    
    /**
     * Synchronous translation function (returns immediately)
     * Uses cached translations or i18next fallback
     */
    const tSync = useCallback((key, options = {}) => {
        // For English, use i18next directly
        if (currentLanguage === 'en') {
            return i18nTranslate(key, options);
        }
        
        const sourceText = i18nTranslate(key, { ...options, lng: 'en' });
        const cacheKey = aiTranslationService.getCacheKey(sourceText, currentLanguage);
        
        // Check AI translation cache
        if (aiTranslationService.cache.has(cacheKey)) {
            return aiTranslationService.cache.get(cacheKey);
        }
        
        // Fallback to i18next
        return i18nTranslate(key, options);
    }, [currentLanguage, i18nTranslate]);
    
    /**
     * Translate multiple keys at once
     */
    const tBatch = useCallback(async (keys, options = {}) => {
        if (currentLanguage === 'en') {
            return keys.map(key => i18nTranslate(key, options));
        }
        
        // Get source texts from i18next
        const sourceTexts = keys.map(key => {
            const text = i18nTranslate(key, { ...options, lng: 'en' });
            return text === key ? key : text;
        });
        
        // Use AI batch translation if available
        if (isAITranslationReady && aiTranslationService.isLanguageSupported(currentLanguage)) {
            try {
                const translations = await aiTranslationService.translateBatch(sourceTexts, currentLanguage);
                return translations;
            } catch (error) {
                console.warn('AI batch translation failed, using i18next fallback:', error);
            }
        }
        
        // Fallback to i18next
        return keys.map(key => i18nTranslate(key, options));
    }, [currentLanguage, i18nTranslate, isAITranslationReady]);
    
    /**
     * Preload translations for better performance
     */
    const preloadTranslations = useCallback(async (keys) => {
        if (currentLanguage === 'en' || !isAITranslationReady) return;
        
        const sourceTexts = keys.map(key => {
            const text = i18nTranslate(key, { lng: 'en' });
            return text === key ? key : text;
        });
        
        try {
            await aiTranslationService.translateBatch(sourceTexts, currentLanguage);
            console.log(`✅ Preloaded ${keys.length} translations for ${currentLanguage}`);
        } catch (error) {
            console.warn('Translation preloading failed:', error);
        }
    }, [currentLanguage, i18nTranslate, isAITranslationReady]);
    
    /**
     * Get translation statistics
     */
    const getTranslationStats = useCallback(() => {
        return {
            aiTranslationReady: isAITranslationReady,
            currentLanguage,
            aiCacheStats: aiTranslationService.getCacheStats(),
            supportedLanguages: aiTranslationService.getSupportedLanguages(),
            i18nextLanguages: i18n.languages
        };
    }, [isAITranslationReady, currentLanguage, i18n]);
    
    return {
        // Main translation functions
        t,                          // Async hybrid translation
        tSync,                     // Sync translation (cached + fallback)
        tBatch,                    // Batch translation
        
        // Utility functions
        preloadTranslations,       // Preload translations for performance
        getTranslationStats,       // Get translation statistics
        
        // Status information
        isAITranslationReady,      // Whether AI translation is available
        currentLanguage,           // Current language code
        
        // Direct access to services
        aiTranslationService,      // AI translation service instance
        i18nTranslate             // Original i18next translate function
    };
};

/**
 * Higher-order component for AI translation
 */
export const withAITranslation = (Component) => {
    return (props) => {
        const translation = useAITranslation();
        return <Component {...props} translation={translation} />;
    };
};

export default useAITranslation;