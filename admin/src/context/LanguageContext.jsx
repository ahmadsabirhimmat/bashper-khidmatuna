import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DISTRICT_LABELS, messages, SERVICE_LABELS, STATUS_LABELS } from '../i18n/messages.js';

const STORAGE_KEY = 'bk-admin-language';
const LANGUAGE_CYCLE = ['en', 'ps', 'dr'];

const LanguageContext = createContext(null);

const interpolate = (template = '', vars = {}) =>
  String(template).replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] === undefined || vars[key] === null ? `{${key}}` : String(vars[key])
  );

const pickLocalized = (entry, language) => {
  if (!entry) return '';
  if (language === 'ps') return entry.ps || entry.en || '';
  if (language === 'dr') return entry.dr || entry.ps || entry.en || '';
  return entry.en || entry.ps || entry.dr || '';
};

const readStoredLanguage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (LANGUAGE_CYCLE.includes(stored)) {
      return stored;
    }
  } catch {
    // ignore
  }
  return 'en';
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(readStoredLanguage);

  useEffect(() => {
    const isRtl = language === 'ps' || language === 'dr';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language === 'dr' ? 'fa' : language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // ignore
    }
  }, [language]);

  const setLanguage = useCallback((next) => {
    if (LANGUAGE_CYCLE.includes(next)) {
      setLanguageState(next);
    }
  }, []);

  const translate = useCallback(
    (englishText = '', pashtoText = '', dariText = '') => {
      if (language === 'ps') {
        return pashtoText || englishText;
      }
      if (language === 'dr') {
        return dariText || pashtoText || englishText;
      }
      return englishText || pashtoText || dariText;
    },
    [language]
  );

  const t = useCallback(
    (key, vars) => {
      const table = messages[language] || messages.en;
      const raw = table[key] ?? messages.en[key] ?? key;
      return interpolate(raw, vars);
    },
    [language]
  );

  const tService = useCallback((type) => pickLocalized(SERVICE_LABELS[type], language) || type, [language]);
  const tStatus = useCallback((status) => pickLocalized(STATUS_LABELS[status], language) || status, [language]);
  const tDistrict = useCallback(
    (district) => pickLocalized(DISTRICT_LABELS[district], language) || district,
    [language]
  );

  const dateLocale = language === 'dr' ? 'fa-AF' : language === 'ps' ? 'ps-AF' : 'en-US';

  const value = useMemo(
    () => ({ language, setLanguage, translate, t, tService, tStatus, tDistrict, dateLocale }),
    [language, setLanguage, translate, t, tService, tStatus, tDistrict, dateLocale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
