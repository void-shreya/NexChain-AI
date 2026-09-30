import React, { useState, useEffect, useRef } from 'react';
import { Bot, Lock, Mail, ArrowRight, ShieldCheck, Zap, Eye, EyeOff, UserCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Auth3DBackground } from '../components/Auth3DBackground';
import { Auth3DHeroCore } from '../components/Auth3DHeroCore';

export const LoginPage = () => {
  const [email, setEmail] = useState('supply.manager@nexchain.ai');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('SUPPLY_MANAGER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 3D Card interactive tilt
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Proactively wake up cloud backend (e.g. Render spin-down) as soon as user opens page
    const backendUrl = typeof window !== 'undefined' && !window.location.hostname.includes('localhost')
      ? 'https://nexchain-ai.onrender.com/api'
      : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
    fetch(`${backendUrl}/health`, { method: 'GET' }).catch(() => {});
  }, []);

  const handleCardMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCardTilt({ x: -y * 8, y: x * 8 });
  };

  const handleCardMouseLeave = () => {
    setCardTilt({ x: 0, y: 0 });
  };

  const demoRoles = [
    {
      role: 'SUPPLY_MANAGER',
      label: 'Supply Manager',
      email: 'supply.manager@nexchain.ai',
      badge: 'Autonomous Lead',
      color: '#06b6d4',
    },
    {
      role: 'ADMIN',
      label: 'System Admin',
      email: 'admin@nexchain.ai',
      badge: 'Full Root Privileges',
      color: '#38bdf8',
    },
    {
      role: 'OPERATIONS_MANAGER',
      label: 'Operations Lead',
      email: 'ops.lead@nexchain.ai',
      badge: 'Fleet Dispatcher',
      color: '#10b981',
    },
    {
      role: 'VIEWER',
      label: 'Executive Viewer',
      email: 'viewer@nexchain.ai',
      badge: 'Read-Only Telemetry',
      color: '#a855f7',
    },
  ];

  const handleSelectRole = (r) => {
    setSelectedRole(r.role);
    setEmail(r.email);
    setPassword('Password123!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    setSelectedRole(role);
    setError('');
    setLoading(true);
    try {
      await quickLogin(role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const [activePlaceId, setActivePlaceId] = useState('PUNE');

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        overflowX: 'hidden',
      }}
    >
      {/* 3D Interactive Cyber Space Parallax Canvas Background */}
      <Auth3DBackground activePlaceId={activePlaceId} />

      {/* Main Split-Screen Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '1100px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '3rem',
          alignItems: 'center',
        }}
      >
        {/* Left Side: 3D Holographic Spatial Core & Live Corridors Telemetry */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Auth3DHeroCore selectedPlaceId={activePlaceId} onSelectPlace={(p) => setActivePlaceId(p.id)} />
        </div>

        {/* Right Side: Interactive 3D Cyber Authentication Terminal */}
        <div
          ref={cardRef}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          className="glass-panel"
          style={{
            position: 'relative',
            padding: '2.25rem',
            borderRadius: '20px',
            borderColor: 'rgba(6, 182, 212, 0.4)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 35px rgba(6, 182, 212, 0.25)',
            transform: `perspective(1000px) rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`,
            transition: 'transform 0.15s ease-out, box-shadow 0.2s ease',
            background: 'linear-gradient(135deg, rgba(13, 21, 39, 0.85) 0%, rgba(7, 11, 20, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            overflow: 'hidden',
          }}
        >
          {/* Hologram Corner Brackets */}
          <div className="hologram-bracket-tl" />
          <div className="hologram-bracket-tr" />
          <div className="hologram-bracket-bl" />
          <div className="hologram-bracket-br" />

          {/* Top Laser Line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #06b6d4, #38bdf8, transparent)',
              boxShadow: '0 0 10px #06b6d4',
            }}
          />

          {/* Interactive Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '10px',
              padding: '4px',
              marginBottom: '1.75rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <button
              type="button"
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(6, 182, 212, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
              }}
            >
              <Lock size={14} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
              }}
            >
              <UserCheck size={14} />
              <span>Register</span>
            </button>
          </div>

          {/* Card Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Control Tower Access</h2>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontFamily: 'monospace',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                ● 256-BIT ENCRYPTION
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Authenticate credentials to interact with autonomous agents & live telemetry.
            </p>
          </div>

          {/* 1-Click Interactive Role Personas (Hackathon Fast-Track) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                <Zap size={14} />
                <span>1-Click Hackathon Personas:</span>
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Auto-fill & Log In</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {demoRoles.map((r) => {
                const isSelected = selectedRole === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => {
                      handleSelectRole(r);
                      handleQuickLogin(r.role);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isSelected ? r.color : 'rgba(255, 255, 255, 0.08)'}`,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? `0 0 12px ${r.color}40` : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                        {r.label}
                      </span>
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: r.color,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.65rem', color: isSelected ? r.color : 'var(--text-muted)', marginTop: '2px' }}>
                      {r.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>OR AUTHENTICATE MANUALLY</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                borderRadius: '8px',
                color: '#fb7185',
                fontSize: '0.8rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <KeyRound size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  marginBottom: '0.35rem',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}
              >
                Corporate Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '12px',
                    color: 'var(--accent-cyan)',
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@nexchain.ai"
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    color: 'var(--text-primary)',
                    padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent-cyan)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(6, 182, 212, 0.3)')}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                  }}
                >
                  Password Key
                </label>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Demo: Password123!</span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '12px',
                    color: 'var(--accent-cyan)',
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    color: 'var(--text-primary)',
                    padding: '0.65rem 2.4rem 0.65rem 2.4rem',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent-cyan)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(6, 182, 212, 0.3)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                marginTop: '0.5rem',
                fontSize: '0.9rem',
                background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                boxShadow: 'var(--shadow-glow-cyan)',
              }}
            >
              <span>{loading ? 'Authenticating Token...' : 'Enter Autonomous Control Tower'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Footer Link */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Need enterprise access?{' '}
            <Link to="/register" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 700 }}>
              Create Corporate Account ➔
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
