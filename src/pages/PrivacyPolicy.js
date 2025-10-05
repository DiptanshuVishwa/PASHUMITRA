import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiShield, 
  FiLock, 
  FiEye, 
  FiDatabase, 
  FiMail, 
  FiPhone,
  FiCalendar,
  FiInfo,
  FiActivity
} from 'react-icons/fi';

const PrivacyContainer = styled.div`
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 20px;
  min-height: calc(100vh - 80px);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 50px;
  
  h1 {
    font-size: 2.5rem;
    color: var(--dark-gray);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    
    @media (max-width: 768px) {
      font-size: 2rem;
      flex-direction: column;
      gap: 12px;
    }
  }
  
  .privacy-icon {
    color: var(--primary-coral);
    font-size: 2.5rem;
  }
  
  p {
    font-size: 1.2rem;
    color: #666;
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.6;
    
    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }
`;

const LastUpdated = styled.div`
  text-align: center;
  background: rgba(255, 127, 80, 0.1);
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 40px;
  color: var(--primary-coral);
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ContentSection = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  
  .section-icon {
    color: var(--primary-coral);
    font-size: 24px;
  }
  
  h2 {
    color: var(--dark-gray);
    font-size: 1.5rem;
    margin: 0;
  }
`;

const ContentText = styled.div`
  color: #666;
  line-height: 1.7;
  font-size: 15px;
  
  p {
    margin-bottom: 16px;
  }
  
  ul, ol {
    margin-bottom: 16px;
    padding-left: 24px;
    
    li {
      margin-bottom: 8px;
    }
  }
  
  strong {
    color: var(--dark-gray);
    font-weight: 600;
  }
  
  .highlight {
    background: rgba(255, 127, 80, 0.1);
    padding: 2px 4px;
    border-radius: 4px;
    color: var(--primary-coral);
    font-weight: 600;
  }
`;

const DataTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin: 24px 0;
`;

const DataTypeCard = styled.div`
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid var(--primary-coral);
  
  .data-title {
    font-weight: 600;
    color: var(--dark-gray);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .data-desc {
    font-size: 14px;
    color: #666;
    line-height: 1.5;
  }
`;

const ContactCard = styled.div`
  background: linear-gradient(135deg, var(--primary-coral), #FF6A35);
  color: white;
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  
  h3 {
    margin-bottom: 20px;
    font-size: 1.4rem;
  }
  
  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    
    @media (min-width: 768px) {
      flex-direction: row;
      justify-content: center;
    }
  }
  
  .contact-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }
`;

const TableOfContents = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 40px;
  
  h3 {
    color: var(--dark-gray);
    margin-bottom: 16px;
    font-size: 1.2rem;
  }
  
  ul {
    list-style: none;
    padding: 0;
    
    li {
      margin-bottom: 8px;
      
      a {
        color: #666;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.3s ease;
        
        &:hover {
          color: var(--primary-coral);
          text-decoration: underline;
        }
      }
    }
  }
`;

