import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Play,
} from 'lucide-react';

type PathologyType = 'local-optimum' | 'plateau' | 'ridge';

export const LocalOptimaFailuresLab: React.FC = () => {
  const [pathology, setPathology] = useState<PathologyType>('local-optimum');

  // Pathology 1: Local Optimum State
  const [p1State, setP1State] = useState<number>(3); // x=3 is local peak (f=14), x=9 is global peak (f=25)
  const p1Terrain = [6, 10, 13, 14, 11, 8, 12, 18, 23, 25, 20];
  const [p1Log, setP1Log] = useState<string>('Climber is currently at local peak x=3 (f=14).');

  // Pathology 2: Plateau State
  const [p2State, setP2State] = useState<number>(2); // Plateau at 2, 3, 4 (f=12), Summit at 7 (f=22)
  const p2Terrain = [8, 11, 12, 12, 12, 14, 18, 22, 19];
  const [p2SidewaysRule, setP2SidewaysRule] = useState<'disabled' | 'unlimited' | 'capped'>('capped');
  const [p2SidewaysCount, setP2SidewaysCount] = useState<number>(0);
  const [p2Log, setP2Log] = useState<string>('Climber is at the start of the flat shoulder (x=2, f=12).');

  // Pathology 3: Ridge State (2D coordinate grid where ridge runs diagonally along y = x)
  const [ridgePos, setRidgePos] = useState<{ x: number; y: number }>({ x: 2, y: 2 });
  const [ridgeLog, setRidgeLog] = useState<string>(
    'Climber is on the diagonal ridge at (2, 2). All 4 cardinal 1-step moves step off the ridge into lower terrain!'
  );

  // Elevation formula for 2D ridge: peaks along y = x, falling off sharply on either side
  const getRidgeElevation = (x: number, y: number): number => {
    // Base ridge elevation rises as x and y increase
    const ridgeProgress = (x + y) * 3;
    // Cross-ridge distance penalty: (x - y)^2
    const crossDistance = Math.abs(x - y);
    return Math.max(0, Math.round(ridgeProgress - crossDistance * 8));
  };

  // Pathology 1 Step: Local Optimum
  const stepP1 = (action: 'greedy' | 'random-restart' | 'noise') => {
    if (action === 'greedy') {
      const left = p1State > 0 ? p1Terrain[p1State - 1] : -Infinity;
      const right = p1State < p1Terrain.length - 1 ? p1Terrain[p1State + 1] : -Infinity;
      const cur = p1Terrain[p1State];

      if (left > cur && left >= right) {
        setP1State(p1State - 1);
        setP1Log(`Moved left to x=${p1State - 1} (f=${p1Terrain[p1State - 1]}).`);
      } else if (right > cur) {
        setP1State(p1State + 1);
        setP1Log(`Moved right to x=${p1State + 1} (f=${p1Terrain[p1State + 1]}).`);
      } else {
        setP1Log(`HALTED! Both neighbors worsen (Left: f=${left}, Right: f=${right}). Greedy search is trapped at local peak f=${cur}!`);
      }
    } else if (action === 'random-restart') {
      const randX = Math.floor(Math.random() * p1Terrain.length);
      setP1State(randX);
      setP1Log(`Random Restart: Jumped to uniform random position x=${randX} (f=${p1Terrain[randX]}).`);
    } else {
      // Noise / Kick
      const jump = Math.random() > 0.5 ? 2 : -2;
      const newX = Math.max(0, Math.min(p1Terrain.length - 1, p1State + jump));
      setP1State(newX);
      setP1Log(`Stochastic Perturbation: Kicked agent by Δx=${jump} to x=${newX} (f=${p1Terrain[newX]}).`);
    }
  };

  // Pathology 2 Step: Plateau
  const stepP2 = () => {
    const cur = p2Terrain[p2State];
    const right = p2State < p2Terrain.length - 1 ? p2Terrain[p2State + 1] : -Infinity;

    if (p2State === 7) {
      setP2Log('SUMMIT CONQUERED! Climber reached global maximum x=7 (f=22).');
      return;
    }

    if (right > cur) {
      setP2State(p2State + 1);
      setP2SidewaysCount(0);
      setP2Log(`Ascended slope to x=${p2State + 1} (f=${right})!`);
    } else if (right === cur) {
      if (p2SidewaysRule === 'disabled') {
        setP2Log(`HALTED! Neighbor x=${p2State + 1} has equal score f=${right}. Sideways moves are disabled.`);
      } else if (p2SidewaysRule === 'unlimited') {
        // Oscillate or wander
        const next = p2State === 4 ? 3 : p2State + 1;
        setP2State(next);
        setP2SidewaysCount((c) => c + 1);
        setP2Log(`Unlimited Sideways: Stepped to x=${next} (f=${p2Terrain[next]}). Risk of endless oscillation! (Steps: ${p2SidewaysCount + 1})`);
      } else {
        // Capped at 4 moves
        if (p2SidewaysCount < 4) {
          setP2State(p2State + 1);
          setP2SidewaysCount((c) => c + 1);
          setP2Log(`Capped Sideways Move: Stepped to x=${p2State + 1} across plateau (Count: ${p2SidewaysCount + 1}/4).`);
        } else {
          setP2Log(`HALTED! Max sideways moves threshold (4) reached without finding strictly higher elevation.`);
        }
      }
    }
  };

  // Pathology 3 Step: Ridge
  const stepRidge = (dir: 'N' | 'S' | 'E' | 'W' | 'NE') => {
    let nx = ridgePos.x;
    let ny = ridgePos.y;

    if (dir === 'N') ny += 1;
    if (dir === 'S') ny -= 1;
    if (dir === 'E') nx += 1;
    if (dir === 'W') nx -= 1;
    if (dir === 'NE') {
      nx += 1;
      ny += 1;
    }

    if (nx < 0 || nx > 5 || ny < 0 || ny > 5) {
      setRidgeLog('Move out of boundary bounds.');
      return;
    }

    const currentElev = getRidgeElevation(ridgePos.x, ridgePos.y);
    const nextElev = getRidgeElevation(nx, ny);

    if (nextElev > currentElev) {
      setRidgePos({ x: nx, y: ny });
      setRidgeLog(`Successful Ascent! Stepped ${dir} to (${nx}, ${ny}) -> Elevation increased from ${currentElev} to ${nextElev}.`);
    } else {
      setRidgeLog(`Rejected! Stepping ${dir} drops elevation from ${currentElev} to ${nextElev} (stepping off the ridge!). Single-variable hill climbing halts.`);
    }
  };

  return (
    <div className="visualizer-container">
      {/* Header */}
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <ShieldAlert size={20} style={{ color: 'var(--accent-rose)' }} />
            The Three Pathologies of Local Search Laboratory (Lesson 7, Slides 17–23)
          </div>
          <div className="visualizer-subtitle">
            Interactive Diagnostics for Local Optima, Flat Plateaus/Shoulders & 2D Diagonal Ridges
          </div>
        </div>

        {/* Pathology Selector */}
        <div className="visualizer-controls">
          <button
            onClick={() => setPathology('local-optimum')}
            className={`btn-tactile btn-sm ${pathology === 'local-optimum' ? 'btn-primary' : ''}`}
          >
            <span>1. Local Optimum</span>
          </button>
          <button
            onClick={() => setPathology('plateau')}
            className={`btn-tactile btn-sm ${pathology === 'plateau' ? 'btn-primary' : ''}`}
          >
            <span>2. Plateau / Shoulder</span>
          </button>
          <button
            onClick={() => setPathology('ridge')}
            className={`btn-tactile btn-sm ${pathology === 'ridge' ? 'btn-primary' : ''}`}
          >
            <span>3. 2D Ridge</span>
          </button>
        </div>
      </div>

      <div className="visualizer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* PATHOLOGY 1: LOCAL OPTIMUM */}
        {pathology === 'local-optimum' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                background: 'var(--lab-bg-surface)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                lineHeight: '1.5',
              }}
            >
              <strong style={{ color: 'var(--accent-rose)' }}>Slide 17 Definition: Local Optimum</strong>
              <p style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                Every single neighbor in the 1-step neighborhood $N(x)$ yields a worse evaluation score ($f(x') &lt; f(x)$), even though a far superior global maximum exists elsewhere. Because greedy hill climbing strictly refuses worsening moves, search stops dead in its tracks.
              </p>
            </div>

            {/* Interactive 1D SVG Canvas */}
            <div
              style={{
                background: 'var(--lab-bg-obsidian)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--lab-border-active)',
                padding: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                <span className="badge badge-rose font-mono">Agent at x = {p1State} (f = {p1Terrain[p1State]})</span>
                <span style={{ color: 'var(--text-muted)' }}>Target: Global Peak at x = 9 (f = 25)</span>
              </div>

              <div style={{ width: '100%', height: '170px' }}>
                <svg viewBox="0 0 500 170" style={{ width: '100%', height: '100%' }}>
                  {/* Connect points */}
                  <polyline
                    fill="none"
                    stroke="var(--accent-rose)"
                    strokeWidth="2.5"
                    points={p1Terrain.map((v, i) => `${30 + (i / 10) * 440},${145 - ((v - 5) / 22) * 120}`).join(' ')}
                  />

                  {/* Discrete nodes */}
                  {p1Terrain.map((v, i) => {
                    const cx = 30 + (i / 10) * 440;
                    const cy = 145 - ((v - 5) / 22) * 120;
                    const isCur = i === p1State;

                    return (
                      <g key={i}>
                        <circle cx={cx} cy={cy} r={isCur ? 7 : 3.5} fill={isCur ? 'var(--lab-accent-lime)' : '#64748b'} />
                        <text x={cx} y="162" fill="var(--text-muted)" fontSize="8.5" textAnchor="middle" fontFamily="monospace">
                          x={i}
                        </text>
                      </g>
                    );
                  })}

                  {/* Local peak label */}
                  <text x={30 + (3 / 10) * 440} y={145 - ((14 - 5) / 22) * 120 - 10} fill="var(--accent-rose)" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                    Local Trap (f=14)
                  </text>

                  {/* Global peak label */}
                  <text x={30 + (9 / 10) * 440} y={145 - ((25 - 5) / 22) * 120 - 10} fill="var(--lab-accent-lime)" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                    Global Peak (f=25)
                  </text>
                </svg>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <button onClick={() => stepP1('greedy')} className="btn-tactile btn-sm">
                  <span>Greedy Step (Try to Climb)</span>
                </button>
                <button onClick={() => stepP1('random-restart')} className="btn-tactile btn-sm btn-primary">
                  <RotateCcw size={14} />
                  <span>Random Restart (Jump to New Basin)</span>
                </button>
                <button onClick={() => stepP1('noise')} className="btn-tactile btn-sm btn-amber">
                  <Sparkles size={14} />
                  <span>Stochastic Kick (Simulate Annealing Jump)</span>
                </button>
              </div>
            </div>

            <div style={{ padding: '0.65rem 0.9rem', background: 'var(--lab-bg-surface)', borderRadius: '4px', borderLeft: '3px solid var(--accent-rose)', fontSize: '0.78rem', fontFamily: 'monospace' }}>
              {p1Log}
            </div>
          </div>
        )}

        {/* PATHOLOGY 2: PLATEAU & SHOULDER */}
        {pathology === 'plateau' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                background: 'var(--lab-bg-surface)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                lineHeight: '1.5',
              }}
            >
              <strong style={{ color: 'var(--lab-accent-amber)' }}>Slide 21–23: Plateaus and Flat Shoulders</strong>
              <p style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                A flat region where all neighboring configurations share identical evaluation values ($f(x') = f(x)$).
                Without sideways moves, search prematurely dies. With unrestricted sideways moves, the algorithm enters an infinite loop! Capping sideways steps (e.g. max 4) allows crossing shoulders to reach higher peaks.
              </p>
            </div>

            <div
              style={{
                background: 'var(--lab-bg-obsidian)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--lab-border-active)',
                padding: '1rem',
              }}
            >
              {/* Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {(
                    [
                      { id: 'disabled', label: 'Sideways Disabled' },
                      { id: 'unlimited', label: 'Unlimited (Infinite Loop)' },
                      { id: 'capped', label: 'Capped at 4 (Recommended)' },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setP2SidewaysRule(m.id);
                        setP2State(2);
                        setP2SidewaysCount(0);
                      }}
                      className={`btn-tactile btn-xs ${p2SidewaysRule === m.id ? 'btn-primary' : ''}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={stepP2} className="btn-tactile btn-sm btn-emerald">
                    <Play size={14} />
                    <span>Step Agent</span>
                  </button>
                  <button onClick={() => { setP2State(2); setP2SidewaysCount(0); }} className="btn-tactile btn-sm">
                    <RotateCcw size={14} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* 1D Terrain SVG */}
              <div style={{ width: '100%', height: '170px' }}>
                <svg viewBox="0 0 500 170" style={{ width: '100%', height: '100%' }}>
                  <polyline
                    fill="none"
                    stroke="var(--lab-accent-amber)"
                    strokeWidth="2.5"
                    points={p2Terrain.map((v, i) => `${35 + (i / 8) * 430},${145 - ((v - 5) / 20) * 120}`).join(' ')}
                  />

                  {p2Terrain.map((v, i) => {
                    const cx = 35 + (i / 8) * 430;
                    const cy = 145 - ((v - 5) / 20) * 120;
                    const isCur = i === p2State;

                    return (
                      <g key={i}>
                        <circle cx={cx} cy={cy} r={isCur ? 7 : 3.5} fill={isCur ? 'var(--lab-accent-lime)' : '#64748b'} />
                        <text x={cx} y="162" fill="var(--text-muted)" fontSize="8.5" textAnchor="middle" fontFamily="monospace">
                          x={i}
                        </text>
                      </g>
                    );
                  })}

                  {/* Shoulder bracket */}
                  <line x1={35 + (2 / 8) * 430} y1="80" x2={35 + (4 / 8) * 430} y2="80" stroke="var(--lab-accent-cyan)" strokeWidth="1.5" strokeDasharray="3 2" />
                  <text x={35 + (3 / 8) * 430} y="74" fill="var(--lab-accent-cyan)" fontSize="8.5" textAnchor="middle" fontFamily="monospace">
                    Flat Shoulder (f=12)
                  </text>
                  <text x={35 + (7 / 8) * 430} y={145 - ((22 - 5) / 20) * 120 - 8} fill="var(--lab-accent-lime)" fontSize="8.5" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                    Summit (f=22)
                  </text>
                </svg>
              </div>
            </div>

            <div style={{ padding: '0.65rem 0.9rem', background: 'var(--lab-bg-surface)', borderRadius: '4px', borderLeft: '3px solid var(--lab-accent-amber)', fontSize: '0.78rem', fontFamily: 'monospace' }}>
              {p2Log}
            </div>
          </div>
        )}

        {/* PATHOLOGY 3: RIDGE (2D DIAGONAL PROBLEM) */}
        {pathology === 'ridge' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                background: 'var(--lab-bg-surface)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                lineHeight: '1.5',
              }}
            >
              <strong style={{ color: 'var(--lab-accent-cyan)' }}>Slide 17: Ridges (The 2D Diagonal Blindspot)</strong>
              <p style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                A sequence of local optima where the ridge runs obliquely (e.g. along $y = x$).
                Single-variable moves (North, South, East, West) step off the ridge into lower elevations, causing greedy search to freeze!
                Only diagonal composite moves (e.g. North-East) or multi-variable neighborhood operators can advance up the ridge.
              </p>
            </div>

            {/* 2D Grid Visualizer */}
            <div
              style={{
                background: 'var(--lab-bg-obsidian)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--lab-border-active)',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) 1fr', gap: '1.5rem', alignItems: 'center' }}>
                {/* 6x6 2D Contour Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', maxWidth: '300px' }}>
                  {Array.from({ length: 6 }, (_, row) => 5 - row).map((y) =>
                    Array.from({ length: 6 }, (_, x) => {
                      const elev = getRidgeElevation(x, y);
                      const isCurrent = ridgePos.x === x && ridgePos.y === y;
                      const isRidgeLine = x === y;

                      let bg = 'rgba(15, 23, 42, 0.7)';
                      if (isRidgeLine) bg = `rgba(120, 213, 232, ${0.15 + (elev / 30) * 0.4})`;
                      if (isCurrent) bg = 'var(--lab-accent-lime)';

                      return (
                        <div
                          key={`${x}-${y}`}
                          style={{
                            height: '42px',
                            background: bg,
                            borderRadius: '4px',
                            border: isCurrent
                              ? '2px solid #fff'
                              : isRidgeLine
                              ? '1px solid var(--lab-accent-cyan)'
                              : '1px solid rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.65rem',
                            fontFamily: 'monospace',
                            color: isCurrent ? '#000' : isRidgeLine ? 'var(--lab-accent-cyan)' : 'var(--text-dim)',
                            fontWeight: isCurrent || isRidgeLine ? 700 : 400,
                          }}
                        >
                          <span>{isCurrent ? '●' : `${x},${y}`}</span>
                          <span style={{ fontSize: '0.55rem', opacity: 0.8 }}>f={elev}</span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* D-Pad Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Current Position: <strong>({ridgePos.x}, {ridgePos.y})</strong> | Elevation: <strong className="font-mono text-lime-400">f = {getRidgeElevation(ridgePos.x, ridgePos.y)}</strong>
                  </div>

                  {/* Directional Pad */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <button onClick={() => stepRidge('N')} className="btn-tactile btn-xs" style={{ width: '80px' }}>
                      North (0, +1)
                    </button>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => stepRidge('W')} className="btn-tactile btn-xs" style={{ width: '80px' }}>
                        West (-1, 0)
                      </button>
                      <button onClick={() => stepRidge('E')} className="btn-tactile btn-xs" style={{ width: '80px' }}>
                        East (+1, 0)
                      </button>
                    </div>
                    <button onClick={() => stepRidge('S')} className="btn-tactile btn-xs" style={{ width: '80px' }}>
                      South (0, -1)
                    </button>
                  </div>

                  {/* 2-Variable Move Toggle */}
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-subtle)' }}>
                    <button
                      onClick={() => stepRidge('NE')}
                      className="btn-tactile btn-sm btn-primary"
                      style={{ width: '100%' }}
                    >
                      <ArrowRight size={14} style={{ transform: 'rotate(-45deg)' }} />
                      <span>Diagonal 2-Var Move: North-East (+1, +1)</span>
                    </button>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                      Notice how North and East both drop elevation, but North-East climbs along the crest!
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '0.65rem 0.9rem', background: 'var(--lab-bg-surface)', borderRadius: '4px', borderLeft: '3px solid var(--lab-accent-cyan)', fontSize: '0.78rem', fontFamily: 'monospace' }}>
              {ridgeLog}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
