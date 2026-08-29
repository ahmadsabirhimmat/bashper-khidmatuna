import { useEffect, useState } from 'react';
import { fetchPolicy, updatePolicy } from '../api/site.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const emptyLocalized = () => ({ en: '', ps: '', dr: '' });
const emptySection = () => ({ heading: emptyLocalized(), body: emptyLocalized() });

const LocalizedFields = ({ label, name, values, onChange, multiline = false }) => (
  <fieldset className="site-contact-fieldset">
    <legend>{label}</legend>
    <div className="site-contact-grid">
      {['en', 'ps', 'dr'].map((lang) => (
        <label key={lang}>
          <span>{lang.toUpperCase()}</span>
          {multiline ? (
            <textarea
              rows={5}
              dir={lang === 'en' ? 'ltr' : 'rtl'}
              value={values?.[lang] || ''}
              onChange={(event) => onChange(name, lang, event.target.value)}
              placeholder={`${label} (${lang.toUpperCase()})`}
            />
          ) : (
            <input
              type="text"
              dir={lang === 'en' ? 'ltr' : 'rtl'}
              value={values?.[lang] || ''}
              onChange={(event) => onChange(name, lang, event.target.value)}
              placeholder={`${label} (${lang.toUpperCase()})`}
            />
          )}
        </label>
      ))}
    </div>
  </fieldset>
);

const PolicyPage = () => {
  const { t } = useLanguage();
  const [title, setTitle] = useState(emptyLocalized());
  const [subtitle, setSubtitle] = useState(emptyLocalized());
  const [sections, setSections] = useState([emptySection()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const applyPolicy = (data) => {
    setTitle({ ...emptyLocalized(), ...(data.title || {}) });
    setSubtitle({ ...emptyLocalized(), ...(data.subtitle || {}) });
    const nextSections = Array.isArray(data.sections) && data.sections.length
      ? data.sections.map((section) => ({
          heading: { ...emptyLocalized(), ...(section.heading || {}) },
          body: { ...emptyLocalized(), ...(section.body || {}) },
        }))
      : [emptySection()];
    setSections(nextSections);
  };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetchPolicy({ signal: controller.signal })
      .then(applyPolicy)
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || t('loadPolicyError'));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [t]);

  const handleLocalized = (setter) => (field, lang, value) => {
    setter((prev) => ({ ...prev, [lang]: value }));
  };

  const handleSectionChange = (index, field, lang, value) => {
    setSections((prev) =>
      prev.map((section, i) =>
        i === index
          ? {
              ...section,
              [field]: {
                ...section[field],
                [lang]: value,
              },
            }
          : section
      )
    );
  };

  const addSection = () => {
    setSections((prev) => [...prev, emptySection()]);
  };

  const removeSection = (index) => {
    setSections((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const saved = await updatePolicy({ title, subtitle, sections });
      applyPolicy(saved);
      setSuccess(t('policySaved'));
    } catch (err) {
      setError(err.message || t('savePolicyError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stack">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="panel__eyebrow">{t('policyEyebrow')}</p>
            <h3>{t('policyTitle')}</h3>
          </div>
          <p>{t('policyHint')}</p>
        </div>

        {loading ? <p>{t('loadingPolicy')}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p className="form-success">{success}</p> : null}

        {!loading ? (
          <form className="site-contact-form" onSubmit={handleSubmit}>
            <LocalizedFields
              label={t('pageTitle')}
              name="title"
              values={title}
              onChange={(name, lang, value) => handleLocalized(setTitle)(name, lang, value)}
            />
            <LocalizedFields
              label={t('pageSubtitle')}
              name="subtitle"
              values={subtitle}
              onChange={(name, lang, value) => handleLocalized(setSubtitle)(name, lang, value)}
              multiline
            />

            {sections.map((section, index) => (
              <div key={`policy-section-${index}`} className="policy-section">
                <div className="policy-section__header">
                  <p>{t('policySection', { count: index + 1 })}</p>
                  {sections.length > 1 ? (
                    <button type="button" className="ghost" onClick={() => removeSection(index)}>
                      {t('removePolicySection')}
                    </button>
                  ) : null}
                </div>
                <LocalizedFields
                  label={t('policyHeading')}
                  name="heading"
                  values={section.heading}
                  onChange={(name, lang, value) => handleSectionChange(index, name, lang, value)}
                />
                <LocalizedFields
                  label={t('policyBody')}
                  name="body"
                  values={section.body}
                  onChange={(name, lang, value) => handleSectionChange(index, name, lang, value)}
                  multiline
                />
              </div>
            ))}

            <div className="site-contact-actions policy-actions">
              <button type="button" className="ghost" onClick={addSection}>
                {t('addPolicySection')}
              </button>
              <button className="primary" type="submit" disabled={saving}>
                {saving ? t('saving') : t('savePolicy')}
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </div>
  );
};

export default PolicyPage;
