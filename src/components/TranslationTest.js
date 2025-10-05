import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../context/LanguageContext';
import { useSmartTranslation } from '../hooks/useTranslation';
import { translationAPI } from '../services/api';

const TestContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  width: 400px;
  background: white;
  border: 2px solid #ff7f50;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  z-index: 1000;
  max-height: 80vh;
  overflow-y: auto;
`;

const TestHeader = styled.h3`
  margin: 0 0 15px 0;
  color: #ff7f50;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TestSection = styled.div`
  margin-bottom: 15px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #ff7f50;
`;

const TestButton = styled.button`
  background: #ff7f50;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  margin: 4px;
  
  &:hover {
    background: #ff6b35;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TestResult = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 8px;
  margin: 8px 0;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #ff7f50;
  }
`;

const TranslationTest = ({ onClose }) => {
  const { currentLanguage, supportedLanguages, changeLanguage } = useLanguage();
  const { t, isLoading, getTranslationStats } = useSmartTranslation();
  const [testResults, setTestResults] = useState({});
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [sampleTranslations, setSampleTranslations] = useState({});

  // Test API connection
  useEffect(() => {
    const checkAPI = async () => {
      try {
        const response = await translationAPI.getStatus();
        setApiStatus(`✅ Connected (${response.supportedLanguages || 0} languages)`);
      } catch (error) {
        setApiStatus(`❌ API Error: ${error.message}`);
      }
    };
    checkAPI();
  }, []);

  // Test direct API call
  const testDirectAPI = async () => {
    if (currentLanguage === 'en') {
      setTestResults(prev => ({
        ...prev,
        directAPI: 'ℹ️ Switch to non-English language to test'
      }));
      return;
    }

    try {
      setTestResults(prev => ({ ...prev, directAPI: '⏳ Testing...' }));
      const result = await translationAPI.translate('Welcome to PashuMitra Portal', currentLanguage);
      setTestResults(prev => ({
        ...prev,
        directAPI: result.success ? 
          `✅ "${result.original}" → "${result.translated}"` :
          `❌ ${result.error}`
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        directAPI: `❌ Error: ${error.message}`
      }));
    }
  };

  // Test hook-based translation
  const testHookTranslation = async () => {
    try {
      setTestResults(prev => ({ ...prev, hookTranslation: '⏳ Testing...' }));
      const result = t('nav.dashboard');
      setTestResults(prev => ({
        ...prev,
        hookTranslation: `✅ "nav.dashboard" → "${result}"`
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        hookTranslation: `❌ Error: ${error.message}`
      }));
    }
  };

  // Test batch translation
  const testBatchTranslation = async () => {
    if (currentLanguage === 'en') {
      setTestResults(prev => ({
        ...prev,
        batchTranslation: 'ℹ️ Switch to non-English language to test'
      }));
      return;
    }

    try {
      setTestResults(prev => ({ ...prev, batchTranslation: '⏳ Testing...' }));
      const texts = ['Dashboard', 'Notifications', 'Settings'];
      const result = await translationAPI.translateBatch(texts, currentLanguage);
      
      if (result.success) {
        const translations = result.results.map((r, i) => `"${texts[i]}" → "${r.translated}"`);
        setTestResults(prev => ({
          ...prev,
          batchTranslation: `✅ Batch translation:\n${translations.join('\n')}`
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          batchTranslation: `❌ ${result.error}`
        }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        batchTranslation: `❌ Error: ${error.message}`
      }));
    }
  };

  // Sample common UI texts with translations
  useEffect(() => {
    const commonTexts = {
      'nav.dashboard': t('nav.dashboard'),
      'nav.notifications': t('nav.notifications'), 
      'nav.settings': t('nav.settings'),
      'common.loading': t('common.loading'),
      'landing.title': t('landing.title')
    };
    setSampleTranslations(commonTexts);
  }, [currentLanguage, t]);

  const stats = getTranslationStats();

  return (
    <TestContainer>
      <CloseButton onClick={onClose}>×</CloseButton>
      
      <TestHeader>
        🔧 IndicTrans2 Translation Test
      </TestHeader>

      <TestSection>
        <strong>Current Status:</strong><br/>
        Language: <code>{currentLanguage}</code><br/>
        API Status: {apiStatus}<br/>
        Hook Loading: {isLoading ? '⏳' : '✅'}<br/>
        Cached Translations: {stats.totalCached}
      </TestSection>

      <TestSection>
        <strong>Language Selector Test:</strong><br/>
        {supportedLanguages.slice(0, 6).map(lang => (
          <TestButton 
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            style={{
              background: currentLanguage === lang.code ? '#28a745' : '#ff7f50'
            }}
          >
            {lang.code.toUpperCase()}
          </TestButton>
        ))}
      </TestSection>

      <TestSection>
        <strong>Direct API Test:</strong><br/>
        <TestButton onClick={testDirectAPI} disabled={isLoading}>
          Test API Call
        </TestButton>
        {testResults.directAPI && (
          <TestResult>{testResults.directAPI}</TestResult>
        )}
      </TestSection>

      <TestSection>
        <strong>Hook Translation Test:</strong><br/>
        <TestButton onClick={testHookTranslation} disabled={isLoading}>
          Test Hook
        </TestButton>
        {testResults.hookTranslation && (
          <TestResult>{testResults.hookTranslation}</TestResult>
        )}
      </TestSection>

      <TestSection>
        <strong>Batch Translation Test:</strong><br/>
        <TestButton onClick={testBatchTranslation} disabled={isLoading}>
          Test Batch
        </TestButton>
        {testResults.batchTranslation && (
          <TestResult>{testResults.batchTranslation}</TestResult>
        )}
      </TestSection>

      <TestSection>
        <strong>Live UI Translations:</strong><br/>
        {Object.entries(sampleTranslations).map(([key, value]) => (
          <TestResult key={key}>
            <code>{key}</code>: "{value}"
          </TestResult>
        ))}
      </TestSection>

      <TestSection style={{ fontSize: '11px', opacity: 0.8 }}>
        <strong>Debug Info:</strong><br/>
        Total Languages: {supportedLanguages.length}<br/>
        AI Service Stats: {JSON.stringify(stats.aiServiceStats || 'N/A')}
      </TestSection>
    </TestContainer>
  );
};

export default TranslationTest;