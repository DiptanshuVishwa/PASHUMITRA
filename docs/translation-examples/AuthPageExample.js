// COMPLETE EXAMPLE: Auth Page with Full Translation Implementation
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiPhone, FiMapPin, FiGlobe } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import usePageTranslation from '../hooks/usePageTranslation';

// ✅ STEP 1: Import translation hook
const Auth = () => {
  const { login, register, forgotPassword, isAuthenticated, loading: authLoading } = useAuth();
  
  // ✅ STEP 2: Use the translation hook
  const { t, currentLanguage } = usePageTranslation();
  
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

  // ✅ STEP 3: Translate validation messages
  const validateForm = () => {
    if (!isLogin) {
      // Signup validation
      if (formData.password !== formData.confirmPassword) {
        throw new Error(t('Passwords do not match'));
      }
      
      if (!formData.name || !formData.phone || !formData.farmLocation) {
        throw new Error(t('All fields are required for signup'));
      }
      
      if (formData.password.length < 6) {
        throw new Error(t('Password must be at least 6 characters long'));
      }
      
      // Check password complexity
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/;
      if (!passwordRegex.test(formData.password)) {
        throw new Error(t('Password must contain at least one uppercase letter, one lowercase letter, and one number'));
      }
      
      // Check name contains only letters and spaces
      const nameRegex = /^[a-zA-Z\\s]+$/;
      if (!nameRegex.test(formData.name)) {
        throw new Error(t('Name can only contain letters and spaces'));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      validateForm();

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

      const result = isLogin 
        ? await login(userData)
        : await register(userData);

      if (result.success) {
        // ✅ STEP 4: Translate success messages
        setSuccess(isLogin 
          ? t('Login successful!') 
          : t('Registration successful! Please check your email to verify your account.')
        );
        
        const searchParams = new URLSearchParams(location.search);
        const redirectTo = searchParams.get('redirect') || '/';
        
        setTimeout(() => {
          navigate(redirectTo);
        }, 1500);
      } else {
        throw new Error(result.error || t('Authentication failed'));
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      // ✅ STEP 5: Translate error messages
      setError(t('Please enter your email address first.'));
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await forgotPassword(formData.email);
      
      if (result.success) {
        setSuccess(t('Password reset instructions have been sent to your email.'));
      } else {
        throw new Error(result.error || t('Failed to send reset email'));
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
          {/* ✅ STEP 6: Translate all UI text */}
          <h1>{t(isLogin ? 'Welcome Back' : 'Join PashuMitra')}</h1>
          <p>{t('Welcome to PashuMitra - Your Partner in Farm Protection')}</p>
        </AuthHeader>

        <TabContainer>
          <Tab $active={isLogin} onClick={() => setIsLogin(true)}>
            {t('Login')}
          </Tab>
          <Tab $active={!isLogin} onClick={() => setIsLogin(false)}>
            {t('Sign Up')}
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
          {t(isLogin ? 'Login with Google' : 'Sign up with Google')}
        </GoogleButton>

        <Divider>
          <span>{t('Or continue with')}</span>
        </Divider>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <FormGroup>
              <label>{t('Full Name')}</label>
              <div className="input-container">
                <FiUser />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t('Enter your full name (letters and spaces only)')}
                  required
                />
              </div>
            </FormGroup>
          )}

          {!isLogin && (
            <FormGroup>
              <label>{t('Phone Number')}</label>
              <div className="input-container">
                <FiPhone />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={t('Enter your phone number')}
                  required
                />
              </div>
            </FormGroup>
          )}

          {!isLogin && (
            <FormGroup>
              <label>{t('Farm Location')}</label>
              <div className="input-container">
                <FiMapPin />
                <input
                  type="text"
                  name="farmLocation"
                  value={formData.farmLocation}
                  onChange={handleInputChange}
                  placeholder={t('Enter your farm location')}
                  required
                />
              </div>
            </FormGroup>
          )}

          <FormGroup>
            <label>{t('Email Address')}</label>
            <div className="input-container">
              <FiMail />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('Enter your email address')}
                required
              />
            </div>
          </FormGroup>

          <FormGroup>
            <label>{t('Password')}</label>
            <div className="input-container">
              <FiLock />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={t(!isLogin 
                  ? 'Password (min 6 chars, include A-Z, a-z, 0-9)' 
                  : 'Enter your password'
                )}
                required
              />
            </div>
          </FormGroup>

          {!isLogin && (
            <FormGroup>
              <label>{t('Confirm Password')}</label>
              <div className="input-container">
                <FiLock />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder={t('Confirm password')}
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
            {loading || authLoading ? t('Please wait...') : t(isLogin ? 'Login' : 'Sign Up')}
          </SubmitButton>
        </form>

        {isLogin && (
          <SwitchText>
            <button type="button" onClick={handleForgotPassword} disabled={loading}>
              {t('Forgot Password?')}
            </button>
          </SwitchText>
        )}

        <SwitchText>
          {t(isLogin ? "Don't have an account?" : "Already have an account?")}
          <button type="button" onClick={() => setIsLogin(!isLogin)}>
            {t(isLogin ? 'Sign Up' : 'Login')}
          </button>
        </SwitchText>
      </AuthCard>
    </AuthContainer>
  );
};

export default Auth;

/* 
✅ STEP 7: Add these translations to src/utils/translations.js

For each language section, add:

// English (already there)
'Welcome Back': 'Welcome Back',
'Join PashuMitra': 'Join PashuMitra',
'Welcome to PashuMitra - Your Partner in Farm Protection': 'Welcome to PashuMitra - Your Partner in Farm Protection',
// ... continue for all text

// Hindi
'Welcome Back': 'फिर से स्वागत है',
'Join PashuMitra': 'पशुमित्र से जुड़ें',
'Welcome to PashuMitra - Your Partner in Farm Protection': 'पशुमित्र में आपका स्वागत है - खेत सुरक्षा में आपका साथी',
'Passwords do not match': 'पासवर्ड मेल नहीं खाते',
'All fields are required for signup': 'साइन अप के लिए सभी फ़ील्ड आवश्यक हैं',
'Login successful!': 'लॉगिन सफल!',
'Authentication failed': 'प्रमाणीकरण असफल',
// ... continue for all languages

*/