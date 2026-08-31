import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useLanguage } from "../context/LanguageContext";
import { fetchSiteContact } from "../api/site";

const pickLocalized = (value, language, fallback = "") => {
    if (!value) return fallback;
    if (typeof value === "string") return value;
    return value[language] || value.en || value.ps || value.dr || fallback;
};

export const Contact = () => {
    const { translate, language } = useLanguage();
    const [contact, setContact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");

        fetchSiteContact({ signal: controller.signal })
            .then(setContact)
            .catch((err) => {
                if (err.name === "AbortError") return;
                setError(
                    err.message ||
                        translate(
                            "Unable to load contact information.",
                            "د اړیکې معلومات ونه لوستل شول.",
                            "اطلاعات تماس بارگذاری نشد."
                        )
                );
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [translate]);

    return (
        <section className="page-shell max-w-4xl">
            <div className="hero-pad rounded-3xl bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-xl">
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                    {translate("Support Channel", "د ملاتړ چینل", "کانال پشتیبانی")}
                </p>
                <h1 className="mt-3 text-2xl font-semibold leading-snug sm:text-3xl md:text-4xl">
                    {loading
                        ? translate("Loading...", "لوستل کېږي...", "در حال بارگذاری...")
                        : pickLocalized(
                              contact?.title,
                              language,
                              translate(
                                  "Contact Bashper Khidmatuna HQ",
                                  "له بشپر خدمتونو مرکزي دفتر سره اړیکه ونیسئ",
                                  "با دفتر مرکزی بشپر خدمتونه تماس بگیرید"
                              )
                          )}
                </h1>
                <p className="mt-3 text-white/80">
                    {pickLocalized(
                        contact?.subtitle,
                        language,
                        translate(
                            "Reach us directly using the details below.",
                            "له لاندې معلوماتو څخه په کار اخیستلو سره له موږ سره مستقیمه اړیکه ونیسئ.",
                            "با استفاده از جزئیات زیر مستقیماً با ما تماس بگیرید."
                        )
                    )}
                </p>
            </div>

            {error ? (
                <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-red-700">
                    {error}
                </div>
            ) : null}

            {!loading && !error && contact ? (
                <div className="form-card mt-10 rounded-3xl border border-slate-200 bg-slate-900 text-white shadow-2xl">
                    <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                        {translate("Command Hotline", "د قوماندې ګرمه کرښه", "خط فرمان")}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold">
                        {translate("Reach us directly", "له موږ سره مستقیمه اړیکه", "مستقیماً با ما تماس بگیرید")}
                    </h2>
                    <div className="mt-6 space-y-5 text-sm">
                        <div>
                            <p className="text-white/60">
                                {pickLocalized(contact.emergencyLabel, language, "Emergency Onboarding")}
                            </p>
                            <a className="text-lg font-semibold text-white hover:underline" href={`tel:${contact.emergencyPhone}`}>
                                {contact.emergencyPhone}
                            </a>
                        </div>
                        <div>
                            <p className="text-white/60">
                                {pickLocalized(contact.technicalLabel, language, "Technical Operations")}
                            </p>
                            <a className="text-lg font-semibold text-white hover:underline" href={`tel:${contact.technicalPhone}`}>
                                {contact.technicalPhone}
                            </a>
                        </div>
                        <div>
                            <p className="text-white/60">{pickLocalized(contact.emailLabel, language, "Email")}</p>
                            <a className="break-all text-lg font-semibold text-white hover:underline" href={`mailto:${contact.email}`}>
                                {contact.email}
                            </a>
                        </div>
                        {pickLocalized(contact.address, language) ? (
                            <div>
                                <p className="text-white/60">
                                    {pickLocalized(contact.addressLabel, language, "Office Address")}
                                </p>
                                <p className="text-lg font-semibold">{pickLocalized(contact.address, language)}</p>
                            </div>
                        ) : null}
                        {pickLocalized(contact.officeHours, language) ? (
                            <div>
                                <p className="text-white/60">
                                    {translate("Office hours", "د دفتر ساعتونه", "ساعات کاری")}
                                </p>
                                <p className="text-lg font-semibold">{pickLocalized(contact.officeHours, language)}</p>
                            </div>
                        ) : null}
                    </div>
                    {pickLocalized(contact.responseNote, language) ? (
                        <div className="mt-10 rounded-2xl border border-white/20 bg-white/5 px-5 py-4 text-xs uppercase tracking-[0.4em] text-white/70">
                            {pickLocalized(contact.responseNote, language)}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </section>
    );
};
