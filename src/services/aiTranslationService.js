import api, { translationAPI } from './api';

/**
 * AI-powered Translation Service
 * Integrates with backend IndicTrans2 service for real-time translations
 */
class AITranslationService {
    constructor() {
        this.cache = new Map();
        this.pendingTranslations = new Map();
        this.supportedLanguages = [];
        this.isInitialized = false;
        
        // Language mappings for i18next compatibility
        this.languageMapping = {
            'en': 'en',
            'hi': 'hi',    // Hindi
            'bn': 'bn',    // Bengali
            'te': 'te',    // Telugu
            'mr': 'mr',    // Marathi
            'ta': 'ta',    // Tamil
            'gu': 'gu',    // Gujarati
            'kn': 'kn',    // Kannada
            'ml': 'ml',    // Malayalam
            'pa': 'pa',    // Punjabi
            'or': 'or',    // Odia
            'as': 'as',    // Assamese
            'ur': 'ur',    // Urdu
            'ne': 'ne',    // Nepali
            'si': 'si',    // Sinhala
            'kok': 'kok',  // Konkani
            'mni': 'mni',  // Manipuri
            'sd': 'sd',    // Sindhi
            'mai': 'mai',  // Maithili
            'brx': 'brx',  // Bodo
            'sat': 'sat',  // Santali
            'doi': 'doi',  // Dogri
            'ks': 'ks',    // Kashmiri
            'gom': 'gom',  // Goan Konkani
            'bpy': 'bpy'   // Bishnupriya
        };
        
        this.initialize();
    }
    
    /**
     * Initialize the translation service
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // Fetch supported languages from backend
            const response = await translationAPI.getSupportedLanguages();
            if (response.success) {
                this.supportedLanguages = response.languages;
                this.isInitialized = true;
                console.log('✅ AI Translation Service initialized with', this.supportedLanguages.length, 'languages');
            }
        } catch (error) {
            console.warn('⚠️ AI Translation Service initialization failed, falling back to cache:', error.message);
            // Don't throw error, allow fallback to work
        }
    }
    
    /**
     * Generate cache key for translation
     */
    getCacheKey(text, language) {
        return `${language}:${btoa(unescape(encodeURIComponent(text)))}`;
    }
    
    /**
     * Translate text to target language
     */
    async translateText(text, targetLanguage) {
        // Return original text for English
        if (targetLanguage === 'en' || !text || typeof text !== 'string') {
            return text;
        }
        
        // Check if language is supported
        if (!this.languageMapping[targetLanguage]) {
            console.warn(`Language '${targetLanguage}' not supported by AI translation`);
            return text;
        }
        
        // Check cache first
        const cacheKey = this.getCacheKey(text, targetLanguage);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        // Check if translation is already pending
        if (this.pendingTranslations.has(cacheKey)) {
            return this.pendingTranslations.get(cacheKey);
        }
        
        // Create translation promise
        const translationPromise = this.performTranslation(text, targetLanguage, cacheKey);
        this.pendingTranslations.set(cacheKey, translationPromise);
        
        return translationPromise;
    }
    
    /**
     * Perform the actual translation
     */
    async performTranslation(text, targetLanguage, cacheKey) {
        try {
            const response = await translationAPI.translate(text, targetLanguage);
            
            if (response.success && response.translated) {
                const translatedText = response.translated;
                
                // Cache the translation
                this.cache.set(cacheKey, translatedText);
                
                // Remove from pending
                this.pendingTranslations.delete(cacheKey);
                
                console.log(`🌍 Translated: "${text}" -> "${translatedText}" (${targetLanguage})`);
                return translatedText;
            }
        } catch (error) {
            console.warn(`Translation failed for "${text}" to ${targetLanguage}:`, error.message);
            // Remove from pending
            this.pendingTranslations.delete(cacheKey);
        }
        
        // Fallback to original text
        this.cache.set(cacheKey, text);
        return text;
    }
    
