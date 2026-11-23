import React, { useState } from 'react';

interface Point2D {
  id: string;
  x: number;
  y: number;
  label: 'Red' | 'Blue';
}

export const KNNClassifierLab: React.FC = () => {
  // Initial points from Slide 12 Proposed Exercise 1
  const [points, setPoints] = useState<Point2D[]>([
    { id: 'A', x: 1, y: 2, label: 'Red' },
    { id: 'B', x: 2, y: 3, label: 'Red' },
    { id: 'C', x: 5, y: 5, label: 'Blue' },
    { id: 'D', x: 6, y: 4, label: 'Blue' },
    { id: 'E', x: 3, y: 2, label: 'Red' },
  ]);

  const [queryPoint, setQueryPoint] = useState<{ x: number; y: number }>({ x: 3, y: 4 });
  const [k, setK] = useState<number>(3);
  const [metric, setMetric] = useState<'euclidean' | 'manhattan'>('euclidean');
  const [pointToAddLabel, setPointToAddLabel] = useState<'Red' | 'Blue'>('Blue');

  // Compute distance from query point to each training point
  const distances = points.map((pt) => {
    let d = 0;
    if (metric === 'euclidean') {
      d = Math.sqrt(Math.pow(pt.x - queryPoint.x, 2) + Math.pow(pt.y - queryPoint.y, 2));
    } else {
      d = Math.abs(pt.x - queryPoint.x) + Math.abs(pt.y - queryPoint.y);
    }
    return { ...pt, distance: d };
  });

  // Sort ascending by distance
  const sorted = [...distances].sort((a, b) => a.distance - b.distance);
  const neighbors = sorted.slice(0, Math.min(k, sorted.length));

  // Count votes
  const redVotes = neighbors.filter((n) => n.label === 'Red').length;
  const blueVotes = neighbors.filter((n) => n.label === 'Blue').length;
  const predictedLabel = redVotes > blueVotes ? 'Red' : blueVotes > redVotes ? 'Blue' : 'Tie';
  const radius = neighbors.length > 0 ? neighbors[neighbors.length - 1].distance : 0;

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // SVG viewBox is 0 0 400 360, margins: left 40, right 360, top 20, bottom 320
    const coordX = Math.round(Math.max(0, Math.min(8, ((clickX - 40) / 320) * 8)) * 10) / 10;
    const coordY = Math.round(Math.max(0, Math.min(7, (1 - (clickY - 20) / 300) * 7)) * 10) / 10;

    setQueryPoint({ x: coordX, y: coordY });
  };

  const handleAddTrainingPoint = () => {
    const newId = String.fromCharCode(65 + points.length);
    setPoints((prev) => [
      ...prev,
      {
        id: newId,
        x: queryPoint.x,
        y: queryPoint.y,
        label: pointToAddLabel,
      },
    ]);
  };

  return (
    <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Interactive Laboratory 10.1
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              k-Nearest Neighbors (k-NN) Visual Classifier
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Slide 1–28: Click canvas to move query point Q(x, y). Adjust k and distance metric to observe neighbor voting.
          </p>
        </div>

        {/* Prediction Status Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Predicted Class:</span>
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
              predictedLabel === 'Red'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : predictedLabel === 'Blue'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            {predictedLabel.toUpperCase()} ({predictedLabel === 'Red' ? redVotes : blueVotes}/{neighbors.length} votes)
          </span>
        </div>
      </div>

      {/* Hyperparameter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Neighborhood Size (k):</span>
            <span className="font-mono text-cyan-400 font-bold">k = {k}</span>
          </div>
          <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[1, 3, 5, 7].map((num) => (
              <button
                key={num}
                onClick={() => setK(num)}
                className={`py-1 text-xs rounded font-medium ${
                  k === num ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                k={num}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 block mb-1">Distance Metric</label>
          <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setMetric('euclidean')}
              className={`py-1 text-xs rounded font-medium ${
                metric === 'euclidean' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              Euclidean (L₂)
            </button>
            <button
              onClick={() => setMetric('manhattan')}
              className={`py-1 text-xs rounded font-medium ${
                metric === 'manhattan' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              Manhattan (L₁)
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 block mb-1">Add Training Point at Q</label>
          <div className="flex gap-1.5">
            <button
              onClick={() => { setPointToAddLabel('Red'); handleAddTrainingPoint(); }}
              className="flex-1 py-1 text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded border border-rose-500/40 font-semibold"
            >
              + Add Red Point
            </button>
            <button
              onClick={() => { setPointToAddLabel('Blue'); handleAddTrainingPoint(); }}
              className="flex-1 py-1 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded border border-cyan-500/40 font-semibold"
            >
              + Add Blue Point
            </button>
          </div>
        </div>
      </div>

      {/* 2D Interactive Plane & Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SVG Plane */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center">
          <div className="text-xs text-slate-400 mb-2 w-full flex justify-between font-mono">
            <span>Click plane to place Query Point Q</span>
            <span className="text-amber-400">Q: ({queryPoint.x}, {queryPoint.y})</span>
          </div>

          <div className="w-full aspect-square max-w-[340px]">
            <svg
              viewBox="0 0 400 360"
              className="w-full h-full cursor-crosshair border border-slate-800 rounded-lg bg-slate-900/40"
              onClick={handleCanvasClick}
            >
              {/* Grid Lines */}
              {[1, 2, 3, 4, 5, 6, 7].map((val) => {
                const gx = 40 + (val / 8) * 320;
                const gy = 320 - (val / 7) * 300;
                return (
                  <g key={val}>
                    <line x1={gx} y1={20} x2={gx} y2={320} stroke="#1e293b" strokeWidth="1" />
                    <line x1={40} y1={gy} x2={360} y2={gy} stroke="#1e293b" strokeWidth="1" />
                    <text x={gx} y={335} textAnchor="middle" className="text-[10px] fill-slate-500 font-mono">
                      {val}
                    </text>
                    <text x={30} y={gy + 3} textAnchor="end" className="text-[10px] fill-slate-500 font-mono">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Bounding circle for Euclidean radius */}
              {metric === 'euclidean' && radius > 0 && (
                <circle
                  cx={40 + (queryPoint.x / 8) * 320}
                  cy={320 - (queryPoint.y / 7) * 300}
                  r={(radius / 8) * 320}
                  fill="rgba(6, 182, 212, 0.08)"
                  stroke="#06b6d4"
                  strokeDasharray="4,3"
                  strokeWidth="1.5"
                />
              )}

              {/* Connecting lines from Q to selected k neighbors */}
              {neighbors.map((n) => {
                const qx = 40 + (queryPoint.x / 8) * 320;
                const qy = 320 - (queryPoint.y / 7) * 300;
                const nx = 40 + (n.x / 8) * 320;
                const ny = 320 - (n.y / 7) * 300;
                return (
                  <line
                    key={n.id}
                    x1={qx}
                    y1={qy}
                    x2={nx}
                    y2={ny}
                    stroke={n.label === 'Red' ? '#fb7185' : '#38bdf8'}
                    strokeWidth="2"
                    strokeDasharray="3,2"
                  />
                );
              })}

              {/* Training points */}
              {points.map((pt) => {
                const cx = 40 + (pt.x / 8) * 320;
                const cy = 320 - (pt.y / 7) * 300;
                const isSelectedNeighbor = neighbors.some((n) => n.id === pt.id);

                return (
                  <g key={pt.id}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelectedNeighbor ? 8 : 5}
                      className={`transition-all ${
                        pt.label === 'Red'
                          ? 'fill-rose-500 stroke-white'
                          : 'fill-cyan-400 stroke-white'
                      } ${isSelectedNeighbor ? 'stroke-2 ring-2 ring-white shadow-lg' : 'stroke-1'}`}
                    />
                    <text x={cx} y={cy - 10} textAnchor="middle" className="text-[10px] font-bold fill-white font-mono">
                      {pt.id}
                    </text>
                  </g>
                );
              })}

              {/* Query Point Q */}
              <g>
                <circle
                  cx={40 + (queryPoint.x / 8) * 320}
                  cy={320 - (queryPoint.y / 7) * 300}
                  r="7"
                  className="fill-amber-400 stroke-slate-950 stroke-2 animate-pulse"
                />
                <text
                  x={40 + (queryPoint.x / 8) * 320}
                  y={320 - (queryPoint.y / 7) * 300 - 10}
                  textAnchor="middle"
                  className="text-[11px] font-bold fill-amber-300 font-mono"
                >
                  Q
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Distance Ranking Table */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="text-xs text-slate-400 font-mono mb-2 flex justify-between items-center">
            <span>Neighbor Distance Ranking (Ascending)</span>
            <span className="text-cyan-400 font-bold">Top {k} count for vote</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-2">Rank</th>
                  <th className="p-2">Point</th>
                  <th className="p-2">Coords</th>
                  <th className="p-2">Class</th>
                  <th className="p-2">Distance d(Q, x)</th>
                  <th className="p-2 text-right">In Vote?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 font-mono">
                {sorted.map((item, idx) => {
                  const isInTopK = idx < k;
                  return (
                    <tr
                      key={item.id}
                      className={isInTopK ? (item.label === 'Red' ? 'bg-rose-950/20' : 'bg-cyan-950/20') : ''}
                    >
                      <td className="p-2 text-slate-500">{idx + 1}</td>
                      <td className="p-2 font-bold text-white">{item.id}</td>
                      <td className="p-2 text-slate-400">({item.x}, {item.y})</td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.label === 'Red' ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {item.label}
                        </span>
                      </td>
                      <td className="p-2 font-bold text-white">{item.distance.toFixed(2)}</td>
                      <td className="p-2 text-right">
                        {isInTopK ? (
                          <span className="text-emerald-400 font-bold">YES</span>
                        ) : (
                          <span className="text-slate-600">No</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-400 font-mono">
            Vote Summary: <strong className="text-rose-400">{redVotes} Red</strong> vs{' '}
            <strong className="text-cyan-400">{blueVotes} Blue</strong> → Predicted: <strong className="text-white">{predictedLabel}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
