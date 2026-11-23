import React, { useState, useEffect, useRef, useId } from 'react';

interface Individual {
  id: number;
  genes: number[];
  fitness: number;
  isSelected?: boolean;
}

export const GeneticAlgorithmLab: React.FC = () => {
  const chartGradientId = useId();
  const CHROMOSOME_LEN = 12;
  const [popSize] = useState<number>(16);
  const [crossoverRate, setCrossoverRate] = useState<number>(0.85);
  const [mutationRate, setMutationRate] = useState<number>(0.05);
  const [elitismCount, setElitismCount] = useState<number>(1);
  const [selectionMethod, setSelectionMethod] = useState<'roulette' | 'tournament'>('tournament');
  const [generation, setGeneration] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Compute fitness for an individual (OneMax with target bonus)
  const evalFitness = (genes: number[]) => {
    return genes.reduce((sum, bit) => sum + bit, 0);
  };

  const createRandomPop = (size: number): Individual[] => {
    return Array.from({ length: size }, (_, i) => {
      const genes = Array.from({ length: CHROMOSOME_LEN }, () => (Math.random() > 0.5 ? 1 : 0));
      return { id: i + 1, genes, fitness: evalFitness(genes) };
    });
  };

  const [population, setPopulation] = useState<Individual[]>(() => createRandomPop(16));
  const [fitnessHistory, setFitnessHistory] = useState<{ gen: number; best: number; avg: number }[]>([
    { gen: 0, best: 0, avg: 0 }
  ]);

  const timerRef = useRef<number | null>(null);

  // Re-calculate statistics whenever population changes
  useEffect(() => {
    if (population.length > 0) {
      const best = Math.max(...population.map((ind) => ind.fitness));
      const avg = population.reduce((sum, ind) => sum + ind.fitness, 0) / population.length;
      if (generation === 0) {
        setFitnessHistory([{ gen: 0, best, avg }]);
      }
    }
  }, [population.length]);

  // Selection operators
  const selectParent = (pop: Individual[]): Individual => {
    if (selectionMethod === 'tournament') {
      // Binary tournament
      const a = pop[Math.floor(Math.random() * pop.length)];
      const b = pop[Math.floor(Math.random() * pop.length)];
      return a.fitness >= b.fitness ? a : b;
    } else {
      // Roulette Wheel (Fitness Proportional)
      const totalFitness = pop.reduce((sum, ind) => sum + Math.max(1, ind.fitness), 0);
      let r = Math.random() * totalFitness;
      for (const ind of pop) {
        r -= Math.max(1, ind.fitness);
        if (r <= 0) return ind;
      }
      return pop[pop.length - 1];
    }
  };

  const stepGeneration = () => {
    // 1. Sort population by fitness descending
    const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
    const newPop: Individual[] = [];

    // 2. Elitism: directly preserve top individuals
    for (let e = 0; e < elitismCount; e++) {
      if (sorted[e]) {
        newPop.push({
          id: newPop.length + 1,
          genes: [...sorted[e].genes],
          fitness: sorted[e].fitness,
        });
      }
    }

    // 3. Reproduction loop (crossover + mutation)
    while (newPop.length < popSize) {
      const p1 = selectParent(population);
      const p2 = selectParent(population);

      let off1Genes = [...p1.genes];
      let off2Genes = [...p2.genes];

      // Crossover
      if (Math.random() < crossoverRate) {
        const cut = 1 + Math.floor(Math.random() * (CHROMOSOME_LEN - 1));
        off1Genes = [...p1.genes.slice(0, cut), ...p2.genes.slice(cut)];
        off2Genes = [...p2.genes.slice(0, cut), ...p1.genes.slice(cut)];
      }

      // Mutation
      off1Genes = off1Genes.map((bit) => (Math.random() < mutationRate ? 1 - bit : bit));
      off2Genes = off2Genes.map((bit) => (Math.random() < mutationRate ? 1 - bit : bit));

      newPop.push({
        id: newPop.length + 1,
        genes: off1Genes,
        fitness: evalFitness(off1Genes),
      });

      if (newPop.length < popSize) {
        newPop.push({
          id: newPop.length + 1,
          genes: off2Genes,
          fitness: evalFitness(off2Genes),
        });
      }
    }

    const nextGen = generation + 1;
    const best = Math.max(...newPop.map((ind) => ind.fitness));
    const avg = newPop.reduce((sum, ind) => sum + ind.fitness, 0) / newPop.length;

    setPopulation(newPop);
    setGeneration(nextGen);
    setFitnessHistory((prev) => [...prev.slice(-30), { gen: nextGen, best, avg }]);

    if (best === CHROMOSOME_LEN) {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(stepGeneration, 400);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, population, generation, popSize, crossoverRate, mutationRate, elitismCount, selectionMethod]);

  const handleReset = () => {
    setIsRunning(false);
    setGeneration(0);
    const newPop = createRandomPop(popSize);
    setPopulation(newPop);
    const best = Math.max(...newPop.map((ind) => ind.fitness));
    const avg = newPop.reduce((sum, ind) => sum + ind.fitness, 0) / newPop.length;
    setFitnessHistory([{ gen: 0, best, avg }]);
  };

  const bestInd = population.reduce((best, cur) => (cur.fitness > best.fitness ? cur : best), population[0]);

  return (
    <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Interactive Laboratory 8.1
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Genetic Algorithm Evolution Simulator
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Slide 15–38: Evolve a population across generations using selection, crossover, mutation, and elitism.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold shadow-lg shadow-cyan-500/20'
            }`}
          >
            {isRunning ? 'Pause' : 'Auto Evolve'}
          </button>
          <button
            onClick={stepGeneration}
            disabled={isRunning}
            className="px-3.5 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 disabled:opacity-40"
          >
            Step Gen
          </button>
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-700"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Evolution Hyperparameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
        <div>
          <label className="text-xs font-medium text-slate-400 block mb-1">Selection Method</label>
          <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setSelectionMethod('tournament')}
              className={`py-1 text-xs rounded font-medium ${
                selectionMethod === 'tournament' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              Tournament (k=2)
            </button>
            <button
              onClick={() => setSelectionMethod('roulette')}
              className={`py-1 text-xs rounded font-medium ${
                selectionMethod === 'roulette' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              Roulette Wheel
            </button>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Crossover Prob (p_c):</span>
            <span className="font-mono text-cyan-400 font-bold">{crossoverRate.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.4"
            max="1.0"
            step="0.05"
            value={crossoverRate}
            onChange={(e) => setCrossoverRate(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Mutation Prob (p_m):</span>
            <span className="font-mono text-amber-400 font-bold">{mutationRate.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min="0.005"
            max="0.2"
            step="0.005"
            value={mutationRate}
            onChange={(e) => setMutationRate(parseFloat(e.target.value))}
            className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Elitism Count:</span>
            <span className="font-mono text-emerald-400 font-bold">{elitismCount} individual(s)</span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[0, 1, 2].map((cnt) => (
              <button
                key={cnt}
                onClick={() => setElitismCount(cnt)}
                className={`py-1 text-xs rounded font-medium ${
                  elitismCount === cnt ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                e={cnt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fitness Evolution History Curve */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="text-slate-400 font-mono">
            Generation: <strong className="text-white">{generation}</strong> | Best:{' '}
            <strong className="text-emerald-400">{bestInd?.fitness}/{CHROMOSOME_LEN}</strong>
          </span>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-0.5 bg-emerald-400"></span> Best Fitness
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-0.5 bg-cyan-400"></span> Average Fitness
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">Target (12)</span>
          </div>
        </div>

        <div className="h-40 w-full relative">
          <svg className="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id={chartGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Target line at 12 */}
            <line x1="10" y1="10" x2="590" y2="10" stroke="#334155" strokeDasharray="3,3" strokeWidth="1" />

            {/* Grid baseline */}
            <line x1="10" y1="110" x2="590" y2="110" stroke="#1e293b" strokeWidth="1" />

            {/* Area fill for best fitness */}
            {fitnessHistory.length > 1 && (
              <polygon
                points={`10,110 ${fitnessHistory
                  .map((h, idx) => {
                    const x = 10 + (idx / Math.max(1, fitnessHistory.length - 1)) * 580;
                    const y = 110 - (h.best / CHROMOSOME_LEN) * 100;
                    return `${x},${y}`;
                  })
                  .join(' ')} 590,110`}
                fill={`url(#${chartGradientId})`}
              />
            )}

            {/* Best fitness polyline */}
            {fitnessHistory.length > 1 && (
              <polyline
                points={fitnessHistory
                  .map((h, idx) => {
                    const x = 10 + (idx / Math.max(1, fitnessHistory.length - 1)) * 580;
                    const y = 110 - (h.best / CHROMOSOME_LEN) * 100;
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
              />
            )}

            {/* Average fitness polyline */}
            {fitnessHistory.length > 1 && (
              <polyline
                points={fitnessHistory
                  .map((h, idx) => {
                    const x = 10 + (idx / Math.max(1, fitnessHistory.length - 1)) * 580;
                    const y = 110 - (h.avg / CHROMOSOME_LEN) * 100;
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="4,2"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Population Chromosome Grid */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
        <div className="text-xs text-slate-400 mb-3 flex justify-between items-center">
          <span>Population Chromosomes (N={population.length})</span>
          <span className="text-slate-500 font-mono text-[11px]">Green: Gene=1 | Dark: Gene=0</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {population.map((ind, idx) => {
            const isBest = ind.fitness === bestInd?.fitness;
            return (
              <div
                key={ind.id}
                className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                  isBest
                    ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-slate-400 text-[10px]">Ind #{idx + 1}</span>
                  <span className={`font-bold ${isBest ? 'text-emerald-400' : 'text-slate-300'}`}>
                    f = {ind.fitness}
                  </span>
                </div>

                {/* Genes bitstring visually */}
                <div className="flex gap-0.5">
                  {ind.genes.map((bit, bIdx) => (
                    <span
                      key={bIdx}
                      className={`flex-1 h-3.5 rounded-[2px] transition-colors ${
                        bit === 1 ? 'bg-emerald-400' : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
