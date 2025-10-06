import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './LanguageLoadingModal.css';

const LanguageLoadingModal = () => {
  const { 
    isLoading, 
    loadingProgress, 
    loadingMessage, 
    isFirstTimeLanguage,
    getCurrentLanguage 
  } = useLanguage();

  if (!isLoading) return null;

  const currentLang = getCurrentLanguage();

  return (
    <div className="language-loading-overlay">
      <div className="language-loading-modal">
        {/* Language Flag/Icon */}
        <div className="language-icon">
          <div className="language-flag">
            {currentLang.nativeName.charAt(0)}
          </div>
        </div>

        {/* Loading Content */}
        <div className="loading-content">
          <h3 className="loading-title">
            {isFirstTimeLanguage 
              ? `Loading ${currentLang.nativeName}` 
              : `Switching to ${currentLang.nativeName}`}
          </h3>
          
          <p className="loading-description">
            {isFirstTimeLanguage 
              ? "First-time setup may take 20-30 seconds while we prepare the translation models."
              : "Preparing your content in the selected language..."}
          </p>

          {loadingMessage && (
            <p className="loading-message">{loadingMessage}</p>
          )}

          {/* Progress Bar */}
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <span className="progress-text">{loadingProgress}%</span>
          </div>

          {/* Loading Animation */}
          <div className="loading-animation">
            <div className="loading-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>

          {isFirstTimeLanguage && (
            <div className="first-time-info">
              <div className="info-icon">ℹ️</div>
              <small>
                This language will load faster next time. We're preparing AI translation models for the best experience.
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LanguageLoadingModal;