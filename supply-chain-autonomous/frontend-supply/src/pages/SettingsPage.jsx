import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Sliders,
  Cpu,
  Database,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { agentApi } from '../services/api';
import { useDisruption } from '../context/DisruptionContext';
import { useAuth } from '../context/AuthContext';

export const SettingsPage = () => {
  const [mode, setMode] = useState('AUTONOMOUS');
  const [threshold, setThreshold] = useState(500000);
  const [provider, setProvider] = useState('LOCAL_OR_GEMINI');
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useDisruption();
  const { user } = useAuth();

  const handleSavePolicy = async () => {
    setIsSaving(true);
    try {
      await agentApi.setMode(mode, threshold);
      showToast({
        title: 'Settings Saved',
        message: 'System governance parameters updated successfully.',
        type: 'success',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Settings size={24} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '1.4rem' }}>System Architecture & Governance Settings</h2>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Configure AI autonomous execution boundaries, threshold limits, and database connectivity.
        </p>
      </div>

      {/* Autonomous Agent Control */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Cpu size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1.1rem' }}>SupplyChain Guardian Autonomy Parameters</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Execution Autonomy Level
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {[
                { id: 'AUTONOMOUS', title: 'Autonomous Mode', desc: 'Auto-executes recovery plans under threshold.' },
                { id: 'ASSISTED', title: 'Assisted Mode', desc: 'Prepares draft orders; requires 1-click confirmation.' },
                { id: 'MANUAL_APPROVAL', title: 'Manual Sign-Off', desc: 'Every transaction requires manager digital signature.' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setMode(item.id)}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    backgroundColor: mode === item.id ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-elevated)',
                    border: mode === item.id ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: mode === item.id ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                Automated Execution Expenditure Ceiling (₹ INR)
              </label>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                ₹{Number(threshold).toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="100000"
              max="2500000"
              step="50000"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
            />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Any single purchase order or logistics rerouting cost exceeding this limit will pause for Human-In-The-Loop authorization.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button onClick={handleSavePolicy} disabled={isSaving} className="btn btn-primary">
            <span>{isSaving ? 'Updating...' : 'Save Autonomy Policy'}</span>
          </button>
        </div>
      </div>

      {/* Database & Cloud Telemetry */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Database size={18} color="var(--accent-emerald)" />
          <h3 style={{ fontSize: '1.1rem' }}>Database & Connectivity Status</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Database Layer</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>
              Supabase PostgreSQL / Persistent Relational Adapter (Dual Mode)
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Row Level Security (RLS)</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>
              Enabled (Authenticated Multi-Tenant RBAC)
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Realtime Event Stream</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
              WebSocket Telemetry Stream (Active)
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0' }}>
            <span style={{ color: 'var(--text-muted)' }}>Current User Role</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
              {user?.role_id} ({user?.full_name})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
