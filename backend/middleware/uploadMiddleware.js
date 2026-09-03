const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsRoot = path.join(__dirname, '..', 'uploads');

/** Keep uploads reasonable for limited disk space (files are stored in MongoDB). */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

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

const fileFilter = (_req, file, cb) => {
  const mime = (file.mimetype || '').toLowerCase();
  const ext = path.extname(file.originalname || '').toLowerCase();
  const allowedExts = ALLOWED_IMAGE_TYPES[mime];

  if (!allowedExts) {
    return cb(
      new Error('Only JPG, JPEG, JFIF, PNG, WEBP, or GIF images are allowed')
    );
  }

  if (ext && !allowedExts.includes(ext)) {
    return cb(
      new Error('Image file extension does not match the image type')
    );
  }

  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: MAX_IMAGE_BYTES,
    files: 1,
  },
});

const pickImageExtension = (file) => {
  const ext = path.extname(file?.originalname || '').toLowerCase();
  if (ALLOWED_EXTENSIONS.has(ext)) {
    return ext;
  }
  const fromMime = ALLOWED_IMAGE_TYPES[(file?.mimetype || '').toLowerCase()];
  return fromMime?.[0] || '.jpg';
};

const buildStoredImage = (file) => {
  if (!file?.buffer) {
    return null;
  }
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${pickImageExtension(file)}`;
  return {
    filename,
    publicPath: `/uploads/${filename}`,
    mimeType: file.mimetype || 'image/jpeg',
    data: file.buffer,
  };
};

const toPublicImagePath = (filename) => (filename ? `/uploads/${filename}` : '');

const getPublicApiBase = (req) => {
  const envBase = (process.env.PUBLIC_API_URL || process.env.RENDER_EXTERNAL_URL || '')
    .trim()
    .replace(/\/$/, '');
  if (envBase) {
    return envBase;
  }
  const proto = String(req.get('x-forwarded-proto') || req.protocol || 'http')
    .split(',')[0]
    .trim();
  const host = String(req.get('x-forwarded-host') || req.get('host') || '')
    .split(',')[0]
    .trim();
  if (!host) {
    return '';
  }
  return `${proto}://${host}`;
};

const absoluteImageUrl = (req, imagePath) => {
  if (!imagePath) {
    return '';
  }
  const base = getPublicApiBase(req);
  if (/^https?:\/\//i.test(imagePath)) {
    try {
      const parsed = new URL(imagePath);
      if (parsed.pathname.startsWith('/uploads/')) {
        return base ? `${base}${parsed.pathname}` : imagePath;
      }
    } catch {
      return imagePath;
    }
    return imagePath;
  }
  const pathname = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return base ? `${base}${pathname}` : pathname;
};

const deleteUploadedFile = (imagePath) => {
  if (!imagePath) {
    return;
  }
  let pathname = imagePath;
  try {
    if (/^https?:\/\//i.test(imagePath)) {
      pathname = new URL(imagePath).pathname;
    }
  } catch {
    pathname = imagePath;
  }
  if (!pathname.startsWith('/uploads/')) {
    return;
  }
  const filename = path.basename(pathname);
  const fullPath = path.join(uploadsRoot, filename);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = {
  upload,
  uploadsRoot,
  buildStoredImage,
  toPublicImagePath,
  absoluteImageUrl,
  deleteUploadedFile,
  MAX_IMAGE_BYTES,
  ALLOWED_IMAGE_TYPES,
};
