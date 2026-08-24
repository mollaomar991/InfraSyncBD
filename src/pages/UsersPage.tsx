import { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import type { AccountStatus } from '../types';
import { roleLabel } from '../utils';
import styles from './UsersPage.module.css';

function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const { users, currentUser, updateUserStatus } = useApp();

  const visibleUsers = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    return users.filter((user) => {
      const matchesSearch = [user.name, user.email, user.organization].join(' ').toLowerCase().includes(normalizedSearch);
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [roleFilter, search, users]);

  function toggleStatus(userId: string, currentStatus: AccountStatus) {
    updateUserStatus(userId, currentStatus === 'Suspended' ? 'Active' : 'Suspended');
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow="ROLE AND ACCESS CONTROL" title="System Users" description="View users, account status, roles and organization access across the platform." />

      <section className="filter-toolbar page-enter">
        <label className="search-field"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search user, email or organization..." /></label>
        <label className="filter-select"><span>Role</span><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option>All</option><option value="super_admin">Super Admin</option><option value="department_officer">Department Officer</option><option value="contractor">Contractor</option><option value="citizen">Citizen</option></select></label>
        <div className={`filter-summary ${styles.filterSummary}`}><strong>{visibleUsers.length}</strong><span>users found</span></div>
      </section>

      <section className="content-card page-enter">
        <div className="table-responsive">
          <table className={`data-table user-table ${styles.userTable}`}>
            <thead><tr><th>User</th><th>Role</th><th>Organization</th><th>Contact</th><th>Status</th><th>Access action</th></tr></thead>
            <tbody>
              {visibleUsers.map((user) => (
                <tr key={user.id}>
                  <td><div className={`user-cell ${styles.userCell}`}><div className={styles.userAvatar}>{user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div className={styles.userInfo}><strong>{user.name}</strong><small>{user.id}</small></div></div></td>
                  <td>{roleLabel(user.role)}</td>
                  <td>{user.organization}</td>
                  <td><strong>{user.email}</strong><small>{user.phone || 'No phone stored'}</small></td>
                  <td><StatusBadge value={user.accountStatus} /></td>
                  <td>{user.id === currentUser?.id ? <span className="monitor-only-label">CURRENT ACCOUNT</span> : <button className={user.accountStatus === 'Suspended' ? 'road-button road-button-primary' : 'road-button road-button-danger'} onClick={() => toggleStatus(user.id, user.accountStatus)}>{user.accountStatus === 'Suspended' ? 'Reactivate' : 'Suspend'}</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default UsersPage;
