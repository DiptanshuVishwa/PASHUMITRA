// This file contains all placeholder pages to ensure the app runs without errors
// Each will be moved to separate files as we build them out

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiPlay, 
  FiBookOpen, 
  FiDownload, 
  FiExternalLink, 
  FiStar,
  FiSearch
} from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/translations';
// Import the new CompliancePage, RaiseAlertPage, NotificationsPage, ProfilePage, and PrivacyPolicy
import CompliancePage from './CompliancePage';
import RaiseAlertPage from './RaiseAlertPage';
import NotificationsPage from './NotificationsPage';
import ProfilePage from './ProfilePage';
import PrivacyPolicy from './PrivacyPolicy';
import SettingsPage from './SettingsPage';
import FeedbackPage from './FeedbackPage';
import ContactVetPage from './ContactVetPage';
import ContactUsPage from './ContactUsPage';

const Container = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
  text-align: center;
`;

// Compliance page
export const Compliance = CompliancePage;

// Enhanced Learning Components
const LearningContainer = styled.div`
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
`;

const LearningHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
    font-size: 2.5rem;
    color: var(--dark-gray);
    margin-bottom: 16px;
  }
  
  p {
    font-size: 1.2rem;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const SearchAndFilter = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchBox = styled.div`
  flex: 1;
  position: relative;
  min-width: 250px;
  
  input {
    width: 100%;
    padding: 12px 40px 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 25px;
    font-size: 16px;
    
    &:focus {
      outline: none;
      border-color: var(--primary-coral);
    }
  }
  
  .search-icon {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
`;

const FilterButton = styled.button`
  padding: 12px 20px;
  border: 2px solid ${props => props.active ? 'var(--primary-coral)' : '#e0e0e0'};
  background: ${props => props.active ? 'var(--primary-coral)' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-coral);
    background: ${props => props.active ? 'var(--primary-coral)' : 'rgba(255, 127, 80, 0.1)'};
  }
`;

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
`;

const VideoCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const VideoThumbnail = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, var(--primary-coral) 0%, #FF6A35 100%);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  
  .thumbnail-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 1;
  }
  
  .play-button {
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: var(--primary-coral);
    transition: all 0.3s ease;
    position: relative;
    z-index: 10;
  }
  
  &:hover .play-button {
    background: white;
    transform: scale(1.1);
  }
  
  .duration {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    z-index: 10;
  }
`;

const VideoContent = styled.div`
  padding: 20px;
  
  h3 {
    color: var(--dark-gray);
    margin-bottom: 12px;
    font-size: 1.2rem;
    line-height: 1.4;
  }
  
  p {
    color: #666;
    margin-bottom: 16px;
    line-height: 1.6;
    font-size: 14px;
  }
`;

const VideoMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .category {
    background: rgba(255, 127, 80, 0.1);
    color: var(--primary-coral);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .rating {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #666;
    font-size: 14px;
    
    .stars {
      color: #ffd700;
    }
  }
`;

const VideoActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #666;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  
  &:hover {
    border-color: var(--primary-coral);
    color: var(--primary-coral);
  }
  
  &.primary {
    background: var(--primary-coral);
    color: white;
    border-color: var(--primary-coral);
    
    &:hover {
      background: #FF6A35;
    }
  }
`;

const ResourcesSection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  h2 {
    color: var(--dark-gray);
    margin-bottom: 30px;
    font-size: 2rem;
    text-align: center;
  }
`;

const ResourceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const ResourceCard = styled(motion.div)`
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid var(--primary-coral);
  
  h4 {
    color: var(--dark-gray);
    margin-bottom: 8px;
    font-size: 1.1rem;
  }
  
  p {
    color: #666;
    font-size: 14px;
    margin-bottom: 12px;
  }
  
  a {
    color: var(--primary-coral);
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

// Utility function to generate YouTube thumbnail URLs with fallbacks
const getYouTubeThumbnail = (videoId, quality = 'maxresdefault') => {
  // YouTube thumbnail quality options:
  // maxresdefault (1280x720) - Highest quality, may not exist for all videos
  // hqdefault (480x360) - High quality, more reliable
  // mqdefault (320x180) - Medium quality
  // default (120x90) - Default quality
  
  const qualities = {
    max: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    high: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    medium: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    default: `https://img.youtube.com/vi/${videoId}/default.jpg`
  };
  
  // Return high quality with fallback
  return qualities.max;
};

