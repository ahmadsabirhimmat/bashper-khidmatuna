const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsRoot = path.join(__dirname, '..', 'uploads');

/** Keep uploads reasonable for limited disk space (files are stored on disk, not in MongoDB). */
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg', '.jfif'],
  'image/pjpeg': ['.jpg', '.jpeg', '.jfif'],
  'image/jfif': ['.jfif', '.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
};

const ALLOWED_EXTENSIONS = new Set(
  Object.values(ALLOWED_IMAGE_TYPES).flat()
);

if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsRoot);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : '.jpg';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, unique);
  },
});

const fileFilter = (_req, file, cb) => {
  const mime = (file.mimetype || '').toLowerCase();
  const ext = path.extname(file.originalname || '').toLowerCase();
  const allowedExts = ALLOWED_IMAGE_TYPES[mime];

  if (!allowedExts) {
    return cb(
      new Error('Only JPG, JPEG, JFIF, PNG, WEBP, or GIF images are allowed')
    );
  }

  if (!allowedExts.includes(ext)) {
    return cb(
      new Error('Image file extension does not match the image type')
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_IMAGE_BYTES,
    files: 1,
  },
});

const toPublicImagePath = (filename) => (filename ? `/uploads/${filename}` : '');

const absoluteImageUrl = (req, imagePath) => {
  if (!imagePath) {
    return '';
  }
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }
  const base = `${req.protocol}://${req.get('host')}`;
  return `${base}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
};

const deleteUploadedFile = (imagePath) => {
  if (!imagePath || !imagePath.startsWith('/uploads/')) {
    return;
  }
  const filename = path.basename(imagePath);
  const fullPath = path.join(uploadsRoot, filename);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = {
  upload,
  uploadsRoot,
  toPublicImagePath,
  absoluteImageUrl,
  deleteUploadedFile,
  MAX_IMAGE_BYTES,
  ALLOWED_IMAGE_TYPES,
};
