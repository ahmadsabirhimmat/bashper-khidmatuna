import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { getProviderById, updateProviderProfile } from "../api/providers";
import { resolveImageUrl } from "../api/http";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { KANDAHAR_DISTRICTS, SERVICE_TYPES, districtLabel } from "../data/serviceOptions";
import { buildProviderFormData } from "../utils/providerForm";
import { ALLOWED_IMAGE_ACCEPT, validateProviderImage } from "../utils/imageValidation";

const emptyProvider = {
    organizationName: "",
    organizationNameLocal: "",
    serviceType: "hospital",
    phoneNumber: "",
    altPhoneNumber: "",
    email: "",
    location: "",
    district: "",
    imageUrl: "",
    availability: "",
    description: "",
};

export const EditContact = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { translate, language } = useLanguage();
    const { isAuthenticated } = useAuth();
    const [formData, setFormData] = useState(emptyProvider);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [removeImage, setRemoveImage] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [error, setError] = useState("");

    const serviceLabel = (item) => {
        if (language === "ps") return item.ps;
        if (language === "dr") return item.dr;
        return item.en;
    };

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        const loadProvider = async () => {
            try {
                setLoading(true);
                const provider = await getProviderById(id);
                setFormData({
                    organizationName: provider.organizationName || "",
                    organizationNameLocal: provider.organizationNameLocal || "",
                    serviceType: provider.serviceType || "hospital",
                    phoneNumber: provider.phoneNumber || "",
                    altPhoneNumber: provider.altPhoneNumber || "",
                    email: provider.email || "",
                    location: provider.location || "",
                    district: provider.district || "",
                    imageUrl: provider.imageUrl || "",
                    availability: provider.availability || "",
                    description: provider.description || "",
                });
                setImagePreview(resolveImageUrl(provider.imageUrl || ""));
                setImageFile(null);
                setRemoveImage(false);
            } catch (err) {
                if (err.status === 401 || err.status === 403) {
                    setError(
                        translate(
                            "You are not authorized to edit this contact",
                            "تاسو د دې اړیکې د سمولو اجازه نه لرئ",
                            "شما اجازه ویرایش این تماس را ندارید"
                        )
                    );
                } else {
                    setError(
                        err.message ||
                            translate("Unable to load provider", "اړیکه ونه موندل شوه", "بارگذاری خدمت ممکن نشد")
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        loadProvider();
    }, [id, translate, isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <section className="page-shell flex max-w-5xl flex-col items-center gap-4 text-center">
                <p className="text-lg font-semibold text-slate-900">
                    {translate("Sign in required", "ننوتل اړین دي", "ورود لازم است")}
                </p>
                <NavLink
                    to="/login"
                    className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg"
                >
                    {translate("Go to login", "ننوتل ته لاړ شئ", "رفتن به ورود")}
                </NavLink>
            </section>
        );
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const result = validateProviderImage(file, translate);
        if (!result.ok) {
            setFeedback(result.message);
            event.target.value = "";
            return;
        }

        setFeedback("");
        setRemoveImage(false);
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview("");
        setRemoveImage(Boolean(formData.imageUrl));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setFeedback("");
        try {
            const payload = buildProviderFormData({
                fields: {
                    organizationName: formData.organizationName,
                    organizationNameLocal: formData.organizationNameLocal,
                    serviceType: formData.serviceType,
                    phoneNumber: formData.phoneNumber,
                    location: formData.location,
                    district: formData.district,
                    availability: formData.availability,
                    description: formData.description,
                    altPhoneNumber: formData.altPhoneNumber,
                    email: formData.email,
                },
                imageFile,
                removeImage: removeImage && !imageFile,
            });

            const updated = await updateProviderProfile(id, payload);
            setFeedback(translate("Contact updated", "اړیکه نوې شوه", "تماس به‌روزرسانی شد"));
            setTimeout(() => navigate(`/viewcontact/${updated._id}`), 600);
        } catch (err) {
            const message =
                typeof err?.message === "string" && err.message !== "[object Object]"
                    ? err.message
                    : translate("Unable to update", "نوی کول ممکن نه دي", "به‌روزرسانی ممکن نشد");
            setFeedback(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <section className="page-shell flex max-w-5xl items-center justify-center text-slate-500">
                {translate("Loading provider...", "خدمت درلودل کېږي...", "در حال بارگذاری...")}
            </section>
        );
    }

    if (error) {
        return (
            <section className="page-shell flex max-w-5xl flex-col items-center gap-4 text-center">
                <p className="text-lg font-semibold text-red-500">{error}</p>
                <NavLink
                    to="/"
                    className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-600"
                >
                    {translate("Back to dashboard", "بېرته ډشبورډ ته", "بازگشت به داشبورد")}
                </NavLink>
            </section>
        );
    }

    return (
        <section className="page-shell max-w-5xl">
            <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-blue-500">
                        {translate("Update provider", "خدمت نوي کړئ", "به‌روزرسانی خدمت")}
                    </p>
                    <h1 className="text-3xl font-semibold text-slate-900">
                        {translate("Edit emergency contact", "اړیکه سم کړئ", "ویرایش تماس اضطراری")}
                    </h1>
                </div>
                <NavLink
                    to={`/viewcontact/${id}`}
                    className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:bg-slate-50"
                >
                    {translate("View profile", "پروفایل وګورئ", "مشاهده پروفایل")}
                </NavLink>
            </div>

            <form onSubmit={handleSubmit} className="form-card rounded-3xl border border-slate-200 bg-white shadow-2xl">
                <div className="grid gap-6 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                        {translate(
                            "Organization / Service Name in English",
                            "د ادارې / خدمت نوم په انګلیسي",
                            "نام سازمان / خدمت به انگلیسی"
                        )}
                        <input
                            type="text"
                            name="organizationName"
                            value={formData.organizationName}
                            onChange={handleChange}
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                        {translate(
                            "Name in Pashto or Dari (optional)",
                            "نوم په پښتو یا دري (اختیاري)",
                            "نام به پشتو یا دری (اختیاری)"
                        )}
                        <input
                            type="text"
                            name="organizationNameLocal"
                            value={formData.organizationNameLocal}
                            onChange={handleChange}
                            dir="auto"
                            maxLength={160}
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                        <span className="text-xs font-normal text-slate-500">
                            {translate(
                                "Mobile users can find this contact by searching the English name or this Pashto/Dari name.",
                                "موبایل کارن به دا اړیکه په انګلیسي نوم یا په دې پښتو/دري نوم ولټوي.",
                                "کاربران موبایل می‌توانند این تماس را با نام انگلیسی یا این نام پشتو/دری پیدا کنند."
                            )}
                        </span>
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                        {translate("Service Type", "د خدمت ډول", "نوع خدمت")}
                        <select
                            name="serviceType"
                            value={formData.serviceType}
                            onChange={handleChange}
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                            required
                        >
                            {SERVICE_TYPES.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {serviceLabel(item)}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                        {translate("Contact Number", "د اړیکې شمېره", "شماره تماس")}
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                        {translate("Second Contact Number (optional)", "دوهمه اړیکه (اختیاري)", "شماره دوم (اختیاری)")}
                        <input
                            type="tel"
                            name="altPhoneNumber"
                            value={formData.altPhoneNumber}
                            onChange={handleChange}
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                        {translate("Email Address", "بریښنالیک", "ایمیل")}
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                        {translate("Kandahar District", "د کندهار ولسوالۍ", "ولسوالی کندهار")}
                        <select
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">{translate("Select district", "ولسوالۍ وټاکئ", "ولسوالی را انتخاب کنید")}</option>
                            {KANDAHAR_DISTRICTS.map((district) => (
                                <option key={district} value={district}>
                                    {districtLabel(district, language)}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                        {translate("Address / Landmark", "پته / نښه", "آدرس / نشانه")}
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                        {translate("Service image (optional)", "د خدمت انځور (اختیاري)", "تصویر خدمت (اختیاری)")}
                        <input
                            type="file"
                            accept={ALLOWED_IMAGE_ACCEPT}
                            onChange={handleImageChange}
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-500 focus:outline-none"
                        />
                        <span className="text-xs font-normal text-slate-500">
                            {translate(
                                "JPG, JPEG, JFIF, PNG, WEBP, or GIF only — the image size must be under 5 MB.",
                                "یوازې JPG، JPEG، JFIF، PNG، WEBP یا GIF — د انځور اندازه باید تر ۵ مېګابایټ لږه وي.",
                                "فقط JPG، JPEG، JFIF، PNG، WEBP یا GIF — حجم تصویر باید کمتر از ۵ مگابایت باشد."
                            )}
                        </span>
                        {imagePreview ? (
                            <div className="mt-2 flex flex-wrap items-center gap-4">
                                <img
                                    src={imagePreview}
                                    alt="Service"
                                    className="h-24 w-24 rounded-2xl border border-slate-200 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={clearImage}
                                    className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600"
                                >
                                    {translate("Remove", "لرې کړئ", "حذف")}
                                </button>
                            </div>
                        ) : null}
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                        {translate("Availability Window", "د شتون وخت", "ساعات دسترسی")}
                        <input
                            type="text"
                            name="availability"
                            value={formData.availability}
                            onChange={handleChange}
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                    </label>
                </div>
                <label className="mt-6 flex flex-col gap-2 text-sm font-medium text-slate-700">
                    {translate("Service Description / Notes", "د خدمت تشریح / یادښتونه", "توضیحات خدمت")}
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="rounded-3xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </label>
                <div className="mt-8 flex flex-wrap gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex flex-1 items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-60 sm:flex-none sm:px-10"
                    >
                        {saving
                            ? translate("Saving...", "د خوندي کېدو په حال کې...", "در حال ذخیره...")
                            : translate("Save Changes", "بدلونونه خوندي کړئ", "ذخیره تغییرات")}
                    </button>
                    <NavLink
                        to={`/viewcontact/${id}`}
                        className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:border-slate-400 hover:text-slate-700 sm:flex-none sm:px-10"
                    >
                        {translate("Cancel", "بند کړئ", "لغو")}
                    </NavLink>
                </div>
                {feedback && (
                    <p className="mt-4 text-center text-sm text-slate-500">{feedback}</p>
                )}
            </form>
        </section>
    );
};
