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
    id: 'critical-ambulance-112',
    name: 'Ambulance Emergency',
    organization: 'Emergency Medical Services',
    phoneNumber: '112',
    category: 'ambulance',
    location: 'Kandahar Province',
    district: 'Kandahar City',
    description: 'Nationwide ambulance / medical emergency hotline. Available offline.',
    availability: '24/7',
    supportSms: false,
    isCritical: true,
  },
  {
    id: 'critical-fire-102',
    name: 'Fire & Rescue Emergency',
    organization: 'Fire Department',
    phoneNumber: '102',
    category: 'firefighters',
    location: 'Kandahar Province',
    district: 'Kandahar City',
    description: 'Fire and rescue emergency hotline. Available offline.',
    availability: '24/7',
    supportSms: false,
    isCritical: true,
  },
];

module.exports = {
  CRITICAL_CONTACTS,
};
