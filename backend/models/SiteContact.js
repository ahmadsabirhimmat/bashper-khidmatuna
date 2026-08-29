const mongoose = require('mongoose');

const localizedString = {
  en: { type: String, default: '' },
  ps: { type: String, default: '' },
  dr: { type: String, default: '' },
};

const siteContactSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'provider-contact' },
    title: localizedString,
    subtitle: localizedString,
    emergencyLabel: localizedString,
    emergencyPhone: { type: String, default: '' },
    technicalLabel: localizedString,
    technicalPhone: { type: String, default: '' },
    emailLabel: localizedString,
    email: { type: String, default: '' },
    addressLabel: localizedString,
    address: localizedString,
    responseNote: localizedString,
    officeHours: localizedString,
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteContact', siteContactSchema);
