import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  RotateCcw
} from 'lucide-react';

interface DataPoint {
  id: string;
  x: number; // 0 to 10
  y: number; // 0 to 25
  type: 'train' | 'test';
}

// Robust Gaussian elimination with L2 Ridge Regularization: (X^T X + lambda * I) w = X^T y
const fitPolynomial = (points: DataPoint[], degree: number, lambda: number): number[] => {
  const n = points.length;
  if (n === 0) return [];
  const m = degree + 1;

  // Build normal equations
  const A: number[][] = Array.from({ length: m }, () => new Array(m).fill(0));
  const b: number[] = new Array(m).fill(0);

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += Math.pow(points[k].x, i + j);
      }
      A[i][j] = sum;
    }
    // Add L2 penalty to diagonal (excluding bias term i=0)
    if (i > 0) {
      A[i][i] += lambda;
    }

    let sumY = 0;
    for (let k = 0; k < n; k++) {
      sumY += points[k].y * Math.pow(points[k].x, i);
    }
    b[i] = sumY;
  }

  // Gaussian elimination
  const M: number[][] = A.map((row, i) => [...row, b[i]]);

  for (let i = 0; i < m; i++) {
    let maxRow = i;
    for (let k = i + 1; k < m; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
        maxRow = k;
      }
    }
    const tmp = M[i];
    M[i] = M[maxRow];
    M[maxRow] = tmp;

    if (Math.abs(M[i][i]) < 1e-12) continue;

    for (let k = i + 1; k < m; k++) {
      const c = M[k][i] / M[i][i];
      for (let j = i; j <= m; j++) {
        M[k][j] -= c * M[i][j];
      }
    }
  }

  const w = new Array(m).fill(0);
  for (let i = m - 1; i >= 0; i--) {
    let sum = M[i][m];
    for (let j = i + 1; j < m; j++) {
      sum -= M[i][j] * w[j];
    }
    w[i] = Math.abs(M[i][i]) > 1e-12 ? sum / M[i][i] : 0;
  }

  return w;
};

const evalPoly = (w: number[], x: number): number => {
  let val = 0;
  for (let i = 0; i < w.length; i++) {
    val += w[i] * Math.pow(x, i);
  }
  return val;
};

