import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/keys.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory path in a way that works in both ESM and CJS
const getCurrentDirPath = () => {
  try {
    return dirname(fileURLToPath(import.meta.url));
  } catch (error) {
    return process.cwd();
  }
};

const __dirname = getCurrentDirPath();

// For Netlify Functions, always use tmp directory for uploads
const uploadDir = process.env.NETLIFY 
  ? '/tmp/uploads' 
  : path.join(process.cwd(), 'uploads');

// Safely create directory
const createUploadDir = () => {
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    console.log(`📁 Upload directory created successfully at: ${uploadDir}`);
  } catch (error) {
    console.error(`❌ Error creating upload directory: ${error.message}`);
    // Fallback to /tmp if main directory creation fails
    if (!process.env.NETLIFY) {
      const tmpDir = '/tmp/uploads';
      fs.mkdirSync(tmpDir, { recursive: true });
      return tmpDir;
    }
  }
  return uploadDir;
};

const finalUploadDir = createUploadDir();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
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