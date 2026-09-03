const ProviderProfile = require('../models/ProviderProfile');
const { CATEGORY_DEFINITIONS } = require('../data/categories');
const { KANDAHAR_DISTRICTS, SERVICE_TYPES } = require('../data/serviceTypes');
const { absoluteImageUrl } = require('../middleware/uploadMiddleware');
const { listCriticalContactsFromDb } = require('../utils/criticalContactsStore');

const MAX_LIMIT = 200;

const normalizeCategoryParam = (value) =>
  typeof value === 'string' ? value.trim().toLowerCase() : undefined;

const normalizeSearchParam = (query) => {
  if (typeof query.q === 'string') {
    return query.q.trim();
  }
  if (typeof query.search === 'string') {
    return query.search.trim();
  }
  return undefined;
};

const buildDirectoryFilters = (query) => {
  const filters = { status: 'approved' };
  const category =
    normalizeCategoryParam(query.category) ||
    normalizeCategoryParam(query.serviceType) ||
    normalizeCategoryParam(query.slug);
  if (category) {
    filters.serviceType = category;
  }

  const district = typeof query.district === 'string' ? query.district.trim() : '';
  if (district) {
    filters.$or = [
      { district: { $regex: district, $options: 'i' } },
      { location: { $regex: district, $options: 'i' } },
    ];
  }

  const search = normalizeSearchParam(query);
  if (search) {
    const searchClause = [
      { organizationName: { $regex: search, $options: 'i' } },
      { organizationNameLocal: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { district: { $regex: search, $options: 'i' } },
      { phoneNumber: { $regex: search, $options: 'i' } },
    ];
    if (filters.$or) {
      filters.$and = [{ $or: filters.$or }, { $or: searchClause }];
      delete filters.$or;
    } else {
      filters.$or = searchClause;
    }
  }
  return filters;
};

const contactMatchesSearch = (item, search) => {
  if (!search) {
    return true;
  }
  const needle = search.toLowerCase();
  const haystack = [
    item.name,
    item.nameLocal,
    item.organization,
    item.description,
    item.location,
    item.district,
    item.phoneNumber,
    item.altPhoneNumber,
  ]
    .filter((value) => typeof value === 'string' && value)
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
};

const toEmergencyContact = (providerDoc, req) => ({
  id: providerDoc._id.toString(),
  name: providerDoc.organizationName,
  nameLocal: providerDoc.organizationNameLocal || '',
  organization: providerDoc.organizationName,
  phoneNumber: providerDoc.phoneNumber,
  altPhoneNumber: providerDoc.altPhoneNumber,
  category: providerDoc.serviceType,
  location: providerDoc.location,
  district: providerDoc.district || '',
  imageUrl: absoluteImageUrl(req, providerDoc.imageUrl || ''),
  availability: providerDoc.availability,
  description: providerDoc.description || '',
  supportSms: providerDoc.capabilities?.includes('sms') ?? true,
  isCritical: false,
});

const mergeCriticalContacts = (contacts, criticalList, category, district) => {
  const critical = criticalList.filter((item) => {
    if (category && item.category !== category) {
      return false;
    }
    if (district) {
      const haystack = `${item.district || ''} ${item.location || ''}`.toLowerCase();
      return haystack.includes(district.toLowerCase());
    }
    return true;
  });

  const seen = new Set(contacts.map((c) => c.id));
  const merged = [...contacts];
  critical.forEach((item) => {
    if (!seen.has(item.id)) {
      merged.unshift(item);
      seen.add(item.id);
    }
  });
  return merged;
};

const listDirectoryCategories = async (req, res) => {
  res.json(CATEGORY_DEFINITIONS);
};

const listDistricts = async (req, res) => {
  res.json(KANDAHAR_DISTRICTS);
};

const listCriticalContacts = async (req, res) => {
  try {
    const contacts = await listCriticalContactsFromDb();
    res.json(contacts);
  } catch (error) {
    console.error('Directory critical list error:', error.message);
    res.status(500).json({ message: 'Unable to load critical contacts' });
  }
};

const listDirectoryContacts = async (req, res) => {
  try {
    const filters = buildDirectoryFilters(req.query);
    const limit = Math.min(Number(req.query.limit) || 100, MAX_LIMIT);
    const category =
      normalizeCategoryParam(req.query.category) ||
      normalizeCategoryParam(req.query.serviceType) ||
      normalizeCategoryParam(req.query.slug);
    const district = typeof req.query.district === 'string' ? req.query.district.trim() : '';

    const [providers, criticalList] = await Promise.all([
      ProviderProfile.find(filters).sort({ updatedAt: -1 }).limit(limit).lean(),
      listCriticalContactsFromDb(),
    ]);
    const mapped = providers.map((provider) => toEmergencyContact(provider, req));
    const withCritical = mergeCriticalContacts(mapped, criticalList, category, district);
    const search = normalizeSearchParam(req.query);
    res.json(search ? withCritical.filter((item) => contactMatchesSearch(item, search)) : withCritical);
  } catch (error) {
    console.error('Directory list error:', error.message);
    res.status(500).json({ message: 'Unable to load directory contacts' });
  }
};

const getDirectoryContact = async (req, res) => {
  try {
    const criticalList = await listCriticalContactsFromDb();
    const critical = criticalList.find(
      (item) => item.id === req.params.id || item._id === req.params.id
    );
    if (critical) {
      return res.json(critical);
    }

    if (!req.params.id.match(/^[a-fA-F0-9]{24}$/)) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    const provider = await ProviderProfile.findOne({
      _id: req.params.id,
      status: 'approved',
    }).lean();
    if (!provider) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(toEmergencyContact(provider, req));
  } catch (error) {
    console.error('Directory contact error:', error.message);
    res.status(500).json({ message: 'Unable to load contact' });
  }
};

const getAboutOverview = async (req, res) => {
  try {
    const [statusCounts, serviceCounts, districtRows, recentApproved, criticalList] = await Promise.all([
      ProviderProfile.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      ProviderProfile.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: '$serviceType', count: { $sum: 1 } } },
      ]),
      ProviderProfile.aggregate([
        { $match: { status: 'approved', district: { $nin: [null, ''] } } },
        { $group: { _id: '$district', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ProviderProfile.find({ status: 'approved' })
        .sort({ updatedAt: -1 })
        .limit(6)
        .select('organizationName serviceType district location phoneNumber updatedAt imageUrl')
        .lean(),
      listCriticalContactsFromDb(),
    ]);

    const byStatus = { approved: 0, pending: 0, rejected: 0 };
    statusCounts.forEach((row) => {
      if (row._id && Object.prototype.hasOwnProperty.call(byStatus, row._id)) {
        byStatus[row._id] = row.count;
      }
    });

    const byServiceType = {};
    SERVICE_TYPES.forEach((type) => {
      byServiceType[type] = 0;
    });
    serviceCounts.forEach((row) => {
      if (row._id) {
        byServiceType[row._id] = row.count;
      }
    });

    const districts = districtRows.map((row) => ({
      name: row._id,
      count: row.count,
    }));

    const fieldUnits =
      (byServiceType.ambulance || 0) +
      (byServiceType.firefighters || 0) +
      (byServiceType.rescue || 0) +
      (byServiceType.police || 0);

    res.json({
      generatedAt: new Date().toISOString(),
      coverage: {
        province: 'Kandahar',
        districtsCovered: districts.length,
        totalDistricts: KANDAHAR_DISTRICTS.length,
        districts,
      },
      totals: {
        approved: byStatus.approved,
        pending: byStatus.pending,
        rejected: byStatus.rejected,
        submissions: byStatus.approved + byStatus.pending + byStatus.rejected,
        criticalLines: criticalList.length,
        fieldUnits,
        hospitals: byServiceType.hospital || 0,
        pharmacies: byServiceType.pharmacy || 0,
        clinics: byServiceType.clinic || 0,
        ngos: byServiceType.ngo || 0,
      },
      byServiceType,
      recentApproved: recentApproved.map((item) => ({
        id: item._id.toString(),
        organizationName: item.organizationName,
        serviceType: item.serviceType,
        district: item.district || '',
        location: item.location || '',
        phoneNumber: item.phoneNumber,
        imageUrl: absoluteImageUrl(req, item.imageUrl || ''),
        updatedAt: item.updatedAt,
      })),
    });
  } catch (error) {
    console.error('About overview error:', error.message);
    res.status(500).json({ message: 'Unable to load about overview' });
  }
};

module.exports = {
  listDirectoryCategories,
  listDistricts,
  listCriticalContacts,
  listDirectoryContacts,
  getDirectoryContact,
  getAboutOverview,
};
