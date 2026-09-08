import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/common/EmptyState.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { deleteAppUser, fetchAppUsers } from '../api/users.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useDesktopTable } from '../hooks/useDesktopTable.js';

const statusOptions = ['pending', 'active', 'suspended'];

const asList = (payload) => (Array.isArray(payload) ? payload : []);

const formatStamp = (value, dateLocale) => {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return new Intl.DateTimeFormat(dateLocale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: true,
  }).format(date);
};

const UserFields = ({ user, t, dateLocale }) => (
  <dl className="user-fields">
    <div>
      <dt>{t('colFullName')}</dt>
      <dd>{user.fullName || '—'}</dd>
    </div>
    <div>
      <dt>{t('email')}</dt>
      <dd dir="ltr">{user.email || '—'}</dd>
    </div>
    <div>
      <dt>{t('fieldPhone')}</dt>
      <dd dir="ltr">{user.phoneNumber || '—'}</dd>
    </div>
    <div>
      <dt>{t('fieldOrganization')}</dt>
      <dd>{user.organization?.trim() || '—'}</dd>
    </div>
    <div>
      <dt>{t('colRole')}</dt>
      <dd>{user.role === 'beneficiary' ? t('roleMobile') : user.role}</dd>
    </div>
    <div>
      <dt>{t('colStatus')}</dt>
      <dd>
        <StatusBadge value={user.status} />
      </dd>
    </div>
    <div>
      <dt>{t('colEmailVerified')}</dt>
      <dd>{user.emailVerified ? t('yes') : t('no')}</dd>
    </div>
    <div>
      <dt>{t('colLastLogin')}</dt>
      <dd dir="ltr">{formatStamp(user.lastLoginAt, dateLocale)}</dd>
    </div>
    <div>
      <dt>{t('colCreated')}</dt>
      <dd dir="ltr">{formatStamp(user.createdAt, dateLocale)}</dd>
    </div>
    <div>
      <dt>{t('colUpdated')}</dt>
      <dd dir="ltr">{formatStamp(user.updatedAt, dateLocale)}</dd>
    </div>
    <div>
      <dt>{t('colUserId')}</dt>
      <dd className="user-id" dir="ltr">
        {user.id || '—'}
      </dd>
    </div>
  </dl>
);

const UsersPage = () => {
  const { t, tStatus, dateLocale } = useLanguage();
  const isDesktop = useDesktopTable();
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    fetchAppUsers(filters, { signal: controller.signal })
      .then((payload) => setUsers(asList(payload)))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || t('fetchUsersError'));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [filters, t]);

  const registeredCount = useMemo(() => users.length, [users]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => setFilters({ search: '', status: '' });

  const handleDelete = async (id) => {
    const confirmed = window.confirm(t('deleteUserConfirm'));
    if (!confirmed) return;
    setActionId(id);
    try {
      await deleteAppUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      alert(err.message || t('deleteUserError'));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="stack">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="panel__eyebrow">{t('usersEyebrow')}</p>
            <h3>{t('usersTitle')}</h3>
          </div>
          <p>{t('usersCount', { count: registeredCount })}</p>
        </div>
        <div className="filter-grid">
          <label>
            <span>{t('searchName')}</span>
            <input
              type="search"
              name="search"
              placeholder={t('searchUsersPlaceholder')}
              value={filters.search}
              onChange={handleFilterChange}
            />
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
          <p>{t('loadingUsers')}</p>
        ) : users.length ? (
          isDesktop ? (
            <div className="table-scroll table-scroll--x">
              <table className="data-table data-table--responsive data-table--users">
                <thead>
                  <tr>
                    <th>{t('colFullName')}</th>
                    <th>{t('email')}</th>
                    <th>{t('fieldPhone')}</th>
                    <th>{t('fieldOrganization')}</th>
                    <th>{t('colRole')}</th>
                    <th>{t('colStatus')}</th>
                    <th>{t('colEmailVerified')}</th>
                    <th>{t('colLastLogin')}</th>
                    <th>{t('colCreated')}</th>
                    <th>{t('colUpdated')}</th>
                    <th>{t('colUserId')}</th>
                    <th>{t('colActions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.fullName}</strong>
                      </td>
                      <td dir="ltr">{user.email || '—'}</td>
                      <td dir="ltr">{user.phoneNumber || '—'}</td>
                      <td>{user.organization?.trim() || '—'}</td>
                      <td>{user.role === 'beneficiary' ? t('roleMobile') : user.role}</td>
                      <td>
                        <StatusBadge value={user.status} />
                      </td>
                      <td>{user.emailVerified ? t('yes') : t('no')}</td>
                      <td dir="ltr">{formatStamp(user.lastLoginAt, dateLocale)}</td>
                      <td dir="ltr">{formatStamp(user.createdAt, dateLocale)}</td>
                      <td dir="ltr">{formatStamp(user.updatedAt, dateLocale)}</td>
                      <td className="user-id" dir="ltr">
                        {user.id}
                      </td>
                      <td className="table-actions">
                        <button
                          type="button"
                          className="ghost danger"
                          disabled={actionId === user.id}
                          onClick={() => handleDelete(user.id)}
                        >
                          {t('delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="data-cards">
              {users.map((user) => (
                <article key={`card-${user.id}`} className="data-card data-card--user">
                  <div className="data-card__body">
                    <strong>{user.fullName}</strong>
                    <StatusBadge value={user.status} />
                  </div>
                  <UserFields user={user} t={t} dateLocale={dateLocale} />
                  <div className="table-actions">
                    <button
                      type="button"
                      className="ghost danger"
                      disabled={actionId === user.id}
                      onClick={() => handleDelete(user.id)}
                    >
                      {t('delete')}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )
        ) : (
          <EmptyState title={t('emptyUsersTitle')} description={t('emptyUsersDesc')} />
        )}
      </section>
    </div>
  );
};

export default UsersPage;
