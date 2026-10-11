import { useState } from 'react';
import { Calculator } from 'lucide-react';

export const EffectiveBranchingFactor: React.FC = () => {
  const [nodesN, setNodesN] = useState<number>(52);
  const [depthD, setDepthD] = useState<number>(5);

  // Solve N + 1 = 1 + b* + (b*)^2 + ... + (b*)^d using binary search / Newton Raphson
  const solveBStar = (N: number, d: number): number => {
    if (d <= 0 || N <= 0) return 1.0;
    let low = 1.0;
    let high = 100.0;

    for (let iter = 0; iter < 40; iter++) {
      const mid = (low + high) / 2;
      // compute sum_{i=0}^d mid^i
      let sum = 0;
      let term = 1;
      for (let i = 0; i <= d; i++) {
        sum += term;
        term *= mid;
      }
      if (sum > N + 1) {
        high = mid;
      } else {
        low = mid;
      }
    }
    return (low + high) / 2;
  };

  const calculatedBStar = solveBStar(nodesN, depthD);

  const applyPreset = (n: number, d: number) => {
    setNodesN(n);
    setDepthD(d);
  };

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Calculator size={18} className="text-amber-400" />
            Effective Branching Factor ($b^*$) Laboratory (Lesson 3, Slide 48)
          </div>
          <div className="visualizer-subtitle">
            Polynomial Root Solver for $N + 1 = 1 + b^* + (b^*)^2 + \\dots + (b^*)^d$ & Benchmark Metrics
          </div>
        </div>
      </div>

      <div className="visualizer-body">
        {/* Interactive Calculator Controls */}
        <div className="grid-2" style={{ alignItems: 'center' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '1rem', color: '#f8fafc' }}>
              Experiment with Search Parameters:
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                Total Nodes Generated ($N$):
              </label>
              <input
                type="number"
                min="1"
                max="100000000"
                value={nodesN}
                onChange={(e) => setNodesN(Math.max(1, Number(e.target.value)))}
                style={{
                  width: '100%',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                Solution Depth ($d$):
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={depthD}
                onChange={(e) => setDepthD(Math.max(1, Number(e.target.value)))}
                style={{
                  width: '100%',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Presets from UCLM Lecture Table (Slide 48):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              <button onClick={() => applyPreset(52, 5)} className="btn-tactile btn-sm">
                Slide Example (d=5, N=52)
              </button>
              <button onClick={() => applyPreset(10, 2)} className="btn-tactile btn-sm">
                IDS (d=2, N=10)
              </button>
              <button onClick={() => applyPreset(227, 12)} className="btn-tactile btn-sm">
                A*(h1) (d=12, N=227)
              </button>
              <button onClick={() => applyPreset(73, 12)} className="btn-tactile btn-sm">
                A*(h2) (d=12, N=73)
              </button>
              <button onClick={() => applyPreset(1641, 24)} className="btn-tactile btn-sm">
                A*(h2) (d=24, N=1641)
              </button>
            </div>
          </div>

          {/* Solved Output Card */}
          <div
            style={{
              background: 'radial-gradient(circle at center, rgba(245, 158, 11, 0.15), rgba(15, 23, 42, 0.6))',
              border: '2px solid var(--accent-amber)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem 1.5rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Effective Branching Factor
            </div>
            <div
              style={{
                fontSize: '3.5rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: '#fbbf24',
                margin: '0.5rem 0',
              }}
            >
              b* = {calculatedBStar.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {calculatedBStar < 1.3
                ? '★ Outstanding heuristic quality (close to optimal 1.0)'
                : calculatedBStar < 1.8
                ? '✓ Good heuristic guidance'
                : '⚠ High branching factor: significant exponential expansion'}
            </div>
          </div>
        </div>

        {/* Reproduce UCLM Slide 48 Benchmark Table */}
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Official Lecture Benchmark Table: IDS vs A*(h1) vs A*(h2) (Slide 48)
          </div>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              textAlign: 'center',
            }}
          >
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-medium)' }}>
                <th style={{ padding: '0.6rem' }}>Depth (d)</th>
                <th>IDS Nodes (N)</th>
                <th>A*(h1) Nodes (N)</th>
                <th>A*(h2) Nodes (N)</th>
                <th>IDS b*</th>
                <th>A*(h1) b*</th>
                <th>A*(h2) b*</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.5rem', fontWeight: 700 }}>2</td>
                <td>10</td>
                <td>6</td>
                <td>6</td>
                <td>2.45</td>
                <td>1.69</td>
                <td style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>1.79</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.5rem', fontWeight: 700 }}>12</td>
                <td>3,644,035</td>
                <td>227</td>
                <td style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>73</td>
                <td>2.78</td>
                <td>1.42</td>
                <td style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>1.24</td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem', fontWeight: 700 }}>24</td>
                <td style={{ color: 'var(--accent-rose)' }}>Time / Out</td>
                <td>39,135</td>
                <td style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>1,641</td>
                <td>—</td>
                <td>1.48</td>
                <td style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>1.26</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
