import React, { useState, useMemo } from 'react';
import {
  Network,
  RotateCcw,
  SkipForward,
  Play,
  CheckCircle2,
  XCircle,
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
  'var(--lab-accent-cyan)',
  'var(--lab-accent-lime)',
  'var(--lab-accent-amber)',
  '#c084fc', // purple
  '#f87171', // rose
];

interface QuizTask {
  id: number;
  title: string;
  description: string;
  correctParadigm: 'supervised' | 'unsupervised' | 'rl';
  explanation: string;
}

export const MLParadigmsExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kmeans' | 'taxonomy'>('kmeans');

  // K-Means State
  const [kCount, setKCount] = useState<number>(3);
  const [kStep, setKStep] = useState<number>(0);
  const [isConverged, setIsConverged] = useState<boolean>(false);

  // Generate initial clustered points
  const initialPoints: ClusterPoint[] = useMemo(() => {
    const pts: ClusterPoint[] = [];
    let id = 1;

    // Cluster 1 around (2.5, 2.5)
    for (let i = 0; i < 10; i++) {
      pts.push({
        id: id++,
        x: 2.5 + (Math.random() - 0.5) * 1.8,
        y: 2.5 + (Math.random() - 0.5) * 1.8,
        cluster: 0,
      });
    }
    // Cluster 2 around (7.0, 3.0)
    for (let i = 0; i < 10; i++) {
      pts.push({
        id: id++,
        x: 7.0 + (Math.random() - 0.5) * 1.8,
        y: 3.0 + (Math.random() - 0.5) * 1.8,
        cluster: 0,
      });
    }
    // Cluster 3 around (5.0, 7.5)
    for (let i = 0; i < 10; i++) {
      pts.push({
        id: id++,
        x: 5.0 + (Math.random() - 0.5) * 2.0,
        y: 7.5 + (Math.random() - 0.5) * 1.8,
        cluster: 0,
      });
    }
    return pts;
  }, []);

  const [points, setPoints] = useState<ClusterPoint[]>(initialPoints);

  // Initialize centroids spread across canvas
  const initialCentroids: Centroid[] = useMemo(() => {
    return [
      { k: 0, x: 2.0, y: 7.0, color: CENTROID_COLORS[0] },
      { k: 1, x: 5.0, y: 2.0, color: CENTROID_COLORS[1] },
      { k: 2, x: 8.0, y: 7.0, color: CENTROID_COLORS[2] },
      { k: 3, x: 5.0, y: 5.0, color: CENTROID_COLORS[3] },
      { k: 4, x: 1.5, y: 1.5, color: CENTROID_COLORS[4] },
    ].slice(0, kCount);
  }, [kCount]);

  const [centroids, setCentroids] = useState<Centroid[]>(initialCentroids);

  // Compute Inertia / Distortion: sum of squared distances to assigned centroid
  const inertia = useMemo(() => {
    return parseFloat(
      points
        .reduce((sum, pt) => {
          const c = centroids[pt.cluster];
          if (!c) return sum;
          const distSq = Math.pow(pt.x - c.x, 2) + Math.pow(pt.y - c.y, 2);
          return sum + distSq;
        }, 0)
        .toFixed(2)
    );
  }, [points, centroids]);

  // Execute 1 step of Lloyd's K-Means Algorithm
  const stepKMeans = () => {
    if (isConverged) return;

    // Step 1: Assignment Step (Assign each point to closest centroid)
    const newPoints = points.map((pt) => {
      let minDist = Infinity;
      let closestK = 0;
      centroids.forEach((c) => {
        const d = Math.sqrt(Math.pow(pt.x - c.x, 2) + Math.pow(pt.y - c.y, 2));
        if (d < minDist) {
          minDist = d;
          closestK = c.k;
        }
      });
      return { ...pt, cluster: closestK };
    });

    // Step 2: Update Step (Move centroids to mean of assigned points)
    let maxCentroidShift = 0;
    const newCentroids = centroids.map((c) => {
      const assigned = newPoints.filter((p) => p.cluster === c.k);
      if (assigned.length === 0) return c; // Avoid division by zero

      const meanX = assigned.reduce((acc, p) => acc + p.x, 0) / assigned.length;
      const meanY = assigned.reduce((acc, p) => acc + p.y, 0) / assigned.length;

      const shift = Math.sqrt(Math.pow(c.x - meanX, 2) + Math.pow(c.y - meanY, 2));
      if (shift > maxCentroidShift) maxCentroidShift = shift;

      return { ...c, x: parseFloat(meanX.toFixed(2)), y: parseFloat(meanY.toFixed(2)) };
    });

    setPoints(newPoints);
    setCentroids(newCentroids);
    setKStep((prev) => prev + 1);

    if (maxCentroidShift < 0.01) {
      setIsConverged(true);
    }
  };

  const runToConvergence = () => {
    let currentPts = [...points];
    let currentCentroids = [...centroids];

    for (let iter = 0; iter < 20; iter++) {
      // Assignment
      currentPts = currentPts.map((pt) => {
        let minDist = Infinity;
        let closestK = 0;
        currentCentroids.forEach((c) => {
          const d = Math.sqrt(Math.pow(pt.x - c.x, 2) + Math.pow(pt.y - c.y, 2));
          if (d < minDist) {
            minDist = d;
            closestK = c.k;
          }
        });
        return { ...pt, cluster: closestK };
      });

      // Update
      let maxShift = 0;
      currentCentroids = currentCentroids.map((c) => {
        const assigned = currentPts.filter((p) => p.cluster === c.k);
        if (assigned.length === 0) return c;
        const meanX = assigned.reduce((acc, p) => acc + p.x, 0) / assigned.length;
        const meanY = assigned.reduce((acc, p) => acc + p.y, 0) / assigned.length;
        const shift = Math.sqrt(Math.pow(c.x - meanX, 2) + Math.pow(c.y - meanY, 2));
        if (shift > maxShift) maxShift = shift;
        return { ...c, x: parseFloat(meanX.toFixed(2)), y: parseFloat(meanY.toFixed(2)) };
      });

      if (maxShift < 0.01) break;
    }

    setPoints(currentPts);
    setCentroids(currentCentroids);
    setKStep((prev) => prev + 5);
    setIsConverged(true);
  };

  const resetKMeans = () => {
    setPoints(initialPoints);
    setCentroids(initialCentroids);
    setKStep(0);
    setIsConverged(false);
  };

  // Add custom point on canvas click
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // ViewBox is 0 0 500 240, margin: left 40, right 460, top 20, bottom 220
    const coordX = parseFloat((((clickX - 40) / 420) * 10).toFixed(2));
    const coordY = parseFloat(((1 - (clickY - 20) / 200) * 10).toFixed(2));

    if (coordX >= 0 && coordX <= 10 && coordY >= 0 && coordY <= 10) {
      setPoints((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: coordX,
          y: coordY,
          cluster: 0,
        },
      ]);
      setIsConverged(false);
    }
  };

  // Taxonomy Quiz Tasks
  const quizTasks: QuizTask[] = [
    {
      id: 1,
      title: 'Email Spam Filter',
      description: 'Given 50,000 emails labeled by human users as "Spam" or "Ham", predict whether new incoming emails are spam.',
      correctParadigm: 'supervised',
      explanation: 'Supervised Learning: Each training instance is explicitly paired with a target label y in {Spam, Ham}.',
    },
    {
      id: 2,
      title: 'Customer Segmentation',
      description: 'Group 100,000 supermarket shoppers into 5 behavioral clusters based on purchasing history, without any predefined categories.',
      correctParadigm: 'unsupervised',
      explanation: 'Unsupervised Learning (Clustering): No target labels exist; discovers latent groupings based on feature similarity.',
    },
    {
      id: 3,
      title: 'Autonomous Drone Navigation',
      description: 'A drone learns to navigate dense mountain winds by receiving positive rewards (+10) for forward velocity and large penalties (-100) for collisions.',
      correctParadigm: 'rl',
      explanation: 'Reinforcement Learning: An active agent acts sequentially in an environment and learns an optimal policy through scalar reward feedback.',
    },
    {
      id: 4,
      title: 'House Price Estimation',
      description: 'Predict the continuous market price of a residential house given square meters, number of bedrooms, and neighborhood crime rate.',
      correctParadigm: 'supervised',
      explanation: 'Supervised Learning (Regression): Continuous numerical target labels (selling price in euros) are provided.',
    },
  ];

  const [activeQuizIdx, setActiveQuizIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [id: number]: 'supervised' | 'unsupervised' | 'rl' }>({});

  const currentTask = quizTasks[activeQuizIdx];
  const userAns = selectedAnswers[currentTask.id];

  return (
    <div className="visualizer-container">
      {/* Header */}
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Network size={20} style={{ color: 'var(--lab-accent-cyan)' }} />
            Machine Learning Paradigms & Unsupervised Clustering Lab (Lesson 9)
          </div>
          <div className="visualizer-subtitle">
            Supervised vs Unsupervised vs Reinforcement Learning & Lloyd's K-Means Clustering Algorithm
          </div>
        </div>

        <div className="visualizer-controls">
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('kmeans')}
              className={`btn-tactile btn-sm ${activeTab === 'kmeans' ? 'btn-primary' : ''}`}
            >
              <span>K-Means Lab (Unsupervised)</span>
            </button>
            <button
              onClick={() => setActiveTab('taxonomy')}
              className={`btn-tactile btn-sm ${activeTab === 'taxonomy' ? 'btn-primary' : ''}`}
            >
              <span>Paradigm Taxonomy</span>
            </button>
          </div>
        </div>
      </div>

      <div className="visualizer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {activeTab === 'kmeans' ? (
          <>
            {/* Control Strip */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--lab-bg-surface)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clusters (K):</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[2, 3, 4, 5].map((k) => (
                    <button
                      key={k}
                      onClick={() => {
                        setKCount(k);
                        setCentroids(
                          [
                            { k: 0, x: 2.0, y: 7.0, color: CENTROID_COLORS[0] },
                            { k: 1, x: 5.0, y: 2.0, color: CENTROID_COLORS[1] },
                            { k: 2, x: 8.0, y: 7.0, color: CENTROID_COLORS[2] },
                            { k: 3, x: 5.0, y: 5.0, color: CENTROID_COLORS[3] },
                            { k: 4, x: 1.5, y: 1.5, color: CENTROID_COLORS[4] },
                          ].slice(0, k)
                        );
                        setKStep(0);
                        setIsConverged(false);
                      }}
                      className={`btn-tactile btn-xs ${kCount === k ? 'btn-primary' : ''}`}
                    >
                      K = {k}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button onClick={stepKMeans} disabled={isConverged} className="btn-tactile btn-sm btn-emerald">
                  <SkipForward size={14} />
                  <span>Step Algorithm</span>
                </button>
                <button onClick={runToConvergence} disabled={isConverged} className="btn-tactile btn-sm">
                  <Play size={14} />
                  <span>To Convergence</span>
                </button>
                <button onClick={resetKMeans} className="btn-tactile btn-sm">
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              </div>

              {/* Distortion Telemetry */}
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Iteration: </span>
                  <strong className="font-mono text-cyan-400">{kStep}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Distortion J: </span>
                  <strong className="font-mono text-lime-400">{inertia}</strong>
                </div>
                {isConverged && (
                  <span className="badge badge-lime font-mono">CONVERGED</span>
                )}
              </div>
            </div>

            {/* 2D K-Means SVG Scatter Plot */}
            <div
              style={{
                background: 'var(--lab-bg-obsidian)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--lab-border-active)',
                padding: '1rem',
                position: 'relative',
              }}
            >
              <div style={{ width: '100%', height: '240px' }}>
                <svg
                  viewBox="0 0 500 240"
                  onClick={handleCanvasClick}
                  style={{ width: '100%', height: '100%', cursor: 'crosshair', userSelect: 'none' }}
                >
                  {/* Grid Lines */}
                  {[0, 2, 4, 6, 8, 10].map((v) => {
                    const py = 20 + ((10 - v) / 10) * 200;
                    const px = 40 + (v / 10) * 420;
                    return (
                      <g key={v}>
                        <line x1="40" y1={py} x2="460" y2={py} stroke="rgba(255,255,255,0.06)" />
                        <line x1={px} y1="20" x2={px} y2="220" stroke="rgba(255,255,255,0.06)" />
                      </g>
                    );
                  })}

                  {/* Connect points to their assigned centroid with faint lines */}
                  {points.map((pt) => {
                    const c = centroids[pt.cluster];
                    if (!c) return null;
                    const px = 40 + (pt.x / 10) * 420;
                    const py = 20 + ((10 - pt.y) / 10) * 200;
                    const cx = 40 + (c.x / 10) * 420;
                    const cy = 20 + ((10 - c.y) / 10) * 200;
                    return (
                      <line
                        key={`line-${pt.id}`}
                        x1={px}
                        y1={py}
                        x2={cx}
                        y2={cy}
                        stroke={c.color}
                        strokeWidth="0.8"
                        strokeOpacity="0.35"
                      />
                    );
                  })}

                  {/* Data Points */}
                  {points.map((pt) => {
                    const c = centroids[pt.cluster];
                    const px = 40 + (pt.x / 10) * 420;
                    const py = 20 + ((10 - pt.y) / 10) * 200;
                    return (
                      <circle
                        key={pt.id}
                        cx={px}
                        cy={py}
                        r="5"
                        fill={c ? c.color : '#94a3b8'}
                        stroke="#000"
                        strokeWidth="1.5"
                      />
                    );
                  })}

                  {/* Centroids */}
                  {centroids.map((c) => {
                    const cx = 40 + (c.x / 10) * 420;
                    const cy = 20 + ((10 - c.y) / 10) * 200;
                    return (
                      <g key={`cent-${c.k}`}>
                        {/* Outer pulsating ring */}
                        <circle
                          cx={cx}
                          cy={cy}
                          r="12"
                          fill="none"
                          stroke={c.color}
                          strokeWidth="2"
                          strokeDasharray="4 2"
                        />
                        {/* Centroid Crosshair */}
                        <circle cx={cx} cy={cy} r="6" fill={c.color} stroke="#000" strokeWidth="2" />
                        <line x1={cx - 10} y1={cy} x2={cx + 10} y2={cy} stroke={c.color} strokeWidth="2" />
                        <line x1={cx} y1={cy - 10} x2={cx} y2={cy + 10} stroke={c.color} strokeWidth="2" />
                        <text
                          x={cx + 14}
                          y={cy + 4}
                          fill={c.color}
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          μ_{c.k + 1}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
                Unsupervised Learning discovers latent patterns without ground-truth labels! Click anywhere to add custom points.
              </div>
            </div>
          </>
        ) : (
          /* Tab 2: Paradigm Taxonomy & Sorter */
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-cyan font-mono">PARADIGM TAXONOMY</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>
                  {currentTask.title}
                </h4>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {quizTasks.map((t, idx) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveQuizIdx(idx)}
                    className={`btn-tactile btn-xs ${activeQuizIdx === idx ? 'btn-primary' : ''}`}
                  >
                    Task {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              {currentTask.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {(
                [
                  { id: 'supervised', label: 'Supervised Learning', desc: 'Labeled pairs (x, y)' },
                  { id: 'unsupervised', label: 'Unsupervised Learning', desc: 'Unlabeled data p(x)' },
                  { id: 'rl', label: 'Reinforcement Learning', desc: 'Agent & scalar rewards' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedAnswers((prev) => ({ ...prev, [currentTask.id]: p.id }))}
                  className={`btn-tactile ${userAns === p.id ? 'btn-primary' : ''}`}
                  style={{
                    padding: '0.75rem',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                  }}
                >
                  <strong style={{ fontSize: '0.85rem' }}>{p.label}</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.desc}</span>
                </button>
              ))}
            </div>

            {userAns && (
              <div
                style={{
                  padding: '0.9rem 1.1rem',
                  borderRadius: 'var(--radius-md)',
                  background: userAns === currentTask.correctParadigm ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: `1px solid ${userAns === currentTask.correctParadigm ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.82rem',
                }}
              >
                {userAns === currentTask.correctParadigm ? (
                  <CheckCircle2 size={20} color="var(--accent-emerald)" />
                ) : (
                  <XCircle size={20} color="var(--accent-rose)" />
                )}
                <div>
                  <strong>{userAns === currentTask.correctParadigm ? 'Correct Paradigm!' : 'Incorrect Paradigm!'}</strong>
                  <p style={{ marginTop: '0.2rem', color: 'var(--text-secondary)' }}>{currentTask.explanation}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
