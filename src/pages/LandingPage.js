import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMapPin, 
  FiCamera, 
  FiMic, 
  FiCheck, 
  FiX,
  FiShield,
  FiTrendingUp,
  FiUsers,
  FiGlobe,
  FiBell
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LandingContainer = styled.div`
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding-top: 20px;
    min-height: calc(100vh - 75px);
  }
`;

// Removed PermissionsSection as it's now in modal

const PermissionCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 24px;
  margin: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &.granted {
    background: rgba(76, 175, 80, 0.2);
  }
  
  &.denied {
    background: rgba(244, 67, 54, 0.2);
  }
`;

const PermissionIcon = styled.div`
  font-size: 24px;
  padding: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
`;

const PermissionContent = styled.div`
  flex: 1;
  text-align: left;
  
  h3 {
    margin: 0 0 8px;
    font-size: 18px;
  }
  
  p {
    margin: 0;
    opacity: 0.9;
    font-size: 14px;
  }
`;

const StatusIcon = styled.div`
  font-size: 20px;
`;

// Modal/Popup Styles
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  width: 100%;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  h2 {
    margin: 0;
    color: var(--dark-gray);
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: var(--dark-gray);
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: var(--primary-coral);
  }
`;

const PermissionsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const LanguageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
`;

const LanguageCard = styled(motion.button)`
  background: white;
  border: 2px solid ${props => props.selected ? 'var(--primary-coral)' : '#e0e0e0'};
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-coral);
    transform: translateY(-2px);
  }
  
  .native-name {
    font-weight: bold;
    font-size: 16px;
    color: var(--dark-gray);
    margin-bottom: 4px;
  }
  
  .english-name {
    font-size: 12px;
    color: #666;
  }
`;

const PermissionRequestButton = styled(motion.button)`
  background: var(--primary-coral);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  margin: 20px 10px 0 0;
  
  &:hover {
    background: #FF6A35;
  }
`;

const LanguageButton = styled(motion.button)`
  background: var(--primary-coral);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  margin: 20px 10px 0 0;
  
  &:hover {
    background: #FF6A35;
  }
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 80px 0;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 40px 0 60px 0;
    margin-top: 0;
  }
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const HeroTitle = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: bold;
  color: var(--dark-gray);
  margin-bottom: 16px;
  
  .highlight {
    color: var(--primary-coral);
  }
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const HeroImages = styled(motion.div)`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin: 40px 0;
  flex-wrap: wrap;
`;

const AnimalImage = styled(motion.div)`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-coral), #FF6A35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  color: white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
`;

const GetStartedButton = styled(motion.button)`
  background: var(--primary-coral);
  color: white;
  border: none;
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #FF6A35;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255, 127, 80, 0.3);
  }
`;

// Moving Livestock Animation Styles
const LivestockAnimationContainer = styled.div`
  width: 100%;
  height: 80px;
  overflow: hidden;
  position: relative;
  margin: 20px 0 40px 0;
  pointer-events: none;
  
  @media (max-width: 768px) {
    height: 60px;
    margin: 15px 0 30px 0;
  }
`;

const MovingAnimal = styled(motion.div)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: ${props => props.size || '40px'};
  color: var(--primary-coral);
  opacity: 0.8;
  
  @media (max-width: 768px) {
    font-size: ${props => props.mobileSize || '30px'};
  }
`;

// SVG Pig Outline Component
const PigOutline = styled.svg`
  width: ${props => props.size || '50px'};
  height: ${props => props.size || '50px'};
  fill: none;
  stroke: var(--primary-coral);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  
  @media (max-width: 768px) {
    width: ${props => props.mobileSize || '35px'};
    height: ${props => props.mobileSize || '35px'};
  }
`;

// SVG Hen Outline Component
const HenOutline = styled.svg`
  width: ${props => props.size || '45px'};
  height: ${props => props.size || '45px'};
  fill: none;
  stroke: var(--primary-coral);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  
  @media (max-width: 768px) {
    width: ${props => props.mobileSize || '32px'};
    height: ${props => props.mobileSize || '32px'};
  }
`;

const AboutSection = styled.section`
  padding: 80px 0;
  background: white;
