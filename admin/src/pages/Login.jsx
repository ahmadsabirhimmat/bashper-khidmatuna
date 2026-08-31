import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import PasswordInput from '../components/common/PasswordInput.jsx';
import AuthLanguageBar from '../components/auth/AuthLanguageBar.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authError, isAuthenticating } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError(null);
    try {
      const response = await login(form);
      if (response?.requiresOtp) {
        navigate('/otp', {
          replace: true,
          state: { from: location.state?.from },
        });
        return;
      }
      if (response?.user?.role !== 'admin') {
        setLocalError(t('adminRequired'));
        return;
      }
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setLocalError(error.message || t('unableSignIn'));
    }
  };

  return (
    <div className="login-screen">
      <div className="login-glow login-glow--accent" aria-hidden="true" />
      <div className="login-glow login-glow--violet" aria-hidden="true" />
      <div className="login-grid">
        <section className="login-panel">
          <AuthLanguageBar />
          <div className="panel__badge">{t('loginBadge')}</div>
          <h1>{t('loginTitle')}</h1>
          <p className="panel__description">{t('loginDescription')}</p>
          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              <span>{t('email')}</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@bashper.af"
                required
              />
            </label>
            <label>
              <span className="login-label-row">
                <span>{t('password')}</span>
                <Link to="/forgot-password" className="login-forgot-link">
                  {t('forgotPassword')}
                </Link>
              </span>
              <PasswordInput
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={8}
                autoComplete="current-password"
                showLabel={t('showPassword')}
                hideLabel={t('hidePassword')}
              />
            </label>
            {(localError || authError) && (
              <p className="form-error">{localError || authError}</p>
            )}
            <button className="primary" type="submit" disabled={isAuthenticating}>
              {isAuthenticating ? t('sendingCode') : t('continue')}
            </button>
          </form>
          <p className="panel__footnote">{t('loginFootnote')}</p>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
