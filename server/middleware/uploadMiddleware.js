const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration with unique safe filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `resume-${uniqueSuffix}${ext}`);
  },
});

// File filter: accept only PDF, DOC, DOCX
const fileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream', // some browsers send this for docx
  ];

  if (allowedExts.includes(ext) && (allowedMimeTypes.includes(file.mimetype) || ext === '.docx' || ext === '.doc')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF, DOC, and DOCX files are allowed.'), false);
  }
};

const uploadResume = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter,
});

module.exports = {
  uploadResume,
  uploadDir,
};
