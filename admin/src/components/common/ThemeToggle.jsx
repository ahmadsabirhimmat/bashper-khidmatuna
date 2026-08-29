import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path strokeLinecap="round" d="M12 3v1.5M12 19.5V21M4.2 4.2l1.1 1.1M18.7 18.7l1.1 1.1M3 12h1.5M19.5 12H21M4.2 19.8l1.1-1.1M18.7 5.3l1.1-1.1" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 14.5A8.5 8.5 0 1111.5 3 7 7 0 0021 14.5z"
    />
  </svg>
);

const ThemeToggle = ({ variant = 'chips' }) => {
  const { theme, setTheme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  if (variant === 'icon') {
    return (
      <button
        type="button"
        className="theme-toggle theme-toggle--icon"
        onClick={toggleTheme}
        aria-label={t('themeToggle')}
        title={theme === 'light' ? t('themeDark') : t('themeLight')}
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>
    );
  }

  return (
    <div className="theme-toggle" role="group" aria-label={t('themeAppearance')}>
      <button
        type="button"
        className={`theme-toggle__chip ${theme === 'light' ? 'theme-toggle__chip--active' : ''}`}
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
      >
        <SunIcon />
        {t('themeLight')}
      </button>
      <button
        type="button"
        className={`theme-toggle__chip ${theme === 'dark' ? 'theme-toggle__chip--active' : ''}`}
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
      >
        <MoonIcon />
        {t('themeDark')}
      </button>
    </div>
  );
};

export default ThemeToggle;