// Simple and reliable thumbnail component
const ThumbnailImage = ({ youtubeId, alt }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`);
  
  const handleImageError = (e) => {
    console.log(`Thumbnail error for ${youtubeId}:`, currentSrc);
    // Fallback to high quality if max resolution fails
    if (currentSrc.includes('maxresdefault')) {
      const fallbackSrc = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
      console.log(`Falling back to: ${fallbackSrc}`);
      setCurrentSrc(fallbackSrc);
    } else if (currentSrc.includes('hqdefault')) {
      const fallbackSrc = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
      console.log(`Falling back to: ${fallbackSrc}`);
      setCurrentSrc(fallbackSrc);
    } else {
      // All fallbacks failed, show error
      console.log(`All thumbnail fallbacks failed for ${youtubeId}`);
      setImageError(true);
    }
  };
  
  const handleImageLoad = () => {
    console.log(`Thumbnail loaded successfully for ${youtubeId}:`, currentSrc);
    setImageLoaded(true);
    setImageError(false);
  };
  
  if (imageError) {
    return null; // Show gradient background
  }
  
  return (
    <img 
      className="thumbnail-image"
      src={currentSrc}
      alt={alt}
      onLoad={handleImageLoad}
      onError={handleImageError}
      style={{
        opacity: imageLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
    />
  );
};

// Learning page
export const Learning = () => {
  const { currentLanguage } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Translation helper function
  const t = (text, params) => getTranslation(text, currentLanguage, params);

  const categories = [
    { id: 'all', label: t('All Topics') },
    { id: 'biosecurity', label: t('Biosecurity Basics') },
    { id: 'pig', label: t('Pig Farming') },
    { id: 'poultry', label: t('Poultry Farming') },
    { id: 'diseases', label: t('Disease Prevention') },
    { id: 'management', label: t('Farm Management') }
  ];

  const videos = [
    {
      id: 1,
      title: t("Modern Livestock Management Techniques"),
      description: t("Comprehensive guide to modern livestock management practices including feeding, housing, and health monitoring for optimal farm productivity."),
      category: "management",
      duration: "12:30",
      rating: 4.8,
      views: "15.2K",
      youtubeId: "rGbC0jAP6Mg"
    },
    {
      id: 2,
      title: t("Advanced Livestock Health Management"),
      description: t("Professional guide to livestock health management covering disease prevention, treatment protocols, and maintaining optimal animal welfare standards."),
      category: "biosecurity",
      duration: "15:20",
      rating: 4.8,
      views: "26.3K",
      youtubeId: "MBIRHQZ2E2k"
    },
    {
      id: 3,
      title: t("Pig Farming: Disease Prevention Strategies"),
      description: t("Learn effective disease prevention methods specifically designed for pig farms, including vaccination schedules and sanitation protocols."),
      category: "pig",
      duration: "16:20",
      rating: 4.7,
      views: "18.5K",
      youtubeId: "cc9_SDSgSvY"
    },
    {
      id: 4,
      title: t("Poultry Health Management & Disease Control"),
      description: t("Complete guide to maintaining poultry health, recognizing common diseases, and implementing effective treatment and prevention measures."),
      category: "poultry",
      duration: "13:15",
      rating: 4.6,
      views: "11.8K",
      youtubeId: "rYCL5eQ6dqI"
    },
    {
      id: 5,
      title: t("Professional Cattle Management Systems"),
      description: t("Comprehensive guide to professional cattle management systems covering breeding programs, nutrition planning, and modern farming technologies for enhanced productivity."),
      category: "management",
      duration: "18:45",
      rating: 4.7,
      views: "32.8K",
      youtubeId: "R38LsUMusMA"
    },
    {
      id: 6,
      title: t("Complete Livestock Farm Management Guide"),
      description: t("Comprehensive livestock farm management guide covering animal care, feeding protocols, health monitoring, and maximizing farm productivity."),
      category: "management",
      duration: "19:30",
      rating: 4.8,
      views: "35.6K",
      youtubeId: "H1x2RQv3XPc"
    }
  ];

  const resources = [
    {
      title: t("Livestock Biosecurity & Animal Health Policies"),
      description: t("FAO Biosecurity Principles and Policy Frameworks (Comprehensive global perspective on biosecurity strategies and guidelines)"),
      link: "https://www.fao.org/4/a1140e/a1140e01.pdf",
      type: t("FAO Biosecurity Toolkit PDF")
    },
    {
      title: t("Biosecurity & Biosafety Manual for Bovines in India"),
      description: t("Practical guidelines and checklists tailored for Indian farms"),
      link: "https://epashuhaat.com/India/e-pashudhan/documents/Biosecurity%20and%20Biosafety%20Manual.pdf",
      type: t("Biosecurity & Biosafety Manual PDF")
    },
    {
      title: t("Livestock Emergency Response & Operational Guidelines"),
      description: t("Operational Guidelines for Livestock Health & Disease Control in India"),
      link: "https://megahvt.gov.in/miscellaneous/LH_DC_Operational_Guidelines.pdf",
      type: t("Operational Guidelines Livestock Health PDF")
    },
    {
      title: t("Livestock Emergency Response Plan Template"),
      description: t("Stepwise plan for managing livestock emergencies"),
      link: "https://flsart.org/resource/TLAER/Livestock.pdf",
      type: t("Livestock Emergency Response Plan PDF")
    }
  ];

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openYouTubeVideo = (youtubeId) => {
    window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank');
  };

  const downloadResource = async (url, filename) => {
    try {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'document.pdf';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  };

  return (
    <LearningContainer>
      <LearningHeader>
        <h1>{t('Learning Center')}</h1>
        <p>
          {t('Master biosecurity practices with our comprehensive video tutorials and resources. Learn from experts and protect your farm.')}
        </p>
      </LearningHeader>

      <SearchAndFilter>
        <SearchBox>
          <input
            type="text"
            placeholder={t('Search for topics, diseases, or practices...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FiSearch className="search-icon" />
        </SearchBox>
        
        {categories.map((category) => (
          <FilterButton
            key={category.id}
            active={selectedCategory === category.id}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.label}
          </FilterButton>
        ))}
      </SearchAndFilter>

      <VideoGrid>
        {filteredVideos.map((video, index) => (
          <VideoCard
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <VideoThumbnail 
              onClick={() => openYouTubeVideo(video.youtubeId)}
            >
              <ThumbnailImage 
                youtubeId={video.youtubeId}
                alt={video.title}
              />
              <div className="play-button">
                <FiPlay />
              </div>
              <div className="duration">{video.duration}</div>
            </VideoThumbnail>
            
            <VideoContent>
              <VideoMeta>
                <div className="category">
                  {categories.find(cat => cat.id === video.category)?.label || video.category}
                </div>
                <div className="rating">
                  <FiStar className="stars" />
                  {video.rating} ({video.views})
                </div>
              </VideoMeta>
              
              <h3>{video.title}</h3>
              <p>{video.description}</p>
              
              <VideoActions>
                <ActionButton 
                  className="primary"
                  onClick={() => openYouTubeVideo(video.youtubeId)}
                >
                  <FiPlay /> {t('Watch Now')}
                </ActionButton>
                <ActionButton>
                  <FiBookOpen /> {t('Notes')}
                </ActionButton>
                <ActionButton>
                  <FiExternalLink /> {t('Share')}
                </ActionButton>
              </VideoActions>
            </VideoContent>
          </VideoCard>
        ))}
      </VideoGrid>

      <ResourcesSection>
        <h2>{t('Additional Resources')}</h2>
        <ResourceGrid>
          {resources.map((resource, index) => (
            <ResourceCard
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <h4>{resource.title}</h4>
              <p>{resource.description}</p>
              <span 
                onClick={() => downloadResource(resource.link, `${resource.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#FF7F50',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  transition: 'all 0.3s ease',
                  marginTop: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#FF6A35';
                  e.target.style.textDecorationThickness = '2px';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#FF7F50';
                  e.target.style.textDecorationThickness = '1px';
                  e.target.style.transform = 'translateY(0px)';
                }}
              >
                <FiDownload size={14} />
{t('Download')} {resource.type}
              </span>
            </ResourceCard>
          ))}
        </ResourceGrid>
      </ResourcesSection>
    </LearningContainer>
  );
};

// Risk Assessment page
export const RiskAssessment = () => (
  <Container>
    <Card>
      <h1>Risk Assessment</h1>
      <p>This page will provide risk assessment tools and reports.</p>
    </Card>
  </Container>
);

// Raise Alert page
export const RaiseAlert = RaiseAlertPage;

// Notifications page
export const Notifications = NotificationsPage;

// Profile page
export const Profile = ProfilePage;

// FAQ page
export const FAQ = () => (
  <Container>
    <Card>
      <h1>Frequently Asked Questions</h1>
      <p>This page will contain common questions and answers.</p>
    </Card>
  </Container>
);

// Privacy page
export const Privacy = PrivacyPolicy;

// Settings page
export const Settings = SettingsPage;

// Feedback page
export const Feedback = FeedbackPage;

// Contact Vet page
export const ContactVet = ContactVetPage;

// Contact Us page
export const ContactUs = ContactUsPage;
