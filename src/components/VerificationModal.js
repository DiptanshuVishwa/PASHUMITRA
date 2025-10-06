import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLoader, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #FF7F50 0%, #FF6A35 100%);
  color: white;
  padding: 30px;
  text-align: center;
  border-radius: 20px 20px 0 0;
  
  h2 {
    margin: 0 0 8px 0;
    font-size: 1.8rem;
    font-weight: 700;
  }
  
  p {
    margin: 0;
    opacity: 0.9;
    font-size: 1rem;
  }
`;

const ModalBody = styled.div`
  padding: 40px 30px 30px;
`;

const EmailBox = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid #dee2e6;
  border-radius: 16px;
  padding: 24px;
  margin: 24px 0;
  text-align: center;
  
  .email-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #FF7F50, #FF6A35);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    color: white;
    font-size: 24px;
  }
  
  .email-text {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }
  
  .user-email {
    font-size: 16px;
    font-weight: 600;
    color: var(--primary-coral);
    word-break: break-all;
  }
`;

const InstructionBox = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-left: 4px solid #ffc107;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  
  h4 {
    margin: 0 0 12px 0;
    color: #856404;
    font-size: 1rem;
  }
  
  ol {
    margin: 0;
    padding-left: 20px;
    color: #856404;
  }
  
  li {
    margin-bottom: 8px;
    line-height: 1.5;
  }
`;

const ActionButton = styled(motion.button)`
  width: 100%;
  background: ${props => props.variant === 'secondary' 
    ? 'transparent' 
    : 'linear-gradient(135deg, #FF7F50, #FF6A35)'
  };
  color: ${props => props.variant === 'secondary' ? 'var(--primary-coral)' : 'white'};
  border: ${props => props.variant === 'secondary' ? '2px solid var(--primary-coral)' : 'none'};
  border-radius: 12px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 127, 80, 0.3);
    background: ${props => props.variant === 'secondary' 
      ? 'var(--primary-coral)' 
      : 'linear-gradient(135deg, #FF6A35, #FF5722)'
    };
    color: white;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  svg {
    font-size: 18px;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 24px 0;
  
  .step {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    
    &.completed {
      background: #4CAF50;
      color: white;
    }
    
    &.current {
      background: var(--primary-coral);
      color: white;
    }
    
    &.pending {
      background: #e9ecef;
      color: #6c757d;
    }
  }
  
  .connector {
    width: 24px;
    height: 2px;
    background: #dee2e6;
    
    &.completed {
      background: #4CAF50;
    }
  }
`;

const TipBox = styled.div`
  background: #d1ecf1;
  border: 1px solid #bee5eb;
  border-left: 4px solid #17a2b8;
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
  
  .tip-header {
    font-weight: 600;
    color: #0c5460;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .tip-content {
    color: #0c5460;
    font-size: 14px;
    line-height: 1.5;
  }
`;

const VerificationModal = ({ isOpen, userEmail, onClose }) => {
  const { resendVerification, isAuthenticated } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  console.log('🔍 VerificationModal props:', { isOpen, userEmail });
  
  // Listen for email verification completion in other tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'email_verification_completed' && event.newValue === 'true') {
        console.log('🎉 Email verification completed in another tab, closing modal');
        toast.success('Email verified successfully! Welcome to PashuMitra! 🎉');
        onClose();
        // Clear the flag
        localStorage.removeItem('email_verification_completed');
      }
    };
    
    // Add event listener for localStorage changes (cross-tab communication)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check if user becomes authenticated (verification completed in same tab)
    if (isAuthenticated && isOpen) {
      console.log('🎉 User authenticated, closing verification modal');
      onClose();
    }
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, isOpen, onClose]);

  const handleResendEmail = async () => {
    setIsResending(true);
    
    try {
      const result = await resendVerification(userEmail);
      
      if (result.success) {
        setEmailSent(true);
        toast.success('Verification email sent successfully! 📧', {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb',
          },
        });
      } else {
        toast.error(result.error || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ModalContent
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          >
            <ModalHeader>
              <h2>🎉 Almost There!</h2>
              <p>Please verify your email to get started</p>
            </ModalHeader>
            
            <ModalBody>
              <StepIndicator>
                <div className="step completed">
                  <FiCheckCircle />
                </div>
                <div className="connector completed"></div>
                <div className="step current">2</div>
                <div className="connector"></div>
                <div className="step pending">3</div>
              </StepIndicator>
              
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <small style={{ color: '#666' }}>
                  Step 2 of 3: Email Verification
                </small>
              </div>

              <EmailBox>
                <div className="email-icon">
                  <FiMail />
                </div>
                <div className="email-text">
                  We've sent a verification email to:
                </div>
                <div className="user-email">
                  {userEmail}
                </div>
              </EmailBox>

              <InstructionBox>
                <h4>📋 What to do next:</h4>
                <ol>
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Look for an email from "PashuMitra Portal"</li>
                  <li>Click the "Verify Email Address" button in the email</li>
                  <li>You'll be automatically redirected back to the app</li>
                </ol>
              </InstructionBox>

              <TipBox>
                <div className="tip-header">
                  💡 Pro Tip
                </div>
                <div className="tip-content">
                  The verification link expires in 24 hours for security. 
                  If you don't see the email in a few minutes, check your spam folder 
                  or click "Resend" below.
                </div>
              </TipBox>

              <ActionButton
                onClick={handleResendEmail}
                disabled={isResending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isResending ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Sending...
                  </>
                ) : emailSent ? (
                  <>
                    <FiCheckCircle />
                    Email Sent Successfully!
                  </>
                ) : (
                  <>
                    <FiRefreshCw />
                    Resend Verification Email
                  </>
                )}
              </ActionButton>

              <ActionButton
                variant="secondary"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                I'll verify later
              </ActionButton>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <small style={{ color: '#999', fontSize: '12px' }}>
                  Need help? Contact support at{' '}
                  <a 
                    href="mailto:pashumitra.team@gmail.com" 
                    style={{ color: 'var(--primary-coral)' }}
                  >
                    pashumitra.team@gmail.com
                  </a>
                </small>
              </div>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default VerificationModal;