import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import LoginPage from './pages/Login.jsx';
import OtpPage from './pages/Otp.jsx';
import ForgotPasswordPage from './pages/ForgotPassword.jsx';
import OverviewPage from './pages/Overview.jsx';
import ProvidersPage from './pages/Providers.jsx';
import SiteContactPage from './pages/SiteContact.jsx';
import PolicyPage from './pages/Policy.jsx';
import TermsPage from './pages/Terms.jsx';
import CriticalContactsPage from './pages/CriticalContacts.jsx';
import NotFoundPage from './pages/NotFound.jsx';
import './App.css';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/otp" element={<OtpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="providers" element={<ProvidersPage />} />
        <Route path="critical-contacts" element={<CriticalContactsPage />} />
        <Route path="site-contact" element={<SiteContactPage />} />
        <Route path="policy" element={<PolicyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
