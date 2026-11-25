import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Cpu,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

export const AiboGaitEvolutionLab: React.FC = () => {
  // Gait parameters from Table 1 of UCLM paper (Alonso et al., 2005)
  // PG: Step period (40 to 80 ticks)
  // hF: Front body height (90 to 140 mm)
  // hB: Rear body height (90 to 140 mm)
  // hdF: Paw clearance front (10 to 45 mm)
  // hdB: Paw clearance rear (10 to 45 mm)
  const [pg, setPg] = useState<number>(55);
  const [hf, setHf] = useState<number>(115);
  const [hb, setHb] = useState<number>(115);
  const [hdf, setHdf] = useState<number>(25);
  const [hdb, setHdb] = useState<number>(24);

  // Animation & simulation state
  const [isWalking, setIsWalking] = useState<boolean>(true);
  const [gaitPhase, setGaitPhase] = useState<number>(0);

  // GA Auto-Evolve state
  const [gaGen, setGaGen] = useState<number>(0);
  const [isEvolving, setIsEvolving] = useState<boolean>(false);
  const [bestGait, setBestGait] = useState<{ speed: number; params: number[] }>({
    speed: 28.5,
    params: [55, 115, 115, 25, 24]
  });

  // Calculate speed and tier using UCLM Paper Kinematic Surrogate Formula
  const evaluateGait = useCallback((p: { pg: number; hf: number; hb: number; hdf: number; hdb: number }) => {
    // Stride frequency is inversely proportional to PG ticks (each tick ~ 8ms)
    const periodSec = p.pg * 0.008;
    const strideFreq = 1 / Math.max(0.2, periodSec);

    // Height divergence tilt penalty
    const tiltPenalty = Math.abs(p.hf - p.hb) * 0.35;

    // Optimal paw lift penalties (too low drags paw; too high wastes energy)
    const clearancePenalty = Math.abs(p.hdf - 25) * 0.32 + Math.abs(p.hdb - 24) * 0.32;

    // Base kinematic speed curve
    let rawSpeed = 17.5 * strideFreq - tiltPenalty - clearancePenalty;
    rawSpeed = Math.max(4.0, Math.min(36.0, rawSpeed));
    const speed = parseFloat(rawSpeed.toFixed(1));

    let tier: 'Buena' | 'Regular' | 'Mala';
    if (speed >= 28.0) tier = 'Buena';
    else if (speed >= 19.0) tier = 'Regular';
    else tier = 'Mala';

    return { speed, tier };
  }, []);

  const currentEval = useMemo(() => {
    return evaluateGait({ pg, hf, hb, hdf, hdb });
  }, [evaluateGait, pg, hf, hb, hdf, hdb]);

  // Walking kinematic animation tick
  useEffect(() => {
    let animId: ReturnType<typeof setInterval>;
    if (isWalking) {
      // Step speed depends on PG (lower PG = faster interval)
      const interval = Math.max(25, (pg * 7) / 16);
      animId = setInterval(() => {
        setGaitPhase((p) => (p + 14) % 360);
      }, interval);
    }
    return () => clearInterval(animId);
  }, [isWalking, pg, currentEval.speed]);

  // Step Genetic Algorithm generation
  const stepGAGeneration = useCallback(() => {
    setGaGen((g) => g + 1);

    // Mutate parameters towards optimal basin
    setPg((cur) => Math.max(40, Math.min(80, cur + (Math.random() > 0.6 ? (cur > 50 ? -2 : 1) : 0))));
    setHf((cur) => Math.max(90, Math.min(140, cur + (Math.random() - 0.48) * 3)));
    setHb((cur) => Math.max(90, Math.min(140, cur + (Math.random() - 0.48) * 3)));
    setHdf((cur) => Math.max(10, Math.min(45, cur + (Math.random() - 0.48) * 2)));
    setHdb((cur) => Math.max(10, Math.min(45, cur + (Math.random() - 0.48) * 2)));

    if (currentEval.speed > bestGait.speed) {
      setBestGait({
        speed: currentEval.speed,
        params: [pg, hf, hb, hdf, hdb]
      });
    }
  }, [bestGait.speed, currentEval.speed, hdb, hdf, hb, hf, pg]);

  // GA Auto-Evolve Loop
  useEffect(() => {
    let gaTimer: ReturnType<typeof setTimeout>;
    if (isEvolving && gaGen < 50) {
      gaTimer = setTimeout(() => {
        stepGAGeneration();
      }, 350);
    } else if (gaGen >= 50) {
      setIsEvolving(false);
    }
    return () => clearTimeout(gaTimer);
  }, [isEvolving, gaGen, stepGAGeneration]);

  // Robot leg kinematics angles based on phase
  const rad = (gaitPhase * Math.PI) / 180;
  const frontLegAngle = Math.sin(rad) * 26;
  const rearLegAngle = Math.sin(rad + Math.PI) * 26;
  const bodyPitch = (hf - hb) * 0.22; // Body tilt degrees

  return (
    <div className="visualizer-container">
      {/* Header */}
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Cpu size={20} style={{ color: 'var(--lab-accent-cyan)' }} />
            Sony AIBO Quadruped Robot Gait Evolution Lab (UCLM Paper)
          </div>
          <div className="visualizer-subtitle">
            5-Parameter Kinematic Chromosome, ML Surrogate Filter & Physical Hardware Optimization (Alonso et al., 2005)
          </div>
        </div>

        <div className="visualizer-controls">
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setIsWalking(!isWalking)}
              className={`btn-tactile btn-sm ${isWalking ? 'btn-primary' : ''}`}
            >
              {isWalking ? <Pause size={14} /> : <Play size={14} />}
              <span>{isWalking ? 'Pause Walk' : 'Start Walk'}</span>
            </button>
            <button
              onClick={() => setIsEvolving(!isEvolving)}
              className={`btn-tactile btn-sm ${isEvolving ? 'btn-rose' : 'btn-emerald'}`}
            >
              <Sparkles size={14} />
              <span>{isEvolving ? 'Pause GA' : `Auto-Evolve GA (Gen ${gaGen})`}</span>
            </button>
            <button
              onClick={() => {
                setPg(55);
                setHf(115);
                setHb(115);
                setHdf(25);
                setHdb(24);
                setGaGen(0);
                setIsEvolving(false);
              }}
              className="btn-tactile btn-sm"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="visualizer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Gait Parameter Sliders Deck (Chromosome Representation) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            background: 'var(--lab-bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--lab-border-subtle)'
          }}
        >
          {/* PG Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Period $PG$ (Ticks):</span>
              <strong className="font-mono text-cyan-400">{pg} ticks</strong>
            </div>
            <input
              type="range"
              min="40"
              max="80"
              value={pg}
              onChange={(e) => setPg(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--lab-accent-cyan)' }}
            />
            <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Lower = higher stride frequency</span>
          </div>

          {/* hF Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Front Height $h_F$:</span>
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
            <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Front shoulder elevation</span>
          </div>

          {/* hB Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Rear Height $h_B$:</span>
              <strong className="font-mono text-amber-400">{hb} mm</strong>
            </div>
            <input
              type="range"
              min="90"
              max="140"
              value={hb}
              onChange={(e) => setHb(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--lab-accent-amber)' }}
            />
            <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Rear pelvis elevation</span>
          </div>

          {/* hdF Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Clearance Front $hd_F$:</span>
              <strong className="font-mono text-rose-400">{hdf} mm</strong>
            </div>
            <input
              type="range"
              min="10"
              max="45"
              value={hdf}
              onChange={(e) => setHdf(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--accent-rose)' }}
            />
            <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Front paw ground lift</span>
          </div>

          {/* hdB Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Clearance Rear $hd_B$:</span>
              <strong className="font-mono text-indigo-400">{hdb} mm</strong>
            </div>
            <input
              type="range"
              min="10"
              max="45"
              value={hdb}
              onChange={(e) => setHdb(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: '#a78bfa' }}
            />
            <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Rear paw ground lift</span>
          </div>
        </div>

        {/* Kinematic Robot & Track Simulator Canvas */}
        <div
          style={{
            background: 'var(--lab-bg-obsidian)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--lab-border-active)',
            padding: '1.25rem',
            position: 'relative'
          }}
        >
          {/* Telemetry Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge badge-cyan font-mono" style={{ fontSize: '0.85rem' }}>
                Forward Speed: <strong className="text-lime-400">{currentEval.speed} cm/s</strong>
              </span>

              <span
                className={`badge ${
                  currentEval.tier === 'Buena'
                    ? 'badge-lime'
                    : currentEval.tier === 'Regular'
                    ? 'badge-amber'
                    : 'badge-rose'
                } font-mono`}
              >
                Surrogate Tier: {currentEval.tier.toUpperCase()}
              </span>

              {currentEval.tier === 'Mala' ? (
                <span className="badge badge-rose font-mono" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ShieldAlert size={12} />
                  PHYSICAL TEST ABORTED (Hardware Saved)
                </span>
              ) : (
                <span className="badge badge-lime font-mono" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ShieldCheck size={12} />
                  PASSED TO ROBOT CARPET
                </span>
              )}
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Best Speed Discovered: <strong className="font-mono text-lime-400">{bestGait.speed} cm/s</strong>
            </div>
          </div>

          {/* SVG Articulated AIBO Robot */}
          <div style={{ width: '100%', height: '220px', position: 'relative' }}>
            <svg viewBox="0 0 700 220" style={{ width: '100%', height: '100%', userSelect: 'none' }}>
              {/* Floor / Track Surface (UCLM Green Carpet) */}
              <line x1="50" y1="180" x2="650" y2="180" stroke="#10b981" strokeWidth="3" />
              {/* Grid markings along the green carpet */}
              {Array.from({ length: 13 }).map((_, i) => (
                <line
                  key={i}
                  x1={50 + i * 50}
                  y1="180"
                  x2={50 + i * 50}
                  y2="190"
                  stroke="rgba(16, 185, 129, 0.4)"
                  strokeWidth="1.5"
                />
              ))}

              {/* Robot Group (Centered around x=350, y=140) */}
              <g transform={`translate(350, 140) rotate(${bodyPitch})`}>
                {/* Rear Leg Pair */}
                <g transform="translate(-55, 0)">
                  <line
                    x1="0"
                    y1="0"
                    x2={-Math.sin((rearLegAngle * Math.PI) / 180) * 35}
                    y2={38}
                    stroke="#64748b"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  {/* Paw */}
                  <circle
                    cx={-Math.sin((rearLegAngle * Math.PI) / 180) * 35}
                    cy={38}
                    r="5"
                    fill="#38bdf8"
                  />
                </g>

                {/* Main Body Chassis (Sony AIBO Metallic Torso) */}
                <rect
                  x="-75"
                  y="-18"
                  width="130"
                  height="34"
                  rx="14"
                  fill="url(#aiboGrad)"
                  stroke="#94a3b8"
                  strokeWidth="2.5"
                />

                {/* Head Module */}
                <g transform="translate(65, -12)">
                  <ellipse cx="12" cy="0" rx="18" ry="12" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
                  {/* LED Visor */}
                  <line x1="16" y1="-2" x2="26" y2="-2" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                  {/* Ear */}
                  <line x1="2" y1="-8" x2="-8" y2="-18" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
                </g>

                {/* Tail Module */}
                <line x1="-75" y1="-6" x2="-95" y2="-16" stroke="#475569" strokeWidth="3" strokeLinecap="round" />

                {/* Front Leg Pair */}
                <g transform="translate(45, 0)">
                  <line
                    x1="0"
                    y1="0"
                    x2={Math.sin((frontLegAngle * Math.PI) / 180) * 35}
                    y2={38}
                    stroke="#94a3b8"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  <circle
                    cx={Math.sin((frontLegAngle * Math.PI) / 180) * 35}
                    cy={38}
                    r="5"
                    fill="#38bdf8"
                  />
                </g>

                {/* Shoulder and Hip Joint Bolts */}
                <circle cx="45" cy="0" r="5" fill="#38bdf8" />
                <circle cx="-55" cy="0" r="5" fill="#38bdf8" />
              </g>

              {/* Gradient Defs */}
              <defs>
                <linearGradient id="aiboGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f1f5f9" />
                  <stop offset="50%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Academic Insight Deck (Two-Tier Evaluation) */}
        <div className="card" style={{ padding: '1.25rem', background: 'var(--lab-bg-surface)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--lab-accent-amber)', marginBottom: '0.4rem' }}>
            The Two-Tier Surrogate Evaluation Strategy (UCLM Research Paper)
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Evaluating a gait on physical robot hardware takes ~30 seconds, drains battery, and wears out servo motors. Running 50 individuals across 50 generations would require 2,500 real robot runs (~21 hours of continuous motor stress!).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--lab-accent-cyan)' }}>
                Tier 1: ML Classification Model (Instant)
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                A pre-trained ML classifier screens candidates into <em>Buena</em>, <em>Regular</em>, or <em>Mala</em>. Gaits predicted as <em>Mala</em> are discarded immediately with 0 physical robot wear.
              </p>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--lab-accent-lime)' }}>
                Tier 2: Physical Stopwatch Run (Selective)
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Only the top 10–20% promising gaits (<em>Buena</em> / <em>Regular</em>) are flashed to the robot dog to measure true ground velocity on the official green track.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
