import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { navigationItems } from '../data/navigation';
import { useApp } from '../context/AppContext';
import { getInitials, roleLabel } from '../utils';
import styles from './AppLayout.module.css';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const userNavigation = navigationItems.filter((item) =>
    item.roles.includes(currentUser.role),
  );
  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className={styles.shell}>
      {sidebarOpen && (
        <button
          className={styles.mobileOverlay}
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}
      >
        <div className={styles.brand}>
          <img src="/InfraSync.png" alt="Logo" className={styles.brandMark} />
          <div>
            <strong>
              InfraSync <span>BD</span>
            </strong>
            <small>Road coordination system</small>
          </div>
        </div>

        <div className={styles.roleBox}>
          <span>Signed in as</span>
          <strong>{roleLabel(currentUser.role)}</strong>
        </div>

        <nav className={styles.nav} aria-label="Main navigation">
          {userNavigation.map((item) => (
            <NavLink
              key={`${item.path}-${item.label}`}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <p>Vite + React 18 + TypeScript</p>
          <p>Mosh-style learning structure</p>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              className={styles.menuButton}
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              ☰
            </button>
            <span className={styles.systemPulse} aria-hidden="true" />
            <div className={styles.topbarLabel}>
              <small>System status</small>
              <strong>Coordination portal online</strong>
            </div>
          </div>

          <div className={styles.topbarActions}>
            <div className={styles.userCard}>
              <div className={styles.avatar}>{getInitials(currentUser.name)}</div>
              <div className={styles.userMeta}>
                <strong>{currentUser.name}</strong>
                <small>{currentUser.organization}</small>
              </div>
              <button
                className={styles.logoutButton}
                type="button"
                onClick={handleLogout}
              >
                LOG OUT
              </button>
            </div>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
