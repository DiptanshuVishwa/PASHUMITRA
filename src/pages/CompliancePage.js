import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import {
  FiUpload,
  FiCheckCircle,
  FiFileText,
  FiDownload,
  FiAlertCircle,
  FiSave,
  FiSend,
  FiX,
  FiAward
} from 'react-icons/fi';

const ComplianceContainer = styled.div`
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
  }
  
  p {
    font-size: 1.2rem;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
  }
`;


const TabContent = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const QuestionnaireSection = styled.div`
  .question-group {
    margin-bottom: 30px;
    
    .question {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--dark-gray);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .question-number {
      background: var(--primary-coral);
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
    }
  }
`;

const OptionsContainer = styled.div`
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
`;

const OptionButton = styled.button`
  padding: 16px 20px;
  border: 2px solid ${props => props.selected ? 'var(--primary-coral)' : '#e0e0e0'};
  background: ${props => props.selected ? 'rgba(255, 127, 80, 0.1)' : 'white'};
  color: ${props => props.selected ? 'var(--primary-coral)' : '#666'};
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  
  &:hover {
    border-color: var(--primary-coral);
    background: rgba(255, 127, 80, 0.05);
  }
  
  .option-text {
    font-weight: 500;
  }
  
  .option-description {
    font-size: 12px;
    color: #888;
    margin-top: 4px;
  }
`;

