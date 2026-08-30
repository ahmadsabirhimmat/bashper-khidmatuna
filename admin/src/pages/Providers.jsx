import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/common/EmptyState.jsx';
import ProviderImage from '../components/common/ProviderImage.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { deleteProviderProfile, fetchProviders, reviewProviderStatus } from '../api/providers.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useDesktopTable } from '../hooks/useDesktopTable.js';

const serviceTypes = ['police', 'ambulance', 'firefighters', 'hospital', 'pharmacy', 'clinic', 'ngo', 'rescue'];
const statusOptions = ['pending', 'approved', 'rejected'];

const ContactLines = ({ phone, altPhone, email }) => (
  <div className="contact-stack">
    <a className="contact-stack__phone" href={`tel:${phone}`} dir="ltr">
      {phone}
    </a>
    {altPhone ? (
      <a className="contact-stack__phone" href={`tel:${altPhone}`} dir="ltr">
        {altPhone}
      </a>
    ) : null}
    <span className="contact-stack__email" dir="ltr">
      {email || '—'}
    </span>
  </div>
);

const ProvidersPage = () => {
  const { t, tService, tStatus, tDistrict } = useLanguage();
  const isDesktop = useDesktopTable();
  const [filters, setFilters] = useState({ search: '', status: '', serviceType: '' });
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    fetchProviders(filters, { signal: controller.signal })
      .then(setProviders)
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || t('fetchProvidersError'));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [filters, t]);

  const pendingCount = useMemo(
    () => providers.filter((provider) => provider.status === 'pending').length,
    [providers]
  );

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => setFilters({ search: '', status: '', serviceType: '' });

  const handleStatusChange = async (id, status) => {
    setActionId(id);
    try {
      await reviewProviderStatus(id, status);
      setProviders((prev) => prev.map((provider) => (provider._id === id ? { ...provider, status } : provider)));
    } catch (err) {
      alert(err.message || t('updateStatusError'));
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(t('deleteProviderConfirm'));
    if (!confirmed) return;
    setActionId(id);
    try {
      await deleteProviderProfile(id);
      setProviders((prev) => prev.filter((provider) => provider._id !== id));
    } catch (err) {
      alert(err.message || t('deleteProviderError'));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="stack">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="panel__eyebrow">{t('providersEyebrow')}</p>
            <h3>{t('providersTitle')}</h3>
          </div>
          <p>{t('providersPending', { count: pendingCount })}</p>
        </div>
        <div className="filter-grid">
          <label>
            <span>{t('searchName')}</span>
            <input
              type="search"
              name="search"
              placeholder={t('searchPlaceholder')}
              value={filters.search}
              onChange={handleFilterChange}
            />
          </label>
          <label>
            <span>{t('serviceType')}</span>
            <select name="serviceType" value={filters.serviceType} onChange={handleFilterChange}>
              <option value="">{t('allServices')}</option>
              {serviceTypes.map((type) => (
                <option key={type} value={type}>
                  {tService(type)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{t('status')}</span>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">{t('anyStatus')}</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {tStatus(status)}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="ghost" onClick={resetFilters}>
            {t('resetFilters')}
          </button>
        </div>
      </section>

      <section className="panel">
        {error ? (
          <p className="form-error">{error}</p>
        ) : isLoading ? (
          <p>{t('loadingRoster')}</p>
        ) : providers.length ? (
          isDesktop ? (
          <table className="data-table data-table--responsive data-table--providers">
            <thead>
              <tr>
                <th>{t('colImage')}</th>
                <th>{t('colOrganization')}</th>
                <th>{t('colService')}</th>
                <th>{t('colContact')}</th>
                <th>{t('colStatus')}</th>
                <th>{t('colReview')}</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider) => (
                <tr key={provider._id}>
                  <td>
                    <ProviderImage
                      src={provider.imageUrl}
                      alt={provider.organizationName}
                      emptyLabel={t('noImage')}
                    />
                  </td>
                  <td>
                    <strong>{provider.organizationName}</strong>
                    {provider.organizationNameLocal ? (
                      <p className="table-subline" dir="auto">
                        {provider.organizationNameLocal}
                      </p>
                    ) : null}
                    <p>{provider.location}</p>
                    {provider.district ? <p className="table-subline">{tDistrict(provider.district)}</p> : null}
                  </td>
                  <td>
                    <p>{tService(provider.serviceType)}</p>
                    <p className="table-subline">{provider.capabilities?.join(', ')}</p>
                  </td>
                  <td className="contact-cell">
                    <ContactLines
                      phone={provider.phoneNumber}
                      altPhone={provider.altPhoneNumber}
                      email={provider.email}
                    />
                  </td>
                  <td>
                    <StatusBadge value={provider.status} />
                  </td>
                  <td className="table-actions">
                    <button
                      type="button"
                      className="ghost"
                      disabled={actionId === provider._id}
                      onClick={() => handleStatusChange(provider._id, 'approved')}
                    >
                      {t('approve')}
                    </button>
                    <button
                      type="button"
                      className="ghost danger"
                      disabled={actionId === provider._id}
                      onClick={() => handleStatusChange(provider._id, 'rejected')}
                    >
                      {t('reject')}
                    </button>
                    <button
                      type="button"
                      className="ghost danger"
                      disabled={actionId === provider._id}
                      onClick={() => handleDelete(provider._id)}
                    >
                      {t('delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          ) : (
          <div className="data-cards">
            {providers.map((provider) => (
              <article key={`card-${provider._id}`} className="data-card data-card--provider">
                <div className="data-card__top">
                  <ProviderImage
                    src={provider.imageUrl}
                    alt={provider.organizationName}
                    emptyLabel={t('noImage')}
                  />
                  <div className="data-card__body">
                    <strong>{provider.organizationName}</strong>
                    {provider.organizationNameLocal ? (
                      <p className="table-subline" dir="auto">
                        {provider.organizationNameLocal}
                      </p>
                    ) : null}
                    <p className="table-subline">{tService(provider.serviceType)}</p>
                    <StatusBadge value={provider.status} />
                  </div>
                </div>
                <div className="data-card__field">
                  <p className="data-card__label">{t('colContact')}</p>
                  <ContactLines
                    phone={provider.phoneNumber}
                    altPhone={provider.altPhoneNumber}
                    email={provider.email}
                  />
                </div>
                <div className="data-card__field">
                  <p className="data-card__label">{t('colOrganization')}</p>
                  <p className="data-card__value">{provider.location}</p>
                  {provider.district ? <p className="table-subline">{tDistrict(provider.district)}</p> : null}
                </div>
                <div className="table-actions">
                  <button
                    type="button"
                    className="ghost"
                    disabled={actionId === provider._id}
                    onClick={() => handleStatusChange(provider._id, 'approved')}
                  >
                    {t('approve')}
                  </button>
                  <button
                    type="button"
                    className="ghost danger"
                    disabled={actionId === provider._id}
                    onClick={() => handleStatusChange(provider._id, 'rejected')}
                  >
                    {t('reject')}
                  </button>
                  <button
                    type="button"
                    className="ghost danger"
                    disabled={actionId === provider._id}
                    onClick={() => handleDelete(provider._id)}
                  >
                    {t('delete')}
                  </button>
                </div>
              </article>
            ))}
          </div>
          )
        ) : (
          <EmptyState title={t('emptyFilterTitle')} description={t('emptyFilterDesc')} />
        )}
      </section>
    </div>
  );
};

export default ProvidersPage;
