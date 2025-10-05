import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi';

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
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  transition: color 0.3s ease;
  
  &:hover {
    color: #333;
  }
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  
  .icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    
    &.success {
      background: rgba(40, 167, 69, 0.1);
      color: #28a745;
    }
    
    &.error {
      background: rgba(220, 53, 69, 0.1);
      color: #dc3545;
    }
    
    &.warning {
      background: rgba(255, 193, 7, 0.1);
      color: #ffc107;
    }
    
    &.info {
      background: rgba(23, 162, 184, 0.1);
      color: #17a2b8;
    }
  }
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 16px;
  color: var(--dark-gray);
  font-size: 1.5rem;
`;

const Message = styled.p`
  text-align: center;
  margin-bottom: 20px;
  color: #666;
  line-height: 1.6;
`;

const ErrorDetails = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
  
  .error-title {
    font-weight: 600;
    color: #dc3545;
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  .error-list {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      padding: 4px 0;
      color: #666;
      font-size: 13px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      
      &:before {
        content: "•";
        color: #dc3545;
        font-weight: bold;
      }
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  
  &.primary {
    background: var(--primary-coral);
    color: white;
    
    &:hover {
      background: #e55a3c;
      transform: translateY(-1px);
    }
  }
  
  &.secondary {
    background: #f8f9fa;
    color: #666;
    border: 1px solid #e0e0e0;
    
    &:hover {
      background: #e9ecef;
      color: #333;
    }
  }
`;

const AlertSubmissionModal = ({ 
  isOpen, 
  onClose, 
  type = 'success', 
  title, 
  message, 
  errors = [], 
  onRetry, 
  showRetry = false,
  onViewAlert,
  showViewAlert = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheck />;
      case 'error':
        return <FiX />;
      case 'warning':
        return <FiAlertTriangle />;
      case 'info':
        return <FiInfo />;
      default:
        return <FiInfo />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'success':
        return 'Alert Submitted Successfully!';
      case 'error':
        return 'Alert Submission Failed';
      case 'warning':
        return 'Alert Submission Warning';
      case 'info':
        return 'Alert Information';
      default:
        return 'Alert Status';
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'success':
        return 'Your alert has been submitted successfully. Our team will respond shortly and you will receive updates via SMS and email.';
      case 'error':
        return 'There was an error submitting your alert. Please review the details below and try again.';
      case 'warning':
        return 'Your alert was submitted with warnings. Please review the information below.';
      case 'info':
        return 'Please review the alert information below.';
      default:
        return '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContent
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <CloseButton onClick={onClose}>
              <FiX />
            </CloseButton>
            
            <IconContainer>
              <div className={`icon ${type}`}>
                {getIcon()}
              </div>
            </IconContainer>
            
            <Title>{title || getDefaultTitle()}</Title>
            
            <Message>{message || getDefaultMessage()}</Message>
            
            {errors && errors.length > 0 && (
              <ErrorDetails>
                <div className="error-title">Please fix the following issues:</div>
                <ul className="error-list">
                  {errors.map((error, index) => (
                    <li key={index}>
                      <span>
                        <strong>{error.field}:</strong> {error.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </ErrorDetails>
            )}
            
            <ButtonGroup>
              {showViewAlert && onViewAlert && (
                <Button className="primary" onClick={onViewAlert}>
                  View Alert
                </Button>
              )}
              {showRetry && onRetry && (
                <Button className="primary" onClick={onRetry}>
                  Try Again
                </Button>
              )}
              <Button 
                className={(showRetry || showViewAlert) ? 'secondary' : 'primary'} 
                onClick={onClose}
              >
                {type === 'success' ? 'Close' : 'OK'}
              </Button>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default AlertSubmissionModal;