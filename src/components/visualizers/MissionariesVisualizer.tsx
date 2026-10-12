import React, { useState } from 'react';
import { RotateCcw, Play, CheckCircle, AlertTriangle, Users, Ship } from 'lucide-react';

interface RiverState {
  mLeft: number;
  cLeft: number;
  boatLeft: boolean; // true = Left, false = Right
}

// 11-step optimal solution from graph search
const OPTIMAL_SOLUTION_STEPS = [
  { mLeft: 3, cLeft: 3, boatLeft: true, note: 'Initial State: 3M, 3C on Left' },
  { mLeft: 3, cLeft: 1, boatLeft: false, note: 'Step 1: Send 2 Cannibals to Right' },
  { mLeft: 3, cLeft: 2, boatLeft: true, note: 'Step 2: 1 Cannibal returns to Left' },
  { mLeft: 3, cLeft: 0, boatLeft: false, note: 'Step 3: Send 2 Cannibals to Right' },
  { mLeft: 3, cLeft: 1, boatLeft: true, note: 'Step 4: 1 Cannibal returns to Left' },
  { mLeft: 1, cLeft: 1, boatLeft: false, note: 'Step 5: Send 2 Missionaries to Right' },
  { mLeft: 2, cLeft: 2, boatLeft: true, note: 'Step 6: 1 Missionary & 1 Cannibal return to Left' },
  { mLeft: 0, cLeft: 2, boatLeft: false, note: 'Step 7: Send 2 Missionaries to Right' },
  { mLeft: 0, cLeft: 3, boatLeft: true, note: 'Step 8: 1 Cannibal returns to Left' },
  { mLeft: 0, cLeft: 1, boatLeft: false, note: 'Step 9: Send 2 Cannibals to Right' },
  { mLeft: 0, cLeft: 2, boatLeft: true, note: 'Step 10: 1 Cannibal returns to Left' },
  { mLeft: 0, cLeft: 0, boatLeft: false, note: 'Step 11: Send 2 Cannibals to Right. GOAL ACHIEVED!' },
];

