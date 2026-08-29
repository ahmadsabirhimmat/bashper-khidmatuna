import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resendOtp, resetPassword, verifyOtp } from '../api/auth.js';
import PasswordInput from '../components/common/PasswordInput.jsx';
import AuthLanguageBar from '../components/auth/AuthLanguageBar.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const handleSendCode = async (event) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const response = await forgotPassword({ email: email.trim().toLowerCase() });
      setEmail(response.email || email.trim().toLowerCase());
      setInfo(response.message || t('resetSent'));
      setStep('otp');
      setCode('');
    } catch (err) {
      setError(err.message || t('unableSendReset'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    if (!/^\d{6}$/.test(code.trim())) {
      setError(t('enterSixDigit'));
      return;
    }
    setLoading(true);
    try {
      const response = await verifyOtp({
        email,
        code: code.trim(),
        purpose: 'reset',
      });
      if (!response?.resetToken) {
        throw new Error(t('unableStartReset'));
      }
      setResetToken(response.resetToken);
      setInfo(t('codeVerified'));
      setStep('password');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || t('unableVerify'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      await resendOtp({ email, purpose: 'reset' });
      setInfo(t('resentReset'));
      setCode('');
    } catch (err) {
      setError(err.message || t('unableResend'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    if (password.length < 8) {
      setError(t('passwordMin'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }
    setLoading(true);
    try {
      const response = await resetPassword({
        email,
        resetToken,
        password,
      });
      setInfo(response.message || t('passwordUpdated'));
      setTimeout(() => navigate('/login', { replace: true }), 900);
    } catch (err) {
      setError(err.message || t('unableReset'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-glow login-glow--accent" aria-hidden="true" />
      <div className="login-glow login-glow--violet" aria-hidden="true" />
      <div className="login-grid">
        <section className="login-panel">
          <AuthLanguageBar />
          <div className="panel__badge">{t('forgotBadge')}</div>
          <h1>
            {step === 'email' && t('forgotTitle')}
            {step === 'otp' && t('forgotOtpTitle')}
            {step === 'password' && t('forgotPasswordTitle')}
          </h1>
          <p className="panel__description">
            {step === 'email' && t('forgotEmailHint')}
            {step === 'otp' && t('forgotOtpHint', { email })}
            {step === 'password' && t('forgotPasswordHint')}
          </p>

          {step === 'email' && (
            <form className="login-form" onSubmit={handleSendCode}>
              <label>
                <span>{t('email')}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@bashper.af"
                  required
                />
              </label>
              {error && <p className="form-error">{error}</p>}
              {info && <p className="panel__footnote">{info}</p>}
              <button className="primary" type="submit" disabled={loading}>
                {loading ? t('sendingReset') : t('sendResetCode')}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form className="login-form" onSubmit={handleVerifyCode}>
              <label>
                <span>{t('verificationCode')}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                  placeholder="123456"
                  required
                />
              </label>
              {error && <p className="form-error">{error}</p>}
              {info && <p className="panel__footnote">{info}</p>}
              <button className="primary" type="submit" disabled={loading}>
                {loading ? t('verifying') : t('verifyCode')}
              </button>
              <button
                type="button"
                className="primary"
                style={{ marginTop: 12, background: 'transparent', color: '#0A5CF5', border: '1px solid #0A5CF5' }}
                onClick={handleResend}
                disabled={loading}
              >
                {t('resendCode')}
              </button>
            </form>
          )}

          {step === 'password' && (
            <form className="login-form" onSubmit={handleResetPassword}>
              <label>
                <span>{t('newPassword')}</span>
                <PasswordInput
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  minLength={8}
                  required
                  autoComplete="new-password"
                  showLabel={t('showPassword')}
                  hideLabel={t('hidePassword')}
                />
              </label>
              <label>
                <span>{t('confirmPassword')}</span>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder={t('confirmPlaceholder')}
                  minLength={8}
                  required
                  autoComplete="new-password"
                  showLabel={t('showPassword')}
                  hideLabel={t('hidePassword')}
                />
              </label>
              {error && <p className="form-error">{error}</p>}
              {info && <p className="panel__footnote">{info}</p>}
              <button className="primary" type="submit" disabled={loading}>
                {loading ? t('saving') : t('updatePassword')}
              </button>
            </form>
          )}

          <p className="panel__footnote" style={{ marginTop: 18 }}>
            <Link to="/login">{t('backToLogin')}</Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
