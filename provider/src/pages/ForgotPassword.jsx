import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { forgotPassword, resendOtp, resetPassword, verifyOtp } from "../api/auth";
import { PasswordInput } from "../components/PasswordInput";

export const ForgotPassword = () => {
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSendCode = async (event) => {
    event.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const response = await forgotPassword({ email: email.trim().toLowerCase() });
      setEmail(response.email || email.trim().toLowerCase());
      setInfo(
        response.message ||
          translate("Password reset code sent to your email", "د پټنوم بیا تنظیم کوډ بریښنالیک ته ولېږل شو")
      );
      setStep("otp");
      setCode("");
    } catch (err) {
      setError(err.message || translate("Unable to send reset code", "کوډ نشو لیږلی"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();
    setError("");
    setInfo("");
    if (!/^\d{6}$/.test(code.trim())) {
      setError(translate("Enter the 6-digit verification code", "۶ عددي کوډ دننه کړئ"));
      return;
    }
    setLoading(true);
    try {
      const response = await verifyOtp({
        email,
        code: code.trim(),
        purpose: "reset",
      });
      if (!response?.resetToken) {
        throw new Error(translate("Unable to start password reset", "د پټنوم بیا تنظیم پیل نشو"));
      }
      setResetToken(response.resetToken);
      setInfo(translate("Code verified. Choose a new password.", "کوډ تایید شو. نوی پټنوم وټاکئ."));
      setStep("password");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || translate("Unable to verify code", "کوډ تایید نه شو"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await resendOtp({ email, purpose: "reset" });
      setInfo(translate("A new code was sent to your email", "نوی کوډ ستاسو بریښنالیک ته ولېږل شو"));
      setCode("");
    } catch (err) {
      setError(err.message || translate("Unable to resend code", "کوډ بیا نشو لیږلی"));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setInfo("");
    if (password.length < 8) {
      setError(translate("Password must be at least 8 characters", "پټنوم باید لږ تر لږه ۸ توري وي"));
      return;
    }
    if (password !== confirmPassword) {
      setError(translate("Passwords do not match", "پټنومونه سره سمون نه خوري"));
      return;
    }
    setLoading(true);
    try {
      const response = await resetPassword({
        email,
        resetToken,
        password,
      });
      setInfo(
        response.message ||
          translate("Password updated successfully.", "پټنوم په بریالیتوب سره تازه شو.")
      );
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (err) {
      setError(err.message || translate("Unable to reset password", "پټنوم بیا تنظیم نه شو"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-shell flex max-w-xl flex-col gap-8">
      <div className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-blue-500">
          {translate("Password recovery", "د پټنوم بیرته راګرځول")}
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          {step === "email" && translate("Forgot password", "پټنوم هیر شوی")}
          {step === "otp" && translate("Enter reset code", "د بیا تنظیم کوډ دننه کړئ")}
          {step === "password" && translate("Set new password", "نوی پټنوم وټاکئ")}
        </h1>
        <p className="text-sm text-slate-500">
          {step === "email" &&
            translate(
              "Enter your email and we will send a 6-digit reset code.",
              "خپل بریښنالیک دننه کړئ او موږ به ۶ عددي کوډ ولېږو."
            )}
          {step === "otp" && (
            <>
              {translate("We sent a code to", "موږ کوډ ولېږه")}{" "}
              <span className="break-all font-semibold text-blue-600">{email}</span>
            </>
          )}
          {step === "password" &&
            translate("Choose a new password for your account.", "د خپل حساب لپاره نوی پټنوم وټاکئ.")}
        </p>
      </div>

      <div className="form-card rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {step === "email" && (
          <form onSubmit={handleSendCode} className="space-y-6">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              {translate("Work Email", "کاري بریښنالیک")}
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                required
              />
            </label>
            {error ? <p className="text-center text-sm font-medium text-red-600">{error}</p> : null}
            {info ? <p className="text-center text-sm text-slate-500">{info}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading
                ? translate("Sending...", "لېږل کېږي...")
                : translate("Send reset code", "د بیا تنظیم کوډ ولېږئ")}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              {translate("Verification code", "د تایید کوډ")}
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-center text-2xl font-semibold tracking-[0.4em] text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                required
              />
            </label>
            {error ? <p className="text-center text-sm font-medium text-red-600">{error}</p> : null}
            {info ? <p className="text-center text-sm text-slate-500">{info}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading
                ? translate("Verifying...", "تایید کېږي...")
                : translate("Verify code", "کوډ تایید کړئ")}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="w-full rounded-full border border-blue-600 px-6 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:opacity-60"
            >
              {translate("Resend code", "کوډ بیا ولېږئ")}
            </button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              {translate("New password", "نوی پټنوم")}
              <PasswordInput
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              {translate("Confirm password", "پټنوم تایید کړئ")}
              <PasswordInput
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
              />
            </label>
            {error ? <p className="text-center text-sm font-medium text-red-600">{error}</p> : null}
            {info ? <p className="text-center text-sm text-slate-500">{info}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading
                ? translate("Saving...", "خوندي کېږي...")
                : translate("Update password", "پټنوم تازه کړئ")}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          <NavLink to="/login" className="font-semibold text-blue-600">
            {translate("Back to login", "بیرته ننوتلو ته")}
          </NavLink>
        </p>
      </div>
    </section>
  );
};
