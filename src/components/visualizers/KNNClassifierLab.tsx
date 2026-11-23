import React, { useState, useMemo } from 'react';
import {
  Crosshair,
  HelpCircle,
} from 'lucide-react';

interface Point2D {
  id: string;
  x: number; // 0 to 10
  y: number; // 0 to 8
  label: 'Red' | 'Blue';
}

type DistanceMetric = 'euclidean' | 'manhattan' | 'chebyshev';

export const KNNClassifierLab: React.FC = () => {
  // Slide 12 UCLM Exam Points by default
  const defaultPoints: Point2D[] = [
    { id: 'A', x: 1.5, y: 2.0, label: 'Red' },
    { id: 'B', x: 2.2, y: 3.2, label: 'Red' },
    { id: 'C', x: 3.0, y: 1.8, label: 'Red' },
    { id: 'D', x: 3.8, y: 3.0, label: 'Red' },
    { id: 'E', x: 2.8, y: 4.5, label: 'Red' },
    { id: 'F', x: 6.0, y: 5.5, label: 'Blue' },
    { id: 'G', x: 7.2, y: 4.8, label: 'Blue' },
    { id: 'H', x: 8.0, y: 6.2, label: 'Blue' },
    { id: 'I', x: 6.8, y: 7.0, label: 'Blue' },
    { id: 'J', x: 5.5, y: 3.8, label: 'Blue' },
  ];

  const [points, setPoints] = useState<Point2D[]>(defaultPoints);
  const [queryPoint, setQueryPoint] = useState<{ x: number; y: number }>({ x: 4.5, y: 4.0 });
  const [k, setK] = useState<number>(3);
  const [metric, setMetric] = useState<DistanceMetric>('euclidean');
  const [weightedVoting, setWeightedVoting] = useState<boolean>(false);
  const [newPointClass, setNewPointClass] = useState<'Red' | 'Blue'>('Red');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);

  // Compute distance function
  const calcDist = (x1: number, y1: number, x2: number, y2: number): number => {
    if (metric === 'manhattan') {
      return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
    if (metric === 'chebyshev') {
      return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
    }
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  };

  // Predict class for any arbitrary coordinate (x, y)
  const classifyPoint = (
    qx: number,
    qy: number,
    ptList: Point2D[],
    kVal: number,
    isWeighted: boolean
  ): { label: 'Red' | 'Blue' | 'Tie'; redScore: number; blueScore: number; radius: number } => {
    if (ptList.length === 0) return { label: 'Tie', redScore: 0, blueScore: 0, radius: 0 };

    const withDist = ptList.map((pt) => ({
      ...pt,
      dist: Math.max(0.001, calcDist(qx, qy, pt.x, pt.y)),
    }));
    withDist.sort((a, b) => a.dist - b.dist);

    const neighbors = withDist.slice(0, Math.min(kVal, withDist.length));
    const radius = neighbors[neighbors.length - 1].dist;

    let redScore = 0;
    let blueScore = 0;

    neighbors.forEach((n) => {
      const weight = isWeighted ? 1.0 / (n.dist * n.dist) : 1.0;
      if (n.label === 'Red') redScore += weight;
      else blueScore += weight;
    });

    let label: 'Red' | 'Blue' | 'Tie' = 'Tie';
    if (redScore > blueScore) label = 'Red';
    else if (blueScore > redScore) label = 'Blue';

    return { label, redScore, blueScore, radius };
  };

  // Query prediction
  const queryResult = useMemo(() => {
    return classifyPoint(queryPoint.x, queryPoint.y, points, k, weightedVoting);
  }, [queryPoint, points, k, metric, weightedVoting]);

  // Neighbors for the query point
  const queryNeighbors = useMemo(() => {
    const withDist = points.map((pt) => ({
      ...pt,
      dist: calcDist(queryPoint.x, queryPoint.y, pt.x, pt.y),
    }));
    withDist.sort((a, b) => a.dist - b.dist);
    return withDist.slice(0, Math.min(k, withDist.length));
  }, [queryPoint, points, k, metric]);

  // Generate 2D Decision Boundary Background Mesh
  const heatmapMesh = useMemo(() => {
    if (!showHeatmap || points.length === 0) return [];
    const cols = 28;
    const rows = 20;
    const cells: { x: number; y: number; label: string }[] = [];

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = (c / (cols - 1)) * 10;
        const y = (r / (rows - 1)) * 8;
        const res = classifyPoint(x, y, points, k, weightedVoting);
        cells.push({ x, y, label: res.label });
      }
    }
    return cells;
  }, [points, k, metric, weightedVoting, showHeatmap]);

  // SVG dimensions
  const svgW = 540;
  const svgH = 260;
  const margin = { top: 20, right: 30, bottom: 35, left: 40 };
  const plotW = svgW - margin.left - margin.right;
  const plotH = svgH - margin.top - margin.bottom;

  const toPx = (x: number) => margin.left + (x / 10) * plotW;
  const toPy = (y: number) => margin.top + plotH - (y / 8) * plotH;

  const toCoordX = (px: number) => Math.max(0, Math.min(10, ((px - margin.left) / plotW) * 10));
  const toCoordY = (py: number) => Math.max(0, Math.min(8, ((margin.top + plotH - py) / plotH) * 8));

  // Canvas click to move query point or add sample
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (
      clickX >= margin.left &&
      clickX <= margin.left + plotW &&
      clickY >= margin.top &&
      clickY <= margin.top + plotH
    ) {
      const cx = parseFloat(toCoordX(clickX).toFixed(2));
      const cy = parseFloat(toCoordY(clickY).toFixed(2));

      if (e.shiftKey) {
        // Add new sample point
        setPoints((prev) => [
          ...prev,
          {
            id: `p-${Date.now()}`,
            x: cx,
            y: cy,
            label: newPointClass,
          },
        ]);
      } else {
        // Move query point
        setQueryPoint({ x: cx, y: cy });
      }
    }
  };

  // Preset loaders
  const loadPreset = (presetName: string) => {
    if (presetName === 'exam') {
      setPoints(defaultPoints);
      setQueryPoint({ x: 4.5, y: 4.0 });
      setK(3);
    } else if (presetName === 'concentric') {
      // Concentric circles (where linear models fail, but k-NN succeeds!)
      const pts: Point2D[] = [];
      // Inner circle Red
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * 2 * Math.PI;
        pts.push({ id: `c1-${i}`, x: 5 + Math.cos(a) * 1.5, y: 4 + Math.sin(a) * 1.2, label: 'Red' });
      }
      // Outer ring Blue
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * 2 * Math.PI;
        pts.push({ id: `c2-${i}`, x: 5 + Math.cos(a) * 3.4, y: 4 + Math.sin(a) * 2.8, label: 'Blue' });
      }
      setPoints(pts);
      setQueryPoint({ x: 5, y: 4 });
      setK(3);
    } else if (presetName === 'outlier') {
      // Linearly separable with an intruder outlier
      const pts: Point2D[] = [
        ...defaultPoints,
        { id: 'intruder', x: 2.5, y: 2.5, label: 'Blue' }, // Blue deep in Red territory!
      ];
      setPoints(pts);
      setQueryPoint({ x: 2.8, y: 2.7 });
      setK(1);
    }
  };

  return (
    <div className="visualizer-container">
      {/* Header */}
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Crosshair size={20} style={{ color: 'var(--lab-accent-cyan)' }} />
            k-Nearest Neighbors (k-NN) Visual Classifier Laboratory (Lesson 10, Slides 1–28)
          </div>
          <div className="visualizer-subtitle">
            2D Decision Boundary Heatmap, Minkowski Distance Metrics & Distance-Weighted Voting Dynamics
          </div>
        </div>

        <div className="visualizer-controls">
          <button onClick={() => loadPreset('exam')} className="btn-tactile btn-sm">
            <span>UCLM Exam Preset</span>
          </button>
          <button onClick={() => loadPreset('concentric')} className="btn-tactile btn-sm btn-primary">
            <span>Concentric Circles</span>
          </button>
          <button onClick={() => loadPreset('outlier')} className="btn-tactile btn-sm btn-amber">
            <span>Noisy Outlier Test</span>
          </button>
        </div>
      </div>

      <div className="visualizer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Hyperparameter Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            background: 'var(--lab-bg-surface)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* k parameter */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Neighborhood Size (k):</span>
              <strong className="font-mono text-cyan-400" style={{ fontSize: '0.9rem' }}>
                k = {k} {k % 2 === 0 ? '(Even: Tie possible)' : '(Odd: Tie breaker)'}
              </strong>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={k}
              onChange={(e) => setK(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--lab-accent-cyan)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              <span>k=1 (Sharp/Overfitting)</span>
              <span>k=7 (Smooth)</span>
              <span>k=15 (Global majority)</span>
            </div>
          </div>

          {/* Metric selector */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Distance Metric:
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(
                [
                  { id: 'euclidean', label: 'Euclidean (L2)' },
                  { id: 'manhattan', label: 'Manhattan (L1)' },
                  { id: 'chebyshev', label: 'Chebyshev (L∞)' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMetric(m.id)}
                  className={`btn-tactile btn-xs ${metric === m.id ? 'btn-primary' : ''}`}
                  style={{ flex: 1, padding: '0.35rem 0.2rem' }}
                >
                  {m.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Options: Weighted voting & Heatmap */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Advanced Modes:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={weightedVoting}
                  onChange={(e) => setWeightedVoting(e.target.checked)}
                />
                <span>Distance-Weighted Vote (w = 1/d²)</span>
              </label>
              <label style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                />
                <span>Show Decision Boundary Heatmap</span>
              </label>
            </div>
          </div>

          {/* New Point Color Mode */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Shift+Click Adds Point:
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setNewPointClass('Red')}
                className={`btn-tactile btn-xs ${newPointClass === 'Red' ? 'btn-amber' : ''}`}
                style={{ flex: 1 }}
              >
                🔴 Class Red
              </button>
              <button
                onClick={() => setNewPointClass('Blue')}
                className={`btn-tactile btn-xs ${newPointClass === 'Blue' ? 'btn-primary' : ''}`}
                style={{ flex: 1 }}
              >
                🔵 Class Blue
              </button>
            </div>
          </div>
        </div>

        {/* 2D Decision Boundary Canvas */}
        <div
          style={{
            background: 'var(--lab-bg-obsidian)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--lab-border-active)',
            padding: '1rem',
            position: 'relative',
          }}
        >
          {/* Top Status Readout */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Query Point Q({queryPoint.x}, {queryPoint.y}):</span>
              <span
                className="badge font-mono"
                style={{
                  background:
                    queryResult.label === 'Red'
                      ? 'rgba(239, 68, 68, 0.25)'
                      : queryResult.label === 'Blue'
                      ? 'rgba(56, 189, 248, 0.25)'
                      : 'rgba(255, 255, 255, 0.1)',
                  color:
                    queryResult.label === 'Red'
                      ? '#f87171'
                      : queryResult.label === 'Blue'
                      ? '#38bdf8'
                      : '#cbd5e1',
                  border: `1px solid ${queryResult.label === 'Red' ? '#ef4444' : queryResult.label === 'Blue' ? '#38bdf8' : '#94a3b8'}`,
                }}
              >
                PREDICTED: {queryResult.label.toUpperCase()}
              </span>
            </div>

            {/* Voting tally */}
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Red Votes: </span>
                <strong className="font-mono text-rose-400">
                  {weightedVoting ? queryResult.redScore.toFixed(2) : queryResult.redScore}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Blue Votes: </span>
                <strong className="font-mono text-cyan-400">
                  {weightedVoting ? queryResult.blueScore.toFixed(2) : queryResult.blueScore}
                </strong>
              </div>
            </div>
          </div>

          {/* SVG Canvas */}
          <div style={{ width: '100%', height: '260px' }}>
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              onClick={handleCanvasClick}
              style={{ width: '100%', height: '100%', cursor: 'crosshair', userSelect: 'none' }}
            >
              {/* Heatmap Mesh */}
              {showHeatmap &&
                heatmapMesh.map((cell, idx) => {
                  const px = toPx(cell.x);
                  const py = toPy(cell.y);
                  const fillColor =
                    cell.label === 'Red'
                      ? 'rgba(239, 68, 68, 0.12)'
                      : cell.label === 'Blue'
                      ? 'rgba(56, 189, 248, 0.12)'
                      : 'transparent';

                  return (
                    <circle
                      key={`hm-${idx}`}
                      cx={px}
                      cy={py}
                      r="9"
                      fill={fillColor}
                      stroke="none"
                    />
                  );
                })}

              {/* Grid Lines */}
              {[0, 2, 4, 6, 8, 10].map((xVal) => {
                const px = toPx(xVal);
                return (
                  <g key={`x-${xVal}`}>
                    <line x1={px} y1={margin.top} x2={px} y2={margin.top + plotH} stroke="rgba(255, 255, 255, 0.05)" />
                    <text x={px} y={margin.top + plotH + 15} fill="var(--text-muted)" fontSize="9" textAnchor="middle" fontFamily="monospace">
                      {xVal}
                    </text>
                  </g>
                );
              })}

              {[0, 2, 4, 6, 8].map((yVal) => {
                const py = toPy(yVal);
                return (
                  <g key={`y-${yVal}`}>
                    <line x1={margin.left} y1={py} x2={margin.left + plotW} y2={py} stroke="rgba(255, 255, 255, 0.05)" />
                    <text x={margin.left - 8} y={py + 3} fill="var(--text-muted)" fontSize="9" textAnchor="end" fontFamily="monospace">
                      {yVal}
                    </text>
                  </g>
                );
              })}

              {/* Distance radius circle around Query Point */}
              {queryResult.radius > 0 && metric === 'euclidean' && (
                <circle
                  cx={toPx(queryPoint.x)}
                  cy={toPy(queryPoint.y)}
                  r={(queryResult.radius / 10) * plotW}
                  fill="none"
                  stroke="var(--lab-accent-cyan)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
              )}

              {/* Training Points */}
              {points.map((pt) => {
                const cx = toPx(pt.x);
                const cy = toPy(pt.y);
                const isNeighbor = queryNeighbors.some((n) => n.id === pt.id);

                return (
                  <g key={pt.id}>
                    {isNeighbor && (
                      <circle cx={cx} cy={cy} r="11" fill="none" stroke="var(--lab-accent-lime)" strokeWidth="2" />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="6.5"
                      fill={pt.label === 'Red' ? '#ef4444' : '#38bdf8'}
                      stroke="#000"
                      strokeWidth="1.5"
                    />
                    <text
                      x={cx}
                      y={cy + 3}
                      fill="#fff"
                      fontSize="8"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                      pointerEvents="none"
                    >
                      {pt.id}
                    </text>
                  </g>
                );
              })}

              {/* Query Point Q */}
              <g transform={`translate(${toPx(queryPoint.x)}, ${toPy(queryPoint.y)})`}>
                <polygon
                  points="0,-10 9,6 -9,6"
                  fill="var(--lab-accent-lime)"
                  stroke="#000"
                  strokeWidth="1.5"
                />
                <text x="0" y="2" fill="#000" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  Q
                </text>
              </g>
            </svg>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem', textAlign: 'center' }}>
            Click anywhere to move Query Point Q (lime triangle). Hold <strong>Shift + Click</strong> to add a new training point.
          </div>
        </div>

        {/* Neighbors Table & Educational Insight */}
        <div className="grid-2">
          {/* Nearest Neighbors Roster */}
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              k = {k} Nearest Neighbors to Q
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {queryNeighbors.map((n, rank) => (
                <div
                  key={n.id}
                  style={{
                    padding: '0.35rem 0.6rem',
                    borderRadius: '4px',
                    background: 'var(--lab-bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>#{rank + 1}</span>
                    <strong style={{ color: n.label === 'Red' ? '#f87171' : '#38bdf8' }}>Point {n.id}</strong>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>({n.x}, {n.y})</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Dist: </span>
                    <strong className="font-mono text-cyan-400">{n.dist.toFixed(2)}</strong>
                    {weightedVoting && (
                      <span style={{ marginLeft: '0.5rem', color: 'var(--lab-accent-lime)' }}>
                        w={((1.0 / Math.pow(Math.max(0.01, n.dist), 2))).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Educational Insight Card */}
          <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--lab-accent-cyan)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <HelpCircle size={15} />
              <span>k-NN Decision Boundary Dynamics</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Notice how <strong>k = 1</strong> creates small isolated boundary islands (overfitting to individual noisy samples).
              As you increase <strong>k to 5 or 9</strong>, the separating boundary smooths out into a continuous partition, filtering out local anomalies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
