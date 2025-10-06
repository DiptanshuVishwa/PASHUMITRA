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
import T from '../components/T'; // Import our universal translation component

const LandingContainer = styled.div`
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding-top: 20px;
    min-height: calc(100vh - 75px);
  }
`;

const HeroSection = styled.section`
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  text-align: center;
  padding: 120px 20px 80px;
  
  @media (max-width: 768px) {
    padding: 100px 16px 60px;
    min-height: calc(100vh - 75px);
  }
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const HeroTitle = styled(motion.h1)`
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 800;
  color: var(--primary-coral);
  margin-bottom: 24px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  color: #666;
  margin-bottom: 48px;
  font-weight: 500;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    margin-bottom: 32px;
  }
`;

const AnimalIcons = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: 40px 0 60px;
  
  @media (max-width: 768px) {
    gap: 20px;
    margin: 24px 0 40px;
  }
`;

const AnimalIcon = styled(motion.div)`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-coral), #FF6A35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: white;
  box-shadow: 0 8px 32px rgba(255, 127, 80, 0.3);
  cursor: pointer;
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    font-size: 32px;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(255, 127, 80, 0.4);
  }
`;

const CTAButton = styled(motion.button)`
  background: linear-gradient(135deg, var(--primary-coral), #FF6A35);
  color: white;
  border: none;
  padding: 18px 48px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(255, 127, 80, 0.3);
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 16px 32px;
    font-size: 16px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(255, 127, 80, 0.4);
  }
`;

const FeaturesSection = styled.section`
  padding: 80px 20px;
  background: white;
  
  @media (max-width: 768px) {
    padding: 60px 16px;
  }
`;

const SectionTitle = styled.h2`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  text-align: center;
  color: #333;
  margin-bottom: 60px;
  
  @media (max-width: 768px) {
    margin-bottom: 40px;
  }
`;

const FeaturesGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const FeatureCard = styled(motion.div)`
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
  border: 1px solid #f0f0f0;
  
  @media (max-width: 768px) {
    padding: 24px;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
  }
`;

const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary-coral), #FF6A35);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 32px;
  color: white;
`;

const FeatureTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
`;

const FeatureDescription = styled.p`
  font-size: 16px;
  color: #666;
  line-height: 1.6;
`;

const StatsSection = styled.section`
  padding: 80px 20px;
  background: linear-gradient(135deg, var(--primary-coral), #FF6A35);
  color: white;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 60px 16px;
  }
`;

const StatsGrid = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
`;

const StatItem = styled(motion.div)`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 18px;
  font-weight: 500;
  opacity: 0.9;
`;

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <LandingContainer>
      <HeroSection>
        <HeroContent>
          <HeroTitle
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <T>PashuMitra</T>
          </HeroTitle>
          
          <HeroSubtitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <T>Your Partner in Farm Protection</T>
          </HeroSubtitle>
          
          <AnimalIcons
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <AnimalIcon
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              🐄
            </AnimalIcon>
            <AnimalIcon
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              🐔
            </AnimalIcon>
          </AnimalIcons>
          
          <CTAButton
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGetStarted}
          >
            <T>Get Started</T>
          </CTAButton>
        </HeroContent>
      </HeroSection>

      <FeaturesSection>
        <SectionTitle>
          <T>Why Choose PashuMitra?</T>
        </SectionTitle>
        
        <FeaturesGrid>
          <FeatureCard
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <FeatureIcon>
              <FiShield />
            </FeatureIcon>
            <FeatureTitle>
              <T>Disease Prevention</T>
            </FeatureTitle>
            <FeatureDescription>
              <T>Advanced AI-powered disease detection and prevention system to keep your livestock healthy and productive.</T>
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <FeatureIcon>
              <FiUsers />
            </FeatureIcon>
            <FeatureTitle>
              <T>Expert Veterinarians</T>
            </FeatureTitle>
            <FeatureDescription>
              <T>Connect with certified veterinarians in your area for immediate consultation and expert advice on livestock care.</T>
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <FeatureIcon>
              <FiGlobe />
            </FeatureIcon>
            <FeatureTitle>
              <T>Multilingual Support</T>
            </FeatureTitle>
            <FeatureDescription>
              <T>Access the platform in over 25 Indian languages with AI-powered translation for seamless communication.</T>
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <FeatureIcon>
              <FiBell />
            </FeatureIcon>
            <FeatureTitle>
              <T>Real-time Alerts</T>
            </FeatureTitle>
            <FeatureDescription>
              <T>Receive instant notifications about disease outbreaks, weather warnings, and important livestock updates.</T>
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <FeatureIcon>
              <FiTrendingUp />
            </FeatureIcon>
            <FeatureTitle>
              <T>Analytics & Insights</T>
            </FeatureTitle>
            <FeatureDescription>
              <T>Get detailed analytics on your farm's health trends, productivity metrics, and actionable insights for better farming.</T>
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <FeatureIcon>
              <FiMapPin />
            </FeatureIcon>
            <FeatureTitle>
              <T>Location-based Services</T>
            </FeatureTitle>
            <FeatureDescription>
              <T>Find nearby veterinarians, feed suppliers, and livestock markets based on your exact location and requirements.</T>
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      <StatsSection>
        <SectionTitle style={{ color: 'white', marginBottom: '60px' }}>
          <T>Trusted by Farmers Across India</T>
        </SectionTitle>
        
        <StatsGrid>
          <StatItem
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <StatNumber>50K+</StatNumber>
            <StatLabel>
              <T>Active Farmers</T>
            </StatLabel>
          </StatItem>
          
          <StatItem
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <StatNumber>500+</StatNumber>
            <StatLabel>
              <T>Veterinarians</T>
            </StatLabel>
          </StatItem>
          
          <StatItem
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <StatNumber>25+</StatNumber>
            <StatLabel>
              <T>Languages</T>
            </StatLabel>
          </StatItem>
          
          <StatItem
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <StatNumber>95%</StatNumber>
            <StatLabel>
              <T>Success Rate</T>
            </StatLabel>
          </StatItem>
        </StatsGrid>
      </StatsSection>
    </LandingContainer>
  );
};

export default LandingPage;