import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiMessageSquare, 
  FiStar, 
  FiSend, 
  FiUser,
  FiMail,
  FiPhone,
  FiTag,
  FiThumbsUp,
  FiThumbsDown,
  FiHeart,
  FiAlertCircle,
  FiCheckCircle,
  FiCamera,
  FiPaperclip
} from 'react-icons/fi';

const FeedbackContainer = styled.div`
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
    }
  }
  
  .feedback-icon {
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

const FeedbackGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 40px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const FeedbackCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  
  .section-icon {
    color: var(--primary-coral);
    font-size: 24px;
  }
  
  h2 {
    color: var(--dark-gray);
    font-size: 1.4rem;
    margin: 0;
  }
`;

const RatingSection = styled.div`
  margin-bottom: 30px;
  
  .rating-label {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--dark-gray);
    margin-bottom: 16px;
    text-align: center;
  }
  
  .rating-description {
    color: #666;
    text-align: center;
    margin-bottom: 20px;
    font-size: 14px;
  }
`;

const StarRating = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const Star = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  color: ${props => props.filled ? '#ffd700' : '#e0e0e0'};
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 4px;
  
  &:hover {
    color: #ffd700;
    transform: scale(1.1);
  }
`;

const RatingText = styled.div`
  text-align: center;
  color: var(--primary-coral);
  font-weight: 600;
  font-size: 1.1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
  
  label {
    display: block;
    font-weight: 600;
    color: var(--dark-gray);
    margin-bottom: 8px;
    font-size: 15px;
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

const CategoryButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 8px;
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

const FileUpload = styled.div`
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: var(--primary-coral);
    background: rgba(255, 127, 80, 0.05);
  }
  
  input {
    display: none;
  }
  
  .upload-icon {
    font-size: 2rem;
    color: #ccc;
    margin-bottom: 8px;
  }
  
  .upload-text {
    color: #666;
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .upload-hint {
    color: #999;
    font-size: 12px;
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

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SidebarCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  h3 {
    color: var(--dark-gray);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.1rem;
  }
  
  .sidebar-icon {
    color: var(--primary-coral);
  }
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .stat-label {
    color: #666;
    font-size: 14px;
  }
  
  .stat-value {
    font-weight: 600;
    color: var(--dark-gray);
  }
`;

const RecentFeedback = styled.div`
  .feedback-item {
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .feedback-rating {
      color: #ffd700;
      margin-bottom: 4px;
    }
    
    .feedback-text {
      font-size: 14px;
      color: #666;
      line-height: 1.4;
      margin-bottom: 4px;
    }
    
    .feedback-date {
      font-size: 12px;
      color: #999;
    }
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

const FeedbackPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    rating: 0,
    subject: '',
    message: '',
    file: null
  });
  
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'general', label: 'General', icon: FiMessageSquare },
    { id: 'bug', label: 'Bug Report', icon: FiAlertCircle },
    { id: 'feature', label: 'Feature Request', icon: FiThumbsUp },
    { id: 'complaint', label: 'Complaint', icon: FiThumbsDown },
    { id: 'compliment', label: 'Compliment', icon: FiHeart }
  ];

  const ratingLabels = [
    'Terrible',
    'Poor',
    'Fair',
    'Good',
    'Excellent'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRating = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleFileUpload = (file) => {
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      setFormData(prev => ({
        ...prev,
        file
      }));
    } else {
      alert('File size must be under 5MB');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }
    
    if (formData.rating === 0) {
      setSubmitStatus({ type: 'error', message: 'Please provide a rating.' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitStatus({ 
        type: 'success', 
        message: 'Thank you for your feedback! We\'ll review it and get back to you soon.' 
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: '',
        rating: 0,
        subject: '',
        message: '',
        file: null
      });
      
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'Sorry, there was an error submitting your feedback. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FeedbackContainer>
      <Header>
        <h1>
          <FiMessageSquare className="feedback-icon" />
          Feedback & Suggestions
        </h1>
        <p>
          Your feedback helps us improve PashuMitra. Share your thoughts, report issues, 
          or suggest new features to make our platform better for farmers like you.
        </p>
      </Header>

      <FeedbackGrid>
        <MainContent>
          <FeedbackCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SectionHeader>
              <FiStar className="section-icon" />
              <h2>Rate Your Experience</h2>
            </SectionHeader>

            <RatingSection>
              <div className="rating-label">How would you rate PashuMitra overall?</div>
              <div className="rating-description">
                Your rating helps us understand how well we're serving our farming community.
              </div>
              
              <StarRating>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    filled={star <= formData.rating}
                    onClick={() => handleRating(star)}
                  >
                    <FiStar />
                  </Star>
                ))}
              </StarRating>
              
              {formData.rating > 0 && (
                <RatingText>
                  {ratingLabels[formData.rating - 1]}
                </RatingText>
              )}
            </RatingSection>
          </FeedbackCard>

          <FeedbackCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <SectionHeader>
              <FiMessageSquare className="section-icon" />
              <h2>Share Your Feedback</h2>
            </SectionHeader>

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
                <label>Feedback Category</label>
                <CategoryButtons>
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
                </CategoryButtons>
              </FormGroup>

              <FormGroup>
                <label>Subject</label>
                <Input
                  type="text"
                  placeholder="Brief summary of your feedback"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <label>
                  Your Message <span className="required">*</span>
                </label>
                <Textarea
                  placeholder="Tell us more about your experience, suggestions, or any issues you've encountered..."
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>
                  <FiPaperclip style={{ marginRight: '8px' }} />
                  Attach File (Optional)
                </label>
                <FileUpload 
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                  />
                  <FiCamera className="upload-icon" />
                  <div className="upload-text">
                    {formData.file ? formData.file.name : 'Click to upload screenshot or document'}
                  </div>
                  <div className="upload-hint">
                    Supported: JPG, PNG, PDF, DOC (Max 5MB)
                  </div>
                </FileUpload>
              </FormGroup>

              <SubmitButton type="submit" disabled={isSubmitting}>
                <FiSend />
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </SubmitButton>
            </form>
          </FeedbackCard>
        </MainContent>

        <Sidebar>
          <SidebarCard>
            <h3>
              <FiStar className="sidebar-icon" />
              Feedback Stats
            </h3>
            <StatItem>
              <span className="stat-label">Total Feedback</span>
              <span className="stat-value">1,247</span>
            </StatItem>
            <StatItem>
              <span className="stat-label">Average Rating</span>
              <span className="stat-value">4.3/5</span>
            </StatItem>
            <StatItem>
              <span className="stat-label">Response Rate</span>
              <span className="stat-value">96%</span>
            </StatItem>
            <StatItem>
              <span className="stat-label">Avg. Response Time</span>
              <span className="stat-value">2 days</span>
            </StatItem>
          </SidebarCard>

          <SidebarCard>
            <h3>
              <FiMessageSquare className="sidebar-icon" />
              Recent Feedback
            </h3>
            <RecentFeedback>
              <div className="feedback-item">
                <div className="feedback-rating">
                  ★★★★★
                </div>
                <div className="feedback-text">
                  "Great platform for managing farm compliance. Very helpful alerts!"
                </div>
                <div className="feedback-date">2 days ago</div>
              </div>
              
              <div className="feedback-item">
                <div className="feedback-rating">
                  ★★★★☆
                </div>
                <div className="feedback-text">
                  "Easy to use interface, but would love more weather integration."
                </div>
                <div className="feedback-date">5 days ago</div>
              </div>
              
              <div className="feedback-item">
                <div className="feedback-rating">
                  ★★★★★
                </div>
                <div className="feedback-text">
                  "Excellent customer service and quick problem resolution."
                </div>
                <div className="feedback-date">1 week ago</div>
              </div>
            </RecentFeedback>
          </SidebarCard>
        </Sidebar>
      </FeedbackGrid>
    </FeedbackContainer>
  );
};

export default FeedbackPage;