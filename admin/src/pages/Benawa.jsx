import { fetchBenawa, updateBenawa } from '../api/site.js';
import LegalDocumentPage from './LegalDocument.jsx';

const BENAWA_COPY = {
  eyebrow: 'benawaEyebrow',
  title: 'benawaTitle',
  hint: 'benawaHint',
  loadError: 'loadBenawaError',
  saved: 'benawaSaved',
  saveError: 'saveBenawaError',
  loading: 'loadingBenawa',
  save: 'saveBenawa',
};

const BenawaPage = () => (
  <LegalDocumentPage fetchDoc={fetchBenawa} updateDoc={updateBenawa} copyKeys={BENAWA_COPY} />
);

export default BenawaPage;
