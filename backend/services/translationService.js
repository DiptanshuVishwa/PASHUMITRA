const { spawn } = require('child_process');
const path = require('path');
const logger = require('../utils/logger');
const NodeCache = require('node-cache');

/**
 * Translation Service using IndicTrans2
 * Interfaces with Python-based IndicTrans2 model for AI-powered translations
 */
class TranslationService {
    constructor() {
        // Cache translations for 1 hour (3600 seconds)
        this.translationCache = new NodeCache({ 
            stdTTL: 3600, 
            checkperiod: 600,
            maxKeys: 10000
        });
        
        // Path to IndicTrans2 Python service
        this.pythonServicePath = path.join(__dirname, '../python_services/indictrans2_service.py');
        
        // Python executable path (using virtual environment)
        this.pythonExecutable = path.join(__dirname, '../../indictrans-env/Scripts/python.exe');
        
        // Language mappings (common language codes supported by IndicTrans2)
        this.languageMapping = {
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
            'kok': 'kok',  // Konkani
            'mni': 'mni',  // Manipuri
            'sd': 'sd',    // Sindhi
            'mai': 'mai',  // Maithili
            'brx': 'brx',  // Bodo
            'sat': 'sat',  // Santali
            'doi': 'doi',  // Dogri
            'ks': 'ks',    // Kashmiri
            'gom': 'gom',  // Goan Konkani
            'san': 'san'   // Sanskrit
        };
        
        this.isInitialized = false;
        this.initializationPromise = null;
    }

    /**
     * Initialize the translation service
     */
    async initialize() {
        if (this.isInitialized) {
            return true;
        }

        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this._doInitialization();
        return this.initializationPromise;
    }

    async _doInitialization() {
        try {
            logger.info('Initializing IndicTrans2 translation service...');
            
            // Test if IndicTrans2 Python service is available
            const testResult = await this._callPythonService('Hello', 'hi', 'en');
            
            if (testResult.success) {
                this.isInitialized = true;
                logger.info('IndicTrans2 translation service initialized successfully');
                return true;
            } else {
                throw new Error(testResult.error || 'Failed to initialize translation service');
            }
        } catch (error) {
            logger.error('Failed to initialize translation service:', error);
            throw error;
        }
    }

    /**
     * Call the IndicTrans2 Python translation service
     */
    async _callPythonService(text, targetLang, sourceLang = 'en', timeout = 30000) {
        return new Promise((resolve, reject) => {
            const pythonProcess = spawn(this.pythonExecutable, [this.pythonServicePath, text, sourceLang, targetLang], {
                env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
                encoding: 'utf8'
            });
            
            let stdout = '';
            let stderr = '';
            
            // Set up timeout
            const timeoutId = setTimeout(() => {
                pythonProcess.kill();
                reject(new Error(`Translation timeout after ${timeout}ms`));
            }, timeout);

            pythonProcess.stdout.on('data', (data) => {
                stdout += data.toString('utf8');
            });

            pythonProcess.stderr.on('data', (data) => {
                stderr += data.toString('utf8');
            });

            pythonProcess.on('close', (code) => {
                clearTimeout(timeoutId);
                
                // Filter out HuggingFace warnings from stderr
                const filteredStderr = stderr
                    .split('\n')
                    .filter(line => 
                        !line.includes('FutureWarning') && 
                        !line.includes('resume_download') &&
                        !line.includes('huggingface_hub') &&
                        line.trim() !== ''
                    )
                    .join('\n');
                
                if (code !== 0 && filteredStderr) {
                    logger.error(`Python process exited with code ${code}: ${filteredStderr}`);
                    resolve({
                        success: false,
                        error: `Translation process failed: ${filteredStderr}`,
                        original: text
                    });
                    return;
                }

                try {
                    const result = JSON.parse(stdout);
                    resolve(result);
                } catch (parseError) {
                    logger.error('Failed to parse Python service response:', parseError);
                    resolve({
                        success: false,
                        error: 'Failed to parse translation response',
                        original: text
                    });
                }
            });

            pythonProcess.on('error', (error) => {
                clearTimeout(timeoutId);
                logger.error('Python process error:', error);
                resolve({
                    success: false,
                    error: error.message,
                    original: text
                });
            });
        });
    }

    /**
     * Generate cache key for translation
     */
    _getCacheKey(text, targetLang) {
        return `${targetLang}:${Buffer.from(text).toString('base64')}`;
    }

