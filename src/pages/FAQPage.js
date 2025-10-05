import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHelpCircle,
  FiSearch,
  FiChevronDown,
  FiChevronRight,
  FiBook,
  FiShield,
  FiAlertTriangle,
  FiPhone,
  FiMail,
  FiMessageCircle,
  FiClock,
  FiCheckCircle,
  FiTool,
  FiUsers,
  FiFileText,
  FiTrendingUp
} from 'react-icons/fi';

const FAQContainer = styled.div`
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  min-height: calc(100vh - 80px);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
    font-size: 2.5rem;
    color: var(--dark-gray);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  
  .help-icon {
    color: var(--primary-coral);
    font-size: 2.5rem;
  }
  
  p {
    font-size: 1.2rem;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const SearchSection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 20px;
  
  .search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
    font-size: 20px;
  }
  
  input {
    width: 100%;
    padding: 16px 20px 16px 50px;
    border: 2px solid #e0e0e0;
    border-radius: 25px;
    font-size: 16px;
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: var(--primary-coral);
      box-shadow: 0 0 0 3px rgba(255, 127, 80, 0.1);
    }
    
    &::placeholder {
      color: #aaa;
    }
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const QuickActionCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-coral);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 127, 80, 0.2);
  }
  
  .action-icon {
    color: var(--primary-coral);
    font-size: 20px;
  }
  
  .action-text {
    font-weight: 600;
    color: var(--dark-gray);
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const CategorySidebar = styled.div`
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 20px;
  
  h3 {
    font-size: 1.3rem;
    color: var(--dark-gray);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    
    .mobile-toggle {
      display: none;
      font-size: 1.1rem;
      margin-left: auto;
      transform: ${props => props.showMobileCategories ? 'rotate(180deg)' : 'rotate(0deg)'};
      transition: transform 0.3s ease;
    }
  }
  
  @media (max-width: 968px) {
    position: relative;
    top: 0;
    margin-bottom: 20px;
    
    h3 {
      cursor: pointer;
      user-select: none;
      justify-content: space-between;
      
      &:hover {
        color: var(--primary-coral);
      }
      
      .mobile-toggle {
        display: block !important;
      }
    }
  }
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  @media (max-width: 968px) {
    display: ${props => props.show ? 'flex' : 'none'};
  }
`;

const CategoryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.active ? 'rgba(255, 127, 80, 0.1)' : 'transparent'};
  border: 2px solid ${props => props.active ? 'var(--primary-coral)' : 'transparent'};
  
  &:hover {
    background: rgba(255, 127, 80, 0.1);
    transform: translateX(4px);
  }
  
  .category-icon {
    color: ${props => props.active ? 'var(--primary-coral)' : '#666'};
    font-size: 18px;
  }
  
  .category-name {
    font-weight: ${props => props.active ? '600' : '500'};
    color: ${props => props.active ? 'var(--primary-coral)' : 'var(--dark-gray)'};
  }
  
  .category-count {
    margin-left: auto;
    font-size: 12px;
    color: #666;
    background: #f8f9fa;
    padding: 4px 8px;
    border-radius: 12px;
  }
`;

const FAQContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const FAQSection = styled.div`
  margin-bottom: 30px;
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #e9ecef;
  }
  
  .section-icon {
    color: var(--primary-coral);
    font-size: 24px;
  }
  
  .section-title {
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--dark-gray);
  }
`;

const FAQItem = styled.div`
  margin-bottom: 15px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-coral);
    box-shadow: 0 4px 12px rgba(255, 127, 80, 0.1);
  }
`;

const FAQQuestion = styled.div`
  padding: 20px;
  background: ${props => props.isOpen ? 'rgba(255, 127, 80, 0.05)' : 'white'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: between;
  gap: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 127, 80, 0.05);
  }
  
  .question-text {
    flex: 1;
    font-weight: 600;
    color: var(--dark-gray);
    font-size: 1rem;
    line-height: 1.4;
  }
  
  .expand-icon {
    color: var(--primary-coral);
    font-size: 20px;
    transform: ${props => props.isOpen ? 'rotate(90deg)' : 'rotate(0deg)'};
    transition: transform 0.3s ease;
  }
`;

