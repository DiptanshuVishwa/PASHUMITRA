import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiSettings, 
  FiUser, 
  FiBell, 
  FiShield, 
  FiGlobe, 
  FiSun,
  FiMail,
  FiEye,
  FiSave,
  FiRotateCcw,
  FiTrash2,
  FiDownload,
  FiAlertTriangle
} from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

const SettingsContainer = styled.div`
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  min-height: calc(100vh - 80px);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
    font-size: 2.5rem;
    color: var(--dark-gray);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    
    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }
  
  .settings-icon {
    color: var(--primary-coral);
    font-size: 2.5rem;
  }
  
  p {
    font-size: 1.2rem;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
    
    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 30px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 200px 1fr;
    gap: 20px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const SettingsSidebar = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  height: fit-content;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const SidebarNav = styled.nav`
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 8px;
    font-weight: 500;
    
    &:hover {
      background: rgba(255, 127, 80, 0.1);
      color: var(--primary-coral);
    }
    
    &.active {
      background: var(--primary-coral);
      color: white;
    }
    
    .nav-icon {
      font-size: 18px;
    }
  }
`;

const SettingsContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  
  .section-icon {
    color: var(--primary-coral);
    font-size: 24px;
  }
  
  h2 {
    color: var(--dark-gray);
    font-size: 1.5rem;
    margin: 0;
  }
`;

const SettingGroup = styled.div`
  margin-bottom: 30px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const GroupTitle = styled.h3`
  color: var(--dark-gray);
  font-size: 1.1rem;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  .setting-info {
    flex: 1;
    margin-right: 20px;
    
    .setting-label {
      font-weight: 600;
      color: var(--dark-gray);
      margin-bottom: 4px;
    }
    
    .setting-desc {
      font-size: 14px;
      color: #666;
      line-height: 1.4;
    }
  }
