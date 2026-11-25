import React, { useState, useMemo } from 'react';
import {
  Network,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  HelpCircle,
  Layers,
  Sparkles
} from 'lucide-react';

interface ClusterPoint {
  id: number;
  x: number;
  y: number;
  cluster: number; // 0 to K-1
}

interface Centroid {
  k: number;
  x: number;
  y: number;
  color: string;
}

const CENTROID_COLORS = [
  '#38bdf8', // Cyan
  '#c6f277', // Lime
  '#fbbf24', // Amber
  '#a78bfa', // Violet
  '#fb7185'  // Rose
];

interface QuizTask {
  id: number;
  scenario: string;
  correctParadigm: 'supervised' | 'unsupervised' | 'rl';
  reason: string;
}

const QUIZ_TASKS: QuizTask[] = [
  {
    id: 1,
    scenario: 'Diagnosing whether a chest X-ray shows pneumonia based on 10,000 radiologist-labeled historical scans.',
    correctParadigm: 'supervised',
    reason: 'Each training instance has a target label (Pneumonia: Yes/No) provided by experts. This is Supervised Classification.'
  },
  {
    id: 2,
    scenario: 'Customer segmentation for a Spanish supermarket: grouping shoppers into behavioral tiers without pre-assigned customer types.',
    correctParadigm: 'unsupervised',
    reason: 'No predefined target labels exist. The algorithm discovers natural clusters based on purchase history similarity. This is Unsupervised Clustering.'
  },
  {
    id: 3,
    scenario: 'Training an autonomous drone to hover stably in windy conditions through trial, error, and stabilization penalties.',
    correctParadigm: 'rl',
    reason: 'The agent learns a policy through environmental interactions, state feedback, and scalar reward/penalty signals without direct input-output pairs. This is Reinforcement Learning.'
  },
  {
    id: 4,
    scenario: 'Predicting the sale price of a house in Albacete given square meters, number of bedrooms, and location coordinates.',
    correctParadigm: 'supervised',
    reason: 'The target variable (price in Euros) is a continuous ground-truth value. This is Supervised Regression.'
  }
];

