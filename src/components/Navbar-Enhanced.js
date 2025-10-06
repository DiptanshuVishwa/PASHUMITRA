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
import T from './T'; // Import our universal translation component
import logo from '../assets/logo.png';

// All your existing styled components remain the same...
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
  
  @media (max-width: 768px) {
    img {
      height: 32px;
      width: 32px;
      margin-right: 6px;
    }
    
    .logo-text {
      font-size: 16px;
      line-height: 1;
    }
    
    .tagline {
      display: none;
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
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const LanguageSelector = styled.div`
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
  gap: 8px;
  align-items: center;
`;

const AuthButton = styled(Link)`
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &.btn-outline {
    color: var(--primary-coral);
    border: 1px solid var(--primary-coral);
    
    &:hover {
      background-color: var(--primary-coral);
      color: white;
    }
  }
  
  &.btn-primary {
    background-color: var(--primary-coral);
    color: white;
    
    &:hover {
      background-color: #FF6A35;
    }
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  color: #333;
  cursor: pointer;
  padding: 4px;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { currentLanguage, supportedLanguages, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [notificationCount] = useState(3);
  
  const userDropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowUserDropdown(false);
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setShowUserDropdown(false);
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
            <span className="logo-text">
              <T>PashuMitra</T>
            </span>
            <span className="tagline">
              <T>YOUR PARTNER IN FARM PROTECTION</T>
            </span>
          </div>
        </Logo>

        <NavLinks>
          <NavLink to="/" title="Home">
            <FiHome /> <T>Home</T>
          </NavLink>
          <NavLink to="/dashboard">
            <T>Dashboard</T>
          </NavLink>
          <NavLink to="/compliance">
            <T>Compliance</T>
          </NavLink>
          <NavLink to="/risk-assessment">
            <T>Risk Assessment</T>
          </NavLink>
          <NavLink to="/raise-alert">
            <T>Raise an Alert</T>
          </NavLink>
          
          <DropdownButton>
            <T>Others</T> <FiChevronDown />
          </DropdownButton>
        </NavLinks>

        <UserMenu>
          {/* Language Selector */}
          <LanguageSelector ref={languageDropdownRef}>
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
              <DropdownButton onClick={() => navigate('/notifications')}>
                <FiBell />
                {notificationCount > 0 && (
                  <span style={{ 
                    backgroundColor: '#ff4444', 
                    color: 'white', 
                    borderRadius: '50%', 
                    padding: '2px 6px',
                    fontSize: '10px',
                    marginLeft: '4px'
                  }}>
                    {notificationCount}
                  </span>
                )}
              </DropdownButton>

              {/* User Dropdown */}
              <LanguageSelector ref={userDropdownRef}>
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
                      <DropdownItem to="/profile" onClick={() => setShowUserDropdown(false)}>
                        <FiUser style={{ marginRight: '8px' }} />
                        <T>Profile</T>
                      </DropdownItem>
                      <DropdownItem to="/settings" onClick={() => setShowUserDropdown(false)}>
                        <FiSettings style={{ marginRight: '8px' }} />
                        <T>Settings</T>
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
                        <T>Logout</T>
                      </DropdownItem>
                    </DropdownMenu>
                  )}
                </AnimatePresence>
              </LanguageSelector>
            </>
          ) : (
            <AuthButtons>
              <AuthButton to="/auth" className="btn-outline">
                <T>Login</T>
              </AuthButton>
              <AuthButton to="/auth" className="btn-primary">
                <T>Sign Up</T>
              </AuthButton>
            </AuthButtons>
          )}

          <MobileMenuButton onClick={() => setShowMobileMenu(!showMobileMenu)}>
            {showMobileMenu ? <FiX /> : <FiMenu />}
          </MobileMenuButton>
        </UserMenu>
      </NavContent>
    </NavbarContainer>
  );
};

export default Navbar;