import React, { useEffect, useRef, useState } from 'react';
import { useLabTheme } from '../../context/LabThemeContext';

export const MagneticCursor: React.FC = () => {
  const { calmMode } = useLabTheme();
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  const [isPointerDevice, setIsPointerDevice] = useState(true);

  useEffect(() => {
    // Detect non-touch fine pointer
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsPointerDevice(false);
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isHoveringInteractive = false;
    let hoverContext = '';

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Check element under cursor for contextual labeling
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          'button, a, input, select, .graph-node, .dirt-indicator, [data-interactive]'
        ) as HTMLElement | null;

        if (interactive) {
          isHoveringInteractive = true;
          if (interactive.getAttribute('data-cursor-label')) {
            hoverContext = interactive.getAttribute('data-cursor-label') || '';
          } else if (interactive.tagName === 'BUTTON') {
            hoverContext = 'EXECUTE';
          } else if (interactive.classList.contains('graph-node')) {
            hoverContext = 'INSPECT_NODE';
          } else {
            hoverContext = 'INTERACT';
          }
        } else {
          isHoveringInteractive = false;
          hoverContext = '';
        }
      }
    };

    let animId: number;

    const updateLoop = () => {
      if (calmMode) return;

      // Cursor dot updates directly
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Ring follows with spring damping
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (ringRef.current) {
        const scale = isHoveringInteractive ? 1.6 : 1.0;
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${scale})`;
        ringRef.current.style.borderColor = isHoveringInteractive
          ? 'var(--lab-accent-lime, #C6F277)'
          : 'rgba(120, 213, 232, 0.4)';
      }

      if (labelRef.current) {
        if (isHoveringInteractive && hoverContext) {
          labelRef.current.textContent = hoverContext;
          labelRef.current.style.opacity = '1';
        } else {
          labelRef.current.style.opacity = '0';
        }
      }

      animId = requestAnimationFrame(updateLoop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animId = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [calmMode]);

  if (!isPointerDevice || calmMode) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 99999,
      }}
      aria-hidden="true"
    >
      {/* Precision Core Dot */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: -2.5,
          left: -2.5,
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: '#C6F277',
          boxShadow: '0 0 8px #C6F277',
          willChange: 'transform',
        }}
      />

      {/* Damped Outer Crosshair Ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: -16,
          left: -16,
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '1px solid rgba(120, 213, 232, 0.4)',
          transition: 'transform 0.08s ease-out, border-color 0.2s',
          willChange: 'transform',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Subtle crosshair hairline ticks */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            height: '100%',
            width: '1px',
            background: 'linear-gradient(180deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
          }}
        />
        {/* Context label badge */}
        <span
          ref={labelRef}
          style={{
            position: 'absolute',
            top: '36px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '9px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#C6F277',
            backgroundColor: 'rgba(6, 8, 13, 0.85)',
            border: '1px solid rgba(198, 242, 119, 0.3)',
            padding: '1px 5px',
            borderRadius: '3px',
            whiteSpace: 'nowrap',
            opacity: 0,
            transition: 'opacity 0.15s ease',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};
