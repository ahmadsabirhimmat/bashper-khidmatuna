import { LocalizedCopy, ServiceCategory, type EmergencyContact } from "@/src/utils/types";

const fromEnv = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const DEV_FALLBACK = "http://192.168.128.159:4000";
const PROD_FALLBACK = "https://bashper-khidmatuna.onrender.com";

export const API_BASE_URL = fromEnv || (__DEV__ ? DEV_FALLBACK : PROD_FALLBACK);

export const PROVIDER_APP_URL = "https://bashper-khidmatuna-provider.onrender.com";

export const DEVELOPER_CONTACT = {
  name: "Ahmad Sabir Himmat",
  email: "bashperkhidmatuna@gmail.com",
  whatsapp: "+93700784854",
  whatsappDisplay: "+93 700 784 854",
  whatsappUrl: "https://wa.me/93700784854",
};

export const LEGAL_EMAIL = "bashperkhidmatuna@gmail.com";
export const OLD_LEGAL_EMAIL = "ahmadsabirhimmat@gmail.com";

if (!API_BASE_URL && !__DEV__) {
  console.error(
    "EXPO_PUBLIC_API_URL is required for store builds. Set it to your live HTTPS API before EAS Build."
  );
}

export const STORAGE_KEYS = {
  language: "bashper.language",
  contacts: "bashper.contacts-cache",
  token: "bashper.token",
  user: "bashper.user",
  favorites: "bashper.favorites",
  lastSync: "bashper.last-sync",
  apiBase: "bashper.api-base",
  districtFilter: "bashper.district-filter",
  theme: "bashper.theme",
  criticalContacts: "bashper.critical-contacts-v2",
};

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
] as const;

