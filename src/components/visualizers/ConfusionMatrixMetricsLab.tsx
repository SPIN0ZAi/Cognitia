import React, { useState, useMemo } from 'react';
import {
  Sliders,
  TrendingUp,
  BarChart3,
  ShieldAlert
} from 'lucide-react';

export const ConfusionMatrixMetricsLab: React.FC = () => {
  // Classification decision threshold theta in [0.05, 0.95]
  const [threshold, setThreshold] = useState<number>(0.50);
  const [imbalanceMode, setImbalanceMode] = useState<'balanced' | 'rare-disease' | 'spam'>('balanced');
  const [activeTab, setActiveTab] = useState<'matrix' | 'roc' | 'paradox'>('matrix');

  // Distribution parameters
  // Total Population = 1,000 samples
  const totalSamples = 1000;
  const posRatio = imbalanceMode === 'rare-disease' ? 0.02 : imbalanceMode === 'spam' ? 0.20 : 0.50;
  const numPos = Math.round(totalSamples * posRatio);
  const numNeg = totalSamples - numPos;

  // Standard normal CDF approximation
  const normalCDF = (x: number, mean: number, std: number): number => {
    const z = (x - mean) / std;
    const t = 1.0 / (1.0 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp((-z * z) / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1.0 - p : p;
  };

  // Compute live TP, FP, FN, TN from current threshold theta
  const { tp, fp, fn, tn } = useMemo(() => {
    // Negative class scores ~ N(0.35, 0.14)
    // Positive class scores ~ N(0.65, 0.14)
    const negScoreBelow = normalCDF(threshold, 0.35, 0.14);
    const currTn = Math.round(numNeg * negScoreBelow);
    const currFp = numNeg - currTn;

    const posScoreBelow = normalCDF(threshold, 0.65, 0.14);
    const currFn = Math.round(numPos * posScoreBelow);
    const currTp = numPos - currFn;

    return { tp: currTp, fp: currFp, fn: currFn, tn: currTn };
  }, [threshold, numPos, numNeg]);

  const total = tp + fp + fn + tn;

  // Metric Computations with safe zero division
  const accuracy = total > 0 ? (tp + tn) / total : 0;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const specificity = tn + fp > 0 ? tn / (tn + fp) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  // Generate ROC Curve points (TPR vs FPR for theta in 0..1)
  const rocCurvePoints = useMemo(() => {
    const pts: { fpr: number; tpr: number; th: number }[] = [];
    for (let t = 0.0; t <= 1.0; t += 0.03) {
      const cdfNeg = normalCDF(t, 0.35, 0.14);
      const cdfPos = normalCDF(t, 0.65, 0.14);
      const curFpr = 1.0 - cdfNeg;
      const curTpr = 1.0 - cdfPos;
      pts.push({ fpr: curFpr, tpr: curTpr, th: t });
    }
    return pts;
  }, []);

  const currentFpr = tn + fp > 0 ? fp / (tn + fp) : 0;
  const currentTpr = recall;

  return (
    <div className="visualizer-container">
      {/* Header */}
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Sliders size={20} style={{ color: 'var(--lab-accent-cyan)' }} />
            Diagnostic Confusion Matrix, ROC Engine & The Accuracy Paradox
          </div>
          <div className="visualizer-subtitle">
            Continuous Decision Threshold $\theta$, Precision-Recall Tradeoff & Class Imbalance (UCLM Slides 43–60)
          </div>
        </div>

        <div className="visualizer-controls">
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`btn-tactile btn-sm ${activeTab === 'matrix' ? 'btn-primary' : ''}`}
            >
              <BarChart3 size={14} />
              <span>Confusion Matrix</span>
            </button>
            <button
              onClick={() => setActiveTab('roc')}
              className={`btn-tactile btn-sm ${activeTab === 'roc' ? 'btn-amber' : ''}`}
            >
              <TrendingUp size={14} />
              <span>ROC / AUC Curve</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('paradox');
                setImbalanceMode('rare-disease');
                setThreshold(0.95);
              }}
              className={`btn-tactile btn-sm ${activeTab === 'paradox' ? 'btn-rose' : ''}`}
            >
              <ShieldAlert size={14} />
              <span>Accuracy Paradox</span>
            </button>
          </div>
        </div>
      </div>

      <div className="visualizer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Threshold Control Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: 'var(--lab-bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--lab-border-subtle)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '240px' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Classification Threshold $\theta$:
              </div>
              <div className="font-mono text-cyan-400" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                $\theta$ = {threshold.toFixed(2)}
              </div>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.95"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--lab-accent-cyan)' }}
            />
          </div>

          {/* Dataset Distribution Preset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Dataset Prior:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(
                [
                  { id: 'balanced', label: 'Balanced (50%)' },
                  { id: 'spam', label: 'Spam (20%)' },
                  { id: 'rare-disease', label: 'Rare Disease (2%)' }
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setImbalanceMode(mode.id)}
                  className={`btn-tactile btn-xs ${imbalanceMode === mode.id ? 'btn-amber' : ''}`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5 Core Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
          {/* Accuracy */}
          <div className="card" style={{ padding: '0.75rem', background: 'var(--lab-bg-surface)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACCURACY</div>
            <div className="font-mono text-cyan-400" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              {(accuracy * 100).toFixed(1)}%
            </div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
              $\frac{`{TP + TN}`}{`{Total}`}$
            </span>
          </div>

          {/* Precision */}
          <div className="card" style={{ padding: '0.75rem', background: 'var(--lab-bg-surface)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>PRECISION</div>
            <div className="font-mono text-lime-400" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              {(precision * 100).toFixed(1)}%
            </div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
              $\frac{`{TP}`}{`{TP + FP}`}$
            </span>
          </div>

          {/* Recall / Sensitivity */}
          <div className="card" style={{ padding: '0.75rem', background: 'var(--lab-bg-surface)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>RECALL (SENSITIVITY)</div>
            <div className="font-mono text-amber-400" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              {(recall * 100).toFixed(1)}%
            </div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
              $\frac{`{TP}`}{`{TP + FN}`}$
            </span>
          </div>

          {/* Specificity */}
          <div className="card" style={{ padding: '0.75rem', background: 'var(--lab-bg-surface)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>SPECIFICITY</div>
            <div className="font-mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#a78bfa' }}>
              {(specificity * 100).toFixed(1)}%
            </div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
              $\frac{`{TN}`}{`{TN + FP}`}$
            </span>
          </div>

          {/* F1 Score */}
          <div className="card" style={{ padding: '0.75rem', background: 'var(--lab-bg-surface)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>F₁-SCORE</div>
            <div className="font-mono text-rose-400" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              {(f1 * 100).toFixed(1)}%
            </div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
              $2 \cdot \frac{`{P \\cdot R}`}{`{P + R}`}$
            </span>
          </div>
        </div>

        {/* Tab 1: Interactive 2x2 Confusion Matrix */}
        {activeTab === 'matrix' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(280px, 380px) 1fr',
              gap: '1.25rem'
            }}
          >
            {/* 2x2 Matrix Box */}
            <div
              style={{
                background: 'var(--lab-bg-obsidian)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--lab-border-active)',
                padding: '1.25rem'
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem', textAlign: 'center' }}>
                Confusion Matrix ($N = 1,000$ Instances)
              </div>

              {/* Grid 2x2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1fr', gap: '6px', alignItems: 'center' }}>
                <div />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 'bold' }}>
                  PREDICTED POS
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 'bold' }}>
                  PREDICTED NEG
                </div>

                {/* Actual Positive Row */}
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 'bold', textAlign: 'right', paddingRight: '6px' }}>
                  ACTUAL POS
                </div>
                {/* True Positive Cell */}
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '6px',
                    background: 'rgba(198, 242, 119, 0.12)',
                    border: '1px solid var(--lab-accent-lime)',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: 'var(--lab-accent-lime)', fontWeight: 600 }}>TRUE POSITIVE (TP)</div>
                  <div className="font-mono text-lime-400" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                    {tp}
                  </div>
                </div>

                {/* False Negative Cell */}
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '6px',
                    background: 'rgba(251, 113, 133, 0.12)',
                    border: '1px solid #fb7185',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: '#fb7185', fontWeight: 600 }}>FALSE NEGATIVE (FN)</div>
                  <div className="font-mono text-rose-400" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                    {fn}
                  </div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Type II Error</span>
                </div>

                {/* Actual Negative Row */}
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 'bold', textAlign: 'right', paddingRight: '6px' }}>
                  ACTUAL NEG
                </div>
                {/* False Positive Cell */}
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '6px',
                    background: 'rgba(251, 113, 133, 0.12)',
                    border: '1px solid #fb7185',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: '#fb7185', fontWeight: 600 }}>FALSE POSITIVE (FP)</div>
                  <div className="font-mono text-rose-400" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                    {fp}
                  </div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Type I Error</span>
                </div>

                {/* True Negative Cell */}
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '6px',
                    background: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid var(--lab-accent-cyan)',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: 'var(--lab-accent-cyan)', fontWeight: 600 }}>TRUE NEGATIVE (TN)</div>
                  <div className="font-mono text-cyan-400" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                    {tn}
                  </div>
                </div>
              </div>
            </div>

            {/* Threshold PDF Score Distributions Chart */}
            <div
              style={{
                background: 'var(--lab-bg-obsidian)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--lab-border-active)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
                Class Conditional Probabilities & Decision Boundary
              </div>

              {/* Dual Gaussian SVG */}
              <div style={{ width: '100%', height: '170px' }}>
                <svg viewBox="0 0 500 170" style={{ width: '100%', height: '100%' }}>
                  {/* Axis */}
                  <line x1="30" y1="150" x2="470" y2="150" stroke="rgba(255,255,255,0.2)" />

                  {/* Negative Class Bell Curve ~ N(0.35, 0.14) */}
                  <path
                    d={(() => {
                      const pts: string[] = [];
                      for (let x = 0.05; x <= 0.95; x += 0.02) {
                        const z = (x - 0.35) / 0.14;
                        const yVal = (1 / (0.14 * 2.5)) * Math.exp(-0.5 * z * z);
                        const px = 30 + x * 440;
                        const py = 150 - yVal * 42;
                        pts.push(`${x === 0.05 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
                      }
                      return pts.join(' ');
                    })()}
                    fill="none"
                    stroke="var(--lab-accent-cyan)"
                    strokeWidth="2"
                  />
                  <text x="180" y="35" fill="var(--lab-accent-cyan)" fontSize="9.5" fontFamily="monospace">
                    Negative Class P(s|Negative)
                  </text>

                  {/* Positive Class Bell Curve ~ N(0.65, 0.14) */}
                  <path
                    d={(() => {
                      const pts: string[] = [];
                      for (let x = 0.05; x <= 0.95; x += 0.02) {
                        const z = (x - 0.65) / 0.14;
                        const yVal = (1 / (0.14 * 2.5)) * Math.exp(-0.5 * z * z);
                        const px = 30 + x * 440;
                        const py = 150 - yVal * 42;
                        pts.push(`${x === 0.05 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
                      }
                      return pts.join(' ');
                    })()}
                    fill="none"
                    stroke="#fb7185"
                    strokeWidth="2"
                  />
                  <text x="320" y="35" fill="#fb7185" fontSize="9.5" fontFamily="monospace">
                    Positive Class P(s|Positive)
                  </text>

                  {/* Threshold Line θ */}
                  {(() => {
                    const thPx = 30 + threshold * 440;
                    return (
                      <g>
                        <line x1={thPx} y1="15" x2={thPx} y2="150" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 3" />
                        <circle cx={thPx} cy="15" r="4" fill="#ffffff" />
                        <text x={thPx} y="10" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                          θ={threshold.toFixed(2)}
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Increasing $\theta$ shifts the boundary right: lowers False Positives (increases Precision) at the cost of increasing False Negatives (lowers Recall).
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Receiver Operating Characteristic (ROC) */}
        {activeTab === 'roc' && (
          <div className="card" style={{ padding: '1.25rem', background: 'var(--lab-bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                  Receiver Operating Characteristic (ROC) & AUC Metric (Slide 55)
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Plots True Positive Rate (Recall) vs False Positive Rate (1 - Specificity) across all operating thresholds θ in [0, 1].
                </p>
              </div>
              <span className="badge badge-lime font-mono">
                AUC $\approx$ 0.94 (Excellent Discriminator)
              </span>
            </div>

            {/* ROC Curve SVG */}
            <div style={{ width: '100%', height: '240px', background: 'var(--lab-bg-obsidian)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-medium)' }}>
              <svg viewBox="0 0 500 220" style={{ width: '100%', height: '100%' }}>
                {/* Grid & diagonal reference */}
                <line x1="45" y1="190" x2="445" y2="190" stroke="rgba(255,255,255,0.2)" />
                <line x1="45" y1="20" x2="45" y2="190" stroke="rgba(255,255,255,0.2)" />
                <line x1="45" y1="190" x2="445" y2="20" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                <text x="240" y="115" fill="var(--text-muted)" fontSize="8.5" fontFamily="monospace" transform="rotate(-23 240 115)">
                  Random Guessing (AUC = 0.50)
                </text>

                {/* ROC Curve Line */}
                <path
                  d={rocCurvePoints
                    .map((pt, i) => {
                      const px = 45 + pt.fpr * 400;
                      const py = 190 - pt.tpr * 170;
                      return `${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="var(--lab-accent-cyan)"
                  strokeWidth="2.5"
                />

                {/* Current Operating Point */}
                {(() => {
                  const currPx = 45 + currentFpr * 400;
                  const currPy = 190 - currentTpr * 170;
                  return (
                    <g>
                      <circle cx={currPx} cy={currPy} r="6" fill="#ffffff" stroke="var(--lab-accent-cyan)" strokeWidth="2" />
                      <text x={currPx + 10} y={currPy - 6} fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold">
                        Current: θ={threshold.toFixed(2)} (FPR={currentFpr.toFixed(2)}, TPR={currentTpr.toFixed(2)})
                      </text>
                    </g>
                  );
                })()}

                {/* Axis Labels */}
                <text x="245" y="212" fill="var(--text-muted)" fontSize="9" textAnchor="middle" fontFamily="monospace">
                  False Positive Rate: FPR = FP / (FP + TN)
                </text>
                <text x="20" y="105" fill="var(--text-muted)" fontSize="9" textAnchor="middle" fontFamily="monospace" transform="rotate(-90 20 105)">
                  True Positive Rate (Recall)
                </text>
              </svg>
            </div>
          </div>
        )}

        {/* Tab 3: The Accuracy Paradox */}
        {activeTab === 'paradox' && (
          <div className="card" style={{ padding: '1.25rem', background: 'var(--lab-bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldAlert size={18} className="text-rose-400" />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                The Accuracy Paradox on Imbalanced Datasets (UCLM Slide 52)
              </h4>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              In a rare disease dataset where only <strong>2% of patients</strong> are sick (20 out of 1,000):
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                padding: '1rem',
                background: 'rgba(251, 113, 133, 0.06)',
                border: '1px solid #fb7185',
                borderRadius: '6px'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>NAIVE CONSTANT CLASSIFIER (PREDICT NOBODY IS SICK)</div>
                <div className="font-mono text-cyan-400" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                  98.0% ACCURACY!
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.3rem', margin: 0 }}>
                  Because 980 patients are genuinely healthy, a useless system that blindly predicts <em>Negative</em> for everyone scores an incredible 98% accuracy!
                </p>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>CLINICAL REALITY (RECALL & F1)</div>
                <div className="font-mono text-rose-400" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                  0.0% RECALL (0 SICK PATIENTS FOUND)
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.3rem', margin: 0 }}>
                  All 20 sick patients are sent home undiagnosed ($FN = 20$). In medical and security diagnosis, accuracy is dangerously misleading—evaluators must use <strong>Precision, Recall, F₁-Score, and ROC/AUC</strong>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
