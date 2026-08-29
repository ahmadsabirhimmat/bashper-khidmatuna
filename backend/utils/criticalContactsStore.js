const CriticalContact = require('../models/CriticalContact');
const { CRITICAL_CONTACTS } = require('../data/criticalContacts');

const toPublicContact = (doc) => {
  const item = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: item.slug || item._id.toString(),
    _id: item._id.toString(),
    slug: item.slug || '',
    name: item.name,
    organization: item.organization || item.name,
    phoneNumber: item.phoneNumber,
    altPhoneNumber: item.altPhoneNumber || '',
    category: item.category,
    location: item.location || 'Kandahar Province',
    district: item.district || '',
    description: item.description || '',
    availability: item.availability || '24/7',
    supportSms: Boolean(item.supportSms),
    isCritical: true,
    sortOrder: item.sortOrder || 0,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const listCriticalContactsFromDb = async () => {
  const rows = await CriticalContact.find().sort({ sortOrder: 1, createdAt: 1 });
  return rows.map(toPublicContact);
};

const ensureCriticalContacts = async () => {
  const count = await CriticalContact.countDocuments();
  if (count > 0) {
    return listCriticalContactsFromDb();
  }

  await CriticalContact.insertMany(
    CRITICAL_CONTACTS.map((item, index) => ({
      slug: item.id,
      name: item.name,
      organization: item.organization,
      phoneNumber: item.phoneNumber,
      category: item.category,
      location: item.location,
      district: item.district,
      description: item.description,
      availability: item.availability,
      supportSms: item.supportSms,
      sortOrder: index,
    }))
  );

  return listCriticalContactsFromDb();
};

module.exports = {
  toPublicContact,
  listCriticalContactsFromDb,
  ensureCriticalContacts,
};
