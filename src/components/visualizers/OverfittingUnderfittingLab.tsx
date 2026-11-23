import React, { useState } from 'react';

export const OverfittingUnderfittingLab: React.FC = () => {
  const [degree, setDegree] = useState<number>(3);

  // Ground truth data points (10 training points with noise)
  const trainPoints = [
    { x: 1.0, y: 3.2 },
    { x: 1.8, y: 1.9 },
    { x: 2.5, y: 1.2 },
    { x: 3.2, y: 1.8 },
    { x: 4.0, y: 3.4 },
    { x: 4.8, y: 5.6 },
    { x: 5.5, y: 8.1 },
    { x: 6.2, y: 11.4 },
    { x: 7.0, y: 15.2 },
    { x: 7.8, y: 20.1 },
  ];

  // Test points (unseen ground truth with independent noise)
  const testPoints = [
    { x: 1.4, y: 2.4 },
    { x: 2.8, y: 1.4 },
    { x: 4.4, y: 4.3 },
    { x: 5.8, y: 9.5 },
    { x: 7.4, y: 17.6 },
  ];

  // Simulated MSE losses across degrees 1 to 9 (classic textbook U-curve)
  const lossData: { [deg: number]: { trainMse: number; testMse: number; diagnosis: string } } = {
    1: { trainMse: 8.42, testMse: 9.15, diagnosis: 'Underfitting (High Bias): Linear model is too simple for quadratic data.' },
    2: { trainMse: 1.18, testMse: 1.29, diagnosis: 'Good Generalization: Captures true parabolic trend.' },
    3: { trainMse: 0.94, testMse: 1.05, diagnosis: 'Optimal Fit: Minimal test generalization error!' },
    4: { trainMse: 0.81, testMse: 1.34, diagnosis: 'Slight Overfitting: Begins flexing into point noise.' },
    5: { trainMse: 0.62, testMse: 2.45, diagnosis: 'Moderate Overfitting: Noticeable divergence between train and test loss.' },
    6: { trainMse: 0.38, testMse: 4.80, diagnosis: 'Severe Overfitting: High variance; curves oscillate rapidly.' },
    7: { trainMse: 0.19, testMse: 8.92, diagnosis: 'Extreme Overfitting: Memorizing training coordinates.' },
    8: { trainMse: 0.08, testMse: 15.40, diagnosis: 'Extreme Overfitting: Wild oscillations outside sample bounds.' },
    9: { trainMse: 0.01, testMse: 26.80, diagnosis: 'Complete Memorization: Near 0 train loss, catastrophic test loss!' },
  };

  const currentLoss = lossData[degree];

  // Generate polynomial curve path string for SVG based on degree
  const generateCurvePath = (deg: number) => {
    // Canvas dimensions: width 500, height 180.
    // X scale: x in [0.5, 8.5] -> px in [30, 470]
    // Y scale: y in [0, 24] -> py in [160, 20]
    const points: string[] = [];
    for (let px = 30; px <= 470; px += 8) {
      const x = 0.5 + ((px - 30) / 440) * 8.0;
      let y = 0;
      if (deg === 1) {
        y = 2.4 * x - 1.5;
      } else if (deg === 2 || deg === 3) {
        y = 0.45 * Math.pow(x - 2.5, 2) + 1.2 + (deg === 3 ? 0.04 * Math.pow(x - 4, 3) : 0);
      } else {
        // High degree wiggle
        const base = 0.45 * Math.pow(x - 2.5, 2) + 1.2;
        const wiggle = Math.sin((x * Math.PI * (deg - 2)) / 2) * (deg * 0.45);
        y = Math.max(0, base + wiggle);
      }
      const py = 160 - (Math.min(22, Math.max(0, y)) / 22) * 140;
      points.push(`${px},${py}`);
    }
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Interactive Laboratory 9.2
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Polynomial Overfitting & Bias-Variance Laboratory
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Slide 19–34: Adjust model polynomial degree d to visualize the divergence between training error and test error.
          </p>
        </div>

        {/* Diagnosis Pill */}
        <div
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
            degree === 3 || degree === 2
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : degree === 1
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          }`}
        >
          {degree <= 1 ? 'Underfitting (High Bias)' : degree <= 3 ? 'Optimal Generalization' : 'Overfitting (High Variance)'}
        </div>
      </div>

      {/* Complexity Slider */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex justify-between items-center mb-1 text-xs">
          <span className="text-slate-300 font-medium">Model Complexity (Polynomial Degree d):</span>
          <span className="font-mono text-cyan-400 font-bold text-sm">Degree d = {degree}</span>
        </div>
        <input
          type="range"
          min="1"
          max="9"
          step="1"
          value={degree}
          onChange={(e) => setDegree(parseInt(e.target.value))}
          className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
          <span>d=1 (Linear)</span>
          <span>d=3 (Optimal)</span>
          <span>d=9 (Wild 9th Degree)</span>
        </div>
      </div>

      {/* Visual Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Regression Fit SVG */}
        <div className="p-5 bg-slate-950 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 mb-2 flex justify-between items-center">
            <span>Regression Curve vs Data Samples</span>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Train (10)
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Test (5)
              </span>
            </div>
          </div>

          <div className="h-44 w-full relative">
            <svg viewBox="0 0 500 180" className="w-full h-full">
              {/* Axes */}
              <line x1="30" y1="160" x2="470" y2="160" stroke="#334155" strokeWidth="1.5" />
              <line x1="30" y1="20" x2="30" y2="160" stroke="#334155" strokeWidth="1.5" />

              {/* Fitted Polynomial Curve */}
              <path
                d={generateCurvePath(degree)}
                fill="none"
                stroke={degree > 4 ? '#fb7185' : '#38bdf8'}
                strokeWidth="2.5"
              />

              {/* Training points */}
              {trainPoints.map((pt, idx) => {
                const cx = 30 + ((pt.x - 0.5) / 8.0) * 440;
                const cy = 160 - (pt.y / 22) * 140;
                return (
                  <circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r="4"
                    className="fill-cyan-400 stroke-slate-950 stroke-1"
                  />
                );
              })}

              {/* Test points */}
              {testPoints.map((pt, idx) => {
                const cx = 30 + ((pt.x - 0.5) / 8.0) * 440;
                const cy = 160 - (pt.y / 22) * 140;
                return (
                  <circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r="3.5"
                    className="fill-amber-400 stroke-slate-950 stroke-1"
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* Dual Loss U-Curve Graph */}
        <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="text-xs text-slate-400 mb-2 flex justify-between items-center">
            <span>The Classic U-Shaped Error Curve</span>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="text-cyan-400">Train MSE</span>
              <span className="text-rose-400">Test MSE</span>
            </div>
          </div>

          <div className="h-32 w-full relative">
            <svg viewBox="0 0 300 120" className="w-full h-full">
              {/* Baseline */}
              <line x1="20" y1="105" x2="280" y2="105" stroke="#334155" strokeWidth="1" />

              {/* Train MSE polyline (monotonically decreases) */}
              <polyline
                points={[1, 2, 3, 4, 5, 6, 7, 8, 9]
                  .map((d, i) => `${25 + i * 30},${105 - (lossData[d].trainMse / 28) * 90}`)
                  .join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
              />

              {/* Test MSE polyline (U-shaped) */}
              <polyline
                points={[1, 2, 3, 4, 5, 6, 7, 8, 9]
                  .map((d, i) => `${25 + i * 30},${105 - (lossData[d].testMse / 28) * 90}`)
                  .join(' ')}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
              />

              {/* Current degree cursor vertical line */}
              <line
                x1={25 + (degree - 1) * 30}
                y1="10"
                x2={25 + (degree - 1) * 30}
                y2="105"
                stroke="#f59e0b"
                strokeDasharray="2,2"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* Metrics summary */}
          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Train MSE:</span>
              <span className="text-cyan-400 font-bold text-sm">{currentLoss.trainMse.toFixed(2)}</span>
            </div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Test (Val) MSE:</span>
              <span className={`font-bold text-sm ${degree > 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {currentLoss.testMse.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Explanatory Diagnosis Banner */}
      <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
        <strong className="text-white block mb-1">Pedagogical Analysis:</strong>
        {currentLoss.diagnosis}
      </div>
    </div>
  );
};
