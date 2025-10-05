import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMenu, 
  FiX, 
  FiUser, 
  FiSettings, 
  FiLogOut, 
  FiBell, 
  FiGlobe,
  FiChevronDown,
  FiHome,
  FiCloud
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/logo.png';

const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 127, 80, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  height: 70px;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    height: 75px;
    background: rgba(255, 255, 255, 0.98);
  }
`;

const NavContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--dark-gray);
  margin-right: auto;
  min-width: 0;
  flex-shrink: 0;
  max-width: calc(100% - 320px);
  
  img {
    height: 45px;
    width: 45px;
    object-fit: contain;
    margin-right: 12px;
    transition: transform 0.3s ease;
    flex-shrink: 0;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
  
  .logo-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    overflow: hidden;
  }
  
  .logo-text {
    font-size: 24px;
    font-weight: 700;
    color: var(--primary-coral);
    letter-spacing: -0.5px;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .tagline {
    font-size: 10px;
    color: #666;
    font-weight: 500;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 2px;
    line-height: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  @media (max-width: 1024px) {
    max-width: calc(100% - 280px);
    
    .tagline {
      font-size: 9px;
    }
  }
  
  @media (max-width: 900px) {
    max-width: calc(100% - 250px);
    
    .tagline {
      display: none;
    }
  }
  
  @media (max-width: 768px) {
    max-width: calc(100% - 200px);
    
    img {
      height: 32px;
      width: 32px;
      margin-right: 6px;
    }
    
    .logo-text {
      font-size: 16px;
      line-height: 1;
    }
  }
  
  @media (max-width: 480px) {
    max-width: calc(100% - 160px);
    
    img {
      height: 28px;
      width: 28px;
      margin-right: 4px;
    }
    
    .logo-text {
      font-size: 14px;
    }
  }
  
  @media (max-width: 360px) {
    max-width: calc(100% - 140px);
    
    img {
      height: 24px;
      width: 24px;
      margin-right: 3px;
    }
    
    .logo-text {
      font-size: 12px;
    }
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 40px;
  flex: 1;
  justify-content: center;
  max-width: calc(100vw - 600px);
  overflow: hidden;
  
  @media (max-width: 1400px) {
    gap: 10px;
    margin: 0 30px;
    max-width: calc(100vw - 550px);
  }
  
  @media (max-width: 1200px) {
    gap: 8px;
    margin: 0 20px;
    max-width: calc(100vw - 500px);
  }
  
  @media (max-width: 900px) {
    gap: 6px;
    margin: 0 15px;
    max-width: calc(100vw - 450px);
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  white-space: nowrap;
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 127, 80, 0.1), rgba(255, 127, 80, 0.05));
    color: var(--primary-coral);
    transform: translateY(-1px);
  }
  
  &.active {
    background: linear-gradient(135deg, var(--primary-coral), #FF6A35);
    color: white;
    box-shadow: 0 2px 8px rgba(255, 127, 80, 0.3);
  }
  
  svg {
    font-size: 16px;
  }
  
  @media (max-width: 1200px) {
    font-size: 13px;
    padding: 6px 8px;
    gap: 4px;
    
    svg {
      font-size: 14px;
    }
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #333;
  font-weight: 500;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 127, 80, 0.1), rgba(255, 127, 80, 0.05));
    color: var(--primary-coral);
    transform: translateY(-1px);
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  @media (max-width: 1200px) {
    font-size: 13px;
    padding: 6px 8px;
  }
  
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 6px 6px;
    gap: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  @media (max-width: 480px) {
    font-size: 11px;
    padding: 4px 4px;
    gap: 2px;
  }
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;
  min-width: 200px;
  padding: 8px 0;
  margin-top: 4px;
  z-index: 1001;
  
  /* Prevent dropdown from going off screen */
  @media (max-width: 1200px) {
    right: -20px;
  }
  
  @media (max-width: 900px) {
    right: -40px;
  }
  
  @media (max-width: 480px) {
    right: -60px;
    min-width: 180px;
  }
`;

