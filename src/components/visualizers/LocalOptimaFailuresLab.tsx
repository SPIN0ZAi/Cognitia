import React, { useState } from 'react';

type PathologyType = 'local-optimum' | 'plateau' | 'ridge';

export const LocalOptimaFailuresLab: React.FC = () => {
  const [pathology, setPathology] = useState<PathologyType>('local-optimum');
  const [sidewaysEnabled, setSidewaysEnabled] = useState<boolean>(false);
  const [operatorChoice, setOperatorChoice] = useState<'1-var' | '2-var'>('1-var');

  return (
    <div className="bg-[#0f172a] border border-rose-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Diagnostic Laboratory 7.2
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              The Three Pathologies of Hill Climbing
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Slide 17: Explore why greedy 1-step lookahead fails on Local Optima, Plateaus, and Ridges.
          </p>
        </div>

        {/* Pathology Selector */}
        <div className="flex gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {(
            [
              { id: 'local-optimum', label: '1. Local Optimum' },
              { id: 'plateau', label: '2. Plateau' },
              { id: 'ridge', label: '3. Ridge' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setPathology(item.id)}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                pathology === item.id
                  ? 'bg-rose-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pathology 1: Local Optimum */}
      {pathology === 'local-optimum' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-rose-400 font-semibold block mb-1">Slide 17 Definition: Local Optimum</strong>
            No neighbor in <code className="text-cyan-300 font-mono">N(x)</code> improves upon the current configuration, although a far superior global configuration exists elsewhere. Because Hill Climbing strictly refuses worsening moves, search stops dead in its tracks.
          </div>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
            <div className="h-44 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 600 160">
                {/* Terrain line */}
                <path
                  d="M 20 130 Q 80 130 140 60 Q 180 30 220 80 Q 280 140 380 140 Q 460 20 520 20 Q 560 60 580 130"
                  fill="none"
                  stroke="#fb7185"
                  strokeWidth="3"
                />
                {/* Fill under */}
                <path
                  d="M 20 130 Q 80 130 140 60 Q 180 30 220 80 Q 280 140 380 140 Q 460 20 520 20 Q 560 60 580 130 L 580 150 L 20 150 Z"
                  fill="rgba(244, 63, 94, 0.08)"
                />
                {/* Local Peak Marker */}
                <circle cx="180" cy="38" r="6" className="fill-rose-500 animate-pulse stroke-white stroke-2" />
                <text x="180" y="22" textAnchor="middle" className="text-xs font-bold fill-rose-400 font-mono">
                  TRAPPED (f = 14)
                </text>
                <text x="180" y="150" textAnchor="middle" className="text-[10px] fill-slate-500 font-mono">
                  Local Optimum: N(x) all decrease
                </text>

                {/* Global Peak Marker */}
                <circle cx="490" cy="20" r="5" className="fill-emerald-400" />
                <text x="490" y="10" textAnchor="middle" className="text-xs font-bold fill-emerald-400 font-mono">
                  Global Optimum (f = 25)
                </text>
                <text x="490" y="150" textAnchor="middle" className="text-[10px] fill-emerald-500/70 font-mono">
                  Unreachable without escape strategy
                </text>
              </svg>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-lg text-rose-300">
                <strong>Why HC fails:</strong> Looking only 1 move ahead, moving left drops from 14 to 11; moving right drops from 14 to 10. Since both moves worsen the score, <code className="font-mono">improves = false</code> and the algorithm returns the suboptimal score 14.
              </div>
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-emerald-300">
                <strong>Course Solution:</strong> Apply <em>Randomized Local Search</em> (RLS restart from a new random state) or <em>Simulated Annealing</em> (accept worsening moves with probability <code className="font-mono">exp(-Δ/T)</code>).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pathology 2: Plateau */}
      {pathology === 'plateau' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-rose-400 font-semibold block mb-1">Slide 17 Definition: Plateau</strong>
            A flat region in which all neighbouring configurations have the exact same score (<code className="text-cyan-300 font-mono">f(x') = f(x)</code>). Hill Climbing has zero gradient to follow and terminates unless sideways moves are explicitly permitted.
          </div>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-400">Toggle Sideways Moves to test traversal:</span>
              <button
                onClick={() => setSidewaysEnabled(!sidewaysEnabled)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  sidewaysEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                Sideways Moves: {sidewaysEnabled ? 'ALLOWED (Capped)' : 'FORBIDDEN (Standard HC)'}
              </button>
            </div>

            <div className="h-40 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 600 140">
                {/* Terrain with plateau */}
                <path
                  d="M 20 120 L 140 100 L 220 50 L 420 50 L 500 20 L 580 20"
                  fill="none"
                  stroke="#fb7185"
                  strokeWidth="3"
                />
                {/* Plateau region box */}
                <rect x="220" y="45" width="200" height="10" fill="rgba(244, 63, 94, 0.2)" />
                <text x="320" y="40" textAnchor="middle" className="text-[11px] font-bold fill-amber-400 font-mono">
                  PLATEAU ZONE: f(x) = 15 across 200 units
                </text>

                {/* Agent location */}
                <circle cx="260" cy="50" r="6" className="fill-cyan-400 stroke-white stroke-2" />
                <text x="260" y="70" textAnchor="middle" className="text-xs font-bold fill-cyan-300 font-mono">
                  Agent at x=260
                </text>

                {/* Step indicator */}
                {sidewaysEnabled ? (
                  <g>
                    <path d="M 270 50 L 310 50" stroke="#34d399" strokeWidth="2" markerEnd="url(#arrow)" />
                    <text x="360" y="70" textAnchor="middle" className="text-xs font-semibold fill-emerald-400">
                      Walks across plateau → reaches peak!
                    </text>
                  </g>
                ) : (
                  <text x="360" y="70" textAnchor="middle" className="text-xs font-semibold fill-rose-400">
                    STUCK: Left f=15, Right f=15 (0 &gt; 0 is false) → STOPS!
                  </text>
                )}
              </svg>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300">
              <strong className="text-white">UCLM Examination Rule:</strong> Why must sideways moves be capped? Without a limit (e.g., <code className="font-mono text-cyan-300">maxSideways = 100</code>), an agent on a closed plateau or circular saddle will loop infinitely back and forth between identical states.
            </div>
          </div>
        </div>
      )}

      {/* Pathology 3: Ridge */}
      {pathology === 'ridge' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-rose-400 font-semibold block mb-1">Slide 17 Definition: Ridge</strong>
            A sequence of local peaks where the crest rises along a diagonal axis. Improvement is possible only through a combination of multiple variable moves simultaneously, rather than through any single coordinate neighbour.
          </div>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-400">Compare Neighborhood Operators:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setOperatorChoice('1-var')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    operatorChoice === '1-var'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Standard 1-Coordinate Flip
                </button>
                <button
                  onClick={() => setOperatorChoice('2-var')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    operatorChoice === '2-var'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Diagonal / 2-Variable Move
                </button>
              </div>
            </div>

            {/* 2D Contour Grid representing a diagonal ridge */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono p-4 bg-slate-900 rounded-xl border border-slate-800">
              <div className="p-3 rounded bg-slate-950 text-slate-500">f=10</div>
              <div className="p-3 rounded bg-slate-950 text-slate-500">f=12</div>
              <div className="p-3 rounded bg-slate-950 text-slate-500">f=15</div>
              <div className="p-3 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-bold">
                Crest: f=30 (Peak)
              </div>

              <div className="p-3 rounded bg-slate-950 text-slate-500">f=8</div>
              <div className="p-3 rounded bg-slate-950 text-slate-500">f=14</div>
              <div className="p-3 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-bold">
                Crest: f=25
              </div>
              <div className="p-3 rounded bg-slate-950 text-slate-500">f=12</div>

              <div className="p-3 rounded bg-slate-950 text-slate-500">f=6</div>
              <div className="p-3 rounded bg-amber-950/80 text-amber-300 border-2 border-amber-500 font-bold animate-pulse">
                Agent: f=20
              </div>
              <div className="p-3 rounded bg-slate-950 text-slate-500">f=10</div>
              <div className="p-3 rounded bg-slate-950 text-slate-500">f=8</div>

              <div className="p-3 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-bold">
                Crest: f=15
              </div>
              <div className="p-3 rounded bg-slate-950 text-slate-500">f=8</div>
              <div className="p-3 rounded bg-slate-950 text-slate-500">f=6</div>
              <div className="p-3 rounded bg-slate-950 text-slate-500">f=4</div>
            </div>

            <div className="mt-4 p-3 rounded-lg text-xs font-sans leading-relaxed border bg-slate-900 border-slate-800">
              {operatorChoice === '1-var' ? (
                <div className="text-rose-300">
                  <strong className="text-rose-400">Entrapment on the Ridge:</strong> From Agent (<code className="font-mono">f=20</code>), moving 1 step North drops to <code className="font-mono">f=14</code>; moving South drops to <code className="font-mono">f=8</code>; moving East drops to <code className="font-mono">f=10</code>; moving West drops to <code className="font-mono">f=6</code>. All 4 orthogonal 1-variable moves fall down the hillside! Hill Climbing terminates.
                </div>
              ) : (
                <div className="text-cyan-300">
                  <strong className="text-cyan-400">Ridge Traversed:</strong> By using a compound 2-variable / diagonal operator, the agent tests North-East: <code className="font-mono">(+1, +1)</code> which reaches <code className="font-mono">f=25</code>, directly traversing the crest towards the peak (<code className="font-mono">f=30</code>)!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
