import React from 'react';
import { Eye, Shield, X, Radio, Sparkles } from 'lucide-react';
import { HologramCore } from './HologramCore';

export const HologramModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '720px',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-lg), 0 0 45px rgba(6, 182, 212, 0.45)',
          border: '1px solid rgba(6, 182, 212, 0.5)',
          animation: 'modalIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
          position: 'relative',
        }}
      >
        {/* Hologram Corner Brackets */}
        <div className="hologram-bracket-tl" style={{ width: '12px', height: '12px', borderWidth: '3px' }} />
        <div className="hologram-bracket-tr" style={{ width: '12px', height: '12px', borderWidth: '3px' }} />
        <div className="hologram-bracket-bl" style={{ width: '12px', height: '12px', borderWidth: '3px' }} />
        <div className="hologram-bracket-br" style={{ width: '12px', height: '12px', borderWidth: '3px' }} />

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(6, 182, 212, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--accent-cyan)',
                boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)',
              }}
            >
              <Radio size={16} color="var(--accent-cyan)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }} className="hologram-text-glitch" data-text="3D Holographic Supply Matrix">
                3D Holographic Supply Matrix
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Spatial Telemetry & Autonomous Agent Hologram Projector
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 3D Hologram Projection Core */}
        <div style={{ marginBottom: '1rem' }}>
          <HologramCore compact={false} />
        </div>

        {/* Footer Notes */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={13} color="var(--accent-cyan)" />
            <span>Interactive 3D Stage: Move mouse across chamber to adjust projection vector</span>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.85rem' }}>
            Close Projector
          </button>
        </div>
      </div>
    </div>
  );
};
