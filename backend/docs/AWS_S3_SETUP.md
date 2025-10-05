# AWS S3 Setup Guide for PashuMitra Portal

This guide will help you set up AWS S3 for global file storage in the PashuMitra Portal.

## 🎯 Overview

The PashuMitra Portal now uses AWS S3 for secure, scalable file storage instead of local storage. This provides:

- **Global accessibility** - Files accessible from anywhere
- **High availability** - 99.999999999% (11 9's) durability
- **Security** - Private files with signed URL access
- **Scalability** - No storage limits
- **Cost-effective** - Pay only for what you use

## 📋 Prerequisites

1. **AWS Account** - [Create an AWS account](https://aws.amazon.com/)
2. **AWS CLI** (optional) - [Install AWS CLI](https://aws.amazon.com/cli/)
3. **Node.js** - Already installed for the backend

## 🔧 Step 1: Create AWS IAM User

1. **Login to AWS Console** - Go to [AWS Console](https://console.aws.amazon.com/)

2. **Navigate to IAM** - Search for "IAM" and click on IAM service

3. **Create a New User**:
   - Click "Users" → "Add users"
   - Username: `pashumnitra-s3-user`
   - Access type: ✅ **Programmatic access**
   - Click "Next"

4. **Set Permissions**:
   - Choose "Attach existing policies directly"
   - Search and select: `AmazonS3FullAccess`
   - Click "Next" → "Next" → "Create user"

5. **Save Credentials** 🔐:
   ```
   Access Key ID: AKIA...
   Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   ```
   **⚠️ IMPORTANT**: Save these credentials securely! You won't see them again.

## 🪣 Step 2: Create S3 Bucket

### Option A: Using AWS Console (Recommended for beginners)

1. **Go to S3** - Search for "S3" in AWS Console
2. **Create Bucket**:
   - Bucket name: `pashumnitra-files-[your-unique-id]` 
   - Region: Choose closest to your users (e.g., `us-east-1`)
   - **Block all public access**: ✅ Keep checked (for security)
   - Click "Create bucket"

### Option B: Using our setup script

1. **Update Environment Variables** (see Step 3)
2. **Run Setup Script**:
   ```bash
   node scripts/setupS3.js
   ```

## 🌐 Step 3: Configure Environment Variables

Update your `.env` file with the AWS credentials:

```env
# AWS S3 Configuration (Global File Storage)
AWS_ACCESS_KEY_ID=your_actual_access_key_id
AWS_SECRET_ACCESS_KEY=your_actual_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=pashumnitra-files-your-unique-id
```

**Example:**
```env
# AWS S3 Configuration (Global File Storage)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=pashumnitra-files-2024
```

## 🧪 Step 4: Test the Setup

1. **Start the Backend**:
   ```bash
   npm start
   ```

2. **Test File Upload**:
   ```bash
   curl -X POST "http://localhost:5000/api/upload/single" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "file=@test-file.txt" \
     -F "category=document" \
     -F "description=Test S3 upload"
   ```

3. **Expected Response**:
   ```json
   {
     "success": true,
     "message": "File uploaded successfully to S3",
     "data": {
       "id": "64f7b3b3b3b3b3b3b3b3b3b3",
       "originalName": "test-file.txt",
       "s3Key": "document/2024/10/1696352840123-abc12345-test-file.txt",
       "cloudUrl": "https://pashumnitra-files-2024.s3.amazonaws.com/...",
       "signedUrl": "https://pashumnitra-files-2024.s3.amazonaws.com/...?X-Amz-Algorithm=...",
       "downloadUrl": "/api/upload/download/64f7b3b3b3b3b3b3b3b3b3b3"
     }
   }
   ```

## 📁 File Organization in S3

Files are organized in a structured hierarchy:

```
s3://pashumnitra-files-2024/
├── image/
│   ├── 2024/
│   │   ├── 10/
│   │   │   └── 1696352840123-abc12345-photo.jpg
│   └── thumbnails/
├── document/
│   ├── 2024/
│   │   ├── 10/
│   │   │   └── 1696352840123-def67890-report.pdf
├── video/
├── audio/
└── general/
```

## 🔒 Security Features

### Private Access
- All files are private by default
- Access via signed URLs with expiration
- No direct public access

### Secure URLs
- Download URLs expire after 15 minutes
- Thumbnail URLs expire after 1 hour
- Each request generates a fresh URL

### File Validation
- File type restrictions by category
- Size limits (50MB per file)
- Malicious file detection
- SHA256 hash verification

## 💰 Cost Estimation

### Storage Costs (us-east-1)
- **Standard Storage**: $0.023 per GB/month
- **Example**: 100GB = ~$2.30/month

### Request Costs
- **PUT requests**: $0.0005 per 1,000 requests
- **GET requests**: $0.0004 per 1,000 requests

### Data Transfer
- **Out to Internet**: $0.09 per GB (first 10TB)

**Monthly estimate for small app**: $5-20/month

## 🚀 Production Optimization

### 1. Enable CloudFront CDN
```bash
# Add to your environment
CLOUDFRONT_DISTRIBUTION_ID=E123456789ABCD
CLOUDFRONT_DOMAIN=d123456789abcd.cloudfront.net
```

### 2. Set up Lifecycle Policies
- Delete incomplete multipart uploads after 1 day
- Move old versions to cheaper storage classes

### 3. Enable Monitoring
- CloudWatch metrics
- Cost alerts
- Access logging

## 🔧 Troubleshooting

### Error: "Access Denied"
**Solution**: Check IAM permissions
```bash
# Test AWS credentials
aws s3 ls
```

### Error: "Bucket already exists"
**Solution**: Bucket names must be globally unique
- Try: `pashumnitra-files-yourname-2024`

### Error: "Region mismatch"
**Solution**: Ensure consistent regions
```env
AWS_REGION=us-east-1  # Must match bucket region
```

### Error: "File upload fails silently"
**Solution**: Check server logs and AWS credentials

## 📚 Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS S3 Pricing](https://aws.amazon.com/s3/pricing/)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

## 🆘 Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify AWS credentials and permissions
3. Test S3 connectivity: `node scripts/setupS3.js`
4. Check AWS CloudTrail for API call logs

---

**Next Steps:**
Once S3 is configured, your PashuMitra Portal will automatically store all uploaded files in the cloud, making them accessible globally with enterprise-grade security and reliability.