import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
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
    aboutDescription: 'PashuMitra is a comprehensive digital platform designed to help farmers implement, monitor, and maintain robust biosecurity practices for their pig and poultry farms.',
    features: {
      title: 'Our Features',
      dashboard: 'Real-time Dashboard with Live Alerts',
      compliance: 'Compliance Tracking and Certification',
      learning: 'Interactive Learning Resources',
      riskAssessment: 'Comprehensive Risk Assessment Tools',
      alerts: 'Instant Alert System',
      multilingual: 'Multi-language Support'
    },
    permissions: {
      title: 'Required Permissions',
      location: 'Location Access - For farm location and alert mapping',
      camera: 'Camera Access - For uploading farm photos and documentation',
      microphone: 'Microphone Access - For voice commands and audio notes'
    },
    selectLanguage: 'Select Your Preferred Language'
  },
  questionnaire: {
    title: 'Biosecurity Assessment Questionnaire',
    subtitle: 'Please answer the following questions to assess your farm\'s biosecurity level',
    questions: {
      farmType: {
        question: 'What type of farm do you own?',
        options: {
          pig: 'Pig farm',
          poultry: 'Poultry farm',
          both: 'Both pig and poultry'
        }
      },
      accessControl: {
        question: 'Do you have restricted entry for visitors and workers?',
        options: {
          yes: 'Yes, only authorized persons can enter',
          partial: 'Partially, visitors can enter with some checks',
          no: 'No restrictions, anyone can enter'
        }
      },
      disinfection: {
        question: 'Do you provide footbaths or disinfection facilities at entry points?',
        options: {
          always: 'Yes, always maintained and used',
          sometimes: 'Yes, but not regularly maintained',
          never: 'No, such facilities are not available'
        }
      },
      quarantine: {
        question: 'When introducing new pigs or poultry, do you quarantine them before mixing with the existing stock?',
        options: {
          always: 'Yes, always',
          sometimes: 'Sometimes',
          never: 'Never'
        }
      },
      feedSafety: {
        question: 'How do you ensure feed and water are safe?',
        options: {
          verified: 'Sourced from verified suppliers & stored hygienically',
          partial: 'Stored properly but source not always verified',
          none: 'No specific checks are done'
        }
      },
      pestControl: {
        question: 'Do you have measures to prevent contact with rodents, wild birds, or stray animals?',
        options: {
          strict: 'Yes, strict control measures in place',
          some: 'Some control measures but not complete',
          none: 'No such measures'
        }
      },
      wasteManagement: {
        question: 'How is manure and dead animal disposal handled?',
        options: {
          proper: 'Properly disposed through burial/incineration/approved methods',
          sometimes: 'Sometimes managed properly, sometimes left in open',
          open: 'Always left in open areas'
        }
      },
      workerHygiene: {
        question: 'Do workers change clothes, wear boots, and wash hands before entering animal sheds?',
        options: {
          strict: 'Yes, strictly followed',
          sometimes: 'Sometimes followed',
          not: 'Not followed'
        }
      },
      farmSeparation: {
        question: 'Is your farm located away from other farms or live animal markets?',
        options: {
          far: 'Yes, more than 1 km away',
          moderate: 'Moderately close (within 500 m)',
          close: 'Very close or within a cluster'
        }
      },
      monitoring: {
        question: 'Do you regularly monitor animals for disease symptoms and report unusual mortality?',
        options: {
          daily: 'Yes, daily monitoring and immediate reporting',
          sometimes: 'Sometimes monitor and report late',
          none: 'No regular monitoring or reporting'
        }
      }
    },
    score: 'Your Biosecurity Score: {{score}}/9',
    recommendations: {
      good: 'Congratulations! Your farm has good biosecurity practices.',
      warning: 'Warning: Your farm is at high risk. Urgent corrective action needed.'
    }
  },
  auth: {
    loginTitle: 'Login to PashuMitra',
    signupTitle: 'Join PashuMitra',
    loginWithGoogle: 'Login with Google',
    signupWithGoogle: 'Sign up with Google',
    orContinueWith: 'Or continue with',
    email: 'Email Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Full Name',
    phone: 'Phone Number',
    farmLocation: 'Farm Location',
    loginButton: 'Login',
    signupButton: 'Sign Up',
    forgotPassword: 'Forgot Password?',
    noAccount: 'Don\'t have an account?',
    hasAccount: 'Already have an account?',
    switchToSignup: 'Sign up here',
    switchToLogin: 'Login here'
  }
};

// Hindi translations (basic implementation - you can expand this)
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
  // Add more Hindi translations as needed
};

// Create empty translation objects for all supported languages
// They will fall back to English but allow language switching
const createEmptyTranslations = () => ({
  common: {},
  nav: {},
  landing: {},
  questionnaire: { questions: {} },
  auth: {}
});

const resources = {
  en: { translation: enTranslations },
  hi: { translation: hiTranslations },
  // Add empty resources for the 9 specified Indian languages
  // This allows i18n to switch languages even without translations
  bn: { translation: createEmptyTranslations() }, // Bengali
  ta: { translation: createEmptyTranslations() }, // Tamil
  te: { translation: createEmptyTranslations() }, // Telugu
  mr: { translation: createEmptyTranslations() }, // Marathi
  gu: { translation: createEmptyTranslations() }, // Gujarati
  kn: { translation: createEmptyTranslations() }, // Kannada
  ml: { translation: createEmptyTranslations() }, // Malayalam
  pa: { translation: createEmptyTranslations() }  // Punjabi
};

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
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i']
    }
  });

export default i18n;