const FAQAnswer = styled(motion.div)`
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  
  .answer-content {
    padding: 20px;
    line-height: 1.6;
    color: #555;
    
    p {
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    ul {
      margin-left: 20px;
      margin-bottom: 12px;
      
      li {
        margin-bottom: 6px;
      }
    }
    
    .highlight {
      background: rgba(255, 193, 7, 0.2);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
    }
    
    .warning {
      background: rgba(220, 53, 69, 0.1);
      border-left: 4px solid #dc3545;
      padding: 12px;
      border-radius: 4px;
      margin: 12px 0;
    }
    
    .tip {
      background: rgba(40, 167, 69, 0.1);
      border-left: 4px solid #28a745;
      padding: 12px;
      border-radius: 4px;
      margin: 12px 0;
    }
  }
`;

const ContactSection = styled.div`
  background: linear-gradient(135deg, var(--primary-coral), #ff6b35);
  color: white;
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  margin-top: 30px;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
  
  p {
    margin-bottom: 20px;
    opacity: 0.9;
  }
`;

const ContactOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const ContactOption = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  .contact-icon {
    font-size: 18px;
  }
  
  .contact-text {
    font-weight: 500;
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
  
  .no-results-icon {
    font-size: 48px;
    color: #ccc;
    margin-bottom: 16px;
  }
  
  h3 {
    margin-bottom: 8px;
  }
`;

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openItems, setOpenItems] = useState({});
  const [showMobileCategories, setShowMobileCategories] = useState(false);

  const categories = [
    { id: 'all', name: 'All Topics', icon: FiBook },
    { id: 'biosecurity', name: 'Biosecurity', icon: FiShield },
    { id: 'alerts', name: 'Alert System', icon: FiAlertTriangle },
    { id: 'compliance', name: 'Compliance', icon: FiCheckCircle },
    { id: 'dashboard', name: 'Dashboard', icon: FiTrendingUp },
    { id: 'account', name: 'Account', icon: FiUsers },
    { id: 'technical', name: 'Technical', icon: FiTool }
  ];

  const faqData = [
    {
      category: 'biosecurity',
      question: 'What is biosecurity and why is it important for my farm?',
      answer: `<p>Biosecurity refers to measures designed to protect your farm from the introduction and spread of harmful organisms, including bacteria, viruses, parasites, and other disease-causing agents.</p>
      <p><span class="highlight">Key benefits of biosecurity include:</span></p>
      <ul>
        <li>Prevention of disease outbreaks that can devastate livestock</li>
        <li>Reduced veterinary costs and treatment expenses</li>
        <li>Improved animal welfare and productivity</li>
        <li>Protection of public health</li>
        <li>Maintained market access for your products</li>
      </ul>
      <div class="tip">
        <strong>Pro Tip:</strong> A comprehensive biosecurity plan can reduce disease risk by up to 90% when properly implemented.
      </div>`
    },
    {
      category: 'biosecurity',
      question: 'How do I create an effective biosecurity plan for my farm?',
      answer: `<p>Creating an effective biosecurity plan involves several key steps:</p>
      <ol>
        <li><strong>Risk Assessment:</strong> Use our Risk Assessment tool to identify vulnerabilities</li>
        <li><strong>Entry Controls:</strong> Establish controlled access points with disinfection facilities</li>
        <li><strong>Quarantine Procedures:</strong> Set up isolation areas for new or sick animals</li>
        <li><strong>Staff Training:</strong> Regular education on biosecurity protocols</li>
        <li><strong>Record Keeping:</strong> Maintain detailed logs of all activities</li>
        <li><strong>Regular Review:</strong> Update your plan based on new threats and experiences</li>
      </ol>
      <div class="warning">
        <strong>Important:</strong> Your biosecurity plan should be customized to your specific farm type, location, and local disease risks.
      </div>`
    },
    {
      category: 'alerts',
      question: 'How does the alert system work and when should I raise an alert?',
      answer: `<p>Our alert system is designed to provide rapid response to potential biosecurity threats and disease outbreaks.</p>
      <p><span class="highlight">You should raise an alert when you notice:</span></p>
      <ul>
        <li>Sudden increase in animal mortality</li>
        <li>Unusual disease symptoms in livestock</li>
        <li>Suspected feed or water contamination</li>
        <li>Biosecurity breaches (unauthorized access, equipment failure)</li>
        <li>Pest infestations or wildlife intrusions</li>
      </ul>
      <p><strong>Alert Response Time:</strong> Our expert team monitors alerts 24/7 and responds within 2 hours for high-priority alerts.</p>`
    },
    {
      category: 'alerts',
      question: 'What information should I include when raising an alert?',
      answer: `<p>To ensure the fastest and most effective response, please provide:</p>
      <ul>
        <li><strong>Location Details:</strong> Exact farm location and affected areas</li>
        <li><strong>Issue Description:</strong> Clear description of the problem</li>
        <li><strong>Timeline:</strong> When the issue first occurred</li>
        <li><strong>Affected Animals:</strong> Number and type of animals involved</li>
        <li><strong>Photos/Evidence:</strong> Visual documentation when possible</li>
        <li><strong>Contact Information:</strong> Multiple ways to reach you</li>
        <li><strong>Urgency Level:</strong> Your assessment of the severity</li>
      </ul>
      <div class="tip">
        <strong>Tip:</strong> Use the GPS location feature for precise positioning - this helps our response teams find you quickly.
      </div>`
    },
    {
      category: 'compliance',
      question: 'What compliance requirements do I need to meet for my farm?',
      answer: `<p>Compliance requirements vary by location, farm type, and livestock species. Common requirements include:</p>
      <ul>
        <li><strong>Disease-Free Compartment Recognition:</strong> Certification for disease-free status</li>
        <li><strong>FSSAI Licensing:</strong> Food safety and standards authority license</li>
        <li><strong>NADCP Compliance:</strong> National Animal Disease Control Program requirements</li>
        <li><strong>Vaccination Records:</strong> Proof of mandatory vaccinations</li>
        <li><strong>Health Certificates:</strong> Regular health assessments by certified veterinarians</li>
        <li><strong>Environmental Permits:</strong> Waste management and environmental compliance</li>
      </ul>
      <p>Use our <span class="highlight">Compliance Tracker</span> to stay updated on all requirements specific to your location and farm type.</p>`
    },
    {
      category: 'compliance',
      question: 'How do I upload and manage compliance documents?',
      answer: `<p>Managing your compliance documents is easy with our digital system:</p>
      <ol>
        <li>Navigate to the <strong>Compliance</strong> section</li>
        <li>Select the appropriate document category</li>
        <li>Upload clear, high-resolution copies of your documents</li>
        <li>Fill in any required metadata (expiry dates, certification numbers)</li>
        <li>Submit for review</li>
      </ol>
      <div class="tip">
        <strong>Document Tips:</strong>
        <ul>
          <li>Accepted formats: PDF, JPG, PNG</li>
          <li>Maximum file size: 10MB per document</li>
          <li>Keep originals safe as backup</li>
          <li>Set reminders for renewal dates</li>
        </ul>
      </div>`
    },
    {
      category: 'dashboard',
      question: 'How do I interpret the data on my dashboard?',
      answer: `<p>Your dashboard provides real-time insights into your farm's performance and risk levels:</p>
      <ul>
        <li><strong>Risk Heat Map:</strong> Visual representation of disease risk in your area (green=low, yellow=medium, red=high)</li>
        <li><strong>Compliance Status:</strong> Percentage of completed requirements</li>
        <li><strong>Alert History:</strong> Timeline of past alerts and resolutions</li>
        <li><strong>Health Trends:</strong> Charts showing animal health patterns over time</li>
        <li><strong>Weather Impact:</strong> Environmental factors affecting your farm</li>
      </ul>
      <div class="warning">
        <strong>Action Required:</strong> Red indicators require immediate attention. Yellow indicators suggest preventive measures should be taken.
      </div>`
    },
    {
      category: 'account',
      question: 'How do I update my farm information and profile?',
      answer: `<p>Keeping your profile updated ensures you receive relevant alerts and recommendations:</p>
      <ol>
        <li>Go to <strong>Profile Settings</strong></li>
        <li>Update farm details (location, size, livestock types)</li>
        <li>Modify contact information</li>
        <li>Set notification preferences</li>
        <li>Save changes</li>
      </ol>
      <p><span class="highlight">Important Information to Keep Updated:</span></p>
      <ul>
        <li>Current livestock count and types</li>
        <li>Farm boundaries and GPS coordinates</li>
        <li>Emergency contact details</li>
        <li>Preferred communication methods</li>
      </ul>`
    },
    {
      category: 'technical',
      question: 'What should I do if the GPS location feature is not working?',
      answer: `<p>GPS issues can usually be resolved with these troubleshooting steps:</p>
      <ol>
        <li><strong>Check Permissions:</strong> Ensure location access is enabled for the portal</li>
        <li><strong>Refresh Page:</strong> Try reloading the page</li>
        <li><strong>Clear Cache:</strong> Clear your browser cache and cookies</li>
        <li><strong>Check Network:</strong> Ensure stable internet connection</li>
        <li><strong>Manual Entry:</strong> Use the manual location text field as backup</li>
      </ol>
      <div class="warning">
        <strong>Browser Settings:</strong> Some browsers block location access by default. Check your browser's privacy settings to allow location access for the PashuMitra portal.
      </div>
      <div class="tip">
        <strong>Alternative:</strong> If GPS continues to fail, you can use the IP-based location detection or manually type your address.
      </div>`
    },
    {
      category: 'technical',
      question: 'Why am I not receiving alert notifications?',
      answer: `<p>If you're missing important notifications, check these settings:</p>
      <ul>
        <li><strong>Profile Settings:</strong> Verify your contact information is current</li>
        <li><strong>Notification Preferences:</strong> Ensure alerts are enabled for your chosen methods</li>
        <li><strong>Email Filters:</strong> Check spam/junk folders and whitelist our domain</li>
        <li><strong>Mobile Settings:</strong> Enable push notifications if using mobile</li>
        <li><strong>Network Issues:</strong> Verify stable internet connection</li>
      </ul>
      <div class="tip">
        <strong>Recommended Setup:</strong> Enable multiple notification methods (email + SMS) for critical alerts to ensure you don't miss important information.
      </div>`
    }
  ];

  const quickActions = [
    { icon: FiAlertTriangle, text: 'Report an Emergency', action: () => console.log('Emergency report') },
    { icon: FiPhone, text: 'Contact Support', action: () => console.log('Contact support') },
    { icon: FiFileText, text: 'Download Guides', action: () => console.log('Download guides') },
    { icon: FiCheckCircle, text: 'Check Compliance', action: () => console.log('Check compliance') }
  ];

  const filteredFAQs = useMemo(() => {
    return faqData.filter(faq => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      const matchesSearch = searchTerm === '' || 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const toggleFAQ = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getCategoryCount = (categoryId) => {
    if (categoryId === 'all') return faqData.length;
    return faqData.filter(faq => faq.category === categoryId).length;
  };

  const groupedFAQs = useMemo(() => {
    const groups = {};
    filteredFAQs.forEach(faq => {
      if (!groups[faq.category]) {
        groups[faq.category] = [];
      }
      groups[faq.category].push(faq);
    });
    return groups;
  }, [filteredFAQs]);

  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId);
  };

  return (
    <FAQContainer>
      <Header>
        <h1>
          <FiHelpCircle className="help-icon" />
          Help Center & FAQ
        </h1>
        <p>
          Find answers to common questions and get help with using the PashuMitra portal effectively.
        </p>
      </Header>

      <SearchSection>
        <SearchBar>
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for answers, topics, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>

        <QuickActions>
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} onClick={action.action}>
              <action.icon className="action-icon" />
              <span className="action-text">{action.text}</span>
            </QuickActionCard>
          ))}
        </QuickActions>
      </SearchSection>

      <ContentGrid>
        <CategorySidebar showMobileCategories={showMobileCategories}>
          <h3 onClick={() => setShowMobileCategories(!showMobileCategories)}>
            <FiBook />
            Categories
            <FiChevronDown className="mobile-toggle" />
          </h3>
          <CategoryList show={showMobileCategories}>
            {categories.map(category => (
              <CategoryItem
                key={category.id}
                active={selectedCategory === category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setShowMobileCategories(false); // Close on mobile after selection
                }}
              >
                <category.icon className="category-icon" />
                <span className="category-name">{category.name}</span>
                <span className="category-count">{getCategoryCount(category.id)}</span>
              </CategoryItem>
            ))}
          </CategoryList>
        </CategorySidebar>

        <FAQContent>
          {filteredFAQs.length === 0 ? (
            <NoResults>
              <FiSearch className="no-results-icon" />
              <h3>No results found</h3>
              <p>Try adjusting your search terms or selecting a different category.</p>
            </NoResults>
          ) : (
            Object.entries(groupedFAQs).map(([categoryId, faqs]) => {
              const categoryInfo = getCategoryInfo(categoryId);
              return (
                <FAQSection key={categoryId}>
                  <div className="section-header">
                    <categoryInfo.icon className="section-icon" />
                    <h2 className="section-title">{categoryInfo.name}</h2>
                  </div>

                  {faqs.map((faq, index) => {
                    const globalIndex = `${categoryId}-${index}`;
                    const isOpen = openItems[globalIndex];

                    return (
                      <FAQItem key={globalIndex}>
                        <FAQQuestion
                          isOpen={isOpen}
                          onClick={() => toggleFAQ(globalIndex)}
                        >
                          <span className="question-text">{faq.question}</span>
                          <FiChevronRight className="expand-icon" />
                        </FAQQuestion>

                        <AnimatePresence>
                          {isOpen && (
                            <FAQAnswer
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div 
                                className="answer-content"
                                dangerouslySetInnerHTML={{ __html: faq.answer }}
                              />
                            </FAQAnswer>
                          )}
                        </AnimatePresence>
                      </FAQItem>
                    );
                  })}
                </FAQSection>
              );
            })
          )}
        </FAQContent>
      </ContentGrid>

      <ContactSection>
        <h3>
          <FiMessageCircle />
          Need More Help?
        </h3>
        <p>
          Can't find what you're looking for? Our support team is here to help you 24/7.
        </p>

        <ContactOptions>
          <ContactOption>
            <FiPhone className="contact-icon" />
            <span className="contact-text">Call Support</span>
          </ContactOption>
          <ContactOption>
            <FiMail className="contact-icon" />
            <span className="contact-text">Email Us</span>
          </ContactOption>
          <ContactOption>
            <FiMessageCircle className="contact-icon" />
            <span className="contact-text">Live Chat</span>
          </ContactOption>
          <ContactOption>
            <FiClock className="contact-icon" />
            <span className="contact-text">24/7 Emergency</span>
          </ContactOption>
        </ContactOptions>
      </ContactSection>
    </FAQContainer>
  );
};

export default FAQPage;