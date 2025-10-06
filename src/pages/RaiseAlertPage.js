import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { alertAPI, fileAPI } from '../services/api';
import { uploadSingleFile } from '../services/fileUpload';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AlertSubmissionModal from '../components/AlertSubmissionModal';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/translations';
import {
  FiAlertTriangle,
  FiMapPin,
  FiImage,
  FiMic,
  FiSend,
  FiX,
  FiClock,
  FiUser,
  FiCamera,
  FiPlay,
  FiNavigation,
  FiRefreshCw,
  FiInfo
} from 'react-icons/fi';

const AlertContainer = styled.div`
  max-width: 1000px;
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
  }
  
  .alert-icon {
    color: #dc3545;
    font-size: 2.5rem;
  }
  
  p {
    font-size: 1.2rem;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const AlertForm = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const FormSection = styled.div`
  margin-bottom: 30px;
  
  .section-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--dark-gray);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .section-icon {
    color: var(--primary-coral);
    font-size: 20px;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
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
  min-height: 120px;
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
  
  &::placeholder {
    color: #aaa;
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
`;

const UrgencySelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
`;

const UrgencyButton = styled.button`
  padding: 16px 20px;
  border: 2px solid ${props => {
    if (props.selected && props.level === 'low') return '#28a745';
    if (props.selected && props.level === 'medium') return '#ffc107';
    if (props.selected && props.level === 'high') return '#dc3545';
    return '#e0e0e0';
  }};
  background: ${props => {
    if (props.selected && props.level === 'low') return 'rgba(40, 167, 69, 0.1)';
    if (props.selected && props.level === 'medium') return 'rgba(255, 193, 7, 0.1)';
    if (props.selected && props.level === 'high') return 'rgba(220, 53, 69, 0.1)';
    return 'white';
  }};
  color: ${props => {
    if (props.selected && props.level === 'low') return '#28a745';
    if (props.selected && props.level === 'medium') return '#ffc107';
    if (props.selected && props.level === 'high') return '#dc3545';
    return '#666';
  }};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  text-align: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .urgency-text {
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
  }
  
  .urgency-desc {
    font-size: 11px;
    margin-top: 4px;
    opacity: 0.8;
  }
`;

const ImageUploadSection = styled.div`
  .upload-area {
    border: 2px dashed #e0e0e0;
    border-radius: 16px;
    padding: 40px;
    text-align: center;
    margin-bottom: 20px;
    transition: all 0.3s ease;
    cursor: pointer;
    
    &:hover, &.drag-over {
      border-color: var(--primary-coral);
      background: rgba(255, 127, 80, 0.05);
    }
    
    .upload-icon {
      font-size: 48px;
      color: var(--primary-coral);
      margin-bottom: 16px;
    }
    
    .upload-text {
      font-size: 1.1rem;
      color: var(--dark-gray);
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    .upload-hint {
      color: #666;
      font-size: 14px;
    }
  }
  
  input[type="file"] {
    display: none;
  }
`;

const ImagePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

const ImagePreview = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .remove-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(220, 53, 69, 0.9);
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    
    &:hover {
      background: #dc3545;
    }
  }
`;

const VoiceRecordSection = styled.div`
  .voice-controls {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .record-button {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    border: none;
    border-radius: 50px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &.recording {
      background: #dc3545;
      color: white;
      animation: pulse 2s infinite;
    }
    
    &.stopped {
      background: var(--primary-coral);
      color: white;
    }
    
    &.idle {
      background: #f8f9fa;
      color: var(--dark-gray);
      border: 2px solid #e0e0e0;
    }
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }
  
  .recording-info {
    color: #666;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const AudioPreview = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .audio-info {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .audio-icon {
      color: var(--primary-coral);
      font-size: 20px;
    }
    
    .audio-details {
      .audio-name {
        font-weight: 600;
        color: var(--dark-gray);
        margin-bottom: 4px;
      }
      
      .audio-duration {
        font-size: 12px;
        color: #666;
      }
    }
  }
  
  .audio-actions {
    display: flex;
    gap: 8px;
    
    button {
      padding: 8px;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(255, 127, 80, 0.1);
      }
      
      &.play {
        color: var(--primary-coral);
      }
      
      &.remove {
        color: #dc3545;
      }
    }
  }
