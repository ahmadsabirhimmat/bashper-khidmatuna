import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

const primaryLinks = [
    { path: "/", labels: { en: "Home", ps: "کور", dr: "خانه" } },
    { path: "/addcontact", labels: { en: "Add Contact", ps: "نوی اړیکه", dr: "تماس جدید" } },
    { path: "/about", labels: { en: "About", ps: "زموږ په اړه", dr: "درباره" } },
    { path: "/contact", labels: { en: "Contact", ps: "اړیکه", dr: "تماس" } },
    { path: "/profile", labels: { en: "Profile", ps: "پروفایل", dr: "پروفایل" } },
];

const authBtn =
    "rounded-full border border-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-blue-600 sm:px-5 sm:text-sm sm:tracking-[0.3em]";
const signupBtn =
    "rounded-full bg-white px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 transition hover:bg-blue-100 sm:px-5 sm:text-sm sm:tracking-[0.3em]";

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

    return (
        <div className="relative z-50 w-full min-w-0">
            <header className="w-full min-w-0 bg-blue-500 py-3 shadow-xl shadow-blue-300/50 pt-[max(0.75rem,env(safe-area-inset-top))]">
                <div className="mx-auto flex w-full min-w-0 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6">
                    <div id="navbar-brand" className="min-w-0 flex-1 overflow-hidden">
                        <NavLink to="/" className="block min-w-0" onClick={handleClose}>
                            <p className="truncate text-base font-semibold tracking-wide text-white hover:text-black sm:text-xl">
                                {translate("Bashper Khidmatona", "بشپر خدمتونه")}
                            </p>
                        </NavLink>
                    </div>
                    <div className="hidden min-w-0 items-center gap-4 xl:flex 2xl:gap-6">
                        <nav>
                            <ul className="flex gap-4 text-white 2xl:gap-5">
                                {primaryLinks.map(({ path, labels }) => (
                                    <li key={path} className="whitespace-nowrap">
                                        <NavLink to={path} className="nav-link" onClick={handleClose}>
                                            {translate(labels.en, labels.ps, labels.dr)}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        <LanguageSwitcher />
                        <div className="flex shrink-0 items-center gap-3">
                            {isAuthenticated ? (
                                <button type="button" onClick={handleLogout} className={authBtn}>
                                    {translate("Logout", "وتل")}
                                </button>
                            ) : (
                                <>
                                    <NavLink to="/login" className={authBtn} onClick={handleClose}>
                                        {translate("Login", "ننوتل")}
                                    </NavLink>
                                    <NavLink to="/signup" className={signupBtn} onClick={handleClose}>
                                        {translate("Sign Up", "نوم لیکنه")}
                                    </NavLink>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 sm:gap-3 xl:hidden">
                        <LanguageSwitcher />
                        <button
                            type="button"
                            className="flex h-11 w-11 items-center justify-center rounded-md border border-white text-white transition hover:bg-white hover:text-blue-500"
                            onClick={handleToggle}
                            aria-label="Toggle navigation menu"
                            aria-expanded={mobileOpen}
                        >
                            {mobileOpen ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
                <div
                    className={`mx-auto w-full max-w-6xl overflow-hidden px-4 transition-all duration-300 ease-in-out sm:px-6 xl:hidden ${mobileOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"}`}
                >
                    <nav className="mt-3 space-y-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                        <ul className="flex flex-col gap-3 text-white">
                            {primaryLinks.map(({ path, labels }) => (
                                <li key={`mobile-${path}`}>
                                    <NavLink
                                        to={path}
                                        className="nav-link block rounded-md bg-blue-600/60 px-4 py-3 text-center"
                                        onClick={handleClose}
                                    >
                                        {translate(labels.en, labels.ps, labels.dr)}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 flex flex-col gap-3">
                            {isAuthenticated ? (
                                <button type="button" onClick={handleLogout} className={authBtn}>
                                    {translate("Logout", "وتل")}
                                </button>
                            ) : (
                                <>
                                    <NavLink to="/login" className={`${authBtn} text-center`} onClick={handleClose}>
                                        {translate("Login", "ننوتل")}
                                    </NavLink>
                                    <NavLink to="/signup" className={signupBtn} onClick={handleClose}>
                                        {translate("Sign Up", "نوم لیکنه")}
                                    </NavLink>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            </header>
        </div>
    );
};
