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
  background: var(--primary-coral);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  
  &:hover {
    background: #FF6A35;
  }
`;

const Questionnaire = () => {
  const { completeQuestionnaire } = useAuth();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  
  // Create translation function using the same system as navbar and landing page
  const getPageTranslation = (text) => getTranslation(text, currentLanguage);

  const questions = [
    {
      id: 'farmType',
      question: getPageTranslation('What type of farm do you own?'),
      options: [
        { value: 'pig', label: getPageTranslation('Pig farm'), score: 0 },
        { value: 'poultry', label: getPageTranslation('Poultry farm'), score: 0 },
        { value: 'both', label: getPageTranslation('Both pig and poultry'), score: 0 }
      ]
    },
    {
      id: 'accessControl',
      question: getPageTranslation('Do you have restricted entry for visitors and workers?'),
      options: [
        { value: 'yes', label: getPageTranslation('Yes, only authorized persons can enter'), score: 1 },
        { value: 'partial', label: getPageTranslation('Partially, visitors can enter with some checks'), score: 0.5 },
        { value: 'no', label: getPageTranslation('No restrictions, anyone can enter'), score: 0 }
      ]
    },
    {
      id: 'disinfection',
      question: getPageTranslation('Do you provide footbaths or disinfection facilities at entry points?'),
      options: [
        { value: 'always', label: getPageTranslation('Yes, always maintained and used'), score: 1 },
        { value: 'sometimes', label: getPageTranslation('Yes, but not regularly maintained'), score: 0.5 },
        { value: 'never', label: getPageTranslation('No, such facilities are not available'), score: 0 }
      ]
    },
    {
      id: 'quarantine',
      question: getPageTranslation('When introducing new pigs or poultry, do you quarantine them before mixing with the existing stock?'),
      options: [
        { value: 'always', label: getPageTranslation('Yes, always'), score: 1 },
        { value: 'sometimes', label: getPageTranslation('Sometimes'), score: 0.5 },
        { value: 'never', label: getPageTranslation('Never'), score: 0 }
      ]
    },
    {
      id: 'feedSafety',
      question: getPageTranslation('How do you ensure feed and water are safe?'),
      options: [
        { value: 'verified', label: getPageTranslation('Sourced from verified suppliers & stored hygienically'), score: 1 },
        { value: 'partial', label: getPageTranslation('Stored properly but source not always verified'), score: 0.5 },
        { value: 'none', label: getPageTranslation('No specific checks are done'), score: 0 }
      ]
    },
    {
      id: 'pestControl',
      question: getPageTranslation('Do you have measures to prevent contact with rodents, wild birds, or stray animals?'),
      options: [
        { value: 'strict', label: getPageTranslation('Yes, strict control measures in place'), score: 1 },
        { value: 'some', label: getPageTranslation('Some control measures but not complete'), score: 0.5 },
        { value: 'none', label: getPageTranslation('No such measures'), score: 0 }
      ]
    },
    {
      id: 'wasteManagement',
      question: getPageTranslation('How is manure and dead animal disposal handled?'),
      options: [
        { value: 'proper', label: getPageTranslation('Properly disposed through burial/incineration/approved methods'), score: 1 },
        { value: 'sometimes', label: getPageTranslation('Sometimes managed properly, sometimes left in open'), score: 0.5 },
        { value: 'open', label: getPageTranslation('Always left in open areas'), score: 0 }
      ]
    },
    {
      id: 'workerHygiene',
      question: getPageTranslation('Do workers change clothes, wear boots, and wash hands before entering animal sheds?'),
      options: [
        { value: 'strict', label: getPageTranslation('Yes, strictly followed'), score: 1 },
        { value: 'sometimes', label: getPageTranslation('Sometimes followed'), score: 0.5 },
        { value: 'not', label: getPageTranslation('Not followed'), score: 0 }
      ]
    },
    {
      id: 'farmSeparation',
      question: getPageTranslation('Is your farm located away from other farms or live animal markets?'),
      options: [
        { value: 'far', label: getPageTranslation('Yes, more than 1 km away'), score: 1 },
        { value: 'moderate', label: getPageTranslation('Moderately close (within 500 m)'), score: 0.5 },
        { value: 'close', label: getPageTranslation('Very close or within a cluster'), score: 0 }
      ]
    },
    {
      id: 'monitoring',
      question: getPageTranslation('Do you regularly monitor animals for disease symptoms and report unusual mortality?'),
      options: [
        { value: 'daily', label: getPageTranslation('Yes, daily monitoring and immediate reporting'), score: 1 },
        { value: 'sometimes', label: getPageTranslation('Sometimes monitor and report late'), score: 0.5 },
        { value: 'none', label: getPageTranslation('No regular monitoring or reporting'), score: 0 }
      ]
    }
  ];
  
  const progress = (Object.keys(answers).length / questions.length) * 100;

  const handleAnswerChange = (questionId, value, score) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { value, score }
    }));
  };

  const handleSubmit = () => {
    const totalScore = Object.values(answers).reduce((sum, answer) => sum + (answer.score || 0), 0);
    const maxScore = questions.filter(q => q.id !== 'farmType').length; // Exclude farmType from scoring
    
    const questionnaireData = {
      answers,
      totalScore,
      maxScore,
      completedAt: new Date().toISOString()
    };

    completeQuestionnaire(questionnaireData);

    if (totalScore >= 7) {
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
        <Title>{getPageTranslation('Biosecurity Assessment Questionnaire')}</Title>
        <Subtitle>{getPageTranslation('Please answer the following questions to assess your farm\'s biosecurity level')}</Subtitle>
        
        <ProgressBar>
          <ProgressFill
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </ProgressBar>
        
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px', fontSize: '14px' }}>
          {getPageTranslation('Question')} {Object.keys(answers).length} {getPageTranslation('of')} {questions.length} {getPageTranslation('completed')}
        </p>

        {questions.map((question, index) => (
          <Question key={question.id}>
            <h3>{index + 1}. {question.question}</h3>
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
          </Question>
        ))}

        <SubmitButton
          onClick={handleSubmit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={Object.keys(answers).length !== questions.length}
        >
          {getPageTranslation('Submit')}
        </SubmitButton>
      </QuestionnaireCard>
    </QuestionnaireContainer>
  );
};

export default Questionnaire;