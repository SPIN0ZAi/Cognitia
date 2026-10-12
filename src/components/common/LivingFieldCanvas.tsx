import React, { useEffect, useRef } from 'react';
import { useLabTheme } from '../../context/LabThemeContext';

interface NodeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  alpha: number;
  targetAlpha: number;
  energy: number;
  pulsePhase: number;
}

interface Wavefront {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  alpha: number;
  color: string;
}

export const LivingFieldCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { calmMode } = useLabTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates (interpolated for fluidity)
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;
    let isMouseActive = false;

    // Node graph particles
    const particleCount = Math.min(Math.floor((width * height) / 22000), 55);
    const particles: NodeParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 1.2,
        baseRadius: Math.random() * 1.5 + 1.2,
        alpha: Math.random() * 0.4 + 0.2,
        targetAlpha: Math.random() * 0.5 + 0.2,
        energy: 0,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Algorithmic expansion wavefronts
    const wavefronts: Wavefront[] = [];

    // Periodic expansion pulse (A* / BFS expansion wave)
    let lastWaveTime = 0;
    const waveInterval = 4200; // ms

    const triggerSearchWave = (originX: number, originY: number, color = 'rgba(120, 213, 232, 0.4)') => {
      wavefronts.push({
        x: originX,
        y: originY,
        radius: 4,
        maxRadius: Math.random() * 140 + 160,
        speed: 1.2 + Math.random() * 0.6,
        alpha: 0.45,
        color,
      });
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
      isMouseActive = true;
    };

    const handleMouseLeave = () => {
      isMouseActive = false;
    };

    const handleClick = (e: MouseEvent) => {
      if (!calmMode) {
        triggerSearchWave(e.clientX, e.clientY, 'rgba(198, 242, 119, 0.55)');
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    // Main animation loop
    let lastTimestamp = performance.now();

    const render = (timestamp: number) => {
      const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
      lastTimestamp = timestamp;

      // In Calm Mode, render static ambient grid and stop heavy dynamic simulation
      if (calmMode) {
        ctx.clearRect(0, 0, width, height);
        // Draw static dim engineering graph paper grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
        ctx.lineWidth = 1;
        const gridSize = 48;
        ctx.beginPath();
        for (let x = 0; x < width; x += gridSize) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
        return; // Don't schedule next frame in calm mode until next state change
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Periodic natural search expansion wave
      if (timestamp - lastWaveTime > waveInterval) {
        lastWaveTime = timestamp;
        if (particles.length > 0) {
          const randomNode = particles[Math.floor(Math.random() * particles.length)];
          triggerSearchWave(randomNode.x, randomNode.y, 'rgba(120, 213, 232, 0.35)');
        }
      }

      // 1. Draw subtle coordinate graph-paper grid
      const gridSize = 56;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // 2. Update and draw expansion wavefronts
      for (let w = wavefronts.length - 1; w >= 0; w--) {
        const wave = wavefronts[w];
        wave.radius += wave.speed * (dt * 60);
        wave.alpha = Math.max(0, 0.45 * (1 - wave.radius / wave.maxRadius));

        if (wave.alpha <= 0.005 || wave.radius >= wave.maxRadius) {
          wavefronts.splice(w, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = wave.color.replace('0.4', wave.alpha.toFixed(3)).replace('0.35', wave.alpha.toFixed(3)).replace('0.55', wave.alpha.toFixed(3));
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Update & render node particles and connecting tree edges
      const connectionDist = 140;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Motion physics
        p.x += p.vx * (dt * 60);
        p.y += p.vy * (dt * 60);

        // Screen boundary rebound
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        else if (p.x > width) { p.x = width; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        else if (p.y > height) { p.y = height; p.vy *= -1; }

        // Mouse gravity influence
        if (isMouseActive) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 220 && dist > 10) {
            const force = (1 - dist / 220) * 0.08;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Dampen velocity to prevent runaway speeds
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Periodic node energy pulse
        p.pulsePhase += dt * 1.5;
        p.radius = p.baseRadius + Math.sin(p.pulsePhase) * 0.4;

        // Draw graph edges to nearest neighbors
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const edx = p.x - p2.x;
          const edy = p.y - p2.y;
          const edgeDist = Math.sqrt(edx * edx + edy * edy);

          if (edgeDist < connectionDist) {
            const edgeAlpha = (1 - edgeDist / connectionDist) * 0.16;
            ctx.strokeStyle = `rgba(120, 213, 232, ${edgeAlpha.toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Draw node
        ctx.fillStyle = `rgba(198, 242, 119, ${p.alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
    };
  }, [calmMode]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: calmMode ? 0.35 : 0.85,
        transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      aria-hidden="true"
    />
  );
};
