const express = require('express');
const {
  listDirectoryCategories,
  listDistricts,
  listCriticalContacts,
  listDirectoryContacts,
  getDirectoryContact,
  getAboutOverview,
} = require('../controllers/directoryController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/categories', authenticate, listDirectoryCategories);
router.get('/districts', authenticate, listDistricts);
router.get('/critical', listCriticalContacts);
router.get('/about', getAboutOverview);
router.get('/contacts', authenticate, listDirectoryContacts);
router.get('/contacts/:id', authenticate, getDirectoryContact);

module.exports = router;
