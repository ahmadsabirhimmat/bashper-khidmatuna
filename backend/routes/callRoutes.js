const express = require('express');
const { body } = require('express-validator');
const { createCallEvent, listCallEvents } = require('../controllers/callController');
const { optionalAuthenticate, authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { SERVICE_TYPES } = require('../data/serviceTypes');

const router = express.Router();

router.post(
  '/',
  optionalAuthenticate,
  [
    body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
    body('serviceType')
      .optional({ values: 'falsy' })
      .isIn(SERVICE_TYPES)
      .withMessage('Invalid service type'),
    body('serviceName').optional({ values: 'falsy' }).trim().isLength({ max: 160 }),
    body('organization').optional({ values: 'falsy' }).trim().isLength({ max: 160 }),
    body('contactId').optional({ values: 'falsy' }).trim().isLength({ max: 80 }),
    body('source').optional({ values: 'falsy' }).isIn(['directory', 'critical']),
    body('district').optional({ values: 'falsy' }).trim().isLength({ max: 80 }),
  ],
  createCallEvent
);

router.get('/', authenticate, authorizeRoles('admin'), listCallEvents);

module.exports = router;
