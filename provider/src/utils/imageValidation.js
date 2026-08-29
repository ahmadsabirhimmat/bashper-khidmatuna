export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/pjpeg",
  "image/jfif",
  "image/png",
  "image/webp",
  "image/gif",
];

export const ALLOWED_IMAGE_ACCEPT =
  "image/jpeg,image/jpg,image/pjpeg,image/jfif,image/png,image/webp,image/gif,.jpg,.jpeg,.jfif,.png,.webp,.gif";

export const validateProviderImage = (file, translate = (en) => en) => {
  if (!file) {
    return { ok: true };
  }

  const mime = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  const isJfif = name.endsWith(".jfif");
  const isAllowedMime = ALLOWED_IMAGE_MIME_TYPES.includes(mime);

  if (!isAllowedMime && !isJfif) {
    return {
      ok: false,
      message: translate(
        "Only JPG, JPEG, JFIF, PNG, WEBP, or GIF images are allowed.",
        "یوازې JPG، JPEG، JFIF، PNG، WEBP یا GIF انځورونه اجازه لري.",
        "فقط تصاویر JPG، JPEG، JFIF، PNG، WEBP یا GIF مجاز هستند."
      ),
    };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      message: translate(
        "The image size must be under 2 MB.",
        "د انځور اندازه باید تر ۲ مېګابایټ لږه وي.",
        "حجم تصویر باید کمتر از ۲ مگابایت باشد."
      ),
    };
  }

  return { ok: true };
};
