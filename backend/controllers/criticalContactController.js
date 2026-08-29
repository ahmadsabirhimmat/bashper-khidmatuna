const { validationResult } = require('express-validator');
const CriticalContact = require('../models/CriticalContact');
const {
  toPublicContact,
  listCriticalContactsFromDb,
  ensureCriticalContacts,
} = require('../utils/criticalContactsStore');

const formatValidationErrors = (errors) => {
  const list = errors.array();
  return {
    message: list.map((item) => item.msg).filter(Boolean).join('. ') || 'Validation failed',
    errors: list,
  };
};

const slugFromPayload = (name, phoneNumber) => {
  const base = `${name || 'critical'}-${phoneNumber || Date.now()}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return `critical-${base || Date.now()}`;
};

const listAdminCriticalContacts = async (req, res) => {
  try {
    const contacts = await ensureCriticalContacts();
    res.json(contacts);
  } catch (error) {
    console.error('List critical contacts error:', error.message);
    res.status(500).json({ message: 'Unable to load critical contacts' });
  }
};

const createCriticalContact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(formatValidationErrors(errors));
  }

  try {
    const payload = {
      name: req.body.name.trim(),
      organization: (req.body.organization || req.body.name).trim(),
      phoneNumber: req.body.phoneNumber.trim(),
      altPhoneNumber: (req.body.altPhoneNumber || '').trim(),
      category: req.body.category,
      location: (req.body.location || 'Kandahar Province').trim(),
      district: (req.body.district || 'Kandahar City').trim(),
      description: (req.body.description || '').trim(),
      availability: (req.body.availability || '24/7').trim(),
      supportSms: Boolean(req.body.supportSms),
      sortOrder: Number(req.body.sortOrder) || 0,
      slug: slugFromPayload(req.body.name, req.body.phoneNumber),
    };
    const created = await CriticalContact.create(payload);
    res.status(201).json(toPublicContact(created));
  } catch (error) {
    console.error('Create critical contact error:', error.message);
    res.status(500).json({ message: 'Unable to create critical contact' });
  }
};

const updateCriticalContact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(formatValidationErrors(errors));
  }

  try {
    const contact = await CriticalContact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Critical contact not found' });
    }

    contact.name = req.body.name.trim();
    contact.organization = (req.body.organization || req.body.name).trim();
    contact.phoneNumber = req.body.phoneNumber.trim();
    contact.altPhoneNumber = (req.body.altPhoneNumber || '').trim();
    contact.category = req.body.category;
    contact.location = (req.body.location || contact.location).trim();
    contact.district = (req.body.district || contact.district).trim();
    contact.description = (req.body.description || '').trim();
    contact.availability = (req.body.availability || '24/7').trim();
    contact.supportSms = Boolean(req.body.supportSms);
    if (req.body.sortOrder !== undefined) {
      contact.sortOrder = Number(req.body.sortOrder) || 0;
    }
    await contact.save();
    res.json(toPublicContact(contact));
  } catch (error) {
    console.error('Update critical contact error:', error.message);
    res.status(500).json({ message: 'Unable to update critical contact' });
  }
};

const deleteCriticalContact = async (req, res) => {
  try {
    const contact = await CriticalContact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Critical contact not found' });
    }
    await contact.deleteOne();
    res.json({ message: 'Critical contact deleted' });
  } catch (error) {
    console.error('Delete critical contact error:', error.message);
    res.status(500).json({ message: 'Unable to delete critical contact' });
  }
};

module.exports = {
  listAdminCriticalContacts,
  createCriticalContact,
  updateCriticalContact,
  deleteCriticalContact,
  listCriticalContactsFromDb,
  ensureCriticalContacts,
};
