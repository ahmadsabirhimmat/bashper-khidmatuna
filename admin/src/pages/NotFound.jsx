import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

const NotFoundPage = () => {
  const { t } = useLanguage();
  return (
    <section className="panel">
      <p className="panel__eyebrow">{t('notFoundEyebrow')}</p>
      <h1>{t('notFoundTitle')}</h1>
      <p>{t('notFoundBody')}</p>
      <Link className="primary" to="/">
        {t('backDashboard')}
      </Link>
    </section>
  );
};

export default NotFoundPage;
