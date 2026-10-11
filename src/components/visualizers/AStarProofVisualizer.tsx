import { useState } from 'react';
import { ChevronRight, RotateCcw, ShieldCheck } from 'lucide-react';

const PROOF_STEPS = [
  {
    step: 1,
    title: 'Definitions & Assumptions',
    math: 'g(G) = C^* \\quad \\text{and} \\quad g(G_{SO}) > C^*',
    explanation:
      'Let G be an optimal goal state with true minimum path cost C*. Let G_SO be any suboptimal goal state generated during the search, whose cost is strictly greater: g(G_SO) > C*.',
  },
  {
    step: 2,
    title: 'Goal Heuristic Values',
    math: 'h(G) = 0 \\quad \\text{and} \\quad h(G_{SO}) = 0',
    explanation:
      'By the fundamental definition of heuristic functions (Slide 10), the remaining estimated cost from any goal state to itself must be exactly zero.',
  },
  {
    step: 3,
    title: 'Evaluation of Suboptimal Goal',
    math: 'f(G_{SO}) = g(G_{SO}) + h(G_{SO}) = g(G_{SO}) > C^*',
    explanation:
      'Because h(G_SO) = 0, the evaluation function of the suboptimal goal is simply its true cost, which is strictly greater than C*.',
  },
  {
    step: 4,
    title: 'Existence of Frontier Node n on Optimal Path',
    math: 'n \\in \\text{Frontier on path to } G',
    explanation:
      'Since optimal goal G has not yet been selected, there must exist at least one unexpanded node n currently in the frontier that lies along the optimal path to G.',
  },
  {
    step: 5,
    title: 'Applying Admissibility of h(n)',
    math: 'f(n) = g(n) + h(n) \\le g(n) + h^*(n) = C^*',
    explanation:
      'Because h(n) is admissible (optimistic), h(n) <= h*(n). Therefore, f(n) <= C*. The total estimated cost through node n cannot exceed the optimal cost C*!',
  },
  {
    step: 6,
    title: 'Combining the Inequalities',
    math: 'f(n) \\le C^* < f(G_{SO}) \\implies \\mathbf{f(n) < f(G_{SO})}',
    explanation:
      'Because f(n) <= C* and C* < f(G_SO), we establish that f(n) is strictly less than f(G_SO).',
  },
  {
    step: 7,
    title: 'Conclusion: Optimality of A* Tree-Search',
    math: '\\text{A* expands } n \\text{ before } G_{SO} \\implies \\text{Optimal Goal } G \\text{ is returned first. } \\blacksquare',
    explanation:
      'A* always extracts the frontier node with the minimum f-value. Therefore, node n will always be selected for expansion before G_SO can ever be extracted. This holds for every node on the path to G, including G itself. Hence, A* tree search never returns a suboptimal goal!',
  },
];

export const AStarProofVisualizer: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <ShieldCheck size={19} className="text-emerald-400" />
            Interactive Mathematical Proof: Optimality of $A^*$ Tree-Search (Lesson 3, Slide 37)
          </div>
          <div className="visualizer-subtitle">
            Step-by-Step Formal Deductive Verification with State Space Branch Diagrams
          </div>
        </div>

        <div className="visualizer-controls">
          <button
            onClick={() => setCurrentStep((prev) => Math.min(prev + 1, PROOF_STEPS.length))}
            disabled={currentStep === PROOF_STEPS.length}
            className="btn-tactile btn-primary"
          >
            <ChevronRight size={14} />
            Next Proof Step ({currentStep}/{PROOF_STEPS.length})
          </button>
          <button onClick={() => setCurrentStep(1)} className="btn-tactile">
            <RotateCcw size={14} />
            Restart Proof
          </button>
        </div>
      </div>

      <div className="visualizer-body">
        {/* Visual Proof Stepper Progress */}
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            marginBottom: '1.5rem',
          }}
        >
          {PROOF_STEPS.map((s) => (
            <div
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              style={{
                flex: 1,
                height: '6px',
                borderRadius: '3px',
                background: s.step <= currentStep ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.1)',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
            />
          ))}
        </div>

        {/* Display Current Active Step */}
        <div className="grid-2" style={{ alignItems: 'center' }}>
          {/* Conceptual Tree Diagram from Slide 37 */}
          <div
            style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              textAlign: 'center',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <svg viewBox="0 0 300 240" style={{ width: '100%', maxHeight: '200px' }}>
              {/* Start root */}
              <circle cx="150" cy="30" r="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
              <text x="150" y="34" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">
                Start
              </text>

              {/* Path to n and G */}
              <line x1="140" y1="45" x2="80" y2="110" stroke="#06b6d4" strokeWidth="2" strokeDasharray="3 3" />
              <circle
                cx="80"
                cy="110"
                r="16"
                fill={currentStep >= 4 ? '#0284c7' : '#1e293b'}
                stroke="#38bdf8"
                strokeWidth="2"
              />
              <text x="80" y="114" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">
                n
              </text>

              <line x1="80" y1="126" x2="60" y2="190" stroke="#06b6d4" strokeWidth="2" strokeDasharray="3 3" />
              <circle
                cx="60"
                cy="190"
                r="16"
                fill={currentStep === 7 ? '#059669' : '#1e293b'}
                stroke="#34d399"
                strokeWidth="2"
              />
              <text x="60" y="194" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">
                G
              </text>
              <text x="60" y="220" textAnchor="middle" fill="#34d399" fontSize="10" fontFamily="var(--font-mono)">
                C* (Optimal)
              </text>

              {/* Suboptimal path to G_SO */}
              <line x1="160" y1="45" x2="220" y2="190" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 3" />
              <circle
                cx="220"
                cy="190"
                r="16"
                fill="#4c0519"
                stroke="#fb7185"
                strokeWidth="2"
              />
              <text x="220" y="194" textAnchor="middle" fill="#fb7185" fontSize="11" fontWeight="700">
                G_SO
              </text>
              <text x="220" y="220" textAnchor="middle" fill="#fb7185" fontSize="10" fontFamily="var(--font-mono)">
                &gt; C* (Suboptimal)
              </text>
            </svg>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Branch diagram reproduced exactly from UCLM Lesson 3 Slide 37
            </div>
          </div>

          {/* Step Proof Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="badge badge-emerald font-mono">Step {currentStep} of {PROOF_STEPS.length}</span>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                {PROOF_STEPS[currentStep - 1].title}
              </span>
            </div>

            <div
              className="math-block"
              style={{
                fontSize: '1.05rem',
                color: 'var(--text-highlight)',
                textAlign: 'center',
                padding: '0.85rem',
                background: 'rgba(0,0,0,0.4)',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}
            >
              {PROOF_STEPS[currentStep - 1].math}
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {PROOF_STEPS[currentStep - 1].explanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
