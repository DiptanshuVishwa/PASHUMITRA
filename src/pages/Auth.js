import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiPhone, FiMapPin, FiGlobe } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
`;

const AuthCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 450px;
`;

const AuthHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    font-size: 2rem;
    color: var(--dark-gray);
    margin-bottom: 8px;
  }
  
  p {
    color: #666;
    margin: 0;
  }
`;

const TabContainer = styled.div`
  display: flex;
  background: var(--light-gray);
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 30px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 12px;
  background: ${props => props.active ? 'var(--primary-coral)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--dark-gray)'};
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const GoogleButton = styled(motion.button)`
  width: 100%;
  padding: 14px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--dark-gray);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
  
  &:hover {
    border-color: var(--primary-coral);
    background: #fafafa;
  }
  
  svg {
    font-size: 20px;
    color: #4285F4;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e0e0e0;
  }
  
  span {
    margin: 0 16px;
    color: #666;
    font-size: 14px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    color: var(--dark-gray);
    font-weight: 600;
  }
  
  .input-container {
    position: relative;
  }
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
  
  input {
    width: 100%;
    padding: 12px 12px 12px 40px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: var(--primary-coral);
    }
  }
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: 14px;
  background: var(--primary-coral);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: #FF6A35;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const SwitchText = styled.p`
  text-align: center;
  margin-top: 20px;
  color: #666;
  
  button {
    background: none;
    border: none;
    color: var(--primary-coral);
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: var(--danger-red);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  background: #e8f5e8;
  color: #2e7d32;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const Auth = () => {
  const { login, register, forgotPassword, isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    farmLocation: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      // Get the redirect URL from query parameters, default to landing page
      const searchParams = new URLSearchParams(location.search);
      const redirectTo = searchParams.get('redirect') || '/';
      console.log('🔄 Already authenticated, redirecting to:', redirectTo);
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    
    try {
      // This is a placeholder - integrate with Google OAuth API
      // For now, show a message that this feature is coming soon
      setError('Google authentication is coming soon. Please use email/password for now.');
    } catch (error) {
      setError('Failed to authenticate with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!isLogin) {
        // Signup validation
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        if (!formData.name || !formData.phone || !formData.farmLocation) {
          throw new Error('All fields are required for signup');
        }
        
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        
        // Check password complexity
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
        if (!passwordRegex.test(formData.password)) {
          throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
        }
        
        // Check name contains only letters and spaces
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(formData.name)) {
          throw new Error('Name can only contain letters and spaces');
        }
      }

      // Prepare user data
      const userData = {
        email: formData.email,
        password: formData.password,
        ...(isLogin ? {} : {
          name: formData.name,
          phone: formData.phone,
          farmLocation: formData.farmLocation,
          role: 'user'
        })
      };

      // Call appropriate authentication method
      const result = isLogin 
        ? await login(userData)
        : await register(userData);

      if (result.success) {
        setSuccess(isLogin ? 'Login successful!' : 'Registration successful! Please check your email to verify your account.');
        
        // Get the redirect URL from query parameters for post-login redirect
        const searchParams = new URLSearchParams(location.search);
        const redirectTo = searchParams.get('redirect') || '/';
        
        setTimeout(() => {
          console.log(`🔄 ${isLogin ? 'Login' : 'Registration'} Redirect → Going to:`, redirectTo);
          navigate(redirectTo);
        }, 1500);
      } else {
        throw new Error(result.error || 'Authentication failed');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await forgotPassword(formData.email);
      
      if (result.success) {
        setSuccess('Password reset instructions have been sent to your email.');
      } else {
        throw new Error(result.error || 'Failed to send reset email');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <AuthHeader>
          <h1>{isLogin ? 'Welcome Back' : 'Join PashuMitra'}</h1>
          <p>Welcome to PashuMitra - Your Partner in Farm Protection</p>
        </AuthHeader>

        <TabContainer>
          <Tab
            active={isLogin}
            onClick={() => setIsLogin(true)}
          >
            Login
          </Tab>
          <Tab
            active={!isLogin}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </Tab>
        </TabContainer>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <GoogleButton
          onClick={handleGoogleAuth}
          disabled={loading || authLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiGlobe />
          {isLogin ? 'Login with Google' : 'Sign up with Google'}
        </GoogleButton>

        <Divider>
          <span>Or continue with</span>
        </Divider>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <FormGroup>
                <label>Full Name</label>
                <div className="input-container">
                  <FiUser />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name (letters and spaces only)"
                    required={!isLogin}
                  />
                </div>
              </FormGroup>

              <FormGroup>
                <label>Phone Number</label>
                <div className="input-container">
                  <FiPhone />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required={!isLogin}
                  />
                </div>
              </FormGroup>

              <FormGroup>
                <label>Farm Location</label>
                <div className="input-container">
                  <FiMapPin />
                  <input
                    type="text"
                    name="farmLocation"
                    value={formData.farmLocation}
                    onChange={handleInputChange}
                    placeholder="Enter your farm location"
                    required={!isLogin}
                  />
                </div>
              </FormGroup>
            </>
          )}

          <FormGroup>
            <label>Email Address</label>
            <div className="input-container">
              <FiMail />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                required
              />
            </div>
          </FormGroup>

          <FormGroup>
            <label>Password</label>
            <div className="input-container">
              <FiLock />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={isLogin ? "Enter your password" : "Password (min 6 chars, include A-Z, a-z, 0-9)"}
                required
              />
            </div>
          </FormGroup>

          {!isLogin && (
            <FormGroup>
              <label>Confirm Password</label>
              <div className="input-container">
                <FiLock />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  required
                />
              </div>
            </FormGroup>
          )}

          <SubmitButton
            type="submit"
            disabled={loading || authLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {(loading || authLoading) ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
          </SubmitButton>
        </form>

        {isLogin && (
          <SwitchText>
            <button 
              type="button" 
              onClick={handleForgotPassword}
              disabled={loading || authLoading}
            >
              Forgot Password?
            </button>
          </SwitchText>
        )}

        <SwitchText>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </SwitchText>
      </AuthCard>
    </AuthContainer>
  );
};

export default Auth;