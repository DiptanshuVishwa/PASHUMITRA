import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiDownload,
  FiRefreshCw,
  FiInfo,
  FiTarget,
  FiHome,
  FiUsers,
  FiTruck,
  FiDroplet,
  FiActivity
} from 'react-icons/fi';

const AssessmentContainer = styled.div`
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
  }
  
  .shield-icon {
    color: #28a745;
    font-size: 2.5rem;
  }
  
  p {
    font-size: 1.2rem;
    color: #666;
    max-width: 800px;
    margin: 0 auto;
  }
`;

const AssessmentContent = styled(motion.div)`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const QuestionnaireSection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  height: fit-content;
`;

const ResultsPanel = styled.div`
  position: sticky;
  top: 20px;
  height: fit-content;
`;

const ScoreCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  text-align: center;
`;

const ScoreDisplay = styled.div`
  margin-bottom: 20px;
  
  .score-number {
    font-size: 3rem;
    font-weight: 700;
    color: ${props => {
      if (props.score >= 80) return '#28a745';
      if (props.score >= 60) return '#ffc107';
      return '#dc3545';
    }};
    margin-bottom: 8px;
  }
  
  .score-label {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 15px;
  }
`;

const RiskLevel = styled.div`
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 14px;
  background: ${props => {
    if (props.level === 'low') return 'rgba(40, 167, 69, 0.1)';
    if (props.level === 'medium') return 'rgba(255, 193, 7, 0.1)';
    return 'rgba(220, 53, 69, 0.1)';
  }};
  color: ${props => {
    if (props.level === 'low') return '#28a745';
    if (props.level === 'medium') return '#ffc107';
    return '#dc3545';
  }};
  border: 2px solid ${props => {
    if (props.level === 'low') return '#28a745';
    if (props.level === 'medium') return '#ffc107';
    return '#dc3545';
  }};
`;

const CategorySection = styled.div`
  margin-bottom: 30px;
  
  .category-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding: 15px 20px;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    border-radius: 12px;
    border-left: 4px solid var(--primary-coral);
  }
  
  .category-icon {
    color: var(--primary-coral);
    font-size: 20px;
  }
  
  .category-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--dark-gray);
  }
`;

const Question = styled.div`
  margin-bottom: 25px;
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  background: white;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-coral);
    box-shadow: 0 4px 12px rgba(255, 127, 80, 0.1);
  }
  
  .question-text {
    font-size: 1rem;
    font-weight: 500;
    color: var(--dark-gray);
    margin-bottom: 15px;
    line-height: 1.5;
  }
  
  .question-description {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 15px;
    font-style: italic;
  }
`;

const AnswerOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
`;

const AnswerButton = styled.button`
  padding: 12px 20px;
  border: 2px solid ${props => props.selected ? '#28a745' : '#e0e0e0'};
  background: ${props => props.selected ? 'rgba(40, 167, 69, 0.1)' : 'white'};
  color: ${props => props.selected ? '#28a745' : '#666'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 14px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #28a745;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  margin-bottom: 30px;
  overflow: hidden;
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-coral), #ff6b35);
    width: ${props => props.progress}%;
    transition: width 0.3s ease;
    border-radius: 4px;
  }
`;

const ProgressText = styled.div`
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
`;

const RecommendationsCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const RecommendationItem = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid ${props => {
    if (props.priority === 'high') return '#dc3545';
    if (props.priority === 'medium') return '#ffc107';
    return '#28a745';
  }};
  
  .priority-icon {
    color: ${props => {
      if (props.priority === 'high') return '#dc3545';
      if (props.priority === 'medium') return '#ffc107';
      return '#28a745';
    }};
    margin-top: 2px;
  }
  
  .recommendation-text {
    flex: 1;
    font-size: 14px;
    line-height: 1.4;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
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
      background: #ff4500;
      transform: translateY(-2px);
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #545b62;
      transform: translateY(-2px);
    }
  }
