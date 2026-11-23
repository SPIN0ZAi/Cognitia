import React, { useState } from 'react';
import {
  Coins,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

export const TwoStageBettingMDPVisualizer: React.FC = () => {
  // Probability data from official exam slide
  const p1H = 0.70;
  const p1T = 0.30;
  const p2H = 0.15;
  const p2T = 0.85;

  // Rewards from official exam problem
  const stepCost = -5;
  const rF2 = 70;   // 2 bets ok
  const rF1 = 20;   // 1 bet ok, 1 wrong
  const rF0 = -100; // 2 bets wrong

  // Interactive student calculations
  const [calcU1_sc, setCalcU1_sc] = useState<string>('');
  const [calcU1_sw, setCalcU1_sw] = useState<string>('');
  const [calcU2_s0, setCalcU2_s0] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Exact optimal Bellman computations (from handwritten exam sheet)
  // For coin 2 at sc:
  // If bet H: 0.15 * 70 + 0.85 * 20 = 10.5 + 17 = 27.5. Minus 5 = 22.5
  // If bet T: 0.85 * 70 + 0.15 * 20 = 59.5 + 3 = 62.5. Minus 5 = 57.5
  const uStar_sc = stepCost + (p2T * rF2 + p2H * rF1); // 57.5

  // For coin 2 at sw:
  // If bet H: 0.15 * 20 + 0.85 * (-100) = 3 - 85 = -82. Minus 5 = -87
  // If bet T: 0.85 * 20 + 0.15 * (-100) = 17 - 15 = 2. Minus 5 = -3.0
  const uStar_sw = stepCost + (p2T * rF1 + p2H * rF0); // -3.0

  const checkCalculations = () => {
    const val_sc = parseFloat(calcU1_sc);
    const val_sw = parseFloat(calcU1_sw);
    const val_s0 = parseFloat(calcU2_s0);

    const ok_sc = Math.abs(val_sc - uStar_sc) < 0.1;
    const ok_sw = Math.abs(val_sw - uStar_sw) < 0.1;
    const uStar_s0 = stepCost + (p1H * uStar_sc + p1T * uStar_sw); // 34.35
    const ok_s0 = Math.abs(val_s0 - uStar_s0) < 0.1;

    if (ok_sc && ok_sw && ok_s0) {
      setIsCorrect(true);
      setFeedback('100% Correct! You solved the exact Bellman equations from the professor’s handwritten solution sheet.');
    } else {
      setIsCorrect(false);
      setFeedback(
        `Check your numbers: U*(sc) should be 57.5 (-5 + 0.85*70 + 0.15*20), U*(sw) should be -3.0 (-5 + 0.85*20 + 0.15*(-100)), and U*(s0) should be 34.35 (-5 + 0.70*57.5 + 0.30*(-3)).`
      );
    }
  };

  return (
    <div className="card" style={{ padding: '1.75rem', border: '1px solid var(--lab-border-active)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
        <Coins size={22} color="var(--lab-accent-amber)" />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-amber font-mono">OFFICIAL UCLM EXAM EXERCISE</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Two-Stage Betting MDP (Academic Year 2026/27)</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.2rem' }}>
            Model and Solve the Two-Stage Betting MDP
          </h3>
        </div>
      </div>

      {/* Problem Specification */}
      <div className="grid-2" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
        <div style={{ padding: '1rem', background: 'var(--lab-bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem', lineHeight: '1.5' }}>
          <strong style={{ color: 'var(--lab-accent-cyan)' }}>Rules of the Betting Game:</strong>
          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.35rem', color: 'var(--text-secondary)' }}>
            <li><strong>Stage 1</strong>: Bet Heads or Tails on Coin 1 (Reward = -5€). Coin 1 is tossed: $P_1(H) = 0.70, P_1(T) = 0.30$. Result observed.</li>
            <li><strong>Stage 2</strong>: Bet Heads or Tails on Coin 2 (Reward = -5€). Coin 2 is tossed: $P_2(H) = 0.15, P_2(T) = 0.85$.</li>
            <li><strong>Terminal Rewards</strong>: Both correct = <strong>+70€</strong>, Exactly one correct = <strong>+20€</strong>, Both wrong = <strong>-100€</strong>.</li>
            <li>Discount factor $\gamma = 1.0$.</li>
          </ul>
        </div>

        <div style={{ padding: '1rem', background: 'var(--lab-bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem', lineHeight: '1.5' }}>
          <strong style={{ color: 'var(--lab-accent-lime)' }}>Markov State Formulation (Question 1 & 2):</strong>
          <div style={{ marginTop: '0.35rem', color: 'var(--text-secondary)' }}>
            To make the process Markovian, the intermediate state must remember whether the first prediction was correct or wrong!
            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.35rem' }}>
              <li>Non-terminal states: S = &#123;s_0, s_c, s_w&#125; (initial, 1 correct, 1 wrong).</li>
              <li>Terminal states: F = &#123;f_2, f_1, f_0&#125; (2 correct, 1 correct, 0 correct).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Transition Graph Diagram */}
      <div
        style={{
          background: 'var(--lab-bg-obsidian)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--lab-border-active)',
          marginBottom: '1.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Transition Graph & Optimal Policy Decisions (Reproducing Professor's Handwritten Graph)
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* s0 */}
          <div style={{ padding: '0.75rem 1rem', background: '#1e293b', borderRadius: '8px', border: '2px solid var(--lab-accent-cyan)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Initial State</div>
            <strong style={{ fontSize: '1.1rem', color: '#38bdf8' }}>s0</strong>
            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Optimal Bet: <strong>Heads (H)</strong></div>
            <div style={{ fontSize: '0.7rem', color: 'var(--lab-accent-lime)' }}>U*(s0) = +34.35€</div>
          </div>

          <ArrowRight size={20} color="var(--text-muted)" />

          {/* sc & sw */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.65rem 0.9rem', background: '#1e293b', borderRadius: '8px', border: '1px solid var(--accent-emerald)' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Coin 1 Correct (P=0.70)</div>
              <strong style={{ color: '#34d399' }}>sc</strong>
              <div style={{ fontSize: '0.72rem' }}>Optimal Bet: <strong>Tails (T)</strong></div>
              <div style={{ fontSize: '0.7rem', color: 'var(--lab-accent-lime)' }}>U*(sc) = +57.50€</div>
            </div>

            <div style={{ padding: '0.65rem 0.9rem', background: '#1e293b', borderRadius: '8px', border: '1px solid var(--accent-rose)' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Coin 1 Wrong (P=0.30)</div>
              <strong style={{ color: '#f87171' }}>sw</strong>
              <div style={{ fontSize: '0.72rem' }}>Optimal Bet: <strong>Tails (T)</strong></div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-rose)' }}>U*(sw) = -3.00€</div>
            </div>
          </div>

          <ArrowRight size={20} color="var(--text-muted)" />

          {/* Terminal States */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ padding: '0.4rem 0.75rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '6px', border: '1px solid #10b981' }}>
              <strong>f2 (2 correct)</strong>: +70€
            </div>
            <div style={{ padding: '0.4rem 0.75rem', background: 'rgba(245, 158, 11, 0.2)', borderRadius: '6px', border: '1px solid #f59e0b' }}>
              <strong>f1 (1 correct)</strong>: +20€
            </div>
            <div style={{ padding: '0.4rem 0.75rem', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '6px', border: '1px solid #ef4444' }}>
              <strong>f0 (0 correct)</strong>: -100€
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Practice: Student Value Iteration Check */}
      <div className="card" style={{ padding: '1.25rem', background: 'var(--lab-bg-surface)', border: '1px solid var(--lab-accent-amber)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
          <HelpCircle size={16} color="var(--lab-accent-amber)" />
          <strong style={{ fontSize: '0.9rem' }}>Self-Test: Calculate the Converged Bellman Utilities</strong>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {"Using the Bellman equation U*(s) = -5 + max_a ∑ T(s, a, s') U*(s'), enter your calculated values:"}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              U*(sc) (Stage 2):
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 57.5"
              value={calcU1_sc}
              onChange={(e) => setCalcU1_sc(e.target.value)}
              className="input-field"
              style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              U*(sw) (Stage 2):
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. -3.0"
              value={calcU1_sw}
              onChange={(e) => setCalcU1_sw(e.target.value)}
              className="input-field"
              style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              U*(s0) (Stage 1 Expected):
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 34.35"
              value={calcU2_s0}
              onChange={(e) => setCalcU2_s0(e.target.value)}
              className="input-field"
              style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        <button onClick={checkCalculations} className="btn-tactile btn-sm btn-amber">
          Check My Calculations
        </button>

        {feedback && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {isCorrect ? <CheckCircle2 size={16} color="var(--accent-emerald)" /> : <XCircle size={16} color="var(--accent-rose)" />}
            <span>{feedback}</span>
          </div>
        )}
      </div>
    </div>
  );
};
