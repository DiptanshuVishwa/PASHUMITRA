# 🪣 **PashuMitra S3 Bucket Usage Guide**

## 📋 **S3 Bucket Structure & Purpose**

Your AWS S3 bucket `pashumitra-file-uploads` is organized with the following folder structure:

### 🗂️ **Folder Organization**
```
pashumitra-file-uploads/
├── audio/           # Audio recordings (wav, mp3)
├── document/        # Documents (pdf, doc, docx, txt)
├── video/           # Video files (mp4, mov)
├── image/           # Images (jpg, jpeg, png, gif)
├── general/         # Miscellaneous files
└── thumbnails/      # Auto-generated thumbnails for images
```

---

## 🎯 **What Each Bucket Stores**

### 📸 **image/** - Image Files
- **Purpose**: Profile pictures, livestock photos, alert images, farm documentation
- **File Types**: `.jpg`, `.jpeg`, `.png`, `.gif`
- **Used For**:
  - Alert images (livestock health issues, farm problems)
  - User profile pictures
  - Farm documentation photos
  - Livestock identification photos
- **Auto-Generation**: Thumbnails are automatically created in `thumbnails/` folder
- **Frontend Location**: `RaiseAlertPage.js` (image attachments), Profile components

### 🎵 **audio/** - Audio Recordings
- **Purpose**: Voice descriptions, audio reports, alert voice notes
- **File Types**: `.wav`, `.mp3`, `.m4a`
- **Used For**:
  - Voice descriptions of livestock health issues
  - Audio alerts from farmers
  - Voice notes for veterinarians
  - Farm sound recordings (distress calls, etc.)
- **Frontend Location**: `RaiseAlertPage.js` (audio recording feature)

### 📄 **document/** - Document Files
- **Purpose**: Official documents, reports, certificates
- **File Types**: `.pdf`, `.doc`, `.docx`, `.txt`
- **Used For**:
  - Veterinary certificates
  - Medical reports
  - Farm registration documents
  - Treatment prescriptions
  - Insurance documents
- **Frontend Location**: Profile management, Alert documentation, Admin reports

### 🎬 **video/** - Video Files
- **Purpose**: Video documentation, demonstrations, time-lapse recordings
- **File Types**: `.mp4`, `.mov`, `.avi`
- **Used For**:
  - Livestock behavior videos
  - Farm condition documentation
  - Treatment demonstration videos
  - Educational content
- **Frontend Location**: `RaiseAlertPage.js`, Educational content sections

### 📁 **general/** - Miscellaneous Files
- **Purpose**: Any other file types not categorized above
- **File Types**: Various formats
- **Used For**:
  - Backup files
  - Temporary uploads
  - Uncategorized content
- **Frontend Location**: General upload components

### 🖼️ **thumbnails/** - Auto-Generated Thumbnails
- **Purpose**: Optimized preview images for faster loading
- **File Types**: `.jpg` (auto-converted)
- **Used For**:
  - Image previews in file lists
  - Gallery thumbnails
  - Alert image previews
- **Auto-Generated**: Created automatically when images are uploaded
- **Size**: 200x200px optimized

---

## 🔧 **Backend Integration Points**

### **File Upload Controller** (`backend/controllers/fileUploadController.js`)
```javascript
// File categorization logic
const category = req.body.category || 'general';
// Supported categories: 'image', 'audio', 'video', 'document', 'general'
```

### **S3 Storage Configuration** (`backend/config/s3Config.js`)
```javascript
// Files are automatically placed in correct folders based on category
const s3Key = `${category}/${uniqueFilename}`;
```

### **File Routes** (`backend/routes/upload.js`)
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload up to 5 files
- `GET /api/upload/files` - List files with filtering
- `GET /api/upload/download/:id` - Download file
- `DELETE /api/upload/:id` - Delete file

---

## 🧪 **Testing S3 File Uploads - Step by Step**

### **🖥️ Desktop Testing**

#### **1. Access the Upload Interface**
1. Open http://localhost:3000 in your browser
2. Login with your credentials
3. Navigate to **"Raise Alert"** page - this has the main file upload interface

#### **2. Test Image Upload**
1. In the "Raise Alert" page, look for the **"Attach Images"** section
2. Click the **camera/image icon** 📸
3. Select image files (jpg, png, jpeg)
4. **Expected Result**: 
   - Files upload to `image/` folder in S3
   - Thumbnails auto-generated in `thumbnails/` folder
   - Preview shows in the interface

