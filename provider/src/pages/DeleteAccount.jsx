import { NavLink } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const LEGAL_EMAIL = "bashperkhidmatuna@gmail.com";

export const DeleteAccount = () => {
  const { translate } = useLanguage();

  const steps = [
    {
      en: "Open the Bashper Khidmatuna app or this provider website.",
      ps: "د بشپر خدمتونو اپ یا دا ویب پاڼه پرانیستئ.",
      dr: "اپ بشپر خدمتونه یا این وب‌سایت را باز کنید.",
    },
    {
      en: "Log in with the email and password for the account you want to delete.",
      ps: "د هغه حساب بریښنالیک او پټنوم ولیکئ چې ړنګول یې غواړئ.",
      dr: "با ایمیل و رمز حسابی که می‌خواهید حذف شود وارد شوید.",
    },
    {
      en: "Open Profile.",
      ps: "پروفایل پرانیستئ.",
      dr: "پروفایل را باز کنید.",
    },
    {
      en: 'Tap Delete account and confirm. This cannot be undone.',
      ps: "پر «حساب ړنګ کړئ» کلیک وکړئ او تایید یې کړئ. دا کار بیرته نه کېږي.",
      dr: "روی «حذف حساب» بزنید و تأیید کنید. این کار قابل بازگشت نیست.",
    },
  ];

  return (
    <section className="page-shell max-w-4xl">
      <div className="hero-pad rounded-3xl bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 text-white shadow-2xl">
        <p className="text-xs uppercase tracking-[0.4em] text-white/70">
          {translate("Bashper Khidmatuna", "بشپر خدمتونه", "بشپر خدمتونه")}
        </p>
        <h1 className="mt-4 text-2xl font-semibold leading-tight sm:text-4xl md:text-5xl">
          {translate("Delete your account", "خپل حساب ړنګ کړئ", "حساب خود را حذف کنید")}
        </h1>
        <p className="mt-4 max-w-3xl text-white/85">
          {translate(
            "Use this page to request deletion of your Bashper Khidmatuna account and the personal data linked to it.",
            "دا پاڼه د بشپر خدمتونو حساب او اړوند شخصي معلوماتو د ړنګولو غوښتنې لپاره ده.",
            "از این صفحه برای درخواست حذف حساب بشپر خدمتونه و داده‌های شخصی مرتبط استفاده کنید."
          )}
        </p>
      </div>

      <article className="form-card mt-10 space-y-8 rounded-3xl border border-slate-200 bg-white text-slate-700 shadow-xl">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            {translate("How to delete your account", "حساب څنګه ړنګ کړئ", "چگونه حساب را حذف کنید")}
          </h2>
          <ol className="mt-4 list-decimal space-y-3 ps-6 leading-relaxed">
            {steps.map((step) => (
              <li key={step.en}>{translate(step.en, step.ps, step.dr)}</li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <NavLink
              to="/login"
              className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-blue-700"
            >
              {translate("Log in", "ننوتل", "ورود")}
            </NavLink>
            <NavLink
              to="/profile"
              className="rounded-full border border-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-blue-600 transition hover:bg-blue-50"
            >
              {translate("Open Profile", "پروفایل پرانیستئ", "باز کردن پروفایل")}
            </NavLink>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            {translate("Request deletion by email", "د بریښنالیک له لارې غوښتنه", "درخواست حذف با ایمیل")}
          </h2>
          <p className="mt-3 leading-relaxed">
            {translate(
              "If you cannot sign in, email us from the same address used on the account. Write “Delete my Bashper Khidmatuna account” and include that email address. We complete email requests within 30 days.",
              "که ننوتلی نشئ، له هماغه بریښنالیک څخه موږ ته ولیکئ چې په حساب کې کاروئ. موضوع دې وي: «زما د بشپر خدمتونو حساب ړنګ کړئ» او هماغه بریښنالیک پکې ولیکئ. د بریښنالیک غوښتنې په ۳۰ ورځو کې بشپړوو.",
              "اگر نمی‌توانید وارد شوید، از همان ایمیل حساب برای ما بنویسید. موضوع را «حساب بشپر خدمتونه را حذف کنید» بگذارید و همان ایمیل را ذکر کنید. درخواست‌های ایمیلی را ظرف ۳۰ روز انجام می‌دهیم."
            )}
          </p>
          <a
            className="mt-4 inline-block break-all font-semibold text-blue-600 hover:underline"
            href={`mailto:${LEGAL_EMAIL}?subject=${encodeURIComponent("Delete my Bashper Khidmatuna account")}`}
          >
            {LEGAL_EMAIL}
          </a>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            {translate("Data we delete", "هغه معلومات چې ړنګېږي", "داده‌هایی که حذف می‌شوند")}
          </h2>
          <p className="mt-3 leading-relaxed">
            {translate(
              "We delete your name, email, phone number, password, account ID, email verification codes, and any service listings or photos you added as a provider.",
              "ستاسې نوم، بریښنالیک، تلیفون، پټنوم، د حساب پېژندنه، د تایید کوډونه، او هغه خدمتونه یا انځورونه چې تاسې د چمتو کوونکي په توګه اضافه کړي دي ړنګېږي.",
              "نام، ایمیل، تلفن، رمز، شناسه حساب، کدهای تأیید ایمیل، و فهرست‌ها یا عکس‌هایی که به‌عنوان ارائه‌دهنده اضافه کرده‌اید حذف می‌شوند."
            )}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            {translate("Data we keep", "هغه معلومات چې پاتې کېږي", "داده‌هایی که نگه داشته می‌شوند")}
          </h2>
          <p className="mt-3 leading-relaxed">
            {translate(
              "Public emergency numbers managed by administrators (such as 119 police and 102 ambulance) stay in the directory. Favorites saved only on your phone stay until you uninstall the app. Server logs needed for security may be kept up to 30 days, then removed. We do not offer deleting some personal data while keeping the account.",
              "هغه عامه بیړنۍ شمېرې چې اډمین یې اداره کوي (لکه ۱۱۹ پولیس او ۱۰۲ امبولانس) په لارښود کې پاتې کېږي. خوښې چې یوازې په تلیفون کې ساتل شوې وي تر هغه پاتې وي چې اپ لرې کړئ. د امنیت لاګونه تر ۳۰ ورځو ساتل کېدای شي، بیا ړنګېږي. ځینې شخصي معلومات ړنګول او حساب ساتل نه وړاندې کوو.",
              "شماره‌های اضطراری عمومی که مدیر اداره می‌کند (مانند ۱۱۹ پولیس و ۱۰۲ امبولانس) در راهنما می‌مانند. علاقه‌مندی‌های ذخیره‌شده فقط روی گوشی تا حذف اپ باقی می‌مانند. گزارش‌های امنیتی سرور ممکن است تا ۳۰ روز نگه داشته شوند و سپس پاک شوند. حذف بخشی از داده‌ها در حالی که حساب باقی بماند ارائه نمی‌شود."
            )}
          </p>
        </section>
      </article>
    </section>
  );
};
