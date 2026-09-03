const express = require('express');
const { body } = require('express-validator');
const {
  createProviderProfile,
  getProviders,
  getMyProviders,
  getProviderById,
  updateProvider,
  deleteProvider,
  reviewProviderStatus,
} = require('../controllers/providerController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const { SERVICE_TYPES, KANDAHAR_DISTRICTS } = require('../data/serviceTypes');

const router = express.Router();

const providerValidation = [
  body('organizationName').trim().notEmpty().withMessage('Organization name required'),
  body('organizationNameLocal')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 160 })
    .withMessage('Local service name must be 160 characters or less'),
  body('serviceType')
    .notEmpty()
    .isIn(SERVICE_TYPES)
    .withMessage('Invalid service type'),
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Contact number required')
    .matches(/^[+\d][\d\s()-]{6,18}$/)
    .withMessage('Enter a valid phone number (e.g. 0700123456 or +93 700 123 456)'),
  body('altPhoneNumber')
    .optional({ values: 'falsy' })
    .matches(/^[+\d][\d\s()-]{6,18}$/)
    .withMessage('Enter a valid alternate phone number'),
  body('location').trim().notEmpty().withMessage('Location required'),
  body('district')
    .optional({ values: 'falsy' })
    .isIn(KANDAHAR_DISTRICTS)
    .withMessage('Select a valid Kandahar district'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Valid email required'),
];

const handleUpload = (req, res, next) => {
  upload.single('image')(req, res, (error) => {
    if (!error) {
      return next();
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'The image size must be under 5 MB.',
      });
    }
    return res.status(400).json({ message: error.message || 'Unable to upload image' });
  });
};

router.get('/', authenticate, authorizeRoles('admin'), getProviders);

router.get('/mine', authenticate, authorizeRoles('provider', 'admin'), getMyProviders);

router.get('/:id', authenticate, authorizeRoles('provider', 'admin'), getProviderById);

router.post(
  '/',
  authenticate,
  authorizeRoles('provider', 'admin'),
  handleUpload,
  providerValidation,
  createProviderProfile
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('provider', 'admin'),
  handleUpload,
  providerValidation,
  updateProvider
);

router.delete('/:id', authenticate, authorizeRoles('provider', 'admin'), deleteProvider);

router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('admin'),
  body('status').isIn(['approved', 'rejected', 'pending']).withMessage('Invalid status'),
  reviewProviderStatus
);

module.exports = router;
