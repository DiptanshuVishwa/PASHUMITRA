import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/translations';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiEdit,
  FiSave,
  FiCamera
} from 'react-icons/fi';

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
`;

const ProfileHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
    font-size: 2.5rem;
    color: var(--dark-gray);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  
  .profile-icon {
    color: var(--primary-coral);
    font-size: 2.5rem;
  }
`;

const ProfileCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const ProfilePhotoSection = styled.div`
  text-align: center;
  margin-bottom: 40px;
  
  .photo-container {
    position: relative;
    width: 120px;
    height: 120px;
    margin: 0 auto 20px;
    
    .profile-photo {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-coral), #FF6A35);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      color: white;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
    
    .photo-edit {
      position: absolute;
      bottom: 0;
      right: 0;
      background: var(--primary-coral);
      color: white;
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      
      &:hover {
        background: #FF6A35;
        transform: scale(1.1);
      }
    }
  }
`;

const FormSection = styled.div`
  margin-bottom: 40px;
  
  h3 {
    font-size: 1.5rem;
    color: var(--dark-gray);
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f0f0f0;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`;

const FormGroup = styled.div`
  .form-label {
    display: block;
    color: var(--dark-gray);
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  .form-input {
    width: 100%;
    padding: 14px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    font-size: 16px;
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: var(--primary-coral);
      box-shadow: 0 0 0 3px rgba(255, 127, 80, 0.1);
    }
    
    &:disabled {
      background: #f8f9fa;
      color: #666;
      cursor: not-allowed;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 40px;
`;

const Button = styled.button`
  padding: 14px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &.primary {
    background: linear-gradient(135deg, var(--primary-coral), #FF6A35);
    color: white;
    border: none;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(255, 127, 80, 0.3);
    }
  }
  
  &.secondary {
    background: transparent;
    color: var(--dark-gray);
    border: 2px solid #e0e0e0;
    
    &:hover {
      border-color: var(--primary-coral);
      color: var(--primary-coral);
    }
  }
`;

const ProfilePage = () => {
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  
  // Create translation function using our central utility
  const t = (text) => getTranslation(text, currentLanguage);
  
  // Sample user data
  const [profileData, setProfileData] = useState({
    fullName: user?.name || 'राम शर्मा',
    email: user?.email || 'ram.sharma@example.com',
    phone: '+91 98765 43210',
    farmName: 'श्री कृष्णा डेयरी फार्म',
    farmSize: '50 एकड़',
    location: 'पुणे, महाराष्ट्र'
  });

  const handleSave = () => {
    // Save profile logic here
    setIsEditing(false);
    console.log('Profile saved:', profileData);
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <ProfileContainer>
      <ProfileHeader>
        <h1>
          <FiUser className="profile-icon" />
          {t('My Profile')}
        </h1>
      </ProfileHeader>

      <ProfileCard
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <ProfilePhotoSection>
          <div className="photo-container">
            <div className="profile-photo">
              <FiUser />
            </div>
            <button className="photo-edit">
              <FiCamera />
            </button>
          </div>
        </ProfilePhotoSection>

        <FormSection>
          <h3>{t('Personal Information')}</h3>
          <FormGrid>
            <FormGroup>
              <label className="form-label">{t('Full Name')}</label>
              <input
                type="text"
                className="form-input"
                value={profileData.fullName}
                disabled={!isEditing}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
              />
            </FormGroup>
            
            <FormGroup>
              <label className="form-label">{t('Email Address')}</label>
              <input
                type="email"
                className="form-input"
                value={profileData.email}
                disabled={!isEditing}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </FormGroup>
            
            <FormGroup>
              <label className="form-label">{t('Phone Number')}</label>
              <input
                type="tel"
                className="form-input"
                value={profileData.phone}
                disabled={!isEditing}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </FormGroup>
            
            <FormGroup>
              <label className="form-label">{t('Location')}</label>
              <input
                type="text"
                className="form-input"
                value={profileData.location}
                disabled={!isEditing}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </FormGroup>
          </FormGrid>
        </FormSection>

        <FormSection>
          <h3>{t('Farm Details')}</h3>
          <FormGrid>
            <FormGroup>
              <label className="form-label">{t('Farm Name')}</label>
              <input
                type="text"
                className="form-input"
                value={profileData.farmName}
                disabled={!isEditing}
                onChange={(e) => handleInputChange('farmName', e.target.value)}
              />
            </FormGroup>
            
            <FormGroup>
              <label className="form-label">{t('Farm Size')}</label>
              <input
                type="text"
                className="form-input"
                value={profileData.farmSize}
                disabled={!isEditing}
                onChange={(e) => handleInputChange('farmSize', e.target.value)}
              />
            </FormGroup>
          </FormGrid>
        </FormSection>

        <ButtonGroup>
          {!isEditing ? (
            <Button 
              className="primary" 
              onClick={() => setIsEditing(true)}
            >
              <FiEdit />
              {t('Edit Profile')}
            </Button>
          ) : (
            <>
              <Button 
                className="primary" 
                onClick={handleSave}
              >
                <FiSave />
                {t('Save Changes')}
              </Button>
              <Button 
                className="secondary" 
                onClick={() => setIsEditing(false)}
              >
                {t('Cancel')}
              </Button>
            </>
          )}
        </ButtonGroup>
      </ProfileCard>
    </ProfileContainer>
  );
};

export default ProfilePage;