`;

const AboutContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
  
  h2 {
    font-size: 2.5rem;
    color: var(--dark-gray);
    margin-bottom: 24px;
  }
  
  p {
    font-size: 1.1rem;
    color: #666;
    max-width: 800px;
    margin: 0 auto 60px;
    line-height: 1.8;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 60px;
`;

const FeatureCard = styled(motion.div)`
  text-align: center;
  padding: 40px 20px;
  border-radius: 16px;
  background: #f8f9fa;
  
  .icon {
    font-size: 48px;
    color: var(--primary-coral);
    margin-bottom: 20px;
  }
  
  h3 {
    font-size: 1.25rem;
    color: var(--dark-gray);
    margin-bottom: 16px;
  }
  
  p {
    color: #666;
    margin: 0;
  }
`;

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const { supportedLanguages, currentLanguage, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState({
    location: null,
    camera: null,
    microphone: null
  });
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  useEffect(() => {
    // Check if permissions have been requested before
    const permissionsRequested = localStorage.getItem('pashumitra_permissions_requested');
    if (!permissionsRequested) {
      setShowPermissionsModal(true);
    } else {
      // Auto-check current permissions status
      checkPermissions();
    }

    // Show language selector if no language is set
    if (!localStorage.getItem('pashumitra_language')) {
      setTimeout(() => setShowLanguageModal(true), 1000);
    }
  }, []);

  const checkPermissions = async () => {
    // Check current permission status without requesting
    try {
      const locationPermission = await navigator.permissions.query({name: 'geolocation'});
      setPermissions(prev => ({ ...prev, location: locationPermission.state }));
    } catch (error) {
      setPermissions(prev => ({ ...prev, location: 'prompt' }));
    }

    try {
      const cameraPermission = await navigator.permissions.query({name: 'camera'});
      setPermissions(prev => ({ ...prev, camera: cameraPermission.state }));
    } catch (error) {
      setPermissions(prev => ({ ...prev, camera: 'prompt' }));
    }

    try {
      const micPermission = await navigator.permissions.query({name: 'microphone'});
      setPermissions(prev => ({ ...prev, microphone: micPermission.state }));
    } catch (error) {
      setPermissions(prev => ({ ...prev, microphone: 'prompt' }));
    }
  };

  const requestPermissions = async () => {
    // Location permission
    try {
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      setPermissions(prev => ({ ...prev, location: 'granted' }));
    } catch (error) {
      setPermissions(prev => ({ ...prev, location: 'denied' }));
    }

    // Camera permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissions(prev => ({ ...prev, camera: 'granted' }));
    } catch (error) {
      setPermissions(prev => ({ ...prev, camera: 'denied' }));
    }

    // Microphone permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissions(prev => ({ ...prev, microphone: 'granted' }));
    } catch (error) {
      setPermissions(prev => ({ ...prev, microphone: 'denied' }));
    }

    // Mark permissions as requested
    localStorage.setItem('pashumitra_permissions_requested', 'true');
    setShowPermissionsModal(false);
  };

  const requestSpecificPermission = async (type) => {
    try {
      switch (type) {
        case 'location':
          await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          setPermissions(prev => ({ ...prev, location: 'granted' }));
          break;
        case 'camera':
          const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoStream.getTracks().forEach(track => track.stop());
          setPermissions(prev => ({ ...prev, camera: 'granted' }));
          break;
        case 'microphone':
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioStream.getTracks().forEach(track => track.stop());
          setPermissions(prev => ({ ...prev, microphone: 'granted' }));
          break;
        default:
          break;
      }
    } catch (error) {
      setPermissions(prev => ({ ...prev, [type]: 'denied' }));
    }
  };

  const handleLanguageSelect = (languageCode) => {
    changeLanguage(languageCode);
    setShowLanguageModal(false);
  };

  // Function to play rooster and chicks sound effect
  const playFarmSound = () => {
    try {
      // Create audio element and play the MP3 file
      const audio = new Audio('/sounds/rooster-and-chicks.mp3');
      audio.volume = 0.7; // Set volume to 70%
      audio.play().catch(error => {
        console.log('Audio playback failed:', error);
      });
      
      console.log('🐓🐥 Rooster and chicks sound played!');
    } catch (error) {
      console.log('Audio not supported in this browser:', error);
    }
  };

  const handleGetStarted = () => {
    // Play rooster and chicks sound effect
    playFarmSound();
    
    // Navigate after a short delay to let the sound start playing
    setTimeout(() => {
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/auth');
      }
    }, 500);
  };

  const getPermissionIcon = (permission, status) => {
    const icons = {
      location: FiMapPin,
      camera: FiCamera,
      microphone: FiMic
    };
    const IconComponent = icons[permission];
    return <IconComponent />;
  };

  const getStatusIcon = (status) => {
    if (status === 'granted') return <FiCheck />;
    if (status === 'denied') return <FiX />;
    return null;
  };

  return (
    <LandingContainer>

      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          <HeroTitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="highlight">{t('landing.title')}</span>
          </HeroTitle>
          <HeroSubtitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t('landing.tagline')}
          </HeroSubtitle>

          <HeroImages
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <AnimalImage
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              🐷
            </AnimalImage>
            <AnimalImage
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              🐔
            </AnimalImage>
          </HeroImages>

          {/* Moving Livestock Animation */}
          <LivestockAnimationContainer>
            {/* Pig 1 */}
            <MovingAnimal
              initial={{ x: '-600px' }}
              animate={{ 
                x: 'calc(100vw + 200px)'
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear'
              }}
              style={{ left: '0px' }}
            >
              <PigOutline size="50px" mobileSize="35px" viewBox="0 0 100 100">
                {/* Pig body - facing right */}
                <ellipse cx="50" cy="60" rx="30" ry="18" />
                {/* Pig head - facing right */}
                <ellipse cx="75" cy="40" rx="15" ry="12" />
                {/* Pig snout - facing right */}
                <ellipse cx="88" cy="40" rx="6" ry="4" />
                {/* Pig nostril */}
                <circle cx="92" cy="40" r="1" fill="var(--primary-coral)" />
                {/* Pig ear - facing right */}
                <path d="M72 30 L65 22 L68 35 Z" />
                {/* Pig legs - facing right */}
                <line x1="35" y1="75" x2="35" y2="85" strokeWidth="3" />
                <line x1="45" y1="75" x2="45" y2="85" strokeWidth="3" />
                <line x1="60" y1="75" x2="60" y2="85" strokeWidth="3" />
                <line x1="70" y1="75" x2="70" y2="85" strokeWidth="3" />
                {/* Pig tail - curly facing right */}
                <path d="M22 55 Q15 50 18 58 Q22 62 18 60" strokeWidth="2" fill="none" />
                {/* Pig eye - facing right */}
                <circle cx="80" cy="35" r="2" fill="var(--primary-coral)" />
              </PigOutline>
            </MovingAnimal>

            {/* Hen 1 */}
            <MovingAnimal
              initial={{ x: '-600px' }}
              animate={{ 
                x: 'calc(100vw + 200px)'
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear'
              }}
              style={{ left: '60px' }}
            >
              <HenOutline size="45px" mobileSize="32px" viewBox="0 0 100 100">
                {/* Hen body - facing right */}
                <ellipse cx="50" cy="65" rx="25" ry="18" />
                {/* Hen head - facing right */}
                <circle cx="75" cy="45" r="12" />
                {/* Hen beak - facing right */}
                <path d="M85 45 L92 47 L85 49 Z" />
                {/* Hen comb - facing right */}
                <path d="M80 35 Q78 30 75 35 Q72 30 70 35 Q68 32 66 38" strokeWidth="2" fill="none" />
                {/* Hen wattle - facing right */}
                <ellipse cx="82" cy="52" rx="3" ry="5" />
                {/* Hen neck - facing right */}
                <path d="M68 50 Q60 55 62 60" strokeWidth="4" />
                {/* Hen tail feathers - facing right */}
                <path d="M30 55 Q20 45 17 60 Q20 70 25 65 Q27 58 30 55" strokeWidth="2" fill="none" />
                <path d="M27 58 Q17 48 14 63 Q17 73 22 68" strokeWidth="2" fill="none" />
                {/* Hen legs - facing right */}
                <line x1="45" y1="78" x2="45" y2="88" strokeWidth="3" />
                <line x1="60" y1="78" x2="60" y2="88" strokeWidth="3" />
                {/* Hen feet - facing right */}
                <path d="M63 88 L67 92 M60 88 L60 92 M57 88 L53 92" strokeWidth="2" />
                <path d="M48 88 L52 92 M45 88 L45 92 M42 88 L38 92" strokeWidth="2" />
                {/* Hen eye - facing right */}
                <circle cx="78" cy="42" r="2" fill="var(--primary-coral)" />
                {/* Hen wing - facing right */}
                <ellipse cx="52" cy="58" rx="12" ry="8" transform="rotate(-15 52 58)" />
              </HenOutline>
            </MovingAnimal>

            {/* Pig 2 */}
            <MovingAnimal
              initial={{ x: '-600px' }}
              animate={{ 
                x: 'calc(100vw + 200px)'
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear'
              }}
              style={{ left: '115px' }}
            >
              <PigOutline size="50px" mobileSize="35px" viewBox="0 0 100 100">
                {/* Pig body - facing right */}
                <ellipse cx="50" cy="60" rx="30" ry="18" />
                {/* Pig head - facing right */}
                <ellipse cx="75" cy="40" rx="15" ry="12" />
                {/* Pig snout - facing right */}
                <ellipse cx="88" cy="40" rx="6" ry="4" />
                {/* Pig nostril */}
                <circle cx="92" cy="40" r="1" fill="var(--primary-coral)" />
                {/* Pig ear - facing right */}
                <path d="M72 30 L65 22 L68 35 Z" />
                {/* Pig legs - facing right */}
                <line x1="35" y1="75" x2="35" y2="85" strokeWidth="3" />
                <line x1="45" y1="75" x2="45" y2="85" strokeWidth="3" />
                <line x1="60" y1="75" x2="60" y2="85" strokeWidth="3" />
                <line x1="70" y1="75" x2="70" y2="85" strokeWidth="3" />
                {/* Pig tail - curly facing right */}
                <path d="M22 55 Q15 50 18 58 Q22 62 18 60" strokeWidth="2" fill="none" />
                {/* Pig eye - facing right */}
                <circle cx="80" cy="35" r="2" fill="var(--primary-coral)" />
              </PigOutline>
            </MovingAnimal>

            {/* Hen 2 */}
            <MovingAnimal
              initial={{ x: '-600px' }}
              animate={{ 
                x: 'calc(100vw + 200px)'
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear'
              }}
              style={{ left: '175px' }}
            >
              <HenOutline size="45px" mobileSize="32px" viewBox="0 0 100 100">
                {/* Hen body - facing right */}
                <ellipse cx="50" cy="65" rx="25" ry="18" />
                {/* Hen head - facing right */}
                <circle cx="75" cy="45" r="12" />
                {/* Hen beak - facing right */}
                <path d="M85 45 L92 47 L85 49 Z" />
                {/* Hen comb - facing right */}
                <path d="M80 35 Q78 30 75 35 Q72 30 70 35 Q68 32 66 38" strokeWidth="2" fill="none" />
                {/* Hen wattle - facing right */}
                <ellipse cx="82" cy="52" rx="3" ry="5" />
                {/* Hen neck - facing right */}
                <path d="M68 50 Q60 55 62 60" strokeWidth="4" />
                {/* Hen tail feathers - facing right */}
                <path d="M30 55 Q20 45 17 60 Q20 70 25 65 Q27 58 30 55" strokeWidth="2" fill="none" />
                <path d="M27 58 Q17 48 14 63 Q17 73 22 68" strokeWidth="2" fill="none" />
                {/* Hen legs - facing right */}
                <line x1="45" y1="78" x2="45" y2="88" strokeWidth="3" />
                <line x1="60" y1="78" x2="60" y2="88" strokeWidth="3" />
                {/* Hen feet - facing right */}
                <path d="M63 88 L67 92 M60 88 L60 92 M57 88 L53 92" strokeWidth="2" />
                <path d="M48 88 L52 92 M45 88 L45 92 M42 88 L38 92" strokeWidth="2" />
                {/* Hen eye - facing right */}
                <circle cx="78" cy="42" r="2" fill="var(--primary-coral)" />
                {/* Hen wing - facing right */}
                <ellipse cx="52" cy="58" rx="12" ry="8" transform="rotate(-15 52 58)" />
              </HenOutline>
            </MovingAnimal>

            {/* Pig 3 */}
            <MovingAnimal
              initial={{ x: '-600px' }}
              animate={{ 
                x: 'calc(100vw + 200px)'
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear'
              }}
              style={{ left: '230px' }}
            >
              <PigOutline size="50px" mobileSize="35px" viewBox="0 0 100 100">
                {/* Pig body - facing right */}
                <ellipse cx="50" cy="60" rx="30" ry="18" />
                {/* Pig head - facing right */}
                <ellipse cx="75" cy="40" rx="15" ry="12" />
                {/* Pig snout - facing right */}
                <ellipse cx="88" cy="40" rx="6" ry="4" />
                {/* Pig nostril */}
                <circle cx="92" cy="40" r="1" fill="var(--primary-coral)" />
                {/* Pig ear - facing right */}
                <path d="M72 30 L65 22 L68 35 Z" />
                {/* Pig legs - facing right */}
                <line x1="35" y1="75" x2="35" y2="85" strokeWidth="3" />
                <line x1="45" y1="75" x2="45" y2="85" strokeWidth="3" />
                <line x1="60" y1="75" x2="60" y2="85" strokeWidth="3" />
                <line x1="70" y1="75" x2="70" y2="85" strokeWidth="3" />
                {/* Pig tail - curly facing right */}
                <path d="M22 55 Q15 50 18 58 Q22 62 18 60" strokeWidth="2" fill="none" />
                {/* Pig eye - facing right */}
                <circle cx="80" cy="35" r="2" fill="var(--primary-coral)" />
              </PigOutline>
            </MovingAnimal>

            {/* Hen 3 */}
            <MovingAnimal
              initial={{ x: '-600px' }}
              animate={{ 
                x: 'calc(100vw + 200px)'
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear'
              }}
              style={{ left: '290px' }}
            >
              <HenOutline size="45px" mobileSize="32px" viewBox="0 0 100 100">
                {/* Hen body - facing right */}
                <ellipse cx="50" cy="65" rx="25" ry="18" />
                {/* Hen head - facing right */}
                <circle cx="75" cy="45" r="12" />
                {/* Hen beak - facing right */}
                <path d="M85 45 L92 47 L85 49 Z" />
                {/* Hen comb - facing right */}
                <path d="M80 35 Q78 30 75 35 Q72 30 70 35 Q68 32 66 38" strokeWidth="2" fill="none" />
                {/* Hen wattle - facing right */}
                <ellipse cx="82" cy="52" rx="3" ry="5" />
                {/* Hen neck - facing right */}
                <path d="M68 50 Q60 55 62 60" strokeWidth="4" />
                {/* Hen tail feathers - facing right */}
                <path d="M30 55 Q20 45 17 60 Q20 70 25 65 Q27 58 30 55" strokeWidth="2" fill="none" />
                <path d="M27 58 Q17 48 14 63 Q17 73 22 68" strokeWidth="2" fill="none" />
                {/* Hen legs - facing right */}
                <line x1="45" y1="78" x2="45" y2="88" strokeWidth="3" />
                <line x1="60" y1="78" x2="60" y2="88" strokeWidth="3" />
                {/* Hen feet - facing right */}
                <path d="M63 88 L67 92 M60 88 L60 92 M57 88 L53 92" strokeWidth="2" />
                <path d="M48 88 L52 92 M45 88 L45 92 M42 88 L38 92" strokeWidth="2" />
                {/* Hen eye - facing right */}
                <circle cx="78" cy="42" r="2" fill="var(--primary-coral)" />
                {/* Hen wing - facing right */}
                <ellipse cx="52" cy="58" rx="12" ry="8" transform="rotate(-15 52 58)" />
              </HenOutline>
            </MovingAnimal>

            {/* Pig 4 */}
            <MovingAnimal
              initial={{ x: '-600px' }}
              animate={{ 
                x: 'calc(100vw + 200px)'
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear'
              }}
              style={{ left: '345px' }}
            >
              <PigOutline size="50px" mobileSize="35px" viewBox="0 0 100 100">
                {/* Pig body - facing right */}
                <ellipse cx="50" cy="60" rx="30" ry="18" />
                {/* Pig head - facing right */}
                <ellipse cx="75" cy="40" rx="15" ry="12" />
                {/* Pig snout - facing right */}
                <ellipse cx="88" cy="40" rx="6" ry="4" />
                {/* Pig nostril */}
                <circle cx="92" cy="40" r="1" fill="var(--primary-coral)" />
                {/* Pig ear - facing right */}
                <path d="M72 30 L65 22 L68 35 Z" />
                {/* Pig legs - facing right */}
                <line x1="35" y1="75" x2="35" y2="85" strokeWidth="3" />
                <line x1="45" y1="75" x2="45" y2="85" strokeWidth="3" />
                <line x1="60" y1="75" x2="60" y2="85" strokeWidth="3" />
                <line x1="70" y1="75" x2="70" y2="85" strokeWidth="3" />
                {/* Pig tail - curly facing right */}
                <path d="M22 55 Q15 50 18 58 Q22 62 18 60" strokeWidth="2" fill="none" />
                {/* Pig eye - facing right */}
                <circle cx="80" cy="35" r="2" fill="var(--primary-coral)" />
              </PigOutline>
            </MovingAnimal>

            {/* Hen 4 */}
            <MovingAnimal
              initial={{ x: '-600px' }}
              animate={{ 
                x: 'calc(100vw + 200px)'
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear'
              }}
              style={{ left: '405px' }}
            >
              <HenOutline size="45px" mobileSize="32px" viewBox="0 0 100 100">
                {/* Hen body - facing right */}
                <ellipse cx="50" cy="65" rx="25" ry="18" />
                {/* Hen head - facing right */}
                <circle cx="75" cy="45" r="12" />
                {/* Hen beak - facing right */}
                <path d="M85 45 L92 47 L85 49 Z" />
                {/* Hen comb - facing right */}
                <path d="M80 35 Q78 30 75 35 Q72 30 70 35 Q68 32 66 38" strokeWidth="2" fill="none" />
                {/* Hen wattle - facing right */}
                <ellipse cx="82" cy="52" rx="3" ry="5" />
                {/* Hen neck - facing right */}
                <path d="M68 50 Q60 55 62 60" strokeWidth="4" />
                {/* Hen tail feathers - facing right */}
                <path d="M30 55 Q20 45 17 60 Q20 70 25 65 Q27 58 30 55" strokeWidth="2" fill="none" />
                <path d="M27 58 Q17 48 14 63 Q17 73 22 68" strokeWidth="2" fill="none" />
                {/* Hen legs - facing right */}
                <line x1="45" y1="78" x2="45" y2="88" strokeWidth="3" />
                <line x1="60" y1="78" x2="60" y2="88" strokeWidth="3" />
                {/* Hen feet - facing right */}
                <path d="M63 88 L67 92 M60 88 L60 92 M57 88 L53 92" strokeWidth="2" />
                <path d="M48 88 L52 92 M45 88 L45 92 M42 88 L38 92" strokeWidth="2" />
                {/* Hen eye - facing right */}
                <circle cx="78" cy="42" r="2" fill="var(--primary-coral)" />
                {/* Hen wing - facing right */}
                <ellipse cx="52" cy="58" rx="12" ry="8" transform="rotate(-15 52 58)" />
              </HenOutline>
            </MovingAnimal>

            {/* Pig 5 */}
            <MovingAnimal
              initial={{ x: '-600px' }}
              animate={{ 
                x: 'calc(100vw + 200px)'
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear'
              }}
              style={{ left: '460px' }}
            >
              <PigOutline size="50px" mobileSize="35px" viewBox="0 0 100 100">
                {/* Pig body - facing right */}
                <ellipse cx="50" cy="60" rx="30" ry="18" />
                {/* Pig head - facing right */}
                <ellipse cx="75" cy="40" rx="15" ry="12" />
                {/* Pig snout - facing right */}
                <ellipse cx="88" cy="40" rx="6" ry="4" />
                {/* Pig nostril */}
                <circle cx="92" cy="40" r="1" fill="var(--primary-coral)" />
                {/* Pig ear - facing right */}
                <path d="M72 30 L65 22 L68 35 Z" />
                {/* Pig legs - facing right */}
                <line x1="35" y1="75" x2="35" y2="85" strokeWidth="3" />
                <line x1="45" y1="75" x2="45" y2="85" strokeWidth="3" />
                <line x1="60" y1="75" x2="60" y2="85" strokeWidth="3" />
                <line x1="70" y1="75" x2="70" y2="85" strokeWidth="3" />
                {/* Pig tail - curly facing right */}
                <path d="M22 55 Q15 50 18 58 Q22 62 18 60" strokeWidth="2" fill="none" />
                {/* Pig eye - facing right */}
                <circle cx="80" cy="35" r="2" fill="var(--primary-coral)" />
              </PigOutline>
            </MovingAnimal>

            {/* Hen 5 */}
            <MovingAnimal
              initial={{ x: '-600px' }}
              animate={{ 
                x: 'calc(100vw + 200px)'
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear'
              }}
              style={{ left: '520px' }}
            >
              <HenOutline size="45px" mobileSize="32px" viewBox="0 0 100 100">
                {/* Hen body - facing right */}
                <ellipse cx="50" cy="65" rx="25" ry="18" />
                {/* Hen head - facing right */}
                <circle cx="75" cy="45" r="12" />
                {/* Hen beak - facing right */}
                <path d="M85 45 L92 47 L85 49 Z" />
                {/* Hen comb - facing right */}
                <path d="M80 35 Q78 30 75 35 Q72 30 70 35 Q68 32 66 38" strokeWidth="2" fill="none" />
                {/* Hen wattle - facing right */}
                <ellipse cx="82" cy="52" rx="3" ry="5" />
                {/* Hen neck - facing right */}
                <path d="M68 50 Q60 55 62 60" strokeWidth="4" />
                {/* Hen tail feathers - facing right */}
                <path d="M30 55 Q20 45 17 60 Q20 70 25 65 Q27 58 30 55" strokeWidth="2" fill="none" />
                <path d="M27 58 Q17 48 14 63 Q17 73 22 68" strokeWidth="2" fill="none" />
                {/* Hen legs - facing right */}
                <line x1="45" y1="78" x2="45" y2="88" strokeWidth="3" />
                <line x1="60" y1="78" x2="60" y2="88" strokeWidth="3" />
                {/* Hen feet - facing right */}
                <path d="M63 88 L67 92 M60 88 L60 92 M57 88 L53 92" strokeWidth="2" />
                <path d="M48 88 L52 92 M45 88 L45 92 M42 88 L38 92" strokeWidth="2" />
                {/* Hen eye - facing right */}
                <circle cx="78" cy="42" r="2" fill="var(--primary-coral)" />
                {/* Hen wing - facing right */}
                <ellipse cx="52" cy="58" rx="12" ry="8" transform="rotate(-15 52 58)" />
              </HenOutline>
            </MovingAnimal>
          </LivestockAnimationContainer>

          {!isAuthenticated && (
            <GetStartedButton
              onClick={handleGetStarted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {t('landing.getStarted')}
            </GetStartedButton>
          )}
        </HeroContent>
      </HeroSection>

      {/* About Section */}
      <AboutSection>
        <AboutContent>
          <h2>{t('landing.aboutTitle')}</h2>
          <p>{t('landing.aboutDescription')}</p>

          <FeaturesGrid>
            <FeatureCard
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="icon"><FiShield /></div>
              <h3>{t('landing.features.dashboard')}</h3>
              <p>Monitor your farm's biosecurity status in real-time with comprehensive alerts and mapping.</p>
            </FeatureCard>

            <FeatureCard
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="icon"><FiTrendingUp /></div>
              <h3>{t('landing.features.compliance')}</h3>
              <p>Track certifications and ensure compliance with regulatory standards.</p>
            </FeatureCard>

            <FeatureCard
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="icon"><FiUsers /></div>
              <h3>{t('landing.features.learning')}</h3>
              <p>Access comprehensive learning resources and best practices for biosecurity.</p>
            </FeatureCard>

            <FeatureCard
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="icon"><FiBell /></div>
              <h3>{t('landing.features.alerts')}</h3>
              <p>Instant alert system to notify nearby farmers of potential biosecurity threats.</p>
            </FeatureCard>

            <FeatureCard
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="icon"><FiGlobe /></div>
              <h3>{t('landing.features.multilingual')}</h3>
              <p>Available in all major Indian languages for maximum accessibility.</p>
            </FeatureCard>
          </FeaturesGrid>
        </AboutContent>
      </AboutSection>

      {/* Permissions Modal */}
      <AnimatePresence>
        {showPermissionsModal && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPermissionsModal(false)}
          >
            <ModalContent
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <h2>{t('landing.permissions.title')}</h2>
                <CloseButton onClick={() => setShowPermissionsModal(false)}>
                  <FiX />
                </CloseButton>
              </ModalHeader>
              
              <p style={{ marginBottom: '20px', color: '#666' }}>
                PashuMitra needs these permissions to provide you with the best experience:
              </p>
              
              <PermissionsGrid>
                <PermissionCard
                  className={permissions.location}
                  onClick={() => requestSpecificPermission('location')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PermissionIcon>
                    {getPermissionIcon('location', permissions.location)}
                  </PermissionIcon>
                  <PermissionContent>
                    <h3>Location Access</h3>
                    <p>{t('landing.permissions.location')}</p>
                  </PermissionContent>
                  <StatusIcon>
                    {getStatusIcon(permissions.location)}
                  </StatusIcon>
                </PermissionCard>

                <PermissionCard
                  className={permissions.camera}
                  onClick={() => requestSpecificPermission('camera')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PermissionIcon>
                    {getPermissionIcon('camera', permissions.camera)}
                  </PermissionIcon>
                  <PermissionContent>
                    <h3>Camera Access</h3>
                    <p>{t('landing.permissions.camera')}</p>
                  </PermissionContent>
                  <StatusIcon>
                    {getStatusIcon(permissions.camera)}
                  </StatusIcon>
                </PermissionCard>

                <PermissionCard
                  className={permissions.microphone}
                  onClick={() => requestSpecificPermission('microphone')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PermissionIcon>
                    {getPermissionIcon('microphone', permissions.microphone)}
                  </PermissionIcon>
                  <PermissionContent>
                    <h3>Microphone Access</h3>
                    <p>{t('landing.permissions.microphone')}</p>
                  </PermissionContent>
                  <StatusIcon>
                    {getStatusIcon(permissions.microphone)}
                  </StatusIcon>
                </PermissionCard>
              </PermissionsGrid>
              
              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <PermissionRequestButton
                  onClick={requestPermissions}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Grant All Permissions
                </PermissionRequestButton>
                <button 
                  onClick={() => setShowPermissionsModal(false)}
                  style={{
                    background: 'none',
                    border: '1px solid #ccc',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    margin: '20px 0 0 10px'
                  }}
                >
                  Skip for Now
                </button>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Language Selection Modal */}
      <AnimatePresence>
        {showLanguageModal && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLanguageModal(false)}
          >
            <ModalContent
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <h2>{t('landing.selectLanguage')}</h2>
                <CloseButton onClick={() => setShowLanguageModal(false)}>
                  <FiX />
                </CloseButton>
              </ModalHeader>
              
              <p style={{ marginBottom: '20px', color: '#666' }}>
                Choose your preferred language for the best experience:
              </p>
              
              <LanguageGrid>
                {supportedLanguages.map((language) => (
                  <LanguageCard
                    key={language.code}
                    selected={language.code === currentLanguage}
                    onClick={() => handleLanguageSelect(language.code)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="native-name">{language.nativeName}</div>
                    <div className="english-name">{language.name}</div>
                  </LanguageCard>
                ))}
              </LanguageGrid>
              
              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <LanguageButton
                  onClick={() => setShowLanguageModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue with {supportedLanguages.find(lang => lang.code === currentLanguage)?.nativeName || 'English'}
                </LanguageButton>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </LandingContainer>
  );
};

export default LandingPage;