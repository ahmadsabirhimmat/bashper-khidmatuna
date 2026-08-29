const Policy = require('../models/Policy');

const POLICY_KEY = 'privacy-policy';
const MAX_SECTIONS = 20;
const MAX_TEXT = 8000;

const DEFAULT_POLICY = {
  key: POLICY_KEY,
  title: {
    en: 'Privacy policy',
    ps: 'د محرمیت تګلاره',
    dr: 'سیاست حریم خصوصی',
  },
  subtitle: {
    en: 'This policy explains how Bashper Khidmatuna collects and uses information in the mobile app, provider portal, and admin console.',
    ps: 'دا تګلاره څرګندوي چې بشپر خدمتونه په موبایل اپ، د چمتو کوونکي پورټل او اډمین کنسول کې معلومات څنګه راټولوي او کاروي.',
    dr: 'این سیاست توضیح می‌دهد که بشپر خدمتونه در اپ موبایل، پورتال ارائه‌دهنده و کنسول مدیر چگونه اطلاعات را جمع‌آوری و استفاده می‌کند.',
  },
  sections: [
    {
      heading: {
        en: 'What we collect',
        ps: 'موږ څه راټولوو',
        dr: 'چه چیزی جمع می‌کنیم',
      },
      body: {
        en: 'Account details you provide (name, email, phone, password). Provider listings you submit (organization, numbers, location, district, photos). Location permission on the mobile app is optional and used only to sort nearby services. Favorites are stored on the device, not on the server.',
        ps: 'هغه حساب معلومات چې تاسو یې ورکوئ (نوم، بریښنالیک، تلیفون، پټنوم). هغه خدمتونه چې تاسو یې سپارئ (موسسه، شمېرې، ځای، ولسوالۍ، انځورونه). د موقعیت اجازه په موبایل کې اختیاري ده او یوازې د نږدې خدماتو ترتیب لپاره کارېږي. خوښې په وسیله کې ساتل کېږي، نه په سرور کې.',
        dr: 'جزئیات حسابی که وارد می‌کنید (نام، ایمیل، تلفن، رمز). فهرست خدماتی که ثبت می‌کنید (سازمان، شماره‌ها، موقعیت، ولسوالی، عکس). اجازه موقعیت در اپ موبایل اختیاری است و فقط برای مرتب‌سازی خدمات نزدیک استفاده می‌شود. علاقه‌مندی‌ها روی دستگاه ذخیره می‌شوند، نه روی سرور.',
      },
    },
    {
      heading: {
        en: 'How we use it',
        ps: 'څنګه یې کاروو',
        dr: 'چگونه استفاده می‌کنیم',
      },
      body: {
        en: 'We use this data to create your account, send email verification and password-reset codes, publish approved emergency contacts, and operate the Kandahar directory. We do not sell personal data.',
        ps: 'دا معلومات د حساب جوړولو، د بریښنالیک تایید او د پټنوم بیا تنظیم کوډونو، د تایید شویو بیړنیو اړیکو خپرولو، او د کندهار لارښود چلولو لپاره کاروو. شخصي معلومات نه پلورو.',
        dr: 'از این داده‌ها برای ساخت حساب، ارسال کد تأیید ایمیل و بازیابی رمز، انتشار تماس‌های اضطراری تأییدشده و اداره راهنمای کندهار استفاده می‌کنیم. اطلاعات شخصی را نمی‌فروشیم.',
      },
    },
    {
      heading: {
        en: 'Retention and deletion',
        ps: 'ساتنه او ړنګول',
        dr: 'نگهداری و حذف',
      },
      body: {
        en: 'You can delete your mobile or provider account in the profile screen. Deleting an account removes the user record and any provider numbers owned by that account. Critical public emergency lines managed by admins stay in the directory.',
        ps: 'تاسو کولی شئ خپل موبایل یا چمتو کوونکی حساب په پروفایل کې ړنګ کړئ. د حساب ړنګول کارن ریکارډ او هغه شمېرې له منځه وړي چې د هغه حساب پورې اړه لري. هغه عامه بیړنۍ کرښې چې اډمین یې اداره کوي په لارښود کې پاتې کېږي.',
        dr: 'می‌توانید حساب موبایل یا ارائه‌دهنده را از صفحه پروفایل حذف کنید. حذف حساب، پرونده کاربر و شماره‌های متعلق به آن حساب را پاک می‌کند. خطوط اضطراری عمومی که مدیر اداره می‌کند در راهنما می‌مانند.',
      },
    },
    {
      heading: {
        en: 'Contact',
        ps: 'اړیکه',
        dr: 'تماس',
      },
      body: {
        en: 'Questions about this policy can be sent through the Contact page in the provider portal.',
        ps: 'د دې تګلارې په اړه پوښتنې د چمتو کوونکي پورټل د اړیکې پاڼې له لارې واستوئ.',
        dr: 'سؤالات مربوط به این سیاست را از صفحه تماس پورتال ارائه‌دهنده بفرستید.',
      },
    },
  ],
};

