export const buildProviderFormData = ({ fields, imageFile, removeImage = false }) => {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    const normalized = typeof value === 'string' ? value.trim() : value;
    if (key === 'organizationNameLocal') {
      formData.append(key, typeof normalized === 'string' ? normalized : '');
      return;
    }
    if (normalized === '') {
      return;
    }
    formData.append(key, normalized);
  });

  if (imageFile) {
    formData.append('image', imageFile);
  }

  if (removeImage) {
    formData.append('removeImage', 'true');
  }

  return formData;
};
