const { validationResult } = require('express-validator');
const ProviderProfile = require('../models/ProviderProfile');
const {
  absoluteImageUrl,
  deleteUploadedFile,
  toPublicImagePath,
} = require('../middleware/uploadMiddleware');

const buildFilters = (query) => {
  const filters = {};
  if (query.serviceType) {
    filters.serviceType = query.serviceType;
  }
  if (query.status) {
    filters.status = query.status;
  }
  if (query.search) {
    filters.$or = [
      { organizationName: { $regex: query.search, $options: 'i' } },
      { organizationNameLocal: { $regex: query.search, $options: 'i' } },
    ];
  }
  return filters;
};

const formatValidationErrors = (errors) => {
  const list = errors.array();
  return {
    message: list.map((item) => item.msg).filter(Boolean).join('. ') || 'Validation failed',
    errors: list,
  };
};

const serializeProvider = (provider, req) => {
  const doc = typeof provider.toObject === 'function' ? provider.toObject() : { ...provider };
  return {
    ...doc,
    imageUrl: absoluteImageUrl(req, doc.imageUrl || ''),
  };
};

const createProviderProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) {
      deleteUploadedFile(toPublicImagePath(req.file.filename));
    }
    return res.status(400).json(formatValidationErrors(errors));
  }

  try {
    const ownerId = req.user?.id || req.body.ownerId;
    if (!ownerId) {
      if (req.file) {
        deleteUploadedFile(toPublicImagePath(req.file.filename));
      }
      return res.status(400).json({ message: 'Owner context missing' });
    }

    const requesterRole = req.user?.role || 'provider';
    const allowedStatuses = ['pending', 'approved', 'rejected'];
    const requestedStatus = allowedStatuses.includes(req.body.status) ? req.body.status : undefined;
    const initialStatus = requesterRole === 'admin' ? requestedStatus || 'approved' : 'pending';

    const payload = {
      owner: ownerId,
      organizationName: req.body.organizationName,
      organizationNameLocal: (req.body.organizationNameLocal || '').trim(),
      serviceType: req.body.serviceType,
      phoneNumber: req.body.phoneNumber,
      altPhoneNumber: req.body.altPhoneNumber || undefined,
      email: req.body.email || undefined,
      location: req.body.location,
      district: req.body.district || '',
      imageUrl: req.file ? toPublicImagePath(req.file.filename) : '',
      availability: req.body.availability || undefined,
      description: req.body.description || undefined,
      tags: req.body.tags,
      capabilities: req.body.capabilities,
      status: initialStatus,
    };

    const provider = await ProviderProfile.create(payload);
    res.status(201).json(serializeProvider(provider, req));
  } catch (error) {
    if (req.file) {
      deleteUploadedFile(toPublicImagePath(req.file.filename));
    }
    console.error('Create provider error:', error.message);
    res.status(500).json({ message: 'Unable to create provider profile' });
  }
};

const getProviders = async (req, res) => {
  try {
    const filters = buildFilters(req.query);
    const providers = await ProviderProfile.find(filters).sort({ updatedAt: -1 });
    res.json(providers.map((item) => serializeProvider(item, req)));
  } catch (error) {
    console.error('List providers error:', error.message);
    res.status(500).json({ message: 'Unable to fetch providers' });
  }
};

const getMyProviders = async (req, res) => {
  try {
    const filters = buildFilters(req.query);
    if (req.user.role === 'admin' && req.query.ownerId) {
      filters.owner = req.query.ownerId;
    } else {
      filters.owner = req.user.id;
    }

    const providers = await ProviderProfile.find(filters).sort({ updatedAt: -1 });
    res.json(providers.map((item) => serializeProvider(item, req)));
  } catch (error) {
    console.error('List my providers error:', error.message);
    res.status(500).json({ message: 'Unable to fetch provider profiles' });
  }
};

const getProviderById = async (req, res) => {
  try {
    const provider = await ProviderProfile.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    if (req.user.role === 'provider' && provider.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(serializeProvider(provider, req));
  } catch (error) {
    console.error('Get provider error:', error.message);
    res.status(500).json({ message: 'Unable to fetch provider' });
  }
};

const updateProvider = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) {
      deleteUploadedFile(toPublicImagePath(req.file.filename));
    }
    return res.status(400).json(formatValidationErrors(errors));
  }

  try {
    const provider = await ProviderProfile.findById(req.params.id);
    if (!provider) {
      if (req.file) {
        deleteUploadedFile(toPublicImagePath(req.file.filename));
      }
      return res.status(404).json({ message: 'Provider not found' });
    }

    const isOwner = req.user && provider.owner.toString() === req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      if (req.file) {
        deleteUploadedFile(toPublicImagePath(req.file.filename));
      }
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updates = {
      organizationName: req.body.organizationName,
      organizationNameLocal:
        typeof req.body.organizationNameLocal === 'string'
          ? req.body.organizationNameLocal.trim()
          : undefined,
      serviceType: req.body.serviceType,
      phoneNumber: req.body.phoneNumber,
      altPhoneNumber: req.body.altPhoneNumber,
      email: req.body.email,
      location: req.body.location,
      district: req.body.district,
      availability: req.body.availability,
      description: req.body.description,
      tags: req.body.tags,
      capabilities: req.body.capabilities,
    };

    if (req.file) {
      const previousImage = provider.imageUrl;
      updates.imageUrl = toPublicImagePath(req.file.filename);
      if (previousImage && previousImage !== updates.imageUrl) {
        deleteUploadedFile(previousImage);
      }
    } else if (req.body.removeImage === 'true') {
      deleteUploadedFile(provider.imageUrl);
      updates.imageUrl = '';
    }

    Object.keys(updates).forEach((key) => {
      if (typeof updates[key] === 'undefined') {
        delete updates[key];
      }
    });

    const updated = await ProviderProfile.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(serializeProvider(updated, req));
  } catch (error) {
    if (req.file) {
      deleteUploadedFile(toPublicImagePath(req.file.filename));
    }
    console.error('Update provider error:', error.message);
    res.status(500).json({ message: 'Unable to update provider' });
  }
};

const deleteProvider = async (req, res) => {
  try {
    const provider = await ProviderProfile.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const isOwner = req.user && provider.owner.toString() === req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    deleteUploadedFile(provider.imageUrl);
    await provider.deleteOne();
    res.json({ message: 'Provider deleted' });
  } catch (error) {
    console.error('Delete provider error:', error.message);
    res.status(500).json({ message: 'Unable to delete provider' });
  }
};

const reviewProviderStatus = async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const provider = await ProviderProfile.findByIdAndUpdate(
      req.params.id,
      { status, lastVerifiedAt: status === 'approved' ? new Date() : undefined },
      { new: true }
    );

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.json(serializeProvider(provider, req));
  } catch (error) {
    console.error('Review provider error:', error.message);
    res.status(500).json({ message: 'Unable to update status' });
  }
};

module.exports = {
  createProviderProfile,
  getProviders,
  getMyProviders,
  getProviderById,
  updateProvider,
  deleteProvider,
  reviewProviderStatus,
};