const clip = (value, fallback = '') => {
  const next = typeof value === 'string' ? value.trim() : fallback;
  return next.slice(0, MAX_TEXT);
};

const normalizeLocalized = (value = {}, fallback = {}) => ({
  en: clip(value.en, fallback.en || ''),
  ps: clip(value.ps, fallback.ps || ''),
  dr: clip(value.dr, fallback.dr || ''),
});

const toPublicPolicy = (doc) => ({
  id: doc._id,
  title: doc.title,
  subtitle: doc.subtitle,
  sections: Array.isArray(doc.sections) ? doc.sections : [],
  updatedAt: doc.updatedAt,
});

const ensurePolicy = async () => {
  const existing = await Policy.findOne({ key: POLICY_KEY });
  if (existing) {
    return existing;
  }
  return Policy.create(DEFAULT_POLICY);
};

const getPolicy = async (req, res) => {
  try {
    const policy = await ensurePolicy();
    res.json(toPublicPolicy(policy));
  } catch (error) {
    console.error('Get policy error:', error.message);
    res.status(500).json({ message: 'Unable to load privacy policy' });
  }
};

const updatePolicy = async (req, res) => {
  try {
    const current = await ensurePolicy();
    const body = req.body || {};

    current.title = normalizeLocalized(body.title, current.title);
    current.subtitle = normalizeLocalized(body.subtitle, current.subtitle);

    if (!current.title.en) {
      return res.status(400).json({ message: 'English policy title is required.' });
    }

    const incomingSections = Array.isArray(body.sections) ? body.sections : current.sections;
    if (incomingSections.length > MAX_SECTIONS) {
      return res.status(400).json({
        message: `A policy can have at most ${MAX_SECTIONS} sections.`,
      });
    }

    const sections = incomingSections
      .map((section, index) => {
        const previous = current.sections[index] || {};
        return {
          heading: normalizeLocalized(section?.heading, previous.heading),
          body: normalizeLocalized(section?.body, previous.body),
        };
      })
      .filter((section) => section.heading.en || section.body.en || section.heading.ps || section.body.ps);

    if (!sections.length) {
      return res.status(400).json({ message: 'Add at least one policy section.' });
    }

    const missingEnglish = sections.find((section) => !section.heading.en || !section.body.en);
    if (missingEnglish) {
      return res.status(400).json({
        message: 'Each section needs an English heading and body.',
      });
    }

    current.sections = sections;
    await current.save();
    res.json(toPublicPolicy(current));
  } catch (error) {
    console.error('Update policy error:', error.message);
    res.status(500).json({ message: 'Unable to update privacy policy' });
  }
};

module.exports = {
  getPolicy,
  updatePolicy,
  ensurePolicy,
  DEFAULT_POLICY,
};
