import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import PasswordInput from '../components/common/PasswordInput.jsx';
import AuthLanguageBar from '../components/auth/AuthLanguageBar.jsx';
import GoogleSignInButton from '../components/auth/GoogleSignInButton.jsx';
import BenawaLogo from '../components/common/BenawaLogo.jsx';
import { DEVELOPER_CONTACT } from '../data/developer.js';
import { getGoogleTicket, startGoogleLogin } from '../api/auth';
import { googleReturnUrl, readGoogleTicketId, waitForGoogleTicket } from '../utils/googleAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, completeGoogleLogin, authError, isAuthenticating } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState(null);
  const [googleBusy, setGoogleBusy] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/';

  useEffect(() => {
    const ticketId = readGoogleTicketId(location.search);
    if (!ticketId) {
      return undefined;
    }

    let cancelled = false;
    const finishGoogle = async () => {
      setLocalError(null);
      setGoogleBusy(true);
      try {
        const ticket = await waitForGoogleTicket(getGoogleTicket, ticketId);
        if (cancelled) {
          return;
        }
        if (ticket.status === 'ready' && ticket.token && ticket.user) {
          await completeGoogleLogin(ticket);
          navigate(redirectTo, { replace: true });
          return;
        }
        setLocalError(ticket.message || t('googleFailed'));
        navigate('/login', { replace: true, state: location.state });
      } catch (error) {
        if (!cancelled) {
          setLocalError(error.message || t('googleFailed'));
          navigate('/login', { replace: true, state: location.state });
        }
      } finally {
        setGoogleBusy(false);
      }
    };

    void finishGoogle();
    return () => {
      cancelled = true;
    };
  }, [completeGoogleLogin, location.search, location.state, navigate, redirectTo, t]);

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
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setLocalError(error.message || t('unableSignIn'));
    }
  };

  const handleGoogle = async () => {
    setLocalError(null);
    setGoogleBusy(true);
    try {
      const start = await startGoogleLogin({
        role: 'admin',
        returnTo: googleReturnUrl('/login'),
      });
      window.location.assign(start.authUrl);
    } catch (error) {
      setLocalError(error.message || t('googleFailed'));
      setGoogleBusy(false);
    }
  };

  const busy = isAuthenticating || googleBusy;

  return (
    <div className="login-screen">
      <div className="login-glow login-glow--accent" aria-hidden="true" />
      <div className="login-glow login-glow--violet" aria-hidden="true" />
      <div className="login-grid">
        <section className="login-panel">
          <AuthLanguageBar />
          <BenawaLogo size="lg" className="login-brand-logo" />
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
            <button className="primary" type="submit" disabled={busy}>
              {isAuthenticating && !googleBusy ? t('sendingCode') : t('continue')}
            </button>
            <div className="login-divider">
              <span>{t('orContinueWith')}</span>
            </div>
            <GoogleSignInButton
              busy={googleBusy}
              disabled={busy}
              label={t('continueWithGoogle')}
              waitingLabel={t('googleSigningIn')}
              onClick={handleGoogle}
            />
          </form>
          <p className="panel__footnote">{t('loginFootnote')}</p>
          <div className="login-developer">
            <p className="login-developer__title">{t('developerTitle')}</p>
            <p className="login-developer__name">{DEVELOPER_CONTACT.name}</p>
            <a href={DEVELOPER_CONTACT.portfolioUrl} target="_blank" rel="noreferrer">
              {t('developerPortfolio')}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
