import React, { useEffect, useRef } from 'react';

export const Auth3DBackground = () => {
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

    // 3D Nodes representing the India Logistics Mesh
    const nodes = [
      { name: 'DEL', x: -80, y: -140, z: 20, color: '#38bdf8' },
      { name: 'PUN', x: -50, y: 10, z: -30, color: '#06b6d4' },
      { name: 'BOM', x: -90, y: 30, z: 40, color: '#a855f7' },
      { name: 'BLR', x: 20, y: 120, z: -50, color: '#10b981' },
      { name: 'MAA', x: 70, y: 130, z: 25, color: '#f59e0b' },
      { name: 'HYD', x: 10, y: 50, z: -10, color: '#06b6d4' },
      { name: 'CCU', x: 140, y: -40, z: 60, color: '#38bdf8' },
      { name: 'AMD', x: -130, y: -50, z: -20, color: '#6366f1' },
    ];

    // Connecting supply chain transit edges
    const edges = [
      [0, 1], [1, 2], [1, 5], [5, 3], [3, 4], [0, 6], [6, 4], [0, 7], [7, 2], [5, 0]
    ];

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
    let rotX = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse damping
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      rotY += 0.003;
      const curRotY = rotY + mouse.x * 0.6;
      const curRotX = Math.sin(rotY * 0.5) * 0.15 + mouse.y * 0.5;

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
        const radius = ring * 110;
        ctx.beginPath();
        ctx.strokeStyle = ring === 2 ? 'rgba(168, 85, 247, 0.18)' : 'rgba(6, 182, 212, 0.16)';
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

      // 3. Draw Connecting Supply Vectors
      const projectedNodes = nodes.map((n) => ({ ...project(n.x, n.y, n.z), ...n }));

      edges.forEach(([i, j]) => {
        const p1 = projectedNodes[i];
        const p2 = projectedNodes[j];
        if (p1.scale > 0 && p2.scale > 0) {
          const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          grad.addColorStop(0, 'rgba(6, 182, 212, 0.28)');
          grad.addColorStop(1, 'rgba(168, 85, 247, 0.28)');

          ctx.beginPath();
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.2;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Traveling data pulse particle along vector
          const progress = (Math.sin(rotY * 4 + i + j) + 1) / 2;
          const px = p1.x + (p2.x - p1.x) * progress;
          const py = p1.y + (p2.y - p1.y) * progress;
          ctx.beginPath();
          ctx.fillStyle = '#38bdf8';
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 4. Draw 3D Hub Nodes
      projectedNodes.forEach((n) => {
        if (n.scale > 0) {
          // Outer glow ring
          ctx.beginPath();
          ctx.arc(n.x, n.y, 10 * n.scale, 0, Math.PI * 2);
          ctx.fillStyle = `${n.color}22`;
          ctx.fill();

          // Core node
          ctx.beginPath();
          ctx.arc(n.x, n.y, 4 * n.scale, 0, Math.PI * 2);
          ctx.fillStyle = n.color;
          ctx.shadowColor = n.color;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Node Label
          ctx.font = `${Math.max(9, Math.round(11 * n.scale))}px monospace`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fillText(n.name, n.x + 8 * n.scale, n.y + 3);
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
  }, []);

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
      {/* Cyber Scanlines Overlay */}
      <div className="hologram-scanlines" />
    </div>
  );
};
