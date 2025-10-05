import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiEdit3,
  FiSave,
  FiMapPin,
  FiPhone,
  FiMail,
  FiHome,
  FiUsers,
  FiCalendar,
  FiSettings,
  FiCamera,
  FiX
} from 'react-icons/fi';

const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  min-height: calc(100vh - 80px);
`;

const ProfileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }
  
  .header-left {
    h1 {
      font-size: 2.5rem;
      color: var(--dark-gray);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .profile-icon {
      color: var(--primary-coral);
      font-size: 2.5rem;
    }
    
    p {
      color: #666;
      font-size: 1.1rem;
    }
  }
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  
  .card-title {
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--dark-gray);
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .card-icon {
    color: var(--primary-coral);
    font-size: 20px;
  }
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  
  .avatar-container {
    position: relative;
    margin-bottom: 20px;
  }
  
  .avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-coral), #FF6A35);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    color: white;
    font-weight: 700;
    border: 4px solid white;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
  
  .avatar-upload {
    position: absolute;
    bottom: 5px;
    right: 5px;
    width: 36px;
    height: 36px;
    background: var(--primary-coral);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    border: 3px solid white;
    transition: all 0.3s ease;
    
    &:hover {
      background: #FF6A35;
      transform: scale(1.1);
    }
  }
  
  .farmer-name {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--dark-gray);
    margin-bottom: 8px;
  }
  
  .farmer-id {
    color: #666;
    font-size: 14px;
    background: #f8f9fa;
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: 500;
  }
`;

const InfoSection = styled.div`
  .info-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .info-icon {
    color: var(--primary-coral);
    font-size: 18px;
    min-width: 18px;
  }
  
  .info-content {
    flex: 1;
    
    .info-label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .info-value {
      color: var(--dark-gray);
      font-weight: 500;
    }
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  &.full-width {
    grid-column: 1 / -1;
  }
  
  .label {
    display: block;
    font-weight: 600;
    color: var(--dark-gray);
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  .required {
    color: #dc3545;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
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
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  background: white;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary-coral);
    box-shadow: 0 0 0 3px rgba(255, 127, 80, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary-coral);
    box-shadow: 0 0 0 3px rgba(255, 127, 80, 0.1);
  }
`;

const ActionButton = styled(motion.button)`
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &.primary {
    background: var(--primary-coral);
    color: white;
    
    &:hover {
      background: #FF6A35;
      transform: translateY(-2px);
    }
  }
  
  &.secondary {
    background: #f8f9fa;
    color: var(--dark-gray);
    border: 2px solid #e0e0e0;
    
    &:hover {
      border-color: var(--primary-coral);
      color: var(--primary-coral);
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 30px;
  border-bottom: 2px solid #f0f0f0;
  
  @media (max-width: 768px) {
    overflow-x: auto;
  }
`;

const Tab = styled.button`
  padding: 16px 24px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.active ? 'var(--primary-coral)' : '#666'};
  border-bottom: 3px solid ${props => props.active ? 'var(--primary-coral)' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    color: var(--primary-coral);
  }
`;

