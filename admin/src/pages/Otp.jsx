import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import AuthLanguageBar from '../components/auth/AuthLanguageBar.jsx';

const OtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const {
    pendingOtp,
    completeOtp,
    resendPendingOtp,
    isAuthenticating,
    isAuthenticated,
    authError,
  } = useAuth();
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState(null);
  const [info, setInfo] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    setInfo(t('otpSent'));
  }, [t]);

  useEffect(() => {
    if (!pendingOtp?.email && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [pendingOtp, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, location.state?.from?.pathname, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError(null);
    if (!/^\d{6}$/.test(code.trim())) {
      setLocalError(t('enterSixDigit'));
      return;
    }
    if (!pendingOtp?.email) {
      setLocalError(t('otpExpired'));
      navigate('/login', { replace: true });
      return;
    }

    try {
      await completeOtp({
        email: pendingOtp.email,
        code: code.trim(),
        purpose: pendingOtp.purpose || 'login',
      });
    } catch (error) {
      setLocalError(error.message || t('unableVerify'));
    }
  };

  const handleResend = async () => {
    setLocalError(null);
    setResending(true);
    try {
      await resendPendingOtp();
      setInfo(t('otpResent'));
      setCode('');
    } catch (error) {
      setLocalError(error.message || t('unableResend'));
    } finally {
      setResending(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  if (!pendingOtp?.email) {
    return null;
  }

  return (
    <div className="login-screen">
      <div className="login-glow login-glow--accent" aria-hidden="true" />
      <div className="login-glow login-glow--violet" aria-hidden="true" />
      <div className="login-grid">
        <section className="login-panel">
          <AuthLanguageBar />
          <div className="panel__badge">{t('otpBadge')}</div>
          <h1>{t('otpTitle')}</h1>
          <p className="panel__description">{t('otpDescription', { email: pendingOtp.email })}</p>
          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              <span>{t('verificationCode')}</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                placeholder="123456"
                required
              />
            </label>
            {info && <p className="panel__footnote">{info}</p>}
            {(localError || authError) && (
              <p className="form-error">{localError || authError}</p>
            )}
            <button className="primary" type="submit" disabled={isAuthenticating}>
              {isAuthenticating ? t('verifying') : t('verifyContinue')}
            </button>
          </form>
          <button
            type="button"
            className="primary"
            style={{ marginTop: 12, background: 'transparent', color: '#0A5CF5', border: '1px solid #0A5CF5' }}
            onClick={handleResend}
            disabled={resending || isAuthenticating}
          >
            {resending ? t('sending') : t('resendCode')}
          </button>
          <button
            type="button"
            className="panel__footnote"
            style={{ marginTop: 18, background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => navigate('/login', { replace: true })}
          >
            {t('backToLogin')}
          </button>
        </section>
      </div>
    </div>
  );
};

export default OtpPage;
