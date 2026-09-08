import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/common/EmptyState.jsx';
import { fetchCallEvents } from '../api/calls.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useDesktopTable } from '../hooks/useDesktopTable.js';

const serviceTypes = ['police', 'ambulance', 'firefighters', 'hospital', 'pharmacy', 'clinic', 'ngo', 'rescue'];

const asList = (payload) => (Array.isArray(payload) ? payload : []);

const formatDate = (value, dateLocale) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(dateLocale, { dateStyle: 'medium' }).format(date);
};

const formatTime = (value, dateLocale) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(dateLocale, { timeStyle: 'short', hour12: true }).format(date);
};

const sourceLabel = (source, t) => {
  if (source === 'critical') return t('callSourceCritical');
  if (source === 'directory') return t('callSourceDirectory');
  return t('callSourceUnknown');
};

const CallsPage = () => {
  const { t, tService, dateLocale } = useLanguage();
  const isDesktop = useDesktopTable();
  const [filters, setFilters] = useState({ search: '', serviceType: '' });
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    fetchCallEvents(filters, { signal: controller.signal })
      .then((payload) => setEvents(asList(payload)))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || t('fetchCallsError'));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [filters, t]);

  const callCount = useMemo(() => events.length, [events]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => setFilters({ search: '', serviceType: '' });

  const callerName = (event) => {
    if (event.callerName?.trim()) return event.callerName;
    if (event.callerEmail?.trim()) return event.callerEmail;
    return t('guestUser');
  };

  return (
    <div className="stack">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="panel__eyebrow">{t('callsEyebrow')}</p>
            <h3>{t('callsTitle')}</h3>
          </div>
          <p>{t('callsCount', { count: callCount })}</p>
        </div>
        <p className="panel__description">{t('callsHint')}</p>
        <div className="filter-grid">
          <label>
            <span>{t('searchName')}</span>
            <input
              type="search"
              name="search"
              placeholder={t('searchCallsPlaceholder')}
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
          <button type="button" className="ghost" onClick={resetFilters}>
            {t('resetFilters')}
          </button>
        </div>
      </section>

      <section className="panel">
        {error ? (
          <p className="form-error">{error}</p>
        ) : isLoading ? (
          <p>{t('loadingCalls')}</p>
        ) : events.length ? (
          isDesktop ? (
            <div className="table-scroll table-scroll--x">
              <table className="data-table data-table--responsive data-table--calls">
                <thead>
                  <tr>
                    <th>{t('colCallDate')}</th>
                    <th>{t('colCallTime')}</th>
                    <th>{t('colCaller')}</th>
                    <th>{t('email')}</th>
                    <th>{t('colCallerPhone')}</th>
                    <th>{t('colService')}</th>
                    <th>{t('colCalledService')}</th>
                    <th>{t('colCalledNumber')}</th>
                    <th>{t('colCallSource')}</th>
                    <th>{t('fieldDistrict')}</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td dir="ltr">{formatDate(event.calledAt, dateLocale)}</td>
                      <td dir="ltr">{formatTime(event.calledAt, dateLocale)}</td>
                      <td>
                        <strong>{callerName(event)}</strong>
                      </td>
                      <td dir="ltr">{event.callerEmail || '—'}</td>
                      <td dir="ltr">{event.callerPhone || '—'}</td>
                      <td>{event.serviceType === 'unknown' ? '—' : tService(event.serviceType)}</td>
                      <td>
                        <strong>{event.serviceName || '—'}</strong>
                        {event.organization && event.organization !== event.serviceName ? (
                          <p className="table-subline">{event.organization}</p>
                        ) : null}
                      </td>
                      <td dir="ltr">{event.phoneNumber}</td>
                      <td>{sourceLabel(event.source, t)}</td>
                      <td>{event.district || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="data-cards">
              {events.map((event) => (
                <article key={`card-${event.id}`} className="data-card data-card--call">
                  <div className="data-card__body">
                    <strong>{callerName(event)}</strong>
                    <p className="table-subline" dir="ltr">
                      {formatDate(event.calledAt, dateLocale)} • {formatTime(event.calledAt, dateLocale)}
                    </p>
                  </div>
                  <dl className="user-fields">
                    <div>
                      <dt>{t('email')}</dt>
                      <dd dir="ltr">{event.callerEmail || '—'}</dd>
                    </div>
                    <div>
                      <dt>{t('colCallerPhone')}</dt>
                      <dd dir="ltr">{event.callerPhone || '—'}</dd>
                    </div>
                    <div>
                      <dt>{t('colService')}</dt>
                      <dd>{event.serviceType === 'unknown' ? '—' : tService(event.serviceType)}</dd>
                    </div>
                    <div>
                      <dt>{t('colCalledService')}</dt>
                      <dd>{event.serviceName || event.organization || '—'}</dd>
                    </div>
                    <div>
                      <dt>{t('colCalledNumber')}</dt>
                      <dd dir="ltr">{event.phoneNumber}</dd>
                    </div>
                    <div>
                      <dt>{t('colCallSource')}</dt>
                      <dd>{sourceLabel(event.source, t)}</dd>
                    </div>
                    <div>
                      <dt>{t('fieldDistrict')}</dt>
                      <dd>{event.district || '—'}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          )
        ) : (
          <EmptyState title={t('emptyCallsTitle')} description={t('emptyCallsDesc')} />
        )}
      </section>
    </div>
  );
};

export default CallsPage;
