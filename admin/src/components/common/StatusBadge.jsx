import { useLanguage } from '../../context/LanguageContext.jsx';

const palette = {
  approved: 'badge--positive',
  pending: 'badge--amber',
  rejected: 'badge--danger',
  open: 'badge--info',
  assigned: 'badge--violet',
  resolved: 'badge--positive',
  cancelled: 'badge--muted',
  high: 'badge--danger',
  medium: 'badge--amber',
  low: 'badge--muted',
  critical: 'badge--danger',
  new: 'badge--info',
  in_progress: 'badge--amber',
  closed: 'badge--positive',
};

const StatusBadge = ({ value }) => {
  const { tStatus } = useLanguage();
  if (!value) {
    return null;
  }
  const normalized = value.toLowerCase();
  const tone = palette[normalized] || 'badge--muted';
  return <span className={`badge ${tone}`}>{tStatus(normalized)}</span>;
};

export default StatusBadge;
