import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { deleteAccount, fetchCurrentUser } from "../api/auth";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const formatDate = (value) => {
    if (!value) return "—";
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
};

const getInitials = (name = "") => {
    const parts = String(name)
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (!parts.length) return "BK";
    return parts
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
};

const statusTone = (status) => {
    if (status === "active") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    if (status === "pending") return "bg-amber-50 text-amber-700 ring-amber-200";
    if (status === "suspended") return "bg-red-50 text-red-700 ring-red-200";
    return "bg-slate-100 text-slate-600 ring-slate-200";
};

export const Profile = () => {
    const { translate } = useLanguage();
    const navigate = useNavigate();
    const { user, token, isAuthenticated, login: persistSession, logout } = useAuth();
    const [profile, setProfile] = useState(user);
    const [loading, setLoading] = useState(isAuthenticated);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return undefined;
        }

        const controller = new AbortController();
        setLoading(true);
        setError("");

        fetchCurrentUser({ signal: controller.signal })
            .then((data) => {
                setProfile(data);
                persistSession(token, data);
            })
            .catch((err) => {
                if (err.name === "AbortError") return;
                setError(
                    err.message ||
                        translate("Unable to load your profile.", "ستاسې پروفایل ونه لوستل شو.", "پروفایل شما بارگذاری نشد.")
                );
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [isAuthenticated, persistSession, token, translate]);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            translate(
                "Delete this account and every emergency number you added? This cannot be undone.",
                "ایا غواړئ دا حساب او ټول هغه بیړني شمېرې چې تاسې اضافه کړي دي ړنګ کړئ؟ دا عمل بیرته نه کېږي.",
                "آیا می‌خواهید این حساب و تمام شماره‌های اضطراری که اضافه کرده‌اید حذف شوند؟ این کار قابل بازگشت نیست."
            )
        );
        if (!confirmed) return;

        setDeleting(true);
        setError("");
        try {
            await deleteAccount();
            logout();
            navigate("/");
        } catch (err) {
            setError(
                err.message ||
                    translate("Unable to delete account.", "حساب ړنګ نه شو.", "حساب حذف نشد.")
            );
        } finally {
            setDeleting(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <section className="relative z-0 page-shell max-w-3xl">
                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
                    <div className="hero-pad bg-gradient-to-r from-blue-700 via-blue-500 to-sky-400 text-center text-white">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/40 bg-white/15 text-2xl tracking-widest">
                            BK
                        </div>
                        <p className="mt-5 text-xs uppercase tracking-[0.4em] text-white/70">
                            {translate("Provider profile", "د خدمت پروفایل", "پروفایل ارائه‌دهنده")}
                        </p>
                        <h1 className="mt-3 text-3xl font-semibold">
                            {translate("Sign in to view your profile", "د خپل پروفایل د لیدو لپاره ننوځئ", "برای دیدن پروفایل وارد شوید")}
                        </h1>
                    </div>
                    <div className="space-y-6 px-5 py-8 text-center sm:px-8 sm:py-10">
                        <p className="text-base text-slate-500">
                            {translate(
                                "Your name, organization, and account status are available after you log in.",
                                "ستاسې نوم، اداره او د حساب حالت به وروسته له ننوتلو ښکاره شي.",
                                "نام، اداره و وضعیت حساب پس از ورود نمایش داده می‌شود."
                            )}
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <NavLink
                                to="/login"
                                className="rounded-full border border-blue-600 px-7 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-blue-600 transition hover:bg-blue-50"
                            >
                                {translate("Log in", "ننوتل", "ورود")}
                            </NavLink>
                            <NavLink
                                to="/signup"
                                className="rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-white shadow-lg transition hover:bg-blue-700"
                            >
                                {translate("Register", "راجستر شئ", "ثبت‌نام")}
                            </NavLink>
                        </div>
                        <div className="border-t border-slate-100 pt-6">
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                                {translate("Appearance", "بڼه", "ظاهر")}
                            </p>
                            <div className="mt-4 flex justify-center">
                                <ThemeToggle variant="chips" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const fields = [
        {
            label: translate("Full name", "بشپړ نوم", "نام کامل"),
            value: profile?.fullName || "—",
        },
        {
            label: translate("Organization", "اداره", "اداره"),
            value: profile?.organization || translate("Not set", "نښې ندي", "ثبت نشده"),
        },
        {
            label: translate("Email", "بریښنالیک", "ایمیل"),
            value: profile?.email || "—",
            href: profile?.email ? `mailto:${profile.email}` : undefined,
        },
        {
            label: translate("Phone", "تلیفون", "تلفن"),
            value: profile?.phoneNumber || "—",
            href: profile?.phoneNumber ? `tel:${profile.phoneNumber}` : undefined,
        },
        {
            label: translate("Member since", "غړی له", "عضو از"),
            value: formatDate(profile?.createdAt),
        },
    ];

    const accountStatus = profile?.status || "pending";
    const statusLabel =
        accountStatus === "active"
            ? translate("Active", "فعال", "فعال")
            : accountStatus === "suspended"
            ? translate("Suspended", "ځنډول شوی", "معلق")
            : translate("Pending", "په تمه", "در انتظار");

    return (
        <section className="relative z-0 page-shell max-w-5xl">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-500 to-sky-400 px-5 pb-12 pt-8 text-white shadow-2xl sm:px-8 sm:pb-16 sm:pt-10">
                <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-sky-300/20" />
                <p className="relative text-xs uppercase tracking-[0.42em] text-white/70">
                    {translate("Your account", "ستاسې حساب", "حساب شما")}
                </p>
                <div className="relative mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-white/30 bg-white/15 text-2xl tracking-[0.2em] shadow-lg backdrop-blur sm:h-24 sm:w-24 sm:text-3xl">
                            {getInitials(profile?.fullName)}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-2xl font-semibold leading-tight sm:text-3xl md:text-4xl">
                                {profile?.fullName || translate("Provider profile", "د خدمت پروفایل", "پروفایل ارائه‌دهنده")}
                            </h1>
                            <p className="mt-2 text-base text-white/85">
                                {profile?.organization ||
                                    translate(
                                        "Manage your provider account details.",
                                        "د خپل خدمت حساب جزئیات اداره کړئ.",
                                        "جزئیات حساب ارائه‌دهنده را مدیریت کنید."
                                    )}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] ring-1 ${statusTone(accountStatus)}`}>
                            {statusLabel}
                        </span>
                        <span
                            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] ring-1 ${
                                profile?.emailVerified
                                    ? "bg-white/90 text-blue-700 ring-white"
                                    : "bg-white/15 text-white ring-white/30"
                            }`}
                        >
                            {profile?.emailVerified
                                ? translate("Email verified", "بریښنالیک تایید شوی", "ایمیل تأیید شده")
                                : translate("Email not verified", "بریښنالیک نه دی تایید شوی", "ایمیل تأیید نشده")}
                        </span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="mt-8 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500 shadow-lg">
                    {translate("Loading profile...", "پروفایل لوستل کېږي...", "در حال بارگذاری پروفایل...")}
                </div>
            ) : null}

            {error ? (
                <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-red-700">
                    {error}
                </div>
            ) : null}

            {!loading ? (
                <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl sm:p-7">
                        <p className="text-xs uppercase tracking-[0.35em] text-blue-500">
                            {translate("Account details", "د حساب جزئیات", "جزئیات حساب")}
                        </p>
                        <dl className="mt-5 divide-y divide-slate-100">
                            {fields.map((field) => (
                                <div key={field.label} className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                                    <dt className="text-xs uppercase tracking-[0.28em] text-slate-400">{field.label}</dt>
                                    <dd className="break-all text-base font-semibold text-slate-900 sm:text-end">
                                        {field.href ? (
                                            <a className="text-blue-600 transition hover:underline" href={field.href}>
                                                {field.value}
                                            </a>
                                        ) : (
                                            field.value
                                        )}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                        <div className="mt-6 border-t border-slate-100 pt-6">
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                                {translate("Appearance", "بڼه", "ظاهر")}
                            </p>
                            <p className="mt-2 text-sm text-slate-500">
                                {translate(
                                    "Choose light or dark for this device.",
                                    "د دې وسیلې لپاره روښانه یا تیاره وټاکئ.",
                                    "برای این دستگاه روشن یا تیره را انتخاب کنید."
                                )}
                            </p>
                            <div className="mt-4">
                                <ThemeToggle variant="chips" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-[2rem] border border-transparent bg-gradient-to-br from-blue-600 to-blue-400 p-2 shadow-2xl">
                            <div className="rounded-[1.6rem] bg-white/10 p-6 text-white">
                                <p className="text-xs uppercase tracking-[0.35em] text-white/70">
                                    {translate("Quick actions", "چټک کړنې", "اقدامات سریع")}
                                </p>
                                <p className="mt-3 text-sm text-white/80">
                                    {translate(
                                        "Jump back to your registry or sign out of this device.",
                                        "خپل لست ته ورشئ یا له دې وسیلې څخه ووځئ.",
                                        "به فهرست خود برگردید یا از این دستگاه خارج شوید."
                                    )}
                                </p>
                                <div className="mt-6 flex flex-col gap-3">
                                    <NavLink
                                        to="/"
                                        className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-blue-700 transition hover:-translate-y-0.5"
                                    >
                                        {translate("My contacts", "زما اړیکې", "تماس‌های من")}
                                    </NavLink>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="inline-flex items-center justify-center rounded-2xl border border-white/50 px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-white/10"
                                    >
                                        {translate("Logout", "وتل", "خروج")}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-red-100 bg-red-50/80 p-6">
                            <p className="text-xs uppercase tracking-[0.35em] text-red-500">
                                {translate("Danger zone", "خطرناکه برخه", "ناحیه خطر")}
                            </p>
                            <p className="mt-3 text-sm leading-relaxed text-red-700/80">
                                {translate(
                                    "Deleting your account removes your profile and every emergency number you added.",
                                    "د حساب ړنګول ستاسې پروفایل او ټول هغه بیړني شمېرې چې تاسې اضافه کړي دي پاکوي.",
                                    "حذف حساب، پروفایل و تمام شماره‌های اضطراری اضافه‌شده را پاک می‌کند."
                                )}
                            </p>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-red-300 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                            >
                                {deleting
                                    ? translate("Deleting...", "ړنګېږي...", "در حال حذف...")
                                    : translate("Delete account", "حساب ړنګ کړئ", "حذف حساب")}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
};
