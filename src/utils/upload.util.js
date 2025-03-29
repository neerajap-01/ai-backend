import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/keys.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Always use /tmp for Netlify Functions, and local path for development
const getUploadDir = () => {
  // Always use /tmp in Netlify environment
  if (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return '/tmp/uploads';
  }
  // For local development
  return path.join(process.cwd(), 'uploads');
};

// Safely create directory
const createUploadDir = () => {
  const uploadDir = getUploadDir();
  
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    console.log(`📁 Upload directory created successfully at: ${uploadDir}`);
    return uploadDir;
  } catch (error) {
    console.error(`❌ Error creating upload directory: ${error.message}`);
    // Always fallback to /tmp
    const tmpDir = '/tmp/uploads';
    fs.mkdirSync(tmpDir, { recursive: true });
    console.log(`📁 Fallback: Using temporary directory at: ${tmpDir}`);
    return tmpDir;
  }
};

const finalUploadDir = createUploadDir();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure directory exists before each upload
    if (!fs.existsSync(finalUploadDir)) {
      fs.mkdirSync(finalUploadDir, { recursive: true });
    }
    cb(null, finalUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter to accept only PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDFs are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: env.UPLOAD_FILESIZE_LIMIT ?? 5 * 1024 * 1024 // 5MB
  }
});

export default upload;