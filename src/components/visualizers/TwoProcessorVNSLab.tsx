import React, { useState } from 'react';
import {
  RotateCcw,
  SkipForward,
  Cpu,
  Layers,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Sparkles,
  Info,
  ArrowRightLeft,
  Play,
  Scale
} from 'lucide-react';

interface Job {
  id: number;
  name: string;
  time: number;
  color: string;
  border: string;
  glow: string;
}

export const TwoProcessorVNSLab: React.FC = () => {
  const jobs: Job[] = [
    { id: 1, name: 'J₁', time: 8, color: 'bg-indigo-500/20 text-indigo-300', border: 'border-indigo-500/50', glow: 'shadow-indigo-500/20' },
    { id: 2, name: 'J₂', time: 7, color: 'bg-cyan-500/20 text-cyan-300', border: 'border-cyan-500/50', glow: 'shadow-cyan-500/20' },
    { id: 3, name: 'J₃', time: 6, color: 'bg-amber-500/20 text-amber-300', border: 'border-amber-500/50', glow: 'shadow-amber-500/20' },
    { id: 4, name: 'J₄', time: 5, color: 'bg-emerald-500/20 text-emerald-300', border: 'border-emerald-500/50', glow: 'shadow-emerald-500/20' },
    { id: 5, name: 'J₅', time: 4, color: 'bg-purple-500/20 text-purple-300', border: 'border-purple-500/50', glow: 'shadow-purple-500/20' },
  ];

  // State: array of 5 binary variables (0 for P0, 1 for P1)
  // Default is Slide 62 initial configuration: x = (1, 0, 1, 0, 0)
  const [config, setConfig] = useState<number[]>([1, 0, 1, 0, 0]);
  const [activeTab, setActiveTab] = useState<'interactive' | 'matrix' | 'trace' | 'exam'>('interactive');
  const [vnsK, setVnsK] = useState<number>(1);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  // Guided trace step (0..4)
  const [traceStep, setTraceStep] = useState<number>(0);

  const [vnsLog, setVnsLog] = useState<{ step: number; text: string; type: 'info' | 'fail' | 'success' }[]>([
    {
      step: 0,
      text: 'Initialized at Slide 62 state x = (1, 0, 1, 0, 0). Workloads: P₀=16h, P₁=14h (Makespan f=16h).',
      type: 'info'
    }
  ]);

  // Exam quiz state
  const [examAnswers, setExamAnswers] = useState<{ q1: string; q2: string; q3: string }>({
    q1: '',
    q2: '',
    q3: ''
  });
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

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

  // Generate all N1 neighbors (single-job flip)
  const n1Neighbors = jobs.map((job, idx) => {
    const nextCfg = [...config];
    nextCfg[idx] = 1 - nextCfg[idx];
    const { l0: nl0, l1: nl1, maxLoad: nMax } = computeWorkloads(nextCfg);
    return {
      type: 'N₁',
      jobIndex: idx,
      jobName: job.name,
      jobTime: job.time,
      description: `Flip ${job.name} (${job.time}h) from P${config[idx]} ➜ P${1 - config[idx]}`,
      config: nextCfg,
      l0: nl0,
      l1: nl1,
      maxLoad: nMax,
      delta: nMax - maxLoad,
    };
  });

  // Generate all N2 neighbors (pairwise swap between P0 and P1)
  const p0Indices = config.map((p, idx) => (p === 0 ? idx : -1)).filter((idx) => idx !== -1);
  const p1Indices = config.map((p, idx) => (p === 1 ? idx : -1)).filter((idx) => idx !== -1);

  const n2Neighbors: {
    type: string;
    description: string;
    config: number[];
    l0: number;
    l1: number;
    maxLoad: number;
    delta: number;
    j0: Job;
    j1: Job;
  }[] = [];

  p0Indices.forEach((i0) => {
    p1Indices.forEach((i1) => {
      const nextCfg = [...config];
      nextCfg[i0] = 1;
      nextCfg[i1] = 0;
      const { l0: nl0, l1: nl1, maxLoad: nMax } = computeWorkloads(nextCfg);
      n2Neighbors.push({
        type: 'N₂',
        description: `Swap ${jobs[i0].name} (${jobs[i0].time}h on P₀) ⟷ ${jobs[i1].name} (${jobs[i1].time}h on P₁)`,
        config: nextCfg,
        l0: nl0,
        l1: nl1,
        maxLoad: nMax,
        delta: nMax - maxLoad,
        j0: jobs[i0],
        j1: jobs[i1]
      });
    });
  });

  const isN1Trapped = n1Neighbors.every((n) => n.maxLoad >= maxLoad);

  // Apply move
  const handleApplyConfig = (newCfg: number[], reason: string, isImprovement = false) => {
    setConfig(newCfg);
    setSelectedJob(null);
    const { maxLoad: newMax } = computeWorkloads(newCfg);
    setVnsLog((prev) => [
      {
        step: prev.length + 1,
        text: `${reason} ➜ New Makespan: ${newMax}h ${newMax === 15 ? '(PERFECT OPTIMUM ACHIEVED!)' : ''}`,
        type: newMax === 15 ? 'success' : isImprovement ? 'info' : 'fail'
      },
      ...prev.slice(0, 12)
    ]);
  };

  // Job selection and pairwise swap engine
  const handleJobClick = (jobIdx: number) => {
    if (selectedJob === null) {
      setSelectedJob(jobIdx);
    } else if (selectedJob === jobIdx) {
      setSelectedJob(null);
    } else {
      const pFirst = config[selectedJob];
      const pSecond = config[jobIdx];

      if (pFirst !== pSecond) {
        // Pairwise swap across processors (N2 move!)
        const nextCfg = [...config];
        nextCfg[selectedJob] = pSecond;
        nextCfg[jobIdx] = pFirst;
        handleApplyConfig(
          nextCfg,
          `Pairwise Swap: ${jobs[selectedJob].name} (${jobs[selectedJob].time}h on P${pFirst}) ⟷ ${jobs[jobIdx].name} (${jobs[jobIdx].time}h on P${pSecond})`,
          true
        );
      } else {
        // Same processor: switch selected job
        setSelectedJob(jobIdx);
      }
    }
  };

  // Move selected job to other processor (N1 move)
  const handleFlipSelectedJob = () => {
    if (selectedJob === null) return;
    const nextCfg = [...config];
    nextCfg[selectedJob] = 1 - nextCfg[selectedJob];
    handleApplyConfig(
      nextCfg,
      `Single-Job Move: ${jobs[selectedJob].name} (${jobs[selectedJob].time}h) moved to P${nextCfg[selectedJob]}`
    );
  };

  // Step VNS algorithm
  const handleStepVNS = () => {
    if (maxLoad === 15) {
      setVnsLog((prev) => [
        {
          step: prev.length + 1,
          text: 'Global optimum (15h = 15h) already achieved! Stopping VNS.',
          type: 'success'
        },
        ...prev
      ]);
      return;
    }

    if (vnsK === 1) {
      // Look for improvement in N1
      const bestN1 = [...n1Neighbors].sort((a, b) => a.maxLoad - b.maxLoad)[0];
      if (bestN1 && bestN1.maxLoad < maxLoad) {
        handleApplyConfig(bestN1.config, `[k=1 / N₁] Found improvement: ${bestN1.description}`, true);
        setVnsK(1);
      } else {
        // Escalate to k=2
        setVnsK(2);
        setVnsLog((prev) => [
          {
            step: prev.length + 1,
            text: `[k=1 / N₁] STRICT LOCAL MINIMUM! All 5 single-job flips yield worse makespans (18h..24h). Escalating to k=2 (N₂: Pairwise Swaps).`,
            type: 'fail'
          },
          ...prev
        ]);
      }
    } else if (vnsK === 2) {
      // Look for improvement in N2
      const bestN2 = [...n2Neighbors].sort((a, b) => a.maxLoad - b.maxLoad)[0];
      if (bestN2 && bestN2.maxLoad < maxLoad) {
        handleApplyConfig(bestN2.config, `[k=2 / N₂] VNS ESCAPE! ${bestN2.description}`, true);
        setVnsK(1); // Reset to smallest neighborhood!
      } else {
        setVnsLog((prev) => [
          {
            step: prev.length + 1,
            text: `[k=2 / N₂] No improvement found in N₂.`,
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
    setSelectedJob(null);
    setTraceStep(0);
    setVnsLog([
      {
        step: 0,
        text: 'Reset to Slide 62 initial configuration x = (1, 0, 1, 0, 0). Workloads: P₀=16h, P₁=14h.',
        type: 'info'
      }
    ]);
  };

  return (
    <div className="visualizer-container border-cyan-500/30 shadow-2xl space-y-6">
      {/* Header */}
      <div className="visualizer-header border-b border-slate-800 pb-4">
        <div className="visualizer-title-area">
          <div className="flex items-center gap-2">
            <span className="badge badge-cyan flex items-center gap-1.5">
              <Cpu size={13} />
              Slide 62 · Official Exam Exercise
            </span>
            <span className="text-xs text-slate-500 font-mono">Variable Neighborhood Search (VNS)</span>
          </div>
          <h3 className="visualizer-title text-xl font-bold tracking-tight text-white flex items-center gap-2 mt-1">
            Two-Processor Load Balancing & VNS Trap Escape
          </h3>
          <p className="visualizer-subtitle text-xs text-slate-400 mt-1 max-w-2xl">
            Five jobs (total 30h) must be distributed across two identical processors to minimize maximum load $f(x) = \max(L_0, L_1)$. See why standard Hill Climbing gets permanently stuck at $x=(1,0,1,0,0)$, and how switching to neighborhood $N_2$ immediately unlocks the 15h global optimum!
          </p>
        </div>

        {/* Global Controls */}
        <div className="visualizer-controls flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
          <button
            onClick={handleStepVNS}
            disabled={maxLoad === 15}
            className="btn-tactile btn-primary text-xs flex items-center gap-1.5"
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
          onClick={() => setActiveTab('interactive')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'interactive'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu size={14} />
          Tactile Dual-Processor Racks & Swap Engine
        </button>
        <button
          onClick={() => setActiveTab('trace')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'trace'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Play size={14} />
          Guided Slide 62 Analytical Proof
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'matrix'
              ? 'border-amber-400 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers size={14} />
          Neighborhood Space Matrix (N₁ vs N₂)
        </button>
        <button
          onClick={() => setActiveTab('exam')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'exam'
              ? 'border-purple-400 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle size={14} />
          Exam Verification Quiz
        </button>
      </div>

      {/* TAB 1: TACTILE DUAL PROCESSOR RACKS */}
      {activeTab === 'interactive' && (
        <div className="space-y-6">
          {/* Workload Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Representation Vector x</span>
              <div className="text-xl font-mono font-bold text-cyan-400 mt-1 tracking-wider">
                x = ({config.join(', ')})
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                Job i: 0 = Processor P₀, 1 = Processor P₁
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Scale size={13} className="text-amber-400" />
                Processor Balance Gap
              </span>
              <div className="flex items-baseline gap-3 mt-1 font-mono text-base">
                <span className="text-cyan-300 font-bold">P₀ = {l0}h</span>
                <span className="text-slate-600">|</span>
                <span className="text-amber-300 font-bold">P₁ = {l1}h</span>
                <span className="text-[11px] text-slate-400">
                  ({Math.abs(l0 - l1) === 0 ? 'Balanced' : `Imbalance: ${Math.abs(l0 - l1)}h`})
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">Optimal target = 15h per processor</div>
            </div>

            <div
              className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                maxLoad === 15
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Makespan f(x) = max(L₀, L₁)</span>
                {maxLoad === 15 && (
                  <span className="badge badge-emerald text-[10px] font-bold">OPTIMUM</span>
                )}
              </div>
              <div className="text-2xl font-mono font-bold mt-1">
                <span className={maxLoad === 15 ? 'text-emerald-400' : 'text-amber-400'}>
                  {maxLoad} hours
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {maxLoad === 15 ? 'Perfect 50/50 balance achieved!' : 'Suboptimal makespan'}
              </div>
            </div>
          </div>

          {/* Dual Rack Visualizer */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <span className="font-mono uppercase font-bold text-white tracking-wide flex items-center gap-1.5">
                <Cpu size={14} className="text-cyan-400" />
                Processor Workload Schedules (Click to Swap or Transfer)
              </span>
              <span className="text-[11px] font-mono text-amber-300 flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-amber-400 inline-block" />
                Optimal Target Line = 15.0h
              </span>
            </div>

            {/* Interaction Instruction Banner */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <ArrowRightLeft size={15} className="text-amber-400 shrink-0" />
                {selectedJob === null ? (
                  <span className="text-slate-300">
                    <strong>Swap Mode:</strong> Click any job on P₀, then click a job on P₁ to swap them!
                  </span>
                ) : (
                  <span className="text-amber-300 font-mono">
                    Picked up <strong>{jobs[selectedJob].name} ({jobs[selectedJob].time}h on P{config[selectedJob]})</strong>. Now click any job on Processor P{1 - config[selectedJob]} to swap, or click Move!
                  </span>
                )}
              </div>

              {selectedJob !== null && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFlipSelectedJob}
                    className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded text-[11px] font-bold hover:bg-cyan-500/30"
                  >
                    Move to P{1 - config[selectedJob]} (N₁)
                  </button>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="px-2 py-1 bg-slate-800 text-slate-400 hover:text-white rounded text-[11px]"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Rack P0 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono font-bold text-cyan-400 flex items-center gap-2">
                  Processor P₀ (Total: {l0}h)
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {l0 > 15 ? `Overloaded (+${l0 - 15}h)` : l0 < 15 ? `Underloaded (-${15 - l0}h)` : 'Perfect 15.0h!'}
                </span>
              </div>

              <div className="w-full bg-slate-900 h-16 rounded-xl p-2 border border-slate-800 relative flex overflow-hidden">
                {/* 15h Target Marker Line */}
                <div
                  className="absolute top-0 bottom-0 z-20 border-r-2 border-dashed border-amber-400 pointer-events-none"
                  style={{ left: `${(15 / 30) * 100}%` }}
                >
                  <span className="absolute -top-1 -right-3 text-[9px] font-mono font-bold text-amber-400 bg-slate-950 px-1 rounded shadow">
                    15h
                  </span>
                </div>

                {/* Job Blocks on P0 */}
                {jobs.map((job, idx) => {
                  if (config[idx] !== 0) return null;
                  const widthPct = (job.time / 30) * 100;
                  const isSelected = selectedJob === idx;

                  return (
                    <button
                      key={job.id}
                      onClick={() => handleJobClick(idx)}
                      className={`h-full ${job.color} ${job.border} border-2 rounded-lg mx-0.5 flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                        isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-[1.03] z-30' : 'hover:brightness-125'
                      }`}
                      style={{ width: `${widthPct}%` }}
                      title={`Click to select ${job.name} (${job.time}h)`}
                    >
                      <span className="font-mono font-bold text-xs">{job.name}</span>
                      <span className="font-mono text-[10px] opacity-80">{job.time}h</span>
                      {isSelected && (
                        <span className="absolute -top-2 bg-amber-400 text-slate-950 text-[8px] font-bold px-1 rounded-full uppercase">
                          Selected
                        </span>
                      )}
                    </button>
                  );
                })}

                {l0 === 0 && (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-600 font-mono">
                    Processor Idle (0 hours)
                  </div>
                )}
              </div>
            </div>

            {/* Rack P1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono font-bold text-amber-400 flex items-center gap-2">
                  Processor P₁ (Total: {l1}h)
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {l1 > 15 ? `Overloaded (+${l1 - 15}h)` : l1 < 15 ? `Underloaded (-${15 - l1}h)` : 'Perfect 15.0h!'}
                </span>
              </div>

              <div className="w-full bg-slate-900 h-16 rounded-xl p-2 border border-slate-800 relative flex overflow-hidden">
                {/* 15h Target Marker Line */}
                <div
                  className="absolute top-0 bottom-0 z-20 border-r-2 border-dashed border-amber-400 pointer-events-none"
                  style={{ left: `${(15 / 30) * 100}%` }}
                >
                  <span className="absolute -top-1 -right-3 text-[9px] font-mono font-bold text-amber-400 bg-slate-950 px-1 rounded shadow">
                    15h
                  </span>
                </div>

                {/* Job Blocks on P1 */}
                {jobs.map((job, idx) => {
                  if (config[idx] !== 1) return null;
                  const widthPct = (job.time / 30) * 100;
                  const isSelected = selectedJob === idx;

                  return (
                    <button
                      key={job.id}
                      onClick={() => handleJobClick(idx)}
                      className={`h-full ${job.color} ${job.border} border-2 rounded-lg mx-0.5 flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                        isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-[1.03] z-30' : 'hover:brightness-125'
                      }`}
                      style={{ width: `${widthPct}%` }}
                      title={`Click to select ${job.name} (${job.time}h)`}
                    >
                      <span className="font-mono font-bold text-xs">{job.name}</span>
                      <span className="font-mono text-[10px] opacity-80">{job.time}h</span>
                      {isSelected && (
                        <span className="absolute -top-2 bg-amber-400 text-slate-950 text-[8px] font-bold px-1 rounded-full uppercase">
                          Selected
                        </span>
                      )}
                    </button>
                  );
                })}

                {l1 === 0 && (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-600 font-mono">
                    Processor Idle (0 hours)
                  </div>
                )}
              </div>
            </div>

            {/* Time ruler */}
            <div className="flex justify-between text-[10px] font-mono text-slate-600 px-1 border-t border-slate-900 pt-1">
              <span>0h</span>
              <span>5h</span>
              <span>10h</span>
              <span className="text-amber-400 font-bold">15h (Optimal Balance)</span>
              <span>20h</span>
              <span>25h</span>
              <span>30h</span>
            </div>
          </div>

          {/* VNS State Machine & Explanation Box */}
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Layers size={14} className="text-cyan-400" />
                VNS Search State & Trapped Diagnosis
              </span>
              <span
                className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold ${
                  vnsK === 1
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                Current Neighborhood: k = {vnsK} (N{vnsK === 1 ? '₁: 1-Job Flip' : '₂: Pairwise Swap'})
              </span>
            </div>

            {isN1Trapped && maxLoad > 15 ? (
              <div className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/30 text-xs flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <div className="text-rose-200">
                  <strong className="text-rose-400">Strict Local Minimum in N₁!</strong> Moving any single job between processors causes an immediate makespan increase (loads rise to 18h..24h). Standard Hill Climbing is completely trapped. VNS will escalate to <strong className="text-amber-300">k=2 ($N_2$)</strong> on the next step.
                </div>
              </div>
            ) : maxLoad === 15 ? (
              <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30 text-xs flex items-start gap-2.5">
                <Sparkles size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-emerald-200">
                  <strong className="text-emerald-400">Global Optimum Reached (f=15h)!</strong> Both processors carry exactly 15 hours. No neighbor in $N_1$ or $N_2$ can improve upon this perfect balance.
                </div>
              </div>
            ) : null}

            {/* Event log */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs max-h-36 overflow-y-auto space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">VNS Event Trace</div>
              {vnsLog.map((log, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 ${
                    log.type === 'success'
                      ? 'text-emerald-300'
                      : log.type === 'fail'
                      ? 'text-rose-300'
                      : 'text-cyan-300'
                  }`}
                >
                  <span className="text-slate-600 select-none">[{log.step}]</span>
                  <span>{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STEP-BY-STEP SLIDE 62 PROOF TRACE */}
      {activeTab === 'trace' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Play size={16} className="text-emerald-400" />
                  Official Slide 62 Exercise Trace Walkthrough
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Walk step-by-step through the exact analytical solution requested in the lecture slide.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setTraceStep((s) => Math.max(0, s - 1))}
                  disabled={traceStep === 0}
                  className="btn-tactile btn-sm text-xs disabled:opacity-30"
                >
                  Previous Step
                </button>
                <button
                  onClick={() => setTraceStep((s) => Math.min(4, s + 1))}
                  disabled={traceStep === 4}
                  className="btn-tactile btn-primary btn-sm text-xs disabled:opacity-30"
                >
                  Next Step ({traceStep + 1}/5)
                </button>
              </div>
            </div>

            {/* Step 0: Formulation */}
            {traceStep === 0 && (
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <div className="font-bold text-cyan-400 text-sm">Step 1: Formulation & Initial State</div>
                <div className="text-slate-300 leading-relaxed">
                  Five jobs: $J_1=8, J_2=7, J_3=6, J_4=5, J_5=4$. Total processing time $\sum t_i = 30$ hours.
                  <br />
                  Target lower bound makespan: $\lceil 30 / 2 \rceil = 15$ hours.
                  <br />
                  Initial configuration: $x = (1, 0, 1, 0, 0)$.
                  <br />
                  <span className="text-cyan-300">P₀ = J₂ + J₄ + J₅ = 7 + 5 + 4 = 16 hours.</span>
                  <br />
                  <span className="text-amber-300">P₁ = J₁ + J₃ = 8 + 6 = 14 hours.</span>
                  <br />
                  Objective function: f(x) = max(L₀, L₁) = max(16, 14) = <strong className="text-white">16 hours</strong>.
                </div>
              </div>
            )}

            {/* Step 1: Testing N1 */}
            {traceStep === 1 && (
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <div className="font-bold text-amber-400 text-sm">Step 2: Evaluating All 5 Neighbors in N₁(x) (Single-Job Flips)</div>
                <div className="space-y-1.5 text-slate-300">
                  <div>1. Flip J₁ (8h) from P₁ ➜ P₀: P₀=24h, P₁=6h ➜ <strong className="text-white">f = 24h</strong> (Worse: Δ = +8)</div>
                  <div>2. Flip J₂ (7h) from P₀ ➜ P₁: P₀=9h, P₁=21h ➜ <strong className="text-white">f = 21h</strong> (Worse: Δ = +5)</div>
                  <div>3. Flip J₃ (6h) from P₁ ➜ P₀: P₀=22h, P₁=8h ➜ <strong className="text-white">f = 22h</strong> (Worse: Δ = +6)</div>
                  <div>4. Flip J₄ (5h) from P₀ ➜ P₁: P₀=11h, P₁=19h ➜ <strong className="text-white">f = 19h</strong> (Worse: Δ = +3)</div>
                  <div>5. Flip J₅ (4h) from P₀ ➜ P₁: P₀=12h, P₁=18h ➜ <strong className="text-white">f = 18h</strong> (Worse: Δ = +2)</div>
                </div>
              </div>
            )}

            {/* Step 2: Trap Conclusion */}
            {traceStep === 2 && (
              <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/30 space-y-3 font-mono text-xs text-rose-200">
                <div className="font-bold text-rose-400 text-sm">Step 3: Question 4 Answer — Is x a Local Optimum?</div>
                <div className="leading-relaxed">
                  <strong>YES!</strong> Because for every candidate neighbor $x' \in N_1(x)$, we have:
                  <div className="p-2 bg-slate-950 rounded my-2 text-rose-300 text-center font-bold">
                    f(x') ≥ 18 &gt; 16 = f(x)
                  </div>
                  There is <strong>zero</strong> improving or sideways move in $N_1$. Standard Hill Climbing stops here and fails to find the global optimum.
                </div>
              </div>
            )}

            {/* Step 3: N2 Swaps */}
            {traceStep === 3 && (
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <div className="font-bold text-cyan-400 text-sm">Step 4: Question 5 Answer — Can N₂(x) Find a Better Solution?</div>
                <div className="leading-relaxed text-slate-300">
                  Neighborhood $N_2$ swaps 1 job on $P_0$ with 1 job on $P_1$. Since $P_0$ has 3 jobs and $P_1$ has 2 jobs, $|N_2(x)| = 3 \times 2 = 6$ possible swaps:
                  <div className="mt-2 space-y-1">
                    <div>• Swap J₂(7) ⟷ J₁(8): P₀=17h, P₁=13h ➜ f = 17h (Δ = +1)</div>
                    <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-300 font-bold">
                      ★ Swap J₂(7) ⟷ J₃(6): P₀ = 16 - 7 + 6 = 15h, P₁ = 14 - 6 + 7 = 15h ➜ f = 15h (GLOBAL OPTIMUM!)
                    </div>
                    <div>• Swap J₄(5) ⟷ J₁(8): P₀=19h, P₁=11h ➜ f = 19h (Δ = +3)</div>
                    <div>• Swap J₄(5) ⟷ J₃(6): P₀=17h, P₁=13h ➜ f = 17h (Δ = +1)</div>
                    <div>• Swap J₅(4) ⟷ J₁(8): P₀=20h, P₁=10h ➜ f = 20h (Δ = +4)</div>
                    <div>• Swap J₅(4) ⟷ J₃(6): P₀=18h, P₁=12h ➜ f = 18h (Δ = +2)</div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: VNS Conclusion */}
            {traceStep === 4 && (
              <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30 space-y-3 font-mono text-xs text-emerald-200">
                <div className="font-bold text-emerald-400 text-sm">Step 5: Question 6 Answer — How VNS Escapes</div>
                <div className="leading-relaxed">
                  When Hill Climbing gets trapped in $N_1$ ($k=1$), <strong>Variable Neighborhood Search</strong> escalates to $k=2$ ($N_2$).
                  <br />
                  $N_2$ immediately discovers the swap $(J_2 \leftrightarrow J_3)$, achieving the global optimum $f^* = 15$h.
                  <br />
                  Following the VNS rule, because an improvement occurred, VNS resets $k \leftarrow 1$ and terminates with the proven optimal schedule!
                </div>
                <button
                  onClick={() => handleApplyConfig([1, 1, 0, 0, 0], 'Applied Swap J₂ ⟷ J₃ from Slide 62 Proof', true)}
                  className="btn-tactile btn-primary btn-sm text-xs mt-2"
                >
                  Apply Optimal Schedule to Interactive Racks
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: NEIGHBORHOOD SPACE COMPARISON MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Info size={15} className="text-cyan-400" />
              Neighborhood Sizing & Topology (Slide 62 Proof)
            </h4>
            <p className="text-slate-400">
              In Slide 62, state $x = (1, 0, 1, 0, 0)$ gives $L_0 = 16$h and $L_1 = 14$h with $f(x) = 16$h.
              Below are the exact neighborhoods $N_1(x)$ (5 neighbors) and $N_2(x)$ (6 neighbors). Notice how every single element in $N_1$ is strictly worse, while $N_2$ contains the exact swap ($J_2 \leftrightarrow J_3$) that solves the entire problem!
            </p>
          </div>

          {/* N1 Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                Neighborhood N₁(x): Single Job Flip (5 Candidates)
              </h5>
              <span className="text-[11px] text-rose-400 font-mono font-bold">
                {isN1Trapped ? 'All Δ > 0 (Local Minimum Trap)' : ''}
              </span>
            </div>

            <div className="overflow-x-auto bg-slate-950 rounded-xl border border-slate-800">
              <table className="w-full text-xs text-left text-slate-300 font-mono">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Job Flipped</th>
                    <th className="p-3">New State x'</th>
                    <th className="p-3">Loads (L₀, L₁)</th>
                    <th className="p-3">Makespan f(x')</th>
                    <th className="p-3">Δ = f(x') - f(x)</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {n1Neighbors.map((n, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="p-3 font-sans font-medium text-white">{n.description}</td>
                      <td className="p-3 text-slate-400">({n.config.join(', ')})</td>
                      <td className="p-3">({n.l0}h, {n.l1}h)</td>
                      <td className="p-3 font-bold text-white">{n.maxLoad}h</td>
                      <td className="p-3 font-bold">
                        <span className={n.delta < 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {n.delta > 0 ? `+${n.delta}h (Worse)` : `${n.delta}h`}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleApplyConfig(n.config, `Moved via N₁: ${n.description}`)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px]"
                        >
                          Apply
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* N2 Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                Neighborhood N₂(x): Pairwise Job Swap (3 × 2 = 6 Candidates)
              </h5>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">
                Contains Global Minimum f=15h!
              </span>
            </div>

            <div className="overflow-x-auto bg-slate-950 rounded-xl border border-slate-800">
              <table className="w-full text-xs text-left text-slate-300 font-mono">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Pair Swapped (P₀ ⟷ P₁)</th>
                    <th className="p-3">New State x'</th>
                    <th className="p-3">Loads (L₀, L₁)</th>
                    <th className="p-3">Makespan f(x')</th>
                    <th className="p-3">Δ = f(x') - f(x)</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {n2Neighbors.map((n, idx) => {
                    const isGlobal = n.maxLoad === 15;
                    const isImprovement = n.delta < 0;

                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-900/40 ${
                          isGlobal ? 'bg-emerald-950/20' : isImprovement ? 'bg-cyan-950/20' : ''
                        }`}
                      >
                        <td className="p-3 font-sans font-medium text-white flex items-center gap-2">
                          {isGlobal && <Sparkles size={14} className="text-emerald-400 shrink-0" />}
                          {n.description}
                        </td>
                        <td className="p-3 text-slate-400">({n.config.join(', ')})</td>
                        <td className="p-3">({n.l0}h, {n.l1}h)</td>
                        <td className="p-3 font-bold">
                          <span className={isGlobal ? 'text-emerald-400 font-extrabold' : 'text-white'}>
                            {n.maxLoad}h {isGlobal ? '★' : ''}
                          </span>
                        </td>
                        <td className="p-3 font-bold">
                          <span className={isGlobal ? 'text-emerald-400' : n.delta < 0 ? 'text-cyan-400' : 'text-rose-400'}>
                            {n.delta > 0 ? `+${n.delta}h` : `${n.delta}h (Improvement!)`}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleApplyConfig(n.config, `Moved via N₂: ${n.description}`, isImprovement)}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium border ${
                              isGlobal
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold hover:bg-emerald-400'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                            }`}
                          >
                            Apply
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: UCLM EXAM VERIFICATION QUIZ */}
      {activeTab === 'exam' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <HelpCircle size={18} />
              </span>
              <div>
                <h4 className="text-base font-bold text-white">Slide 62 Official Exam Verification</h4>
                <p className="text-xs text-slate-400">
                  Answer the three official conceptual questions asked by the professor in the lecture slide.
                </p>
              </div>
            </div>

            {/* Question 1 */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-white block">
                1. What is the objective function value f(x) for initial configuration x = (1, 0, 1, 0, 0)?
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {['14 hours', '15 hours', '16 hours'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setExamAnswers((prev) => ({ ...prev, q1: opt }))}
                    className={`p-2.5 rounded-lg border text-left font-mono transition-colors ${
                      examAnswers.q1 === opt
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2 */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-white block">
                2. Why does standard Hill Climbing with Neighborhood N₁ fail to make progress from x = (1, 0, 1, 0, 0)?
              </span>
              <div className="space-y-2 text-xs">
                {[
                  'Because x is a global optimum and cannot be improved.',
                  'Because all 5 neighbors in N₁ have f(x\') > 16h, making x a strict local minimum in N₁.',
                  'Because N₁ only contains 2 candidate neighbors and both are identical.'
                ].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setExamAnswers((prev) => ({ ...prev, q2: opt }))}
                    className={`w-full p-2.5 rounded-lg border text-left transition-colors ${
                      examAnswers.q2 === opt
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3 */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-white block">
                3. Which exact pair of jobs must be swapped in Neighborhood N₂ to achieve the global optimum f* = 15h?
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {[
                  'Swap J₂ (7h) ⟷ J₃ (6h)',
                  'Swap J₁ (8h) ⟷ J₄ (5h)',
                  'Swap J₂ (7h) ⟷ J₁ (8h)'
                ].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setExamAnswers((prev) => ({ ...prev, q3: opt }))}
                    className={`p-2.5 rounded-lg border text-left font-mono transition-colors ${
                      examAnswers.q3 === opt
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Quiz */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setExamSubmitted(true)}
                disabled={!examAnswers.q1 || !examAnswers.q2 || !examAnswers.q3}
                className="btn-tactile btn-primary text-xs px-6 py-2"
              >
                Validate Exam Answers
              </button>
            </div>

            {/* Results Feedback */}
            {examSubmitted && (
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2">
                  {examAnswers.q1 === '16 hours' &&
                  examAnswers.q2.includes('strict local minimum') &&
                  examAnswers.q3.includes('J₂ (7h) ⟷ J₃ (6h)') ? (
                    <span className="badge badge-emerald flex items-center gap-1.5 font-bold">
                      <CheckCircle2 size={14} />
                      3 / 3 EXAM SCORE: 100% CORRECT!
                    </span>
                  ) : (
                    <span className="badge badge-rose flex items-center gap-1.5 font-bold">
                      <XCircle size={14} />
                      SOME ANSWERS ARE INCORRECT
                    </span>
                  )}
                </div>

                <div className="text-slate-300 space-y-1">
                  <div>
                    <strong>Q1:</strong> {examAnswers.q1 === '16 hours' ? '✓ Correct! L₀=16, L₁=14 → max(16,14)=16h.' : '✗ Incorrect. L₀ = 7+5+4 = 16h, L₁ = 8+6 = 14h → max(16, 14) = 16h.'}
                  </div>
                  <div>
                    <strong>Q2:</strong> {examAnswers.q2.includes('strict local minimum') ? '✓ Correct! Every single move in N₁ makes the load worse.' : '✗ Incorrect. All 5 moves in N₁ yield loads 24, 21, 22, 19, 18, all greater than 16.'}
                  </div>
                  <div>
                    <strong>Q3:</strong> {examAnswers.q3.includes('J₂ (7h) ⟷ J₃ (6h)') ? '✓ Correct! Swapping J₂ (7h on P₀) and J₃ (6h on P₁) shifts net 1h, giving L₀=15h and L₁=15h!' : '✗ Incorrect. Swapping J₂ (7h) and J₃ (6h) changes P₀ from 16 to 15, and P₁ from 14 to 15!'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
