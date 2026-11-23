import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

export const AiboGaitEvolutionLab: React.FC = () => {
  // Gait parameters from Table 1 of UCLM paper (Alonso et al., 2005)
  // PG: Step period (40 to 80 ticks)
  // hF: Front body height (90 to 140 mm)
  // hB: Rear body height (90 to 140 mm)
  // hdF: Paw clearance front (10 to 45 mm)
  // hdB: Paw clearance rear (10 to 45 mm)
  const [pg, setPg] = useState<number>(60);
  const [hf, setHf] = useState<number>(120);
  const [hb, setHb] = useState<number>(118);
  const [hdf, setHdf] = useState<number>(26);
  const [hdb, setHdb] = useState<number>(24);

  // Animation & simulation state
  const [isWalking, setIsWalking] = useState<boolean>(true);
  const [gaitPhase, setGaitPhase] = useState<number>(0);
  const [trackPosition, setTrackPosition] = useState<number>(0);
  const [evaluatedResult, setEvaluatedResult] = useState<{
    surrogateSpeed: number;
    tier: 'Buena' | 'Regular' | 'Mala';
    evaluatedOnPhysicalRobot: boolean;
    reason: string;
    physicalSpeed?: number;
  } | null>(null);

  // GA Auto-Evolve state
  const [gaGeneration, setGaGeneration] = useState<number>(0);
  const [isEvolving, setIsEvolving] = useState<boolean>(false);
  const [bestGaitFound, setBestGaitFound] = useState<{ speed: number; params: number[] }>({
    speed: 28.4,
    params: [60, 120, 118, 26, 24],
  });

  // Animate robot legs walking
  useEffect(() => {
    let animId: ReturnType<typeof setInterval>;
    if (isWalking) {
      const interval = Math.max(25, (pg * 8) / 16);
      animId = setInterval(() => {
        setGaitPhase((p) => (p + 12) % 360);
        setTrackPosition((pos) => (pos + 1.2) % 100);
      }, interval);
    }
    return () => clearInterval(animId);
  }, [isWalking, pg]);

  // Compute ML Surrogate evaluation
  const evaluateGaitModel = (p: { pg: number; hf: number; hb: number; hdf: number; hdb: number }) => {
    // Stride frequency is inversely proportional to PG
    const periodSec = p.pg * 0.008;
    const strideFreq = 1 / Math.max(0.2, periodSec);

    // Tilt penalty when front and rear heights diverge
    const tiltPenalty = Math.abs(p.hf - p.hb) * 0.35;

    // Clearance penalty when paws drag or lift unnecessarily high
    const clearancePenalty =
      Math.abs(p.hdf - 26) * 0.3 + Math.abs(p.hdb - 24) * 0.3;

    // Base physics speed curve
    let rawSpeed = 16.5 * strideFreq - tiltPenalty - clearancePenalty;
    rawSpeed = Math.max(4.0, Math.min(35.5, rawSpeed));
    const surrogateSpeed = parseFloat(rawSpeed.toFixed(1));

    let tier: 'Buena' | 'Regular' | 'Mala';
    if (surrogateSpeed >= 28.0) tier = 'Buena';
    else if (surrogateSpeed >= 20.0) tier = 'Regular';
    else tier = 'Mala';

    return { surrogateSpeed, tier };
  };

  const handleRunEvaluation = () => {
    const { surrogateSpeed, tier } = evaluateGaitModel({ pg, hf, hb, hdf, hdb });
    const roll = Math.random();
    let willEvaluate = false;
    let reason = '';

    if (tier === 'Buena' && roll <= 0.90) {
      willEvaluate = true;
      reason = `ML Surrogate rated BUENA (${surrogateSpeed} cm/s). Roll ${roll.toFixed(2)} <= α₁ (0.90) → Physical Track Trial Approved!`;
    } else if (tier === 'Regular' && roll <= 0.45) {
      willEvaluate = true;
      reason = `ML Surrogate rated REGULAR (${surrogateSpeed} cm/s). Roll ${roll.toFixed(2)} <= α₂ (0.45) → Physical Trial Approved.`;
    } else if (tier === 'Mala' && roll <= 0.08) {
      willEvaluate = true;
      reason = `ML Surrogate rated MALA (${surrogateSpeed} cm/s). Low-probability exploratory physical evaluation (roll ${roll.toFixed(2)} <= α₃ (0.08)).`;
    } else {
      willEvaluate = false;
      reason = `FILTERED OUT BY ML SURROGATE! Candidate predicted as ${tier} (${surrogateSpeed} cm/s). Physical run avoided, saving robot motor wear.`;
    }

    const noise = willEvaluate ? (Math.random() - 0.5) * 1.8 : 0;
    const physicalSpeed = willEvaluate ? parseFloat((surrogateSpeed + noise).toFixed(1)) : undefined;

    setEvaluatedResult({
      surrogateSpeed,
      tier,
      evaluatedOnPhysicalRobot: willEvaluate,
      reason,
      physicalSpeed,
    });
  };

  // Run a quick 5-generation GA optimization
  const runQuickGA = () => {
    setIsEvolving(true);
    let bestSpeed = bestGaitFound.speed;
    let bestParams = [...bestGaitFound.params];

    for (let gen = 1; gen <= 10; gen++) {
      // Perturb parameters around optimal region
      const testPg = Math.min(75, Math.max(45, Math.round(58 + (Math.random() - 0.5) * 12)));
      const testHf = Math.min(135, Math.max(105, Math.round(120 + (Math.random() - 0.5) * 10)));
      const testHb = Math.min(135, Math.max(105, Math.round(testHf + (Math.random() - 0.5) * 6)));
      const testHdf = Math.min(35, Math.max(18, Math.round(26 + (Math.random() - 0.5) * 6)));
      const testHdb = Math.min(35, Math.max(18, Math.round(24 + (Math.random() - 0.5) * 6)));

      const { surrogateSpeed } = evaluateGaitModel({
        pg: testPg,
        hf: testHf,
        hb: testHb,
        hdf: testHdf,
        hdb: testHdb,
      });

      if (surrogateSpeed > bestSpeed) {
        bestSpeed = surrogateSpeed;
        bestParams = [testPg, testHf, testHb, testHdf, testHdb];
      }
    }

    setGaGeneration((prev) => prev + 10);
    setBestGaitFound({ speed: bestSpeed, params: bestParams });
    setPg(bestParams[0]);
    setHf(bestParams[1]);
    setHb(bestParams[2]);
    setHdf(bestParams[3]);
    setHdb(bestParams[4]);
    setIsEvolving(false);
  };

  const currentEvaluation = evaluateGaitModel({ pg, hf, hb, hdf, hdb });

  // Leg joint angles for SVG quadruped animation
  const rad = (gaitPhase * Math.PI) / 180;
  const frontLegAngle = Math.sin(rad) * 25;
  const rearLegAngle = Math.sin(rad + Math.PI) * 25;
  const bodyTiltAngle = ((hf - hb) / 50) * 12; // Incline tilt in degrees

  return (
    <div className="visualizer-container">
      {/* Header */}
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Cpu size={20} style={{ color: 'var(--lab-accent-amber)' }} />
            Sony AIBO Quadruped Locomotion Optimization (UCLM Research Paper)
          </div>
          <div className="visualizer-subtitle">
            Alonso et al. (2005): Genetic Algorithms Combined with Machine Learning Surrogate Fitness Filtering
          </div>
        </div>

        <div className="visualizer-controls">
          <button onClick={() => setIsWalking(!isWalking)} className="btn-tactile btn-sm">
            {isWalking ? <Pause size={14} /> : <Play size={14} />}
            <span>{isWalking ? 'Pause Motion' : 'Walk'}</span>
          </button>
          <button onClick={handleRunEvaluation} className="btn-tactile btn-sm btn-primary">
            <ShieldCheck size={14} />
            <span>Evaluate Gait</span>
          </button>
          <button onClick={runQuickGA} disabled={isEvolving} className="btn-tactile btn-sm btn-emerald">
            <Sparkles size={14} />
            <span>Evolve with GA {gaGeneration > 0 ? `(Gen ${gaGeneration})` : '(+10 Gen)'}</span>
          </button>
          <button
            onClick={() => {
              setPg(60);
              setHf(120);
              setHb(118);
              setHdf(26);
              setHdb(24);
              setEvaluatedResult(null);
            }}
            className="btn-tactile btn-sm"
          >
            <RotateCcw size={14} />
            <span>Default</span>
          </button>
        </div>
      </div>

      <div className="visualizer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Quadruped SVG Simulation Canvas & Virtual 10m Track */}
        <div
          style={{
            background: 'var(--lab-bg-obsidian)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--lab-border-active)',
            padding: '1.25rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top telemetry strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-amber font-mono">Sony AIBO ERS-7</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Chromosome: [PG={pg}, hF={hf}, hB={hb}, hdF={hdf}, hdB={hdb}]
              </span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Predicted Speed: </span>
                <strong className="font-mono" style={{ color: 'var(--lab-accent-lime)' }}>
                  {currentEvaluation.surrogateSpeed} cm/s
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>ML Tier: </span>
                <span
                  className="badge font-mono"
                  style={{
                    background:
                      currentEvaluation.tier === 'Buena'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : currentEvaluation.tier === 'Regular'
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(239, 68, 68, 0.2)',
                    color:
                      currentEvaluation.tier === 'Buena'
                        ? 'var(--accent-emerald)'
                        : currentEvaluation.tier === 'Regular'
                        ? 'var(--accent-amber)'
                        : 'var(--accent-rose)',
                  }}
                >
                  {currentEvaluation.tier}
                </span>
              </div>
            </div>
          </div>

          {/* Articulated Quadruped SVG Robot Animation */}
          <div style={{ width: '100%', height: '170px', position: 'relative' }}>
            <svg viewBox="0 0 600 170" style={{ width: '100%', height: '100%' }}>
              {/* Floor grid line with 10cm tick marks */}
              <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" />
              {Array.from({ length: 15 }, (_, i) => {
                const tickX = ((i * 40 + trackPosition * 4) % 600);
                return (
                  <g key={i}>
                    <line x1={tickX} y1="140" x2={tickX} y2="148" stroke="rgba(255, 255, 255, 0.3)" />
                    <text x={tickX - 8} y="160" fill="var(--text-muted)" fontSize="8" fontFamily="monospace">
                      {(i * 10)}cm
                    </text>
                  </g>
                );
              })}

              {/* Robot Quadruped Center Group */}
              <g transform={`translate(280, ${100 - (hf - 120) * 0.4}) rotate(${bodyTiltAngle}, 0, 0)`}>
                {/* Rear Leg Pair (darker shade for depth) */}
                <g transform="translate(-45, 10)">
                  <line
                    x1="0"
                    y1="0"
                    x2={Math.sin(((rearLegAngle + 180) * Math.PI) / 180) * 28}
                    y2={30}
                    stroke="#475569"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <circle cx="0" cy="0" r="4" fill="#64748b" />
                </g>

                {/* Front Leg Pair (darker shade for depth) */}
                <g transform="translate(45, 10)">
                  <line
                    x1="0"
                    y1="0"
                    x2={Math.sin(((frontLegAngle + 180) * Math.PI) / 180) * 28}
                    y2={30}
                    stroke="#475569"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <circle cx="0" cy="0" r="4" fill="#64748b" />
                </g>

                {/* Robot Main Body Torso */}
                <rect
                  x="-55"
                  y="-12"
                  width="110"
                  height="26"
                  rx="8"
                  fill="#1e293b"
                  stroke="var(--lab-accent-cyan)"
                  strokeWidth="2"
                />

                {/* Head & Neck */}
                <path d="M 45 -8 L 65 -25 L 85 -20 L 75 -5 Z" fill="#334155" stroke="var(--lab-accent-cyan)" strokeWidth="1.5" />
                {/* Glowing LED Eye */}
                <circle cx="76" cy="-18" r="3" fill="var(--lab-accent-lime)" />

                {/* Front Leg (Forefront) */}
                <g transform="translate(40, 10)">
                  <line
                    x1="0"
                    y1="0"
                    x2={Math.sin((frontLegAngle * Math.PI) / 180) * 32}
                    y2={30 + (hdf - 26) * 0.3}
                    stroke="var(--lab-accent-cyan)"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <circle cx="0" cy="0" r="5" fill="#38bdf8" />
                  <ellipse
                    cx={Math.sin((frontLegAngle * Math.PI) / 180) * 32}
                    cy={30 + (hdf - 26) * 0.3}
                    rx="6"
                    ry="3"
                    fill="var(--lab-accent-lime)"
                  />
                </g>

                {/* Rear Leg (Forefront) */}
                <g transform="translate(-40, 10)">
                  <line
                    x1="0"
                    y1="0"
                    x2={Math.sin((rearLegAngle * Math.PI) / 180) * 32}
                    y2={30 + (hdb - 24) * 0.3}
                    stroke="var(--lab-accent-cyan)"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <circle cx="0" cy="0" r="5" fill="#38bdf8" />
                  <ellipse
                    cx={Math.sin((rearLegAngle * Math.PI) / 180) * 32}
                    cy={30 + (hdb - 24) * 0.3}
                    rx="6"
                    ry="3"
                    fill="var(--lab-accent-lime)"
                  />
                </g>
              </g>
            </svg>
          </div>
        </div>

        {/* 5-Parameter Interactive Chromosome Controls */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            background: 'var(--lab-bg-surface)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* PG */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>PG (Step Period):</span>
              <strong className="font-mono text-cyan-400">{pg} ticks ({(pg * 0.008).toFixed(2)}s)</strong>
            </div>
            <input
              type="range"
              min="40"
              max="80"
              value={pg}
              onChange={(e) => setPg(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--lab-accent-cyan)' }}
            />
          </div>

          {/* hF */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>hF (Front Height):</span>
              <strong className="font-mono text-lime-400">{hf} mm</strong>
            </div>
            <input
              type="range"
              min="90"
              max="140"
              value={hf}
              onChange={(e) => setHf(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--lab-accent-lime)' }}
            />
          </div>

          {/* hB */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>hB (Rear Height):</span>
              <strong className="font-mono text-lime-400">{hb} mm</strong>
            </div>
            <input
              type="range"
              min="90"
              max="140"
              value={hb}
              onChange={(e) => setHb(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--lab-accent-lime)' }}
            />
          </div>

          {/* hdF */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>hdF (Front Paw Lift):</span>
              <strong className="font-mono text-amber-400">{hdf} mm</strong>
            </div>
            <input
              type="range"
              min="10"
              max="45"
              value={hdf}
              onChange={(e) => setHdf(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--lab-accent-amber)' }}
            />
          </div>

          {/* hdB */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>hdB (Rear Paw Lift):</span>
              <strong className="font-mono text-amber-400">{hdb} mm</strong>
            </div>
            <input
              type="range"
              min="10"
              max="45"
              value={hdb}
              onChange={(e) => setHdb(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--lab-accent-amber)' }}
            />
          </div>
        </div>

        {/* Evaluation Result / Surrogate Filter Card */}
        {evaluatedResult && (
          <div
            className="card"
            style={{
              padding: '1.25rem',
              border: evaluatedResult.evaluatedOnPhysicalRobot
                ? '1px solid var(--lab-accent-lime)'
                : '1px solid var(--accent-rose)',
              background: evaluatedResult.evaluatedOnPhysicalRobot
                ? 'rgba(16, 185, 129, 0.05)'
                : 'rgba(239, 68, 68, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {evaluatedResult.evaluatedOnPhysicalRobot ? (
                <ShieldCheck size={18} color="var(--lab-accent-lime)" />
              ) : (
                <ShieldAlert size={18} color="var(--accent-rose)" />
              )}
              <strong style={{ fontSize: '0.85rem' }}>
                {evaluatedResult.evaluatedOnPhysicalRobot
                  ? 'Physical Track Evaluation Approved'
                  : 'Filtered Out by ML Surrogate Filter (Saved Hardware Wear)'}
              </strong>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              {evaluatedResult.reason}
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>ML Surrogate Speed: </span>
                <strong className="font-mono text-cyan-400">{evaluatedResult.surrogateSpeed} cm/s</strong>
              </div>
              {evaluatedResult.physicalSpeed && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Robot Optical Sensor Speed: </span>
                  <strong className="font-mono text-emerald-400">{evaluatedResult.physicalSpeed} cm/s</strong>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
