import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';

const DashboardLayout = () => {
  const [navOpen, setNavOpen] = useState(false);

  const closeNav = () => setNavOpen(false);

  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [navOpen]);

  return (
    <div className={`layout-shell ${navOpen ? 'layout-shell--nav-open' : ''}`}>
      <button
        type="button"
        className="sidebar-backdrop"
        aria-label="Close navigation"
        tabIndex={navOpen ? 0 : -1}
        onClick={closeNav}
      />
      <Sidebar onNavigate={closeNav} />
      <div className="layout-content">
        <TopBar menuOpen={navOpen} onMenuToggle={() => setNavOpen((open) => !open)} />
        <section className="page-canvas">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default DashboardLayout;
