import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/translations';

const QuestionnaireContainer = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
`;

const QuestionnaireCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
  margin-bottom: 20px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: #f0f0f0;
  border-radius: 3px;
  margin-bottom: 30px;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, var(--primary-coral), #FF6A35);
  border-radius: 3px;
`;

const Title = styled.h1`
  color: var(--dark-gray);
  text-align: center;
  margin-bottom: 16px;
`;

const Subtitle = styled.p`
  color: #666;
  text-align: center;
  margin-bottom: 40px;
`;

const Question = styled.div`
  margin-bottom: 30px;
  
  h3 {
    color: var(--dark-gray);
    margin-bottom: 16px;
    font-size: 1.1rem;
  }
`;

const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Option = styled.label`
  display: flex;
  align-items: center;
  padding: 12px;
  border: 2px solid ${props => props.checked ? 'var(--primary-coral)' : '#e0e0e0'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-coral);
    background: #fafafa;
  }
  
  input {
    margin-right: 12px;
  }
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: 16px;
  background: ${props => props.disabled ? '#cccccc' : 'var(--primary-coral)'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  margin-top: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.disabled ? '#cccccc' : '#FF6A35'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Questionnaire = () => {
  const { completeQuestionnaire } = useAuth();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  
  // Create translation function using the same system as navbar and landing page
  const getPageTranslation = (text) => getTranslation(text, currentLanguage);

  const questionSteps = [
    {
      title: getPageTranslation('Farm Information'),
      subtitle: getPageTranslation('Tell us about your farm'),
      questions: [
        {
          id: 'farmName',
          question: getPageTranslation('What is your farm name? (Optional)'),
          type: 'text',
          placeholder: getPageTranslation('Enter farm name')
        },
        {
          id: 'farmType',
          question: getPageTranslation('What type of farm do you own?'),
          type: 'radio',
          options: [
            { value: 'pig', label: getPageTranslation('Pig farm') },
            { value: 'poultry', label: getPageTranslation('Poultry farm') },
            { value: 'both', label: getPageTranslation('Both pig and poultry') }
          ]
        },
        {
          id: 'establishedYear',
          question: getPageTranslation('When was your farm established?'),
          type: 'number',
          placeholder: getPageTranslation('Year (e.g., 2015)'),
          min: 1900,
          max: new Date().getFullYear()
        },
        {
          id: 'totalArea',
          question: getPageTranslation('What is the total area of your farm?'),
          type: 'number',
          placeholder: getPageTranslation('Enter area'),
          min: 0
        },
        {
          id: 'areaUnit',
          question: getPageTranslation('Area unit'),
          type: 'radio',
          options: [
            { value: 'acres', label: getPageTranslation('Acres') },
            { value: 'hectares', label: getPageTranslation('Hectares') }
          ]
        }
      ]
    },
    {
      title: getPageTranslation('Animal Details'),
      subtitle: getPageTranslation('Information about your animals'),
      questions: [
        {
          id: 'pigCount',
          question: getPageTranslation('Number of pigs'),
          type: 'number',
          placeholder: '0',
          min: 0
        },
        {
          id: 'poultryCount',
          question: getPageTranslation('Number of poultry birds'),
          type: 'number',
          placeholder: '0',
          min: 0
        }
      ]
    },
    {
      title: getPageTranslation('Farm Operations'),
      subtitle: getPageTranslation('Basic operational information'),
      questions: [
        {
          id: 'totalStaff',
          question: getPageTranslation('How many people work on your farm (including yourself)?'),
          type: 'number',
          placeholder: '1',
          min: 1
        },
        {
          id: 'hasVeterinarian',
          question: getPageTranslation('Do you have access to a veterinarian?'),
          type: 'radio',
          options: [
            { value: 'true', label: getPageTranslation('Yes') },
            { value: 'false', label: getPageTranslation('No') }
          ]
        },
        {
          id: 'farmingPurpose',
          question: getPageTranslation('What is the primary purpose of your farm?'),
          type: 'radio',
          options: [
            { value: 'commercial', label: getPageTranslation('Commercial (for selling)') },
            { value: 'subsistence', label: getPageTranslation('Subsistence (for own use)') },
            { value: 'mixed', label: getPageTranslation('Both commercial and subsistence') }
          ]
        },
        {
          id: 'waterSource',
          question: getPageTranslation('What is your primary water source?'),
          type: 'radio',
          options: [
            { value: 'municipal', label: getPageTranslation('Municipal water supply') },
            { value: 'borewell', label: getPageTranslation('Borewell') },
            { value: 'well', label: getPageTranslation('Open well') },
            { value: 'river', label: getPageTranslation('River/stream') },
            { value: 'other', label: getPageTranslation('Other') }
          ]
        },
        {
          id: 'hasInternet',
          question: getPageTranslation('Do you have internet connectivity at your farm?'),
          type: 'radio',
          options: [
            { value: 'true', label: getPageTranslation('Yes') },
            { value: 'false', label: getPageTranslation('No') }
          ]
        }
      ]
    },
    {
      title: getPageTranslation('Biosecurity Assessment'),
      subtitle: getPageTranslation('Please answer the following questions to assess your farm\'s biosecurity level'),
      questions: [
        {
          id: 'accessControl',
          question: getPageTranslation('Do you have restricted entry for visitors and workers?'),
          type: 'radio',
          options: [
            { value: 'yes', label: getPageTranslation('Yes, only authorized persons can enter'), score: 1 },
            { value: 'partial', label: getPageTranslation('Partially, visitors can enter with some checks'), score: 0.5 },
            { value: 'no', label: getPageTranslation('No restrictions, anyone can enter'), score: 0 }
          ]
        },
        {
          id: 'disinfection',
          question: getPageTranslation('Do you provide footbaths or disinfection facilities at entry points?'),
          type: 'radio',
          options: [
            { value: 'always', label: getPageTranslation('Yes, always maintained and used'), score: 1 },
            { value: 'sometimes', label: getPageTranslation('Yes, but not regularly maintained'), score: 0.5 },
            { value: 'never', label: getPageTranslation('No, such facilities are not available'), score: 0 }
          ]
        },
        {
          id: 'quarantine',
          question: getPageTranslation('When introducing new pigs or poultry, do you quarantine them before mixing with the existing stock?'),
          type: 'radio',
          options: [
            { value: 'always', label: getPageTranslation('Yes, always'), score: 1 },
            { value: 'sometimes', label: getPageTranslation('Sometimes'), score: 0.5 },
            { value: 'never', label: getPageTranslation('Never'), score: 0 }
          ]
        },
        {
          id: 'feedSafety',
          question: getPageTranslation('How do you ensure feed and water are safe?'),
          type: 'radio',
          options: [
            { value: 'verified', label: getPageTranslation('Sourced from verified suppliers & stored hygienically'), score: 1 },
            { value: 'partial', label: getPageTranslation('Stored properly but source not always verified'), score: 0.5 },
            { value: 'none', label: getPageTranslation('No specific checks are done'), score: 0 }
          ]
        },
        {
          id: 'pestControl',
          question: getPageTranslation('Do you have measures to prevent contact with rodents, wild birds, or stray animals?'),
          type: 'radio',
          options: [
            { value: 'strict', label: getPageTranslation('Yes, strict control measures in place'), score: 1 },
            { value: 'some', label: getPageTranslation('Some control measures but not complete'), score: 0.5 },
            { value: 'none', label: getPageTranslation('No such measures'), score: 0 }
          ]
        },
        {
          id: 'wasteManagement',
          question: getPageTranslation('How is manure and dead animal disposal handled?'),
          type: 'radio',
          options: [
            { value: 'proper', label: getPageTranslation('Properly disposed through burial/incineration/approved methods'), score: 1 },
            { value: 'sometimes', label: getPageTranslation('Sometimes managed properly, sometimes left in open'), score: 0.5 },
            { value: 'open', label: getPageTranslation('Always left in open areas'), score: 0 }
          ]
        },
        {
          id: 'workerHygiene',
          question: getPageTranslation('Do workers change clothes, wear boots, and wash hands before entering animal sheds?'),
          type: 'radio',
          options: [
            { value: 'strict', label: getPageTranslation('Yes, strictly followed'), score: 1 },
            { value: 'sometimes', label: getPageTranslation('Sometimes followed'), score: 0.5 },
            { value: 'not', label: getPageTranslation('Not followed'), score: 0 }
          ]
        },
        {
          id: 'farmSeparation',
          question: getPageTranslation('Is your farm located away from other farms or live animal markets?'),
          type: 'radio',
          options: [
            { value: 'far', label: getPageTranslation('Yes, more than 1 km away'), score: 1 },
            { value: 'moderate', label: getPageTranslation('Moderately close (within 500 m)'), score: 0.5 },
            { value: 'close', label: getPageTranslation('Very close or within a cluster'), score: 0 }
          ]
        },
        {
          id: 'monitoring',
          question: getPageTranslation('Do you regularly monitor animals for disease symptoms and report unusual mortality?'),
          type: 'radio',
          options: [
            { value: 'daily', label: getPageTranslation('Yes, daily monitoring and immediate reporting'), score: 1 },
            { value: 'sometimes', label: getPageTranslation('Sometimes monitor and report late'), score: 0.5 },
            { value: 'none', label: getPageTranslation('No regular monitoring or reporting'), score: 0 }
          ]
        }
      ]
    }
  ];
  
  const currentStepData = questionSteps[currentStep];
  const totalQuestions = questionSteps.reduce((sum, step) => sum + step.questions.length, 0);
  const progress = (Object.keys(answers).length / totalQuestions) * 100;

  const handleAnswerChange = (questionId, value, score = null) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { value, score }
    }));
  };

  const handleNext = () => {
    console.log('Next button clicked. Current step:', currentStep);
    console.log('Current step completion status:', isStepComplete());
    console.log('Current answers:', answers);
    
    if (currentStep < questionSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepComplete = () => {
    const requiredQuestions = currentStepData.questions.filter(q => {
      // Farm name is optional, other fields are required
      return q.id !== 'farmName';
    });
    
    console.log('Checking step completion for step:', currentStep);
    console.log('Required questions:', requiredQuestions.map(q => q.id));
    
    const completed = requiredQuestions.every(question => {
      const answer = answers[question.id]?.value;
      console.log(`Question ${question.id}: answer = '${answer}', type = ${question.type}`);
      
      // For number inputs, consider 0 as a valid value
      if (question.type === 'number') {
        const isValid = answer !== undefined && answer !== '' && answer !== null;
        console.log(`Number validation for ${question.id}: ${isValid}`);
        return isValid;
      }
      // For radio buttons, check if value exists
      if (question.type === 'radio') {
        const isValid = answer !== undefined && answer !== '' && answer !== null;
        console.log(`Radio validation for ${question.id}: ${isValid}`);
        return isValid;
      }
      // For other types, check if value exists
      const isValid = answer !== undefined && answer !== '' && answer !== null;
      console.log(`Other validation for ${question.id}: ${isValid}`);
      return isValid;
    });
    
    console.log('Step completion result:', completed);
    return completed;
  };

  const handleSubmit = () => {
    console.log('Complete Assessment button clicked!');
    console.log('Final step completion status:', isStepComplete());
    console.log('All answers:', answers);
    
    // Calculate biosecurity score from the last step (all questions now have scores)
    const biosecurityQuestions = questionSteps[3].questions;
    const biosecurityScore = biosecurityQuestions.reduce((sum, question) => {
      const answer = answers[question.id];
      return sum + (answer?.score || 0);
    }, 0);
    
    console.log('Calculated biosecurity score:', biosecurityScore);
    const maxBiosecurityScore = biosecurityQuestions.length;
    const biosecurityPercentage = (biosecurityScore / maxBiosecurityScore) * 100;
    
    // Prepare farm details
    const farmDetails = {
      name: answers.farmName?.value || '',
      type: answers.farmType?.value,
      establishedYear: parseInt(answers.establishedYear?.value) || null,
      totalArea: parseFloat(answers.totalArea?.value) || null,
      areaUnit: answers.areaUnit?.value || 'acres',
      animalCount: {
        pigs: parseInt(answers.pigCount?.value) || 0,
        poultry: parseInt(answers.poultryCount?.value) || 0,
        cattle: 0,
        others: 0
      },
      totalStaff: parseInt(answers.totalStaff?.value) || 1,
      hasVeterinarian: answers.hasVeterinarian?.value === 'true',
      farmingPurpose: answers.farmingPurpose?.value || 'mixed',
      waterSource: answers.waterSource?.value || 'borewell',
      hasInternet: answers.hasInternet?.value === 'true',
      biosecurityScore: {
        total: biosecurityScore,
        percentage: biosecurityPercentage
      }
    };
    
    const questionnaireData = {
      answers,
      farmDetails,
      biosecurityScore,
      maxBiosecurityScore,
      completedAt: new Date().toISOString()
    };

    completeQuestionnaire(questionnaireData);

    if (biosecurityScore >= 7) {
      navigate('/dashboard');
    } else {
      navigate('/warning');
    }
  };

  return (
    <QuestionnaireContainer>
      <QuestionnaireCard
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>{currentStepData.title}</Title>
        <Subtitle>{currentStepData.subtitle}</Subtitle>
        
        <ProgressBar>
          <ProgressFill
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </ProgressBar>
        
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px', fontSize: '14px' }}>
          {getPageTranslation('Step')} {currentStep + 1} {getPageTranslation('of')} {questionSteps.length} - {Object.keys(answers).length} {getPageTranslation('of')} {totalQuestions} {getPageTranslation('completed')}
        </p>

        {currentStepData.questions.map((question, index) => (
          <Question key={question.id}>
            <h3>{index + 1}. {question.question}</h3>
            {question.type === 'text' && (
              <input
                type="text"
                value={answers[question.id]?.value || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                placeholder={question.placeholder}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            )}
            {question.type === 'number' && (
              <input
                type="number"
                value={answers[question.id]?.value || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                placeholder={question.placeholder}
                min={question.min}
                max={question.max}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            )}
            {question.type === 'radio' && (
              <Options>
                {question.options.map((option) => (
                  <Option
                    key={option.value}
                    checked={answers[question.id]?.value === option.value}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      checked={answers[question.id]?.value === option.value}
                      onChange={() => handleAnswerChange(question.id, option.value, option.score)}
                    />
                    {option.label}
                  </Option>
                ))}
              </Options>
            )}
          </Question>
        ))}

        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
          {currentStep > 0 && (
            <SubmitButton
              onClick={handlePrevious}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ flex: 1, background: '#6c757d' }}
            >
              {getPageTranslation('Previous')}
            </SubmitButton>
          )}
          
          {currentStep < questionSteps.length - 1 ? (
            <SubmitButton
              onClick={handleNext}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!isStepComplete()}
              style={{ flex: 1 }}
            >
              {getPageTranslation('Next')}
            </SubmitButton>
          ) : (
            <SubmitButton
              onClick={handleSubmit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!isStepComplete()}
              style={{ 
                flex: 1,
                background: !isStepComplete() ? '#cccccc' : 'var(--primary-coral)',
                cursor: !isStepComplete() ? 'not-allowed' : 'pointer'
              }}
            >
              {getPageTranslation('Complete Assessment')}
            </SubmitButton>
          )}
        </div>
      </QuestionnaireCard>
    </QuestionnaireContainer>
  );
};

export default Questionnaire;