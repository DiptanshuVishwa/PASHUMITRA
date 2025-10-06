import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
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
  FiX,
  FiLoader,
  FiAlertTriangle,
  FiEye,
  FiClock,
  FiCheckCircle
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { alertAPI } from '../services/api';
import toast from 'react-hot-toast';

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
    position: relative;
    overflow: hidden;
  }
  
  .rotating {
    animation: rotate 1s linear infinite;
  }
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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

const AlertsSection = styled.div`
  .alerts-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .filter-buttons {
    display: flex;
    gap: 8px;
  }
  
  .filter-btn {
    padding: 6px 12px;
    border: 1px solid #e0e0e0;
    background: white;
    border-radius: 20px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &.active {
      background: var(--primary-coral);
      color: white;
      border-color: var(--primary-coral);
    }
    
    &:hover:not(.active) {
      border-color: var(--primary-coral);
      color: var(--primary-coral);
    }
  }
  
  .alert-card {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    border-left: 4px solid;
    transition: all 0.3s ease;
    
    &.active {
      border-left-color: #28a745;
    }
    
    &.investigating {
      border-left-color: #ffc107;
    }
    
    &.resolved {
      border-left-color: #17a2b8;
    }
    
    &.closed {
      border-left-color: #6c757d;
    }
    
    &:hover {
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }
  }
  
  .alert-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }
  
  .alert-title {
    font-weight: 600;
    color: var(--dark-gray);
    margin-bottom: 4px;
    flex: 1;
  }
  
  .alert-status {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    
    &.active {
      background: rgba(40, 167, 69, 0.1);
      color: #28a745;
    }
    
    &.investigating {
      background: rgba(255, 193, 7, 0.1);
      color: #ffc107;
    }
    
    &.resolved {
      background: rgba(23, 162, 184, 0.1);
      color: #17a2b8;
    }
    
    &.closed {
      background: rgba(108, 117, 125, 0.1);
      color: #6c757d;
    }
  }
  
  .alert-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 12px;
    color: #666;
    margin-bottom: 8px;
  }
  
  .alert-description {
    color: #666;
    font-size: 14px;
    line-height: 1.4;
    margin-bottom: 12px;
  }
  
  .alert-actions {
    display: flex;
    gap: 8px;
  }
  
  .alert-action-btn {
    padding: 6px 12px;
    border: 1px solid #e0e0e0;
    background: white;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: var(--primary-coral);
      color: var(--primary-coral);
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #666;
    
    .empty-icon {
      font-size: 48px;
      color: #ccc;
      margin-bottom: 16px;
    }
    
    .empty-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .empty-description {
      font-size: 14px;
      line-height: 1.6;
    }
  }
`;

