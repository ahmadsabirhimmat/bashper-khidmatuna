const express = require('express');
const { body } = require('express-validator');
const {
  listAdminCriticalContacts,
  createCriticalContact,
  updateCriticalContact,
  deleteCriticalContact,
} = require('../controllers/criticalContactController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { SERVICE_TYPES, KANDAHAR_DISTRICTS } = require('../data/serviceTypes');

const router = express.Router();

const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\d+#][\d\s()+-]{1,18}$/)
    .withMessage('Enter a valid phone or hotline number'),
  body('category').isIn(SERVICE_TYPES).withMessage('Select a valid service category'),
  body('district')
    .optional({ values: 'falsy' })
    .isIn(KANDAHAR_DISTRICTS)
    .withMessage('Select a valid Kandahar district'),
];

router.use(authenticate, authorizeRoles('admin'));

router.get('/', listAdminCriticalContacts);
router.post('/', contactValidation, createCriticalContact);
router.put('/:id', contactValidation, updateCriticalContact);
router.delete('/:id', deleteCriticalContact);

module.exports = router;
