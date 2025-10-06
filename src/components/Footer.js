import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/translations';

const FooterContainer = styled.footer`
  background-color: var(--dark-gray);
  color: var(--primary-white);
  padding: 40px 0 20px;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 30px;
`;

const FooterSection = styled.div`
  h3 {
    color: var(--primary-coral);
    margin-bottom: 20px;
    font-size: 18px;
  }
`;

const FooterLink = styled(Link)`
  color: var(--primary-white);
  text-decoration: none;
  display: block;
  margin-bottom: 8px;
  transition: color 0.3s ease;
  
  &:hover {
    color: var(--primary-coral);
  }
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  
  svg {
    margin-right: 10px;
    color: var(--primary-coral);
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 15px;
  
  a {
    color: var(--primary-white);
    font-size: 20px;
    transition: color 0.3s ease;
    
    &:hover {
      color: var(--primary-coral);
    }
  }
`;

const FooterBottom = styled.div`
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #555;
  color: #aaa;
  font-size: 14px;
`;

const Footer = () => {
  const { currentLanguage } = useLanguage();
  
  // Translation helper function
  const t = (text, params) => getTranslation(text, currentLanguage, params);

  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          <FooterSection>
            <h3>{t('PashuMitra')}</h3>
            <p>{t('Your trusted partner in farm protection. Empowering farmers with comprehensive biosecurity solutions for pig and poultry farms.')}</p>
            <SocialLinks>
              <a href="#" aria-label={t('Facebook')}>
                <FiFacebook />
              </a>
              <a href="#" aria-label={t('Twitter')}>
                <FiTwitter />
              </a>
              <a href="#" aria-label={t('Instagram')}>
                <FiInstagram />
              </a>
            </SocialLinks>
          </FooterSection>

          <FooterSection>
            <h3>{t('Quick Links')}</h3>
            <FooterLink to="/dashboard">{t('Dashboard')}</FooterLink>
            <FooterLink to="/compliance">{t('Compliance')}</FooterLink>
            <FooterLink to="/learning">{t('Learning')}</FooterLink>
            <FooterLink to="/raise-alert">{t('Raise Alert')}</FooterLink>
            <FooterLink to="/faq">{t('FAQ')}</FooterLink>
          </FooterSection>

          <FooterSection>
            <h3>{t('Support')}</h3>
            <FooterLink to="/contact-us">{t('Contact Us')}</FooterLink>
            <FooterLink to="/contact-vet">{t('Contact Vet')}</FooterLink>
            <FooterLink to="/feedback">{t('Feedback')}</FooterLink>
            <FooterLink to="/privacy">{t('Privacy')}</FooterLink>
            <FooterLink to="/settings">{t('Settings')}</FooterLink>
          </FooterSection>

          <FooterSection>
            <h3>{t('Contact Information')}</h3>
            <ContactInfo>
              <FiMail />
              <span>pashumitra.team@gmail.com</span>
            </ContactInfo>
            <ContactInfo>
              <FiPhone />
              <span>+91 1800-XXX-XXXX</span>
            </ContactInfo>
            <ContactInfo>
              <FiMapPin />
              <span>{t('Ministry of Fisheries, Animal Husbandry & Dairying, Government of India')}</span>
            </ContactInfo>
          </FooterSection>
        </FooterGrid>

        <FooterBottom>
          <p>{t('© {{year}} PashuMitra. All rights reserved. | Developed for the Ministry of Fisheries, Animal Husbandry & Dairying, Government of India', { year: 2024 })}</p>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;