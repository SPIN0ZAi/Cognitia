import React, { useState } from 'react';

export const TwoProcessorVNSLab: React.FC = () => {
  const jobs = [
    { id: 1, name: 'J₁', time: 8 },
    { id: 2, name: 'J₂', time: 7 },
    { id: 3, name: 'J₃', time: 6 },
    { id: 4, name: 'J₄', time: 5 },
    { id: 5, name: 'J₅', time: 4 },
  ];

  // State: array of 5 elements (0 or 1), index i corresponds to Job i+1
  // Default is Slide 62: x = (1, 0, 1, 0, 0)
  const [config, setConfig] = useState<number[]>([1, 0, 1, 0, 0]);
  const [activeNeighborhood, setActiveNeighborhood] = useState<'N1' | 'N2'>('N1');
  const [vnsLog, setVnsLog] = useState<string[]>([]);

  // Compute workloads
  const computeWorkloads = (cfg: number[]) => {
    let l0 = 0;
    let l1 = 0;
    cfg.forEach((p, idx) => {
      if (p === 0) l0 += jobs[idx].time;
      else l1 += jobs[idx].time;
    });
    return { l0, l1, maxLoad: Math.max(l0, l1) };
  };

  const { l0, l1, maxLoad } = computeWorkloads(config);

  // Generate all N1 neighbors (flip 1 job)
  const n1Neighbors = jobs.map((job, idx) => {
    const nextCfg = [...config];
    nextCfg[idx] = 1 - nextCfg[idx];
    const { l0: nl0, l1: nl1, maxLoad: nMax } = computeWorkloads(nextCfg);
    return {
      type: 'N1',
      description: `Flip ${job.name} (${job.time}h) to P${1 - config[idx]}`,
      config: nextCfg,
      l0: nl0,
      l1: nl1,
      maxLoad: nMax,
      delta: nMax - maxLoad,
    };
  });

  // Generate all N2 neighbors (swap 1 job on P0 with 1 job on P1)
  const p0JobIndices = config.map((p, idx) => (p === 0 ? idx : -1)).filter((idx) => idx !== -1);
  const p1JobIndices = config.map((p, idx) => (p === 1 ? idx : -1)).filter((idx) => idx !== -1);

  const n2Neighbors: {
    type: string;
    description: string;
    config: number[];
    l0: number;
    l1: number;
    maxLoad: number;
    delta: number;
  }[] = [];

  p0JobIndices.forEach((i0) => {
    p1JobIndices.forEach((i1) => {
      const nextCfg = [...config];
      nextCfg[i0] = 1;
      nextCfg[i1] = 0;
      const { l0: nl0, l1: nl1, maxLoad: nMax } = computeWorkloads(nextCfg);
      n2Neighbors.push({
        type: 'N2',
        description: `Swap ${jobs[i0].name} (${jobs[i0].time}h on P₀) ↔ ${jobs[i1].name} (${jobs[i1].time}h on P₁)`,
        config: nextCfg,
        l0: nl0,
        l1: nl1,
        maxLoad: nMax,
        delta: nMax - maxLoad,
      });
    });
  });

  const isLocalOptimumN1 = n1Neighbors.every((n) => n.maxLoad >= maxLoad);

  const handleApplyConfig = (newCfg: number[], desc: string) => {
    setConfig(newCfg);
    setVnsLog((prev) => [`Moved: ${desc}`, ...prev.slice(0, 8)]);
  };

  const handleRunVNS = () => {
    // Step 1: Check N1
    const bestN1 = [...n1Neighbors].sort((a, b) => a.maxLoad - b.maxLoad)[0];
    if (bestN1 && bestN1.maxLoad < maxLoad) {
      handleApplyConfig(bestN1.config, `N₁ improvement: ${bestN1.description}`);
      return;
    }

    // Step 2: Stuck in N1, escalate to N2
    const bestN2 = [...n2Neighbors].sort((a, b) => a.maxLoad - b.maxLoad)[0];
    if (bestN2 && bestN2.maxLoad < maxLoad) {
      handleApplyConfig(bestN2.config, `VNS Escalation to N₂: ${bestN2.description} (Reached f=${bestN2.maxLoad})`);
      setActiveNeighborhood('N2');
    } else {
      setVnsLog((prev) => ['VNS: Global optimum f=15 verified! No further improvement in N₁ or N₂.', ...prev]);
    }
  };

  return (
    <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Official Exam Problem (Slide 62)
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Two-Processor Balancing & VNS Escape Solver
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Jobs: J₁=8, J₂=7, J₃=6, J₄=5, J₅=4 (Sum=30). Test configuration x = (1, 0, 1, 0, 0).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunVNS}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
          >
            Auto Step VNS
          </button>
          <button
            onClick={() => {
              setConfig([1, 0, 1, 0, 0]);
              setActiveNeighborhood('N1');
              setVnsLog(['Reset to Slide 62 initial configuration x = (1, 0, 1, 0, 0)']);
            }}
            className="px-3.5 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-700"
          >
            Reset Slide State
          </button>
        </div>
      </div>

      {/* Current State & Workload Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Processor 0 */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-200">Processor P₀</span>
            <span className="font-mono text-sm font-bold text-cyan-400">{l0} hours</span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full transition-all ${l0 === 15 ? 'bg-emerald-400' : 'bg-cyan-500'}`}
              style={{ width: `${(l0 / 30) * 100}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {jobs.map((j, idx) =>
              config[idx] === 0 ? (
                <span
                  key={j.id}
                  className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200"
                >
                  {j.name} ({j.time}h)
                </span>
              ) : null
            )}
          </div>
        </div>

        {/* Processor 1 */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-200">Processor P₁</span>
            <span className="font-mono text-sm font-bold text-amber-400">{l1} hours</span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full transition-all ${l1 === 15 ? 'bg-emerald-400' : 'bg-amber-500'}`}
              style={{ width: `${(l1 / 30) * 100}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {jobs.map((j, idx) =>
              config[idx] === 1 ? (
                <span
                  key={j.id}
                  className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200"
                >
                  {j.name} ({j.time}h)
                </span>
              ) : null
            )}
          </div>
        </div>
      </div>

      {/* Objective Value Banner */}
      <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-400 font-mono">Current Representation:</div>
          <div className="text-lg font-mono font-bold text-white tracking-widest">
            x = ({config.join(', ')})
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400 font-mono">Objective f(x) = max(L₀, L₁):</div>
          <div className={`text-2xl font-mono font-bold ${maxLoad === 15 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {maxLoad} hours {maxLoad === 15 ? '(GLOBAL OPTIMUM!)' : ''}
          </div>
        </div>
      </div>

      {/* Neighborhood Inspection & Tab Switching */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveNeighborhood('N1')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                activeNeighborhood === 'N1'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Neighborhood N₁(x) — Single Job Flip ({n1Neighbors.length} neighbors)
            </button>
            <button
              onClick={() => setActiveNeighborhood('N2')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                activeNeighborhood === 'N2'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Neighborhood N₂(x) — Pairwise Job Swap ({n2Neighbors.length} neighbors)
            </button>
          </div>

          {activeNeighborhood === 'N1' && isLocalOptimumN1 && (
            <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold">
              Trapped: Strict Local Optimum in N₁!
            </span>
          )}
        </div>

        {/* Neighbors Table */}
        <div className="overflow-x-auto bg-slate-950 rounded-xl border border-slate-800">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Operator Action</th>
                <th className="p-3">Neighbor State x'</th>
                <th className="p-3">Workloads (L₀, L₁)</th>
                <th className="p-3">f(x') = max(L₀, L₁)</th>
                <th className="p-3">Δ = f(x') - f(x)</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 font-mono">
              {(activeNeighborhood === 'N1' ? n1Neighbors : n2Neighbors).map((n, idx) => {
                const isImprovement = n.delta < 0;
                const isGlobal = n.maxLoad === 15;

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-900/50 transition-colors ${
                      isGlobal ? 'bg-emerald-950/20' : isImprovement ? 'bg-cyan-950/20' : ''
                    }`}
                  >
                    <td className="p-3 font-sans text-white font-medium">{n.description}</td>
                    <td className="p-3 text-slate-400">({n.config.join(', ')})</td>
                    <td className="p-3">
                      ({n.l0}h, {n.l1}h)
                    </td>
                    <td className="p-3 font-bold text-white">
                      <span className={isGlobal ? 'text-emerald-400' : isImprovement ? 'text-cyan-400' : 'text-slate-300'}>
                        {n.maxLoad}h
                      </span>
                    </td>
                    <td className="p-3 font-bold">
                      <span className={n.delta < 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {n.delta > 0 ? `+${n.delta}` : n.delta}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleApplyConfig(n.config, n.description)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px]"
                      >
                        Apply Move
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* VNS Log */}
      {vnsLog.length > 0 && (
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-slate-400 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Search Event Log</div>
          {vnsLog.map((log, i) => (
            <div key={i} className="text-cyan-300">
              ➜ {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