`;

const Toggle = styled.button`
  position: relative;
  width: 50px;
  height: 26px;
  background: ${props => props.checked ? 'var(--primary-coral)' : '#ccc'};
  border: none;
  border-radius: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    background: white;
    border-radius: 50%;
    top: 2px;
    left: ${props => props.checked ? '26px' : '2px'};
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: var(--dark-gray);
  font-size: 14px;
  min-width: 150px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--primary-coral);
  }
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-coral);
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &.primary {
    background: var(--primary-coral);
    color: white;
    
    &:hover {
      background: #FF6A35;
      transform: translateY(-1px);
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
  
  &.danger {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
      transform: translateY(-1px);
    }
  }
`;

const ActionSection = styled.div`
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #f0f0f0;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const DangerZone = styled.div`
  background: rgba(220, 53, 69, 0.05);
  border: 2px solid rgba(220, 53, 69, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-top: 30px;
  
  .danger-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #dc3545;
    font-weight: 600;
    margin-bottom: 12px;
  }
  
  .danger-desc {
    color: #666;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 16px;
  }
`;

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('notifications');
  const { currentLanguage, supportedLanguages, changeLanguage } = useLanguage();
  
  // Settings state
  const [settings, setSettings] = useState({
    // Notification settings
    emailAlerts: true,
    smsAlerts: true,
    pushNotifications: true,
    emergencyAlerts: true,
    complianceReminders: true,
    weeklyReports: false,
    marketingEmails: false,
    
    // Privacy settings
    profileVisibility: 'private',
    dataSharing: false,
    analyticsTracking: true,
    locationTracking: true,
    
    // Appearance settings
    theme: 'light',
    language: currentLanguage,
    soundEffects: true,
    
    // System settings
    autoSave: true,
    offlineMode: false,
    dataBackup: true
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    if (key === 'language') {
      changeLanguage(value);
    }
  };

  const sections = [
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'privacy', label: 'Privacy', icon: FiShield },
    { id: 'appearance', label: 'Appearance', icon: FiSun },
    { id: 'system', label: 'System', icon: FiSettings }
  ];


  const renderNotificationSettings = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SectionHeader>
        <FiBell className="section-icon" />
        <h2>Notification Settings</h2>
      </SectionHeader>

      <SettingGroup>
        <GroupTitle><FiAlertTriangle /> Critical Alerts</GroupTitle>
        
        <SettingItem>
          <div className="setting-info">
            <div className="setting-label">Emergency Alerts</div>
            <div className="setting-desc">Disease outbreaks and urgent biosecurity warnings</div>
          </div>
          <Toggle 
            checked={settings.emergencyAlerts}
            onClick={() => updateSetting('emergencyAlerts', !settings.emergencyAlerts)}
          />
        </SettingItem>

        <SettingItem>
          <div className="setting-info">
            <div className="setting-label">Compliance Reminders</div>
            <div className="setting-desc">License renewals and regulatory deadlines</div>
          </div>
          <Toggle 
            checked={settings.complianceReminders}
            onClick={() => updateSetting('complianceReminders', !settings.complianceReminders)}
          />
        </SettingItem>
      </SettingGroup>

      <SettingGroup>
        <GroupTitle><FiMail /> Delivery Methods</GroupTitle>
        
        <SettingItem>
          <div className="setting-info">
            <div className="setting-label">Email Alerts</div>
            <div className="setting-desc">Receive notifications via email</div>
          </div>
          <Toggle 
            checked={settings.emailAlerts}
            onClick={() => updateSetting('emailAlerts', !settings.emailAlerts)}
          />
        </SettingItem>

        <SettingItem>
          <div className="setting-info">
            <div className="setting-label">SMS Alerts</div>
            <div className="setting-desc">Receive critical alerts via text message</div>
          </div>
          <Toggle 
            checked={settings.smsAlerts}
            onClick={() => updateSetting('smsAlerts', !settings.smsAlerts)}
          />
        </SettingItem>

        <SettingItem>
          <div className="setting-info">
            <div className="setting-label">Push Notifications</div>
            <div className="setting-desc">Browser and mobile app notifications</div>
          </div>
          <Toggle 
            checked={settings.pushNotifications}
            onClick={() => updateSetting('pushNotifications', !settings.pushNotifications)}
          />
        </SettingItem>
      </SettingGroup>

      <SettingGroup>
        <GroupTitle>Optional Communications</GroupTitle>
        
        <SettingItem>
          <div className="setting-info">
            <div className="setting-label">Weekly Reports</div>
            <div className="setting-desc">Summary of farm activities and alerts</div>
          </div>
          <Toggle 
            checked={settings.weeklyReports}
            onClick={() => updateSetting('weeklyReports', !settings.weeklyReports)}
          />
        </SettingItem>

        <SettingItem>
          <div className="setting-info">
            <div className="setting-label">Marketing Emails</div>
            <div className="setting-desc">Product updates and feature announcements</div>
          </div>
          <Toggle 
            checked={settings.marketingEmails}
            onClick={() => updateSetting('marketingEmails', !settings.marketingEmails)}
          />
        </SettingItem>
      </SettingGroup>
    </motion.div>
  );

  const renderPrivacySettings = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SectionHeader>
        <FiShield className="section-icon" />
        <h2>Privacy & Security</h2>
      </SectionHeader>

      <SettingGroup>
        <GroupTitle><FiEye /> Profile Visibility</GroupTitle>
        
        <SettingItem>
          <div className="setting-info">
            <div className="setting-label">Profile Visibility</div>
            <div className="setting-desc">Control who can see your profile information</div>
          </div>
          <Select 
            value={settings.profileVisibility}
            onChange={(e) => updateSetting('profileVisibility', e.target.value)}
          >
            <option value="public">Public</option>
            <option value="network">Network Only</option>
            <option value="private">Private</option>
          </Select>
        </SettingItem>

        <SettingItem>
          <div className="setting-info">
            <div className="setting-label">Data Sharing</div>
            <div className="setting-desc">Share anonymized data for research purposes</div>
          </div>
          <Toggle 
            checked={settings.dataSharing}
            onClick={() => updateSetting('dataSharing', !settings.dataSharing)}
          />
        </SettingItem>
      </SettingGroup>

      <SettingGroup>
        <GroupTitle>Tracking & Analytics</GroupTitle>
        
        <SettingItem>
          <div className="setting-info">
            <div className="setting-label">Analytics Tracking</div>
            <div className="setting-desc">Help improve our service with usage analytics</div>
          </div>
          <Toggle 
            checked={settings.analyticsTracking}
            onClick={() => updateSetting('analyticsTracking', !settings.analyticsTracking)}
          />
        </SettingItem>

        <SettingItem>
          <div className="setting-info">
            <div className="setting-label">Location Tracking</div>
            <div className="setting-desc">Use location for regional alerts and weather</div>
          </div>
          <Toggle 
            checked={settings.locationTracking}
            onClick={() => updateSetting('locationTracking', !settings.locationTracking)}
          />
        </SettingItem>
      </SettingGroup>
    </motion.div>
  );

  const renderAppearanceSettings = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SectionHeader>
        <FiSun className="section-icon" />
        <h2>Appearance & Language</h2>
      </SectionHeader>

      <SettingGroup>
        <GroupTitle>Visual Preferences</GroupTitle>
        
        <SettingItem>
          <div className="setting-info">
            <div className="setting-label">Theme</div>
            <div className="setting-desc">Choose between light and dark themes</div>
          </div>
          <Select 
            value={settings.theme}
            onChange={(e) => updateSetting('theme', e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </Select>
        </SettingItem>

        <SettingItem>
          <div className="setting-info">
            <div className="setting-label">Sound Effects</div>
            <div className="setting-desc">Play sounds for notifications and interactions</div>
          </div>
          <Toggle 
            checked={settings.soundEffects}
            onClick={() => updateSetting('soundEffects', !settings.soundEffects)}
          />
        </SettingItem>
      </SettingGroup>

      <SettingGroup>
        <GroupTitle><FiGlobe /> Language & Localization</GroupTitle>
        
        <SettingItem>
          <div className="setting-info">
            <div className="setting-label">Interface Language</div>
            <div className="setting-desc">Choose your preferred language</div>
          </div>
          <Select 
            value={settings.language}
            onChange={(e) => updateSetting('language', e.target.value)}
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeName} ({lang.name})
              </option>
            ))}
          </Select>
        </SettingItem>
      </SettingGroup>
    </motion.div>
  );

  const renderSystemSettings = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SectionHeader>
        <FiSettings className="section-icon" />
        <h2>System Settings</h2>
      </SectionHeader>

      <SettingGroup>
        <GroupTitle>Data Management</GroupTitle>
        
        <SettingItem>
          <div className="setting-info">
            <div className="setting-label">Auto Save</div>
            <div className="setting-desc">Automatically save changes as you work</div>
          </div>
          <Toggle 
            checked={settings.autoSave}
            onClick={() => updateSetting('autoSave', !settings.autoSave)}
          />
        </SettingItem>

        <SettingItem>
          <div className="setting-info">
            <div className="setting-label">Data Backup</div>
            <div className="setting-desc">Regular backups of your farm data</div>
          </div>
          <Toggle 
            checked={settings.dataBackup}
            onClick={() => updateSetting('dataBackup', !settings.dataBackup)}
          />
        </SettingItem>

        <SettingItem>
          <div className="setting-info">
            <div className="setting-label">Offline Mode</div>
            <div className="setting-desc">Access basic features without internet</div>
          </div>
          <Toggle 
            checked={settings.offlineMode}
            onClick={() => updateSetting('offlineMode', !settings.offlineMode)}
          />
        </SettingItem>
      </SettingGroup>

      <DangerZone>
        <div className="danger-title">
          <FiAlertTriangle />
          Danger Zone
        </div>
        <div className="danger-desc">
          These actions are permanent and cannot be undone. Please proceed with caution.
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button className="danger">
            <FiDownload />
            Export Data
          </Button>
          <Button className="danger">
            <FiTrash2 />
            Delete Account
          </Button>
        </div>
      </DangerZone>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'notifications': return renderNotificationSettings();
      case 'privacy': return renderPrivacySettings();
      case 'appearance': return renderAppearanceSettings();
      case 'system': return renderSystemSettings();
      default: return renderNotificationSettings();
    }
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      setSettings({
        ...settings,
        emailAlerts: true,
        smsAlerts: true,
        emergencyAlerts: true,
        theme: 'light',
        soundEffects: true,
        autoSave: true
      });
    }
  };

  return (
    <SettingsContainer>
      <Header>
        <h1>
          <FiSettings className="settings-icon" />
          Settings
        </h1>
        <p>
          Customize your PashuMitra experience with personalized preferences and security controls.
        </p>
      </Header>

      <SettingsGrid>
        <SettingsSidebar>
          <SidebarNav>
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.id}
                  className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon className="nav-icon" />
                  {section.label}
                </div>
              );
            })}
          </SidebarNav>
        </SettingsSidebar>

        <SettingsContent>
          {renderContent()}
          
          <ActionSection>
            <Button className="primary" onClick={handleSaveSettings}>
              <FiSave />
              Save Changes
            </Button>
            <Button className="secondary" onClick={handleResetSettings}>
              <FiRotateCcw />
              Reset to Default
            </Button>
          </ActionSection>
        </SettingsContent>
      </SettingsGrid>
    </SettingsContainer>
  );
};

export default SettingsPage;