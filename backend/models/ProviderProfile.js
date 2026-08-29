const mongoose = require('mongoose');
const { SERVICE_TYPES } = require('../data/serviceTypes');

const providerSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationName: { type: String, required: true, trim: true },
    organizationNameLocal: { type: String, trim: true, default: '' },
    serviceType: {
      type: String,
      enum: SERVICE_TYPES,
      required: true,
    },
    phoneNumber: { type: String, required: true, trim: true },
    altPhoneNumber: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    location: { type: String, required: true, trim: true },
    district: { type: String, trim: true, default: '' },
    imageUrl: { type: String, trim: true, default: '' },
    availability: { type: String, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    tags: [{ type: String }],
    capabilities: [{ type: String }],
    lastVerifiedAt: { type: Date },
  },
  { timestamps: true }
);

providerSchema.index({ status: 1, serviceType: 1 });
providerSchema.index({ district: 1, status: 1 });

module.exports = mongoose.model('ProviderProfile', providerSchema);
