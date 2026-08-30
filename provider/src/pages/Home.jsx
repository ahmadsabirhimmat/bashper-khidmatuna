import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { deleteProviderProfile, fetchMyProviders } from "../api/providers";
import { resolveImageUrl } from "../api/http";

const serviceLabels = {
    hospital: { en: "Hospital", ps: "روغتون", dr: "شفاخانه" },
    firefighters: { en: "Firefighters", ps: "اور وژونکي", dr: "آتش‌نشانی" },
    ambulance: { en: "Ambulance", ps: "امبولانس", dr: "امبولانس" },
    police: { en: "Police", ps: "پولیس", dr: "پولیس" },
    rescue: { en: "Search & Rescue", ps: "لټون او ژغورنه", dr: "جستجو و نجات" },
    clinic: { en: "Clinic / Primary", ps: "کلینیک", dr: "کلینیک" },
    pharmacy: { en: "Pharmacy", ps: "درملتون", dr: "داروخانه" },
    ngo: { en: "NGO / Aid", ps: "مرستندویه اداره", dr: "موسسه امدادی" },
};

const statusLabels = {
    approved: { en: "Approved", ps: "تایید شو" },
    pending: { en: "Pending", ps: "په تمه" },
    rejected: { en: "Rejected", ps: "رد شو" },
};

const statusClass = (status) => {
    if (status === "approved") return "bg-emerald-50 text-emerald-600";
    if (status === "pending") return "bg-amber-50 text-amber-600";
    return "bg-red-50 text-red-500";
};

const ProviderThumb = ({ src, alt }) => {
    const box = "h-20 w-20 shrink-0 rounded-2xl";
    const resolved = resolveImageUrl(src);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setFailed(false);
    }, [resolved]);

    if (resolved && !failed) {
        return (
            <img
                src={resolved}
                alt={alt}
                className={`${box} border border-slate-200 object-cover`}
                onError={() => setFailed(true)}
            />
        );
    }
    return (
        <div
            className={`${box} flex items-center justify-center border border-dashed border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-400`}
            aria-hidden="true"
        >
            —
        </div>
    );
};

