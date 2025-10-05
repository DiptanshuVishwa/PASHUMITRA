const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const path = require('path');
const crypto = require('crypto');

// Configure AWS S3 specifically for multer-s3 to avoid conflicts with AWS SDK v3
const configureS3ForMulter = () => {
  try {
    // Create a new S3 instance with explicit configuration
    const s3Config = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'ap-south-1',
      apiVersion: '2006-03-01',
      signatureVersion: 'v4'
    };

    const s3Client = new AWS.S3(s3Config);
    
    console.log('AWS S3 configured for file uploads with region:', s3Config.region);
    return s3Client;
  } catch (error) {
    console.error('Error configuring AWS S3 for multer:', error);
    throw new Error('Failed to configure AWS S3: ' + error.message);
  }
};

// Initialize S3 client for multer
let s3;
try {
  s3 = configureS3ForMulter();
} catch (error) {
  console.error('S3 initialization failed:', error.message);
  // Create a fallback configuration
  s3 = null;
}

// S3 Storage configuration for multer
let s3Storage = null;

if (s3 && process.env.AWS_S3_BUCKET_NAME) {
  try {
    s3Storage = multerS3({
      s3: s3,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      acl: 'private', // Files are private by default, accessible via signed URLs
      contentType: multerS3.AUTO_CONTENT_TYPE,
      contentDisposition: 'inline',
      metadata: function (req, file, cb) {
        cb(null, {
          fieldName: file.fieldname,
          originalName: file.originalname,
          uploadedBy: req.user ? req.user.id : 'anonymous',
          uploadedAt: new Date().toISOString(),
          category: req.body.category || 'general'
        });
      },
      key: function (req, file, cb) {
        try {
          // Create organized folder structure in S3
          const category = req.body.category || 'general';
          const timestamp = Date.now();
          const randomString = crypto.randomBytes(8).toString('hex');
          const extension = path.extname(file.originalname);
          const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
          
          // S3 key structure: category/year/month/unique-filename
          const date = new Date();
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          
          const s3Key = `${category}/${year}/${month}/${timestamp}-${randomString}-${sanitizedName}`;
          
          console.log('Uploading file to S3 key:', s3Key);
          cb(null, s3Key);
        } catch (keyError) {
          console.error('Error generating S3 key:', keyError);
          cb(keyError);
        }
      }
    });
    console.log('✅ S3 storage configuration created successfully');
  } catch (storageError) {
    console.error('❌ Failed to create S3 storage configuration:', storageError.message);
    s3Storage = null;
  }
} else {
  console.error('❌ S3 not available - missing S3 client or bucket name');
  console.error('   S3 client:', !!s3);
  console.error('   Bucket name:', !!process.env.AWS_S3_BUCKET_NAME);
}

// File filter for security (same as before but enhanced)
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = {
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'],
    document: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'],
    video: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
    audio: ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.wma'],
    general: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.txt', '.mp4', '.mp3']
  };

  const extension = path.extname(file.originalname).toLowerCase();
  const category = req.body.category || 'general';
  
  // Check if file type is allowed for the category
  if (allowedTypes[category] && allowedTypes[category].includes(extension)) {
    // Additional security checks
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return cb(new Error('File too large. Maximum size is 50MB'), false);
    }
    
    // Block potentially dangerous files
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.js', '.jar', '.sh'];
    if (dangerousExtensions.includes(extension)) {
      return cb(new Error(`File type ${extension} is not allowed for security reasons`), false);
    }
    
    cb(null, true);
  } else {
    cb(new Error(`File type ${extension} not allowed for category ${category}. Allowed types: ${allowedTypes[category]?.join(', ')}`), false);
  }
};

// Generate signed URL for secure file access
const generateSignedUrl = async (s3Key, expirationTime = 3600) => {
  try {
    if (!s3) {
      throw new Error('S3 client not available');
    }
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: s3Key,
      Expires: expirationTime // URL expires in 1 hour by default
    };
    
    const signedUrl = await s3.getSignedUrlPromise('getObject', params);
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate file access URL: ' + error.message);
  }
};

// Delete file from S3
const deleteFromS3 = async (s3Key) => {
  try {
    if (!s3) {
      throw new Error('S3 client not available');
    }
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: s3Key
    };
    
    await s3.deleteObject(params).promise();
    console.log(`File deleted from S3: ${s3Key}`);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error('Failed to delete file from storage: ' + error.message);
  }
};

// Copy file in S3 (useful for creating thumbnails)
const copyFileInS3 = async (sourceKey, destinationKey) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      CopySource: `${process.env.AWS_S3_BUCKET_NAME}/${sourceKey}`,
      Key: destinationKey
    };
    
    await s3.copyObject(params).promise();
    console.log('File copied in S3 from', sourceKey, 'to', destinationKey);
    return destinationKey;
  } catch (error) {
    console.error('Error copying file in S3:', error);
    throw new Error('Failed to copy file in S3');
  }
};

// Get file metadata from S3
const getFileMetadata = async (s3Key) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: s3Key
    };
    
    const metadata = await s3.headObject(params).promise();
    return metadata;
  } catch (error) {
    console.error('Error getting file metadata from S3:', error);
    throw new Error('Failed to get file metadata');
  }
};

// List files in S3 bucket (for admin purposes)
const listS3Files = async (prefix = '', maxKeys = 1000) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: maxKeys
    };
    
    const data = await s3.listObjectsV2(params).promise();
    return data.Contents;
  } catch (error) {
    console.error('Error listing S3 files:', error);
    throw new Error('Failed to list S3 files');
  }
};

// Get S3 bucket info and statistics
const getBucketInfo = async () => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME
    };
    
    // Get bucket location
    const location = await s3.getBucketLocation(params).promise();
    
    // Get bucket policy (if exists)
    let policy = null;
    try {
      const policyResult = await s3.getBucketPolicy(params).promise();
      policy = JSON.parse(policyResult.Policy);
    } catch (err) {
      // Bucket might not have a policy, which is fine
      console.log('No bucket policy found or access denied');
    }
    
    return {
      bucket: process.env.AWS_S3_BUCKET_NAME,
      region: location.LocationConstraint || 'us-east-1',
      policy: policy ? 'Configured' : 'Not configured'
    };
  } catch (error) {
    console.error('Error getting bucket info:', error);
    throw new Error('Failed to get bucket information');
  }
};

module.exports = {
  s3,
  s3Storage,
  fileFilter,
  generateSignedUrl,
  deleteFromS3,
  copyFileInS3,
  getFileMetadata,
  listS3Files,
  getBucketInfo
};
