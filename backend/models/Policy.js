const mongoose = require('mongoose');

const localizedString = {
  en: { type: String, default: '' },
  ps: { type: String, default: '' },
  dr: { type: String, default: '' },
};

const policySectionSchema = new mongoose.Schema(
  {
    heading: localizedString,
    body: localizedString,
  },
  { _id: false }
);

const policySchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'privacy-policy' },
    title: localizedString,
    subtitle: localizedString,
    sections: { type: [policySectionSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Policy', policySchema);
