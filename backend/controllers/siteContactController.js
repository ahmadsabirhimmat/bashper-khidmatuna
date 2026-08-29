const SiteContact = require('../models/SiteContact');

const CONTACT_KEY = 'provider-contact';

const DEFAULT_CONTACT = {
  key: CONTACT_KEY,
  title: {
    en: 'Contact Bashper Khidmatuna HQ',
    ps: 'له بشپر خدمتونو مرکزي دفتر سره اړیکه ونیسئ',
    dr: 'با دفتر مرکزی بشپر خدمتونه تماس بگیرید',
  },
  subtitle: {
    en: 'Reach us directly using the details below.',
    ps: 'له لاندې معلوماتو څخه په کار اخیستلو سره له موږ سره مستقیمه اړیکه ونیسئ.',
    dr: 'با استفاده از جزئیات زیر مستقیماً با ما تماس بگیرید.',
  },
  emergencyLabel: {
    en: 'Emergency Onboarding',
    ps: 'بیړنۍ شاملول',
    dr: 'ثبت‌نام اضطراری',
  },
  emergencyPhone: '+93 799 900 111',
  technicalLabel: {
    en: 'Technical Operations',
    ps: 'تخنیکي چارې',
    dr: 'عملیات تخنیکی',
  },
  technicalPhone: '+93 780 220 330',
  emailLabel: {
    en: 'Email',
    ps: 'بریښنالیک',
    dr: 'ایمیل',
  },
  email: 'support@bashperkhidmatuna.com',
  addressLabel: {
    en: 'Office Address',
    ps: 'د دفتر پته',
    dr: 'آدرس دفتر',
  },
  address: {
    en: 'Kandahar City, Kandahar Province, Afghanistan',
    ps: 'کندهار ښار، کندهار ولایت، افغانستان',
    dr: 'شهر کندهار، ولایت کندهار، افغانستان',
  },
  responseNote: {
    en: 'Response time under 30 minutes for priority incidents.',
    ps: 'د لومړیتوب پېښو لپاره ځواب تر ۳۰ دقیقو پورې محدود دی.',
    dr: 'زمان پاسخ برای حوادث اولویت‌دار کمتر از ۳۰ دقیقه است.',
  },
  officeHours: {
    en: 'Support available 24/7 for approved providers',
    ps: 'د تایید شویو خدمتونو لپاره ۲۴/۷ ملاتړ شته',
    dr: 'پشتیبانی ۲۴/۷ برای ارائه‌دهندگان تأییدشده',
  },
};

const ensureSiteContact = async () => {
  const existing = await SiteContact.findOne({ key: CONTACT_KEY });
  if (existing) {
    return existing;
  }
  return SiteContact.create(DEFAULT_CONTACT);
};

const getSiteContact = async (req, res) => {
  try {
    const contact = await ensureSiteContact();
    res.json(contact);
  } catch (error) {
    console.error('Get site contact error:', error.message);
    res.status(500).json({ message: 'Unable to load contact information' });
  }
};

const normalizeLocalized = (value = {}, fallback = {}) => ({
  en: typeof value.en === 'string' ? value.en.trim() : fallback.en || '',
  ps: typeof value.ps === 'string' ? value.ps.trim() : fallback.ps || '',
  dr: typeof value.dr === 'string' ? value.dr.trim() : fallback.dr || '',
});

const updateSiteContact = async (req, res) => {
  try {
    const current = await ensureSiteContact();
    const body = req.body || {};

    current.title = normalizeLocalized(body.title, current.title);
    current.subtitle = normalizeLocalized(body.subtitle, current.subtitle);
    current.emergencyLabel = normalizeLocalized(body.emergencyLabel, current.emergencyLabel);
    current.technicalLabel = normalizeLocalized(body.technicalLabel, current.technicalLabel);
    current.emailLabel = normalizeLocalized(body.emailLabel, current.emailLabel);
    current.addressLabel = normalizeLocalized(body.addressLabel, current.addressLabel);
    current.address = normalizeLocalized(body.address, current.address);
    current.responseNote = normalizeLocalized(body.responseNote, current.responseNote);
    current.officeHours = normalizeLocalized(body.officeHours, current.officeHours);

    if (typeof body.emergencyPhone === 'string') {
      current.emergencyPhone = body.emergencyPhone.trim();
    }
    if (typeof body.technicalPhone === 'string') {
      current.technicalPhone = body.technicalPhone.trim();
    }
    if (typeof body.email === 'string') {
      current.email = body.email.trim().toLowerCase();
    }

    if (!current.emergencyPhone || !current.technicalPhone || !current.email) {
      return res.status(400).json({
        message: 'Emergency phone, technical phone, and email are required.',
      });
    }

    // Soft email rule for HQ contact page only: must include "@" (allows Gmail and informal addresses).
    if (!current.email.includes('@')) {
      return res.status(400).json({
        message: 'Email must include an @ symbol (for example name@gmail.com).',
      });
    }

    await current.save();
    res.json(current);
  } catch (error) {
    console.error('Update site contact error:', error.message);
    res.status(500).json({ message: 'Unable to update contact information' });
  }
};

module.exports = {
  getSiteContact,
  updateSiteContact,
  ensureSiteContact,
  DEFAULT_CONTACT,
};
