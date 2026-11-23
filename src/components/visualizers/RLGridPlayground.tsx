import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Compass,
} from 'lucide-react';

type Action = 'up' | 'down' | 'left' | 'right';
const ACTIONS: Action[] = ['up', 'down', 'left', 'right'];

interface CellState {
  x: number; // 1-indexed (col)
  y: number; // 1-indexed (row from bottom)
  isWall: boolean;
  isTerminal: boolean;
  terminalReward?: number;
  u: number;
  policy: Action;
}

export const RLGridPlayground: React.FC = () => {
  // Config
  const [gridType, setGridType] = useState<'4x3' | '3x3-exam'>('4x3');
  const [stepReward, setStepReward] = useState<number>(-0.04);
  const [gamma, setGamma] = useState<number>(1.0);
  const [probForward] = useState<number>(0.8);
  const [probPerp] = useState<number>(0.1);

  // Agent State
  const [agentPos, setAgentPos] = useState<{ x: number; y: number }>({ x: 1, y: 1 });
  const [accumulatedReward, setAccumulatedReward] = useState<number>(0);
  const [stepsTaken, setStepsTaken] = useState<number>(0);
  const [lastActionTaken, setLastActionTaken] = useState<{ intended: Action; actual: Action; reward: number } | null>(null);

  // Value Iteration Grid State
  const [grid, setGrid] = useState<CellState[]>([]);
  const [viIteration, setViIteration] = useState<number>(0);
  const [viConverged, setViConverged] = useState<boolean>(false);
  const [autoRunVI, setAutoRunVI] = useState<boolean>(false);

  // Prediction Challenge State
  const [predictMode, setPredictMode] = useState<boolean>(false);
  const [selectedPrediction, setSelectedPrediction] = useState<Action | null>(null);
  const [predictionFeedback, setPredictionFeedback] = useState<string | null>(null);
  const [isPredictionCorrect, setIsPredictionCorrect] = useState<boolean | null>(null);

  const cols = gridType === '4x3' ? 4 : 3;
  const rows = 3;

  // Initialize Grid based on selected type
  const initGrid = () => {
    const cells: CellState[] = [];
    if (gridType === '4x3') {
      for (let y = 1; y <= 3; y++) {
        for (let x = 1; x <= 4; x++) {
          const isWall = x === 2 && y === 2;
          const isGoal = x === 4 && y === 3;
          const isTrap = x === 4 && y === 2;
          cells.push({
            x,
            y,
            isWall,
            isTerminal: isGoal || isTrap,
            terminalReward: isGoal ? 1.0 : isTrap ? -1.0 : undefined,
            u: isGoal ? 1.0 : isTrap ? -1.0 : 0.0,
            policy: 'up',
          });
        }
      }
    } else {
      // 3x3 Exam Grid from PDF slide:
      // s1, s2 (U=10), s3
      // s4 (U=-5), s0 (center), s5 (U=-4)
      // s6, s7 (U=5), s8
      for (let y = 1; y <= 3; y++) {
        for (let x = 1; x <= 3; x++) {
          let uInit = 0;
          if (x === 2 && y === 3) uInit = 10; // s2
          if (x === 1 && y === 2) uInit = -5; // s4
          if (x === 3 && y === 2) uInit = -4; // s5
          if (x === 2 && y === 1) uInit = 5;  // s7
          cells.push({
            x,
            y,
            isWall: false,
            isTerminal: false,
            u: uInit,
            policy: 'right',
          });
        }
      }
    }
    setGrid(cells);
    setAgentPos(gridType === '4x3' ? { x: 1, y: 1 } : { x: 2, y: 2 });
    setAccumulatedReward(0);
    setStepsTaken(0);
    setLastActionTaken(null);
    setViIteration(0);
    setViConverged(false);
    setAutoRunVI(false);
    setPredictionFeedback(null);
    setSelectedPrediction(null);
    setIsPredictionCorrect(null);
  };

  useEffect(() => {
    initGrid();
  }, [gridType, stepReward, gamma]);

  const getCell = (x: number, y: number, stateGrid: CellState[] = grid): CellState | undefined => {
    return stateGrid.find((c) => c.x === x && c.y === y);
  };

  // Transition dynamics with boundary collision
  const getSuccessor = (pos: { x: number; y: number }, act: Action): { x: number; y: number } => {
    let nx = pos.x;
    let ny = pos.y;
    if (act === 'up') ny += 1;
    if (act === 'down') ny -= 1;
    if (act === 'left') nx -= 1;
    if (act === 'right') nx += 1;

    // Check bounds
    if (nx < 1 || nx > cols || ny < 1 || ny > rows) {
      return pos; // Hit outer wall, bounce back
    }
    const target = getCell(nx, ny);
    if (!target || target.isWall) {
      return pos; // Hit obstacle, bounce back
    }
    return { x: nx, y: ny };
  };

  // Compute expected utility for taking action `a` in cell `c`
  const computeActionQ = (c: CellState, a: Action, currentGrid: CellState[]): number => {
    if (c.isTerminal) return c.terminalReward ?? 0;

    let perp1: Action = 'left';
    let perp2: Action = 'right';
    if (a === 'up' || a === 'down') {
      perp1 = 'left';
      perp2 = 'right';
    } else {
      perp1 = 'up';
      perp2 = 'down';
    }

    const sForward = getSuccessor({ x: c.x, y: c.y }, a);
    const sPerp1 = getSuccessor({ x: c.x, y: c.y }, perp1);
    const sPerp2 = getSuccessor({ x: c.x, y: c.y }, perp2);

    const uForward = getCell(sForward.x, sForward.y, currentGrid)?.u ?? 0;
    const uPerp1 = getCell(sPerp1.x, sPerp1.y, currentGrid)?.u ?? 0;
    const uPerp2 = getCell(sPerp2.x, sPerp2.y, currentGrid)?.u ?? 0;

    const pF = gridType === '3x3-exam' ? 0.4 : probForward;
    const pP1 = gridType === '3x3-exam' ? 0.3 : probPerp;
    const pP2 = gridType === '3x3-exam' ? 0.3 : probPerp;

    const expectedFuture = pF * uForward + pP1 * uPerp1 + pP2 * uPerp2;
    return stepReward + gamma * expectedFuture;
  };

  // One step of Value Iteration
  const stepValueIteration = () => {
    if (viConverged) return;
    let maxDelta = 0;
    const newGrid = grid.map((cell) => {
      if (cell.isWall || cell.isTerminal) return cell;

      let bestU = -Infinity;
      let bestA: Action = 'up';

      for (const a of ACTIONS) {
        const val = computeActionQ(cell, a, grid);
        if (val > bestU) {
          bestU = val;
          bestA = a;
        }
      }

      const delta = Math.abs(bestU - cell.u);
      if (delta > maxDelta) maxDelta = delta;

      return {
        ...cell,
        u: Number(bestU.toFixed(4)),
        policy: bestA,
      };
    });

    setGrid(newGrid);
    setViIteration((prev) => prev + 1);
    if (maxDelta < 0.001) {
      setViConverged(true);
      setAutoRunVI(false);
    }
  };

  // Continuous runner for VI
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (autoRunVI && !viConverged) {
      timer = setTimeout(() => {
        stepValueIteration();
      }, 250);
    }
    return () => clearTimeout(timer);
  }, [autoRunVI, viIteration, viConverged]);

  // Execute one manual action with stochastic roll
  const executeAgentAction = (intendedAction: Action) => {
    const currentCell = getCell(agentPos.x, agentPos.y);
    if (!currentCell || currentCell.isTerminal) return;

    // Stochastic roll
    const roll = Math.random();
    let actualAction: Action = intendedAction;
    let perp1: Action = 'left';
    let perp2: Action = 'right';
    if (intendedAction === 'up' || intendedAction === 'down') {
      perp1 = 'left';
      perp2 = 'right';
    } else {
      perp1 = 'up';
      perp2 = 'down';
    }

    const pF = gridType === '3x3-exam' ? 0.4 : probForward;
    const pP1 = gridType === '3x3-exam' ? 0.3 : probPerp;

    if (roll < pF) {
      actualAction = intendedAction;
    } else if (roll < pF + pP1) {
      actualAction = perp1;
    } else {
      actualAction = perp2;
    }

    const nextPos = getSuccessor(agentPos, actualAction);
    const nextCell = getCell(nextPos.x, nextPos.y);

    const reward = nextCell?.isTerminal ? (nextCell.terminalReward ?? stepReward) : stepReward;

    setAgentPos(nextPos);
    setStepsTaken((s) => s + 1);
    setAccumulatedReward((r) => Number((r + reward).toFixed(2)));
    setLastActionTaken({ intended: intendedAction, actual: actualAction, reward });
  };

  // Prediction verification
  const handleCheckPrediction = (action: Action) => {
    setSelectedPrediction(action);
    const cell = getCell(agentPos.x, agentPos.y);
    if (!cell) return;

    // Calculate all Q-values
    const qValues = ACTIONS.map((a) => ({
      action: a,
      q: computeActionQ(cell, a, grid),
    })).sort((a, b) => b.q - a.q);

    const optimalAction = qValues[0].action;
    const userQ = qValues.find((item) => item.action === action)?.q ?? 0;
    const bestQ = qValues[0].q;

    if (action === optimalAction || Math.abs(userQ - bestQ) < 0.001) {
      setIsPredictionCorrect(true);
      setPredictionFeedback(
        `Correct! Action "${action.toUpperCase()}" achieves the maximum expected utility U = ${userQ.toFixed(3)}. Calculations: ${qValues.map((q) => `${q.action.toUpperCase()}: ${q.q.toFixed(2)}`).join(' | ')}.`
      );
    } else {
      setIsPredictionCorrect(false);
      setPredictionFeedback(
        `Incorrect. You chose "${action.toUpperCase()}" (Expected utility = ${userQ.toFixed(3)}), but the optimal Bellman action is "${optimalAction.toUpperCase()}" with utility ${bestQ.toFixed(3)}. Notice how the stochastic slip probability alters the expected value!`
      );
    }
  };

  return (
    <div className="card" style={{ padding: '1.75rem', border: '1px solid var(--lab-border-active)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-lime font-mono">LABORATORY 5.1</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Slide 6, 9 & Exam Grid</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem' }}>
            Reinforcement Learning Playground: Stochastic Grid-World
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setGridType(gridType === '4x3' ? '3x3-exam' : '4x3');
            }}
            className="btn-tactile btn-sm"
          >
            <Compass size={14} />
            <span>Preset: {gridType === '4x3' ? 'Standard 4×3 World' : 'UCLM 3×3 Exam Grid'}</span>
          </button>
          <button onClick={initGrid} className="btn-tactile btn-sm" title="Reset Grid & Agent">
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Control Strip */}
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
            Step Cost R(s) (Slide 9): <strong style={{ color: 'var(--lab-accent-amber)' }}>{stepReward}</strong>
          </label>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {[-0.04, -0.1, -2.0, 0.05].map((r) => (
              <button
                key={r}
                onClick={() => setStepReward(r)}
                className={`btn-tactile btn-xs ${stepReward === r ? 'btn-primary' : ''}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
            Discount Factor γ: <strong style={{ color: 'var(--lab-accent-cyan)' }}>{gamma}</strong>
          </label>
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
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
            Value Iteration Engine
          </label>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setAutoRunVI(!autoRunVI)}
              disabled={viConverged}
              className={`btn-tactile btn-sm ${autoRunVI ? 'btn-amber' : 'btn-emerald'}`}
            >
              {autoRunVI ? <Pause size={13} /> : <Play size={13} />}
              <span>{autoRunVI ? 'Pause' : 'Solve VI'}</span>
            </button>
            <button
              onClick={stepValueIteration}
              disabled={viConverged || autoRunVI}
              className="btn-tactile btn-sm"
              title="Step 1 iteration"
            >
              <SkipForward size={13} />
              <span>Step</span>
            </button>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
            Prediction Mode (Active Learning)
          </label>
          <button
            onClick={() => {
              setPredictMode(!predictMode);
              setPredictionFeedback(null);
              setSelectedPrediction(null);
            }}
            className={`btn-tactile btn-sm ${predictMode ? 'btn-primary' : ''}`}
            style={{ width: '100%' }}
          >
            <HelpCircle size={14} />
            <span>{predictMode ? 'Exit Predict Mode' : 'Predict Next Move'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid View and Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(260px, 320px)', gap: '1.5rem', alignItems: 'start' }}>
        {/* The Grid Canvas */}
        <div
          style={{
            background: 'var(--lab-bg-obsidian)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--lab-border-active)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 80px)`,
              gridTemplateRows: `repeat(${rows}, 80px)`,
              gap: '6px',
            }}
          >
            {/* Rows are 3 (top) down to 1 (bottom) */}
            {[3, 2, 1].map((y) =>
              Array.from({ length: cols }, (_, i) => i + 1).map((x) => {
                const cell = getCell(x, y);
                const isAgentHere = agentPos.x === x && agentPos.y === y;

                if (!cell) return null;

                if (cell.isWall) {
                  return (
                    <div
                      key={`${x}-${y}`}
                      style={{
                        background: '#334155',
                        borderRadius: '6px',
                        border: '1px solid #475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                      }}
                    >
                      WALL
                    </div>
                  );
                }

                // Compute color heatmap based on utility
                let bgColor = 'rgba(15, 23, 42, 0.8)';
                if (cell.isTerminal) {
                  bgColor = (cell.terminalReward ?? 0) > 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)';
                } else if (cell.u > 0) {
                  bgColor = `rgba(16, 185, 129, ${Math.min(0.5, cell.u * 0.45)})`;
                } else if (cell.u < 0) {
                  bgColor = `rgba(239, 68, 68, ${Math.min(0.5, Math.abs(cell.u) * 0.3)})`;
                }

                const arrowSymbol = {
                  up: '↑',
                  down: '↓',
                  left: '←',
                  right: '→',
                }[cell.policy];

                return (
                  <div
                    key={`${x}-${y}`}
                    style={{
                      background: bgColor,
                      borderRadius: '6px',
                      border: isAgentHere ? '2px solid var(--lab-accent-lime)' : '1px solid var(--lab-border-subtle)',
                      boxShadow: isAgentHere ? '0 0 12px rgba(198, 242, 119, 0.4)' : undefined,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '6px',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                      <span>({x},{y})</span>
                      {cell.isTerminal && (
                        <span style={{ fontWeight: 800, color: cell.terminalReward! > 0 ? '#34d399' : '#f87171' }}>
                          {cell.terminalReward! > 0 ? '+1' : '-1'}
                        </span>
                      )}
                    </div>

                    {/* Agent or Policy Arrow */}
                    <div style={{ textAlign: 'center' }}>
                      {isAgentHere ? (
                        <span style={{ fontSize: '1.4rem' }}>🤖</span>
                      ) : !cell.isTerminal ? (
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--lab-accent-cyan)' }}>
                          {arrowSymbol}
                        </span>
                      ) : null}
                    </div>

                    {/* Utility value */}
                    <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-primary)' }}>
                      {cell.u.toFixed(2)}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Manual Control Pad */}
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Actuator Controls (Stochastic Execution)</span>
            <button
              onClick={() => executeAgentAction('up')}
              className="btn-tactile btn-sm"
              style={{ width: '45px', padding: '0.35rem' }}
            >
              ↑
            </button>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                onClick={() => executeAgentAction('left')}
                className="btn-tactile btn-sm"
                style={{ width: '45px', padding: '0.35rem' }}
              >
                ←
              </button>
              <button
                onClick={() => executeAgentAction('down')}
                className="btn-tactile btn-sm"
                style={{ width: '45px', padding: '0.35rem' }}
              >
                ↓
              </button>
              <button
                onClick={() => executeAgentAction('right')}
                className="btn-tactile btn-sm"
                style={{ width: '45px', padding: '0.35rem' }}
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Live Telemetry & Predict Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Status Box */}
          <div className="card" style={{ padding: '1rem', background: 'var(--lab-bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>VI Iteration:</span>
              <span className="font-mono" style={{ fontWeight: 700 }}>
                {viIteration} {viConverged ? '(Converged ✓)' : ''}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Agent Location:</span>
              <span className="font-mono">({agentPos.x}, {agentPos.y})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Steps Taken:</span>
              <span className="font-mono">{stepsTaken}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accumulated Reward:</span>
              <span className="font-mono" style={{ color: accumulatedReward >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 800 }}>
                {accumulatedReward}
              </span>
            </div>

            {lastActionTaken && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
                <div>Intended: <strong>{lastActionTaken.intended.toUpperCase()}</strong></div>
                <div>
                  Executed: <strong style={{ color: lastActionTaken.intended === lastActionTaken.actual ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                    {lastActionTaken.actual.toUpperCase()}
                    {lastActionTaken.intended !== lastActionTaken.actual ? ' (Drifted!)' : ''}
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* Predict Mode Box */}
          {predictMode && (
            <div
              className="card"
              style={{
                padding: '1.25rem',
                border: '1px solid var(--lab-accent-lime)',
                background: 'rgba(198, 242, 119, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <HelpCircle size={15} color="var(--lab-accent-lime)" />
                <strong style={{ fontSize: '0.85rem' }}>Predict Optimal Move</strong>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Given the agent is at ({agentPos.x}, {agentPos.y}) with current utilities, which action maximizes the expected Bellman equation?
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.75rem' }}>
                {ACTIONS.map((a) => (
                  <button
                    key={a}
                    onClick={() => handleCheckPrediction(a)}
                    className={`btn-tactile btn-sm ${selectedPrediction === a ? 'btn-primary' : ''}`}
                  >
                    {a.toUpperCase()}
                  </button>
                ))}
              </div>

              {predictionFeedback && (
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isPredictionCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${isPredictionCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
                    fontSize: '0.78rem',
                    lineHeight: '1.4',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                    {isPredictionCorrect ? (
                      <CheckCircle2 size={14} color="var(--accent-emerald)" />
                    ) : (
                      <XCircle size={14} color="var(--accent-rose)" />
                    )}
                    <strong>{isPredictionCorrect ? 'Prediction Verified' : 'Diagnostic Feedback'}</strong>
                  </div>
                  <div>{predictionFeedback}</div>
                </div>
              )}
            </div>
          )}

          {/* Bellman Formula Reminder */}
          <div className="callout callout-source" style={{ fontSize: '0.78rem' }}>
            <strong>Bellman Equation (Slide 18):</strong>
            <div style={{ fontFamily: 'var(--font-mono)', marginTop: '0.25rem', color: 'var(--lab-accent-cyan)' }}>
              U(s) = max_a [ R(s,a) + γ ∑ T(s,a,s') U(s') ]
            </div>
            <div style={{ marginTop: '0.35rem', color: 'var(--text-muted)' }}>
              80% intended transition + 10% perpendicular left + 10% perpendicular right.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