#### **3. Test Audio Recording**
1. In the "Raise Alert" page, find the **"Record Audio"** section
2. Click the **microphone icon** 🎤
3. Record or upload audio files (wav, mp3)
4. **Expected Result**:
   - Audio files upload to `audio/` folder in S3
   - Audio player interface shows for playback

#### **4. Test Document Upload**
1. In file upload sections, upload PDF/DOC files
2. **Expected Result**:
   - Documents go to `document/` folder in S3

### **📱 Mobile Testing**

#### **1. Mobile Access**
1. Connect mobile to same WiFi network
2. Open http://192.168.44.1:3000 on mobile browser
3. Login and navigate to "Raise Alert" page

#### **2. Mobile-Specific Features**
1. **Camera Integration**: Test taking photos directly from mobile camera
2. **Audio Recording**: Test recording audio directly on mobile
3. **File Selection**: Test selecting files from mobile gallery

### **🔍 Verify Uploads in AWS Console**

#### **1. Check S3 Bucket**
1. Login to AWS Console
2. Go to S3 service
3. Open `pashumitra-file-uploads` bucket
4. Verify files are in correct folders:
   - Images in `image/`
   - Audio in `audio/`
   - Documents in `document/`
   - Thumbnails in `thumbnails/`

#### **2. Check File Properties**
- File names should be unique (UUID-based)
- Correct MIME types
- Proper folder organization

---

## 🔗 **API Testing with Postman/cURL**

### **Upload Single Image**
```bash
curl -X POST http://localhost:5000/api/upload/single \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@path/to/image.jpg" \
  -F "category=image" \
  -F "description=Test image upload"
```

### **Upload Audio File**
```bash
curl -X POST http://localhost:5000/api/upload/single \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@path/to/audio.wav" \
  -F "category=audio" \
  -F "description=Voice note"
```

### **Get File List**
```bash
curl -X GET "http://localhost:5000/api/upload/files?category=image&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Get Files by Category**
```bash
# Get all images
curl -X GET "http://localhost:5000/api/upload/files?category=image" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get all audio files
curl -X GET "http://localhost:5000/api/upload/files?category=audio" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🎮 **Frontend Testing Locations**

### **1. Raise Alert Page** (`src/pages/RaiseAlertPage.js`)
- **Primary Upload Interface**
- **Image Uploads**: Click camera icon, select/take photos
- **Audio Recording**: Click microphone icon, record or upload audio
- **File Categories**: Automatically determined based on file type

### **2. Profile Management** (Future Implementation)
- Profile picture uploads → `image/` folder
- Document uploads (certificates) → `document/` folder

### **3. Dashboard/Analytics** (Future Implementation)
- File statistics and usage displays
- Category-wise file counts

---

## 🚨 **Testing Scenarios**

### **✅ Successful Uploads**
1. **Single Image**: Upload JPG → Should go to `image/` folder
2. **Multiple Images**: Upload 3 PNG files → All should go to `image/` folder
3. **Audio Recording**: Record voice → Should go to `audio/` folder
4. **Mixed Upload**: Upload image + audio → Should go to respective folders
5. **Document**: Upload PDF → Should go to `document/` folder

### **❌ Error Scenarios to Test**
1. **File Too Large**: Upload >50MB file → Should show error
2. **Invalid Type**: Upload .exe file → Should be rejected
3. **No Authentication**: Upload without login → Should require auth
4. **Network Issues**: Test upload with poor connection

### **📊 Expected Results**
- Files appear in correct S3 folders
- Database records created with proper metadata
- Frontend shows upload progress and completion
- Thumbnails generated for images
- Proper error messages for failures

---

## 🔧 **Troubleshooting**

### **Files Not Uploading**
1. Check AWS credentials in `.env`
2. Verify S3 bucket permissions
3. Check network connectivity
4. Review browser console for errors

### **Wrong Folder Placement**
1. Check file category logic in frontend
2. Verify backend category handling
3. Review S3 key generation logic

### **Missing Thumbnails**
1. Check image processing in backend
2. Verify Sharp library installation
3. Review thumbnail generation logic

---

## 📈 **Monitoring & Analytics**

### **File Upload Statistics**
- Total uploads by category
- Storage usage per folder
- Upload success/failure rates
- User activity tracking

### **Cost Optimization**
- Lifecycle policies for old files
- Compression for images
- CDN integration for frequent access

---

**🎯 Start Testing**: Go to http://localhost:3000, login, navigate to "Raise Alert", and start uploading files to see them organized in your S3 buckets!