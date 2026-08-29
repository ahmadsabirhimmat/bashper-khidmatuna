const trilingual = (en, ps, dr) => ({ en, ps, dr });

const CATEGORY_DEFINITIONS = [
  {
    id: 'police',
    slug: 'police',
    icon: 'shield-checkmark',
    color: '#0B254A',
    accent: '#4C84FF',
    gradient: ['#0B254A', '#103D74'],
    sticker: trilingual('24/7 Patrol', '۲۴/۷ ګزمه', 'گشت ۲۴/۷'),
    title: trilingual('Police', 'پولیس', 'پولیس'),
    description: trilingual(
      'Report crimes or request rapid security response.',
      'د پولیسو سره د بیړني امنیتي مرستو لپاره اړیکه ونیسئ',
      'برای کمک امنیتی اضطراری با پولیس تماس بگیرید'
    ),
  },
  {
    id: 'ambulance',
    slug: 'ambulance',
    icon: 'medical',
    color: '#B00020',
    accent: '#FF6F61',
    gradient: ['#8C0C24', '#E53935'],
    sticker: trilingual('Rapid Care', 'چټک درملنه', 'مراقبت سریع'),
    title: trilingual('Ambulance', 'امبولانس', 'امبولانس'),
    description: trilingual(
      'Immediate medical evacuation support.',
      'د بیړني طبي لېږد ملاتړ',
      'حمایت انتقال فوری طبی'
    ),
  },
  {
    id: 'firefighters',
    slug: 'firefighters',
    icon: 'flame',
    color: '#FF8C00',
    accent: '#FFC371',
    gradient: ['#C24A00', '#FF8C00'],
    sticker: trilingual('Rescue Team', 'د ژغورنې ټیم', 'تیم نجات'),
    title: trilingual('Fire Department', 'اور وژنه', 'آتش‌نشانی'),
    description: trilingual(
      'Report fires and request rescue teams.',
      'د اور د کنټرول او ژغورنې لپاره اړیکه ونیسئ',
      'برای گزارش آتش‌سوزی و درخواست تیم نجات تماس بگیرید'
    ),
  },
  {
    id: 'hospital',
    slug: 'hospital',
    icon: 'medkit',
    color: '#00695C',
    accent: '#4DB6AC',
    gradient: ['#005046', '#00897B'],
    sticker: trilingual('Trauma Ready', 'د ټپونو لپاره چمتو', 'آماده برای تروما'),
    title: trilingual('Hospitals', 'روغتونونه', 'شفاخانه‌ها'),
    description: trilingual(
      'Find emergency-ready hospitals across Kandahar.',
      'په کندهار کې فعال روغتونونه ومومئ',
      'شفاخانه‌های فعال را در سراسر کندهار پیدا کنید'
    ),
  },
  {
    id: 'pharmacy',
    slug: 'pharmacy',
    icon: 'fitness',
    color: '#00838F',
    accent: '#4DD0E1',
    gradient: ['#006064', '#00ACC1'],
    sticker: trilingual('Medicines', 'درمل', 'داروها'),
    title: trilingual('Pharmacies', 'درملتونونه', 'داروخانه‌ها'),
    description: trilingual(
      'Locate pharmacies and essential medicines across Kandahar.',
      'په کندهار کې درملتونونه او ضروري درمل ومومئ',
      'داروخانه‌ها و داروهای ضروری را در کندهار پیدا کنید'
    ),
  },
  {
    id: 'clinic',
    slug: 'clinic',
    icon: 'bandage',
    color: '#3949AB',
    accent: '#7986CB',
    gradient: ['#283593', '#5C6BC0'],
    sticker: trilingual('Primary Care', 'لومړنۍ پاملرنه', 'مراقبت اولیه'),
    title: trilingual('Clinics', 'کلینیکونه', 'کلینیک‌ها'),
    description: trilingual(
      'Locate clinics and primary care facilities.',
      'کلینیکونه او لومړني روغتیايي مرکزونه ومومئ',
      'کلینیک‌ها و مراکز مراقبت اولیه را پیدا کنید'
    ),
  },
  {
    id: 'ngo',
    slug: 'ngo',
    icon: 'people',
    color: '#512DA8',
    accent: '#9575CD',
    gradient: ['#311B92', '#673AB7'],
    sticker: trilingual('Relief Hub', 'د مرستو مرکز', 'مرکز امداد'),
    title: trilingual('NGOs & Aid', 'مرستندویه ادارې', 'موسسات امدادی'),
    description: trilingual(
      'Community NGOs offering shelter, food, and support services.',
      'مرستندویه ادارې چې سرپناه، خواړه او ملاتړ وړاندې کوي',
      'موسسات امدادی که سرپناه، غذا و حمایت ارائه می‌دهند'
    ),
  },
  {
    id: 'rescue',
    slug: 'rescue',
    icon: 'people-circle',
    color: '#6A1B9A',
    accent: '#BA68C8',
    gradient: ['#4A148C', '#8E24AA'],
    sticker: trilingual('Search & Rescue', 'لټون او ژغورنه', 'جستجو و نجات'),
    title: trilingual('Search & Rescue', 'لټون او ژغورنه', 'جستجو و نجات'),
    description: trilingual(
      'Search and rescue teams for disasters and accidents.',
      'د ناورینونو او پېښو لپاره د لټون او ژغورنې ټیمونه',
      'تیم‌های جستجو و نجات برای حوادث و بلایا'
    ),
  },
];

module.exports = {
  CATEGORY_DEFINITIONS,
};
