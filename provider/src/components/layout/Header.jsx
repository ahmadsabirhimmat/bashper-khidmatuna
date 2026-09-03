import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { ThemeToggle } from "../ThemeToggle";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

const primaryLinks = [
    { path: "/", labels: { en: "Home", ps: "کور", dr: "خانه" } },
    { path: "/addcontact", labels: { en: "Add Contact", ps: "نوی اړیکه", dr: "تماس جدید" } },
    { path: "/about", labels: { en: "About", ps: "زموږ په اړه", dr: "درباره" } },
    { path: "/contact", labels: { en: "Contact", ps: "اړیکه", dr: "تماس" } },
    { path: "/profile", labels: { en: "Profile", ps: "پروفایل", dr: "پروفایل" } },
];

const navClass = ({ isActive }) =>
    `rounded-full px-3.5 py-2 text-sm font-semibold transition ${
        isActive
            ? "bg-white/15 text-white shadow-sm"
            : "text-white/80 hover:bg-white/10 hover:text-white"
    }`;

const ghostBtn =
    "inline-flex min-h-10 items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20";
const primaryBtn =
    "inline-flex min-h-10 items-center justify-center rounded-full bg-[#1A63F4] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1556d6]";

const BrandMark = ({ translate }) => (
    <span className="flex min-w-0 items-center gap-2.5">
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#1A63F4] text-white shadow-sm">
            <span className="absolute -end-1.5 -top-1.5 h-4 w-4 rounded-full bg-white/25" />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.47a1 1 0 011 1 11.4 11.4 0 00.57 3.6 1 1 0 01-.25 1z" />
            </svg>
        </span>
        <span className="min-w-0 leading-tight">
            <span className="block truncate text-[0.95rem] font-extrabold tracking-tight text-white sm:text-lg">
                {translate("Bashper", "بشپر")}
            </span>
            <span className="block truncate text-[0.7rem] font-semibold tracking-[0.14em] text-[#8BB4FF] sm:text-xs">
                {translate("Khidmatona", "خدمتونه")}
            </span>
        </span>
    </span>
);

export const Header = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { translate } = useLanguage();
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleToggle = () => setMobileOpen((prev) => !prev);
    const handleClose = () => setMobileOpen(false);
    const handleLogout = () => {
        logout();
        setMobileOpen(false);
        navigate("/");
    };

    const authActions = (
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
            {isAuthenticated ? (
                <button type="button" onClick={handleLogout} className={ghostBtn}>
                    {translate("Logout", "وتل")}
                </button>
            ) : (
                <>
                    <NavLink to="/login" className={ghostBtn} onClick={handleClose}>
                        {translate("Login", "ننوتل")}
                    </NavLink>
                    <NavLink to="/signup" className={primaryBtn} onClick={handleClose}>
                        {translate("Sign Up", "نوم لیکنه")}
                    </NavLink>
                </>
            )}
        </div>
    );

    return (
        <div className="sticky top-0 z-50 w-full min-w-0">
            <header className="site-header w-full min-w-0 border-b border-white/10 bg-[#071A36]/95 pt-[max(0.5rem,env(safe-area-inset-top))] shadow-[0_8px_30px_rgba(7,26,54,0.28)] backdrop-blur-xl">
                <div className="mx-auto flex w-full min-w-0 max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    <div className="min-w-0 flex-1 pe-2 sm:flex-none">
                        <NavLink to="/" className="block" onClick={handleClose}>
                            <BrandMark translate={translate} />
                        </NavLink>
                    </div>
                    <div className="hidden items-center gap-3 xl:flex">
                        <nav>
                            <ul className="flex items-center gap-1">
                                {primaryLinks.map(({ path, labels }) => (
                                    <li key={path} className="whitespace-nowrap">
                                        <NavLink to={path} className={navClass} onClick={handleClose}>
                                            {translate(labels.en, labels.ps, labels.dr)}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        <div className="ms-1 h-6 w-px bg-white/15" />
                        <LanguageSwitcher />
                        <ThemeToggle />
                        {authActions}
                    </div>
                    <div className="flex shrink-0 items-center gap-2 xl:hidden">
                        <ThemeToggle />
                        <LanguageSwitcher />
                        <button
                            type="button"
                            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
                            onClick={handleToggle}
                            aria-label="Toggle navigation menu"
                            aria-expanded={mobileOpen}
                        >
                            {mobileOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
                <div
                    className={`mx-auto w-full max-w-6xl overflow-hidden px-4 transition-all duration-300 ease-in-out sm:px-6 xl:hidden ${
                        mobileOpen ? "max-h-[32rem] pb-4 opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                    <nav className="rounded-2xl border border-white/10 bg-white/5 p-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                        <ul className="flex flex-col gap-1">
                            {primaryLinks.map(({ path, labels }) => (
                                <li key={`mobile-${path}`}>
                                    <NavLink
                                        to={path}
                                        className={({ isActive }) => `${navClass({ isActive })} block text-center`}
                                        onClick={handleClose}
                                    >
                                        {translate(labels.en, labels.ps, labels.dr)}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-3 border-t border-white/10 pt-3">{authActions}</div>
                    </nav>
                </div>
            </header>
        </div>
    );
};
