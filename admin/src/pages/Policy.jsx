import { fetchPolicy, updatePolicy } from '../api/site.js';
import LegalDocumentPage from './LegalDocument.jsx';

const POLICY_COPY = {
  eyebrow: 'policyEyebrow',
  title: 'policyTitle',
  hint: 'policyHint',
  loadError: 'loadPolicyError',
  saved: 'policySaved',
  saveError: 'savePolicyError',
  loading: 'loadingPolicy',
  save: 'savePolicy',
};

const PolicyPage = () => (
  <LegalDocumentPage fetchDoc={fetchPolicy} updateDoc={updatePolicy} copyKeys={POLICY_COPY} />
);

export default PolicyPage;