const DocumentUploadSection = styled.div`
  .upload-area {
    border: 2px dashed #e0e0e0;
    border-radius: 16px;
    padding: 40px;
    text-align: center;
    margin-bottom: 30px;
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

const UploadedFilesList = styled.div`
  .file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 12px;
    margin-bottom: 12px;
    
    .file-info {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .file-icon {
        color: var(--primary-coral);
        font-size: 20px;
      }
      
      .file-details {
        .file-name {
          font-weight: 600;
          color: var(--dark-gray);
          margin-bottom: 4px;
        }
        
        .file-size {
          font-size: 12px;
          color: #666;
        }
      }
    }
    
    .file-actions {
      display: flex;
      gap: 8px;
      
      button {
        padding: 6px;
        border: none;
        background: none;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(255, 127, 80, 0.1);
        }
        
        &.remove {
          color: #dc3545;
        }
        
        &.download {
          color: var(--primary-coral);
        }
      }
    }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin: 20px 0;
  
  .progress {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-coral), #FF6A35);
    border-radius: 4px;
    transition: width 0.3s ease;
    width: ${props => props.progress}%;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 40px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ActionButton = styled(motion.button)`
  padding: 16px 32px;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  
  &.primary {
    background: linear-gradient(135deg, var(--primary-coral), #FF6A35);
    color: white;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(255, 127, 80, 0.4);
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
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

const CompliancePage = () => {
  const [questionnaireData, setQuestionnaireData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const questions = [
    {
      id: 1,
      question: "Do you have Disease-Free Compartment Recognition (DoAH&D)?",
      options: [
        { value: "yes", text: "Yes", description: "I have valid DoAH&D recognition" },
        { value: "no", text: "No", description: "I do not have DoAH&D recognition" }
      ]
    },
    {
      id: 2,
      question: "Do you have a valid FSSAI License (if your farm products enter the food chain)?",
      options: [
        { value: "yes", text: "Yes", description: "I have a valid FSSAI License" },
        { value: "no", text: "No", description: "I do not have FSSAI License" }
      ]
    },
    {
      id: 3,
      question: "Are you compliant with NADCP (National Animal Disease Control Programme) vaccination requirements?",
      options: [
        { value: "yes", text: "Yes", description: "I am compliant with NADCP vaccination requirements" },
        { value: "no", text: "No", description: "I am not compliant with NADCP requirements" }
      ]
    }
  ];

  const handleQuestionnaireChange = (questionId, value) => {
    setQuestionnaireData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleFileUpload = (files) => {
    const fileList = Array.from(files);
    const newFiles = fileList.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      file: file,
      uploaded: false
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload progress
    newFiles.forEach(file => {
      simulateUpload(file.id);
    });
  };

  const simulateUpload = (fileId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setUploadedFiles(prev => 
          prev.map(file => 
            file.id === fileId ? { ...file, uploaded: true } : file
          )
        );
        setUploadProgress(0);
      }
    }, 200);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
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
    handleFileUpload(files);
  };

  const calculateComplianceScore = () => {
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(questionnaireData).length;
    
    if (answeredQuestions === 0) return 0;
    
    let yesCount = 0;
    Object.values(questionnaireData).forEach(answer => {
      if (answer === 'yes') {
        yesCount++;
      }
    });
    
    return Math.round((yesCount / totalQuestions) * 100);
  };
  
  const hasAtLeastOneYes = () => {
    return Object.values(questionnaireData).some(answer => answer === 'yes');
  };

  const isQuestionnaireComplete = () => {
    return Object.keys(questionnaireData).length === questions.length;
  };

  const generateCertificatePDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    
    // Header
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PashuMitra Portal', pageWidth/2, 30, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Compliance Certificate', pageWidth/2, 45, { align: 'center' });
    
    // Certificate content
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    const currentDate = new Date().toLocaleDateString();
    const certificateId = `PC-${Date.now()}`;
    
    pdf.text(`Certificate ID: ${certificateId}`, margin, 70);
    pdf.text(`Issue Date: ${currentDate}`, margin, 85);
    pdf.text(`Valid Until: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}`, margin, 100);
    
    pdf.text('This is to certify that the farm holder has the following compliance documents:', margin, 125);
    
    let yPosition = 145;
    
    // List compliance items
    questions.forEach((question, index) => {
      const answer = questionnaireData[question.id];
      if (answer === 'yes') {
        const compliance = question.question.replace('Do you have ', '').replace('Are you compliant with ', '');
        pdf.setFont('helvetica', 'bold');
        pdf.text('✓', margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(compliance, margin + 10, yPosition);
        yPosition += 15;
      }
    });
    
    // Uploaded documents
    if (uploadedFiles.length > 0) {
      yPosition += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Supporting Documents:', margin, yPosition);
      yPosition += 15;
      
      uploadedFiles.forEach((file) => {
        pdf.setFont('helvetica', 'normal');
        pdf.text(`• ${file.name}`, margin + 5, yPosition);
        yPosition += 12;
      });
    }
    
    // Footer
    yPosition += 30;
    pdf.setFont('helvetica', 'italic');
    pdf.text('This certificate is generated automatically by PashuMitra Portal', pageWidth/2, yPosition, { align: 'center' });
    pdf.text('and serves as proof of compliance documentation.', pageWidth/2, yPosition + 15, { align: 'center' });
    
    // Compliance score
    const score = calculateComplianceScore();
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Compliance Score: ${score}%`, pageWidth/2, yPosition + 40, { align: 'center' });
    
    // Save the PDF
    pdf.save(`PashuMitra_Compliance_Certificate_${certificateId}.pdf`);
  };

  const handleSubmit = () => {
    const score = calculateComplianceScore();
    if (hasAtLeastOneYes() && uploadedFiles.length > 0) {
      alert(`Compliance assessment submitted successfully! Your compliance score: ${score}%`);
      // Generate and download certificate
      generateCertificatePDF();
    } else if (!hasAtLeastOneYes()) {
      alert('You need to have at least one "Yes" answer to proceed with document upload and certification.');
    } else {
      alert('Please upload supporting documents before submitting.');
    }
    // Here you would typically send the data to your backend
  };

  const handleSaveDraft = () => {
    alert('Progress saved as draft!');
    // Save to localStorage or backend
  };

  return (
    <ComplianceContainer>
      <Header>
        <h1>Compliance Certification</h1>
        <p>
          Complete your biosecurity compliance assessment and upload required documentation
          to obtain your farm certification.
        </p>
      </Header>


      <TabContent
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
          <QuestionnaireSection>
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
              <h3>Biosecurity Compliance Assessment</h3>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Progress: {Object.keys(questionnaireData).length} / {questions.length} questions completed
              </p>
              <ProgressBar progress={(Object.keys(questionnaireData).length / questions.length) * 100}>
                <div className="progress" />
              </ProgressBar>
            </div>

            {questions.map((q, index) => (
              <div key={q.id} className="question-group">
                <div className="question">
                  <span className="question-number">{index + 1}</span>
                  {q.question}
                </div>
                
                <OptionsContainer>
                  {q.options.map(option => (
                    <OptionButton
                      key={option.value}
                      selected={questionnaireData[q.id] === option.value}
                      onClick={() => handleQuestionnaireChange(q.id, option.value)}
                    >
                      <div className="option-text">{option.text}</div>
                      <div className="option-description">{option.description}</div>
                    </OptionButton>
                  ))}
                </OptionsContainer>
              </div>
            ))}

            {isQuestionnaireComplete() && hasAtLeastOneYes() && (
              <div style={{ 
                background: 'linear-gradient(135deg, rgba(255, 127, 80, 0.1), rgba(255, 106, 53, 0.1))',
                padding: '20px',
                borderRadius: '16px',
                textAlign: 'center',
                marginTop: '30px'
              }}>
                <FiCheckCircle style={{ fontSize: '32px', color: 'var(--primary-coral)', marginBottom: '12px' }} />
                <h3 style={{ color: 'var(--dark-gray)', marginBottom: '8px' }}>
                  Questionnaire Complete!
                </h3>
                <p style={{ color: '#666' }}>
                  Your estimated compliance score: <strong>{calculateComplianceScore()}%</strong>
                </p>
                <p style={{ color: 'var(--primary-coral)', fontWeight: '600', marginTop: '12px' }}>
                  You can now proceed to upload supporting documents.
                </p>
              </div>
            )}
            
            {isQuestionnaireComplete() && !hasAtLeastOneYes() && (
              <div style={{ 
                background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(200, 35, 51, 0.1))',
                padding: '20px',
                borderRadius: '16px',
                textAlign: 'center',
                marginTop: '30px'
              }}>
                <FiAlertCircle style={{ fontSize: '32px', color: '#dc3545', marginBottom: '12px' }} />
                <h3 style={{ color: 'var(--dark-gray)', marginBottom: '8px' }}>
                  Questionnaire Complete
                </h3>
                <p style={{ color: '#666' }}>
                  Your compliance score: <strong>{calculateComplianceScore()}%</strong>
                </p>
                <p style={{ color: '#dc3545', fontWeight: '600', marginTop: '12px' }}>
                  You need at least one "Yes" answer to proceed with document upload and certification.
                </p>
              </div>
            )}
          </QuestionnaireSection>
          
          {hasAtLeastOneYes() && (
            <>
              <div style={{ 
                borderTop: '2px solid #f0f0f0',
                margin: '40px 0 30px 0'
              }} />
              
              <div style={{ 
                textAlign: 'center',
                marginBottom: '30px'
              }}>
                <h2 style={{ 
                  color: 'var(--dark-gray)',
                  fontSize: '1.8rem',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}>
                  <FiUpload style={{ color: 'var(--primary-coral)' }} />
                  Document Upload Section
                </h2>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>
                  Upload your supporting documents to complete the compliance certification
                </p>
              </div>
          <DocumentUploadSection>
            <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Upload Required Documents</h3>
            <p style={{ color: '#666', textAlign: 'center', marginBottom: '30px' }}>
              Please upload the following documents for compliance verification:
            </p>

            <div 
              className={`upload-area ${dragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <FiUpload className="upload-icon" />
              <div className="upload-text">
                Drag & drop files here or click to browse
              </div>
              <div className="upload-hint">
                Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB per file)
              </div>
              <input
                id="file-input"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </div>

            {uploadProgress > 0 && (
              <ProgressBar progress={uploadProgress}>
                <div className="progress" />
              </ProgressBar>
            )}

            <UploadedFilesList>
              {uploadedFiles.map(file => (
                <div key={file.id} className="file-item">
                  <div className="file-info">
                    <FiFileText className="file-icon" />
                    <div className="file-details">
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">{file.size}</div>
                    </div>
                  </div>
                  <div className="file-actions">
                    {file.uploaded && (
                      <button className="download" title="Download">
                        <FiDownload />
                      </button>
                    )}
                    <button 
                      className="remove" 
                      onClick={() => removeFile(file.id)}
                      title="Remove"
                    >
                      <FiX />
                    </button>
                  </div>
                </div>
              ))}
            </UploadedFilesList>

            <div style={{ 
              background: '#f8f9fa',
              padding: '20px',
              borderRadius: '12px',
              marginTop: '30px'
            }}>
              <h4 style={{ color: 'var(--dark-gray)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiAlertCircle /> Required Documents Checklist:
              </h4>
              <ul style={{ color: '#666', lineHeight: '1.8', paddingLeft: '20px' }}>
                {questionnaireData[1] === 'yes' && <li>Disease-Free Compartment Recognition Certificate (DoAH&D)</li>}
                {questionnaireData[2] === 'yes' && <li>Valid FSSAI License Certificate</li>}
                {questionnaireData[3] === 'yes' && <li>NADCP Vaccination Compliance Records</li>}
                <li>Supporting documentation for checked compliance areas</li>
                <li>Farm registration certificate</li>
                <li>Any additional relevant certificates</li>
              </ul>
            </div>
          </DocumentUploadSection>
            </>
          )}
      </TabContent>

      <ActionButtons>
        <ActionButton 
          className="secondary"
          onClick={handleSaveDraft}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiSave /> Save Draft
        </ActionButton>
        
        {hasAtLeastOneYes() && isQuestionnaireComplete() && (
          <ActionButton 
            className="secondary"
            onClick={() => document.getElementById('file-input').click()}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiUpload /> Upload Documents
          </ActionButton>
        )}
        
        {hasAtLeastOneYes() && isQuestionnaireComplete() && uploadedFiles.length > 0 && (
          <ActionButton 
            className="secondary"
            onClick={generateCertificatePDF}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiAward /> Generate Certificate
          </ActionButton>
        )}
        
        <ActionButton 
          className="primary"
          onClick={handleSubmit}
          disabled={!isQuestionnaireComplete() || (!hasAtLeastOneYes()) || (hasAtLeastOneYes() && uploadedFiles.length === 0)}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiSend /> 
          {!hasAtLeastOneYes() 
            ? 'Complete Questionnaire' 
            : uploadedFiles.length === 0 
            ? 'Upload Documents First'
            : 'Submit for Certification'
          }
        </ActionButton>
      </ActionButtons>
    </ComplianceContainer>
  );
};

export default CompliancePage;