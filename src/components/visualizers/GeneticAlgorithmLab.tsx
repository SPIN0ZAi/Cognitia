import React, { useState, useEffect } from 'react';
import {
  Dna,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Crown,
  TrendingUp,
  Activity,
  Award,
} from 'lucide-react';

export type BenchmarkProblem = 'onemax' | 'knapsack' | 'target-string';

interface KnapsackItem {
  id: number;
  name: string;
  weight: number;
  value: number;
}

const KNAPSACK_ITEMS: KnapsackItem[] = [
  { id: 0, name: 'Item 1', weight: 4, value: 12 },
  { id: 1, name: 'Item 2', weight: 6, value: 20 },
  { id: 2, name: 'Item 3', weight: 3, value: 10 },
  { id: 3, name: 'Item 4', weight: 7, value: 25 },
  { id: 4, name: 'Item 5', weight: 5, value: 18 },
  { id: 5, name: 'Item 6', weight: 8, value: 30 },
  { id: 6, name: 'Item 7', weight: 2, value: 8 },
  { id: 7, name: 'Item 8', weight: 4, value: 15 },
];
const KNAPSACK_CAPACITY = 20;

const TARGET_PHRASE = 'GENETIC 2027';

interface Individual {
  id: number;
  genes: number[];
  fitness: number;
  isElite?: boolean;
  selectedRole?: 'parent1' | 'parent2' | null;
  weightUsed?: number;
  decodedString?: string;
}

type StepPhase = 'evaluate' | 'selection' | 'crossover' | 'mutation';

