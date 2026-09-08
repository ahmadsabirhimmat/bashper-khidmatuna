const { validationResult } = require('express-validator');
const CallEvent = require('../models/CallEvent');
const { SERVICE_TYPES } = require('../data/serviceTypes');

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toCallResponse = (event) => ({
  id: event._id,
  callerId: event.caller || null,
  callerName: event.callerName || '',
  callerEmail: event.callerEmail || '',
  callerPhone: event.callerPhone || '',
  phoneNumber: event.phoneNumber,
  serviceType: event.serviceType || 'unknown',
  serviceName: event.serviceName || '',
  organization: event.organization || '',
  contactId: event.contactId || '',
  source: event.source || 'unknown',
  district: event.district || '',
  calledAt: event.calledAt || event.createdAt,
  createdAt: event.createdAt,
});

const createCallEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array().map((item) => item.msg).filter(Boolean).join('. ') || 'Validation failed',
      errors: errors.array(),
    });
  }

  try {
    const user = req.user;
    const serviceType = SERVICE_TYPES.includes(req.body.serviceType) ? req.body.serviceType : 'unknown';
    const source = ['directory', 'critical'].includes(req.body.source) ? req.body.source : 'unknown';

    const event = await CallEvent.create({
      caller: user?._id || null,
      callerName: user?.fullName || (user ? '' : 'Guest'),
      callerEmail: user?.email || '',
      callerPhone: user?.phoneNumber || '',
      phoneNumber: String(req.body.phoneNumber || '').trim(),
      serviceType,
      serviceName: String(req.body.serviceName || '').trim(),
      organization: String(req.body.organization || '').trim(),
      contactId: String(req.body.contactId || '').trim(),
      source,
      district: String(req.body.district || '').trim(),
      calledAt: new Date(),
    });

    res.status(201).json(toCallResponse(event));
  } catch (error) {
    console.error('Create call event error:', error.message);
    res.status(500).json({ message: 'Unable to record call' });
  }
};

const listCallEvents = async (req, res) => {
  try {
    const filters = {};
    if (SERVICE_TYPES.includes(req.query.serviceType)) {
      filters.serviceType = req.query.serviceType;
    }
    if (['directory', 'critical', 'unknown'].includes(req.query.source)) {
      filters.source = req.query.source;
    }
    const search = String(req.query.search || '').trim();
    if (search) {
      const pattern = { $regex: escapeRegex(search), $options: 'i' };
      filters.$or = [
        { callerName: pattern },
        { callerEmail: pattern },
        { callerPhone: pattern },
        { phoneNumber: pattern },
        { serviceName: pattern },
        { organization: pattern },
        { district: pattern },
      ];
    }

    const limit = Math.min(Math.max(Number(req.query.limit) || 300, 1), 500);
    const events = await CallEvent.find(filters).sort({ calledAt: -1 }).limit(limit);
    res.json(events.map(toCallResponse));
  } catch (error) {
    console.error('List call events error:', error.message);
    res.status(500).json({ message: 'Unable to fetch call log' });
  }
};

module.exports = {
  createCallEvent,
  listCallEvents,
};
