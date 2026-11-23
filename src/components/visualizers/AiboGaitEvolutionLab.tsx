import React, { useState, useEffect } from 'react';

export const AiboGaitEvolutionLab: React.FC = () => {
  // Gait parameters from Table 1 of UCLM paper (Alonso et al.)
  const [pg, setPg] = useState<number>(65); // Step period in 0.008s units (65 = 0.52s)
  const [hf, setHf] = useState<number>(120); // Front body height (mm)
  const [hb, setHb] = useState<number>(115); // Rear body height (mm)
  const [hdf, setHdf] = useState<number>(25); // Paw clearance front (mm)
  const [hdb, setHdb] = useState<number>(20); // Paw clearance rear (mm)

  // Simulation animation state
  const [isWalking, setIsWalking] = useState<boolean>(true);
  const [legPhase, setLegPhase] = useState<number>(0);
  const [testResult, setTestResult] = useState<{
    distance: number;
    time: number;
    realSpeed: number;
    surrogateSpeed: number;
    tier: 'Buena' | 'Regular' | 'Mala';
    evaluatedOnRobot: boolean;
    reason: string;
  } | null>(null);

  // Animate quadruped walking legs
  useEffect(() => {
    if (isWalking) {
      const stepInterval = (pg * 8) / 20; // Animation speed proportional to step period PG
      const timer = setInterval(() => {
        setLegPhase((p) => (p + 1) % 360);
      }, Math.max(20, stepInterval));
      return () => clearInterval(timer);
    }
  }, [isWalking, pg]);

  // Model-based surrogate speed calculation (ML regression surrogate)
  const computeSurrogate = () => {
    // Ground physics surrogate formula approximating the empirical gait dynamics:
    // optimal PG is around 55-65; balanced body height hf ~ hb; clearance ~ 25mm
    const periodSec = pg * 0.008;
    const strideFreq = 1 / periodSec;
    const bodyTilt = Math.abs(hf - hb);
    const clearancePenalty = Math.max(0, 15 - hdf) * 0.3 + Math.max(0, 15 - hdb) * 0.3;

    let baseSpeed = 16 * strideFreq - bodyTilt * 0.3 - clearancePenalty;
    baseSpeed = Math.max(4.0, Math.min(36.0, baseSpeed));

    let tier: 'Buena' | 'Regular' | 'Mala';
    if (baseSpeed >= 28) tier = 'Buena';
    else if (baseSpeed >= 20) tier = 'Regular';
    else tier = 'Mala';

    return { surrogateSpeed: parseFloat(baseSpeed.toFixed(1)), tier };
  };

  const handleRunEvaluation = () => {
    const { surrogateSpeed, tier } = computeSurrogate();

    // UCLM Probabilistic Gate: α1 = 0.9, α2 = 0.5, α3 = 0.1
    const roll = Math.random();
    let willEvaluate = false;
    let reason = '';

    if (tier === 'Buena' && roll <= 0.9) {
      willEvaluate = true;
      reason = `ML Surrogate rated BUENA (${surrogateSpeed} cm/s). Roll ${roll.toFixed(2)} <= α₁ (0.90) → Physical Track Test Executed!`;
    } else if (tier === 'Regular' && roll <= 0.45) {
      willEvaluate = true;
      reason = `ML Surrogate rated REGULAR (${surrogateSpeed} cm/s). Roll ${roll.toFixed(2)} <= α₂ (0.45) → Physical Track Test Executed!`;
    } else if (tier === 'Mala' && roll <= 0.08) {
      willEvaluate = true;
      reason = `ML Surrogate rated MALA (${surrogateSpeed} cm/s). Low probability exploratory evaluation (roll ${roll.toFixed(2)} <= α₃ (0.08)).`;
    } else {
      willEvaluate = false;
      reason = `FILTERED OUT BY ML SURROGATE! Candidate predicted as ${tier} (${surrogateSpeed} cm/s). Physical run avoided, saving 30s robot motor wear.`;
    }

    // If evaluated on robot, add physical noise
    let realSpeed = surrogateSpeed;
    let distance = 0;
    if (willEvaluate) {
      const noise = (Math.random() - 0.5) * 2.4; // Carpet sensor noise
      realSpeed = parseFloat(Math.max(2.0, surrogateSpeed + noise).toFixed(1));
      distance = parseFloat((realSpeed * 30).toFixed(1)); // 30s run
    } else {
      distance = parseFloat((surrogateSpeed * 30).toFixed(1));
    }

    setTestResult({
      distance,
      time: 30,
      realSpeed,
      surrogateSpeed,
      tier,
      evaluatedOnRobot: willEvaluate,
      reason,
    });
  };

  const { surrogateSpeed, tier } = computeSurrogate();

  // Leg joint angles based on sine phases
  const rad = (legPhase * Math.PI) / 180;
  const legFL = Math.sin(rad) * 24;
  const legFR = Math.sin(rad + Math.PI) * 24;
  const legRL = Math.sin(rad + Math.PI * 0.5) * 22;
  const legRR = Math.sin(rad + Math.PI * 1.5) * 22;

  return (
    <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Published UCLM Research Laboratory
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Sony AIBO Quadruped Robot Locomotion Optimization
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Alonso, Gámez, García-Varea, Martínez (UCLM): GA parameter optimization with Machine Learning surrogate filtering.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunEvaluation}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
          >
            Evaluate Candidate
          </button>
          <button
            onClick={() => setIsWalking(!isWalking)}
            className="px-3.5 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
          >
            {isWalking ? 'Pause Gait' : 'Animate Gait'}
          </button>
        </div>
      </div>

      {/* Robot Animated Canvas & Live Kinematics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Robot Kinematics SVG */}
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="text-xs text-slate-400 mb-2 w-full flex justify-between font-mono">
            <span>AIBO Kinematic Gait Profile</span>
            <span className="text-cyan-400">Step Period: {(pg * 0.008).toFixed(3)}s</span>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <svg viewBox="0 0 320 180" className="w-full max-w-[280px]">
              {/* Floor line */}
              <line x1="20" y1="160" x2="300" y2="160" stroke="#334155" strokeWidth="2" />
              {/* Carpet surface dots */}
              <line x1="20" y1="162" x2="300" y2="162" stroke="#475569" strokeDasharray="3,4" strokeWidth="1" />

              {/* Back Legs (Darker) */}
              {/* Rear Right Leg */}
              <line x1="80" y1={160 - hb} x2={80 + legRR * 0.8} y2="160" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
              {/* Front Right Leg */}
              <line x1="220" y1={160 - hf} x2={220 + legFR * 0.8} y2="160" stroke="#475569" strokeWidth="6" strokeLinecap="round" />

              {/* Robot Body Torso */}
              <polygon
                points={`60,${160 - hb + 10} 240,${160 - hf + 10} 230,${160 - hf - 20} 70,${160 - hb - 20}`}
                fill="#1e293b"
                stroke="#38bdf8"
                strokeWidth="2.5"
                rx="8"
              />

              {/* Robot Head */}
              <circle cx="255" cy={160 - hf - 15} r="16" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
              {/* Eye sensor visor */}
              <rect x="258" y={160 - hf - 20} width="10" height="6" rx="2" fill="#06b6d4" className="animate-pulse" />

              {/* Robot Tail */}
              <line x1="60" y1={160 - hb - 10} x2="40" y2={160 - hb - 30} stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />

              {/* Front Legs (Lighter / Foreground) */}
              {/* Rear Left Leg */}
              <line x1="85" y1={160 - hb} x2={85 + legRL * 0.8} y2="160" stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" />
              {/* Front Left Leg */}
              <line x1="225" y1={160 - hf} x2={225 + legFL * 0.8} y2="160" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>

          <div className="w-full flex justify-between text-[11px] font-mono text-slate-500 mt-2">
            <span>Rear Height: {hb}mm</span>
            <span>Front Height: {hf}mm</span>
          </div>
        </div>

        {/* Surrogate Prediction & Evaluation Box */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-300">ML Surrogate Estimation</span>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                  tier === 'Buena'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : tier === 'Regular'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {tier.toUpperCase()} TIER
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-white">{surrogateSpeed}</span>
              <span className="text-xs text-slate-400 font-mono">cm / s (predicted)</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Based on UCLM trained decision model: High step frequency (PG={pg}) combined with balanced stance (|hF - hB|={Math.abs(hf - hb)} mm) produces high-speed locomotion.
            </p>
          </div>

          {/* Result of Evaluation Button */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed ${
                testResult.evaluatedOnRobot
                  ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-200'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <div className="font-bold mb-1 flex items-center justify-between">
                <span>{testResult.evaluatedOnRobot ? 'Physical Robot Run Complete' : 'Robot Evaluation Skipped'}</span>
                {testResult.evaluatedOnRobot && (
                  <span className="font-mono text-emerald-400">Measured: {testResult.realSpeed} cm/s</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">{testResult.reason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Parameter Sliders Grid (Table 1 of Paper) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Step Period (PG):</span>
            <span className="font-mono text-cyan-400">{pg} ({(pg * 0.008).toFixed(3)}s)</span>
          </div>
          <input
            type="range"
            min="40"
            max="90"
            step="1"
            value={pg}
            onChange={(e) => setPg(parseInt(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Front Height (hF):</span>
            <span className="font-mono text-cyan-400">{hf} mm</span>
          </div>
          <input
            type="range"
            min="100"
            max="140"
            step="1"
            value={hf}
            onChange={(e) => setHf(parseInt(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Rear Height (hB):</span>
            <span className="font-mono text-cyan-400">{hb} mm</span>
          </div>
          <input
            type="range"
            min="100"
            max="140"
            step="1"
            value={hb}
            onChange={(e) => setHb(parseInt(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Front Paw Lift (hdF):</span>
            <span className="font-mono text-slate-300">{hdf} mm</span>
          </div>
          <input
            type="range"
            min="10"
            max="40"
            step="1"
            value={hdf}
            onChange={(e) => setHdf(parseInt(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Rear Paw Lift (hdB):</span>
            <span className="font-mono text-slate-300">{hdb} mm</span>
          </div>
          <input
            type="range"
            min="10"
            max="40"
            step="1"
            value={hdb}
            onChange={(e) => setHdb(parseInt(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 block mb-1">Presets</label>
          <div className="flex gap-1.5">
            <button
              onClick={() => { setPg(55); setHf(120); setHb(120); setHdf(25); setHdb(25); }}
              className="flex-1 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 font-semibold"
            >
              Optimal Trot (Fast)
            </button>
            <button
              onClick={() => { setPg(85); setHf(140); setHb(100); setHdf(12); setHdb(12); }}
              className="flex-1 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 font-semibold"
            >
              Unbalanced (Mala)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
