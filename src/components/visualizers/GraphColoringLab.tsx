import React, { useState, useEffect } from 'react';
import { Play, RotateCcw } from 'lucide-react';

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

const COLOR_PALETTE = ['#38bdf8', '#ef4444', '#10b981', '#f59e0b', '#a855f7'];

export const GraphColoringLab: React.FC = () => {
  const [graphType, setGraphType] = useState<'petersen' | 'cycle5' | 'k4'>('cycle5');
  const [numColors, setNumColors] = useState<number>(3);
  const [nodeColors, setNodeColors] = useState<number[]>([]);
  const [conflicts, setConflicts] = useState<number>(0);
  const [isSolving, setIsSolving] = useState<boolean>(false);

  // Graph Definitions
  const getGraphData = () => {
    if (graphType === 'cycle5') {
      const vertices: Vertex[] = [
        { id: 0, label: '0', x: 200, y: 50 },
        { id: 1, label: '1', x: 330, y: 140 },
        { id: 2, label: '2', x: 280, y: 290 },
        { id: 3, label: '3', x: 120, y: 290 },
        { id: 4, label: '4', x: 70, y: 140 },
      ];
      const edges: Edge[] = [
        { u: 0, v: 1 },
        { u: 1, v: 2 },
        { u: 2, v: 3 },
        { u: 3, v: 4 },
        { u: 4, v: 0 },
      ];
      return { vertices, edges };
    } else if (graphType === 'petersen') {
      // Outer pentagon + inner pentagram
      const vertices: Vertex[] = [
        // Outer
        { id: 0, label: '0', x: 200, y: 40 },
        { id: 1, label: '1', x: 340, y: 140 },
        { id: 2, label: '2', x: 290, y: 290 },
        { id: 3, label: '3', x: 110, y: 290 },
        { id: 4, label: '4', x: 60, y: 140 },
        // Inner
        { id: 5, label: '5', x: 200, y: 100 },
        { id: 6, label: '6', x: 280, y: 160 },
        { id: 7, label: '7', x: 250, y: 240 },
        { id: 8, label: '8', x: 150, y: 240 },
        { id: 9, label: '9', x: 120, y: 160 },
      ];
      const edges: Edge[] = [
        // Outer ring
        { u: 0, v: 1 }, { u: 1, v: 2 }, { u: 2, v: 3 }, { u: 3, v: 4 }, { u: 4, v: 0 },
        // Inner star
        { u: 5, v: 7 }, { u: 7, v: 9 }, { u: 9, v: 6 }, { u: 6, v: 8 }, { u: 8, v: 5 },
        // Spokes
        { u: 0, v: 5 }, { u: 1, v: 6 }, { u: 2, v: 7 }, { u: 3, v: 8 }, { u: 4, v: 9 },
      ];
      return { vertices, edges };
    } else {
      // K4
      const vertices: Vertex[] = [
        { id: 0, label: '0', x: 120, y: 80 },
        { id: 1, label: '1', x: 280, y: 80 },
        { id: 2, label: '2', x: 280, y: 240 },
        { id: 3, label: '3', x: 120, y: 240 },
      ];
      const edges: Edge[] = [
        { u: 0, v: 1 }, { u: 1, v: 2 }, { u: 2, v: 3 }, { u: 3, v: 0 },
        { u: 0, v: 2 }, { u: 1, v: 3 },
      ];
      return { vertices, edges };
    }
  };

  const { vertices, edges } = getGraphData();

  // Reset colors
  const resetColors = () => {
    const init = vertices.map(() => Math.floor(Math.random() * numColors));
    setNodeColors(init);
  };

  useEffect(() => {
    resetColors();
  }, [graphType, numColors]);

  // Compute monochromatic edge conflicts
  const calculateConflicts = (colors: number[]): number => {
    let conf = 0;
    for (const e of edges) {
      if (colors[e.u] !== undefined && colors[e.u] === colors[e.v]) {
        conf++;
      }
    }
    return conf;
  };

  useEffect(() => {
    setConflicts(calculateConflicts(nodeColors));
  }, [nodeColors, edges]);

  // Handle vertex click to cycle color
  const handleVertexClick = (id: number) => {
    setNodeColors((prev) => {
      const next = [...prev];
      next[id] = (next[id] + 1) % numColors;
      return next;
    });
  };

  // Min-Conflicts Local Search Step
  const runMinConflictsStep = () => {
    // Find all vertices with conflicts
    const conflictedVertices: number[] = [];
    for (const e of edges) {
      if (nodeColors[e.u] === nodeColors[e.v]) {
        if (!conflictedVertices.includes(e.u)) conflictedVertices.push(e.u);
        if (!conflictedVertices.includes(e.v)) conflictedVertices.push(e.v);
      }
    }

    if (conflictedVertices.length === 0) {
      setIsSolving(false);
      return;
    }

    // Pick random conflicted vertex
    const chosenVar = conflictedVertices[Math.floor(Math.random() * conflictedVertices.length)];

    // Evaluate all colors for this vertex
    let minConf = Infinity;
    let bestCols: number[] = [];

    for (let c = 0; c < numColors; c++) {
      const testColors = [...nodeColors];
      testColors[chosenVar] = c;
      const count = calculateConflicts(testColors);
      if (count < minConf) {
        minConf = count;
        bestCols = [c];
      } else if (count === minConf) {
        bestCols.push(c);
      }
    }

    const chosenCol = bestCols[Math.floor(Math.random() * bestCols.length)];
    setNodeColors((prev) => {
      const next = [...prev];
      next[chosenVar] = chosenCol;
      return next;
    });
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isSolving && conflicts > 0) {
      timer = setTimeout(() => {
        runMinConflictsStep();
      }, 150);
    } else if (conflicts === 0) {
      setIsSolving(false);
    }
    return () => clearTimeout(timer);
  }, [isSolving, conflicts, nodeColors]);

  return (
    <div className="card" style={{ padding: '1.75rem', border: '1px solid var(--lab-border-active)' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-indigo font-mono">LABORATORY 6.2</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Slide 30 · Fixed-r Vertex Coloring</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.2rem' }}>
            Graph Coloring: Fixed-r Representation & Penalty Function
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              if (graphType === 'cycle5') setGraphType('petersen');
              else if (graphType === 'petersen') setGraphType('k4');
              else setGraphType('cycle5');
            }}
            className="btn-tactile btn-sm"
          >
            Instance: {graphType === 'cycle5' ? '5-Cycle' : graphType === 'petersen' ? 'Petersen Graph' : 'Complete K4'}
          </button>
          <button onClick={resetColors} className="btn-tactile btn-sm">
            <RotateCcw size={14} />
            <span>Randomize</span>
          </button>
        </div>
      </div>

      {/* Control Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          padding: '1rem',
          background: 'var(--lab-bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--lab-border-subtle)',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Available Colors (r):</span>
            <strong style={{ color: 'var(--lab-accent-cyan)' }}>{numColors} colors</strong>
          </div>
          <input
            type="range"
            min="2"
            max="5"
            step="1"
            value={numColors}
            onChange={(e) => setNumColors(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
            Local Search Engine
          </span>
          <button
            onClick={() => setIsSolving(!isSolving)}
            className={`btn-tactile btn-sm ${isSolving ? 'btn-amber' : 'btn-emerald'}`}
            style={{ width: '100%' }}
          >
            <Play size={13} />
            <span>{isSolving ? 'Pause Search' : 'Solve with Min-Conflicts'}</span>
          </button>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
            Penalty Function f(c)
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: conflicts === 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
              f(c) = {conflicts}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {conflicts === 0 ? '(Valid Coloring! ✓)' : 'conflicting edges'}
            </span>
          </div>
        </div>
      </div>

      {/* SVG Graph View */}
      <div
        style={{
          background: 'var(--lab-bg-obsidian)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--lab-border-active)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <svg width="400" height="340" style={{ overflow: 'visible' }}>
          {/* Edges */}
          {edges.map((e, idx) => {
            const uVert = vertices.find((v) => v.id === e.u)!;
            const vVert = vertices.find((v) => v.id === e.v)!;
            const isConflict = nodeColors[e.u] === nodeColors[e.v];

            return (
              <line
                key={idx}
                x1={uVert.x}
                y1={uVert.y}
                x2={vVert.x}
                y2={vVert.y}
                stroke={isConflict ? '#ef4444' : 'rgba(148, 163, 184, 0.3)'}
                strokeWidth={isConflict ? 3 : 1.5}
                strokeDasharray={isConflict ? '4,4' : undefined}
              />
            );
          })}

          {/* Vertices */}
          {vertices.map((v) => {
            const colIdx = nodeColors[v.id] ?? 0;
            const fillColor = COLOR_PALETTE[colIdx % COLOR_PALETTE.length];

            return (
              <g
                key={v.id}
                onClick={() => handleVertexClick(v.id)}
                style={{ cursor: 'pointer' }}
              >
                <title>{`Vertex ${v.label}: Color ${colIdx}. Click to cycle.`}</title>
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={18}
                  fill={fillColor}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{ transition: 'fill 0.2s ease' }}
                />
                <text
                  x={v.x}
                  y={v.y + 5}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="var(--font-mono)"
                >
                  {colIdx}
                </text>
              </g>
            );
          })}
        </svg>

        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Click any node to cycle its assigned color value c_i from 0 to {numColors - 1}.
        </div>
      </div>
    </div>
  );
};
