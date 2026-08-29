import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const options = [
    { code: "en", labels: { en: "English", ps: "انګلیسي", dr: "انگلیسی" } },
    { code: "ps", labels: { en: "Pashto", ps: "پښتو", dr: "پشتو" } },
    { code: "dr", labels: { en: "Dari", ps: "دري", dr: "دری" } },
];

export const LanguageSwitcher = ({ className = "" }) => {
    const { language, setLanguage, translate } = useLanguage();
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickAway = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickAway);
        return () => document.removeEventListener("mousedown", handleClickAway);
    }, []);

    const activeOption = options.find((option) => option.code === language) ?? options[0];

    return (
        <div className={`relative z-50 ${className}`} ref={menuRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex min-h-11 max-w-[5.75rem] shrink items-center gap-1 rounded-full border border-white/60 bg-white/10 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm backdrop-blur transition hover:bg-white/20 sm:max-w-none sm:gap-2 sm:px-4 sm:text-xs sm:tracking-[0.2em]"
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className="truncate sm:hidden">{activeOption.code.toUpperCase()}</span>
                <span className="hidden max-w-[7rem] truncate sm:inline sm:max-w-none">
                    {translate(activeOption.labels.en, activeOption.labels.ps, activeOption.labels.dr)}
                </span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <ul
                className={`absolute end-0 z-50 mt-2 w-44 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/20 bg-white/95 text-sm text-slate-700 shadow-2xl transition-all duration-200 ${
                    open ? "pointer-events-auto visible opacity-100" : "pointer-events-none invisible opacity-0"
                }`}
                role="listbox"
            >
                {options.map((option) => (
                    <li key={option.code}>
                        <button
                            type="button"
                            onClick={() => {
                                setLanguage(option.code);
                                setOpen(false);
                            }}
                            className={`flex w-full items-center justify-between px-4 py-3 text-start text-xs font-semibold uppercase tracking-[0.12em] transition sm:tracking-[0.2em] ${
                                option.code === language ? "bg-blue-50 text-blue-600" : "hover:bg-slate-100"
                            }`}
                            role="option"
                            aria-selected={option.code === language}
                        >
                            {translate(option.labels.en, option.labels.ps, option.labels.dr)}
                            {option.code === language && (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 011.414-1.414l2.793 2.793 6.543-6.543a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
