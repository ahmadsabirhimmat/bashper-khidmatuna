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
  const rows = await CriticalContact.find({
    category: { $ne: 'firefighters' },
    slug: { $ne: 'critical-fire-102' },
  }).sort({ sortOrder: 1, createdAt: 1 });

  return rows.map((doc) => {
    const item = toPublicContact(doc);
    if (item.phoneNumber === '112' || item.slug === 'critical-ambulance-112') {
      return {
        ...item,
        id: 'critical-ambulance-102',
        slug: 'critical-ambulance-102',
        phoneNumber: '102',
      };
    }
    return item;
  });
};

const ensureCriticalContacts = async () => {
  await CriticalContact.deleteMany({
    $or: [
      { slug: 'critical-fire-102' },
      { category: 'firefighters' },
      { phoneNumber: '102', category: 'firefighters' },
    ],
  });

  const ambulance = await CriticalContact.findOne({
    $or: [
      { slug: 'critical-ambulance-102' },
      { slug: 'critical-ambulance-112' },
      { phoneNumber: '112', category: 'ambulance' },
    ],
  });
  if (ambulance) {
    ambulance.slug = 'critical-ambulance-102';
    ambulance.phoneNumber = '102';
    await ambulance.save();
  }

  const count = await CriticalContact.countDocuments();
  if (count === 0) {
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
  }

  for (const [index, item] of CRITICAL_CONTACTS.entries()) {
    const exists = await CriticalContact.findOne({ slug: item.id });
    if (!exists) {
      await CriticalContact.create({
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
      });
    }
  }

  return listCriticalContactsFromDb();
};

module.exports = {
  toPublicContact,
  listCriticalContactsFromDb,
  ensureCriticalContacts,
};
