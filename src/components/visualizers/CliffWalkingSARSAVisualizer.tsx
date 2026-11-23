import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  BarChart2,
  AlertTriangle,
} from 'lucide-react';

type Action = 'up' | 'down' | 'left' | 'right';
const ACTIONS: Action[] = ['up', 'down', 'left', 'right'];

interface AgentProgress {
  episodes: number;
  totalReward: number;
  cliffFalls: number;
  historyReturns: number[];
  policyPath: { x: number; y: number }[];
}

export const CliffWalkingSARSAVisualizer: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<'q-learning' | 'sarsa'>('sarsa');
  const [alpha, setAlpha] = useState<number>(0.5);
  const [gamma] = useState<number>(1.0);
  const [epsilon, setEpsilon] = useState<number>(0.1);
  const [deploymentMode, setDeploymentMode] = useState<'training' | 'greedy'>('training');

  // Agent State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [qTable, setQTable] = useState<Record<string, Record<Action, number>>>({});
  const [stats, setStats] = useState<AgentProgress>({
    episodes: 0,
    totalReward: 0,
    cliffFalls: 0,
    historyReturns: [],
    policyPath: [],
  });

  // 4 rows x 12 cols
  const cols = 12;
  const rows = 4;

  const initGrid = () => {
    const q: Record<string, Record<Action, number>> = {};
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        q[`${x},${y}`] = { up: 0, down: 0, left: 0, right: 0 };
      }
    }
    setQTable(q);
    setStats({
      episodes: 0,
      totalReward: 0,
      cliffFalls: 0,
      historyReturns: [],
      policyPath: [{ x: 0, y: 0 }],
    });
    setIsRunning(false);
  };

  useEffect(() => {
    initGrid();
  }, [algorithm]);

  const isCliff = (x: number, y: number) => {
    return y === 0 && x >= 1 && x <= 10;
  };

  const isGoal = (x: number, y: number) => {
    return x === 11 && y === 0;
  };

  const getSuccessor = (pos: { x: number; y: number }, a: Action): { x: number; y: number } => {
    let nx = pos.x;
    let ny = pos.y;
    if (a === 'up') ny += 1;
    if (a === 'down') ny -= 1;
    if (a === 'left') nx -= 1;
    if (a === 'right') nx += 1;

    nx = Math.max(0, Math.min(cols - 1, nx));
    ny = Math.max(0, Math.min(rows - 1, ny));
    return { x: nx, y: ny };
  };

  const selectAction = (pos: { x: number; y: number }, eps: number, currentQ: Record<string, Record<Action, number>>): Action => {
    if (deploymentMode === 'greedy' || Math.random() >= eps) {
      const qVals = currentQ[`${pos.x},${pos.y}`] || { up: 0, down: 0, left: 0, right: 0 };
      let maxQ = -Infinity;
      let bestActs: Action[] = [];
      for (const a of ACTIONS) {
        if (qVals[a] > maxQ) {
          maxQ = qVals[a];
          bestActs = [a];
        } else if (qVals[a] === maxQ) {
          bestActs.push(a);
        }
      }
      return bestActs[Math.floor(Math.random() * bestActs.length)];
    }
    return ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  };

  // Run 1 episode
  const runEpisode = () => {
    let pos = { x: 0, y: 0 };
    let epReward = 0;
    let falls = 0;
    let stepCount = 0;
    const tempQ = { ...qTable };
    const path: { x: number; y: number }[] = [pos];

    let action = selectAction(pos, epsilon, tempQ);

    while (!isGoal(pos.x, pos.y) && stepCount < 200) {
      stepCount++;
      const nextPos = getSuccessor(pos, action);
      path.push(nextPos);

      let reward = -1;
      let destinationState = nextPos;

      if (isCliff(nextPos.x, nextPos.y)) {
        reward = -100;
        destinationState = { x: 0, y: 0 }; // Teleport to Start
        falls++;
      }

      epReward += reward;

      const sKey = `${pos.x},${pos.y}`;
      const sPrimeKey = `${destinationState.x},${destinationState.y}`;

      if (algorithm === 'q-learning') {
        // Off-policy Q-learning: uses max Q(s', a')
        const maxNextQ = isGoal(destinationState.x, destinationState.y)
          ? 0
          : Math.max(...ACTIONS.map((act) => tempQ[sPrimeKey]?.[act] ?? 0));
        const target = reward + gamma * maxNextQ;
        tempQ[sKey][action] = Number(((1 - alpha) * tempQ[sKey][action] + alpha * target).toFixed(4));
        pos = destinationState;
        action = selectAction(pos, epsilon, tempQ);
      } else {
        // On-policy SARSA: selects next action a' first under behavior policy
        const nextAction = selectAction(destinationState, epsilon, tempQ);
        const nextQ = isGoal(destinationState.x, destinationState.y) ? 0 : tempQ[sPrimeKey]?.[nextAction] ?? 0;
        const target = reward + gamma * nextQ;
        tempQ[sKey][action] = Number(((1 - alpha) * tempQ[sKey][action] + alpha * target).toFixed(4));
        pos = destinationState;
        action = nextAction;
      }
    }

    setQTable(tempQ);
    setStats((prev) => ({
      episodes: prev.episodes + 1,
      totalReward: prev.totalReward + epReward,
      cliffFalls: prev.cliffFalls + falls,
      historyReturns: [epReward, ...prev.historyReturns.slice(0, 24)],
      policyPath: path.slice(-30),
    }));
  };

  // Run multiple episodes
  const runMultiple = (count: number) => {
    for (let i = 0; i < count; i++) {
      runEpisode();
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isRunning) {
      timer = setInterval(() => {
        runEpisode();
      }, 80);
    }
    return () => clearInterval(timer);
  }, [isRunning, qTable]);

  return (
    <div className="card" style={{ padding: '1.75rem', border: '1px solid var(--lab-border-active)' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-amber font-mono">LABORATORY 5.3</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Slides 72–76</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem' }}>
            The Cliff-Walking Experiment: SARSA (On-Policy) vs. Q-Learning (Off-Policy)
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setAlgorithm(algorithm === 'sarsa' ? 'q-learning' : 'sarsa')}
            className={`btn-tactile btn-sm ${algorithm === 'sarsa' ? 'btn-amber' : 'btn-primary'}`}
          >
            <span>Algorithm: {algorithm === 'sarsa' ? 'SARSA (On-Policy Safe)' : 'Q-Learning (Off-Policy Greedy)'}</span>
          </button>
          <button onClick={initGrid} className="btn-tactile btn-sm">
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Mode and Parameter Toggles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          padding: '1rem',
          background: 'var(--lab-bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--lab-border-subtle)',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
            Deployment Mode (Slide 74)
          </label>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={() => setDeploymentMode('training')}
              className={`btn-tactile btn-xs ${deploymentMode === 'training' ? 'btn-primary' : ''}`}
            >
              Control (ε = {epsilon})
            </button>
            <button
              onClick={() => setDeploymentMode('greedy')}
              className={`btn-tactile btn-xs ${deploymentMode === 'greedy' ? 'btn-emerald' : ''}`}
            >
              Greedy (ε = 0)
            </button>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Exploration ε:</span>
            <strong style={{ color: 'var(--lab-accent-amber)' }}>{epsilon}</strong>
          </div>
          <input
            type="range"
            min="0.0"
            max="0.4"
            step="0.05"
            value={epsilon}
            onChange={(e) => setEpsilon(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Learning Rate α:</span>
            <strong style={{ color: 'var(--lab-accent-lime)' }}>{alpha}</strong>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={alpha}
            onChange={(e) => setAlpha(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
            Batch Execution
          </label>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`btn-tactile btn-xs ${isRunning ? 'btn-amber' : 'btn-emerald'}`}
            >
              {isRunning ? <Pause size={12} /> : <Play size={12} />}
              <span>{isRunning ? 'Pause' : 'Train'}</span>
            </button>
            <button onClick={() => runMultiple(25)} className="btn-tactile btn-xs">
              +25 Ep
            </button>
            <button onClick={() => runMultiple(100)} className="btn-tactile btn-xs">
              +100 Ep
            </button>
          </div>
        </div>
      </div>

      {/* 4x12 Grid World Canvas */}
      <div
        style={{
          background: 'var(--lab-bg-obsidian)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--lab-border-active)',
          padding: '1.25rem',
          overflowX: 'auto',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ minWidth: '640px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '4px' }}>
            {/* Rows: 3 (top safe) down to 0 (cliff line) */}
            {[3, 2, 1, 0].map((y) =>
              Array.from({ length: cols }, (_, x) => {
                const cliff = isCliff(x, y);
                const goal = isGoal(x, y);
                const start = x === 0 && y === 0;

                let bg = 'rgba(15, 23, 42, 0.7)';
                if (cliff) bg = 'rgba(239, 68, 68, 0.35)';
                if (goal) bg = 'rgba(16, 185, 129, 0.35)';
                if (start) bg = 'rgba(56, 189, 248, 0.25)';

                // Is in policy path?
                const isInPath = stats.policyPath.some((p) => p.x === x && p.y === y);

                return (
                  <div
                    key={`${x}-${y}`}
                    style={{
                      height: '52px',
                      background: bg,
                      borderRadius: '4px',
                      border: isInPath
                        ? '2px solid var(--lab-accent-lime)'
                        : cliff
                        ? '1px dashed #ef4444'
                        : '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {start && <strong style={{ color: '#38bdf8' }}>START (S)</strong>}
                    {goal && <strong style={{ color: '#10b981' }}>GOAL (G)</strong>}
                    {cliff && <strong style={{ color: '#ef4444' }}>CLIFF (-100)</strong>}
                    {!start && !goal && !cliff && (
                      <span style={{ color: 'var(--text-dim)' }}>
                        {x},{y}
                      </span>
                    )}

                    {isInPath && !cliff && (
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--lab-accent-lime)',
                          position: 'absolute',
                          top: 4,
                          right: 4,
                        }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Comparative Analysis & Telemetry Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Run Telemetry */}
        <div className="card" style={{ padding: '1.25rem', background: 'var(--lab-bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <BarChart2 size={16} color="var(--lab-accent-cyan)" />
            <strong style={{ fontSize: '0.9rem' }}>Live Training Telemetry</strong>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Episodes Completed:</span>
              <strong className="font-mono">{stats.episodes}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Cliff Falls During Training:</span>
              <strong className="font-mono" style={{ color: stats.cliffFalls > 10 ? 'var(--accent-rose)' : 'inherit' }}>
                {stats.cliffFalls}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Average Episode Return:</span>
              <strong className="font-mono">
                {stats.episodes > 0 ? (stats.totalReward / stats.episodes).toFixed(1) : 0}
              </strong>
            </div>
          </div>
        </div>

        {/* Academic Comparison from Lecture Slide 73-74 */}
        <div className="card" style={{ padding: '1.25rem', background: 'var(--lab-bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={16} color="var(--lab-accent-amber)" />
            <strong style={{ fontSize: '0.9rem' }}>Lecture Empirical Findings (Slides 73–74)</strong>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '0.65rem' }}>
            <strong>Why does SARSA perform better while learning?</strong>
            <br />
            During training with active exploration (ε = 0.1), Q-learning learns the shortest 13-step path next to the cliff, but exploratory slips cause frequent falls (avg return <strong>-51</strong>). SARSA learns a longer 17-step safe route through rows 2 & 3, averaging <strong>-27</strong>!
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem' }}>
            <div style={{ flex: 1, padding: '0.4rem', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '4px' }}>
              <strong>Q-Learning</strong>: Shortest greedy route (13 steps), risky under exploration.
            </div>
            <div style={{ flex: 1, padding: '0.4rem', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '4px' }}>
              <strong>SARSA</strong>: Safer detour (17 steps), robust to exploratory mistakes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
