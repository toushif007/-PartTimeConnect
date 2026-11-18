import React from 'react';
import { Bell, CheckCheck, Trash2, Calendar, Award, FileCheck, Info } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import { useNotifications } from '../../context/NotificationContext';
import EmptyState from '../../components/common/EmptyState';

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--slate-900)' }}>
              Notifications
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
              Stay updated on application status changes and scheduled interviews.
            </p>
          </div>

          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="btn btn-secondary btn-sm">
              <CheckCheck size={16} /> Mark All as Read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="When employers update your application status or schedule interviews, alerts will appear here."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '750px' }}>
            {notifications.map((n) => (
              <div
                key={n._id}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  borderLeft: n.isRead ? '1px solid var(--slate-200)' : '4px solid var(--primary-600)',
                  background: n.isRead ? '#ffffff' : 'var(--primary-50)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      background: n.isRead ? 'var(--slate-100)' : '#ffffff',
                      color: 'var(--primary-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Bell size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: n.isRead ? '600' : '800', color: 'var(--slate-900)' }}>
                      {n.title}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '2px', lineHeight: '1.5' }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '4px', display: 'inline-block' }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    onClick={() => markAsRead(n._id)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;
