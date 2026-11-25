import React, { useState, useMemo, useCallback } from 'react';
import {
  Crosshair,
  RotateCcw
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
  const defaultPoints: Point2D[] = useMemo(
    () => [
      { id: 'A', x: 1.5, y: 2.0, label: 'Red' },
      { id: 'B', x: 2.2, y: 3.2, label: 'Red' },
      { id: 'C', x: 3.0, y: 1.8, label: 'Red' },
      { id: 'D', x: 3.8, y: 3.0, label: 'Red' },
      { id: 'E', x: 2.8, y: 4.5, label: 'Red' },
      { id: 'F', x: 6.0, y: 5.5, label: 'Blue' },
      { id: 'G', x: 7.2, y: 4.8, label: 'Blue' },
      { id: 'H', x: 8.0, y: 6.2, label: 'Blue' },
      { id: 'I', x: 6.8, y: 7.0, label: 'Blue' },
      { id: 'J', x: 5.5, y: 3.8, label: 'Blue' }
    ],
    []
  );

  const [points, setPoints] = useState<Point2D[]>(defaultPoints);
  const [queryPoint, setQueryPoint] = useState<{ x: number; y: number }>({ x: 4.5, y: 4.0 });
  const [k, setK] = useState<number>(3);
  const [metric, setMetric] = useState<DistanceMetric>('euclidean');
  const [weightedVoting, setWeightedVoting] = useState<boolean>(false);
  const [normalizeScale] = useState<boolean>(false);

  // Compute distance according to selected metric
  const calcDist = useCallback(
    (x1: number, y1: number, x2: number, y2: number): number => {
      // If scale distortion is simulated: x range 0-10 vs y range 0-800
      const sy1 = normalizeScale ? y1 : y1;
      const sy2 = normalizeScale ? y2 : y2;

      if (metric === 'manhattan') {
        return Math.abs(x1 - x2) + Math.abs(sy1 - sy2);
      }
      if (metric === 'chebyshev') {
        return Math.max(Math.abs(x1 - x2), Math.abs(sy1 - sy2));
      }
      return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(sy1 - sy2, 2));
    },
    [metric, normalizeScale]
  );

  // Predict class and identify k nearest neighbors
  const { queryResult, neighbors, boundaryRadius } = useMemo(() => {
    if (points.length === 0) {
      return {
        queryResult: { label: 'Tie' as const, redScore: 0, blueScore: 0 },
        neighbors: [],
        boundaryRadius: 0
      };
    }

    const withDist = points.map((pt) => ({
      ...pt,
      dist: Math.max(0.001, calcDist(queryPoint.x, queryPoint.y, pt.x, pt.y))
    }));
    withDist.sort((a, b) => a.dist - b.dist);

    const kNeighbors = withDist.slice(0, Math.min(k, withDist.length));
    const maxRadius = kNeighbors[kNeighbors.length - 1].dist;

    let redScore = 0;
    let blueScore = 0;

    kNeighbors.forEach((n) => {
      const weight = weightedVoting ? 1.0 / Math.pow(n.dist, 2) : 1.0;
      if (n.label === 'Red') redScore += weight;
      else blueScore += weight;
    });

    let label: 'Red' | 'Blue' | 'Tie' = 'Tie';
    if (redScore > blueScore) label = 'Red';
    else if (blueScore > redScore) label = 'Blue';

    return {
      queryResult: {
        label,
        redScore: parseFloat(redScore.toFixed(2)),
        blueScore: parseFloat(blueScore.toFixed(2))
      },
      neighbors: kNeighbors,
      boundaryRadius: maxRadius
    };
  }, [points, queryPoint, k, calcDist, weightedVoting]);

  // Click canvas to move query crosshair or add point
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const domainX = Math.max(0.2, Math.min(9.8, (clickX / rect.width) * 10.0));
    const domainY = Math.max(0.2, Math.min(7.8, (1 - clickY / rect.height) * 8.0));

    setQueryPoint({
      x: parseFloat(domainX.toFixed(2)),
      y: parseFloat(domainY.toFixed(2))
    });
  };

  const toPx = (x: number) => (x / 10.0) * 600;
  const toPy = (y: number) => 300 - (y / 8.0) * 300;

  return (
    <div className="visualizer-container">
      {/* Header */}
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Crosshair size={20} style={{ color: 'var(--lab-accent-cyan)' }} />
            k-Nearest Neighbors (k-NN) Classification Radar & Metric Contours
          </div>
          <div className="visualizer-subtitle">
            Euclidean ($L_2$), Manhattan ($L_1$), Chebyshev ($L_\infty$) & Distance-Weighted Voting (UCLM Slides 8–24)
          </div>
        </div>

        <div className="visualizer-controls">
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => {
                setPoints(defaultPoints);
                setQueryPoint({ x: 4.5, y: 4.0 });
                setK(3);
                setMetric('euclidean');
                setWeightedVoting(false);
              }}
              className="btn-tactile btn-sm"
            >
              <RotateCcw size={14} />
              <span>Reset Exam Points</span>
            </button>
          </div>
        </div>
      </div>

      <div className="visualizer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Controls Deck */}
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
          {/* Hyperparameter k Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Number of Neighbors $k$:</span>
              <strong className="font-mono text-cyan-400">k = {k}</strong>
            </div>
            <input
              type="range"
              min="1"
              max="9"
              step="2" // Odd numbers prevent binary ties
              value={k}
              onChange={(e) => setK(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--lab-accent-cyan)' }}
            />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
              Odd values (1, 3, 5, 7) prevent tie votes in binary classification.
            </span>
          </div>

          {/* Metric Selector */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
              Distance Metric (UCLM Slide 14):
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(
                [
                  { id: 'euclidean', label: 'Euclidean L₂' },
                  { id: 'manhattan', label: 'Manhattan L₁' },
                  { id: 'chebyshev', label: 'Chebyshev L∞' }
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMetric(m.id)}
                  className={`btn-tactile btn-xs ${metric === m.id ? 'btn-primary' : ''}`}
                  style={{ flex: 1 }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voting Weighting Rule */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
              Voting Scheme (Slide 22):
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setWeightedVoting(false)}
                className={`btn-tactile btn-xs ${!weightedVoting ? 'btn-amber' : ''}`}
                style={{ flex: 1 }}
              >
                Majority Vote
              </button>
              <button
                onClick={() => setWeightedVoting(true)}
                className={`btn-tactile btn-xs ${weightedVoting ? 'btn-lime' : ''}`}
                style={{ flex: 1 }}
              >
                Distance-Weighted ($1/d^2$)
              </button>
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
              {weightedVoting
                ? 'Closer neighbors have quadratically stronger votes.'
                : 'Each neighbor casts 1 equal vote.'}
            </span>
          </div>

          {/* Query Coordinates Inputs */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
              Query Probe $(q_x, q_y)$:
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={queryPoint.x}
                onChange={(e) => setQueryPoint((p) => ({ ...p, x: parseFloat(e.target.value) || 0 }))}
                className="font-mono text-xs"
                style={{ width: '50%', padding: '0.3rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-medium)', borderRadius: '4px', color: '#fff' }}
              />
              <input
                type="number"
                min="0"
                max="8"
                step="0.1"
                value={queryPoint.y}
                onChange={(e) => setQueryPoint((p) => ({ ...p, y: parseFloat(e.target.value) || 0 }))}
                className="font-mono text-xs"
                style={{ width: '50%', padding: '0.3rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-medium)', borderRadius: '4px', color: '#fff' }}
              />
            </div>
          </div>
        </div>

        {/* Prediction Telemetry Card */}
        <div
          style={{
            padding: '1rem',
            background:
              queryResult.label === 'Red'
                ? 'rgba(251, 113, 133, 0.08)'
                : queryResult.label === 'Blue'
                ? 'rgba(56, 189, 248, 0.08)'
                : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${
              queryResult.label === 'Red'
                ? '#fb7185'
                : queryResult.label === 'Blue'
                ? 'var(--lab-accent-cyan)'
                : 'var(--border-subtle)'
            }`,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Classified Label:</span>
            <span
              className="font-mono"
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: queryResult.label === 'Red' ? '#fb7185' : 'var(--lab-accent-cyan)'
              }}
            >
              CLASS {queryResult.label.toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>
            <span>
              Red Votes: <strong style={{ color: '#fb7185' }}>{queryResult.redScore}</strong>
            </span>
            <span>
              Blue Votes: <strong style={{ color: 'var(--lab-accent-cyan)' }}>{queryResult.blueScore}</strong>
            </span>
            <span>
              Neighborhood Radius: <strong>{boundaryRadius.toFixed(2)}</strong>
            </span>
          </div>
        </div>

        {/* SVG Scatter & Neighborhood Radar */}
        <div
          style={{
            background: 'var(--lab-bg-obsidian)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--lab-border-active)',
            padding: '1rem',
            position: 'relative'
          }}
        >
          <div style={{ width: '100%', height: '300px' }}>
            <svg
              viewBox="0 0 600 300"
              style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
              onClick={handleCanvasClick}
            >
              {/* Grid Lines */}
              {Array.from({ length: 11 }).map((_, i) => (
                <line
                  key={`gx-${i}`}
                  x1={(i / 10) * 600}
                  y1="0"
                  x2={(i / 10) * 600}
                  y2="300"
                  stroke="rgba(255,255,255,0.04)"
                />
              ))}
              {Array.from({ length: 9 }).map((_, i) => (
                <line
                  key={`gy-${i}`}
                  x1="0"
                  y1={(i / 8) * 300}
                  x2="600"
                  y2={(i / 8) * 300}
                  stroke="rgba(255,255,255,0.04)"
                />
              ))}

              {/* Metric Boundary Contour Shape centered at queryPoint */}
              {(() => {
                const qx = toPx(queryPoint.x);
                const qy = toPy(queryPoint.y);
                const rx = (boundaryRadius / 10.0) * 600;
                const ry = (boundaryRadius / 8.0) * 300;

                if (metric === 'euclidean') {
                  // Circle / Ellipse in pixel coordinates
                  return (
                    <ellipse
                      cx={qx}
                      cy={qy}
                      rx={rx}
                      ry={ry}
                      fill="rgba(56, 189, 248, 0.08)"
                      stroke="var(--lab-accent-cyan)"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                  );
                } else if (metric === 'manhattan') {
                  // Diamond (Rhombus)
                  const dPath = `M ${qx} ${qy - ry} L ${qx + rx} ${qy} L ${qx} ${qy + ry} L ${qx - rx} ${qy} Z`;
                  return (
                    <path
                      d={dPath}
                      fill="rgba(251, 191, 36, 0.08)"
                      stroke="var(--lab-accent-amber)"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                  );
                } else {
                  // Chebyshev: Square / Box
                  return (
                    <rect
                      x={qx - rx}
                      y={qy - ry}
                      width={rx * 2}
                      height={ry * 2}
                      fill="rgba(198, 242, 119, 0.08)"
                      stroke="var(--lab-accent-lime)"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                  );
                }
              })()}

              {/* Tethers connecting query point to its k nearest neighbors */}
              {neighbors.map((n) => (
                <line
                  key={`tether-${n.id}`}
                  x1={toPx(queryPoint.x)}
                  y1={toPy(queryPoint.y)}
                  x2={toPx(n.x)}
                  y2={toPy(n.y)}
                  stroke={n.label === 'Red' ? '#fb7185' : 'var(--lab-accent-cyan)'}
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  opacity="0.8"
                />
              ))}

              {/* Training Points */}
              {points.map((pt) => {
                const px = toPx(pt.x);
                const py = toPy(pt.y);
                const isNeighbor = neighbors.some((n) => n.id === pt.id);

                return (
                  <g key={pt.id}>
                    {isNeighbor && (
                      <circle
                        cx={px}
                        cy={py}
                        r="11"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    )}
                    <circle
                      cx={px}
                      cy={py}
                      r="6.5"
                      fill={pt.label === 'Red' ? '#fb7185' : 'var(--lab-accent-cyan)'}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x={px}
                      y={py - 10}
                      fill="var(--text-muted)"
                      fontSize="9"
                      textAnchor="middle"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {pt.id}
                    </text>
                  </g>
                );
              })}

              {/* Query Probe Crosshair */}
              <g transform={`translate(${toPx(queryPoint.x)}, ${toPy(queryPoint.y)})`}>
                <circle r="9" fill="none" stroke="#ffffff" strokeWidth="2" />
                <circle r="3.5" fill="#ffffff" />
                <line x1="-14" y1="0" x2="14" y2="0" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="0" y1="-14" x2="0" y2="14" stroke="#ffffff" strokeWidth="1.5" />
                <text x="12" y="-12" fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  Query q
                </text>
              </g>
            </svg>
          </div>

          <div style={{ marginTop: '0.5rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Click anywhere on the radar canvas to relocate the query probe crosshair!
          </div>
        </div>

        {/* Neighbors Ranking Table */}
        <div className="card" style={{ padding: '1rem', background: 'var(--lab-bg-surface)' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--lab-accent-cyan)', marginBottom: '0.5rem' }}>
            Ranked Nearest Neighbors List for Query $q({queryPoint.x}, {queryPoint.y})$
          </div>
          <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ textAlign: 'left', padding: '0.35rem' }}>Rank</th>
                <th style={{ textAlign: 'left', padding: '0.35rem' }}>Point</th>
                <th style={{ textAlign: 'left', padding: '0.35rem' }}>Class</th>
                <th style={{ textAlign: 'right', padding: '0.35rem' }}>Distance $d(q, x_i)$</th>
                <th style={{ textAlign: 'right', padding: '0.35rem' }}>Voting Weight</th>
              </tr>
            </thead>
            <tbody>
              {neighbors.map((n, idx) => (
                <tr key={n.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '0.35rem', fontFamily: 'monospace' }}>#{idx + 1}</td>
                  <td style={{ padding: '0.35rem', fontFamily: 'monospace' }}>Point {n.id} ({n.x}, {n.y})</td>
                  <td style={{ padding: '0.35rem' }}>
                    <span
                      className={`badge ${n.label === 'Red' ? 'badge-rose' : 'badge-cyan'} font-mono`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {n.label}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.35rem', fontFamily: 'monospace' }}>
                    {n.dist.toFixed(3)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.35rem', fontFamily: 'monospace' }}>
                    {weightedVoting ? (1.0 / Math.pow(n.dist, 2)).toFixed(2) : '1.0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