const DropdownItem = styled(Link)`
  display: block;
  padding: 12px 16px;
  text-decoration: none;
  color: #333;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
    color: var(--primary-coral);
  }
`;

const AuthButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const AuthButton = styled(Link)`
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  
  &.btn-outline {
    color: #333;
    border: 1.5px solid #e0e0e0;
    background: transparent;
    
    &:hover {
      border-color: var(--primary-coral);
      color: var(--primary-coral);
      transform: translateY(-1px);
      background: rgba(255, 127, 80, 0.05);
    }
  }
  
  &.btn-primary {
    background: linear-gradient(135deg, var(--primary-coral), #FF6A35);
    color: white;
    border: 1.5px solid transparent;
    box-shadow: 0 2px 8px rgba(255, 127, 80, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 127, 80, 0.4);
    }
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  flex-shrink: 0;
  min-width: 280px;
  justify-content: flex-end;
  
  @media (max-width: 1400px) {
    min-width: 250px;
  }
  
  @media (max-width: 1200px) {
    min-width: 220px;
    gap: 8px;
  }
  
  @media (max-width: 900px) {
    min-width: 200px;
    gap: 6px;
  }
  
  @media (max-width: 768px) {
    min-width: auto;
    gap: 6px;
  }
  
  @media (max-width: 480px) {
    gap: 4px;
  }
`;

const NotificationButton = styled.button`
  position: relative;
  background: none;
  border: none;
  color: #333;
  font-size: 18px;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 127, 80, 0.1), rgba(255, 127, 80, 0.05));
    color: var(--primary-coral);
    transform: translateY(-1px);
  }
  
  .notification-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    background: linear-gradient(135deg, #FF4757, #FF3742);
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    font-size: 10px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
    animation: pulse 2s infinite;
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
    padding: 8px;
    
    .notification-badge {
      width: 16px;
      height: 16px;
      font-size: 9px;
      top: 2px;
      right: 2px;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
    padding: 6px;
    
    .notification-badge {
      width: 14px;
      height: 14px;
      font-size: 8px;
    }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const MobileMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 127, 80, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 16px;
  display: none;
  max-height: calc(100vh - 75px);
  overflow-y: auto;
  z-index: 999;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileNavSection = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  h4 {
    margin: 0 0 12px 0;
    color: var(--primary-coral);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding-bottom: 8px;
    border-bottom: 2px solid rgba(255, 127, 80, 0.1);
  }
`;

const MobileNavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin: 4px 0;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 14px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 127, 80, 0.1), rgba(255, 127, 80, 0.05));
    color: var(--primary-coral);
    transform: translateX(4px);
  }
  
  svg {
    margin-right: 8px;
    font-size: 16px;
  }
`;

const MobileNavButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  margin: 4px 0;
  text-align: left;
  background: none;
  border: none;
  color: #333;
  font-weight: 500;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 127, 80, 0.1), rgba(255, 127, 80, 0.05));
    color: var(--primary-coral);
    transform: translateX(4px);
  }
  
  svg {
    margin-right: 8px;
    font-size: 16px;
  }
`;

const MobileUserSection = styled.div`
  border-top: 2px solid rgba(255, 127, 80, 0.1);
  padding-top: 20px;
  margin-top: 20px;
`;

const MobileLanguageSelector = styled.div`
  margin-top: 12px;
  
  select {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid #e0e0e0;
    border-radius: 8px;
    background: white;
    color: #333;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: var(--primary-coral);
      box-shadow: 0 0 0 3px rgba(255, 127, 80, 0.1);
    }
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 20px;
  color: #333;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 127, 80, 0.1), rgba(255, 127, 80, 0.05));
    color: var(--primary-coral);
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const LanguageSelector = styled.div`
  position: relative;
  
  @media (max-width: 768px) {
    min-width: 80px;
  }
  
  @media (max-width: 480px) {
    min-width: 70px;
  }
