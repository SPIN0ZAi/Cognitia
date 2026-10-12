import React, { useState } from 'react';
import { RotateCcw, Play, CheckCircle, Droplet } from 'lucide-react';

const OPTIMAL_JUG_STEPS = [
  { j4: 0, j3: 0, note: 'Initial State: <0, 0>' },
  { j4: 0, j3: 3, note: 'Step 1: Fill 3-Liter Jug -> <0, 3>' },
  { j4: 3, j3: 0, note: 'Step 2: Pour J3 into J4 -> <3, 0>' },
  { j4: 3, j3: 3, note: 'Step 3: Fill 3-Liter Jug again -> <3, 3>' },
  { j4: 4, j3: 2, note: 'Step 4: Pour J3 into J4 until J4 is full -> <4, 2> (leaving exactly 2L in J3!)' },
  { j4: 0, j3: 2, note: 'Step 5: Empty 4-Liter Jug -> <0, 2>' },
  { j4: 2, j3: 0, note: 'Step 6: Pour the 2 Liters from J3 into J4 -> <2, 0>. GOAL ACHIEVED!' },
];

export const WaterJugsVisualizer: React.FC = () => {
  const [j4, setJ4] = useState(0); // 0..4
  const [j3, setJ3] = useState(0); // 0..3
  const [actionsLog, setActionsLog] = useState<string[]>(['Initial state <0, 0>']);
  const [aiStep, setAiStep] = useState(0);

  const isGoal = j4 === 2;

  // Manual actions
  const fill4 = () => {
    setJ4(4);
    setActionsLog((prev) => [...prev, `Fill J4 -> <4, ${j3}>`]);
  };

  const fill3 = () => {
    setJ3(3);
    setActionsLog((prev) => [...prev, `Fill J3 -> <${j4}, 3>`]);
  };

  const empty4 = () => {
    setJ4(0);
    setActionsLog((prev) => [...prev, `Empty J4 -> <0, ${j3}>`]);
  };

  const empty3 = () => {
    setJ3(0);
    setActionsLog((prev) => [...prev, `Empty J3 -> <${j4}, 0>`]);
  };

  const pour4to3 = () => {
    const transfer = Math.min(j4, 3 - j3);
    const next4 = j4 - transfer;
    const next3 = j3 + transfer;
    setJ4(next4);
    setJ3(next3);
    setActionsLog((prev) => [...prev, `Pour J4 -> J3 (${transfer}L) -> <${next4}, ${next3}>`]);
  };

  const pour3to4 = () => {
    const transfer = Math.min(j3, 4 - j4);
    const next3 = j3 - transfer;
    const next4 = j4 + transfer;
    setJ4(next4);
    setJ3(next3);
    setActionsLog((prev) => [...prev, `Pour J3 -> J4 (${transfer}L) -> <${next4}, ${next3}>`]);
  };

  const reset = () => {
    setJ4(0);
    setJ3(0);
    setActionsLog(['Reset to <0, 0>']);
    setAiStep(0);
  };

  const stepAISolver = () => {
    if (aiStep < OPTIMAL_JUG_STEPS.length - 1) {
      const nextStepIndex = aiStep + 1;
      setAiStep(nextStepIndex);
      const target = OPTIMAL_JUG_STEPS[nextStepIndex];
      setJ4(target.j4);
      setJ3(target.j3);
      setActionsLog((prev) => [...prev, target.note]);
    }
  };

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Droplet size={18} className="text-cyan-400" />
            The Water Jugs Problem Simulator (Lesson 2, Slide 79)
          </div>
          <div className="visualizer-subtitle">
            4-Liter Jug & 3-Liter Jug: State Transitions to Measure Exactly 2 Liters
          </div>
        </div>

        <div className="visualizer-controls">
          <button onClick={stepAISolver} disabled={isGoal} className="btn-tactile btn-emerald">
            <Play size={14} />
            AI Solver Step ({aiStep}/6)
          </button>
          <button onClick={reset} className="btn-tactile">
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      <div className="visualizer-body">
        {/* Animated Water Jugs */}
        <div className="jug-container">
          {/* 4-Liter Jug */}
          <div style={{ textAlign: 'center' }}>
            <div className="water-jug" style={{ height: '220px' }}>
              <div
                className="water-level"
                style={{ height: `${(j4 / 4) * 100}%` }}
              />
              <div className="water-marks">
                <div>4L</div>
                <div>3L</div>
                <div style={{ color: '#fbbf24', fontWeight: 700 }}>2L [GOAL]</div>
                <div>1L</div>
                <div>0L</div>
              </div>
            </div>
            <div style={{ marginTop: '0.75rem', fontWeight: 700, fontSize: '0.95rem' }}>
              4-Liter Jug (<span className="text-cyan-400">{j4} L</span>)
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', justifyContent: 'center' }}>
              <button onClick={fill4} className="btn-tactile btn-sm">Fill</button>
              <button onClick={empty4} className="btn-tactile btn-sm">Empty</button>
              <button onClick={pour4to3} className="btn-tactile btn-sm">Pour &rarr; J3</button>
            </div>
          </div>

          {/* 3-Liter Jug */}
          <div style={{ textAlign: 'center' }}>
            <div className="water-jug" style={{ height: '170px' }}>
              <div
                className="water-level"
                style={{ height: `${(j3 / 3) * 100}%` }}
              />
              <div className="water-marks">
                <div>3L</div>
                <div>2L</div>
                <div>1L</div>
                <div>0L</div>
              </div>
            </div>
            <div style={{ marginTop: '0.75rem', fontWeight: 700, fontSize: '0.95rem' }}>
              3-Liter Jug (<span className="text-cyan-400">{j3} L</span>)
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', justifyContent: 'center' }}>
              <button onClick={fill3} className="btn-tactile btn-sm">Fill</button>
              <button onClick={empty3} className="btn-tactile btn-sm">Empty</button>
              <button onClick={pour3to4} className="btn-tactile btn-sm">Pour &rarr; J4</button>
            </div>
          </div>
        </div>

        {/* Goal Banner */}
        {isGoal && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid var(--accent-emerald)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              justifyContent: 'center',
              fontWeight: 600,
            }}
          >
            <CheckCircle size={17} />
            Success! The 4-liter jug contains exactly 2 liters!
          </div>
        )}

        {/* Action History Log */}
        <div className="card" style={{ marginTop: '1.25rem', padding: '1rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Transition Sequence & State History
          </div>
          <div style={{ maxHeight: '100px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            {actionsLog.map((log, i) => (
              <div key={i}>• {log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
