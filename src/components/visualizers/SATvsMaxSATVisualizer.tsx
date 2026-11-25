import React, { useState, useMemo } from 'react';
import {
  Layers,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Flame,
  Zap
} from 'lucide-react';

interface Clause {
  id: number;
  literals: { varName: string; negated: boolean }[];
  formulaText: string;
}

export const SATvsMaxSATVisualizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clause-board' | 'phase-transition' | 'landscape'>('clause-board');

  // Slide 24 Benchmark CNF Formula:
  // C1: (¬x2 ∨ x1)
  // C2: (¬x1 ∨ ¬x2 ∨ ¬x3)
  // C3: (x1 ∨ x2)
  // C4: (¬x4 ∨ x3)
  // C5: (¬x5 ∨ x3)
  const defaultClauses: Clause[] = useMemo(
    () => [
      {
        id: 1,
        formulaText: '(¬x₂ ∨ x₁)',
        literals: [
          { varName: 'x2', negated: true },
          { varName: 'x1', negated: false }
        ]
      },
      {
        id: 2,
        formulaText: '(¬x₁ ∨ ¬x₂ ∨ ¬x₃)',
        literals: [
          { varName: 'x1', negated: true },
          { varName: 'x2', negated: true },
          { varName: 'x3', negated: true }
        ]
      },
      {
        id: 3,
        formulaText: '(x₁ ∨ x₂)',
        literals: [
          { varName: 'x1', negated: false },
          { varName: 'x2', negated: false }
        ]
      },
      {
        id: 4,
        formulaText: '(¬x₄ ∨ x₃)',
        literals: [
          { varName: 'x4', negated: true },
          { varName: 'x3', negated: false }
        ]
      },
      {
        id: 5,
        formulaText: '(¬x₅ ∨ x₃)',
        literals: [
          { varName: 'x5', negated: true },
          { varName: 'x3', negated: false }
        ]
      }
    ],
    []
  );

  // Variable truth values (5 variables: x1, x2, x3, x4, x5)
  const [vars, setVars] = useState<Record<string, boolean>>({
    x1: true,
    x2: true,
    x3: false,
    x4: false,
    x5: false
  });

  // Evaluate literals and clauses
  const evaluateClause = (clause: Clause, currentVars: Record<string, boolean>): boolean => {
    return clause.literals.some((lit) => {
      const val = currentVars[lit.varName];
      return lit.negated ? !val : val;
    });
  };

  const clauseEvaluations = useMemo(() => {
    return defaultClauses.map((c) => ({
      ...c,
      satisfied: evaluateClause(c, vars)
    }));
  }, [defaultClauses, vars]);

  const satisfiedCount = clauseEvaluations.filter((c) => c.satisfied).length;
  const isSatisfiable = satisfiedCount === defaultClauses.length;

  const toggleVar = (name: string) => {
    setVars((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const randomizeVars = () => {
    setVars({
      x1: Math.random() > 0.5,
      x2: Math.random() > 0.5,
      x3: Math.random() > 0.5,
      x4: Math.random() > 0.5,
      x5: Math.random() > 0.5
    });
  };

  // ==========================================
  // PHASE TRANSITION ENGINE (UCLM Slide 28)
  // ==========================================
  // Parameter alpha = m / n (Clauses / Variables)
  const [alphaRatio, setAlphaRatio] = useState<number>(4.26);

  // Compute empirical probability of satisfiability and median search cost
  const { pSat, searchCost, phaseZone } = useMemo(() => {
    // Sigmoidal approximation of 3-SAT satisfiability transition centered at alpha=4.26
    const k = 3.5;
    const p = 1.0 / (1.0 + Math.exp(k * (alphaRatio - 4.26)));

    // Difficulty curve peaks at the transition point alpha = 4.26
    const cost = Math.round(15 + 450 * Math.exp(-Math.pow(alphaRatio - 4.26, 2) / 0.55));

    let zone: 'EASY_SAT' | 'CRITICAL_PHASE' | 'EASY_UNSAT';
    if (alphaRatio < 3.6) zone = 'EASY_SAT';
    else if (alphaRatio > 5.0) zone = 'EASY_UNSAT';
    else zone = 'CRITICAL_PHASE';

    return {
      pSat: Math.round(p * 100),
      searchCost: cost,
      phaseZone: zone
    };
  }, [alphaRatio]);

  return (
    <div className="visualizer-container">
      {/* Header */}
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Layers size={20} style={{ color: 'var(--lab-accent-cyan)' }} />
            Boolean Satisfiability Laboratory: SAT vs Max-SAT & Phase Transition
          </div>
          <div className="visualizer-subtitle">
            Flat 0/1 Step Function vs Search Gradient & The α = 4.26 Critical Complexity Spire (UCLM Slides 24–28)
          </div>
        </div>

        <div className="visualizer-controls">
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setActiveTab('clause-board')}
              className={`btn-tactile btn-sm ${activeTab === 'clause-board' ? 'btn-primary' : ''}`}
            >
              <Zap size={14} />
              <span>Clause Truth Board</span>
            </button>
            <button
              onClick={() => setActiveTab('landscape')}
              className={`btn-tactile btn-sm ${activeTab === 'landscape' ? 'btn-amber' : ''}`}
            >
              <TrendingUp size={14} />
              <span>Gradient vs Flat</span>
            </button>
            <button
              onClick={() => setActiveTab('phase-transition')}
              className={`btn-tactile btn-sm ${activeTab === 'phase-transition' ? 'btn-rose' : ''}`}
            >
              <Flame size={14} />
              <span>Phase Transition ($\alpha=4.26$)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="visualizer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* ========================================================================= */}
        {/* TAB 1: CLAUSE TRUTH BOARD */}
        {/* ========================================================================= */}
        {activeTab === 'clause-board' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Variable Switches Bank */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: 'var(--lab-bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--lab-border-subtle)',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Truth Value Switches ($x_1 \dots x_5$):
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {Object.entries(vars).map(([name, val]) => (
                    <button
                      key={name}
                      onClick={() => toggleVar(name)}
                      className={`btn-tactile btn-xs ${val ? 'btn-emerald' : 'btn-rose'}`}
                      style={{
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.78rem',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>{name}</span>
                      <span>=</span>
                      <span>{val ? 'T' : 'F'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={randomizeVars} className="btn-tactile btn-xs">
                  Randomize Assignment
                </button>
                <button
                  onClick={() => setVars({ x1: true, x2: false, x3: true, x4: false, x5: false })}
                  className="btn-tactile btn-xs btn-primary"
                >
                  Load Satisfying Preset
                </button>
              </div>
            </div>

            {/* Score Telemetry Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem'
              }}
            >
              {/* Standard SAT Decision Card */}
              <div
                className="card"
                style={{
                  padding: '1.25rem',
                  background: isSatisfiable ? 'rgba(198, 242, 119, 0.06)' : 'rgba(251, 113, 133, 0.06)',
                  border: `1px solid ${isSatisfiable ? 'var(--lab-accent-lime)' : '#fb7185'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    STANDARD SAT (Decision Problem)
                  </span>
                  <span className={`badge ${isSatisfiable ? 'badge-lime' : 'badge-rose'} font-mono`}>
                    OUTPUT: {isSatisfiable ? '1 (TRUE)' : '0 (FALSE)'}
                  </span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isSatisfiable ? 'var(--lab-accent-lime)' : '#fb7185' }}>
                  {isSatisfiable ? 'FORMULA SATISFIED' : 'UNSATISFIED'}
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.4rem', margin: 0 }}>
                  A flat step function: yields 0 guidance until all 5 clauses simultaneously evaluate to True.
                </p>
              </div>

              {/* Max-SAT Optimization Card */}
              <div
                className="card"
                style={{
                  padding: '1.25rem',
                  background: 'rgba(56, 189, 248, 0.05)',
                  border: '1px solid var(--lab-accent-cyan)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    MAX-SAT (Optimization Problem)
                  </span>
                  <span className="badge badge-cyan font-mono">
                    OBJECTIVE: {satisfiedCount} / {defaultClauses.length}
                  </span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--lab-accent-cyan)' }}>
                  f(x) = {satisfiedCount} Clauses Satisfied
                </div>
                {/* Progress Bar */}
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '0.6rem', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(satisfiedCount / defaultClauses.length) * 100}%`,
                      height: '100%',
                      background: isSatisfiable ? 'var(--lab-accent-lime)' : 'var(--lab-accent-cyan)',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.5rem', margin: 0 }}>
                  Provides a quantitative guidance gradient: local search can ascend from 3 to 4 to 5 satisfied clauses!
                </p>
              </div>
            </div>

            {/* Clauses Interactive Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '0.75rem'
              }}
            >
              {clauseEvaluations.map((clause) => (
                <div
                  key={clause.id}
                  style={{
                    padding: '0.9rem',
                    borderRadius: '8px',
                    background: clause.satisfied ? 'rgba(198, 242, 119, 0.04)' : 'rgba(251, 113, 133, 0.05)',
                    border: `1px solid ${clause.satisfied ? 'rgba(198, 242, 119, 0.3)' : 'rgba(251, 113, 133, 0.3)'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="font-mono text-xs text-muted" style={{ fontWeight: 'bold' }}>
                        C{clause.id}
                      </span>
                      <strong style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: '#f8fafc' }}>
                        {clause.formulaText}
                      </strong>
                    </div>

                    {/* Breakdown of individual literals */}
                    <div style={{ display: 'flex', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {clause.literals.map((lit, i) => {
                        const rawVal = vars[lit.varName];
                        const litVal = lit.negated ? !rawVal : rawVal;
                        return (
                          <span
                            key={i}
                            style={{
                              fontFamily: 'monospace',
                              color: litVal ? 'var(--lab-accent-lime)' : '#fb7185'
                            }}
                          >
                            {lit.negated ? `¬${lit.varName}` : lit.varName}={litVal ? 'T' : 'F'}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    {clause.satisfied ? (
                      <span className="badge badge-lime font-mono" style={{ fontSize: '0.7rem' }}>
                        <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '3px' }} />
                        SAT
                      </span>
                    ) : (
                      <span className="badge badge-rose font-mono" style={{ fontSize: '0.7rem' }}>
                        <XCircle size={12} style={{ display: 'inline', marginRight: '3px' }} />
                        VIOLATED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SEARCH GRADIENT COMPARISON */}
        {/* ========================================================================= */}
        {activeTab === 'landscape' && (
          <div className="card" style={{ padding: '1.25rem', background: 'var(--lab-bg-surface)' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Why Local Search Requires Max-SAT Over Standard SAT (UCLM Slides 26–27)
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              In standard SAT, every non-satisfying configuration has identical cost (0 or False). A local search agent standing at an assignment with 4 satisfied clauses has <strong>no idea</strong> that it is closer to the solution than an assignment with only 1 satisfied clause. By formulating the problem as Max-SAT ($f(x) = \sum C_i(x)$), every flip that satisfies an extra clause increases fitness by $+1$, creating an exploitable search gradient.
            </p>

            {/* Visual Step Function vs Gradient Curve SVG */}
            <div style={{ width: '100%', height: '200px', background: 'var(--lab-bg-obsidian)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-medium)' }}>
              <svg viewBox="0 0 700 180" style={{ width: '100%', height: '100%' }}>
                {/* Axes */}
                <line x1="50" y1="140" x2="650" y2="140" stroke="rgba(255,255,255,0.2)" />
                <line x1="50" y1="20" x2="50" y2="140" stroke="rgba(255,255,255,0.2)" />

                {/* SAT Curve (Flat step function) */}
                <path
                  d="M 60 135 L 550 135 L 550 35 L 640 35"
                  fill="none"
                  stroke="#fb7185"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />
                <text x="320" y="125" fill="#fb7185" fontSize="10" fontFamily="monospace">
                  Standard SAT: Flat landscape (Zero gradient)
                </text>

                {/* Max-SAT Curve (Climbable Slope) */}
                <path
                  d="M 60 135 L 180 115 L 300 95 L 420 70 L 550 45 L 640 35"
                  fill="none"
                  stroke="var(--lab-accent-cyan)"
                  strokeWidth="3"
                />
                <text x="380" y="60" fill="var(--lab-accent-cyan)" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  Max-SAT: Climbable Guidance Gradient f(x)
                </text>

                {/* Optimum Point */}
                <circle cx="640" cy="35" r="5" fill="var(--lab-accent-lime)" />
                <text x="640" y="22" fill="var(--lab-accent-lime)" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  Satisfying Model
                </text>
              </svg>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: THE PHASE TRANSITION (Slide 28) */}
        {/* ========================================================================= */}
        {activeTab === 'phase-transition' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                padding: '1rem',
                background: 'var(--lab-bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--lab-border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.2rem' }}>
                  Clause-to-Variable Ratio: α = m / n
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Drag slider to observe the phase change and the exponential difficulty spike.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="0.1"
                  value={alphaRatio}
                  onChange={(e) => setAlphaRatio(parseFloat(e.target.value))}
                  style={{ width: '180px', accentColor: 'var(--lab-accent-rose)' }}
                />
                <span className="font-mono text-base text-rose-400" style={{ fontWeight: 'bold', minWidth: '60px' }}>
                  $\alpha$ = {alphaRatio.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Phase Telemetry Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="card" style={{ padding: '1rem', background: 'var(--lab-bg-surface)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>PROBABILITY OF SATISFIABILITY</div>
                <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: pSat > 50 ? 'var(--lab-accent-lime)' : '#fb7185' }}>
                  {pSat}%
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {pSat > 80 ? 'Almost all formulas satisfiable' : pSat < 20 ? 'Almost all unsatisfiable' : 'Critical boundary'}
                </span>
              </div>

              <div className="card" style={{ padding: '1rem', background: 'var(--lab-bg-surface)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>MEDIAN SEARCH COST / STEPS</div>
                <div className="font-mono text-amber-400" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                  ~{searchCost} steps
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {searchCost > 300 ? 'Exponential difficulty barrier!' : 'Rapid solver convergence'}
                </span>
              </div>

              <div className="card" style={{ padding: '1rem', background: 'var(--lab-bg-surface)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>REGIME CLASSIFICATION</div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: phaseZone === 'CRITICAL_PHASE' ? '#fb7185' : 'var(--lab-accent-cyan)'
                  }}
                >
                  {phaseZone === 'CRITICAL_PHASE' ? 'CRITICAL PHASE (HARDEST)' : phaseZone === 'EASY_SAT' ? 'UNDER-CONSTRAINED (EASY)' : 'OVER-CONSTRAINED (EASY)'}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  UCLM Slide 28 benchmark
                </span>
              </div>
            </div>

            {/* SVG Phase Transition Chart */}
            <div style={{ width: '100%', height: '220px', background: 'var(--lab-bg-obsidian)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-medium)' }}>
              <svg viewBox="0 0 700 200" style={{ width: '100%', height: '100%' }}>
                {/* Vertical Critical Line at alpha = 4.26 */}
                {/* 4.26 maps to: 50 + ((4.26 - 1) / 7) * 600 = 50 + (3.26 / 7) * 600 = 50 + 279.4 = 329.4 */}
                <line x1="329" y1="20" x2="329" y2="160" stroke="#fb7185" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="329" y="16" fill="#fb7185" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                  Critical Threshold α ≈ 4.26
                </text>

                {/* S-Curve for Satisfiability Probability */}
                <path
                  d="M 50 40 C 220 40, 290 40, 329 100 C 370 160, 440 160, 650 160"
                  fill="none"
                  stroke="var(--lab-accent-cyan)"
                  strokeWidth="2.5"
                />
                <text x="140" y="55" fill="var(--lab-accent-cyan)" fontSize="9.5" fontFamily="monospace">
                  P(Satisfiable)
                </text>

                {/* Difficulty Bell Curve (Search Cost) */}
                <path
                  d="M 50 155 Q 240 155, 329 35 Q 420 155, 650 155"
                  fill="none"
                  stroke="var(--lab-accent-amber)"
                  strokeWidth="2.5"
                />
                <text x="440" y="115" fill="var(--lab-accent-amber)" fontSize="9.5" fontFamily="monospace">
                  Search Cost Spire (Exponential Peak)
                </text>

                {/* Current Alpha Marker */}
                {(() => {
                  const markerX = 50 + ((alphaRatio - 1.0) / 7.0) * 600;
                  return (
                    <g>
                      <line x1={markerX} y1="25" x2={markerX} y2="165" stroke="#ffffff" strokeWidth="2" />
                      <circle cx={markerX} cy="95" r="5" fill="#ffffff" />
                    </g>
                  );
                })()}

                {/* Axis Labels */}
                <text x="50" y="180" fill="var(--text-muted)" fontSize="9" fontFamily="monospace">α = 1.0</text>
                <text x="329" y="180" fill="#fb7185" fontSize="9" textAnchor="middle" fontFamily="monospace">α = 4.26</text>
                <text x="650" y="180" fill="var(--text-muted)" fontSize="9" textAnchor="end" fontFamily="monospace">α = 8.0</text>
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
