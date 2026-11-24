import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Sparkles,
  ArrowRightLeft,
  Scissors,
  CheckCircle2,
  Shuffle,
  Play,
  AlertCircle
} from 'lucide-react';

interface City {
  id: number;
  label: string;
  x: number;
  y: number;
}

type TSPNeighborOp = '2-opt' | 'swap' | 'insertion';

export const TSPNeighborhoodsLab: React.FC = () => {
  // Preset 1: Tangled Bowtie (Classic 2-opt teaching example with obvious crossings)
  const presetBowtie: City[] = [
    { id: 0, label: 'A', x: 120, y: 80 },
    { id: 1, label: 'B', x: 260, y: 220 },
    { id: 2, label: 'C', x: 400, y: 80 },
    { id: 3, label: 'D', x: 400, y: 240 },
    { id: 4, label: 'E', x: 260, y: 100 },
    { id: 5, label: 'F', x: 120, y: 240 },
  ];

  // Preset 2: Hexagon with Inverted Diagonals
  const presetHex: City[] = [
    { id: 0, label: 'A', x: 150, y: 90 },
    { id: 1, label: 'B', x: 350, y: 90 },
    { id: 2, label: 'C', x: 440, y: 170 },
    { id: 3, label: 'D', x: 350, y: 250 },
    { id: 4, label: 'E', x: 150, y: 250 },
    { id: 5, label: 'F', x: 60, y: 170 },
  ];

  // Preset 3: 8-City Challenge
  const preset8Cities: City[] = [
    { id: 0, label: 'A', x: 100, y: 100 },
    { id: 1, label: 'B', x: 220, y: 60 },
    { id: 2, label: 'C', x: 360, y: 90 },
    { id: 3, label: 'D', x: 440, y: 180 },
    { id: 4, label: 'E', x: 380, y: 260 },
    { id: 5, label: 'F', x: 250, y: 270 },
    { id: 6, label: 'G', x: 110, y: 230 },
    { id: 7, label: 'H', x: 70, y: 160 },
  ];

  const [cities, setCities] = useState<City[]>(presetBowtie);
  // Tour is a permutation of city indices: [0, 1, 2, 3, 4, 5]
  const [tour, setTour] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  const [activeOp, setActiveOp] = useState<TSPNeighborOp>('2-opt');
  const [selectedI, setSelectedI] = useState<number>(0);
  const [selectedJ, setSelectedJ] = useState<number>(2);
  const [searchLog, setSearchLog] = useState<string[]>([
    'Initialized with Tangled Bowtie. Notice crossing edges (A→B crosses E→F).'
  ]);

  // Euclidean distance between two cities
  const dist = (c1: City, c2: City) => {
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Compute total tour length
  const computeTourLength = (t: number[]) => {
    let total = 0;
    for (let i = 0; i < t.length; i++) {
      const from = cities[t[i]];
      const to = cities[t[(i + 1) % t.length]];
      total += dist(from, to);
    }
    return parseFloat(total.toFixed(1));
  };

  const currentLength = useMemo(() => computeTourLength(tour), [tour, cities]);

  // Line segment intersection detection (to highlight crossings)
  const segmentsIntersect = (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    p4: { x: number; y: number }
  ) => {
    const ccw = (a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }) => {
      return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
    };
    return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
  };

  // Find all edge intersections in the current tour
  const crossings = useMemo(() => {
    const result: { e1: [number, number]; e2: [number, number]; pt: { x: number; y: number } }[] = [];
    const n = tour.length;
    for (let i = 0; i < n; i++) {
      for (let j = i + 2; j < n; j++) {
        if (i === 0 && j === n - 1) continue; // Adjacent edge wrap-around

        const a1 = cities[tour[i]];
        const a2 = cities[tour[(i + 1) % n]];
        const b1 = cities[tour[j]];
        const b2 = cities[tour[(j + 1) % n]];

        if (segmentsIntersect(a1, a2, b1, b2)) {
          // Midpoint approximation of crossing for visualization
          result.push({
            e1: [tour[i], tour[(i + 1) % n]],
            e2: [tour[j], tour[(j + 1) % n]],
            pt: { x: (a1.x + a2.x + b1.x + b2.x) / 4, y: (a1.y + a2.y + b1.y + b2.y) / 4 }
          });
        }
      }
    }
    return result;
  }, [tour, cities]);

  // Apply 2-opt (inversion of subpath from i+1 to j)
  const apply2Opt = (t: number[], i: number, j: number): number[] => {
    const n = t.length;
    const newTour = [...t];
    // Reverse subsegment between i+1 and j
    let left = (i + 1) % n;
    let right = j;
    if (left < right) {
      while (left < right) {
        const tmp = newTour[left];
        newTour[left] = newTour[right];
        newTour[right] = tmp;
        left++;
        right--;
      }
    } else {
      // Subpath wraps around
      const sub: number[] = [];
      let idx = left;
      while (idx !== (right + 1) % n) {
        sub.push(newTour[idx]);
        idx = (idx + 1) % n;
      }
      sub.reverse();
      idx = left;
      let sIdx = 0;
      while (idx !== (right + 1) % n) {
        newTour[idx] = sub[sIdx++];
        idx = (idx + 1) % n;
      }
    }
    return newTour;
  };

  // Apply City Swap (exchange position of city at index i and index j)
  const applySwap = (t: number[], i: number, j: number): number[] => {
    const newTour = [...t];
    const tmp = newTour[i];
    newTour[i] = newTour[j];
    newTour[j] = tmp;
    return newTour;
  };

  // Apply City Insertion (remove city at index i and insert at index j)
  const applyInsertion = (t: number[], i: number, j: number): number[] => {
    const newTour = [...t];
    const [city] = newTour.splice(i, 1);
    newTour.splice(j, 0, city);
    return newTour;
  };

  // Generate candidate tour based on active operator and selected i, j
  const proposedTour = useMemo(() => {
    if (activeOp === '2-opt') {
      return apply2Opt(tour, selectedI, selectedJ);
    } else if (activeOp === 'swap') {
      return applySwap(tour, selectedI, selectedJ);
    } else {
      return applyInsertion(tour, selectedI, selectedJ);
    }
  }, [tour, activeOp, selectedI, selectedJ]);

  const proposedLength = useMemo(() => computeTourLength(proposedTour), [proposedTour, cities]);
  const proposedDelta = parseFloat((proposedLength - currentLength).toFixed(1));

  // Generate complete neighborhood N(tour) for active operator
  const allNeighbors = useMemo(() => {
    const n = tour.length;
    const list: {
      i: number;
      j: number;
      description: string;
      newTour: number[];
      length: number;
      delta: number;
    }[] = [];

    if (activeOp === '2-opt') {
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (i === 0 && j === n - 1) continue;
          const nextT = apply2Opt(tour, i, j);
          const len = computeTourLength(nextT);
          list.push({
            i,
            j,
            description: `2-opt: Cut edges (${cities[tour[i]].label}→${cities[tour[(i + 1) % n]].label}) & (${cities[tour[j]].label}→${cities[tour[(j + 1) % n]].label}), reverse subpath`,
            newTour: nextT,
            length: len,
            delta: parseFloat((len - currentLength).toFixed(1))
          });
        }
      }
    } else if (activeOp === 'swap') {
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const nextT = applySwap(tour, i, j);
          const len = computeTourLength(nextT);
          list.push({
            i,
            j,
            description: `Swap: Exchange position of ${cities[tour[i]].label} ⟷ ${cities[tour[j]].label}`,
            newTour: nextT,
            length: len,
            delta: parseFloat((len - currentLength).toFixed(1))
          });
        }
      }
    } else {
      // Insertion
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i === j) continue;
          const nextT = applyInsertion(tour, i, j);
          const len = computeTourLength(nextT);
          list.push({
            i,
            j,
            description: `Insert: Move ${cities[tour[i]].label} to position ${j}`,
            newTour: nextT,
            length: len,
            delta: parseFloat((len - currentLength).toFixed(1))
          });
        }
      }
    }

    list.sort((a, b) => a.delta - b.delta);
    return list;
  }, [tour, cities, activeOp, currentLength]);

  const bestNeighbor = allNeighbors[0];

  // Apply proposed move
  const handleCommitProposed = () => {
    setTour(proposedTour);
    setSearchLog((prev) => [
      `Applied ${activeOp} (i=${selectedI}, j=${selectedJ}): Δ = ${proposedDelta > 0 ? `+${proposedDelta}` : proposedDelta} ➜ New Length: ${proposedLength}`,
      ...prev.slice(0, 12)
    ]);
  };

  // Apply best neighbor from neighborhood
  const handleApplyBest = () => {
    if (!bestNeighbor) return;
    setTour(bestNeighbor.newTour);
    setSearchLog((prev) => [
      `Steepest Ascent Move: ${bestNeighbor.description} (Δ = ${bestNeighbor.delta}) ➜ Length: ${bestNeighbor.length}`,
      ...prev.slice(0, 12)
    ]);
  };

  // 2-opt Hill Climbing auto-untangle
  const handleRun2OptHC = () => {
    if (bestNeighbor && bestNeighbor.delta < -0.01) {
      setTour(bestNeighbor.newTour);
      setSearchLog((prev) => [
        `2-opt HC Step: ${bestNeighbor.description} (Δ = ${bestNeighbor.delta})`,
        ...prev.slice(0, 12)
      ]);
    } else {
      setSearchLog((prev) => [
        `★ 2-opt Local Optimum Reached! No 2-opt move can reduce tour length further (f* = ${currentLength}).`,
        ...prev.slice(0, 12)
      ]);
    }
  };

  // Shuffle cities for a fresh randomized tour
  const handleShuffleTour = () => {
    const shuffled = [...tour].sort(() => Math.random() - 0.5);
    setTour(shuffled);
    setSearchLog((prev) => [
      `Randomized initial permutation: (${shuffled.map((idx) => cities[idx].label).join(' ➜ ')})`,
      ...prev.slice(0, 12)
    ]);
  };

  return (
    <div className="visualizer-container border-cyan-500/30 shadow-2xl space-y-6">
      {/* Visualizer Header */}
      <div className="visualizer-header border-b border-slate-800 pb-4">
        <div className="visualizer-title-area">
          <div className="flex items-center gap-2">
            <span className="badge badge-cyan flex items-center gap-1.5">
              <Scissors size={13} />
              Slides 8–10 · Permutation Neighborhoods
            </span>
            <span className="text-xs text-slate-500 font-mono">Traveling Salesperson Problem (TSP)</span>
          </div>
          <h3 className="visualizer-title text-xl font-bold tracking-tight text-white flex items-center gap-2 mt-1">
            TSP Neighborhood Operators: 2-opt Inversion, Node Swap & Insertion
          </h3>
          <p className="visualizer-subtitle text-xs text-slate-400 mt-1 max-w-2xl">
            Explore how neighborhood operators $N(\pi)$ reshape permutation tours. Witness the geometric power of <strong>2-opt</strong>: by triangle inequality, inverting crossed edges untangles lines and strictly decreases tour length ($\Delta &lt; 0$).
          </p>
        </div>

        {/* Global Controls */}
        <div className="visualizer-controls flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
          <button
            onClick={handleApplyBest}
            disabled={!bestNeighbor || bestNeighbor.delta >= 0}
            className="btn-tactile btn-primary text-xs flex items-center gap-1.5"
            title="Greedily apply the best improvement in N(x)"
          >
            <Sparkles size={14} />
            Best {activeOp} Move ({bestNeighbor && bestNeighbor.delta < 0 ? `${bestNeighbor.delta}` : 'None'})
          </button>

          <button
            onClick={handleRun2OptHC}
            className="btn-tactile btn-sm text-xs flex items-center gap-1.5 text-emerald-400 border-emerald-500/30"
          >
            <Play size={13} />
            Step 2-opt HC
          </button>

          <button
            onClick={handleShuffleTour}
            className="btn-tactile btn-sm text-xs flex items-center gap-1.5 text-slate-300"
          >
            <Shuffle size={13} />
            Randomize Tour
          </button>
        </div>
      </div>

      {/* Top Presets & Tour Info Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Preset Selector */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Problem Benchmark</span>
          <div className="flex gap-1.5 mt-1">
            <button
              onClick={() => {
                setCities(presetBowtie);
                setTour([0, 1, 2, 3, 4, 5]);
                setSearchLog(['Loaded Tangled Bowtie (Classic crossed edges).']);
              }}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                cities === presetBowtie ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              Bowtie (6)
            </button>
            <button
              onClick={() => {
                setCities(presetHex);
                setTour([0, 3, 2, 5, 4, 1]);
                setSearchLog(['Loaded Hexagon with tangled diagonals.']);
              }}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                cities === presetHex ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              Hexagon (6)
            </button>
            <button
              onClick={() => {
                setCities(preset8Cities);
                setTour([0, 4, 1, 5, 2, 6, 3, 7]);
                setSearchLog(['Loaded 8-City Challenge.']);
              }}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                cities === preset8Cities ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              8-Cities
            </button>
          </div>
        </div>

        {/* Tour Representation */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Permutation Tour π</span>
          <div className="text-sm font-mono font-bold text-cyan-300 mt-1 truncate">
            ({tour.map((idx) => cities[idx].label).join(' ➜ ')})
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            Cyclic symmetry: returns to {cities[tour[0]].label}
          </div>
        </div>

        {/* Current Tour Cost */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Total Tour Length f(π)</span>
          <div className="text-2xl font-mono font-bold text-white mt-0.5">
            {currentLength} <span className="text-xs text-slate-500 font-normal">units</span>
          </div>
          <div className="text-[10px] font-mono flex items-center gap-1.5">
            {crossings.length > 0 ? (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertCircle size={11} /> {crossings.length} Tangled Crossing{crossings.length > 1 ? 's' : ''}!
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={11} /> Zero crossings (Plane planar)
              </span>
            )}
          </div>
        </div>

        {/* Neighborhood Size & Complexity */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Neighborhood Size |N(x)|</span>
          <div className="text-base font-mono font-bold text-amber-300 mt-0.5">
            {allNeighbors.length} candidate moves
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {activeOp === '2-opt'
              ? `n(n-1)/2 = ${(cities.length * (cities.length - 1)) / 2}`
              : activeOp === 'swap'
              ? `n(n-1)/2 = ${(cities.length * (cities.length - 1)) / 2}`
              : `n(n-1) = ${cities.length * (cities.length - 1)}`}
          </div>
        </div>
      </div>

      {/* Main Interactive Stage: SVG Map & Operator Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 2D TSP City Map */}
        <div className="lg:col-span-2 p-5 bg-slate-950 rounded-2xl border border-slate-800 relative">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono uppercase font-bold text-white tracking-wide flex items-center gap-1.5">
              <MapPin size={14} className="text-cyan-400" />
              Euclidean City Tour Map
            </span>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-cyan-300">
                <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" /> Current Tour
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-0.5 border-t-2 border-dashed border-amber-400 inline-block" /> Proposed Op
              </span>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="w-full h-80 relative bg-slate-900/40 rounded-xl border border-slate-800/80 overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 520 320">
              {/* Grid dots */}
              <defs>
                <pattern id="tsp-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="15" cy="15" r="1" fill="#1e293b" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#tsp-grid)" />

              {/* Proposed Tour Preview (dashed amber) */}
              {proposedTour && (
                <polyline
                  points={[...proposedTour, proposedTour[0]]
                    .map((idx) => `${cities[idx].x},${cities[idx].y}`)
                    .join(' ')}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.6"
                />
              )}

              {/* Current Tour Lines (cyan solid) */}
              <polyline
                points={[...tour, tour[0]]
                  .map((idx) => `${cities[idx].x},${cities[idx].y}`)
                  .join(' ')}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Crossing Highlight Discs */}
              {crossings.map((cross, i) => (
                <g key={i}>
                  <circle
                    cx={cross.pt.x}
                    cy={cross.pt.y}
                    r={14}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                    className="animate-pulse"
                  />
                  <circle cx={cross.pt.x} cy={cross.pt.y} r={4} fill="#f43f5e" />
                </g>
              ))}

              {/* City Nodes */}
              {cities.map((city, idx) => {
                const tourPos = tour.indexOf(idx);
                const isI = tourPos === selectedI;
                const isJ = tourPos === selectedJ;

                return (
                  <g key={city.id} className="cursor-pointer group">
                    {/* Ring highlight if selected in operator */}
                    {(isI || isJ) && (
                      <circle
                        cx={city.x}
                        cy={city.y}
                        r={18}
                        fill="none"
                        stroke={isI ? '#06b6d4' : '#f59e0b'}
                        strokeWidth="2"
                        strokeDasharray="3,3"
                        className="animate-spin"
                        style={{ transformOrigin: `${city.x}px ${city.y}px`, animationDuration: '6s' }}
                      />
                    )}

                    <circle
                      cx={city.x}
                      cy={city.y}
                      r={12}
                      fill="#0f172a"
                      stroke={isI ? '#06b6d4' : isJ ? '#f59e0b' : '#38bdf8'}
                      strokeWidth={isI || isJ ? 3 : 2}
                    />

                    <text
                      x={city.x}
                      y={city.y + 4}
                      textAnchor="middle"
                      className="text-xs font-mono font-bold fill-white select-none pointer-events-none"
                    >
                      {city.label}
                    </text>

                    {/* Tour sequence number badge */}
                    <circle cx={city.x + 10} cy={city.y - 10} r={7} fill="#1e293b" stroke="#475569" strokeWidth="1" />
                    <text
                      x={city.x + 10}
                      y={city.y - 7}
                      textAnchor="middle"
                      className="text-[8px] font-mono fill-cyan-400 select-none pointer-events-none font-bold"
                    >
                      {tourPos + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick Explanation Note */}
          <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span className="font-mono">
              <strong>Triangle Inequality Theorem:</strong> Direct straight edge $d(A, D)$ is always shorter than detour through crossing point!
            </span>
            <button
              onClick={() => {
                setTour([0, 1, 2, 3, 4, 5]);
                setCities(presetBowtie);
              }}
              className="text-cyan-400 hover:underline font-mono text-[11px]"
            >
              Reset Bowtie
            </button>
          </div>
        </div>

        {/* Right 1 Col: Operator Configuration & Action */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
            <span className="text-xs font-bold text-white uppercase font-mono tracking-wider block">
              Neighborhood Operator Configuration
            </span>

            {/* Operator Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveOp('2-opt')}
                className={`py-1.5 rounded-lg transition-colors flex flex-col items-center gap-0.5 ${
                  activeOp === '2-opt'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>2-opt</span>
                <span className="text-[9px] font-mono opacity-80">Inversion</span>
              </button>

              <button
                onClick={() => setActiveOp('swap')}
                className={`py-1.5 rounded-lg transition-colors flex flex-col items-center gap-0.5 ${
                  activeOp === 'swap'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Swap</span>
                <span className="text-[9px] font-mono opacity-80">Exchange</span>
              </button>

              <button
                onClick={() => setActiveOp('insertion')}
                className={`py-1.5 rounded-lg transition-colors flex flex-col items-center gap-0.5 ${
                  activeOp === 'insertion'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Insert</span>
                <span className="text-[9px] font-mono opacity-80">Relocate</span>
              </button>
            </div>

            {/* Position Selectors */}
            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>First Point (i):</span>
                  <span className="text-cyan-400 font-bold">
                    Index {selectedI} ({cities[tour[selectedI]].label})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={tour.length - 1}
                  value={selectedI}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setSelectedI(val);
                    if (val >= selectedJ) setSelectedJ((val + 1) % tour.length);
                  }}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Second Point (j):</span>
                  <span className="text-amber-400 font-bold">
                    Index {selectedJ} ({cities[tour[selectedJ]].label})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={tour.length - 1}
                  value={selectedJ}
                  onChange={(e) => setSelectedJ(parseInt(e.target.value))}
                  className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Proposed Transition Card */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="text-[10px] uppercase font-mono text-slate-500">Proposed Transition Evaluation</div>
              <div className="flex justify-between items-baseline font-mono">
                <span className="text-xs text-slate-400">Old: {currentLength}</span>
                <span className="text-xs text-slate-200">New: {proposedLength}</span>
                <span
                  className={`text-sm font-bold ${
                    proposedDelta < 0 ? 'text-emerald-400' : proposedDelta > 0 ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  Δ = {proposedDelta > 0 ? `+${proposedDelta}` : proposedDelta}
                </span>
              </div>

              <button
                onClick={handleCommitProposed}
                className="w-full btn-tactile btn-primary text-xs py-2 mt-1"
              >
                Apply Proposed {activeOp} Move
              </button>
            </div>
          </div>

          {/* Search Trace Log */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs max-h-40 overflow-y-auto space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Local Search Log</div>
            {searchLog.map((log, i) => (
              <div key={i} className="text-slate-300 text-[11px]">
                ➜ {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Complete Neighborhood Space Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ArrowRightLeft size={14} className="text-cyan-400" />
            Complete Neighborhood N(π) · All {allNeighbors.length} Possible Candidates
          </h4>
          <span className="text-xs font-mono text-slate-400">
            {allNeighbors.filter((n) => n.delta < 0).length} Improvements Available
          </span>
        </div>

        <div className="overflow-x-auto bg-slate-950 rounded-xl border border-slate-800 max-h-60 overflow-y-auto">
          <table className="w-full text-xs text-left text-slate-300 font-mono">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] sticky top-0 border-b border-slate-800">
              <tr>
                <th className="p-3">Operator Action</th>
                <th className="p-3">Resulting Permutation π'</th>
                <th className="p-3">New Length f(π')</th>
                <th className="p-3">Δ = f(π') - f(π)</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {allNeighbors.map((n, idx) => {
                const isBest = idx === 0 && n.delta < 0;
                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-900/50 transition-colors ${
                      isBest ? 'bg-emerald-950/20' : n.delta < 0 ? 'bg-cyan-950/10' : ''
                    }`}
                  >
                    <td className="p-3 font-sans text-white font-medium flex items-center gap-1.5">
                      {isBest && <Sparkles size={13} className="text-emerald-400 shrink-0" />}
                      {n.description}
                    </td>
                    <td className="p-3 text-slate-400">
                      ({n.newTour.map((c) => cities[c].label).join(' ➜ ')})
                    </td>
                    <td className="p-3 font-bold text-white">{n.length}</td>
                    <td className="p-3 font-bold">
                      <span className={n.delta < 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {n.delta > 0 ? `+${n.delta}` : n.delta}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setTour(n.newTour);
                          setSearchLog((prev) => [
                            `Applied: ${n.description} (Δ = ${n.delta})`,
                            ...prev.slice(0, 12)
                          ]);
                        }}
                        className={`px-2 py-1 rounded text-[11px] border ${
                          isBest
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold hover:bg-emerald-400'
                            : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
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
  );
};
