const express = require('express');
const router = express.Router();
const { translationService } = require('../services/translationService');
const { body, validationResult, query } = require('express-validator');
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Rate limiting for translation endpoints
const translationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Allow up to 200 translation requests per 15 minutes per IP
    message: 'Too many translation requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to all translation routes
router.use(translationLimiter);

/**
 * @route   GET /api/translation/languages
 * @desc    Get list of supported languages
 * @access  Public
 */
router.get('/languages', async (req, res) => {
    try {
        const supportedLanguages = translationService.getSupportedLanguages();
        
        // Add language names for better UX
        const languagesWithNames = {
            'hi': { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
            'bn': { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
            'te': { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
            'mr': { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
            'ta': { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
            'gu': { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
            'kn': { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
            'ml': { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
            'pa': { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
            'or': { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
            'as': { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
            'ur': { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
            'ne': { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
            'si': { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
            'kok': { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी' },
            'mni': { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্' },
            'sd': { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي' },
            'mai': { code: 'mai', name: 'Maithili', nativeName: 'मैथिली' },
            'brx': { code: 'brx', name: 'Bodo', nativeName: 'बर\'' },
            'sat': { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ' },
            'doi': { code: 'doi', name: 'Dogri', nativeName: 'डोगरी' },
            'ks': { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر' },
            'gom': { code: 'gom', name: 'Goan Konkani', nativeName: 'गोंयची कोंकणी' },
            'bpy': { code: 'bpy', name: 'Bishnupriya', nativeName: 'বিষ্ণুপ্রিয়া মণিপুরী' }
        };

        const languages = supportedLanguages
            .map(code => languagesWithNames[code])
            .filter(Boolean);

        res.status(200).json({
            success: true,
            languages: languages,
            totalLanguages: languages.length
        });

    } catch (error) {
        logger.error('Error fetching supported languages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch supported languages',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/translation/translate
 * @desc    Translate text to target language
 * @access  Public
 */
router.post('/translate',
    [
        body('text')
            .notEmpty()
            .withMessage('Text is required')
            .isLength({ max: 1000 })
            .withMessage('Text must be less than 1000 characters'),
        body('targetLanguage')
            .notEmpty()
            .withMessage('Target language is required')
            .isLength({ min: 2, max: 5 })
            .withMessage('Invalid language code')
    ],
    async (req, res) => {
        try {
            // Check validation results
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: errors.array()
                });
            }

            const { text, targetLanguage } = req.body;

            // Check if language is supported
            if (!translationService.isLanguageSupported(targetLanguage)) {
                return res.status(400).json({
                    success: false,
                    message: `Language '${targetLanguage}' is not supported`,
                    supportedLanguages: translationService.getSupportedLanguages()
                });
            }

            // Perform translation
            const result = await translationService.translateText(text, targetLanguage);

            res.status(200).json({
                success: true,
                ...result,
                processingTime: new Date() - req.startTime || 0
            });

        } catch (error) {
            logger.error('Translation error:', error);
            res.status(500).json({
                success: false,
                message: 'Translation failed',
                error: error.message
            });
        }
    }
);

/**
 * @route   POST /api/translation/batch
 * @desc    Translate multiple texts to target language
 * @access  Public
 */
router.post('/batch',
    [
        body('texts')
            .isArray({ min: 1, max: 50 })
            .withMessage('Texts must be an array with 1-50 items'),
        body('texts.*')
            .notEmpty()
            .withMessage('Each text item must not be empty')
            .isLength({ max: 500 })
            .withMessage('Each text item must be less than 500 characters'),
        body('targetLanguage')
            .notEmpty()
            .withMessage('Target language is required')
            .isLength({ min: 2, max: 5 })
            .withMessage('Invalid language code')
    ],
    async (req, res) => {
        try {
            // Check validation results
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: errors.array()
                });
            }

            const { texts, targetLanguage } = req.body;

            // Check if language is supported
            if (!translationService.isLanguageSupported(targetLanguage)) {
                return res.status(400).json({
                    success: false,
                    message: `Language '${targetLanguage}' is not supported`,
                    supportedLanguages: translationService.getSupportedLanguages()
                });
            }

            // Perform batch translation
            const results = await translationService.translateBatch(texts, targetLanguage);

            res.status(200).json({
                success: true,
                results: results,
                totalTexts: texts.length,
                targetLanguage: targetLanguage,
                processingTime: new Date() - req.startTime || 0
            });

        } catch (error) {
            logger.error('Batch translation error:', error);
            res.status(500).json({
                success: false,
                message: 'Batch translation failed',
                error: error.message
            });
        }
    }
);

/**
 * @route   POST /api/translation/object
 * @desc    Translate an object with text fields to target language
 * @access  Public
 */
router.post('/object',
    [
        body('data')
            .notEmpty()
            .withMessage('Data object is required'),
        body('targetLanguage')
            .notEmpty()
            .withMessage('Target language is required')
            .isLength({ min: 2, max: 5 })
            .withMessage('Invalid language code'),
        body('keyPaths')
            .optional()
            .isArray()
            .withMessage('keyPaths must be an array')
    ],
    async (req, res) => {
        try {
            // Check validation results
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: errors.array()
                });
            }

            const { data, targetLanguage, keyPaths = [] } = req.body;

            // Check if language is supported
            if (!translationService.isLanguageSupported(targetLanguage)) {
                return res.status(400).json({
                    success: false,
                    message: `Language '${targetLanguage}' is not supported`,
                    supportedLanguages: translationService.getSupportedLanguages()
                });
            }

            // Perform object translation
            const translatedData = await translationService.translateObject(data, targetLanguage, keyPaths);

            res.status(200).json({
                success: true,
                originalData: data,
                translatedData: translatedData,
                targetLanguage: targetLanguage,
                keyPaths: keyPaths,
                processingTime: new Date() - req.startTime || 0
            });

        } catch (error) {
            logger.error('Object translation error:', error);
            res.status(500).json({
                success: false,
                message: 'Object translation failed',
                error: error.message
            });
        }
    }
);

/**
 * @route   GET /api/translation/status
 * @desc    Get translation service status and cache statistics
 * @access  Public
 */
router.get('/status', async (req, res) => {
    try {
        const cacheStats = translationService.getCacheStats();
        
        res.status(200).json({
            success: true,
            service: {
                initialized: translationService.isInitialized,
                supportedLanguages: translationService.getSupportedLanguages().length
            },
            cache: cacheStats,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('Error fetching translation status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch translation status',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/translation/cache/clear
 * @desc    Clear translation cache (admin only)
 * @access  Private
 */
router.post('/cache/clear', async (req, res) => {
    try {
        translationService.clearCache();
        
        res.status(200).json({
            success: true,
            message: 'Translation cache cleared successfully'
        });

    } catch (error) {
        logger.error('Error clearing translation cache:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear translation cache',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/translation/test
 * @desc    Test translation service with sample text
 * @access  Public
 */
router.get('/test', async (req, res) => {
    try {
        const { lang = 'hi', text = 'Hello, how are you?' } = req.query;
        
        const result = await translationService.translateText(text, lang);
        
        res.status(200).json({
            success: true,
            testResult: result,
            serviceStatus: translationService.isInitialized ? 'initialized' : 'not initialized'
        });

    } catch (error) {
        logger.error('Translation test error:', error);
        res.status(500).json({
            success: false,
            message: 'Translation test failed',
            error: error.message
        });
    }
});

// Add processing time middleware
router.use((req, res, next) => {
    req.startTime = new Date();
    next();
});

module.exports = router;