    /**
     * Translate multiple texts (batch translation)
     */
    async translateBatch(texts, targetLanguage) {
        if (targetLanguage === 'en' || !Array.isArray(texts)) {
            return texts;
        }
        
        // Check cache for all texts first
        const results = [];
        const textsToTranslate = [];
        const indices = [];
        
        for (let i = 0; i < texts.length; i++) {
            const text = texts[i];
            const cacheKey = this.getCacheKey(text, targetLanguage);
            
            if (this.cache.has(cacheKey)) {
                results[i] = this.cache.get(cacheKey);
            } else {
                textsToTranslate.push(text);
                indices.push(i);
            }
        }
        
        // Translate uncached texts
        if (textsToTranslate.length > 0) {
            try {
                const response = await translationAPI.translateBatch(textsToTranslate, targetLanguage);
                
                if (response.success && response.results) {
                    response.results.forEach((result, index) => {
                        const originalIndex = indices[index];
                        const text = textsToTranslate[index];
                        const translated = result.translated || text;
                        
                        // Cache the translation
                        const cacheKey = this.getCacheKey(text, targetLanguage);
                        this.cache.set(cacheKey, translated);
                        
                        results[originalIndex] = translated;
                    });
                }
            } catch (error) {
                console.warn('Batch translation failed:', error.message);
                // Fill in with original texts
                indices.forEach((originalIndex, index) => {
                    results[originalIndex] = textsToTranslate[index];
                });
            }
        }
        
        return results;
    }
    
    /**
     * Translate object with nested text values
     */
    async translateObject(obj, targetLanguage, keyPaths = []) {
        if (targetLanguage === 'en' || typeof obj !== 'object' || obj === null) {
            return obj;
        }
        
        if (Array.isArray(obj)) {
            const results = [];
            for (const item of obj) {
                results.push(await this.translateObject(item, targetLanguage, keyPaths));
            }
            return results;
        }
        
        const translated = {};
        const textsToTranslate = [];
        const textKeys = [];
        
        // Collect texts for batch translation
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string' && this.shouldTranslateKey(key, keyPaths)) {
                textsToTranslate.push(value);
                textKeys.push(key);
            } else if (typeof value === 'object') {
                translated[key] = await this.translateObject(value, targetLanguage, keyPaths);
            } else {
                translated[key] = value;
            }
        }
        
        // Batch translate all texts
        if (textsToTranslate.length > 0) {
            const translatedTexts = await this.translateBatch(textsToTranslate, targetLanguage);
            textKeys.forEach((key, index) => {
                translated[key] = translatedTexts[index];
            });
        }
        
        return translated;
    }
    
    /**
     * Check if a key should be translated
     */
    shouldTranslateKey(key, keyPaths) {
        // If specific key paths are provided, only translate those
        if (keyPaths.length > 0) {
            return keyPaths.includes(key);
        }
        
        // Default text field detection
        const textFields = [
            'title', 'name', 'description', 'text', 'content', 'message',
            'label', 'placeholder', 'tooltip', 'error', 'success', 'warning',
            'question', 'answer', 'comment', 'note', 'summary', 'details'
        ];
        
        return textFields.includes(key.toLowerCase());
    }
    
    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    }
    
    /**
     * Check if language is supported
     */
    isLanguageSupported(languageCode) {
        return this.languageMapping.hasOwnProperty(languageCode);
    }
    
    /**
     * Clear translation cache
     */
    clearCache() {
        this.cache.clear();
        this.pendingTranslations.clear();
        console.log('🗑️ Translation cache cleared');
    }
    
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            cacheSize: this.cache.size,
            pendingTranslations: this.pendingTranslations.size,
            supportedLanguages: this.supportedLanguages.length,
            isInitialized: this.isInitialized
        };
    }
    
    /**
     * Preload translations for common UI text
     */
    async preloadTranslations(commonTexts, targetLanguages) {
        console.log(`🚀 Preloading ${commonTexts.length} texts for ${targetLanguages.length} languages...`);
        
        for (const language of targetLanguages) {
            if (language !== 'en') {
                await this.translateBatch(commonTexts, language);
            }
        }
        
        console.log('✅ Translation preloading complete');
    }
}

// Create singleton instance
const aiTranslationService = new AITranslationService();

// Export for use in components
export { aiTranslationService };

// Create translation function for easy use
export const aiTranslate = async (text, language) => {
    return await aiTranslationService.translateText(text, language);
};

// Create batch translation function
export const aiTranslateBatch = async (texts, language) => {
    return await aiTranslationService.translateBatch(texts, language);
};

// Export the service class for advanced usage
export default AITranslationService;