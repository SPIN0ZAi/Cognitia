import React, { useState } from 'react';

export const ConfusionMatrixMetricsLab: React.FC = () => {
  // Counts matching Proposed Exercise 2 (Slide 52) by default:
  // TP = 40, FP = 10, FN = 10, TN = 140 (Total = 200)
  const [tp, setTp] = useState<number>(40);
  const [fp, setFp] = useState<number>(10);
  const [fn, setFn] = useState<number>(10);
  const [tn, setTn] = useState<number>(140);

  const total = tp + fp + fn + tn;

  // Metric computations with safe zero-division handling
  const accuracy = total > 0 ? (tp + tn) / total : 0;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const specificity = tn + fp > 0 ? tn / (tn + fp) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  const loadPreset = (presetTp: number, presetFp: number, presetFn: number, presetTn: number) => {
    setTp(presetTp);
    setFp(presetFp);
    setFn(presetFn);
    setTn(presetTn);
  };

  return (
    <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Interactive Laboratory 10.2
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Confusion Matrix & Classification Metrics Engine
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Slide 43–60: Manipulate TP, FP, FN, TN to observe live formulas, Precision-Recall tradeoffs, and the Accuracy Paradox.
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => loadPreset(40, 10, 10, 140)}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 font-semibold"
          >
            Exam Problem (200)
          </button>
          <button
            onClick={() => loadPreset(5, 0, 95, 900)}
            className="px-2.5 py-1 text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded border border-rose-500/40 font-semibold"
          >
            Accuracy Paradox (1% Rare)
          </button>
          <button
            onClick={() => loadPreset(95, 2, 25, 878)}
            className="px-2.5 py-1 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded border border-purple-500/40 font-semibold"
          >
            Spam Filter (High Precision)
          </button>
          <button
            onClick={() => loadPreset(98, 45, 2, 855)}
            className="px-2.5 py-1 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded border border-emerald-500/40 font-semibold"
          >
            Cancer Screening (High Recall)
          </button>
        </div>
      </div>

      {/* 2x2 Confusion Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="text-xs font-mono text-slate-400 flex justify-between items-center">
            <span>Contingency Table Counts</span>
            <span className="text-cyan-400">Total N = {total}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            {/* TP */}
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-1">
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>True Positive (TP)</span>
                <span>{tp}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">Sick & Caught</p>
              <input
                type="range"
                min="0"
                max="200"
                value={tp}
                onChange={(e) => setTp(parseInt(e.target.value) || 0)}
                className="w-full accent-emerald-400 h-1 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            {/* FP */}
            <div className="p-3 bg-rose-950/30 border border-rose-500/40 rounded-xl space-y-1">
              <div className="flex justify-between text-rose-400 font-bold">
                <span>False Positive (FP)</span>
                <span>{fp}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">Healthy & False Alarm</p>
              <input
                type="range"
                min="0"
                max="200"
                value={fp}
                onChange={(e) => setFp(parseInt(e.target.value) || 0)}
                className="w-full accent-rose-400 h-1 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            {/* FN */}
            <div className="p-3 bg-rose-950/30 border border-rose-500/40 rounded-xl space-y-1">
              <div className="flex justify-between text-rose-400 font-bold">
                <span>False Negative (FN)</span>
                <span>{fn}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">Sick & Missed (Dangerous!)</p>
              <input
                type="range"
                min="0"
                max="200"
                value={fn}
                onChange={(e) => setFn(parseInt(e.target.value) || 0)}
                className="w-full accent-rose-400 h-1 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            {/* TN */}
            <div className="p-3 bg-cyan-950/30 border border-cyan-500/40 rounded-xl space-y-1">
              <div className="flex justify-between text-cyan-400 font-bold">
                <span>True Negative (TN)</span>
                <span>{tn}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">Healthy & Correct</p>
              <input
                type="range"
                min="0"
                max="900"
                value={tn}
                onChange={(e) => setTn(parseInt(e.target.value) || 0)}
                className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Live Metrics Cards */}
        <div className="space-y-3">
          {/* Accuracy */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs font-mono">
            <div>
              <div className="font-bold text-white text-sm">Accuracy</div>
              <div className="text-slate-400 text-[11px]">(TP + TN) / Total = ({tp} + {tn}) / {total}</div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-cyan-400">{(accuracy * 100).toFixed(1)}%</span>
              <span className="block text-[10px] text-slate-500">{accuracy.toFixed(3)}</span>
            </div>
          </div>

          {/* Precision */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs font-mono">
            <div>
              <div className="font-bold text-white text-sm">Precision (Positive Predictive Value)</div>
              <div className="text-slate-400 text-[11px]">TP / (TP + FP) = {tp} / ({tp} + {fp})</div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-purple-400">{(precision * 100).toFixed(1)}%</span>
              <span className="block text-[10px] text-slate-500">{precision.toFixed(3)}</span>
            </div>
          </div>

          {/* Recall */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs font-mono">
            <div>
              <div className="font-bold text-white text-sm">Recall / Sensitivity (True Positive Rate)</div>
              <div className="text-slate-400 text-[11px]">TP / (TP + FN) = {tp} / ({tp} + {fn})</div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-emerald-400">{(recall * 100).toFixed(1)}%</span>
              <span className="block text-[10px] text-slate-500">{recall.toFixed(3)}</span>
            </div>
          </div>

          {/* Specificity */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs font-mono">
            <div>
              <div className="font-bold text-white text-sm">Specificity (True Negative Rate)</div>
              <div className="text-slate-400 text-[11px]">TN / (TN + FP) = {tn} / ({tn} + {fp})</div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-blue-400">{(specificity * 100).toFixed(1)}%</span>
              <span className="block text-[10px] text-slate-500">{specificity.toFixed(3)}</span>
            </div>
          </div>

          {/* F1-Score */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs font-mono">
            <div>
              <div className="font-bold text-white text-sm">F₁-Score (Harmonic Mean)</div>
              <div className="text-slate-400 text-[11px]">2 × (P × R) / (P + R)</div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-amber-400">{(f1 * 100).toFixed(1)}%</span>
              <span className="block text-[10px] text-slate-500">{f1.toFixed(3)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Paradox Warning if Imbalance Detected */}
      {accuracy > 0.85 && recall < 0.2 && (
        <div className="p-4 bg-rose-950/30 border border-rose-500/50 rounded-xl text-xs text-rose-200 leading-relaxed">
          <strong className="text-rose-400 block mb-1">ACCURACY PARADOX DETECTED!</strong>
          Notice that Accuracy is a deceptive <strong>{(accuracy * 100).toFixed(1)}%</strong>, yet Recall is only{' '}
          <strong>{(recall * 100).toFixed(1)}%</strong>! The model misses almost all sick patients ({fn} missed out of {tp + fn} total sick cases).
          In imbalanced domains, high accuracy gives false confidence; always prioritize Precision, Recall, and F1!
        </div>
      )}
    </div>
  );
};
