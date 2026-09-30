import React, { useState } from 'react';
import {
  Zap,
  Mic,
  Sun,
  Moon,
  Bell,
  RefreshCw,
  AlertOctagon,
  ChevronDown,
  User,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useDisruption } from '../context/DisruptionContext';
import { demoApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const Navbar = ({ onOpenVoiceModal }) => {
  const { user, quickLogin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { activeDisruptions, isDemoRunning, triggerDemoDisruption, unreadNotificationCount } = useDisruption();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await demoApi.reset();
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 90,
      }}
    >
      {/* Left: System Status & Alerts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="pulse-indicator pulse-indicator-green" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            CONTROL TOWER TELEMETRY: <span style={{ color: 'var(--accent-emerald)' }}>ONLINE</span>
          </span>
        </div>

        {activeDisruptions.length > 0 && (
          <div
            onClick={() => navigate('/decisions')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              borderRadius: 'var(--border-radius-full)',
              padding: '0.3rem 0.85rem',
              animation: 'pulseRadar 2s infinite',
            }}
          >
            <AlertOctagon size={15} color="#f43f5e" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fb7185' }}>
              CRITICAL DISRUPTION: PUNE HUB HALTED
            </span>
          </div>
        )}
      </div>

      {/* Right: Actions, Voice, Theme, Demo Trigger & User Role */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Reset Demo State Button */}
        <button
          onClick={handleResetDemo}
          title="Reset all demo data to pristine state"
          className="btn btn-secondary"
          style={{ padding: '0.5rem 0.8rem', fontSize: '0.78rem' }}
          disabled={isResetting}
        >
          <RotateCcw size={14} className={isResetting ? 'animate-spin' : ''} />
          <span>Reset State</span>
        </button>

        {/* DEMO DISRUPTION BUTTON (Primary Hackathon Demo Trigger) */}
        <button
          onClick={triggerDemoDisruption}
          disabled={isDemoRunning}
          className="btn btn-demo-trigger"
          style={{ padding: '0.55rem 1.15rem' }}
          title="Simulate Pune Chakan 5-Day Supplier Shutdown & trigger 15-step agentic workflow"
        >
          <Zap size={16} fill="#ffffff" />
          <span>{isDemoRunning ? 'Simulating Response...' : 'DEMO DISRUPTION'}</span>
        </button>

        {/* Voice AI Assistant Trigger */}
        <button
          onClick={onOpenVoiceModal}
          className="btn btn-secondary"
          style={{
            borderColor: 'var(--accent-cyan)',
            color: 'var(--accent-cyan)',
            boxShadow: 'var(--shadow-glow-cyan)',
          }}
          title="Activate Voice AI Assistant"
        >
          <Mic size={16} />
          <span>Voice AI</span>
        </button>

        {/* Notifications Icon */}
        <button
          onClick={() => navigate('/notifications')}
          className="btn btn-secondary"
          style={{ padding: '0.6rem', position: 'relative' }}
          title="View Notifications"
        >
          <Bell size={18} />
          {unreadNotificationCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#f43f5e',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {unreadNotificationCount}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary"
          style={{ padding: '0.6rem' }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
        </button>

        {/* User Role Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--border-radius-md)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'rgba(6, 182, 212, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{user?.full_name || 'Guest User'}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)' }}>{user?.role_id || 'SUPPLY_MANAGER'}</div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {showRoleMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '115%',
                width: '230px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.5rem',
                zIndex: 200,
              }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', padding: '0.35rem 0.6rem', textTransform: 'uppercase' }}>
                Switch Demo Role:
              </div>
              {[
                { role: 'SUPPLY_MANAGER', label: 'Supply Manager' },
                { role: 'ADMIN', label: 'System Admin' },
                { role: 'OPERATIONS_MANAGER', label: 'Operations Lead' },
                { role: 'VIEWER', label: 'Executive Viewer' },
              ].map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    quickLogin(r.role);
                    setShowRoleMenu(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.45rem 0.6rem',
                    fontSize: '0.78rem',
                    borderRadius: '4px',
                    backgroundColor: user?.role_id === r.role ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                    color: user?.role_id === r.role ? '#38bdf8' : 'var(--text-primary)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{r.label}</span>
                  {user?.role_id === r.role && <Shield size={12} />}
                </button>
              ))}
              <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.4rem 0' }} />
              <button
                onClick={logout}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.45rem 0.6rem',
                  fontSize: '0.78rem',
                  color: '#fb7185',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
