import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  RotateCcw,
  Plus,
  HelpCircle,
} from 'lucide-react';

interface DataPoint {
  id: string;
  x: number; // 0 to 10
  y: number; // 0 to 25
  type: 'train' | 'test';
}

// Gaussian elimination linear system solver for A * w = b
const solveLinearSystem = (A: number[][], b: number[]): number[] => {
  const n = b.length;
  // Augment matrix
  const M: number[][] = A.map((row, i) => [...row, b[i]]);

  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
        maxRow = k;
      }
    }
    // Swap
    const tmp = M[i];
    M[i] = M[maxRow];
    M[maxRow] = tmp;

    // Check near zero
    if (Math.abs(M[i][i]) < 1e-12) continue;

    // Eliminate below
    for (let k = i + 1; k < n; k++) {
      const c = M[k][i] / M[i][i];
      for (let j = i; j <= n; j++) {
        M[k][j] -= c * M[i][j];
      }
    }
  }

  // Back-substitution
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = M[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= M[i][j] * x[j];
    }
    x[i] = Math.abs(M[i][i]) > 1e-12 ? sum / M[i][i] : 0;
  }
  return x;
};

export const OverfittingUnderfittingLab: React.FC = () => {
  const [degree, setDegree] = useState<number>(3);
  const [lambda, setLambda] = useState<number>(0.0); // L2 Ridge Regularization
  const [pointMode, setPointMode] = useState<'train' | 'test'>('train');

  // Default dataset: parabolic ground truth with realistic noise
  const initialPoints: DataPoint[] = [
    { id: 'tr1', x: 1.0, y: 3.5, type: 'train' },
    { id: 'tr2', x: 1.8, y: 2.1, type: 'train' },
    { id: 'tr3', x: 2.6, y: 1.4, type: 'train' },
    { id: 'tr4', x: 3.4, y: 1.9, type: 'train' },
    { id: 'tr5', x: 4.2, y: 3.8, type: 'train' },
    { id: 'tr6', x: 5.0, y: 6.2, type: 'train' },
    { id: 'tr7', x: 5.8, y: 9.4, type: 'train' },
    { id: 'tr8', x: 6.6, y: 13.5, type: 'train' },
    { id: 'tr9', x: 7.4, y: 18.2, type: 'train' },
    { id: 'tr10', x: 8.2, y: 23.6, type: 'train' },

    // Validation/Test points
    { id: 'te1', x: 1.4, y: 2.8, type: 'test' },
    { id: 'te2', x: 2.2, y: 1.6, type: 'test' },
    { id: 'te3', x: 3.8, y: 2.7, type: 'test' },
    { id: 'te4', x: 5.4, y: 7.8, type: 'test' },
    { id: 'te5', x: 7.0, y: 15.6, type: 'test' },
  ];

  const [points, setPoints] = useState<DataPoint[]>(initialPoints);

  // Train and Test subsets
  const trainPts = useMemo(() => points.filter((p) => p.type === 'train'), [points]);
  const testPts = useMemo(() => points.filter((p) => p.type === 'test'), [points]);

  // Compute True Least Squares Weights using Vandermonde matrix:
  // w = (X^T X + lambda * I)^(-1) X^T y
  const weights = useMemo(() => {
    if (trainPts.length === 0) return [];
    const d = degree;
    const numParams = d + 1;

    // Normal equations matrix: XTX = (numParams x numParams)
    const XTX: number[][] = Array.from({ length: numParams }, () => new Array(numParams).fill(0));
    const XTy: number[] = new Array(numParams).fill(0);

    for (const pt of trainPts) {
      // Powers array for point x
      const xPowers = [1];
      for (let p = 1; p <= d * 2; p++) {
        xPowers.push(xPowers[p - 1] * pt.x);
      }

      for (let i = 0; i < numParams; i++) {
        for (let j = 0; j < numParams; j++) {
          XTX[i][j] += xPowers[i + j];
        }
        XTy[i] += xPowers[i] * pt.y;
      }
    }

    // Add L2 Ridge penalty lambda to diagonal (excluding bias w0)
    for (let i = 1; i < numParams; i++) {
      XTX[i][i] += lambda;
    }

    return solveLinearSystem(XTX, XTy);
  }, [trainPts, degree, lambda]);

  // Evaluate polynomial at any point x
  const predictY = (xVal: number) => {
    if (weights.length === 0) return 0;
    let y = 0;
    let xPow = 1;
    for (let i = 0; i < weights.length; i++) {
      y += weights[i] * xPow;
      xPow *= xVal;
    }
    return y;
  };

  // Compute Mean Squared Errors
  const trainMse = useMemo(() => {
    if (trainPts.length === 0) return 0;
    const sumSq = trainPts.reduce((acc, pt) => acc + Math.pow(pt.y - predictY(pt.x), 2), 0);
    return parseFloat((sumSq / trainPts.length).toFixed(3));
  }, [trainPts, weights]);

  const testMse = useMemo(() => {
    if (testPts.length === 0) return 0;
    const sumSq = testPts.reduce((acc, pt) => acc + Math.pow(pt.y - predictY(pt.x), 2), 0);
    return parseFloat((sumSq / testPts.length).toFixed(3));
  }, [testPts, weights]);

  // Canvas bounds: X in [0.5, 9.0], Y in [0, 26]
  const svgWidth = 520;
  const svgHeight = 220;
  const margin = { top: 20, right: 25, bottom: 35, left: 40 };
  const plotW = svgWidth - margin.left - margin.right;
  const plotH = svgHeight - margin.top - margin.bottom;

  const toPx = (x: number) => margin.left + ((x - 0.5) / 8.5) * plotW;
  const toPy = (y: number) => margin.top + plotH - (Math.min(26, Math.max(0, y)) / 26) * plotH;

  const toCoordX = (px: number) => Math.max(0.5, Math.min(9.0, 0.5 + ((px - margin.left) / plotW) * 8.5));
  const toCoordY = (py: number) => Math.max(0, Math.min(26, ((margin.top + plotH - py) / plotH) * 26));

  // Generate polynomial curve path
  const curvePath = useMemo(() => {
    const pts: string[] = [];
    for (let px = margin.left; px <= margin.left + plotW; px += 4) {
      const x = toCoordX(px);
      const y = predictY(x);
      const py = toPy(y);
      pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return `M ${pts.join(' L ')}`;
  }, [weights]);

  // Click on canvas to add a point
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (
      clickX >= margin.left &&
      clickX <= margin.left + plotW &&
      clickY >= margin.top &&
      clickY <= margin.top + plotH
    ) {
      const coordX = parseFloat(toCoordX(clickX).toFixed(2));
      const coordY = parseFloat(toCoordY(clickY).toFixed(2));

      setPoints((prev) => [
        ...prev,
        {
          id: `p-${Date.now()}-${Math.random()}`,
          x: coordX,
          y: coordY,
          type: pointMode,
        },
      ]);
    }
  };

  const removePoint = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPoints((prev) => prev.filter((p) => p.id !== id));
  };

  // Bias-Variance diagnosis
  const getDiagnosis = () => {
    if (degree === 1) {
      return { text: 'Underfitting (High Bias)', color: 'var(--accent-amber)', advice: 'The linear model is too rigid to capture the underlying curve. Both train and test errors are high.' };
    }
    if (degree >= 2 && degree <= 3 && lambda < 2.0) {
      return { text: 'Optimal Generalization (Balanced)', color: 'var(--lab-accent-lime)', advice: 'Minimal generalization gap. The model captures the underlying process without memorizing noise.' };
    }
    if (degree >= 6 && lambda === 0) {
      return { text: 'Severe Overfitting (High Variance)', color: 'var(--accent-rose)', advice: 'High-degree polynomial oscillates wildly between points. Train error is near 0, but test error explodes!' };
    }
    if (degree >= 6 && lambda > 0.5) {
      return { text: 'Regularized High-Degree Fit', color: 'var(--lab-accent-cyan)', advice: 'Ridge penalty (λ > 0) dampens large weight coefficients, successfully combating overfitting!' };
    }
    return { text: 'Moderate Complexity', color: 'var(--text-secondary)', advice: 'Notice the tradeoff between model flexibility and generalization error.' };
  };

  const diag = getDiagnosis();

  return (
    <div className="visualizer-container">
      {/* Header */}
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <TrendingUp size={20} style={{ color: 'var(--lab-accent-cyan)' }} />
            Polynomial Overfitting & Bias-Variance Laboratory (Lesson 9, Slides 19–34)
          </div>
          <div className="visualizer-subtitle">
            Numerical Least-Squares Polynomial Fitting, L2 Ridge Regularization & Generalization Error Curves
          </div>
        </div>

        <div className="visualizer-controls">
          <button
            onClick={() => {
              setPoints(initialPoints);
              setDegree(3);
              setLambda(0);
            }}
            className="btn-tactile btn-sm"
          >
            <RotateCcw size={14} />
            <span>Reset Dataset</span>
          </button>
          <button
            onClick={() => {
              // Add severe noise outlier to demonstrate overfitting
              setPoints((prev) => [...prev, { id: 'outlier', x: 4.8, y: 19.5, type: 'train' }]);
            }}
            className="btn-tactile btn-sm btn-amber"
          >
            <Plus size={14} />
            <span>Inject Outlier</span>
          </button>
        </div>
      </div>

      <div className="visualizer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Sliders: Degree & Regularization */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            background: 'var(--lab-bg-surface)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* Degree Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Polynomial Degree (d):</span>
              <strong className="font-mono text-cyan-400" style={{ fontSize: '0.9rem' }}>
                d = {degree} {degree === 1 ? '(Linear)' : degree === 2 ? '(Quadratic)' : degree === 3 ? '(Cubic)' : `(Degree ${degree})`}
              </strong>
            </div>
            <input
              type="range"
              min="1"
              max="9"
              step="1"
              value={degree}
              onChange={(e) => setDegree(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--lab-accent-cyan)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              <span>d=1 (High Bias)</span>
              <span>d=3 (Optimal)</span>
              <span>d=9 (High Variance)</span>
            </div>
          </div>

          {/* L2 Regularization Lambda Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>L2 Ridge Penalty (λ):</span>
              <strong className="font-mono text-lime-400" style={{ fontSize: '0.9rem' }}>
                λ = {lambda.toFixed(2)}
              </strong>
            </div>
            <input
              type="range"
              min="0.0"
              max="5.0"
              step="0.1"
              value={lambda}
              onChange={(e) => setLambda(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--lab-accent-lime)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              <span>λ=0 (Standard OLS)</span>
              <span>λ &gt; 0 (Tames Overfitting)</span>
            </div>
          </div>

          {/* Point Insertion Mode */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Click Canvas to Add Points:
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setPointMode('train')}
                className={`btn-tactile btn-xs ${pointMode === 'train' ? 'btn-primary' : ''}`}
                style={{ flex: 1 }}
              >
                🔵 Training ({trainPts.length})
              </button>
              <button
                onClick={() => setPointMode('test')}
                className={`btn-tactile btn-xs ${pointMode === 'test' ? 'btn-amber' : ''}`}
                style={{ flex: 1 }}
              >
                🟧 Validation/Test ({testPts.length})
              </button>
            </div>
          </div>
        </div>

        {/* 2D Interactive Polynomial Fitting Canvas */}
        <div
          style={{
            background: 'var(--lab-bg-obsidian)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--lab-border-active)',
            padding: '1rem',
            position: 'relative',
          }}
        >
          {/* Status Overlay */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge font-mono" style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${diag.color}`, color: diag.color }}>
                {diag.text}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Click anywhere on canvas to plot new {pointMode} samples
              </span>
            </div>

            {/* Error Telemetry */}
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Training MSE: </span>
                <strong className="font-mono text-cyan-400">{trainMse}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Test/Val MSE: </span>
                <strong className="font-mono text-amber-400">{testMse}</strong>
              </div>
            </div>
          </div>

          {/* SVG Plot */}
          <div style={{ width: '100%', height: '220px' }}>
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              onClick={handleSvgClick}
              style={{ width: '100%', height: '100%', cursor: 'crosshair', userSelect: 'none' }}
            >
              {/* Grid Lines */}
              {[0, 5, 10, 15, 20, 25].map((yVal) => {
                const py = toPy(yVal);
                return (
                  <g key={yVal}>
                    <line x1={margin.left} y1={py} x2={margin.left + plotW} y2={py} stroke="rgba(255, 255, 255, 0.06)" />
                    <text x={margin.left - 8} y={py + 3} fill="var(--text-muted)" fontSize="9" textAnchor="end" fontFamily="monospace">
                      {yVal}
                    </text>
                  </g>
                );
              })}

              {[1, 2, 3, 4, 5, 6, 7, 8].map((xVal) => {
                const px = toPx(xVal);
                return (
                  <g key={xVal}>
                    <line x1={px} y1={margin.top} x2={px} y2={margin.top + plotH} stroke="rgba(255, 255, 255, 0.06)" />
                    <text x={px} y={margin.top + plotH + 15} fill="var(--text-muted)" fontSize="9" textAnchor="middle" fontFamily="monospace">
                      {xVal}
                    </text>
                  </g>
                );
              })}

              {/* Fitted Polynomial Curve */}
              <path
                d={curvePath}
                fill="none"
                stroke={degree >= 6 && lambda === 0 ? 'var(--accent-rose)' : 'var(--lab-accent-lime)'}
                strokeWidth="2.5"
                style={{ filter: 'drop-shadow(0 0 6px rgba(198, 242, 119, 0.4))' }}
              />

              {/* Data Points */}
              {points.map((pt) => {
                const cx = toPx(pt.x);
                const cy = toPy(pt.y);
                const isTrain = pt.type === 'train';

                return (
                  <g key={pt.id} onClick={(e) => removePoint(pt.id, e)} style={{ cursor: 'pointer' }}>
                    {isTrain ? (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="5.5"
                        fill="var(--lab-accent-cyan)"
                        stroke="#000"
                        strokeWidth="1.5"
                      />
                    ) : (
                      <rect
                        x={cx - 5}
                        y={cy - 5}
                        width="10"
                        height="10"
                        fill="var(--lab-accent-amber)"
                        stroke="#000"
                        strokeWidth="1.5"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem', textAlign: 'center' }}>
            🔵 Blue circles = Training set | 🟧 Amber squares = Unseen Test set. Click any point to delete it.
          </div>
        </div>

        {/* Educational Diagnostic Card */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            borderLeft: `3px solid ${diag.color}`,
            background: 'var(--lab-bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <HelpCircle size={16} color={diag.color} />
            <strong style={{ fontSize: '0.85rem', color: diag.color }}>
              Educational Diagnostic: {diag.text}
            </strong>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            {diag.advice}
          </p>
          <div style={{ marginTop: '0.5rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <strong>Try this experiment:</strong> Set <code>d = 9</code> and <code>λ = 0</code>. Notice how the curve bends wildly to hit every training point. Now slowly increase <code>λ</code> to <code>1.5</code> and watch the L2 penalty pull the curve back into a smooth, generalizing parabola!
          </div>
        </div>
      </div>
    </div>
  );
};
