import { useEffect, useState } from 'react';
import EmptyState from '../components/common/EmptyState.jsx';
import {
  createCriticalContact,
  deleteCriticalContact,
  fetchCriticalContacts,
  updateCriticalContact,
} from '../api/criticalContacts.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useDesktopTable } from '../hooks/useDesktopTable.js';

const SERVICE_TYPES = ['police', 'ambulance', 'firefighters', 'hospital', 'pharmacy', 'clinic', 'ngo', 'rescue'];
const DISTRICTS = [
  'Kandahar City',
  'Dand',
  'Arghandab',
  'Panjwai',
  'Zhari',
  'Maywand',
  'Spin Boldak',
  'Daman',
  'Shah Wali Kot',
  'Khakrez',
  'Ghorak',
  'Maruf',
  'Reg',
  'Shorabak',
  'Nish',
  'Miyanishin',
  'Arghistan',
];

const emptyForm = {
  name: '',
  organization: '',
  phoneNumber: '',
  altPhoneNumber: '',
  category: 'police',
  district: 'Kandahar City',
  location: 'Kandahar Province',
  description: '',
  availability: '24/7',
  supportSms: false,
};

const CriticalContactsPage = () => {
  const { t, tService, tDistrict } = useLanguage();
  const isDesktop = useDesktopTable();
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadContacts = (signal) =>
    fetchCriticalContacts({ signal })
      .then(setContacts)
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || t('loadCriticalError'));
        }
      });

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    loadContacts(controller.signal).finally(() => {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    });
    return () => controller.abort();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (contact) => {
    setEditingId(contact._id);
    setForm({
      name: contact.name || '',
      organization: contact.organization || '',
      phoneNumber: contact.phoneNumber || '',
      altPhoneNumber: contact.altPhoneNumber || '',
      category: contact.category || 'police',
      district: contact.district || 'Kandahar City',
      location: contact.location || 'Kandahar Province',
      description: contact.description || '',
      availability: contact.availability || '24/7',
      supportSms: Boolean(contact.supportSms),
    });
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (editingId) {
        await updateCriticalContact(editingId, form);
        setSuccess(t('criticalUpdated'));
      } else {
        await createCriticalContact(form);
        setSuccess(t('criticalAdded'));
      }
      resetForm();
      const next = await fetchCriticalContacts();
      setContacts(next);
    } catch (err) {
      setError(err.message || t('saveCriticalError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(t('deleteCriticalConfirm'));
    if (!confirmed) {
      return;
    }
    try {
      await deleteCriticalContact(id);
      setContacts((prev) => prev.filter((item) => item._id !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || t('deleteCriticalError'));
    }
  };

  return (
    <div className="stack">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="panel__eyebrow">{t('criticalEyebrow')}</p>
            <h3>{editingId ? t('criticalEditTitle') : t('criticalAddTitle')}</h3>
          </div>
          <p>{t('criticalHint')}</p>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p className="form-success">{success}</p> : null}
        <form className="site-contact-form" onSubmit={handleSubmit}>
          <div className="site-contact-grid site-contact-grid--2">
            <label>
              <span>{t('fieldName')}</span>
              <input name="name" value={form.name} onChange={handleChange} required placeholder={t('placeholderName')} />
            </label>
            <label>
              <span>{t('fieldOrganization')}</span>
              <input name="organization" value={form.organization} onChange={handleChange} placeholder={t('placeholderOrg')} />
            </label>
            <label>
              <span>{t('fieldPhone')}</span>
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required placeholder="119" />
            </label>
            <label>
              <span>{t('fieldAltPhone')}</span>
              <input name="altPhoneNumber" value={form.altPhoneNumber} onChange={handleChange} placeholder={t('placeholderAlt')} />
            </label>
            <label>
              <span>{t('fieldCategory')}</span>
              <select name="category" value={form.category} onChange={handleChange}>
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {tService(type)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t('fieldDistrict')}</span>
              <select name="district" value={form.district} onChange={handleChange}>
                {DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {tDistrict(district)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t('fieldLocation')}</span>
              <input name="location" value={form.location} onChange={handleChange} placeholder={t('placeholderLocation')} />
            </label>
            <label>
              <span>{t('fieldAvailability')}</span>
              <input name="availability" value={form.availability} onChange={handleChange} placeholder="24/7" />
            </label>
            <label className="form-span-full">
              <span>{t('fieldDescription')}</span>
              <input name="description" value={form.description} onChange={handleChange} placeholder={t('placeholderDescription')} />
            </label>
            <div className="form-footer-row">
              <label className="critical-sms">
                <input type="checkbox" name="supportSms" checked={form.supportSms} onChange={handleChange} />
                <span>{t('supportsSms')}</span>
              </label>
              <div className="site-contact-actions">
                {editingId ? (
                  <button type="button" className="ghost" onClick={resetForm}>
                    {t('cancelEdit')}
                  </button>
                ) : null}
                <button className="primary" type="submit" disabled={saving}>
                  {saving ? t('saving') : editingId ? t('saveChanges') : t('addCritical')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="panel__eyebrow">{t('publishedEyebrow')}</p>
            <h3>{t('publishedTitle')}</h3>
          </div>
          <p>{t('numbersCount', { count: contacts.length })}</p>
        </div>
        {loading ? (
          <p>{t('loadingCritical')}</p>
        ) : contacts.length ? (
          isDesktop ? (
          <table className="data-table data-table--responsive">
            <thead>
              <tr>
                <th>{t('fieldName')}</th>
                <th>{t('colNumber')}</th>
                <th>{t('fieldCategory')}</th>
                <th>{t('fieldDistrict')}</th>
                <th>{t('colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact._id}>
                  <td>
                    <strong>{contact.name}</strong>
                    <p className="table-subline">{contact.organization}</p>
                  </td>
                  <td>
                    <p>{contact.phoneNumber}</p>
                    {contact.altPhoneNumber ? <p className="table-subline">{contact.altPhoneNumber}</p> : null}
                  </td>
                  <td>{tService(contact.category)}</td>
                  <td>{contact.district ? tDistrict(contact.district) : '—'}</td>
                  <td className="table-actions">
                    <button type="button" className="ghost" onClick={() => startEdit(contact)}>
                      {t('edit')}
                    </button>
                    <button type="button" className="ghost danger" onClick={() => handleDelete(contact._id)}>
                      {t('delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          ) : (
          <div className="data-cards">
            {contacts.map((contact) => (
              <article key={`card-${contact._id}`} className="data-card">
                <div className="data-card__body">
                  <strong>{contact.name}</strong>
                  <p className="table-subline">{contact.organization}</p>
                </div>
                <div>
                  <p className="data-card__label">{t('colNumber')}</p>
                  <p className="data-card__value">{contact.phoneNumber}</p>
                  {contact.altPhoneNumber ? <p className="table-subline">{contact.altPhoneNumber}</p> : null}
                </div>
                <div>
                  <p className="data-card__label">{t('fieldCategory')}</p>
                  <p className="data-card__value">{tService(contact.category)}</p>
                </div>
                <div>
                  <p className="data-card__label">{t('fieldDistrict')}</p>
                  <p className="data-card__value">{contact.district ? tDistrict(contact.district) : '—'}</p>
                </div>
                <div className="table-actions">
                  <button type="button" className="ghost" onClick={() => startEdit(contact)}>
                    {t('edit')}
                  </button>
                  <button type="button" className="ghost danger" onClick={() => handleDelete(contact._id)}>
                    {t('delete')}
                  </button>
                </div>
              </article>
            ))}
          </div>
          )
        ) : (
          <EmptyState title={t('emptyCriticalTitle')} description={t('emptyCriticalDesc')} />
        )}
      </section>
    </div>
  );
};

export default CriticalContactsPage;
