import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { aiTranslationService } from '../services/aiTranslationService';
import i18n from '../utils/i18n';

/**
 * TranslatedText Component
 * Renders text with AI-powered translation support
 * Shows immediate fallback then updates with translated text
 */
const TranslatedText = ({ 
  translationKey, 
  fallbackText, 
  options = {},
  className = '',
  style = {},
  ...props 
}) => {
  const { currentLanguage } = useLanguage();
  const [displayText, setDisplayText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translateText = async () => {
      // For English, use i18n directly
      if (currentLanguage === 'en') {
        const text = translationKey ? i18n.t(translationKey, options) : fallbackText || '';
        setDisplayText(text);
        return;
      }

      // For Hindi, try i18n first
      if (currentLanguage === 'hi' && translationKey) {
        const staticTranslation = i18n.t(translationKey, options);
        if (staticTranslation !== translationKey) {
          setDisplayText(staticTranslation);
          return;
        }
      }

      // Get source text (English)
      const sourceText = translationKey 
        ? i18n.t(translationKey, { ...options, lng: 'en' })
        : fallbackText || '';

      // Set immediate fallback
      setDisplayText(sourceText);

      // Check if we need AI translation
      if (currentLanguage !== 'en' && sourceText) {
        setIsTranslating(true);
        
        try {
          // Check cache first
          const cacheKey = aiTranslationService.getCacheKey(sourceText, currentLanguage);
          if (aiTranslationService.cache && aiTranslationService.cache.has(cacheKey)) {
            setDisplayText(aiTranslationService.cache.get(cacheKey));
            setIsTranslating(false);
            return;
          }

          // Perform AI translation
          const translatedText = await aiTranslationService.translateText(sourceText, currentLanguage);
          setDisplayText(translatedText);
        } catch (error) {
          console.warn('Translation failed:', error);
          // Keep the fallback text
        } finally {
          setIsTranslating(false);
        }
      }
    };

    translateText();
  }, [translationKey, fallbackText, currentLanguage, options]);

  return (
    <span 
      className={`${className} ${isTranslating ? 'translating' : ''}`}
      style={{
        ...style,
        opacity: isTranslating ? 0.7 : 1,
        transition: 'opacity 0.3s ease'
      }}
      {...props}
    >
      {displayText}
    </span>
  );
};

export default TranslatedText;