`;

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { currentLanguage, supportedLanguages, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showOthersDropdown, setShowOthersDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [notificationCount] = useState(3); // This would come from context/API
  const othersDropdownRef = useRef(null);
  const othersButtonRef = useRef(null);

  // Close Others dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (othersDropdownRef.current && !othersDropdownRef.current.contains(event.target)) {
        setShowOthersDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calculate Others button position for dropdown
  const getOthersButtonPosition = () => {
    if (othersButtonRef.current) {
      const rect = othersButtonRef.current.getBoundingClientRect();
      return {
        top: rect.bottom + 4, // 4px gap below button
        left: rect.left
      };
    }
    return { top: 70, left: '50%' }; // fallback
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getCurrentLanguageName = () => {
    const lang = supportedLanguages.find(lang => lang.code === currentLanguage);
    const name = lang ? lang.nativeName : 'English';
    
    // Truncate for mobile display
    if (window.innerWidth <= 768) {
      return name.length > 8 ? name.substring(0, 8) + '...' : name;
    }
    if (window.innerWidth <= 480) {
      return name.length > 6 ? name.substring(0, 6) + '...' : name;
    }
    return name;
  };

  return (
    <NavbarContainer>
      <NavContent>
        <Logo to="/">
          <img 
            src={logo} 
            alt="PashuMitra Logo" 
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="logo-content">
            <span className="logo-text">{t('landing.title')}</span>
            <span className="tagline">{t('landing.tagline')}</span>
          </div>
        </Logo>

        <NavLinks>
          <NavLink to="/" title="Home">
            <FiHome /> Home
          </NavLink>
          <NavLink to="/dashboard">{t('nav.dashboard')}</NavLink>
          <NavLink to="/compliance">{t('nav.compliance')}</NavLink>
          <NavLink to="/risk-assessment">{t('nav.riskAssessment')}</NavLink>
          <NavLink to="/raise-alert">{t('nav.raiseAlert')}</NavLink>

          <button 
            ref={othersButtonRef}
            onClick={() => setShowOthersDropdown(!showOthersDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: '#333',
              fontWeight: '500',
              fontSize: '14px',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, rgba(255, 127, 80, 0.1), rgba(255, 127, 80, 0.05))';
              e.target.style.color = 'var(--primary-coral)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = '#333';
            }}
          >
            Others <FiChevronDown style={{ 
              transform: showOthersDropdown ? 'rotate(180deg)' : 'rotate(0deg)', 
              transition: 'transform 0.3s ease' 
            }} />
          </button>
        </NavLinks>

        <UserMenu>
          {/* Language Selector */}
          <LanguageSelector>
            <DropdownButton 
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <FiGlobe /> {getCurrentLanguageName()}
            </DropdownButton>
            <AnimatePresence>
              {showLanguageDropdown && (
                <DropdownMenu
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ maxHeight: '200px', overflowY: 'auto' }}
                >
                  {supportedLanguages.map((lang) => (
                    <DropdownItem
                      key={lang.code}
                      as="button"
                      onClick={() => {
                        changeLanguage(lang.code);
                        setShowLanguageDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {lang.nativeName}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              )}
            </AnimatePresence>
          </LanguageSelector>

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <NotificationButton onClick={() => navigate('/notifications')}>
                <FiBell />
                {notificationCount > 0 && (
                  <span className="notification-badge">{notificationCount}</span>
                )}
              </NotificationButton>

              {/* User Dropdown */}
              <DropdownContainer>
                <DropdownButton 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  <FiUser /> {user?.name || 'User'} <FiChevronDown />
                </DropdownButton>
                <AnimatePresence>
                  {showUserDropdown && (
                    <DropdownMenu
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <DropdownItem to="/profile">
                        <FiUser style={{ marginRight: '8px' }} />
                        {t('nav.profile')}
                      </DropdownItem>
                      <DropdownItem to="/settings">
                        <FiSettings style={{ marginRight: '8px' }} />
                        {t('nav.settings')}
                      </DropdownItem>
                      <DropdownItem
                        as="button"
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <FiLogOut style={{ marginRight: '8px' }} />
                        {t('nav.logout')}
                      </DropdownItem>
                    </DropdownMenu>
                  )}
                </AnimatePresence>
              </DropdownContainer>
            </>
          ) : (
            <AuthButtons>
              <AuthButton to="/auth" className="btn-outline">
                {t('nav.login')}
              </AuthButton>
              <AuthButton to="/auth" className="btn-primary">
                {t('nav.signup')}
              </AuthButton>
            </AuthButtons>
          )}

          <MobileMenuButton onClick={() => setShowMobileMenu(!showMobileMenu)}>
            {showMobileMenu ? <FiX /> : <FiMenu />}
          </MobileMenuButton>
        </UserMenu>

        <AnimatePresence>
          {showMobileMenu && (
            <MobileMenu
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Main Navigation */}
              <MobileNavSection>
                <h4>Main Menu</h4>
                <MobileNavLink to="/" onClick={() => setShowMobileMenu(false)}>
                  <FiHome />
                  Home
                </MobileNavLink>
                <MobileNavLink to="/dashboard" onClick={() => setShowMobileMenu(false)}>
                  {t('nav.dashboard')}
                </MobileNavLink>
                <MobileNavLink to="/compliance" onClick={() => setShowMobileMenu(false)}>
                  {t('nav.compliance')}
                </MobileNavLink>
                <MobileNavLink to="/learning" onClick={() => setShowMobileMenu(false)}>
                  {t('nav.learning')}
                </MobileNavLink>
                <MobileNavLink to="/risk-assessment" onClick={() => setShowMobileMenu(false)}>
                  {t('nav.riskAssessment')}
                </MobileNavLink>
                <MobileNavLink to="/raise-alert" onClick={() => setShowMobileMenu(false)}>
                  {t('nav.raiseAlert')}
                </MobileNavLink>
                <MobileNavLink to="/farm-management" onClick={() => setShowMobileMenu(false)}>
                  Farm Management
                </MobileNavLink>
                <MobileNavLink to="/weather" onClick={() => setShowMobileMenu(false)}>
                  <FiCloud style={{ marginRight: '8px' }} />
                  Weather Dashboard
                </MobileNavLink>
                <MobileNavLink to="/notifications" onClick={() => setShowMobileMenu(false)}>
                  <FiBell style={{ marginRight: '8px' }} />
                  {t('nav.notifications')} {notificationCount > 0 && `(${notificationCount})`}
                </MobileNavLink>
              </MobileNavSection>

              {/* Other Links */}
              <MobileNavSection>
                <h4>Other</h4>
                <MobileNavLink to="/faq" onClick={() => setShowMobileMenu(false)}>
                  {t('nav.faq')}
                </MobileNavLink>
                <MobileNavLink to="/privacy" onClick={() => setShowMobileMenu(false)}>
                  {t('nav.privacy')}
                </MobileNavLink>
                <MobileNavLink to="/settings" onClick={() => setShowMobileMenu(false)}>
                  {t('nav.settings')}
                </MobileNavLink>
                <MobileNavLink to="/feedback" onClick={() => setShowMobileMenu(false)}>
                  {t('nav.feedback')}
                </MobileNavLink>
                <MobileNavLink to="/contact-vet" onClick={() => setShowMobileMenu(false)}>
                  {t('nav.contactVet')}
                </MobileNavLink>
                <MobileNavLink to="/contact-us" onClick={() => setShowMobileMenu(false)}>
                  {t('nav.contactUs')}
                </MobileNavLink>
              </MobileNavSection>

              {/* Language Selector */}
              <MobileNavSection>
                <h4>Language / भाषा</h4>
                <MobileLanguageSelector>
                  <select
                    value={currentLanguage}
                    onChange={(e) => {
                      changeLanguage(e.target.value);
                      setShowMobileMenu(false);
                    }}
                  >
                    {supportedLanguages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.nativeName} ({lang.name})
                      </option>
                    ))}
                  </select>
                </MobileLanguageSelector>
              </MobileNavSection>

              {/* User Section */}
              {isAuthenticated ? (
                <MobileUserSection>
                  <h4>{user?.name || 'User'}</h4>
                  <MobileNavLink to="/profile" onClick={() => setShowMobileMenu(false)}>
                    <FiUser style={{ marginRight: '8px' }} />
                    {t('nav.profile')}
                  </MobileNavLink>
                  <MobileNavButton
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                  >
                    <FiLogOut style={{ marginRight: '8px' }} />
                    {t('nav.logout')}
                  </MobileNavButton>
                </MobileUserSection>
              ) : (
                <MobileUserSection>
                  <h4>Account</h4>
                  <MobileNavLink to="/auth" onClick={() => setShowMobileMenu(false)}>
                    {t('nav.login')}
                  </MobileNavLink>
                  <MobileNavLink to="/auth" onClick={() => setShowMobileMenu(false)}>
                    {t('nav.signup')}
                  </MobileNavLink>
                </MobileUserSection>
              )}
            </MobileMenu>
          )}
        </AnimatePresence>
      </NavContent>
      
      {/* Others Dropdown - positioned below Others button */}
      {showOthersDropdown && (() => {
        const position = getOthersButtonPosition();
        return (
          <div style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            minWidth: '200px',
            padding: '8px 0',
            zIndex: 1001
          }}>
          <Link to="/learning" onClick={() => setShowOthersDropdown(false)} style={{display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#333', fontSize: '14px', transition: 'all 0.2s ease'}} onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8f9fa'; e.target.style.color = 'var(--primary-coral)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#333'; }}>Learning</Link>
          <Link to="/farm-management" onClick={() => setShowOthersDropdown(false)} style={{display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#333', fontSize: '14px', transition: 'all 0.2s ease'}} onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8f9fa'; e.target.style.color = 'var(--primary-coral)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#333'; }}>Farm Management</Link>
          <Link to="/weather" onClick={() => setShowOthersDropdown(false)} style={{display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#333', fontSize: '14px', transition: 'all 0.2s ease'}} onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8f9fa'; e.target.style.color = 'var(--primary-coral)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#333'; }}>Weather Dashboard</Link>
          <Link to="/faq" onClick={() => setShowOthersDropdown(false)} style={{display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#333', fontSize: '14px', transition: 'all 0.2s ease'}} onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8f9fa'; e.target.style.color = 'var(--primary-coral)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#333'; }}>FAQ</Link>
          <Link to="/privacy" onClick={() => setShowOthersDropdown(false)} style={{display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#333', fontSize: '14px', transition: 'all 0.2s ease'}} onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8f9fa'; e.target.style.color = 'var(--primary-coral)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#333'; }}>Privacy</Link>
          <Link to="/settings" onClick={() => setShowOthersDropdown(false)} style={{display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#333', fontSize: '14px', transition: 'all 0.2s ease'}} onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8f9fa'; e.target.style.color = 'var(--primary-coral)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#333'; }}>Settings</Link>
          <Link to="/feedback" onClick={() => setShowOthersDropdown(false)} style={{display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#333', fontSize: '14px', transition: 'all 0.2s ease'}} onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8f9fa'; e.target.style.color = 'var(--primary-coral)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#333'; }}>Feedback</Link>
          <Link to="/contact-vet" onClick={() => setShowOthersDropdown(false)} style={{display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#333', fontSize: '14px', transition: 'all 0.2s ease'}} onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8f9fa'; e.target.style.color = 'var(--primary-coral)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#333'; }}>Contact Vet</Link>
          <Link to="/contact-us" onClick={() => setShowOthersDropdown(false)} style={{display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#333', fontSize: '14px', transition: 'all 0.2s ease'}} onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8f9fa'; e.target.style.color = 'var(--primary-coral)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#333'; }}>Contact Us</Link>
          </div>
        );
      })()}
    </NavbarContainer>
  );
};

export default Navbar;