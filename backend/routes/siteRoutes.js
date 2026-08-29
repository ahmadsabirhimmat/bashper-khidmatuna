const express = require('express');
const { getSiteContact, updateSiteContact } = require('../controllers/siteContactController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/contact', getSiteContact);
router.put('/contact', authenticate, authorizeRoles('admin'), updateSiteContact);

module.exports = router;
