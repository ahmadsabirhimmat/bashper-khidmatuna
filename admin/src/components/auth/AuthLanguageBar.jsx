import { useLanguage } from '../../context/LanguageContext.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'dr', label: 'دری' },
  { code: 'ps', label: 'پښتو' },
];

const AuthLanguageBar = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="login-auth-tools">
      <div className="login-language-bar" role="group" aria-label="Language">
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
      <div className="login-theme-row">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default AuthLanguageBar;
