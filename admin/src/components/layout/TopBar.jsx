import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';

const formatDateTime = (date, language) =>
  new Intl.DateTimeFormat(language === 'dr' ? 'fa-AF' : language === 'ps' ? 'ps-AF' : 'en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    hour12: true,
  }).format(date);

const TopBar = ({ menuOpen = false, onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { language, translate } = useLanguage();
  const timestamp = useMemo(() => formatDateTime(new Date(), language), [language]);

  return (
    <header className="topbar">
      <div className="topbar__lead">
        <button
          type="button"
          className="topbar__menu"
          onClick={onMenuToggle}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        <div className="topbar__copy">
          <p className="topbar__eyebrow">
            {translate('Province coverage • Kandahar', 'د ولایت پوښښ • کندهار', 'پوشش ولایت • کندهار')}
          </p>
          <h1 className="topbar__title">{translate('Admin Control Hub', 'د اډمین کنټرول مرکز', 'مرکز کنترل مدیر')}</h1>
          <p className="topbar__meta">{timestamp}</p>
        </div>
      </div>
      <div className="topbar__actions">
        <ThemeToggle variant="icon" />
        <div className="topbar__identity">
          <p className="topbar__name">{user?.fullName || translate('Admin', 'اډمین', 'مدیر')}</p>
          <p className="topbar__role">
            {user?.role === 'admin'
              ? translate('Administrator', 'مدیر', 'مدیر سیستم')
              : user?.role}
          </p>
        </div>
        <button type="button" className="ghost topbar__signout" onClick={logout}>
          {translate('Sign out', 'وتل', 'خروج')}
        </button>
      </div>
    </header>
  );
};

export default TopBar;
