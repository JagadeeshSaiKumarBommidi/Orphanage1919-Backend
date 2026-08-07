const multer = require('multer');
const path = require('path');

// Files are received into memory so uploadController can convert them to
// WebP before writing anything to disk.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG, WEBP, GIF) are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    cb(null, `video-${Date.now()}${ext}`);
  }
});

const videoFileFilter = (req, file, cb) => {
  const allowed = /mp4|webm|mov|m4v|avi|mkv/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext) || (file.mimetype && file.mimetype.startsWith('video/'))) {
    cb(null, true);
  } else {
    cb(new Error('Only video files (MP4, WEBM, MOV, AVI, MKV) are allowed'));
  }
};

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: videoFileFilter
});

module.exports = upload;
module.exports.uploadVideo = uploadVideo;