    /**
     * Translate text to target language
     */
    async translateText(text, targetLang) {
        try {
            // Return original text if English or unsupported language
            if (targetLang === 'en' || !this.languageMapping[targetLang]) {
                return {
                    success: true,
                    original: text,
                    translated: text,
                    targetLanguage: targetLang,
                    cached: false
                };
            }

            // Check cache first
            const cacheKey = this._getCacheKey(text, targetLang);
            const cached = this.translationCache.get(cacheKey);
            
            if (cached) {
                return {
                    success: true,
                    original: text,
                    translated: cached,
                    targetLanguage: targetLang,
                    cached: true
                };
            }

            // Ensure service is initialized
            await this.initialize();

            // Call IndicTrans2 Python translation service (assuming English as source)
            const result = await this._callPythonService(text, targetLang, 'en');
            
            if (result.success && result.translated) {
                // Cache the translation
                this.translationCache.set(cacheKey, result.translated);
                
                return {
                    success: true,
                    original: text,
                    translated: result.translated,
                    targetLanguage: targetLang,
                    cached: false
                };
            } else {
                // Fallback to original text
                logger.warn(`Translation failed for "${text}" to ${targetLang}: ${result.error}`);
                return {
                    success: false,
                    original: text,
                    translated: text, // Fallback to original
                    targetLanguage: targetLang,
                    error: result.error,
                    cached: false
                };
            }
            
        } catch (error) {
            logger.error('Translation service error:', error);
            return {
                success: false,
                original: text,
                translated: text, // Fallback to original
                targetLanguage: targetLang,
                error: error.message,
                cached: false
            };
        }
    }

    /**
     * Translate multiple texts (batch translation)
     */
    async translateBatch(texts, targetLang) {
        try {
            // Return original texts if English or unsupported language
            if (targetLang === 'en' || !this.languageMapping[targetLang]) {
                return texts.map(text => ({
                    success: true,
                    original: text,
                    translated: text,
                    targetLanguage: targetLang,
                    cached: false
                }));
            }

            const results = [];
            
            // Process each text individually (with caching)
            for (const text of texts) {
                const result = await this.translateText(text, targetLang);
                results.push(result);
            }
            
            return results;
            
        } catch (error) {
            logger.error('Batch translation error:', error);
            return texts.map(text => ({
                success: false,
                original: text,
                translated: text, // Fallback to original
                targetLanguage: targetLang,
                error: error.message,
                cached: false
            }));
        }
    }

    /**
     * Translate an object with nested text values
     */
    async translateObject(obj, targetLang, keyPaths = []) {
        try {
            if (typeof obj !== 'object' || obj === null) {
                return obj;
            }

            if (Array.isArray(obj)) {
                const results = [];
                for (const item of obj) {
                    results.push(await this.translateObject(item, targetLang, keyPaths));
                }
                return results;
            }

            const translated = {};
            
            for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'string') {
                    // Only translate if this is a text field we want to translate
                    if (keyPaths.length === 0 || keyPaths.includes(key) || this._shouldTranslateKey(key)) {
                        const result = await this.translateText(value, targetLang);
                        translated[key] = result.translated;
                    } else {
                        translated[key] = value;
                    }
                } else if (typeof value === 'object') {
                    translated[key] = await this.translateObject(value, targetLang, keyPaths);
                } else {
                    translated[key] = value;
                }
            }

            return translated;
            
        } catch (error) {
            logger.error('Object translation error:', error);
            return obj; // Return original object on error
        }
    }

    /**
     * Check if a key should be translated (based on common text field names)
     */
    _shouldTranslateKey(key) {
        const textKeys = [
            'title', 'name', 'description', 'text', 'content', 'message', 
            'label', 'placeholder', 'tooltip', 'error', 'success', 'warning',
            'question', 'answer', 'comment', 'note', 'summary', 'details'
        ];
        return textKeys.includes(key.toLowerCase());
    }

    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return Object.keys(this.languageMapping);
    }

    /**
     * Check if language is supported
     */
    isLanguageSupported(languageCode) {
        return this.languageMapping.hasOwnProperty(languageCode);
    }

    /**
     * Get translation cache statistics
     */
    getCacheStats() {
        return {
            keys: this.translationCache.keys().length,
            hits: this.translationCache.getStats().hits,
            misses: this.translationCache.getStats().misses,
            ksize: this.translationCache.getStats().ksize,
            vsize: this.translationCache.getStats().vsize
        };
    }

    /**
     * Clear translation cache
     */
    clearCache() {
        this.translationCache.flushAll();
        logger.info('Translation cache cleared');
    }
}

// Export singleton instance
const translationService = new TranslationService();

module.exports = {
    TranslationService,
    translationService
};