const Policy = require('../models/Policy');

const POLICY_KEY = 'privacy-policy';
const TERMS_KEY = 'terms-of-use';
const MAX_SECTIONS = 20;
const MAX_TEXT = 8000;

const LEGAL_EMAIL = 'bashperkhidmatuna@gmail.com';
const OLD_LEGAL_EMAIL = 'ahmadsabirhimmat@gmail.com';

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
        en: 'Disclaimer',
        ps: 'خبرتیا',
        dr: 'سلب مسئولیت',
      },
      body: {
        en: 'Bashper Khidmatuna is a public directory of emergency and essential service contacts in Kandahar. It is not an official government emergency dispatch system and does not replace calling national emergency numbers. In a life-threatening emergency, call 119 (police) or 102 (ambulance), or the nearest verified local service.',
        ps: 'بشپر خدمتونه د کندهار د بیړنیو او اړینو خدماتو عامه لارښود دی. دا د دولت رسمي بیړنی سیسټم نه دی او د ملي بیړنیو شمېرو ځای نه نیسي. په ژوند ګواښونکې پېښه کې ۱۱۹ (پولیس) یا ۱۰۲ (امبولانس) ووهئ، یا نږدې تایید شوی سیمه‌ییز خدمت.',
        dr: 'بشپر خدمتونه یک راهنمای عمومی تماس‌های اضطراری و خدمات اساسی در کندهار است. سامانه رسمی اضطراری دولت نیست و جایگزین شماره‌های ملی اضطراری نمی‌شود. در خطر جانی با ۱۱۹ (پولیس) یا ۱۰۲ (امبولانس) تماس بگیرید، یا نزدیک‌ترین خدمت تأییدشده محلی.',
      },
    },
    {
      heading: {
        en: 'Age requirement',
        ps: 'د عمر شرط',
        dr: 'شرط سن',
      },
      body: {
        en: 'You must be at least 13 years old to create an account and use Bashper Khidmatuna.',
        ps: 'د حساب جوړولو او د بشپر خدمتونو کارولو لپاره باید لږ تر لږه ۱۳ کلن اوسئ.',
        dr: 'برای ساخت حساب و استفاده از بشپر خدمتونه باید حداقل ۱۳ سال داشته باشید.',
      },
    },
    {
      heading: {
        en: 'Contact',
        ps: 'اړیکه',
        dr: 'تماس',
      },
      body: {
        en: `Questions about this policy can be sent to ${LEGAL_EMAIL}.`,
        ps: `د دې تګلارې په اړه پوښتنې ${LEGAL_EMAIL} ته واستوئ.`,
        dr: `سؤالات مربوط به این سیاست را به ${LEGAL_EMAIL} بفرستید.`,
      },
    },
  ],
};

