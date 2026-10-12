/**
 * Cognitia Chase: Attract Mode Mini Arcade Cabinet Canvas
 * 
 * Animated self-playing attract mode demonstrating live search algorithms
 * chasing a probe. Featured prominently on the course dashboard.
 */

import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { CanvasRenderer } from '../renderer/CanvasRenderer';
import { DEFAULT_MAZE_LAYOUTS } from '../engine/MazeMap';
import type { Direction } from '../engine/types';

export const AttractModeCanvas: React.FC<{ onStartPlay?: () => void }> = ({ onStartPlay }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const wanderTimerRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(DEFAULT_MAZE_LAYOUTS.level1_wave, 'arcade', ['astar', 'bfs']);
    engine.speedMultiplier = 0.9;
    engine.start();
    engineRef.current = engine;

    const renderer = new CanvasRenderer(canvas);
    rendererRef.current = renderer;

    const DIRS: Direction[] = ['up', 'down', 'left', 'right'];

    const loop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Autopilot: player randomly chooses a valid direction every 0.6s
      wanderTimerRef.current += dt;
      if (wanderTimerRef.current >= 0.5) {
        wanderTimerRef.current = 0;
        const curX = Math.round(engine.player.x);
        const curY = Math.round(engine.player.y);
        const validDirs = DIRS.filter((d) => {
          let nx = curX;
          let ny = curY;
          if (d === 'left') nx -= 1;
          if (d === 'right') nx += 1;
          if (d === 'up') ny -= 1;
          if (d === 'down') ny += 1;
          return engine.maze.isWalkable(nx, ny);
        });

        if (validDirs.length > 0) {
          const chosen = validDirs[Math.floor(Math.random() * validDirs.length)];
          engine.setPlayerDirection(chosen);
        }
      }

      engine.update(dt);
      renderer.render(engine, {
        showXRay: true,
        xRayGhostPersonality: 'astar',
        enableScanlines: true,
        enableBloom: true,
      });

      // Respawn loop if caught or cleared
      if (engine.state === 'game_over' || engine.state === 'level_cleared') {
        engine.resetGame();
        engine.start();
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '520px',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1.5px solid #1e3a5f',
        background: '#04070d',
        boxShadow: '0 15px 35px rgba(0,0,0,0.8), 0 0 25px rgba(120, 213, 232, 0.15)',
      }}
    >
      {/* Top Arcade Marquee */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.45rem 0.85rem',
          background: 'linear-gradient(90deg, #091220 0%, #0d1b30 50%, #091220 100%)',
          borderBottom: '1px solid #1e2f47',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
        }}
      >
        <span style={{ color: '#78D5E8', fontWeight: 800, letterSpacing: '0.08em' }}>
          COGNITIA CHASE // ATTRACT MODE
        </span>
        <span style={{ color: '#C6F277', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C6F277', animation: 'pulse 1.5s infinite' }} />
          LIVE SIMULATION
        </span>
      </div>

      {/* Canvas */}
      <div style={{ height: '220px', width: '100%', position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        {/* Scanline CRT overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.6) 100%)',
          }}
        />
      </div>

      {/* Press Start Interactive Button Bar */}
      {onStartPlay && (
        <div
          style={{
            padding: '0.65rem 0.85rem',
            background: '#070c14',
            borderTop: '1px solid #142032',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94A3B8' }}>
            5 Search Algorithms // X-Ray Mode
          </div>
          <button
            onClick={onStartPlay}
            className="btn-tactile btn-primary btn-sm"
            style={{
              padding: '0.35rem 1rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              background: '#C6F277',
              color: '#06090e',
              boxShadow: '0 0 15px rgba(198, 242, 119, 0.4)',
            }}
          >
            PRESS START ▶
          </button>
        </div>
      )}
    </div>
  );
};
