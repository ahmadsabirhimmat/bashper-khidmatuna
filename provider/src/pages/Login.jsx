import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api/auth";
import { PasswordInput } from "../components/PasswordInput";

export const Login = () => {
    const { translate } = useLanguage();
    const navigate = useNavigate();
    const { login: persistSession, setPendingOtp } = useAuth();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setFeedback("");
        try {
            const response = await loginUser(formData);
            if (response?.requiresOtp) {
                setPendingOtp({
                    email: response.email,
                    purpose: response.purpose || "login",
                });
                navigate("/otp");
                return;
            }
            persistSession(response.token, response.user);
            setFeedback(translate("Welcome back. Redirecting...", "بیا ښه راغلاست. ستاسې لاره برابریږي..."));
            setTimeout(() => navigate("/"), 600);
        } catch (err) {
            setFeedback(err.message || translate("Invalid credentials", "تصدیق ناسم دی"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="page-shell flex max-w-5xl flex-col gap-10 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1 space-y-4 text-center lg:text-start">
                <p className="text-xs uppercase tracking-[0.4em] text-blue-500">
                    {translate("Provider Network", "د خدمت شبکه")}
                </p>
                <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl md:text-4xl">
                    {translate("Log in to dispatch console", "د اعزام خونې ته ننوځئ")}
                </h1>
                <p className="text-sm text-slate-500 md:text-base">
                    {translate(
                        "Access secure dashboards to update provider rosters, monitor incident queues, and keep emergency data synchronized across teams.",
                        "امن ډشبورډونو ته لاسرسی پیدا کړئ څو د خدماتو لستونه نوي، د پېښو قطارونه وڅارئ او بیړني معلومات په ټیمونو کې همغږي وساتئ."
                    )}
                </p>
            </div>

            <div className="min-w-0 flex-1">
                <form onSubmit={handleSubmit} className="form-card rounded-3xl border border-slate-200 bg-white shadow-2xl">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700" htmlFor="email">
                            {translate("Work Email", "کاري بریښنالیک")}
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="command.center@agency.gov"
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="mt-6 space-y-2">
                        <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
                            <label className="font-medium" htmlFor="password">
                                {translate("Password", "پټنوم")}
                            </label>
                            <NavLink to="/forgot-password" className="shrink-0 text-blue-600">
                                {translate("Forgot?", "هیر شوی؟")}
                            </NavLink>
                        </div>
                        <PasswordInput
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={translate("Enter secure passphrase", "خپل خوندي پټنوم ولیکئ")}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    <div className="mt-6 flex items-center gap-3 text-sm text-slate-600">
                        <input type="checkbox" id="remember" className="h-4 w-4 rounded border-slate-300" />
                        <label htmlFor="remember">{translate("Remember this device", "دا وسیله په یاد وساتئ")}</label>
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-8 w-full whitespace-normal rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-60"
                    >
                        {submitting ? translate("Sending code...", "کوډ لېږل کېږي...") : translate("Continue", "دوام")}
                    </button>
                    {feedback && (
                        <p className="mt-4 text-center text-sm text-slate-500">{feedback}</p>
                    )}
                    <p className="mt-6 text-center text-sm text-slate-500">
                        {translate("Need a secure account?", "امن حساب ته اړتیا لرئ؟")} {" "}
                        <NavLink to="/signup" className="font-semibold text-blue-600">
                            {translate("Request access", "لاس رسی وغواړئ")}
                        </NavLink>
                    </p>
                </form>
            </div>
        </section>
    );
};
