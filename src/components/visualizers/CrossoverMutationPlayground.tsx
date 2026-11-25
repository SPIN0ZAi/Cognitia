import React, { useState, useMemo } from 'react';
import {
  Scissors,
  HelpCircle,
  Shuffle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export type ChromosomeType = 'binary' | 'permutation';
export type CrossoverOp = '1-point' | '2-point' | 'uniform' | 'order-ox1';
export type MutationOp = 'bit-flip' | 'swap' | 'inversion' | 'scramble';

export const CrossoverMutationPlayground: React.FC = () => {
  const [chromoType, setChromoType] = useState<ChromosomeType>('binary');
  const [crossoverOp, setCrossoverOp] = useState<CrossoverOp>('1-point');

  // Binary Parents (8 bits) - Slide 28 Proposed Exercise 2
  const defaultParentA = useMemo(() => [1, 1, 0, 0, 1, 0, 1, 1], []);
  const defaultParentB = useMemo(() => [0, 0, 1, 1, 0, 1, 0, 0], []);
  const [parentA, setParentA] = useState<number[]>(defaultParentA);
  const [parentB, setParentB] = useState<number[]>(defaultParentB);

  // Permutation Parents (8 cities for TSP: 1 to 8) - Slide 32
  const defaultPermA = useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8], []);
  const defaultPermB = useMemo(() => [8, 5, 2, 1, 3, 6, 4, 7], []);
  const [permA, setPermA] = useState<number[]>(defaultPermA);
  const [permB, setPermB] = useState<number[]>(defaultPermB);

  // Cut points
  const [cut1, setCut1] = useState<number>(3); // After index 3
  const [cut2, setCut2] = useState<number>(6); // For 2-point / OX1
  const uniformMask = useMemo(() => [1, 0, 1, 0, 1, 0, 1, 0], []);

  // Mutation Workbench State
  const mutationInput = useMemo(() => [1, 0, 1, 1, 0, 0, 1, 0], []);
  const [mutOp, setMutOp] = useState<MutationOp>('bit-flip');
  const mutIdx1 = 2;
  const mutIdx2 = 5;

  // Prediction Challenge State
  const [challengeMode, setChallengeMode] = useState<boolean>(false);
  const [predictAns, setPredictAns] = useState<string>('');
  const [predictFeedback, setPredictFeedback] = useState<string | null>(null);
  const [isPredictCorrect, setIsPredictCorrect] = useState<boolean | null>(null);

  // ==========================================
  // CROSSOVER LOGIC
  // ==========================================
  const { offspring1, offspring2 } = useMemo(() => {
    if (chromoType === 'binary') {
      if (crossoverOp === '1-point') {
        const o1 = parentA.map((bit, idx) => ({
          val: idx < cut1 ? bit : parentB[idx],
          from: idx < cut1 ? 'A' : 'B',
          idx
        }));
        const o2 = parentB.map((bit, idx) => ({
          val: idx < cut1 ? bit : parentA[idx],
          from: idx < cut1 ? 'B' : 'A',
          idx
        }));
        return { offspring1: o1, offspring2: o2 };
      } else if (crossoverOp === '2-point') {
        const k1 = Math.min(cut1, cut2);
        const k2 = Math.max(cut1, cut2);
        const o1 = parentA.map((bit, idx) => ({
          val: idx >= k1 && idx < k2 ? parentB[idx] : bit,
          from: idx >= k1 && idx < k2 ? 'B' : 'A',
          idx
        }));
        const o2 = parentB.map((bit, idx) => ({
          val: idx >= k1 && idx < k2 ? parentA[idx] : bit,
          from: idx >= k1 && idx < k2 ? 'A' : 'B',
          idx
        }));
        return { offspring1: o1, offspring2: o2 };
      } else {
        // Uniform
        const o1 = parentA.map((bit, idx) => ({
          val: uniformMask[idx] === 1 ? bit : parentB[idx],
          from: uniformMask[idx] === 1 ? 'A' : 'B',
          idx
        }));
        const o2 = parentB.map((bit, idx) => ({
          val: uniformMask[idx] === 1 ? parentB[idx] : bit,
          from: uniformMask[idx] === 1 ? 'B' : 'A',
          idx
        }));
        return { offspring1: o1, offspring2: o2 };
      }
    } else {
      // PERMUTATION ORDER CROSSOVER (OX1) - UCLM Slide 32
      // 1. Copy swath between cut1 and cut2 from Parent 1 directly to Offspring 1
      // 2. Starting from cut2 in Parent 2, fill remaining available positions with remaining unused items in order
      const k1 = Math.min(cut1, cut2);
      const k2 = Math.max(cut1, cut2);
      const len = permA.length;

      // Offspring 1
      const swath1 = permA.slice(k1, k2);
      const swathSet1 = new Set(swath1);
      const remainingFromB: number[] = [];

      for (let i = 0; i < len; i++) {
        const item = permB[(k2 + i) % len];
        if (!swathSet1.has(item)) {
          remainingFromB.push(item);
        }
      }

      const res1: { val: number; from: 'A' | 'B'; idx: number }[] = new Array(len);
      for (let i = k1; i < k2; i++) {
        res1[i] = { val: permA[i], from: 'A', idx: i };
      }
      let bPtr = 0;
      for (let i = 0; i < len; i++) {
        const targetIdx = (k2 + i) % len;
        if (targetIdx < k1 || targetIdx >= k2) {
          res1[targetIdx] = { val: remainingFromB[bPtr++], from: 'B', idx: targetIdx };
        }
      }

      // Offspring 2 (symmetric)
      const swath2 = permB.slice(k1, k2);
      const swathSet2 = new Set(swath2);
      const remainingFromA: number[] = [];
      for (let i = 0; i < len; i++) {
        const item = permA[(k2 + i) % len];
        if (!swathSet2.has(item)) {
          remainingFromA.push(item);
        }
      }

      const res2: { val: number; from: 'A' | 'B'; idx: number }[] = new Array(len);
      for (let i = k1; i < k2; i++) {
        res2[i] = { val: permB[i], from: 'B', idx: i };
      }
      let aPtr = 0;
      for (let i = 0; i < len; i++) {
        const targetIdx = (k2 + i) % len;
        if (targetIdx < k1 || targetIdx >= k2) {
          res2[targetIdx] = { val: remainingFromA[aPtr++], from: 'A', idx: targetIdx };
        }
      }

      return { offspring1: res1, offspring2: res2 };
    }
  }, [chromoType, crossoverOp, parentA, parentB, permA, permB, cut1, cut2, uniformMask]);

  // ==========================================
  // MUTATION LOGIC
  // ==========================================
  const mutatedOffspring = useMemo(() => {
    const copy = [...mutationInput];
    const k1 = Math.min(mutIdx1, mutIdx2);
    const k2 = Math.max(mutIdx1, mutIdx2);

    if (mutOp === 'bit-flip') {
      copy[mutIdx1] = 1 - copy[mutIdx1];
    } else if (mutOp === 'swap') {
      const temp = copy[mutIdx1];
      copy[mutIdx1] = copy[mutIdx2];
      copy[mutIdx2] = temp;
    } else if (mutOp === 'inversion') {
      // Invert subsegment between k1 and k2
      const slice = copy.slice(k1, k2 + 1).reverse();
      copy.splice(k1, slice.length, ...slice);
    } else {
      // Scramble: shuffle subsegment
      const slice = copy.slice(k1, k2 + 1);
      for (let i = slice.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [slice[i], slice[j]] = [slice[j], slice[i]];
      }
      copy.splice(k1, slice.length, ...slice);
    }
    return copy;
  }, [mutationInput, mutOp, mutIdx1, mutIdx2]);

  // Prediction check
  const handleCheckPrediction = () => {
    const expectedStr = offspring1.map((x) => x.val).join('');
    const userClean = predictAns.replace(/\s+/g, '').replace(/,/g, '');

    if (userClean === expectedStr) {
      setIsPredictCorrect(true);
      setPredictFeedback(`Correct! Offspring 1 evaluates exactly to ${expectedStr}. You have mastered crossover operator tracing.`);
    } else {
      setIsPredictCorrect(false);
      setPredictFeedback(
        `Incorrect. Offspring 1 is [${expectedStr.split('').join(', ')}]. Double-check which chromosome segments inherit from Parent A vs Parent B at cut points.`
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
            Chromosome Genetic Recombination & Mutation Workbench
          </div>
          <div className="visualizer-subtitle">
            1-Point, 2-Point, Uniform & Order Crossover (OX1 for TSP) + Mutation Operators (UCLM Slides 27–34)
          </div>
        </div>

        <div className="visualizer-controls">
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => {
                setChromoType('binary');
                setCrossoverOp('1-point');
              }}
              className={`btn-tactile btn-sm ${chromoType === 'binary' ? 'btn-primary' : ''}`}
            >
              Binary Chromosomes
            </button>
            <button
              onClick={() => {
                setChromoType('permutation');
                setCrossoverOp('order-ox1');
              }}
              className={`btn-tactile btn-sm ${chromoType === 'permutation' ? 'btn-amber' : ''}`}
            >
              Permutation (OX1 for TSP)
            </button>
          </div>
        </div>
      </div>

      <div className="visualizer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Operator Controls Deck */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            background: 'var(--lab-bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--lab-border-subtle)'
          }}
        >
          {/* Operator Switcher */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
              Crossover Operator:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {chromoType === 'binary' ? (
                (['1-point', '2-point', 'uniform'] as const).map((op) => (
                  <button
                    key={op}
                    onClick={() => setCrossoverOp(op)}
                    className={`btn-tactile btn-xs ${crossoverOp === op ? 'btn-primary' : ''}`}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {op}
                  </button>
                ))
              ) : (
                <span className="badge badge-amber font-mono" style={{ fontSize: '0.75rem' }}>
                  Order Crossover (OX1) Active
                </span>
              )}
            </div>
          </div>

          {/* Cut Point Sliders */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Crossover Cut Point 1:</span>
              <strong className="font-mono text-cyan-400">Index {cut1}</strong>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              value={cut1}
              onChange={(e) => setCut1(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--lab-accent-cyan)' }}
            />
          </div>

          {(crossoverOp === '2-point' || crossoverOp === 'order-ox1') && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Crossover Cut Point 2:</span>
                <strong className="font-mono text-lime-400">Index {cut2}</strong>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                value={cut2}
                onChange={(e) => setCut2(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--lab-accent-lime)' }}
              />
            </div>
          )}

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
            <button
              onClick={() => {
                if (chromoType === 'binary') {
                  setParentA(Array.from({ length: 8 }, () => (Math.random() > 0.5 ? 1 : 0)));
                  setParentB(Array.from({ length: 8 }, () => (Math.random() > 0.5 ? 1 : 0)));
                } else {
                  setPermA([...defaultPermA].sort(() => Math.random() - 0.5));
                  setPermB([...defaultPermB].sort(() => Math.random() - 0.5));
                }
              }}
              className="btn-tactile btn-xs"
              style={{ flex: 1, padding: '0.4rem 0.5rem' }}
            >
              <Shuffle size={12} />
              <span>Randomize Parents</span>
            </button>
            <button
              onClick={() => setChallengeMode(!challengeMode)}
              className={`btn-tactile btn-xs ${challengeMode ? 'btn-amber' : ''}`}
              style={{ flex: 1, padding: '0.4rem 0.5rem' }}
            >
              <HelpCircle size={12} />
              <span>Predict Quiz</span>
            </button>
          </div>
        </div>

        {/* Chromosome Recombination Stage */}
        <div
          style={{
            background: 'var(--lab-bg-obsidian)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--lab-border-active)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          {/* Parents Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              MATING PARENT CHROMOSOMES
            </div>

            {/* Parent A */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge badge-cyan font-mono" style={{ width: '90px' }}>
                Parent A
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(chromoType === 'binary' ? parentA : permA).map((gene, idx) => (
                  <button
                    key={`pa-${idx}`}
                    onClick={() => {
                      if (chromoType === 'binary') {
                        setParentA((p) => {
                          const n = [...p];
                          n[idx] = 1 - n[idx];
                          return n;
                        });
                      }
                    }}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '6px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '2px solid var(--lab-accent-cyan)',
                      color: 'var(--lab-accent-cyan)',
                      fontSize: '1rem',
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      cursor: chromoType === 'binary' ? 'pointer' : 'default'
                    }}
                    title={chromoType === 'binary' ? 'Click to flip bit' : ''}
                  >
                    {gene}
                  </button>
                ))}
              </div>
            </div>

            {/* Parent B */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge badge-rose font-mono" style={{ width: '90px' }}>
                Parent B
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(chromoType === 'binary' ? parentB : permB).map((gene, idx) => (
                  <button
                    key={`pb-${idx}`}
                    onClick={() => {
                      if (chromoType === 'binary') {
                        setParentB((p) => {
                          const n = [...p];
                          n[idx] = 1 - n[idx];
                          return n;
                        });
                      }
                    }}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '6px',
                      background: 'rgba(251, 113, 133, 0.15)',
                      border: '2px solid #fb7185',
                      color: '#fb7185',
                      fontSize: '1rem',
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      cursor: chromoType === 'binary' ? 'pointer' : 'default'
                    }}
                    title={chromoType === 'binary' ? 'Click to flip bit' : ''}
                  >
                    {gene}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Splice Laser Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '0.2rem 0', marginLeft: '98px' }}>
            <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
              {Array.from({ length: 8 }).map((_, idx) => {
                const isCut1 = idx === cut1 - 1;
                const isCut2 = idx === cut2 - 1 && (crossoverOp === '2-point' || crossoverOp === 'order-ox1');
                return (
                  <div
                    key={`laser-${idx}`}
                    style={{
                      width: '38px',
                      display: 'flex',
                      justifyContent: 'flex-end',
                      position: 'relative'
                    }}
                  >
                    {isCut1 && (
                      <div
                        style={{
                          position: 'absolute',
                          right: '-4px',
                          top: '-6px',
                          bottom: '-6px',
                          width: '2px',
                          background: 'var(--lab-accent-cyan)',
                          boxShadow: '0 0 8px var(--lab-accent-cyan)'
                        }}
                      />
                    )}
                    {isCut2 && (
                      <div
                        style={{
                          position: 'absolute',
                          right: '-4px',
                          top: '-6px',
                          bottom: '-6px',
                          width: '2px',
                          background: 'var(--lab-accent-lime)',
                          boxShadow: '0 0 8px var(--lab-accent-lime)'
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recombined Offspring Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              RESULTING OFFSPRING CHROMOSOMES
            </div>

            {/* Offspring 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge badge-emerald font-mono" style={{ width: '90px' }}>
                Offspring 1
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {offspring1.map((gene, idx) => (
                  <div
                    key={`o1-${idx}`}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '6px',
                      background:
                        gene.from === 'A'
                          ? 'rgba(56, 189, 248, 0.25)'
                          : 'rgba(251, 113, 133, 0.25)',
                      border: `2px solid ${gene.from === 'A' ? 'var(--lab-accent-cyan)' : '#fb7185'}`,
                      color: '#ffffff',
                      fontSize: '1rem',
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                  >
                    <span>{gene.val}</span>
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        fontSize: '0.55rem',
                        color: gene.from === 'A' ? 'var(--lab-accent-cyan)' : '#fb7185'
                      }}
                    >
                      {gene.from}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Offspring 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge badge-emerald font-mono" style={{ width: '90px' }}>
                Offspring 2
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {offspring2.map((gene, idx) => (
                  <div
                    key={`o2-${idx}`}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '6px',
                      background:
                        gene.from === 'A'
                          ? 'rgba(56, 189, 248, 0.25)'
                          : 'rgba(251, 113, 133, 0.25)',
                      border: `2px solid ${gene.from === 'A' ? 'var(--lab-accent-cyan)' : '#fb7185'}`,
                      color: '#ffffff',
                      fontSize: '1rem',
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                  >
                    <span>{gene.val}</span>
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        fontSize: '0.55rem',
                        color: gene.from === 'A' ? 'var(--lab-accent-cyan)' : '#fb7185'
                      }}
                    >
                      {gene.from}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Challenge Box (if active) */}
        {challengeMode && (
          <div className="card" style={{ padding: '1.25rem', background: 'var(--lab-bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <HelpCircle size={18} className="text-amber-400" />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                Exam Challenge: Predict Offspring 1
              </h4>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
              Based on cut point(s) and selected operator ({crossoverOp}), enter the exact 8 genes produced in Offspring 1 (e.g. <code>11010100</code>):
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '380px' }}>
              <input
                type="text"
                value={predictAns}
                onChange={(e) => setPredictAns(e.target.value)}
                placeholder="Enter 8 genes..."
                className="font-mono text-sm"
                style={{
                  flex: 1,
                  padding: '0.4rem 0.75rem',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  color: '#ffffff'
                }}
              />
              <button onClick={handleCheckPrediction} className="btn-tactile btn-sm btn-emerald">
                Verify
              </button>
            </div>

            {predictFeedback && (
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '6px',
                  background: isPredictCorrect ? 'rgba(198, 242, 119, 0.08)' : 'rgba(251, 113, 133, 0.08)',
                  border: `1px solid ${isPredictCorrect ? 'var(--lab-accent-lime)' : '#fb7185'}`,
                  fontSize: '0.82rem',
                  color: isPredictCorrect ? 'var(--lab-accent-lime)' : '#fb7185'
                }}
              >
                {predictFeedback}
              </div>
            )}
          </div>
        )}

        {/* Mutation Operators Workbench */}
        <div className="card" style={{ padding: '1.25rem', background: 'var(--lab-bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} className="text-lime-400" />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                Mutation Operators Workbench (Slide 33)
              </h4>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              {(['bit-flip', 'swap', 'inversion', 'scramble'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMutOp(m)}
                  className={`btn-tactile btn-xs ${mutOp === m ? 'btn-lime' : ''}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {m.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Mutation prevents premature convergence by injecting genetic novelty at small probabilities $P_m \in [0.001, 0.05]$.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                Original Chromosome:
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {mutationInput.map((bit, i) => (
                  <span
                    key={i}
                    style={{
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontWeight: 'bold'
                    }}
                  >
                    {bit}
                  </span>
                ))}
              </div>
            </div>

            <ArrowRight size={20} className="text-muted" />

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--lab-accent-lime)', display: 'block', marginBottom: '0.2rem', fontWeight: 600 }}>
                Mutated with {mutOp.toUpperCase()}:
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {mutatedOffspring.map((bit, i) => {
                  const changed = bit !== mutationInput[i];
                  return (
                    <span
                      key={i}
                      style={{
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: changed ? 'rgba(198, 242, 119, 0.25)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${changed ? 'var(--lab-accent-lime)' : 'var(--border-subtle)'}`,
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        color: changed ? 'var(--lab-accent-lime)' : '#ffffff'
                      }}
                    >
                      {bit}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
