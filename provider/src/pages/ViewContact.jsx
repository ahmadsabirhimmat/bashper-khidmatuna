import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { getProviderById } from "../api/providers";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { districtLabel } from "../data/serviceOptions";

const serviceLabels = {
    hospital: { en: "Hospital", ps: "روغتون", dr: "شفاخانه" },
    firefighters: { en: "Firefighters", ps: "اور وژونکي", dr: "آتش‌نشانی" },
    ambulance: { en: "Ambulance", ps: "امبولانس", dr: "امبولانس" },
    police: { en: "Police", ps: "پولیس", dr: "پولیس" },
    rescue: { en: "Search & Rescue", ps: "لټون او ژغورنه", dr: "جستجو و نجات" },
    clinic: { en: "Clinic", ps: "کلینیک", dr: "کلینیک" },
    pharmacy: { en: "Pharmacy", ps: "درملتون", dr: "داروخانه" },
    ngo: { en: "NGO / Aid", ps: "مرستندویه اداره", dr: "موسسه امدادی" },
};

export const ViewContact = () => {
    const { id } = useParams();
    const { translate, language } = useLanguage();
    const { isAuthenticated } = useAuth();
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        const loadProvider = async () => {
            try {
                setLoading(true);
                const data = await getProviderById(id);
                setProvider(data);
            } catch (err) {
                if (err.status === 401 || err.status === 403) {
                    setError(translate("You are not authorized to view this contact", "تاسو د دې اړیکې د کتلو اجازه نه لرئ"));
                } else {
                    setError(err.message || translate("Provider not found", "خدمت ونه موندل شو"));
                }
            } finally {
                setLoading(false);
            }
        };

        loadProvider();
    }, [id, translate, isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <section className="page-shell flex max-w-4xl flex-col items-center gap-6 text-center">
                <p className="text-xs uppercase tracking-[0.4em] text-blue-500">{translate("Secure access required", "امن لاس رسی اړین دی")}</p>
                <h1 className="text-3xl font-semibold text-slate-900">{translate("Sign in to view provider details", "د معلوماتو د کتلو لپاره ننوځئ")}</h1>
                <NavLink
                    to="/login"
                    className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-md transition hover:bg-blue-700"
                >
                    {translate("Go to login", "ننوتل ته لاړ شئ")}
                </NavLink>
            </section>
        );
    }

    if (loading) {
        return (
            <section className="page-shell flex max-w-4xl items-center justify-center text-slate-500">
                {translate("Loading provider...", "خدمت درلودل کېږي...")}
            </section>
        );
    }

    if (error || !provider) {
        return (
            <section className="page-shell flex max-w-4xl flex-col items-center gap-6 text-center">
                <p className="text-sm uppercase tracking-[0.4em] text-slate-400">{translate("Provider Lookup", "د خدمت پلټنه")}</p>
                <h1 className="text-3xl font-semibold text-slate-900">{translate("Record not found", "ریکارډ ونه موندل شو")}</h1>
                <p className="text-slate-500">{error || translate("Please select a valid provider from the registry.", "مهرباني وکړئ له لست څخه یو معتبر خدمت وټاکئ.")}</p>
                <NavLink
                    to="/"
                    className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-md transition hover:bg-blue-700"
                >
                    {translate("Back to Home", "بېرته کور ته")}
                </NavLink>
            </section>
        );
    }

    const serviceLabel = serviceLabels[provider.serviceType] || {
        en: provider.serviceType,
        ps: provider.serviceType,
    };

    return (
        <section className="page-shell max-w-5xl">
            <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-blue-500">{translate("Provider Profile", "د خدمت پروفایل")}</p>
                    <h1 className="break-words text-2xl font-semibold text-slate-900 sm:text-3xl">{provider.organizationName}</h1>
                    {provider.organizationNameLocal ? (
                        <p className="mt-1 break-words text-lg text-slate-600" dir="auto">
                            {provider.organizationNameLocal}
                        </p>
                    ) : null}
                    <p className="text-sm uppercase tracking-[0.4em] text-slate-400">{translate(serviceLabel.en, serviceLabel.ps, serviceLabel.dr)}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <NavLink
                        to={`/editcontact/${provider._id}`}
                        className="rounded-full border border-yellow-500 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-yellow-600 transition hover:bg-yellow-50"
                    >
                        {translate("Edit Contact", "اړیکه سم کړئ")}
                    </NavLink>
                    <NavLink
                        to="/"
                        className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:bg-slate-50"
                    >
                        {translate("Back to Dashboard", "بېرته ډشبورډ ته")}
                    </NavLink>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <div className="form-card rounded-3xl border border-slate-200 bg-white shadow-xl">
                    <div className="flex flex-col gap-6">
                        <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{translate("Primary Contact", "اصلي اړیکه")}</p>
                            <div className="mt-2 space-y-1 text-slate-800">
                                <p className="text-lg font-semibold">{provider.phoneNumber}</p>
                                {provider.altPhoneNumber ? (
                                    <p className="text-base text-slate-600">{provider.altPhoneNumber}</p>
                                ) : null}
                                <p className="text-sm text-slate-500">{provider.email || translate("No email provided", "بریښنالیک نشته")}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{translate("Location", "ځای", "موقعیت")}</p>
                            <p className="mt-2 text-base font-medium text-slate-800">{provider.location}</p>
                            {provider.district ? (
                                <p className="mt-1 text-sm text-slate-500">{districtLabel(provider.district, language)}</p>
                            ) : null}
                            {provider.imageUrl ? (
                                <img
                                    src={provider.imageUrl}
                                    alt={provider.organizationName}
                                    className="mt-4 h-40 w-full rounded-2xl object-cover"
                                />
                            ) : null}
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{translate("Availability", "شتون")}</p>
                            <p className="mt-2 inline-flex items-center rounded-full bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-blue-600">
                                {provider.availability || translate("Not set", "نښې ندي")}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{translate("Capabilities", "وړتیاوې")}</p>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">{provider.description || translate("No description provided", "تشریح نشته")}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-transparent bg-gradient-to-br from-blue-600 to-blue-400 p-2 shadow-2xl">
                    <div className="flex h-full flex-col justify-between rounded-[26px] bg-white/10 p-6 text-white">
                        <div className="space-y-4">
                            <p className="text-xs uppercase tracking-[0.4em] text-white/70">{translate("Rapid coordination", "چټکه همغږي")}</p>
                            <p className="text-white/85">
                                {translate(
                                    "Keep this provider mobilized faster with the quick reference details below. Dispatchers can launch a call or message instantly.",
                                    "د لاندې تفصيلي معلوماتو په مرسته د خدمت چټک فعالول ممکن کړئ. قوماندې ډلې سملاسي اړیکه نیولی شي."
                                )}
                            </p>
                            <div className="rounded-2xl bg-white/10 p-4 text-sm">
                                <p className="text-xs uppercase tracking-[0.35em] text-white/70">{translate("Primary line", "اصلي کرښه")}</p>
                                <p className="mt-1 text-lg font-semibold tracking-wide">{provider.phoneNumber}</p>
                                <p className="text-sm text-white/80">{provider.email || translate("No email", "بریښنالیک نشته")}</p>
                            </div>
                            <div className="rounded-2xl bg-white/10 p-4 text-sm">
                                <p className="text-xs uppercase tracking-[0.35em] text-white/70">{translate("Location & availability", "ځای او شتون")}</p>
                                <p className="mt-1 text-sm text-white/85">{provider.location}</p>
                                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                                    {provider.availability || translate("Not set", "نښې ندي")}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 space-y-3 text-sm">
                            <p className="text-xs uppercase tracking-[0.4em] text-white/70">{translate("Dispatch actions", "د اعزام کړنې")}</p>
                            <div className="flex flex-wrap gap-3">
                                <a
                                    href={`tel:${provider.phoneNumber}`}
                                    className="inline-flex flex-1 items-center justify-center rounded-2xl bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-blue-600 transition hover:-translate-y-0.5"
                                >
                                    {translate("Call Now", "اوس زنګ ووهئ")}
                                </a>
                                <a
                                    href={provider.email ? `mailto:${provider.email}` : undefined}
                                    aria-disabled={!provider.email}
                                    className={`inline-flex flex-1 items-center justify-center rounded-2xl border border-white/60 px-4 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white transition ${
                                        provider.email ? "hover:bg-white/10" : "cursor-not-allowed opacity-60"
                                    }`}
                                >
                                    {translate("Send Email", "بریښنالیک واستوئ")}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};