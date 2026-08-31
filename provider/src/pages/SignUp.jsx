import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../api/auth";
import { PasswordInput } from "../components/PasswordInput";

const initialForm = {
    fullName: "",
    organization: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
};

export const SignUp = () => {
    const { translate } = useLanguage();
    const navigate = useNavigate();
    const { login: persistSession, setPendingOtp } = useAuth();
    const [formData, setFormData] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setFeedback(translate("Passwords do not match", "پټنومونه سره سمون نه خوري"));
            return;
        }
        setSubmitting(true);
        setFeedback("");
        try {
            const payload = {
                fullName: formData.fullName,
                organization: formData.organization,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                password: formData.password,
                role: "provider",
            };
            const response = await registerUser(payload);
            if (response?.requiresOtp) {
                setPendingOtp({
                    email: response.email,
                    purpose: response.purpose || "register",
                });
                navigate("/otp");
                return;
            }
            persistSession(response.token, response.user);
            setFeedback(translate("Account created. Redirecting...", "حساب جوړ شو. لېږد روان دی..."));
            setTimeout(() => navigate("/"), 600);
        } catch (err) {
            if (err?.status === 409) {
                setFeedback(
                    translate(
                        "This email is already registered. Please sign in instead.",
                        "دا بریښنالیک لا دمخه ثبت شوی. مهرباني وکړئ ننوتل وکړئ."
                    )
                );
            } else {
                setFeedback(err.message || translate("Unable to create account", "حساب جوړ نه شو"));
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="page-shell flex max-w-5xl flex-col gap-10 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1 space-y-4 text-center lg:text-start">
                <p className="text-xs uppercase tracking-[0.4em] text-blue-500">
                    {translate("Create Access", "لاس رسی جوړ کړئ")}
                </p>
                <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl md:text-4xl">
                    {translate("Register your emergency hub", "خپل بیړنی مرکز ثبت کړئ")}
                </h1>
                <p className="text-sm text-slate-500 md:text-base">
                    {translate(
                        "Invite trusted responders, coordinate hospitals and field units, and keep critical contact data synced with Bashper Khidmatona.",
                        "باوري ځواب ویونکي راوبلئ، د روغتونونو او میداني ټیمونو همغږي وکړئ او د بشپر خدمتونو له لارې مهم تماس معلومات هممهاله وساتئ."
                    )}
                </p>
            </div>

            <div className="min-w-0 flex-1">
                <form onSubmit={handleSubmit} className="form-card rounded-3xl border border-slate-200 bg-white shadow-2xl">
                    <div className="grid gap-6 md:grid-cols-2">
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                            {translate("Full Name", "بشپړ نوم")}
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder={translate("Amina Rahimi", "آمنه رحیمي")}
                                className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                                required
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                            {translate("Organization", "اداره")}
                            <input
                                type="text"
                                name="organization"
                                value={formData.organization}
                                onChange={handleChange}
                                placeholder={translate("Central Dispatch HQ", "مرکزي اعزام مرکز")}
                                className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                                required
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                            {translate("Work Email", "کاري بریښنالیک")}
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="ops.command@agency.gov"
                                className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                                required
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                            {translate("Phone Number", "د تلیفون شمېره")}
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="+93 700 222 333"
                                className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                                required
                            />
                        </label>
                    </div>

                    <label className="mt-6 flex flex-col gap-2 text-sm font-medium text-slate-700">
                        {translate("Password", "پټنوم")}
                        <PasswordInput
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={translate("Minimum 8 characters", "لږ تر لږه ۸ توري")}
                            required
                            autoComplete="new-password"
                        />
                    </label>
                    <label className="mt-4 flex flex-col gap-2 text-sm font-medium text-slate-700">
                        {translate("Confirm Password", "پټنوم تایید کړئ")}
                        <PasswordInput
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder={translate("Re-enter password", "پټنوم بیا ولیکئ")}
                            required
                            autoComplete="new-password"
                        />
                    </label>

                    <div className="mt-6 flex items-start gap-3 text-sm text-slate-600">
                        <input type="checkbox" id="legal-consent" className="mt-1 h-4 w-4 rounded border-slate-300" required />
                        <p>
                            <label htmlFor="legal-consent">
                                {translate("I accept the", "زه منم", "می‌پذیرم")}{" "}
                            </label>
                            <NavLink to="/privacy" className="font-semibold text-blue-600 underline-offset-2 hover:underline">
                                {translate("privacy policy", "د محرمیت تګلاره", "سیاست حریم خصوصی")}
                            </NavLink>{" "}
                            {translate("and", "او", "و")}{" "}
                            <NavLink to="/terms" className="font-semibold text-blue-600 underline-offset-2 hover:underline">
                                {translate("terms of use", "د کارولو شرطونه", "شرایط استفاده")}
                            </NavLink>
                            <label htmlFor="legal-consent">
                                {translate(
                                    ", confirm I am 13 or older, and confirm I am an authorized emergency services representative.",
                                    "، تاییدوم چې ۱۳ کلن یا زیات یم، او تاییدوم چې زه د بیړنیو خدمتونو واکمن استازی یم.",
                                    "، تأیید می‌کنم که ۱۳ سال یا بیشتر دارم، و تأیید می‌کنم که نماینده مجاز خدمات اضطراری هستم."
                                )}
                            </label>
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-8 w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-60"
                    >
                        {submitting ? translate("Sending code...", "کوډ لېږل کېږي...") : translate("Create Account", "حساب جوړ کړئ")}
                    </button>
                    {feedback && (
                        <p className="mt-4 text-center text-sm text-slate-500">{feedback}</p>
                    )}
                    <p className="mt-6 text-center text-sm text-slate-500">
                        {translate("Already have access?", "لا دمخه لاس رسی لرئ؟")} {" "}
                        <NavLink to="/login" className="font-semibold text-blue-600">
                            {translate("Log in", "ننوتل")}
                        </NavLink>
                    </p>
                </form>
            </div>
        </section>
    );
};