`;

const SubmitSection = styled.div`
  border-top: 2px solid #f0f0f0;
  padding-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  
  .submit-info {
    text-align: center;
    color: #666;
    font-size: 14px;
    max-width: 500px;
  }
`;

const SubmitButton = styled(motion.button)`
  padding: 18px 40px;
  border: none;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(220, 53, 69, 0.4);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const LocationSection = styled.div`
  .location-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .auto-detect-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--primary-coral);
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.3s ease;
    
    &:hover:not(:disabled) {
      background: #FF6A35;
      transform: translateY(-1px);
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }
    
    .refresh-icon {
      animation: ${props => props.loading ? 'spin 1s linear infinite' : 'none'};
    }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .location-status {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    font-size: 14px;
    
    &.success {
      background: rgba(40, 167, 69, 0.1);
      color: #28a745;
    }
    
    &.loading {
      background: rgba(255, 193, 7, 0.1);
      color: #ffc107;
    }
  }
`;

const RaiseAlertPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  
  // Translation function
  const t = (text) => getTranslation(text, currentLanguage);
  
  const [formData, setFormData] = useState({
    location: '',
    subLocation: '',
    manualLocation: '',
    coordinates: null,
    detectedLocation: '',
    issueType: '',
    customIssue: '',
    urgency: '',
    description: '',
    contactName: '',
    contactPhone: '',
    contactEmail: ''
  });
  
  const [images, setImages] = useState([]);
  const [audioRecording, setAudioRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  
  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'success', // 'success', 'error', 'warning', 'info'
    title: '',
    message: '',
    errors: [],
    showRetry: false,
    showViewAlert: false,
    alertId: null
  });
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error(t('Please login to raise an alert. You will be redirected to the login page.'));
      navigate('/auth?redirect=/raise-alert');
      return;
    }
  }, [isAuthenticated, navigate, t]);
  
  // Pre-populate contact information from user profile
  useEffect(() => {
    if (user && isAuthenticated) {
      setFormData(prev => ({
        ...prev,
        contactName: user.name || '',
        contactPhone: user.phone || '',
        contactEmail: user.email || ''
      }));
    }
  }, [user, isAuthenticated]);

  // Move locations array up and wrap in useMemo to prevent re-creation
  const locations = React.useMemo(() => [
    { value: '', label: t('Select State/Region') },
    { value: 'andhra-pradesh', label: 'Andhra Pradesh', subLocations: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kakinada', 'Rajahmundry', 'Nellore', 'Kurnool', 'Kadapa', 'Anantapur'] },
    { value: 'arunachal-pradesh', label: 'Arunachal Pradesh', subLocations: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tezu', 'Bomdila', 'Tawang', 'Ziro', 'Along'] },
    { value: 'assam', label: 'Assam', subLocations: ['Guwahati', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Silchar', 'Tezpur', 'Bongaigaon'] },
    { value: 'bihar', label: 'Bihar', subLocations: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah'] },
    { value: 'chhattisgarh', label: 'Chhattisgarh', subLocations: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Jagdalpur', 'Raigarh'] },
    { value: 'goa', label: 'Goa', subLocations: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem'] },
    { value: 'gujarat', label: 'Gujarat', subLocations: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Morbi'] },
    { value: 'haryana', label: 'Haryana', subLocations: ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula'] },
    { value: 'himachal-pradesh', label: 'Himachal Pradesh', subLocations: ['Shimla', 'Manali', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Bilaspur', 'Chamba'] },
    { value: 'jharkhand', label: 'Jharkhand', subLocations: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Phusro', 'Hazaribagh', 'Giridih'] },
    { value: 'karnataka', label: 'Karnataka', subLocations: ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Davangere', 'Bellary', 'Bijapur', 'Shimoga', 'Tumkur'] },
    { value: 'kerala', label: 'Kerala', subLocations: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Malappuram', 'Kannur', 'Kasaragod'] },
    { value: 'madhya-pradesh', label: 'Madhya Pradesh', subLocations: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa'] },
    { value: 'maharashtra', label: 'Maharashtra', subLocations: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Sangli'] },
    { value: 'manipur', label: 'Manipur', subLocations: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching', 'Ukhrul'] },
    { value: 'meghalaya', label: 'Meghalaya', subLocations: ['Shillong', 'Tura', 'Cherrapunji', 'Jowai', 'Baghmara', 'Nongpoh'] },
    { value: 'mizoram', label: 'Mizoram', subLocations: ['Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib', 'Serchhip'] },
    { value: 'nagaland', label: 'Nagaland', subLocations: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto'] },
    { value: 'odisha', label: 'Odisha', subLocations: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Baripada'] },
    { value: 'punjab', label: 'Punjab', subLocations: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Firozpur', 'Batala'] },
    { value: 'rajasthan', label: 'Rajasthan', subLocations: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar', 'Sikar', 'Bharatpur'] },
    { value: 'sikkim', label: 'Sikkim', subLocations: ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Jorethang', 'Nayabazar'] },
    { value: 'tamil-nadu', label: 'Tamil Nadu', subLocations: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul'] },
    { value: 'telangana', label: 'Telangana', subLocations: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Mahabubnagar', 'Nalgonda', 'Adilabad'] },
    { value: 'tripura', label: 'Tripura', subLocations: ['Agartala', 'Dharmanagar', 'Udaipur', 'Kailasahar', 'Belonia', 'Khowai'] },
    { value: 'uttar-pradesh', label: 'Uttar Pradesh', subLocations: ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly', 'Moradabad', 'Saharanpur'] },
    { value: 'uttarakhand', label: 'Uttarakhand', subLocations: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Kotdwar'] },
    { value: 'west-bengal', label: 'West Bengal', subLocations: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Malda', 'Bardhaman', 'Kharagpur', 'Haldia'] },
    { value: 'delhi', label: 'Delhi', subLocations: ['New Delhi', 'Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Northeast Delhi', 'Northwest Delhi', 'Southeast Delhi', 'Southwest Delhi'] },
    { value: 'chandigarh', label: 'Chandigarh', subLocations: ['Chandigarh'] },
    { value: 'puducherry', label: 'Puducherry', subLocations: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'] },
    { value: 'jammu-kashmir', label: 'Jammu and Kashmir', subLocations: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur', 'Kathua'] },
    { value: 'ladakh', label: 'Ladakh', subLocations: ['Leh', 'Kargil', 'Nubra', 'Zanskar'] }
  ], [t]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Define IP location function first
  const getLocationByIP = useCallback(async () => {
    setLocationLoading(true);
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      const fullAddress = `${data.city}, ${data.region}, ${data.country_name}`;
      setFormData(prev => ({
        ...prev,
        coordinates: { latitude: data.latitude, longitude: data.longitude },
        detectedLocation: fullAddress,
        manualLocation: fullAddress
      }));
    } catch (error) {
      console.error('Error getting IP location:', error);
      setFormData(prev => ({
        ...prev,
        detectedLocation: 'Location detection failed',
        manualLocation: ''
      }));
    }
    setLocationLoading(false);
  }, []);

  // GPS location function - now can safely reference getLocationByIP
  const getCurrentLocation = useCallback(() => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`
          );
          const data = await response.json();
          if (data.results.length > 0) {
            const location = data.results[0].components;
            const fullAddress = `${location.city || location.town || location.village || ''}, ${location.state || ''}, ${location.country || ''}`;
            setFormData(prev => ({
              ...prev,
              coordinates: { latitude, longitude },
              detectedLocation: fullAddress,
              manualLocation: fullAddress
            }));
          } else {
            // If API fails, use coordinates only
            const coordsText = `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`;
            setFormData(prev => ({
              ...prev,
              coordinates: { latitude, longitude },
              detectedLocation: coordsText,
              manualLocation: coordsText
            }));
          }
        } catch (error) {
          console.error('Error getting location name:', error);
          const coordsText = `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`;
          setFormData(prev => ({
            ...prev,
            coordinates: { latitude, longitude },
            detectedLocation: coordsText,
            manualLocation: coordsText
          }));
        }
        setLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationLoading(false);
        // Fallback to IP-based location
        getLocationByIP();
      }
    );
  }, [getLocationByIP]);


  // Auto-detect location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      getCurrentLocation();
    } else {
      // Fallback to IP-based location if geolocation is not supported
      getLocationByIP();
    }
  }, [getCurrentLocation, getLocationByIP]);

  const issueTypes = [
    { value: '', label: t('Select Issue Type') },
    { value: 'disease-outbreak', label: t('Disease Outbreak') },
    { value: 'animal-death', label: t('Sudden Animal Deaths') },
    { value: 'feed-contamination', label: t('Feed Contamination') },
    { value: 'water-issues', label: t('Water Quality Issues') },
    { value: 'biosecurity-breach', label: t('Biosecurity Breach') },
    { value: 'pest-infestation', label: t('Pest Infestation') },
    { value: 'equipment-failure', label: t('Equipment Failure') },
    { value: 'weather-damage', label: t('Weather Related Damage') },
    { value: 'other', label: t('Other (Please specify)') }
  ];

  const getSubLocations = () => {
    const selectedLocation = locations.find(loc => loc.value === formData.location);
    return selectedLocation?.subLocations || [];
  };

  const handleImageUpload = (files) => {
    const fileList = Array.from(files);
    const imageFiles = fileList.filter(file => file.type.startsWith('image/'));
    
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          file: file,
          preview: e.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioRecording({
          blob: audioBlob,
          url: URL.createObjectURL(audioBlob),
          duration: recordingTime
        });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      alert(t('Error accessing microphone. Please check your permissions.'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const removeAudioRecording = () => {
    setAudioRecording(null);
    setRecordingTime(0);
  };

  const playAudio = () => {
    if (audioRecording) {
      const audio = new Audio(audioRecording.url);
      audio.play();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  };

  const isFormValid = () => {
    // Check authentication first
    if (!isAuthenticated) {
      return false;
    }
    
    // Either dropdown location OR manual location must be filled
    const hasLocation = formData.location || formData.manualLocation.trim();
    return hasLocation && formData.issueType && formData.urgency && 
           formData.contactName && formData.contactPhone;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast.error(t('Please fill in all required fields.'));
      return;
    }

    setIsSubmitting(true);
    const uploadToast = toast.loading(t('Creating alert and uploading files...'));

    try {
      // Step 1: Upload images to S3
      const uploadedImages = [];
      if (images.length > 0) {
        toast.loading(t('Uploading images...'), { id: uploadToast });
        
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          try {
            setUploadProgress(prev => ({ ...prev, [image.id]: 0 }));
            
            const response = await fileAPI.uploadSingle(
              image.file,
              (progress) => {
                setUploadProgress(prev => ({ ...prev, [image.id]: progress }));
              }
            );
            
            uploadedImages.push({
              filename: image.name,
              url: response.data.cloudUrl || response.data.signedUrl,
              s3Key: response.data.s3Key,
              fileId: response.data.id
            });
            
            setUploadProgress(prev => ({ ...prev, [image.id]: 100 }));
          } catch (uploadError) {
            console.error('Image upload failed:', uploadError);
            
            // Check if it's an authentication error
            if (uploadError.response?.status === 401) {
              toast.error(t('Authentication expired. Please login again.'));
              navigate('/auth?redirect=/raise-alert');
              return;
            }
            
            const errorMessage = uploadError.response?.data?.message || uploadError.message || t('Upload failed');
            toast.error(`${t('Failed to upload image')} "${image.name}": ${errorMessage}`);
          }
        }
      }

      // Step 2: Upload audio recording if exists
      let uploadedAudio = null;
      if (audioRecording) {
        try {
          toast.loading(t('Uploading voice message...'), { id: uploadToast });
          
          // Create a File object from the audio blob
          const audioFile = new File([audioRecording.blob], `voice-message-${Date.now()}.wav`, {
            type: 'audio/wav'
          });
          
          const audioResponse = await fileAPI.uploadSingle(audioFile);
          uploadedAudio = {
            filename: audioFile.name,
            url: audioResponse.data.cloudUrl || audioResponse.data.signedUrl,
            s3Key: audioResponse.data.s3Key,
            fileId: audioResponse.data.id,
            duration: audioRecording.duration
          };
        } catch (uploadError) {
          console.error('Audio upload failed:', uploadError);
          
          // Check if it's an authentication error
          if (uploadError.response?.status === 401) {
            toast.error(t('Authentication expired. Please login again.'));
            navigate('/auth?redirect=/raise-alert');
            return;
          }
          
          const errorMessage = uploadError.response?.data?.message || uploadError.message || t('Upload failed');
          toast.error(`${t('Failed to upload voice message')}: ${errorMessage}`);
        }
      }

      // Step 3: Create the alert with uploaded file references
      toast.loading(t('Creating alert...'), { id: uploadToast });
      
      const alertData = {
        title: `${formData.issueType === 'other' ? formData.customIssue : issueTypes.find(t => t.value === formData.issueType)?.label || 'Farm Alert'} - ${formData.urgency.toUpperCase()} Priority`,
        description: formData.description || `${formData.issueType === 'other' ? formData.customIssue : issueTypes.find(t => t.value === formData.issueType)?.label} reported at ${formData.manualLocation || `${formData.subLocation}, ${locations.find(l => l.value === formData.location)?.label}`}`,
        category: getCategoryFromIssueType(formData.issueType),
        severity: mapUrgencyToSeverity(formData.urgency),
        status: 'active',
        location: {
          state: locations.find(l => l.value === formData.location)?.label || '',
          district: formData.subLocation || '',
          village: formData.manualLocation || '',
          coordinates: formData.coordinates ? {
            lat: formData.coordinates.latitude,
            lng: formData.coordinates.longitude
          } : null
        },
        issueType: formData.issueType,
        customIssue: formData.customIssue,
        contactInfo: {
          name: formData.contactName,
          phone: formData.contactPhone,
          email: formData.contactEmail || ''
        },
        attachments: {
          images: uploadedImages,
          audio: uploadedAudio
        },
        metadata: {
          detectedLocation: formData.detectedLocation,
          reportSource: 'web_portal',
          userAgent: navigator.userAgent,
          submittedAt: new Date().toISOString()
        }
      };

      const alertResponse = await alertAPI.create(alertData);

      // Dismiss loading toast
      toast.dismiss(uploadToast);
      
      // Show success modal
      setModalState({
        isOpen: true,
        type: 'success',
        title: t('Alert Submitted Successfully!'),
        message: `${t('Your alert has been submitted successfully with ID')}: ${alertResponse.data._id}. ${t('Our expert team will respond shortly and you will receive updates via SMS and email.')}`,
        errors: [],
        showRetry: false,
        showViewAlert: true,
        alertId: alertResponse.data._id
      });
      
      // Reset form after successful submission
      setFormData({
        location: '',
        subLocation: '',
        manualLocation: '',
        coordinates: null,
        detectedLocation: '',
        issueType: '',
        customIssue: '',
        urgency: '',
        description: '',
        contactName: '',
        contactPhone: '',
        contactEmail: ''
      });
      setImages([]);
      setAudioRecording(null);
      setUploadProgress({});
      
      console.log('Alert created:', alertResponse);
      
    } catch (error) {
      console.error('Alert submission failed:', error);
      
      // Dismiss loading toast
      toast.dismiss(uploadToast);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        toast.error(t('Authentication expired. Please login again.'));
        navigate('/auth?redirect=/raise-alert');
        return;
      }
      
      // Prepare error details for modal
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          t('Failed to submit alert. Please try again.');
      
      const validationErrors = error.response?.data?.errors || [];
      
      // Show error modal
      setModalState({
        isOpen: true,
        type: 'error',
        title: t('Alert Submission Failed'),
        message: errorMessage,
        errors: validationErrors,
        showRetry: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions
  const getCategoryFromIssueType = (issueType) => {
    const categoryMap = {
      'disease-outbreak': 'disease',
      'animal-death': 'death',
      'feed-contamination': 'general',
      'water-issues': 'general',
      'biosecurity-breach': 'general',
      'pest-infestation': 'general',
      'equipment-failure': 'general',
      'weather-damage': 'general',
      'other': 'general'
    };
    return categoryMap[issueType] || 'general';
  };

  const mapUrgencyToSeverity = (urgency) => {
    const severityMap = {
      'low': 'low',
      'medium': 'medium',
      'high': 'critical'
    };
    return severityMap[urgency] || 'medium';
  };

  // Modal handlers
  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const retrySubmission = () => {
    closeModal();
    handleSubmit();
  };

  const viewAlert = () => {
    closeModal();
    // Navigate to My Alerts tab in profile page
    navigate('/profile?tab=my-alerts');
  };

  return (
    <AlertContainer>
      <Header>
        <h1>
          <FiAlertTriangle className="alert-icon" />
          {t('Raise Alert')}
        </h1>
        <p>
          {t('Report urgent farm issues and receive immediate assistance from our expert team. All alerts are monitored 24/7.')}
        </p>
      </Header>

      <AlertForm
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Location Information */}
        <FormSection>
          <LocationSection>
            <div className="location-header">
              <div className="section-title">
                <FiMapPin className="section-icon" />
                {t('Location Information')}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="auto-detect-btn"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  loading={locationLoading}
                  title={t('Use GPS for precise location')}
                >
                  {locationLoading ? (
                    <FiRefreshCw className="refresh-icon" />
                  ) : (
                    <FiNavigation />
                  )}
                  {locationLoading ? t('Detecting...') : t('GPS Location')}
                </button>
                
                <button
                  type="button"
                  className="auto-detect-btn"
                  onClick={getLocationByIP}
                  disabled={locationLoading}
                  style={{ background: '#17a2b8' }}
                  title={t('Use internet connection for approximate location')}
                >
                  <FiMapPin />
                  {t('IP Location')}
                </button>
              </div>
            </div>
            
            <FormRow columns="1fr 1fr">
              <FormGroup>
                <label className="label">
                  {t('State/Region')} <span className="required">*</span>
                </label>
                <Select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                >
                  {locations.map(location => (
                    <option key={location.value} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup>
                <label className="label">{t('District/City')}</label>
                <Select
                  value={formData.subLocation}
                  onChange={(e) => handleInputChange('subLocation', e.target.value)}
                  disabled={!formData.location}
                >
                  <option value="">{t('Select District/City')}</option>
                  {getSubLocations().map(subLocation => (
                    <option key={subLocation} value={subLocation}>
                      {subLocation}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <label className="label">
                  <FiMapPin style={{ marginRight: '4px', fontSize: '14px' }} />
                  {t('Exact Location Address')}
                  <span style={{ color: '#666', fontWeight: 'normal', fontSize: '12px', marginLeft: '8px' }}>
                    {t('(Auto-filled by GPS or enter manually)')}
                  </span>
                </label>
                <Input
                  type="text"
                  placeholder={t('Enter your exact location address (e.g., Village/Town, Landmark, Address)...')}
                  value={formData.manualLocation}
                  onChange={(e) => handleInputChange('manualLocation', e.target.value)}
                  style={{
                    fontSize: '14px',
                    padding: '12px 16px',
                    minHeight: '44px'
                  }}
                />
                <div style={{ 
                  fontSize: '11px', 
                  color: '#666', 
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <FiInfo size={12} />
                  {t('This field helps us locate you precisely. Use GPS buttons above for automatic detection.')}
                </div>
              </FormGroup>
            </FormRow>
            
            {/* Location Status */}
            {locationLoading && (
              <div className="location-status loading">
                <FiRefreshCw />
                {t('Detecting your location...')}
              </div>
            )}
            
            {formData.detectedLocation && !locationLoading && (
              <div className="location-status success">
                <FiMapPin />
                <div>
                  <strong>{t('Location detected')}:</strong> {formData.detectedLocation}
                  <div style={{ fontSize: '11px', marginTop: '2px', color: '#28a745' }}>
                    ✓ {t('Location automatically filled in address field below')}
                    {formData.coordinates && (
                      <span style={{ marginLeft: '8px', color: '#666' }}>
                        • {t('GPS Coordinates')}: ({formData.coordinates.latitude.toFixed(4)}, {formData.coordinates.longitude.toFixed(4)})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </LocationSection>
        </FormSection>


        {/* Issue Details */}
        <FormSection>
          <div className="section-title">
            <FiAlertTriangle className="section-icon" />
            {t('Issue Details')}
          </div>
          <FormRow>
            <FormGroup>
              <label className="label">
                {t('Issue Type')} <span className="required">*</span>
              </label>
              <Select
                value={formData.issueType}
                onChange={(e) => handleInputChange('issueType', e.target.value)}
              >
                {issueTypes.map(issue => (
                  <option key={issue.value} value={issue.value}>
                    {issue.label}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </FormRow>

          {formData.issueType === 'other' && (
            <FormRow>
              <FormGroup>
                <label className="label">
                  {t('Specify Issue')} <span className="required">*</span>
                </label>
                <Input
                  type="text"
                  placeholder={t('Please describe the specific issue')}
                  value={formData.customIssue}
                  onChange={(e) => handleInputChange('customIssue', e.target.value)}
                />
              </FormGroup>
            </FormRow>
          )}

          <FormRow>
            <FormGroup>
              <label className="label">
                {t('Urgency Level')} <span className="required">*</span>
              </label>
              <UrgencySelector>
                <UrgencyButton
                  level="low"
                  selected={formData.urgency === 'low'}
                  onClick={() => handleInputChange('urgency', 'low')}
                >
                  <div className="urgency-text">{t('Low')}</div>
                  <div className="urgency-desc">{t('Can wait 24-48 hrs')}</div>
                </UrgencyButton>
                <UrgencyButton
                  level="medium"
                  selected={formData.urgency === 'medium'}
                  onClick={() => handleInputChange('urgency', 'medium')}
                >
                  <div className="urgency-text">{t('Medium')}</div>
                  <div className="urgency-desc">{t('Within 12 hours')}</div>
                </UrgencyButton>
                <UrgencyButton
                  level="high"
                  selected={formData.urgency === 'high'}
                  onClick={() => handleInputChange('urgency', 'high')}
                >
                  <div className="urgency-text">{t('High')}</div>
                  <div className="urgency-desc">{t('Immediate attention')}</div>
                </UrgencyButton>
              </UrgencySelector>
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <label className="label">
                {t('Detailed Description (Optional)')}
              </label>
              <TextArea
                placeholder={t('Please provide detailed information about the issue, including symptoms, timeline, affected animals, and any actions you\'ve already taken... (This field is optional but recommended for better assistance)')}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </FormGroup>
          </FormRow>
        </FormSection>

        {/* Image Upload */}
        <FormSection>
          <div className="section-title">
            <FiImage className="section-icon" />
            {t('Photo Evidence')}
          </div>
          <ImageUploadSection>
            <div 
              className={`upload-area ${dragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <FiCamera className="upload-icon" />
              <div className="upload-text">
                {t('Upload photos of the affected area/animals')}
              </div>
              <div className="upload-hint">
                {t('Drag & drop images or click to browse (JPG, PNG, Max 5MB per file)')}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
              />
            </div>
            
            {images.length > 0 && (
              <ImagePreviewGrid>
                {images.map(image => (
                  <ImagePreview key={image.id}>
                    <img src={image.preview} alt={image.name} />
                    <button 
                      className="remove-btn"
                      onClick={() => removeImage(image.id)}
                    >
                      <FiX />
                    </button>
                  </ImagePreview>
                ))}
              </ImagePreviewGrid>
            )}
          </ImageUploadSection>
        </FormSection>

        {/* Voice Recording */}
        <FormSection>
          <div className="section-title">
            <FiMic className="section-icon" />
            {t('Voice Message (Optional)')}
          </div>
          <VoiceRecordSection>
            <div className="voice-controls">
              <button
                className={`record-button ${isRecording ? 'recording' : audioRecording ? 'stopped' : 'idle'}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={audioRecording && !isRecording}
              >
                {isRecording ? <FiX /> : <FiMic />}
                {isRecording ? t('Stop Recording') : t('Start Recording')}
              </button>
              
              {isRecording && (
                <div className="recording-info">
                  <FiClock />
                  {t('Recording...')} {formatTime(recordingTime)}
                </div>
              )}
            </div>

            {audioRecording && (
              <AudioPreview>
                <div className="audio-info">
                  <FiMic className="audio-icon" />
                  <div className="audio-details">
                    <div className="audio-name">{t('Voice Message')}</div>
                    <div className="audio-duration">
                      {t('Duration')}: {formatTime(audioRecording.duration)}
                    </div>
                  </div>
                </div>
                <div className="audio-actions">
                  <button className="play" onClick={playAudio} title={t('Play')}>
                    <FiPlay />
                  </button>
                  <button className="remove" onClick={removeAudioRecording} title={t('Remove')}>
                    <FiX />
                  </button>
                </div>
              </AudioPreview>
            )}
          </VoiceRecordSection>
        </FormSection>

        {/* Contact Information */}
        <FormSection>
          <div className="section-title">
            <FiUser className="section-icon" />
            {t('Contact Information')}
          </div>
          <FormRow columns="1fr 1fr 1fr">
            <FormGroup>
              <label className="label">
                {t('Full Name')} <span className="required">*</span>
              </label>
              <Input
                type="text"
                placeholder={t('Your full name')}
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <label className="label">
                {t('Phone Number')} <span className="required">*</span>
              </label>
              <Input
                type="tel"
                placeholder={t('+91 XXXXX XXXXX')}
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <label className="label">{t('Email Address')}</label>
              <Input
                type="email"
                placeholder={t('your@email.com')}
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              />
            </FormGroup>
          </FormRow>
        </FormSection>

        {/* Submit Section */}
        <SubmitSection>
          <div className="submit-info">
            <strong>{t('Emergency Contact')}:</strong> {t('For critical situations requiring immediate veterinary assistance, please call our 24/7 hotline at')} <strong>1800-XXX-XXXX</strong>
          </div>
          
          <SubmitButton
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? <FiRefreshCw style={{ animation: 'spin 1s linear infinite' }} /> : <FiSend />}
            {isSubmitting ? t('Submitting...') : t('Submit Alert')}
          </SubmitButton>
        </SubmitSection>
      </AlertForm>
      
      {/* Alert Submission Modal */}
      <AlertSubmissionModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        errors={modalState.errors}
        onRetry={retrySubmission}
        showRetry={modalState.showRetry}
        onViewAlert={viewAlert}
        showViewAlert={modalState.showViewAlert}
      />
    </AlertContainer>
  );
};

export default RaiseAlertPage;