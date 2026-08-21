import { useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import { useApp } from '../context/AppContext';

function NotificationsPage() {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const { currentUser, notifications, showToast } = useApp();

  const visibleNotifications = useMemo(() => notifications.filter((notification) => {
    const roleMatches = !notification.role || notification.role === currentUser?.role;
    const isRead = notification.read || readIds.includes(notification.id);
    return roleMatches && (!showUnreadOnly || !isRead);
  }), [currentUser, notifications, readIds, showUnreadOnly]);

  function markRead(id: string) {
    setReadIds((ids) => [...ids, id]);
  }

  function markAllRead() {
    setReadIds(notifications.map((notification) => notification.id));
    showToast('All visible notifications marked as read.', 'info');
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow="IN-APP NOTIFICATIONS" title="Notifications" description="View account, project, conflict, approval, complaint, inspection and restoration updates." action={<button className="road-button road-button-secondary" onClick={markAllRead}>Mark All Read</button>} />

      <section className="notification-toolbar page-enter">
        <div><strong>{visibleNotifications.length}</strong><span>visible notifications</span></div>
        <label className="switch-row compact-switch"><div><strong>Unread only</strong></div><input type="checkbox" checked={showUnreadOnly} onChange={(event) => setShowUnreadOnly(event.target.checked)} /></label>
      </section>

      <section className="notification-list">
        {visibleNotifications.length === 0 ? (
          <div className="content-card"><EmptyState icon="◌" title="No unread notifications" description="New workflow updates will appear here." /></div>
        ) : visibleNotifications.map((notification, index) => {
          const read = notification.read || readIds.includes(notification.id);
          const tone = notification.title.toLowerCase().includes('conflict') ? 'danger' : notification.title.toLowerCase().includes('approved') ? 'success' : notification.title.toLowerCase().includes('reminder') ? 'warning' : 'info';
          return (
            <article key={notification.id} className={`notification-item notification-${tone} ${read ? 'notification-read' : ''} card-enter`} style={{ animationDelay: `${index * 55}ms` }}>
              <div className="notification-symbol">{tone === 'danger' ? '!' : tone === 'success' ? '✓' : tone === 'warning' ? '◷' : 'i'}</div>
              <div><span>{notification.time}</span><h2>{notification.title}</h2><p>{notification.message}</p></div>
              {!read && <button onClick={() => markRead(notification.id)}>Mark read</button>}
            </article>
          );
        })}
      </section>
    </div>
  );
}

export default NotificationsPage;
