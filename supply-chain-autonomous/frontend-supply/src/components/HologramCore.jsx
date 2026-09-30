import React, { useEffect, useRef, useState } from 'react';
import { Bot, Zap, AlertTriangle, ShieldCheck, Activity, Eye, Radio, Sparkles, Navigation, MapPin, Compass } from 'lucide-react';
import { useDisruption } from '../context/DisruptionContext';
import { SPATIAL_PLACES, SPATIAL_EDGES } from '../utils/spatialPlaces';

export const HologramCore = ({
  title = 'Guardian 3D Holographic Core',
  selectedPlaceId = null,
  onSelectPlace = null,
  compact = false,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { activeDisruptions } = useDisruption();

  const [activeId, setActiveId] = useState(selectedPlaceId || 'PUNE');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);

  const isDisrupted = activeDisruptions.length > 0;

  // Sync external selectedPlaceId if changed
  useEffect(() => {
    if (selectedPlaceId) {
      setActiveId(selectedPlaceId);
    }
  }, [selectedPlaceId]);

  const currentPlace = SPATIAL_PLACES.find((p) => p.id === activeId) || SPATIAL_PLACES[0];

  const handlePlaceClick = (place) => {
    setActiveId(place.id);
    if (onSelectPlace) {
      onSelectPlace(place);
    }
  };

  // Mouse tilt interaction for 3D perspective
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * 20, y: -x * 20 });

    // Check hit testing with projected 2D nodes
    const canvas = canvasRef.current;
    if (!canvas || !canvas._projectedNodes) return;
    const canvasRect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;

    const hit = canvas._projectedNodes.find((n) => {
      const dist = Math.hypot(n.proj.x - mouseX, n.proj.y - mouseY);
      return dist < 18;
    });

    setHoveredNode(hit ? hit.id : null);
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHoveredNode(null);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas._projectedNodes) return;
    const canvasRect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;

    const hit = canvas._projectedNodes.find((n) => {
      const dist = Math.hypot(n.proj.x - mouseX, n.proj.y - mouseY);
      return dist < 22;
    });

    if (hit) {
      handlePlaceClick(hit);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let angleX = 0;
    let angleY = 0;
    let pulse = 0;

    // Camera target angles when a place is selected
    let targetAngleY = 0;
    let targetAngleX = 0;

    // Generate orbiting particle dust
    const particles = Array.from({ length: 40 }, () => ({
      theta: Math.random() * Math.PI * 2,
      phi: (Math.random() - 0.5) * Math.PI,
      radius: 65 + Math.random() * 55,
      speed: 0.015 + Math.random() * 0.02,
      size: 1 + Math.random() * 1.5,
      alpha: 0.3 + Math.random() * 0.7,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      pulse += 0.05;

      // Base rotation + subtle camera focus bias based on current place
      angleX += 0.005;
      angleY += 0.008;

      // Calculate place angular bias
      if (currentPlace) {
        const placeAngle = Math.atan2(currentPlace.z, currentPlace.x);
        targetAngleY = -placeAngle * 0.3;
        targetAngleX = (currentPlace.y / 200) * 0.2;
      }

      const curAngleX = angleX * 0.4 + targetAngleX + tilt.x * 0.02;
      const curAngleY = angleY + targetAngleY + tilt.y * 0.02;

      const cosX = Math.cos(curAngleX);
      const sinX = Math.sin(curAngleX);
      const cosY = Math.cos(curAngleY);
      const sinY = Math.sin(curAngleY);

      // Project 3D coordinate to 2D
      const project = (x, y, z) => {
        // Rotate around Y
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // Rotate around X
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        const fov = 260;
        const scale = fov / (fov + z2 + 180);
        return {
          x: centerX + x1 * scale,
          y: centerY + y2 * scale,
          z: z2,
          scale,
        };
      };

      // 1. Draw 3D Holographic Grid Radar Floor
      ctx.save();
      ctx.strokeStyle = isDisrupted ? 'rgba(244, 63, 94, 0.16)' : 'rgba(6, 182, 212, 0.16)';
      ctx.lineWidth = 1;
      const gridRadius = 90;
      for (let r = 30; r <= gridRadius; r += 30) {
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.2) {
          const pt = project(Math.cos(a) * r, 50, Math.sin(a) * r);
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
          ctx.fill();
        }
      });

      // 3. Project All Spatial Places to 2D
      const projectedNodes = SPATIAL_PLACES.map((p) => ({
        ...p,
        proj: project(p.x, p.y, p.z),
      }));

      // Cache for mouse hit testing
      canvas._projectedNodes = projectedNodes;

      // 4. Draw Connecting 3D Corridors (Edges)
      SPATIAL_EDGES.forEach((edge) => {
        const fromNode = projectedNodes.find((n) => n.id === edge.from);
        const toNode = projectedNodes.find((n) => n.id === edge.to);

        if (fromNode && toNode && fromNode.proj.scale > 0 && toNode.proj.scale > 0) {
          const isConnectedToActive = fromNode.id === activeId || toNode.id === activeId;

          ctx.beginPath();
          ctx.lineWidth = isConnectedToActive ? 2 : 1;

          if (isConnectedToActive) {
            ctx.strokeStyle = edge.isAir ? 'rgba(56, 189, 248, 0.85)' : 'rgba(6, 182, 212, 0.75)';
            if (edge.isAir) {
              ctx.setLineDash([4, 4]);
            } else {
              ctx.setLineDash([]);
            }
          } else {
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)';
            ctx.setLineDash([]);
          }

          ctx.moveTo(fromNode.proj.x, fromNode.proj.y);
          ctx.lineTo(toNode.proj.x, toNode.proj.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Data pulse particle moving along corridor
          if (isConnectedToActive) {
            const flowProgress = (Math.sin(pulse * 2 + fromNode.lat) + 1) / 2;
            const flowX = fromNode.proj.x + (toNode.proj.x - fromNode.proj.x) * flowProgress;
            const flowY = fromNode.proj.y + (toNode.proj.y - fromNode.proj.y) * flowProgress;

            ctx.beginPath();
            ctx.arc(flowX, flowY, 3, 0, Math.PI * 2);
            ctx.fillStyle = edge.isAir ? '#38bdf8' : '#10b981';
            ctx.shadowColor = edge.isAir ? '#38bdf8' : '#10b981';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      });

      // 5. Draw 3D Places Nodes
      projectedNodes.forEach((node) => {
        if (node.proj.scale <= 0) return;

        const isSelected = node.id === activeId;
        const isHovered = node.id === hoveredNode;
        const nodeColor = isDisrupted && node.id === 'PUNE' ? '#f43f5e' : (node.nominalColor || node.color);

        // If selected: draw 3D vertical beacon light column
        if (isSelected) {
          const topBeacon = project(node.x, node.y - 45, node.z);
          const beaconGrad = ctx.createLinearGradient(node.proj.x, node.proj.y, topBeacon.x, topBeacon.y);
          beaconGrad.addColorStop(0, `${nodeColor}aa`);
          beaconGrad.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = beaconGrad;
          ctx.moveTo(node.proj.x, node.proj.y);
          ctx.lineTo(topBeacon.x, topBeacon.y);
          ctx.stroke();

          // Concentric targeting radar rings
          ctx.beginPath();
          const targetRingSize = (14 + Math.sin(pulse * 3) * 4) * node.proj.scale;
          ctx.arc(node.proj.x, node.proj.y, targetRingSize, 0, Math.PI * 2);
          ctx.strokeStyle = nodeColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Outer halo
        ctx.beginPath();
        const baseRadius = isSelected ? 12 : isHovered ? 9 : 6;
        ctx.arc(node.proj.x, node.proj.y, baseRadius * node.proj.scale, 0, Math.PI * 2);
        ctx.fillStyle = `${nodeColor}33`;
        ctx.fill();

        // Core solid node
        ctx.beginPath();
        ctx.arc(node.proj.x, node.proj.y, (isSelected ? 5.5 : 3.5) * node.proj.scale, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.shadowColor = nodeColor;
        ctx.shadowBlur = isSelected ? 14 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Place Code Label
        ctx.font = `${isSelected ? 'bold 11px' : '9px'} monospace`;
        ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(node.code, node.proj.x + 8 * node.proj.scale, node.proj.y + 3);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeId, isDisrupted, tilt, hoveredNode]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        width: '100%',
      }}
    >
      {/* 3D Hologram Projection Chamber */}
      <div
        className={`hologram-chamber ${isDisrupted && activeId === 'PUNE' ? 'disrupted' : ''}`}
        style={{
          height: compact ? '220px' : '260px',
          borderRadius: '14px',
          position: 'relative',
          cursor: hoveredNode ? 'pointer' : 'default',
        }}
        onClick={handleCanvasClick}
      >
        <div className="hologram-scanlines" />
        <div className="hologram-laser-sweep" />

        <canvas
          ref={canvasRef}
          width={compact ? 360 : 480}
          height={compact ? 220 : 260}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        {/* Floating HUD Telemetry Badge */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.2rem 0.6rem',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '6px',
            fontSize: '0.68rem',
            fontFamily: 'monospace',
            color: 'var(--accent-cyan)',
          }}
        >
          <Compass size={13} />
          <span>PROJECTION: {currentPlace.name.toUpperCase()}</span>
        </div>

        {/* Disruption Warning Tag if selected is Pune */}
        {isDisrupted && activeId === 'PUNE' && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.2rem 0.6rem',
              backgroundColor: 'rgba(244, 63, 94, 0.25)',
              border: '1px solid rgba(244, 63, 94, 0.6)',
              borderRadius: '6px',
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#fb7185',
              fontFamily: 'monospace',
            }}
          >
            <AlertTriangle size={13} />
            <span>DISRUPTION EPICENTER</span>
          </div>
        )}
      </div>

      {/* Interactive Place Selector Bar */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Active Logistics Hubs:
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
            CLICK TO ORIENT 3D TELEMETRY
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.35rem',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}
        >
          {SPATIAL_PLACES.map((p) => {
            const isSelected = p.id === activeId;
            const isDisruptedPlace = isDisrupted && p.id === 'PUNE';
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePlaceClick(p)}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  border: `1px solid ${isSelected ? (isDisruptedPlace ? '#f43f5e' : 'var(--accent-cyan)') : 'var(--border-color)'}`,
                  backgroundColor: isSelected
                    ? isDisruptedPlace ? 'rgba(244, 63, 94, 0.2)' : 'rgba(6, 182, 212, 0.18)'
                    : 'rgba(255, 255, 255, 0.02)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '0.72rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? `0 0 10px ${isDisruptedPlace ? '#f43f5e40' : 'rgba(6, 182, 212, 0.3)'}` : 'none',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isDisruptedPlace ? '#f43f5e' : (p.nominalColor || p.color),
                  }}
                />
                <span>{p.code} - {p.city}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D Spatial Telemetry Details Card for Selected Place */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem',
          borderRadius: '10px',
          border: `1px solid ${isDisrupted && activeId === 'PUNE' ? 'rgba(244, 63, 94, 0.4)' : 'rgba(6, 182, 212, 0.3)'}`,
          backgroundColor: isDisrupted && activeId === 'PUNE' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(13, 21, 39, 0.7)',
        }}
      >
        {/* Place Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={15} color={isDisrupted && activeId === 'PUNE' ? '#f43f5e' : 'var(--accent-cyan)'} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {currentPlace.name}
              </h4>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', marginLeft: '1.4rem' }}>
              {currentPlace.tier} • {currentPlace.state}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                fontSize: '0.65rem',
                fontFamily: 'monospace',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                backgroundColor: isDisrupted && activeId === 'PUNE' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: isDisrupted && activeId === 'PUNE' ? '#fb7185' : '#34d399',
                border: `1px solid ${isDisrupted && activeId === 'PUNE' ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                fontWeight: 700,
              }}
            >
              {isDisrupted && activeId === 'PUNE' ? '🚨 CRITICAL' : `● ${currentPlace.nominalRisk}`}
            </span>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
              {currentPlace.lat.toFixed(4)}° N, {currentPlace.lng.toFixed(4)}° E
            </div>
          </div>
        </div>

        {/* Live Status & Reason */}
        <div
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            backgroundColor: isDisrupted && activeId === 'PUNE' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '0.75rem',
            color: isDisrupted && activeId === 'PUNE' ? '#fb7185' : 'var(--text-primary)',
            lineHeight: 1.4,
            marginBottom: '0.75rem',
          }}
        >
          {isDisrupted && activeId === 'PUNE' ? currentPlace.disruptedReason : currentPlace.nominalReason}
        </div>

        {/* 4-Metric Telemetry Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.45rem', marginBottom: '0.75rem' }}>
          <div style={{ padding: '0.45rem', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Inventory</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '2px' }}>
              {currentPlace.inventoryValue}
            </div>
          </div>

          <div style={{ padding: '0.45rem', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Capacity</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
              {currentPlace.capacityUtilization}
            </div>
          </div>

          <div style={{ padding: '0.45rem', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Buffer Days</div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: isDisrupted && activeId === 'PUNE' ? '#f43f5e' : '#34d399',
                marginTop: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentPlace.bufferDays}
            </div>
          </div>

          <div style={{ padding: '0.45rem', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>In Transit</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24', marginTop: '2px' }}>
              {currentPlace.activeShipments} Shipments
            </div>
          </div>
        </div>

        {/* Facilities & Corridors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.72rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: 'var(--text-muted)', minWidth: '70px' }}>Facilities:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{currentPlace.facilities.join(' • ')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: 'var(--text-muted)', minWidth: '70px' }}>Corridors:</span>
            <span style={{ color: 'var(--accent-cyan)' }}>{currentPlace.corridors.join(' • ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
