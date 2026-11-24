import React, { useState, useEffect, useRef, useId } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Flame,
  Snowflake,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Thermometer,
  Zap,
  Activity,
  Layers
} from 'lucide-react';

interface HistoryPoint {
  step: number;
  cost: number;
  temp: number;
  type: 'improve' | 'escape' | 'reject';
}

interface LastMoveRecord {
  step: number;
  from: number;
  candidate: number;
  fromCost: number;
  candCost: number;
  delta: number;
  temp: number;
  prob: number;
  roll: number;
  accepted: boolean;
  reason: string;
}

export const SimulatedAnnealingLab: React.FC = () => {
  const chartGradientId = useId();
  const glowFilterId = useId();

  // Problem Mode: 1D Landscape vs TSP Permutation
  const [problemMode, setProblemMode] = useState<'landscape' | 'tsp'>('landscape');

  // Multimodal 1D minimization landscape (25 discrete states, x in [0..24])
  // Peaks at ends, local trap at x=5 (f=15), deep trap at x=11 (f=12), global min at x=18 (f=4)
  const costLandscape = [
    32, 28, 24, 20, 16, 15, 17, 21, 26, 23, 17, 12, 16, 23, 29, 25, 17, 9, 4, 10, 16, 23, 28, 30, 33
  ];

  // 1D Landscape State
  const [currentIdx, setCurrentIdx] = useState<number>(3);
  const [bestIdx, setBestIdx] = useState<number>(3);
  const [temperature, setTemperature] = useState<number>(15.0);
  const [initialTemp, setInitialTemp] = useState<number>(15.0);
  const [alpha, setAlpha] = useState<number>(0.92);
  const [stepsPerTemp, setStepsPerTemp] = useState<number>(3); // Markov chain length L (Slide 50)
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stepCounter, setStepCounter] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'simulator' | 'metropolis-sandbox' | 'prediction'>('simulator');

  // Trajectory history
  const [lastMove, setLastMove] = useState<LastMoveRecord | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([
    { step: 0, cost: costLandscape[3], temp: 15.0, type: 'improve' }
  ]);

  // Prediction Challenge State
  const [pendingCandidate, setPendingCandidate] = useState<number | null>(null);
  const [userPrediction, setUserPrediction] = useState<'accept' | 'reject' | null>(null);
  const [predictionFeedback, setPredictionFeedback] = useState<string | null>(null);
  const [predictionScore, setPredictionScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  // Metropolis Sandbox Interactive Calculator
  const [calcTemp, setCalcTemp] = useState<number>(10.0);
  const [calcDelta, setCalcDelta] = useState<number>(4.0);

  // TSP Annealing Problem State (7 cities)
  const tspCities = [
    { id: 0, label: 'A', x: 80, y: 80 },
    { id: 1, label: 'B', x: 220, y: 190 },
    { id: 2, label: 'C', x: 340, y: 70 },
    { id: 3, label: 'D', x: 380, y: 210 },
    { id: 4, label: 'E', x: 250, y: 80 },
    { id: 5, label: 'F', x: 120, y: 220 },
  ];
  const [tspTour, setTspTour] = useState<number[]>([0, 1, 2, 3, 4, 5]);

  // Compute TSP tour distance
  const computeTSPDistance = (t: number[]) => {
    let sum = 0;
    for (let i = 0; i < t.length; i++) {
      const c1 = tspCities[t[i]];
      const c2 = tspCities[t[(i + 1) % t.length]];
      sum += Math.sqrt((c1.x - c2.x) ** 2 + (c1.y - c2.y) ** 2);
    }
    return Math.round(sum);
  };

  const tspDistance = computeTSPDistance(tspTour);

  // References for tear-free animation loop
  const stateRef = useRef({
    currentIdx: 3,
    bestIdx: 3,
    temperature: 15.0,
    alpha: 0.92,
    stepsPerTemp: 3,
    stepCounter: 0,
    isRunning: false,
    problemMode: 'landscape' as 'landscape' | 'tsp',
    tspTour: [0, 1, 2, 3, 4, 5]
  });

  useEffect(() => {
    stateRef.current = {
      currentIdx,
      bestIdx,
      temperature,
      alpha,
      stepsPerTemp,
      stepCounter,
      isRunning,
      problemMode,
      tspTour
    };
  }, [currentIdx, bestIdx, temperature, alpha, stepsPerTemp, stepCounter, isRunning, problemMode, tspTour]);

  // Speed delay map
  const speedDelay = speed === 'slow' ? 650 : speed === 'normal' ? 300 : 100;

  // Single SA Step Execution
  const stepSA = () => {
    const cur = stateRef.current;
    if (cur.temperature < 0.15) {
      setIsRunning(false);
      return;
    }

    if (cur.problemMode === 'landscape') {
      // 1D Landscape
      const neighbors: number[] = [];
      if (cur.currentIdx > 0) neighbors.push(cur.currentIdx - 1);
      if (cur.currentIdx < costLandscape.length - 1) neighbors.push(cur.currentIdx + 1);

      const candidate = neighbors[Math.floor(Math.random() * neighbors.length)];
      const currentCost = costLandscape[cur.currentIdx];
      const candidateCost = costLandscape[candidate];
      const delta = candidateCost - currentCost; // Minimization: delta <= 0 is better

      let accepted = false;
      let prob = 1.0;
      const roll = Math.random();
      let reason = '';
      let moveType: 'improve' | 'escape' | 'reject' = 'improve';

      if (delta <= 0) {
        accepted = true;
        prob = 1.0;
        moveType = 'improve';
        reason = `Improvement (Δ = ${delta} ≤ 0): 100% deterministic acceptance.`;
      } else {
        prob = Math.exp(-delta / cur.temperature);
        if (roll <= prob) {
          accepted = true;
          moveType = 'escape';
          reason = `Metropolis escape: Roll ${roll.toFixed(3)} ≤ P(${prob.toFixed(3)}). Worsening step accepted!`;
        } else {
          accepted = false;
          moveType = 'reject';
          reason = `Metropolis barrier: Roll ${roll.toFixed(3)} > P(${prob.toFixed(3)}). Worsening step rejected.`;
        }
      }

      const nextStep = cur.stepCounter + 1;
      const record: LastMoveRecord = {
        step: nextStep,
        from: cur.currentIdx,
        candidate,
        fromCost: currentCost,
        candCost: candidateCost,
        delta,
        temp: cur.temperature,
        prob,
        roll,
        accepted,
        reason
      };

      setLastMove(record);

      let nextCurrent = cur.currentIdx;
      if (accepted) {
        nextCurrent = candidate;
        setCurrentIdx(candidate);
        if (candidateCost < costLandscape[cur.bestIdx]) {
          setBestIdx(candidate);
        }
      }

      // Cooling logic
      let nextTemp = cur.temperature;
      if (nextStep % cur.stepsPerTemp === 0) {
        nextTemp = Math.max(0.1, cur.temperature * cur.alpha);
        setTemperature(nextTemp);
      }
      setStepCounter(nextStep);

      setHistory((prev) => [
        ...prev.slice(-35),
        { step: nextStep, cost: costLandscape[nextCurrent], temp: nextTemp, type: moveType }
      ]);
    } else {
      // TSP Mode: 2-opt move under Simulated Annealing
      const n = cur.tspTour.length;
      const i = Math.floor(Math.random() * (n - 1));
      const j = i + 1 + Math.floor(Math.random() * (n - 1 - i));

      // Reverse subsegment from i+1 to j
      const candidateTour = [...cur.tspTour];
      let left = i + 1;
      let right = j;
      while (left < right) {
        const tmp = candidateTour[left];
        candidateTour[left] = candidateTour[right];
        candidateTour[right] = tmp;
        left++;
        right--;
      }

      const curDist = computeTSPDistance(cur.tspTour);
      const candDist = computeTSPDistance(candidateTour);
      const delta = candDist - curDist;

      let accepted = false;
      let prob = 1.0;
      const roll = Math.random();

      if (delta <= 0) {
        accepted = true;
        prob = 1.0;
      } else {
        prob = Math.exp(-delta / (cur.temperature * 10)); // Scaled for TSP distances
        accepted = roll <= prob;
      }

      const nextStep = cur.stepCounter + 1;
      let nextTour = cur.tspTour;
      if (accepted) {
        nextTour = candidateTour;
        setTspTour(candidateTour);
      }

      let nextTemp = cur.temperature;
      if (nextStep % cur.stepsPerTemp === 0) {
        nextTemp = Math.max(0.1, cur.temperature * cur.alpha);
        setTemperature(nextTemp);
      }
      setStepCounter(nextStep);

      setHistory((prev) => [
        ...prev.slice(-35),
        {
          step: nextStep,
          cost: computeTSPDistance(nextTour),
          temp: nextTemp,
          type: delta <= 0 ? 'improve' : accepted ? 'escape' : 'reject'
        }
      ]);
    }
  };

  // Run loop
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isRunning) {
      timer = setInterval(() => {
        if (stateRef.current.temperature < 0.15) {
          setIsRunning(false);
        } else {
          stepSA();
        }
      }, speedDelay);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, speedDelay]);

  // Handle Reset
  const handleReset = (newStart = 3, newInitialT = initialTemp) => {
    setIsRunning(false);
    setCurrentIdx(newStart);
    setBestIdx(newStart);
    setTemperature(newInitialT);
    setInitialTemp(newInitialT);
    setStepCounter(0);
    setLastMove(null);
    setTspTour([0, 1, 2, 3, 4, 5]);
    setHistory([{ step: 0, cost: costLandscape[newStart], temp: newInitialT, type: 'improve' }]);
    setPendingCandidate(null);
    setUserPrediction(null);
    setPredictionFeedback(null);
  };

  // Trigger Prediction
  const handlePreparePrediction = () => {
    setIsRunning(false);
    setUserPrediction(null);
    setPredictionFeedback(null);

    const neighbors: number[] = [];
    if (currentIdx > 0) neighbors.push(currentIdx - 1);
    if (currentIdx < costLandscape.length - 1) neighbors.push(currentIdx + 1);

    const candidate = neighbors[Math.floor(Math.random() * neighbors.length)];
    setPendingCandidate(candidate);
  };

  const handleCommitPrediction = (guess: 'accept' | 'reject') => {
    if (pendingCandidate === null) return;
    setUserPrediction(guess);

    const delta = costLandscape[pendingCandidate] - costLandscape[currentIdx];
    let prob = 1.0;
    if (delta > 0) {
      prob = Math.exp(-delta / temperature);
    }
    const roll = Math.random();
    const actualAccepted = delta <= 0 || roll <= prob;

    const isUserCorrect = (guess === 'accept' && actualAccepted) || (guess === 'reject' && !actualAccepted);

    setPredictionScore((prev) => ({
      correct: prev.correct + (isUserCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    setPredictionFeedback(
      isUserCorrect
        ? `Spot on! Candidate x'=${pendingCandidate} has Δ=${delta > 0 ? `+${delta}` : delta}. With T=${temperature.toFixed(2)}, P=${prob.toFixed(3)} and roll=${roll.toFixed(3)} → ${actualAccepted ? 'Accepted' : 'Rejected'}.`
        : `Not quite. Candidate x'=${pendingCandidate} has Δ=${delta > 0 ? `+${delta}` : delta}. With T=${temperature.toFixed(2)}, P=${prob.toFixed(3)} and roll=${roll.toFixed(3)} → ${actualAccepted ? 'Accepted' : 'Rejected'}.`
    );

    stepSA();
    setPendingCandidate(null);
  };

  // Temperature phase indicator
  const getPhaseInfo = (t: number) => {
    if (t > 8.0) {
      return {
        label: 'Hot Liquid Plasma',
        desc: 'Wide thermal motion. Metropolis accepts almost any worsening climb (exploration dominates).',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        icon: Flame
      };
    }
    if (t > 1.5) {
      return {
        label: 'Annealing Transition',
        desc: 'Selective barrier leaps. Escapes local minima while condensing into high-quality valleys.',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10 border-cyan-500/30',
        icon: Zap
      };
    }
    return {
      label: 'Crystalline Freezing',
      desc: 'T → 0. Converges to pure greedy Hill Climbing (downhill moves only).',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/30',
      icon: Snowflake
    };
  };

  const phase = getPhaseInfo(temperature);
  const PhaseIcon = phase.icon;

  const getClimberColor = (t: number) => {
    if (t > 8) return '#f59e0b';
    if (t > 3) return '#06b6d4';
    return '#3b82f6';
  };

  // Sandbox calculations
  const sandboxProb = calcDelta <= 0 ? 1.0 : Math.exp(-calcDelta / calcTemp);

  return (
    <div className="visualizer-container border-amber-500/30 shadow-2xl space-y-6">
      {/* Header */}
      <div className="visualizer-header border-b border-slate-800 pb-4">
        <div className="visualizer-title-area">
          <div className="flex items-center gap-2">
            <span className="badge badge-amber flex items-center gap-1.5">
              <Thermometer size={13} />
              Slides 48–54 · Thermodynamic Metaheuristic
            </span>
            <span className="text-xs text-slate-500 font-mono">Minimization Problem</span>
          </div>
          <h3 className="visualizer-title text-xl font-bold tracking-tight text-white flex items-center gap-2 mt-1">
            Simulated Annealing & The Metropolis Criterion
          </h3>
          <p className="visualizer-subtitle text-xs text-slate-400 mt-1 max-w-2xl">
            Simulates the metallurgical cooling of molten metal. By accepting worsening transitions with probability $P = \exp(-\Delta / T)$, the algorithm boldly jumps over barriers at high temperatures, freezing into the global optimum as $T \to 0$.
          </p>
        </div>

        {/* Global Controls */}
        <div className="visualizer-controls flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 mr-2 text-xs">
            {(['slow', 'normal', 'fast'] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeed(spd)}
                className={`px-2 py-1 rounded capitalize font-medium transition-colors ${
                  speed === spd ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsRunning(!isRunning)}
            disabled={temperature < 0.15}
            className={`btn-tactile text-xs flex items-center gap-1.5 ${
              isRunning ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'btn-primary'
            }`}
          >
            {isRunning ? (
              <>
                <Pause size={14} /> Pause Cooling
              </>
            ) : (
              <>
                <Play size={14} /> Cool & Run (T₀={initialTemp})
              </>
            )}
          </button>

          <button
            onClick={() => stepSA()}
            disabled={isRunning || temperature < 0.15}
            className="btn-tactile btn-sm flex items-center gap-1.5 text-xs text-slate-200"
          >
            <SkipForward size={14} /> Single Step
          </button>

          <button
            onClick={() => handleReset(3)}
            className="btn-tactile btn-sm flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'simulator'
              ? 'border-amber-400 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity size={14} />
          Thermodynamic Simulation Laboratory
        </button>
        <button
          onClick={() => setActiveTab('metropolis-sandbox')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'metropolis-sandbox'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap size={14} />
          Metropolis Probability Sandbox
        </button>
        <button
          onClick={() => setActiveTab('prediction')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'prediction'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle size={14} />
          Prediction Challenge ({predictionScore.correct}/{predictionScore.total})
        </button>
      </div>

      {/* TAB 1: THERMODYNAMIC SIMULATION */}
      {activeTab === 'simulator' && (
        <div className="space-y-5">
          {/* Top Info Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Temperature Thermometer Indicator */}
            <div className={`p-3 rounded-xl border ${phase.bg} flex flex-col justify-between`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <PhaseIcon size={14} className={phase.color} />
                  Thermal State
                </span>
                <span className={`text-xs font-bold font-mono ${phase.color}`}>{phase.label.split(' ')[0]}</span>
              </div>
              <div className="mt-2">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs text-slate-400 font-mono">Temp T:</span>
                  <span className="text-xl font-bold font-mono text-white">{temperature.toFixed(2)}</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, (temperature / initialTemp) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1 flex justify-between">
                  <span>Chain: {(stepCounter % stepsPerTemp) + 1} / {stepsPerTemp} moves</span>
                  <span className="text-slate-400">T_next: {(temperature * alpha).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Current Position / Energy */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Current Energy</span>
              <div className="mt-1 flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-mono font-bold text-cyan-400">
                    {problemMode === 'landscape' ? `x = ${currentIdx}` : `Tour`}
                  </span>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Cost = <strong className="text-white">{problemMode === 'landscape' ? costLandscape[currentIdx] : tspDistance}</strong>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-slate-500">Steps</span>
                  <div className="text-sm font-mono text-slate-300">{stepCounter}</div>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1">
                {problemMode === 'landscape' ? 'Target: Global Min x=18 (f=4)' : 'Target: Crossing-free tour'}
              </span>
            </div>

            {/* Best Found State */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles size={13} className="text-emerald-400" />
                Best State Visited
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-mono font-bold text-emerald-400">
                    {problemMode === 'landscape' ? `x* = ${bestIdx}` : `Optimal Tour`}
                  </span>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Best Cost = <strong className="text-emerald-300">{costLandscape[bestIdx]}</strong>
                  </div>
                </div>
                {costLandscape[bestIdx] === 4 && (
                  <span className="badge badge-emerald text-[10px] font-bold">GLOBAL OPTIMUM</span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1">Retained throughout run</span>
            </div>

            {/* Hyperparameters Configuration */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div className="flex justify-between items-center text-xs text-slate-400 mb-0.5">
                <span>Cooling Schedule (α):</span>
                <span className="font-mono text-amber-400 font-bold">{alpha.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.80"
                max="0.98"
                step="0.01"
                value={alpha}
                onChange={(e) => setAlpha(parseFloat(e.target.value))}
                className="w-full accent-amber-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between items-center text-xs text-slate-400 mt-1 mb-0.5">
                <span>Markov Chain (L):</span>
                <span className="font-mono text-cyan-400 font-bold">{stepsPerTemp} steps</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={stepsPerTemp}
                onChange={(e) => setStepsPerTemp(parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />

              <div className="grid grid-cols-2 gap-1 mt-1.5">
                <button
                  onClick={() => {
                    setAlpha(0.80);
                    setStepsPerTemp(1);
                    setInitialTemp(8.0);
                    handleReset(3, 8.0);
                  }}
                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[9px] font-medium text-slate-300 rounded border border-slate-700 truncate"
                  title="Fast Quench: Freezes prematurely into local trap at x=11"
                >
                  Fast Quench (Trap)
                </button>
                <button
                  onClick={() => {
                    setAlpha(0.95);
                    setStepsPerTemp(4);
                    setInitialTemp(18.0);
                    handleReset(3, 18.0);
                  }}
                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[9px] font-medium text-amber-300 rounded border border-amber-500/30 truncate"
                  title="Slow Anneal: Climbs out of local traps into global minimum"
                >
                  Slow Anneal (Optimum)
                </button>
              </div>
            </div>
          </div>

          {/* Problem Selector Toggle */}
          <div className="flex items-center justify-between p-2 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2 pl-2">
              <Layers size={14} className="text-cyan-400" />
              Benchmark Domain:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setProblemMode('landscape');
                  setIsRunning(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  problemMode === 'landscape'
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                1D Multimodal Potential Landscape
              </button>
              <button
                onClick={() => {
                  setProblemMode('tsp');
                  setIsRunning(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  problemMode === 'tsp'
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                TSP Combinatorial Optimization (2-opt Annealing)
              </button>
            </div>
          </div>

          {/* Problem Visualization Stage */}
          {problemMode === 'landscape' ? (
            /* 1D Landscape Visualizer */
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800/80 relative overflow-hidden shadow-inner">
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 mb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white uppercase text-[11px] tracking-wide">
                    Energy Landscape: Cost f(x)
                  </span>
                  <span className="text-[11px] text-slate-500">(Minimization: lower elevation is superior)</span>
                </div>

                <div className="flex items-center gap-4 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 border border-white inline-block animate-pulse" />
                    <span className="text-slate-300">State x</span>
                  </div>
                  {lastMove && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full border-2 border-dashed border-amber-400 inline-block" />
                      <span className="text-amber-300">Candidate x'</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    <span className="text-slate-400">Local Trap x=11 (f=12)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                    <span className="text-emerald-300 font-semibold">Global Minimum x=18 (f=4)</span>
                  </div>
                </div>
              </div>

              {/* SVG Visualizer */}
              <div className="w-full h-64 relative">
                <svg className="w-full h-full" viewBox="0 0 920 220" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id={chartGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                      <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
                    </linearGradient>

                    <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Grid lines */}
                  {[10, 20, 30].map((costVal) => {
                    const y = 190 - costVal * 4.8;
                    return (
                      <g key={costVal}>
                        <line x1="30" y1={y} x2="890" y2={y} stroke="#1e293b" strokeDasharray="3,3" strokeWidth="1" />
                        <text x="22" y={y + 3} textAnchor="end" className="text-[9px] fill-slate-600 font-mono">
                          {costVal}
                        </text>
                      </g>
                    );
                  })}

                  {/* Shaded Area Under Terrain */}
                  <path
                    d={`M 35 190 ${costLandscape
                      .map((cost, idx) => `L ${35 + idx * 35.4} ${190 - cost * 4.8}`)
                      .join(' ')} L ${35 + 24 * 35.4} 190 Z`}
                    fill={`url(#${chartGradientId})`}
                  />

                  {/* Spline Surface Line */}
                  <polyline
                    points={costLandscape.map((cost, idx) => `${35 + idx * 35.4},${190 - cost * 4.8}`).join(' ')}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Candidate Jump Arc */}
                  {lastMove && (
                    <g>
                      <path
                        d={`M ${35 + lastMove.from * 35.4} ${190 - lastMove.fromCost * 4.8} Q ${
                          35 + ((lastMove.from + lastMove.candidate) / 2) * 35.4
                        } ${Math.min(190 - lastMove.fromCost * 4.8, 190 - lastMove.candCost * 4.8) - 30} ${
                          35 + lastMove.candidate * 35.4
                        } ${190 - lastMove.candCost * 4.8}`}
                        fill="none"
                        stroke={lastMove.accepted ? '#10b981' : '#f43f5e'}
                        strokeWidth="2"
                        strokeDasharray="4,4"
                      />
                    </g>
                  )}

                  {/* Nodes */}
                  {costLandscape.map((cost, idx) => {
                    const cx = 35 + idx * 35.4;
                    const cy = 190 - cost * 4.8;
                    const isCurrent = idx === currentIdx;
                    const isBest = idx === bestIdx;
                    const isGlobal = idx === 18;
                    const isTrap = idx === 11;
                    const isLocal1 = idx === 5;
                    const isCandidate = lastMove?.candidate === idx;

                    return (
                      <g key={idx} className="cursor-pointer group" onClick={() => handleReset(idx)}>
                        <rect x={cx - 16} y={15} width={32} height={190} fill="transparent" />

                        <line
                          x1={cx}
                          y1={cy}
                          x2={cx}
                          y2={195}
                          stroke={isCurrent ? '#06b6d4' : isCandidate ? '#f59e0b' : '#1e293b'}
                          strokeDasharray={isCurrent ? 'none' : '2,2'}
                          strokeWidth={isCurrent || isCandidate ? 1.5 : 1}
                        />

                        {isCandidate && !isCurrent && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={12}
                            fill="none"
                            stroke={lastMove?.accepted ? '#10b981' : '#f43f5e'}
                            strokeWidth="2"
                            strokeDasharray="3,3"
                          />
                        )}

                        <circle
                          cx={cx}
                          cy={cy}
                          r={isCurrent ? 8 : isGlobal ? 6 : isTrap || isLocal1 ? 5 : 3.5}
                          fill={
                            isCurrent
                              ? getClimberColor(temperature)
                              : isGlobal
                              ? '#34d399'
                              : isTrap
                              ? '#f43f5e'
                              : isBest
                              ? '#fbbf24'
                              : '#475569'
                          }
                          stroke={isCurrent ? '#ffffff' : '#0f172a'}
                          strokeWidth={isCurrent ? 2.5 : 1.5}
                          filter={isCurrent ? `url(#${glowFilterId})` : undefined}
                        />

                        <text x={cx} y={208} textAnchor="middle" className="text-[10px] fill-slate-500 font-mono">
                          {idx}
                        </text>

                        {(isCurrent || isGlobal || isTrap || isLocal1 || isCandidate) && (
                          <g>
                            <rect
                              x={cx - 14}
                              y={cy - 24}
                              width={28}
                              height={15}
                              rx={4}
                              fill="#090d16"
                              stroke={isCurrent ? '#06b6d4' : isCandidate ? '#f59e0b' : isGlobal ? '#10b981' : '#334155'}
                              strokeWidth={1}
                            />
                            <text
                              x={cx}
                              y={cy - 13}
                              textAnchor="middle"
                              className={`text-[9px] font-mono font-bold ${
                                isCurrent ? 'fill-cyan-300' : isCandidate ? 'fill-amber-300' : isGlobal ? 'fill-emerald-400' : 'fill-slate-300'
                              }`}
                            >
                              {cost}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Live Decision Bar */}
              <div className="mt-4 p-3.5 bg-slate-900 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500 mb-1">Last Transition Proposed</div>
                  {lastMove ? (
                    <div className="font-mono text-xs text-slate-300">
                      <span className="text-cyan-400 font-bold">x={lastMove.from}</span> (f={lastMove.fromCost}) ➜{' '}
                      <span className="text-amber-400 font-bold">x'={lastMove.candidate}</span> (f={lastMove.candCost})
                      <div className="mt-0.5">
                        <span className={lastMove.delta <= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          Energy Δ = {lastMove.delta > 0 ? `+${lastMove.delta}` : lastMove.delta}
                        </span>{' '}
                        <span className="text-slate-500 text-[11px]">
                          ({lastMove.delta <= 0 ? 'Downhill improvement' : 'Uphill worsening'})
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 font-mono text-xs">Ready. Click 'Cool & Run' or 'Single Step'.</div>
                  )}
                </div>

                <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4">
                  <div className="text-[10px] uppercase font-mono text-slate-500 mb-1">Metropolis Acceptance Formula</div>
                  {lastMove ? (
                    <div className="font-mono text-xs">
                      {lastMove.delta <= 0 ? (
                        <span className="text-emerald-400 font-semibold">P(accept) = 1.00 (100% Guaranteed)</span>
                      ) : (
                        <div>
                          <span className="text-slate-300">
                            P = exp(-{lastMove.delta} / {lastMove.temp.toFixed(2)}) ={' '}
                            <strong className="text-amber-300">{lastMove.prob.toFixed(4)}</strong>
                          </span>
                          <div className="text-[11px] text-slate-400">
                            Random roll <strong className="text-white">{lastMove.roll.toFixed(4)}</strong> vs P:
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-500 font-mono text-xs">P(accept) = exp(-Δ / T) for worsening Δ &gt; 0</div>
                  )}
                </div>

                <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4 flex flex-col justify-center">
                  <div className="text-[10px] uppercase font-mono text-slate-500 mb-1">Outcome</div>
                  {lastMove ? (
                    <div className="flex items-center gap-2">
                      {lastMove.accepted ? (
                        <span className="badge badge-emerald flex items-center gap-1 text-xs">
                          <CheckCircle2 size={13} />
                          ACCEPTED
                        </span>
                      ) : (
                        <span className="badge badge-rose flex items-center gap-1 text-xs">
                          <XCircle size={13} />
                          REJECTED
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 truncate max-w-[200px]" title={lastMove.reason}>
                        {lastMove.reason}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-500 text-xs font-mono">No moves evaluated yet</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* TSP Annealing Visualizer */
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="font-mono font-bold text-white uppercase">
                  TSP Permutation Tour Under Metropolis Cooling (Distance: {tspDistance})
                </span>
                <span className="text-cyan-400 font-mono">
                  At High T: Random crossings accepted · At Low T: Smooth crystallization
                </span>
              </div>

              <div className="w-full h-64 bg-slate-900/40 rounded-xl border border-slate-800 relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 460 260">
                  <polyline
                    points={[...tspTour, tspTour[0]]
                      .map((idx) => `${tspCities[idx].x},${tspCities[idx].y}`)
                      .join(' ')}
                    fill="none"
                    stroke={temperature > 5 ? '#f59e0b' : '#06b6d4'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {tspCities.map((city, idx) => (
                    <g key={idx}>
                      <circle cx={city.x} cy={city.y} r={12} fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                      <text x={city.x} y={city.y + 4} textAnchor="middle" className="text-xs font-mono font-bold fill-white">
                        {city.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          )}

          {/* Real-Time Cost History Timeline Chart */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <Activity size={14} className="text-cyan-400" />
                Thermodynamic Energy Convergence History (Last {history.length} Steps)
              </span>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  Improvement
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  Metropolis Escape
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  Rejected Move
                </span>
              </div>
            </div>

            <div className="h-20 w-full relative bg-slate-900/60 rounded-lg p-2 border border-slate-800/80 flex items-end">
              {history.map((pt, i) => {
                const heightPct = Math.max(8, Math.min(100, ((35 - pt.cost) / 32) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full px-0.5 group relative">
                    <div
                      className={`w-full rounded-t-sm transition-all ${
                        pt.type === 'improve'
                          ? 'bg-emerald-400/80'
                          : pt.type === 'escape'
                          ? 'bg-amber-400/80'
                          : 'bg-rose-500/50'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <div className="hidden group-hover:block absolute -top-8 z-30 bg-slate-950 border border-slate-700 px-1.5 py-0.5 rounded text-[9px] font-mono whitespace-nowrap text-white">
                      Step {pt.step}: Cost {pt.cost} (T={pt.temp.toFixed(1)})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: METROPOLIS PROBABILITY SANDBOX */}
      {activeTab === 'metropolis-sandbox' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
                <Zap size={18} />
              </span>
              <div>
                <h4 className="text-base font-bold text-white">Interactive Metropolis Criterion Calculator</h4>
                <p className="text-xs text-slate-400">
                  Manipulate Temperature (T) and Cost Deterioration (Δ) to see why high temperatures enable bold barrier leaps while low temperatures enforce strict hill-climbing discipline.
                </p>
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Temperature (T):</span>
                  <span className="font-mono text-cyan-400 font-bold text-base">{calcTemp.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="40.0"
                  step="0.2"
                  value={calcTemp}
                  onChange={(e) => setCalcTemp(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.2 (Cold / Greedy)</span>
                  <span>10.0 (Medium)</span>
                  <span>40.0 (Near Plasma)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Worsening Amount (Δ = Cost' - Cost):</span>
                  <span className="font-mono text-rose-400 font-bold text-base">+{calcDelta.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="25.0"
                  step="0.5"
                  value={calcDelta}
                  onChange={(e) => setCalcDelta(parseFloat(e.target.value))}
                  className="w-full accent-rose-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>+0.5 (Minor hill)</span>
                  <span>+10.0 (Steep barrier)</span>
                  <span>+25.0 (Huge mountain)</span>
                </div>
              </div>
            </div>

            {/* Live Calculation Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col justify-center">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Ratio -Δ / T</span>
                <span className="text-2xl font-mono font-bold text-slate-200 mt-1">
                  -{calcDelta.toFixed(1)} / {calcTemp.toFixed(1)} ={' '}
                  <span className="text-amber-400">{(-calcDelta / calcTemp).toFixed(3)}</span>
                </span>
                <span className="text-[10px] text-slate-500 mt-1">Exponent in Boltzmann distribution</span>
              </div>

              <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col justify-center">
                <span className="text-[11px] font-mono text-slate-400 uppercase">P(accept) = exp(-Δ / T)</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-mono font-bold text-emerald-400">{sandboxProb.toFixed(4)}</span>
                  <span className="text-sm font-mono text-slate-400">({(sandboxProb * 100).toFixed(1)}%)</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1">Probability of taking this worsening step</span>
              </div>

              <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col justify-center">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Interpretation</span>
                <span className="text-xs text-slate-200 mt-1 font-medium">
                  {sandboxProb > 0.7 ? (
                    <span className="text-emerald-400">Very High Probability: Almost certainly accepted!</span>
                  ) : sandboxProb > 0.3 ? (
                    <span className="text-amber-400">Moderate Probability: Frequent uphill escapes occur.</span>
                  ) : sandboxProb > 0.05 ? (
                    <span className="text-rose-400">Low Probability: Occasional rare leap over barriers.</span>
                  ) : (
                    <span className="text-slate-400">Effectively Zero: Barrier is insurmountable at this cold temp.</span>
                  )}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">Simulates random thermal vibration</span>
              </div>
            </div>

            {/* Probability Gauge Bar */}
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5">
                <span>Acceptance Probability Visual Gauge:</span>
                <span className="font-mono text-emerald-400 font-bold">{(sandboxProb * 100).toFixed(2)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-200"
                  style={{ width: `${Math.max(1, sandboxProb * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PREDICTION CHALLENGE */}
      {activeTab === 'prediction' && (
        <div className="space-y-5">
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <HelpCircle size={18} className="text-amber-400" />
                  Predict the Simulated Annealing Decision
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Test your mastery of the Metropolis criterion! Given the current state, temperature, candidate, and energy difference Δ, predict whether the step will be accepted or rejected.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 font-mono">Accuracy Score</span>
                <div className="text-xl font-mono font-bold text-emerald-400">
                  {predictionScore.correct} / {predictionScore.total}{' '}
                  <span className="text-xs text-slate-400">
                    ({predictionScore.total > 0 ? Math.round((predictionScore.correct / predictionScore.total) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Setup next challenge */}
            {pendingCandidate === null ? (
              <div className="text-center py-8 space-y-4 bg-slate-900/60 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Click below to generate a proposed neighbor transition from the current state (x={currentIdx}, f={costLandscape[currentIdx]}) with current temperature T={temperature.toFixed(2)}.
                </p>
                <button onClick={handlePreparePrediction} className="btn-tactile btn-primary text-xs px-6 py-2">
                  Propose Next Candidate Move
                </button>
              </div>
            ) : (
              <div className="p-4 bg-slate-900 rounded-xl border border-amber-500/30 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500 uppercase text-[10px]">Current State</span>
                    <div className="text-sm font-bold text-cyan-400 mt-1">
                      x = {currentIdx} (f = {costLandscape[currentIdx]})
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500 uppercase text-[10px]">Candidate Proposed</span>
                    <div className="text-sm font-bold text-amber-400 mt-1">
                      x' = {pendingCandidate} (f = {costLandscape[pendingCandidate]})
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500 uppercase text-[10px]">Energy Δ and Temp T</span>
                    <div className="text-sm font-bold text-white mt-1">
                      Δ = {costLandscape[pendingCandidate] - costLandscape[currentIdx] > 0
                        ? `+${costLandscape[pendingCandidate] - costLandscape[currentIdx]}`
                        : costLandscape[pendingCandidate] - costLandscape[currentIdx]} | T = {temperature.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="text-center py-2">
                  <span className="text-sm font-bold text-white block mb-3">
                    Will Simulated Annealing ACCEPT or REJECT this move?
                  </span>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => handleCommitPrediction('accept')}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                    >
                      Predict ACCEPT
                    </button>
                    <button
                      onClick={() => handleCommitPrediction('reject')}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs bg-rose-500 text-white hover:bg-rose-400 shadow-lg shadow-rose-500/20"
                    >
                      Predict REJECT
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Prediction Feedback */}
            {predictionFeedback && (
              <div
                className={`p-4 rounded-xl border text-xs font-mono flex items-start gap-3 ${
                  userPrediction !== null &&
                  predictionFeedback.startsWith('Spot on')
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {userPrediction !== null && predictionFeedback.startsWith('Spot on') ? (
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold mb-1">
                    {predictionFeedback.startsWith('Spot on') ? 'Correct Prediction!' : 'Incorrect Prediction'}
                  </div>
                  <div className="text-slate-300">{predictionFeedback}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