export const DISTRICT_LABELS: Record<string, LocalizedCopy> = {
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

const i18n = (en: string, ps: string, dr: string): LocalizedCopy => ({ en, ps, dr });

export const CATEGORY_DEFINITIONS: ServiceCategory[] = [
  {
    id: "police",
    slug: "police",
    icon: "shield-checkmark",
    color: "#0B254A",
    accent: "#4C84FF",
    gradient: ["#0B254A", "#103D74"],
    sticker: i18n("24/7 Patrol", "۲۴/۷ ګزمه", "گشت ۲۴/۷"),
    title: i18n("Police", "پولیس", "پولیس"),
    description: i18n(
      "Report crimes or request rapid security response.",
      "د پولیسو سره د بیړني امنیتي مرستو لپاره اړیکه ونیسئ",
      "برای کمک امنیتی اضطراری با پولیس تماس بگیرید"
    ),
  },
  {
    id: "ambulance",
    slug: "ambulance",
    icon: "medical",
    color: "#B00020",
    accent: "#FF6F61",
    gradient: ["#8C0C24", "#E53935"],
    sticker: i18n("Rapid Care", "چټک درملنه", "مراقبت سریع"),
    title: i18n("Ambulance", "امبولانس", "امبولانس"),
    description: i18n(
      "Immediate medical evacuation support.",
      "د بیړني طبي لېږد ملاتړ",
      "حمایت انتقال فوری طبی"
    ),
  },
  {
    id: "firefighters",
    slug: "firefighters",
    icon: "flame",
    color: "#FF8C00",
    accent: "#FFC371",
    gradient: ["#C24A00", "#FF8C00"],
    sticker: i18n("Rescue Team", "د ژغورنې ټیم", "تیم نجات"),
    title: i18n("Fire Department", "اور وژنه", "آتش‌نشانی"),
    description: i18n(
      "Report fires and request rescue teams.",
      "د اور د کنټرول او ژغورنې لپاره اړیکه ونیسئ",
      "برای گزارش آتش‌سوزی و درخواست تیم نجات تماس بگیرید"
    ),
  },
  {
    id: "hospital",
    slug: "hospital",
    icon: "medkit",
    color: "#00695C",
    accent: "#4DB6AC",
    gradient: ["#005046", "#00897B"],
    sticker: i18n("Trauma Ready", "د ټپونو لپاره چمتو", "آماده برای تروما"),
    title: i18n("Hospitals", "روغتونونه", "شفاخانه‌ها"),
    description: i18n(
      "Find emergency-ready hospitals across Kandahar.",
      "په کندهار کې فعال روغتونونه ومومئ",
      "شفاخانه‌های فعال را در سراسر کندهار پیدا کنید"
    ),
  },
  {
    id: "pharmacy",
    slug: "pharmacy",
    icon: "fitness",
    color: "#00838F",
    accent: "#4DD0E1",
    gradient: ["#006064", "#00ACC1"],
    sticker: i18n("Medicines", "درمل", "داروها"),
    title: i18n("Pharmacies", "درملتونونه", "داروخانه‌ها"),
    description: i18n(
      "Locate pharmacies and essential medicines across Kandahar.",
      "په کندهار کې درملتونونه او ضروري درمل ومومئ",
      "داروخانه‌ها و داروهای ضروری را در کندهار پیدا کنید"
    ),
  },
  {
    id: "clinic",
    slug: "clinic",
    icon: "bandage",
    color: "#3949AB",
    accent: "#7986CB",
    gradient: ["#283593", "#5C6BC0"],
    sticker: i18n("Primary Care", "لومړنۍ پاملرنه", "مراقبت اولیه"),
    title: i18n("Clinics", "کلینیکونه", "کلینیک‌ها"),
    description: i18n(
      "Locate clinics and primary care facilities.",
      "کلینیکونه او لومړني روغتیايي مرکزونه ومومئ",
      "کلینیک‌ها و مراکز مراقبت اولیه را پیدا کنید"
    ),
  },
  {
    id: "ngo",
    slug: "ngo",
    icon: "people",
    color: "#512DA8",
    accent: "#9575CD",
    gradient: ["#311B92", "#673AB7"],
    sticker: i18n("Relief Hub", "د مرستو مرکز", "مرکز امداد"),
    title: i18n("NGOs & Aid", "مرستندویه ادارې", "موسسات امدادی"),
    description: i18n(
      "Community NGOs offering shelter, food, and support services.",
      "مرستندویه ادارې چې سرپناه، خواړه او ملاتړ وړاندې کوي",
      "موسسات امدادی که سرپناه، غذا و حمایت ارائه می‌دهند"
    ),
  },
  {
    id: "rescue",
    slug: "rescue",
    icon: "people-circle",
    color: "#6A1B9A",
    accent: "#BA68C8",
    gradient: ["#4A148C", "#8E24AA"],
    sticker: i18n("Search & Rescue", "لټون او ژغورنه", "جستجو و نجات"),
    title: i18n("Search & Rescue", "لټون او ژغورنه", "جستجو و نجات"),
    description: i18n(
      "Search and rescue teams for disasters and accidents.",
      "د ناورینونو او پېښو لپاره د لټون او ژغورنې ټیمونه",
      "تیم‌های جستجو و نجات برای حوادث و بلایا"
    ),
  },
];

/** Bundled critical numbers — always available offline without a network sync. */
export const CRITICAL_CONTACTS: EmergencyContact[] = [
  {
    id: "critical-police-119",
    name: "Kandahar Police Emergency",
    organization: "Afghanistan National Police",
    phoneNumber: "119",
    category: "police",
    location: "Kandahar Province",
    district: "Kandahar City",
    description: "Nationwide police emergency hotline. Available offline.",
    availability: "24/7",
    supportSms: false,
    isCritical: true,
  },
  {
    id: "critical-ambulance-102",
    name: "Ambulance Emergency",
    organization: "Emergency Medical Services",
    phoneNumber: "102",
    category: "ambulance",
    location: "Kandahar Province",
    district: "Kandahar City",
    description: "Nationwide ambulance / medical emergency hotline. Available offline.",
    availability: "24/7",
    supportSms: false,
    isCritical: true,
  },
];

export const sanitizeCriticalContacts = (list?: EmergencyContact[] | null): EmergencyContact[] => {
  const source = Array.isArray(list) && list.length ? list : CRITICAL_CONTACTS;
  const cleaned: EmergencyContact[] = [];

  source.forEach((contact) => {
    const haystack = `${contact.id} ${contact.name} ${contact.organization} ${contact.category}`.toLowerCase();
    const isFire =
      contact.category === "firefighters" ||
      contact.id === "critical-fire-102" ||
      haystack.includes("fire &") ||
      haystack.includes("fire department") ||
      (haystack.includes("fire") && contact.phoneNumber === "102");
    if (isFire) {
      return;
    }

    if (contact.phoneNumber === "112" || contact.id === "critical-ambulance-112") {
      cleaned.push({
        ...contact,
        id: "critical-ambulance-102",
        phoneNumber: "102",
        category: "ambulance",
      });
      return;
    }

    cleaned.push(contact);
  });

  CRITICAL_CONTACTS.forEach((bundled) => {
    const exists = cleaned.some((contact) => contact.category === bundled.category);
    if (!exists) {
      cleaned.push(bundled);
    }
  });

  return cleaned;
};

export const rewriteLegalCopy = (value = "") =>
  String(value)
    .replaceAll(OLD_LEGAL_EMAIL, LEGAL_EMAIL)
    .replaceAll(
      "119 (police), 112 (ambulance), or 102 (fire) as applicable",
      "119 (police) or 102 (ambulance)"
    )
    .replaceAll("119 (police), 112 (ambulance), or 102 (fire)", "119 (police) or 102 (ambulance)")
    .replaceAll("۱۱۹ (پولیس)، ۱۱۲ (امبولانس) یا ۱۰۲ (اور وژنه)", "۱۱۹ (پولیس) یا ۱۰۲ (امبولانس)")
    .replaceAll("۱۱۹ (پولیس)، ۱۱۲ (امبولانس) یا ۱۰۲ (آتش‌نشانی)", "۱۱۹ (پولیس) یا ۱۰۲ (امبولانس)");

export const translations = {
  appName: i18n("Bashper Khidmatuna", "بشپر خدمتونه", "بشپر خدمتونه"),
  homeTitle: i18n("Home", "کور", "خانه"),
  tagline: i18n(
    "Emergency & Essential Services Directory",
    "د بیړنیو خدماتو بشپړ لارښود",
    "راهنمای خدمات اضطراری و اساسی"
  ),
  searchPlaceholder: i18n("Search by name or phone", "د نوم یا شمېرې له مخې لټون", "جستجو با نام یا شماره"),
  offlineBadge: i18n("Offline ready", "بې انټرنېټ لاسرسی", "آماده بدون اینترنت"),
  offlineReadyTitle: i18n("Emergency hotlines", "بیړني شمېرې", "خطوط اضطراری"),
  offlineReadySubtitle: i18n(
    "Police and ambulance lines are available even without internet.",
    "د پولیسو او امبولانس شمیرې بې له انټرنېټه هم کار کوي.",
    "خطوط پولیس و امبولانس حتی بدون اینترنت در دسترس هستند."
  ),
  categoriesTitle: i18n("Service Categories", "د خدمتونو ټولګې", "دسته‌های خدمات"),
  viewDirectory: i18n("Open directory", "لارښود پرانیزئ", "باز کردن راهنما"),
  favoritesTitle: i18n("Favorites", "خوښې", "علاقه‌مندی‌ها"),
  favoritesSubtitle: i18n(
    "Sign in to bookmark trusted contacts on this device.",
    "په دې وسیله کې د خوښې تماسونو خوندي کولو لپاره ننوځئ.",
    "برای ذخیره مخاطبین مورد اعتماد روی این دستگاه وارد شوید."
  ),
  favoritesGuardTitle: i18n("Sign in required", "ننوتل اړین دي", "ورود لازم است"),
  favoritesGuardSubtitle: i18n(
    "Login to save favorite contacts on this device.",
    "د خوښې تماسونو خوندي کولو لپاره ننوځئ.",
    "برای ذخیره مخاطبین مورد علاقه وارد شوید."
  ),
  directoryGuardTitle: i18n("Sign in to view numbers", "د شمېرو لیدلو لپاره ننوځئ", "برای دیدن شماره‌ها وارد شوید"),
  directoryGuardSubtitle: i18n(
    "Login or create an account to see service categories and provider numbers.",
    "د خدمتونو ټولګو او شمېرو لیدلو لپاره ننوځئ یا حساب جوړ کړئ.",
    "برای دیدن دسته‌ها و شماره‌های خدمات وارد شوید یا حساب بسازید."
  ),
  goToLogin: i18n("Go to login", "ننوت ته لاړ شئ", "رفتن به ورود"),
  lastSync: i18n("Last synced", "وروستی همغږي", "آخرین همگام‌سازی"),
  pullToRefresh: i18n("Pull to refresh", "د تازه کولو لپاره کش کړئ", "برای تازه‌سازی بکشید"),
  callNow: i18n("Call now", "همدا اوس زنګ ووهئ", "اکنون تماس بگیرید"),
  sendSms: i18n("Send SMS", "پیغام واستوئ", "ارسال پیامک"),
  shareContact: i18n("Share", "شریک کړئ", "اشتراک‌گذاری"),
  contactCopied: i18n("Contact copied", "تماس کاپی شو", "مخاطب کپی شد"),
  numberCopied: i18n("Number copied", "شمېره کاپی شوه", "شماره کپی شد"),
  contactActionsTitle: i18n("Quick actions", "چټکې کړنې", "اقدامات سریع"),
  locationLabel: i18n("Location", "ځای", "موقعیت"),
  districtLabel: i18n("District", "ناحیه / ولسوالۍ", "ولسوالی"),
  allDistricts: i18n("All Kandahar districts", "د کندهار ټولې ولسوالۍ", "همه ولسوالی‌های کندهار"),
  filterByDistrict: i18n("Filter by district", "د ولسوالۍ له مخې فلټر", "فیلتر بر اساس ولسوالی"),
  smsUnavailable: i18n("SMS not supported", "پیام ملاتړ نه لري", "پیامک پشتیبانی نمی‌شود"),
  favoritesEmpty: i18n("No favorites yet", "تر اوسه خوښې نشته", "هنوز علاقه‌مندی نیست"),
  searchHeading: i18n("Search directory", "لارښود ولټوئ", "جستجوی راهنما"),
  searchHint: i18n(
    "Type at least two letters to see live results.",
    "د پایلو لپاره لږ تر لږه دوه توري ولیکئ.",
    "حداقل دو حرف بنویسید تا نتایج نمایش داده شود."
  ),
  searchEmpty: i18n("No contact matched your search.", "هیڅ تماس ونه موندل شو.", "هیچ تماسی یافت نشد."),
  contactDetails: i18n("Contact details", "د تماس معلومات", "جزئیات تماس"),
  profileTitle: i18n("Profile", "پروفایل", "پروفایل"),
  tabHome: i18n("Home", "کور", "خانه"),
  tabSearch: i18n("Search", "لټون", "جستجو"),
  tabFavorites: i18n("Saved", "خوښې", "ذخیره"),
  tabProfile: i18n("Profile", "پروفایل", "پروفایل"),
  profileSubtitle: i18n(
    "Stay safe with verified data.",
    "د تایید شویو معلوماتو سره خوندي اوسئ.",
    "با اطلاعات تأییدشده ایمن بمانید."
  ),
  languageToggle: i18n("Switch language", "ژبه بدله کړئ", "تغییر زبان"),
  logout: i18n("Logout", "وتل", "خروج"),
  login: i18n("Login", "ننوت", "ورود"),
  signup: i18n("Create account", "حساب جوړ کړئ", "ایجاد حساب"),
  deleteAccount: i18n("Delete account", "حساب ړنګ کړئ", "حذف حساب"),
  deleteAccountWarning: i18n(
    "This action cannot be undone.",
    "دا عمل بېرته نه شي راتلای.",
    "این عمل قابل بازگشت نیست."
  ),
  loginSubtitle: i18n("Access favorites on this device.", "په دې وسیله کې خوښو ته لاسرسی", "دسترسی به علاقه‌مندی‌ها روی این دستگاه"),
  signupSubtitle: i18n(
    "Register with email and phone to save trusted numbers.",
    "د باور وړ شمېرو خوندي کولو لپاره برېښنالیک او تلیفون راجستر کړئ.",
    "با ایمیل و تلفن ثبت‌نام کنید تا شماره‌های مطمئن را ذخیره کنید."
  ),
  emailPlaceholder: i18n("Email", "برېښنالیک", "ایمیل"),
  passwordPlaceholder: i18n("Password", "پټنوم", "رمز عبور"),
  phonePlaceholder: i18n("Phone number", "د ټیلیفون شمیره", "شماره تلفن"),
  namePlaceholder: i18n("Full name", "بشپړ نوم", "نام کامل"),
  submit: i18n("Continue", "دوام ورکړئ", "ادامه"),
  alreadyAccount: i18n("Already have an account?", "له وړاندې حساب لرئ؟", "قبلاً حساب دارید؟"),
  noAccount: i18n("Need an account?", "حساب ته اړتیا لرئ؟", "به حساب نیاز دارید؟"),
  loading: i18n("Loading...", "د چارجېدو په حال کې...", "در حال بارگذاری..."),
  retry: i18n("Retry", "بیا هڅه", "تلاش مجدد"),
  nearYou: i18n("Near you", "ستاسې ګاونډ کې", "نزدیک شما"),
  useMyLocation: i18n("Sort by my location", "زما د موقعیت له مخې ترتیب", "مرتب‌سازی بر اساس موقعیت من"),
  favoritesGuardAction: i18n("Sign in to continue", "د دوام لپاره ننوت وکړئ", "برای ادامه وارد شوید"),
  searchResultsTitle: i18n("Search results", "د لټون پایلې", "نتایج جستجو"),
  criticalBadge: i18n("Critical", "بیړنی", "حیاتی"),
  otpTitle: i18n("Email verification", "د برېښنالیک تایید", "تأیید ایمیل"),
  otpSubtitle: i18n(
    "Enter the 6-digit code sent to your email.",
    "هغه ۶ عددي کوډ دننه کړئ چې ستاسو برېښنالیک ته لیږل شوی.",
    "کد ۶ رقمی ارسال‌شده به ایمیل خود را وارد کنید."
  ),
  otpPlaceholder: i18n("6-digit code", "۶ عددي کوډ", "کد ۶ رقمی"),
  otpVerify: i18n("Verify & continue", "تایید او دوام", "تأیید و ادامه"),
  otpResend: i18n("Resend code", "بیا کوډ واستوئ", "ارسال مجدد کد"),
  otpSent: i18n("A verification code was sent to your email.", "تاییدي کوډ ستاسو برېښنالیک ته واستول شو.", "کد تأیید به ایمیل شما ارسال شد."),
  forgotTitle: i18n("Forgot password", "پټنوم هیر شوی", "فراموشی رمز عبور"),
  forgotSubtitle: i18n(
    "Enter your email and we will send a reset code.",
    "خپل برېښنالیک دننه کړئ او موږ به د بیا تنظیم کوډ ولېږو.",
    "ایمیل خود را وارد کنید تا کد بازیابی ارسال شود."
  ),
  forgotOtpTitle: i18n("Enter reset code", "د بیا تنظیم کوډ دننه کړئ", "کد بازیابی را وارد کنید"),
  forgotNewPasswordTitle: i18n("Set new password", "نوی پټنوم وټاکئ", "رمز عبور جدید تعیین کنید"),
  forgotNewPasswordSubtitle: i18n(
    "Choose a new password for your account.",
    "د خپل حساب لپاره نوی پټنوم وټاکئ.",
    "رمز عبور جدید حساب خود را انتخاب کنید."
  ),
  forgotSendCode: i18n("Send reset code", "د بیا تنظیم کوډ ولېږئ", "ارسال کد بازیابی"),
  forgotUpdatePassword: i18n("Update password", "پټنوم تازه کړئ", "به‌روزرسانی رمز عبور"),
  forgotNewPasswordPlaceholder: i18n("New password", "نوی پټنوم", "رمز عبور جدید"),
  forgotConfirmPasswordPlaceholder: i18n("Confirm password", "پټنوم تایید کړئ", "تأیید رمز عبور"),
  forgotPasswordMismatch: i18n("Passwords do not match", "پټنومونه سره سمون نه خوري", "رمزها یکسان نیستند"),
  forgotCodeVerified: i18n("Code verified. Choose a new password.", "کوډ تایید شو. نوی پټنوم وټاکئ.", "کد تأیید شد. رمز جدید را انتخاب کنید."),
  forgotVerifyFailed: i18n("Unable to start password reset", "د پټنوم بیا تنظیم پیل نشو", "شروع بازیابی رمز ممکن نشد"),
  forgotSuccess: i18n("Password updated. You can sign in now.", "پټنوم تازه شو. اوس ننوځئ.", "رمز به‌روز شد. اکنون وارد شوید."),
  forgotBackToLogin: i18n("Back to login", "بیرته ننوتلو ته", "بازگشت به ورود"),
  forgotSent: i18n("Password reset code sent to your email.", "د پټنوم بیا تنظیم کوډ برېښنالیک ته ولېږل شو.", "کد بازیابی رمز به ایمیل شما ارسال شد."),
  aboutTitle: i18n("About us", "زموږ په اړه", "درباره ما"),
  aboutMissionTitle: i18n("Our mission", "زموږ ماموریت", "ماموریت ما"),
  aboutMissionBody: i18n(
    "Bashper Khidmatuna helps people in Kandahar quickly find verified emergency and essential service contacts — online and offline.",
    "بشپر خدمتونه د کندهار خلکو سره مرسته کوي چې تایید شوي بیړني او اړین خدمتونه په چټکۍ ومومي — په انلاین او آفلاین ډول.",
    "بشپر خدمتونه به مردم قندهار کمک می‌کند تا مخاطبین تأییدشده خدمات اضطراری و اساسی را سریع پیدا کنند — آنلاین و آفلاین."
  ),
  aboutCoverageTitle: i18n("Coverage", "پوښښ", "پوشش"),
  aboutCoverageBody: i18n(
    "Built for Kandahar province with district-level directory filtering and critical lines that work without internet.",
    "د کندهار ولایت لپاره جوړ شوی، د ولسوالیو له مخې فلټر او هغه مهم شمېرې چې بې انټرنېټه هم کار کوي.",
    "برای ولایت قندهار ساخته شده؛ با فیلتر ولسوالی و خطوط حیاتی که بدون اینترنت هم کار می‌کنند."
  ),
  aboutStatsTitle: i18n("Directory at a glance", "لنډیز احصایه", "نمای کلی راهنما"),
  aboutOpenFull: i18n("Open full about page", "بشپړه پاڼه پرانیزئ", "باز کردن صفحه کامل"),
  aboutServices: i18n("Approved services", "تایید شوي خدمات", "خدمات تأییدشده"),
  aboutHospitals: i18n("Hospitals", "روغتونونه", "شفاخانه‌ها"),
  aboutPharmacies: i18n("Pharmacies", "درملتونونه", "داروخانه‌ها"),
  aboutDistricts: i18n("Districts covered", "پوښل شوې ولسوالۍ", "ولسوالی‌های تحت پوشش"),
  aboutCritical: i18n("Critical lines", "مهم شمېرې", "خطوط حیاتی"),
  aboutFieldUnits: i18n("Field units", "میداني واحدونه", "واحدهای میدانی"),
  aboutBack: i18n("Back to profile", "بیرته پروفایل ته", "بازگشت به پروفایل"),
  providerPortalTitle: i18n("Provider portal", "د خدمت کوونکو پاڼه", "پورتال ارائه‌دهنده"),
  providerPortalBody: i18n(
    "Add or update your emergency service listing in the provider app.",
    "خپل بیړنی خدمت په د خدمت کوونکو اپ کې اضافه یا تازه کړئ.",
    "فهرست خدمات اضطراری خود را در اپ ارائه‌دهنده اضافه یا به‌روز کنید."
  ),
  providerPortalOpen: i18n("Open provider app", "د خدمت کوونکو اپ پرانیزئ", "باز کردن اپ ارائه‌دهنده"),
  providerTab: i18n("Provider", "خدمت کوونکی", "ارائه‌دهنده"),
  developerTab: i18n("Developer", "جوړونکی", "سازنده"),
  contactTabsHint: i18n(
    "Tap a tab to see details.",
    "د جزئیاتو لیدو لپاره برخه وټاکئ.",
    "برای دیدن جزئیات یک زبانه را بزنید."
  ),
  developerTitle: i18n("Contact the developer", "له جوړونکي سره اړیکه", "تماس با سازنده"),
  developerName: i18n("Ahmad Sabir Himmat", "احمد صابر همت", "احمد صابر همت"),
  developerWhatsApp: i18n("WhatsApp", "واټساپ", "واتساپ"),
  developerEmail: i18n("Email", "بریښنالیک", "ایمیل"),
  privacyTitle: i18n("Privacy policy", "د محرمیت تګلاره", "سیاست حریم خصوصی"),
  privacyLegal: i18n("Legal", "قانوني", "حقوقی"),
  privacyOpen: i18n("Read privacy policy", "د محرمیت تګلاره ولولئ", "خواندن سیاست حریم خصوصی"),
  privacyLoading: i18n("Loading privacy policy…", "د محرمیت تګلاره لوستل کېږي…", "در حال بارگذاری سیاست حریم خصوصی…"),
  privacyError: i18n("Unable to load the privacy policy.", "د محرمیت تګلاره ونه لوستل شوه.", "بارگذاری سیاست حریم خصوصی ممکن نشد."),
  privacyEmpty: i18n("The privacy policy has not been published yet.", "د محرمیت تګلاره لا نه ده خپره شوې.", "سیاست حریم خصوصی هنوز منتشر نشده است."),
  privacyUpdated: i18n("Last updated", "وروستی تازه کېدل", "آخرین به‌روزرسانی"),
  privacyAccept: i18n("By creating an account you agree to the privacy policy.", "د حساب جوړولو سره تاسو د محرمیت تګلاره منئ.", "با ساخت حساب، سیاست حریم خصوصی را می‌پذیرید."),
  termsTitle: i18n("Terms of use", "د کارولو شرطونه", "شرایط استفاده"),
  termsOpen: i18n("Read terms of use", "د کارولو شرطونه ولولئ", "خواندن شرایط استفاده"),
  termsLoading: i18n("Loading terms of use…", "د کارولو شرطونه لوستل کېږي…", "در حال بارگذاری شرایط استفاده…"),
  termsError: i18n("Unable to load the terms of use.", "د کارولو شرطونه ونه لوستل شول.", "بارگذاری شرایط استفاده ممکن نشد."),
  termsEmpty: i18n("The terms of use have not been published yet.", "د کارولو شرطونه لا نه دي خپاره شوي.", "شرایط استفاده هنوز منتشر نشده است."),
  signupConsentRequired: i18n("Please accept the privacy policy and terms of use, and confirm you are 13 or older.", "مهرباني وکړئ د محرمیت تګلاره او د کارولو شرطونه ومنئ، او تایید کړئ چې ۱۳ کلن یا زیات یاست.", "لطفاً سیاست حریم خصوصی و شرایط استفاده را بپذیرید و تأیید کنید که ۱۳ سال یا بیشتر دارید."),
  signupConsentPrefix: i18n("I am 13 or older and accept the ", "زه ۱۳ کلن یا زیات یم او دا منم: ", "۱۳ سال یا بیشتر دارم و می‌پذیرم: "),
  signupConsentAnd: i18n(" and ", " او ", " و "),
  signupConsentSuffix: i18n(".", ".", "."),
  emergencyDisclaimerTitle: i18n("Emergency disclaimer", "د بیړني خدمت خبرتیا", "سلب مسئولیت اضطراری"),
  emergencyDisclaimerBody: i18n(
    "This app is a Kandahar service directory. It is not an official government emergency dispatch system. In a life-threatening emergency, call 119 (police) or 102 (ambulance).",
    "دا اپ د کندهار د خدماتو لارښود دی. دا د دولت رسمي بیړنی سیسټم نه دی. په ژوند ګواښونکې پېښه کې ۱۱۹ (پولیس) یا ۱۰۲ (امبولانس) ووهئ.",
    "این اپ راهنمای خدمات کندهار است. سامانه رسمی اضطراری دولت نیست. در خطر جانی با ۱۱۹ (پولیس) یا ۱۰۲ (امبولانس) تماس بگیرید."
  ),
  accountSection: i18n("Account", "حساب", "حساب"),
  preferencesSection: i18n("Preferences", "ترجیحات", "ترجیحات"),
  languagePreferences: i18n("Language preferences", "د ژبې غوره توبونه", "ترجیحات زبان"),
  themeSection: i18n("Appearance", "ښکاره بڼه", "ظاهر"),
  themeLight: i18n("Light", "روښانه", "روشن"),
  themeDark: i18n("Dark", "تیاره", "تاریک"),
  themeHint: i18n("Switch between light and dark mode.", "روښانه او تیاره حالت بدل کړئ.", "بین حالت روشن و تاریک جابه‌جا شوید."),
  signedInAs: i18n("Signed in", "ننوتلی", "وارد شده"),
  guestTitle: i18n("Welcome, guest", "ښه راغلاست، میلمه", "خوش آمدید، مهمان"),
  cancel: i18n("Cancel", "فسخ", "لغو"),
  phoneLabel: i18n("Phone", "تلیفون", "تلفن"),
  nameLabel: i18n("Name", "نوم", "نام"),
  emailLabel: i18n("Email", "برېښنالیک", "ایمیل"),
};

export type TranslationKey = keyof typeof translations;
