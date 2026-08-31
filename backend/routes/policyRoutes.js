const express = require('express');
const { getPolicy, updatePolicy, getTerms, updateTerms } = require('../controllers/policyController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getPolicy);
router.put('/', authenticate, authorizeRoles('admin'), updatePolicy);
router.get('/terms', getTerms);
router.put('/terms', authenticate, authorizeRoles('admin'), updateTerms);

module.exports = router;
