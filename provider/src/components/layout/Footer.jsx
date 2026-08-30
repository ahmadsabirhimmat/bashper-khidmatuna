import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { fetchSiteContact } from "../../api/site";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { DeveloperContact } from "../DeveloperContact";

const allFooterLinks = [
    { to: "/", labels: { en: "Home", ps: "کور", dr: "خانه" } },
    { to: "/addcontact", labels: { en: "Add Contact", ps: "نوی اړیکه", dr: "تماس جدید" } },
    { to: "/about", labels: { en: "About", ps: "زموږ په اړه", dr: "درباره" } },
    { to: "/contact", labels: { en: "Contact", ps: "اړیکه", dr: "تماس" } },
    { to: "/privacy", labels: { en: "Privacy", ps: "محرمیت", dr: "حریم خصوصی" } },
    { to: "/profile", labels: { en: "Profile", ps: "پروفایل", dr: "پروفایل" }, auth: true },
    { to: "/login", labels: { en: "Login", ps: "ننوتل", dr: "ورود" }, guest: true },
    { to: "/signup", labels: { en: "Sign Up", ps: "نوم لیکنه", dr: "ثبت‌نام" }, guest: true },
];

export const Footer = () => {
    const currentYear = new Date().getFullYear();
    const { translate } = useLanguage();
    const { isAuthenticated } = useAuth();
    const [supportEmail, setSupportEmail] = useState("");

    const footerLinks = useMemo(
        () =>
            allFooterLinks.filter((link) => {
                if (link.guest) return !isAuthenticated;
                if (link.auth) return isAuthenticated;
                return true;
            }),
        [isAuthenticated]
    );

    useEffect(() => {
        const controller = new AbortController();

        fetchSiteContact({ signal: controller.signal })
            .then((contact) => {
                setSupportEmail((contact?.email || "").trim());
            })
            .catch((err) => {
                if (err.name !== "AbortError") {
                    setSupportEmail("");
                }
            });

        return () => controller.abort();
    }, []);

    return (
        <footer className="mt-auto w-full bg-blue-600 text-white pb-[env(safe-area-inset-bottom)]">
            <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 sm:py-12 lg:grid-cols-[1.2fr_1fr_1fr]">
                <div className="space-y-3 text-center sm:text-start">
                    <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
                        {translate("Bashper Khidmatona", "بشپر خدمتونه")}
                    </p>
                    <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                        {translate(
                            "A reliable companion to keep your essential emergency contacts organized and always within reach.",
                            "یو باوري ملګری چې ستاسې د بیړنیو اړیکو معلومات منظم او همېشه د لاسرسي وړ ساتي."
                        )}
                    </p>
                </div>
                <nav>
                    <p className="mb-5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 sm:text-start sm:tracking-[0.4em]">
                        {translate("Quick Links", "چټک لینکونه")}
                    </p>
                    <ul className="grid gap-3 text-center text-base text-white/90 sm:grid-cols-2 sm:text-start">
                        {footerLinks.map(({ to, labels }) => (
                            <li key={to}>
                                <NavLink className="transition hover:text-white" to={to}>
                                    {translate(labels.en, labels.ps, labels.dr)}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="min-w-0 space-y-2 text-center text-base text-white/80 sm:text-start lg:text-end">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70 sm:tracking-[0.3em]">
                        {translate("Support", "ملاتړ")}
                    </p>
                    <p>{translate("Need help? Email or WhatsApp the developer.", "مرستې ته اړتیا لرئ؟ جوړونکي ته بریښنالیک یا واټساپ وکړئ.", "نیاز به کمک دارید؟ به سازنده ایمیل یا واتساپ بزنید.")}</p>
                    <DeveloperContact translate={translate} variant="onBlue" />
                    {supportEmail && supportEmail.toLowerCase() !== "ahmadsabirhimmat@gmail.com" ? (
                        <a className="inline-block break-all text-base font-semibold text-white hover:underline sm:text-lg" href={`mailto:${supportEmail}`}>
                            {supportEmail}
                        </a>
                    ) : null}
                </div>
            </div>
            <div className="border-t border-white/20 px-4 py-4 text-center text-[10px] uppercase tracking-[0.16em] text-white/70 sm:text-[11px] sm:tracking-[0.3em]">
                {translate(
                    `© ${currentYear} Bashper Khidmatona. All rights reserved.`,
                    `© ${currentYear} بشپر خدمتونه. ټول حقوق خوندي دي.`
                )}
            </div>
        </footer>
    );
};
