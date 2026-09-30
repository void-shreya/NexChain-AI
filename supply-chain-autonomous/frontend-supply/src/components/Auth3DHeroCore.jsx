import React, { useState } from 'react';
import { ShieldCheck, Activity, Radio, Cpu, Sparkles, Navigation } from 'lucide-react';

export const Auth3DHeroCore = () => {
  const [selectedHub, setSelectedHub] = useState('PUNE');

  const hubs = [
    { id: 'PUNE', name: 'Pune Chakan Hub', state: 'Active Telemetry', alert: false, inventory: '₹14.2 Cr', buffer: '6.4 Days' },
    { id: 'BLR', name: 'Bharat Silicon BLR', state: 'Qualified Foundry', alert: false, inventory: '₹22.5 Cr', buffer: '12.0 Days' },
    { id: 'BOM', name: 'Bhiwandi Mega DC', state: 'Western Corridor', alert: false, inventory: '₹38.1 Cr', buffer: '8.2 Days' },
    { id: 'DEL', name: 'NCR Logistics Core', state: 'Northern Depot', alert: false, inventory: '₹19.4 Cr', buffer: '9.5 Days' },
  ];

  const current = hubs.find((h) => h.id === selectedHub) || hubs[0];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        maxWidth: '480px',
        width: '100%',
      }}
    >
      {/* Platform Branding Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            boxShadow: 'var(--shadow-glow-cyan)',
          }}
        >
          <span className="pulse-indicator pulse-indicator-green" />
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            NEXCHAIN AI • SPATIAL TOWER v2.4
          </span>
        </div>
      </div>

      {/* Main Title & Value Prop */}
      <div>
        <h1
          style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            lineHeight: 1.15,
            background: 'linear-gradient(135deg, #ffffff 40%, #38bdf8 80%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Autonomous Supply Chain Control Tower
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.65rem', lineHeight: 1.5 }}>
          Predict multi-tier bottlenecks, simulate What-If scenarios, and execute 15-step recovery workflows in seconds.
        </p>
      </div>

      {/* 3D Holographic Gyroscope Orb Chamber */}
      <div
        className="hologram-chamber"
        style={{
          height: '240px',
          borderRadius: '16px',
          position: 'relative',
          background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.12) 0%, rgba(13, 21, 39, 0.7) 70%)',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          boxShadow: '0 0 35px rgba(6, 182, 212, 0.2), inset 0 0 30px rgba(6, 182, 212, 0.08)',
        }}
      >
        {/* Laser Sweep Beam */}
        <div className="hologram-laser-sweep" style={{ height: '3px' }} />

        {/* 3D Gyroscope Rings */}
        <div
          style={{
            width: '130px',
            height: '130px',
            position: 'relative',
            perspective: '500px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Ring 1 - Cyan X-Axis */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px dashed #06b6d4',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.6)',
              animation: 'gyroSpin1 8s linear infinite',
              transformStyle: 'preserve-3d',
            }}
          />

          {/* Ring 2 - Violet Y-Axis */}
          <div
            style={{
              position: 'absolute',
              width: '78%',
              height: '78%',
              borderRadius: '50%',
              border: '1.5px solid #a855f7',
              boxShadow: '0 0 12px rgba(168, 85, 247, 0.5)',
              animation: 'gyroSpin2 6s linear infinite reverse',
              transformStyle: 'preserve-3d',
            }}
          />

          {/* Ring 3 - Emerald Z-Axis */}
          <div
            style={{
              position: 'absolute',
              width: '58%',
              height: '58%',
              borderRadius: '50%',
              border: '1.5px dotted #10b981',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
              animation: 'gyroSpin3 10s linear infinite',
              transformStyle: 'preserve-3d',
            }}
          />

          {/* Glowing AI Core Node */}
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#38bdf8',
              boxShadow: '0 0 20px #38bdf8, 0 0 40px #06b6d4',
              animation: 'pulseRadar 1.8s infinite',
              zIndex: 3,
            }}
          />
        </div>

        {/* Floating Telemetry Tag */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.75rem',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '9999px',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            fontSize: '0.7rem',
            color: 'var(--text-secondary)',
            fontFamily: 'monospace',
          }}
        >
          <Radio size={12} color="var(--accent-cyan)" />
          <span>REAL-TIME 3D SPATIAL TELEMETRY ONLINE</span>
        </div>
      </div>

      {/* Interactive Hub Node Telemetry Selector */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem',
          borderRadius: '12px',
          borderColor: 'rgba(6, 182, 212, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Interactive Spatial Hubs:
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
            CLICK TO PROBE NODE
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '0.85rem' }}>
          {hubs.map((hub) => (
            <button
              key={hub.id}
              type="button"
              onClick={() => setSelectedHub(hub.id)}
              style={{
                background: selectedHub === hub.id ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${selectedHub === hub.id ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                color: selectedHub === hub.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                borderRadius: '6px',
                padding: '0.4rem 0.2rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {hub.id}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            padding: '0.65rem',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Selected Node</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {current.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#34d399', marginTop: '2px' }}>● {current.state}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Inventory Buffer</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '2px' }}>
              {current.inventory}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Buffer: {current.buffer}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div
          className="hologram-card"
          style={{
            padding: '0.85rem',
            borderRadius: '10px',
          }}
        >
          <div className="hologram-bracket-tl" />
          <div className="hologram-bracket-tr" />
          <div className="hologram-bracket-bl" />
          <div className="hologram-bracket-br" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Cpu size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>15-Step Agent</span>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
            Autonomous multi-criteria optimization matrix evaluating candidate suppliers.
          </p>
        </div>

        <div
          className="hologram-card"
          style={{
            padding: '0.85rem',
            borderRadius: '10px',
          }}
        >
          <div className="hologram-bracket-tl" />
          <div className="hologram-bracket-tr" />
          <div className="hologram-bracket-bl" />
          <div className="hologram-bracket-br" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <ShieldCheck size={16} color="#10b981" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Human-in-the-Loop</span>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
            ₹5L automated threshold with 1-click executive authorization tokens.
          </p>
        </div>
      </div>
    </div>
  );
};
