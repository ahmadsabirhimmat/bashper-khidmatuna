const fs = require('fs');
const path = require('path');
const ProviderProfile = require('../models/ProviderProfile');
const { uploadsRoot } = require('../middleware/uploadMiddleware');

const serveProviderImage = async (req, res) => {
  const filename = path.basename(req.params.filename || '');
  if (!filename || filename !== req.params.filename) {
    return res.status(404).json({ message: 'Image not found' });
  }

  const escaped = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const imageUrl = `/uploads/${filename}`;

  try {
    const provider = await ProviderProfile.findOne({
      $or: [{ imageUrl }, { imageUrl: { $regex: `/uploads/${escaped}$` } }],
    }).select('+imageData imageMimeType');
    if (provider?.imageData) {
      const payload = Buffer.isBuffer(provider.imageData)
        ? provider.imageData
        : Buffer.from(provider.imageData.buffer || provider.imageData);
      res.set('Content-Type', provider.imageMimeType || 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=86400');
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      return res.send(payload);
    }
  } catch (error) {
    console.error('Serve provider image error:', error.message);
  }

  const diskPath = path.join(uploadsRoot, filename);
  if (fs.existsSync(diskPath)) {
    res.set('Cache-Control', 'public, max-age=86400');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    return res.sendFile(diskPath);
  }

  return res.status(404).json({ message: 'Image not found' });
};

module.exports = { serveProviderImage };
