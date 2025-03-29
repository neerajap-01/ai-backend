import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/keys.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory path in a way that works in both ESM and CJS
const getCurrentDirPath = () => {
  if (typeof require !== 'undefined') {
    // CJS environment
    return process.cwd();
  }
  // ESM environment
  return dirname(fileURLToPath(import.meta.url));
};

const __dirname = getCurrentDirPath();

// For Netlify Functions, use tmp directory for uploads
const uploadDir = process.env.NETLIFY 
  ? '/tmp/uploads' 
  : path.join(dirname(dirname(__dirname)), 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Log the path to help with debugging
console.log(`📁 Upload directory path: ${uploadDir}`);

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
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