`;

const RiskAssessmentPage = () => {
  const [answers, setAnswers] = useState({});
  const [currentScore, setCurrentScore] = useState(0);
  const [assessmentComplete, setAssessmentComplete] = useState(false);

  // Risk assessment questionnaire data
  const assessmentCategories = [
    {
      id: 'facility',
      title: 'Farm Infrastructure & Biosecurity',
      icon: FiHome,
      questions: [
        {
          id: 'entry_control',
          text: 'Do you have controlled entry points to your farm with disinfection facilities?',
          description: 'Entry control prevents contamination from vehicles, people, and equipment',
          options: [
            { value: 'always', text: 'Always', score: 10 },
            { value: 'sometimes', text: 'Sometimes', score: 6 },
            { value: 'rarely', text: 'Rarely', score: 3 },
            { value: 'never', text: 'Never', score: 0 }
          ]
        },
        {
          id: 'quarantine_facilities',
          text: 'Do you have dedicated quarantine facilities for new or sick animals?',
          description: 'Quarantine prevents disease spread from new arrivals or infected animals',
          options: [
            { value: 'dedicated', text: 'Dedicated Facility', score: 10 },
            { value: 'temporary', text: 'Temporary Setup', score: 6 },
            { value: 'same_area', text: 'Same Area', score: 2 },
            { value: 'none', text: 'No Quarantine', score: 0 }
          ]
        },
        {
          id: 'fencing',
          text: 'How secure is your farm perimeter fencing?',
          description: 'Proper fencing prevents unauthorized access and wildlife intrusion',
          options: [
            { value: 'excellent', text: 'Excellent', score: 10 },
            { value: 'good', text: 'Good', score: 7 },
            { value: 'adequate', text: 'Adequate', score: 4 },
            { value: 'poor', text: 'Poor', score: 0 }
          ]
        }
      ]
    },
    {
      id: 'personnel',
      title: 'Personnel & Visitor Management',
      icon: FiUsers,
      questions: [
        {
          id: 'staff_training',
          text: 'How frequently do you conduct biosecurity training for farm staff?',
          description: 'Regular training ensures staff follow proper biosecurity protocols',
          options: [
            { value: 'monthly', text: 'Monthly', score: 10 },
            { value: 'quarterly', text: 'Quarterly', score: 7 },
            { value: 'annually', text: 'Annually', score: 4 },
            { value: 'never', text: 'Never', score: 0 }
          ]
        },
        {
          id: 'visitor_protocol',
          text: 'Do you have strict visitor protocols including health checks and protective clothing?',
          description: 'Visitor protocols prevent disease introduction from external sources',
          options: [
            { value: 'strict', text: 'Very Strict', score: 10 },
            { value: 'moderate', text: 'Moderate', score: 6 },
            { value: 'basic', text: 'Basic Only', score: 3 },
            { value: 'none', text: 'No Protocols', score: 0 }
          ]
        }
      ]
    },
    {
      id: 'vehicles',
      title: 'Vehicle & Equipment Management',
      icon: FiTruck,
      questions: [
        {
          id: 'vehicle_disinfection',
          text: 'Do you disinfect all vehicles entering your farm premises?',
          description: 'Vehicle disinfection prevents pathogen transmission via contaminated surfaces',
          options: [
            { value: 'always', text: 'Always', score: 10 },
            { value: 'delivery_only', text: 'Delivery Vehicles Only', score: 6 },
            { value: 'sometimes', text: 'Sometimes', score: 3 },
            { value: 'never', text: 'Never', score: 0 }
          ]
        },
        {
          id: 'equipment_sharing',
          text: 'How do you manage shared equipment with other farms?',
          description: 'Shared equipment can be a major source of disease transmission',
          options: [
            { value: 'disinfect', text: 'Always Disinfect', score: 10 },
            { value: 'avoid', text: 'Avoid Sharing', score: 8 },
            { value: 'sometimes', text: 'Sometimes Clean', score: 4 },
            { value: 'no_precautions', text: 'No Precautions', score: 0 }
          ]
        }
      ]
    },
    {
      id: 'water_feed',
      title: 'Water & Feed Quality Management',
      icon: FiDroplet,
      questions: [
        {
          id: 'water_source',
          text: 'What is your primary water source and how do you ensure its quality?',
          description: 'Clean water is essential for animal health and disease prevention',
          options: [
            { value: 'tested_treated', text: 'Tested & Treated', score: 10 },
            { value: 'borewell', text: 'Protected Borewell', score: 7 },
            { value: 'municipal', text: 'Municipal Supply', score: 6 },
            { value: 'untested', text: 'Untested Source', score: 0 }
          ]
        },
        {
          id: 'feed_storage',
          text: 'How do you store and manage animal feed to prevent contamination?',
          description: 'Proper feed storage prevents mold, pests, and contamination',
          options: [
            { value: 'sealed_containers', text: 'Sealed Containers', score: 10 },
            { value: 'covered_dry', text: 'Covered & Dry', score: 7 },
            { value: 'basic_cover', text: 'Basic Cover', score: 4 },
            { value: 'open_storage', text: 'Open Storage', score: 0 }
          ]
        }
      ]
    },
    {
      id: 'health_monitoring',
      title: 'Animal Health Monitoring',
      icon: FiActivity,
      questions: [
        {
          id: 'health_checks',
          text: 'How frequently do you conduct health checks on your animals?',
          description: 'Regular health monitoring helps detect diseases early',
          options: [
            { value: 'daily', text: 'Daily', score: 10 },
            { value: 'weekly', text: 'Weekly', score: 7 },
            { value: 'monthly', text: 'Monthly', score: 4 },
            { value: 'when_sick', text: 'Only When Sick', score: 0 }
          ]
        },
        {
          id: 'vaccination_program',
          text: 'Do you follow a regular vaccination schedule for your animals?',
          description: 'Vaccinations are crucial for preventing infectious diseases',
          options: [
            { value: 'strict_schedule', text: 'Strict Schedule', score: 10 },
            { value: 'mostly_follow', text: 'Mostly Follow', score: 7 },
            { value: 'basic', text: 'Basic Vaccines', score: 4 },
            { value: 'no_schedule', text: 'No Schedule', score: 0 }
          ]
        },
        {
          id: 'record_keeping',
          text: 'How detailed are your animal health and treatment records?',
          description: 'Good records help track health patterns and treatment effectiveness',
          options: [
            { value: 'comprehensive', text: 'Comprehensive', score: 10 },
            { value: 'basic', text: 'Basic Records', score: 6 },
            { value: 'minimal', text: 'Minimal', score: 3 },
            { value: 'none', text: 'No Records', score: 0 }
          ]
        }
      ]
    }
  ];

  const handleAnswerChange = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const calculateScore = useCallback(() => {
    let totalScore = 0;
    let maxScore = 0;
    
    assessmentCategories.forEach(category => {
      category.questions.forEach(question => {
        maxScore += 10;
        if (answers[question.id]) {
          totalScore += answers[question.id].score;
        }
      });
    });
    
    return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  }, [answers, assessmentCategories]);

  const getRiskLevel = (score) => {
    if (score >= 80) return { level: 'low', text: 'Low Risk' };
    if (score >= 60) return { level: 'medium', text: 'Medium Risk' };
    return { level: 'high', text: 'High Risk' };
  };

  const getRecommendations = (score) => {
    const recommendations = [];
    
    assessmentCategories.forEach(category => {
      category.questions.forEach(question => {
        const answer = answers[question.id];
        if (!answer || answer.score < 7) {
          let priority = 'medium';
          let text = '';
          
          if (answer?.score === 0 || !answer) {
            priority = 'high';
            text = `Immediate attention needed: ${question.text.replace('?', '')} - This is critical for biosecurity.`;
          } else if (answer.score < 5) {
            priority = 'medium';
            text = `Improvement needed: ${question.text.replace('?', '')} - Consider upgrading your current practices.`;
          } else {
            priority = 'low';
            text = `Enhancement opportunity: ${question.text.replace('?', '')} - Good foundation but room for improvement.`;
          }
          
          recommendations.push({ text, priority });
        }
      });
    });
    
    if (recommendations.length === 0) {
      recommendations.push({
        text: 'Excellent biosecurity practices! Continue monitoring and maintaining your current standards.',
        priority: 'low'
      });
    }
    
    return recommendations;
  };

  const getTotalQuestions = useCallback(() => {
    return assessmentCategories.reduce((total, category) => total + category.questions.length, 0);
  }, [assessmentCategories]);

  const getAnsweredQuestions = useCallback(() => {
    return Object.keys(answers).length;
  }, [answers]);

  const getProgress = () => {
    const total = getTotalQuestions();
    const answered = getAnsweredQuestions();
    return total > 0 ? (answered / total) * 100 : 0;
  };

  useEffect(() => {
    const score = calculateScore();
    setCurrentScore(score);
    setAssessmentComplete(getAnsweredQuestions() === getTotalQuestions());
  }, [calculateScore, getAnsweredQuestions, getTotalQuestions]);

  const resetAssessment = () => {
    setAnswers({});
    setCurrentScore(0);
    setAssessmentComplete(false);
  };

  const downloadReport = () => {
    // Placeholder for PDF generation
    alert('Assessment report download feature will be implemented soon!');
  };

  const risk = getRiskLevel(currentScore);
  const recommendations = getRecommendations(currentScore);

  return (
    <AssessmentContainer>
      <Header>
        <h1>
          <FiShield className="shield-icon" />
          Biosecurity Risk Assessment
        </h1>
        <p>
          Evaluate your farm's biosecurity measures and receive personalized recommendations 
          to improve animal health and prevent disease outbreaks.
        </p>
      </Header>

      <AssessmentContent
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <QuestionnaireSection>
          <ProgressBar progress={getProgress()}>
            <div className="progress-fill"></div>
          </ProgressBar>
          
          <ProgressText>
            Progress: {getAnsweredQuestions()} of {getTotalQuestions()} questions answered 
            ({Math.round(getProgress())}%)
          </ProgressText>

          {assessmentCategories.map((category) => (
            <CategorySection key={category.id}>
              <div className="category-header">
                <category.icon className="category-icon" />
                <div className="category-title">{category.title}</div>
              </div>

              {category.questions.map((question) => (
                <Question key={question.id}>
                  <div className="question-text">{question.text}</div>
                  <div className="question-description">{question.description}</div>
                  
                  <AnswerOptions>
                    {question.options.map((option) => (
                      <AnswerButton
                        key={option.value}
                        selected={answers[question.id]?.value === option.value}
                        onClick={() => handleAnswerChange(question.id, option)}
                      >
                        {option.text}
                      </AnswerButton>
                    ))}
                  </AnswerOptions>
                </Question>
              ))}
            </CategorySection>
          ))}
        </QuestionnaireSection>

        <ResultsPanel>
          <ScoreCard>
            <ScoreDisplay score={currentScore}>
              <div className="score-number">{currentScore}</div>
              <div className="score-label">Biosecurity Score</div>
            </ScoreDisplay>
            
            <RiskLevel level={risk.level}>
              {risk.text}
            </RiskLevel>

            <ActionButtons>
              <ActionButton className="secondary" onClick={resetAssessment}>
                <FiRefreshCw />
                Reset
              </ActionButton>
              {assessmentComplete && (
                <ActionButton className="primary" onClick={downloadReport}>
                  <FiDownload />
                  Report
                </ActionButton>
              )}
            </ActionButtons>
          </ScoreCard>

          {recommendations.length > 0 && (
            <RecommendationsCard>
              <h3 style={{ 
                fontSize: '1.2rem', 
                marginBottom: '20px', 
                color: 'var(--dark-gray)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FiTarget />
                Recommendations
              </h3>
              
              {recommendations.slice(0, 5).map((rec, index) => (
                <RecommendationItem key={index} priority={rec.priority}>
                  <div className="priority-icon">
                    {rec.priority === 'high' && <FiAlertTriangle />}
                    {rec.priority === 'medium' && <FiInfo />}
                    {rec.priority === 'low' && <FiCheckCircle />}
                  </div>
                  <div className="recommendation-text">
                    {rec.text}
                  </div>
                </RecommendationItem>
              ))}
              
              {recommendations.length > 5 && (
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '15px', 
                  color: '#666', 
                  fontSize: '14px' 
                }}>
                  +{recommendations.length - 5} more recommendations in full report
                </div>
              )}
            </RecommendationsCard>
          )}
        </ResultsPanel>
      </AssessmentContent>
    </AssessmentContainer>
  );
};

export default RiskAssessmentPage;