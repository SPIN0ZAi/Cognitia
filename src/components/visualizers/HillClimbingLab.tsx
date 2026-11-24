import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Compass,
  Award,
} from 'lucide-react';

export type HillClimbingStrategy = 'steepest' | 'first-choice' | 'stochastic' | 'random-restart';

export const HillClimbingLab: React.FC = () => {
  // Rich multimodal landscape of 21 discrete states (0 to 20):
  // x=4: local peak (14)
  // x=9: major local peak (22)
  // x=11..13: flat plateau/shoulder (16, 16, 16)
  // x=18: global maximum summit (28)
  const landscape = [
    6, 9, 12, 14, 13, 10, 12, 16, 20, 22, 19, 16, 16, 16, 17, 21, 25, 27, 28, 24, 18,
  ];

  const [currentIdx, setCurrentIdx] = useState<number>(2);
  const [strategy, setStrategy] = useState<HillClimbingStrategy>('steepest');
  const [allowSideways, setAllowSideways] = useState<boolean>(true);
  const [maxSideways, setMaxSideways] = useState<number>(3);
  const [sidewaysCount, setSidewaysCount] = useState<number>(0);
  const [qProb] = useState<number>(0.8);
  const [speedMs, setSpeedMs] = useState<number>(400);

  // Runtime State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isTerminated, setIsTerminated] = useState<boolean>(false);
  const [trajectory, setTrajectory] = useState<number[]>([2]);
  const [restartCount, setRestartCount] = useState<number>(0);
  const [statusLog, setStatusLog] = useState<string>(
    'Select initial state by clicking the terrain, or click Auto Climb / Step.'
  );

  // Prediction Challenge Mode
  const [predictionMode, setPredictionMode] = useState<boolean>(false);
  const [predictFeedback, setPredictFeedback] = useState<string | null>(null);
  const [isPredictCorrect, setIsPredictCorrect] = useState<boolean | null>(null);

  // Neighbors of current state
  const getNeighbors = (idx: number) => {
    const n: number[] = [];
    if (idx > 0) n.push(idx - 1);
    if (idx < landscape.length - 1) n.push(idx + 1);
    return n;
  };

  // Perform single algorithmic step
  const executeStep = () => {
    if (isTerminated && strategy !== 'random-restart') return;

    const currentScore = landscape[currentIdx];
    const neighbors = getNeighbors(currentIdx);

    // If stuck at global maximum
    if (currentScore === 28) {
      setIsTerminated(true);
      setIsRunning(false);
      setStatusLog('GLOBAL MAXIMUM REACHED at x=18 (f=28)! Perfect optimization summit conquered.');
      return;
    }

    let nextIdx: number | null = null;
    let logMsg = '';

    if (strategy === 'steepest') {
      // Evaluate all neighbors in N(x) and pick strictly best
      let bestNeighbor: number | null = null;
      let maxScore = currentScore;

      for (const n of neighbors) {
        if (landscape[n] > maxScore) {
          maxScore = landscape[n];
          bestNeighbor = n;
        } else if (allowSideways && landscape[n] === currentScore && bestNeighbor === null && sidewaysCount < maxSideways) {
          bestNeighbor = n;
        }
      }

      if (bestNeighbor !== null && bestNeighbor !== currentIdx) {
        if (landscape[bestNeighbor] === currentScore) {
          setSidewaysCount((c) => c + 1);
          logMsg = `Sideways move to x=${bestNeighbor} (f=${landscape[bestNeighbor]}, count ${sidewaysCount + 1}/${maxSideways}).`;
        } else {
          setSidewaysCount(0);
          logMsg = `Steepest Ascent: moved to x=${bestNeighbor} (f=${landscape[bestNeighbor]}).`;
        }
        nextIdx = bestNeighbor;
      } else {
        setIsTerminated(true);
        setIsRunning(false);
        logMsg = `Terminated: Stuck at local peak x=${currentIdx} (f=${currentScore}). No neighbor strictly improves.`;
      }
    } else if (strategy === 'first-choice') {
      // Shuffle neighbors and pick first improving move
      const shuffled = [...neighbors].sort(() => Math.random() - 0.5);
      let found = false;

      for (const n of shuffled) {
        if (landscape[n] > currentScore) {
          nextIdx = n;
          found = true;
          setSidewaysCount(0);
          logMsg = `First Choice: accepted improving neighbor x=${n} (f=${landscape[n]}).`;
          break;
        } else if (allowSideways && landscape[n] === currentScore && sidewaysCount < maxSideways) {
          nextIdx = n;
          found = true;
          setSidewaysCount((c) => c + 1);
          logMsg = `First Choice: accepted sideways step to x=${n} (f=${landscape[n]}).`;
          break;
        }
      }

      if (!found) {
        setIsTerminated(true);
        setIsRunning(false);
        logMsg = `Terminated: First Choice found no improving neighbor around x=${currentIdx} (f=${currentScore}).`;
      }
    } else if (strategy === 'stochastic') {
      // Stochastic: with probability q picks best neighbor, with 1-q picks random
      const r = Math.random();
      if (r <= qProb) {
        const best = neighbors.reduce((b, cur) => (landscape[cur] > landscape[b] ? cur : b), neighbors[0]);
        if (landscape[best] >= currentScore) {
          nextIdx = best;
          logMsg = `Stochastic HC (roll ${r.toFixed(2)} <= q): greedy ascent to best neighbor x=${best} (f=${landscape[best]}).`;
        }
      } else {
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        nextIdx = randomNeighbor;
        logMsg = `Stochastic HC (roll ${r.toFixed(2)} > q): exploratory step to neighbor x=${randomNeighbor} (f=${landscape[randomNeighbor]}).`;
      }

      if (nextIdx === null || landscape[nextIdx] < currentScore) {
        setIsTerminated(true);
        setIsRunning(false);
        logMsg = `Terminated: Stochastic search stalled at x=${currentIdx}.`;
      }
    } else if (strategy === 'random-restart') {
      // Check if current position can improve
      const best = neighbors.reduce((b, cur) => (landscape[cur] > landscape[b] ? cur : b), neighbors[0]);
      if (landscape[best] > currentScore) {
        nextIdx = best;
        logMsg = `Restart #${restartCount}: Climbing to x=${best} (f=${landscape[best]}).`;
      } else {
        // Stuck at local peak: trigger random restart!
        const randomStart = Math.floor(Math.random() * landscape.length);
        nextIdx = randomStart;
        setRestartCount((c) => c + 1);
        setSidewaysCount(0);
        logMsg = `Stuck at local peak x=${currentIdx} (f=${currentScore})! Triggering Random Restart #${restartCount + 1} to x=${randomStart} (f=${landscape[randomStart]}).`;
      }
    }

    if (nextIdx !== null) {
      setCurrentIdx(nextIdx);
      setTrajectory((prev) => [...prev.slice(-25), nextIdx!]);
      setStatusLog(logMsg);
    } else {
      setStatusLog(logMsg);
    }
  };

  // Continuous animation loop
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isRunning && !isTerminated) {
      timer = setInterval(() => {
        executeStep();
      }, speedMs);
    }
    return () => clearInterval(timer);
  }, [isRunning, isTerminated, currentIdx, strategy, allowSideways, sidewaysCount, maxSideways, qProb, speedMs, restartCount]);

  // Reset to initial state
  const resetTo = (newIdx: number) => {
    setIsRunning(false);
    setIsTerminated(false);
    setCurrentIdx(newIdx);
    setTrajectory([newIdx]);
    setSidewaysCount(0);
    setRestartCount(0);
    setPredictFeedback(null);
    setStatusLog(`Reset climber to x=${newIdx} (f=${landscape[newIdx]}).`);
  };

  // Prediction challenge verification
  const handleVerifyPrediction = (userChoice: 'left' | 'right' | 'stop') => {
    const leftScore = currentIdx > 0 ? landscape[currentIdx - 1] : -Infinity;
    const rightScore = currentIdx < landscape.length - 1 ? landscape[currentIdx + 1] : -Infinity;
    const currentScore = landscape[currentIdx];

    let actual: 'left' | 'right' | 'stop';
    if (strategy === 'steepest') {
      if (leftScore <= currentScore && rightScore <= currentScore) {
        actual = allowSideways && (leftScore === currentScore || rightScore === currentScore) && sidewaysCount < maxSideways
          ? (rightScore === currentScore ? 'right' : 'left')
          : 'stop';
      } else if (rightScore > leftScore) {
        actual = 'right';
      } else {
        actual = 'left';
      }
    } else {
      actual = rightScore > currentScore ? 'right' : leftScore > currentScore ? 'left' : 'stop';
    }

    if (userChoice === actual) {
      setIsPredictCorrect(true);
      setPredictFeedback(`Correct! The algorithm chooses ${actual.toUpperCase()}. (Left f=${leftScore}, Current f=${currentScore}, Right f=${rightScore}).`);
    } else {
      setIsPredictCorrect(false);
      setPredictFeedback(`Incorrect: The algorithm chose ${actual.toUpperCase()}. Left f=${leftScore}, Current f=${currentScore}, Right f=${rightScore}.`);
    }
  };

  // SVG dimensions
  const svgW = 600;
  const svgH = 220;
  const margin = { top: 30, right: 30, bottom: 40, left: 45 };
  const plotW = svgW - margin.left - margin.right;
  const plotH = svgH - margin.top - margin.bottom;

  const toPx = (idx: number) => margin.left + (idx / 20) * plotW;
  const toPy = (score: number) => margin.top + plotH - ((score - 5) / 25) * plotH;

  // Build smooth SVG area and line path for the landscape
  const curvePoints = landscape.map((val, i) => `${toPx(i).toFixed(1)},${toPy(val).toFixed(1)}`);
  const linePath = `M ${curvePoints.join(' L ')}`;
  const areaPath = `M ${toPx(0)},${toPy(landscape[0])} L ${curvePoints.join(' L ')} L ${toPx(20)},${margin.top + plotH} L ${toPx(0)},${margin.top + plotH} Z`;

  return (
    <div className="visualizer-container">
      {/* Header */}
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <TrendingUp size={20} style={{ color: 'var(--lab-accent-cyan)' }} />
            Hill Climbing & Landscape Trajectory Simulator (Lesson 7, Slides 14–28)
          </div>
          <div className="visualizer-subtitle">
            Steepest Ascent, First Choice, Stochastic Hill Climbing & Plateau Sideways Traversal
          </div>
        </div>

        <div className="visualizer-controls">
          <button
            onClick={() => setIsRunning(!isRunning)}
            disabled={isTerminated && strategy !== 'random-restart'}
            className={`btn-tactile btn-sm ${isRunning ? 'btn-amber' : 'btn-emerald'}`}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
            <span>{isRunning ? 'Pause' : 'Auto Climb'}</span>
          </button>
          <button
            onClick={executeStep}
            disabled={isRunning || (isTerminated && strategy !== 'random-restart')}
            className="btn-tactile btn-sm"
          >
            <SkipForward size={14} />
            <span>Step</span>
          </button>
          <button
            onClick={() => setPredictionMode(!predictionMode)}
            className={`btn-tactile btn-sm ${predictionMode ? 'btn-primary' : ''}`}
          >
            <HelpCircle size={14} />
            <span>Predict Move</span>
          </button>
          <button onClick={() => resetTo(2)} className="btn-tactile btn-sm">
            <RotateCcw size={14} />
            <span>Reset (x=2)</span>
          </button>
        </div>
      </div>

      <div className="visualizer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Strategy & Hyperparameter Deck */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            background: 'var(--lab-bg-surface)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* Strategy Selector */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Search Strategy:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              {(
                [
                  { id: 'steepest', label: 'Steepest Ascent' },
                  { id: 'first-choice', label: 'First Choice' },
                  { id: 'stochastic', label: 'Stochastic' },
                  { id: 'random-restart', label: 'Random Restart' },
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setStrategy(s.id);
                    resetTo(currentIdx);
                  }}
                  className={`btn-tactile btn-xs ${strategy === s.id ? 'btn-primary' : ''}`}
                  style={{ padding: '0.3rem 0.4rem', fontSize: '0.68rem' }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Plateau Sideways Controls */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Sideways Moves (Shoulder):</span>
              <strong className="font-mono text-cyan-400">
                {allowSideways ? `Max ${maxSideways}` : 'Disabled'}
              </strong>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                onClick={() => setAllowSideways(!allowSideways)}
                className={`btn-tactile btn-xs ${allowSideways ? 'btn-emerald' : ''}`}
                style={{ flex: 1 }}
              >
                {allowSideways ? 'Enabled' : 'Disabled'}
              </button>
              {allowSideways && (
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={maxSideways}
                  onChange={(e) => setMaxSideways(parseInt(e.target.value, 10))}
                  style={{ width: '80px', accentColor: 'var(--lab-accent-cyan)' }}
                  title="Maximum consecutive sideways steps"
                />
              )}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
              Slide 21: Prevents infinite loops on plateaus.
            </span>
          </div>

          {/* Quick Start State Presets */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Initial Starting State:
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { label: 'Basin 1 (x=0)', idx: 0 },
                { label: 'Peak 2 (x=7)', idx: 7 },
                { label: 'Plateau (x=11)', idx: 11 },
                { label: 'Summit (x=15)', idx: 15 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => resetTo(preset.idx)}
                  className={`btn-tactile btn-xs ${currentIdx === preset.idx ? 'btn-amber' : ''}`}
                  style={{ flex: 1, padding: '0.25rem 0.2rem', fontSize: '0.65rem' }}
                >
                  {preset.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Speed & Restarts */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Climb Speed:</span>
              <span className="font-mono text-cyan-400">{speedMs}ms</span>
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
              {[
                { label: 'Slow', ms: 750 },
                { label: 'Normal', ms: 380 },
                { label: 'Fast', ms: 120 },
              ].map((sp) => (
                <button
                  key={sp.label}
                  onClick={() => setSpeedMs(sp.ms)}
                  className={`btn-tactile btn-xs ${speedMs === sp.ms ? 'btn-primary' : ''}`}
                  style={{ flex: 1, padding: '0.2rem 0.3rem', fontSize: '0.65rem' }}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2D Landscape Terrain SVG Canvas */}
        <div
          style={{
            background: 'var(--lab-bg-obsidian)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--lab-border-active)',
            padding: '1rem',
            position: 'relative',
          }}
        >
          {/* Top Telemetry Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="badge badge-cyan font-mono">
                Current State: x = {currentIdx}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                Objective Score: <strong className="font-mono text-lime-400" style={{ fontSize: '1.05rem' }}>f(x) = {landscape[currentIdx]}</strong>
              </span>
              {currentIdx === 18 && (
                <span className="badge badge-lime font-mono">GLOBAL OPTIMUM</span>
              )}
              {strategy === 'random-restart' && restartCount > 0 && (
                <span className="badge badge-amber font-mono">Restarts: {restartCount}</span>
              )}
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Click any point on the terrain curve to drop the agent at that location!
            </div>
          </div>

          {/* SVG Canvas */}
          <div style={{ width: '100%', height: '220px' }}>
            <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: '100%', userSelect: 'none' }}>
              <defs>
                <linearGradient id="terrainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--lab-accent-cyan)" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="var(--lab-accent-cyan)" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[10, 15, 20, 25].map((val) => {
                const py = toPy(val);
                return (
                  <g key={`y-${val}`}>
                    <line x1={margin.left} y1={py} x2={margin.left + plotW} y2={py} stroke="rgba(255, 255, 255, 0.05)" />
                    <text x={margin.left - 8} y={py + 3} fill="var(--text-muted)" fontSize="9" textAnchor="end" fontFamily="monospace">
                      f={val}
                    </text>
                  </g>
                );
              })}

              {/* Landscape Gradient Fill */}
              <path d={areaPath} fill="url(#terrainGrad)" />

              {/* Landscape Line */}
              <path d={linePath} fill="none" stroke="var(--lab-accent-cyan)" strokeWidth="2.5" />

              {/* Feature Annotations */}
              {/* Local Peak 1 */}
              <text x={toPx(4)} y={toPy(14) - 10} fill="var(--accent-rose)" fontSize="8.5" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                Local Peak 1 (f=14)
              </text>
              {/* Local Peak 2 */}
              <text x={toPx(9)} y={toPy(22) - 10} fill="var(--lab-accent-amber)" fontSize="8.5" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                Local Peak 2 (f=22)
              </text>
              {/* Plateau / Shoulder */}
              <text x={toPx(12.5)} y={toPy(16) - 10} fill="var(--text-secondary)" fontSize="8.5" textAnchor="middle" fontFamily="monospace">
                Shoulder / Plateau (f=16)
              </text>
              {/* Global Maximum */}
              <text x={toPx(18)} y={toPy(28) - 10} fill="var(--lab-accent-lime)" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                ★ GLOBAL MAXIMUM (f=28)
              </text>

              {/* Trajectory Trail */}
              {trajectory.map((idx, stepNum) => {
                const cx = toPx(idx);
                const cy = toPy(landscape[idx]);
                return (
                  <circle
                    key={`traj-${stepNum}`}
                    cx={cx}
                    cy={cy}
                    r="3.5"
                    fill="var(--lab-accent-amber)"
                    opacity="0.45"
                  />
                );
              })}

              {/* Discrete State Nodes (Clickable) */}
              {landscape.map((val, idx) => {
                const cx = toPx(idx);
                const cy = toPy(val);
                const isCurrent = idx === currentIdx;

                return (
                  <g
                    key={`node-${idx}`}
                    onClick={() => resetTo(idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isCurrent ? 7.5 : 4}
                      fill={isCurrent ? 'var(--lab-accent-lime)' : 'rgba(255, 255, 255, 0.4)'}
                      stroke={isCurrent ? '#000' : 'none'}
                      strokeWidth={isCurrent ? 2 : 0}
                    />
                    <text
                      x={cx}
                      y={margin.top + plotH + 15}
                      fill={isCurrent ? 'var(--lab-accent-lime)' : 'var(--text-muted)'}
                      fontSize="8.5"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight={isCurrent ? 'bold' : 'normal'}
                    >
                      {idx}
                    </text>
                  </g>
                );
              })}

              {/* Glowing Agent Ball on Current State */}
              <g transform={`translate(${toPx(currentIdx)}, ${toPy(landscape[currentIdx])})`}>
                <circle cx="0" cy="0" r="14" fill="none" stroke="var(--lab-accent-lime)" strokeWidth="1.5" strokeDasharray="3 2" />
                <circle cx="0" cy="0" r="7.5" fill="var(--lab-accent-lime)" stroke="#000" strokeWidth="2" />
              </g>
            </svg>
          </div>
        </div>

        {/* Live Status Log */}
        <div
          style={{
            padding: '0.65rem 0.9rem',
            background: 'var(--lab-bg-surface)',
            borderRadius: 'var(--radius-sm)',
            borderLeft: isTerminated ? '3px solid var(--accent-rose)' : '3px solid var(--lab-accent-lime)',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Award size={16} color={isTerminated ? 'var(--accent-rose)' : 'var(--lab-accent-lime)'} />
          <span>{statusLog}</span>
        </div>

        {/* Prediction Challenge Mode Card */}
        {predictionMode && (
          <div
            className="card"
            style={{
              padding: '1.25rem',
              border: '1px solid var(--lab-accent-amber)',
              background: 'var(--lab-bg-surface)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Compass size={16} color="var(--lab-accent-amber)" />
              <strong style={{ fontSize: '0.85rem' }}>Active Prediction Challenge: Where will the agent move next?</strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Agent is currently at <strong>x = {currentIdx} (f = {landscape[currentIdx]})</strong> under <strong>{strategy.toUpperCase()}</strong> strategy.
              Left neighbor is x={Math.max(0, currentIdx - 1)} (f={landscape[Math.max(0, currentIdx - 1)]}), right neighbor is x={Math.min(20, currentIdx + 1)} (f={landscape[Math.min(20, currentIdx + 1)]}).
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => handleVerifyPrediction('left')} className="btn-tactile btn-sm">
                &larr; Step Left (x={Math.max(0, currentIdx - 1)})
              </button>
              <button onClick={() => handleVerifyPrediction('right')} className="btn-tactile btn-sm">
                Step Right (x={Math.min(20, currentIdx + 1)}) &rarr;
              </button>
              <button onClick={() => handleVerifyPrediction('stop')} className="btn-tactile btn-sm btn-amber">
                Stop (Local Optimum / Stalled)
              </button>
            </div>

            {predictFeedback && (
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '5px',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: isPredictCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${isPredictCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
                  color: isPredictCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                }}
              >
                {isPredictCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                <span>{predictFeedback}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
