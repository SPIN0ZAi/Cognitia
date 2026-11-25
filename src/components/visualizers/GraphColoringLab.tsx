import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Palette
} from 'lucide-react';

interface Vertex {
  id: number;
  label: string;
  x: number;
  y: number;
}

interface Edge {
  u: number;
  v: number;
}

export type GraphPreset = 'castilla-la-mancha' | 'petersen' | 'cycle5' | 'bipartite';

interface GraphConfig {
  name: string;
  description: string;
  chromaticNumber: number;
  vertices: Vertex[];
  edges: Edge[];
}

const COLOR_PALETTE = [
  { id: 0, hex: '#38bdf8', label: 'Cyan' },
  { id: 1, hex: '#fb7185', label: 'Rose' },
  { id: 2, hex: '#c6f277', label: 'Lime' },
  { id: 3, hex: '#fbbf24', label: 'Amber' },
  { id: 4, hex: '#a78bfa', label: 'Violet' }
];

export const GraphColoringLab: React.FC = () => {
  const [preset, setPreset] = useState<GraphPreset>('castilla-la-mancha');
  const [paletteSize, setPaletteSize] = useState<number>(3); // k = 3 or 4
  const [selectedColor, setSelectedColor] = useState<number>(0);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [solveSteps, setSolveSteps] = useState<number>(0);

  // Graph Presets
  const graphData: GraphConfig = useMemo(() => {
    if (preset === 'castilla-la-mancha') {
      // 5 Provinces of Castilla-La Mancha (UCLM campus cities!)
      // Toledo borders: Ciudad Real, Cuenca, Guadalajara
      // Ciudad Real borders: Toledo, Cuenca, Albacete
      // Cuenca borders: Guadalajara, Toledo, Ciudad Real, Albacete
      // Guadalajara borders: Toledo, Cuenca
      // Albacete borders: Cuenca, Ciudad Real
      const vertices: Vertex[] = [
        { id: 0, label: 'Toledo', x: 180, y: 130 },
        { id: 1, label: 'Ciudad Real', x: 200, y: 250 },
        { id: 2, label: 'Cuenca', x: 380, y: 120 },
        { id: 3, label: 'Guadalajara', x: 320, y: 50 },
        { id: 4, label: 'Albacete', x: 420, y: 240 }
      ];
      const edges: Edge[] = [
        { u: 0, v: 1 }, // Toledo - Ciudad Real
        { u: 0, v: 2 }, // Toledo - Cuenca
        { u: 0, v: 3 }, // Toledo - Guadalajara
        { u: 1, v: 2 }, // Ciudad Real - Cuenca
        { u: 1, v: 4 }, // Ciudad Real - Albacete
        { u: 2, v: 3 }, // Cuenca - Guadalajara
        { u: 2, v: 4 }  // Cuenca - Albacete
      ];
      return {
        name: 'Castilla-La Mancha Provinces',
        description: 'Map planar graph of the 5 UCLM region provinces. Chromatic number χ(G) = 3.',
        chromaticNumber: 3,
        vertices,
        edges
      };
    } else if (preset === 'petersen') {
      // Petersen Graph (10 vertices, 15 edges)
      const vertices: Vertex[] = [
        // Outer pentagon
        { id: 0, label: '0', x: 300, y: 40 },
        { id: 1, label: '1', x: 440, y: 140 },
        { id: 2, label: '2', x: 390, y: 280 },
        { id: 3, label: '3', x: 210, y: 280 },
        { id: 4, label: '4', x: 160, y: 140 },
        // Inner pentagram
        { id: 5, label: '5', x: 300, y: 100 },
        { id: 6, label: '6', x: 380, y: 160 },
        { id: 7, label: '7', x: 350, y: 235 },
        { id: 8, label: '8', x: 250, y: 235 },
        { id: 9, label: '9', x: 220, y: 160 }
      ];
      const edges: Edge[] = [
        // Outer ring
        { u: 0, v: 1 }, { u: 1, v: 2 }, { u: 2, v: 3 }, { u: 3, v: 4 }, { u: 4, v: 0 },
        // Inner star
        { u: 5, v: 7 }, { u: 7, v: 9 }, { u: 9, v: 6 }, { u: 6, v: 8 }, { u: 8, v: 5 },
        // Spokes
        { u: 0, v: 5 }, { u: 1, v: 6 }, { u: 2, v: 7 }, { u: 3, v: 8 }, { u: 4, v: 9 }
      ];
      return {
        name: 'Petersen Graph',
        description: 'Famous non-planar symmetric graph with girth 5. Chromatic number χ(G) = 3.',
        chromaticNumber: 3,
        vertices,
        edges
      };
    } else if (preset === 'bipartite') {
      // Complete Bipartite K(3,3)
      const vertices: Vertex[] = [
        { id: 0, label: 'A1', x: 180, y: 70 },
        { id: 1, label: 'A2', x: 180, y: 170 },
        { id: 2, label: 'A3', x: 180, y: 270 },
        { id: 3, label: 'B1', x: 420, y: 70 },
        { id: 4, label: 'B2', x: 420, y: 170 },
        { id: 5, label: 'B3', x: 420, y: 270 }
      ];
      const edges: Edge[] = [
        { u: 0, v: 3 }, { u: 0, v: 4 }, { u: 0, v: 5 },
        { u: 1, v: 3 }, { u: 1, v: 4 }, { u: 1, v: 5 },
        { u: 2, v: 3 }, { u: 2, v: 4 }, { u: 2, v: 5 }
      ];
      return {
        name: 'Complete Bipartite K(3,3)',
        description: 'Bipartite utility graph. Chromatic number χ(G) = 2.',
        chromaticNumber: 2,
        vertices,
        edges
      };
    } else {
      // Cycle Graph C5
      const vertices: Vertex[] = [
        { id: 0, label: '0', x: 300, y: 50 },
        { id: 1, label: '1', x: 430, y: 140 },
        { id: 2, label: '2', x: 380, y: 280 },
        { id: 3, label: '3', x: 220, y: 280 },
        { id: 4, label: '4', x: 170, y: 140 }
      ];
      const edges: Edge[] = [
        { u: 0, v: 1 }, { u: 1, v: 2 }, { u: 2, v: 3 }, { u: 3, v: 4 }, { u: 4, v: 0 }
      ];
      return {
        name: 'Odd Cycle Graph C₅',
        description: 'Odd cycle of length 5. Non-bipartite, requiring χ(G) = 3 colors.',
        chromaticNumber: 3,
        vertices,
        edges
      };
    }
  }, [preset]);

  // Vertex colors array: vertexColors[i] = color ID
  const [vertexColors, setVertexColors] = useState<number[]>([]);

  // Initialize colors on preset change
  useEffect(() => {
    const init = graphData.vertices.map((_, i) => i % paletteSize);
    setVertexColors(init);
    setSolveSteps(0);
    setIsSolving(false);
  }, [graphData, paletteSize]);

  // Check conflicts
  const conflicts = useMemo(() => {
    const conflictEdges: Edge[] = [];
    graphData.edges.forEach((e) => {
      if (
        vertexColors[e.u] !== undefined &&
        vertexColors[e.v] !== undefined &&
        vertexColors[e.u] === vertexColors[e.v]
      ) {
        conflictEdges.push(e);
      }
    });
    return conflictEdges;
  }, [graphData.edges, vertexColors]);

  const numConflicts = conflicts.length;
  const isProperlyColored = numConflicts === 0;

  // Manual vertex color click
  const handleVertexClick = (vId: number) => {
    setVertexColors((prev) => {
      const next = [...prev];
      next[vId] = selectedColor;
      return next;
    });
  };

  // Min-Conflicts Heuristic Step
  const stepMinConflicts = useCallback(() => {
    if (isProperlyColored) return;

    // Pick a conflicted vertex at random
    const conflictedVertexIds = Array.from(
      new Set(conflicts.flatMap((e) => [e.u, e.v]))
    );
    const chosenV = conflictedVertexIds[Math.floor(Math.random() * conflictedVertexIds.length)];

    // Evaluate conflicts for all available colors in palette
    let minC = Infinity;
    let bestColors: number[] = [];

    for (let c = 0; c < paletteSize; c++) {
      let cCount = 0;
      graphData.edges.forEach((e) => {
        if (e.u === chosenV) {
          if (vertexColors[e.v] === c) cCount++;
        } else if (e.v === chosenV) {
          if (vertexColors[e.u] === c) cCount++;
        }
      });

      if (cCount < minC) {
        minC = cCount;
        bestColors = [c];
      } else if (cCount === minC) {
        bestColors.push(c);
      }
    }

    const chosenColor = bestColors[Math.floor(Math.random() * bestColors.length)];

    setVertexColors((prev) => {
      const next = [...prev];
      next[chosenV] = chosenColor;
      return next;
    });
    setSolveSteps((s) => s + 1);
  }, [conflicts, graphData.edges, isProperlyColored, paletteSize, vertexColors]);

  // Automated min-conflicts runner
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isSolving && !isProperlyColored && solveSteps < 60) {
      timer = setTimeout(() => {
        stepMinConflicts();
      }, 250);
    } else if (isProperlyColored || solveSteps >= 60) {
      setIsSolving(false);
    }
    return () => clearTimeout(timer);
  }, [isSolving, isProperlyColored, solveSteps, stepMinConflicts]);

  const searchSpaceSize = Math.pow(paletteSize, graphData.vertices.length);

  return (
    <div className="visualizer-container">
      {/* Header */}
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Palette size={20} style={{ color: 'var(--lab-accent-cyan)' }} />
            Graph 3-Coloring as a Combinatorial Optimization Problem
          </div>
          <div className="visualizer-subtitle">
            Minimizing Monochromatic Edge Penalty f(s) = Σ 1(c(u) == c(v)) (UCLM Slides 30–35)
          </div>
        </div>

        <div className="visualizer-controls">
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {(['castilla-la-mancha', 'petersen', 'cycle5', 'bipartite'] as const).map((pKey) => (
              <button
                key={pKey}
                onClick={() => setPreset(pKey)}
                className={`btn-tactile btn-sm ${preset === pKey ? 'btn-primary' : ''}`}
                style={{ textTransform: 'capitalize' }}
              >
                {pKey.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="visualizer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Main Controls Deck */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            background: 'var(--lab-bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--lab-border-subtle)'
          }}
        >
          {/* Active Color Brush */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
              Select Active Color Brush:
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {COLOR_PALETTE.slice(0, paletteSize).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c.id)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: c.hex,
                    border: selectedColor === c.id ? '3px solid #ffffff' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: selectedColor === c.id ? `0 0 10px ${c.hex}` : 'none',
                    transition: 'transform 0.15s ease'
                  }}
                  title={`Color: ${c.label}`}
                />
              ))}
            </div>
          </div>

          {/* Available Colors k (Domain Size) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Color Domain Size $k$:</span>
              <strong className="font-mono text-cyan-400">{paletteSize} Colors</strong>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[2, 3, 4].map((kVal) => (
                <button
                  key={kVal}
                  onClick={() => setPaletteSize(kVal)}
                  className={`btn-tactile btn-xs ${paletteSize === kVal ? 'btn-amber' : ''}`}
                  style={{ flex: 1 }}
                >
                  k = {kVal}
                </button>
              ))}
            </div>
            <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
              {paletteSize < graphData.chromaticNumber
                ? `⚠️ $k < \\chi(G)=${graphData.chromaticNumber}$: Impossible to color without conflicts!`
                : `Feasible color domain ($k \\ge \\chi(G)$).`}
            </span>
          </div>

          {/* Min-Conflicts Heuristic Solver */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
              Min-Conflicts Local Repair:
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setIsSolving(!isSolving)}
                disabled={isProperlyColored}
                className={`btn-tactile btn-xs ${isSolving ? 'btn-rose' : 'btn-emerald'}`}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                {isSolving ? <Pause size={12} /> : <Play size={12} />}
                <span>{isSolving ? 'Pause' : 'Auto Repair'}</span>
              </button>
              <button
                onClick={stepMinConflicts}
                disabled={isProperlyColored || isSolving}
                className="btn-tactile btn-xs btn-primary"
                style={{ flex: 1 }}
              >
                Single Step
              </button>
              <button
                onClick={() => {
                  const rnd = graphData.vertices.map(() => Math.floor(Math.random() * paletteSize));
                  setVertexColors(rnd);
                  setSolveSteps(0);
                }}
                className="btn-tactile btn-xs"
                title="Randomize vertex colors"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Canvas & Graph SVG */}
        <div
          style={{
            background: 'var(--lab-bg-obsidian)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--lab-border-active)',
            padding: '1rem',
            position: 'relative'
          }}
        >
          {/* Top Telemetry */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="badge badge-cyan font-mono" style={{ fontSize: '0.85rem' }}>
                {graphData.name}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                Monochromatic Conflicts: <strong className="font-mono text-rose-400" style={{ fontSize: '1.1rem' }}>f(s) = {numConflicts}</strong>
              </span>
              {isProperlyColored ? (
                <span className="badge badge-lime font-mono">
                  <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '3px' }} />
                  VALID COLORING
                </span>
              ) : (
                <span className="badge badge-rose font-mono">
                  <AlertTriangle size={12} style={{ display: 'inline', marginRight: '3px' }} />
                  {numConflicts} CONFLICTS
                </span>
              )}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Configuration Space Size: |S| = {paletteSize}^{graphData.vertices.length} = {searchSpaceSize.toLocaleString()}
            </div>
          </div>

          {/* SVG Canvas */}
          <div style={{ width: '100%', height: '320px', position: 'relative' }}>
            <svg viewBox="0 0 600 320" style={{ width: '100%', height: '100%', userSelect: 'none' }}>
              <defs>
                <filter id="laserConflict" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Edges */}
              {graphData.edges.map((e, idx) => {
                const u = graphData.vertices[e.u];
                const v = graphData.vertices[e.v];
                const isConflicted = vertexColors[e.u] === vertexColors[e.v];

                return (
                  <line
                    key={`edge-${idx}`}
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={isConflicted ? '#fb7185' : 'rgba(255, 255, 255, 0.18)'}
                    strokeWidth={isConflicted ? 3.5 : 1.5}
                    strokeDasharray={isConflicted ? '4 4' : 'none'}
                    filter={isConflicted ? 'url(#laserConflict)' : 'none'}
                  />
                );
              })}

              {/* Vertices */}
              {graphData.vertices.map((v) => {
                const cId = vertexColors[v.id] ?? 0;
                const colorHex = COLOR_PALETTE[cId]?.hex || '#ffffff';
                const hasConflict = conflicts.some((e) => e.u === v.id || e.v === v.id);

                return (
                  <g
                    key={`v-${v.id}`}
                    onClick={() => handleVertexClick(v.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Outer Conflict Pulse */}
                    {hasConflict && (
                      <circle
                        cx={v.x}
                        cy={v.y}
                        r="22"
                        fill="none"
                        stroke="#fb7185"
                        strokeWidth="1.5"
                        opacity="0.8"
                      />
                    )}

                    {/* Node Body */}
                    <circle
                      cx={v.x}
                      cy={v.y}
                      r="16"
                      fill={colorHex}
                      stroke={hasConflict ? '#fb7185' : '#ffffff'}
                      strokeWidth="2.5"
                    />

                    {/* Node Text Label */}
                    <text
                      x={v.x}
                      y={v.y + 4}
                      fill="#000000"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {v.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.6rem 0.9rem',
              background: 'rgba(0,0,0,0.4)',
              borderRadius: '6px',
              border: '1px solid var(--border-medium)',
              fontSize: '0.78rem',
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <MapPin size={15} className="text-cyan-400" />
            <span>
              Click any vertex node to paint it with your active color brush ({COLOR_PALETTE[selectedColor]?.label}). Min-conflicts steps executed: <strong>{solveSteps}</strong>.
            </span>
          </div>
        </div>

        {/* Theoretical Insight Callout */}
        <div className="card" style={{ padding: '1.25rem', background: 'var(--lab-bg-surface)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--lab-accent-amber)', marginBottom: '0.4rem' }}>
            Academic Problem Formulation: State Space as Complete Assignments (Slide 31)
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            In traditional search (Units 2–4), states were paths from an initial uncolored graph. In <strong>Combinatorial Optimization</strong>, a state s is a <em>complete configuration</em> where every vertex has an assigned color. The search space size is strictly |S| = k^|V|. The objective function to minimize is the number of monochromatic edge violations:
          </p>
          <div style={{ marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--lab-accent-cyan)' }}>
            f(s) = Σ 1(c(u) == c(v))  [Optimal when f(s) = 0]
          </div>
        </div>
      </div>
    </div>
  );
};
