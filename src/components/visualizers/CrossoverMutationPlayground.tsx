import React, { useState } from 'react';
import {
  Scissors,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Shuffle,
} from 'lucide-react';

type CrossoverType = '1-point' | '2-point' | 'uniform';

export const CrossoverMutationPlayground: React.FC = () => {
  // 8-bit default chromosomes matching Proposed Exercise 2 (Slide 28)
  // P1 = [1, 1, 0, 0, 1, 0, 1, 1]
  // P2 = [0, 0, 1, 1, 0, 1, 0, 0]
  const [parentA, setParentA] = useState<number[]>([1, 1, 0, 0, 1, 0, 1, 1]);
  const [parentB, setParentB] = useState<number[]>([0, 0, 1, 1, 0, 1, 0, 0]);

  const [crossoverType, setCrossoverType] = useState<CrossoverType>('1-point');
  const [cutPoint1, setCutPoint1] = useState<number>(3); // After index 3
  const [cutPoint2, setCutPoint2] = useState<number>(6); // For 2-point
  const [uniformMask, setUniformMask] = useState<number[]>([1, 0, 1, 0, 1, 0, 1, 0]);

  // Exam Prediction Challenge Mode
  const [challengeMode, setChallengeMode] = useState<boolean>(false);
  const [userPredictOff1, setUserPredictOff1] = useState<string>('');
  const [predictFeedback, setPredictFeedback] = useState<string | null>(null);
  const [isPredictCorrect, setIsPredictCorrect] = useState<boolean | null>(null);

  // Generate offspring based on operator
  let off1: { val: number; from: 'A' | 'B'; idx: number }[] = [];
  let off2: { val: number; from: 'A' | 'B'; idx: number }[] = [];

  if (crossoverType === '1-point') {
    off1 = parentA.map((bit, idx) =>
      idx < cutPoint1 ? { val: bit, from: 'A', idx } : { val: parentB[idx], from: 'B', idx }
    );
    off2 = parentB.map((bit, idx) =>
      idx < cutPoint1 ? { val: bit, from: 'B', idx } : { val: parentA[idx], from: 'A', idx }
    );
  } else if (crossoverType === '2-point') {
    const k1 = Math.min(cutPoint1, cutPoint2);
    const k2 = Math.max(cutPoint1, cutPoint2);
    off1 = parentA.map((bit, idx) =>
      idx >= k1 && idx < k2 ? { val: parentB[idx], from: 'B', idx } : { val: bit, from: 'A', idx }
    );
    off2 = parentB.map((bit, idx) =>
      idx >= k1 && idx < k2 ? { val: parentA[idx], from: 'A', idx } : { val: bit, from: 'B', idx }
    );
  } else {
    // Uniform crossover
    off1 = parentA.map((bit, idx) =>
      uniformMask[idx] === 1 ? { val: bit, from: 'A', idx } : { val: parentB[idx], from: 'B', idx }
    );
    off2 = parentB.map((bit, idx) =>
      uniformMask[idx] === 1 ? { val: parentB[idx], from: 'B', idx } : { val: bit, from: 'A', idx }
    );
  }

  const toggleParentABit = (idx: number) => {
    setParentA((prev) => {
      const next = [...prev];
      next[idx] = 1 - next[idx];
      return next;
    });
  };

  const toggleParentBBit = (idx: number) => {
    setParentB((prev) => {
      const next = [...prev];
      next[idx] = 1 - next[idx];
      return next;
    });
  };

  const toggleMaskBit = (idx: number) => {
    setUniformMask((prev) => {
      const next = [...prev];
      next[idx] = 1 - next[idx];
      return next;
    });
  };

  const randomizeAll = () => {
    setParentA(Array.from({ length: 8 }, () => (Math.random() > 0.5 ? 1 : 0)));
    setParentB(Array.from({ length: 8 }, () => (Math.random() > 0.5 ? 1 : 0)));
    setUniformMask(Array.from({ length: 8 }, () => (Math.random() > 0.5 ? 1 : 0)));
    setPredictFeedback(null);
  };

  const resetToExamDefaults = () => {
    setParentA([1, 1, 0, 0, 1, 0, 1, 1]);
    setParentB([0, 0, 1, 1, 0, 1, 0, 0]);
    setCrossoverType('1-point');
    setCutPoint1(3);
    setCutPoint2(6);
    setUniformMask([1, 0, 1, 0, 1, 0, 1, 0]);
    setPredictFeedback(null);
  };

  const checkPrediction = () => {
    const trueOff1Str = off1.map((b) => b.val).join('');
    const cleanUser = userPredictOff1.replace(/\s+/g, '');
    if (cleanUser === trueOff1Str) {
      setIsPredictCorrect(true);
      setPredictFeedback(`Correct! Offspring 1 is indeed ${trueOff1Str}. You have mastered genetic crossover tracing!`);
    } else {
      setIsPredictCorrect(false);
      setPredictFeedback(
        `Incorrect: Expected ${trueOff1Str}, but you entered ${cleanUser || '(empty)'}. Offspring 1 takes bits 0..${
          cutPoint1 - 1
        } from Parent A (${parentA.slice(0, cutPoint1).join('')}) and bits ${cutPoint1}..7 from Parent B (${parentB
          .slice(cutPoint1)
          .join('')}).`
      );
    }
  };

  return (
    <div className="visualizer-container">
      {/* Header */}
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Scissors size={20} style={{ color: 'var(--lab-accent-cyan)' }} />
            Crossover & Genetic Recombination Workbench (Lesson 8, Slides 25–38)
          </div>
          <div className="visualizer-subtitle">
            Bit-Level Chromosome Splicing, Multi-Point Recombination & Point Mutation Interactive Sandbox
          </div>
        </div>

        <div className="visualizer-controls">
          <button
            onClick={() => setChallengeMode(!challengeMode)}
            className={`btn-tactile btn-sm ${challengeMode ? 'btn-amber' : ''}`}
          >
            <HelpCircle size={14} />
            <span>{challengeMode ? 'Exit Self-Test' : 'Prediction Challenge'}</span>
          </button>
          <button onClick={randomizeAll} className="btn-tactile btn-sm">
            <Shuffle size={14} />
            <span>Randomize</span>
          </button>
          <button onClick={resetToExamDefaults} className="btn-tactile btn-sm">
            <RotateCcw size={14} />
            <span>UCLM Slide Preset</span>
          </button>
        </div>
      </div>

      <div className="visualizer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Operator Selector Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--lab-bg-surface)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Crossover Operator:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(
                [
                  { id: '1-point', label: '1-Point Crossover' },
                  { id: '2-point', label: '2-Point Crossover' },
                  { id: 'uniform', label: 'Uniform Crossover' },
                ] as const
              ).map((op) => (
                <button
                  key={op.id}
                  onClick={() => setCrossoverType(op.id)}
                  className={`btn-tactile btn-xs ${crossoverType === op.id ? 'btn-primary' : ''}`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cut point controls */}
          {crossoverType === '1-point' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Cut Point k:</span>
              <input
                type="range"
                min="1"
                max="7"
                value={cutPoint1}
                onChange={(e) => setCutPoint1(parseInt(e.target.value, 10))}
                style={{ width: '100px', accentColor: 'var(--lab-accent-cyan)' }}
              />
              <strong className="font-mono" style={{ color: 'var(--lab-accent-cyan)' }}>
                After bit {cutPoint1}
              </strong>
            </div>
          )}

          {crossoverType === '2-point' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cut 1:</span>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={cutPoint1}
                  onChange={(e) => setCutPoint1(parseInt(e.target.value, 10))}
                  style={{ width: '80px', accentColor: 'var(--lab-accent-cyan)' }}
                />
                <span className="font-mono text-cyan-400">{cutPoint1}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cut 2:</span>
                <input
                  type="range"
                  min={cutPoint1 + 1}
                  max="7"
                  value={Math.max(cutPoint1 + 1, cutPoint2)}
                  onChange={(e) => setCutPoint2(parseInt(e.target.value, 10))}
                  style={{ width: '80px', accentColor: 'var(--lab-accent-amber)' }}
                />
                <span className="font-mono text-amber-400">{Math.max(cutPoint1 + 1, cutPoint2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Chromosome Interaction Arena */}
        <div className="grid-2">
          {/* Parent Chromosomes Block */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Parent Chromosomes (Click any bit to mutate)
            </div>

            {/* Parent A */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--lab-accent-cyan)', fontWeight: 600 }}>Parent A (P1)</span>
                <span>Bit Indices 0 .. 7</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', position: 'relative' }}>
                {parentA.map((bit, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleParentABit(idx)}
                    style={{
                      flex: 1,
                      height: '42px',
                      borderRadius: '6px',
                      background: bit === 1 ? 'rgba(120, 213, 232, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--lab-accent-cyan)',
                      color: 'var(--lab-accent-cyan)',
                      fontSize: '1rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    title={`Parent A Bit #${idx}: click to flip`}
                  >
                    {bit}
                  </button>
                ))}
              </div>
            </div>

            {/* Parent B */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--lab-accent-amber)', fontWeight: 600 }}>Parent B (P2)</span>
                <span>Bit Indices 0 .. 7</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {parentB.map((bit, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleParentBBit(idx)}
                    style={{
                      flex: 1,
                      height: '42px',
                      borderRadius: '6px',
                      background: bit === 1 ? 'rgba(233, 183, 119, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--lab-accent-amber)',
                      color: 'var(--lab-accent-amber)',
                      fontSize: '1rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    title={`Parent B Bit #${idx}: click to flip`}
                  >
                    {bit}
                  </button>
                ))}
              </div>
            </div>

            {/* Uniform Mask Row */}
            {crossoverType === 'uniform' && (
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  <span>Recombination Mask (1 = Take from Parent A, 0 = Take from Parent B)</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {uniformMask.map((m, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleMaskBit(idx)}
                      style={{
                        flex: 1,
                        height: '28px',
                        borderRadius: '4px',
                        background: m === 1 ? 'var(--lab-accent-lime)' : '#1e293b',
                        color: m === 1 ? '#000' : '#fff',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Offspring Result Block */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Resulting Recombinant Offspring
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.68rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--lab-accent-cyan)' }} />
                  From A
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--lab-accent-amber)' }} />
                  From B
                </span>
              </div>
            </div>

            {/* Offspring 1 */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Offspring 1 (O1)
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {off1.map((item, idx) => {
                  const isA = item.from === 'A';
                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        height: '42px',
                        borderRadius: '6px',
                        background: isA ? 'rgba(120, 213, 232, 0.25)' : 'rgba(233, 183, 119, 0.25)',
                        border: `1px solid ${isA ? 'var(--lab-accent-cyan)' : 'var(--lab-accent-amber)'}`,
                        color: isA ? 'var(--lab-accent-cyan)' : 'var(--lab-accent-amber)',
                        fontSize: '1rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span>{item.val}</span>
                      <span style={{ fontSize: '0.55rem', opacity: 0.7 }}>{item.from}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Offspring 2 */}
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Offspring 2 (O2)
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {off2.map((item, idx) => {
                  const isA = item.from === 'A';
                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        height: '42px',
                        borderRadius: '6px',
                        background: isA ? 'rgba(120, 213, 232, 0.25)' : 'rgba(233, 183, 119, 0.25)',
                        border: `1px solid ${isA ? 'var(--lab-accent-cyan)' : 'var(--lab-accent-amber)'}`,
                        color: isA ? 'var(--lab-accent-cyan)' : 'var(--lab-accent-amber)',
                        fontSize: '1rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span>{item.val}</span>
                      <span style={{ fontSize: '0.55rem', opacity: 0.7 }}>{item.from}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Practice Mode Card */}
        {challengeMode && (
          <div
            className="card"
            style={{
              padding: '1.25rem',
              border: '1px solid var(--lab-accent-amber)',
              background: 'var(--lab-bg-surface)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <HelpCircle size={16} color="var(--lab-accent-amber)" />
              <strong style={{ fontSize: '0.85rem' }}>UCLM Exam Exercise: Predict the 8-Bit Offspring</strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Given Parent A = <code>{parentA.join('')}</code>, Parent B = <code>{parentB.join('')}</code>, and 1-point crossover cut point at bit <strong>k = {cutPoint1}</strong>: enter the resulting 8-bit sequence for <strong>Offspring 1</strong> before looking at the solution:
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                maxLength={8}
                placeholder="e.g. 11010100"
                value={userPredictOff1}
                onChange={(e) => setUserPredictOff1(e.target.value)}
                className="font-mono"
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '5px',
                  background: 'var(--lab-bg-obsidian)',
                  border: '1px solid var(--border-medium)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  letterSpacing: '2px',
                }}
              />
              <button onClick={checkPrediction} className="btn-tactile btn-sm btn-primary">
                Verify Prediction
              </button>
            </div>

            {predictFeedback && (
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '5px',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: isPredictCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${isPredictCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
                  color: isPredictCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                }}
              >
                {isPredictCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                <span>{predictFeedback}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
