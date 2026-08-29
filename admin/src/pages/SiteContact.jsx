import { useEffect, useState } from 'react';
import { fetchSiteContact, updateSiteContact } from '../api/site.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const emptyLocalized = () => ({ en: '', ps: '', dr: '' });

const emptyForm = {
  title: emptyLocalized(),
  subtitle: emptyLocalized(),
  emergencyLabel: emptyLocalized(),
  emergencyPhone: '',
  technicalLabel: emptyLocalized(),
  technicalPhone: '',
  emailLabel: emptyLocalized(),
  email: '',
  addressLabel: emptyLocalized(),
  address: emptyLocalized(),
  responseNote: emptyLocalized(),
  officeHours: emptyLocalized(),
};

const LocalizedFields = ({ label, name, values, onChange }) => (
  <fieldset className="site-contact-fieldset">
    <legend>{label}</legend>
    <div className="site-contact-grid">
      {['en', 'ps', 'dr'].map((lang) => (
        <label key={lang}>
          <span>{lang.toUpperCase()}</span>
          <input
            type="text"
            dir={lang === 'en' ? 'ltr' : 'rtl'}
            value={values?.[lang] || ''}
            onChange={(event) => onChange(name, lang, event.target.value)}
            placeholder={`${label} (${lang.toUpperCase()})`}
          />
        </label>
      ))}
    </div>
  </fieldset>
);

const SiteContactPage = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetchSiteContact({ signal: controller.signal })
      .then((data) => {
        setForm({
          title: { ...emptyLocalized(), ...(data.title || {}) },
          subtitle: { ...emptyLocalized(), ...(data.subtitle || {}) },
          emergencyLabel: { ...emptyLocalized(), ...(data.emergencyLabel || {}) },
          emergencyPhone: data.emergencyPhone || '',
          technicalLabel: { ...emptyLocalized(), ...(data.technicalLabel || {}) },
          technicalPhone: data.technicalPhone || '',
          emailLabel: { ...emptyLocalized(), ...(data.emailLabel || {}) },
          email: data.email || '',
          addressLabel: { ...emptyLocalized(), ...(data.addressLabel || {}) },
          address: { ...emptyLocalized(), ...(data.address || {}) },
          responseNote: { ...emptyLocalized(), ...(data.responseNote || {}) },
          officeHours: { ...emptyLocalized(), ...(data.officeHours || {}) },
        });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || t('loadSiteError'));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [t]);

  const handleLocalizedChange = (field, lang, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const handleSimpleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const emailValue = (form.email || '').trim();
    if (!emailValue.includes('@')) {
      setSaving(false);
      setError(t('emailInvalid'));
      return;
    }

    try {
      const saved = await updateSiteContact(form);
      setForm({
        title: { ...emptyLocalized(), ...(saved.title || {}) },
        subtitle: { ...emptyLocalized(), ...(saved.subtitle || {}) },
        emergencyLabel: { ...emptyLocalized(), ...(saved.emergencyLabel || {}) },
        emergencyPhone: saved.emergencyPhone || '',
        technicalLabel: { ...emptyLocalized(), ...(saved.technicalLabel || {}) },
        technicalPhone: saved.technicalPhone || '',
        emailLabel: { ...emptyLocalized(), ...(saved.emailLabel || {}) },
        email: saved.email || '',
        addressLabel: { ...emptyLocalized(), ...(saved.addressLabel || {}) },
        address: { ...emptyLocalized(), ...(saved.address || {}) },
        responseNote: { ...emptyLocalized(), ...(saved.responseNote || {}) },
        officeHours: { ...emptyLocalized(), ...(saved.officeHours || {}) },
      });
      setSuccess(t('siteSaved'));
    } catch (err) {
      setError(err.message || t('saveSiteError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stack">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="panel__eyebrow">{t('siteEyebrow')}</p>
            <h3>{t('siteTitle')}</h3>
          </div>
          <p>{t('siteHint')}</p>
        </div>

        {loading ? <p>{t('loadingSite')}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p className="form-success">{success}</p> : null}

        {!loading ? (
          <form className="site-contact-form" onSubmit={handleSubmit}>
            <LocalizedFields label={t('pageTitle')} name="title" values={form.title} onChange={handleLocalizedChange} />
            <LocalizedFields
              label={t('pageSubtitle')}
              name="subtitle"
              values={form.subtitle}
              onChange={handleLocalizedChange}
            />

            <div className="site-contact-grid site-contact-grid--2">
              <label>
                <span>{t('emergencyPhone')}</span>
                <input
                  type="text"
                  name="emergencyPhone"
                  value={form.emergencyPhone}
                  onChange={handleSimpleChange}
                  required
                />
              </label>
              <label>
                <span>{t('technicalPhone')}</span>
                <input
                  type="text"
                  name="technicalPhone"
                  value={form.technicalPhone}
                  onChange={handleSimpleChange}
                  required
                />
              </label>
              <label className="form-span-full">
                <span>{t('supportEmail')}</span>
                <input
                  type="text"
                  name="email"
                  value={form.email}
                  onChange={handleSimpleChange}
                  placeholder="name@gmail.com"
                  required
                />
              </label>
            </div>

            <LocalizedFields
              label={t('emergencyLabel')}
              name="emergencyLabel"
              values={form.emergencyLabel}
              onChange={handleLocalizedChange}
            />
            <LocalizedFields
              label={t('technicalLabel')}
              name="technicalLabel"
              values={form.technicalLabel}
              onChange={handleLocalizedChange}
            />
            <LocalizedFields
              label={t('emailLabel')}
              name="emailLabel"
              values={form.emailLabel}
              onChange={handleLocalizedChange}
            />
            <LocalizedFields
              label={t('addressLabel')}
              name="addressLabel"
              values={form.addressLabel}
              onChange={handleLocalizedChange}
            />
            <LocalizedFields label={t('address')} name="address" values={form.address} onChange={handleLocalizedChange} />
            <LocalizedFields
              label={t('officeHours')}
              name="officeHours"
              values={form.officeHours}
              onChange={handleLocalizedChange}
            />
            <LocalizedFields
              label={t('responseNote')}
              name="responseNote"
              values={form.responseNote}
              onChange={handleLocalizedChange}
            />

            <div className="site-contact-actions">
              <button className="primary" type="submit" disabled={saving}>
                {saving ? t('saving') : t('saveContactPage')}
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </div>
  );
};

export default SiteContactPage;
