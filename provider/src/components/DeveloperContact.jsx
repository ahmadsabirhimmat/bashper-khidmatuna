export const DEVELOPER_CONTACT = {
  name: "Ahmad Sabir Himmat",
  portfolioUrl: "https://sabirhimmatportfolio.onrender.com",
};

export const DeveloperContact = ({ translate, variant = "light" }) => {
  const onBlue = variant === "onBlue";
  const onDark = variant === "onDark";
  const labelClass = onBlue || onDark ? "text-white/70" : "text-slate-400";
  const titleClass = onBlue || onDark ? "text-white" : "text-slate-900";
  const linkClass = onBlue || onDark ? "text-white hover:underline" : "text-blue-600 hover:underline";
  const boxClass = onBlue
    ? "rounded-2xl border border-white/20 bg-white/10 p-4"
    : onDark
      ? "rounded-2xl border border-white/20 bg-white/5 p-4"
      : "rounded-2xl border border-slate-200 bg-slate-50 p-4";

  return (
    <div className={boxClass}>
      <p className={`text-xs uppercase tracking-[0.28em] ${labelClass}`}>
        {translate("Developer", "جوړونکی", "سازنده")}
      </p>
      <p className={`mt-2 text-base font-semibold ${titleClass}`}>{DEVELOPER_CONTACT.name}</p>
      <div className="mt-3 space-y-2 text-sm">
        <p>
          <span className={labelClass}>{translate("Portfolio", "پورټفولیو", "نمونه کارها")}: </span>
          <a
            className={`break-all font-semibold ${linkClass}`}
            href={DEVELOPER_CONTACT.portfolioUrl}
            target="_blank"
            rel="noreferrer"
          >
            {DEVELOPER_CONTACT.portfolioUrl.replace(/^https:\/\//, "")}
          </a>
        </p>
      </div>
    </div>
  );
};
