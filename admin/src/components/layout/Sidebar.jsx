import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { pingHealth } from '../../api/health.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';

const NAV_ITEMS = [
  {
    path: '/',
    glyph: '⚡',
    label: ['Pulse', 'نبض', 'نبض'],
    caption: ['Live province signals', 'د ولایت ژوندي سیګنالونه', 'سیگنال‌های زنده ولایت'],
  },
  {
    path: '/providers',
    glyph: '🏥',
    label: ['Providers', 'خدمتونه', 'ارائه‌دهندگان'],
    caption: ['Approvals & verifications', 'تایید او بیاکتنه', 'تأیید و بررسی'],
  },
  {
    path: '/critical-contacts',
    glyph: '☎',
    label: ['Critical lines', 'بیړني کرښې', 'خطوط حیاتی'],
    caption: ['Offline emergency numbers', 'بې انټرنېټ بیړني شمېرې', 'شماره‌های اضطراری آفلاین'],
  },
  {
    path: '/site-contact',
    glyph: '☎',
    label: ['Contact Page', 'د اړیکې پاڼه', 'صفحه تماس'],
    caption: ['Provider HQ contact info', 'د مرکزي دفتر اړیکه', 'اطلاعات تماس دفتر مرکزی'],
  },
  {
    path: '/policy',
    glyph: '📄',
    label: ['Privacy policy', 'د محرمیت تګلاره', 'سیاست حریم خصوصی'],
    caption: ['Legal text shown in the apps', 'په اپونو کې قانوني متن', 'متن حقوقی در اپ‌ها'],
  },
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'dr', label: 'دری' },
  { code: 'ps', label: 'پښتو' },
];

const formatCheckedAgo = (checkedAt, translate) => {
  if (!checkedAt) {
    return translate('Checking API…', 'API چک کېږي…', 'در حال بررسی API…');
  }
  const seconds = Math.max(0, Math.round((Date.now() - checkedAt) / 1000));
  if (seconds < 10) {
    return translate('checked just now', 'همدا اوس چک شو', 'همین الان بررسی شد');
  }
  if (seconds < 60) {
    return translate(`${seconds}s ago`, `${seconds} ثانیې وړاندې`, `${seconds} ثانیه پیش`);
  }
  const minutes = Math.round(seconds / 60);
  return translate(`${minutes} min ago`, `${minutes} دقیقې وړاندې`, `${minutes} دقیقه پیش`);
};

const Sidebar = ({ onNavigate }) => {
  const { language, setLanguage, translate } = useLanguage();
  const [apiOnline, setApiOnline] = useState(null);
  const [checkedAt, setCheckedAt] = useState(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const ping = () => {
      pingHealth({ signal: controller.signal })
        .then((data) => {
          setApiOnline(data?.status === 'ok');
          setCheckedAt(Date.now());
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          setApiOnline(false);
          setCheckedAt(Date.now());
        });
    };

    ping();
    const pingTimer = setInterval(ping, 45000);
    const labelTimer = setInterval(() => setTick((value) => value + 1), 15000);
    return () => {
      controller.abort();
      clearInterval(pingTimer);
      clearInterval(labelTimer);
    };
  }, []);

  const statusLabel =
    apiOnline === null
      ? translate('Connecting to API…', 'له API سره نښلول…', 'در حال اتصال به API…')
      : apiOnline
        ? `${translate('API online', 'API فعال دی', 'API آنلاین است')} • ${formatCheckedAgo(checkedAt, translate)}`
        : `${translate('API unreachable', 'API نه دی په لاسرسي', 'API در دسترس نیست')} • ${formatCheckedAgo(checkedAt, translate)}`;

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar__brand">
          <div className="sidebar__logo">BK</div>
          <div className="sidebar__brand-copy">
            <p className="sidebar__eyebrow">Bashper Khidmatuna</p>
            <p className="sidebar__title">{translate('Emergency Command', 'د بیړني قوماندې مرکز', 'مرکز فرمان اضطراری')}</p>
            <p className="sidebar__tagline">
              {translate('Kandahar • Mobile-first • Offline-ready', 'کندهار • موبایل لومړی • آفلاین چمتو', 'کندهار • موبایل‌محور • آماده آفلاین')}
            </p>
          </div>
        </div>
        <nav className="sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
            >
              <span className="sidebar__glyph" aria-hidden="true">
                {item.glyph}
              </span>
              <span>
                <span className="sidebar__label">{translate(...item.label)}</span>
                <span className="sidebar__caption">{translate(...item.caption)}</span>
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="sidebar__footer">
        <p className="sidebar__footnote">{translate('Appearance', 'ښکاره بڼه', 'ظاهر')}</p>
        <ThemeToggle />
        <p className="sidebar__footnote">{translate('Languages / ژبې', 'ژبې / Languages', 'زبان‌ها / Languages')}</p>
        <div className="sidebar__language-grid">
          {LANGUAGES.map((item) => (
            <button
              key={item.code}
              type="button"
              className={`sidebar__language-chip ${language === item.code ? 'sidebar__language-chip--active' : ''}`}
              onClick={() => setLanguage(item.code)}
              aria-pressed={language === item.code}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className={`sidebar__footnote ${apiOnline === false ? 'sidebar__footnote--alert' : ''}`}>
          {statusLabel}
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