export const GeneticAlgorithmLab: React.FC = () => {
  // Problem Configuration
  const [problem, setProblem] = useState<BenchmarkProblem>('onemax');
  const [popSize] = useState<number>(16);
  const [crossoverRate, setCrossoverRate] = useState<number>(0.85);
  const [mutationRate, setMutationRate] = useState<number>(0.05);
  const [elitismCount, setElitismCount] = useState<number>(2);
  const [selectionMethod, setSelectionMethod] = useState<'roulette' | 'tournament'>('tournament');
  const [tournamentSize] = useState<number>(2);

  // Runtime State
  const [generation, setGeneration] = useState<number>(0);
  const [currentPhase, setCurrentPhase] = useState<StepPhase>('evaluate');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(350);

  // Get Chromosome Length based on problem
  const getChromosomeLength = () => {
    if (problem === 'knapsack') return KNAPSACK_ITEMS.length; // 8 bits
    if (problem === 'target-string') return TARGET_PHRASE.length * 6; // 6-bit per char
    return 16; // 16 bits for OneMax
  };

  // Fitness calculation
  const computeFitness = (genes: number[]): { fitness: number; weight?: number; decoded?: string } => {
    if (problem === 'onemax') {
      const sum = genes.reduce((acc, bit) => acc + bit, 0);
      return { fitness: sum };
    }

    if (problem === 'knapsack') {
      let totalW = 0;
      let totalV = 0;
      genes.forEach((bit, idx) => {
        if (bit === 1 && KNAPSACK_ITEMS[idx]) {
          totalW += KNAPSACK_ITEMS[idx].weight;
          totalV += KNAPSACK_ITEMS[idx].value;
        }
      });
      // Penalty function for capacity violation
      let fit = totalV;
      if (totalW > KNAPSACK_CAPACITY) {
        fit = Math.max(0, totalV - (totalW - KNAPSACK_CAPACITY) * 6);
      }
      return { fitness: fit, weight: totalW };
    }

    // Target String: 6 bits per character (ASCII 32 to 95)
    let matchedChars = 0;
    let decoded = '';
    const charLen = TARGET_PHRASE.length;
    for (let c = 0; c < charLen; c++) {
      const chunk = genes.slice(c * 6, (c + 1) * 6);
      const val = chunk.reduce((acc, bit, i) => acc + bit * Math.pow(2, 5 - i), 0);
      const ascii = 32 + (val % 64);
      const char = String.fromCharCode(ascii);
      decoded += char;
      if (char === TARGET_PHRASE[c]) matchedChars++;
    }
    return { fitness: matchedChars, decoded };
  };

  // Create initial population
  const initPopulation = (size: number): Individual[] => {
    const len = getChromosomeLength();
    return Array.from({ length: size }, (_, i) => {
      const genes = Array.from({ length: len }, () => (Math.random() > 0.5 ? 1 : 0));
      const res = computeFitness(genes);
      return {
        id: i + 1,
        genes,
        fitness: res.fitness,
        weightUsed: res.weight,
        decodedString: res.decoded,
      };
    });
  };

  const [population, setPopulation] = useState<Individual[]>(() => initPopulation(16));
  const [fitnessHistory, setFitnessHistory] = useState<{ gen: number; best: number; avg: number }[]>([
    { gen: 0, best: 0, avg: 0 },
  ]);
  const [phaseLog, setPhaseLog] = useState<string>('Population initialized. Click Step or Play to evolve.');

  // Reset when problem or population size changes
  const resetLab = () => {
    const pop = initPopulation(popSize);
    const sorted = [...pop].sort((a, b) => b.fitness - a.fitness);
    const best = sorted[0]?.fitness ?? 0;
    const avg = Number((sorted.reduce((acc, ind) => acc + ind.fitness, 0) / pop.length).toFixed(2));

    setPopulation(sorted);
    setGeneration(0);
    setCurrentPhase('evaluate');
    setIsRunning(false);
    setFitnessHistory([{ gen: 0, best, avg }]);
    setPhaseLog('Simulation reset to generation 0.');
  };

  useEffect(() => {
    resetLab();
  }, [problem, popSize]);

  // Selection operators
  const selectOneParent = (pop: Individual[]): Individual => {
    if (selectionMethod === 'tournament') {
      const pool: Individual[] = [];
      for (let t = 0; t < tournamentSize; t++) {
        pool.push(pop[Math.floor(Math.random() * pop.length)]);
      }
      pool.sort((a, b) => b.fitness - a.fitness);
      return pool[0];
    } else {
      // Roulette Wheel (Fitness Proportional Selection)
      const minFit = Math.min(...pop.map((p) => p.fitness));
      const adjustedPop = pop.map((p) => ({ ...p, adjFitness: Math.max(1, p.fitness - minFit + 1) }));
      const totalFit = adjustedPop.reduce((acc, p) => acc + p.adjFitness, 0);
      let r = Math.random() * totalFit;
      for (const ind of adjustedPop) {
        r -= ind.adjFitness;
        if (r <= 0) return ind;
      }
      return pop[0];
    }
  };

  // Full generation step
  const executeGeneration = () => {
    const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
    const len = getChromosomeLength();
    const newPop: Individual[] = [];

    // 1. Elitism: preserve top individuals unaltered
    for (let e = 0; e < Math.min(elitismCount, sorted.length); e++) {
      newPop.push({
        ...sorted[e],
        id: e + 1,
        isElite: true,
        selectedRole: null,
      });
    }

    // 2. Offspring creation via Selection + Crossover + Mutation
    while (newPop.length < popSize) {
      const p1 = selectOneParent(sorted);
      const p2 = selectOneParent(sorted);

      let g1 = [...p1.genes];
      let g2 = [...p2.genes];

      // Crossover
      if (Math.random() < crossoverRate) {
        const cut = 1 + Math.floor(Math.random() * (len - 1));
        g1 = [...p1.genes.slice(0, cut), ...p2.genes.slice(cut)];
        g2 = [...p2.genes.slice(0, cut), ...p1.genes.slice(cut)];
      }

      // Mutation (bit-flip)
      g1 = g1.map((bit) => (Math.random() < mutationRate ? 1 - bit : bit));
      g2 = g2.map((bit) => (Math.random() < mutationRate ? 1 - bit : bit));

      const res1 = computeFitness(g1);
      newPop.push({
        id: newPop.length + 1,
        genes: g1,
        fitness: res1.fitness,
        weightUsed: res1.weight,
        decodedString: res1.decoded,
        isElite: false,
        selectedRole: null,
      });

      if (newPop.length < popSize) {
        const res2 = computeFitness(g2);
        newPop.push({
          id: newPop.length + 1,
          genes: g2,
          fitness: res2.fitness,
          weightUsed: res2.weight,
          decodedString: res2.decoded,
          isElite: false,
          selectedRole: null,
        });
      }
    }

    const nextSorted = newPop.sort((a, b) => b.fitness - a.fitness);
    const best = nextSorted[0].fitness;
    const avg = Number((nextSorted.reduce((acc, ind) => acc + ind.fitness, 0) / nextSorted.length).toFixed(2));
    const nextGen = generation + 1;

    setPopulation(nextSorted);
    setGeneration(nextGen);
    setCurrentPhase('evaluate');
    setFitnessHistory((prev) => [...prev.slice(-30), { gen: nextGen, best, avg }]);
    setPhaseLog(
      `Generation ${nextGen} complete: Best Fitness = ${best}, Average Fitness = ${avg}. Elites preserved = ${elitismCount}.`
    );
  };

  // Step-by-step lifecycle execution
  const executeStepPhase = () => {
    if (currentPhase === 'evaluate') {
      // Sort and identify elites
      const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
      const marked = sorted.map((ind, idx) => ({
        ...ind,
        isElite: idx < elitismCount,
        selectedRole: null,
      }));
      setPopulation(marked);
      setCurrentPhase('selection');
      setPhaseLog(
        `[Phase 1: Evaluation & Ranking] Population ranked. Top ${elitismCount} individual(s) marked as Elites with crown.`
      );
    } else if (currentPhase === 'selection') {
      // Pick 2 parents to demonstrate mating pool
      const p1 = selectOneParent(population);
      let p2 = selectOneParent(population);
      if (p2.id === p1.id && population.length > 1) {
        p2 = population.find((p) => p.id !== p1.id) || p2;
      }
      setPopulation((prev) =>
        prev.map((ind) => ({
          ...ind,
          selectedRole: ind.id === p1.id ? 'parent1' : ind.id === p2.id ? 'parent2' : null,
        }))
      );
      setCurrentPhase('crossover');
      setPhaseLog(
        `[Phase 2: Selection] Parents selected via ${selectionMethod.toUpperCase()} (P1: Individual #${p1.id}, P2: Individual #${p2.id}).`
      );
    } else if (currentPhase === 'crossover') {
      setCurrentPhase('mutation');
      setPhaseLog(
        `[Phase 3: Crossover] Parents crossed with probability Pc = ${crossoverRate}. Offspring genetic material exchanged.`
      );
    } else {
      // Mutation and finish generation
      executeGeneration();
    }
  };

  // Continuous loop
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isRunning) {
      timer = setInterval(() => {
        executeGeneration();
      }, speedMs);
    }
    return () => {
      clearInterval(timer);
    };
  }, [isRunning, speedMs, generation, population, crossoverRate, mutationRate, elitismCount, selectionMethod]);

  // Max fitness reference for chart scaling
  const maxPossibleFitness =
    problem === 'knapsack' ? 80 : problem === 'target-string' ? TARGET_PHRASE.length : 16;
  const bestIndividual = population[0];

  return (
    <div className="visualizer-container">
      {/* Header */}
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Dna size={20} style={{ color: 'var(--lab-accent-lime)' }} />
            Genetic Algorithm & Evolutionary Optimization Laboratory (Lesson 8)
          </div>
          <div className="visualizer-subtitle">
            Population Evolution, Selection Pressures, Crossover Recombination & Elitism Dynamics
          </div>
        </div>

        {/* Global Controls */}
        <div className="visualizer-controls">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`btn-tactile btn-sm ${isRunning ? 'btn-amber' : 'btn-emerald'}`}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
            <span>{isRunning ? 'Pause' : 'Evolve'}</span>
          </button>
          <button onClick={executeStepPhase} disabled={isRunning} className="btn-tactile btn-sm">
            <SkipForward size={14} />
            <span>Step Phase</span>
          </button>
          <button onClick={executeGeneration} disabled={isRunning} className="btn-tactile btn-sm">
            <Activity size={14} />
            <span>+1 Gen</span>
          </button>
          <button onClick={resetLab} className="btn-tactile btn-sm">
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="visualizer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Benchmark Problem Selector & Live Status Bar */}
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
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Benchmark:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(
                [
                  { id: 'onemax', label: 'OneMax (16-bit)' },
                  { id: 'knapsack', label: '0/1 Knapsack (Cap 20)' },
                  { id: 'target-string', label: 'Target String' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProblem(p.id)}
                  className={`btn-tactile btn-xs ${problem === p.id ? 'btn-primary' : ''}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Current Best Readout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Generation: </span>
              <strong className="font-mono" style={{ color: 'var(--lab-accent-cyan)' }}>
                {generation}
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Best Fitness: </span>
              <strong className="font-mono" style={{ color: 'var(--lab-accent-lime)' }}>
                {bestIndividual ? bestIndividual.fitness : 0}
              </strong>{' '}
              / {maxPossibleFitness}
            </div>
            {problem === 'target-string' && bestIndividual?.decodedString && (
              <div style={{ padding: '0.2rem 0.5rem', background: '#000', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <span className="font-mono text-emerald-400">"{bestIndividual.decodedString}"</span>
              </div>
            )}
          </div>
        </div>

        {/* Hyperparameter Deck */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            background: 'var(--lab-bg-obsidian)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--lab-border-active)',
          }}
        >
          {/* Crossover Rate */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Crossover Rate (Pc):</span>
              <strong className="font-mono" style={{ color: 'var(--lab-accent-cyan)' }}>
                {crossoverRate.toFixed(2)}
              </strong>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={crossoverRate}
              onChange={(e) => setCrossoverRate(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--lab-accent-cyan)' }}
            />
          </div>

          {/* Mutation Rate */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Mutation Rate (Pm):</span>
              <strong className="font-mono" style={{ color: 'var(--lab-accent-amber)' }}>
                {mutationRate.toFixed(3)}
              </strong>
            </div>
            <input
              type="range"
              min="0.005"
              max="0.2"
              step="0.005"
              value={mutationRate}
              onChange={(e) => setMutationRate(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--lab-accent-amber)' }}
            />
          </div>

          {/* Elitism Count */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Elitism Count:</span>
              <strong className="font-mono" style={{ color: 'var(--lab-accent-lime)' }}>
                {elitismCount} {elitismCount > 0 ? '👑' : ''}
              </strong>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0, 1, 2, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => setElitismCount(num)}
                  className={`btn-tactile btn-xs ${elitismCount === num ? 'btn-primary' : ''}`}
                  style={{ flex: 1 }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Selection Method */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Selection:</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {selectionMethod === 'tournament' ? `Tournament (k=${tournamentSize})` : 'Roulette Wheel'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setSelectionMethod('tournament')}
                className={`btn-tactile btn-xs ${selectionMethod === 'tournament' ? 'btn-primary' : ''}`}
                style={{ flex: 1 }}
              >
                Tournament
              </button>
              <button
                onClick={() => setSelectionMethod('roulette')}
                className={`btn-tactile btn-xs ${selectionMethod === 'roulette' ? 'btn-primary' : ''}`}
                style={{ flex: 1 }}
              >
                Roulette
              </button>
            </div>
          </div>

          {/* Speed */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Evolution Speed:</span>
              <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--lab-accent-cyan)' }}>
                {speedMs}ms
              </span>
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
              {[
                { label: 'Slow', ms: 700 },
                { label: 'Normal', ms: 350 },
                { label: 'Fast', ms: 100 },
                { label: 'Turbo', ms: 25 },
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSpeedMs(s.ms)}
                  className={`btn-tactile btn-xs ${speedMs === s.ms ? 'btn-primary' : ''}`}
                  style={{ flex: 1, padding: '0.2rem 0.3rem', fontSize: '0.65rem' }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Phase Log Callout */}
        <div
          style={{
            padding: '0.65rem 0.9rem',
            background: 'var(--lab-bg-surface)',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '3px solid var(--lab-accent-cyan)',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Award size={15} color="var(--lab-accent-cyan)" />
          <span>{phaseLog}</span>
        </div>

        {/* Dual Panels: Fitness Curves Chart & Population Chromosomes */}
        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Panel 1: Live SVG Fitness Curve */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700 }}>
                <TrendingUp size={16} color="var(--lab-accent-lime)" />
                <span>Fitness Convergence Trajectory</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--lab-accent-lime)' }} />
                  Best
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--lab-accent-cyan)' }} />
                  Average
                </span>
              </div>
            </div>

            {/* SVG Graph */}
            <div style={{ background: 'var(--lab-bg-obsidian)', borderRadius: '6px', border: '1px solid var(--border-subtle)', padding: '0.5rem' }}>
              <svg viewBox="0 0 380 180" style={{ width: '100%', height: '170px' }}>
                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
                  const y = 150 - ratio * 130;
                  return (
                    <g key={idx}>
                      <line x1="30" y1={y} x2="370" y2={y} stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
                      <text x="5" y={y + 3} fill="var(--text-muted)" fontSize="9" fontFamily="monospace">
                        {Math.round(ratio * maxPossibleFitness)}
                      </text>
                    </g>
                  );
                })}

                {/* Best Line */}
                {fitnessHistory.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="var(--lab-accent-lime)"
                    strokeWidth="2.5"
                    points={fitnessHistory
                      .map((h, i) => {
                        const x = 30 + (i / Math.max(1, fitnessHistory.length - 1)) * 340;
                        const y = 150 - (Math.min(maxPossibleFitness, h.best) / Math.max(1, maxPossibleFitness)) * 130;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                )}

                {/* Avg Line */}
                {fitnessHistory.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="var(--lab-accent-cyan)"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    points={fitnessHistory
                      .map((h, i) => {
                        const x = 30 + (i / Math.max(1, fitnessHistory.length - 1)) * 340;
                        const y = 150 - (Math.min(maxPossibleFitness, h.avg) / Math.max(1, maxPossibleFitness)) * 130;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                )}
              </svg>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
              Notice how Elitism prevents the Best curve from ever degrading, satisfying the Schema Theorem.
            </div>
          </div>

          {/* Panel 2: Live Population Chromosome Roster */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                Population Individuals ({population.length})
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Sorted by Fitness Descending
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
              {population.map((ind, rank) => {
                const fitPercent = Math.min(100, (ind.fitness / Math.max(1, maxPossibleFitness)) * 100);
                const isParent1 = ind.selectedRole === 'parent1';
                const isParent2 = ind.selectedRole === 'parent2';

                let border = '1px solid var(--border-subtle)';
                let bg = 'var(--lab-bg-surface)';
                if (ind.isElite) {
                  border = '1px solid var(--lab-accent-lime)';
                  bg = 'rgba(198, 242, 119, 0.05)';
                } else if (isParent1 || isParent2) {
                  border = '1px solid var(--lab-accent-amber)';
                  bg = 'rgba(233, 183, 119, 0.08)';
                }

                return (
                  <div
                    key={ind.id}
                    style={{
                      padding: '0.45rem 0.65rem',
                      borderRadius: '5px',
                      background: bg,
                      border: border,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.72rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="font-mono" style={{ color: 'var(--text-muted)', width: '20px' }}>
                        #{rank + 1}
                      </span>
                      {ind.isElite && (
                        <span title="Elite Individual">
                          <Crown size={12} color="var(--lab-accent-lime)" />
                        </span>
                      )}
                      {isParent1 && <span className="badge badge-amber font-mono" style={{ fontSize: '0.55rem' }}>P1</span>}
                      {isParent2 && <span className="badge badge-amber font-mono" style={{ fontSize: '0.55rem' }}>P2</span>}

                      {/* Genes pills */}
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {ind.genes.slice(0, 16).map((bit, bIdx) => (
                          <span
                            key={bIdx}
                            style={{
                              width: '10px',
                              height: '14px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.62rem',
                              fontFamily: 'var(--font-mono)',
                              borderRadius: '2px',
                              background: bit === 1 ? 'var(--lab-accent-lime)' : 'rgba(255,255,255,0.06)',
                              color: bit === 1 ? '#000' : 'var(--text-dim)',
                              fontWeight: bit === 1 ? 700 : 400,
                            }}
                          >
                            {bit}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Fitness Pill & Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {problem === 'knapsack' && ind.weightUsed !== undefined && (
                        <span style={{ fontSize: '0.65rem', color: ind.weightUsed > KNAPSACK_CAPACITY ? '#f87171' : 'var(--text-muted)' }}>
                          W:{ind.weightUsed}/20
                        </span>
                      )}
                      <strong className="font-mono" style={{ color: ind.isElite ? 'var(--lab-accent-lime)' : 'var(--lab-accent-cyan)' }}>
                        {ind.fitness}
                      </strong>
                      <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${fitPercent}%`, height: '100%', background: ind.isElite ? 'var(--lab-accent-lime)' : 'var(--lab-accent-cyan)' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