const SettingsSection = styled.div`
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .setting-info {
    .setting-title {
      font-weight: 600;
      color: var(--dark-gray);
      margin-bottom: 4px;
    }
    
    .setting-description {
      color: #666;
      font-size: 14px;
    }
  }
  
  .toggle-switch {
    position: relative;
    width: 50px;
    height: 24px;
    background: ${props => props.enabled ? 'var(--primary-coral)' : '#ccc'};
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &::before {
      content: '';
      position: absolute;
      top: 2px;
      left: ${props => props.enabled ? '26px' : '2px'};
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: all 0.3s ease;
    }
  }
`;

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    // Personal Information
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '+91 9876543210',
    dateOfBirth: '1985-05-15',
    
    // Farm Details
    farmName: 'Kumar Poultry Farm',
    farmType: 'poultry',
    farmSize: '5',
    farmAddress: '123 Farm Road, Village Kothapeta',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    pincode: '530001',
    established: '2010',
    
    // Livestock Details
    totalAnimals: '500',
    animalTypes: 'Broiler Chickens, Layer Hens',
    
    // Settings
    emailNotifications: true,
    smsNotifications: false,
    alertNotifications: true,
    marketingEmails: false
  });

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values
  };

  const renderPersonalTab = () => (
    <ProfileCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="card-header">
        <div className="card-title">
          <FiUser className="card-icon" />
          Personal Information
        </div>
        <ActionButton
          className={isEditing ? 'secondary' : 'primary'}
          onClick={() => setIsEditing(!isEditing)}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          {isEditing ? <FiX /> : <FiEdit3 />}
          {isEditing ? 'Cancel' : 'Edit'}
        </ActionButton>
      </div>

      <FormGrid>
        <FormGroup>
          <label className="label">First Name <span className="required">*</span></label>
          <Input
            type="text"
            value={profileData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            disabled={!isEditing}
          />
        </FormGroup>
        
        <FormGroup>
          <label className="label">Last Name <span className="required">*</span></label>
          <Input
            type="text"
            value={profileData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            disabled={!isEditing}
          />
        </FormGroup>
        
        <FormGroup>
          <label className="label">Email Address <span className="required">*</span></label>
          <Input
            type="email"
            value={profileData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={!isEditing}
          />
        </FormGroup>
        
        <FormGroup>
          <label className="label">Phone Number <span className="required">*</span></label>
          <Input
            type="tel"
            value={profileData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={!isEditing}
          />
        </FormGroup>
        
        <FormGroup>
          <label className="label">Date of Birth</label>
          <Input
            type="date"
            value={profileData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            disabled={!isEditing}
          />
        </FormGroup>
      </FormGrid>

      {isEditing && (
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <ActionButton className="secondary" onClick={handleCancel}>
            <FiX /> Cancel
          </ActionButton>
          <ActionButton className="primary" onClick={handleSave}>
            <FiSave /> Save Changes
          </ActionButton>
        </div>
      )}
    </ProfileCard>
  );

  const renderFarmTab = () => (
    <ProfileCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="card-header">
        <div className="card-title">
          <FiHome className="card-icon" />
          Farm Details
        </div>
        <ActionButton
          className={isEditing ? 'secondary' : 'primary'}
          onClick={() => setIsEditing(!isEditing)}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          {isEditing ? <FiX /> : <FiEdit3 />}
          {isEditing ? 'Cancel' : 'Edit'}
        </ActionButton>
      </div>

      <FormGrid>
        <FormGroup>
          <label className="label">Farm Name <span className="required">*</span></label>
          <Input
            type="text"
            value={profileData.farmName}
            onChange={(e) => handleInputChange('farmName', e.target.value)}
            disabled={!isEditing}
          />
        </FormGroup>
        
        <FormGroup>
          <label className="label">Farm Type <span className="required">*</span></label>
          <Select
            value={profileData.farmType}
            onChange={(e) => handleInputChange('farmType', e.target.value)}
            disabled={!isEditing}
          >
            <option value="poultry">Poultry</option>
            <option value="pig">Pig</option>
            <option value="cattle">Cattle</option>
            <option value="goat">Goat</option>
            <option value="mixed">Mixed</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <label className="label">Farm Size (Acres)</label>
          <Input
            type="number"
            value={profileData.farmSize}
            onChange={(e) => handleInputChange('farmSize', e.target.value)}
            disabled={!isEditing}
          />
        </FormGroup>
        
        <FormGroup>
          <label className="label">Year Established</label>
          <Input
            type="number"
            value={profileData.established}
            onChange={(e) => handleInputChange('established', e.target.value)}
            disabled={!isEditing}
            min="1950"
            max={new Date().getFullYear()}
          />
        </FormGroup>
        
        <FormGroup className="full-width">
          <label className="label">Farm Address <span className="required">*</span></label>
          <TextArea
            value={profileData.farmAddress}
            onChange={(e) => handleInputChange('farmAddress', e.target.value)}
            disabled={!isEditing}
            placeholder="Enter complete farm address"
          />
        </FormGroup>
        
        <FormGroup>
          <label className="label">City <span className="required">*</span></label>
          <Input
            type="text"
            value={profileData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            disabled={!isEditing}
          />
        </FormGroup>
        
        <FormGroup>
          <label className="label">State <span className="required">*</span></label>
          <Select
            value={profileData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            disabled={!isEditing}
          >
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Telangana">Telangana</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Kerala">Kerala</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <label className="label">PIN Code <span className="required">*</span></label>
          <Input
            type="text"
            value={profileData.pincode}
            onChange={(e) => handleInputChange('pincode', e.target.value)}
            disabled={!isEditing}
            maxLength="6"
          />
        </FormGroup>
        
        <FormGroup>
          <label className="label">Total Animals</label>
          <Input
            type="number"
            value={profileData.totalAnimals}
            onChange={(e) => handleInputChange('totalAnimals', e.target.value)}
            disabled={!isEditing}
          />
        </FormGroup>
        
        <FormGroup className="full-width">
          <label className="label">Animal Types</label>
          <Input
            type="text"
            value={profileData.animalTypes}
            onChange={(e) => handleInputChange('animalTypes', e.target.value)}
            disabled={!isEditing}
            placeholder="e.g., Broiler Chickens, Layer Hens"
          />
        </FormGroup>
      </FormGrid>

      {isEditing && (
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <ActionButton className="secondary" onClick={handleCancel}>
            <FiX /> Cancel
          </ActionButton>
          <ActionButton className="primary" onClick={handleSave}>
            <FiSave /> Save Changes
          </ActionButton>
        </div>
      )}
    </ProfileCard>
  );

  const renderSettingsTab = () => (
    <ProfileCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="card-header">
        <div className="card-title">
          <FiSettings className="card-icon" />
          Account Settings
        </div>
      </div>

      <SettingsSection>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">Email Notifications</div>
            <div className="setting-description">Receive alerts and updates via email</div>
          </div>
          <div 
            className="toggle-switch"
            enabled={profileData.emailNotifications}
            onClick={() => handleInputChange('emailNotifications', !profileData.emailNotifications)}
          />
        </div>
        
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">SMS Notifications</div>
            <div className="setting-description">Receive critical alerts via SMS</div>
          </div>
          <div 
            className="toggle-switch"
            enabled={profileData.smsNotifications}
            onClick={() => handleInputChange('smsNotifications', !profileData.smsNotifications)}
          />
        </div>
        
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">Push Notifications</div>
            <div className="setting-description">Receive browser notifications for urgent alerts</div>
          </div>
          <div 
            className="toggle-switch"
            enabled={profileData.alertNotifications}
            onClick={() => handleInputChange('alertNotifications', !profileData.alertNotifications)}
          />
        </div>
        
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">Marketing Emails</div>
            <div className="setting-description">Receive promotional offers and updates</div>
          </div>
          <div 
            className="toggle-switch"
            enabled={profileData.marketingEmails}
            onClick={() => handleInputChange('marketingEmails', !profileData.marketingEmails)}
          />
        </div>
      </SettingsSection>
      
      <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
        <ActionButton className="primary" onClick={handleSave}>
          <FiSave /> Save Settings
        </ActionButton>
      </div>
    </ProfileCard>
  );

  return (
    <ProfileContainer>
      <ProfileHeader>
        <div className="header-left">
          <h1>
            <FiUser className="profile-icon" />
            My Profile
          </h1>
          <p>Manage your personal information, farm details, and account settings</p>
        </div>
      </ProfileHeader>

      <ProfileGrid>
        {/* Profile Summary Card */}
        <ProfileCard
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AvatarSection>
            <div className="avatar-container">
              <div className="avatar">
                {profileData.firstName[0]}{profileData.lastName[0]}
              </div>
              <div className="avatar-upload">
                <FiCamera />
              </div>
            </div>
            <div className="farmer-name">
              {profileData.firstName} {profileData.lastName}
            </div>
            <div className="farmer-id">
              Farmer ID: FM-2024-001
            </div>
          </AvatarSection>

          <InfoSection>
            <div className="info-item">
              <FiMail className="info-icon" />
              <div className="info-content">
                <div className="info-label">Email</div>
                <div className="info-value">{profileData.email}</div>
              </div>
            </div>
            
            <div className="info-item">
              <FiPhone className="info-icon" />
              <div className="info-content">
                <div className="info-label">Phone</div>
                <div className="info-value">{profileData.phone}</div>
              </div>
            </div>
            
            <div className="info-item">
              <FiHome className="info-icon" />
              <div className="info-content">
                <div className="info-label">Farm</div>
                <div className="info-value">{profileData.farmName}</div>
              </div>
            </div>
            
            <div className="info-item">
              <FiMapPin className="info-icon" />
              <div className="info-content">
                <div className="info-label">Location</div>
                <div className="info-value">{profileData.city}, {profileData.state}</div>
              </div>
            </div>
            
            <div className="info-item">
              <FiUsers className="info-icon" />
              <div className="info-content">
                <div className="info-label">Animals</div>
                <div className="info-value">{profileData.totalAnimals} {profileData.farmType}</div>
              </div>
            </div>
            
            <div className="info-item">
              <FiCalendar className="info-icon" />
              <div className="info-content">
                <div className="info-label">Member Since</div>
                <div className="info-value">January 2024</div>
              </div>
            </div>
          </InfoSection>
        </ProfileCard>

        {/* Main Content Area */}
        <div>
          <TabContainer>
            <Tab
              active={activeTab === 'personal'}
              onClick={() => setActiveTab('personal')}
            >
              Personal Info
            </Tab>
            <Tab
              active={activeTab === 'farm'}
              onClick={() => setActiveTab('farm')}
            >
              Farm Details
            </Tab>
            <Tab
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </Tab>
          </TabContainer>

          {activeTab === 'personal' && renderPersonalTab()}
          {activeTab === 'farm' && renderFarmTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>
      </ProfileGrid>
    </ProfileContainer>
  );
};

export default ProfilePage;