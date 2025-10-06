import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMenu, 
  FiX, 
  FiUser, 
  FiSettings, 
  FiLogOut, 
  FiBell, 
  FiGlobe,
  FiChevronDown,
  FiHome,
  FiCloud
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/logo.png';

const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 127, 80, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  height: 70px;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    height: 75px;
    background: rgba(255, 255, 255, 0.98);
  }
`;

const NavContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--dark-gray);
  margin-right: auto;
  min-width: 0;
  flex-shrink: 0;
  max-width: calc(100% - 320px);
  
  img {
    height: 45px;
    width: 45px;
    object-fit: contain;
    margin-right: 12px;
    transition: transform 0.3s ease;
    flex-shrink: 0;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
  
  .logo-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    overflow: hidden;
  }
  
  .logo-text {
    font-size: 24px;
    font-weight: 700;
    color: var(--primary-coral);
    letter-spacing: -0.5px;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .tagline {
    font-size: 10px;
    color: #666;
    font-weight: 500;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 2px;
    line-height: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  @media (max-width: 1024px) {
    max-width: calc(100% - 280px);
    
    .tagline {
      font-size: 9px;
    }
  }
  
  @media (max-width: 900px) {
    max-width: calc(100% - 250px);
    
    .tagline {
      display: none;
    }
  }
  
  @media (max-width: 768px) {
    max-width: calc(100% - 200px);
    
    img {
      height: 32px;
      width: 32px;
      margin-right: 6px;
    }
    
    .logo-text {
      font-size: 16px;
      line-height: 1;
    }
  }
  
  @media (max-width: 480px) {
    max-width: calc(100% - 160px);
    
    img {
      height: 28px;
      width: 28px;
      margin-right: 4px;
    }
    
    .logo-text {
      font-size: 14px;
    }
  }
  
  @media (max-width: 360px) {
    max-width: calc(100% - 140px);
    
    img {
      height: 24px;
      width: 24px;
      margin-right: 3px;
    }
    
    .logo-text {
      font-size: 12px;
    }
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 40px;
  flex: 1;
  justify-content: center;
  max-width: calc(100vw - 600px);
  overflow: hidden;
  
  @media (max-width: 1400px) {
    gap: 10px;
    margin: 0 30px;
    max-width: calc(100vw - 550px);
  }
  
  @media (max-width: 1200px) {
    gap: 8px;
    margin: 0 20px;
    max-width: calc(100vw - 500px);
  }
  
  @media (max-width: 900px) {
    gap: 6px;
    margin: 0 15px;
    max-width: calc(100vw - 450px);
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  white-space: nowrap;
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 127, 80, 0.1), rgba(255, 127, 80, 0.05));
    color: var(--primary-coral);
    transform: translateY(-1px);
  }
  
  &.active {
    background: linear-gradient(135deg, var(--primary-coral), #FF6A35);
    color: white;
    box-shadow: 0 2px 8px rgba(255, 127, 80, 0.3);
  }
  
  svg {
    font-size: 16px;
  }
  
  @media (max-width: 1200px) {
    font-size: 13px;
    padding: 6px 8px;
    gap: 4px;
    
    svg {
      font-size: 14px;
    }
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #333;
  font-weight: 500;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 127, 80, 0.1), rgba(255, 127, 80, 0.05));
    color: var(--primary-coral);
    transform: translateY(-1px);
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  @media (max-width: 1200px) {
    font-size: 13px;
    padding: 6px 8px;
  }
  
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 6px 6px;
    gap: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  @media (max-width: 480px) {
    font-size: 11px;
    padding: 4px 4px;
    gap: 2px;
  }
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;
  min-width: 200px;
  padding: 8px 0;
  margin-top: 4px;
  z-index: 1001;
  
  /* Prevent dropdown from going off screen */
  @media (max-width: 1200px) {
    right: -20px;
  }
  
  @media (max-width: 900px) {
    right: -40px;
  }
  
  @media (max-width: 480px) {
    right: -60px;
    min-width: 180px;
  }
`;

const DropdownItem = styled(Link)`
  display: block;
  padding: 12px 16px;
  text-decoration: none;
  color: #333;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
    color: var(--primary-coral);
  }
`;

const AuthButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const AuthButton = styled(Link)`
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  
  &.btn-outline {
    color: #333;
    border: 1.5px solid #e0e0e0;
    background: transparent;
    
    &:hover {
      border-color: var(--primary-coral);
      color: var(--primary-coral);
      transform: translateY(-1px);
      background: rgba(255, 127, 80, 0.05);
    }
  }
  
  &.btn-primary {
    background: linear-gradient(135deg, var(--primary-coral), #FF6A35);
    color: white;
    border: 1.5px solid transparent;
    box-shadow: 0 2px 8px rgba(255, 127, 80, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 127, 80, 0.4);
    }
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  flex-shrink: 0;
  min-width: 280px;
  justify-content: flex-end;
  
  @media (max-width: 1400px) {
    min-width: 250px;
  }
  
  @media (max-width: 1200px) {
    min-width: 220px;
    gap: 8px;
  }
  
  @media (max-width: 900px) {
    min-width: 200px;
    gap: 6px;
  }
  
  @media (max-width: 768px) {
    min-width: auto;
    gap: 6px;
  }
  
  @media (max-width: 480px) {
    gap: 4px;
  }
`;

const NotificationButton = styled.button`
  position: relative;
  background: none;
  border: none;
  color: #333;
  font-size: 18px;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 127, 80, 0.1), rgba(255, 127, 80, 0.05));
    color: var(--primary-coral);
    transform: translateY(-1px);
  }
  
  .notification-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    background: linear-gradient(135deg, #FF4757, #FF3742);
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    font-size: 10px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
    animation: pulse 2s infinite;
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
    padding: 8px;
    
    .notification-badge {
      width: 16px;
      height: 16px;
      font-size: 9px;
      top: 2px;
      right: 2px;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
    padding: 6px;
    
    .notification-badge {
      width: 14px;
      height: 14px;
      font-size: 8px;
    }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const MobileMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 127, 80, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 16px;
  display: none;
  max-height: calc(100vh - 75px);
  overflow-y: auto;
  z-index: 999;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileNavSection = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  h4 {
    margin: 0 0 12px 0;
    color: var(--primary-coral);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding-bottom: 8px;
    border-bottom: 2px solid rgba(255, 127, 80, 0.1);
  }
`;

const MobileNavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin: 4px 0;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 14px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 127, 80, 0.1), rgba(255, 127, 80, 0.05));
    color: var(--primary-coral);
    transform: translateX(4px);
  }
  
  svg {
    margin-right: 8px;
    font-size: 16px;
  }
`;

const MobileNavButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  margin: 4px 0;
  text-align: left;
  background: none;
  border: none;
  color: #333;
  font-weight: 500;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 127, 80, 0.1), rgba(255, 127, 80, 0.05));
    color: var(--primary-coral);
    transform: translateX(4px);
  }
  
  svg {
    margin-right: 8px;
    font-size: 16px;
  }
`;

const MobileUserSection = styled.div`
  border-top: 2px solid rgba(255, 127, 80, 0.1);
  padding-top: 20px;
  margin-top: 20px;
`;

const MobileLanguageSelector = styled.div`
  margin-top: 12px;
  
  select {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid #e0e0e0;
    border-radius: 8px;
    background: white;
    color: #333;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: var(--primary-coral);
      box-shadow: 0 0 0 3px rgba(255, 127, 80, 0.1);
    }
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 20px;
  color: #333;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 127, 80, 0.1), rgba(255, 127, 80, 0.05));
    color: var(--primary-coral);
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const LanguageSelector = styled.div`
  position: relative;
  
  @media (max-width: 768px) {
    min-width: 80px;
  }
  
  @media (max-width: 480px) {
    min-width: 70px;
  }
