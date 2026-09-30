import React, { useEffect, useRef } from 'react';
import { SPATIAL_PLACES, SPATIAL_EDGES } from '../utils/spatialPlaces';

export const Auth3DBackground = ({ activePlaceId = 'PUNE' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse coordinates for 3D parallax tilt
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX / width - 0.5) * 0.8;
      mouse.targetY = (e.clientY / height - 0.5) * 0.8;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Ambient floating 3D particle dust
    const particles = Array.from({ length: 65 }, () => ({
      x: (Math.random() - 0.5) * 600,
      y: (Math.random() - 0.5) * 600,
      z: (Math.random() - 0.5) * 500,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      vz: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    let rotY = 0;
    let pulse = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse damping
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      rotY += 0.003;
      pulse += 0.05;

      // Find active place to calculate camera target angle
      const activePlace = SPATIAL_PLACES.find((p) => p.id === activePlaceId) || SPATIAL_PLACES[0];
      const targetAngleY = activePlace ? -Math.atan2(activePlace.z, activePlace.x) * 0.25 : 0;
      const targetAngleX = activePlace ? (activePlace.y / 200) * 0.15 : 0;

      const curRotY = rotY + targetAngleY + mouse.x * 0.6;
      const curRotX = Math.sin(rotY * 0.5) * 0.12 + targetAngleX + mouse.y * 0.5;

      const cosY = Math.cos(curRotY);
      const sinY = Math.sin(curRotY);
      const cosX = Math.cos(curRotX);
      const sinX = Math.sin(curRotX);

      const fov = 450;
      // Position center slightly to the left on desktop for side-by-side showcase
      const centerX = width > 900 ? width * 0.35 : width * 0.5;
      const centerY = height * 0.5;

      const project = (x, y, z) => {
        // Rotate around Y
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // Rotate around X
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        const scale = fov / (fov + z2 + 300);
        return {
          x: centerX + x1 * scale,
          y: centerY + y2 * scale,
          scale,
          z: z2,
        };
      };

      // 1. Draw 3D Orbiting Rings (Gyroscope Field)
      ctx.save();
      for (let ring = 1; ring <= 3; ring++) {
        const radius = ring * 115;
        ctx.beginPath();
        ctx.strokeStyle = ring === 2 ? 'rgba(168, 85, 247, 0.18)' : 'rgba(6, 182, 212, 0.15)';
        ctx.lineWidth = 1;
        const ringStep = 0.15;
        for (let a = 0; a <= Math.PI * 2 + ringStep; a += ringStep) {
          const rx = Math.cos(a) * radius;
          const rz = Math.sin(a) * radius;
          const ry = Math.sin(a * 2 + rotY * ring) * 20;
          const pt = project(rx, ry, rz);
          if (a === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }
      ctx.restore();

      // 2. Draw 3D Particle Dust
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        if (p.x > 300) p.x = -300;
        if (p.x < -300) p.x = 300;
        if (p.y > 300) p.y = -300;
        if (p.y < -300) p.y = 300;

        const pt = project(p.x, p.y, p.z);
        if (pt.scale > 0) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha * pt.scale})`;
          ctx.arc(pt.x, pt.y, p.size * pt.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 3. Project All Places to 2D
      const projectedPlaces = SPATIAL_PLACES.map((p) => ({
        ...p,
        proj: project(p.x * 1.8, p.y * 1.8, p.z * 1.8),
      }));

      // 4. Draw Connecting 3D Corridors
      SPATIAL_EDGES.forEach((edge) => {
        const p1 = projectedPlaces.find((n) => n.id === edge.from);
        const p2 = projectedPlaces.find((n) => n.id === edge.to);

        if (p1 && p2 && p1.proj.scale > 0 && p2.proj.scale > 0) {
          const isConnectedToActive = p1.id === activePlaceId || p2.id === activePlaceId;

          ctx.beginPath();
          ctx.strokeStyle = isConnectedToActive
            ? (edge.isAir ? 'rgba(56, 189, 248, 0.7)' : 'rgba(6, 182, 212, 0.65)')
            : 'rgba(6, 182, 212, 0.16)';
          ctx.lineWidth = isConnectedToActive ? 1.8 : 1;

          if (edge.isAir) {
            ctx.setLineDash([4, 4]);
          } else {
            ctx.setLineDash([]);
          }

          ctx.moveTo(p1.proj.x, p1.proj.y);
          ctx.lineTo(p2.proj.x, p2.proj.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Traveling data pulse particle along active vector
          if (isConnectedToActive) {
            const progress = (Math.sin(rotY * 4 + p1.lat) + 1) / 2;
            const px = p1.proj.x + (p2.proj.x - p1.proj.x) * progress;
            const py = p1.proj.y + (p2.proj.y - p1.proj.y) * progress;
            ctx.beginPath();
            ctx.fillStyle = edge.isAir ? '#38bdf8' : '#10b981';
            ctx.arc(px, py, 2.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // 5. Draw 3D Places Nodes
      projectedPlaces.forEach((n) => {
        if (n.proj.scale > 0) {
          const isSelected = n.id === activePlaceId;
          const nodeColor = n.id === 'PUNE' ? '#f43f5e' : (n.nominalColor || n.color);

          // If active place: draw expanding radar ring
          if (isSelected) {
            ctx.beginPath();
            const ringSize = (14 + Math.sin(pulse * 3) * 5) * n.proj.scale;
            ctx.arc(n.proj.x, n.proj.y, ringSize, 0, Math.PI * 2);
            ctx.strokeStyle = nodeColor;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Vertical 3D beacon light column
            const topBeacon = project(n.x * 1.8, n.y * 1.8 - 60, n.z * 1.8);
            const beaconGrad = ctx.createLinearGradient(n.proj.x, n.proj.y, topBeacon.x, topBeacon.y);
            beaconGrad.addColorStop(0, `${nodeColor}aa`);
            beaconGrad.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = beaconGrad;
            ctx.moveTo(n.proj.x, n.proj.y);
            ctx.lineTo(topBeacon.x, topBeacon.y);
            ctx.stroke();
          }

          // Outer halo
          ctx.beginPath();
          ctx.arc(n.proj.x, n.proj.y, (isSelected ? 12 : 7) * n.proj.scale, 0, Math.PI * 2);
          ctx.fillStyle = `${nodeColor}33`;
          ctx.fill();

          // Core node
          ctx.beginPath();
          ctx.arc(n.proj.x, n.proj.y, (isSelected ? 5.5 : 3.5) * n.proj.scale, 0, Math.PI * 2);
          ctx.fillStyle = nodeColor;
          ctx.shadowColor = nodeColor;
          ctx.shadowBlur = isSelected ? 16 : 8;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Node Label
          ctx.font = `${isSelected ? 'bold 11px' : '9px'} monospace`;
          ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
          ctx.fillText(n.code, n.proj.x + 8 * n.proj.scale, n.proj.y + 3);
        }
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [activePlaceId]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        backgroundColor: '#070b14',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      <div className="hologram-scanlines" />
    </div>
  );
};
