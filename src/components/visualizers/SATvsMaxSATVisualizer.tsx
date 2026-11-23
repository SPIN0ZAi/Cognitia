import React, { useState } from 'react';
import { CheckCircle2, XCircle, Layers } from 'lucide-react';

interface Clause {
  id: number;
  formulaText: string;
  evaluate: (vals: Record<string, boolean>) => boolean;
}

export const SATvsMaxSATVisualizer: React.FC = () => {
  // Variables x1 to x5
  const [vars, setVars] = useState<Record<string, boolean>>({
    x1: true,
    x2: true,
    x3: false,
    x4: false,
    x5: false,
  });

  // Slide 24 CNF Formula:
  // C1: (~x2 v x1)
  // C2: (~x1 v ~x2 v ~x3)
  // C3: (x1 v x2)
  // C4: (~x4 v x3)
  // C5: (~x5 v x3)
  const clauses: Clause[] = [
    {
      id: 1,
      formulaText: '(¬x2 ∨ x1)',
      evaluate: (v) => !v.x2 || v.x1,
    },
    {
      id: 2,
      formulaText: '(¬x1 ∨ ¬x2 ∨ ¬x3)',
      evaluate: (v) => !v.x1 || !v.x2 || !v.x3,
    },
    {
      id: 3,
      formulaText: '(x1 ∨ x2)',
      evaluate: (v) => v.x1 || v.x2,
    },
    {
      id: 4,
      formulaText: '(¬x4 ∨ x3)',
      evaluate: (v) => !v.x4 || v.x3,
    },
    {
      id: 5,
      formulaText: '(¬x5 ∨ x3)',
      evaluate: (v) => !v.x5 || v.x3,
    },
  ];

  const clauseResults = clauses.map((c) => ({
    ...c,
    satisfied: c.evaluate(vars),
  }));

  const satisfiedCount = clauseResults.filter((c) => c.satisfied).length;
  const isSatisfiable = satisfiedCount === clauses.length;

  const toggleVar = (name: string) => {
    setVars((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="card" style={{ padding: '1.75rem', border: '1px solid var(--lab-border-active)' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
        <Layers size={22} color="var(--lab-accent-cyan)" />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-cyan font-mono">LABORATORY 6.1</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Slides 24–27 · 3-CNF Formula</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.2rem' }}>
            Boolean Satisfiability: SAT (Flat) vs. Max-SAT (Guidance Gradient)
          </h3>
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
        Experiment with variable assignments to see why standard SAT acts as a flat step-function (0 or 1), while Max-SAT produces a gradual objective score that guides search algorithms toward the satisfying assignment.
      </p>

      {/* Variable Toggle Bank */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          padding: '1.25rem',
          background: 'var(--lab-bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--lab-border-subtle)',
          marginBottom: '1.5rem',
        }}
      >
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', marginRight: '0.5rem' }}>
          Assign Truth Values:
        </span>
        {['x1', 'x2', 'x3', 'x4', 'x5'].map((vName) => {
          const val = vars[vName];
          return (
            <button
              key={vName}
              onClick={() => toggleVar(vName)}
              className={`btn-tactile btn-sm ${val ? 'btn-primary' : ''}`}
              style={{ minWidth: '75px', display: 'flex', justifyContent: 'space-between' }}
            >
              <span>{vName}:</span>
              <strong>{val ? 'TRUE (1)' : 'FALSE (0)'}</strong>
            </button>
          );
        })}
      </div>

      {/* Clauses Checklist */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Formula Clauses (Conjunctive Normal Form - CNF):
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {clauseResults.map((c) => (
            <div
              key={c.id}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                background: c.satisfied ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${c.satisfied ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)', marginRight: '0.4rem' }}>C{c.id}:</span>
                <strong>{c.formulaText}</strong>
              </div>
              {c.satisfied ? (
                <CheckCircle2 size={16} color="var(--accent-emerald)" />
              ) : (
                <XCircle size={16} color="var(--accent-rose)" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Evaluation Function Comparison Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Flat SAT Evaluation */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            background: 'var(--lab-bg-surface)',
            border: isSatisfiable ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            STANDARD SAT (Binary Evaluation)
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: isSatisfiable ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
              {isSatisfiable ? '1 (TRUE)' : '0 (FALSE)'}
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            {isSatisfiable
              ? 'All 5 clauses are satisfied! Formula evaluates to 1.'
              : `Only ${satisfiedCount} of 5 clauses satisfied. In standard SAT, satisfying 4 clauses yields 0—identical to satisfying 0 clauses! There is no guidance signal.`}
          </p>
        </div>

        {/* Gradual Max-SAT Evaluation */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            background: 'var(--lab-bg-surface)',
            border: '1px solid var(--lab-accent-cyan)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Max-SAT (Gradual Objective Function)
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--lab-accent-cyan)' }}>
              f(c) = {satisfiedCount} / 5
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>clauses satisfied</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Max-SAT counts the exact number of satisfied clauses. Flipping a variable that increases score from 3 to 4 produces a positive gradient that hill-climbing algorithms can immediately detect and follow!
          </p>
        </div>
      </div>
    </div>
  );
};
