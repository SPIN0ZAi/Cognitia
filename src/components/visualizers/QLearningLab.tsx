import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  FastForward,
  TrendingUp,
  Gauge,
} from 'lucide-react';

type Action = 'up' | 'down' | 'left' | 'right';
const ACTIONS: Action[] = ['up', 'down', 'left', 'right'];

interface TransitionStep {
  s: string;
  a: Action;
  r: number;
  sPrime: string;
  isTerminal: boolean;
  oldQ: number;
  target: number;
  newQ: number;
  alpha: number;
  gamma: number;
}

export const QLearningLab: React.FC = () => {
  // World selection: 'six-state' (Slides 45-53) vs '4x3' (Slide 43)
  const [worldType, setWorldType] = useState<'six-state' | '4x3'>('six-state');

  // Hyperparameters
  const [alpha, setAlpha] = useState<number>(0.5);
  const [gamma, setGamma] = useState<number>(1.0);
  const [epsilon, setEpsilon] = useState<number>(0.1);
  const [useAlphaDecay, setUseAlphaDecay] = useState<boolean>(false);
  const [useEpsilonDecay, setUseEpsilonDecay] = useState<boolean>(false);
  const [useExplorationFunction, setUseExplorationFunction] = useState<boolean>(false);
  const [rPlus] = useState<number>(1.0);
  const [nE] = useState<number>(3);

  // Agent & Training State
  const [qTable, setQTable] = useState<Record<string, Record<Action, number>>>({});
  const [visitCounts, setVisitCounts] = useState<Record<string, Record<Action, number>>>({});
  const [currentState, setCurrentState] = useState<string>('s0');
  const [episodeCount, setEpisodeCount] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);
  const [lastStep, setLastStep] = useState<TransitionStep | null>(null);
  const [recentReturns, setRecentReturns] = useState<number[]>([]);
  const [currentEpisodeReturn, setCurrentEpisodeReturn] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stepSpeedMs, setStepSpeedMs] = useState<number>(450); // Speed in ms per step (Slow/Normal/Fast)

  // Initialize Q-table
  const initQTable = () => {
    const states =
      worldType === 'six-state'
        ? ['s0', 's1', 's2', 's3', 's4', 's5']
        : ['1,1', '1,2', '1,3', '2,1', '2,3', '3,1', '3,2', '3,3', '4,1', '4,2', '4,3'];

    const q: Record<string, Record<Action, number>> = {};
    const n: Record<string, Record<Action, number>> = {};

    for (const s of states) {
      q[s] = { up: 0, down: 0, left: 0, right: 0 };
      n[s] = { up: 0, down: 0, left: 0, right: 0 };
    }
    setQTable(q);
    setVisitCounts(n);
    setCurrentState(worldType === 'six-state' ? 's0' : '1,1');
    setEpisodeCount(0);
    setTotalSteps(0);
    setLastStep(null);
    setRecentReturns([]);
    setCurrentEpisodeReturn(0);
    setIsRunning(false);
  };

  useEffect(() => {
    initQTable();
  }, [worldType]);

  // Environment transition model
  const executeEnvironmentStep = (s: string, a: Action): { sPrime: string; r: number; terminal: boolean } => {
    if (worldType === 'six-state') {
      // 6-state world layout from slides 45-53:
      // s1, s3, s5 (+1 terminal)
      // s0, s2, s4 (-1 terminal)
      const stepCost = -0.05;
      if (s === 's0') {
        if (a === 'up') return { sPrime: 's1', r: stepCost, terminal: false };
        if (a === 'right') return { sPrime: 's2', r: stepCost, terminal: false };
        return { sPrime: 's0', r: stepCost, terminal: false };
      }
      if (s === 's1') {
        if (a === 'down') return { sPrime: 's0', r: stepCost, terminal: false };
        if (a === 'right') return { sPrime: 's3', r: stepCost, terminal: false };
        return { sPrime: 's1', r: stepCost, terminal: false };
      }
      if (s === 's2') {
        if (a === 'left') return { sPrime: 's0', r: stepCost, terminal: false };
        if (a === 'up') return { sPrime: 's3', r: stepCost, terminal: false };
        if (a === 'right') return { sPrime: 's4', r: -1.0, terminal: true };
        return { sPrime: 's2', r: stepCost, terminal: false };
      }
      if (s === 's3') {
        // Stochastic slip from slide 47: 90% intended, 10% slips down to s2!
        const slip = Math.random() < 0.15;
        if (slip && a === 'right') {
          return { sPrime: 's2', r: stepCost, terminal: false };
        }
        if (a === 'left') return { sPrime: 's1', r: stepCost, terminal: false };
        if (a === 'down') return { sPrime: 's2', r: stepCost, terminal: false };
        if (a === 'right') return { sPrime: 's5', r: 1.0, terminal: true };
        return { sPrime: 's3', r: stepCost, terminal: false };
      }
      return { sPrime: s, r: 0, terminal: true };
    } else {
      // 4x3 world
      const [xStr, yStr] = s.split(',');
      let x = parseInt(xStr);
      let y = parseInt(yStr);

      let nx = x;
      let ny = y;
      if (a === 'up') ny += 1;
      if (a === 'down') ny -= 1;
      if (a === 'left') nx -= 1;
      if (a === 'right') nx += 1;

      // Wall at (2, 2)
      if (nx < 1 || nx > 4 || ny < 1 || ny > 3 || (nx === 2 && ny === 2)) {
        nx = x;
        ny = y;
      }

      const sPrime = `${nx},${ny}`;
      if (sPrime === '4,3') return { sPrime, r: 1.0, terminal: true };
      if (sPrime === '4,2') return { sPrime, r: -1.0, terminal: true };
      return { sPrime, r: -0.04, terminal: false };
    }
  };

  // Action selection logic: Greedy, ε-greedy, or exploration function
  const selectAction = (s: string): Action => {
    const counts = visitCounts[s] || { up: 0, down: 0, left: 0, right: 0 };
    const qVals = qTable[s] || { up: 0, down: 0, left: 0, right: 0 };

    if (useExplorationFunction) {
      // f(u, n) = R+ if n < Ne else u (Slide 65)
      let bestScore = -Infinity;
      let bestActs: Action[] = [];
      for (const a of ACTIONS) {
        const score = counts[a] < nE ? rPlus : qVals[a];
        if (score > bestScore) {
          bestScore = score;
          bestActs = [a];
        } else if (score === bestScore) {
          bestActs.push(a);
        }
      }
      return bestActs[Math.floor(Math.random() * bestActs.length)];
    }

    // Current epsilon with decay
    let curEps = epsilon;
    if (useEpsilonDecay) {
      curEps = Math.max(0.01, epsilon * Math.pow(0.998, episodeCount));
    }

    if (Math.random() < curEps) {
      return ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    }

    // Greedy argmax
    let maxQ = -Infinity;
    let bestActions: Action[] = [];
    for (const a of ACTIONS) {
      if (qVals[a] > maxQ) {
        maxQ = qVals[a];
        bestActions = [a];
      } else if (qVals[a] === maxQ) {
        bestActions.push(a);
      }
    }
    return bestActions[Math.floor(Math.random() * bestActions.length)];
  };

  // Execute 1 Q-learning Step
  const performOneStep = () => {
    const s = currentState;
    const a = selectAction(s);

    const { sPrime, r, terminal } = executeEnvironmentStep(s, a);

    // Current effective learning rate
    let curAlpha = alpha;
    if (useAlphaDecay) {
      curAlpha = alpha * Math.pow(0.999, totalSteps);
    }

    const oldQ = qTable[s]?.[a] ?? 0;

    // Target y = r + gamma * (terminal ? 0 : max Q(s', a'))
    let maxNextQ = 0;
    if (!terminal && qTable[sPrime]) {
      maxNextQ = Math.max(...ACTIONS.map((act) => qTable[sPrime][act] ?? 0));
    }
    const target = Number((r + (terminal ? 0 : gamma * maxNextQ)).toFixed(4));
    const newQ = Number(((1 - curAlpha) * oldQ + curAlpha * target).toFixed(4));

    // Update Q-table and visit counts
    setQTable((prev) => ({
      ...prev,
      [s]: {
        ...(prev[s] || { up: 0, down: 0, left: 0, right: 0 }),
        [a]: newQ,
      },
    }));

    setVisitCounts((prev) => ({
      ...prev,
      [s]: {
        ...(prev[s] || { up: 0, down: 0, left: 0, right: 0 }),
        [a]: (prev[s]?.[a] ?? 0) + 1,
      },
    }));

    const stepInfo: TransitionStep = {
      s,
      a,
      r,
      sPrime,
      isTerminal: terminal,
      oldQ,
      target,
      newQ,
      alpha: curAlpha,
      gamma,
    };
    setLastStep(stepInfo);

    setTotalSteps((st) => st + 1);
    const newEpReturn = Number((currentEpisodeReturn + r).toFixed(3));

    if (terminal) {
      setRecentReturns((prev) => [newEpReturn, ...prev.slice(0, 19)]);
      setCurrentEpisodeReturn(0);
      setEpisodeCount((ep) => ep + 1);
      setCurrentState(worldType === 'six-state' ? 's0' : '1,1');
    } else {
      setCurrentEpisodeReturn(newEpReturn);
      setCurrentState(sPrime);
    }
  };

  // Run continuous loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => {
        performOneStep();
      }, stepSpeedMs);
    }
    return () => clearInterval(interval);
  }, [isRunning, stepSpeedMs, currentState, qTable, totalSteps, episodeCount]);

  // Fast forward N episodes
  const runBatchEpisodes = (count: number) => {
    let currentS = currentState;
    let epCount = episodeCount;
    let steps = totalSteps;
    const tempQ = JSON.parse(JSON.stringify(qTable));
    const tempN = JSON.parse(JSON.stringify(visitCounts));
    const returns: number[] = [...recentReturns];

    for (let i = 0; i < count; i++) {
      let epReturn = 0;
      let terminated = false;
      let stepLimit = 0;

      while (!terminated && stepLimit < 100) {
        stepLimit++;
        steps++;

        // Action selection
        let curEps = useEpsilonDecay ? Math.max(0.01, epsilon * Math.pow(0.998, epCount)) : epsilon;
        let a: Action;
        if (Math.random() < curEps) {
          a = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
        } else {
          let maxVal = -Infinity;
          let best: Action[] = [];
          for (const act of ACTIONS) {
            const v = tempQ[currentS]?.[act] ?? 0;
            if (v > maxVal) {
              maxVal = v;
              best = [act];
            } else if (v === maxVal) best.push(act);
          }
          a = best[Math.floor(Math.random() * best.length)];
        }

        const { sPrime, r, terminal } = executeEnvironmentStep(currentS, a);
        epReturn += r;

        let curAlpha = useAlphaDecay ? alpha * Math.pow(0.999, steps) : alpha;
        const oldQ = tempQ[currentS][a];
        let maxNextQ = 0;
        if (!terminal && tempQ[sPrime]) {
          maxNextQ = Math.max(...ACTIONS.map((act) => tempQ[sPrime][act] ?? 0));
        }
        const target = r + (terminal ? 0 : gamma * maxNextQ);
        tempQ[currentS][a] = Number(((1 - curAlpha) * oldQ + curAlpha * target).toFixed(4));
        tempN[currentS][a] = (tempN[currentS][a] || 0) + 1;

        if (terminal) {
          terminated = true;
          currentS = worldType === 'six-state' ? 's0' : '1,1';
        } else {
          currentS = sPrime;
        }
      }
      epCount++;
      returns.unshift(Number(epReturn.toFixed(2)));
    }

    setQTable(tempQ);
    setVisitCounts(tempN);
    setCurrentState(currentS);
    setEpisodeCount(epCount);
    setTotalSteps(steps);
    setRecentReturns(returns.slice(0, 20));
  };

  // Render cell Q-values diamond
  const renderCellDiamond = (s: string) => {
    const vals = qTable[s] || { up: 0, down: 0, left: 0, right: 0 };
    const counts = visitCounts[s] || { up: 0, down: 0, left: 0, right: 0 };
    const isCurrent = currentState === s;

    const getColor = (v: number) => {
      if (v > 0) return `rgba(16, 185, 129, ${Math.min(0.85, 0.15 + v * 0.7)})`;
      if (v < 0) return `rgba(239, 68, 68, ${Math.min(0.85, 0.15 + Math.abs(v) * 0.7)})`;
      return 'rgba(30, 41, 59, 0.6)';
    };

    return (
      <div
        key={s}
        style={{
          width: '110px',
          height: '110px',
          background: 'var(--lab-bg-surface)',
          borderRadius: '8px',
          border: isCurrent ? '2px solid var(--lab-accent-lime)' : '1px solid var(--lab-border-subtle)',
          boxShadow: isCurrent ? '0 0 14px rgba(198, 242, 119, 0.5)' : undefined,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ position: 'absolute', top: 4, left: 6, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          {s}
        </div>

        {/* 4 Directional Wedges */}
        {/* UP */}
        <div
          title={`UP: Q=${vals.up.toFixed(3)}, N=${counts.up}`}
          style={{
            position: 'absolute',
            top: 4,
            left: '25%',
            width: '50%',
            height: '24px',
            background: getColor(vals.up),
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.62rem',
            fontFamily: 'var(--font-mono)',
            color: '#fff',
          }}
        >
          {vals.up.toFixed(2)}
        </div>

        {/* DOWN */}
        <div
          title={`DOWN: Q=${vals.down.toFixed(3)}, N=${counts.down}`}
          style={{
            position: 'absolute',
            bottom: 4,
            left: '25%',
            width: '50%',
            height: '24px',
            background: getColor(vals.down),
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.62rem',
            fontFamily: 'var(--font-mono)',
            color: '#fff',
          }}
        >
          {vals.down.toFixed(2)}
        </div>

        {/* LEFT */}
        <div
          title={`LEFT: Q=${vals.left.toFixed(3)}, N=${counts.left}`}
          style={{
            position: 'absolute',
            left: 4,
            top: '25%',
            height: '50%',
            width: '24px',
            background: getColor(vals.left),
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.58rem',
            fontFamily: 'var(--font-mono)',
            writingMode: 'vertical-rl',
            color: '#fff',
          }}
        >
          {vals.left.toFixed(2)}
        </div>

        {/* RIGHT */}
        <div
          title={`RIGHT: Q=${vals.right.toFixed(3)}, N=${counts.right}`}
          style={{
            position: 'absolute',
            right: 4,
            top: '25%',
            height: '50%',
            width: '24px',
            background: getColor(vals.right),
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.58rem',
            fontFamily: 'var(--font-mono)',
            writingMode: 'vertical-rl',
            color: '#fff',
          }}
        >
          {vals.right.toFixed(2)}
        </div>

        {/* Center Indicator */}
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {isCurrent ? '🤖' : ''}
        </div>
      </div>
    );
  };

  return (
    <div className="card" style={{ padding: '1.75rem', border: '1px solid var(--lab-border-active)' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-cyan font-mono">LABORATORY 5.2</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Slides 43, 49 & 65</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem' }}>
            Q-Learning Laboratory: Interactive Q-Table & Temporal Differences
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setWorldType(worldType === 'six-state' ? '4x3' : 'six-state')}
            className="btn-tactile btn-sm"
          >
            World: {worldType === 'six-state' ? 'UCLM 6-State (Slides 45-53)' : '4×3 Benchmark (Slide 43)'}
          </button>
          <button onClick={initQTable} className="btn-tactile btn-sm">
            <RotateCcw size={14} />
            <span>Reset Table</span>
          </button>
        </div>
      </div>

      {/* Hyperparameter Controls */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '1rem',
          padding: '1rem',
          background: 'var(--lab-bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--lab-border-subtle)',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Learning Rate α:</span>
            <strong style={{ color: 'var(--lab-accent-lime)' }}>{alpha.toFixed(2)}</strong>
          </div>
          <input
            type="range"
            min="0.05"
            max="1.0"
            step="0.05"
            value={alpha}
            onChange={(e) => setAlpha(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
          <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
            <input
              type="checkbox"
              checked={useAlphaDecay}
              onChange={(e) => setUseAlphaDecay(e.target.checked)}
            />
            Decay α (0.999^t) (Slide 57)
          </label>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Discount Factor γ:</span>
            <strong style={{ color: 'var(--lab-accent-cyan)' }}>{gamma.toFixed(2)}</strong>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={gamma}
            onChange={(e) => setGamma(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Exploration ε:</span>
            <strong style={{ color: 'var(--lab-accent-amber)' }}>{epsilon.toFixed(2)}</strong>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={epsilon}
            onChange={(e) => setEpsilon(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
          <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
            <input
              type="checkbox"
              checked={useEpsilonDecay}
              onChange={(e) => setUseEpsilonDecay(e.target.checked)}
            />
            Decay ε (0.998^ep) (Slide 61)
          </label>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
            Exploration Function (Slide 65)
          </span>
          <label style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <input
              type="checkbox"
              checked={useExplorationFunction}
              onChange={(e) => setUseExplorationFunction(e.target.checked)}
            />
            <span>Count bonus f(u, n) with R+=1, Ne=3</span>
          </label>
        </div>
      </div>

      {/* Control Transport Deck */}
      <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`btn-tactile btn-sm ${isRunning ? 'btn-amber' : 'btn-emerald'}`}
        >
          {isRunning ? <Pause size={14} /> : <Play size={14} />}
          <span>{isRunning ? 'Pause Training' : 'Continuous Train'}</span>
        </button>
        <button onClick={performOneStep} disabled={isRunning} className="btn-tactile btn-sm">
          <SkipForward size={14} />
          <span>Step Action</span>
        </button>
        <button onClick={() => runBatchEpisodes(10)} disabled={isRunning} className="btn-tactile btn-sm">
          <FastForward size={14} />
          <span>+10 Episodes</span>
        </button>
        <button onClick={() => runBatchEpisodes(50)} disabled={isRunning} className="btn-tactile btn-sm">
          <FastForward size={14} />
          <span>+50 Episodes</span>
        </button>

        {/* Speed Adjustment Controller */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--lab-bg-surface)',
            padding: '0.35rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Gauge size={14} color="var(--lab-accent-cyan)" />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Speed:</span>
          <input
            type="range"
            min="60"
            max="1200"
            step="50"
            value={stepSpeedMs}
            onChange={(e) => setStepSpeedMs(parseInt(e.target.value, 10))}
            style={{ width: '85px', accentColor: 'var(--lab-accent-cyan)', cursor: 'pointer' }}
            title={`Step interval: ${stepSpeedMs}ms`}
          />
          <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--lab-accent-cyan)', minWidth: '45px' }}>
            {stepSpeedMs}ms
          </span>
          <div style={{ display: 'flex', gap: '3px' }}>
            {[
              { label: 'Slow (800ms)', ms: 800 },
              { label: 'Normal (450ms)', ms: 450 },
              { label: 'Fast (120ms)', ms: 120 },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => setStepSpeedMs(p.ms)}
                className={`btn-tactile btn-xs ${stepSpeedMs === p.ms ? 'btn-primary' : ''}`}
                style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem' }}
              >
                {p.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
          <div>Episodes: <strong className="font-mono">{episodeCount}</strong></div>
          <div>Total Steps: <strong className="font-mono">{totalSteps}</strong></div>
        </div>
      </div>

      {/* Interactive Visual Display */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(280px, 340px)', gap: '1.5rem', alignItems: 'start' }}>
        {/* State Diamond Grid */}
        <div
          style={{
            background: 'var(--lab-bg-obsidian)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--lab-border-active)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            State-Action Q-Values (Green = Positive, Red = Negative, Diamond Wedges = Directions)
          </div>

          {worldType === 'six-state' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 110px)', gap: '12px' }}>
              {/* Row 1: s1, s3, s5 */}
              {renderCellDiamond('s1')}
              {renderCellDiamond('s3')}
              <div
                style={{
                  width: '110px',
                  height: '110px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  borderRadius: '8px',
                  border: '1px solid var(--accent-emerald)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>s5 (Goal)</span>
                <strong style={{ fontSize: '1.4rem', color: '#10b981' }}>+1.0</strong>
              </div>

              {/* Row 2: s0, s2, s4 */}
              {renderCellDiamond('s0')}
              {renderCellDiamond('s2')}
              <div
                style={{
                  width: '110px',
                  height: '110px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  border: '1px solid var(--accent-rose)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: '#fca5a5' }}>s4 (Hazard)</span>
                <strong style={{ fontSize: '1.4rem', color: '#ef4444' }}>-1.0</strong>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 85px)', gap: '8px' }}>
              {/* 4x3 cells */}
              {['1,3', '2,3', '3,3', '4,3', '1,2', 'wall', '3,2', '4,2', '1,1', '2,1', '3,1', '4,1'].map((k) => {
                if (k === 'wall') {
                  return (
                    <div
                      key={k}
                      style={{
                        width: '85px',
                        height: '85px',
                        background: '#334155',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                      }}
                    >
                      WALL
                    </div>
                  );
                }
                if (k === '4,3') {
                  return (
                    <div
                      key={k}
                      style={{
                        width: '85px',
                        height: '85px',
                        background: 'rgba(16, 185, 129, 0.25)',
                        borderRadius: '6px',
                        border: '1px solid var(--accent-emerald)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: '0.65rem' }}>Goal</span>
                      <strong style={{ color: '#10b981' }}>+1.0</strong>
                    </div>
                  );
                }
                if (k === '4,2') {
                  return (
                    <div
                      key={k}
                      style={{
                        width: '85px',
                        height: '85px',
                        background: 'rgba(239, 68, 68, 0.25)',
                        borderRadius: '6px',
                        border: '1px solid var(--accent-rose)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: '0.65rem' }}>Trap</span>
                      <strong style={{ color: '#ef4444' }}>-1.0</strong>
                    </div>
                  );
                }
                return renderCellDiamond(k);
              })}
            </div>
          )}
        </div>

        {/* Live Step Inspector & Formula Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Step Formula Card */}
          <div className="card" style={{ padding: '1.25rem', background: 'var(--lab-bg-surface)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--lab-accent-cyan)', fontWeight: 700, marginBottom: '0.5rem' }}>
              LIVE TEMPORAL-DIFFERENCE STEP TRACE (Slide 49)
            </div>

            {lastStep ? (
              <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div>Transition: <strong>({lastStep.s}, {lastStep.a.toUpperCase()}) → {lastStep.sPrime}</strong></div>
                <div>Observed Reward: <strong className="font-mono">{lastStep.r}</strong></div>
                <div>Previous Q({lastStep.s}, {lastStep.a}): <span className="font-mono">{lastStep.oldQ}</span></div>
                <div style={{ padding: '0.5rem', background: 'var(--lab-bg-obsidian)', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ color: 'var(--lab-accent-amber)', fontSize: '0.72rem' }}>TD Target y:</div>
                  <div className="font-mono" style={{ fontSize: '0.85rem' }}>
                    y = r + γ · max Q(s', a') = {lastStep.target}
                  </div>
                </div>
                <div style={{ padding: '0.5rem', background: 'var(--lab-bg-obsidian)', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ color: 'var(--lab-accent-lime)', fontSize: '0.72rem' }}>New Updated Q(s, a):</div>
                  <div className="font-mono" style={{ fontSize: '0.85rem' }}>
                    Q ← (1 - α)·{lastStep.oldQ} + α·{lastStep.target} = <strong>{lastStep.newQ}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Click "Step Action" or "Continuous Train" to observe the live TD update.
              </div>
            )}
          </div>

          {/* Episode Performance History */}
          <div className="card" style={{ padding: '1rem', background: 'var(--lab-bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              <TrendingUp size={14} color="var(--accent-emerald)" />
              <span>Recent Episode Returns (Last 20)</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '60px', padding: '4px 0' }}>
              {recentReturns.map((ret, i) => {
                const norm = Math.max(10, Math.min(50, (ret + 2) * 20));
                return (
                  <div
                    key={i}
                    title={`Episode return: ${ret}`}
                    style={{
                      flex: 1,
                      height: `${norm}px`,
                      background: ret >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                      borderRadius: '2px',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
