import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { aiTranslationService } from '../services/aiTranslationService';
import i18n from '../utils/i18n';

/**
 * Enhanced TranslatedText Component
 * Renders text with AI-powered translation support and smooth loading states
 */
const EnhancedTranslatedText = ({ 
  translationKey, 
  fallbackText, 
  options = {},
  className = '',
  style = {},
  showLoader = true,
  timeout = 30000, // 30 second timeout
  ...props 
}) => {
  const { currentLanguage, isLanguageReady } = useLanguage();
  const [displayText, setDisplayText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationFailed, setTranslationFailed] = useState(false);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const translateText = async () => {
      // Clean up previous translation request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setTranslationFailed(false);
      
      // For English, use i18n directly
      if (currentLanguage === 'en') {
        const text = translationKey ? i18n.t(translationKey, options) : fallbackText || '';
        setDisplayText(text);
        setIsTranslating(false);
        return;
      }

      // For Hindi, try i18n first (static translations)
      if (currentLanguage === 'hi' && translationKey) {
        const staticTranslation = i18n.t(translationKey, options);
        if (staticTranslation !== translationKey) {
          setDisplayText(staticTranslation);
          setIsTranslating(false);
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
      if (currentLanguage !== 'en' && sourceText.trim()) {
        // Check if language models are ready
        if (!isLanguageReady(currentLanguage)) {
          // Language is still loading, show loading state
          setIsTranslating(true);
          
          // Wait for language to be ready (with timeout)
          const startTime = Date.now();
          const checkLanguageReady = () => {
            if (isLanguageReady(currentLanguage)) {
              // Language is now ready, proceed with translation
              performTranslation(sourceText);
            } else if (Date.now() - startTime > timeout) {
              // Timeout - give up and show fallback
              setIsTranslating(false);
              setTranslationFailed(true);
              console.warn(`Translation timeout for ${currentLanguage} after ${timeout}ms`);
            } else {
              // Keep checking
              setTimeout(checkLanguageReady, 1000);
            }
          };
          checkLanguageReady();
        } else {
          // Language is ready, translate immediately
          performTranslation(sourceText);
        }
      }
    };

    const performTranslation = async (sourceText) => {
      setIsTranslating(true);
      
      try {
        // Create new abort controller
        abortControllerRef.current = new AbortController();
        
        // Check cache first
        const cacheKey = aiTranslationService.getCacheKey(sourceText, currentLanguage);
        if (aiTranslationService.cache && aiTranslationService.cache.has(cacheKey)) {
          setDisplayText(aiTranslationService.cache.get(cacheKey));
          setIsTranslating(false);
          return;
        }

        // Perform AI translation with timeout
        const translationPromise = aiTranslationService.translateText(sourceText, currentLanguage);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Translation timeout')), timeout);
        });

        const translatedText = await Promise.race([translationPromise, timeoutPromise]);
        
        // Check if component is still mounted and request wasn't aborted
        if (!abortControllerRef.current?.signal.aborted) {
          setDisplayText(translatedText);
        }
      } catch (error) {
        if (!abortControllerRef.current?.signal.aborted) {
          console.warn('Translation failed:', error);
          setTranslationFailed(true);
          // Keep the fallback text
        }
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setIsTranslating(false);
        }
      }
    };

    translateText();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [translationKey, fallbackText, currentLanguage, options, isLanguageReady, timeout]);

  // Render loading indicator
  const renderLoadingIndicator = () => {
    if (!showLoader || !isTranslating) return null;
    
    return (
      <span 
        className="translation-loader"
        style={{
          display: 'inline-block',
          width: '12px',
          height: '12px',
          marginLeft: '4px',
          border: '2px solid #f3f3f3',
          borderTop: '2px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
    );
  };

  return (
    <>
      <span 
        className={`${className} ${isTranslating ? 'translating' : ''} ${translationFailed ? 'translation-failed' : ''}`}
        style={{
          ...style,
          opacity: isTranslating ? 0.8 : 1,
          transition: 'opacity 0.3s ease',
          ...(translationFailed && { 
            borderBottom: '1px dotted orange',
            cursor: 'help'
          })
        }}
        title={translationFailed ? `Translation failed for ${currentLanguage}. Showing English text.` : undefined}
        {...props}
      >
        {displayText}
      </span>
      {renderLoadingIndicator()}
      
      {/* Add CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default EnhancedTranslatedText;