import React from 'react';
import { useDisruption } from '../context/DisruptionContext';

export const HologramSphere = ({ size = 90, label = 'GUARDIAN CORE', subtitle = 'AI NEURAL ACTIVE' }) => {
  const { activeDisruptions } = useDisruption();
  const isAlert = activeDisruptions.length > 0;

  const primaryColor = isAlert ? '#f43f5e' : '#06b6d4';
  const glowColor = isAlert ? 'rgba(244, 63, 94, 0.6)' : 'rgba(6, 182, 212, 0.6)';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        padding: '0.65rem 0.85rem',
        backgroundColor: isAlert ? 'rgba(244, 63, 94, 0.08)' : 'rgba(6, 182, 212, 0.08)',
        border: `1px solid ${isAlert ? 'rgba(244, 63, 94, 0.3)' : 'rgba(6, 182, 212, 0.25)'}`,
        borderRadius: 'var(--border-radius-md)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 3D Hologram Laser Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
          boxShadow: `0 0 8px ${primaryColor}`,
          animation: 'laserSweep 3s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* 3D Hologram Gyro Sphere Visual */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: 'relative',
          perspective: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {/* Ring 1 (X rotation) */}
        <div
          style={{
            position: 'absolute',
            width: '90%',
            height: '90%',
            borderRadius: '50%',
            border: `1.5px dashed ${primaryColor}`,
            boxShadow: `0 0 10px ${glowColor}`,
            animation: isAlert ? 'gyroSpin1 3s linear infinite' : 'gyroSpin1 8s linear infinite',
            transformStyle: 'preserve-3d',
          }}
        />

        {/* Ring 2 (Y rotation) */}
        <div
          style={{
            position: 'absolute',
            width: '74%',
            height: '74%',
            borderRadius: '50%',
            border: `1px solid ${isAlert ? '#fbbf24' : '#a855f7'}`,
            boxShadow: `0 0 8px ${isAlert ? 'rgba(251, 191, 36, 0.5)' : 'rgba(168, 85, 247, 0.4)'}`,
            animation: isAlert ? 'gyroSpin2 2.5s linear infinite reverse' : 'gyroSpin2 6s linear infinite reverse',
            transformStyle: 'preserve-3d',
          }}
        />

        {/* Ring 3 (Z axis diagonal) */}
        <div
          style={{
            position: 'absolute',
            width: '56%',
            height: '56%',
            borderRadius: '50%',
            border: `1px dotted ${isAlert ? '#f43f5e' : '#10b981'}`,
            animation: 'gyroSpin3 10s linear infinite',
            transformStyle: 'preserve-3d',
          }}
        />

        {/* Core Glowing Hologram Node */}
        <div
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: primaryColor,
            boxShadow: `0 0 15px ${primaryColor}, 0 0 25px ${primaryColor}`,
            animation: 'pulseRadar 1.5s infinite',
            zIndex: 2,
          }}
        />
      </div>

      {/* Telemetry Label */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '0.65rem',
            color: isAlert ? '#f43f5e' : 'var(--accent-cyan)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontFamily: 'monospace',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginTop: '2px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {isAlert ? '🚨 DISRUPTION IN PROGRESS' : subtitle}
        </div>
        <div
          style={{
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            marginTop: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isAlert ? '#f43f5e' : '#10b981',
              display: 'inline-block',
            }}
          />
          <span>{isAlert ? 'MCDA Reroute Evaluated' : '15-Step Neural Watcher Armed'}</span>
        </div>
      </div>
    </div>
  );
};
