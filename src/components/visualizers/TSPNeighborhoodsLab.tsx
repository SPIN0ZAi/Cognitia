import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Compass,
  Scissors,
  RotateCcw,
  Sparkles,
  Play,
  Pause,
  Shuffle,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  ArrowRight,
  MapPin,
  TrendingDown,
  Layers,
  HelpCircle
} from 'lucide-react';

interface City {
  id: number;
  label: string;
  x: number;
  y: number;
}

type TSPNeighborOp = '2-opt' | 'swap' | 'insertion';

export const TSPNeighborhoodsLab: React.FC = () => {
  // Preset 1: Tangled Bowtie (Classic 2-opt textbook example with crossing diagonals)
  const presetBowtie: City[] = useMemo(() => [
    { id: 0, label: 'A', x: 130, y: 75 },
    { id: 1, label: 'B', x: 280, y: 225 },
    { id: 2, label: 'C', x: 420, y: 75 },
    { id: 3, label: 'D', x: 420, y: 245 },
    { id: 4, label: 'E', x: 280, y: 95 },
    { id: 5, label: 'F', x: 130, y: 245 },
  ], []);

  // Preset 2: Hexagon with Tangled Diagonals
  const presetHex: City[] = useMemo(() => [
    { id: 0, label: 'A', x: 170, y: 75 },
    { id: 1, label: 'B', x: 370, y: 75 },
    { id: 2, label: 'C', x: 460, y: 160 },
    { id: 3, label: 'D', x: 370, y: 245 },
    { id: 4, label: 'E', x: 170, y: 245 },
    { id: 5, label: 'F', x: 80, y: 160 },
  ], []);

  // Preset 3: 8-City Complex Web
  const preset8Cities: City[] = useMemo(() => [
    { id: 0, label: 'A', x: 110, y: 85 },
    { id: 1, label: 'B', x: 240, y: 60 },
    { id: 2, label: 'C', x: 380, y: 75 },
    { id: 3, label: 'D', x: 460, y: 165 },
    { id: 4, label: 'E', x: 390, y: 255 },
    { id: 5, label: 'F', x: 260, y: 265 },
    { id: 6, label: 'G', x: 120, y: 235 },
    { id: 7, label: 'H', x: 70, y: 160 },
  ], []);

  const [cities, setCities] = useState<City[]>(presetBowtie);
  const [tour, setTour] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  const [activeOp, setActiveOp] = useState<TSPNeighborOp>('2-opt');
  const [activeTab, setActiveTab] = useState<'visualizer' | 'gallery' | 'solver' | 'theory'>('visualizer');

  // Manual Operator Selection
  const [selectedEdge1, setSelectedEdge1] = useState<number>(0); // Index in tour
  const [selectedEdge2, setSelectedEdge2] = useState<number>(2); // Index in tour
  const [selectedCityA, setSelectedCityA] = useState<number | null>(null);
  const [hoveredCandidate, setHoveredCandidate] = useState<number[] | null>(null);

  // Playback / Solver state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(400);
  const [tourHistory, setTourHistory] = useState<{ step: number; length: number; label: string }[]>([
    { step: 0, length: 0, label: 'Initial Tour' }
  ]);
  const [draggedCityId, setDraggedCityId] = useState<number | null>(null);
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'improvements' | 'untangling'>('all');

  // Theory Quiz state
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Euclidean distance between two cities
  const dist = (c1: City, c2: City) => {
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Compute total tour length
  const computeTourLength = useCallback(
    (t: number[]) => {
      let total = 0;
      for (let i = 0; i < t.length; i++) {
        const from = cities[t[i]];
        const to = cities[t[(i + 1) % t.length]];
        total += dist(from, to);
      }
      return parseFloat(total.toFixed(1));
    },
    [cities]
  );

  const currentLength = useMemo(() => computeTourLength(tour), [tour, computeTourLength]);

  // Sync initial history length
  useEffect(() => {
    setTourHistory([{ step: 0, length: currentLength, label: 'Initial Configuration' }]);
  }, [currentLength]);

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
    const iPos = Math.min(i, j);
    const jPos = Math.max(i, j);
    if (iPos === 0 && jPos === n - 1) return t;

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

  // Proposed candidate based on active operator
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

          const c1 = cities[tour[i]].label;
          const c2 = cities[tour[(i + 1) % n]].label;
          const c3 = cities[tour[j]].label;
          const c4 = cities[tour[(j + 1) % n]].label;

          list.push({
            i,
            j,
            description: `Cut (${c1}→${c2}) & (${c3}→${c4}), reverse intermediate subpath`,
            newTour: nextT,
            length: len,
            delta,
            untanglesCrossing: delta < -3.0
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

  // Filtered neighbors for the gallery
  const filteredNeighbors = useMemo(() => {
    if (galleryFilter === 'improvements') return allNeighbors.filter((n) => n.delta < 0);
    if (galleryFilter === 'untangling') return allNeighbors.filter((n) => n.untanglesCrossing);
    return allNeighbors;
  }, [allNeighbors, galleryFilter]);

  // Apply proposed move
  const handleCommitProposed = () => {
    setTour(proposedTour);
    setHoveredCandidate(null);
    setTourHistory((prev) => [
      ...prev,
      {
        step: prev.length,
        length: proposedLength,
        label: `${activeOp.toUpperCase()} (Δ = ${proposedDelta > 0 ? `+${proposedDelta}` : proposedDelta})`
      }
    ]);
  };

  // Perform single greedy step
  const handleStepGreedy = () => {
    if (bestNeighbor && bestNeighbor.delta < -0.05) {
      setTour(bestNeighbor.newTour);
      setTourHistory((prev) => [
        ...prev,
        {
          step: prev.length,
          length: bestNeighbor.length,
          label: `Steepest 2-opt (Δ = ${bestNeighbor.delta})`
        }
      ]);
    } else {
      setIsPlaying(false);
    }
  };

  // Solver play loop
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        if (!bestNeighbor || bestNeighbor.delta >= -0.05) {
          setIsPlaying(false);
        } else {
          setTour(bestNeighbor.newTour);
          setTourHistory((prev) => [
            ...prev,
            {
              step: prev.length,
              length: bestNeighbor.length,
              label: `2-opt Step (Δ = ${bestNeighbor.delta})`
            }
          ]);
        }
      }, speedMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, bestNeighbor, speedMs]);

  // Map click interaction
  const handleCityClick = (cityIdx: number) => {
    const tourIndex = tour.indexOf(cityIdx);
    if (activeOp === 'swap') {
      if (selectedCityA === null) {
        setSelectedCityA(tourIndex);
      } else if (selectedCityA === tourIndex) {
        setSelectedCityA(null);
      } else {
        const nextT = applySwap(tour, selectedCityA, tourIndex);
        setTour(nextT);
        setSelectedCityA(null);
      }
    } else {
      // In 2-opt mode, set edge cut pair
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
    <div className="visualizer-container border-cyan-500/30 shadow-2xl space-y-6">
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
            Permutations cannot use standard bit-flips without creating invalid tours. Explore how <strong>2-opt</strong>, <strong>City Swap</strong>, and <strong>Insertion</strong> explore the permutation space $\Pi_n$. By the Triangle Inequality, inverting crossing edges with 2-opt strictly drops tour length ($\Delta &lt; 0$).
          </p>
        </div>

        {/* Global Controls */}
        <div className="visualizer-controls flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 mr-2 text-xs">
            {([
              { label: 'Slow', ms: 700 },
              { label: 'Normal', ms: 400 },
              { label: 'Fast', ms: 120 },
            ]).map((s) => (
              <button
                key={s.label}
                onClick={() => setSpeedMs(s.ms)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  speedMs === s.ms ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={!bestNeighbor || bestNeighbor.delta >= -0.05}
            className={`btn-tactile text-xs flex items-center gap-1.5 ${
              isPlaying ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'btn-primary'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause size={14} /> Pause
              </>
            ) : (
              <>
                <Play size={14} /> Auto Untangle (2-opt HC)
              </>
            )}
          </button>

          <button
            onClick={handleStepGreedy}
            disabled={isPlaying || !bestNeighbor || bestNeighbor.delta >= -0.05}
            className="btn-tactile btn-sm text-xs flex items-center gap-1.5 text-slate-200"
          >
            <Sparkles size={14} /> Step 2-opt
          </button>

          <button
            onClick={() => {
              const shuffled = [...tour].sort(() => Math.random() - 0.5);
              setTour(shuffled);
            }}
            className="btn-tactile btn-sm text-xs flex items-center gap-1.5 text-slate-300"
          >
            <Shuffle size={13} /> Shuffle
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('visualizer')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'visualizer'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin size={14} />
          Interactive 2D Canvas & Operator Workbench
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'gallery'
              ? 'border-amber-400 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers size={14} />
          Full Neighborhood Gallery |N(π)| ({allNeighbors.length})
        </button>
        <button
          onClick={() => setActiveTab('solver')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'solver'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingDown size={14} />
          Convergence Telemetry & History
        </button>
        <button
          onClick={() => setActiveTab('theory')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'theory'
              ? 'border-purple-400 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle size={14} />
          UCLM Theory & Sizing Exam Quiz
        </button>
      </div>

      {/* Status Bar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Preset Selector */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Instance Topology</span>
          <div className="flex gap-1.5 mt-1">
            <button
              onClick={() => {
                setCities(presetBowtie);
                setTour([0, 1, 2, 3, 4, 5]);
                setIsPlaying(false);
              }}
              className={`flex-1 py-1 text-xs rounded border transition-colors ${
                cities === presetBowtie
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              Bowtie
            </button>
            <button
              onClick={() => {
                setCities(presetHex);
                setTour([0, 3, 2, 5, 4, 1]);
                setIsPlaying(false);
              }}
              className={`flex-1 py-1 text-xs rounded border transition-colors ${
                cities === presetHex
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              Hexagon
            </button>
            <button
              onClick={() => {
                setCities(preset8Cities);
                setTour([0, 4, 1, 5, 2, 6, 3, 7]);
                setIsPlaying(false);
              }}
              className={`flex-1 py-1 text-xs rounded border transition-colors ${
                cities === preset8Cities
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              8-Cities
            </button>
          </div>
        </div>

        {/* Current Permutation */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Current Tour π</span>
          <div className="text-sm font-mono font-bold text-cyan-300 mt-1 truncate">
            ({tour.map((idx) => cities[idx].label).join(' ➜ ')})
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Returns to {cities[tour[0]].label} (Closed Cycle)</div>
        </div>

        {/* Tour Cost f(π) */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Total Distance f(π)</span>
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
                <CheckCircle2 size={12} /> 0 Crossings (2-opt Local Optimum)
              </span>
            )}
          </div>
        </div>

        {/* Operator Sizing */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Active Operator Sizing |N(π)|</span>
          <div className="text-lg font-mono font-bold text-amber-300 mt-0.5">
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

      {/* TAB 1: INTERACTIVE 2D CANVAS & OPERATOR WORKBENCH */}
      {activeTab === 'visualizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-2 p-4 bg-slate-950 rounded-2xl border border-slate-800 relative">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono uppercase font-bold text-white tracking-wide flex items-center gap-1.5">
                <MapPin size={14} className="text-cyan-400" />
                2D Topology Canvas (Click/Drag cities to reshape geometry)
              </span>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-cyan-300">
                  <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" /> Current Tour
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2.5 h-0.5 border-t-2 border-dashed border-amber-400 inline-block" /> Proposed Candidate
                </span>
              </div>
            </div>

            <div className="w-full h-84 relative bg-slate-900/40 rounded-xl border border-slate-800/80 overflow-hidden select-none">
              <svg
                ref={svgRef}
                className="w-full h-full cursor-crosshair"
                viewBox="0 0 520 320"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <defs>
                  <pattern id="tsp-grid-pattern-v2" width="26" height="26" patternUnits="userSpaceOnUse">
                    <circle cx="13" cy="13" r="1" fill="#1e293b" />
                  </pattern>
                  <filter id="tsp-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#06b6d4" floodOpacity="0.6" />
                  </filter>
                  <filter id="tsp-glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.8" />
                  </filter>
                </defs>
                <rect width="100%" height="100%" fill="url(#tsp-grid-pattern-v2)" />

                {/* Proposed Candidate Tour Preview (dashed amber) */}
                {proposedTour && (
                  <polyline
                    points={[...proposedTour, proposedTour[0]]
                      .map((idx) => `${cities[idx].x},${cities[idx].y}`)
                      .join(' ')}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeDasharray="6,4"
                    opacity="0.85"
                    filter="url(#tsp-glow-amber)"
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
                  filter="url(#tsp-glow-cyan)"
                />

                {/* Crossing Beacons */}
                {crossings.map((cross, i) => (
                  <g key={i}>
                    <circle
                      cx={cross.pt.x}
                      cy={cross.pt.y}
                      r={16}
                      fill="rgba(244, 63, 94, 0.15)"
                      stroke="#f43f5e"
                      strokeWidth="2"
                      strokeDasharray="3,3"
                      className="animate-pulse"
                    />
                    <circle cx={cross.pt.x} cy={cross.pt.y} r={4.5} fill="#f43f5e" />
                    <text
                      x={cross.pt.x}
                      y={cross.pt.y - 12}
                      textAnchor="middle"
                      className="text-[9px] font-mono fill-rose-300 font-bold"
                    >
                      Cross #{i + 1}
                    </text>
                  </g>
                ))}

                {/* City Nodes */}
                {cities.map((city, idx) => {
                  const tourPos = tour.indexOf(idx);
                  const isSelectedForSwap = selectedCityA === tourPos;
                  const isCutPoint = activeOp === '2-opt' && (tourPos === selectedEdge1 || tourPos === selectedEdge2);

                  return (
                    <g
                      key={city.id}
                      className="cursor-pointer group"
                      onMouseDown={() => setDraggedCityId(city.id)}
                      onClick={() => handleCityClick(idx)}
                    >
                      {/* Selection ring */}
                      {(isSelectedForSwap || isCutPoint) && (
                        <circle
                          cx={city.x}
                          cy={city.y}
                          r={20}
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
                        className="transition-transform group-hover:scale-110"
                      />

                      <text
                        x={city.x}
                        y={city.y + 4}
                        textAnchor="middle"
                        className="text-xs font-mono font-bold fill-white select-none pointer-events-none"
                      >
                        {city.label}
                      </text>

                      {/* Sequence Badge */}
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

            <div className="mt-2 text-[11px] text-slate-500 font-mono flex justify-between">
              <span>Drag any city to reshape layout dynamically.</span>
              <span className="text-cyan-400">
                Active Operator: <strong>{activeOp.toUpperCase()}</strong>
              </span>
            </div>
          </div>

          {/* Workbench */}
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider block">
                Operator Selector
              </span>

              {/* Operator Tabs */}
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => {
                    setActiveOp('2-opt');
                    setHoveredCandidate(null);
                  }}
                  className={`py-2 rounded-lg transition-colors flex flex-col items-center gap-1 ${
                    activeOp === '2-opt'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Scissors size={14} />
                  <span>2-opt Inversion</span>
                </button>
                <button
                  onClick={() => {
                    setActiveOp('swap');
                    setHoveredCandidate(null);
                  }}
                  className={`py-2 rounded-lg transition-colors flex flex-col items-center gap-1 ${
                    activeOp === 'swap'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ArrowRightLeft size={14} />
                  <span>City Swap</span>
                </button>
                <button
                  onClick={() => {
                    setActiveOp('insertion');
                    setHoveredCandidate(null);
                  }}
                  className={`py-2 rounded-lg transition-colors flex flex-col items-center gap-1 ${
                    activeOp === 'insertion'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ArrowRight size={14} />
                  <span>Insertion</span>
                </button>
              </div>

              {/* Specific Operator Workbench */}
              {activeOp === '2-opt' && (
                <div className="space-y-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-300 font-mono">
                    <span className="flex items-center gap-1">
                      <Scissors size={13} className="text-amber-400" /> Cut Edges:
                    </span>
                    <span className="text-amber-300 font-bold">
                      ({cities[tour[selectedEdge1]].label}→{cities[tour[(selectedEdge1 + 1) % tour.length]].label}) & (
                      {cities[tour[selectedEdge2]].label}→{cities[tour[(selectedEdge2 + 1) % tour.length]].label})
                    </span>
                  </div>

                  {/* Cut Edge Sliders */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Cut Edge 1 Position:</span>
                        <span className="font-mono text-cyan-300">
                          {cities[tour[selectedEdge1]].label} (Index {selectedEdge1 + 1})
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={tour.length - 1}
                        value={selectedEdge1}
                        onChange={(e) => setSelectedEdge1(parseInt(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Cut Edge 2 Position:</span>
                        <span className="font-mono text-cyan-300">
                          {cities[tour[selectedEdge2]].label} (Index {selectedEdge2 + 1})
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={tour.length - 1}
                        value={selectedEdge2}
                        onChange={(e) => setSelectedEdge2(parseInt(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    By reversing the segment between cut points, the two crossed lines are disconnected and reattached to adjacent endpoints, eliminating the diagonal crossing.
                  </p>
                </div>
              )}

              {activeOp === 'swap' && (
                <div className="space-y-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="text-slate-300 font-mono">
                    Select two positions to swap on the map or sliders:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">First City:</label>
                      <select
                        value={selectedEdge1}
                        onChange={(e) => setSelectedEdge1(parseInt(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono"
                      >
                        {tour.map((cIdx, pos) => (
                          <option key={pos} value={pos}>
                            Position {pos + 1}: City {cities[cIdx].label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Second City:</label>
                      <select
                        value={selectedEdge2}
                        onChange={(e) => setSelectedEdge2(parseInt(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono"
                      >
                        {tour.map((cIdx, pos) => (
                          <option key={pos} value={pos}>
                            Position {pos + 1}: City {cities[cIdx].label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeOp === 'insertion' && (
                <div className="space-y-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="text-slate-300 font-mono">
                    Relocate City from Source Index to Destination Index:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Source City:</label>
                      <select
                        value={selectedEdge1}
                        onChange={(e) => setSelectedEdge1(parseInt(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono"
                      >
                        {tour.map((cIdx, pos) => (
                          <option key={pos} value={pos}>
                            City {cities[cIdx].label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Target Position:</label>
                      <select
                        value={selectedEdge2}
                        onChange={(e) => setSelectedEdge2(parseInt(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono"
                      >
                        {tour.map((_, pos) => (
                          <option key={pos} value={pos}>
                            Slot {pos + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Proposed Impact Card */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between font-mono text-xs ${
                  proposedDelta < 0
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : proposedDelta === 0
                    ? 'bg-slate-950 border-slate-800 text-slate-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div>
                  <div className="text-[10px] uppercase text-slate-400">Proposed Transition</div>
                  <div className="font-bold text-sm">
                    {currentLength} ➜ {proposedLength}{' '}
                    <span>({proposedDelta > 0 ? `+${proposedDelta}` : proposedDelta} units)</span>
                  </div>
                </div>

                <button
                  onClick={handleCommitProposed}
                  disabled={proposedDelta === 0}
                  className={`btn-tactile btn-sm text-xs font-bold ${
                    proposedDelta < 0 ? 'btn-emerald' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Apply Move
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FULL NEIGHBORHOOD GALLERY |N(π)| */}
      {activeTab === 'gallery' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white font-mono">Filter Candidate Moves:</span>
              <button
                onClick={() => setGalleryFilter('all')}
                className={`px-2.5 py-1 rounded font-mono ${
                  galleryFilter === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400'
                }`}
              >
                All ({allNeighbors.length})
              </button>
              <button
                onClick={() => setGalleryFilter('improvements')}
                className={`px-2.5 py-1 rounded font-mono ${
                  galleryFilter === 'improvements'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400'
                }`}
              >
                Improvements Only ({allNeighbors.filter((n) => n.delta < 0).length})
              </button>
              <button
                onClick={() => setGalleryFilter('untangling')}
                className={`px-2.5 py-1 rounded font-mono ${
                  galleryFilter === 'untangling'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400'
                }`}
              >
                Untangling Moves ({allNeighbors.filter((n) => n.untanglesCrossing).length})
              </button>
            </div>
            <span className="text-slate-400 font-mono text-[11px]">
              Hover over any candidate to preview ghost path on map!
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
            {filteredNeighbors.map((n, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredCandidate(n.newTour)}
                onMouseLeave={() => setHoveredCandidate(null)}
                onClick={() => {
                  setTour(n.newTour);
                  setHoveredCandidate(null);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                  n.delta < -0.05
                    ? 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-400'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start text-xs font-mono">
                  <span className="font-bold text-slate-300">Candidate #{idx + 1}</span>
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      n.delta < 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {n.delta > 0 ? `+${n.delta}` : n.delta} units
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{n.description}</p>
                <div className="text-[10px] font-mono text-cyan-400 mt-2 truncate">
                  ({n.newTour.map((c) => cities[c].label).join('→')})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONVERGENCE TELEMETRY & HISTORY */}
      {activeTab === 'solver' && (
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono font-bold text-white uppercase tracking-wider">
              2-opt Hill Climbing Convergence Trajectory
            </span>
            <button
              onClick={() =>
                setTourHistory([{ step: 0, length: currentLength, label: 'Reset Configuration' }])
              }
              className="btn-tactile btn-xs flex items-center gap-1 text-slate-400"
            >
              <RotateCcw size={12} /> Clear History
            </button>
          </div>

          {/* SVG Line Chart */}
          <div className="w-full h-48 bg-slate-900/60 rounded-xl border border-slate-800 p-3 relative flex flex-col justify-end">
            <svg className="w-full h-full" viewBox="0 0 500 140">
              {tourHistory.length > 1 && (
                <polyline
                  points={tourHistory
                    .map((h, i) => {
                      const x = (i / Math.max(1, tourHistory.length - 1)) * 480 + 10;
                      const maxLen = Math.max(...tourHistory.map((pt) => pt.length), 100);
                      const minLen = Math.min(...tourHistory.map((pt) => pt.length), 50);
                      const norm = (h.length - minLen) / Math.max(1, maxLen - minLen);
                      const y = 120 - norm * 100;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
              )}

              {tourHistory.map((h, i) => {
                const x = (i / Math.max(1, tourHistory.length - 1)) * 480 + 10;
                const maxLen = Math.max(...tourHistory.map((pt) => pt.length), 100);
                const minLen = Math.min(...tourHistory.map((pt) => pt.length), 50);
                const norm = (h.length - minLen) / Math.max(1, maxLen - minLen);
                const y = 120 - norm * 100;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r={4} fill="#10b981" />
                    <text x={x} y={y - 8} textAnchor="middle" className="text-[9px] font-mono fill-slate-400">
                      {h.length}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="text-xs text-slate-400 font-mono flex items-center justify-between">
            <span>Total Steps Taken: {tourHistory.length - 1}</span>
            <span className="text-emerald-400">
              Current Tour Cost: <strong>{currentLength} units</strong>
            </span>
          </div>
        </div>
      )}

      {/* TAB 4: UCLM THEORY & SIZING EXAM QUIZ */}
      {activeTab === 'theory' && (
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <HelpCircle size={16} className="text-purple-400" />
            Official UCLM Exam Quiz: Permutation Neighborhood Sizing
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-3">
            <p className="text-slate-300 font-medium leading-relaxed">
              <strong>Question (Slides 8–10)</strong>: For a Traveling Salesperson Problem with N = 10 cities:
              <br />
              1. What is the size of the <strong>2-opt neighborhood</strong> |N_2opt(π)|?
              <br />
              2. What is the size of the <strong>City Insertion neighborhood</strong> |N_insert(π)|?
            </p>

            <div className="space-y-2">
              {[
                {
                  id: 'A',
                  text: '2-opt: 45 candidate moves; Insertion: 90 candidate moves'
                },
                {
                  id: 'B',
                  text: '2-opt: 90 candidate moves; Insertion: 45 candidate moves'
                },
                {
                  id: 'C',
                  text: '2-opt: 10! / 2 moves; Insertion: 10! moves'
                },
                {
                  id: 'D',
                  text: '2-opt: 10 candidate moves; Insertion: 20 candidate moves'
                }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setQuizAnswer(opt.id)}
                  className={`w-full p-2.5 rounded-lg border text-left font-mono transition-all ${
                    quizAnswer === opt.id
                      ? 'border-purple-400 bg-purple-500/10 text-purple-200 font-bold'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-purple-400 mr-2">[{opt.id}]</span>
                  {opt.text}
                </button>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => setQuizSubmitted(true)}
                disabled={!quizAnswer}
                className="btn-tactile btn-primary text-xs"
              >
                Submit Answer
              </button>

              {quizSubmitted && (
                <span
                  className={`font-mono text-xs font-bold flex items-center gap-1.5 ${
                    quizAnswer === 'A' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {quizAnswer === 'A' ? (
                    <>
                      <CheckCircle2 size={14} /> Correct! |N_2opt| = 10(9)/2 = 45; |N_insert| = 10(9) = 90.
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={14} /> Incorrect. 2-opt selects 2 distinct edges (10×9/2 = 45), while Insertion relocates any of the 10 cities into 9 other positions (10×9 = 90).
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