const PrivacyPolicy = () => {
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start' 
    });
  };

  return (
    <PrivacyContainer>
      <Header>
        <h1>
          <FiShield className="privacy-icon" />
          Privacy Policy
        </h1>
        <p>
          Your privacy and data security are our top priorities. Learn how we collect, 
          use, and protect your information on the PashuMitra platform.
        </p>
      </Header>

      <LastUpdated>
        <FiCalendar />
        Last Updated: January 1, 2024
      </LastUpdated>

      <TableOfContents>
        <h3>Quick Navigation</h3>
        <ul>
          <li><a href="#information-we-collect" onClick={(e) => { e.preventDefault(); scrollToSection('information-we-collect'); }}>Information We Collect</a></li>
          <li><a href="#how-we-use" onClick={(e) => { e.preventDefault(); scrollToSection('how-we-use'); }}>How We Use Your Information</a></li>
          <li><a href="#data-protection" onClick={(e) => { e.preventDefault(); scrollToSection('data-protection'); }}>Data Protection</a></li>
          <li><a href="#sharing" onClick={(e) => { e.preventDefault(); scrollToSection('sharing'); }}>Information Sharing</a></li>
          <li><a href="#your-rights" onClick={(e) => { e.preventDefault(); scrollToSection('your-rights'); }}>Your Rights</a></li>
          <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact Us</a></li>
        </ul>
      </TableOfContents>

      <ContentSection
        id="information-we-collect"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <SectionHeader>
          <FiDatabase className="section-icon" />
          <h2>Information We Collect</h2>
        </SectionHeader>
        <ContentText>
          <p>
            We collect information to provide better services to our users and maintain 
            the security of agricultural operations. Here's what we collect:
          </p>

          <DataTypeGrid>
            <DataTypeCard>
              <div className="data-title">
                <FiInfo />
                Personal Information
              </div>
              <div className="data-desc">
                Name, email address, phone number, farm location, and business details
              </div>
            </DataTypeCard>
            
            <DataTypeCard>
              <div className="data-title">
                <FiDatabase />
                Farm Data
              </div>
              <div className="data-desc">
                Animal health records, compliance reports, alert history, and farm metrics
              </div>
            </DataTypeCard>
            
            <DataTypeCard>
              <div className="data-title">
                <FiEye />
                Usage Information
              </div>
              <div className="data-desc">
                Platform interactions, feature usage, login times, and system preferences
              </div>
            </DataTypeCard>
            
            <DataTypeCard>
              <div className="data-title">
                <FiLock />
                Technical Data
              </div>
              <div className="data-desc">
                IP address, device information, browser type, and security logs
              </div>
            </DataTypeCard>
          </DataTypeGrid>

          <p>
            <strong>Voluntary Information:</strong> Most information is provided voluntarily when you 
            register, create reports, or interact with our services. <span className="highlight">You 
            control what you share with us.</span>
          </p>
        </ContentText>
      </ContentSection>

      <ContentSection
        id="how-we-use"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <SectionHeader>
          <FiActivity className="section-icon" />
          <h2>How We Use Your Information</h2>
        </SectionHeader>
        <ContentText>
          <p>Your information helps us deliver and improve our biosecurity services:</p>
          
          <ul>
            <li><strong>Service Delivery:</strong> Provide personalized farm management tools, compliance tracking, and alert systems</li>
            <li><strong>Communication:</strong> Send important alerts, updates, and educational content relevant to your operations</li>
            <li><strong>Security:</strong> Maintain platform security, prevent fraud, and ensure data integrity</li>
            <li><strong>Analytics:</strong> Analyze usage patterns to improve our services and develop new features</li>
            <li><strong>Compliance:</strong> Meet legal requirements for agricultural monitoring and disease prevention</li>
            <li><strong>Research:</strong> Conduct anonymized research to improve biosecurity practices across the industry</li>
          </ul>

          <p>
            <span className="highlight">We never sell your personal data to third parties</span> and 
            only use your information for the purposes outlined in this policy.
          </p>
        </ContentText>
      </ContentSection>

      <ContentSection
        id="data-protection"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <SectionHeader>
          <FiLock className="section-icon" />
          <h2>Data Protection & Security</h2>
        </SectionHeader>
        <ContentText>
          <p>
            We implement industry-leading security measures to protect your data:
          </p>

          <ol>
            <li><strong>Encryption:</strong> All data is encrypted in transit and at rest using AES-256 encryption</li>
            <li><strong>Access Controls:</strong> Strict role-based access with multi-factor authentication</li>
            <li><strong>Regular Audits:</strong> Security assessments and penetration testing performed quarterly</li>
            <li><strong>Data Centers:</strong> Information stored in secure, ISO-certified data centers</li>
            <li><strong>Backup & Recovery:</strong> Automated backups with disaster recovery procedures</li>
            <li><strong>Employee Training:</strong> All staff trained on data protection and privacy practices</li>
          </ol>

          <p>
            <strong>Data Retention:</strong> We retain your data only as long as necessary to provide 
            services or comply with legal requirements. You can request data deletion at any time.
          </p>
        </ContentText>
      </ContentSection>

      <ContentSection
        id="sharing"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <SectionHeader>
          <FiEye className="section-icon" />
          <h2>Information Sharing</h2>
        </SectionHeader>
        <ContentText>
          <p>
            We share information only in specific, limited circumstances:
          </p>

          <ul>
            <li><strong>Government Agencies:</strong> Disease outbreak data may be shared with agricultural authorities as required by law</li>
            <li><strong>Veterinary Partners:</strong> Health data shared with authorized veterinarians for treatment purposes</li>
            <li><strong>Service Providers:</strong> Trusted partners who help us operate our platform (under strict confidentiality agreements)</li>
            <li><strong>Emergency Situations:</strong> Information may be shared to prevent serious harm to animals or public health</li>
            <li><strong>Legal Requirements:</strong> Data disclosed when required by court order or regulatory mandate</li>
          </ul>

          <p>
            <span className="highlight">Your explicit consent is required</span> before sharing any 
            personal information for purposes not covered by this policy.
          </p>
        </ContentText>
      </ContentSection>

      <ContentSection
        id="your-rights"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <SectionHeader>
          <FiShield className="section-icon" />
          <h2>Your Privacy Rights</h2>
        </SectionHeader>
        <ContentText>
          <p>You have comprehensive control over your personal information:</p>

          <ul>
            <li><strong>Access:</strong> Request a copy of all personal data we hold about you</li>
            <li><strong>Correction:</strong> Update or correct any inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)</li>
            <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
            <li><strong>Restriction:</strong> Limit how we process your information</li>
            <li><strong>Objection:</strong> Object to certain types of data processing</li>
            <li><strong>Consent Withdrawal:</strong> Withdraw consent for voluntary data processing</li>
          </ul>

          <p>
            To exercise any of these rights, contact our privacy team using the information below. 
            We'll respond to all requests within 30 days.
          </p>
        </ContentText>
      </ContentSection>

      <ContentSection
        id="contact"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <SectionHeader>
          <FiMail className="section-icon" />
          <h2>Contact Our Privacy Team</h2>
        </SectionHeader>
        <ContentText>
          <p>
            Have questions about this policy or how we handle your data? Our privacy team is here to help.
          </p>
        </ContentText>
        
        <ContactCard>
          <h3>Get in Touch</h3>
          <div className="contact-info">
            <div className="contact-item">
              <FiMail />
              privacy@pashumitra.gov.in
            </div>
            <div className="contact-item">
              <FiPhone />
              1800-123-4567 (Privacy Helpline)
            </div>
          </div>
        </ContactCard>
      </ContentSection>
    </PrivacyContainer>
  );
};

export default PrivacyPolicy;