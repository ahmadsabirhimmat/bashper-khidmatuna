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
    { to: "/terms", labels: { en: "Terms", ps: "شرطونه", dr: "شرایط" } },
    { to: "/delete-account", labels: { en: "Delete account", ps: "حساب ړنګول", dr: "حذف حساب" } },
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
        <footer className="site-footer mt-auto w-full bg-[#071A36] text-white pb-[env(safe-area-inset-bottom)]">
            <div className="h-1 w-full bg-gradient-to-r from-[#1A63F4] via-[#5B9BFF] to-[#FF4D3A]" />
            <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.35fr_1fr_1fr]">
                <div className="space-y-4 text-center sm:text-start">
                    <div className="inline-flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A63F4] text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                <path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.47a1 1 0 011 1 11.4 11.4 0 00.57 3.6 1 1 0 01-.25 1z" />
                            </svg>
                        </span>
                        <p className="text-xl font-extrabold tracking-tight sm:text-2xl">
                            {translate("Bashper Khidmatona", "بشپر خدمتونه")}
                        </p>
                    </div>
                    <p className="max-w-md text-sm leading-relaxed text-white/70 sm:text-[0.95rem]">
                        {translate(
                            "A reliable companion to keep your essential emergency contacts organized and always within reach.",
                            "یو باوري ملګری چې ستاسې د بیړنیو اړیکو معلومات منظم او همېشه د لاسرسي وړ ساتي."
                        )}
                    </p>
                </div>
                <nav>
                    <p className="mb-4 text-center text-xs font-semibold tracking-wide text-[#8BB4FF] sm:text-start">
                        {translate("Quick Links", "چټک لینکونه")}
                    </p>
                    <ul className="grid gap-2 text-center text-sm text-white/80 sm:grid-cols-2 sm:text-start">
                        {footerLinks.map(({ to, labels }) => (
                            <li key={to}>
                                <NavLink
                                    className="inline-flex rounded-lg px-1 py-1.5 transition hover:bg-white/5 hover:text-white"
                                    to={to}
                                >
                                    {translate(labels.en, labels.ps, labels.dr)}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="min-w-0 space-y-3 text-center text-sm text-white/70 sm:text-start lg:text-end">
                    <p className="text-xs font-semibold tracking-wide text-[#8BB4FF]">
                        {translate("Support", "ملاتړ")}
                    </p>
                    {supportEmail && supportEmail.toLowerCase() !== "ahmadsabirhimmat@gmail.com" ? (
                        <a
                            className="inline-block break-all text-sm font-semibold text-white hover:text-[#8BB4FF]"
                            href={`mailto:${supportEmail}`}
                        >
                            {supportEmail}
                        </a>
                    ) : null}
                    <p>
                        {translate(
                            "Need help? Visit the developer portfolio.",
                            "مرستې ته اړتیا لرئ؟ د جوړونکي پورټفولیو وګورئ.",
                            "نیاز به کمک دارید؟ نمونه کارهای سازنده را ببینید."
                        )}
                    </p>
                    <DeveloperContact translate={translate} variant="onDark" />
                </div>
            </div>
            <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/50">
                {translate(
                    `© ${currentYear} Bashper Khidmatona. All rights reserved.`,
                    `© ${currentYear} بشپر خدمتونه. ټول حقوق خوندي دي.`
                )}
            </div>
        </footer>
    );
};
