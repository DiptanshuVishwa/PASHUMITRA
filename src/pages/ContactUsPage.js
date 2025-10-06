import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiClock,
  FiMessageSquare,
  FiHelpCircle,
  FiUser,
  FiSend,
  FiExternalLink,
  FiTwitter,
  FiFacebook,
  FiLinkedin,
  FiGlobe,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';

const ContactUsContainer = styled.div`
  max-width: 1200px;
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
    }
  }
  
  .header-icon {
    color: var(--primary-coral);
    font-size: 2.5rem;
  }
  
  p {
    font-size: 1.2rem;
    color: #666;
    max-width: 700px;
    margin: 0 auto;
    line-height: 1.6;
    
    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
  margin-bottom: 50px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const ContactForm = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const FormHeader = styled.div`
  margin-bottom: 30px;
  
  h2 {
    color: var(--dark-gray);
    font-size: 1.5rem;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .form-icon {
    color: var(--primary-coral);
    font-size: 24px;
  }
  
  p {
    color: #666;
    line-height: 1.5;
  }
`;

const CategorySelection = styled.div`
  margin-bottom: 24px;
  
  .category-title {
    font-weight: 600;
    color: var(--dark-gray);
    margin-bottom: 12px;
    font-size: 15px;
  }
  
  .category-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    
    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }
