import { useEffect, useMemo, useState } from 'react';
import MetricCard from '../components/common/MetricCard.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ProviderImage from '../components/common/ProviderImage.jsx';
import { fetchCriticalContacts } from '../api/criticalContacts.js';
import { fetchProviders } from '../api/providers.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const asList = (payload) => {
    if (Array.isArray(payload)) {
        return payload;
    }
    if (Array.isArray(payload?.data)) {
        return payload.data;
    }
    if (Array.isArray(payload?.contacts)) {
        return payload.contacts;
    }
    return [];
};

const OverviewPage = () => {
    const { t, tService, tStatus, dateLocale } = useLanguage();
    const [providers, setProviders] = useState([]);
    const [criticalContacts, setCriticalContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        setIsLoading(true);
        setError(null);

        Promise.all([
            fetchProviders({}, { signal: controller.signal }),
            fetchCriticalContacts({ signal: controller.signal }),
        ])
            .then(([providerPayload, contactPayload]) => {
                setProviders(asList(providerPayload));
                setCriticalContacts(asList(contactPayload));
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setError(err.message || t('loadDashboardError'));
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            });

        return () => controller.abort();
    }, [t]);

    const formatDate = (value) =>
        value
            ? new Intl.DateTimeFormat(dateLocale, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                  hour12: true,
              }).format(new Date(value))
            : '—';

    const providerStats = useMemo(() => {
        const approved = providers.filter((item) => item.status === 'approved');
        const pending = providers.filter((item) => item.status === 'pending');

        return {
            total: providers.length,
            approved: approved.length,
            pending: pending.length,
            critical: criticalContacts.length,
            recent: providers
                .slice()
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 5),
        };
    }, [providers, criticalContacts]);

    return (
        <div className="stack">
            <section className="panel hero">
                <div>
                    <p className="panel__eyebrow">{t('pulseEyebrow')}</p>
                    <h2>{t('pulseTitle')}</h2>
                    <p className="panel__description">{t('pulseDescription')}</p>
                    <div className="hero__tags">
                        <span>{t('tagOffline')}</span>
                        <span>{t('tagBilingual')}</span>
                        <span>{t('tagApprovals')}</span>
                        <span>{t('tagOtp')}</span>
                    </div>
                </div>
                <div className="hero__callout">
                    <p className="hero__number">{providerStats.approved}</p>
                    <p className="hero__label">{t('approvedProviders')}</p>
                    <p className="hero__meta">{t('awaitingVerification', { count: providerStats.pending })}</p>
                </div>
            </section>

            {error ? (
                <div className="panel error-panel">{error}</div>
            ) : (
                <>
                    <section className="metric-grid">
                        <MetricCard
                            title={t('metricProviders')}
                            value={`${providerStats.approved}/${providerStats.total}`}
                            subtitle={t('metricProvidersSub')}
                            delta={t('metricProvidersDelta', { count: providerStats.pending })}
                            tone="accent"
                            footer={t('metricProvidersFooter')}
                        />
                        <MetricCard
                            title={t('metricCritical')}
                            value={providerStats.critical}
                            subtitle={t('metricCriticalSub')}
                            delta={providerStats.critical ? t('metricCriticalOnline') : t('metricCriticalEmpty')}
                            tone="plum"
                            footer={t('metricCriticalFooter')}
                        />
                        <MetricCard
                            title={t('metricRecent')}
                            value={providerStats.recent.length}
                            subtitle={t('metricRecentSub')}
                            delta={providerStats.total ? t('metricRecentDelta') : t('metricRecentWaiting')}
                            tone="jade"
                            footer={t('metricRecentFooter')}
                        />
                    </section>

                    <section className="panel">
                        <div className="panel__header">
                            <div>
                                <p className="panel__eyebrow">{t('activityEyebrow')}</p>
                                <h3>{t('activityTitle')}</h3>
                            </div>
                            <p>{t('activityHint')}</p>
                        </div>
                        {isLoading ? (
                            <p>{t('loadingProviders')}</p>
                        ) : providerStats.recent.length ? (
                            <ul className="timeline">
                                {providerStats.recent.map((item) => (
                                    <li key={item._id}>
                                        <div className="timeline__main">
                                            {item.imageUrl ? (
                                                <ProviderImage
                                                    src={item.imageUrl}
                                                    alt={item.organizationName}
                                                    className="provider-image provider-image--sm"
                                                />
                                            ) : (
                                                <div className="provider-image provider-image--sm provider-image--empty">
                                                    —
                                                </div>
                                            )}
                                            <div>
                                                <strong>{item.organizationName}</strong>
                                                <p>{tService(item.serviceType)}</p>
                                            </div>
                                        </div>
                                        <div className="timeline__meta">
                                            <p className="badge">{tStatus(item.status)}</p>
                                            <p>{formatDate(item.updatedAt)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <EmptyState title={t('emptyProvidersTitle')} description={t('emptyProvidersDesc')} />
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default OverviewPage;
