import React, { useState } from 'react';

type CrossoverType = '1-point' | '2-point' | 'uniform';

export const CrossoverMutationPlayground: React.FC = () => {
  // 8-bit default chromosomes matching Proposed Exercise 2 (Slide 28)
  // P1 = [1, 1, 0, 0, 1, 0, 1, 1]
  // P2 = [0, 0, 1, 1, 0, 1, 0, 0]
  const [parentA, setParentA] = useState<number[]>([1, 1, 0, 0, 1, 0, 1, 1]);
  const [parentB, setParentB] = useState<number[]>([0, 0, 1, 1, 0, 1, 0, 0]);

  const [crossoverType, setCrossoverType] = useState<CrossoverType>('1-point');
  const [cutPoint1, setCutPoint1] = useState<number>(3); // After index 3 (0-based: split 0..2 and 3..7)
  const [cutPoint2, setCutPoint2] = useState<number>(6); // For 2-point
  const [uniformMask, setUniformMask] = useState<number[]>([1, 0, 1, 0, 1, 0, 1, 0]);

  // Generate offspring based on operator
  let off1: { val: number; from: 'A' | 'B' }[] = [];
  let off2: { val: number; from: 'A' | 'B' }[] = [];

  if (crossoverType === '1-point') {
    off1 = parentA.map((bit, idx) => (idx < cutPoint1 ? { val: bit, from: 'A' } : { val: parentB[idx], from: 'B' }));
    off2 = parentB.map((bit, idx) => (idx < cutPoint1 ? { val: bit, from: 'B' } : { val: parentA[idx], from: 'A' }));
  } else if (crossoverType === '2-point') {
    const k1 = Math.min(cutPoint1, cutPoint2);
    const k2 = Math.max(cutPoint1, cutPoint2);
    off1 = parentA.map((bit, idx) =>
      idx >= k1 && idx < k2 ? { val: parentB[idx], from: 'B' } : { val: bit, from: 'A' }
    );
    off2 = parentB.map((bit, idx) =>
      idx >= k1 && idx < k2 ? { val: parentA[idx], from: 'A' } : { val: bit, from: 'B' }
    );
  } else {
    // Uniform
    off1 = parentA.map((bit, idx) => (uniformMask[idx] === 1 ? { val: bit, from: 'A' } : { val: parentB[idx], from: 'B' }));
    off2 = parentB.map((bit, idx) => (uniformMask[idx] === 1 ? { val: parentB[idx], from: 'B' } : { val: bit, from: 'A' }));
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

  const randomizeUniformMask = () => {
    setUniformMask(Array.from({ length: 8 }, () => (Math.random() > 0.5 ? 1 : 0)));
  };

  return (
    <div className="bg-[#0f172a] border border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Interactive Laboratory 8.2
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Crossover & Genetic Recombination Workbench
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Slide 25–38: Experiment with 1-point, 2-point, and uniform crossover. Click any bit to mutate!
          </p>
        </div>

        {/* Operator Selector */}
        <div className="flex gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {(
            [
              { id: '1-point', label: '1-Point Crossover' },
              { id: '2-point', label: '2-Point Crossover' },
              { id: 'uniform', label: 'Uniform Crossover' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setCrossoverType(item.id)}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                crossoverType === item.id
                  ? 'bg-indigo-500 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Parents Display & Editing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Parent A */}
        <div className="p-4 bg-slate-950 rounded-xl border border-blue-500/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-blue-400">Parent A (Blue Chromosome)</span>
            <span className="text-xs text-slate-500 font-mono">Click bits to toggle</span>
          </div>
          <div className="flex gap-1.5 mb-2">
            {parentA.map((bit, idx) => (
              <button
                key={idx}
                onClick={() => toggleParentABit(idx)}
                className="flex-1 py-3 rounded-lg text-sm font-mono font-bold transition-all bg-blue-500/20 border border-blue-500/50 text-blue-300 hover:bg-blue-500/40"
              >
                {bit}
              </button>
            ))}
          </div>
          <div className="text-[11px] font-mono text-slate-400 flex justify-between">
            <span>Indices: 0..7</span>
            <span>Sum 1s: {parentA.reduce((a, b) => a + b, 0)}</span>
          </div>
        </div>

        {/* Parent B */}
        <div className="p-4 bg-slate-950 rounded-xl border border-purple-500/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-purple-400">Parent B (Purple Chromosome)</span>
            <span className="text-xs text-slate-500 font-mono">Click bits to toggle</span>
          </div>
          <div className="flex gap-1.5 mb-2">
            {parentB.map((bit, idx) => (
              <button
                key={idx}
                onClick={() => toggleParentBBit(idx)}
                className="flex-1 py-3 rounded-lg text-sm font-mono font-bold transition-all bg-purple-500/20 border border-purple-500/50 text-purple-300 hover:bg-purple-500/40"
              >
                {bit}
              </button>
            ))}
          </div>
          <div className="text-[11px] font-mono text-slate-400 flex justify-between">
            <span>Indices: 0..7</span>
            <span>Sum 1s: {parentB.reduce((a, b) => a + b, 0)}</span>
          </div>
        </div>
      </div>

      {/* Crossover Cut Controls */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        {crossoverType === '1-point' && (
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Cut Point Position (k):</span>
              <span className="font-mono text-indigo-400 font-bold">Split after gene index {cutPoint1}</span>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              step="1"
              value={cutPoint1}
              onChange={(e) => setCutPoint1(parseInt(e.target.value))}
              className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        )}

        {crossoverType === '2-point' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>First Cut Point (k₁):</span>
                <span className="font-mono text-indigo-400 font-bold">{cutPoint1}</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={cutPoint1}
                onChange={(e) => setCutPoint1(parseInt(e.target.value))}
                className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Second Cut Point (k₂):</span>
                <span className="font-mono text-indigo-400 font-bold">{cutPoint2}</span>
              </div>
              <input
                type="range"
                min="2"
                max="7"
                step="1"
                value={cutPoint2}
                onChange={(e) => setCutPoint2(parseInt(e.target.value))}
                className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {crossoverType === 'uniform' && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">
              Coin-flip mask governs gene source: 1 = Parent A, 0 = Parent B
            </span>
            <button
              onClick={randomizeUniformMask}
              className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded border border-indigo-500/30 font-semibold"
            >
              Re-roll Mask
            </button>
          </div>
        )}
      </div>

      {/* Resulting Offspring with Color Inheritance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Offspring 1 */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-white">Offspring 1</span>
            <span className="text-xs font-mono text-slate-400">
              Bits: {off1.map((b) => b.val).join('')}
            </span>
          </div>
          <div className="flex gap-1.5 mb-2">
            {off1.map((gene, idx) => (
              <div
                key={idx}
                className={`flex-1 py-3 rounded-lg text-sm font-mono font-bold text-center border ${
                  gene.from === 'A'
                    ? 'bg-blue-500/30 border-blue-400 text-blue-200'
                    : 'bg-purple-500/30 border-purple-400 text-purple-200'
                }`}
              >
                {gene.val}
              </div>
            ))}
          </div>
          <div className="text-[11px] font-mono text-slate-500 flex justify-between">
            <span>Inherited: {off1.filter((g) => g.from === 'A').length} from A, {off1.filter((g) => g.from === 'B').length} from B</span>
            <span>Fitness: {off1.reduce((sum, g) => sum + g.val, 0)}</span>
          </div>
        </div>

        {/* Offspring 2 */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-white">Offspring 2</span>
            <span className="text-xs font-mono text-slate-400">
              Bits: {off2.map((b) => b.val).join('')}
            </span>
          </div>
          <div className="flex gap-1.5 mb-2">
            {off2.map((gene, idx) => (
              <div
                key={idx}
                className={`flex-1 py-3 rounded-lg text-sm font-mono font-bold text-center border ${
                  gene.from === 'A'
                    ? 'bg-blue-500/30 border-blue-400 text-blue-200'
                    : 'bg-purple-500/30 border-purple-400 text-purple-200'
                }`}
              >
                {gene.val}
              </div>
            ))}
          </div>
          <div className="text-[11px] font-mono text-slate-500 flex justify-between">
            <span>Inherited: {off2.filter((g) => g.from === 'A').length} from A, {off2.filter((g) => g.from === 'B').length} from B</span>
            <span>Fitness: {off2.reduce((sum, g) => sum + g.val, 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
