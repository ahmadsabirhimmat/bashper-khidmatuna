import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { fetchAboutOverview } from "../api/about";
import { SERVICE_TYPES, districtLabel } from "../data/serviceOptions";

const formatNumber = (value) => {
    const num = Number(value) || 0;
    return new Intl.NumberFormat("en-US").format(num);
};

const formatDate = (value) => {
    if (!value) return "—";
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
        hour12: true,
    }).format(new Date(value));
};

export const About = () => {
    const { translate, language } = useLanguage();
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");

        fetchAboutOverview({ signal: controller.signal })
            .then(setOverview)
            .catch((err) => {
                if (err.name === "AbortError") return;
                setError(
                    err.message ||
                        translate(
                            "Unable to load live directory stats.",
                            "ژوندي احصایې ونه لوستل شوې.",
                            "آمار زنده بارگذاری نشد."
                        )
                );
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [translate]);

    const serviceLabel = (type) => {
        const match = SERVICE_TYPES.find((item) => item.value === type);
        if (!match) return type;
        if (language === "ps") return match.ps;
        if (language === "dr") return match.dr;
        return match.en;
    };

    const stats = useMemo(() => {
        const totals = overview?.totals || {};
        return [
            {
                key: "approved",
                value: formatNumber(totals.approved),
                label: translate("Approved services", "تایید شوي خدمات", "خدمات تأییدشده"),
            },
            {
                key: "hospitals",
                value: formatNumber(totals.hospitals),
                label: translate("Hospitals onboarded", "راځول شوي روغتونونه", "شفاخانه‌های ثبت‌شده"),
            },
            {
                key: "fieldUnits",
                value: formatNumber(totals.fieldUnits),
                label: translate(
                    "Police / ambulance / fire / rescue",
                    "پولیس / امبولانس / اور وژنه / ژغورنه",
                    "پولیس / امبولانس / آتش‌نشانی / نجات"
                ),
            },
            {
                key: "districts",
                value: `${formatNumber(overview?.coverage?.districtsCovered || 0)}/${formatNumber(
                    overview?.coverage?.totalDistricts || 0
                )}`,
                label: translate("Kandahar districts covered", "پوش شوي کندهار ولسوالۍ", "ولسوالی‌های پوشش‌داده‌شده کندهار"),
            },
        ];
    }, [overview, translate]);

    const serviceBreakdown = useMemo(() => {
        const map = overview?.byServiceType || {};
        return SERVICE_TYPES.map((item) => ({
            ...item,
            count: map[item.value] || 0,
        })).filter((item) => item.count > 0);
    }, [overview]);

    return (
        <section className="page-shell max-w-6xl">
            <div className="hero-pad rounded-3xl bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 text-white shadow-2xl">
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                    {translate("About Bashper Khidmatuna", "د بشپر خدمتونو په اړه", "درباره بشپر خدمتونه")}
                </p>
                <h1 className="mt-4 text-2xl font-semibold leading-tight sm:text-4xl md:text-5xl">
                    {translate(
                        "Live Kandahar emergency directory powered by verified providers.",
                        "د کندهار ژوندی بیړنی لارښود چې د تایید شویو خدمتونو پر بنسټ دی.",
                        "راهنمای زنده اضطراری کندهار بر پایه خدمات تأییدشده."
                    )}
                </h1>
                <p className="mt-4 max-w-3xl text-white/85">
                    {translate(
                        "This page updates from the database whenever providers submit contacts and admins approve them. Numbers below reflect the current approved directory for Kandahar province.",
                        "دا پاڼه له ډیټابېس څخه تازه کېږي کله چې خدمتونه اړیکې وسپاري او اډمین یې تایید کړي. لاندې شمېرې د کندهار اوسنی تایید شوی لارښود ښيي.",
                        "این صفحه از پایگاه داده به‌روز می‌شود وقتی ارائه‌دهندگان تماس ثبت کنند و مدیر تأیید کند. اعداد زیر نشان‌دهنده راهنمای تأییدشده فعلی کندهار هستند."
                    )}
                </p>
                {overview?.generatedAt ? (
                    <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/70">
                        {translate("Last refreshed", "وروستی تازه کېدل", "آخرین به‌روزرسانی")}: {formatDate(overview.generatedAt)}
                    </p>
                ) : null}
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-950">
                <p className="font-semibold">
                    {translate("Emergency disclaimer", "د بیړني خدمت خبرتیا", "سلب مسئولیت اضطراری")}
                </p>
                <p className="mt-2">
                    {translate(
                        "This directory is not an official government emergency dispatch system. In a life-threatening emergency, call 119 (police) or 102 (ambulance).",
                        "دا لارښود د دولت رسمي بیړنی سیسټم نه دی. په ژوند ګواښونکې پېښه کې ۱۱۹ (پولیس) یا ۱۰۲ (امبولانس) ووهئ.",
                        "این راهنما سامانه رسمی اضطراری دولت نیست. در خطر جانی با ۱۱۹ (پولیس) یا ۱۰۲ (امبولانس) تماس بگیرید."
                    )}
                </p>
            </div>

            {loading ? (
                <div className="mt-12 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500 shadow-lg">
                    {translate("Loading live stats...", "ژوندي احصایې لوستل کېږي...", "در حال بارگذاری آمار زنده...")}
                </div>
            ) : null}

            {error ? (
                <div className="mt-12 rounded-3xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700 shadow-lg">
                    {error}
                </div>
            ) : null}

            {!loading && !error && overview ? (
                <>
                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat) => (
                            <div
                                key={stat.key}
                                className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-center shadow-lg"
                            >
                                <p className="text-3xl font-semibold text-blue-600">{stat.value}</p>
                                <p className="mt-2 text-xs uppercase tracking-[0.35em] text-slate-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 grid gap-6 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow">
                            <p className="text-2xl font-semibold text-slate-900">{formatNumber(overview.totals.pending)}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">
                                {translate("Pending review", "د بیاکتنې په تمه", "در انتظار بررسی")}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow">
                            <p className="text-2xl font-semibold text-slate-900">{formatNumber(overview.totals.pharmacies)}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">
                                {translate("Pharmacies", "درملتونونه", "داروخانه‌ها")}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow">
                            <p className="text-2xl font-semibold text-slate-900">{formatNumber(overview.totals.criticalLines)}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">
                                {translate("Offline critical lines", "بې انټرنېټ بیړني کرښې", "خطوط حیاتی آفلاین")}
                            </p>
                        </div>
                    </div>

                    <div className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-8">
                            <p className="text-xs uppercase tracking-[0.4em] text-blue-500">
                                {translate("Approved by service type", "د خدمت ډول له مخې تایید شوي", "تأییدشده بر اساس نوع خدمت")}
                            </p>
                            {serviceBreakdown.length ? (
                                <ul className="space-y-3">
                                    {serviceBreakdown.map((item) => (
                                        <li
                                            key={item.value}
                                            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                                        >
                                            <span className="min-w-0 break-words pe-3 font-medium text-slate-800">{serviceLabel(item.value)}</span>
                                            <span className="text-lg font-semibold text-blue-600">{formatNumber(item.count)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-500">
                                    {translate(
                                        "No approved services yet. Submit a contact to grow the directory.",
                                        "تر اوسه تایید شوي خدمات نشته. د لارښود د پراختیا لپاره اړیکه ثبت کړئ.",
                                        "هنوز خدمت تأییدشده‌ای نیست. برای گسترش راهنما یک تماس ثبت کنید."
                                    )}
                                </p>
                            )}
                        </div>

                        <div className="form-card rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-2xl">
                            <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                                {translate("District coverage", "د ولسوالیو پوښښ", "پوشش ولسوالی‌ها")}
                            </p>
                            <p className="mt-4 text-sm text-white/80">
                                {translate(
                                    "Approved contacts currently span these Kandahar districts:",
                                    "تایید شوي اړیکې اوس په دې کندهار ولسوالیو کې دي:",
                                    "تماس‌های تأییدشده فعلاً این ولسوالی‌های کندهار را پوشش می‌دهند:"
                                )}
                            </p>
                            <ul className="mt-6 max-h-80 space-y-3 overflow-y-auto text-sm">
                                {(overview.coverage?.districts || []).length ? (
                                    overview.coverage.districts.map((district) => (
                                        <li
                                            key={district.name}
                                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                                        >
                                            <span className="min-w-0 break-words pe-3">{districtLabel(district.name, language)}</span>
                                            <span className="font-semibold">{formatNumber(district.count)}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/70">
                                        {translate(
                                            "District tags will appear after providers select a Kandahar district.",
                                            "د ولسوالۍ نښې به وروسته له دې ښکاره شي چې خدمتونه ولسوالۍ وټاکي.",
                                            "برچسب ولسوالی پس از انتخاب ولسوالی توسط ارائه‌دهندگان ظاهر می‌شود."
                                        )}
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-14 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-8">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.35em] text-blue-500">
                                    {translate("Recently approved", "وروستي تایید شوي", "تازه‌تأییدشده‌ها")}
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                                    {translate(
                                        "Latest services published to the mobile app",
                                        "وروستي خدمات چې موبایل اپ ته خپاره شوي",
                                        "جدیدترین خدمات منتشرشده در اپ موبایل"
                                    )}
                                </h2>
                            </div>
                            <NavLink
                                to="/addcontact"
                                className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-md transition hover:bg-blue-700"
                            >
                                {translate("Add a service", "خدمت اضافه کړئ", "افزودن خدمت")}
                            </NavLink>
                        </div>

                        {(overview.recentApproved || []).length ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {overview.recentApproved.map((item) => (
                                    <article
                                        key={item.id}
                                        className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4"
                                    >
                                        <p className="text-lg font-semibold text-slate-900">{item.organizationName}</p>
                                        <p className="mt-1 text-sm text-blue-600">{serviceLabel(item.serviceType)}</p>
                                        <p className="mt-2 text-sm text-slate-600">
                                            {[districtLabel(item.district, language), item.location].filter(Boolean).join(" • ") ||
                                                translate("Location pending", "ځای نه دی ټاکل شوی", "موقعیت مشخص نشده")}
                                        </p>
                                        <p className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-400">
                                            {formatDate(item.updatedAt)}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">
                                {translate(
                                    "Approved contacts will show here after admin review.",
                                    "تایید شوي اړیکې به دلته وروسته له اډمین بیاکتنې ښکاره شي.",
                                    "تماس‌های تأییدشده پس از بررسی مدیر اینجا نمایش داده می‌شوند."
                                )}
                            </p>
                        )}
                    </div>
                </>
            ) : null}
        </section>
    );
};
