import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { createProviderProfile } from "../api/providers";
import { KANDAHAR_DISTRICTS, SERVICE_TYPES, districtLabel } from "../data/serviceOptions";
import { buildProviderFormData } from "../utils/providerForm";
import { ALLOWED_IMAGE_ACCEPT, validateProviderImage } from "../utils/imageValidation";

const initialFormData = {
    organizationName: "",
    organizationNameLocal: "",
    serviceType: "",
    phoneNumber: "",
    altPhoneNumber: "",
    email: "",
    location: "",
    district: "",
    availability: "",
    description: "",
};

export const AddContact = () => {
    const [formData, setFormData] = useState(initialFormData);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [feedbackError, setFeedbackError] = useState(false);
    const { translate, language } = useLanguage();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            setImageFile(null);
            setImagePreview("");
            return;
        }

        const result = validateProviderImage(file, translate);
        if (!result.ok) {
            setFeedbackError(true);
            setFeedback(result.message);
            event.target.value = "";
            setImageFile(null);
            setImagePreview("");
            return;
        }

        setFeedback("");
        setFeedbackError(false);
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setFeedback("");
        setFeedbackError(false);
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
            });

            const provider = await createProviderProfile(payload);
            setFeedbackError(false);
            setFeedback(
                translate(
                    "Provider submitted. Await approval before it becomes visible in the mobile app.",
                    "خدمت ثبت شو. تر تایید وروسته به په موبایل اپ کې ښکاره شي.",
                    "خدمت ثبت شد. پس از تأیید در اپلیکیشن موبایل نمایش داده می‌شود."
                )
            );
            setFormData(initialFormData);
            clearImage();
            setTimeout(() => {
                navigate(`/viewcontact/${provider._id}`);
            }, 600);
        } catch (error) {
            const message =
                typeof error?.message === "string" && error.message !== "[object Object]"
                    ? error.message
                    : translate("Unable to save contact", "اړیکه ثبت نه شوه", "ثبت تماس ممکن نشد");
            setFeedbackError(true);
            setFeedback(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData(initialFormData);
        clearImage();
    };

    const serviceLabel = (item) => {
        if (language === "ps") return item.ps;
        if (language === "dr") return item.dr;
        return item.en;
    };

    if (!isAuthenticated) {
        return (
            <section className="page-shell max-w-3xl text-center">
                <p className="text-xs uppercase tracking-[0.4em] text-blue-500">
                    {translate("Secure submission", "خوندي ثبت", "ثبت امن")}
                </p>
                <h1 className="mt-4 text-2xl font-semibold text-slate-900 sm:text-3xl">
                    {translate(
                        "Please register before adding contacts",
                        "مهرباني وکړئ د اړیکو له ثبت مخکې ځان راجستر کړئ",
                        "لطفاً قبل از ثبت تماس ثبت‌نام کنید"
                    )}
                </h1>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <NavLink
                        to="/signup"
                        className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-blue-700"
                    >
                        {translate("Register", "راجستر شئ", "ثبت‌نام")}
                    </NavLink>
                    <NavLink
                        to="/login"
                        className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
                    >
                        {translate("Log in", "ننوتل", "ورود")}
                    </NavLink>
                </div>
            </section>
        );
    }

    return (
        <section className="page-shell max-w-5xl">
            <div className="mb-10 text-center">
                <p className="text-xs uppercase tracking-[0.4em] text-blue-500">
                    {translate("Add New Provider", "نوی خدمت ثبت کړئ", "ثبت خدمت جدید")}
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
                    {translate(
                        "Register an emergency contact",
                        "بیړنۍ اړیکه ثبت کړئ",
                        "ثبت تماس اضطراری"
                    )}
                </h1>
                <p className="mt-3 text-sm text-slate-500 md:text-base">
                    {translate(
                        "Submit verified details for Kandahar emergency and essential services. An admin will review before publishing.",
                        "د کندهار بیړني او اړینو خدماتو تایید شوي معلومات وسپارئ. اډمین به یې مخکې له خپرولو وګوري.",
                        "جزئیات تأییدشده خدمات اضطراری کندهار را ارسال کنید. مدیر قبل از انتشار بررسی می‌کند."
                    )}
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="form-card rounded-3xl border border-slate-200 bg-white shadow-2xl"
            >
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
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
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
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
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
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                            required
                        >
                            <option value="" disabled>
                                {translate("Select service category", "د خدمت ډول وټاکئ", "دسته خدمت را انتخاب کنید")}
                            </option>
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
                            placeholder="+93 700 123 456"
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
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
                            placeholder="+93 700 987 654"
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                    </label>

                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                        {translate("Email Address", "بریښنالیک", "ایمیل")}
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                    </label>

                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                        {translate("Kandahar District", "د کندهار ولسوالۍ", "ولسوالی کندهار")}
                        <select
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                            required
                        >
                            <option value="" disabled>
                                {translate("Select district", "ولسوالۍ وټاکئ", "ولسوالی را انتخاب کنید")}
                            </option>
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
                            placeholder={translate("Street, area, landmark", "کوڅه، سیمه، نښه", "خیابان، محله، نشانه")}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </label>

                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                        {translate("Service image (optional)", "د خدمت انځور (اختیاري)", "تصویر خدمت (اختیاری)")}
                        <input
                            type="file"
                            accept={ALLOWED_IMAGE_ACCEPT}
                            onChange={handleImageChange}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-500 focus:outline-none"
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
                                    alt="Preview"
                                    className="h-24 w-24 rounded-2xl object-cover border border-slate-200"
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

                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 md:col-span-2">
                        {translate("Availability Window", "د شتون وخت", "ساعات دسترسی")}
                        <input
                            type="text"
                            name="availability"
                            value={formData.availability}
                            onChange={handleChange}
                            placeholder={translate("24/7 | 8am-10pm", "۲۴/۷ | سهار ۸ - ماښام ۱۰", "۲۴/۷ | ۸ صبح تا ۱۰ شب")}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
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
                        className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </label>

                <div className="mt-8 flex flex-wrap gap-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex flex-1 items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-60 sm:flex-none sm:px-10"
                    >
                        {submitting
                            ? translate("Saving...", "د خوندي کېدو په حال کې...", "در حال ذخیره...")
                            : translate("Save Contact", "اړیکه ثبت کړئ", "ثبت تماس")}
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:border-slate-400 hover:text-slate-700 sm:flex-none sm:px-10"
                    >
                        {translate("Reset Form", "فورم پاک کړئ", "پاک کردن فرم")}
                    </button>
                </div>
                {feedback && (
                    <p className={`mt-4 text-center text-sm ${feedbackError ? "text-red-600" : "text-emerald-600"}`}>
                        {feedback}
                    </p>
                )}
            </form>
        </section>
    );
};