export const OverfittingUnderfittingLab: React.FC = () => {
  const [degree, setDegree] = useState<number>(3);
  const [lambda, setLambda] = useState<number>(0.0); // L2 Ridge Penalty
  const [addPointMode, setAddPointMode] = useState<'train' | 'test'>('train');

  // Ground truth dataset (parabolic underlying signal + realistic noise)
  const defaultPoints: DataPoint[] = useMemo(
    () => [
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

      // Validation / Test points
      { id: 'te1', x: 1.4, y: 2.8, type: 'test' },
      { id: 'te2', x: 2.2, y: 1.6, type: 'test' },
      { id: 'te3', x: 3.8, y: 2.7, type: 'test' },
      { id: 'te4', x: 5.4, y: 7.8, type: 'test' },
      { id: 'te5', x: 7.0, y: 15.6, type: 'test' }
    ],
    []
  );

  const [points, setPoints] = useState<DataPoint[]>(defaultPoints);

  const trainPts = useMemo(() => points.filter((p) => p.type === 'train'), [points]);
  const testPts = useMemo(() => points.filter((p) => p.type === 'test'), [points]);

  // Fit weights on training points only
  const weights = useMemo(() => {
    return fitPolynomial(trainPts, degree, lambda);
  }, [trainPts, degree, lambda]);

  // Compute Mean Squared Errors
  const { trainMSE, testMSE, regime } = useMemo(() => {
    if (weights.length === 0) return { trainMSE: 0, testMSE: 0, regime: 'OPTIMAL' as const };

    let trainErr = 0;
    trainPts.forEach((p) => {
      const pred = evalPoly(weights, p.x);
      trainErr += Math.pow(p.y - pred, 2);
    });
    trainErr = trainPts.length > 0 ? trainErr / trainPts.length : 0;

    let testErr = 0;
    testPts.forEach((p) => {
      const pred = evalPoly(weights, p.x);
      testErr += Math.pow(p.y - pred, 2);
    });
    testErr = testPts.length > 0 ? testErr / testPts.length : 0;

    let reg: 'UNDERFITTING' | 'OPTIMAL' | 'OVERFITTING';
    if (degree <= 1) reg = 'UNDERFITTING';
    else if (degree >= 7 && lambda < 0.05) reg = 'OVERFITTING';
    else reg = 'OPTIMAL';

    return {
      trainMSE: parseFloat(trainErr.toFixed(2)),
      testMSE: parseFloat(testErr.toFixed(2)),
      regime: reg
    };
  }, [weights, trainPts, testPts, degree, lambda]);

  // SVG Geometry Dimensions
  const svgW = 680;
  const svgH = 260;
  const padX = 45;
  const padY = 30;
  const plotW = svgW - padX * 2;
  const plotH = svgH - padY * 2;

  const toPx = (x: number) => padX + (x / 9.0) * plotW;
  const toPy = (y: number) => padY + plotH - (Math.max(-2, Math.min(28, y)) / 28.0) * plotH;

  // Generate polynomial curve path
  const curvePath = useMemo(() => {
    if (weights.length === 0) return '';
    const pts: string[] = [];
    const steps = 140;
    for (let i = 0; i <= steps; i++) {
      const x = 0.8 + (i / steps) * 7.8;
      const y = evalPoly(weights, x);
      const px = toPx(x);
      const py = toPy(y);
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }, [weights]);

  // Click canvas to add new data point
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert pixels to domain units
    const domainX = ((clickX - padX) / plotW) * 9.0;
    const domainY = ((padY + plotH - clickY) / plotH) * 28.0;

    if (domainX >= 0.5 && domainX <= 8.8 && domainY >= 0 && domainY <= 27) {
      const newPt: DataPoint = {
        id: `custom-${Date.now()}`,
        x: parseFloat(domainX.toFixed(2)),
        y: parseFloat(domainY.toFixed(2)),
        type: addPointMode
      };
      setPoints((prev) => [...prev, newPt]);
    }
  };

  return (
    <div className="visualizer-container">
      {/* Header */}
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <TrendingUp size={20} style={{ color: 'var(--lab-accent-cyan)' }} />
            Generalization, Overfitting & The Bias-Variance Tradeoff Lab
          </div>
          <div className="visualizer-subtitle">
            Polynomial Degree $d$, Train vs Test MSE Gap & L2 Ridge Regularization $\lambda$ (UCLM Slides 20–35)
          </div>
        </div>

        <div className="visualizer-controls">
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => {
                setDegree(3);
                setLambda(0.0);
                setPoints(defaultPoints);
              }}
              className="btn-tactile btn-sm"
            >
              <RotateCcw size={14} />
              <span>Reset Ground Truth</span>
            </button>
          </div>
        </div>
      </div>

      <div className="visualizer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Sliders Deck */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            background: 'var(--lab-bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--lab-border-subtle)'
          }}
        >
          {/* Degree Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Polynomial Degree $d$:</span>
              <strong className="font-mono text-cyan-400">Degree {degree}</strong>
            </div>
            <input
              type="range"
              min="1"
              max="9"
              value={degree}
              onChange={(e) => setDegree(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--lab-accent-cyan)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              <span>d=1 (Linear / Underfit)</span>
              <span>d=3 (Optimal)</span>
              <span>d=9 (Oscillatory / Overfit)</span>
            </div>
          </div>

          {/* L2 Regularization Lambda Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>L2 Regularization $\lambda$:</span>
              <strong className="font-mono text-lime-400">$\lambda$ = {lambda.toFixed(2)}</strong>
            </div>
            <input
              type="range"
              min="0.0"
              max="2.5"
              step="0.05"
              value={lambda}
              onChange={(e) => setLambda(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--lab-accent-lime)' }}
            />
            <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
              Penalizes large weights $\|w\|_2^2$ to curb wild oscillations.
            </span>
          </div>

          {/* Interactive Point Insertion Toggle */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
              Click Canvas to Add Point:
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setAddPointMode('train')}
                className={`btn-tactile btn-xs ${addPointMode === 'train' ? 'btn-primary' : ''}`}
                style={{ flex: 1 }}
              >
                ● Training Point
              </button>
              <button
                onClick={() => setAddPointMode('test')}
                className={`btn-tactile btn-xs ${addPointMode === 'test' ? 'btn-amber' : ''}`}
                style={{ flex: 1 }}
              >
                ▲ Test / Validation
              </button>
            </div>
          </div>
        </div>

        {/* Telemetry Error Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Training Error */}
          <div className="card" style={{ padding: '1rem', background: 'var(--lab-bg-surface)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>TRAINING ERROR (MSE)</div>
            <div className="font-mono text-cyan-400" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {trainMSE}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Evaluated on {trainPts.length} train samples
            </span>
          </div>

          {/* Test / Validation Error */}
          <div className="card" style={{ padding: '1rem', background: 'var(--lab-bg-surface)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>TEST / GENERALIZATION (MSE)</div>
            <div
              className="font-mono"
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: testMSE > 8.0 ? '#fb7185' : 'var(--lab-accent-lime)'
              }}
            >
              {testMSE}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Evaluated on {testPts.length} unseen test samples
            </span>
          </div>

          {/* Model Regime Badge */}
          <div className="card" style={{ padding: '1rem', background: 'var(--lab-bg-surface)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>CURRENT MODEL STATE</div>
            <div
              className="font-mono"
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color:
                  regime === 'OPTIMAL'
                    ? 'var(--lab-accent-lime)'
                    : regime === 'UNDERFITTING'
                    ? 'var(--lab-accent-amber)'
                    : '#fb7185'
              }}
            >
              {regime === 'OPTIMAL'
                ? 'OPTIMAL GENERALIZATION'
                : regime === 'UNDERFITTING'
                ? 'HIGH BIAS (UNDERFITTING)'
                : 'HIGH VARIANCE (OVERFITTING)'}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {regime === 'OVERFITTING'
                ? 'Low train error, but catastrophic test error gap!'
                : regime === 'UNDERFITTING'
                ? 'Model lacks expressive capacity to fit parabola.'
                : 'Balanced capacity and generalization.'}
            </span>
          </div>
        </div>

        {/* SVG Plot Canvas */}
        <div
          style={{
            background: 'var(--lab-bg-obsidian)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--lab-border-active)',
            padding: '1rem',
            position: 'relative'
          }}
        >
          <div style={{ width: '100%', height: '260px' }}>
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
              onClick={handleCanvasClick}
            >
              {/* Axes & Grid */}
              <line x1={padX} y1={padY + plotH} x2={svgW - padX} y2={padY + plotH} stroke="rgba(255,255,255,0.15)" />
              <line x1={padX} y1={padY} x2={padX} y2={padY + plotH} stroke="rgba(255,255,255,0.15)" />

              {/* Grid Lines */}
              {[5, 10, 15, 20, 25].map((val) => {
                const py = toPy(val);
                return (
                  <g key={`y-${val}`}>
                    <line x1={padX} y1={py} x2={svgW - padX} y2={py} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                    <text x={padX - 8} y={py + 3} fill="var(--text-muted)" fontSize="9" textAnchor="end" fontFamily="monospace">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Polynomial Fit Curve */}
              {curvePath && (
                <path
                  d={curvePath}
                  fill="none"
                  stroke={regime === 'OVERFITTING' ? '#fb7185' : 'var(--lab-accent-cyan)'}
                  strokeWidth="2.5"
                />
              )}

              {/* Training Data Points (Circles) */}
              {trainPts.map((pt) => {
                const cx = toPx(pt.x);
                const cy = toPy(pt.y);
                return (
                  <circle
                    key={pt.id}
                    cx={cx}
                    cy={cy}
                    r="5"
                    fill="var(--lab-accent-cyan)"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Test / Validation Data Points (Triangles) */}
              {testPts.map((pt) => {
                const cx = toPx(pt.x);
                const cy = toPy(pt.y);
                return (
                  <polygon
                    key={pt.id}
                    points={`${cx},${cy - 6} ${cx - 5},${cy + 4} ${cx + 5},${cy + 4}`}
                    fill="var(--lab-accent-amber)"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>
          </div>

          <div
            style={{
              marginTop: '0.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}
          >
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span>● Cyan Circles: Training Set (D_train)</span>
              <span>▲ Amber Triangles: Unseen Test Set (D_test)</span>
            </div>
            <span>Click anywhere inside the chart grid to drop a custom data point!</span>
          </div>
        </div>

        {/* Mathematical Bias-Variance Callout */}
        <div className="card" style={{ padding: '1.25rem', background: 'var(--lab-bg-surface)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--lab-accent-amber)', marginBottom: '0.4rem' }}>
            The Bias-Variance Decomposition (UCLM Slides 24–28)
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Generalization error on unseen data decomposes mathematically into three distinct terms:
          </p>
          <div style={{ margin: '0.5rem 0', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--lab-accent-cyan)' }}>
            E[(y - f(x))²] = Bias[f(x)]² + Var[f(x)] + σ²
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
            • <strong>High Bias (Underfitting):</strong> Model is too simplistic ($d=1$), introducing systematic errors.<br />
            • <strong>High Variance (Overfitting):</strong> Model has too many free parameters ($d=9$), memorizing noise and failing on new test data.<br />
            • <strong>L2 Regularization ($\lambda$):</strong> Constrains weight magnitudes $\sum w_j^2 \le C$, smoothing the curve without reducing polynomial degree!
          </p>
        </div>
      </div>
    </div>
  );
};
