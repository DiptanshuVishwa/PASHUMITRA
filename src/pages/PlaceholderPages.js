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
  background: ${props => `linear-gradient(45deg, var(--primary-coral), #FF6A35), url(${props.thumbnail})`};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
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

// Learning page
export const Learning = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'biosecurity', label: 'Biosecurity Basics' },
    { id: 'pig', label: 'Pig Farming' },
    { id: 'poultry', label: 'Poultry Farming' },
    { id: 'diseases', label: 'Disease Prevention' },
    { id: 'management', label: 'Farm Management' }
  ];

  const videos = [
    {
      id: 1,
      title: "Biosecurity Fundamentals for Pig Farms",
      description: "Learn the essential biosecurity measures every pig farmer should implement to prevent disease outbreaks.",
      category: "biosecurity",
      duration: "15:30",
      rating: 4.8,
      views: "12.5K",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      youtubeId: "dQw4w9WgXcQ"
    },
    {
      id: 2,
      title: "Poultry Farm Disinfection Procedures",
      description: "Step-by-step guide on proper disinfection techniques for poultry farms to maintain optimal health.",
      category: "poultry",
      duration: "12:45",
      rating: 4.6,
      views: "8.3K",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      youtubeId: "dQw4w9WgXcQ"
    },
    {
      id: 3,
      title: "African Swine Fever Prevention",
      description: "Critical information about preventing African Swine Fever and protecting your pig farm.",
      category: "diseases",
      duration: "18:20",
      rating: 4.9,
      views: "25.1K",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      youtubeId: "dQw4w9WgXcQ"
    },
    {
      id: 4,
      title: "Feed Safety and Storage Best Practices",
      description: "How to ensure feed quality and safety through proper storage and handling procedures.",
      category: "management",
      duration: "10:15",
      rating: 4.7,
      views: "6.8K",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      youtubeId: "dQw4w9WgXcQ"
    },
    {
      id: 5,
      title: "Avian Influenza: Signs and Prevention",
      description: "Recognize early signs of avian influenza and implement effective prevention strategies.",
      category: "diseases",
      duration: "14:30",
      rating: 4.8,
      views: "18.9K",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      youtubeId: "dQw4w9WgXcQ"
    },
    {
      id: 6,
      title: "Worker Hygiene and Training",
      description: "Train your farm workers on proper hygiene practices and biosecurity protocols.",
      category: "management",
      duration: "11:45",
      rating: 4.5,
      views: "5.2K",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      youtubeId: "dQw4w9WgXcQ"
    }
  ];

  const resources = [
    {
      title: "Biosecurity Manual",
      description: "Comprehensive guide covering all aspects of farm biosecurity.",
      link: "#",
      type: "PDF Guide"
    },
    {
      title: "Disease Prevention Checklist",
      description: "Daily and weekly checkpoints for disease prevention.",
      link: "#",
      type: "Checklist"
    },
    {
      title: "Emergency Response Plan",
      description: "What to do when disease outbreak is suspected.",
      link: "#",
      type: "Action Plan"
    },
    {
      title: "Government Guidelines",
      description: "Official biosecurity guidelines from DAHD.",
      link: "#",
      type: "Official Document"
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

  return (
    <LearningContainer>
      <LearningHeader>
        <h1>Learning Center</h1>
        <p>
          Master biosecurity practices with our comprehensive video tutorials and resources.
          Learn from experts and protect your farm.
        </p>
      </LearningHeader>

      <SearchAndFilter>
        <SearchBox>
          <input
            type="text"
            placeholder="Search for topics, diseases, or practices..."
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
              thumbnail={video.thumbnail}
              onClick={() => openYouTubeVideo(video.youtubeId)}
            >
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
                  <FiPlay /> Watch Now
                </ActionButton>
                <ActionButton>
                  <FiBookOpen /> Notes
                </ActionButton>
                <ActionButton>
                  <FiExternalLink /> Share
                </ActionButton>
              </VideoActions>
            </VideoContent>
          </VideoCard>
        ))}
      </VideoGrid>

      <ResourcesSection>
        <h2>Additional Resources</h2>
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
              <a href={resource.link}>
                <FiDownload />
                Download {resource.type}
              </a>
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
