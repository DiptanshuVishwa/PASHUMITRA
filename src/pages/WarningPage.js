import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiAlertTriangle, 
  FiVolumeX, 
  FiVolume2, 
  FiShield, 
  FiCheckCircle,
  FiBookOpen,
  FiRefreshCw,
  FiHome
} from 'react-icons/fi';

const WarningContainer = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
`;

const WarningCard = styled(motion.div)`
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  color: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
`;

const WarningIcon = styled(motion.div)`
  font-size: 80px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
`;

const Title = styled.h1`
  color: white;
  margin-bottom: 16px;
  font-size: 2.5rem;
  font-weight: 800;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Message = styled.p`
  color: white;
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.95;
  line-height: 1.6;
`;

const SpeakerButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 12px 24px;
  border-radius: 50px;
  margin: 20px 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
  
  &.active {
    background: rgba(255, 255, 255, 0.9);
    color: #FF6B6B;
  }
`;

const RecommendationsSection = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  color: var(--dark-gray);
  font-size: 2rem;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const RecommendationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
`;

const RecommendationCard = styled(motion.div)`
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 15px;
  padding: 25px;
  border-left: 5px solid var(--primary-coral);
  
  .icon {
    color: var(--primary-coral);
    font-size: 24px;
    margin-bottom: 12px;
  }
  
  h3 {
    color: var(--dark-gray);
    margin-bottom: 12px;
    font-size: 1.2rem;
  }
  
  p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 15px;
  }
  
  .priority {
    display: inline-block;
    background: var(--primary-coral);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-top: 30px;
`;

const ActionButton = styled(motion.button)`
  padding: 15px 30px;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  
  &.primary {
    background: linear-gradient(135deg, var(--primary-coral), #FF6A35);
    color: white;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(255, 127, 80, 0.4);
    }
  }
  
  &.secondary {
    background: transparent;
    color: var(--dark-gray);
    border: 2px solid #e0e0e0;
    
    &:hover {
      border-color: var(--primary-coral);
      color: var(--primary-coral);
      transform: translateY(-2px);
    }
  }
`;

const LearnButton = styled(Link)`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 16px 32px;
  text-decoration: none;
  border-radius: 50px;
  display: inline-block;
  margin: 10px;
  font-weight: bold;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const WarningPage = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);

  const recommendations = [
    {
      icon: <FiShield />,
      title: "Implement Access Control",
      description: "Restrict farm entry to authorized personnel only. Install proper gates and maintain visitor logs.",
      priority: "High"
    },
    {
      icon: <FiCheckCircle />,
      title: "Install Disinfection Facilities",
      description: "Set up footbaths and disinfection stations at all entry points. Maintain them regularly.",
      priority: "Critical"
    },
    {
      icon: <FiShield />,
      title: "Establish Quarantine Protocols",
      description: "Always quarantine new animals before introducing them to existing stock.",
      priority: "Critical"
    },
    {
      icon: <FiCheckCircle />,
      title: "Improve Feed Safety",
      description: "Source feed from verified suppliers and store in hygienic conditions.",
      priority: "Medium"
    },
    {
      icon: <FiShield />,
      title: "Pest Control Measures",
      description: "Implement strict controls to prevent contact with rodents, wild birds, and stray animals.",
      priority: "High"
    },
    {
      icon: <FiCheckCircle />,
      title: "Proper Waste Management",
      description: "Dispose of manure and dead animals through approved methods like burial or incineration.",
      priority: "Critical"
    }
  ];

  const getFullWarningText = () => {
    let text = `
      Attention farmer! Your farm is currently at high risk of biosecurity breaches. 
      Your biosecurity score indicates urgent corrective action is needed to protect your livestock. 
      Please implement the recommended measures immediately to ensure the safety of your animals 
      and prevent disease outbreaks. Your farm's health and productivity depend on these critical improvements.
      
      Here are the priority recommendations:
    `;
    
    recommendations.forEach((rec, index) => {
      text += `
      Recommendation ${index + 1}: ${rec.title}. 
      ${rec.description} 
      Priority level: ${rec.priority}.
      `;
    });
    
    text += `
      Please take immediate action on these recommendations to protect your farm and livestock. 
      Visit our learning center for detailed guidance on implementing these measures.
    `;
    
    return text;
  };

  const handleTextToSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const fullText = getFullWarningText();
        const utterance = new SpeechSynthesisUtterance(fullText);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert('Text-to-speech is not supported in this browser');
    }
  };

  const handleRetakeQuestionnaire = () => {
    navigate('/questionnaire');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <WarningContainer>
      <WarningCard
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <WarningIcon
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -10, 10, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <FiAlertTriangle />
        </WarningIcon>
        <Title>Farm is in Danger!</Title>
        <Message>High Risk of Outbreaks - Urgent Corrective Action Needed</Message>
        
        <SpeakerButton 
          className={isPlaying ? 'active' : ''}
          onClick={handleTextToSpeech}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? <FiVolumeX /> : <FiVolume2 />}
          {isPlaying ? 'Stop Audio' : 'Play Audio Warning'}
        </SpeakerButton>

        <LearnButton to="/learning">
          <FiBookOpen style={{ marginRight: '8px' }} />
          Visit Learning Section
        </LearnButton>
      </WarningCard>

      <RecommendationsSection
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <SectionTitle>
          <FiShield />
          Immediate Actions Required
        </SectionTitle>
        
        <RecommendationGrid>
          {recommendations.map((rec, index) => (
            <RecommendationCard
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ y: -5, shadow: "0 10px 25px rgba(0,0,0,0.1)" }}
            >
              <div className="icon">{rec.icon}</div>
              <h3>{rec.title}</h3>
              <p>{rec.description}</p>
              <div className="priority">{rec.priority} Priority</div>
            </RecommendationCard>
          ))}
        </RecommendationGrid>
        
        <ActionButtons>
          <ActionButton
            className="primary"
            onClick={() => navigate('/learning')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiBookOpen />
            Learn More
          </ActionButton>
          
          <ActionButton
            className="secondary"
            onClick={handleRetakeQuestionnaire}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiRefreshCw />
            Retake Assessment
          </ActionButton>
          
          <ActionButton
            className="secondary"
            onClick={handleGoHome}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiHome />
            Go Home
          </ActionButton>
        </ActionButtons>
      </RecommendationsSection>
    </WarningContainer>
  );
};

export default WarningPage;