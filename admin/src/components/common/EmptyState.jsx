import { useLanguage } from '../../context/LanguageContext.jsx';

const EmptyState = ({ title, description }) => {
  const { t } = useLanguage();
  const resolvedTitle = title || t('emptyDefaultTitle');
  const resolvedDescription = description || t('emptyDefaultDesc');
  return (
    <div className="empty-state">
      <p className="empty-state__title">{resolvedTitle}</p>
      <p className="empty-state__description">{resolvedDescription}</p>
    </div>
  );
};

export default EmptyState;
