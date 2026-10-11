import { useState } from 'react';
import { RotateCcw, Play, CheckCircle, Layers } from 'lucide-react';

const OPTIMAL_PANCAKE_STEPS = [
  { stack: [2, 1, 4, 3], cost: 0, note: 'Initial State: (2, 1, 4, 3) with 2 at bottom, 3 on top' },
  { stack: [3, 4, 1, 2], cost: 4, note: 'Step 1: Flip position 1 (all 4 pancakes reverse) -> Cost +4 (Total: 4)' },
  { stack: [3, 2, 1, 4], cost: 3, note: 'Step 2: Flip position 2 (top 3 pancakes reverse) -> Cost +3 (Total: 7)' },
  { stack: [4, 3, 2, 1], cost: 4, note: 'Step 3: Flip position 1 (all 4 pancakes reverse) -> Cost +4 (Total: 11). GOAL!' },
];

export const PancakeVisualizer: React.FC = () => {
  // Stack: index 0 is bottom pancake, index 3 is top pancake
  const [stack, setStack] = useState<number[]>([2, 1, 4, 3]);
  const [accumulatedCost, setAccumulatedCost] = useState(0);
  const [history, setHistory] = useState<string[]>(['Initial: (2, 1, 4, 3)']);
  const [aiStep, setAiStep] = useState(0);

  // Goal: [4, 3, 2, 1]
  const isGoal = stack[0] === 4 && stack[1] === 3 && stack[2] === 2 && stack[3] === 1;

  // Flip from position k in 1..3
  // k=1: flip all from index 0 to 3 (cost 4)
  // k=2: flip from index 1 to 3 (cost 3)
  // k=3: flip from index 2 to 3 (cost 2)
  const flip = (pos: number) => {
    const fromIndex = pos - 1;
    const cost = 4 - fromIndex;

    const lowerPart = stack.slice(0, fromIndex);
    const topPart = stack.slice(fromIndex).reverse();
    const nextStack = [...lowerPart, ...topPart];

    setStack(nextStack);
    setAccumulatedCost((prev) => prev + cost);
    setHistory((prev) => [
      ...prev,
      `Flipped pos ${pos} (reversing top ${cost} pancakes, Cost +${cost}) -> (${nextStack.join(', ')})`,
    ]);
  };

  const reset = () => {
    setStack([2, 1, 4, 3]);
    setAccumulatedCost(0);
    setHistory(['Reset to initial (2, 1, 4, 3)']);
    setAiStep(0);
  };

  const stepAISolver = () => {
    if (aiStep < OPTIMAL_PANCAKE_STEPS.length - 1) {
      const nextIdx = aiStep + 1;
      setAiStep(nextIdx);
      const target = OPTIMAL_PANCAKE_STEPS[nextIdx];
      setStack(target.stack);
      setAccumulatedCost((prev) => prev + target.cost);
      setHistory((prev) => [...prev, target.note]);
    }
  };

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Layers size={18} className="text-amber-400" />
            Pancake Sorting Problem Simulator (Lesson 3, Slide 54)
          </div>
          <div className="visualizer-subtitle">
            Spatula Flip Inversions, Variable Action Costs & Admissible Heuristics
          </div>
        </div>

        <div className="visualizer-controls">
          <button onClick={stepAISolver} disabled={isGoal} className="btn-tactile btn-emerald">
            <Play size={14} />
            AI Solver Step ({aiStep}/3)
          </button>
          <button onClick={reset} className="btn-tactile">
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      <div className="visualizer-body">
        <div className="grid-2" style={{ alignItems: 'center' }}>
          {/* Visual Pancake Stack */}
          <div>
            <div className="pancake-stack">
              {/* Stack displayed from top (index 3) down to bottom (index 0) */}
              {[3, 2, 1, 0].map((idx) => {
                const size = stack[idx];
                return (
                  <div
                    key={idx}
                    className={`pancake-item pancake-size-${size}`}
                  >
                    <span>Pancake #{size}</span>
                  </div>
                );
              })}
              <div
                style={{
                  width: '300px',
                  height: '10px',
                  background: '#334155',
                  borderRadius: '4px',
                  marginTop: '4px',
                }}
              />
            </div>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.85rem' }}>
                Accumulated Path Cost $g(n)$: <strong className="font-mono text-cyan-400">{accumulatedCost}</strong>
              </span>
            </div>

            {isGoal && (
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.6rem',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid var(--accent-emerald)',
                  color: '#34d399',
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                <CheckCircle size={15} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                Goal configuration achieved! Largest pancake at base, smallest on top.
              </div>
            )}
          </div>

          {/* Interactive Spatula Controls */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              Spatula Flip Actions:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button onClick={() => flip(1)} className="btn-tactile" style={{ justifyContent: 'space-between' }}>
                <span>Flip from Position 1 (Base)</span>
                <span className="badge badge-cyan font-mono">Cost: 4</span>
              </button>
              <button onClick={() => flip(2)} className="btn-tactile" style={{ justifyContent: 'space-between' }}>
                <span>Flip from Position 2 (Middle)</span>
                <span className="badge badge-cyan font-mono">Cost: 3</span>
              </button>
              <button onClick={() => flip(3)} className="btn-tactile" style={{ justifyContent: 'space-between' }}>
                <span>Flip from Position 3 (Top 2)</span>
                <span className="badge badge-cyan font-mono">Cost: 2</span>
              </button>
            </div>

            {/* Flip History Log */}
            <div style={{ marginTop: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              <div>Flip Trace ({history.length} events):</div>
              {history.slice(-3).map((h, i) => (
                <div key={i} style={{ color: 'var(--text-secondary)' }}>▸ {h}</div>
              ))}
            </div>

            <div className="callout callout-theorem" style={{ marginTop: '1rem', fontSize: '0.78rem' }}>
              <strong>Heuristic Design (Slide 54):</strong>
              <br />
              Let $h(n)$ be the size of the largest pancake out of place, or count of adjacent non-consecutive pairs (gaps). Because each out-of-order pancake requires at least one flip to be reordered, this heuristic never overestimates and is admissible for $A^*$.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