const ProfilePage = () => {
  const { user, updateProfile, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // My Alerts state
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertFilter, setAlertFilter] = useState('all'); // 'all', 'active', 'investigating', 'resolved', 'closed'
  
  // Generate farmer ID if user doesn't have one
  const getFarmerId = (user) => {
    if (user?.farmerId) return user.farmerId;
    if (user?.id) return `FM-${new Date().getFullYear()}-${user.id.slice(-3).toUpperCase()}`;
    return `FM-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
  };
  const [profileData, setProfileData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    
    // Farm Details
    farmName: '',
    farmType: 'poultry',
    farmSize: '',
    areaUnit: 'acres',
    farmAddress: '',
    city: '',
    state: '',
    pincode: '',
    established: '',
    pigCount: 0,
    poultryCount: 0,
    totalStaff: 1,
    hasVeterinarian: false,
    farmingPurpose: 'mixed',
    waterSource: 'borewell',
    hasInternet: false,
    
    // Livestock Details
    totalAnimals: '',
    animalTypes: '',
    
    // Settings
    emailNotifications: true,
    smsNotifications: false,
    alertNotifications: true,
    marketingEmails: false
  });

  // Handle URL parameters on component mount
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['personal', 'farm', 'my-alerts', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      console.log('Loading profile data from user:', user);
      console.log('User farm details:', user.farmDetails);
      
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      const farmDetails = user.farmDetails || {};
      
      setProfileData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        
        // Farm details from questionnaire
        farmName: farmDetails.name || user.farmLocation || '',
        farmType: farmDetails.type || 'poultry',
        farmSize: farmDetails.totalArea || '',
        areaUnit: farmDetails.areaUnit || 'acres',
        established: farmDetails.establishedYear || '',
        pigCount: farmDetails.animalCount?.pigs || 0,
        poultryCount: farmDetails.animalCount?.poultry || 0,
        totalStaff: farmDetails.totalStaff || 1,
        hasVeterinarian: farmDetails.hasVeterinarian || false,
        farmingPurpose: farmDetails.farmingPurpose || 'mixed',
        waterSource: farmDetails.waterSource || 'borewell',
        hasInternet: farmDetails.hasInternet || false,
        totalAnimals: (farmDetails.animalCount?.pigs || 0) + (farmDetails.animalCount?.poultry || 0) + (farmDetails.animalCount?.cattle || 0) + (farmDetails.animalCount?.others || 0),
        animalTypes: [
          farmDetails.animalCount?.pigs > 0 ? `${farmDetails.animalCount.pigs} Pigs` : '',
          farmDetails.animalCount?.poultry > 0 ? `${farmDetails.animalCount.poultry} Poultry` : '',
          farmDetails.animalCount?.cattle > 0 ? `${farmDetails.animalCount.cattle} Cattle` : '',
          farmDetails.animalCount?.others > 0 ? `${farmDetails.animalCount.others} Others` : ''
        ].filter(Boolean).join(', ') || '',
        
        // Use preferences if available
        emailNotifications: user.preferences?.notifications?.email ?? true,
        smsNotifications: user.preferences?.notifications?.sms ?? false,
        alertNotifications: user.preferences?.notifications?.push ?? true,
        
        // Set other fields from user data if available
        ...user.profile // This would contain additional profile fields if stored
      }));
    }
  }, [user]);

  // Fetch user's alerts when my-alerts tab is active
  useEffect(() => {
    if (activeTab === 'my-alerts' && user) {
      fetchUserAlerts();
    }
  }, [activeTab, user]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch user's alerts
  const fetchUserAlerts = async () => {
    setAlertsLoading(true);
    try {
      // Fetch alerts created by the current user
      const response = await alertAPI.getMyAlerts({ 
        reportedBy: user._id,
        page: 1,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      console.log('Fetched alerts:', response); // Debug log
      setAlerts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch user alerts:', error);
      toast.error('Failed to load your alerts');
    } finally {
      setAlertsLoading(false);
    }
  };

  // Filter alerts based on selected filter
  const filteredAlerts = alertFilter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.status === alertFilter);

  const handleSave = async () => {
    // Prevent multiple simultaneous save operations
    if (isLoading) {
      return;
    }
    
    setIsLoading(true);
    try {
      const updateData = {
        name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        phone: profileData.phone,
        farmLocation: profileData.farmName,
        preferences: {
          notifications: {
            email: profileData.emailNotifications,
            sms: profileData.smsNotifications,
            push: profileData.alertNotifications
          }
        },
        farmDetails: {
          name: profileData.farmName,
          type: profileData.farmType,
          totalArea: profileData.farmSize,
          areaUnit: profileData.areaUnit,
          establishedYear: profileData.established,
          animalCount: {
            pigs: parseInt(profileData.pigCount) || 0,
            poultry: parseInt(profileData.poultryCount) || 0,
            cattle: 0,
            others: 0
          },
          totalStaff: parseInt(profileData.totalStaff) || 1,
          hasVeterinarian: profileData.hasVeterinarian,
          farmingPurpose: profileData.farmingPurpose,
          waterSource: profileData.waterSource,
          hasInternet: profileData.hasInternet
        },
        profile: {
          dateOfBirth: profileData.dateOfBirth,
          farmType: profileData.farmType,
          farmSize: profileData.farmSize,
          farmAddress: profileData.farmAddress,
          city: profileData.city,
          state: profileData.state,
          pincode: profileData.pincode,
          established: profileData.established,
          totalAnimals: profileData.totalAnimals,
          animalTypes: profileData.animalTypes
        }
      };

      const result = await updateProfile(updateData);
      if (result.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Error updating profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to user data
    if (user) {
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      const farmDetails = user.farmDetails || {};
      
      setProfileData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        
        // Reset farm details to original values
        farmName: farmDetails.name || user.farmLocation || '',
        farmType: farmDetails.type || 'poultry',
        farmSize: farmDetails.totalArea || '',
        areaUnit: farmDetails.areaUnit || 'acres',
        established: farmDetails.establishedYear || '',
        pigCount: farmDetails.animalCount?.pigs || 0,
        poultryCount: farmDetails.animalCount?.poultry || 0,
        totalStaff: farmDetails.totalStaff || 1,
        hasVeterinarian: farmDetails.hasVeterinarian || false,
        farmingPurpose: farmDetails.farmingPurpose || 'mixed',
        waterSource: farmDetails.waterSource || 'borewell',
        hasInternet: farmDetails.hasInternet || false,
        
        emailNotifications: user.preferences?.notifications?.email ?? true,
        smsNotifications: user.preferences?.notifications?.sms ?? false,
        alertNotifications: user.preferences?.notifications?.push ?? true
      }));
    }
  };
  
  const handleAvatarUpload = () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      setIsLoading(true);
      
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('pashumitra_token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const response = await fetch(`${API_URL}/upload/avatar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
          toast.success('Avatar updated successfully!');
          
          // The backend already updates the user profile, so just refresh to show changes
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          throw new Error(result.message || 'Failed to upload avatar');
        }
        
      } catch (error) {
        console.error('Avatar upload error:', error);
        toast.error(error.message || 'Failed to upload avatar. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Trigger file selection
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
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
          <label className="label">Farm Name</label>
          <Input
            type="text"
            value={profileData.farmName}
            onChange={(e) => handleInputChange('farmName', e.target.value)}
            disabled={!isEditing}
            placeholder="Enter your farm name"
          />
        </FormGroup>
        
        <FormGroup>
          <label className="label">Farm Type</label>
          <Select
            value={profileData.farmType}
            onChange={(e) => handleInputChange('farmType', e.target.value)}
            disabled={!isEditing}
          >
            <option value="pig">Pig Farm</option>
            <option value="poultry">Poultry Farm</option>
            <option value="both">Both Pig and Poultry</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <label className="label">Farm Size</label>
          <Input
            type="number"
            value={profileData.farmSize}
            onChange={(e) => handleInputChange('farmSize', e.target.value)}
            disabled={!isEditing}
            placeholder="Enter farm area"
          />
        </FormGroup>
        
        <FormGroup>
          <label className="label">Area Unit</label>
          <Select
            value={profileData.areaUnit || 'acres'}
            onChange={(e) => handleInputChange('areaUnit', e.target.value)}
            disabled={!isEditing}
          >
            <option value="acres">Acres</option>
            <option value="hectares">Hectares</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <label className="label">Year Established</label>
          <Input
            type="number"
            value={profileData.established}
            onChange={(e) => handleInputChange('established', e.target.value)}
            disabled={!isEditing}
            min="1900"
            max={new Date().getFullYear()}
            placeholder="e.g., 2015"
          />
        </FormGroup>
        
        <FormGroup>
          <label className="label">Number of Pigs</label>
          <Input
            type="number"
            value={profileData.pigCount || 0}
            onChange={(e) => handleInputChange('pigCount', e.target.value)}
            disabled={!isEditing}
            min="0"
            placeholder="0"
          />
        </FormGroup>
        
        <FormGroup>
          <label className="label">Number of Poultry</label>
          <Input
            type="number"
            value={profileData.poultryCount || 0}
            onChange={(e) => handleInputChange('poultryCount', e.target.value)}
            disabled={!isEditing}
            min="0"
            placeholder="0"
          />
        </FormGroup>
        
        <FormGroup>
          <label className="label">Total Staff</label>
          <Input
            type="number"
            value={profileData.totalStaff || 1}
            onChange={(e) => handleInputChange('totalStaff', e.target.value)}
            disabled={!isEditing}
            min="1"
            placeholder="1"
          />
        </FormGroup>
        
        <FormGroup>
          <label className="label">Has Veterinarian Access</label>
          <Select
            value={profileData.hasVeterinarian ? 'yes' : 'no'}
            onChange={(e) => handleInputChange('hasVeterinarian', e.target.value === 'yes')}
            disabled={!isEditing}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <label className="label">Farming Purpose</label>
          <Select
            value={profileData.farmingPurpose || 'mixed'}
            onChange={(e) => handleInputChange('farmingPurpose', e.target.value)}
            disabled={!isEditing}
          >
            <option value="commercial">Commercial (for selling)</option>
            <option value="subsistence">Subsistence (for own use)</option>
            <option value="mixed">Both commercial and subsistence</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <label className="label">Water Source</label>
          <Select
            value={profileData.waterSource || 'borewell'}
            onChange={(e) => handleInputChange('waterSource', e.target.value)}
            disabled={!isEditing}
          >
            <option value="municipal">Municipal water supply</option>
            <option value="borewell">Borewell</option>
            <option value="well">Open well</option>
            <option value="river">River/stream</option>
            <option value="other">Other</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <label className="label">Internet Connectivity</label>
          <Select
            value={profileData.hasInternet ? 'yes' : 'no'}
            onChange={(e) => handleInputChange('hasInternet', e.target.value === 'yes')}
            disabled={!isEditing}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Select>
        </FormGroup>
      </FormGrid>
      
      {/* Biosecurity Score Section or Questionnaire Prompt */}
      {user?.farmDetails?.biosecurityScore ? (
        <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '16px', color: '#333' }}>Biosecurity Assessment</h4>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: user.farmDetails.biosecurityScore.percentage >= 70 ? '#28a745' : user.farmDetails.biosecurityScore.percentage >= 50 ? '#ffc107' : '#dc3545' }}>
                {Math.round(user.farmDetails.biosecurityScore.percentage)}%
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Biosecurity Score</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {user.farmDetails.biosecurityScore.total}/9
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Points Scored</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Assessment Level:</div>
              <div style={{ 
                padding: '4px 12px', 
                borderRadius: '16px', 
                fontSize: '12px', 
                fontWeight: 'bold',
                background: user.farmDetails.biosecurityScore.percentage >= 70 ? 'rgba(40, 167, 69, 0.1)' : user.farmDetails.biosecurityScore.percentage >= 50 ? 'rgba(255, 193, 7, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                color: user.farmDetails.biosecurityScore.percentage >= 70 ? '#28a745' : user.farmDetails.biosecurityScore.percentage >= 50 ? '#856404' : '#dc3545',
                display: 'inline-block'
              }}>
                {user.farmDetails.biosecurityScore.percentage >= 70 ? 'EXCELLENT' : user.farmDetails.biosecurityScore.percentage >= 50 ? 'GOOD' : 'NEEDS IMPROVEMENT'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '30px', padding: '20px', background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)', borderRadius: '8px', border: '1px solid #feb2b2' }}>
          <h4 style={{ marginBottom: '16px', color: '#c53030', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            Farm Details Incomplete
          </h4>
          <p style={{ color: '#744210', marginBottom: '16px' }}>
            Complete our farm questionnaire to set up your profile with farm details and biosecurity assessment.
          </p>
          <button
            onClick={() => window.location.href = '/questionnaire'}
            style={{
              background: 'var(--primary-coral)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#FF6A35'}
            onMouseOut={(e) => e.target.style.background = 'var(--primary-coral)'}
          >
            Complete Farm Questionnaire
          </button>
        </div>
      )}

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
        <ActionButton className="primary" onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <FiLoader className="rotating" /> Saving...
            </>
          ) : (
            <>
              <FiSave /> Save Settings
            </>
          )}
        </ActionButton>
      </div>
    </ProfileCard>
  );

  const renderMyAlertsTab = () => (
    <ProfileCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="card-header">
        <div className="card-title">
          <FiAlertTriangle className="card-icon" />
          My Alerts
        </div>
      </div>

      <AlertsSection>
        <div className="alerts-header">
          <div className="filter-buttons">
            {['all', 'active', 'investigating', 'resolved', 'closed'].map(filter => (
              <button
                key={filter}
                className={`filter-btn ${alertFilter === filter ? 'active' : ''}`}
                onClick={() => setAlertFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                {filter === 'all' ? ` (${alerts.length})` : ` (${alerts.filter(a => a.status === filter).length})`}
              </button>
            ))}
          </div>
        </div>

        {alertsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <FiLoader className="rotating" style={{ fontSize: '24px', marginBottom: '16px' }} />
            <div>Loading your alerts...</div>
          </div>
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => (
            <div key={alert._id} className={`alert-card ${alert.status}`}>
              <div className="alert-header">
                <div className="alert-title">{alert.title}</div>
                <div className={`alert-status ${alert.status}`}>{alert.status}</div>
              </div>
              
              <div className="alert-meta">
                <span>
                  <FiClock style={{ marginRight: '4px' }} />
                  {new Date(alert.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span>
                  <FiMapPin style={{ marginRight: '4px' }} />
                  {alert.location?.district || alert.location?.state || 'Location not specified'}
                </span>
                {alert.severity && (
                  <span style={{ 
                    color: alert.severity === 'critical' ? '#dc3545' : 
                           alert.severity === 'high' ? '#fd7e14' : 
                           alert.severity === 'medium' ? '#ffc107' : '#28a745'
                  }}>
                    {alert.severity.toUpperCase()} Priority
                  </span>
                )}
              </div>
              
              <div className="alert-description">
                {alert.description}
              </div>
              
              <div className="alert-actions">
                <button className="alert-action-btn">
                  <FiEye /> View Details
                </button>
                {alert.status === 'active' && (
                  <button className="alert-action-btn">
                    <FiEdit3 /> Update Status
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <FiAlertTriangle className="empty-icon" />
            <div className="empty-title">
              {alertFilter === 'all' ? 'No alerts found' : `No ${alertFilter} alerts found`}
            </div>
            <div className="empty-description">
              {alertFilter === 'all' 
                ? 'You haven\'t submitted any alerts yet. When you raise an alert, it will appear here.'
                : `You don't have any ${alertFilter} alerts at the moment.`
              }
            </div>
          </div>
        )}
      </AlertsSection>
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
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="User Avatar" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    color: 'white',
                    fontWeight: '700'
                  }}>
                    {(profileData.firstName?.[0] || '').toUpperCase()}{(profileData.lastName?.[0] || '').toUpperCase() || (profileData.firstName?.[1] || 'U')}
                  </div>
                )}
                {/* Hidden fallback for initials when image fails */}
                <div style={{
                  display: user?.avatar ? 'none' : 'flex',
                  width: '100%',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  color: 'white',
                  fontWeight: '700',
                  position: 'absolute',
                  top: 0,
                  left: 0
                }}>
                  {(profileData.firstName?.[0] || '').toUpperCase()}{(profileData.lastName?.[0] || '').toUpperCase() || (profileData.firstName?.[1] || 'U')}
                </div>
              </div>
              <div className="avatar-upload" onClick={handleAvatarUpload}>
                {isLoading ? <FiLoader className="rotating" /> : <FiCamera />}
              </div>
            </div>
            <div className="farmer-name">
              {[profileData.firstName, profileData.lastName].filter(Boolean).join(' ') || 'No name set'}
            </div>
            <div className="farmer-id">
              Farmer ID: {getFarmerId(user)}
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
                <div className="info-value">{profileData.phone || 'Not provided'}</div>
              </div>
            </div>
            
            <div className="info-item">
              <FiHome className="info-icon" />
              <div className="info-content">
                <div className="info-label">Farm</div>
                <div className="info-value">{profileData.farmName || 'Not specified'}</div>
              </div>
            </div>
            
            <div className="info-item">
              <FiMapPin className="info-icon" />
              <div className="info-content">
                <div className="info-label">Location</div>
                <div className="info-value">
                  {[profileData.city, profileData.state].filter(Boolean).join(', ') || 'Not specified'}
                </div>
              </div>
            </div>
            
            <div className="info-item">
              <FiUsers className="info-icon" />
              <div className="info-content">
                <div className="info-label">Animals</div>
                <div className="info-value">
                  {profileData.totalAnimals ? `${profileData.totalAnimals} ` : ''}
                  {profileData.animalTypes || profileData.farmType || 'Not specified'}
                </div>
              </div>
            </div>
            
            <div className="info-item">
              <FiCalendar className="info-icon" />
              <div className="info-content">
                <div className="info-label">Member Since</div>
                <div className="info-value">
                  {user?.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      })
                    : 'Not available'
                  }
                </div>
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
              active={activeTab === 'my-alerts'}
              onClick={() => setActiveTab('my-alerts')}
            >
              My Alerts
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
          {activeTab === 'my-alerts' && renderMyAlertsTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>
      </ProfileGrid>
    </ProfileContainer>
  );
};

export default ProfilePage;