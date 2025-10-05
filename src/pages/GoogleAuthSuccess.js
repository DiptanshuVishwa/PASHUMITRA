import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiLoader } from 'react-icons/fi';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const Icon = styled.div`
  font-size: 4rem;
  color: var(--primary-coral);
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: var(--dark-gray);
  margin-bottom: 16px;
`;

const Message = styled.p`
  color: #666;
  margin-bottom: 20px;
`;

const GoogleAuthSuccess = () => {
  const { setAuthData } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const hasExecuted = useRef(false); // Prevent multiple executions

  useEffect(() => {
    // Prevent multiple executions
    if (hasExecuted.current) {
      console.log('Google Auth - Already executed, skipping...');
      return;
    }
    
    const handleGoogleCallback = async () => {
      try {
        hasExecuted.current = true;
        
        const token = searchParams.get('token');
        console.log('Google Auth - Token received:', token ? 'Yes' : 'No');
        console.log('Google Auth - Full URL:', window.location.href);
        
        if (!token) {
          throw new Error('No authentication token received from Google OAuth callback');
        }

        // Store the token in localStorage
        localStorage.setItem('pashumitra_token', token);
        console.log('Google Auth - Token stored in localStorage');
        
        // Set auth data in context and wait for completion
        const result = await setAuthData({ token });
        console.log('Google Auth - setAuthData result:', result);
        
        if (result?.success) {
          setStatus('success');
          console.log('Google Auth - Authentication successful, user:', result.user?.name);
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1500);
        } else {
          throw new Error(result?.error || 'Failed to authenticate user');
        }
        
      } catch (error) {
        console.error('Google auth callback error:', error);
        setStatus('error');
        
        // Clear any stored data
        localStorage.removeItem('pashumitra_token');
        localStorage.removeItem('pashumitra_user');
        
        // Redirect to auth page after a short delay
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 3000);
      }
    };

    handleGoogleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - we only want this to run once on mount

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <>
            <Icon>
              <FiLoader className="rotating" />
            </Icon>
            <Title>Processing Authentication...</Title>
            <Message>Please wait while we complete your Google sign-in.</Message>
          </>
        );
      
      case 'success':
        return (
          <>
            <Icon>
              <FiCheckCircle />
            </Icon>
            <Title>Welcome to PashuMitra!</Title>
            <Message>Google authentication successful. Redirecting you to dashboard...</Message>
          </>
        );
      
      case 'error':
        return (
          <>
            <Icon style={{ color: '#dc3545' }}>
              ❌
            </Icon>
            <Title>Authentication Failed</Title>
            <Message>There was an error with Google authentication. Redirecting you back to login...</Message>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {renderContent()}
      </Card>
    </Container>
  );
};

export default GoogleAuthSuccess;