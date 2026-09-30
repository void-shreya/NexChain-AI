import React, { useState, useRef } from 'react';
import { Bot, Lock, Mail, User, Shield, ArrowRight, Eye, EyeOff, CheckCircle2, UserCheck, KeyRound } from 'lucide-react';
import { authApi } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Auth3DBackground } from '../components/Auth3DBackground';
import { Auth3DHeroCore } from '../components/Auth3DHeroCore';

export const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('SUPPLY_MANAGER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 3D Card tilt
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const { login } = useAuth();
  const navigate = useNavigate();

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

  // Calculate password strength
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: 'None', color: 'var(--border-color)', percent: 0 };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: '#f43f5e', percent: 25 };
      case 2:
        return { score: 2, label: 'Moderate', color: '#fbbf24', percent: 50 };
      case 3:
        return { score: 3, label: 'Strong', color: '#38bdf8', percent: 75 };
      case 4:
        return { score: 4, label: 'Enterprise Grade', color: '#10b981', percent: 100 };
      default:
        return { score: 0, label: 'Too Short', color: '#f43f5e', percent: 15 };
    }
  };

  const strength = getPasswordStrength();

  const roles = [
    { id: 'SUPPLY_MANAGER', label: 'Supply Manager', desc: 'Direct recovery approvals' },
    { id: 'OPERATIONS_MANAGER', label: 'Operations Lead', desc: 'Fleet & warehouse routing' },
    { id: 'ADMIN', label: 'System Admin', desc: 'Full infrastructure authority' },
    { id: 'VIEWER', label: 'Executive Viewer', desc: 'Read-only telemetry' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.register({
        full_name: fullName,
        email,
        password,
        role_id: role,
      });
      if (res.data?.success) {
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

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
      <Auth3DBackground />

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
          <Auth3DHeroCore />
        </div>

        {/* Right Side: Interactive 3D Cyber Registration Terminal */}
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
              onClick={() => navigate('/login')}
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
              <Lock size={14} />
              <span>Sign In</span>
            </button>
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
              <UserCheck size={14} />
              <span>Register</span>
            </button>
          </div>

          {/* Card Header */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Create Corporate Account</h2>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontFamily: 'monospace',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(6, 182, 212, 0.15)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                }}
              >
                ● ROLE-BASED ACCESS
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Join the SupplyChain Guardian autonomous network with encrypted credentials.
            </p>
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
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
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '12px',
                    color: 'var(--accent-cyan)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Dr. Anand Verma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    color: 'var(--text-primary)',
                    padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent-cyan)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(6, 182, 212, 0.3)')}
                />
              </div>
            </div>

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
                  placeholder="anand.verma@nexchain.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    color: 'var(--text-primary)',
                    padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent-cyan)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(6, 182, 212, 0.3)')}
                />
              </div>
            </div>

            {/* Interactive Role Selection Grid */}
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
                Designation & RBAC Level
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                {roles.map((r) => {
                  const isSelected = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      style={{
                        padding: '0.5rem 0.65rem',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.08)'}`,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                        {r.label}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)', marginTop: '2px' }}>
                        {r.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

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
                Password Key
              </label>
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
                  placeholder="Min 8 chars, numbers & uppercase"
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
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Visualizer Bar */}
              {password && (
                <div style={{ marginTop: '0.45rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: strength.color, marginBottom: '2px', fontWeight: 600 }}>
                    <span>Security Strength</span>
                    <span>{strength.label}</span>
                  </div>
                  <div
                    style={{
                      height: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${strength.percent}%`,
                        backgroundColor: strength.color,
                        transition: 'width 0.3s ease, background-color 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              )}
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
              <span>{loading ? 'Creating Credentials...' : 'Create Account & Launch'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Footer Link */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 700 }}>
              Sign in to Control Tower ➔
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
