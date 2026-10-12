/**
 * Cognitia Chase: Maze Agents — Main Game Application Hub
 * 
 * Orchestrates:
 * - 4 Modes: Campaign, Ghost Lab, Be the Agent, Arcade
 * - Fixed 60Hz loop with CanvasRenderer
 * - X-Ray Live Search HUD
 * - Procedural Web Audio Synthesizer
 * - Keyboard (Arrows / WASD) & Mobile Touch D-Pad / Swipes
 * - Persistent progress integration with storageManager
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { CanvasRenderer } from '../renderer/CanvasRenderer';
import { SoundSynthesizer } from '../audio/SoundSynthesizer';
import { CAMPAIGN_LEVELS } from '../engine/campaignLevels';
import { CLASSIC_ARCADE_MAZE } from '../engine/MazeMap';
import type { GameMode, GhostPersonality, Direction, TargetingMode } from '../engine/types';
import { XRayHud } from './XRayHud';
import { MicroLessonModal } from './MicroLessonModal';
import { GhostLabPanel } from './GhostLabPanel';
import { BeTheAgentPanel } from './BeTheAgentPanel';
import { TouchControls } from './TouchControls';
import { HeuristicInsightModal } from './HeuristicInsightModal';
import { runSearch } from '../../lib/search/GraphSearch';
import {
  recordGameScore,
  unlockGameAchievement,
  loadStorage,
} from '../../lib/storage/storageManager';

import {
  Gamepad2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CognitiaChaseGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const audioRef = useRef<SoundSynthesizer>(new SoundSynthesizer(true));

  // Game UI state
  const [mode, setMode] = useState<GameMode>('arcade');
  const [targetingMode, setTargetingMode] = useState<TargetingMode>('classic');
  const [isInsightOpen, setIsInsightOpen] = useState(false);
  const [campaignLevelIndex, setCampaignLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<string>('ready');

  // Controls & Options
  const [showXRay, setShowXRay] = useState(true);
  const [focalPersonality, setFocalPersonality] = useState<GhostPersonality>('blinky');
  const [heuristicType, setHeuristicType] = useState<'manhattan' | 'euclidean' | 'inadmissible'>('manhattan');
  const [isMuted, setIsMuted] = useState(true);
  const [gameSpeed, setGameSpeed] = useState<number>(1.0);
  const [scanlines, setScanlines] = useState<boolean>(true);
  const [isLessonOpen, setIsLessonOpen] = useState(false);

  // "Be The Agent" Mode state
  const [agentTrialDone, setAgentTrialDone] = useState(false);
  const [playerCost, setPlayerCost] = useState(0);
  const [playerSteps, setPlayerSteps] = useState(0);
  const [benchAstar, setBenchAstar] = useState({ cost: 0, steps: 0 });
  const [benchBfs, setBenchBfs] = useState({ cost: 0, steps: 0 });

  // Animation frame loop
  const animFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(0);

  // Initialize engine on mode or level change
  const initEngine = useCallback(() => {
    let layout = CLASSIC_ARCADE_MAZE;
    let ghosts: GhostPersonality[] =
      targetingMode === 'classic'
        ? ['blinky', 'pinky', 'inky', 'clyde']
        : ['astar', 'bfs', 'ucs', 'greedy', 'dfs'];

    if (mode === 'campaign') {
      const lvl = CAMPAIGN_LEVELS[campaignLevelIndex] || CAMPAIGN_LEVELS[0];
      layout = lvl.mazeLayout;
      ghosts = lvl.enemies;
    } else if (mode === 'ghost_lab') {
      layout = CLASSIC_ARCADE_MAZE;
      ghosts = ['astar', 'greedy'];
    } else if (mode === 'be_the_agent') {
      layout = CLASSIC_ARCADE_MAZE;
      ghosts = []; // No ghosts chasing in Be The Agent mode
    } else if (mode === 'arcade') {
      layout = CLASSIC_ARCADE_MAZE;
      ghosts =
        targetingMode === 'classic'
          ? ['blinky', 'pinky', 'inky', 'clyde']
          : ['astar', 'bfs', 'ucs', 'greedy', 'dfs'];
    }

    const engine = new GameEngine(layout, mode, ghosts);
    engine.setTargetingMode(targetingMode);
    engine.speedMultiplier = gameSpeed;

    // Load persisted high score
    const loaded = loadStorage().data;
    engine.highScore = loaded.game.highScoreArcade || 0;
    setHighScore(engine.highScore);

    // Event bus connections
    engine.events = {
      onScoreChange: (s) => {
        setScore(s);
        recordGameScore(s, mode === 'campaign' ? campaignLevelIndex + 1 : 1);
      },
      onLivesChange: (l) => setLives(l),
      onStateChange: (st) => setGameState(st),
      onPelletEaten: (type) => {
        if (type === 'power') {
          audioRef.current.playPowerPulse();
        } else {
          audioRef.current.playPelletChirp();
        }
      },
      onGhostEaten: () => {
        audioRef.current.playGhostEaten();
        unlockGameAchievement('GHOST_HUNTER');
      },
      onPlayerCaught: () => {
        audioRef.current.playPlayerCaught();
      },
      onLevelCleared: () => {
        audioRef.current.playLevelClear();
        unlockGameAchievement('ALGO_CHAMPION');
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        } catch (e) {
          // ignore
        }
      },
    };

    engineRef.current = engine;
    setScore(engine.score);
    setLives(engine.player.lives);
    setGameState(engine.state);
    if (ghosts.length > 0) {
      setFocalPersonality(ghosts[0]);
    }

    // If Be The Agent mode, calculate theoretical optimum for benchmark
    if (mode === 'be_the_agent') {
      setAgentTrialDone(false);
      setPlayerCost(0);
      setPlayerSteps(0);
      const start = engine.maze.playerSpawn;
      const goal = engine.maze.ghostSpawn;

      const probAstar = engine.maze.createSearchProblem(start, goal, 'manhattan');
      const resAstar = runSearch(probAstar, 'astar', { isGraphMode: true });
      setBenchAstar({ cost: resAstar.totalCost, steps: resAstar.path.length });

      const probBfs = engine.maze.createSearchProblem(start, goal, 'manhattan');
      const resBfs = runSearch(probBfs, 'bfs', { isGraphMode: true });
      setBenchBfs({ cost: resBfs.totalCost, steps: resBfs.path.length });
    }
  }, [mode, campaignLevelIndex, gameSpeed, targetingMode]);

  useEffect(() => {
    initEngine();
  }, [initEngine]);

  // Main 60Hz RequestAnimationFrame Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!rendererRef.current) {
      rendererRef.current = new CanvasRenderer(canvas);
    }
    const renderer = rendererRef.current;

    const gameLoop = (timestamp: number) => {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
      const dt = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      const engine = engineRef.current;
      if (engine) {
        engine.update(dt);

        // Check Be The Agent goal arrival
        if (mode === 'be_the_agent' && !agentTrialDone) {
          const curTileX = Math.round(engine.player.x);
          const curTileY = Math.round(engine.player.y);
          const goal = engine.maze.ghostSpawn;

          if (curTileX === goal.x && curTileY === goal.y) {
            setAgentTrialDone(true);
            engine.pause();
            audioRef.current.playLevelClear();
            try {
              confetti({ particleCount: 50, spread: 60 });
            } catch (e) {
              // ignore
            }
          }
        }

        renderer.render(engine, {
          showXRay,
          xRayGhostPersonality: focalPersonality,
          enableScanlines: scanlines,
          enableBloom: true,
        });
      }

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [showXRay, focalPersonality, scanlines, mode, agentTrialDone]);

  // Keyboard navigation & Esc to pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      const key = e.key.toLowerCase();

      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd'].includes(key)) {
        // Prevent scrolling page while playing
        e.preventDefault();
      }

      if (key === 'escape' || key === 'p') {
        engine.togglePause();
        setGameState(engine.state);
        return;
      }

      let dir: Direction = 'none';
      if (key === 'arrowup' || key === 'w') dir = 'up';
      if (key === 'arrowdown' || key === 's') dir = 'down';
      if (key === 'arrowleft' || key === 'a') dir = 'left';
      if (key === 'arrowright' || key === 'd') dir = 'right';

      if (dir !== 'none') {
        engine.setPlayerDirection(dir);
        setGameState(engine.state);

        // Track Be The Agent steps and cost
        if (mode === 'be_the_agent' && !agentTrialDone) {
          setPlayerSteps((s) => s + 1);
          const px = Math.round(engine.player.x);
          const py = Math.round(engine.player.y);
          setPlayerCost((c) => c + engine.maze.getTraversalCost(px, py));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, agentTrialDone]);

  // Auto-pause when browser tab loses focus
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && engineRef.current?.state === 'running') {
        engineRef.current.pause();
        setGameState('paused');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const handleTouchDirection = (dir: Direction) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setPlayerDirection(dir);
    setGameState(engine.state);

    if (mode === 'be_the_agent' && !agentTrialDone) {
      setPlayerSteps((s) => s + 1);
      const px = Math.round(engine.player.x);
      const py = Math.round(engine.player.y);
      setPlayerCost((c) => c + engine.maze.getTraversalCost(px, py));
    }
  };

  const handleToggleSound = () => {
    const muted = audioRef.current.toggleMute();
    setIsMuted(muted);
  };

  const handleLevelSelect = (idx: number) => {
    setCampaignLevelIndex(idx);
    setIsLessonOpen(true);
  };

  const currentLevelConfig = CAMPAIGN_LEVELS[campaignLevelIndex] || CAMPAIGN_LEVELS[0];

  return (
    <div
      ref={containerRef}
      className="cognitia-chase-container"
      style={{
        maxWidth: '1040px',
        margin: '0 auto',
        padding: '1.25rem',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Top Header & Mode Navigation */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1rem',
          padding: '0.85rem 1.25rem',
          background: 'var(--lab-bg-surface)',
          border: '1px solid var(--lab-border-subtle)',
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              background: 'rgba(198, 242, 119, 0.15)',
              border: '1px solid rgba(198, 242, 119, 0.3)',
              color: '#C6F277',
            }}
          >
            <Gamepad2 size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.02em' }}>
              Cognitia Chase: Maze Agents
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#78D5E8', fontFamily: 'var(--font-mono)' }}>
              Outsmart the search algorithms in real time
            </span>
          </div>
        </div>

        {/* Mode Selector Buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'campaign', label: '1. Campaign' },
            { id: 'ghost_lab', label: '2. Ghost Lab' },
            { id: 'be_the_agent', label: '3. Be The Agent' },
            { id: 'arcade', label: '4. Survival Arcade' },
          ].map((m) => {
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id as any)}
                className="btn-tactile btn-sm"
                style={{
                  background: isActive ? 'rgba(120, 213, 232, 0.15)' : 'transparent',
                  border: `1px solid ${isActive ? '#78D5E8' : 'var(--lab-border-subtle)'}`,
                  color: isActive ? '#78D5E8' : 'var(--lab-text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.78rem',
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Targeting Strategy & Academic Bridge Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.65rem 1rem',
          background: '#070c14',
          border: '1px solid #162436',
          borderRadius: '10px',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: '#64748B' }}>
            AI ENGINE:
          </span>
          <button
            onClick={() => {
              setTargetingMode('classic');
              if (engineRef.current) engineRef.current.setTargetingMode('classic');
            }}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              background: targetingMode === 'classic' ? 'rgba(255, 159, 28, 0.2)' : '#0b121e',
              border: `1.5px solid ${targetingMode === 'classic' ? '#FF9F1C' : '#1e2d42'}`,
              color: targetingMode === 'classic' ? '#FF9F1C' : '#94A3B8',
              fontSize: '0.76rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: targetingMode === 'classic' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span>👾</span> CLASSIC 1980 ARCADE (AUTHENTIC)
          </button>
          <button
            onClick={() => {
              setTargetingMode('algorithm');
              if (engineRef.current) engineRef.current.setTargetingMode('algorithm');
            }}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              background: targetingMode === 'algorithm' ? 'rgba(120, 213, 232, 0.2)' : '#0b121e',
              border: `1.5px solid ${targetingMode === 'algorithm' ? '#78D5E8' : '#1e2d42'}`,
              color: targetingMode === 'algorithm' ? '#78D5E8' : '#94A3B8',
              fontSize: '0.76rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: targetingMode === 'algorithm' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span>🧠</span> ALGORITHM MODE (X-RAY A*)
          </button>
        </div>

        <button
          onClick={() => setIsInsightOpen(true)}
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: '6px',
            background: 'rgba(198, 242, 119, 0.12)',
            border: '1px solid rgba(198, 242, 119, 0.35)',
            color: '#C6F277',
            fontSize: '0.76rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Sparkles size={14} /> Why Does It Work? (Heuristic Proof)
        </button>
      </div>

      {/* Campaign Level Bar (if in Campaign Mode) */}
      {mode === 'campaign' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            padding: '0.5rem 0.75rem',
            marginBottom: '1rem',
            background: '#070a12',
            border: '1px solid #142032',
            borderRadius: '8px',
          }}
        >
          <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: '#64748B', whiteSpace: 'nowrap' }}>
            CAMPAIGN LEVELS:
          </span>
          {CAMPAIGN_LEVELS.map((lvl, idx) => {
            const isSelected = campaignLevelIndex === idx;
            return (
              <button
                key={lvl.levelNumber}
                onClick={() => handleLevelSelect(idx)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  background: isSelected ? 'rgba(198, 242, 119, 0.15)' : '#0b121e',
                  border: `1px solid ${isSelected ? '#C6F277' : '#1e2d42'}`,
                  color: isSelected ? '#C6F277' : '#94A3B8',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 700 : 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {lvl.title.split(':')[0]} ({lvl.enemies[0]?.toUpperCase() || 'ARENA'})
              </button>
            );
          })}
          <button
            onClick={() => setIsLessonOpen(true)}
            className="btn-tactile btn-sm"
            style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: 'auto' }}
          >
            <HelpCircle size={14} /> Lesson Brief
          </button>
        </div>
      )}

      {/* Score & Instrument Status Ribbon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: '#070c14',
          border: '1px solid #142236',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <div>
          <span style={{ fontSize: '0.65rem', color: '#64748B' }}>SCORE</span>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#C6F277' }}>
            {score.toLocaleString()}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.65rem', color: '#64748B' }}>HIGH SCORE</span>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#78D5E8' }}>
            {highScore.toLocaleString()}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.65rem', color: '#64748B' }}>LIVES</span>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F43F5E' }}>
            {'♥'.repeat(lives)}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.65rem', color: '#64748B' }}>ENGINE STATE</span>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: gameState === 'running' ? '#C6F277' : '#F59E0B' }}>
            {gameState.toUpperCase()}
          </div>
        </div>

        {/* Quick Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <button
            onClick={() => engineRef.current?.togglePause()}
            className="btn-tactile btn-sm"
            title="Pause / Resume (Esc)"
          >
            {gameState === 'running' ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button
            onClick={() => engineRef.current?.resetGame()}
            className="btn-tactile btn-sm"
            title="Reset Game"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={handleToggleSound}
            className="btn-tactile btn-sm"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} color="#C6F277" />}
          </button>
        </div>
      </div>

      {/* Main Game Screen Canvas with Side HUD */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 340px)',
          gap: '1rem',
          alignItems: 'start',
        }}
      >
        {/* Left: Canvas Area */}
        <div
          style={{
            position: 'relative',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1.5px solid #1a2a40',
            background: '#04070d',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 20px rgba(120, 213, 232, 0.1)',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: 'auto',
              minHeight: '380px',
              display: 'block',
              aspectRatio: '28/36',
            }}
          />

          {/* Overlay Message when Game State is Ready / Paused / Over */}
          {gameState !== 'running' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(3, 7, 18, 0.75)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.85rem',
              }}
            >
              <h3 style={{ color: '#F1F5F9', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                {gameState === 'ready'
                  ? 'PRESS ANY ARROW OR WASD TO START'
                  : gameState === 'paused'
                  ? 'PAUSED'
                  : gameState === 'level_cleared'
                  ? 'LEVEL CLEARED!'
                  : 'GAME OVER'}
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0 }}>
                {gameState === 'ready'
                  ? 'Use arrow keys or touch pad below to guide your probe'
                  : 'Press Esc to resume'}
              </p>
              <button
                onClick={() => {
                  engineRef.current?.start();
                  setGameState('running');
                }}
                className="btn-tactile btn-primary"
                style={{ padding: '0.5rem 1.5rem', fontWeight: 800 }}
              >
                {gameState === 'ready' ? 'START MISSION ▶' : 'CONTINUE ▶'}
              </button>
            </div>
          )}
        </div>

        {/* Right: X-Ray HUD & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* X-Ray HUD */}
          <XRayHud
            ghosts={engineRef.current?.ghosts || []}
            activePersonality={focalPersonality}
            onSelectPersonality={(p) => setFocalPersonality(p)}
            heuristicType={heuristicType}
            onSelectHeuristic={(h) => setHeuristicType(h)}
            isGhostLab={mode === 'ghost_lab'}
          />

          {/* Instrument Settings Deck */}
          <div
            style={{
              padding: '0.85rem',
              background: '#070c14',
              border: '1px solid #162436',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.76rem',
            }}
          >
            <div style={{ color: '#64748B', fontWeight: 700, marginBottom: '0.5rem' }}>
              LABORATORY DISPLAY CONTROLS
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ color: '#CBD5E1' }}>X-Ray Vector Radar Overlay</span>
                <input
                  type="checkbox"
                  checked={showXRay}
                  onChange={(e) => setShowXRay(e.target.checked)}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ color: '#CBD5E1' }}>CRT Phosphor Scanlines</span>
                <input
                  type="checkbox"
                  checked={scanlines}
                  onChange={(e) => setScanlines(e.target.checked)}
                />
              </label>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ color: '#CBD5E1' }}>Game Speed (Accessible Slow Mode)</span>
                  <span style={{ color: '#78D5E8' }}>{gameSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={gameSpeed}
                  onChange={(e) => {
                    const spd = Number(e.target.value);
                    setGameSpeed(spd);
                    if (engineRef.current) engineRef.current.speedMultiplier = spd;
                  }}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Mobile Touch Controls */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <TouchControls onDirection={handleTouchDirection} activeDir={engineRef.current?.player.dir} />
          </div>
        </div>
      </div>

      {/* Mode Specific Deep-Dive Panels */}
      {mode === 'ghost_lab' && engineRef.current && (
        <GhostLabPanel
          maze={engineRef.current.maze}
          startCoord={engineRef.current.maze.ghostSpawn}
          goalCoord={engineRef.current.maze.playerSpawn}
        />
      )}

      {mode === 'be_the_agent' && (
        <BeTheAgentPanel
          playerCost={playerCost}
          playerSteps={playerSteps}
          goalReached={agentTrialDone}
          optimalCost={benchAstar.cost}
          optimalSteps={benchAstar.steps}
          bfsCost={benchBfs.cost}
          bfsSteps={benchBfs.steps}
          onReset={initEngine}
        />
      )}

      {/* Micro-Lesson & Quiz Modal */}
      <MicroLessonModal
        levelConfig={currentLevelConfig}
        isOpen={isLessonOpen}
        onPassQuiz={() => {
          unlockGameAchievement(`LEVEL_${campaignLevelIndex + 1}_STAR`);
        }}
        onClose={() => setIsLessonOpen(false)}
      />

      {/* Heuristic Insight Academic Modal */}
      <HeuristicInsightModal
        isOpen={isInsightOpen}
        onClose={() => setIsInsightOpen(false)}
      />
    </div>
  );
};
