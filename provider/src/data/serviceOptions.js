export const SERVICE_TYPES = [
  { value: "police", en: "Police", ps: "پولیس", dr: "پولیس" },
  { value: "ambulance", en: "Ambulance", ps: "امبولانس", dr: "امبولانس" },
  { value: "firefighters", en: "Fire Department", ps: "اور وژنه", dr: "آتش‌نشانی" },
  { value: "hospital", en: "Hospital", ps: "روغتون", dr: "شفاخانه" },
  { value: "pharmacy", en: "Pharmacy", ps: "درملتون", dr: "داروخانه" },
  { value: "clinic", en: "Clinic", ps: "کلینیک", dr: "کلینیک" },
  { value: "ngo", en: "NGO / Aid", ps: "مرستندویه اداره", dr: "موسسه امدادی" },
  { value: "rescue", en: "Search & Rescue", ps: "لټون او ژغورنه", dr: "جستجو و نجات" },
];

export const KANDAHAR_DISTRICTS = [
  "Kandahar City",
  "Dand",
  "Arghandab",
  "Panjwai",
  "Zhari",
  "Maywand",
  "Spin Boldak",
  "Daman",
  "Shah Wali Kot",
  "Khakrez",
  "Ghorak",
  "Maruf",
  "Reg",
  "Shorabak",
  "Nish",
  "Miyanishin",
  "Arghistan",
];

export const DISTRICT_LABELS = {
  "Kandahar City": { en: "Kandahar City", ps: "کندهار ښار", dr: "شهر قندهار" },
  Dand: { en: "Dand", ps: "ډنډ", dr: "دند" },
  Arghandab: { en: "Arghandab", ps: "ارغنداب", dr: "ارغنداب" },
  Panjwai: { en: "Panjwai", ps: "پنجوايي", dr: "پنجوایی" },
  Zhari: { en: "Zhari", ps: "ژړۍ", dr: "ژړی" },
  Maywand: { en: "Maywand", ps: "میوند", dr: "میوند" },
  "Spin Boldak": { en: "Spin Boldak", ps: "سپین بولدک", dr: "سپین بولدک" },
  Daman: { en: "Daman", ps: "دامان", dr: "دامان" },
  "Shah Wali Kot": { en: "Shah Wali Kot", ps: "شاه ولي کوټ", dr: "شاه ولی کوت" },
  Khakrez: { en: "Khakrez", ps: "خاکریز", dr: "خاکریز" },
  Ghorak: { en: "Ghorak", ps: "غورک", dr: "غورک" },
  Maruf: { en: "Maruf", ps: "معروف", dr: "معروف" },
  Reg: { en: "Reg", ps: "ریګ", dr: "ریگ" },
  Shorabak: { en: "Shorabak", ps: "شورابک", dr: "شورابک" },
  Nish: { en: "Nish", ps: "نیش", dr: "نیش" },
  Miyanishin: { en: "Miyanishin", ps: "میانشین", dr: "میانشین" },
  Arghistan: { en: "Arghistan", ps: "ارغستان", dr: "ارغستان" },
};

export const districtLabel = (district, language = "en") => {
  if (!district) return "";
  const entry = DISTRICT_LABELS[district];
  if (!entry) return district;
  if (language === "ps") return entry.ps || entry.en;
  if (language === "dr") return entry.dr || entry.en;
  return entry.en;
};
