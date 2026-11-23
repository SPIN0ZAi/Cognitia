import React, { useState } from 'react';
import {
  Calculator,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';

export const ValueIterationStepSolver: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [userU1_s0, setUserU1_s0] = useState<string>('');
  const [userU1_s1, setUserU1_s1] = useState<string>('');
  const [userU2_s0, setUserU2_s0] = useState<string>('');
  const [userU2_s1, setUserU2_s1] = useState<string>('');

  const [hintLevel, setHintLevel] = useState<number>(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  // Exact solutions:
  // Iteration 1:
  // safe: -1 + 0.9 * (1 * 0) = -1
  // risky: -1 + 0.9 * (0.6 * 10 + 0.4 * 0) = -1 + 0.9 * 6 = -1 + 5.4 = 4.4
  // U1(s0) = 4.4, policy: risky
  // finish: -1 + 0.9 * (0.8 * 10 + 0.2 * 0) = -1 + 0.9 * 8 = -1 + 7.2 = 6.2
  // return: -1 + 0.9 * (1 * 0) = -1
  // U1(s1) = 6.2, policy: finish

  // Iteration 2:
  // safe: -1 + 0.9 * (1 * 6.2) = -1 + 5.58 = 4.58
  // risky: -1 + 0.9 * (0.6 * 10 + 0.4 * 4.4) = -1 + 0.9 * (6 + 1.76) = -1 + 0.9 * 7.76 = -1 + 6.984 = 5.984
  // U2(s0) = 5.984, policy: risky
  // finish: -1 + 0.9 * (0.8 * 10 + 0.2 * 4.4) = -1 + 0.9 * (8 + 0.88) = -1 + 0.9 * 8.88 = -1 + 7.992 = 6.992
  // return: -1 + 0.9 * (1 * 4.4) = -1 + 3.96 = 2.96
  // U2(s1) = 6.992, policy: finish

  const checkIteration1 = () => {
    const s0Val = parseFloat(userU1_s0);
    const s1Val = parseFloat(userU1_s1);

    const ok0 = Math.abs(s0Val - 4.4) < 0.05;
    const ok1 = Math.abs(s1Val - 6.2) < 0.05;

    if (ok0 && ok1) {
      setIsSuccess(true);
      setFeedback('Iteration 1 calculations are completely correct! You can now proceed to Iteration 2.');
      setCurrentStep(2);
    } else {
      setIsSuccess(false);
      setFeedback(
        `Calculation error in Iteration 1. Hint: Remember that U0(s0)=0, U0(s1)=0, and U0(G)=10. For s0 risky: -1 + 0.9 · (0.6 · 10 + 0.4 · 0) = 4.4.`
      );
    }
  };

  const checkIteration2 = () => {
    const s0Val = parseFloat(userU2_s0);
    const s1Val = parseFloat(userU2_s1);

    const ok0 = Math.abs(s0Val - 5.984) < 0.05;
    const ok1 = Math.abs(s1Val - 6.992) < 0.05;

    if (ok0 && ok1) {
      setIsSuccess(true);
      setFeedback('Mastery achieved! You accurately calculated both Value Iteration steps with precision.');
    } else {
      setIsSuccess(false);
      setFeedback(
        `Calculation error in Iteration 2. Hint: Use U1(s0)=4.4 and U1(s1)=6.2. For s0 risky: -1 + 0.9 · (0.6 · 10 + 0.4 · 4.4) = 5.984.`
      );
    }
  };

  const progressiveHints = [
    'Hint 1: Write out the two candidate action values for each state before applying the max operator.',
    'Hint 2: For action "risky" at s0: U1(s0) = -1 + 0.9 * [ 0.6 * U0(G) + 0.4 * U0(s0) ]. Since U0(G)=10, 0.6*10 = 6.',
    'Hint 3: Full Iteration 1 solutions: U1(s0) = 4.4 (via risky), U1(s1) = 6.2 (via finish). For Iteration 2, substitute U1 values back into the expectation sum.',
  ];

  return (
    <div className="card" style={{ padding: '1.75rem', border: '1px solid var(--lab-border-active)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
        <Calculator size={22} color="var(--lab-accent-cyan)" />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-cyan font-mono">OFFICIAL EXAM EXERCISE</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Slide 80 · Proposed Exercise 1</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.2rem' }}>
            Value Iteration Step-by-Step Solver: 2-State MDP
          </h3>
        </div>
      </div>

      {/* Problem Specification */}
      <div
        style={{
          background: 'var(--lab-bg-surface)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.82rem',
          marginBottom: '1.5rem',
          lineHeight: '1.5',
        }}
      >
        <div>
          <strong>Environment Data:</strong> Non-terminal states S = &#123;s_0, s_1&#125;, terminal state F = &#123;G&#125;.
          All action rewards R(s, a) = -1, terminal reward R(G) = 10, discount factor &gamma; = 0.9.
        </div>
        <div style={{ marginTop: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <strong style={{ color: 'var(--lab-accent-cyan)' }}>Transitions from s0:</strong>
            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.2rem' }}>
              <li><code>safe</code>: T(s_0, safe, s_1) = 1.0</li>
              <li><code>risky</code>: T(s_0, risky, G) = 0.6, T(s_0, risky, s_0) = 0.4</li>
            </ul>
          </div>
          <div>
            <strong style={{ color: 'var(--lab-accent-lime)' }}>Transitions from s1:</strong>
            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.2rem' }}>
              <li><code>finish</code>: T(s_1, finish, G) = 0.8, T(s_1, finish, s_0) = 0.2</li>
              <li><code>return</code>: T(s_1, return, s_0) = 1.0</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Step by Step Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Step 1 Input Card */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            background: currentStep === 1 ? 'rgba(120, 213, 232, 0.05)' : 'var(--lab-bg-surface)',
            border: currentStep === 1 ? '1px solid var(--lab-accent-cyan)' : '1px solid var(--border-subtle)',
          }}
        >
          <strong style={{ fontSize: '0.9rem', color: 'var(--lab-accent-cyan)' }}>Step 1: Calculate U1(s0) and U1(s1)</strong>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.4rem 0 0.8rem 0' }}>
            Initial values: $U_0(s_0)=0, U_0(s_1)=0, U_0(G)=10$.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>U1(s0):</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 4.4"
                value={userU1_s0}
                onChange={(e) => setUserU1_s0(e.target.value)}
                className="input-field"
                style={{ width: '100%', padding: '0.4rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>U1(s1):</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 6.2"
                value={userU1_s1}
                onChange={(e) => setUserU1_s1(e.target.value)}
                className="input-field"
                style={{ width: '100%', padding: '0.4rem' }}
              />
            </div>
          </div>

          <button onClick={checkIteration1} className="btn-tactile btn-sm btn-primary">
            Verify Iteration 1
          </button>
        </div>

        {/* Step 2 Input Card */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            background: currentStep === 2 ? 'rgba(198, 242, 119, 0.05)' : 'var(--lab-bg-surface)',
            border: currentStep === 2 ? '1px solid var(--lab-accent-lime)' : '1px solid var(--border-subtle)',
            opacity: currentStep === 1 ? 0.6 : 1,
          }}
        >
          <strong style={{ fontSize: '0.9rem', color: 'var(--lab-accent-lime)' }}>Step 2: Calculate U2(s0) and U2(s1)</strong>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.4rem 0 0.8rem 0' }}>
            Substitute converged $U_1$ values into Bellman equations.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>U2(s0):</label>
              <input
                type="number"
                step="0.001"
                disabled={currentStep < 2}
                placeholder="e.g. 5.984"
                value={userU2_s0}
                onChange={(e) => setUserU2_s0(e.target.value)}
                className="input-field"
                style={{ width: '100%', padding: '0.4rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>U2(s1):</label>
              <input
                type="number"
                step="0.001"
                disabled={currentStep < 2}
                placeholder="e.g. 6.992"
                value={userU2_s1}
                onChange={(e) => setUserU2_s1(e.target.value)}
                className="input-field"
                style={{ width: '100%', padding: '0.4rem' }}
              />
            </div>
          </div>

          <button onClick={checkIteration2} disabled={currentStep < 2} className="btn-tactile btn-sm btn-emerald">
            Verify Iteration 2
          </button>
        </div>
      </div>

      {/* Progressive Hints & Feedback */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <button
          onClick={() => setHintLevel((h) => Math.min(progressiveHints.length, h + 1))}
          className="btn-tactile btn-xs"
        >
          <HelpCircle size={13} />
          <span>Need a hint? ({hintLevel}/{progressiveHints.length})</span>
        </button>
      </div>

      {hintLevel > 0 && (
        <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {progressiveHints.slice(0, hintLevel).map((hint, idx) => (
            <div
              key={idx}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                background: 'rgba(233, 183, 119, 0.1)',
                border: '1px solid rgba(233, 183, 119, 0.3)',
                fontSize: '0.78rem',
                color: 'var(--lab-accent-amber)',
              }}
            >
              {hint}
            </div>
          ))}
        </div>
      )}

      {feedback && (
        <div
          style={{
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            background: isSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${isSuccess ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {isSuccess ? <CheckCircle2 size={16} color="var(--accent-emerald)" /> : <XCircle size={16} color="var(--accent-rose)" />}
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
};
