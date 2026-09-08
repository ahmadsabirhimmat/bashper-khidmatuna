const mongoose = require('mongoose');
const User = require('../models/User');
const EmailOtp = require('../models/EmailOtp');
const ProviderProfile = require('../models/ProviderProfile');
const { deleteUploadedFile } = require('../middleware/uploadMiddleware');

const MOBILE_ROLE = 'beneficiary';
const USER_STATUSES = ['pending', 'active', 'suspended'];

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toAdminUserResponse = (user) => ({
  id: user._id,
  fullName: user.fullName,
  organization: user.organization || '',
  email: user.email,
  phoneNumber: user.phoneNumber,
  role: user.role,
  status: user.status,
  emailVerified: Boolean(user.emailVerified),
  lastLoginAt: user.lastLoginAt || null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const buildFilters = (query = {}) => {
  const filters = { role: MOBILE_ROLE };
  if (USER_STATUSES.includes(query.status)) {
    filters.status = query.status;
  }
  const search = String(query.search || '').trim();
  if (search) {
    const pattern = { $regex: escapeRegex(search), $options: 'i' };
    filters.$or = [
      { fullName: pattern },
      { email: pattern },
      { phoneNumber: pattern },
      { organization: pattern },
    ];
  }
  return filters;
};

const purgeUserRecords = async (user) => {
  const ownedContacts = await ProviderProfile.find({ owner: user._id });
  ownedContacts.forEach((contact) => {
    deleteUploadedFile(contact.imageUrl);
  });
  await ProviderProfile.deleteMany({ owner: user._id });
  await EmailOtp.deleteMany({ email: user.email });
  await user.deleteOne();
};

const listMobileUsers = async (req, res) => {
  try {
    const users = await User.find(buildFilters(req.query))
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users.map(toAdminUserResponse));
  } catch (error) {
    console.error('List mobile users error:', error.message);
    res.status(500).json({ message: 'Unable to fetch app users' });
  }
};

const deleteMobileUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    if (String(req.user.id) === String(id)) {
      return res.status(400).json({ message: 'You cannot delete your own admin account here' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== MOBILE_ROLE) {
      return res.status(403).json({ message: 'Only mobile app users can be deleted from this list' });
    }

    await purgeUserRecords(user);
    res.json({ message: 'App user deleted' });
  } catch (error) {
    console.error('Delete mobile user error:', error.message);
    res.status(500).json({ message: 'Unable to delete app user' });
  }
};

module.exports = {
  listMobileUsers,
  deleteMobileUser,
};
