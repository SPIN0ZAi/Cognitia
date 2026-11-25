import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Sliders,
  Footprints,
  Shuffle
} from 'lucide-react';

export type HillClimbingStrategy = 'steepest' | 'first-choice' | 'stochastic' | 'random-restart';

export const HillClimbingLab: React.FC = () => {
  // Multimodal academic landscape (21 discrete coordinates 0 to 20):
  // x=4: Local Peak 1 (f=14)
  // x=9: Major Local Peak 2 (f=22)
  // x=11..13: Flat Plateau/Shoulder (f=16, 16, 16)
  // x=18: Global Maximum Summit (f=28)
  const defaultLandscape: number[] = useMemo(
    () => [6, 9, 12, 14, 13, 10, 12, 16, 20, 22, 19, 16, 16, 16, 17, 21, 25, 27, 28, 24, 18],
    []
  );

  const [landscape, setLandscape] = useState<number[]>(defaultLandscape);
  const [currentIdx, setCurrentIdx] = useState<number>(2);
  const [strategy, setStrategy] = useState<HillClimbingStrategy>('steepest');
  const [allowSideways, setAllowSideways] = useState<boolean>(true);
  const [maxSideways, setMaxSideways] = useState<number>(3);
  const [sidewaysCount, setSidewaysCount] = useState<number>(0);
  const [speedMs] = useState<number>(400);

  // Runtime State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isTerminated, setIsTerminated] = useState<boolean>(false);
  const [terminationReason, setTerminationReason] = useState<string | null>(null);
  const [trajectory, setTrajectory] = useState<number[]>([2]);
  const [restartCount, setRestartCount] = useState<number>(0);
  const [restartHistory, setRestartHistory] = useState<{ startX: number; endX: number; bestF: number }[]>([]);
  const [statusLog, setStatusLog] = useState<string>(
    'Ready. Click any node or terrain coordinate to position the climber, then step or run.'
  );

  // Interactive Custom Terrain Sculpting Mode
  const [isSculpting, setIsSculpting] = useState<boolean>(false);

  // Prediction Challenge Mode
  const [activeTab, setActiveTab] = useState<'simulator' | 'prediction' | 'restarts'>('simulator');
  const [predictChoice, setPredictChoice] = useState<number | 'terminate' | null>(null);
  const [predictFeedback, setPredictFeedback] = useState<string | null>(null);
  const [isPredictCorrect, setIsPredictCorrect] = useState<boolean | null>(null);

  // Neighbor calculations for discrete 1D chain: N(x) = {x-1, x+1}
  const getNeighbors = useCallback(
    (idx: number): number[] => {
      const n: number[] = [];
      if (idx > 0) n.push(idx - 1);
      if (idx < landscape.length - 1) n.push(idx + 1);
      return n;
    },
    [landscape.length]
  );

  // Reset to specified coordinate
  const resetTo = useCallback((startIdx: number) => {
    setCurrentIdx(startIdx);
    setTrajectory([startIdx]);
    setSidewaysCount(0);
    setIsRunning(false);
    setIsTerminated(false);
    setTerminationReason(null);
    setStatusLog(`Climber dropped at initial state x=${startIdx} (f=${landscape[startIdx]}).`);
    setPredictFeedback(null);
    setPredictChoice(null);
    setIsPredictCorrect(null);
  }, [landscape]);

  // Execute single algorithmic step
  const executeStep = useCallback(() => {
    if (isTerminated) {
      if (strategy === 'random-restart') {
        // Trigger a restart
        const randX = Math.floor(Math.random() * landscape.length);
        setRestartCount((c) => c + 1);
        setRestartHistory((h) => [
          ...h,
          { startX: trajectory[0], endX: currentIdx, bestF: landscape[currentIdx] }
        ]);
        resetTo(randX);
        setStatusLog(`Random Restart #${restartCount + 1}: Dispatched climber to new random start x=${randX}.`);
        return;
      }
      return;
    }

    const currentScore = landscape[currentIdx];
    const neighbors = getNeighbors(currentIdx);

    // Global optimum check (summit at 28)
    if (currentScore === Math.max(...landscape)) {
      setIsTerminated(true);
      setIsRunning(false);
      setTerminationReason('GLOBAL_MAXIMUM');
      setStatusLog(`★ GLOBAL MAXIMUM REACHED at x=${currentIdx} (f=${currentScore})! Optimization successfully converged.`);
      return;
    }

    let nextIdx: number | null = null;
    let logMsg = '';

    if (strategy === 'steepest') {
      // Evaluate all neighbors in N(x) and greedily select strictly best
      let bestNeighbor: number | null = null;
      let maxScore = currentScore;

      for (const n of neighbors) {
        if (landscape[n] > maxScore) {
          maxScore = landscape[n];
          bestNeighbor = n;
        } else if (
          allowSideways &&
          landscape[n] === currentScore &&
          bestNeighbor === null &&
          sidewaysCount < maxSideways
        ) {
          bestNeighbor = n;
        }
      }

      if (bestNeighbor !== null && bestNeighbor !== currentIdx) {
        if (landscape[bestNeighbor] === currentScore) {
          setSidewaysCount((c) => c + 1);
          logMsg = `Sideways move to x=${bestNeighbor} (f=${landscape[bestNeighbor]}, count ${sidewaysCount + 1}/${maxSideways}).`;
        } else {
          setSidewaysCount(0);
          logMsg = `Steepest Ascent: moved to strictly improving neighbor x=${bestNeighbor} (Δf=+${landscape[bestNeighbor] - currentScore}).`;
        }
        nextIdx = bestNeighbor;
      } else {
        setIsTerminated(true);
        setIsRunning(false);
        const reason = landscape[currentIdx] === 16 ? 'PLATEAU_LIMIT' : 'LOCAL_MAXIMUM';
        setTerminationReason(reason);
        logMsg =
          reason === 'PLATEAU_LIMIT'
            ? `Terminated: Maximum consecutive sideways steps (${maxSideways}) reached on shoulder. Halted to prevent infinite loop.`
            : `Terminated: Trapped at local peak x=${currentIdx} (f=${currentScore}). All neighbors in N(x) have lower elevation.`;
      }
    } else if (strategy === 'first-choice') {
      // Shuffle neighbors and pick the first improving move
      const shuffled = [...neighbors].sort(() => Math.random() - 0.5);
      let found = false;

      for (const n of shuffled) {
        if (landscape[n] > currentScore) {
          nextIdx = n;
          found = true;
          setSidewaysCount(0);
          logMsg = `First Choice: accepted first improving neighbor x=${n} (Δf=+${landscape[n] - currentScore}).`;
          break;
        } else if (allowSideways && landscape[n] === currentScore && sidewaysCount < maxSideways) {
          nextIdx = n;
          found = true;
          setSidewaysCount((c) => c + 1);
          logMsg = `First Choice: accepted sideways move x=${n} (f=${landscape[n]}, count ${sidewaysCount + 1}/${maxSideways}).`;
          break;
        }
      }

      if (!found) {
        setIsTerminated(true);
        setIsRunning(false);
        setTerminationReason('LOCAL_MAXIMUM');
        logMsg = `Terminated: First Choice halted at x=${currentIdx} (f=${currentScore}). No scanned neighbor improved.`;
      }
    } else if (strategy === 'stochastic') {
      // Stochastic: pick among improving neighbors with probability proportional to steepness
      const improving = neighbors.filter(
        (n) => landscape[n] > currentScore || (allowSideways && landscape[n] === currentScore && sidewaysCount < maxSideways)
      );

      if (improving.length > 0) {
        const deltas = improving.map((n) => Math.max(0.1, landscape[n] - currentScore + (landscape[n] === currentScore ? 0.5 : 0)));
        const sumDelta = deltas.reduce((a, b) => a + b, 0);
        let r = Math.random() * sumDelta;
        let selected = improving[0];

        for (let i = 0; i < improving.length; i++) {
          r -= deltas[i];
          if (r <= 0) {
            selected = improving[i];
            break;
          }
        }

        nextIdx = selected;
        if (landscape[selected] === currentScore) {
          setSidewaysCount((c) => c + 1);
          logMsg = `Stochastic: chosen sideways move x=${selected} (f=${landscape[selected]}).`;
        } else {
          setSidewaysCount(0);
          logMsg = `Stochastic: chosen neighbor x=${selected} with steepness weighting (Δf=+${landscape[selected] - currentScore}).`;
        }
      } else {
        setIsTerminated(true);
        setIsRunning(false);
        setTerminationReason('LOCAL_MAXIMUM');
        logMsg = `Terminated: Stochastic search trapped at local maximum x=${currentIdx} (f=${currentScore}).`;
      }
    } else if (strategy === 'random-restart') {
      // Execute steepest descent until trapped, then record and prepare restart
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
          logMsg = `Restart Trail: sideways move to x=${bestNeighbor}.`;
        } else {
          setSidewaysCount(0);
          logMsg = `Restart Trail: ascending to x=${bestNeighbor} (f=${landscape[bestNeighbor]}).`;
        }
        nextIdx = bestNeighbor;
      } else {
        setIsTerminated(true);
        setTerminationReason('LOCAL_MAXIMUM');
        logMsg = `Restart Trapped at x=${currentIdx} (f=${currentScore}). Next step will restart from uniform random state.`;
      }
    }

    if (nextIdx !== null) {
      setCurrentIdx(nextIdx);
      setTrajectory((prev) => [...prev, nextIdx!]);
    }

    setStatusLog(logMsg);
  }, [
    isTerminated,
    strategy,
    landscape,
    currentIdx,
    getNeighbors,
    allowSideways,
    sidewaysCount,
    maxSideways,
    restartCount,
    trajectory,
    resetTo
  ]);

  // Autoplay ticker
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isRunning && !isTerminated) {
      timer = setTimeout(() => {
        executeStep();
      }, speedMs);
    } else if (isRunning && isTerminated && strategy === 'random-restart') {
      // Auto-restart delay
      timer = setTimeout(() => {
        executeStep();
      }, speedMs * 1.5);
    }
    return () => clearTimeout(timer);
  }, [isRunning, isTerminated, executeStep, speedMs, strategy]);

  // Handle manual terrain elevation sculpt
  const handleSculptPoint = (xIdx: number, delta: number) => {
    setLandscape((prev) => {
      const copy = [...prev];
      copy[xIdx] = Math.max(2, Math.min(32, copy[xIdx] + delta));
      return copy;
    });
  };

  // Prediction verification
  const handleVerifyPrediction = (userChoice: number | 'terminate') => {
    setPredictChoice(userChoice);
    const neighbors = getNeighbors(currentIdx);
    const curF = landscape[currentIdx];

    let correct: number | 'terminate' = 'terminate';
    let explanation = '';

    if (strategy === 'steepest') {
      let bestN: number | null = null;
      let maxF = curF;
      for (const n of neighbors) {
        if (landscape[n] > maxF) {
          maxF = landscape[n];
          bestN = n;
        } else if (allowSideways && landscape[n] === curF && bestN === null && sidewaysCount < maxSideways) {
          bestN = n;
        }
      }
      if (bestN !== null) {
        correct = bestN;
        explanation = `Steepest Ascent evaluates all neighbors ${neighbors.map((n) => `x=${n}(f=${landscape[n]})`).join(', ')} and greedily selects x=${bestN} because it provides the highest elevation increase.`;
      } else {
        correct = 'terminate';
        explanation = `All neighbors have lower or equal elevation, and no valid improving/sideways moves remain. Steepest Ascent terminates here.`;
      }
    }

    const isMatch = userChoice === correct;
    setIsPredictCorrect(isMatch);
    setPredictFeedback(explanation);
  };

  // SVG Geometry Dimensions
  const svgW = 760;
  const svgH = 260;
  const padX = 40;
  const padTop = 35;
  const padBottom = 45;
  const plotW = svgW - padX * 2;
  const plotH = svgH - padTop - padBottom;

  const maxF = 32;
  const minF = 0;

  const toPx = (x: number) => padX + (x / (landscape.length - 1)) * plotW;
  const toPy = (f: number) => padTop + plotH - ((f - minF) / (maxF - minF)) * plotH;

  // Build SVG path
  const linePath = useMemo(() => {
    return landscape
      .map((f, idx) => {
        const px = toPx(idx);
        const py = toPy(f);
        return `${idx === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`;
      })
      .join(' ');
  }, [landscape]);

  const areaPath = useMemo(() => {
    const bottomY = padTop + plotH;
    const startX = toPx(0);
    const endX = toPx(landscape.length - 1);
    return `${linePath} L ${endX.toFixed(1)} ${bottomY} L ${startX.toFixed(1)} ${bottomY} Z`;
  }, [linePath, landscape.length]);

  return (
    <div className="visualizer-container">
      {/* Header */}
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <TrendingUp size={20} style={{ color: 'var(--lab-accent-cyan)' }} />
            Discrete Hill Climbing & Landscape Trajectory Engine
          </div>
          <div className="visualizer-subtitle">
            Local Optima, Plateaus, Ridges, Sideways Moves (UCLM Slide 21) & Multi-Start Restarts
          </div>
        </div>

        <div className="visualizer-controls">
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`btn-tactile btn-sm ${activeTab === 'simulator' ? 'btn-primary' : ''}`}
            >
              <Compass size={14} />
              <span>Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('prediction')}
              className={`btn-tactile btn-sm ${activeTab === 'prediction' ? 'btn-amber' : ''}`}
            >
              <HelpCircle size={14} />
              <span>Predict Move</span>
            </button>
            <button
              onClick={() => setActiveTab('restarts')}
              className={`btn-tactile btn-sm ${activeTab === 'restarts' ? 'btn-indigo' : ''}`}
            >
              <Shuffle size={14} />
              <span>Restarts ({restartHistory.length})</span>
            </button>
          </div>
        </div>
      </div>

      <div className="visualizer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Main Controls Panel */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            background: 'var(--lab-bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--lab-border-subtle)'
          }}
        >
          {/* Strategy Selector */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
              Search Strategy (UCLM Slide 15):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              {(
                [
                  { id: 'steepest', label: 'Steepest Ascent' },
                  { id: 'first-choice', label: 'First Choice' },
                  { id: 'stochastic', label: 'Stochastic' },
                  { id: 'random-restart', label: 'Random Restart' }
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setStrategy(s.id);
                    resetTo(currentIdx);
                  }}
                  className={`btn-tactile btn-xs ${strategy === s.id ? 'btn-primary' : ''}`}
                  style={{ padding: '0.35rem 0.4rem', fontSize: '0.68rem' }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sideways Move Control (Plateau / Shoulder) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Sideways Moves (Shoulder):</span>
              <strong className="font-mono text-cyan-400">
                {allowSideways ? `${sidewaysCount} / ${maxSideways} used` : 'Disabled'}
              </strong>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                onClick={() => setAllowSideways(!allowSideways)}
                className={`btn-tactile btn-xs ${allowSideways ? 'btn-emerald' : ''}`}
                style={{ flex: 1 }}
              >
                {allowSideways ? 'Allowed (Capped)' : 'Forbidden'}
              </button>
              {allowSideways && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Cap:</span>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={maxSideways}
                    onChange={(e) => setMaxSideways(parseInt(e.target.value, 10))}
                    style={{ width: '70px', accentColor: 'var(--lab-accent-cyan)' }}
                  />
                  <span className="font-mono text-xs text-lime-400">{maxSideways}</span>
                </div>
              )}
            </div>
            <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
              UCLM Slide 21: Prevents infinite oscillation on flat plateaus.
            </span>
          </div>

          {/* Quick Start Presets */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
              Initial Starting State $x_0$:
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { label: 'Basin (x=0)', idx: 0 },
                { label: 'Peak 1 (x=4)', idx: 4 },
                { label: 'Valley (x=5)', idx: 5 },
                { label: 'Shoulder (x=11)', idx: 11 },
                { label: 'Summit slope (x=16)', idx: 16 }
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => resetTo(preset.idx)}
                  className={`btn-tactile btn-xs ${currentIdx === preset.idx ? 'btn-amber' : ''}`}
                  style={{ flex: 1, padding: '0.3rem 0.2rem', fontSize: '0.65rem' }}
                >
                  {preset.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Execution Deck */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Execution:</span>
              <span className="font-mono text-cyan-400">{speedMs}ms</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setIsRunning(!isRunning)}
                disabled={isTerminated && strategy !== 'random-restart'}
                className={`btn-tactile btn-xs ${isRunning ? 'btn-rose' : 'btn-emerald'}`}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                {isRunning ? <Pause size={12} /> : <Play size={12} />}
                <span>{isRunning ? 'Pause' : 'Auto Climb'}</span>
              </button>
              <button
                onClick={executeStep}
                disabled={isRunning}
                className="btn-tactile btn-xs btn-primary"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <SkipForward size={12} />
                <span>Step Move</span>
              </button>
              <button
                onClick={() => resetTo(2)}
                className="btn-tactile btn-xs"
                title="Reset climber to x=2"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Sculpting & Custom Terrain Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.8rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
            <Sliders size={14} className="text-amber-400" />
            <span>Interactive Landscape Sculptor:</span>
            <button
              onClick={() => setIsSculpting(!isSculpting)}
              className={`btn-tactile btn-xs ${isSculpting ? 'btn-amber' : ''}`}
            >
              {isSculpting ? 'Editing Active (Use +/- buttons)' : 'Enable Terrain Sculpting'}
            </button>
          </div>
          {isSculpting && (
            <button
              onClick={() => {
                setLandscape(defaultLandscape);
                resetTo(2);
              }}
              className="btn-tactile btn-xs"
              style={{ fontSize: '0.68rem' }}
            >
              Restore Default Terrain
            </button>
          )}
        </div>

        {/* Interactive Terrain Canvas */}
        <div
          style={{
            background: 'var(--lab-bg-obsidian)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--lab-border-active)',
            padding: '1rem',
            position: 'relative'
          }}
        >
          {/* Top Telemetry Overlay */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge badge-cyan font-mono" style={{ fontSize: '0.85rem' }}>
                Current State: x = {currentIdx}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                Elevation: <strong className="font-mono text-lime-400" style={{ fontSize: '1.1rem' }}>f(x) = {landscape[currentIdx]}</strong>
              </span>
              {currentIdx === 18 && (
                <span className="badge badge-lime font-mono">★ GLOBAL MAXIMUM</span>
              )}
              {isTerminated && (
                <span className={`badge ${terminationReason === 'GLOBAL_MAXIMUM' ? 'badge-lime' : 'badge-rose'} font-mono`}>
                  {terminationReason === 'GLOBAL_MAXIMUM' ? 'CONVERGED (SUMMIT)' : 'TERMINATED (LOCAL OPTIMUM)'}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Steps Taken: <strong className="font-mono text-amber-400">{trajectory.length - 1}</strong>
              </span>
              {strategy === 'random-restart' && (
                <span className="badge badge-amber font-mono">Restarts: {restartCount}</span>
              )}
            </div>
          </div>

          {/* SVG Terrain Chart */}
          <div style={{ width: '100%', height: '240px', position: 'relative' }}>
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              style={{ width: '100%', height: '100%', userSelect: 'none' }}
            >
              <defs>
                <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--lab-accent-cyan)" stopOpacity="0.25" />
                  <stop offset="60%" stopColor="var(--lab-accent-cyan)" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="var(--lab-accent-cyan)" stopOpacity="0.0" />
                </linearGradient>
                <filter id="glowClimber" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Horizontal Grid & Elevation Ticks */}
              {[10, 15, 20, 25, 30].map((val) => {
                const py = toPy(val);
                return (
                  <g key={`y-${val}`}>
                    <line
                      x1={padX}
                      y1={py}
                      x2={svgW - padX}
                      y2={py}
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padX - 8}
                      y={py + 3}
                      fill="var(--text-muted)"
                      fontSize="9"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      f={val}
                    </text>
                  </g>
                );
              })}

              {/* Landscape Gradient Fill & Contour Curve */}
              <path d={areaPath} fill="url(#hillGrad)" />
              <path d={linePath} fill="none" stroke="var(--lab-accent-cyan)" strokeWidth="2.5" />

              {/* Feature Annotations */}
              <text x={toPx(4)} y={toPy(14) - 12} fill="#fb7185" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                Local Peak 1 (f=14)
              </text>
              <text x={toPx(9)} y={toPy(22) - 12} fill="var(--lab-accent-amber)" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                Major Peak 2 (f=22)
              </text>
              <text x={toPx(12)} y={toPy(16) - 12} fill="#94a3b8" fontSize="8.5" textAnchor="middle" fontFamily="monospace">
                Plateau / Shoulder (f=16)
              </text>
              <text x={toPx(18)} y={toPy(28) - 14} fill="var(--lab-accent-lime)" fontSize="9.5" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                ★ GLOBAL MAXIMUM (f=28)
              </text>

              {/* Trajectory Footprints */}
              {trajectory.map((idx, stepNum) => {
                const cx = toPx(idx);
                const cy = toPy(landscape[idx]);
                return (
                  <circle
                    key={`step-${stepNum}`}
                    cx={cx}
                    cy={cy}
                    r="3.5"
                    fill="var(--lab-accent-amber)"
                    opacity={stepNum === trajectory.length - 1 ? 1 : 0.45}
                  />
                );
              })}

              {/* Clickable Node Targets along the curve */}
              {landscape.map((f, idx) => {
                const cx = toPx(idx);
                const cy = toPy(f);
                const isCurrent = idx === currentIdx;
                const isNeighbor = getNeighbors(currentIdx).includes(idx);

                return (
                  <g
                    key={`node-${idx}`}
                    onClick={() => resetTo(idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isCurrent ? 7 : isNeighbor ? 5 : 3}
                      fill={
                        isCurrent
                          ? 'var(--lab-accent-lime)'
                          : isNeighbor
                          ? 'var(--lab-accent-cyan)'
                          : 'var(--lab-bg-obsidian)'
                      }
                      stroke={
                        isCurrent
                          ? '#ffffff'
                          : isNeighbor
                          ? 'var(--lab-accent-cyan)'
                          : 'rgba(255, 255, 255, 0.3)'
                      }
                      strokeWidth={isCurrent ? 2.5 : 1.5}
                    />
                    {/* Coordinate index at bottom */}
                    <text
                      x={cx}
                      y={svgH - padBottom + 16}
                      fill={isCurrent ? 'var(--lab-accent-lime)' : 'var(--text-muted)'}
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight={isCurrent ? 'bold' : 'normal'}
                    >
                      {idx}
                    </text>
                  </g>
                );
              })}

              {/* Animated Climber Indicator */}
              <g
                transform={`translate(${toPx(currentIdx)}, ${toPy(landscape[currentIdx])})`}
                filter="url(#glowClimber)"
              >
                <circle r="12" fill="none" stroke="var(--lab-accent-lime)" strokeWidth="1.5" opacity="0.6" />
                <circle r="5.5" fill="var(--lab-accent-lime)" />
              </g>
            </svg>
          </div>

          {/* Sculpting Controls Bar (if enabled) */}
          {isSculpting && (
            <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Sculpt x={currentIdx}:</span>
              <button
                onClick={() => handleSculptPoint(currentIdx, 1)}
                className="btn-tactile btn-xs btn-emerald"
              >
                +1 Elevate
              </button>
              <button
                onClick={() => handleSculptPoint(currentIdx, -1)}
                className="btn-tactile btn-xs btn-rose"
              >
                -1 Lower
              </button>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                New f({currentIdx}) = {landscape[currentIdx]}
              </span>
            </div>
          )}

          {/* Live Action Telemetry & Terminal Status */}
          <div
            style={{
              marginTop: '0.85rem',
              padding: '0.75rem 1rem',
              background: 'rgba(7, 10, 18, 0.85)',
              borderRadius: '6px',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}
          >
            <Footprints size={16} className="text-cyan-400" />
            <span style={{ fontSize: '0.85rem', color: '#f8fafc', fontFamily: 'monospace' }}>
              {statusLog}
            </span>
          </div>
        </div>

        {/* Tab 1: Simulator Inspection & Neighbor Matrix */}
        {activeTab === 'simulator' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem'
            }}
          >
            {/* Neighborhood Evaluation Matrix */}
            <div className="card" style={{ padding: '1rem', background: 'var(--lab-bg-surface)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--lab-accent-cyan)' }}>
                Local Neighborhood Evaluation: $N({currentIdx})$
              </div>
              <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ textAlign: 'left', padding: '0.3rem' }}>Neighbor $x&apos;$</th>
                    <th style={{ textAlign: 'right', padding: '0.3rem' }}>Elevation $f(x&apos;)$</th>
                    <th style={{ textAlign: 'right', padding: '0.3rem' }}>Delta $\Delta f$</th>
                    <th style={{ textAlign: 'right', padding: '0.3rem' }}>Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {getNeighbors(currentIdx).map((nIdx) => {
                    const nF = landscape[nIdx];
                    const delta = nF - landscape[currentIdx];
                    const isImproving = delta > 0;
                    const isSideways = delta === 0;

                    return (
                      <tr key={`n-${nIdx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '0.35rem', fontFamily: 'monospace' }}>x = {nIdx}</td>
                        <td style={{ textAlign: 'right', padding: '0.35rem', fontFamily: 'monospace' }}>{nF}</td>
                        <td
                          style={{
                            textAlign: 'right',
                            padding: '0.35rem',
                            fontFamily: 'monospace',
                            color: isImproving ? 'var(--lab-accent-lime)' : isSideways ? 'var(--lab-accent-amber)' : 'var(--accent-rose)'
                          }}
                        >
                          {delta > 0 ? `+${delta}` : delta}
                        </td>
                        <td style={{ textAlign: 'right', padding: '0.35rem' }}>
                          <span
                            className={`badge ${
                              isImproving ? 'badge-lime' : isSideways ? 'badge-amber' : 'badge-rose'
                            } font-mono`}
                            style={{ fontSize: '0.65rem' }}
                          >
                            {isImproving ? 'IMPROVING' : isSideways ? 'SIDEWAYS' : 'WORSE'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Academic Theoretical Insight Card */}
            <div className="card" style={{ padding: '1rem', background: 'var(--lab-bg-surface)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--lab-accent-amber)' }}>
                UCLM Academic Mechanics (Slide 15–21)
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                <strong>Steepest-Ascent</strong> performs greedy exploitation by considering all successors in $N(x)$ and choosing the one with maximal $f(x&apos;)$. While rapid, it is strictly vulnerable to <em>local maxima</em>, <em>plateaus</em>, and <em>ridges</em>.
              </p>
              <div style={{ marginTop: '0.6rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                • <strong>Plateau Escape:</strong> Limiting consecutive sideways steps (e.g. max 3) allows escaping shoulders into steep ascents without entering infinite cycles.
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Prediction Challenge */}
        {activeTab === 'prediction' && (
          <div className="card" style={{ padding: '1.25rem', background: 'var(--lab-bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <HelpCircle size={18} className="text-amber-400" />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                Algorithmic Prediction Challenge: Current State $x = {currentIdx}$
              </h4>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Given the current strategy <strong>{strategy.toUpperCase()}</strong> and neighbors{' '}
              {getNeighbors(currentIdx)
                .map((n) => `x=${n} (f=${landscape[n]})`)
                .join(', ')}
              , what is the exact action the algorithm will execute on the next step?
            </p>

            {/* Answer Options */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1rem' }}>
              {getNeighbors(currentIdx).map((n) => (
                <button
                  key={`pred-${n}`}
                  onClick={() => handleVerifyPrediction(n)}
                  className={`btn-tactile btn-sm ${predictChoice === n ? 'btn-primary' : ''}`}
                >
                  Move to x = {n} (f = {landscape[n]})
                </button>
              ))}
              <button
                onClick={() => handleVerifyPrediction('terminate')}
                className={`btn-tactile btn-sm ${predictChoice === 'terminate' ? 'btn-rose' : ''}`}
              >
                Halt / Terminate (Local Optimum Reached)
              </button>
            </div>

            {/* Feedback Callout */}
            {predictFeedback && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  background: isPredictCorrect ? 'rgba(198, 242, 119, 0.08)' : 'rgba(251, 113, 133, 0.08)',
                  border: `1px solid ${isPredictCorrect ? 'var(--lab-accent-lime)' : '#fb7185'}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem'
                }}
              >
                {isPredictCorrect ? (
                  <CheckCircle2 size={18} className="text-lime-400" style={{ flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <XCircle size={18} className="text-rose-400" style={{ flexShrink: 0, marginTop: '2px' }} />
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: isPredictCorrect ? 'var(--lab-accent-lime)' : '#fb7185' }}>
                    {isPredictCorrect ? 'Correct Decision!' : 'Incorrect Prediction'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {predictFeedback}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Random Restart History */}
        {activeTab === 'restarts' && (
          <div className="card" style={{ padding: '1.25rem', background: 'var(--lab-bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                Multi-Start Random Restart Registry
              </div>
              <button
                onClick={() => setRestartHistory([])}
                className="btn-tactile btn-xs"
                style={{ fontSize: '0.68rem' }}
              >
                Clear History
              </button>
            </div>
            {restartHistory.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No restarts recorded yet. Select &apos;Random Restart&apos; strategy and run the algorithm to observe how independent trials overcome local optima traps.
              </div>
            ) : (
              <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ textAlign: 'left', padding: '0.35rem' }}>Trial #</th>
                    <th style={{ textAlign: 'left', padding: '0.35rem' }}>Start State</th>
                    <th style={{ textAlign: 'left', padding: '0.35rem' }}>Converged State</th>
                    <th style={{ textAlign: 'right', padding: '0.35rem' }}>Best Fitness</th>
                    <th style={{ textAlign: 'right', padding: '0.35rem' }}>Summit Conquered</th>
                  </tr>
                </thead>
                <tbody>
                  {restartHistory.map((trial, i) => (
                    <tr key={`trial-${i}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '0.35rem', fontFamily: 'monospace' }}>#{i + 1}</td>
                      <td style={{ padding: '0.35rem', fontFamily: 'monospace' }}>x = {trial.startX}</td>
                      <td style={{ padding: '0.35rem', fontFamily: 'monospace' }}>x = {trial.endX}</td>
                      <td style={{ textAlign: 'right', padding: '0.35rem', fontFamily: 'monospace', color: 'var(--lab-accent-lime)' }}>
                        f = {trial.bestF}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.35rem' }}>
                        {trial.bestF === 28 ? (
                          <span className="badge badge-lime font-mono" style={{ fontSize: '0.65rem' }}>
                            ★ GLOBAL SUMMIT
                          </span>
                        ) : (
                          <span className="badge badge-amber font-mono" style={{ fontSize: '0.65rem' }}>
                            LOCAL PEAK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
