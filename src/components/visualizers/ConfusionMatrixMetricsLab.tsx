import React, { useState, useMemo } from 'react';
import {
  Sliders,
  AlertTriangle,
  Activity,
} from 'lucide-react';

export const ConfusionMatrixMetricsLab: React.FC = () => {
  // Classification decision threshold theta in [0.05, 0.95]
  const [threshold, setThreshold] = useState<number>(0.50);
  const [imbalanceMode, setImbalanceMode] = useState<'balanced' | 'rare-disease' | 'spam'>('balanced');

  // Distribution parameters
  // Negative Class distribution (healthy) vs Positive Class distribution (sick)
  const totalSamples = 1000;
  const posRatio = imbalanceMode === 'rare-disease' ? 0.02 : imbalanceMode === 'spam' ? 0.20 : 0.50;
  const numPos = Math.round(totalSamples * posRatio);
  const numNeg = totalSamples - numPos;

  // Gaussian simulation of classifier output probabilities
  // Negative class mean = 0.35, std = 0.15
  // Positive class mean = 0.65, std = 0.15
  const normalCDF = (x: number, mean: number, std: number): number => {
    // Approximation of standard normal CDF
    const z = (x - mean) / std;
    const t = 1.0 / (1.0 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp((-z * z) / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1.0 - p : p;
  };

  // Compute live TP, FP, FN, TN from current threshold theta
  const { tp, fp, fn, tn } = useMemo(() => {
    // For Negative class (true label 0):
    // Predicted positive if score >= theta (False Positive)
    // Predicted negative if score < theta (True Negative)
    const negScoreBelow = normalCDF(threshold, 0.35, 0.14);
    const currTn = Math.round(numNeg * negScoreBelow);
    const currFp = numNeg - currTn;

    // For Positive class (true label 1):
    // Predicted positive if score >= theta (True Positive)
    // Predicted negative if score < theta (False Negative)
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
    for (let t = 0.0; t <= 1.0; t += 0.04) {
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
            Confusion Matrix, Decision Thresholds & ROC Engine (Lesson 10, Slides 43–60)
          </div>
          <div className="visualizer-subtitle">
            Interactive Continuous Classifier Threshold, Precision-Recall Tradeoffs & The Accuracy Paradox
          </div>
        </div>

        <div className="visualizer-controls">
          <button
            onClick={() => {
              setImbalanceMode('balanced');
              setThreshold(0.50);
            }}
            className={`btn-tactile btn-sm ${imbalanceMode === 'balanced' ? 'btn-primary' : ''}`}
          >
            <span>Balanced (50:50)</span>
          </button>
          <button
            onClick={() => {
              setImbalanceMode('rare-disease');
              setThreshold(0.70); // High threshold demonstrates accuracy paradox!
            }}
            className={`btn-tactile btn-sm ${imbalanceMode === 'rare-disease' ? 'btn-amber' : ''}`}
          >
            <AlertTriangle size={14} />
            <span>Accuracy Paradox (2% Rare)</span>
          </button>
          <button
            onClick={() => {
              setImbalanceMode('spam');
              setThreshold(0.60);
            }}
            className={`btn-tactile btn-sm ${imbalanceMode === 'spam' ? 'btn-primary' : ''}`}
          >
            <span>Spam Filter (20% Positive)</span>
          </button>
        </div>
      </div>

      <div className="visualizer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Interactive Threshold Slider Strip */}
        <div
          style={{
            background: 'var(--lab-bg-surface)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Classifier Decision Threshold (θ):</span>
              <strong className="font-mono text-cyan-400" style={{ fontSize: '1.05rem', marginLeft: '0.5rem' }}>
                θ = {threshold.toFixed(2)}
              </strong>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Decision Rule: If probability <strong>P(y=1|x) &ge; {threshold.toFixed(2)}</strong> &rarr; Predict Positive (Class 1)
            </div>
          </div>

          <input
            type="range"
            min="0.10"
            max="0.90"
            step="0.02"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--lab-accent-cyan)', cursor: 'pointer' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            <span>&larr; Lower Threshold: High Sensitivity (High Recall, Lower Precision)</span>
            <span>Higher Threshold: High Specificity (High Precision, Lower Recall) &rarr;</span>
          </div>
        </div>

        {/* Dual Layout: 2x2 Confusion Matrix & Live ROC Curve */}
        <div className="grid-2">
          {/* Panel 1: Live 2x2 Contingency Table */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <strong style={{ fontSize: '0.82rem' }}>Contingency Matrix (N = {total})</strong>
              <span className="badge badge-cyan font-mono">LIVE PREDICTIONS</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 1fr',
                gridTemplateRows: 'auto 1fr 1fr',
                gap: '6px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {/* Header */}
              <div />
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.68rem' }}>PRED POSITIVE</div>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.68rem' }}>PRED NEGATIVE</div>

              {/* Row 1: Actual Positive */}
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--lab-accent-lime)', fontSize: '0.68rem' }}>
                TRUE POS ({numPos})
              </div>
              {/* TP */}
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid var(--accent-emerald)',
                  borderRadius: '6px',
                  padding: '0.6rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.65rem', color: 'var(--accent-emerald)' }}>True Pos (TP)</div>
                <strong style={{ fontSize: '1.2rem', color: '#10b981' }}>{tp}</strong>
              </div>
              {/* FN */}
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid var(--accent-rose)',
                  borderRadius: '6px',
                  padding: '0.6rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.65rem', color: 'var(--accent-rose)' }}>False Neg (FN)</div>
                <strong style={{ fontSize: '1.2rem', color: '#ef4444' }}>{fn}</strong>
              </div>

              {/* Row 2: Actual Negative */}
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--lab-accent-cyan)', fontSize: '0.68rem' }}>
                TRUE NEG ({numNeg})
              </div>
              {/* FP */}
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid var(--accent-amber)',
                  borderRadius: '6px',
                  padding: '0.6rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.65rem', color: 'var(--accent-amber)' }}>False Pos (FP)</div>
                <strong style={{ fontSize: '1.2rem', color: '#f59e0b' }}>{fp}</strong>
              </div>
              {/* TN */}
              <div
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid #38bdf8',
                  borderRadius: '6px',
                  padding: '0.6rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.65rem', color: '#38bdf8' }}>True Neg (TN)</div>
                <strong style={{ fontSize: '1.2rem', color: '#38bdf8' }}>{tn}</strong>
              </div>
            </div>

            {/* Live Metrics Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
                gap: '6px',
                marginTop: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Accuracy</div>
                <strong className="font-mono" style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {(accuracy * 100).toFixed(1)}%
                </strong>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Precision</div>
                <strong className="font-mono text-cyan-400" style={{ fontSize: '0.95rem' }}>
                  {(precision * 100).toFixed(1)}%
                </strong>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Recall (Sens.)</div>
                <strong className="font-mono text-lime-400" style={{ fontSize: '0.95rem' }}>
                  {(recall * 100).toFixed(1)}%
                </strong>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Specificity</div>
                <strong className="font-mono text-amber-400" style={{ fontSize: '0.95rem' }}>
                  {(specificity * 100).toFixed(1)}%
                </strong>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>F1-Score</div>
                <strong className="font-mono text-emerald-400" style={{ fontSize: '0.95rem' }}>
                  {f1.toFixed(3)}
                </strong>
              </div>
            </div>
          </div>

          {/* Panel 2: Live Synchronized ROC Curve */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700 }}>
                <Activity size={16} color="var(--lab-accent-cyan)" />
                <span>ROC Curve (TPR vs FPR)</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                AUC &approx; 0.94 (Excellent Discrimination)
              </span>
            </div>

            {/* SVG Plot */}
            <div style={{ background: 'var(--lab-bg-obsidian)', borderRadius: '6px', border: '1px solid var(--border-subtle)', padding: '0.5rem' }}>
              <svg viewBox="0 0 280 180" style={{ width: '100%', height: '170px' }}>
                {/* Diagonal random chance line */}
                <line x1="30" y1="150" x2="260" y2="20" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />

                {/* Grid */}
                <line x1="30" y1="150" x2="260" y2="150" stroke="rgba(255,255,255,0.2)" />
                <line x1="30" y1="20" x2="30" y2="150" stroke="rgba(255,255,255,0.2)" />
                <text x="30" y="165" fill="var(--text-muted)" fontSize="8" fontFamily="monospace">0.0 (FPR)</text>
                <text x="240" y="165" fill="var(--text-muted)" fontSize="8" fontFamily="monospace">1.0</text>
                <text x="8" y="25" fill="var(--text-muted)" fontSize="8" fontFamily="monospace">1.0</text>
                <text x="8" y="150" fill="var(--text-muted)" fontSize="8" fontFamily="monospace">0.0</text>

                {/* ROC Curve Path */}
                <polyline
                  fill="none"
                  stroke="var(--lab-accent-cyan)"
                  strokeWidth="2.5"
                  points={rocCurvePoints
                    .map((p) => {
                      const x = 30 + p.fpr * 230;
                      const y = 150 - p.tpr * 130;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />

                {/* Current Operating Point for threshold theta */}
                <circle
                  cx={30 + currentFpr * 230}
                  cy={150 - currentTpr * 130}
                  r="6"
                  fill="var(--lab-accent-lime)"
                  stroke="#000"
                  strokeWidth="2"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(198, 242, 119, 0.8))' }}
                />
              </svg>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'center' }}>
              Lime dot = Current operating point at &theta; = {threshold.toFixed(2)} (FPR={currentFpr.toFixed(2)}, Recall={currentTpr.toFixed(2)})
            </div>
          </div>
        </div>

        {/* Accuracy Paradox Diagnostic Alert */}
        {imbalanceMode === 'rare-disease' && (
          <div
            className="card"
            style={{
              padding: '1.25rem',
              borderLeft: '3px solid var(--accent-amber)',
              background: 'rgba(233, 183, 119, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <AlertTriangle size={18} color="var(--lab-accent-amber)" />
              <strong style={{ fontSize: '0.85rem', color: 'var(--lab-accent-amber)' }}>
                Accuracy Paradox Warning (Rare Disease Screening, 2% Prevalence)
              </strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Notice how <strong>Accuracy is {(accuracy * 100).toFixed(1)}%</strong>, yet <strong>Recall is only {(recall * 100).toFixed(1)}%</strong> (missing {fn} sick patients out of {numPos})!
              If a naive doctor simply diagnoses every single patient as healthy (&theta;=1.0), their "Accuracy" would be 98.0%, but every single sick patient would die untreated (Recall = 0%).
              This is why in medical screening and fraud detection, <strong>Recall and F1-Score are far more critical than raw Accuracy</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
