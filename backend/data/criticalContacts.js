/**
 * Always-available critical emergency numbers for Kandahar (offline-first).
 * These do not require MongoDB approval and ship with the API + mobile cache.
 */
const CRITICAL_CONTACTS = [
  {
    id: 'critical-police-119',
    name: 'Kandahar Police Emergency',
    organization: 'Afghanistan National Police',
    phoneNumber: '119',
    category: 'police',
    location: 'Kandahar Province',
    district: 'Kandahar City',
    description: 'Nationwide police emergency hotline. Available offline.',
    availability: '24/7',
    supportSms: false,
    isCritical: true,
  },
  {
    id: 'critical-ambulance-102',
    name: 'Ambulance Emergency',
    organization: 'Emergency Medical Services',
    phoneNumber: '102',
    category: 'ambulance',
    location: 'Kandahar Province',
    district: 'Kandahar City',
    description: 'Nationwide ambulance / medical emergency hotline. Available offline.',
    availability: '24/7',
    supportSms: false,
    isCritical: true,
  },
];

module.exports = {
  CRITICAL_CONTACTS,
};
