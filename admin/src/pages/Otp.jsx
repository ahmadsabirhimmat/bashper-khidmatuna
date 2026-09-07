import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import AuthLanguageBar from '../components/auth/AuthLanguageBar.jsx';
import BenawaLogo from '../components/common/BenawaLogo.jsx';
import { OTP_FIELD_PROPS, digitsOnlyOtp, useWebOtpAutofill } from '../utils/otp.js';

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
  const lastTried = useRef('');

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

  const handleSubmit = async (event, nextCode = code) => {
    event?.preventDefault?.();
    const digits = digitsOnlyOtp(nextCode);
    setLocalError(null);
    if (!/^\d{6}$/.test(digits)) {
      setLocalError(t('enterSixDigit'));
      return;
    }
    if (!pendingOtp?.email) {
      setLocalError(t('otpExpired'));
      navigate('/login', { replace: true });
      return;
    }
    if (isAuthenticating || lastTried.current === digits) {
      return;
    }

    lastTried.current = digits;
    setCode(digits);
    try {
      await completeOtp({
        email: pendingOtp.email,
        code: digits,
        purpose: pendingOtp.purpose || 'login',
      });
    } catch (error) {
      lastTried.current = '';
      setLocalError(error.message || t('unableVerify'));
    }
  };

  const applyCode = (value) => {
    const digits = digitsOnlyOtp(value);
    setCode(digits);
    if (digits.length === 6) {
      void handleSubmit(null, digits);
    }
  };
  useWebOtpAutofill(applyCode);

  const handleResend = async () => {
    setLocalError(null);
    setResending(true);
    try {
      await resendPendingOtp();
      setInfo(t('otpResent'));
      setCode('');
      lastTried.current = '';
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
          <BenawaLogo size="lg" className="login-brand-logo" />
          <div className="panel__badge">{t('otpBadge')}</div>
          <h1>{t('otpTitle')}</h1>
          <p className="panel__description">{t('otpDescription', { email: pendingOtp.email })}</p>
          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              <span>{t('verificationCode')}</span>
              <input
                {...OTP_FIELD_PROPS}
                value={code}
                onChange={(event) => applyCode(event.target.value)}
                onInput={(event) => applyCode(event.currentTarget.value)}
                placeholder="123456"
                required
                disabled={isAuthenticating}
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
