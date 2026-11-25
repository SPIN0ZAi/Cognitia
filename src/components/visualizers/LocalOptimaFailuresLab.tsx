import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Play,
  Footprints,
  AlertTriangle
} from 'lucide-react';

type PathologyType = 'local-optimum' | 'plateau' | 'ridge';

export const LocalOptimaFailuresLab: React.FC = () => {
  const [pathology, setPathology] = useState<PathologyType>('local-optimum');

  // ==========================================
  // PATHOLOGY 1: LOCAL MAXIMUM / TRAP
  // ==========================================
  const [p1State, setP1State] = useState<number>(3); // x=3 is local peak (f=14), x=9 is global peak (f=26)
  const p1Terrain = [6, 10, 13, 14, 11, 8, 12, 18, 23, 26, 20];
  const [p1Log, setP1Log] = useState<string>(
    'Greedy climber is at x=3 (f=14). Both left (f=13) and right (f=11) worsen.'
  );

  const stepP1 = (action: 'greedy' | 'random-restart' | 'stochastic-jump') => {
    if (action === 'greedy') {
      const left = p1State > 0 ? p1Terrain[p1State - 1] : -Infinity;
      const right = p1State < p1Terrain.length - 1 ? p1Terrain[p1State + 1] : -Infinity;
      const cur = p1Terrain[p1State];

      if (left > cur && left >= right) {
        setP1State(p1State - 1);
        setP1Log(`Ascended left to x=${p1State - 1} (f=${p1Terrain[p1State - 1]}).`);
      } else if (right > cur) {
        setP1State(p1State + 1);
        setP1Log(`Ascended right to x=${p1State + 1} (f=${p1Terrain[p1State + 1]}).`);
      } else {
        setP1Log(
          `HALTED! Local Peak Trapped at x=${p1State} (f=${cur}). Both neighbors (Left f=${left}, Right f=${right}) are lower!`
        );
      }
    } else if (action === 'random-restart') {
      const randX = Math.floor(Math.random() * p1Terrain.length);
      setP1State(randX);
      setP1Log(`Random Restart: Climber parachute-dropped to uniform random location x=${randX} (f=${p1Terrain[randX]}).`);
    } else {
      // Stochastic jump / kick
      const delta = Math.random() > 0.5 ? 3 : -3;
      const newX = Math.max(0, Math.min(p1Terrain.length - 1, p1State + delta));
      setP1State(newX);
      setP1Log(`Thermal / Noise Kick: Perturbed position by Δx=${delta > 0 ? `+${delta}` : delta} to escape basin.`);
    }
  };

  // ==========================================
  // PATHOLOGY 2: FLAT PLATEAUS & SHOULDERS
  // ==========================================
  const [p2State, setP2State] = useState<number>(2); // Shoulder at 2, 3, 4 (f=12), Summit at 7 (f=22)
  const p2Terrain = [8, 11, 12, 12, 12, 14, 18, 22, 19];
  const [p2SidewaysRule, setP2SidewaysRule] = useState<'disabled' | 'unlimited' | 'capped'>('capped');
  const [p2SidewaysCount, setP2SidewaysCount] = useState<number>(0);
  const [p2Log, setP2Log] = useState<string>(
    'Climber is entering the flat shoulder at x=2 (f=12). Gradient is zero (Δf = 0).'
  );

  const stepP2 = () => {
    const cur = p2Terrain[p2State];
    const right = p2State < p2Terrain.length - 1 ? p2Terrain[p2State + 1] : -Infinity;

    if (p2State === 7) {
      setP2Log('★ SUMMIT CONQUERED! Reached global maximum x=7 (f=22).');
      return;
    }

    if (right > cur) {
      setP2State(p2State + 1);
      setP2SidewaysCount(0);
      setP2Log(`Slope detected! Ascended to x=${p2State + 1} (f=${right}).`);
    } else if (right === cur) {
      if (p2SidewaysRule === 'disabled') {
        setP2Log(`HALTED! Neighbor x=${p2State + 1} has equal elevation (f=${right}). Sideways moves disabled by policy.`);
      } else if (p2SidewaysRule === 'unlimited') {
        // Wanders back and forth
        const next = p2State === 4 ? 3 : p2State + 1;
        setP2State(next);
        setP2SidewaysCount((c) => c + 1);
        setP2Log(`Unlimited Sideways Move #${p2SidewaysCount + 1}: Stepped to x=${next} (f=${p2Terrain[next]}). Risk of endless loop!`);
      } else {
        // Capped at 4 moves
        if (p2SidewaysCount < 4) {
          setP2State(p2State + 1);
          setP2SidewaysCount((c) => c + 1);
          setP2Log(`Capped Sideways Move (${p2SidewaysCount + 1}/4): Advanced across plateau to x=${p2State + 1}.`);
        } else {
          setP2Log(`HALTED! Cap of 4 consecutive sideways moves reached. Search stopped to avoid infinite cycles.`);
        }
      }
    }
  };

  // ==========================================
  // PATHOLOGY 3: 2D DIAGONAL RIDGE
  // ==========================================
  // In a 2D space, the ridge runs along y = x.
  // Standard 1-variable cardinal moves: (x+1, y), (x-1, y), (x, y+1), (x, y-1).
  // Stepping in any single coordinate steps OFF the ridge, reducing elevation!
  const [ridgePos, setRidgePos] = useState<{ x: number; y: number }>({ x: 2, y: 2 });
  const [ridgeMovesType, setRidgeMovesType] = useState<'cardinal-1step' | 'diagonal-joint'>('cardinal-1step');
  const [ridgeLog, setRidgeLog] = useState<string>(
    'Climber is on the diagonal ridge crest at (2, 2). Elevation f=16. Test 1-step cardinal moves!'
  );

  const getRidgeElevation = (rx: number, ry: number): number => {
    // Ridge elevation increases as (x + y), but drops sharply with cross-distance |x - y|
    const crestHeight = (rx + ry) * 4;
    const distancePenalty = Math.pow(rx - ry, 2) * 9;
    return Math.max(0, Math.round(crestHeight - distancePenalty));
  };

  const stepRidge = (dir: 'N' | 'S' | 'E' | 'W' | 'NE') => {
    let nextX = ridgePos.x;
    let nextY = ridgePos.y;

    if (dir === 'N') nextY = Math.min(5, ridgePos.y + 1);
    if (dir === 'S') nextY = Math.max(0, ridgePos.y - 1);
    if (dir === 'E') nextX = Math.min(5, ridgePos.x + 1);
    if (dir === 'W') nextX = Math.max(0, ridgePos.x - 1);
    if (dir === 'NE') {
      nextX = Math.min(5, ridgePos.x + 1);
      nextY = Math.min(5, ridgePos.y + 1);
    }

    const curF = getRidgeElevation(ridgePos.x, ridgePos.y);
    const newF = getRidgeElevation(nextX, nextY);

    if (newF > curF) {
      setRidgePos({ x: nextX, y: nextY });
      setRidgeLog(`ASCENT SUCCESS! Moved ${dir} to (${nextX}, ${nextY}) on the ridge crest! (f=${curF} → f=${newF}, Δf=+${newF - curF})`);
    } else {
      setRidgeLog(
        `RIDGE FAILURE: Move ${dir} to (${nextX}, ${nextY}) drops off the crest! (f=${curF} → f=${newF}, Δf=${newF - curF}). Greedy climber rejects this step!`
      );
    }
  };

  return (
    <div className="visualizer-container">
      {/* Header */}
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <AlertTriangle size={20} style={{ color: 'var(--lab-accent-amber)' }} />
            Search Landscape Pathologies & Escape Tactics (UCLM Slides 19–24)
          </div>
          <div className="visualizer-subtitle">
            Local Maxima Basins, Flat Shoulders / Plateaus & The 2D Diagonal Ridge Dilemma
          </div>
        </div>

        <div className="visualizer-controls">
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setPathology('local-optimum')}
              className={`btn-tactile btn-sm ${pathology === 'local-optimum' ? 'btn-rose' : ''}`}
            >
              1. Local Peak Trap
            </button>
            <button
              onClick={() => setPathology('plateau')}
              className={`btn-tactile btn-sm ${pathology === 'plateau' ? 'btn-amber' : ''}`}
            >
              2. Plateau / Shoulder
            </button>
            <button
              onClick={() => setPathology('ridge')}
              className={`btn-tactile btn-sm ${pathology === 'ridge' ? 'btn-cyan' : ''}`}
            >
              3. The Ridge Dilemma
            </button>
          </div>
        </div>
      </div>

      <div className="visualizer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* ========================================================================= */}
        {/* SCENARIO 1: LOCAL PEAK TRAP */}
        {/* ========================================================================= */}
        {pathology === 'local-optimum' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Control Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1rem',
                background: 'var(--lab-bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--lab-border-subtle)',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              <div>
                <span className="badge badge-rose font-mono" style={{ marginRight: '0.5rem' }}>
                  State x = {p1State}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  Elevation: <strong className="font-mono text-lime-400">f({p1State}) = {p1Terrain[p1State]}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => stepP1('greedy')}
                  className="btn-tactile btn-sm btn-rose"
                >
                  Greedy Step (Fails at Peak)
                </button>
                <button
                  onClick={() => stepP1('stochastic-jump')}
                  className="btn-tactile btn-sm btn-amber"
                >
                  <Sparkles size={14} />
                  <span>Stochastic Kick ($\Delta x = \pm 3$)</span>
                </button>
                <button
                  onClick={() => stepP1('random-restart')}
                  className="btn-tactile btn-sm btn-cyan"
                >
                  <RotateCcw size={14} />
                  <span>Random Restart</span>
                </button>
              </div>
            </div>

            {/* SVG Visualizer Canvas */}
            <div
              style={{
                background: 'var(--lab-bg-obsidian)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--lab-border-active)',
                padding: '1rem'
              }}
            >
              <div style={{ width: '100%', height: '180px' }}>
                <svg viewBox="0 0 700 180" style={{ width: '100%', height: '100%' }}>
                  {/* Terrain Bars */}
                  {p1Terrain.map((val, idx) => {
                    const barW = 48;
                    const x = 50 + idx * 56;
                    const h = (val / 30) * 120;
                    const y = 150 - h;
                    const isClimber = idx === p1State;
                    const isLocalMax = idx === 3;
                    const isGlobalMax = idx === 9;

                    return (
                      <g key={`bar-${idx}`} onClick={() => setP1State(idx)} style={{ cursor: 'pointer' }}>
                        <rect
                          x={x}
                          y={y}
                          width={barW}
                          height={h}
                          rx="4"
                          fill={
                            isClimber
                              ? 'var(--lab-accent-lime)'
                              : isGlobalMax
                              ? 'rgba(198, 242, 119, 0.25)'
                              : isLocalMax
                              ? 'rgba(251, 113, 133, 0.3)'
                              : 'rgba(56, 189, 248, 0.12)'
                          }
                          stroke={
                            isClimber
                              ? '#ffffff'
                              : isGlobalMax
                              ? 'var(--lab-accent-lime)'
                              : isLocalMax
                              ? '#fb7185'
                              : 'var(--lab-border-subtle)'
                          }
                          strokeWidth={isClimber ? 2.5 : 1}
                        />
                        <text
                          x={x + barW / 2}
                          y={y - 8}
                          fill={isClimber ? 'var(--lab-accent-lime)' : 'var(--text-muted)'}
                          fontSize="10"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          f={val}
                        </text>
                        <text
                          x={x + barW / 2}
                          y={166}
                          fill={isClimber ? '#ffffff' : 'var(--text-muted)'}
                          fontSize="10"
                          textAnchor="middle"
                          fontFamily="monospace"
                          fontWeight={isClimber ? 'bold' : 'normal'}
                        >
                          x={idx}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Status Banner */}
              <div
                style={{
                  marginTop: '0.5rem',
                  padding: '0.65rem 0.9rem',
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.82rem',
                  color: '#f8fafc',
                  fontFamily: 'monospace'
                }}
              >
                {p1Log}
              </div>
            </div>

            {/* Academic Callout */}
            <div className="card" style={{ padding: '1rem', background: 'var(--lab-bg-surface)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-rose)', marginBottom: '0.35rem' }}>
                UCLM Exam Analysis: The Local Maximum Trap (Slide 19)
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                A <strong>local maximum</strong> is a peak that is higher than each of its neighboring states ($f(x) \ge f(x') \ \forall x' \in N(x)$), but lower than the global maximum. Because hill climbing never takes a step that lowers fitness, it is completely unable to traverse through the intervening valley to reach the global summit at $x=9$ without stochastic exploration or random restarts.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCENARIO 2: FLAT PLATEAU & SHOULDERS */}
        {/* ========================================================================= */}
        {pathology === 'plateau' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1rem',
                background: 'var(--lab-bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--lab-border-subtle)',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="badge badge-amber font-mono">
                  x = {p2State} (f={p2Terrain[p2State]})
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Sideways Steps on Plateau: <strong className="font-mono text-cyan-400">{p2SidewaysCount}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {(['disabled', 'unlimited', 'capped'] as const).map((rule) => (
                    <button
                      key={rule}
                      onClick={() => {
                        setP2SidewaysRule(rule);
                        setP2SidewaysCount(0);
                        setP2State(2);
                      }}
                      className={`btn-tactile btn-xs ${p2SidewaysRule === rule ? 'btn-primary' : ''}`}
                    >
                      {rule === 'disabled' ? 'Forbidden' : rule === 'unlimited' ? 'Uncapped' : 'Capped (4 max)'}
                    </button>
                  ))}
                </div>
                <button onClick={stepP2} className="btn-tactile btn-sm btn-emerald">
                  <Play size={14} />
                  <span>Step Across Plateau</span>
                </button>
                <button
                  onClick={() => {
                    setP2State(2);
                    setP2SidewaysCount(0);
                    setP2Log('Reset to shoulder entrance x=2.');
                  }}
                  className="btn-tactile btn-sm"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Plateau Visualization */}
            <div
              style={{
                background: 'var(--lab-bg-obsidian)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--lab-border-active)',
                padding: '1rem'
              }}
            >
              <div style={{ width: '100%', height: '170px' }}>
                <svg viewBox="0 0 650 170" style={{ width: '100%', height: '100%' }}>
                  {p2Terrain.map((val, idx) => {
                    const barW = 54;
                    const x = 50 + idx * 62;
                    const h = (val / 25) * 115;
                    const y = 140 - h;
                    const isClimber = idx === p2State;
                    const isPlateau = idx >= 2 && idx <= 4;

                    return (
                      <g key={`p2-bar-${idx}`} onClick={() => setP2State(idx)} style={{ cursor: 'pointer' }}>
                        <rect
                          x={x}
                          y={y}
                          width={barW}
                          height={h}
                          rx="4"
                          fill={
                            isClimber
                              ? 'var(--lab-accent-lime)'
                              : isPlateau
                              ? 'rgba(251, 191, 36, 0.2)'
                              : 'rgba(56, 189, 248, 0.12)'
                          }
                          stroke={
                            isClimber
                              ? '#ffffff'
                              : isPlateau
                              ? 'var(--lab-accent-amber)'
                              : 'var(--lab-border-subtle)'
                          }
                          strokeWidth={isClimber ? 2.5 : 1}
                        />
                        <text
                          x={x + barW / 2}
                          y={y - 8}
                          fill={isClimber ? 'var(--lab-accent-lime)' : 'var(--text-muted)'}
                          fontSize="10"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          f={val}
                        </text>
                        <text
                          x={x + barW / 2}
                          y={156}
                          fill={isClimber ? '#ffffff' : 'var(--text-muted)'}
                          fontSize="10"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          x={idx}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div
                style={{
                  marginTop: '0.5rem',
                  padding: '0.65rem 0.9rem',
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.82rem',
                  color: '#f8fafc',
                  fontFamily: 'monospace'
                }}
              >
                {p2Log}
              </div>
            </div>

            <div className="card" style={{ padding: '1rem', background: 'var(--lab-bg-surface)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--lab-accent-amber)', marginBottom: '0.35rem' }}>
                UCLM Slide 21: The Sideways Move Policy
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                On flat plateaus and shoulders, $\Delta f = 0$. If sideways moves are completely disallowed, the search halts prematurely. If unlimited sideways moves are permitted, the agent will loop back and forth endlessly. <strong>The standard solution is a cap (e.g. limit to 100 sideways moves in 8-queens, 4 moves here)</strong>, which allows crossing the shoulder and ascending the summit slope.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCENARIO 3: 2D DIAGONAL RIDGE DILEMMA */}
        {/* ========================================================================= */}
        {pathology === 'ridge' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1rem',
                background: 'var(--lab-bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--lab-border-subtle)',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              <div>
                <span className="badge badge-cyan font-mono" style={{ marginRight: '0.5rem' }}>
                  Position: ({ridgePos.x}, {ridgePos.y})
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  Elevation: <strong className="font-mono text-lime-400">f = {getRidgeElevation(ridgePos.x, ridgePos.y)}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => setRidgeMovesType('cardinal-1step')}
                    className={`btn-tactile btn-xs ${ridgeMovesType === 'cardinal-1step' ? 'btn-rose' : ''}`}
                  >
                    1-Variable Steps (N, S, E, W)
                  </button>
                  <button
                    onClick={() => setRidgeMovesType('diagonal-joint')}
                    className={`btn-tactile btn-xs ${ridgeMovesType === 'diagonal-joint' ? 'btn-emerald' : ''}`}
                  >
                    Joint Move (NE Diagonal)
                  </button>
                </div>

                <button
                  onClick={() => {
                    setRidgePos({ x: 2, y: 2 });
                    setRidgeLog('Reset to ridge crest at (2, 2).');
                  }}
                  className="btn-tactile btn-xs"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            </div>

            {/* 2D Contour Grid Canvas */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(280px, 360px) 1fr',
                gap: '1rem',
                background: 'var(--lab-bg-obsidian)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--lab-border-active)',
                padding: '1rem'
              }}
            >
              {/* 2D Heatmap Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                  2D Elevation Heatmap (Ridge runs along diagonal $y = x$)
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 42px)',
                    gridTemplateRows: 'repeat(6, 42px)',
                    gap: '4px',
                    padding: '8px',
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {[5, 4, 3, 2, 1, 0].map((y) =>
                    [0, 1, 2, 3, 4, 5].map((x) => {
                      const elev = getRidgeElevation(x, y);
                      const isCurrent = ridgePos.x === x && ridgePos.y === y;
                      const isCrest = x === y;

                      // Color based on elevation and ridge crest
                      const heatOpacity = Math.min(0.9, Math.max(0.08, elev / 45));

                      return (
                        <div
                          key={`cell-${x}-${y}`}
                          onClick={() => setRidgePos({ x, y })}
                          title={`(${x}, ${y}): elevation = ${elev}`}
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            background: isCurrent
                              ? 'var(--lab-accent-lime)'
                              : isCrest
                              ? `rgba(56, 189, 248, ${heatOpacity})`
                              : `rgba(244, 63, 94, ${heatOpacity * 0.4})`,
                            border: isCurrent
                              ? '2px solid #ffffff'
                              : isCrest
                              ? '1px solid rgba(56, 189, 248, 0.5)'
                              : '1px solid rgba(255,255,255,0.05)',
                            color: isCurrent ? '#000000' : '#ffffff',
                            fontWeight: isCurrent ? 'bold' : 'normal',
                            fontSize: '0.65rem'
                          }}
                        >
                          {isCurrent ? (
                            <Footprints size={16} />
                          ) : (
                            <>
                              <span style={{ fontSize: '0.55rem', opacity: 0.6 }}>{x},{y}</span>
                              <strong style={{ fontFamily: 'monospace' }}>{elev}</strong>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Directional Pad & Move Experimentation */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.4rem' }}>
                    Attempt Next Climber Move:
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    Test whether standard single-coordinate moves step off the crest into lower valleys, versus joint diagonal progression.
                  </p>
                </div>

                {/* D-Pad Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => stepRidge('N')}
                    className="btn-tactile btn-sm"
                    style={{ width: '130px' }}
                  >
                    North (y+1): f={getRidgeElevation(ridgePos.x, Math.min(5, ridgePos.y + 1))}
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => stepRidge('W')}
                      className="btn-tactile btn-sm"
                      style={{ width: '130px' }}
                    >
                      West (x-1): f={getRidgeElevation(Math.max(0, ridgePos.x - 1), ridgePos.y)}
                    </button>
                    <button
                      onClick={() => stepRidge('E')}
                      className="btn-tactile btn-sm"
                      style={{ width: '130px' }}
                    >
                      East (x+1): f={getRidgeElevation(Math.min(5, ridgePos.x + 1), ridgePos.y)}
                    </button>
                  </div>

                  <button
                    onClick={() => stepRidge('S')}
                    className="btn-tactile btn-sm"
                    style={{ width: '130px' }}
                  >
                    South (y-1): f={getRidgeElevation(ridgePos.x, Math.max(0, ridgePos.y - 1))}
                  </button>

                  {/* Diagonal Joint Button */}
                  <div style={{ marginTop: '0.5rem', width: '100%', maxWidth: '280px' }}>
                    <button
                      onClick={() => stepRidge('NE')}
                      className="btn-tactile btn-sm btn-emerald"
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                    >
                      <Sparkles size={14} />
                      <span>Diagonal Joint Move (x+1, y+1)</span>
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '6px',
                    border: '1px solid var(--border-medium)',
                    fontSize: '0.78rem',
                    color: '#f8fafc',
                    fontFamily: 'monospace'
                  }}
                >
                  {ridgeLog}
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '1rem', background: 'var(--lab-bg-surface)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--lab-accent-cyan)', marginBottom: '0.35rem' }}>
                UCLM Slide 22: The Geometric Ridge Dilemma
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                A <strong>ridge</strong> is a sequence of local peaks where the crest slopes gently upward, but the sides are steep. When the search operator can only modify one coordinate at a time (cardinal moves $N, S, E, W$), <em>every single 1-step move falls off the ridge into lower elevation</em>. The search halts prematurely. Overcoming a ridge requires <strong>joint 2-variable moves (diagonals)</strong>, randomized directions, or rotating the search coordinates.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