export const Home = () => {
    const { translate } = useLanguage();
    const { isAuthenticated } = useAuth();
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const loadProviders = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await fetchMyProviders();
            setProviders(data || []);
        } catch (err) {
            setError(err.message || "Unable to load providers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadProviders();
        }
    }, [isAuthenticated]);

    const handleDelete = async (providerId) => {
        const confirmed = window.confirm(
            translate(
                "Delete this provider from the emergency registry?",
                "ایا غواړئ دا خدمت له لست څخه پاک کړئ؟"
            )
        );
        if (!confirmed) {
            return;
        }

        try {
            setStatusMessage(translate("Removing contact...", "اړیکه حذف کېږي..."));
            await deleteProviderProfile(providerId);
            setStatusMessage(translate("Contact removed", "اړیکه حذف شوه"));
            loadProviders();
        } catch (err) {
            setStatusMessage(err.message || translate("Unable to remove contact", "اړیکه حذف نه شوه"));
        }
    };

    const renderActions = (provider, compact = false) => (
        <div className={`flex items-center gap-1.5 text-xs font-semibold uppercase ${compact ? "flex-nowrap" : "flex-wrap gap-2"}`}>
            <NavLink
                to={`/viewcontact/${provider._id}`}
                className={`shrink-0 whitespace-nowrap rounded-full border border-blue-600 tracking-wide text-blue-600 transition hover:bg-blue-50 ${
                    compact ? "px-3 py-1.5" : "px-4 py-2"
                }`}
            >
                {translate("View", "کتل")}
            </NavLink>
            <NavLink
                to={`/editcontact/${provider._id}`}
                className={`shrink-0 whitespace-nowrap rounded-full border border-yellow-500 tracking-wide text-yellow-600 transition hover:bg-yellow-50 ${
                    compact ? "px-3 py-1.5" : "px-4 py-2"
                }`}
            >
                {translate("Edit", "سمول")}
            </NavLink>
            <button
                type="button"
                onClick={() => handleDelete(provider._id)}
                className={`shrink-0 whitespace-nowrap rounded-full border border-red-500 tracking-wide text-red-500 transition hover:bg-red-50 ${
                    compact ? "px-3 py-1.5" : "px-4 py-2"
                }`}
            >
                {translate("Delete", "ړنګول")}
            </button>
        </div>
    );

    if (!isAuthenticated) {
        return (
            <section className="page-shell max-w-4xl text-center">
                <p className="text-xs uppercase tracking-[0.4em] text-blue-500">
                    {translate("Provider access required", "د خدمت لاس رسی اړین دی")}
                </p>
                <h1 className="mt-4 text-2xl font-semibold text-slate-900 sm:text-3xl">
                    {translate("Sign in to view your emergency contacts", "د خپلو بیړنیو اړیکو د لیدو لپاره ننوځئ")}
                </h1>
                <p className="mt-3 text-base text-slate-500">
                    {translate(
                        "Only authenticated providers can view and manage their registry entries.",
                        "یوازې تصدیق شوي خدمت کوونکي کولی شي خپل معلومات وګوري او سم کړي."
                    )}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <NavLink
                        to="/login"
                        className="rounded-full border border-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 transition hover:bg-blue-50"
                    >
                        {translate("Log in", "ننوتل")}
                    </NavLink>
                    <NavLink
                        to="/signup"
                        className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-blue-700"
                    >
                        {translate("Register", "راجستر شئ")}
                    </NavLink>
                </div>
            </section>
        );
    }

    const emptyCopy = translate(
        "No contacts yet. Add your first emergency number to get started.",
        "تر اوسه هیڅ اړیکه نشته. د پیل لپاره خپل لومړنی بیړنی شمېره اضافه کړئ.",
        "هنوز تماسی نیست. برای شروع اولین شماره اضطراری را اضافه کنید."
    );

    return (
        <section className="page-shell max-w-7xl">
            <div className="hero-pad rounded-3xl bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-xl">
                <p className="text-xs uppercase tracking-[0.4em] text-white/70 sm:text-sm">
                    {translate("Emergency Directory", "د بیړنۍ اړیکو لست")}
                </p>
                <h1 className="mt-4 text-2xl font-semibold leading-tight sm:text-4xl md:text-5xl">
                    {translate("All service providers, one command center.", "ټول خدماتي برابرونکي، یو واحد قوماندې مرکز.")}
                </h1>
                <p className="mt-4 max-w-3xl text-sm text-white/80 sm:text-base">
                    {translate(
                        "Manage and monitor every hospital, fire crew, ambulance fleet, and support partner from one place. Keep data fresh so communities get the help they need immediately.",
                        "هر روغتون، د اور وژنې ټیمونه، امبولانسونه او نورو ملاتړ کوونکو ته له یوه ځایه څارنه وکړئ. معلومات تازه وساتئ څو ټولنې په بیړه مرسته ترلاسه کړي."
                    )}
                </p>
                <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
                    <NavLink
                        to="/addcontact"
                        className="inline-flex items-center rounded-full bg-white px-5 py-3 text-xs font-semibold uppercase tracking-widest text-blue-700 transition hover:-translate-y-0.5 sm:px-6 sm:text-sm"
                    >
                        {translate("Add Contact", "نوی اړیکه")}
                    </NavLink>
                    <NavLink
                        to="/about"
                        className="inline-flex items-center rounded-full border border-white/50 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-white/10 sm:px-6 sm:text-sm"
                    >
                        {translate("Learn More", "نور معلومات")}
                    </NavLink>
                </div>
            </div>

            <div className="mt-10 space-y-4 sm:mt-12">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.35em] text-blue-500">
                            {translate("Provider Registry", "د خدماتو ثبت")}
                        </p>
                        <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                            {translate("Active emergency partners", "فعال بیړني همکاران")}
                        </h2>
                    </div>
                    <NavLink
                        to="/addcontact"
                        className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700"
                    >
                        {translate("Add Contact", "نوی اړیکه")}
                    </NavLink>
                </div>

                {loading ? (
                    <p className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-500 shadow">
                        {translate("Loading providers...", "خدمتونه درلودل کېږي...", "در حال بارگذاری خدمات...")}
                    </p>
                ) : null}

                {!loading && error ? (
                    <p className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-500">
                        {error}
                    </p>
                ) : null}

                {!loading && !error && providers.length === 0 ? (
                    <p className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-500 shadow">
                        {emptyCopy}
                    </p>
                ) : null}

                {!loading && !error && providers.length > 0 ? (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 xl:hidden">
                            {providers.map((provider) => {
                                const label = serviceLabels[provider.serviceType] || {
                                    en: provider.serviceType,
                                    ps: provider.serviceType,
                                };
                                return (
                                    <article
                                        key={provider._id}
                                        className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-md sm:p-5"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-start gap-3">
                                                <ProviderThumb
                                                    src={provider.imageUrl}
                                                    alt={provider.organizationName}
                                                />
                                                <div className="min-w-0">
                                                    <h3 className="truncate text-lg font-semibold text-slate-900">
                                                        {provider.organizationName}
                                                    </h3>
                                                    {provider.organizationNameLocal ? (
                                                        <p className="truncate text-sm text-slate-600" dir="auto">
                                                            {provider.organizationNameLocal}
                                                        </p>
                                                    ) : null}
                                                    <p className="text-sm text-slate-500">{translate(label.en, label.ps, label.dr)}</p>
                                                </div>
                                            </div>
                                            <span
                                                className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${statusClass(
                                                    provider.status
                                                )}`}
                                            >
                                                {translate(
                                                    statusLabels[provider.status]?.en || provider.status,
                                                    statusLabels[provider.status]?.ps || provider.status
                                                )}
                                            </span>
                                        </div>
                                        <dl className="mt-4 space-y-2 text-sm">
                                            <div className="flex justify-between gap-3">
                                                <dt className="text-slate-400">{translate("Location", "ځای")}</dt>
                                                <dd className="max-w-[65%] break-words text-end text-slate-700">
                                                    {provider.location}
                                                </dd>
                                            </div>
                                            <div className="flex justify-between gap-3">
                                                <dt className="text-slate-400">{translate("Contact", "اړیکه")}</dt>
                                                <dd className="max-w-[65%] text-end">
                                                    <a href={`tel:${provider.phoneNumber}`} className="font-semibold text-blue-600">
                                                        {provider.phoneNumber}
                                                    </a>
                                                    {provider.altPhoneNumber ? (
                                                        <a
                                                            href={`tel:${provider.altPhoneNumber}`}
                                                            className="mt-1 block text-blue-500"
                                                        >
                                                            {provider.altPhoneNumber}
                                                        </a>
                                                    ) : null}
                                                </dd>
                                            </div>
                                            <div className="flex justify-between gap-3">
                                                <dt className="text-slate-400">{translate("Availability", "شتون")}</dt>
                                                <dd className="max-w-[65%] break-words text-end text-blue-600">
                                                    {provider.availability || translate("Not set", "نښې ندي")}
                                                </dd>
                                            </div>
                                        </dl>
                                        <div className="mt-4">{renderActions(provider)}</div>
                                    </article>
                                );
                            })}
                        </div>

                        <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl xl:block">
                            <table className="w-full table-fixed divide-y divide-slate-200 text-start">
                                <colgroup>
                                    <col className="w-[11%]" />
                                    <col className="w-[13%]" />
                                    <col className="w-[10%]" />
                                    <col className="w-[11%]" />
                                    <col className="w-[13%]" />
                                    <col className="w-[10%]" />
                                    <col className="w-[12%]" />
                                    <col className="w-[20%]" />
                                </colgroup>
                                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3.5 text-start">{translate("Image", "انځور", "تصویر")}</th>
                                        <th className="px-4 py-3.5 text-start">{translate("Provider", "خدمت کوونکی")}</th>
                                        <th className="px-4 py-3.5 text-start">{translate("Service", "خدمت")}</th>
                                        <th className="px-4 py-3.5 text-start">{translate("Location", "ځای")}</th>
                                        <th className="px-4 py-3.5 text-start">{translate("Contact", "اړیکه")}</th>
                                        <th className="px-4 py-3.5 text-start">{translate("Availability", "شتون")}</th>
                                        <th className="px-4 py-3.5 text-start">{translate("Status", "حالت")}</th>
                                        <th className="px-4 py-3.5 text-start">{translate("Actions", "عملیات")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                    {providers.map((provider) => {
                                        const label = serviceLabels[provider.serviceType] || {
                                            en: provider.serviceType,
                                            ps: provider.serviceType,
                                            dr: provider.serviceType,
                                        };
                                        return (
                                            <tr key={provider._id} className="align-middle">
                                                <td className="px-4 py-4 align-middle">
                                                    <ProviderThumb src={provider.imageUrl} alt={provider.organizationName} />
                                                </td>
                                                <td className="px-4 py-4 align-middle">
                                                    <p className="truncate font-semibold text-slate-900" title={provider.organizationName}>
                                                        {provider.organizationName}
                                                    </p>
                                                    {provider.organizationNameLocal ? (
                                                        <p
                                                            className="truncate text-xs text-slate-500"
                                                            dir="auto"
                                                            title={provider.organizationNameLocal}
                                                        >
                                                            {provider.organizationNameLocal}
                                                        </p>
                                                    ) : null}
                                                    <p className="mt-0.5 text-xs tracking-wide text-slate-400">
                                                        #{provider._id.slice(-4).toUpperCase()}
                                                    </p>
                                                </td>
                                                <td className="truncate px-4 py-4 align-middle font-medium text-slate-900">
                                                    {translate(label.en, label.ps, label.dr)}
                                                </td>
                                                <td className="px-4 py-4 align-middle text-slate-600">
                                                    <span className="block truncate" title={provider.location}>
                                                        {provider.location}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 align-middle">
                                                    <a
                                                        href={`tel:${provider.phoneNumber}`}
                                                        dir="ltr"
                                                        className="block truncate font-semibold text-blue-600"
                                                    >
                                                        {provider.phoneNumber}
                                                    </a>
                                                    {provider.altPhoneNumber ? (
                                                        <a
                                                            href={`tel:${provider.altPhoneNumber}`}
                                                            dir="ltr"
                                                            className="mt-1 block truncate text-sm text-blue-500"
                                                        >
                                                            {provider.altPhoneNumber}
                                                        </a>
                                                    ) : null}
                                                </td>
                                                <td className="px-4 py-4 align-middle">
                                                    <span
                                                        className="inline-block max-w-full truncate rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600"
                                                        title={provider.availability || undefined}
                                                    >
                                                        {provider.availability || translate("Not set", "نښې ندي")}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 align-middle">
                                                    <span
                                                        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                                                            provider.status
                                                        )}`}
                                                    >
                                                        {translate(
                                                            statusLabels[provider.status]?.en || provider.status,
                                                            statusLabels[provider.status]?.ps || provider.status
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 align-middle">
                                                    {renderActions(provider, true)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : null}

                {statusMessage ? <p className="mt-4 text-center text-sm text-slate-500">{statusMessage}</p> : null}
            </div>
        </section>
    );
};
