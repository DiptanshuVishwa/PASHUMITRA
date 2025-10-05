import React, { useState, useEffect } from 'react';
import { useAITranslation } from '../hooks/useAITranslation';
import { useLanguage } from '../context/LanguageContext';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Button = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin: 0.5rem;

  &:hover {
    background: #45a049;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 0.5rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 100px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
`;

const TranslationResult = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 1rem;
  margin: 1rem 0;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Stats = styled.div`
  background: #e8f5e8;
  border: 1px solid #c3e6c3;
  border-radius: 4px;
  padding: 1rem;
  margin: 1rem 0;
  font-family: monospace;
`;

/**
 * AI Translation Example Component
 * Demonstrates how to use the new AI-powered translation system
 */
const AITranslationExample = () => {
    const { 
        t, 
        tSync, 
        tBatch, 
        preloadTranslations,
        getTranslationStats,
        isAITranslationReady,
        currentLanguage 
    } = useAITranslation();
    
    const { changeLanguage, languages } = useLanguage();
    
    const [inputText, setInputText] = useState('Hello, welcome to PashuMitra Portal!');
    const [translatedText, setTranslatedText] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [batchResults, setBatchResults] = useState([]);

    // Sample texts for testing
    const sampleTexts = [
        'Welcome to our farm management system',
        'Please complete the biosecurity questionnaire',
        'Your livestock health is our priority',
        'Alert: Disease outbreak detected nearby',
        'Thank you for using PashuMitra Portal'
    ];

    // Update stats when language changes
    useEffect(() => {
        const updateStats = () => {
            const translationStats = getTranslationStats();
            setStats(translationStats);
        };
        
        updateStats();
        const interval = setInterval(updateStats, 5000); // Update every 5 seconds
        
        return () => clearInterval(interval);
    }, [currentLanguage, getTranslationStats]);

    // Handle single text translation
    const handleTranslate = async () => {
        if (!inputText.trim()) return;
        
        setLoading(true);
        try {
            const translated = await t('custom.text', { defaultValue: inputText });
            setTranslatedText(translated);
        } catch (error) {
            console.error('Translation failed:', error);
            setTranslatedText(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Handle batch translation
    const handleBatchTranslate = async () => {
        setLoading(true);
        try {
            const results = await tBatch(sampleTexts.map((text, index) => `sample.text.${index}`));
            setBatchResults(results.map((result, index) => ({
                original: sampleTexts[index],
                translated: result
            })));
        } catch (error) {
            console.error('Batch translation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle preloading
    const handlePreload = async () => {
        setLoading(true);
        try {
            const commonKeys = [
                'common.welcome',
                'common.login',
                'common.logout',
                'common.submit',
                'common.cancel',
                'nav.dashboard',
                'nav.alerts',
                'nav.profile'
            ];
            await preloadTranslations(commonKeys);
            alert(`Preloaded ${commonKeys.length} translations for ${currentLanguage}`);
        } catch (error) {
            console.error('Preloading failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <h1>🌍 AI Translation System Demo</h1>
            <p>Experience the power of AI4Bharat's IndicTrans2 for Indian languages</p>

            {/* Language Selector */}
            <Card>
                <h3>Language Selection</h3>
                <Select 
                    value={currentLanguage} 
                    onChange={(e) => changeLanguage(e.target.value)}
                >
                    {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                            {lang.nativeName} ({lang.code})
                        </option>
                    ))}
                </Select>
                
                <div>
                    <strong>AI Translation Status:</strong> {' '}
                    {isAITranslationReady ? '✅ Ready' : '⚠️ Loading...'}
                </div>
            </Card>

            {/* Single Translation Test */}
            <Card>
                <h3>Single Text Translation</h3>
                <TextArea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter text to translate..."
                />
                <div>
                    <Button 
                        onClick={handleTranslate} 
                        disabled={loading || !isAITranslationReady}
                    >
                        {loading ? <LoadingSpinner /> : 'Translate'}
                    </Button>
                </div>
                
                {translatedText && (
                    <TranslationResult>
                        <strong>Translation ({currentLanguage}):</strong>
                        <div>{translatedText}</div>
                    </TranslationResult>
                )}
            </Card>

            {/* Batch Translation Test */}
            <Card>
                <h3>Batch Translation Test</h3>
                <p>Translate multiple sample texts at once:</p>
                <Button 
                    onClick={handleBatchTranslate} 
                    disabled={loading || !isAITranslationReady}
                >
                    {loading ? <LoadingSpinner /> : 'Translate All Samples'}
                </Button>
                
                {batchResults.length > 0 && (
                    <div>
                        {batchResults.map((result, index) => (
                            <TranslationResult key={index}>
                                <strong>Original:</strong> {result.original}<br/>
                                <strong>Translated:</strong> {result.translated}
                            </TranslationResult>
                        ))}
                    </div>
                )}
            </Card>

            {/* Preloading Test */}
            <Card>
                <h3>Translation Preloading</h3>
                <p>Preload common UI translations for better performance:</p>
                <Button 
                    onClick={handlePreload} 
                    disabled={loading || !isAITranslationReady || currentLanguage === 'en'}
                >
                    {loading ? <LoadingSpinner /> : 'Preload Common Translations'}
                </Button>
            </Card>

            {/* Synchronous Translation Examples */}
            <Card>
                <h3>Synchronous Translation (Cached)</h3>
                <p>These translations use cached results and return immediately:</p>
                <div>
                    <strong>Welcome:</strong> {tSync('common.welcome', { defaultValue: 'Welcome' })}<br/>
                    <strong>Dashboard:</strong> {tSync('nav.dashboard', { defaultValue: 'Dashboard' })}<br/>
                    <strong>Profile:</strong> {tSync('nav.profile', { defaultValue: 'Profile' })}
                </div>
            </Card>

            {/* Translation Statistics */}
            {stats && (
                <Card>
                    <h3>Translation Statistics</h3>
                    <Stats>
                        <div>AI Translation Ready: {stats.aiTranslationReady ? 'Yes' : 'No'}</div>
                        <div>Current Language: {stats.currentLanguage}</div>
                        <div>Cache Size: {stats.aiCacheStats.cacheSize} translations</div>
                        <div>Pending Translations: {stats.aiCacheStats.pendingTranslations}</div>
                        <div>Supported Languages: {stats.aiCacheStats.supportedLanguages}</div>
                        <div>i18next Languages: {stats.i18nextLanguages?.join(', ')}</div>
                    </Stats>
                </Card>
            )}

            {/* Usage Instructions */}
            <Card>
                <h3>How to Use AI Translations in Your Components</h3>
                <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`import { useAITranslation } from '../hooks/useAITranslation';

function MyComponent() {
    const { t, tSync, isAITranslationReady } = useAITranslation();
    
    // Async translation (preferred for new text)
    const handleTranslate = async () => {
        const translated = await t('my.translation.key');
        console.log(translated);
    };
    
    // Sync translation (for cached or fallback)
    const syncTranslated = tSync('my.cached.key');
    
    return (
        <div>
            {isAITranslationReady ? (
                <p>{syncTranslated}</p>
            ) : (
                <p>Loading translations...</p>
            )}
        </div>
    );
}`}
                </pre>
            </Card>
        </Container>
    );
};

export default AITranslationExample;