`;

const CategoryButton = styled.button`
  padding: 12px 16px;
  border: 2px solid ${props => props.selected ? 'var(--primary-coral)' : '#e0e0e0'};
  background: ${props => props.selected ? 'var(--primary-coral)' : 'white'};
  color: ${props => props.selected ? 'white' : '#666'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  
  &:hover {
    border-color: var(--primary-coral);
    background: ${props => props.selected ? 'var(--primary-coral)' : 'rgba(255, 127, 80, 0.1)'};
    color: ${props => props.selected ? 'white' : 'var(--primary-coral)'};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    font-weight: 600;
    color: var(--dark-gray);
    margin-bottom: 6px;
    font-size: 14px;
  }
  
  .required {
    color: #dc3545;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary-coral);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--primary-coral);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
  
  &:focus {
    outline: none;
    border-color: var(--primary-coral);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const SubmitButton = styled.button`
  background: var(--primary-coral);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  
  &:hover {
    background: #FF6A35;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InfoCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  h3 {
    color: var(--dark-gray);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.2rem;
  }
  
  .info-icon {
    color: var(--primary-coral);
    font-size: 20px;
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .contact-icon {
    color: var(--primary-coral);
    font-size: 18px;
    flex-shrink: 0;
  }
  
  .contact-details {
    .contact-label {
      font-weight: 600;
      color: var(--dark-gray);
      margin-bottom: 2px;
      font-size: 14px;
    }
    
    .contact-value {
      color: #666;
      font-size: 14px;
      line-height: 1.4;
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 127, 80, 0.1);
  color: var(--primary-coral);
  border-radius: 50%;
  font-size: 18px;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--primary-coral);
    color: white;
    transform: translateY(-2px);
  }
`;

const FAQSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
  
  h2 {
    color: var(--dark-gray);
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.4rem;
  }
  
  .faq-icon {
    color: var(--primary-coral);
    font-size: 24px;
  }
`;

const FAQItem = styled.div`
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
    border-bottom: none;
    padding-bottom: 0;
  }
  
  .faq-question {
    font-weight: 600;
    color: var(--dark-gray);
    margin-bottom: 8px;
    font-size: 15px;
  }
  
  .faq-answer {
    color: #666;
    line-height: 1.6;
    font-size: 14px;
  }
`;

const AlertBox = styled.div`
  background: ${props => {
    switch (props.type) {
      case 'success': return 'rgba(40, 167, 69, 0.1)';
      case 'error': return 'rgba(220, 53, 69, 0.1)';
      default: return 'rgba(23, 162, 184, 0.1)';
    }
  }};
  border: 2px solid ${props => {
    switch (props.type) {
      case 'success': return 'rgba(40, 167, 69, 0.3)';
      case 'error': return 'rgba(220, 53, 69, 0.3)';
      default: return 'rgba(23, 162, 184, 0.3)';
    }
  }};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  .alert-icon {
    color: ${props => {
      switch (props.type) {
        case 'success': return '#28a745';
        case 'error': return '#dc3545';
        default: return '#17a2b8';
      }
    }};
    font-size: 20px;
  }
  
  .alert-text {
    color: var(--dark-gray);
    font-weight: 500;
  }
`;

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    priority: 'medium',
    subject: '',
    message: ''
  });
  
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'technical', label: 'Technical Support', icon: FiHelpCircle },
    { id: 'billing', label: 'Billing & Account', icon: FiUser },
    { id: 'feature', label: 'Feature Request', icon: FiMessageSquare },
    { id: 'bug', label: 'Bug Report', icon: FiAlertCircle },
    { id: 'partnership', label: 'Partnership', icon: FiExternalLink },
    { id: 'general', label: 'General Inquiry', icon: FiMail }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }
    
    if (!formData.category) {
      setSubmitStatus({ type: 'error', message: 'Please select a support category.' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitStatus({ 
        type: 'success', 
        message: 'Thank you for contacting us! We\'ll get back to you within 24 hours.' 
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: '',
        priority: 'medium',
        subject: '',
        message: ''
      });
      
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'Sorry, there was an error sending your message. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqData = [
    {
      question: "How do I reset my password?",
      answer: "You can reset your password by clicking 'Forgot Password' on the login page, or contact our support team for assistance."
    },
    {
      question: "Is PashuMitra free to use?",
      answer: "PashuMitra offers both free and premium plans. Basic features are available for free, while advanced analytics and premium support require a subscription."
    },
    {
      question: "How do I report a disease outbreak?",
      answer: "Use the 'Raise Alert' feature in your dashboard to immediately report disease outbreaks. For emergencies, call our 24/7 hotline."
    },
    {
      question: "Can I export my farm data?",
      answer: "Yes, you can export your data in various formats from the Settings page. Premium users get additional export options and automated backups."
    },
    {
      question: "How do I contact a veterinarian?",
      answer: "Visit the 'Contact Vet' section to browse available veterinarians in your area, view their specialties, and book consultations."
    }
  ];

  return (
    <ContactUsContainer>
      <Header>
        <h1>
          <FiMail className="header-icon" />
          Contact Us
        </h1>
        <p>
          Have questions or need support? We're here to help! Reach out to our team 
          for technical assistance, feedback, or any other inquiries.
        </p>
      </Header>

      <ContactGrid>
        <ContactForm
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <FormHeader>
            <h2>
              <FiMessageSquare className="form-icon" />
              Send us a Message
            </h2>
            <p>Fill out the form below and we'll get back to you as soon as possible.</p>
          </FormHeader>

          {submitStatus && (
            <AlertBox type={submitStatus.type}>
              {submitStatus.type === 'success' ? (
                <FiCheckCircle className="alert-icon" />
              ) : (
                <FiAlertCircle className="alert-icon" />
              )}
              <span className="alert-text">{submitStatus.message}</span>
            </AlertBox>
          )}

          <form onSubmit={handleSubmit}>
            <CategorySelection>
              <div className="category-title">What can we help you with? <span style={{ color: '#dc3545' }}>*</span></div>
              <div className="category-grid">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <CategoryButton
                      key={category.id}
                      type="button"
                      selected={formData.category === category.id}
                      onClick={() => handleInputChange('category', category.id)}
                    >
                      <Icon />
                      {category.label}
                    </CategoryButton>
                  );
                })}
              </div>
            </CategorySelection>

            <FormGroup>
              <label>
                Full Name <span className="required">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <label>
                Email Address <span className="required">*</span>
              </label>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <label>Phone Number</label>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <label>Priority Level</label>
              <Select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
              >
                <option value="low">Low - General inquiry</option>
                <option value="medium">Medium - Standard support</option>
                <option value="high">High - Urgent issue</option>
                <option value="critical">Critical - System down</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <label>Subject</label>
              <Input
                type="text"
                placeholder="Brief summary of your inquiry"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <label>
                Message <span className="required">*</span>
              </label>
              <Textarea
                placeholder="Please provide details about your inquiry, including any relevant information that might help us assist you better..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                required
              />
            </FormGroup>

            <SubmitButton type="submit" disabled={isSubmitting}>
              <FiSend />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </SubmitButton>
          </form>
        </ContactForm>

        <ContactInfo>
          <InfoCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3>
              <FiPhone className="info-icon" />
              Contact Information
            </h3>
            
            <ContactItem>
              <FiPhone className="contact-icon" />
              <div className="contact-details">
                <div className="contact-label">Support Hotline</div>
                <div className="contact-value">1800-PASHU-HELP<br/>(Available 24/7 for emergencies)</div>
              </div>
            </ContactItem>

            <ContactItem>
              <FiMail className="contact-icon" />
              <div className="contact-details">
                <div className="contact-label">Email Support</div>
                <div className="contact-value">pashumitra.team@gmail.com<br/>Response within 24 hours</div>
              </div>
            </ContactItem>

            <ContactItem>
              <FiMapPin className="contact-icon" />
              <div className="contact-details">
                <div className="contact-label">Head Office</div>
                <div className="contact-value">
                  Department of Animal Husbandry<br/>
                  Krishi Bhawan, New Delhi - 110001
                </div>
              </div>
            </ContactItem>

            <ContactItem>
              <FiClock className="contact-icon" />
              <div className="contact-details">
                <div className="contact-label">Business Hours</div>
                <div className="contact-value">
                  Monday - Friday: 9:00 AM - 6:00 PM<br/>
                  Saturday: 10:00 AM - 4:00 PM
                </div>
              </div>
            </ContactItem>

            <SocialLinks>
              <SocialLink href="#" target="_blank" title="Twitter">
                <FiTwitter />
              </SocialLink>
              <SocialLink href="#" target="_blank" title="Facebook">
                <FiFacebook />
              </SocialLink>
              <SocialLink href="#" target="_blank" title="LinkedIn">
                <FiLinkedin />
              </SocialLink>
              <SocialLink href="#" target="_blank" title="Website">
                <FiGlobe />
              </SocialLink>
            </SocialLinks>
          </InfoCard>

          <InfoCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3>
              <FiAlertCircle className="info-icon" />
              Emergency Support
            </h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.6 }}>
              For critical animal health emergencies or disease outbreaks that require immediate attention, 
              please call our emergency hotline directly. Our veterinary experts are available 24/7 to 
              provide urgent assistance.
            </p>
          </InfoCard>
        </ContactInfo>
      </ContactGrid>

      <FAQSection>
        <h2>
          <FiHelpCircle className="faq-icon" />
          Frequently Asked Questions
        </h2>
        
        {faqData.map((faq, index) => (
          <FAQItem key={index}>
            <div className="faq-question">{faq.question}</div>
            <div className="faq-answer">{faq.answer}</div>
          </FAQItem>
        ))}
      </FAQSection>
    </ContactUsContainer>
  );
};

export default ContactUsPage;