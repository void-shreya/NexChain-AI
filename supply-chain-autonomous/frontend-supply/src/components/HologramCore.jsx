import React, { useEffect, useRef, useState } from 'react';
import { Bot, Zap, AlertTriangle, ShieldCheck, Activity, Eye, Radio, Sparkles } from 'lucide-react';
import { useDisruption } from '../context/DisruptionContext';

export const HologramCore = ({ title = 'Guardian 3D Holographic Core', compact = false }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { activeDisruptions, isDemoRunning, currentAgentStep } = useDisruption();

  const [mode, setMode] = useState('MESH'); // 'MESH', 'RADAR', 'CORE'
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const isDisrupted = activeDisruptions.length > 0;

  // 3D Nodes for the Supply Chain Holographic Projection
  const nodes = [
    { name: 'PUN', label: 'Pune Hub', x: 20, y: -10, z: 30, color: isDisrupted ? '#f43f5e' : '#06b6d4', size: 4 },
    { name: 'BLR', label: 'Bharat Silicon BLR', x: 40, y: 35, z: -20, color: '#10b981', size: 3.5 },
    { name: 'BOM', label: 'Bhiwandi Depot', x: -30, y: -25, z: 15, color: '#38bdf8', size: 3.5 },
    { name: 'DEL', label: 'NCR North Hub', x: -10, y: -70, z: -30, color: '#8b5cf6', size: 3.5 },
    { name: 'MAA', label: 'Chennai Port', x: 50, y: 45, z: 35, color: '#f59e0b', size: 3.5 },
    { name: 'HYD', label: 'Shamshabad Hub', x: 15, y: 15, z: -40, color: '#06b6d4', size: 3 },
    { name: 'CORE', label: 'Guardian AI Kernel', x: 0, y: 0, z: 0, color: isDisrupted ? '#f43f5e' : '#38bdf8', size: 6 },
  ];

  // Mouse tilt interaction for true 3D perspective
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * 25, y: -x * 25 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let angleX = 0;
    let angleY = 0;
    let pulse = 0;

    // Generate orbiting particle dust
    const particles = Array.from({ length: 45 }, () => ({
      theta: Math.random() * Math.PI * 2,
      phi: (Math.random() - 0.5) * Math.PI,
      radius: 60 + Math.random() * 55,
      speed: 0.015 + Math.random() * 0.02,
      size: 1 + Math.random() * 1.5,
      alpha: 0.3 + Math.random() * 0.7,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      angleX += 0.008;
      angleY += 0.012;
      pulse += 0.04;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // Project 3D coordinate to 2D
      const project = (x, y, z) => {
        // Rotate around Y axis
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // Rotate around X axis
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        // Perspective scale
        const fov = 280;
        const scale = fov / (fov + z2);
        return {
          x: centerX + x1 * scale,
          y: centerY + y2 * scale,
          z: z2,
          scale,
        };
      };

      // 1. Draw 3D Holographic Grid Radar Floor
      ctx.save();
      ctx.strokeStyle = isDisrupted ? 'rgba(244, 63, 94, 0.18)' : 'rgba(6, 182, 212, 0.18)';
      ctx.lineWidth = 1;
      const gridRadius = 90;
      for (let r = 25; r <= gridRadius; r += 25) {
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.2) {
          const pt = project(Math.cos(a) * r, 55, Math.sin(a) * r);
          if (a === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();

      // 2. Draw Orbiting 3D Particle Cloud
      particles.forEach((p) => {
        p.theta += p.speed;
        const px = p.radius * Math.cos(p.phi) * Math.cos(p.theta);
        const py = p.radius * Math.sin(p.phi);
        const pz = p.radius * Math.cos(p.phi) * Math.sin(p.theta);
        const pt = project(px, py, pz);

        if (pt.scale > 0) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, p.size * pt.scale, 0, Math.PI * 2);
          ctx.fillStyle = isDisrupted
            ? `rgba(251, 113, 133, ${p.alpha * pt.scale})`
            : `rgba(56, 189, 248, ${p.alpha * pt.scale})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = isDisrupted ? '#f43f5e' : '#06b6d4';
          ctx.fill();
        }
      });

      // 3. Draw Connecting 3D Holographic Supply Vectors
      const projectedNodes = nodes.map((node) => ({
        ...node,
        proj: project(node.x, node.y, node.z),
      }));

      // Connect peripheral nodes to central core and neighbors
      ctx.lineWidth = 1.2;
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const n1 = projectedNodes[i];
          const n2 = projectedNodes[j];
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y, n1.z - n2.z);

          if (dist < 90 || n1.name === 'CORE' || n2.name === 'CORE') {
            const grad = ctx.createLinearGradient(n1.proj.x, n1.proj.y, n2.proj.x, n2.proj.y);
            const alertColor = isDisrupted ? 'rgba(244, 63, 94, 0.45)' : 'rgba(6, 182, 212, 0.45)';
            grad.addColorStop(0, n1.color + 'aa');
            grad.addColorStop(1, n2.color + 'aa');

            ctx.beginPath();
            ctx.moveTo(n1.proj.x, n1.proj.y);
            ctx.lineTo(n2.proj.x, n2.proj.y);
            ctx.strokeStyle = grad;
            ctx.shadowBlur = isDisrupted ? 12 : 8;
            ctx.shadowColor = isDisrupted ? '#f43f5e' : '#06b6d4';
            ctx.stroke();

            // Animated packet pulse flowing along vectors
            const packetPos = (pulse * 0.4 + (i + j) * 0.2) % 1;
            const px = n1.proj.x + (n2.proj.x - n1.proj.x) * packetPos;
            const py = n1.proj.y + (n2.proj.y - n1.proj.y) * packetPos;
            ctx.beginPath();
            ctx.arc(px, py, 2 * n1.proj.scale, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 10;
            ctx.fill();
          }
        }
      }

      // 4. Draw 3D Holographic Nodes & Labels
      projectedNodes.sort((a, b) => b.proj.z - a.proj.z);
      projectedNodes.forEach((node) => {
        const pt = node.proj;
        const pulseSize = node.name === 'CORE' ? Math.sin(pulse) * 2 : 0;
        const radius = Math.max(2, (node.size + pulseSize) * pt.scale);

        // Outer glow aura
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = node.color + '33';
        ctx.fill();

        // Node center
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 15;
        ctx.fill();

        // Target bracket around core node
        if (node.name === 'CORE') {
          ctx.strokeStyle = isDisrupted ? '#f43f5e' : '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius * 2.4, 0, Math.PI * 2);
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Floating holographic label
        if (!compact && pt.scale > 0.8) {
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillStyle = '#e2e8f0';
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#000000';
          ctx.fillText(node.name, pt.x + radius + 4, pt.y + 3);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, isDisrupted]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`hologram-chamber ${isDisrupted ? 'disrupted' : ''}`}
      style={{ height: compact ? '260px' : '360px' }}
    >
      {/* Scanline & Laser Overlays */}
      <div className="hologram-scanlines" />
      <div className="hologram-laser-sweep" />

      {/* Top Left HUD Telemetry */}
      <div className="hologram-hud-badge hologram-hud-top-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Activity size={12} color={isDisrupted ? '#f43f5e' : 'var(--accent-cyan)'} />
          <span>HOLO-BEAM: {isDisrupted ? 'EMERGENCY_OVERRIDE' : 'ACTIVE_GRID'}</span>
        </div>
      </div>

      {/* Top Right Mode Toggle */}
      <div className="hologram-hud-badge hologram-hud-top-right">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Radio size={12} color="var(--accent-cyan)" />
          <span>{mode} 3D PROJECTION</span>
        </div>
      </div>

      {/* 3D Gyroscope Stage with Interactive Mouse Tilt */}
      <div
        className="hologram-gyro-stage"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        <div className="gyro-ring gyro-ring-1" />
        <div className="gyro-ring gyro-ring-2" />
        <div className="gyro-ring gyro-ring-3" />

        {/* Real-time 3D Math Canvas */}
        <canvas
          ref={canvasRef}
          width={compact ? 240 : 320}
          height={compact ? 220 : 280}
          style={{ position: 'relative', zIndex: 2 }}
        />
      </div>

      {/* Projector Base Pedestal */}
      <div className="hologram-pedestal" />
      <div className="hologram-pedestal-light" />

      {/* Bottom Live Holographic Status Banner */}
      <div className="hologram-hud-bottom">
        <div
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--border-radius-full)',
            backgroundColor: isDisrupted ? 'rgba(244, 63, 94, 0.2)' : 'rgba(6, 182, 212, 0.15)',
            border: `1px solid ${isDisrupted ? '#f43f5e' : '#06b6d4'}`,
            fontSize: '0.72rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: isDisrupted ? '#fb7185' : '#38bdf8',
            backdropFilter: 'blur(6px)',
          }}
        >
          {isDisrupted ? (
            <>
              <AlertTriangle size={13} color="#f43f5e" />
              <span>DISRUPTION DETECTED: PUNE CHAKAN GRID OFFLINE</span>
            </>
          ) : (
            <>
              <ShieldCheck size={13} color="#10b981" />
              <span>GUARDIAN KERNEL: ALL CORRIDORS NOMINAL (12ms)</span>
            </>
          )}
        </div>

        {/* Quick Mode Switches */}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {['MESH', 'RADAR', 'CORE'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                background: mode === m ? 'rgba(6, 182, 212, 0.3)' : 'rgba(15, 23, 42, 0.6)',
                border: `1px solid ${mode === m ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                color: mode === m ? '#38bdf8' : 'var(--text-muted)',
                borderRadius: '4px',
                fontSize: '0.65rem',
                padding: '0.2rem 0.45rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
