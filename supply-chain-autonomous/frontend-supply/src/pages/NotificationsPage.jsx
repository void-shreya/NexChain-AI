import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Info,
  ExternalLink,
  CheckCheck,
} from 'lucide-react';
import { notificationsApi } from '../services/api';
import { useDisruption } from '../context/DisruptionContext';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadNotificationCount } = useDisruption();
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsApi.getAll();
      if (res.data?.success) {
        setNotifications(res.data.data);
        setUnreadNotificationCount(res.data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id, link) => {
    try {
      await notificationsApi.markRead(id);
      loadNotifications();
      if (link) navigate(link);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Bell size={24} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.4rem' }}>Real-Time Operational Alerts</h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Live push events, stockout warnings, shipment delays, and AI human approval requests.
          </p>
        </div>

        <button onClick={handleMarkAllRead} className="btn btn-secondary">
          <CheckCheck size={16} />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {notifications.map((item) => {
          const isCritical = item.type === 'CRITICAL' || item.severity === 'HIGH';
          const isApproval = item.type === 'APPROVAL_REQUIRED';

          return (
            <div
              key={item.id}
              onClick={() => handleMarkRead(item.id, item.link)}
              className="glass-panel"
              style={{
                padding: '1.25rem',
                cursor: 'pointer',
                borderColor: !item.is_read ? 'var(--accent-cyan)' : 'var(--border-color)',
                backgroundColor: !item.is_read ? 'rgba(6, 182, 212, 0.06)' : 'var(--bg-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: isCritical
                      ? 'rgba(244, 63, 94, 0.2)'
                      : isApproval
                      ? 'rgba(245, 158, 11, 0.2)'
                      : 'rgba(6, 182, 212, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isCritical ? (
                    <Flame size={20} color="#f43f5e" />
                  ) : isApproval ? (
                    <AlertTriangle size={20} color="#f59e0b" />
                  ) : (
                    <Info size={20} color="var(--accent-cyan)" />
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                    <h4 style={{ fontSize: '0.95rem' }}>{item.title}</h4>
                    {!item.is_read && (
                      <span className="badge badge-info" style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}>
                        NEW
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {item.message}
                  </p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {item.link && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-cyan)', fontSize: '0.78rem', fontWeight: 600 }}>
                  <span>Review</span>
                  <ExternalLink size={14} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
