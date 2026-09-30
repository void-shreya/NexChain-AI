import React, { useState } from 'react';
import { ShieldCheck, Activity, Radio, Cpu, Sparkles, Navigation, MapPin, Compass, AlertTriangle } from 'lucide-react';
import { SPATIAL_PLACES } from '../utils/spatialPlaces';

export const Auth3DHeroCore = ({ selectedPlaceId = 'PUNE', onSelectPlace = null }) => {
  const [activePlaceId, setActivePlaceId] = useState(selectedPlaceId);

  const handleSelect = (place) => {
    setActivePlaceId(place.id);
    if (onSelectPlace) {
      onSelectPlace(place);
    }
  };

  const current = SPATIAL_PLACES.find((p) => p.id === activePlaceId) || SPATIAL_PLACES[0];
  const isPuneAlert = current.id === 'PUNE';

  // Compute dynamic 3D gyro tilt based on latitude & longitude of the place
  const latTilt = ((current.lat - 20) * 2.5).toFixed(1);
  const lngTilt = ((current.lng - 75) * 2.5).toFixed(1);

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
            NEXCHAIN AI • 3D SPATIAL TELEMETRY v2.4
          </span>
        </div>
      </div>

      {/* Main Title & Value Prop */}
      <div>
        <h1
          style={{
            fontSize: '2.1rem',
            fontWeight: 800,
            lineHeight: 1.15,
            background: 'linear-gradient(135deg, #ffffff 40%, #38bdf8 80%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Autonomous Supply Chain Control Tower
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.6rem', lineHeight: 1.5 }}>
          Real-time geospatial vector telemetry across key Indian manufacturing foundries and mega distribution corridors.
        </p>
      </div>

      {/* 3D Holographic Gyroscope Orb Chamber */}
      <div
        className={`hologram-chamber ${isPuneAlert ? 'disrupted' : ''}`}
        style={{
          height: '240px',
          borderRadius: '16px',
          position: 'relative',
          background: isPuneAlert
            ? 'radial-gradient(ellipse at center, rgba(244, 63, 94, 0.15) 0%, rgba(13, 21, 39, 0.8) 70%)'
            : 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.15) 0%, rgba(13, 21, 39, 0.7) 70%)',
          border: `1px solid ${isPuneAlert ? 'rgba(244, 63, 94, 0.4)' : 'rgba(6, 182, 212, 0.35)'}`,
          boxShadow: isPuneAlert
            ? '0 0 35px rgba(244, 63, 94, 0.25), inset 0 0 30px rgba(244, 63, 94, 0.1)'
            : '0 0 35px rgba(6, 182, 212, 0.2), inset 0 0 30px rgba(6, 182, 212, 0.08)',
          transition: 'all 0.4s ease',
        }}
      >
        {/* Laser Sweep Beam */}
        <div className="hologram-laser-sweep" style={{ height: '3px' }} />

        {/* 3D Gyroscope Rings with place-oriented dynamic tilt */}
        <div
          style={{
            width: '130px',
            height: '130px',
            position: 'relative',
            perspective: '500px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `rotateX(${latTilt}deg) rotateY(${lngTilt}deg)`,
            transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Ring 1 - Outer Ring */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: `2px dashed ${isPuneAlert ? '#f43f5e' : (current.nominalColor || '#06b6d4')}`,
              boxShadow: `0 0 15px ${isPuneAlert ? '#f43f5e' : 'rgba(6, 182, 212, 0.6)'}`,
              animation: 'gyroSpin1 7s linear infinite',
              transformStyle: 'preserve-3d',
            }}
          />

          {/* Ring 2 - Middle Ring */}
          <div
            style={{
              position: 'absolute',
              width: '78%',
              height: '78%',
              borderRadius: '50%',
              border: `1.5px solid ${isPuneAlert ? '#fbbf24' : '#a855f7'}`,
              boxShadow: `0 0 12px ${isPuneAlert ? 'rgba(251, 191, 36, 0.5)' : 'rgba(168, 85, 247, 0.5)'}`,
              animation: 'gyroSpin2 5s linear infinite reverse',
              transformStyle: 'preserve-3d',
            }}
          />

          {/* Ring 3 - Inner Ring */}
          <div
            style={{
              position: 'absolute',
              width: '58%',
              height: '58%',
              borderRadius: '50%',
              border: `1.5px dotted ${isPuneAlert ? '#f43f5e' : '#10b981'}`,
              boxShadow: `0 0 10px ${isPuneAlert ? '#f43f5e' : 'rgba(16, 185, 129, 0.5)'}`,
              animation: 'gyroSpin3 9s linear infinite',
              transformStyle: 'preserve-3d',
            }}
          />

          {/* Glowing AI Core Node */}
          <div
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: isPuneAlert ? '#f43f5e' : '#38bdf8',
              boxShadow: `0 0 20px ${isPuneAlert ? '#f43f5e' : '#38bdf8'}, 0 0 40px ${isPuneAlert ? '#e11d48' : '#06b6d4'}`,
              animation: 'pulseRadar 1.5s infinite',
              zIndex: 3,
            }}
          />
        </div>

        {/* Floating Telemetry Coordinates Tag */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.75rem',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            borderRadius: '9999px',
            border: `1px solid ${isPuneAlert ? 'rgba(244, 63, 94, 0.4)' : 'rgba(6, 182, 212, 0.3)'}`,
            fontSize: '0.68rem',
            color: isPuneAlert ? '#fb7185' : 'var(--accent-cyan)',
            fontFamily: 'monospace',
          }}
        >
          <Compass size={12} />
          <span>{current.code}: {current.lat.toFixed(4)}° N, {current.lng.toFixed(4)}° E • 3D VECTOR LOCKED</span>
        </div>
      </div>

      {/* Interactive Place Selector Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem',
          borderRadius: '12px',
          borderColor: isPuneAlert ? 'rgba(244, 63, 94, 0.3)' : 'rgba(6, 182, 212, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Interactive Spatial Hubs:
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
            CLICK TO PROBE PLACE
          </span>
        </div>

        {/* Place Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '0.35rem',
            overflowX: 'auto',
            paddingBottom: '4px',
            marginBottom: '0.85rem',
          }}
        >
          {SPATIAL_PLACES.map((hub) => {
            const isSelected = activePlaceId === hub.id;
            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => handleSelect(hub)}
                style={{
                  background: isSelected
                    ? hub.id === 'PUNE' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(6, 182, 212, 0.2)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${isSelected ? (hub.id === 'PUNE' ? '#f43f5e' : 'var(--accent-cyan)') : 'var(--border-color)'}`,
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  borderRadius: '6px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.72rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? `0 0 10px ${hub.id === 'PUNE' ? '#f43f5e40' : 'rgba(6, 182, 212, 0.3)'}` : 'none',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: hub.id === 'PUNE' ? '#f43f5e' : (hub.nominalColor || hub.color),
                  }}
                />
                <span>{hub.code}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Place Live Telemetry Info */}
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={13} color={isPuneAlert ? '#f43f5e' : 'var(--accent-cyan)'} />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {current.name}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px', marginLeft: '1.1rem' }}>
                {current.tier} • {current.state}
              </div>
            </div>

            <span
              style={{
                fontSize: '0.65rem',
                fontFamily: 'monospace',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                backgroundColor: isPuneAlert ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: isPuneAlert ? '#fb7185' : '#34d399',
                border: `1px solid ${isPuneAlert ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                fontWeight: 700,
              }}
            >
              {isPuneAlert ? '🚨 CRITICAL' : `● ${current.nominalRisk}`}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '2px' }}>
            <div style={{ padding: '0.4rem', backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>INVENTORY VALUE</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {current.inventoryValue}
              </div>
            </div>
            <div style={{ padding: '0.4rem', backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>BUFFER THRESHOLD</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isPuneAlert ? '#f43f5e' : '#34d399' }}>
                {current.bufferDays}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            <b>Connected Corridors:</b> {current.corridors.join(' • ')}
          </div>
        </div>
      </div>
    </div>
  );
};
