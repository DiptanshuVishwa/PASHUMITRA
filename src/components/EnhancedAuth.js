import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiGlobe, FiLoader } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import FormInput from './form/FormInput';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateName,
  validatePhone,
  validateFarmLocation,
  useFormValidation
} from '../utils/validation';
import toast from 'react-hot-toast';

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
  max-width: 500px;
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
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
  
  .full-width {
    grid-column: 1 / -1;
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
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
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

const ForgotPasswordLink = styled.button`
  background: none;
  border: none;
  color: var(--primary-coral);
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 16px;
  width: 100%;
  text-align: center;
`;

const EnhancedAuth = () => {
  const { login, register, forgotPassword, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Form validation setup
  const initialData = {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    farmLocation: ''
  };

  // Custom validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    if (touchedFields[name]) {
      validateField(name, value);
    }
  };
  
  const handleInputBlur = (name) => {
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };
  
  const validateField = (name, value) => {
    let fieldErrors = [];
    
    switch (name) {
      case 'email':
        const emailResult = validateEmail(value);
        if (!emailResult.isValid) fieldErrors = emailResult.errors;
        break;
      case 'password':
        const passwordResult = validatePassword(value, !isLogin);
        if (!passwordResult.isValid) fieldErrors = passwordResult.errors;
        break;
      case 'confirmPassword':
        if (!isLogin) {
          const confirmResult = validateConfirmPassword(formData.password, value);
          if (!confirmResult.isValid) fieldErrors = confirmResult.errors;
        }
        break;
      case 'firstName':
        if (!isLogin) {
          const nameResult = validateName(value, 'First name', true);
          if (!nameResult.isValid) fieldErrors = nameResult.errors;
        }
        break;
      case 'lastName':
        if (!isLogin) {
          const nameResult = validateName(value, 'Last name', true);
          if (!nameResult.isValid) fieldErrors = nameResult.errors;
        }
        break;
      case 'phone':
        if (!isLogin) {
          const phoneResult = validatePhone(value, true);
          if (!phoneResult.isValid) fieldErrors = phoneResult.errors;
        }
        break;
      case 'farmLocation':
        if (!isLogin) {
          const locationResult = validateFarmLocation(value, true);
          if (!locationResult.isValid) fieldErrors = locationResult.errors;
        }
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [name]: fieldErrors.length > 0 ? { errors: fieldErrors } : null
    }));
  };
  
  const validateAllFields = () => {
    const fields = isLogin ? ['email', 'password'] : ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'phone', 'farmLocation'];
    let isValid = true;
    
    fields.forEach(field => {
      validateField(field, formData[field]);
      if (validationErrors[field]?.errors?.length > 0) {
        isValid = false;
      }
    });
    
    return isValid;
  };

  // Get password strength for display
  const passwordValidation = validatePassword(formData.password, !isLogin);

  useEffect(() => {
    if (isAuthenticated) {
      const searchParams = new URLSearchParams(location.search);
      const redirectTo = searchParams.get('redirect') || '/';
      console.log('🔄 Already authenticated, redirecting to:', redirectTo);
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, location]);

  // Reset form when switching between login/signup
  useEffect(() => {
    setFormData(initialData);
  }, [isLogin]);

  const handleGoogleAuth = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      window.location.href = `${API_URL}/auth/google`;
    } catch (error) {
      console.error('Google auth error:', error);
      toast.error('Failed to initiate Google authentication. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate entire form
    if (!validateAllFields()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        ...(isLogin ? {} : {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          farmLocation: formData.farmLocation,
          role: 'user'
        })
      };

      const result = isLogin 
        ? await login(userData)
        : await register(userData);

      if (result.success) {
        toast.success(isLogin ? 'Login successful!' : 'Registration successful!');
        
        const searchParams = new URLSearchParams(location.search);
        let redirectTo;
        
        if (isLogin) {
          // For existing users logging in, use redirect parameter or default to landing page
          redirectTo = searchParams.get('redirect') || '/';
        } else {
          // For new user registration, always redirect to questionnaire page
          // This helps onboard new users by collecting their information
          redirectTo = '/questionnaire';
        }
        
        setTimeout(() => {
          navigate(redirectTo);
        }, 1500);
      } else {
        toast.error(result.error || 'Authentication failed');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await forgotPassword(formData.email);
      
      if (result.success) {
        toast.success('Password reset instructions have been sent to your email.');
        setShowForgotPassword(false);
      } else {
        toast.error(result.error || 'Failed to send reset email');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stateOptions = [
    { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
    { value: 'Karnataka', label: 'Karnataka' },
    { value: 'Kerala', label: 'Kerala' },
    { value: 'Tamil Nadu', label: 'Tamil Nadu' },
    { value: 'Telangana', label: 'Telangana' }
  ];

  if (showForgotPassword) {
    return (
      <AuthContainer>
        <AuthCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AuthHeader>
            <h1>Reset Password</h1>
            <p>Enter your email address to receive reset instructions</p>
          </AuthHeader>

          <form onSubmit={handleForgotPasswordSubmit}>
            <FormInput
              type="email"
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="Enter your email"
              required
              error={validationErrors.email?.errors}
              disabled={isSubmitting}
            />

            <SubmitButton
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="rotating" />
                  Sending...
                </>
              ) : (
                'Send Reset Instructions'
              )}
            </SubmitButton>

            <SwitchText>
              Remember your password?{' '}
              <button 
                type="button" 
                onClick={() => setShowForgotPassword(false)}
              >
                Back to Login
              </button>
            </SwitchText>
          </form>
        </AuthCard>
      </AuthContainer>
    );
  }

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

        <GoogleButton
          onClick={handleGoogleAuth}
          disabled={isSubmitting}
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
          {isLogin ? (
            // Login Form
            <>
              <FormInput
                type="email"
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="Enter your email"
                required
                error={validationErrors.email?.errors}
                disabled={isSubmitting}
              />

              <FormInput
                type="password"
                label="Password"
                name="password"
                value={formData.password}
onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="Enter your password"
                required
                error={validationErrors.password?.errors}
                disabled={isSubmitting}
              />

              <ForgotPasswordLink
                type="button"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot your password?
              </ForgotPasswordLink>
            </>
          ) : (
            // Signup Form
            <FormGrid>
              <FormInput
                type="text"
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="First name"
                required
                error={validationErrors.firstName?.errors}
                disabled={isSubmitting}
                maxLength={50}
              />

              <FormInput
                type="text"
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="Last name"
                required
                error={validationErrors.lastName?.errors}
                disabled={isSubmitting}
                maxLength={50}
              />

              <FormInput
                type="email"
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="Enter your email"
                required
                error={validationErrors.email?.errors}
                disabled={isSubmitting}
                className="full-width"
              />

              <FormInput
                type="tel"
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="+91 98765 43210"
                required
                error={validationErrors.phone?.errors}
                disabled={isSubmitting}
                className="full-width"
              />

              <FormInput
                type="text"
                label="Farm Location"
                name="farmLocation"
                value={formData.farmLocation}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="Enter your farm location"
                required
                error={validationErrors.farmLocation?.errors}
                disabled={isSubmitting}
                className="full-width"
                maxLength={100}
              />

              <FormInput
                type="password"
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="Create a strong password"
                required
                error={validationErrors.password?.errors}
                warning={passwordValidation.warnings}
                showPasswordStrength={true}
                passwordStrength={passwordValidation}
                disabled={isSubmitting}
                className="full-width"
              />

              <FormInput
                type="password"
                label="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="Confirm your password"
                required
                error={validationErrors.confirmPassword?.errors}
                success={formData.confirmPassword && formData.password === formData.confirmPassword ? 'Passwords match' : null}
                disabled={isSubmitting}
                className="full-width"
              />
            </FormGrid>
          )}

          <SubmitButton
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <>
                <FiLoader className="rotating" />
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </SubmitButton>

          <SwitchText>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </SwitchText>
        </form>
      </AuthCard>
    </AuthContainer>
  );
};

export default EnhancedAuth;