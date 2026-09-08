const express = require('express');
const { listMobileUsers, deleteMobileUser } = require('../controllers/usersController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate, authorizeRoles('admin'));

router.get('/', listMobileUsers);
router.delete('/:id', deleteMobileUser);

module.exports = router;
