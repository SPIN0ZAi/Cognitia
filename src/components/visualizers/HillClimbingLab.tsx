import React, { useState, useEffect, useRef, useId } from 'react';

interface HillClimbingLabProps {
  onComplete?: () => void;
}

type StrategyType = 'steepest' | 'first-choice' | 'stochastic';

export const HillClimbingLab: React.FC<HillClimbingLabProps> = ({ onComplete }) => {
  const chartGradientId = useId();
  // Discrete landscape of 21 points (0 to 20) with multiple local peaks and a plateau
  // Peaks at index 4 (val 14), index 9 (val 22, local max), plateau at 12-14 (val 16), global max at index 18 (val 28)
  const landscape = [
    6, 9, 12, 14, 13, 10, 12, 16, 20, 22, 19, 16, 16, 16, 17, 21, 25, 27, 28, 24, 18
  ];

  const [currentIdx, setCurrentIdx] = useState<number>(2);
  const [bestIdx, setBestIdx] = useState<number>(2);
  const [strategy, setStrategy] = useState<StrategyType>('steepest');
  const [allowSideways, setAllowSideways] = useState<boolean>(true);
  const [qProb, setQProb] = useState<number>(0.8);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [history, setHistory] = useState<number[]>([2]);
  const [statusMessage, setStatusMessage] = useState<string>('Select initial state or click Step to climb.');
  const [sidewaysCount, setSidewaysCount] = useState<number>(0);
  const [isTerminated, setIsTerminated] = useState<boolean>(false);

  // Prediction challenge state
  const [predictionFeedback, setPredictionFeedback] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);

  const getNeighbors = (idx: number) => {
    const n: number[] = [];
    if (idx > 0) n.push(idx - 1);
    if (idx < landscape.length - 1) n.push(idx + 1);
    return n;
  };

  const stepSearch = () => {
    if (isTerminated) return;

    const neighbors = getNeighbors(currentIdx);
    const currentScore = landscape[currentIdx];

    let nextIdx: number | null = null;
    let terminationReason = '';

    if (strategy === 'steepest') {
      // Find best neighbor
      let maxScore = currentScore;
      let candidate: number | null = null;

      for (const n of neighbors) {
        if (landscape[n] > maxScore) {
          maxScore = landscape[n];
          candidate = n;
        } else if (allowSideways && landscape[n] === currentScore && candidate === null && sidewaysCount < 3) {
          // allow sideways if strictly better not found and cap not reached
          candidate = n;
        }
      }

      if (candidate !== null && candidate !== currentIdx) {
        if (landscape[candidate] === currentScore) {
          setSidewaysCount((c) => c + 1);
          setStatusMessage(`Sideways move to x=${candidate} (score=${landscape[candidate]}, sideways count: ${sidewaysCount + 1}/3)`);
        } else {
          setSidewaysCount(0);
          setStatusMessage(`Steepest ascent: moved to x=${candidate} (score=${landscape[candidate]})`);
        }
        nextIdx = candidate;
      } else {
        terminationReason = `Terminated: Local optimum reached at x=${currentIdx} (score=${currentScore}). No neighbor improves.`;
      }
    } else if (strategy === 'first-choice') {
      // Shuffle neighbors and pick first improving
      const shuffled = [...neighbors].sort(() => Math.random() - 0.5);
      let found = false;
      for (const n of shuffled) {
        if (landscape[n] > currentScore) {
          nextIdx = n;
          found = true;
          setSidewaysCount(0);
          setStatusMessage(`First choice: accepted improving neighbor x=${n} (score=${landscape[n]})`);
          break;
        } else if (allowSideways && landscape[n] === currentScore && sidewaysCount < 3) {
          nextIdx = n;
          found = true;
          setSidewaysCount((c) => c + 1);
          setStatusMessage(`First choice: accepted sideways move x=${n} (score=${landscape[n]})`);
          break;
        }
      }
      if (!found) {
        terminationReason = `Terminated: First Choice found no improving neighbor at x=${currentIdx}.`;
      }
    } else if (strategy === 'stochastic') {
      // Slide 28: with prob q picks best neighbor, with 1-q picks random
      const r = Math.random();
      let chosen: number;
      if (r <= qProb) {
        // Best neighbor
        chosen = neighbors.reduce((best, cur) => (landscape[cur] > landscape[best] ? cur : best), neighbors[0]);
        setStatusMessage(`Stochastic HC: greedy roll (r=${r.toFixed(2)} <= q=${qProb}), picked best x=${chosen}`);
      } else {
        chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
        setStatusMessage(`Stochastic HC: exploratory roll (r=${r.toFixed(2)} > q=${qProb}), picked random x=${chosen}`);
      }
      nextIdx = chosen;
    }

    if (nextIdx !== null) {
      setCurrentIdx(nextIdx);
      setHistory((prev) => [...prev, nextIdx!]);
      if (landscape[nextIdx] > landscape[bestIdx]) {
        setBestIdx(nextIdx);
      }
      if (landscape[nextIdx] === 28 && onComplete) {
        onComplete();
      }
    } else {
      setIsTerminated(true);
      setIsRunning(false);
      setStatusMessage(terminationReason);
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        stepSearch();
      }, 700);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, currentIdx, isTerminated, strategy, allowSideways, sidewaysCount]);

  const handleReset = (newIdx = 2) => {
    setIsRunning(false);
    setIsTerminated(false);
    setCurrentIdx(newIdx);
    setBestIdx(newIdx);
    setHistory([newIdx]);
    setSidewaysCount(0);
    setPredictionFeedback(null);
    setStatusMessage(`Reset to x=${newIdx} (score=${landscape[newIdx]}).`);
  };

  const handlePredict = (predictedChoice: 'left' | 'right' | 'stop') => {
    const leftScore = currentIdx > 0 ? landscape[currentIdx - 1] : -Infinity;
    const rightScore = currentIdx < landscape.length - 1 ? landscape[currentIdx + 1] : -Infinity;
    const currentScore = landscape[currentIdx];

    let actualCorrect: 'left' | 'right' | 'stop';
    if (strategy === 'steepest') {
      if (leftScore <= currentScore && rightScore <= currentScore) {
        actualCorrect = 'stop';
      } else if (rightScore > leftScore) {
        actualCorrect = 'right';
      } else {
        actualCorrect = 'left';
      }
    } else {
      actualCorrect = rightScore > currentScore ? 'right' : (leftScore > currentScore ? 'left' : 'stop');
    }

    if (predictedChoice === actualCorrect) {
      setPredictionFeedback(`Correct! Under ${strategy} Hill Climbing, the agent selects ${actualCorrect.toUpperCase()} because f(${actualCorrect}) is the steepest ascent.`);
    } else {
      setPredictionFeedback(`Not quite. The correct decision was ${actualCorrect.toUpperCase()}. Left f=${leftScore}, Right f=${rightScore}, Current f=${currentScore}.`);
    }
  };

  return (
    <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Interactive Laboratory 7.1
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Hill Climbing & Landscape Trajectory Simulator
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Slide 14–28: Test Steepest Ascent, First Choice, and Stochastic search on a multimodal terrain.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            disabled={isTerminated}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-40'
            }`}
          >
            {isRunning ? 'Pause' : 'Auto Climb'}
          </button>
          <button
            onClick={stepSearch}
            disabled={isRunning || isTerminated}
            className="px-3.5 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 disabled:opacity-40"
          >
            Step
          </button>
          <button
            onClick={() => handleReset(2)}
            className="px-3.5 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-700"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Parameter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
        <div>
          <label className="text-xs font-medium text-slate-400 block mb-1.5">Search Strategy</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['steepest', 'first-choice', 'stochastic'] as StrategyType[]).map((s) => (
              <button
                key={s}
                onClick={() => { setStrategy(s); handleReset(currentIdx); }}
                className={`py-1 text-xs rounded font-medium capitalize transition-colors ${
                  strategy === s ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s === 'steepest' ? 'Steepest' : s === 'first-choice' ? 'First Choice' : 'Stochastic'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 block mb-1.5">Plateau Traversal</label>
          <button
            onClick={() => setAllowSideways(!allowSideways)}
            className={`w-full py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-between ${
              allowSideways
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <span>Allow Sideways Moves (max 3):</span>
            <span className="font-bold">{allowSideways ? 'ENABLED' : 'DISABLED'}</span>
          </button>
        </div>

        {strategy === 'stochastic' ? (
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Greedy Probability (q):</span>
              <span className="font-mono text-cyan-400">{qProb.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={qProb}
              onChange={(e) => setQProb(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        ) : (
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Quick Start Preset</label>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleReset(0)}
                className="flex-1 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              >
                Start Basin 1 (x=0)
              </button>
              <button
                onClick={() => handleReset(11)}
                className="flex-1 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              >
                Plateau (x=11)
              </button>
              <button
                onClick={() => handleReset(15)}
                className="flex-1 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              >
                Near Global (x=15)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Landscape Visualization Canvas */}
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 relative">
        <div className="text-xs text-slate-400 mb-2 flex justify-between items-center">
          <span>Click any column to relocate agent initial position x</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Current Position
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Best Found
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Global Max (x=18, f=28)
            </span>
          </div>
        </div>

        {/* SVG Landscape */}
        <div className="h-56 w-full relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 840 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id={chartGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Polygon fill under curve */}
            <polygon
              points={`20,180 ${landscape.map((val, idx) => `${20 + idx * 40},${180 - val * 5.5}`).join(' ')} 820,180`}
              fill={`url(#${chartGradientId})`}
            />

            {/* Polyline terrain wire */}
            <polyline
              points={landscape.map((val, idx) => `${20 + idx * 40},${180 - val * 5.5}`).join(' ')}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
            />

            {/* Clickable Columns & Markers */}
            {landscape.map((val, idx) => {
              const cx = 20 + idx * 40;
              const cy = 180 - val * 5.5;
              const isCurrent = idx === currentIdx;
              const isBest = idx === bestIdx;
              const isGlobal = val === 28;

              return (
                <g key={idx} className="cursor-pointer" onClick={() => handleReset(idx)}>
                  {/* Invisible broad click target */}
                  <rect x={cx - 18} y={20} width={36} height={160} fill="transparent" />

                  {/* Vertical coordinate guideline */}
                  <line x1={cx} y1={cy} x2={cx} y2={180} stroke="#334155" strokeDasharray="2,2" strokeWidth="1" />

                  {/* Data node */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isCurrent ? 7 : isGlobal ? 5 : 3.5}
                    className={`transition-all ${
                      isCurrent
                        ? 'fill-cyan-400 stroke-white stroke-2 shadow-lg animate-pulse'
                        : isBest
                        ? 'fill-amber-400'
                        : isGlobal
                        ? 'fill-emerald-400'
                        : 'fill-slate-600 hover:fill-slate-400'
                    }`}
                  />

                  {/* X label */}
                  <text x={cx} y={195} textAnchor="middle" className="text-[10px] fill-slate-500 font-mono">
                    {idx}
                  </text>

                  {/* Score label above peak */}
                  {(isCurrent || isGlobal || isBest) && (
                    <text x={cx} y={cy - 12} textAnchor="middle" className="text-[10px] font-bold font-mono fill-white">
                      {val}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Live Search Status Box */}
        <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${isTerminated ? 'bg-rose-500' : isRunning ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'}`}></span>
            <span className="text-sm font-mono text-slate-200">{statusMessage}</span>
          </div>
          <div className="flex gap-4 text-xs font-mono">
            <span className="text-slate-400">Current: <strong className="text-cyan-400">x={currentIdx} (f={landscape[currentIdx]})</strong></span>
            <span className="text-slate-400">Best: <strong className="text-amber-400">x={bestIdx} (f={landscape[bestIdx]})</strong></span>
            <span className="text-slate-400">Steps: <strong className="text-white">{history.length - 1}</strong></span>
          </div>
        </div>
      </div>

      {/* "Predict Next Move" Interactive Challenge */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Active Prediction
            </span>
            <h4 className="text-sm font-semibold text-white">
              Before the next step: Where will Hill Climbing move from x={currentIdx}?
            </h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">Current f({currentIdx}) = {landscape[currentIdx]}</span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <button
            onClick={() => handlePredict('left')}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-left transition-all"
          >
            <div className="text-xs font-bold text-slate-300">Move LEFT (x={currentIdx > 0 ? currentIdx - 1 : '—'})</div>
            <div className="text-xs text-slate-500 font-mono mt-1">f(x-1) = {currentIdx > 0 ? landscape[currentIdx - 1] : 'N/A'}</div>
          </button>
          <button
            onClick={() => handlePredict('right')}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-left transition-all"
          >
            <div className="text-xs font-bold text-slate-300">Move RIGHT (x={currentIdx < landscape.length - 1 ? currentIdx + 1 : '—'})</div>
            <div className="text-xs text-slate-500 font-mono mt-1">f(x+1) = {currentIdx < landscape.length - 1 ? landscape[currentIdx + 1] : 'N/A'}</div>
          </button>
          <button
            onClick={() => handlePredict('stop')}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-left transition-all"
          >
            <div className="text-xs font-bold text-slate-300">TERMINATE (Stop)</div>
            <div className="text-xs text-slate-500 font-mono mt-1">Local optimum reached</div>
          </button>
        </div>

        {predictionFeedback && (
          <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-lg text-xs text-indigo-200">
            {predictionFeedback}
          </div>
        )}
      </div>
    </div>
  );
};
