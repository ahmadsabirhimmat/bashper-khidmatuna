const mongoose = require('mongoose');
const { SERVICE_TYPES } = require('../data/serviceTypes');

const callEventSchema = new mongoose.Schema(
  {
    caller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    callerName: { type: String, trim: true, default: '' },
    callerEmail: { type: String, trim: true, lowercase: true, default: '' },
    callerPhone: { type: String, trim: true, default: '' },
    phoneNumber: { type: String, required: true, trim: true },
    serviceType: { type: String, enum: [...SERVICE_TYPES, 'unknown'], default: 'unknown', index: true },
    serviceName: { type: String, trim: true, default: '' },
    organization: { type: String, trim: true, default: '' },
    contactId: { type: String, trim: true, default: '' },
    source: { type: String, enum: ['directory', 'critical', 'unknown'], default: 'unknown' },
    district: { type: String, trim: true, default: '' },
    calledAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

callEventSchema.index({ calledAt: -1, serviceType: 1 });

module.exports = mongoose.model('CallEvent', callEventSchema);