`;

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { currentLanguage, supportedLanguages, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  
  // Navigation translations for all supported languages
  const getNavTranslation = (text) => {
    const translations = {
      // Hindi (हिंदी)
      'hi': {
        'Home': 'होम',
        'Dashboard': 'डैशबोर्ड',
        'Compliance': 'अनुपालन',
        'Risk Assessment': 'जोखिम मूल्यांकन',
        'Raise an Alert': 'अलर्ट भेजें',
        'Profile': 'प्रोफ़ाइल',
        'Settings': 'सेटिंग्स',
        'Logout': 'लॉगआउट',
        'Login': 'लॉगिन',
        'Sign Up': 'साइन अप',
        'PashuMitra': 'पशुमित्र',
        'YOUR PARTNER IN FARM PROTECTION': 'कृषि संरक्षण में आपका साथी',
        'Others': 'अन्य',
        'Learning': 'शिक्षा',
        'Farm Management': 'फार्म प्रबंधन',
        'Weather Dashboard': 'मौसम डैशबोर्ड',
        'FAQ': 'सामान्य प्रश्न',
        'Privacy': 'गोपनीयता',
        'Feedback': 'फीडबैक',
        'Contact Vet': 'पशु चिकित्सक से संपर्क',
        'Contact Us': 'हमसे संपर्क',
        'Main Menu': 'मुख्य मेनू',
        'User': 'यूजर',
        'Account': 'खाता'
      },
      // Bengali (বাংলা)
      'bn': {
        'Home': 'হোম',
        'Dashboard': 'ড্যাশবোর্ড',
        'Compliance': 'সম্মতি',
        'Risk Assessment': 'ঝুঁকি মূল্যায়ন',
        'Raise an Alert': 'সতর্কতা পাঠান',
        'Profile': 'প্রোফাইল',
        'Settings': 'সেটিংস',
        'Logout': 'লগআউট',
        'Login': 'লগইন',
        'Sign Up': 'সাইন আপ',
        'PashuMitra': 'পশুমিত্র',
        'YOUR PARTNER IN FARM PROTECTION': 'কৃষি সুরক্ষায় আপনার সঙ্গী',
        'Others': 'অন্যান্য',
        'Learning': 'শিক্ষা',
        'Farm Management': 'খামার ব্যবস্থাপনা',
        'Weather Dashboard': 'আবহাওয়া ড্যাশবোর্ড',
        'FAQ': 'সাধারণ প্রশ্ন',
        'Privacy': 'গোপনীয়তা',
        'Feedback': 'ফিডব্যাক',
        'Contact Vet': 'পশু চিকিৎসকের সাথে যোগাযোগ',
        'Contact Us': 'আমাদের সাথে যোগাযোগ',
        'Main Menu': 'মুখ্য মেনু',
        'User': 'ব্যবহারকারী',
        'Account': 'অ্যাকাউন্ট'
      },
      // Telugu (తెలుగు)
      'te': {
        'Home': 'హోమ్',
        'Dashboard': 'డాష్‌బోర్డ్',
        'Compliance': 'కట్టుబడి ఉండండి',
        'Risk Assessment': 'ప్రమాద అంచనా',
        'Raise an Alert': 'అలర్ట్ పంపండి',
        'Profile': 'ప్రొఫైల్',
        'Settings': 'సెట్టింగులు',
        'Logout': 'లాగౌట్',
        'Login': 'లాగిన్',
        'Sign Up': 'సైన్ అప్',
        'PashuMitra': 'పశుమిత్ర',
        'YOUR PARTNER IN FARM PROTECTION': 'వ్యవసాయ రక్షణలో మీ భాగస్వామి',
        'Others': 'ఇతరులు',
        'Learning': 'అభ్యాసం',
        'Farm Management': 'వ్యవసాయ నిర్వహణ',
        'Weather Dashboard': 'వాతావరణ డ్యాష్‌బోర్డ్',
        'FAQ': 'సాధారణ ప్రశ్నలు',
        'Privacy': 'గోప్యత',
        'Feedback': 'అభిప్రాయం',
        'Contact Vet': 'పశు వైద్యుడిని సంప్రదించండి',
        'Contact Us': 'మమ్మల్ని సంప్రదించండి',
        'Main Menu': 'ముఖ్య మెను',
        'User': 'వాడుకరి',
        'Account': 'ఖాతా'
      },
      // Tamil (தமிழ்)
      'ta': {
        'Home': 'முகப்பு',
        'Dashboard': 'டாஷ்போர்ட்',
        'Compliance': 'இணக்கம்',
        'Risk Assessment': 'ஆபத்து மதிப்பீடு',
        'Raise an Alert': 'எச்சரிக்கை அனுப்பு',
        'Profile': 'சுயவிவரம்',
        'Settings': 'அமைப்புகள்',
        'Logout': 'வெளியேறு',
        'Login': 'உள்நுழையவும்',
        'Sign Up': 'பதிவு செய்யவும்',
        'PashuMitra': 'பசுமித்ரா',
        'YOUR PARTNER IN FARM PROTECTION': 'பண்ணை பாதுகாப்பில் உங்கள் கூட்டாளி',
        'Others': 'மற்றவை',
        'Learning': 'கற்றல்',
        'Farm Management': 'பண்ணை நிர்வாகம்',
        'Weather Dashboard': 'வானிலை டாஷ்போர்டு',
        'FAQ': 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
        'Privacy': 'தனியுரிமை',
        'Feedback': 'கருத்து',
        'Contact Vet': 'கால்நடை மருத்துவரை தொடர்பு கொள்ளுங்கள்',
        'Contact Us': 'எங்களை தொடர்பு கொள்ளுங்கள்',
        'Main Menu': 'முக்கிய பட்டியல்',
        'User': 'பயனர்',
        'Account': 'கணக்கு'
      },
      // Marathi (मराठी)
      'mr': {
        'Home': 'होम',
        'Dashboard': 'डॅशबोर्ड',
        'Compliance': 'अनुपालन',
        'Risk Assessment': 'जोखीम मूल्यांकन',
        'Raise an Alert': 'अलर्ट पाठवा',
        'Profile': 'प्रोफाइल',
        'Settings': 'सेटिंग्ज',
        'Logout': 'लॉगआउट',
        'Login': 'लॉगिन',
        'Sign Up': 'साइन अप',
        'PashuMitra': 'पशुमित्र',
        'YOUR PARTNER IN FARM PROTECTION': 'शेती संरक्षणात तुमचा भागीदार',
        'Others': 'इतर',
        'Learning': 'शिक्षा',
        'Farm Management': 'शेती व्यवस्थापन',
        'Weather Dashboard': 'हवामान डॅशबोर्ड',
        'FAQ': 'वारंवार विचारले जाणारे प्रश्न',
        'Privacy': 'गोपनीयता',
        'Feedback': 'फीडबॅक',
        'Contact Vet': 'पशु चिकित्सकाशी संपर्क साधा',
        'Contact Us': 'आमच्याशी संपर्क साधा',
        'Main Menu': 'मुख्य मेनू',
        'User': 'वापरकर्ता',
        'Account': 'खाते'
      },
      // Gujarati (ગુજરાતી)
      'gu': {
        'Home': 'હોમ',
        'Dashboard': 'ડેશબોર્ડ',
        'Compliance': 'અનુપાલન',
        'Risk Assessment': 'જોખમ મૂલ્યાંકન',
        'Raise an Alert': 'અલર્ટ મોકલો',
        'Profile': 'પ્રોફાઇલ',
        'Settings': 'સેટિંગ્સ',
        'Logout': 'લોગઆઉટ',
        'Login': 'લોગિન',
        'Sign Up': 'સાઇન અપ',
        'PashuMitra': 'પશુમિત્ર',
        'YOUR PARTNER IN FARM PROTECTION': 'ખેત સંરક્ષણમાં તમારો ભાગીદાર',
        'Others': 'અન્ય',
        'Learning': 'શિક્ષણ',
        'Farm Management': 'ખેત વ્યવસ્થાપન',
        'Weather Dashboard': 'હવામાન ડેશબોર્ડ',
        'FAQ': 'વારંવાર પૂછાતા પ્રશ્નો',
        'Privacy': 'ગોપનીયતા',
        'Feedback': 'ફીડબેક',
        'Contact Vet': 'પશુવેદ સાથે સંપર્ક કરો',
        'Contact Us': 'અમારો સંપર્ક કરો',
        'Main Menu': 'મુખ્ય મેનુ',
        'User': 'વાપરકર્તા',
        'Account': 'ખાતું'
      },
      // Kannada (ಕನ್ನಡ)
      'kn': {
        'Home': 'ಮುಖಪುಟ',
        'Dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
        'Compliance': 'ಅನುಸರಣೆ',
        'Risk Assessment': 'ಅಪಾಯ ಮೌಲ್ಯಮಾಪನ',
        'Raise an Alert': 'ಅಲರ್ಟ್ ಕಳುಹಿಸಿ',
        'Profile': 'ಪ್ರೊಫೈಲ್',
        'Settings': 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
        'Logout': 'ಲಾಗ್‌ಔಟ್',
        'Login': 'ಲಾಗಿನ್',
        'Sign Up': 'ಸೈನ್ ಅಪ್',
        'PashuMitra': 'ಪಶುಮಿತ್ರ',
        'YOUR PARTNER IN FARM PROTECTION': 'ಕೃಷಿ ಸಂರಕ್ಷಣೆಯಲ್ಲಿ ನಿಮ್ಮ ಸಹಚರ',
        'Others': 'ಇತರರು',
        'Learning': 'ಕಲಿಕೆ',
        'Farm Management': 'ಕೃಷಿ ನಿರ್ವಹಣೆ',
        'Weather Dashboard': 'ಹವಾಮಾನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
        'FAQ': 'ಆಗಾಗ್ಗೆ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು',
        'Privacy': 'ಗೌಪ್ಯತೆ',
        'Feedback': 'ಪ್ರತಿಕ್ರಿಯೆ',
        'Contact Vet': 'ಪಶುವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ',
        'Contact Us': 'ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ',
        'Main Menu': 'ಮುಖ್ಯ ಮೇನು',
        'User': 'ಬೆಲೆಯಾಳು',
        'Account': 'ಖಾತೆ'
      },
      // Malayalam (മലയാളം)
      'ml': {
        'Home': 'ഹോം',
        'Dashboard': 'ഡാഷ്‌ബോർഡ്',
        'Compliance': 'പാലിക്കൽ',
        'Risk Assessment': 'അപകടസാധ്യത വിലയിരുത്തൽ',
        'Raise an Alert': 'അലേർട്ട് അയയ്ക്കുക',
        'Profile': 'പ്രൊഫൈൽ',
        'Settings': 'ക്രമീകരണങ്ങൾ',
        'Logout': 'ലോഗൗട്ട്',
        'Login': 'ലോഗിൻ',
        'Sign Up': 'സൈൻ അപ്പ്',
        'PashuMitra': 'പശുമിത്രൻ',
        'YOUR PARTNER IN FARM PROTECTION': 'കൃഷി സംരക്ഷണത്തിൽ നിങ്ങളുടെ പങ്കാളി',
        'Others': 'മറ്റുള്ളവ',
        'Learning': 'പഠനം',
        'Farm Management': 'കൃഷി നിർവ്വഹണം',
        'Weather Dashboard': 'കാലാവസ്ഥാ ഡാഷ്ബോർഡ്',
        'FAQ': 'സാധാരണ ചോദ്യങ്ങൾ',
        'Privacy': 'സ്വകാര്യത',
        'Feedback': 'ഫീഡ്ബാക്ക്',
        'Contact Vet': 'മൃഗചികിത്സകനെ ബന്ധപ്പെടുക',
        'Contact Us': 'ഞങ്ങളെ ബന്ധപ്പെടുക',
        'Main Menu': 'മുഖ്യ മെനു',
        'User': 'ഉപയോക്താവ്',
        'Account': 'അക്കൗണ്ട്'
      },
      // Punjabi (ਪੰਜਾਬੀ)
      'pa': {
        'Home': 'ਘਰ',
        'Dashboard': 'ਡੈਸ਼ਬੋਰਡ',
        'Compliance': 'ਅਨੁਪਾਲਨ',
        'Risk Assessment': 'ਜੋਖਮ ਮੁਲਾਂਕਣ',
        'Raise an Alert': 'ਅਲਰਟ ਭੇਜੋ',
        'Profile': 'ਪ੍ਰੋਫਾਇਲ',
        'Settings': 'ਸੈਟਿੰਗਾਂ',
        'Logout': 'ਲਾਗਆਉਟ',
        'Login': 'ਲਾਗਇਨ',
        'Sign Up': 'ਸਾਈਨ ਅੱਪ',
        'PashuMitra': 'ਪਸ਼ੂਮਿਤਰ',
        'YOUR PARTNER IN FARM PROTECTION': 'ਖੇਤ ਸੁਰੱਖਿਆ ਵਿੱਚ ਤੁਹਾਡਾ ਸਾਥੀ',
        'Others': 'ਹੋਰ',
        'Learning': 'ਸਿੱਖਣਾ',
        'Farm Management': 'ਖੇਤ ਪ੍ਰਬੰਧਨ',
        'Weather Dashboard': 'ਮੌਸਮੀ ਡੈਸ਼ਬੋਰਡ',
        'FAQ': 'ਆਮ ਸਵਾਲ',
        'Privacy': 'ਗੁਪਤਤਾ',
        'Feedback': 'ਫੀਡਬੈਕ',
        'Contact Vet': 'ਪਸ਼ੂ ਚਿਕਿਤਸਕ ਨਾਲ ਸੰਪਰਕ ਕਰੋ',
        'Contact Us': 'ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ',
        'Main Menu': 'ਮੁੱਖ ਮੀਨੂ',
        'User': 'ਵਰਤੋਂਕਾਰ',
        'Account': 'ਖਾਤਾ'
      }
    };

    const langTranslations = translations[currentLanguage];
    return langTranslations ? (langTranslations[text] || text) : text;
  };
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showOthersDropdown, setShowOthersDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [notificationCount] = useState(3); // This would come from context/API
  const othersDropdownRef = useRef(null);
  const othersButtonRef = useRef(null);
  const userDropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close Others dropdown
      if (othersDropdownRef.current && !othersDropdownRef.current.contains(event.target) && 
          othersButtonRef.current && !othersButtonRef.current.contains(event.target)) {
        setShowOthersDropdown(false);
      }
      
      // Close User dropdown
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      
      // Close Language dropdown
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowOthersDropdown(false);
        setShowUserDropdown(false);
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Calculate Others button position for dropdown
  const getOthersButtonPosition = () => {
    if (othersButtonRef.current) {
      const rect = othersButtonRef.current.getBoundingClientRect();
      return {
        top: rect.bottom + 4, // 4px gap below button
        left: rect.left
      };
    }
    return { top: 70, left: '50%' }; // fallback
  };

  const handleLogout = () => {
    setShowUserDropdown(false);
    logout();
    navigate('/');
  };

  const getCurrentLanguageName = () => {
    const lang = supportedLanguages.find(lang => lang.code === currentLanguage);
    const name = lang ? lang.nativeName : 'English';
    
    // Truncate for mobile display
    if (window.innerWidth <= 768) {
      return name.length > 8 ? name.substring(0, 8) + '...' : name;
    }
    if (window.innerWidth <= 480) {
      return name.length > 6 ? name.substring(0, 6) + '...' : name;
    }
    return name;
  };

  return (
    <NavbarContainer>
      <NavContent>
        <Logo to="/">
          <img 
            src={logo} 
            alt="PashuMitra Logo" 
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="logo-content">
            <span className="logo-text">{getNavTranslation('PashuMitra')}</span>
            <span className="tagline">{getNavTranslation('YOUR PARTNER IN FARM PROTECTION')}</span>
          </div>
        </Logo>

        <NavLinks>
          <NavLink to="/" title="Home">
            <FiHome /> {getNavTranslation('Home')}
          </NavLink>
          <NavLink to="/dashboard">{getNavTranslation('Dashboard')}</NavLink>
          <NavLink to="/compliance">{getNavTranslation('Compliance')}</NavLink>
          <NavLink to="/risk-assessment">{getNavTranslation('Risk Assessment')}</NavLink>
          <NavLink to="/raise-alert">{getNavTranslation('Raise an Alert')}</NavLink>

          <button 
            ref={othersButtonRef}
            onClick={() => setShowOthersDropdown(!showOthersDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: '#333',
              fontWeight: '500',
              fontSize: '14px',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, rgba(255, 127, 80, 0.1), rgba(255, 127, 80, 0.05))';
              e.target.style.color = 'var(--primary-coral)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = '#333';
            }}
          >
            {getNavTranslation('Others')} <FiChevronDown style={{ 
              transform: showOthersDropdown ? 'rotate(180deg)' : 'rotate(0deg)', 
              transition: 'transform 0.3s ease' 
            }} />
          </button>
        </NavLinks>

        <UserMenu>
          {/* Language Selector */}
          <LanguageSelector ref={languageDropdownRef}>
            <DropdownButton 
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <FiGlobe /> {getCurrentLanguageName()}
            </DropdownButton>
            <AnimatePresence>
              {showLanguageDropdown && (
                <DropdownMenu
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ maxHeight: '200px', overflowY: 'auto' }}
                >
                  {supportedLanguages.map((lang) => (
                    <DropdownItem
                      key={lang.code}
                      as="button"
                      onClick={() => {
                        changeLanguage(lang.code);
                        setShowLanguageDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {lang.nativeName}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              )}
            </AnimatePresence>
          </LanguageSelector>

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <NotificationButton onClick={() => navigate('/notifications')}>
                <FiBell />
                {notificationCount > 0 && (
                  <span className="notification-badge">{notificationCount}</span>
                )}
              </NotificationButton>

              {/* User Dropdown */}
              <DropdownContainer ref={userDropdownRef}>
                <DropdownButton 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  <FiUser /> {user?.name || getNavTranslation('User')} <FiChevronDown />
                </DropdownButton>
                <AnimatePresence>
                  {showUserDropdown && (
                    <DropdownMenu
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <DropdownItem to="/profile" onClick={() => setShowUserDropdown(false)}>
                        <FiUser style={{ marginRight: '8px' }} />
                        {getNavTranslation('Profile')}
                      </DropdownItem>
                      <DropdownItem to="/settings" onClick={() => setShowUserDropdown(false)}>
                        <FiSettings style={{ marginRight: '8px' }} />
                        {getNavTranslation('Settings')}
                      </DropdownItem>
                      <DropdownItem
                        as="button"
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <FiLogOut style={{ marginRight: '8px' }} />
                        {getNavTranslation('Logout')}
                      </DropdownItem>
                    </DropdownMenu>
                  )}
                </AnimatePresence>
              </DropdownContainer>
            </>
          ) : (
            <AuthButtons>
              <AuthButton to="/auth" className="btn-outline">
                {getNavTranslation('Login')}
              </AuthButton>
              <AuthButton to="/auth" className="btn-primary">
                {getNavTranslation('Sign Up')}
              </AuthButton>
            </AuthButtons>
          )}

          <MobileMenuButton onClick={() => setShowMobileMenu(!showMobileMenu)}>
            {showMobileMenu ? <FiX /> : <FiMenu />}
          </MobileMenuButton>
        </UserMenu>

        <AnimatePresence>
          {showMobileMenu && (
            <MobileMenu
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Main Navigation */}
              <MobileNavSection>
                <h4>{getNavTranslation('Main Menu')}</h4>
                <MobileNavLink to="/" onClick={() => setShowMobileMenu(false)}>
                  <FiHome />
                  {getNavTranslation('Home')}
                </MobileNavLink>
                <MobileNavLink to="/dashboard" onClick={() => setShowMobileMenu(false)}>
                  {getNavTranslation('Dashboard')}
                </MobileNavLink>
                <MobileNavLink to="/compliance" onClick={() => setShowMobileMenu(false)}>
                  {getNavTranslation('Compliance')}
                </MobileNavLink>
                <MobileNavLink to="/learning" onClick={() => setShowMobileMenu(false)}>
                  {getNavTranslation('Learning')}
                </MobileNavLink>
                <MobileNavLink to="/risk-assessment" onClick={() => setShowMobileMenu(false)}>
                  {getNavTranslation('Risk Assessment')}
                </MobileNavLink>
                <MobileNavLink to="/raise-alert" onClick={() => setShowMobileMenu(false)}>
                  {getNavTranslation('Raise an Alert')}
                </MobileNavLink>
                <MobileNavLink to="/farm-management" onClick={() => setShowMobileMenu(false)}>
                  {getNavTranslation('Farm Management')}
                </MobileNavLink>
                <MobileNavLink to="/weather" onClick={() => setShowMobileMenu(false)}>
                  <FiCloud style={{ marginRight: '8px' }} />
                  {getNavTranslation('Weather Dashboard')}
                </MobileNavLink>
              </MobileNavSection>

              {/* Other Links */}
              <MobileNavSection>
                <h4>{getNavTranslation('Others')}</h4>
                <MobileNavLink to="/faq" onClick={() => setShowMobileMenu(false)}>
                  {getNavTranslation('FAQ')}
                </MobileNavLink>
                <MobileNavLink to="/privacy" onClick={() => setShowMobileMenu(false)}>
                  {getNavTranslation('Privacy')}
                </MobileNavLink>
                <MobileNavLink to="/feedback" onClick={() => setShowMobileMenu(false)}>
                  {getNavTranslation('Feedback')}
                </MobileNavLink>
                <MobileNavLink to="/contact-vet" onClick={() => setShowMobileMenu(false)}>
                  {getNavTranslation('Contact Vet')}
                </MobileNavLink>
                <MobileNavLink to="/contact-us" onClick={() => setShowMobileMenu(false)}>
                  {getNavTranslation('Contact Us')}
                </MobileNavLink>
              </MobileNavSection>

              {/* Language Selector */}
              <MobileNavSection>
                <h4>Language / भाषा</h4>
                <MobileLanguageSelector>
                  <select
                    value={currentLanguage}
                    onChange={(e) => {
                      changeLanguage(e.target.value);
                      setShowMobileMenu(false);
                    }}
                  >
                    {supportedLanguages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.nativeName} ({lang.name})
                      </option>
                    ))}
                  </select>
                </MobileLanguageSelector>
              </MobileNavSection>

              {/* User Section */}
              {isAuthenticated ? (
                <MobileUserSection>
                  <h4>{user?.name || getNavTranslation('User')}</h4>
                  <MobileNavLink to="/profile" onClick={() => setShowMobileMenu(false)}>
                    <FiUser style={{ marginRight: '8px' }} />
                    {getNavTranslation('Profile')}
                  </MobileNavLink>
                  <MobileNavButton
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                  >
                    <FiLogOut style={{ marginRight: '8px' }} />
                    {getNavTranslation('Logout')}
                  </MobileNavButton>
                </MobileUserSection>
              ) : (
                <MobileUserSection>
                  <h4>{getNavTranslation('Account')}</h4>
                  <MobileNavLink to="/auth" onClick={() => setShowMobileMenu(false)}>
                    {getNavTranslation('Login')}
                  </MobileNavLink>
                  <MobileNavLink to="/auth" onClick={() => setShowMobileMenu(false)}>
                    {getNavTranslation('Sign Up')}
                  </MobileNavLink>
                </MobileUserSection>
              )}
            </MobileMenu>
          )}
        </AnimatePresence>
      </NavContent>
      
      {/* Others Dropdown - positioned below Others button */}
      {showOthersDropdown && (() => {
        const position = getOthersButtonPosition();
        return (
          <div 
            ref={othersDropdownRef}
            style={{
              position: 'fixed',
              top: `${position.top}px`,
              left: `${position.left}px`,
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              minWidth: '200px',
              padding: '8px 0',
              zIndex: 1001
            }}>
          <Link to="/learning" onClick={() => setShowOthersDropdown(false)} style={{display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#333', fontSize: '14px', transition: 'all 0.2s ease'}} onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8f9fa'; e.target.style.color = 'var(--primary-coral)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#333'; }}>{getNavTranslation('Learning')}</Link>
          <Link to="/farm-management" onClick={() => setShowOthersDropdown(false)} style={{display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#333', fontSize: '14px', transition: 'all 0.2s ease'}} onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8f9fa'; e.target.style.color = 'var(--primary-coral)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#333'; }}>{getNavTranslation('Farm Management')}</Link>
          <Link to="/weather" onClick={() => setShowOthersDropdown(false)} style={{display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#333', fontSize: '14px', transition: 'all 0.2s ease'}} onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8f9fa'; e.target.style.color = 'var(--primary-coral)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#333'; }}>{getNavTranslation('Weather Dashboard')}</Link>
          <Link to="/faq" onClick={() => setShowOthersDropdown(false)} style={{display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#333', fontSize: '14px', transition: 'all 0.2s ease'}} onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8f9fa'; e.target.style.color = 'var(--primary-coral)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#333'; }}>{getNavTranslation('FAQ')}</Link>
          <Link to="/privacy" onClick={() => setShowOthersDropdown(false)} style={{display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#333', fontSize: '14px', transition: 'all 0.2s ease'}} onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8f9fa'; e.target.style.color = 'var(--primary-coral)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#333'; }}>{getNavTranslation('Privacy')}</Link>
          <Link to="/feedback" onClick={() => setShowOthersDropdown(false)} style={{display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#333', fontSize: '14px', transition: 'all 0.2s ease'}} onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8f9fa'; e.target.style.color = 'var(--primary-coral)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#333'; }}>{getNavTranslation('Feedback')}</Link>
          <Link to="/contact-vet" onClick={() => setShowOthersDropdown(false)} style={{display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#333', fontSize: '14px', transition: 'all 0.2s ease'}} onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8f9fa'; e.target.style.color = 'var(--primary-coral)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#333'; }}>{getNavTranslation('Contact Vet')}</Link>
          <Link to="/contact-us" onClick={() => setShowOthersDropdown(false)} style={{display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#333', fontSize: '14px', transition: 'all 0.2s ease'}} onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8f9fa'; e.target.style.color = 'var(--primary-coral)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#333'; }}>{getNavTranslation('Contact Us')}</Link>
          </div>
        );
      })()}
    </NavbarContainer>
  );
};

export default Navbar;