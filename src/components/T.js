import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { aiTranslationService } from '../services/aiTranslationService';

/**
 * Universal Translation Component (T)
 * Translates any text throughout the app using AI translation
 * 
 * Usage:
 * <T>Hello World</T>
 * <T fallback="Dashboard">nav.dashboard</T>
 * <T timeout={10000}>Complex medical text</T>
 */
const T = ({ 
  children,
  fallback = null,
  className = '',
  style = {},
  timeout = 30000,
  showLoader = false,
  as = 'span',
  ...props 
}) => {
  const { currentLanguage, isLanguageReady } = useLanguage();
  const [displayText, setDisplayText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationFailed, setTranslationFailed] = useState(false);
  const abortControllerRef = useRef(null);

  // Get the text to translate
  const sourceText = children || fallback || '';

  useEffect(() => {
    const translateText = async () => {
      // Clean up previous translation request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setTranslationFailed(false);
      
      // For English, show original text immediately
      if (currentLanguage === 'en' || !sourceText.trim()) {
        setDisplayText(sourceText);
        setIsTranslating(false);
        return;
      }

      // Set immediate fallback (show English while translating)
      setDisplayText(sourceText);

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
    };

    const performTranslation = async (text) => {
      setIsTranslating(true);
      
      try {
        // Create new abort controller
        abortControllerRef.current = new AbortController();
        
        // Check cache first
        const cacheKey = aiTranslationService.getCacheKey ? aiTranslationService.getCacheKey(text, currentLanguage) : `${currentLanguage}:${text}`;
        if (aiTranslationService.cache && aiTranslationService.cache.has(cacheKey)) {
          setDisplayText(aiTranslationService.cache.get(cacheKey));
          setIsTranslating(false);
          return;
        }

        // Perform AI translation with timeout
        const translationPromise = aiTranslationService.translateText(text, currentLanguage);
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
  }, [sourceText, currentLanguage, isLanguageReady, timeout]);

  // Render loading indicator
  const renderLoadingIndicator = () => {
    if (!showLoader || !isTranslating) return null;
    
    return (
      <span 
        className="translation-loader"
        style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          marginLeft: '4px',
          border: '1px solid #f3f3f3',
          borderTop: '1px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
    );
  };

  // Determine the component to render as
  const Component = as;

  return (
    <>
      <Component
        className={`${className} ${isTranslating ? 'translating' : ''} ${translationFailed ? 'translation-failed' : ''}`}
        style={{
          ...style,
          opacity: isTranslating ? 0.9 : 1,
          transition: 'opacity 0.2s ease',
          ...(translationFailed && { 
            borderBottom: '1px dotted orange',
            cursor: 'help'
          })
        }}
        title={translationFailed ? `Translation failed for ${currentLanguage}. Showing English text.` : undefined}
        {...props}
      >
        {displayText}
      </Component>
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

export default T;