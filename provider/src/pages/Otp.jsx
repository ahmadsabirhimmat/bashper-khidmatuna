import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { resendOtp, verifyOtp } from "../api/auth";

export const Otp = () => {
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const {
    pendingOtp,
    login: persistSession,
    setPendingOtp,
    isAuthenticated,
  } = useAuth();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  // Only bounce away when there is no OTP challenge AND the user is not signed in.
  // Clearing pendingOtp after a successful verify must NOT send the user back to login.
  useEffect(() => {
    if (!pendingOtp?.email && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [pendingOtp, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setFeedback("");
    if (!/^\d{6}$/.test(code.trim())) {
      setError(translate("Enter the 6-digit verification code", "۶ عددي کوډ دننه کړئ"));
      return;
    }
    if (!pendingOtp?.email) {
      setError(translate("Verification session expired. Please log in again.", "د تایید ناسته پای ته ورسېده. بیا ننوځئ."));
      navigate("/login", { replace: true });
      return;
    }

    setSubmitting(true);
    try {
      const response = await verifyOtp({
        email: pendingOtp.email,
        code: code.trim(),
        purpose: pendingOtp.purpose || "login",
      });
      persistSession(response.token, response.user);
      setFeedback(translate("Verified. Redirecting...", "تایید شو. لېږد روان دی..."));
      // Navigation is handled by the isAuthenticated effect above.
    } catch (err) {
      setError(err.message || translate("Unable to verify code", "کوډ تایید نه شو"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!pendingOtp?.email) {
      return;
    }
    setError("");
    setFeedback("");
    setResending(true);
    try {
      await resendOtp({
        email: pendingOtp.email,
        purpose: pendingOtp.purpose || "login",
      });
      setFeedback(translate("A new code was sent to your email", "نوی کوډ ستاسو بریښنالیک ته ولېږل شو"));
      setCode("");
    } catch (err) {
      setError(err.message || translate("Unable to resend code", "کوډ بیا نشو لیږلی"));
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
    <section className="page-shell flex max-w-xl flex-col gap-8">
      <div className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-blue-500">
          {translate("Email verification", "د برېښنالیک تایید")}
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          {translate("Enter verification code", "د تایید کوډ دننه کړئ")}
        </h1>
        <p className="text-sm text-slate-500">
          {translate("We sent a 6-digit code to", "موږ ۶ عددي کوډ ولېږه")}{" "}
          <span className="break-all font-semibold text-blue-600">{pendingOtp.email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="form-card rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          {translate("Verification code", "د تایید کوډ")}
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/[^\d]/g, "").slice(0, 6))}
            placeholder="123456"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-center text-2xl font-semibold tracking-[0.4em] text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
            required
          />
        </label>

        {error ? <p className="mt-4 text-center text-sm font-medium text-red-600">{error}</p> : null}
        {feedback ? <p className="mt-4 text-center text-sm text-slate-500">{feedback}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-8 w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting
            ? translate("Verifying...", "تایید کېږي...")
            : translate("Verify & continue", "تایید او دوام")}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending || submitting}
          className="mt-4 w-full rounded-full border border-blue-600 px-6 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:opacity-60"
        >
          {resending
            ? translate("Sending...", "لېږل کېږي...")
            : translate("Resend code", "کوډ بیا ولېږئ")}
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          <button
            type="button"
            className="font-semibold text-blue-600"
            onClick={() => {
              const backTo = pendingOtp.purpose === "register" ? "/signup" : "/login";
              setPendingOtp(null);
              navigate(backTo, { replace: true });
            }}
          >
            {translate("Go back", "شاته")}
          </button>
        </p>
      </form>
    </section>
  );
};
