import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  SkipForward,
  Cpu,
  Layers,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  Sparkles,
  Play,
  Scale,
  ArrowRightLeft,
  Info
} from 'lucide-react';

interface Job {
  id: number;
  name: string;
  time: number;
  color: string;
  badge: string;
}

export const TwoProcessorVNSLab: React.FC = () => {
  const jobs: Job[] = useMemo(
    () => [
      { id: 0, name: 'J₁', time: 8, color: 'from-indigo-600 to-indigo-800 border-indigo-400', badge: 'bg-indigo-500/20 text-indigo-300' },
      { id: 1, name: 'J₂', time: 7, color: 'from-cyan-600 to-cyan-800 border-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300' },
      { id: 2, name: 'J₃', time: 6, color: 'from-amber-600 to-amber-800 border-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
      { id: 3, name: 'J₄', time: 5, color: 'from-emerald-600 to-emerald-800 border-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
      { id: 4, name: 'J₅', time: 4, color: 'from-purple-600 to-purple-800 border-purple-400', badge: 'bg-purple-500/20 text-purple-300' },
    ],
    []
  );

  // Representation: array of 5 binary variables (0 for P0, 1 for P1)
  // Default is Slide 62 initial configuration: x = (1, 0, 1, 0, 0)
  const [config, setConfig] = useState<number[]>([1, 0, 1, 0, 0]);
  const [activeTab, setActiveTab] = useState<'balance-racks' | 'trap-proof' | 'vns-runner' | 'exam-solutions'>('balance-racks');
  const [vnsK, setVnsK] = useState<number>(1);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  // VNS execution log
  const [vnsLog, setVnsLog] = useState<{ step: number; text: string; type: 'info' | 'fail' | 'success' }[]>([
    {
      step: 0,
      text: 'Initialized at Slide 62 state x = (1, 0, 1, 0, 0). Workloads: P₀=16h, P₁=14h (Makespan f=16h).',
      type: 'info'
    }
  ]);

  // Compute processor workloads and makespan
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
  const isOptimal = maxLoad === 15;
  const imbalance = l0 - l1; // positive = left heavier

  // Generate all N1 neighbors (single-job flip)
  const n1Neighbors = useMemo(() => {
    return jobs.map((job, idx) => {
      const nextCfg = [...config];
      nextCfg[idx] = 1 - nextCfg[idx];
      const { l0: nl0, l1: nl1, maxLoad: nMax } = computeWorkloads(nextCfg);
      return {
        jobIndex: idx,
        jobName: job.name,
        jobTime: job.time,
        currentP: config[idx],
        targetP: 1 - config[idx],
        config: nextCfg,
        l0: nl0,
        l1: nl1,
        maxLoad: nMax,
        delta: nMax - maxLoad,
      };
    });
  }, [config, jobs, maxLoad]);

  const isN1Trapped = n1Neighbors.every((n) => n.maxLoad >= maxLoad);

  // Generate all N2 neighbors (pairwise swap between P0 and P1)
  const n2Neighbors = useMemo(() => {
    const p0Idxs = config.map((p, idx) => (p === 0 ? idx : -1)).filter((idx) => idx !== -1);
    const p1Idxs = config.map((p, idx) => (p === 1 ? idx : -1)).filter((idx) => idx !== -1);

    const list: {
      i0: number;
      i1: number;
      j0: Job;
      j1: Job;
      config: number[];
      l0: number;
      l1: number;
      maxLoad: number;
      delta: number;
      isWinner: boolean;
    }[] = [];

    p0Idxs.forEach((i0) => {
      p1Idxs.forEach((i1) => {
        const nextCfg = [...config];
        nextCfg[i0] = 1;
        nextCfg[i1] = 0;
        const { l0: nl0, l1: nl1, maxLoad: nMax } = computeWorkloads(nextCfg);
        list.push({
          i0,
          i1,
          j0: jobs[i0],
          j1: jobs[i1],
          config: nextCfg,
          l0: nl0,
          l1: nl1,
          maxLoad: nMax,
          delta: nMax - maxLoad,
          isWinner: nMax === 15,
        });
      });
    });

    list.sort((a, b) => a.maxLoad - b.maxLoad);
    return list;
  }, [config, jobs, maxLoad]);

  // Apply move directly
  const handleApplyConfig = (newCfg: number[], reason: string, isImprovement = false) => {
    setConfig(newCfg);
    setSelectedJobId(null);
    const { maxLoad: newMax } = computeWorkloads(newCfg);
    setVnsLog((prev) => [
      {
        step: prev.length + 1,
        text: `${reason} ➜ Makespan: ${newMax}h ${newMax === 15 ? '★ (GLOBAL OPTIMUM ACHIEVED!)' : ''}`,
        type: newMax === 15 ? 'success' : isImprovement ? 'info' : 'fail'
      },
      ...prev.slice(0, 10)
    ]);
  };

  // Job selection and pairwise swap engine
  const handleJobClick = (jobIdx: number) => {
    if (selectedJobId === null) {
      setSelectedJobId(jobIdx);
    } else if (selectedJobId === jobIdx) {
      setSelectedJobId(null);
    } else {
      const pFirst = config[selectedJobId];
      const pSecond = config[jobIdx];

      if (pFirst !== pSecond) {
        // Pairwise swap across processors (N2 move!)
        const nextCfg = [...config];
        nextCfg[selectedJobId] = pSecond;
        nextCfg[jobIdx] = pFirst;
        handleApplyConfig(
          nextCfg,
          `Pairwise Swap: ${jobs[selectedJobId].name} (${jobs[selectedJobId].time}h on P${pFirst}) ⟷ ${jobs[jobIdx].name} (${jobs[jobIdx].time}h on P${pSecond})`,
          true
        );
      } else {
        setSelectedJobId(jobIdx);
      }
    }
  };

  // Move selected job to other processor (N1 move)
  const handleMoveSelectedJob = () => {
    if (selectedJobId === null) return;
    const nextCfg = [...config];
    nextCfg[selectedJobId] = 1 - nextCfg[selectedJobId];
    handleApplyConfig(
      nextCfg,
      `Single-Job Shift: ${jobs[selectedJobId].name} (${jobs[selectedJobId].time}h) moved to P${nextCfg[selectedJobId]}`
    );
  };

  // Step VNS algorithm
  const handleStepVNS = () => {
    if (maxLoad === 15) {
      setVnsLog((prev) => [
        {
          step: prev.length + 1,
          text: 'Global optimum (15h = 15h) already reached. VNS terminates successfully!',
          type: 'success'
        },
        ...prev
      ]);
      return;
    }

    if (vnsK === 1) {
      const bestN1 = [...n1Neighbors].sort((a, b) => a.maxLoad - b.maxLoad)[0];
      if (bestN1 && bestN1.maxLoad < maxLoad) {
        handleApplyConfig(bestN1.config, `[k=1: N₁] Improvement found: Shift ${bestN1.jobName} to P${bestN1.targetP}`, true);
        setVnsK(1);
      } else {
        setVnsK(2);
        setVnsLog((prev) => [
          {
            step: prev.length + 1,
            text: `[k=1: N₁] STRICT LOCAL MINIMUM! All 5 single-job flips yield worse makespans (18h..24h). Escalating to k=2 (N₂: Pairwise Swaps).`,
            type: 'fail'
          },
          ...prev
        ]);
      }
    } else if (vnsK === 2) {
      const bestN2 = [...n2Neighbors].sort((a, b) => a.maxLoad - b.maxLoad)[0];
      if (bestN2 && bestN2.maxLoad < maxLoad) {
        handleApplyConfig(
          bestN2.config,
          `[k=2: N₂] VNS TRAP ESCAPE! Swap ${bestN2.j0.name} (${bestN2.j0.time}h on P₀) ⟷ ${bestN2.j1.name} (${bestN2.j1.time}h on P₁)`,
          true
        );
        setVnsK(1); // Reset to base neighborhood
      } else {
        setVnsLog((prev) => [
          {
            step: prev.length + 1,
            text: `[k=2: N₂] No improvement found in N₂.`,
            type: 'fail'
          },
          ...prev
        ]);
      }
    }
  };

  const handleResetSlideState = () => {
    setConfig([1, 0, 1, 0, 0]);
    setVnsK(1);
    setSelectedJobId(null);
    setVnsLog([
      {
        step: 0,
        text: 'Reset to Slide 62 initial configuration x = (1, 0, 1, 0, 0). Workloads: P₀=16h, P₁=14h.',
        type: 'info'
      }
    ]);
  };

  // Rotation angle for mechanical scale: 1 degree per hour difference, clamped to [-14, 14]
  const scaleTilt = Math.max(-14, Math.min(14, imbalance * 3.5));

  return (
    <div className="visualizer-container border-cyan-500/30 shadow-2xl space-y-6">
      {/* Header */}
      <div className="visualizer-header border-b border-slate-800 pb-4">
        <div className="visualizer-title-area">
          <div className="flex items-center gap-2">
            <span className="badge badge-cyan flex items-center gap-1.5">
              <Cpu size={13} />
              Slide 62 · Official Exam Problem
            </span>
            <span className="text-xs text-slate-500 font-mono">Variable Neighborhood Search (VNS)</span>
          </div>
          <h3 className="visualizer-title text-xl font-bold tracking-tight text-white flex items-center gap-2 mt-1">
            Two-Processor Load Balancing & VNS Trap Escape
          </h3>
          <p className="visualizer-subtitle text-xs text-slate-400 mt-1 max-w-2xl">
            Five jobs $J_1..J_5$ (total 30h) are scheduled on two processors to minimize makespan $f(x) = \max(L_0, L_1)$. Discover why standard Hill Climbing in $N_1$ gets permanently trapped at $x=(1,0,1,0,0)$ with $16$h, and how escalating to $N_2$ (pairwise swaps) breaks the trap and reaches the $15$h global optimum!
          </p>
        </div>

        {/* Global Controls */}
        <div className="visualizer-controls flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
          <button
            onClick={handleStepVNS}
            disabled={isOptimal}
            className={`btn-tactile text-xs flex items-center gap-1.5 ${
              isOptimal ? 'btn-emerald' : 'btn-primary'
            }`}
          >
            <SkipForward size={14} />
            Step VNS (k={vnsK})
          </button>

          <button
            onClick={handleResetSlideState}
            className="btn-tactile btn-sm flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <RotateCcw size={14} />
            Reset Slide 62
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('balance-racks')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'balance-racks'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale size={14} />
          Physical Dual-Pan Balance & Racks
        </button>
        <button
          onClick={() => setActiveTab('trap-proof')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'trap-proof'
              ? 'border-rose-400 text-rose-400 bg-rose-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle size={14} />
          Visual N₁ Trap Proof vs N₂ Escape
        </button>
        <button
          onClick={() => setActiveTab('vns-runner')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'vns-runner'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers size={14} />
          VNS State Machine & Step Runner
        </button>
        <button
          onClick={() => setActiveTab('exam-solutions')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'exam-solutions'
              ? 'border-purple-400 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle size={14} />
          Slide 62 Full Analytical Exam Q&A
        </button>
      </div>

      {/* Status Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* State Vector */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Binary Encoding x ∈ &#123;0, 1&#125;⁵</span>
          <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
            x = ({config.join(', ')})
          </div>
          <div className="text-[10px] text-slate-500 font-mono">0 = Processor P₀, 1 = Processor P₁</div>
        </div>

        {/* Workloads */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Processor Workloads</span>
          <div className="flex items-baseline gap-2 font-mono text-lg mt-1 font-bold">
            <span className="text-cyan-300">P₀: {l0}h</span>
            <span className="text-slate-600">vs</span>
            <span className="text-amber-300">P₁: {l1}h</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            {imbalance === 0 ? 'Equally Balanced (Δ=0h)' : `Discrepancy |L₀ - L₁| = ${Math.abs(imbalance)}h`}
          </div>
        </div>

        {/* Objective Function */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Makespan f(x) = max(L₀, L₁)</span>
          <div className="text-2xl font-mono font-bold text-white mt-0.5">
            {maxLoad} <span className="text-xs text-slate-500 font-normal">hours</span>
          </div>
          <div className="text-[10px] font-mono">
            {isOptimal ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> Global Optimum (Target 15h)
              </span>
            ) : isN1Trapped ? (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <AlertTriangle size={12} /> Trapped Local Min in N₁!
              </span>
            ) : (
              <span className="text-slate-400">Target optimum = 15h</span>
            )}
          </div>
        </div>

        {/* VNS State */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">VNS Neighborhood Index</span>
          <div className="text-xl font-mono font-bold text-amber-300 mt-1">
            k = {vnsK} ({vnsK === 1 ? 'N₁: 1-Job Flip' : 'N₂: Pairwise Swap'})
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {vnsK === 1 ? '|N₁| = 5 moves' : '|N₂| = 6 moves'}
          </div>
        </div>
      </div>

      {/* TAB 1: PHYSICAL DUAL-PAN BALANCE & INTERACTIVE RACKS */}
      {activeTab === 'balance-racks' && (
        <div className="space-y-6">
          {/* Animated Balance Scale */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center select-none relative overflow-hidden">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 self-start flex items-center gap-1.5">
              <Scale size={14} className="text-amber-400" />
              Dynamic Physical Balance Scale (Tilts by Imbalance)
            </span>

            {/* SVG Scale */}
            <div className="w-full max-w-lg h-44 relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 400 150">
                {/* Fulcrum base */}
                <polygon points="200,85 180,140 220,140" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                <circle cx={200} cy={85} r={5} fill="#f59e0b" />

                {/* Tilting Beam */}
                <g style={{ transformOrigin: '200px 85px', transform: `rotate(${scaleTilt}deg)`, transition: 'transform 0.4s ease' }}>
                  <line x1={40} y1={85} x2={360} y2={85} stroke="#64748b" strokeWidth="4" strokeLinecap="round" />

                  {/* Left Pan (P0) */}
                  <line x1={60} y1={85} x2={60} y2={115} stroke="#475569" strokeWidth="1.5" />
                  <ellipse cx={60} cy={115} rx={38} ry={7} fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                  <text x={60} y={135} textAnchor="middle" className="text-[10px] font-mono fill-cyan-400 font-bold">
                    P₀: {l0}h
                  </text>

                  {/* Right Pan (P1) */}
                  <line x1={340} y1={85} x2={340} y2={115} stroke="#475569" strokeWidth="1.5" />
                  <ellipse cx={340} cy={115} rx={38} ry={7} fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                  <text x={340} y={135} textAnchor="middle" className="text-[10px] font-mono fill-amber-400 font-bold">
                    P₁: {l1}h
                  </text>
                </g>
              </svg>

              {isOptimal && (
                <div className="absolute top-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 animate-bounce">
                  <Sparkles size={13} /> PERFECT BALANCE REACHED (15h = 15h)
                </div>
              )}
            </div>
          </div>

          {/* Dual Racks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Processor 0 Rack */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5 text-sm">
                  <Cpu size={16} /> Processor P₀ Rack
                </span>
                <span className="badge badge-cyan font-bold">{l0} hours</span>
              </div>

              <div className="space-y-2 min-h-[140px] bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                {jobs
                  .map((j, idx) => ({ ...j, idx }))
                  .filter((j) => config[j.idx] === 0)
                  .map((j) => {
                    const isSelected = selectedJobId === j.idx;
                    return (
                      <div
                        key={j.id}
                        onClick={() => handleJobClick(j.idx)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between text-xs font-mono ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded font-bold ${j.badge}`}>{j.name}</span>
                          <span className="text-slate-300 font-semibold">{j.time} hours</span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {isSelected ? 'Selected (Click opposite job to swap)' : 'Click to select'}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {selectedJobId !== null && config[selectedJobId] === 0 && (
                <button
                  onClick={handleMoveSelectedJob}
                  className="btn-tactile btn-sm w-full text-xs font-mono flex items-center justify-center gap-1 text-cyan-300"
                >
                  <ArrowRightLeft size={13} /> Shift {jobs[selectedJobId].name} to Processor P₁
                </button>
              )}
            </div>

            {/* Processor 1 Rack */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
                  <Cpu size={16} /> Processor P₁ Rack
                </span>
                <span className="badge badge-amber font-bold">{l1} hours</span>
              </div>

              <div className="space-y-2 min-h-[140px] bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                {jobs
                  .map((j, idx) => ({ ...j, idx }))
                  .filter((j) => config[j.idx] === 1)
                  .map((j) => {
                    const isSelected = selectedJobId === j.idx;
                    return (
                      <div
                        key={j.id}
                        onClick={() => handleJobClick(j.idx)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between text-xs font-mono ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded font-bold ${j.badge}`}>{j.name}</span>
                          <span className="text-slate-300 font-semibold">{j.time} hours</span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {isSelected ? 'Selected (Click opposite job to swap)' : 'Click to select'}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {selectedJobId !== null && config[selectedJobId] === 1 && (
                <button
                  onClick={handleMoveSelectedJob}
                  className="btn-tactile btn-sm w-full text-xs font-mono flex items-center justify-center gap-1 text-amber-300"
                >
                  <ArrowRightLeft size={13} /> Shift {jobs[selectedJobId].name} to Processor P₀
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISUAL N1 TRAP PROOF VS N2 ESCAPE */}
      {activeTab === 'trap-proof' && (
        <div className="space-y-6">
          {/* N1 Trap Section */}
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={15} />
                Neighborhood N₁ Proof (All 5 Single-Job Flips strictly worsen score!)
              </span>
              <span className="text-slate-400 font-mono text-[11px]">Current Makespan: 16h</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {n1Neighbors.map((n, idx) => (
                <div
                  key={idx}
                  onClick={() => handleApplyConfig(n.config, `Selected N₁ move: ${n.jobName}`)}
                  className="p-3 bg-slate-950 rounded-xl border border-rose-500/30 hover:border-rose-400 transition-colors cursor-pointer text-xs font-mono space-y-1.5"
                >
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Flip {n.jobName}</span>
                    <span className="text-rose-400">+{n.delta}h</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    P{n.currentP} ➜ P{n.targetP}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    P₀: {n.l0}h | P₁: {n.l1}h
                  </div>
                  <div className="font-bold text-rose-300 text-[11px] pt-1 border-t border-slate-800">
                    f(x) = {n.maxLoad}h (Worse!)
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-rose-300/80 font-mono bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
              ⚡ <strong>Local Minimum Proof</strong>: At x = (1, 0, 1, 0, 0), every single move in N₁ generates a makespan of 18h, 19h, 21h, 22h, or 24h. Because for all x' in N₁(x), f(x') &ge; 18 &gt; 16, Hill Climbing cannot make any move and halts permanently trapped!
            </p>
          </div>

          {/* N2 Escape Section */}
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={15} />
                Neighborhood N₂ Escape (Pairwise Swaps between P₀ and P₁)
              </span>
              <span className="text-slate-400 font-mono text-[11px]">|N₂| = 2 × 3 = 6 moves</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {n2Neighbors.map((n, idx) => (
                <div
                  key={idx}
                  onClick={() =>
                    handleApplyConfig(
                      n.config,
                      `N₂ Swap: ${n.j0.name} (${n.j0.time}h) ⟷ ${n.j1.name} (${n.j1.time}h)`,
                      n.isWinner
                    )
                  }
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-xs font-mono space-y-1.5 ${
                    n.isWinner
                      ? 'bg-emerald-500/15 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between font-bold">
                    <span className="text-white">
                      Swap {n.j0.name} ⟷ {n.j1.name}
                    </span>
                    <span className={n.isWinner ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
                      {n.delta > 0 ? `+${n.delta}h` : `${n.delta}h`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {n.j0.name} ({n.j0.time}h) with {n.j1.name} ({n.j1.time}h)
                  </div>
                  <div className="text-[11px] text-slate-300">
                    P₀: {n.l0}h | P₁: {n.l1}h
                  </div>
                  <div
                    className={`font-bold text-[11px] pt-1 border-t border-slate-800 ${
                      n.isWinner ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    f(x) = {n.maxLoad}h {n.isWinner ? '★ GLOBAL OPTIMUM!' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VNS STATE MACHINE & STEP RUNNER */}
      {activeTab === 'vns-runner' && (
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Play size={14} className="text-cyan-400" />
              Variable Neighborhood Search Step Execution Log
            </span>
            <button
              onClick={handleStepVNS}
              disabled={isOptimal}
              className="btn-tactile btn-sm text-xs font-mono font-bold text-cyan-300"
            >
              Execute Next Step
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto p-1 font-mono text-xs">
            {vnsLog.map((log) => (
              <div
                key={log.step}
                className={`p-2.5 rounded-lg border leading-relaxed ${
                  log.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : log.type === 'fail'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <span className="font-bold mr-2 text-slate-500">[Step #{log.step}]</span>
                {log.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SLIDE 62 ANALYTICAL EXAM Q&A */}
      {activeTab === 'exam-solutions' && (
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Info size={16} className="text-purple-400" />
            Official Slide 62 Exam Questions & Analytical Solutions
          </div>

          <div className="space-y-3">
            {[
              {
                q: '1. Binary Representation x ∈ {0, 1}⁵',
                a: 'x = (x₁, x₂, x₃, x₄, x₅) where xᵢ = 0 if job i is assigned to P₀, and xᵢ = 1 if assigned to P₁. Total space size |X| = 2⁵ = 32 configurations.'
              },
              {
                q: '2. Objective Function f(x)',
                a: 'Minimize completion makespan: f(x) = max(L₀(x), L₁(x)), where L₀(x) = ∑ tᵢ(1 - xᵢ) and L₁(x) = ∑ tᵢ · xᵢ.'
              },
              {
                q: '3. Neighborhood Operator N₁ (Slide 62 Step 3)',
                a: '1-bit flip: moves one job from its current processor to the other. Neighborhood size |N₁(x)| = 5 candidates.'
              },
              {
                q: '4. Evaluation of N₁ for x = (1, 0, 1, 0, 0)',
                a: 'At x=(1,0,1,0,0), P₀ has {J₂, J₄, J₅} = 7+5+4 = 16h; P₁ has {J₁, J₃} = 8+6 = 14h → f(x)=16h. Neighbors in N₁: flip J₁→24h; flip J₂→21h; flip J₃→22h; flip J₄→19h; flip J₅→18h. Since all neighbors yield f(x\') ≥ 18 > 16, x is a strict local minimum in N₁!'
              },
              {
                q: '5. Neighborhood Operator N₂ and Global Optimum Escape',
                a: 'N₂ swaps one job from P₀ with one job from P₁ (|N₂| = 2 × 3 = 6). Swapping J₂ (7h on P₀) with J₃ (6h on P₁) yields L₀ = 16-7+6 = 15h, L₁ = 14-6+7 = 15h, achieving f(x) = 15h, which is the global optimum!'
              },
              {
                q: '6. How VNS Escapes',
                a: 'When Hill Climbing terminates at the local minimum in N₁ (k=1), VNS increments k ← 2. Exploring N₂ immediately uncovers the global optimum (15h). VNS then resets k ← 1 and terminates.'
              }
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-cyan-300 block">{item.q}</span>
                <p className="text-slate-300 font-sans leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
