import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { fetchPolicy } from "../api/site";

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

export const Privacy = () => {
  const { translate, language } = useLanguage();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetchPolicy({ signal: controller.signal })
      .then(setPolicy)
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(
          err.message ||
            translate(
              "Unable to load the privacy policy.",
              "د محرمیت تګلاره ونه لوستل شوه.",
              "بارگذاری سیاست حریم خصوصی ممکن نشد."
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
    pickLocalized(policy?.title, language) ||
    translate("Privacy policy", "د محرمیت تګلاره", "سیاست حریم خصوصی");
  const subtitle = pickLocalized(policy?.subtitle, language);
  const sections = Array.isArray(policy?.sections) ? policy.sections : [];
  const updatedLabel = policy?.updatedAt ? formatDate(policy.updatedAt, language) : "";

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
          {translate("Loading privacy policy…", "د محرمیت تګلاره لوستل کېږي…", "در حال بارگذاری سیاست حریم خصوصی…")}
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
                "The privacy policy has not been published yet.",
                "د محرمیت تګلاره لا نه ده خپره شوې.",
                "سیاست حریم خصوصی هنوز منتشر نشده است."
              )}
            </p>
          )}
        </article>
      ) : null}
    </section>
  );
};
