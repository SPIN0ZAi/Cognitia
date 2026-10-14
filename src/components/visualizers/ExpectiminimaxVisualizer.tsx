import React, { useState, useMemo } from 'react';
import { ToggleLeft, ToggleRight, Sparkles, Sliders } from 'lucide-react';

export const ExpectiminimaxVisualizer: React.FC = () => {
  const [useTransformedValues, setUseTransformedValues] = useState<boolean>(false);
  const [prob1, setProb1] = useState<number>(0.9); // Prob of reaching B (0.9) vs C (0.1)
  const [prob2, setProb2] = useState<number>(0.9); // Prob of reaching D (0.9) vs E (0.1)

  // Slide 56 Original vs Slide 57 Transformed Values
  // Leaf values: B=2, C=3, D=1, E=4
  // Transformed: B=20, C=30, D=1, E=400
  const leafValues = useMemo(() => {
    if (!useTransformedValues) {
      return { B: 2, C: 3, D: 1, E: 4 };
    } else {
      return { B: 20, C: 30, D: 1, E: 400 };
    }
  }, [useTransformedValues]);

  // Calculations
  const ev1 = useMemo(() => {
    return Number((prob1 * leafValues.B + (1 - prob1) * leafValues.C).toFixed(2));
  }, [prob1, leafValues]);

  const ev2 = useMemo(() => {
    return Number((prob2 * leafValues.D + (1 - prob2) * leafValues.E).toFixed(2));
  }, [prob2, leafValues]);

  const bestAction = ev1 >= ev2 ? 'a1' : 'a2';

  return (
    <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-purple font-mono" style={{ fontSize: '0.7rem' }}>
              STOCHASTIC SEARCH LABORATORY
            </span>
            <span className="badge badge-cyan font-mono" style={{ fontSize: '0.7rem' }}>
              SLIDES 55–57
            </span>
          </div>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
            Expectiminimax & "Values Matter" Theorem Explorer
          </h4>
        </div>

        {/* Transformation Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setUseTransformedValues(!useTransformedValues)}
            className={`btn-tactile btn-sm ${useTransformedValues ? 'btn-amber' : 'btn-primary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {useTransformedValues ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            <span>Scale: {useTransformedValues ? 'Slide 57 (20, 30, 1, 400)' : 'Slide 56 (2, 3, 1, 4)'}</span>
          </button>
        </div>
      </div>

      {/* SVG Stochastic Game Tree */}
      <div style={{ background: '#030712', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid #1e293b', overflowX: 'auto' }}>
        <svg viewBox="0 0 560 270" style={{ width: '100%', minWidth: '500px', height: 'auto', display: 'block' }}>
          {/* Level Markers */}
          <text x="10" y="45" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">MAX △</text>
          <text x="10" y="115" fill="#fbbf24" fontSize="11" fontWeight="bold" fontFamily="monospace">CHANCE ○</text>
          <text x="10" y="185" fill="#f43f5e" fontSize="11" fontWeight="bold" fontFamily="monospace">MIN ▽</text>
          <text x="10" y="245" fill="#a855f7" fontSize="11" fontWeight="bold" fontFamily="monospace">LEAF</text>

          {/* Root to Chance Nodes Edges */}
          <line x1="280" y1="50" x2="160" y2="110" stroke={bestAction === 'a1' ? '#38bdf8' : '#334155'} strokeWidth={bestAction === 'a1' ? 3 : 1.5} />
          <line x1="280" y1="50" x2="400" y2="110" stroke={bestAction === 'a2' ? '#38bdf8' : '#334155'} strokeWidth={bestAction === 'a2' ? 3 : 1.5} />
          <text x="210" y="75" fill="#cbd5e1" fontSize="12" fontFamily="monospace" fontWeight="bold">a1</text>
          <text x="345" y="75" fill="#cbd5e1" fontSize="12" fontFamily="monospace" fontWeight="bold">a2</text>

          {/* Chance 1 Edges */}
          <line x1="160" y1="125" x2="100" y2="180" stroke="#fbbf24" strokeWidth="1.5" />
          <line x1="160" y1="125" x2="220" y2="180" stroke="#fbbf24" strokeWidth="1.5" />
          <text x="110" y="150" fill="#fde68a" fontSize="11" fontFamily="monospace">P={prob1}</text>
          <text x="195" y="150" fill="#fde68a" fontSize="11" fontFamily="monospace">P={Number((1 - prob1).toFixed(2))}</text>

          {/* Chance 2 Edges */}
          <line x1="400" y1="125" x2="340" y2="180" stroke="#fbbf24" strokeWidth="1.5" />
          <line x1="400" y1="125" x2="460" y2="180" stroke="#fbbf24" strokeWidth="1.5" />
          <text x="350" y="150" fill="#fde68a" fontSize="11" fontFamily="monospace">P={prob2}</text>
          <text x="435" y="150" fill="#fde68a" fontSize="11" fontFamily="monospace">P={Number((1 - prob2).toFixed(2))}</text>

          {/* MIN to Leaf Edges */}
          <line x1="100" y1="195" x2="100" y2="235" stroke="#475569" strokeWidth="1.5" />
          <line x1="220" y1="195" x2="220" y2="235" stroke="#475569" strokeWidth="1.5" />
          <line x1="340" y1="195" x2="340" y2="235" stroke="#475569" strokeWidth="1.5" />
          <line x1="460" y1="195" x2="460" y2="235" stroke="#475569" strokeWidth="1.5" />

          {/* ROOT A (MAX) */}
          <g transform="translate(280, 40)">
            <polygon points="0,-16 16,14 -16,14" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            <text x="0" y="7" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">A</text>
            <text x="24" y="2" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
              EV = {Math.max(ev1, ev2)} ({bestAction.toUpperCase()})
            </text>
          </g>

          {/* CHANCE 1 */}
          <g transform="translate(160, 115)">
            <circle r="14" fill="#854d0e" stroke="#fbbf24" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">ch1</text>
            <text x="-50" y="4" textAnchor="end" fill="#fde68a" fontSize="11" fontWeight="bold" fontFamily="monospace">
              {ev1}
            </text>
          </g>

          {/* CHANCE 2 */}
          <g transform="translate(400, 115)">
            <circle r="14" fill="#854d0e" stroke="#fbbf24" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">ch2</text>
            <text x="50" y="4" textAnchor="start" fill="#fde68a" fontSize="11" fontWeight="bold" fontFamily="monospace">
              {ev2}
            </text>
          </g>

          {/* MIN NODES */}
          <g transform="translate(100, 185)">
            <polygon points="0,14 14,-12 -14,-12" fill="#be123c" stroke="#f43f5e" strokeWidth="1.5" />
            <text x="0" y="-1" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">B</text>
            <text x="-24" y="2" textAnchor="end" fill="#f43f5e" fontSize="10" fontFamily="monospace">{leafValues.B}</text>
          </g>

          <g transform="translate(220, 185)">
            <polygon points="0,14 14,-12 -14,-12" fill="#be123c" stroke="#f43f5e" strokeWidth="1.5" />
            <text x="0" y="-1" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">C</text>
            <text x="24" y="2" textAnchor="start" fill="#f43f5e" fontSize="10" fontFamily="monospace">{leafValues.C}</text>
          </g>

          <g transform="translate(340, 185)">
            <polygon points="0,14 14,-12 -14,-12" fill="#be123c" stroke="#f43f5e" strokeWidth="1.5" />
            <text x="0" y="-1" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">D</text>
            <text x="-24" y="2" textAnchor="end" fill="#f43f5e" fontSize="10" fontFamily="monospace">{leafValues.D}</text>
          </g>

          <g transform="translate(460, 185)">
            <polygon points="0,14 14,-12 -14,-12" fill="#be123c" stroke="#f43f5e" strokeWidth="1.5" />
            <text x="0" y="-1" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">E</text>
            <text x="24" y="2" textAnchor="start" fill="#f43f5e" fontSize="10" fontFamily="monospace">{leafValues.E}</text>
          </g>

          {/* LEAF NODES */}
          <g transform="translate(100, 245)">
            <rect x="-14" y="-10" width="28" height="20" rx="3" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="monospace">{leafValues.B}</text>
          </g>
          <g transform="translate(220, 245)">
            <rect x="-14" y="-10" width="28" height="20" rx="3" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="monospace">{leafValues.C}</text>
          </g>
          <g transform="translate(340, 245)">
            <rect x="-14" y="-10" width="28" height="20" rx="3" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="monospace">{leafValues.D}</text>
          </g>
          <g transform="translate(460, 245)">
            <rect x="-14" y="-10" width="28" height="20" rx="3" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="monospace">{leafValues.E}</text>
          </g>
        </svg>
      </div>

      {/* Probability Controls & Theorem Demonstration */}
      <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        {/* Sliders */}
        <div style={{ background: '#070b14', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid #1e293b' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sliders size={14} />
            <span>Chance Event Probabilities</span>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
              <span>P(B) vs P(C) under action a1:</span>
              <span className="font-mono">{prob1} / {Number((1 - prob1).toFixed(2))}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={prob1}
              onChange={(e) => setProb1(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#fbbf24' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
              <span>P(D) vs P(E) under action a2:</span>
              <span className="font-mono">{prob2} / {Number((1 - prob2).toFixed(2))}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={prob2}
              onChange={(e) => setProb2(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#fbbf24' }}
            />
          </div>
        </div>

        {/* Live Mathematical Proof Panel */}
        <div style={{ background: '#0b0f19', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid #1e293b' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={14} color={useTransformedValues ? '#f59e0b' : '#38bdf8'} />
            <span>Mathematical Proof Breakdown (Slide 57)</span>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5, fontFamily: 'monospace' }}>
            <div>ch1 = {prob1} × {leafValues.B} + {Number((1 - prob1).toFixed(2))} × {leafValues.C} = <strong>{ev1}</strong></div>
            <div>ch2 = {prob2} × {leafValues.D} + {Number((1 - prob2).toFixed(2))} × {leafValues.E} = <strong>{ev2}</strong></div>
            <div style={{ marginTop: '0.5rem', color: bestAction === 'a1' ? '#38bdf8' : '#f59e0b', fontWeight: 'bold' }}>
              Optimal Choice: MAX chooses {bestAction.toUpperCase()} (EV = {Math.max(ev1, ev2)})
            </div>
          </div>

          <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: '#94a3b8' }}>
            {useTransformedValues ? (
              <span style={{ color: '#fbbf24' }}>
                Notice: The transformation 2→20, 3→30, 1→1, 4→400 strictly preserves leaf order (1 &lt; 2 &lt; 3 &lt; 4), yet <strong>FLIPS THE BEST MOVE TO A2</strong>!
              </span>
            ) : (
              <span>
                Standard scale: Action a1 is optimal (2.1 &gt; 1.3). Click "Scale Toggle" above to see the move flip!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
