const mongoose = require('mongoose');
const { SERVICE_TYPES } = require('../data/serviceTypes');

const criticalContactSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, sparse: true, trim: true },
    name: { type: String, required: true, trim: true },
    organization: { type: String, default: '', trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    altPhoneNumber: { type: String, default: '', trim: true },
    category: { type: String, required: true, enum: SERVICE_TYPES },
    location: { type: String, default: 'Kandahar Province', trim: true },
    district: { type: String, default: 'Kandahar City', trim: true },
    description: { type: String, default: '', trim: true },
    availability: { type: String, default: '24/7', trim: true },
    supportSms: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

criticalContactSchema.index({ category: 1, sortOrder: 1 });

module.exports = mongoose.model('CriticalContact', criticalContactSchema);
