import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  RotateCcw,
  Sparkles,
  Scissors,
  CheckCircle2,
  Shuffle,
  Play,
  Pause,
  AlertTriangle,
  ArrowRightLeft,
  Compass,
  TrendingDown
} from 'lucide-react';

interface City {
  id: number;
  label: string;
  x: number;
  y: number;
}

type TSPNeighborOp = '2-opt' | 'swap' | 'insertion';

export const TSPNeighborhoodsLab: React.FC = () => {
  // Preset 1: Tangled Bowtie (Classic 2-opt teaching example with crossing diagonals)
  const presetBowtie: City[] = [
    { id: 0, label: 'A', x: 130, y: 80 },
    { id: 1, label: 'B', x: 270, y: 220 },
    { id: 2, label: 'C', x: 410, y: 80 },
    { id: 3, label: 'D', x: 410, y: 240 },
    { id: 4, label: 'E', x: 270, y: 100 },
    { id: 5, label: 'F', x: 130, y: 240 },
  ];

  // Preset 2: Hexagon with Tangled Diagonals
  const presetHex: City[] = [
    { id: 0, label: 'A', x: 160, y: 80 },
    { id: 1, label: 'B', x: 360, y: 80 },
    { id: 2, label: 'C', x: 450, y: 160 },
    { id: 3, label: 'D', x: 360, y: 240 },
    { id: 4, label: 'E', x: 160, y: 240 },
    { id: 5, label: 'F', x: 70, y: 160 },
  ];

  // Preset 3: 8-City Complex Web
  const preset8Cities: City[] = [
    { id: 0, label: 'A', x: 110, y: 90 },
    { id: 1, label: 'B', x: 230, y: 60 },
    { id: 2, label: 'C', x: 370, y: 80 },
    { id: 3, label: 'D', x: 450, y: 170 },
    { id: 4, label: 'E', x: 390, y: 250 },
    { id: 5, label: 'F', x: 260, y: 260 },
    { id: 6, label: 'G', x: 120, y: 230 },
    { id: 7, label: 'H', x: 70, y: 160 },
  ];

  const [cities, setCities] = useState<City[]>(presetBowtie);
  const [tour, setTour] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  const [activeOp, setActiveOp] = useState<TSPNeighborOp>('2-opt');
  const [selectedEdge1, setSelectedEdge1] = useState<number>(0); // Index in tour
  const [selectedEdge2, setSelectedEdge2] = useState<number>(2); // Index in tour
  const [selectedCity1, setSelectedCity1] = useState<number | null>(null);

  // Playback / Local Search State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(500);
  const [hoveredCandidate, setHoveredCandidate] = useState<number[] | null>(null);
  const [draggedCityId, setDraggedCityId] = useState<number | null>(null);

  const [searchLog, setSearchLog] = useState<string[]>([
    'Tangled Bowtie loaded. Crossing lines detected between (A→B) and (E→F).'
  ]);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Euclidean distance between two cities
  const dist = (c1: City, c2: City) => {
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Compute total tour length
  const computeTourLength = useCallback((t: number[]) => {
    let total = 0;
    for (let i = 0; i < t.length; i++) {
      const from = cities[t[i]];
      const to = cities[t[(i + 1) % t.length]];
      total += dist(from, to);
    }
    return parseFloat(total.toFixed(1));
  }, [cities]);

  const currentLength = useMemo(() => computeTourLength(tour), [tour, computeTourLength]);

  // Segment intersection detection
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

  // Find all intersections in current tour
  const crossings = useMemo(() => {
    const result: { e1: [number, number]; e2: [number, number]; pt: { x: number; y: number } }[] = [];
    const n = tour.length;
    for (let i = 0; i < n; i++) {
      for (let j = i + 2; j < n; j++) {
        if (i === 0 && j === n - 1) continue; // adjacent wrap-around

        const a1 = cities[tour[i]];
        const a2 = cities[tour[(i + 1) % n]];
        const b1 = cities[tour[j]];
        const b2 = cities[tour[(j + 1) % n]];

        if (segmentsIntersect(a1, a2, b1, b2)) {
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
    let iPos = Math.min(i, j);
    let jPos = Math.max(i, j);
    if (iPos === 0 && jPos === n - 1) return t; // adjacent wrap-around

    const newTour = [...t];
    let left = iPos + 1;
    let right = jPos;
    while (left < right) {
      const tmp = newTour[left];
      newTour[left] = newTour[right];
      newTour[right] = tmp;
      left++;
      right--;
    }
    return newTour;
  };

  // Apply City Swap
  const applySwap = (t: number[], i: number, j: number): number[] => {
    const newTour = [...t];
    const tmp = newTour[i];
    newTour[i] = newTour[j];
    newTour[j] = tmp;
    return newTour;
  };

  // Apply City Insertion
  const applyInsertion = (t: number[], i: number, j: number): number[] => {
    const newTour = [...t];
    const [city] = newTour.splice(i, 1);
    newTour.splice(j, 0, city);
    return newTour;
  };

  // Proposed tour based on active operator
  const proposedTour = useMemo(() => {
    if (hoveredCandidate) return hoveredCandidate;

    if (activeOp === '2-opt') {
      return apply2Opt(tour, selectedEdge1, selectedEdge2);
    } else if (activeOp === 'swap') {
      return applySwap(tour, selectedEdge1, selectedEdge2);
    } else {
      return applyInsertion(tour, selectedEdge1, selectedEdge2);
    }
  }, [tour, activeOp, selectedEdge1, selectedEdge2, hoveredCandidate]);

  const proposedLength = useMemo(() => computeTourLength(proposedTour), [proposedTour, computeTourLength]);
  const proposedDelta = parseFloat((proposedLength - currentLength).toFixed(1));

  // Generate complete neighborhood N(tour)
  const allNeighbors = useMemo(() => {
    const n = tour.length;
    const list: {
      i: number;
      j: number;
      description: string;
      newTour: number[];
      length: number;
      delta: number;
      untanglesCrossing: boolean;
    }[] = [];

    if (activeOp === '2-opt') {
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (i === 0 && j === n - 1) continue;
          const nextT = apply2Opt(tour, i, j);
          const len = computeTourLength(nextT);
          const delta = parseFloat((len - currentLength).toFixed(1));

          // Check if this 2-opt untangles a known crossing
          const c1 = cities[tour[i]].label;
          const c2 = cities[tour[(i + 1) % n]].label;
          const c3 = cities[tour[j]].label;
          const c4 = cities[tour[(j + 1) % n]].label;

          list.push({
            i,
            j,
            description: `Cut (${c1}→${c2}) & (${c3}→${c4}), reverse subpath`,
            newTour: nextT,
            length: len,
            delta,
            untanglesCrossing: delta < -5.0
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
            description: `Swap cities ${cities[tour[i]].label} ⟷ ${cities[tour[j]].label}`,
            newTour: nextT,
            length: len,
            delta: parseFloat((len - currentLength).toFixed(1)),
            untanglesCrossing: false
          });
        }
      }
    } else {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i === j) continue;
          const nextT = applyInsertion(tour, i, j);
          const len = computeTourLength(nextT);
          list.push({
            i,
            j,
            description: `Relocate ${cities[tour[i]].label} to position ${j + 1}`,
            newTour: nextT,
            length: len,
            delta: parseFloat((len - currentLength).toFixed(1)),
            untanglesCrossing: false
          });
        }
      }
    }

    list.sort((a, b) => a.delta - b.delta);
    return list;
  }, [tour, cities, activeOp, currentLength, computeTourLength]);

  const bestNeighbor = allNeighbors[0];

  // Apply proposed move
  const handleCommitProposed = () => {
    setTour(proposedTour);
    setHoveredCandidate(null);
    setSearchLog((prev) => [
      `Applied ${activeOp}: Length ${currentLength} ➜ ${proposedLength} (Δ = ${proposedDelta > 0 ? `+${proposedDelta}` : proposedDelta})`,
      ...prev.slice(0, 10)
    ]);
  };

  // Perform single 2-opt Hill Climbing step
  const handleStep2Opt = () => {
    if (bestNeighbor && bestNeighbor.delta < -0.05) {
      setTour(bestNeighbor.newTour);
      setSearchLog((prev) => [
        `Steepest 2-opt Step: ${bestNeighbor.description} (Δ = ${bestNeighbor.delta}h) ➜ Length: ${bestNeighbor.length}`,
        ...prev.slice(0, 10)
      ]);
    } else {
      setIsPlaying(false);
      setSearchLog((prev) => [
        `★ 2-opt Local Optimum Reached! All ${allNeighbors.length} moves in N(x) have Δ ≥ 0 (Length = ${currentLength}).`,
        ...prev.slice(0, 10)
      ]);
    }
  };

  // Auto-play local search loop
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        if (!bestNeighbor || bestNeighbor.delta >= -0.05) {
          setIsPlaying(false);
        } else {
          setTour(bestNeighbor.newTour);
          setSearchLog((prev) => [
            `2-opt HC: ${bestNeighbor.description} (Δ = ${bestNeighbor.delta})`,
            ...prev.slice(0, 10)
          ]);
        }
      }, speedMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, bestNeighbor, speedMs]);

  // Click on city: tactile interaction for swap
  const handleCityClick = (cityIdx: number) => {
    const tourIndex = tour.indexOf(cityIdx);
    if (activeOp === 'swap') {
      if (selectedCity1 === null) {
        setSelectedCity1(tourIndex);
      } else if (selectedCity1 === tourIndex) {
        setSelectedCity1(null);
      } else {
        const nextT = applySwap(tour, selectedCity1, tourIndex);
        setTour(nextT);
        setSelectedCity1(null);
        setSearchLog((prev) => [
          `Map Click Swap: ${cities[tour[selectedCity1]].label} ⟷ ${cities[tour[tourIndex]].label}`,
          ...prev.slice(0, 10)
        ]);
      }
    } else {
      // In 2-opt mode, set edge cut point
      setSelectedEdge1(tourIndex);
      setSelectedEdge2((tourIndex + 2) % tour.length);
    }
  };

  // Dragging cities on the canvas
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggedCityId === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(40, Math.min(480, (e.clientX - rect.left) * (520 / rect.width)));
    const y = Math.max(40, Math.min(280, (e.clientY - rect.top) * (320 / rect.height)));

    setCities((prev) =>
      prev.map((c) => (c.id === draggedCityId ? { ...c, x: Math.round(x), y: Math.round(y) } : c))
    );
  };

  const handleMouseUp = () => {
    setDraggedCityId(null);
  };

  return (
    <div className="visualizer-container border-cyan-500/30 shadow-2xl">
      {/* Header */}
      <div className="visualizer-header border-b border-slate-800 pb-4">
        <div className="visualizer-title-area">
          <div className="flex items-center gap-2">
            <span className="badge badge-cyan flex items-center gap-1.5">
              <Compass size={13} />
              Slides 8–10 · Permutation Neighborhoods
            </span>
            <span className="text-xs text-slate-500 font-mono">Traveling Salesperson Problem (TSP)</span>
          </div>
          <h3 className="visualizer-title text-xl font-bold tracking-tight text-white flex items-center gap-2 mt-1">
            TSP Neighborhood Operators: 2-opt Inversion, City Swap & Insertion
          </h3>
          <p className="visualizer-subtitle text-xs text-slate-400 mt-1 max-w-2xl">
            Explore how neighborhood operators $N(\pi)$ reshape permutation tours. Witness the geometric power of <strong>2-opt</strong>: by triangle inequality, inverting crossed edges untangles lines and strictly decreases tour length ($\Delta &lt; 0$). Drag cities to modify the topology!
          </p>
        </div>

        {/* Global Controls */}
        <div className="visualizer-controls flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 mr-2 text-xs">
            {([
              { label: 'Slow', ms: 700 },
              { label: 'Normal', ms: 400 },
              { label: 'Fast', ms: 150 },
            ]).map((s) => (
              <button
                key={s.label}
                onClick={() => setSpeedMs(s.ms)}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  speedMs === s.ms ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={!bestNeighbor || bestNeighbor.delta >= 0}
            className={`btn-tactile text-xs flex items-center gap-1.5 ${
              isPlaying ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'btn-primary'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause size={14} /> Pause 2-opt
              </>
            ) : (
              <>
                <Play size={14} /> Auto Untangle (2-opt HC)
              </>
            )}
          </button>

          <button
            onClick={handleStep2Opt}
            disabled={isPlaying || !bestNeighbor || bestNeighbor.delta >= 0}
            className="btn-tactile btn-sm text-xs flex items-center gap-1.5 text-slate-200"
          >
            <Sparkles size={14} /> Step 2-opt
          </button>

          <button
            onClick={() => {
              const shuffled = [...tour].sort(() => Math.random() - 0.5);
              setTour(shuffled);
              setSearchLog([`Randomized tour: (${shuffled.map((c) => cities[c].label).join(' ➜ ')})`]);
            }}
            className="btn-tactile btn-sm text-xs flex items-center gap-1.5 text-slate-300"
          >
            <Shuffle size={13} /> Shuffle
          </button>
        </div>
      </div>

      <div className="visualizer-body space-y-6">
        {/* Status Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Preset Selector */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400">Benchmark Instances</span>
            <div className="flex gap-1.5 mt-1">
              <button
                onClick={() => {
                  setCities(presetBowtie);
                  setTour([0, 1, 2, 3, 4, 5]);
                  setIsPlaying(false);
                  setSearchLog(['Tangled Bowtie loaded (Classic crossing demonstration).']);
                }}
                className={`flex-1 py-1 text-xs rounded border transition-colors ${
                  cities === presetBowtie ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Bowtie
              </button>
              <button
                onClick={() => {
                  setCities(presetHex);
                  setTour([0, 3, 2, 5, 4, 1]);
                  setIsPlaying(false);
                  setSearchLog(['Hexagon instance loaded with tangled diagonals.']);
                }}
                className={`flex-1 py-1 text-xs rounded border transition-colors ${
                  cities === presetHex ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Hexagon
              </button>
              <button
                onClick={() => {
                  setCities(preset8Cities);
                  setTour([0, 4, 1, 5, 2, 6, 3, 7]);
                  setIsPlaying(false);
                  setSearchLog(['8-City Challenge loaded.']);
                }}
                className={`flex-1 py-1 text-xs rounded border transition-colors ${
                  cities === preset8Cities ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                8-Cities
              </button>
            </div>
          </div>

          {/* Current Permutation */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400">Current Tour Permutation π</span>
            <div className="text-sm font-mono font-bold text-cyan-300 mt-1 truncate">
              ({tour.map((idx) => cities[idx].label).join(' ➜ ')})
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Returns to {cities[tour[0]].label} (Cycle)</div>
          </div>

          {/* Total Cost / Length */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400">Tour Cost f(π)</span>
            <div className="text-2xl font-mono font-bold text-white mt-0.5">
              {currentLength} <span className="text-xs text-slate-500 font-normal">units</span>
            </div>
            <div className="text-[10px] font-mono flex items-center gap-1.5">
              {crossings.length > 0 ? (
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <AlertTriangle size={12} /> {crossings.length} Edge Crossing{crossings.length > 1 ? 's' : ''}!
                </span>
              ) : (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> 0 Crossings (2-opt optimal)
                </span>
              )}
            </div>
          </div>

          {/* Neighborhood Sizing Card */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400">Neighborhood Sizing |N(x)|</span>
            <div className="text-lg font-mono font-bold text-amber-300 mt-0.5">
              {allNeighbors.length} candidates
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

        {/* Main Canvas & Operator Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 2D Canvas */}
          <div className="lg:col-span-2 p-4 bg-slate-950 rounded-2xl border border-slate-800 relative">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono uppercase font-bold text-white tracking-wide flex items-center gap-1.5">
                <MapPin size={14} className="text-cyan-400" />
                2D Interactive Canvas (Drag cities or click to select)
              </span>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-cyan-300">
                  <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" /> Current Tour
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2.5 h-0.5 border-t-2 border-dashed border-amber-400 inline-block" /> Proposed
                </span>
              </div>
            </div>

            {/* SVG Canvas */}
            <div className="w-full h-80 relative bg-slate-900/40 rounded-xl border border-slate-800/80 overflow-hidden select-none">
              <svg
                ref={svgRef}
                className="w-full h-full cursor-crosshair"
                viewBox="0 0 520 320"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <defs>
                  <pattern id="tsp-grid-pattern" width="26" height="26" patternUnits="userSpaceOnUse">
                    <circle cx="13" cy="13" r="1" fill="#1e293b" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#tsp-grid-pattern)" />

                {/* Proposed Candidate Preview (dashed amber) */}
                {proposedTour && (
                  <polyline
                    points={[...proposedTour, proposedTour[0]]
                      .map((idx) => `${cities[idx].x},${cities[idx].y}`)
                      .join(' ')}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeDasharray="6,4"
                    opacity="0.75"
                  />
                )}

                {/* Current Tour Lines (solid cyan) */}
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
                      r={15}
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2"
                      strokeDasharray="3,3"
                      className="animate-pulse"
                    />
                    <circle cx={cross.pt.x} cy={cross.pt.y} r={4} fill="#f43f5e" />
                  </g>
                ))}

                {/* City Nodes */}
                {cities.map((city, idx) => {
                  const tourPos = tour.indexOf(idx);
                  const isSelectedForSwap = selectedCity1 === tourPos;
                  const isCutPoint = activeOp === '2-opt' && (tourPos === selectedEdge1 || tourPos === selectedEdge2);

                  return (
                    <g
                      key={city.id}
                      className="cursor-pointer group"
                      onMouseDown={() => setDraggedCityId(city.id)}
                      onClick={() => handleCityClick(idx)}
                    >
                      {/* Selection highlight ring */}
                      {(isSelectedForSwap || isCutPoint) && (
                        <circle
                          cx={city.x}
                          cy={city.y}
                          r={19}
                          fill="none"
                          stroke={isCutPoint ? '#f59e0b' : '#38bdf8'}
                          strokeWidth="2.5"
                          strokeDasharray="4,4"
                          className="animate-spin"
                          style={{ transformOrigin: `${city.x}px ${city.y}px`, animationDuration: '6s' }}
                        />
                      )}

                      <circle
                        cx={city.x}
                        cy={city.y}
                        r={13}
                        fill="#0f172a"
                        stroke={isCutPoint ? '#f59e0b' : isSelectedForSwap ? '#38bdf8' : '#06b6d4'}
                        strokeWidth={isCutPoint || isSelectedForSwap ? 3 : 2}
                        className="transition-all group-hover:scale-110"
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
                      <circle cx={city.x + 11} cy={city.y - 11} r={7.5} fill="#1e293b" stroke="#475569" strokeWidth="1" />
                      <text
                        x={city.x + 11}
                        y={city.y - 8}
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

            {/* Canvas Hint */}
            <div className="mt-2 text-[11px] text-slate-500 font-mono flex justify-between">
              <span>Tip: Click any city or drag to reshape geometry.</span>
              <span className="text-amber-400">
                {activeOp === '2-opt'
                  ? '2-opt cuts two edges and reverses the subpath'
                  : activeOp === 'swap'
                  ? 'Swap exchanges positions of two cities'
                  : 'Insertion relocates one city to another position'}
              </span>
            </div>
          </div>

          {/* Operator Controls & Live Decision */}
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider block">
                Operator Controls
              </span>

              {/* Operator Tabs */}
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => {
                    setActiveOp('2-opt');
                    setHoveredCandidate(null);
                  }}
                  className={`py-1.5 rounded-lg transition-colors flex flex-col items-center gap-0.5 ${
                    activeOp === '2-opt'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Scissors size={14} />
                  <span>2-opt</span>
                </button>

                <button
                  onClick={() => {
                    setActiveOp('swap');
                    setHoveredCandidate(null);
                  }}
                  className={`py-1.5 rounded-lg transition-colors flex flex-col items-center gap-0.5 ${
                    activeOp === 'swap'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ArrowRightLeft size={14} />
                  <span>Swap</span>
                </button>

                <button
                  onClick={() => {
                    setActiveOp('insertion');
                    setHoveredCandidate(null);
                  }}
                  className={`py-1.5 rounded-lg transition-colors flex flex-col items-center gap-0.5 ${
                    activeOp === 'insertion'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <RotateCcw size={14} />
                  <span>Insert</span>
                </button>
              </div>

              {/* Position Pickers */}
              <div className="space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Edge 1 / City 1 (i):</span>
                    <span className="text-cyan-400 font-bold">
                      {cities[tour[selectedEdge1]].label} (Pos {selectedEdge1 + 1})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={tour.length - 1}
                    value={selectedEdge1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setSelectedEdge1(val);
                      if (val >= selectedEdge2) setSelectedEdge2((val + 1) % tour.length);
                    }}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Edge 2 / City 2 (j):</span>
                    <span className="text-amber-400 font-bold">
                      {cities[tour[selectedEdge2]].label} (Pos {selectedEdge2 + 1})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={tour.length - 1}
                    value={selectedEdge2}
                    onChange={(e) => setSelectedEdge2(parseInt(e.target.value))}
                    className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Evaluation Card */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[10px] uppercase font-mono text-slate-500">Evaluation Comparison</div>
                <div className="flex justify-between items-baseline font-mono">
                  <span className="text-xs text-slate-400">Current: {currentLength}</span>
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
                  Apply {activeOp} Move
                </button>
              </div>
            </div>

            {/* Trace Log */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs max-h-36 overflow-y-auto space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Search Event Log</div>
              {searchLog.map((log, i) => (
                <div key={i} className="text-slate-300 text-[11px]">
                  ➜ {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Neighborhood Matrix & Ranked Moves */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingDown size={14} className="text-cyan-400" />
              Complete Neighborhood Space N(π) · All {allNeighbors.length} Evaluated Transitions
            </h4>
            <span className="text-xs font-mono text-slate-400">
              {allNeighbors.filter((n) => n.delta < 0).length} Improving Moves Available
            </span>
          </div>

          <div className="overflow-x-auto bg-slate-950 rounded-xl border border-slate-800 max-h-56 overflow-y-auto">
            <table className="w-full text-xs text-left text-slate-300 font-mono">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="p-3">Operator Action</th>
                  <th className="p-3">Resulting Permutation π'</th>
                  <th className="p-3">Tour Length f(π')</th>
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
                      onMouseEnter={() => setHoveredCandidate(n.newTour)}
                      onMouseLeave={() => setHoveredCandidate(null)}
                      className={`hover:bg-slate-900/60 transition-colors cursor-pointer ${
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
                        <span className={n.delta < 0 ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                          {n.delta > 0 ? `+${n.delta}` : n.delta}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setTour(n.newTour);
                            setHoveredCandidate(null);
                            setSearchLog((prev) => [
                              `Applied move: ${n.description} (Δ = ${n.delta})`,
                              ...prev.slice(0, 10)
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
    </div>
  );
};
