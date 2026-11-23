import React, { useState, useEffect, useRef, useId } from 'react';

export const SimulatedAnnealingLab: React.FC = () => {
  const chartGradientId = useId();
  // Complex continuous-style minimization landscape sampled at 25 points
  // Valleys at index 5 (f=15), index 11 (f=12, local min), index 18 (f=4, global min)
  const costLandscape = [
    30, 26, 22, 18, 16, 15, 17, 21, 25, 23, 17, 12, 16, 22, 28, 24, 16, 8, 4, 9, 15, 22, 27, 29, 32
  ];

  const [currentIdx, setCurrentIdx] = useState<number>(3); // Starts near shallow valley
  const [bestIdx, setBestIdx] = useState<number>(3);
  const [temperature, setTemperature] = useState<number>(10.0);
  const [initialTemp, setInitialTemp] = useState<number>(10.0);
  const [alpha, setAlpha] = useState<number>(0.92);
  const [stepsPerTemp] = useState<number>(2);
  const [stepCounter, setStepCounter] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastMove, setLastMove] = useState<{
    candidate: number;
    delta: number;
    prob: number;
    roll: number;
    accepted: boolean;
    reason: string;
  } | null>(null);

  const [history, setHistory] = useState<{ step: number; cost: number; temp: number }[]>([
    { step: 0, cost: costLandscape[3], temp: 10.0 }
  ]);

  const timerRef = useRef<number | null>(null);

  const stepSA = () => {
    if (temperature < 0.1) {
      setIsRunning(false);
      return;
    }

    // Pick random neighbor in N(currentIdx) = {currentIdx - 1, currentIdx + 1}
    const candidates: number[] = [];
    if (currentIdx > 0) candidates.push(currentIdx - 1);
    if (currentIdx < costLandscape.length - 1) candidates.push(currentIdx + 1);

    const candidate = candidates[Math.floor(Math.random() * candidates.length)];
    const currentCost = costLandscape[currentIdx];
    const candidateCost = costLandscape[candidate];
    const delta = candidateCost - currentCost; // Minimization: delta < 0 is improvement!

    let accepted = false;
    let prob = 1.0;
    const roll = Math.random();
    let reason = '';

    if (delta <= 0) {
      // Improvement! Always accepted (Metropolis criterion)
      accepted = true;
      prob = 1.0;
      reason = `Improvement (Δ = ${delta} <= 0): 100% accepted.`;
    } else {
      // Worsening move: accepted with probability exp(-delta / T)
      prob = Math.exp(-delta / temperature);
      if (roll <= prob) {
        accepted = true;
        reason = `Metropolis roll: roll ${roll.toFixed(3)} <= P ${prob.toFixed(3)}: Accepted worsening move!`;
      } else {
        accepted = false;
        reason = `Metropolis roll: roll ${roll.toFixed(3)} > P ${prob.toFixed(3)}: Rejected worsening move.`;
      }
    }

    setLastMove({ candidate, delta, prob, roll, accepted, reason });

    let newCurrent = currentIdx;
    if (accepted) {
      newCurrent = candidate;
      setCurrentIdx(candidate);
      if (candidateCost < costLandscape[bestIdx]) {
        setBestIdx(candidate);
      }
    }

    // Cooling logic
    const nextStep = stepCounter + 1;
    let newTemp = temperature;
    if (nextStep % stepsPerTemp === 0) {
      newTemp = Math.max(0.05, temperature * alpha);
      setTemperature(newTemp);
    }
    setStepCounter(nextStep);

    setHistory((prev) => [
      ...prev.slice(-40),
      { step: nextStep, cost: costLandscape[newCurrent], temp: newTemp }
    ]);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(stepSA, 400);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, currentIdx, temperature, stepCounter, alpha, stepsPerTemp]);

  const handleReset = (newStart = 3) => {
    setIsRunning(false);
    setCurrentIdx(newStart);
    setBestIdx(newStart);
    setTemperature(initialTemp);
    setStepCounter(0);
    setLastMove(null);
    setHistory([{ step: 0, cost: costLandscape[newStart], temp: initialTemp }]);
  };

  return (
    <div className="bg-[#0f172a] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Interactive Laboratory 7.3
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Simulated Annealing & The Metropolis Criterion
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Slide 48–52: Watch worsening moves accepted at high T and rejected as T → 0 to escape local minima.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            disabled={temperature < 0.1}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              isRunning
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold shadow-lg shadow-amber-500/20 disabled:opacity-40'
            }`}
          >
            {isRunning ? 'Pause' : 'Cooling Run'}
          </button>
          <button
            onClick={stepSA}
            disabled={isRunning || temperature < 0.1}
            className="px-3.5 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 disabled:opacity-40"
          >
            Step
          </button>
          <button
            onClick={() => handleReset(3)}
            className="px-3.5 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-700"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Hyperparameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Current Temp (T):</span>
            <span className="font-mono text-amber-400 font-bold">{temperature.toFixed(2)}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 via-amber-500 to-rose-500 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (temperature / initialTemp) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">
            {temperature > 5 ? 'High T: High Exploration' : temperature > 1 ? 'Medium T: Controlled Escape' : 'Frozen: Greedy HC'}
          </span>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Cooling Rate (α):</span>
            <span className="font-mono text-cyan-400">{alpha.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.80"
            max="0.99"
            step="0.01"
            value={alpha}
            onChange={(e) => setAlpha(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Initial Temp (T₀):</span>
            <span className="font-mono text-slate-200">{initialTemp.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="5.0"
            max="25.0"
            step="1.0"
            value={initialTemp}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setInitialTemp(val);
              setTemperature(val);
            }}
            className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 block mb-1">Preset Starting Basins</label>
          <div className="flex gap-1.5">
            <button
              onClick={() => handleReset(0)}
              className="flex-1 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
            >
              Left (x=0)
            </button>
            <button
              onClick={() => handleReset(11)}
              className="flex-1 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
            >
              Trap (x=11)
            </button>
            <button
              onClick={() => handleReset(23)}
              className="flex-1 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
            >
              Right (x=23)
            </button>
          </div>
        </div>
      </div>

      {/* SVG Minimization Landscape */}
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
        <div className="text-xs text-slate-400 mb-2 flex justify-between items-center">
          <span>Minimization Landscape: Lower elevation = Lower cost (Better)</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Current Solution x
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Local Trap (f=12)
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Global Minimum (x=18, f=4)
            </span>
          </div>
        </div>

        <div className="h-52 w-full relative">
          <svg className="w-full h-full" viewBox="0 0 880 180" preserveAspectRatio="none">
            <defs>
              <linearGradient id={chartGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Inverted curve for cost: lower cost = higher visually or lower visually? Let's make lower cost closer to bottom */}
            <polyline
              points={costLandscape.map((cost, idx) => `${20 + idx * 35},${160 - (34 - cost) * 4.5}`).join(' ')}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
            />

            {costLandscape.map((cost, idx) => {
              const cx = 20 + idx * 35;
              const cy = 160 - (34 - cost) * 4.5;
              const isCurrent = idx === currentIdx;
              const isBest = idx === bestIdx;
              const isGlobal = idx === 18;
              const isTrap = idx === 11;

              return (
                <g key={idx} className="cursor-pointer" onClick={() => handleReset(idx)}>
                  <rect x={cx - 15} y={10} width={30} height={160} fill="transparent" />
                  <line x1={cx} y1={cy} x2={cx} y2={170} stroke="#334155" strokeDasharray="2,2" strokeWidth="1" />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isCurrent ? 7 : isGlobal ? 5.5 : isTrap ? 4.5 : 3}
                    className={`${
                      isCurrent
                        ? 'fill-cyan-400 stroke-white stroke-2 shadow-lg animate-pulse'
                        : isGlobal
                        ? 'fill-emerald-400'
                        : isTrap
                        ? 'fill-rose-500'
                        : isBest
                        ? 'fill-amber-400'
                        : 'fill-slate-600'
                    }`}
                  />
                  <text x={cx} y={178} textAnchor="middle" className="text-[9px] fill-slate-500 font-mono">
                    {idx}
                  </text>
                  {(isCurrent || isGlobal || isTrap) && (
                    <text x={cx} y={cy - 10} textAnchor="middle" className="text-[10px] font-bold font-mono fill-white">
                      {cost}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Live Metropolis Decision Box */}
        <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-slate-400 font-mono mb-1">
              State: <strong className="text-cyan-400">x={currentIdx} (Cost={costLandscape[currentIdx]})</strong> | Best:{' '}
              <strong className="text-emerald-400">x={bestIdx} (Cost={costLandscape[bestIdx]})</strong> | Steps:{' '}
              <strong className="text-white">{history.length}</strong>
            </div>
            {lastMove ? (
              <div className="text-slate-300 font-mono">
                Candidate: <span className="text-amber-300 font-bold">x'={lastMove.candidate} (Cost={costLandscape[lastMove.candidate]})</span> |{' '}
                <span className={lastMove.delta <= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  Δ = {lastMove.delta > 0 ? `+${lastMove.delta}` : lastMove.delta}
                </span>
              </div>
            ) : (
              <div className="text-slate-500 font-mono">Click Step or Cooling Run to begin optimization.</div>
            )}
          </div>

          <div className="border-l border-slate-800 pl-3">
            {lastMove ? (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      lastMove.accepted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {lastMove.accepted ? 'Accepted' : 'Rejected'}
                  </span>
                  <span className="font-mono text-slate-400">
                    P(accept) = exp(-Δ/T) = <strong className="text-white">{lastMove.prob.toFixed(3)}</strong>
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">{lastMove.reason}</div>
              </div>
            ) : (
              <div className="text-slate-500 font-mono">Metropolis criterion: P(accept) = exp(-Δ/T) for Δ &gt; 0</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
