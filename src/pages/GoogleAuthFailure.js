import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiXCircle } from 'react-icons/fi';

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
  color: #dc3545;
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

const Button = styled(motion.button)`
  background: var(--primary-coral);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: #FF6A35;
  }
`;

const GoogleAuthFailure = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/auth');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleRetry = () => {
    navigate('/auth');
  };

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Icon>
          <FiXCircle />
        </Icon>
        <Title>Authentication Failed</Title>
        <Message>
          Google authentication was unsuccessful. This could be due to:
          <br /><br />
          • Access denied during authorization
          <br />
          • Network connection issues
          <br />
          • Temporary service unavailability
        </Message>
        <Button
          onClick={handleRetry}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Try Again
        </Button>
      </Card>
    </Container>
  );
};

export default GoogleAuthFailure;