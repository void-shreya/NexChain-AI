import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  AlertTriangle,
  FlaskConical,
  Building2,
  Boxes,
  ShoppingBag,
  Truck,
  Bot,
  Scale,
  FileCheck2,
  Bell,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import { useDisruption } from '../context/DisruptionContext';

const navigationItems = [
  { path: '/dashboard', label: 'Control Tower', icon: LayoutDashboard },
  { path: '/control-tower', label: 'Live GIS Radar', icon: Radio },
  { path: '/disruptions', label: 'Disruptions', icon: AlertTriangle, badgeKey: 'disruptions' },
  { path: '/simulation', label: 'What-If Engine', icon: FlaskConical },
  { path: '/decisions', label: 'Decision Engine', icon: Scale },
  { path: '/ai-agent', label: 'Guardian Agent', icon: Bot },
  { path: '/suppliers', label: 'Supplier Intel', icon: Building2 },
  { path: '/inventory', label: 'Inventory Health', icon: Boxes },
  { path: '/orders', label: 'Orders & SLAs', icon: ShoppingBag },
  { path: '/tracking', label: 'Fleet Telemetry', icon: Truck },
  { path: '/audit-log', label: 'AI Audit Trail', icon: FileCheck2 },
  { path: '/notifications', label: 'Alerts', icon: Bell, badgeKey: 'notifications' },
  { path: '/settings', label: 'Settings & Policy', icon: Settings },
];

export const Sidebar = () => {
  const { activeDisruptions, unreadNotificationCount } = useDisruption();

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100,
        userSelect: 'none',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
          }}
        >
          <Bot size={22} color="#ffffff" />
        </div>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.05rem',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(90deg, #f8fafc, #38bdf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            NEXCHAIN AI
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            SupplyChain Guardian
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav
        style={{
          flex: 1,
          padding: '1rem 0.75rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.9rem',
                borderRadius: 'var(--border-radius-md)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                borderLeft: isActive ? '3px solid #06b6d4' : '3px solid transparent',
                transition: 'all var(--transition-fast)',
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.badgeKey === 'disruptions' && activeDisruptions.length > 0 && (
                <span className="badge badge-critical" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                  {activeDisruptions.length}
                </span>
              )}
              {item.badgeKey === 'notifications' && unreadNotificationCount > 0 && (
                <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                  {unreadNotificationCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Autonomous Guard Indicator Footer */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Agent Autonomy
          </span>
          <span className="pulse-indicator pulse-indicator-green" />
        </div>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>
          AUTONOMOUS ACTIVE
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          Auto-Execute Threshold: ₹5,00,000
        </div>
      </div>
    </aside>
  );
};
