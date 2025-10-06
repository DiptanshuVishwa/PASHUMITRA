import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiLoader, FiMail, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const VerificationContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
`;

const VerificationCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 500px;
  text-align: center;
`;

const IconContainer = styled(motion.div)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  
  &.loading {
    background: linear-gradient(135deg, #f0f8ff, #e6f3ff);
    color: #3498db;
  }
  
  &.success {
    background: linear-gradient(135deg, #d4edda, #c3e6cb);
    color: #27ae60;
  }
  
  &.error {
    background: linear-gradient(135deg, #f8d7da, #f5c6cb);
    color: #e74c3c;
  }
  
  svg {
    font-size: 40px;
  }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: var(--dark-gray);
  margin-bottom: 16px;
  
  &.loading { color: #3498db; }
  &.success { color: #27ae60; }
  &.error { color: #e74c3c; }
`;

const Message = styled.p`
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const ActionButton = styled(motion.button)`
  background: var(--primary-coral);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  margin: 8px;
  
  &:hover {
    background: #FF6A35;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled(ActionButton)`
  background: transparent;
  color: var(--primary-coral);
  border: 2px solid var(--primary-coral);
  
  &:hover {
    background: var(--primary-coral);
    color: white;
  }
`;

const ResendSection = styled(motion.div)`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
  border-left: 4px solid var(--primary-coral);
`;

const ResendTitle = styled.h3`
  color: var(--dark-gray);
  margin-bottom: 12px;
  font-size: 1.1rem;
`;

const ResendText = styled.p`
  color: #666;
  margin-bottom: 16px;
  font-size: 0.95rem;
`;

const EmailInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 16px;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary-coral);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification, user, setAuthData } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const hasVerifiedRef = useRef(false); // Prevent duplicate verification attempts

  useEffect(() => {
    if (token && !hasVerifiedRef.current) {
      handleVerification();
    } else if (!token) {
      setVerificationStatus('error');
      setMessage('Invalid verification link. The token is missing.');
    }
  }, [token]);

  const handleVerification = async () => {
    // Prevent duplicate calls
    if (hasVerifiedRef.current) {
      console.log('Verification already attempted, skipping...');
      return;
    }
    
    // Set flag immediately to prevent race conditions
    hasVerifiedRef.current = true;
    
    try {
      setVerificationStatus('loading');
      setMessage('Verifying your email address...');

      console.log('Starting email verification with token:', token);
      const result = await verifyEmail(token);
      console.log('Verification result:', result);

      if (result.success) {
        setVerificationStatus('success');
        setMessage('🎉 Your email has been successfully verified! Redirecting to dashboard...');
        toast.success('Email verified successfully! Redirecting to dashboard...');
        
        // If we received a token, log the user in automatically
        if (result.token) {
          console.log('Auto-logging user in with verification token:', result.token ? 'Present' : 'Missing');
          console.log('User data received:', result.data?.user);
          
          const authResult = await setAuthData({ token: result.token });
          console.log('Auth data set result:', authResult);
          
          // Signal to other tabs that verification is complete
          localStorage.setItem('email_verification_completed', 'true');
          
          // Small delay to ensure auth state has updated
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Auto-redirect to dashboard (authenticated user's home) after 3 seconds
        setTimeout(() => {
          console.log('Navigating to dashboard...');
          navigate('/dashboard');
        }, 3000);
      } else {
        setVerificationStatus('error');
        setMessage(result.error || 'Verification failed. The link may be expired or invalid.');
        setShowResend(true);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      setMessage('An unexpected error occurred during verification. Please try again.');
      setShowResend(true);
      // Don't reset the flag here - we still want to prevent duplicate attempts
    }
  };

  const handleResendVerification = async () => {
    if (!resendEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resendEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsResending(true);

    try {
      const result = await resendVerification(resendEmail);

      if (result.success) {
        toast.success('Verification email sent! Please check your inbox.');
        setShowResend(false);
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

  const getIconComponent = () => {
    switch (verificationStatus) {
      case 'loading':
        return <FiLoader className="animate-spin" />;
      case 'success':
        return <FiCheckCircle />;
      case 'error':
        return <FiXCircle />;
      default:
        return <FiMail />;
    }
  };

  const getTitle = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'Verifying Email...';
      case 'success':
        return 'Email Verified!';
      case 'error':
        return 'Verification Failed';
      default:
        return 'Email Verification';
    }
  };

  return (
    <VerificationContainer>
      <VerificationCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <IconContainer 
          className={verificationStatus}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          {getIconComponent()}
        </IconContainer>

        <Title className={verificationStatus}>
          {getTitle()}
        </Title>

        <Message>{message}</Message>

        {verificationStatus === 'success' && (
          <div>
            <ActionButton
              as={Link}
              to="/dashboard"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Go to Dashboard <FiArrowRight />
            </ActionButton>
            
            <SecondaryButton
              as={Link}
              to="/"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to Home
            </SecondaryButton>
          </div>
        )}

        {verificationStatus === 'error' && !showResend && (
          <div>
            <ActionButton
              onClick={() => setShowResend(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiMail /> Resend Verification Email
            </ActionButton>
            
            <SecondaryButton
              as={Link}
              to="/auth"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to Login
            </SecondaryButton>
          </div>
        )}

        {showResend && (
          <ResendSection
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <ResendTitle>Resend Verification Email</ResendTitle>
            <ResendText>
              Enter your email address and we'll send you a new verification link.
            </ResendText>
            
            <EmailInput
              type="email"
              placeholder="Enter your email address"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleResendVerification()}
            />
            
            <ActionButton
              onClick={handleResendVerification}
              disabled={isResending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isResending ? <FiLoader className="animate-spin" /> : <FiMail />}
              {isResending ? 'Sending...' : 'Send Verification Email'}
            </ActionButton>
            
            <SecondaryButton
              onClick={() => setShowResend(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </SecondaryButton>
          </ResendSection>
        )}

        {verificationStatus === 'loading' && (
          <SecondaryButton
            as={Link}
            to="/auth"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back to Login
          </SecondaryButton>
        )}
      </VerificationCard>
    </VerificationContainer>
  );
};

export default EmailVerification;