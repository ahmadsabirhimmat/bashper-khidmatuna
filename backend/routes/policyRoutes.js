const express = require('express');
const { getPolicy, updatePolicy } = require('../controllers/policyController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getPolicy);
router.put('/', authenticate, authorizeRoles('admin'), updatePolicy);

module.exports = router;
