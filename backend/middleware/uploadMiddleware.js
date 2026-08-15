const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Use OS temporary directory which resolves to /tmp on Vercel and local Temp on Windows/Mac
const uploadDir = path.join(os.tmpdir(), 'campus-cognition-uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniquePrefix}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.docx', '.txt', '.md', '.pptx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file format '${ext}'. Allowed: ${allowedExtensions.join(', ')}`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 700 * 1024 * 1024 // 700 MB MAX LIMIT
  }
});

module.exports = upload;
