import { alertAPI } from './api';
import { uploadMultipleFiles, createFilePreview } from './fileUpload';

// Create alert with file uploads
export const createAlert = async (alertData, files = [], audioRecording = null, onProgress = null) => {
  try {
    // Step 1: Prepare files for upload
    const filesToUpload = [];
    
    // Add image files
    if (files.length > 0) {
      for (const file of files) {
        const filePreview = await createFilePreview(file.file || file);
        filesToUpload.push(filePreview);
      }
    }
    
    // Add audio recording if present
    if (audioRecording && audioRecording.blob) {
      const audioFile = new File([audioRecording.blob], 'voice-message.wav', { 
        type: 'audio/wav' 
      });
      const audioPreview = await createFilePreview(audioFile);
      filesToUpload.push(audioPreview);
    }
    
    // Step 2: Upload files if any exist
    let uploadedFiles = [];
    if (filesToUpload.length > 0) {
      if (onProgress) {
        onProgress({ stage: 'uploading', message: 'Uploading files...', progress: 0 });
      }
      
      uploadedFiles = await uploadMultipleFiles(
        filesToUpload,
        (fileData) => {
          // File progress callback
          if (onProgress) {
            const overallProgress = Math.round(
              (filesToUpload.filter(f => f.uploadStatus === 'completed').length / filesToUpload.length) * 50
            );
            onProgress({ 
              stage: 'uploading', 
              message: `Uploading ${fileData.name}...`, 
              progress: overallProgress 
            });
          }
        },
        (summary) => {
          // Overall progress callback
          if (onProgress) {
            const progress = Math.round((summary.completed / summary.total) * 50);
            onProgress({ 
              stage: 'uploading', 
              message: `Uploaded ${summary.completed}/${summary.total} files`, 
              progress 
            });
          }
        }
      );
      
      // Check for upload failures
      const failedUploads = uploadedFiles.filter(file => file.uploadStatus === 'failed');
      if (failedUploads.length > 0) {
        console.warn('Some files failed to upload:', failedUploads);
        // Continue with alert creation even if some files failed
      }
    }
    
    // Step 3: Prepare alert data
    if (onProgress) {
      onProgress({ stage: 'creating', message: 'Creating alert...', progress: 75 });
    }
    
    // Get successfully uploaded file IDs
    const attachmentIds = uploadedFiles
      .filter(file => file.uploadStatus === 'completed' && file.fileId)
      .map(file => file.fileId);
    
    // Prepare final alert data
    const finalAlertData = {
      ...alertData,
      attachments: attachmentIds,
      // Include metadata for debugging
      metadata: {
        hasImages: files.length > 0,
        hasAudio: audioRecording !== null,
        totalFiles: filesToUpload.length,
        successfulUploads: uploadedFiles.filter(f => f.uploadStatus === 'completed').length,
        failedUploads: uploadedFiles.filter(f => f.uploadStatus === 'failed').length
      }
    };
    
    // Step 4: Create alert
    const alertResponse = await alertAPI.create(finalAlertData);
    
    if (onProgress) {
      onProgress({ stage: 'completed', message: 'Alert created successfully!', progress: 100 });
    }
    
    return {
      success: true,
      alert: alertResponse.alert || alertResponse,
      uploadedFiles,
      failedUploads: uploadedFiles.filter(f => f.uploadStatus === 'failed')
    };
    
  } catch (error) {
    console.error('Alert creation error:', error);
    
    if (onProgress) {
      onProgress({ 
        stage: 'error', 
        message: `Failed to create alert: ${error.message}`, 
        progress: 0 
      });
    }
    
    throw error;
  }
};

// Get alert status display
export const getAlertStatusDisplay = (status) => {
  const statusMap = {
    'open': { label: 'Open', color: '#ffc107', bgColor: 'rgba(255, 193, 7, 0.1)' },
    'in-progress': { label: 'In Progress', color: '#17a2b8', bgColor: 'rgba(23, 162, 184, 0.1)' },
    'resolved': { label: 'Resolved', color: '#28a745', bgColor: 'rgba(40, 167, 69, 0.1)' },
    'closed': { label: 'Closed', color: '#6c757d', bgColor: 'rgba(108, 117, 125, 0.1)' }
  };
  
  return statusMap[status] || statusMap['open'];
};

// Get urgency level display
export const getUrgencyDisplay = (urgency) => {
  const urgencyMap = {
    'low': { label: 'Low', color: '#28a745', bgColor: 'rgba(40, 167, 69, 0.1)', icon: '🟢' },
    'medium': { label: 'Medium', color: '#ffc107', bgColor: 'rgba(255, 193, 7, 0.1)', icon: '🟡' },
    'high': { label: 'High', color: '#dc3545', bgColor: 'rgba(220, 53, 69, 0.1)', icon: '🔴' }
  };
  
  return urgencyMap[urgency] || urgencyMap['low'];
};

// Format alert data for display
export const formatAlertForDisplay = (alert) => {
  return {
    ...alert,
    statusDisplay: getAlertStatusDisplay(alert.status),
    urgencyDisplay: getUrgencyDisplay(alert.urgency),
    createdAtFormatted: new Date(alert.createdAt).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    updatedAtFormatted: new Date(alert.updatedAt).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
};

// Validate alert data before submission
export const validateAlertData = (alertData) => {
  const errors = [];
  
  // Required fields
  if (!alertData.issueType) {
    errors.push('Issue type is required');
  }
  
  if (!alertData.urgency) {
    errors.push('Urgency level is required');
  }
  
  if (!alertData.contactName) {
    errors.push('Contact name is required');
  }
  
  if (!alertData.contactPhone) {
    errors.push('Contact phone is required');
  }
  
  // Location validation - either dropdown location OR manual location
  if (!alertData.location && !alertData.manualLocation?.trim()) {
    errors.push('Location is required - either select from dropdown or enter manual location');
  }
  
  // Phone number validation
  if (alertData.contactPhone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(alertData.contactPhone.replace(/\s+/g, ''))) {
      errors.push('Please enter a valid phone number');
    }
  }
  
  // Email validation if provided
  if (alertData.contactEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(alertData.contactEmail)) {
      errors.push('Please enter a valid email address');
    }
  }
  
  // Custom issue validation
  if (alertData.issueType === 'other' && !alertData.customIssue?.trim()) {
    errors.push('Please specify the custom issue');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get alert priority score for sorting/filtering
export const getAlertPriorityScore = (alert) => {
  const urgencyScores = { high: 3, medium: 2, low: 1 };
  const statusScores = { open: 3, 'in-progress': 2, resolved: 1, closed: 0 };
  
  const urgencyScore = urgencyScores[alert.urgency] || 1;
  const statusScore = statusScores[alert.status] || 1;
  const ageScore = Math.max(1, 4 - Math.floor((Date.now() - new Date(alert.createdAt)) / (24 * 60 * 60 * 1000)));
  
  return urgencyScore * statusScore * ageScore;
};

export default {
  createAlert,
  getAlertStatusDisplay,
  getUrgencyDisplay,
  formatAlertForDisplay,
  validateAlertData,
  getAlertPriorityScore
};