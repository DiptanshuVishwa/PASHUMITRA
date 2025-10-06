import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { aiTranslationService } from '../services/aiTranslationService';

// Base English translations (from original i18n.js)
const enTranslations = {
  common: {
    yes: 'Yes',
    no: 'No',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    loading: 'Loading...',
    error: 'Error occurred',
    success: 'Success',
    warning: 'Warning',
    info: 'Information'
  },
  nav: {
    dashboard: 'Dashboard',
    compliance: 'Compliance',
    learning: 'Learning Section',
    riskAssessment: 'Risk Assessment',
    raiseAlert: 'Raise an Alert',
    notifications: 'Notifications',
    profile: 'Profile',
    faq: 'FAQ',
    privacy: 'Privacy',
    settings: 'Settings',
    feedback: 'Feedback',
    contactVet: 'Contact a Vet',
    contactUs: 'Contact Us',
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout'
  },
  landing: {
    title: 'PashuMitra',
    tagline: 'Your Partner in Farm Protection',
    getStarted: 'Get Started',
    aboutTitle: 'About PashuMitra',
    aboutDescription: 'PashuMitra is a comprehensive digital platform designed to help farmers implement, monitor, and maintain robust biosecurity practices for their pig and poultry farms.'
  }
};

// Hindi translations (from original i18n.js)
const hiTranslations = {
  common: {
    yes: 'हाँ',
    no: 'नहीं',
    submit: 'जमा करें',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि हुई',
    success: 'सफल',
    warning: 'चेतावनी',
    info: 'जानकारी'
  },
  nav: {
    dashboard: 'डैशबोर्ड',
    compliance: 'अनुपालन',
    learning: 'शिक्षा अनुभाग',
    riskAssessment: 'जोखिम मूल्यांकन',
    raiseAlert: 'अलर्ट भेजें',
    notifications: 'सूचनाएं',
    profile: 'प्रोफ़ाइल',
    faq: 'सामान्य प्रश्न',
    privacy: 'गोपनीयता',
    settings: 'सेटिंग्स',
    feedback: 'फीडबैक',
    contactVet: 'पशु चिकित्सक से संपर्क करें',
    contactUs: 'हमसे संपर्क करें',
    login: 'लॉग इन',
    signup: 'साइन अप',
    logout: 'लॉग आउट'
  },
  landing: {
    title: 'पशुमित्र',
    tagline: 'खेत सुरक्षा में आपका साथी',
    getStarted: 'शुरू करें',
    aboutTitle: 'पशुमित्र के बारे में',
    aboutDescription: 'पशुमित्र एक व्यापक डिजिटल प्लेटफॉर्म है जो किसानों को अपने सूअर और मुर्गी के खेतों के लिए मजबूत बायोसिक्योरिटी प्रथाओं को लागू करने, निगरानी करने और बनाए रखने में मदद करने के लिए डिज़ाइन किया गया है।'
  }
};

// Create a proxy translation function that uses AI for missing languages
const createProxyTranslations = (targetLang) => {
  return new Proxy({}, {
    get: function(target, prop) {
      if (typeof prop !== 'string') return undefined;
      
      // If we have a cached translation, use it
      if (target[prop]) {
        return target[prop];
      }
      
      // Get the English text
      const englishText = getNestedValue(enTranslations, prop);
      if (!englishText || englishText === prop) {
        return prop;
      }
      
      // Check AI service cache
      const cacheKey = aiTranslationService.getCacheKey(englishText, targetLang);
      if (aiTranslationService.cache && aiTranslationService.cache.has(cacheKey)) {
        const translatedText = aiTranslationService.cache.get(cacheKey);
        target[prop] = translatedText; // Cache it
        return translatedText;
      }
      
      // Trigger async translation but return English text immediately
      aiTranslationService.translateText(englishText, targetLang)
        .then(translatedText => {
          target[prop] = translatedText;
          // Trigger a re-render by dispatching a custom event
          window.dispatchEvent(new CustomEvent('translationUpdated', {
            detail: { key: prop, value: translatedText, language: targetLang }
          }));
        })
        .catch(error => {
          console.warn(`Translation failed for ${prop}:`, error);
          target[prop] = englishText; // Cache fallback
        });
      
      return englishText; // Return English as immediate fallback
    }
  });
};

// Helper function to get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

// Initialize i18n with enhanced configuration
const initializeEnhancedI18n = () => {
  const resources = {
    en: { translation: enTranslations },
    hi: { translation: hiTranslations }
  };

  // Add proxy resources for the 9 specified Indian languages
  const supportedLanguages = [
    'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa'
  ];

  supportedLanguages.forEach(lang => {
    resources[lang] = { translation: createProxyTranslations(lang) };
  });

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'en',
      fallbackLng: 'en',
      debug: false,
      interpolation: {
        escapeValue: false
      },
      react: {
        useSuspense: false,
        bindI18n: 'languageChanged loaded translationUpdated',
        bindI18nStore: 'added removed',
        transEmptyNodeValue: '',
        transSupportBasicHtmlNodes: true,
        transKeepBasicHtmlNodesFor: ['br', 'strong', 'i']
      }
    });

  return i18n;
};

export default initializeEnhancedI18n;