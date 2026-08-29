import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext(undefined);

const LANGUAGE_CYCLE = ["en", "ps", "dr"];

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState("en");

    useEffect(() => {
        const isRtl = language === "ps" || language === "dr";
        document.documentElement.dir = isRtl ? "rtl" : "ltr";
        document.documentElement.lang = language === "dr" ? "fa" : language;
    }, [language]);

    const toggleLanguage = useCallback(() => {
        setLanguage((prev) => {
            const index = LANGUAGE_CYCLE.indexOf(prev);
            return LANGUAGE_CYCLE[(index + 1) % LANGUAGE_CYCLE.length];
        });
    }, []);

    const translate = useCallback(
        (englishText = "", pashtoText = "", dariText = "") => {
            if (language === "ps") {
                return pashtoText || englishText;
            }
            if (language === "dr") {
                return dariText || pashtoText || englishText;
            }
            return englishText || pashtoText || dariText;
        },
        [language]
    );

    const value = useMemo(
        () => ({ language, setLanguage, toggleLanguage, translate }),
        [language, toggleLanguage, translate]
    );

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within LanguageProvider");
    }
    return context;
};
