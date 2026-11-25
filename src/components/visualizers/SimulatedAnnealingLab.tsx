import React, { useState, useEffect, useRef, useId, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Flame,
  Snowflake,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Thermometer,
  Zap,
  Activity,
  TrendingDown,
  Info,
  Sliders
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

  // Multimodal 1D minimization energy landscape (25 discrete states, x in [0..24])
  // High peaks at ends, local trap at x=5 (f=15), deep trap at x=11 (f=12), global minimum at x=18 (f=4)
  const costLandscape = useMemo(
    () => [32, 28, 24, 20, 16, 15, 17, 21, 26, 23, 17, 12, 16, 23, 29, 25, 17, 9, 4, 10, 16, 23, 28, 30, 33],
    []
  );

  // Core Simulation State
  const [currentIdx, setCurrentIdx] = useState<number>(3);
  const [bestIdx, setBestIdx] = useState<number>(3);
  const [temperature, setTemperature] = useState<number>(15.0);
  const [initialTemp, setInitialTemp] = useState<number>(15.0);
  const alpha = 0.92;
  const stepsPerTemp = 3; // Markov chain length L (Slide 50)
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stepCounter, setStepCounter] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'simulator' | 'metropolis-sandbox' | 'prediction' | 'cooling-theory'>('simulator');

  // Trajectory history
  const [lastMove, setLastMove] = useState<LastMoveRecord | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([
    { step: 0, cost: costLandscape[3], temp: 15.0, type: 'improve' }
  ]);

  // Prediction Challenge State
  const [predTemp, setPredTemp] = useState<number>(5.0);
  const [predDelta, setPredDelta] = useState<number>(3.0);
  const [predRoll, setPredRoll] = useState<number>(0.45);
  const [userPrediction, setUserPrediction] = useState<'accept' | 'reject' | null>(null);
  const [predictionFeedback, setPredictionFeedback] = useState<string | null>(null);

  // Metropolis Sandbox Interactive Calculator
  const [calcTemp, setCalcTemp] = useState<number>(8.0);
  const [calcDelta, setCalcDelta] = useState<number>(3.5);

  // References for animation loop
  const stateRef = useRef({
    currentIdx: 3,
    bestIdx: 3,
    temperature: 15.0,
    alpha: 0.92,
    stepsPerTemp: 3,
    stepCounter: 0,
    isRunning: false
  });

  useEffect(() => {
    stateRef.current = {
      currentIdx,
      bestIdx,
      temperature,
      alpha,
      stepsPerTemp,
      stepCounter,
      isRunning
    };
  }, [currentIdx, bestIdx, temperature, alpha, stepsPerTemp, stepCounter, isRunning]);

  const speedDelay = speed === 'slow' ? 600 : speed === 'normal' ? 250 : 80;

  // Single Simulated Annealing Step Execution
  const stepSA = useCallback(() => {
    const cur = stateRef.current;
    if (cur.temperature < 0.15) {
      setIsRunning(false);
      return;
    }

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
        reason = `Thermal barrier: Roll ${roll.toFixed(3)} > P(${prob.toFixed(3)}). Worsening step rejected.`;
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
  }, [costLandscape]);

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
  }, [isRunning, speedDelay, stepSA]);

  // Handle Reset
  const handleReset = (newStart = 3, newInitialT = initialTemp) => {
    setIsRunning(false);
    setCurrentIdx(newStart);
    setBestIdx(newStart);
    setTemperature(newInitialT);
    setInitialTemp(newInitialT);
    setStepCounter(0);
    setLastMove(null);
    setHistory([{ step: 0, cost: costLandscape[newStart], temp: newInitialT, type: 'improve' }]);
  };

  // Thermal state colors & theme
  const thermalProgress = Math.min(1, Math.max(0, temperature / initialTemp));
  const isHot = temperature > 6.0;
  const isFreezing = temperature < 1.0;

  return (
    <div className="visualizer-container border-cyan-500/30 shadow-2xl space-y-6">
      {/* Header */}
      <div className="visualizer-header border-b border-slate-800 pb-4">
        <div className="visualizer-title-area">
          <div className="flex items-center gap-2">
            <span
              className={`badge flex items-center gap-1.5 ${
                isHot ? 'badge-amber' : isFreezing ? 'badge-cyan' : 'badge-emerald'
              }`}
            >
              {isHot ? <Flame size={13} className="text-amber-400" /> : <Snowflake size={13} className="text-cyan-400" />}
              Slides 48–52 · Metallurgy Thermal Analogy
            </span>
            <span className="text-xs text-slate-500 font-mono">Trajectory-Based Metaheuristics</span>
          </div>
          <h3 className="visualizer-title text-xl font-bold tracking-tight text-white flex items-center gap-2 mt-1">
            Simulated Annealing & The Metropolis Criterion
          </h3>
          <p className="visualizer-subtitle text-xs text-slate-400 mt-1 max-w-2xl">
            Escape suboptimal basins by accepting worsening moves with probability P(accept) = exp(-Δ / T). At high temperatures, energetic exploration escapes deep traps; as temperature cools geometrically (T ← αT), the algorithm smoothly transitions into greedy exploitation.
          </p>
        </div>

        {/* Global Controls */}
        <div className="visualizer-controls flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 mr-2 text-xs">
            {(['slow', 'normal', 'fast'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-1 rounded font-medium capitalize transition-colors ${
                  speed === s ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
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
                <Pause size={14} /> Pause
              </>
            ) : (
              <>
                <Play size={14} /> Run Annealing
              </>
            )}
          </button>

          <button
            onClick={stepSA}
            disabled={isRunning || temperature < 0.15}
            className="btn-tactile btn-sm text-xs flex items-center gap-1.5 text-slate-200"
          >
            <Sparkles size={14} /> Step SA
          </button>

          <button
            onClick={() => handleReset(3)}
            className="btn-tactile btn-sm text-xs flex items-center gap-1.5 text-slate-400 hover:text-white"
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
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity size={14} />
          1D Energy Landscape & Metropolis Chamber
        </button>
        <button
          onClick={() => setActiveTab('metropolis-sandbox')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'metropolis-sandbox'
              ? 'border-amber-400 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders size={14} />
          Interactive Metropolis Function Sandbox
        </button>
        <button
          onClick={() => setActiveTab('prediction')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'prediction'
              ? 'border-purple-400 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle size={14} />
          Metropolis Prediction Challenge
        </button>
        <button
          onClick={() => setActiveTab('cooling-theory')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'cooling-theory'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingDown size={14} />
          Geometric Cooling & Quenching Pitfalls
        </button>
      </div>

      {/* Thermal Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Temperature Gauge */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[10px] font-mono uppercase text-slate-400">
            <span className="flex items-center gap-1">
              <Thermometer size={12} className={isHot ? 'text-amber-400' : 'text-cyan-400'} /> Temperature T
            </span>
            <span className="text-slate-500">{temperature < 0.2 ? 'FREEZED' : `${(thermalProgress * 100).toFixed(0)}% heat`}</span>
          </div>
          <div className="text-2xl font-mono font-bold mt-1 text-white flex items-baseline gap-2">
            <span>{temperature.toFixed(2)}</span>
            <span className="text-xs text-slate-500 font-normal">K</span>
          </div>
          {/* Temperature progress bar */}
          <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                isHot ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
              }`}
              style={{ width: `${thermalProgress * 100}%` }}
            />
          </div>
        </div>

        {/* Current State & Cost */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Current State x & Cost f(x)</span>
          <div className="text-xl font-mono font-bold text-cyan-300 mt-1">
            x = {currentIdx} <span className="text-slate-500">→</span> Cost: {costLandscape[currentIdx]}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Minimization Goal: Target f = 4 at x = 18</div>
        </div>

        {/* Best So Far x* */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Best Solution Retained x*</span>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-0.5">
            f(x*) = {costLandscape[bestIdx]}{' '}
            <span className="text-xs text-slate-500 font-normal">(x = {bestIdx})</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-300 flex items-center gap-1">
            {costLandscape[bestIdx] === 4 ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> Global Optimum Found!
              </span>
            ) : (
              <span>Retained through all uphill drift</span>
            )}
          </div>
        </div>

        {/* Cooling Parameters */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Cooling Schedule T ← αT</span>
          <div className="text-sm font-mono font-bold text-amber-300 mt-1">
            α = {alpha} · Epoch L = {stepsPerTemp} steps
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Total Movements: {stepCounter}</div>
        </div>
      </div>

      {/* TAB 1: SIMULATOR & METROPOLIS DECISION CHAMBER */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          {/* Main Landscape Visualizer */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
              <span className="font-bold text-white uppercase flex items-center gap-1.5">
                <Activity size={14} className="text-cyan-400" />
                1D Multimodal Minimization Landscape (States x = 0..24)
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Local Traps (x=5, x=11)
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Global Minimum (x=18, f=4)
                </span>
              </div>
            </div>

            {/* SVG Terrain */}
            <div className="w-full h-56 bg-slate-900/50 rounded-xl border border-slate-800/80 p-2 relative overflow-hidden select-none">
              <svg className="w-full h-full" viewBox="0 0 520 200">
                <defs>
                  <linearGradient id={chartGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Spline area */}
                <path
                  d={`M ${costLandscape
                    .map((cost, idx) => {
                      const px = 15 + idx * 20.4;
                      const py = 180 - (cost / 36) * 150;
                      return `${px},${py}`;
                    })
                    .join(' L ')} L 504.6,190 L 15,190 Z`}
                  fill={`url(#${chartGradientId})`}
                />

                {/* Terrain Line */}
                <path
                  d={`M ${costLandscape
                    .map((cost, idx) => {
                      const px = 15 + idx * 20.4;
                      const py = 180 - (cost / 36) * 150;
                      return `${px},${py}`;
                    })
                    .join(' L ')}`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />

                {/* Critical Basin Labels */}
                {/* Local Trap 1 */}
                <text x={15 + 5 * 20.4} y={180 - (15 / 36) * 150 - 14} textAnchor="middle" className="text-[9px] font-mono fill-amber-400 font-bold">
                  Trap 1 (f=15)
                </text>
                {/* Deep Trap 2 */}
                <text x={15 + 11 * 20.4} y={180 - (12 / 36) * 150 - 14} textAnchor="middle" className="text-[9px] font-mono fill-rose-400 font-bold">
                  Deep Trap (f=12)
                </text>
                {/* Global Minimum */}
                <text x={15 + 18 * 20.4} y={180 - (4 / 36) * 150 - 14} textAnchor="middle" className="text-[9px] font-mono fill-emerald-400 font-bold">
                  ★ Global Min (f=4)
                </text>

                {/* Discrete Coordinate Ticks */}
                {costLandscape.map((cost, idx) => {
                  const px = 15 + idx * 20.4;
                  const py = 180 - (cost / 36) * 150;
                  const isCurrent = idx === currentIdx;
                  const isBest = idx === bestIdx;

                  return (
                    <g key={idx} className="cursor-pointer" onClick={() => handleReset(idx)}>
                      <line x1={px} y1={py} x2={px} y2={185} stroke="#334155" strokeDasharray="2,2" strokeWidth="1" />
                      <circle
                        cx={px}
                        cy={py}
                        r={isCurrent ? 7 : isBest ? 5 : 3}
                        fill={isCurrent ? '#f59e0b' : isBest ? '#10b981' : '#1e293b'}
                        stroke={isCurrent ? '#ffffff' : isBest ? '#10b981' : '#64748b'}
                        strokeWidth={isCurrent ? 2.5 : 1.5}
                      />
                      <text x={px} y={196} textAnchor="middle" className="text-[8px] font-mono fill-slate-500">
                        {idx}
                      </text>
                    </g>
                  );
                })}

                {/* Active Agent Ball with Thermal Glow */}
                <g>
                  <circle
                    cx={15 + currentIdx * 20.4}
                    cy={180 - (costLandscape[currentIdx] / 36) * 150}
                    r={isHot ? 14 : 9}
                    fill={isHot ? 'rgba(245, 158, 11, 0.25)' : 'rgba(6, 182, 212, 0.25)'}
                    className="animate-ping"
                  />
                  <circle
                    cx={15 + currentIdx * 20.4}
                    cy={180 - (costLandscape[currentIdx] / 36) * 150}
                    r={7.5}
                    fill={isHot ? '#f59e0b' : '#06b6d4'}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </g>
              </svg>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
              <span>Click any node coordinate along the terrain to teleport initial start state.</span>
              <span className="text-cyan-400">
                Current Elevation: <strong>f({currentIdx}) = {costLandscape[currentIdx]}</strong>
              </span>
            </div>
          </div>

          {/* Metropolis Decision Chamber */}
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={14} className="text-amber-400" />
                Live Metropolis Acceptance Chamber (Step #{stepCounter})
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Criterion: P = exp(-Δ / T) for worsening moves
              </span>
            </div>

            {lastMove ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Proposed Move Metrics */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase block">Proposed Transition</span>
                  <div className="text-slate-200">
                    State <strong>x = {lastMove.from}</strong> (f={lastMove.fromCost}) ➜ <strong>x = {lastMove.candidate}</strong> (f={lastMove.candCost})
                  </div>
                  <div className="font-bold flex items-center gap-1">
                    <span>Cost Difference:</span>
                    <span className={lastMove.delta <= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      Δ = {lastMove.delta > 0 ? `+${lastMove.delta}` : lastMove.delta}{' '}
                      {lastMove.delta <= 0 ? '(Improvement)' : '(Worsening)'}
                    </span>
                  </div>
                </div>

                {/* Probability & Roll Comparison */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase block">Metropolis Acceptance Roll</span>
                  {lastMove.delta <= 0 ? (
                    <div className="text-emerald-400 font-bold mt-1">
                      Deterministic Acceptance: P = 1.000 (100%)
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>P(accept) = exp(-{lastMove.delta}/{lastMove.temp.toFixed(1)}):</span>
                        <span className="text-amber-300 font-bold">{(lastMove.prob * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uniform Random Roll u:</span>
                        <span className="text-cyan-300 font-bold">{lastMove.roll.toFixed(3)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Verdict Badge */}
                <div
                  className={`p-3 rounded-xl border flex flex-col justify-between text-xs font-mono ${
                    lastMove.accepted
                      ? lastMove.delta <= 0
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider">Verdict</span>
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    {lastMove.accepted ? (
                      <>
                        <CheckCircle2 size={16} />
                        {lastMove.delta <= 0 ? 'ACCEPTED (IMPROVEMENT)' : 'ACCEPTED (METROPOLIS ESCAPE!)'}
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={16} /> REJECTED (BOUNCE OFF BARRIER)
                      </>
                    )}
                  </div>
                  <p className="text-[11px] opacity-80 mt-1 leading-snug">{lastMove.reason}</p>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs text-slate-500 font-mono">
                Click <strong>Step SA</strong> or <strong>Run Annealing</strong> to observe the live Metropolis acceptance rolls!
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: METROPOLIS SANDBOX CALCULATOR */}
      {activeTab === 'metropolis-sandbox' && (
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders size={14} className="text-amber-400" />
              Dynamic Metropolis Acceptance Curve: P(Δ, T) = exp(-Δ / T)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interactive Sliders */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4 text-xs font-mono">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Temperature Parameter T:</span>
                  <span className="text-amber-400 font-bold">{calcTemp.toFixed(1)} K</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={25.0}
                  step={0.2}
                  value={calcTemp}
                  onChange={(e) => setCalcTemp(parseFloat(e.target.value))}
                  className="w-full accent-amber-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0.2 K (Icy / Greedy)</span>
                  <span>25.0 K (Boiling / High Exploration)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Worsening Move Penalty Δ:</span>
                  <span className="text-rose-400 font-bold">+{calcDelta.toFixed(1)} cost units</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={15.0}
                  step={0.1}
                  value={calcDelta}
                  onChange={(e) => setCalcDelta(parseFloat(e.target.value))}
                  className="w-full accent-rose-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>+0.1 (Tiny hop)</span>
                  <span>+15.0 (Massive uphill jump)</span>
                </div>
              </div>

              {/* Exact Computed Result */}
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase">Computed Acceptance Probability</div>
                <div className="text-2xl font-bold text-cyan-300">
                  {(Math.exp(-calcDelta / calcTemp) * 100).toFixed(2)}%
                </div>
                <div className="text-[11px] text-slate-400">
                  Formula: P = exp(-{calcDelta.toFixed(1)} / {calcTemp.toFixed(1)}) = {Math.exp(-calcDelta / calcTemp).toFixed(4)}
                </div>
              </div>
            </div>

            {/* SVG Visual Plot of Curve P(Δ) */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase block mb-2">
                Decay Curve Across Penalties Δ ∈ [0, 15] at T = {calcTemp.toFixed(1)} K
              </span>

              <div className="w-full h-44 bg-slate-900/50 rounded-lg p-2 relative">
                <svg className="w-full h-full" viewBox="0 0 300 120">
                  {/* Grid lines */}
                  <line x1={30} y1={10} x2={280} y2={10} stroke="#1e293b" strokeDasharray="2,2" />
                  <line x1={30} y1={55} x2={280} y2={55} stroke="#1e293b" strokeDasharray="2,2" />
                  <line x1={30} y1={100} x2={280} y2={100} stroke="#334155" />
                  <line x1={30} y1={10} x2={30} y2={100} stroke="#334155" />

                  {/* Labels */}
                  <text x={24} y={14} textAnchor="end" className="text-[8px] font-mono fill-slate-500">
                    1.0
                  </text>
                  <text x={24} y={58} textAnchor="end" className="text-[8px] font-mono fill-slate-500">
                    0.5
                  </text>
                  <text x={24} y={104} textAnchor="end" className="text-[8px] font-mono fill-slate-500">
                    0.0
                  </text>

                  {/* Curve */}
                  <path
                    d={`M ${Array.from({ length: 30 }, (_, i) => {
                      const dVal = (i / 29) * 15;
                      const p = Math.exp(-dVal / calcTemp);
                      const px = 30 + (dVal / 15) * 250;
                      const py = 100 - p * 90;
                      return `${px},${py}`;
                    }).join(' L ')}`}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                  />

                  {/* Current Active Dot */}
                  {(() => {
                    const activeP = Math.exp(-calcDelta / calcTemp);
                    const activeX = 30 + (calcDelta / 15) * 250;
                    const activeY = 100 - activeP * 90;
                    return (
                      <g>
                        <circle cx={activeX} cy={activeY} r={5} fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                        <line x1={activeX} y1={activeY} x2={activeX} y2={100} stroke="#06b6d4" strokeDasharray="2,2" />
                      </g>
                    );
                  })()}
                </svg>
              </div>

              <p className="text-[11px] text-slate-400 mt-2 font-mono">
                Observe how elevating temperature T flattens the curve, granting high acceptance even to severe penalties.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PREDICTION CHALLENGE */}
      {activeTab === 'prediction' && (
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <HelpCircle size={16} className="text-purple-400" />
            Metropolis Acceptance Predictor: What will the algorithm decide?
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-4 font-mono">
            <p className="text-slate-300 leading-relaxed font-sans">
              Suppose Simulated Annealing is currently operating at temperature <strong>T = {predTemp.toFixed(1)} K</strong>. A candidate movement introduces a worsening penalty of <strong>Δ = +{predDelta.toFixed(1)} cost units</strong>. A uniform random roll draws <strong>u = {predRoll.toFixed(2)}</strong>.
            </p>

            {/* Quick parameters randomizer */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPredTemp(parseFloat((Math.random() * 8 + 1).toFixed(1)));
                  setPredDelta(parseFloat((Math.random() * 5 + 1).toFixed(1)));
                  setPredRoll(parseFloat((Math.random() * 0.8 + 0.1).toFixed(2)));
                  setUserPrediction(null);
                  setPredictionFeedback(null);
                }}
                className="btn-tactile btn-xs text-slate-300"
              >
                Generate New Scenario
              </button>
            </div>

            {/* Decision Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setUserPrediction('accept');
                  const trueP = Math.exp(-predDelta / predTemp);
                  const willAccept = predRoll <= trueP;
                  setPredictionFeedback(
                    willAccept
                      ? `Correct! P(accept) = exp(-${predDelta}/${predTemp}) = ${(trueP * 100).toFixed(1)}%. Since roll u = ${predRoll.toFixed(2)} ≤ ${trueP.toFixed(2)}, the move is ACCEPTED!`
                      : `Incorrect. P(accept) = exp(-${predDelta}/${predTemp}) = ${(trueP * 100).toFixed(1)}%. Since roll u = ${predRoll.toFixed(2)} > ${trueP.toFixed(2)}, the move is REJECTED.`
                  );
                }}
                className={`p-3 rounded-xl border text-center font-bold text-xs transition-colors ${
                  userPrediction === 'accept'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                Prediction: ACCEPT Worsening Move
              </button>

              <button
                onClick={() => {
                  setUserPrediction('reject');
                  const trueP = Math.exp(-predDelta / predTemp);
                  const willReject = predRoll > trueP;
                  setPredictionFeedback(
                    willReject
                      ? `Correct! P(accept) = exp(-${predDelta}/${predTemp}) = ${(trueP * 100).toFixed(1)}%. Since roll u = ${predRoll.toFixed(2)} > ${trueP.toFixed(2)}, the move is REJECTED.`
                      : `Incorrect. P(accept) = exp(-${predDelta}/${predTemp}) = ${(trueP * 100).toFixed(1)}%. Since roll u = ${predRoll.toFixed(2)} ≤ ${trueP.toFixed(2)}, the move is ACCEPTED.`
                  );
                }}
                className={`p-3 rounded-xl border text-center font-bold text-xs transition-colors ${
                  userPrediction === 'reject'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-400'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                Prediction: REJECT Worsening Move
              </button>
            </div>

            {predictionFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-mono ${
                  predictionFeedback.startsWith('Correct')
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {predictionFeedback}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: GEOMETRIC COOLING THEORY & QUENCHING PITFALLS */}
      {activeTab === 'cooling-theory' && (
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Info size={16} className="text-cyan-400" />
            Cooling Parameters & Quenching vs Annealing (Slides 50–52)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-400 uppercase text-[10px]">Optimal Annealing (Slow Cooling)</span>
              <p className="text-slate-300 font-sans leading-relaxed">
                When cooling rate α is between 0.90 and 0.98 and sufficient movements L are executed at each temperature step, thermal equilibrium is reached at every stage. The algorithm explores widely early on, then settles naturally into the global crystalline minimum.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-rose-400 uppercase text-[10px]">Quenching Trap (Too Rapid Cooling)</span>
              <p className="text-slate-300 font-sans leading-relaxed">
                If cooling parameter α is too small (e.g., α = 0.5) or L is too short, temperature plunges to zero before the algorithm has escaped local traps. Defects freeze into the system, and Simulated Annealing degenerates prematurely into standard greedy Hill Climbing.
              </p>
            </div>
          </div>

          {/* Recent Trajectory History */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-slate-400 uppercase text-[10px]">Recent Trajectory Transitions ({history.length} recorded)</span>
            <div className="flex flex-wrap gap-1.5">
              {history.slice(-8).map((pt, i) => (
                <span
                  key={i}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    pt.type === 'improve'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : pt.type === 'escape'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  Step {pt.step}: Cost {pt.cost} (T={pt.temp.toFixed(1)})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