const DEFAULT_TERMS = {
  key: TERMS_KEY,
  title: {
    en: 'Terms of use',
    ps: 'د کارولو شرطونه',
    dr: 'شرایط استفاده',
  },
  subtitle: {
    en: 'These terms govern use of Bashper Khidmatuna: the mobile app, provider portal, and related services.',
    ps: 'دا شرطونه د بشپر خدمتونو کارول تنظیموي: موبایل اپ، د چمتو کوونکي پورټل او اړوند خدمات.',
    dr: 'این شرایط استفاده از بشپر خدمتونه را تنظیم می‌کند: اپ موبایل، پورتال ارائه‌دهنده و خدمات مرتبط.',
  },
  sections: [
    {
      heading: {
        en: 'The service',
        ps: 'خدمت',
        dr: 'خدمت',
      },
      body: {
        en: 'Bashper Khidmatuna is a Kandahar emergency and essential-services directory. Listings are submitted by providers and reviewed by administrators. Information can be incomplete, outdated, or incorrect. Use listings as a starting point, not as a guarantee of availability.',
        ps: 'بشپر خدمتونه د کندهار د بیړنیو او اړینو خدماتو لارښود دی. لیستونه چمتو کوونکي سپاري او اډمین یې بیاکښي. معلومات ممکن نیمګړي، زاړه یا ناسم وي. لیستونه د پیل نقطه وګڼئ، نه د شتون تضمین.',
        dr: 'بشپر خدمتونه راهنمای خدمات اضطراری و اساسی کندهار است. فهرست‌ها را ارائه‌دهندگان ثبت می‌کنند و مدیر بررسی می‌کند. اطلاعات ممکن است ناقص، قدیمی یا نادرست باشد. از فهرست‌ها به‌عنوان نقطه شروع استفاده کنید، نه تضمین دسترسی.',
      },
    },
    {
      heading: {
        en: 'Not official emergency dispatch',
        ps: 'رسمي بیړنی سیسټم نه دی',
        dr: 'سامانه رسمی اضطراری نیست',
      },
      body: {
        en: 'This service is not an official government emergency system. Do not rely on it instead of calling national emergency numbers in a life-threatening situation: 119 (police) or 102 (ambulance).',
        ps: 'دا خدمت د دولت رسمي بیړنی سیسټم نه دی. په ژوند ګواښونکې پېښه کې پرې تکیه مه کوئ؛ ملي شمېرې ووهئ: ۱۱۹ (پولیس) یا ۱۰۲ (امبولانس).',
        dr: 'این خدمت سامانه رسمی اضطراری دولت نیست. در خطر جانی به‌جای آن به شماره‌های ملی زنگ بزنید: ۱۱۹ (پولیس) یا ۱۰۲ (امبولانس).',
      },
    },
    {
      heading: {
        en: 'Accounts',
        ps: 'حسابونه',
        dr: 'حساب‌ها',
      },
      body: {
        en: 'You must be at least 13 years old. Keep your login details private. You may delete your account in Profile. We may suspend accounts that misuse the directory or submit false listings.',
        ps: 'باید لږ تر لږه ۱۳ کلن اوسئ. د ننوتلو معلومات پټ وساتئ. حساب په پروفایل کې ړنګولی شئ. هغه حسابونه وځنډوو چې لارښود ناوړه کاروي یا ناسم لیستونه سپاري.',
        dr: 'باید حداقل ۱۳ سال داشته باشید. اطلاعات ورود را محرمانه نگه دارید. حساب را از پروفایل می‌توانید حذف کنید. حساب‌هایی که از راهنما سوءاستفاده کنند یا فهرست نادرست ثبت کنند ممکن است معلق شوند.',
      },
    },
    {
      heading: {
        en: 'Provider listings',
        ps: 'د چمتو کوونکو لیستونه',
        dr: 'فهرست ارائه‌دهندگان',
      },
      body: {
        en: 'If you add a service listing, you confirm you are authorized to publish those contact details and that they are accurate. Administrators may approve, reject, or remove listings.',
        ps: 'که خدمت اضافه کوئ، تاییدوئ چې د دغو اړیکو خپرولو واک لرئ او معلومات سم دي. اډمین کولی شي لیستونه تایید، رد یا لرې کړي.',
        dr: 'اگر خدمت ثبت می‌کنید، تأیید می‌کنید که مجاز به انتشار آن تماس‌ها هستید و اطلاعات درست است. مدیر می‌تواند فهرست را تأیید، رد یا حذف کند.',
      },
    },
    {
      heading: {
        en: 'Acceptable use',
        ps: 'سم کارول',
        dr: 'استفاده مجاز',
      },
      body: {
        en: 'Do not use the app to harass others, impersonate emergency services, scrape data for resale, or submit illegal content.',
        ps: 'اپ د ځورولو، د بیړنیو خدماتو په نوم ځان ښودلو، د پلور لپاره د معلوماتو راټولولو، یا غیرقانوني منځپانګې لپاره مه کاروئ.',
        dr: 'از اپ برای آزار دیگران، جعل هویت خدمات اضطراری، استخراج داده برای فروش، یا ثبت محتوای غیرقانونی استفاده نکنید.',
      },
    },
    {
      heading: {
        en: 'Changes',
        ps: 'بدلونونه',
        dr: 'تغییرات',
      },
      body: {
        en: 'We may update these terms. Continued use after an update means you accept the new terms. The current version is always available in the app and at the provider portal /terms page.',
        ps: 'دا شرطونه تازه کولی شو. له تازه کېدو وروسته دوامداره کارول د نویو شرطونو منل دي. اوسنۍ نسخه په اپ او د چمتو کوونکي پورټل /terms پاڼه کې ده.',
        dr: 'ممکن این شرایط را به‌روز کنیم. ادامه استفاده پس از به‌روزرسانی به‌معنای پذیرش شرایط جدید است. نسخه فعلی همیشه در اپ و صفحه /terms پورتال ارائه‌دهنده در دسترس است.',
      },
    },
    {
      heading: {
        en: 'Contact',
        ps: 'اړیکه',
        dr: 'تماس',
      },
      body: {
        en: `Questions about these terms can be sent to ${LEGAL_EMAIL}.`,
        ps: `د دې شرطونو په اړه پوښتنې ${LEGAL_EMAIL} ته واستوئ.`,
        dr: `سؤالات مربوط به این شرایط را به ${LEGAL_EMAIL} بفرستید.`,
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

const rewriteLegalText = (value = '') =>
  String(value)
    .replaceAll(OLD_LEGAL_EMAIL, LEGAL_EMAIL)
    .replaceAll('119 (police), 112 (ambulance), or 102 (fire) as applicable', '119 (police) or 102 (ambulance)')
    .replaceAll('119 (police), 112 (ambulance), or 102 (fire)', '119 (police) or 102 (ambulance)')
    .replaceAll('۱۱۹ (پولیس)، ۱۱۲ (امبولانس) یا ۱۰۲ (اور وژنه)', '۱۱۹ (پولیس) یا ۱۰۲ (امبولانس)')
    .replaceAll('۱۱۹ (پولیس)، ۱۱۲ (امبولانس) یا ۱۰۲ (آتش‌نشانی)', '۱۱۹ (پولیس) یا ۱۰۲ (امبولانس)');

const rewriteLegalSections = (sections = []) => {
  let dirty = false;
  const next = sections.map((section) => {
    const body = {
      en: rewriteLegalText(section?.body?.en || ''),
      ps: rewriteLegalText(section?.body?.ps || ''),
      dr: rewriteLegalText(section?.body?.dr || ''),
    };
    if (
      body.en !== (section?.body?.en || '') ||
      body.ps !== (section?.body?.ps || '') ||
      body.dr !== (section?.body?.dr || '')
    ) {
      dirty = true;
      return { ...section, body };
    }
    return section;
  });
  return { sections: next, dirty };
};

const headingEn = (section) => String(section?.heading?.en || '').toLowerCase();

const defaultSectionByHeading = (defaults, englishHeading) =>
  defaults.sections.find((section) => section.heading.en === englishHeading);

const migratePrivacy = async (doc) => {
  let sections = Array.isArray(doc.sections) ? [...doc.sections] : [];
  let dirty = false;

  const rewritten = rewriteLegalSections(sections);
  sections = rewritten.sections;
  dirty = rewritten.dirty;

  const contactIdx = sections.findIndex((section) => headingEn(section) === 'contact');
  if (contactIdx >= 0) {
    const bodyEn = String(sections[contactIdx].body?.en || '');
    if (/contact page/i.test(bodyEn) || /provider portal/i.test(bodyEn)) {
      const nextContact = defaultSectionByHeading(DEFAULT_POLICY, 'Contact');
      if (nextContact) {
        sections[contactIdx] = nextContact;
        dirty = true;
      }
    }
  }

  if (!sections.some((section) => headingEn(section).includes('disclaimer'))) {
    const disclaimer = defaultSectionByHeading(DEFAULT_POLICY, 'Disclaimer');
    if (disclaimer) {
      sections.push(disclaimer);
      dirty = true;
    }
  }

  if (!sections.some((section) => headingEn(section).includes('age'))) {
    const age = defaultSectionByHeading(DEFAULT_POLICY, 'Age requirement');
    if (age) {
      sections.push(age);
      dirty = true;
    }
  }

  if (!dirty) {
    return doc;
  }

  doc.sections = sections;
  await doc.save();
  return doc;
};

const migrateTerms = async (doc) => {
  const rewritten = rewriteLegalSections(Array.isArray(doc.sections) ? doc.sections : []);
  if (!rewritten.dirty) {
    return doc;
  }
  doc.sections = rewritten.sections;
  await doc.save();
  return doc;
};

const ensureDocument = async (key, defaults, migrate) => {
  const existing = await Policy.findOne({ key });
  if (!existing) {
    return Policy.create({ ...defaults, key });
  }
  if (migrate) {
    return migrate(existing);
  }
  return existing;
};

const ensurePolicy = () => ensureDocument(POLICY_KEY, DEFAULT_POLICY, migratePrivacy);
const ensureTerms = () => ensureDocument(TERMS_KEY, DEFAULT_TERMS, migrateTerms);

const getDocument = (ensure, loadError) => async (req, res) => {
  try {
    const document = await ensure();
    res.json(toPublicPolicy(document));
  } catch (error) {
    console.error(loadError, error.message);
    res.status(500).json({ message: loadError });
  }
};

const updateDocument = (ensure, labels) => async (req, res) => {
  try {
    const current = await ensure();
    const body = req.body || {};

    current.title = normalizeLocalized(body.title, current.title);
    current.subtitle = normalizeLocalized(body.subtitle, current.subtitle);

    if (!current.title.en) {
      return res.status(400).json({ message: labels.titleRequired });
    }

    const incomingSections = Array.isArray(body.sections) ? body.sections : current.sections;
    if (incomingSections.length > MAX_SECTIONS) {
      return res.status(400).json({
        message: `A document can have at most ${MAX_SECTIONS} sections.`,
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
      return res.status(400).json({ message: labels.sectionRequired });
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
    console.error(labels.saveError, error.message);
    res.status(500).json({ message: labels.saveError });
  }
};

const getPolicy = getDocument(ensurePolicy, 'Unable to load privacy policy');
const updatePolicy = updateDocument(ensurePolicy, {
  titleRequired: 'English policy title is required.',
  sectionRequired: 'Add at least one policy section.',
  saveError: 'Unable to update privacy policy',
});

const getTerms = getDocument(ensureTerms, 'Unable to load terms of use');
const updateTerms = updateDocument(ensureTerms, {
  titleRequired: 'English terms title is required.',
  sectionRequired: 'Add at least one terms section.',
  saveError: 'Unable to update terms of use',
});

module.exports = {
  getPolicy,
  updatePolicy,
  ensurePolicy,
  DEFAULT_POLICY,
  getTerms,
  updateTerms,
  ensureTerms,
  DEFAULT_TERMS,
};