export const MissionariesVisualizer: React.FC = () => {
  const [state, setState] = useState<RiverState>({ mLeft: 3, cLeft: 3, boatLeft: true });
  const [history, setHistory] = useState<string[]>(['Started at initial state (3M, 3C, Left)']);
  const [solutionStep, setSolutionStep] = useState(0);

  const mRight = 3 - state.mLeft;
  const cRight = 3 - state.cLeft;

  // Validation function: returns error string if invalid
  const validateState = (m: number, c: number): string | null => {
    // Left bank
    if (m > 0 && c > m) {
      return `Cannibals (${c}) outnumber Missionaries (${m}) on Left Bank! The missionaries were eaten!`;
    }
    // Right bank
    const mr = 3 - m;
    const cr = 3 - c;
    if (mr > 0 && cr > mr) {
      return `Cannibals (${cr}) outnumber Missionaries (${mr}) on Right Bank! The missionaries were eaten!`;
    }
    return null;
  };

  const isFailed = validateState(state.mLeft, state.cLeft);
  const isGoal = state.mLeft === 0 && state.cLeft === 0 && !state.boatLeft;

  // Manual move
  const handleMove = (mDelta: number, cDelta: number) => {
    if (isFailed || isGoal) return;
    if (mDelta + cDelta === 0 || mDelta + cDelta > 2) return;

    if (state.boatLeft) {
      if (mDelta > state.mLeft || cDelta > state.cLeft) return;
      const nextM = state.mLeft - mDelta;
      const nextC = state.cLeft - cDelta;
      setState({ mLeft: nextM, cLeft: nextC, boatLeft: false });
      setHistory((prev) => [
        ...prev,
        `Moved ${mDelta}M, ${cDelta}C to Right -> (${nextM}M, ${nextC}C on Left)`,
      ]);
    } else {
      if (mDelta > mRight || cDelta > cRight) return;
      const nextM = state.mLeft + mDelta;
      const nextC = state.cLeft + cDelta;
      setState({ mLeft: nextM, cLeft: nextC, boatLeft: true });
      setHistory((prev) => [
        ...prev,
        `Moved ${mDelta}M, ${cDelta}C to Left -> (${nextM}M, ${nextC}C on Left)`,
      ]);
    }
  };

  const reset = () => {
    setState({ mLeft: 3, cLeft: 3, boatLeft: true });
    setHistory(['Reset to initial state (3M, 3C, Left)']);
    setSolutionStep(0);
  };

  const stepAISolver = () => {
    if (solutionStep < OPTIMAL_SOLUTION_STEPS.length - 1) {
      const nextStepIndex = solutionStep + 1;
      setSolutionStep(nextStepIndex);
      const target = OPTIMAL_SOLUTION_STEPS[nextStepIndex];
      setState({ mLeft: target.mLeft, cLeft: target.cLeft, boatLeft: target.boatLeft });
      setHistory((prev) => [...prev, target.note]);
    }
  };

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Users size={18} className="text-emerald-400" />
            Missionaries and Cannibals Interactive Simulation (Lesson 2, Slide 78)
          </div>
          <div className="visualizer-subtitle">
            River Crossing Constraint Problem with State Space Cycle Elimination
          </div>
        </div>

        <div className="visualizer-controls">
          <button onClick={stepAISolver} disabled={isGoal} className="btn-tactile btn-emerald">
            <Play size={14} />
            AI Solver Step ({solutionStep}/11)
          </button>
          <button onClick={reset} className="btn-tactile">
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      <div className="visualizer-body">
        {/* River Graphic Scene */}
        <div
          className="river-crossing-stage"
          style={{
            background: 'linear-gradient(180deg, #0f172a, #080b11)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Left Bank */}
          <div
            className="river-bank"
            style={{
              width: '32%',
              background: 'rgba(30, 41, 59, 0.7)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#38bdf8' }}>
              Left Bank
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '1.4rem' }}>
              <div>{Array(state.mLeft).fill(null).map((_, i) => <span key={i} style={{ display: "inline-flex", width: "1.2em", height: "1.2em", borderRadius: "50%", background: "#38bdf8", color: "#0f172a", alignItems: "center", justifyContent: "center", fontSize: "0.7em", fontWeight: 800, marginRight: "2px" }}>M</span>)}</div>
              <div>{Array(state.cLeft).fill(null).map((_, i) => <span key={i} style={{ display: "inline-flex", width: "1.2em", height: "1.2em", borderRadius: "50%", background: "#f43f5e", color: "#0f172a", alignItems: "center", justifyContent: "center", fontSize: "0.7em", fontWeight: 800, marginRight: "2px" }}>C</span>)}</div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Missionaries: <strong>{state.mLeft}</strong> | Cannibals: <strong>{state.cLeft}</strong>
            </div>
          </div>

          {/* River & Boat */}
          <div
            className="river-water"
            style={{
              flex: 1,
              height: '110px',
              background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.25), rgba(15, 23, 42, 0.1))',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: state.boatLeft ? 'flex-start' : 'flex-end',
              padding: '0 1rem',
              borderTop: '1px dashed rgba(6, 182, 212, 0.3)',
              borderBottom: '1px dashed rgba(6, 182, 212, 0.3)',
            }}
          >
            <div
              style={{
                background: '#475569',
                border: '2px solid #94a3b8',
                borderRadius: '8px',
                padding: '0.4rem 0.8rem',
                fontSize: '1.2rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                transition: 'all 0.4s ease',
              }}
            >
              <Ship size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.3rem" }} /> Boat ({state.boatLeft ? 'Left' : 'Right'})
            </div>
          </div>

          {/* Right Bank */}
          <div
            className="river-bank"
            style={{
              width: '32%',
              background: 'rgba(30, 41, 59, 0.7)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#10b981' }}>
              Right Bank (Goal)
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '1.4rem' }}>
              <div>{Array(mRight).fill(null).map((_, i) => <span key={i} style={{ display: "inline-flex", width: "1.2em", height: "1.2em", borderRadius: "50%", background: "#38bdf8", color: "#0f172a", alignItems: "center", justifyContent: "center", fontSize: "0.7em", fontWeight: 800, marginRight: "2px" }}>M</span>)}</div>
              <div>{Array(cRight).fill(null).map((_, i) => <span key={i} style={{ display: "inline-flex", width: "1.2em", height: "1.2em", borderRadius: "50%", background: "#f43f5e", color: "#0f172a", alignItems: "center", justifyContent: "center", fontSize: "0.7em", fontWeight: 800, marginRight: "2px" }}>C</span>)}</div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Missionaries: <strong>{mRight}</strong> | Cannibals: <strong>{cRight}</strong>
            </div>
          </div>
        </div>

        {/* Warning or Success Alert */}
        {isFailed && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: 'rgba(244, 63, 94, 0.2)',
              border: '1px solid var(--accent-rose)',
              color: '#fb7185',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
            }}
          >
            <AlertTriangle size={16} />
            {isFailed}
          </div>
        )}

        {isGoal && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid var(--accent-emerald)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
            }}
          >
            <CheckCircle size={16} />
            Goal achieved! All 3 missionaries and 3 cannibals successfully crossed safely!
          </div>
        )}

        {/* Manual Boat Controls */}
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Manual Crossing Action (Boat is on {state.boatLeft ? 'Left' : 'Right'}):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button onClick={() => handleMove(1, 0)} className="btn-tactile btn-sm">
              Cross 1 Missionary (1M)
            </button>
            <button onClick={() => handleMove(2, 0)} className="btn-tactile btn-sm">
              Cross 2 Missionaries (2M)
            </button>
            <button onClick={() => handleMove(0, 1)} className="btn-tactile btn-sm">
              Cross 1 Cannibal (1C)
            </button>
            <button onClick={() => handleMove(0, 2)} className="btn-tactile btn-sm">
              Cross 2 Cannibals (2C)
            </button>
            <button onClick={() => handleMove(1, 1)} className="btn-tactile btn-sm">
              Cross 1M + 1C
            </button>
          </div>
        </div>

        {/* Action History Log */}
        <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Action Trace ({history.length} steps):
          </div>
          <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {history.slice(-5).map((entry, idx) => (
              <div key={idx}>▸ {entry}</div>
            ))}
          </div>
        </div>

        {/* Academic Note on Cycle Detection */}
        <div className="callout callout-theorem" style={{ marginTop: '1.25rem', fontSize: '0.82rem' }}>
          <strong>Lecture Analysis (Slide 78): Is it a good idea to test for cycles?</strong>
          <br />
          Yes! In this problem, every action can be immediately undone by sending the boat back with the same passengers. Without checking for cycles in the explored set, tree search gets trapped in infinite ping-pong loops and fails to terminate. Graph search trims the 32 potential states down to the 16 safe configurations and terminates in 11 steps.
        </div>
      </div>
    </div>
  );
};
