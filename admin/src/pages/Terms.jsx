import { fetchTerms, updateTerms } from '../api/site.js';
import LegalDocumentPage from './LegalDocument.jsx';

const TERMS_COPY = {
  eyebrow: 'termsEyebrow',
  title: 'termsTitle',
  hint: 'termsHint',
  loadError: 'loadTermsError',
  saved: 'termsSaved',
  saveError: 'saveTermsError',
  loading: 'loadingTerms',
  save: 'saveTerms',
};

const TermsPage = () => (
  <LegalDocumentPage fetchDoc={fetchTerms} updateDoc={updateTerms} copyKeys={TERMS_COPY} />
);

export default TermsPage;
