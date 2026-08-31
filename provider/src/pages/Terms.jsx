import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { fetchTerms } from "../api/site";

const pickLocalized = (value, language) => {
  if (!value || typeof value !== "object") {
    return typeof value === "string" ? value : "";
  }
  if (language === "ps") return value.ps || value.en || value.dr || "";
  if (language === "dr") return value.dr || value.ps || value.en || "";
  return value.en || value.ps || value.dr || "";
};

const formatDate = (value, language) => {
  if (!value) return "";
  const locale = language === "dr" ? "fa-AF" : language === "ps" ? "ps-AF" : "en-GB";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
};

export const Terms = () => {
  const { translate, language } = useLanguage();
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetchTerms({ signal: controller.signal })
      .then(setTerms)
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(
          err.message ||
            translate(
              "Unable to load the terms of use.",
              "د کارولو شرطونه ونه لوستل شول.",
              "بارگذاری شرایط استفاده ممکن نشد."
            )
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [translate]);

  const title =
    pickLocalized(terms?.title, language) ||
    translate("Terms of use", "د کارولو شرطونه", "شرایط استفاده");
  const subtitle = pickLocalized(terms?.subtitle, language);
  const sections = Array.isArray(terms?.sections) ? terms.sections : [];
  const updatedLabel = terms?.updatedAt ? formatDate(terms.updatedAt, language) : "";

  return (
    <section className="page-shell max-w-4xl">
      <div className="hero-pad rounded-3xl bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 text-white shadow-2xl">
        <p className="text-xs uppercase tracking-[0.4em] text-white/70">
          {translate("Legal", "قانوني", "حقوقی")}
        </p>
        <h1 className="mt-4 text-2xl font-semibold leading-tight sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {subtitle ? <p className="mt-4 max-w-3xl text-white/85">{subtitle}</p> : null}
        {updatedLabel ? (
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/70">
            {translate("Last updated", "وروستی تازه کېدل", "آخرین به‌روزرسانی")}: {updatedLabel}
          </p>
        ) : null}
      </div>

      {loading ? (
        <div className="form-card mt-10 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500 shadow-xl">
          {translate("Loading terms of use…", "د کارولو شرطونه لوستل کېږي…", "در حال بارگذاری شرایط استفاده…")}
        </div>
      ) : null}

      {error ? (
        <div className="form-card mt-10 rounded-3xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700 shadow-xl">
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <article className="form-card mt-10 space-y-8 rounded-3xl border border-slate-200 bg-white text-slate-700 shadow-xl">
          {sections.length ? (
            sections.map((section, index) => {
              const heading = pickLocalized(section.heading, language);
              const body = pickLocalized(section.body, language);
              if (!heading && !body) return null;
              return (
                <section key={`${heading}-${index}`}>
                  {heading ? <h2 className="text-xl font-semibold text-slate-900">{heading}</h2> : null}
                  {body ? <p className="mt-3 whitespace-pre-wrap leading-relaxed">{body}</p> : null}
                </section>
              );
            })
          ) : (
            <p className="text-slate-500">
              {translate(
                "The terms of use have not been published yet.",
                "د کارولو شرطونه لا نه دي خپاره شوي.",
                "شرایط استفاده هنوز منتشر نشده است."
              )}
            </p>
          )}
        </article>
      ) : null}
    </section>
  );
};