export const MLParadigmsExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kmeans' | 'taxonomy' | 'quiz'>('kmeans');

  // ==========================================
  // K-MEANS CLUSTERING SIMULATOR
  // ==========================================
  const [kCount, setKCount] = useState<number>(3);
  const [stepNum, setStepNum] = useState<number>(0);
  const [isConverged, setIsConverged] = useState<boolean>(false);

  // Generate initial clustered 2D points
  const initialPoints: ClusterPoint[] = useMemo(() => {
    const pts: ClusterPoint[] = [];
    let id = 1;

    // Cluster 1 around (2.5, 2.5)
    for (let i = 0; i < 12; i++) {
      pts.push({
        id: id++,
        x: 2.5 + (Math.random() - 0.5) * 1.8,
        y: 2.5 + (Math.random() - 0.5) * 1.8,
        cluster: 0
      });
    }
    // Cluster 2 around (7.0, 3.0)
    for (let i = 0; i < 12; i++) {
      pts.push({
        id: id++,
        x: 7.0 + (Math.random() - 0.5) * 1.8,
        y: 3.0 + (Math.random() - 0.5) * 1.8,
        cluster: 0
      });
    }
    // Cluster 3 around (5.0, 7.2)
    for (let i = 0; i < 12; i++) {
      pts.push({
        id: id++,
        x: 5.0 + (Math.random() - 0.5) * 2.0,
        y: 7.2 + (Math.random() - 0.5) * 1.8,
        cluster: 0
      });
    }
    return pts;
  }, []);

  const [points, setPoints] = useState<ClusterPoint[]>(initialPoints);

  // Initial random centroid positions
  const getInitialCentroids = (k: number): Centroid[] => {
    return Array.from({ length: k }, (_, idx) => ({
      k: idx,
      x: 1.5 + Math.random() * 7.0,
      y: 1.5 + Math.random() * 7.0,
      color: CENTROID_COLORS[idx % CENTROID_COLORS.length]
    }));
  };

  const [centroids, setCentroids] = useState<Centroid[]>(() => getInitialCentroids(3));

  // Reset K-Means
  const resetKMeans = (k: number) => {
    setKCount(k);
    setCentroids(getInitialCentroids(k));
    setStepNum(0);
    setIsConverged(false);
  };

  // Perform single K-Means iteration:
  // Step A: Assignment Phase (Assign each point to nearest centroid)
  // Step B: Update Phase (Move centroid to center of mass of its cluster)
  const stepKMeans = () => {
    if (isConverged) return;

    // 1. Assign points to nearest centroid
    let hasChanged = false;
    const updatedPoints = points.map((p) => {
      let minDist = Infinity;
      let nearestCluster = p.cluster;

      centroids.forEach((c) => {
        const dist = Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2);
        if (dist < minDist) {
          minDist = dist;
          nearestCluster = c.k;
        }
      });

      if (nearestCluster !== p.cluster) {
        hasChanged = true;
      }
      return { ...p, cluster: nearestCluster };
    });

    // 2. Recompute centroid positions
    let maxCentroidShift = 0;
    const updatedCentroids = centroids.map((c) => {
      const assigned = updatedPoints.filter((p) => p.cluster === c.k);
      if (assigned.length === 0) return c;

      const sumX = assigned.reduce((acc, p) => acc + p.x, 0);
      const sumY = assigned.reduce((acc, p) => acc + p.y, 0);
      const newX = sumX / assigned.length;
      const newY = sumY / assigned.length;

      const shift = Math.sqrt(Math.pow(newX - c.x, 2) + Math.pow(newY - c.y, 2));
      if (shift > maxCentroidShift) maxCentroidShift = shift;

      return { ...c, x: newX, y: newY };
    });

    setPoints(updatedPoints);
    setCentroids(updatedCentroids);
    setStepNum((s) => s + 1);

    if (!hasChanged && maxCentroidShift < 0.01) {
      setIsConverged(true);
    }
  };

  // ==========================================
  // QUIZ STATE
  // ==========================================
  const [currentQuizIdx, setCurrentQuizIdx] = useState<number>(0);
  const [selectedParadigm, setSelectedParadigm] = useState<'supervised' | 'unsupervised' | 'rl' | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);

  const activeQuiz = QUIZ_TASKS[currentQuizIdx];

  const handleAnswerQuiz = (choice: 'supervised' | 'unsupervised' | 'rl') => {
    setSelectedParadigm(choice);
    if (choice === activeQuiz.correctParadigm) {
      setQuizScore((s) => s + 1);
    }
  };

  const nextQuiz = () => {
    setSelectedParadigm(null);
    setCurrentQuizIdx((idx) => (idx + 1) % QUIZ_TASKS.length);
  };

  return (
    <div className="visualizer-container">
      {/* Header */}
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Network size={20} style={{ color: 'var(--lab-accent-cyan)' }} />
            Machine Learning Paradigms & Unsupervised K-Means Clustering
          </div>
          <div className="visualizer-subtitle">
            Supervised, Unsupervised & Reinforcement Learning Taxonomy + Expectation-Maximization Dynamics (UCLM Slides 1–18)
          </div>
        </div>

        <div className="visualizer-controls">
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setActiveTab('kmeans')}
              className={`btn-tactile btn-sm ${activeTab === 'kmeans' ? 'btn-primary' : ''}`}
            >
              <Sparkles size={14} />
              <span>K-Means Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('taxonomy')}
              className={`btn-tactile btn-sm ${activeTab === 'taxonomy' ? 'btn-amber' : ''}`}
            >
              <Layers size={14} />
              <span>The 3 Paradigms</span>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`btn-tactile btn-sm ${activeTab === 'quiz' ? 'btn-lime' : ''}`}
            >
              <HelpCircle size={14} />
              <span>Exam Quiz</span>
            </button>
          </div>
        </div>
      </div>

      <div className="visualizer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* ========================================================================= */}
        {/* TAB 1: K-MEANS CLUSTERING SIMULATOR */}
        {/* ========================================================================= */}
        {activeTab === 'kmeans' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Control Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1rem',
                background: 'var(--lab-bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--lab-border-subtle)',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Number of Clusters $K$:
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[2, 3, 4, 5].map((kVal) => (
                    <button
                      key={kVal}
                      onClick={() => resetKMeans(kVal)}
                      className={`btn-tactile btn-xs ${kCount === kVal ? 'btn-cyan' : ''}`}
                    >
                      K = {kVal}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-amber font-mono">
                  Iteration: {stepNum}
                </span>
                {isConverged && (
                  <span className="badge badge-lime font-mono">
                    <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '3px' }} />
                    CONVERGED
                  </span>
                )}
                <button
                  onClick={stepKMeans}
                  disabled={isConverged}
                  className="btn-tactile btn-sm btn-emerald"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <SkipForward size={14} />
                  <span>Iterate (Assign & Center)</span>
                </button>
                <button onClick={() => resetKMeans(kCount)} className="btn-tactile btn-sm">
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* SVG 2D Scatter Canvas */}
            <div
              style={{
                background: 'var(--lab-bg-obsidian)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--lab-border-active)',
                padding: '1rem'
              }}
            >
              <div style={{ width: '100%', height: '280px' }}>
                <svg viewBox="0 0 600 280" style={{ width: '100%', height: '100%', userSelect: 'none' }}>
                  {/* Grid Lines */}
                  {Array.from({ length: 9 }).map((_, i) => (
                    <line
                      key={`gx-${i}`}
                      x1={40 + i * 65}
                      y1="20"
                      x2={40 + i * 65}
                      y2="260"
                      stroke="rgba(255,255,255,0.04)"
                    />
                  ))}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <line
                      key={`gy-${i}`}
                      x1="40"
                      y1={20 + i * 60}
                      x2="560"
                      y2={20 + i * 60}
                      stroke="rgba(255,255,255,0.04)"
                    />
                  ))}

                  {/* Connect Points to Assigned Centroids (Tethers) */}
                  {points.map((pt) => {
                    const c = centroids[pt.cluster];
                    if (!c) return null;
                    const px = 40 + (pt.x / 10) * 520;
                    const py = 260 - (pt.y / 10) * 240;
                    const cx = 40 + (c.x / 10) * 520;
                    const cy = 260 - (c.y / 10) * 240;

                    return (
                      <line
                        key={`tether-${pt.id}`}
                        x1={px}
                        y1={py}
                        x2={cx}
                        y2={cy}
                        stroke={c.color}
                        strokeWidth="0.8"
                        opacity="0.25"
                      />
                    );
                  })}

                  {/* Data Points */}
                  {points.map((pt) => {
                    const c = centroids[pt.cluster];
                    const px = 40 + (pt.x / 10) * 520;
                    const py = 260 - (pt.y / 10) * 240;

                    return (
                      <circle
                        key={pt.id}
                        cx={px}
                        cy={py}
                        r="4.5"
                        fill={c ? c.color : '#ffffff'}
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Centroids (Distinct Crosshairs) */}
                  {centroids.map((c) => {
                    const cx = 40 + (c.x / 10) * 520;
                    const cy = 260 - (c.y / 10) * 240;

                    return (
                      <g key={`c-${c.k}`}>
                        <circle cx={cx} cy={cy} r="14" fill="none" stroke={c.color} strokeWidth="2" opacity="0.8" />
                        <circle cx={cx} cy={cy} r="5" fill={c.color} />
                        <line x1={cx - 16} y1={cy} x2={cx + 16} y2={cy} stroke={c.color} strokeWidth="1.5" />
                        <line x1={cx} y1={cy - 16} x2={cx} y2={cy + 16} stroke={c.color} strokeWidth="1.5" />
                        <text
                          x={cx}
                          y={cy - 18}
                          fill={c.color}
                          fontSize="10"
                          textAnchor="middle"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          μ{c.k + 1}
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
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>
                  <strong>Unsupervised Clustering:</strong> The algorithm discovers natural clusters without any human supervisor or labels!
                </span>
                <span className="font-mono text-cyan-400">
                  μ_k = (1 / |C_k|) Σ x_i
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: THE 3 PARADIGMS TAXONOMY */}
        {/* ========================================================================= */}
        {activeTab === 'taxonomy' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem'
            }}
          >
            {/* Supervised Learning */}
            <div className="card" style={{ padding: '1.25rem', background: 'var(--lab-bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-cyan font-mono">PARADIGM 1</span>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                  Supervised Learning
                </h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                The training dataset consists of input-output pairs D = &#123;(x₁, y₁), ..., (xₙ, yₙ)&#125;. The goal is to learn a mapping function f: X → Y that accurately predicts target y on novel instances.
              </p>
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                • <strong>Classification:</strong> Discrete target (e.g. Spam vs Ham, Disease diagnosis).<br />
                • <strong>Regression:</strong> Continuous target (e.g. House price, temperature).
              </div>
            </div>

            {/* Unsupervised Learning */}
            <div className="card" style={{ padding: '1.25rem', background: 'var(--lab-bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-lime font-mono">PARADIGM 2</span>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                  Unsupervised Learning
                </h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                The training dataset consists solely of unlabeled inputs D = &#123;x₁, ..., xₙ&#125;. No ground-truth output is provided. The model discovers intrinsic structure, density, or clusters.
              </p>
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                • <strong>Clustering:</strong> Grouping similar points (e.g. K-Means, DBSCAN).<br />
                • <strong>Dimensionality Reduction:</strong> Compressing features (e.g. PCA, t-SNE).
              </div>
            </div>

            {/* Reinforcement Learning */}
            <div className="card" style={{ padding: '1.25rem', background: 'var(--lab-bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-amber font-mono">PARADIGM 3</span>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                  Reinforcement Learning
                </h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                No fixed dataset. An autonomous agent navigates an environment through actions a_t, transitioning states s_t → s_(t+1) and receiving reward signals r_t. The goal is to maximize cumulative return.
              </p>
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                • <strong>Exploration vs Exploitation:</strong> Discovering high-reward states.<br />
                • <strong>Temporal Credit Assignment:</strong> Delayed rewards (Q-Learning, SARSA).
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: EXAM SCENARIO QUIZ */}
        {/* ========================================================================= */}
        {activeTab === 'quiz' && (
          <div className="card" style={{ padding: '1.5rem', background: 'var(--lab-bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle size={18} className="text-amber-400" />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                  UCLM Exam Scenario {activeQuiz.id} of {QUIZ_TASKS.length}
                </h4>
              </div>
              <span className="badge badge-cyan font-mono">Score: {quizScore} / {QUIZ_TASKS.length}</span>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#f8fafc', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              &ldquo;{activeQuiz.scenario}&rdquo;
            </p>

            {/* Paradigm Selection Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              {(['supervised', 'unsupervised', 'rl'] as const).map((paradigm) => {
                const label =
                  paradigm === 'supervised'
                    ? 'Supervised Learning'
                    : paradigm === 'unsupervised'
                    ? 'Unsupervised Learning'
                    : 'Reinforcement Learning';
                const isSelected = selectedParadigm === paradigm;
                const isCorrect = selectedParadigm !== null && activeQuiz.correctParadigm === paradigm;

                return (
                  <button
                    key={paradigm}
                    onClick={() => handleAnswerQuiz(paradigm)}
                    disabled={selectedParadigm !== null}
                    className={`btn-tactile btn-sm ${
                      isSelected
                        ? isCorrect
                          ? 'btn-emerald'
                          : 'btn-rose'
                        : isCorrect
                        ? 'btn-emerald'
                        : ''
                    }`}
                    style={{ flex: 1, minWidth: '160px', padding: '0.6rem 0.8rem' }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next */}
            {selectedParadigm !== null && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '6px',
                  background:
                    selectedParadigm === activeQuiz.correctParadigm
                      ? 'rgba(198, 242, 119, 0.08)'
                      : 'rgba(251, 113, 133, 0.08)',
                  border: `1px solid ${
                    selectedParadigm === activeQuiz.correctParadigm ? 'var(--lab-accent-lime)' : '#fb7185'
                  }`
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: selectedParadigm === activeQuiz.correctParadigm ? 'var(--lab-accent-lime)' : '#fb7185', marginBottom: '0.25rem' }}>
                  {selectedParadigm === activeQuiz.correctParadigm ? 'Correct!' : 'Incorrect'}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {activeQuiz.reason}
                </div>
                <button
                  onClick={nextQuiz}
                  className="btn-tactile btn-xs btn-primary"
                  style={{ marginTop: '0.75rem' }}
                >
                  Next Scenario →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
