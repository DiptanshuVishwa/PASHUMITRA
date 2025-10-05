import { fileAPI } from './api';

// File validation utilities
export const validateFile = (file, options = {}) => {
  const {
    maxSize = parseInt(process.env.REACT_APP_MAX_FILE_SIZE) || 52428800, // 50MB
    allowedTypes = process.env.REACT_APP_ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/jpg', 'audio/wav', 'audio/mp3']
  } = options;

  const errors = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${formatFileSize(maxSize)}`);
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Format file size for display
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file type category
export const getFileCategory = (file) => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.startsWith('video/')) return 'video';
  return 'document';
};

// Create file preview
export const createFilePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        category: getFileCategory(file),
        preview: e.target.result,
        uploadProgress: 0,
        uploadStatus: 'pending', // pending, uploading, completed, failed
        uploadError: null,
        url: null,
        fileId: null
      });
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      resolve({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        category: getFileCategory(file),
        preview: null,
        uploadProgress: 0,
        uploadStatus: 'pending',
        uploadError: null,
        url: null,
        fileId: null
      });
    }
  });
};

// Upload single file with progress tracking
export const uploadSingleFile = async (fileData, onProgress = null) => {
  try {
    // Validate file
    const validation = validateFile(fileData.file);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Update status to uploading
    if (onProgress) {
      onProgress({
        ...fileData,
        uploadStatus: 'uploading',
        uploadProgress: 0
      });
    }

    // Upload file
    const response = await fileAPI.uploadSingle(
      fileData.file,
      (progress) => {
        if (onProgress) {
          onProgress({
            ...fileData,
            uploadStatus: 'uploading',
            uploadProgress: progress
          });
        }
      }
    );

    // File uploaded successfully
    const completedFile = {
      ...fileData,
      uploadStatus: 'completed',
      uploadProgress: 100,
      url: response.file?.url || response.url,
      fileId: response.file?.id || response.id,
      uploadError: null
    };

    if (onProgress) {
      onProgress(completedFile);
    }

    return completedFile;

  } catch (error) {
    console.error('File upload error:', error);
    
    const failedFile = {
      ...fileData,
      uploadStatus: 'failed',
      uploadError: error.message
    };

    if (onProgress) {
      onProgress(failedFile);
    }

    throw error;
  }
};

// Upload multiple files with progress tracking
export const uploadMultipleFiles = async (fileDataArray, onProgress = null, onComplete = null) => {
  const results = [];
  let completedCount = 0;

  for (const fileData of fileDataArray) {
    try {
      const result = await uploadSingleFile(
        fileData,
        (updatedFileData) => {
          if (onProgress) {
            onProgress(updatedFileData);
          }
        }
      );
      
      results.push(result);
      completedCount++;
      
    } catch (error) {
      results.push({
        ...fileData,
        uploadStatus: 'failed',
        uploadError: error.message
      });
      completedCount++;
    }

    // Call completion callback with overall progress
    if (onComplete) {
      onComplete({
        completed: completedCount,
        total: fileDataArray.length,
        results: results.slice() // Create a copy
      });
    }
  }

  return results;
};

// Batch upload with concurrency control
export const uploadFilesWithConcurrency = async (
  fileDataArray, 
  onProgress = null, 
  onComplete = null,
  concurrency = 3
) => {
  const results = [];
  let completedCount = 0;
  
  // Helper function to upload a single file
  const uploadFile = async (fileData, index) => {
    try {
      const result = await uploadSingleFile(
        fileData,
        (updatedFileData) => {
          if (onProgress) {
            onProgress(updatedFileData, index);
          }
        }
      );
      
      results[index] = result;
      completedCount++;
      
      if (onComplete) {
        onComplete({
          completed: completedCount,
          total: fileDataArray.length,
          results: results.filter(r => r !== undefined) // Filter out undefined slots
        });
      }
      
      return result;
      
    } catch (error) {
      const failedFile = {
        ...fileData,
        uploadStatus: 'failed',
        uploadError: error.message
      };
      
      results[index] = failedFile;
      completedCount++;
      
      if (onProgress) {
        onProgress(failedFile, index);
      }
      
      if (onComplete) {
        onComplete({
          completed: completedCount,
          total: fileDataArray.length,
          results: results.filter(r => r !== undefined)
        });
      }
      
      return failedFile;
    }
  };

  // Create batches based on concurrency
  const batches = [];
  for (let i = 0; i < fileDataArray.length; i += concurrency) {
    const batch = fileDataArray.slice(i, i + concurrency).map((fileData, batchIndex) => ({
      fileData,
      index: i + batchIndex
    }));
    batches.push(batch);
  }

  // Process batches sequentially, but files within batch concurrently
  for (const batch of batches) {
    const batchPromises = batch.map(({ fileData, index }) => 
      uploadFile(fileData, index)
    );
    
    await Promise.all(batchPromises);
  }

  return results;
};

// Download file
export const downloadFile = async (fileId, filename = null) => {
  try {
    const blob = await fileAPI.downloadFile(fileId);
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `file-${fileId}`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('File download error:', error);
    throw error;
  }
};

// Delete file
export const deleteFile = async (fileId) => {
  try {
    await fileAPI.deleteFile(fileId);
    return true;
  } catch (error) {
    console.error('File delete error:', error);
    throw error;
  }
};

// Utility to create audio blob URL for playback
export const createAudioURL = (audioBlob) => {
  return URL.createObjectURL(audioBlob);
};

// Cleanup audio URL
export const cleanupAudioURL = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

export default {
  validateFile,
  formatFileSize,
  getFileCategory,
  createFilePreview,
  uploadSingleFile,
  uploadMultipleFiles,
  uploadFilesWithConcurrency,
  downloadFile,
  deleteFile,
  createAudioURL,
  cleanupAudioURL
};