import React, { useState } from 'react';
import { RotateCcw, Info } from 'lucide-react';

export const MCTSVisualizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'walkthrough' | 'simulator' | 'comparison'>('walkthrough');
  
  // Walkthrough State (Slide 66)
  // Phases: 0: Initial tree, 1: Selection, 2: Expansion, 3: Simulation, 4: Backpropagation
  const [phaseStep, setPhaseStep] = useState<number>(0);
  const [simulationWon, setSimulationWon] = useState<boolean>(false);

  // Live Simulator State
  const [simExplorationC, setSimExplorationC] = useState<number>(1.414);
  const [simIterations, setSimIterations] = useState<number>(21);

  const getCanonicalNodeStats = (nodeId: string) => {
    switch (nodeId) {
      case 'root':
        return {
          wins: phaseStep === 4 ? (simulationWon ? 12 : 11) : 11,
          visits: phaseStep === 4 ? 22 : 21,
          label: 'Root',
        };
      case 'c1':
        return {
          wins: phaseStep === 4 ? (simulationWon ? 8 : 7) : 7,
          visits: phaseStep === 4 ? 11 : 10,
          label: 'Move A',
        };
      case 'c2':
        return { wins: 0, visits: 3, label: 'Move B' };
      case 'c3':
        return { wins: 3, visits: 8, label: 'Move C' };
      case 'c1_1':
        return { wins: 2, visits: 4, label: 'A1' };
      case 'c1_2':
        return {
          wins: phaseStep === 4 ? (simulationWon ? 2 : 1) : 1,
          visits: phaseStep === 4 ? 7 : 6,
          label: 'A2',
        };
      case 'c1_2_1':
        return { wins: 2, visits: 3, label: 'A2_a' };
      case 'c1_2_2':
        return {
          wins: phaseStep === 4 ? (simulationWon ? 4 : 3) : 3,
          visits: phaseStep === 4 ? 4 : 3,
          label: 'A2_b',
        };
      case 'c3_1':
        return { wins: 1, visits: 2, label: 'C1' };
      case 'c3_2':
        return { wins: 2, visits: 3, label: 'C2' };
      case 'c3_3':
        return { wins: 2, visits: 3, label: 'C3' };
      case 'new_leaf':
        if (phaseStep < 2) return null;
        if (phaseStep === 2) return { wins: 0, visits: 0, label: 'New Child' };
        if (phaseStep >= 3) return { wins: simulationWon ? 1 : 0, visits: 1, label: 'New Child' };
        return null;
      default:
        return { wins: 0, visits: 0, label: '' };
    }
  };

  const calculateUCT = (wins: number, visits: number, parentVisits: number, C: number) => {
    if (visits === 0) return '∞ (Unvisited)';
    const exploitation = wins / visits;
    const exploration = C * Math.sqrt(Math.log(parentVisits) / visits);
    return {
      exploitation: exploitation.toFixed(3),
      exploration: exploration.toFixed(3),
      total: (exploitation + exploration).toFixed(3),
    };
  };

  return (
    <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)' }}>
      {/* Visualizer Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-emerald font-mono" style={{ fontSize: '0.7rem' }}>
              APPENDIX: MONTE CARLO TREE SEARCH
            </span>
            <span className="badge badge-cyan font-mono" style={{ fontSize: '0.7rem' }}>
              SLIDES 63–67
            </span>
          </div>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
            Monte Carlo Tree Search (MCTS) & UCT Simulator
          </h4>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-elevated)', padding: '0.3rem', borderRadius: '8px' }}>
          <button
            onClick={() => setActiveTab('walkthrough')}
            className={`btn-tactile btn-sm ${activeTab === 'walkthrough' ? 'btn-primary' : ''}`}
            style={{ fontSize: '0.8rem' }}
          >
            Slide 66 Walkthrough
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`btn-tactile btn-sm ${activeTab === 'simulator' ? 'btn-primary' : ''}`}
            style={{ fontSize: '0.8rem' }}
          >
            Live Tree Sandbox
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`btn-tactile btn-sm ${activeTab === 'comparison' ? 'btn-primary' : ''}`}
            style={{ fontSize: '0.8rem' }}
          >
            Alpha-Beta vs MCTS
          </button>
        </div>
      </div>

      {/* Tab 1: Slide 66 Walkthrough */}
      {activeTab === 'walkthrough' && (
        <div>
          {/* Phase Banner */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            {[
              { idx: 0, name: '1. Initial State', desc: 'Current Tree' },
              { idx: 1, name: '2. Selection', desc: 'Tree policy (UCT)' },
              { idx: 2, name: '3. Expansion', desc: 'Add untried child' },
              { idx: 3, name: '4. Simulation', desc: 'Random rollout' },
              { idx: 4, name: '5. Backprop', desc: 'Update path statistics' },
            ].map((p) => (
              <button
                key={p.idx}
                onClick={() => setPhaseStep(p.idx)}
                style={{
                  padding: '0.6rem 0.5rem',
                  borderRadius: '6px',
                  textAlign: 'left',
                  border: phaseStep === p.idx ? '2px solid var(--accent-cyan)' : '1px solid var(--border-medium)',
                  background: phaseStep === p.idx ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-elevated)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: phaseStep === p.idx ? 'var(--accent-cyan)' : '#e2e8f0' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{p.desc}</div>
              </button>
            ))}
          </div>

          {/* Stepper Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled={phaseStep === 0}
                onClick={() => setPhaseStep((p) => Math.max(0, p - 1))}
                className="btn-tactile btn-sm"
              >
                Previous Step
              </button>
              <button
                disabled={phaseStep === 4}
                onClick={() => setPhaseStep((p) => Math.min(4, p + 1))}
                className="btn-tactile btn-sm btn-primary"
              >
                Next Step ({phaseStep === 0 ? 'Selection' : phaseStep === 1 ? 'Expansion' : phaseStep === 2 ? 'Simulation' : 'Backpropagation'})
              </button>
              <button
                onClick={() => {
                  setPhaseStep(0);
                  setSimulationWon(false);
                }}
                className="btn-tactile btn-sm"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            </div>

            {/* Simulation outcome toggle */}
            {phaseStep >= 3 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Rollout Outcome:</span>
                <button
                  onClick={() => setSimulationWon(false)}
                  className={`btn-tactile btn-sm ${!simulationWon ? 'btn-rose' : ''}`}
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                  Loss (0)
                </button>
                <button
                  onClick={() => setSimulationWon(true)}
                  className={`btn-tactile btn-sm ${simulationWon ? 'btn-emerald' : ''}`}
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                  Win (+1)
                </button>
              </div>
            )}
          </div>

          {/* SVG Tree Diagram representing Slide 66 */}
          <div
            style={{
              position: 'relative',
              background: '#090d16',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
              padding: '1.5rem 0.5rem',
              overflowX: 'auto',
            }}
          >
            <svg viewBox="0 0 760 380" style={{ width: '100%', minWidth: '700px', height: 'auto', display: 'block' }}>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
                </marker>
              </defs>

              {/* Connecting Tree Lines */}
              {/* Root -> Children */}
              <line
                x1="380"
                y1="40"
                x2="190"
                y2="110"
                stroke={phaseStep >= 1 ? '#38bdf8' : '#334155'}
                strokeWidth={phaseStep >= 1 ? 3.5 : 1.5}
              />
              <line x1="380" y1="40" x2="380" y2="110" stroke="#334155" strokeWidth="1.5" />
              <line x1="380" y1="40" x2="570" y2="110" stroke="#334155" strokeWidth="1.5" />

              {/* C1 -> Grandchildren */}
              <line x1="190" y1="110" x2="130" y2="180" stroke="#334155" strokeWidth="1.5" />
              <line
                x1="190"
                y1="110"
                x2="250"
                y2="180"
                stroke={phaseStep >= 1 ? '#38bdf8' : '#334155'}
                strokeWidth={phaseStep >= 1 ? 3.5 : 1.5}
              />

              {/* C3 -> Grandchildren */}
              <line x1="570" y1="110" x2="520" y2="180" stroke="#334155" strokeWidth="1.5" />
              <line x1="570" y1="110" x2="570" y2="180" stroke="#334155" strokeWidth="1.5" />
              <line x1="570" y1="110" x2="620" y2="180" stroke="#334155" strokeWidth="1.5" />

              {/* C1_2 -> Great-grandchildren */}
              <line x1="250" y1="180" x2="210" y2="250" stroke="#334155" strokeWidth="1.5" />
              <line
                x1="250"
                y1="180"
                x2="290"
                y2="250"
                stroke={phaseStep >= 1 ? '#38bdf8' : '#334155'}
                strokeWidth={phaseStep >= 1 ? 3.5 : 1.5}
              />

              {/* C1_2_2 -> New Expanded Leaf */}
              {phaseStep >= 2 && (
                <line
                  x1="290"
                  y1="250"
                  x2="290"
                  y2="320"
                  stroke={phaseStep === 2 ? '#a855f7' : phaseStep === 3 ? '#eab308' : '#10b981'}
                  strokeWidth="3"
                  strokeDasharray={phaseStep === 2 ? '4 3' : undefined}
                />
              )}

              {/* Simulation Rollout Dashed Arrow */}
              {phaseStep === 3 && (
                <g>
                  <path
                    d="M 290 342 L 290 370"
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="2.5"
                    strokeDasharray="3 3"
                    markerEnd="url(#arrow)"
                  />
                  <text x="305" y="365" fill="#facc15" fontSize="11" fontWeight="700">
                    Rollout: {simulationWon ? 'Win (+1)' : 'Loss (0)'}
                  </text>
                </g>
              )}

              {/* Backpropagation Red/Green Flow */}
              {phaseStep === 4 && (
                <g>
                  <path
                    d="M 270 320 Q 240 280 270 250"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    markerEnd="url(#arrow)"
                  />
                  <path
                    d="M 270 250 Q 210 210 230 180"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    markerEnd="url(#arrow)"
                  />
                  <path
                    d="M 230 180 Q 160 140 180 110"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    markerEnd="url(#arrow)"
                  />
                  <path
                    d="M 180 110 Q 280 70 360 40"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    markerEnd="url(#arrow)"
                  />
                  <text x="70" y="35" fill="#10b981" fontSize="11" fontWeight="700">
                    Backprop: +1 visit & +{simulationWon ? '1' : '0'} win to all 5 nodes
                  </text>
                </g>
              )}

              {/* Render Node Circles */}
              {[
                { id: 'root', x: 380, y: 40, r: 24, onPath: true },
                { id: 'c1', x: 190, y: 110, r: 20, onPath: true },
                { id: 'c2', x: 380, y: 110, r: 18, onPath: false },
                { id: 'c3', x: 570, y: 110, r: 19, onPath: false },
                { id: 'c1_1', x: 130, y: 180, r: 16, onPath: false },
                { id: 'c1_2', x: 250, y: 180, r: 18, onPath: true },
                { id: 'c3_1', x: 520, y: 180, r: 16, onPath: false },
                { id: 'c3_2', x: 570, y: 180, r: 16, onPath: false },
                { id: 'c3_3', x: 620, y: 180, r: 16, onPath: false },
                { id: 'c1_2_1', x: 210, y: 250, r: 16, onPath: false },
                { id: 'c1_2_2', x: 290, y: 250, r: 17, onPath: true },
                { id: 'new_leaf', x: 290, y: 320, r: 16, onPath: true, isNew: true },
              ].map((n) => {
                const stats = getCanonicalNodeStats(n.id);
                if (!stats) return null;
                const isSelected = n.onPath && phaseStep >= 1;
                const isBackpropped = n.onPath && phaseStep === 4;

                let fill = '#1e293b';
                let stroke = '#475569';
                if (isSelected) {
                  fill = 'rgba(56, 189, 248, 0.2)';
                  stroke = '#38bdf8';
                }
                if (n.isNew) {
                  fill = phaseStep === 2 ? 'rgba(168, 85, 247, 0.25)' : phaseStep === 3 ? 'rgba(234, 179, 8, 0.25)' : 'rgba(16, 185, 129, 0.25)';
                  stroke = phaseStep === 2 ? '#a855f7' : phaseStep === 3 ? '#eab308' : '#10b981';
                }
                if (isBackpropped) {
                  fill = 'rgba(16, 185, 129, 0.25)';
                  stroke = '#10b981';
                }

                return (
                  <g key={n.id}>
                    <circle cx={n.x} cy={n.y} r={n.r} fill={fill} stroke={stroke} strokeWidth={isSelected ? 3 : 1.5} />
                    <text
                      x={n.x}
                      y={n.y + 4}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize={n.r >= 20 ? '12' : '10'}
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      {stats.wins}/{stats.visits}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Current Step Academic Explanation */}
          <div className="card" style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'var(--bg-elevated)' }}>
            {phaseStep === 0 && (
              <div>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.4rem' }}>
                  Slide 66: Initial Tree State
                </h5>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Each node displays <code className="font-mono text-cyan-400">w / n</code>, where{' '}
                  <strong>w</strong> is the number of wins and <strong>n</strong> is the number of visits. The root has
                  recorded <strong>11 wins out of 21 visits</strong>. Click <strong>Next Step</strong> to begin the 4-phase
                  MCTS iteration.
                </p>
              </div>
            )}
            {phaseStep === 1 && (
              <div>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.4rem' }}>
                  Phase 1: Selection (Slide 64–65)
                </h5>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Starting at root (11/21), MCTS navigates down the tree choosing the child with the maximal{' '}
                  <strong>UCT score</strong>:
                </p>
                <div style={{ fontFamily: 'monospace', fontSize: '0.84rem', background: '#0f172a', padding: '0.6rem 0.8rem', borderRadius: '6px', color: '#38bdf8' }}>
                  UCT(v) = Q(v)/N(v) + C * sqrt( ln(N(parent)) / N(v) )
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.5rem', margin: 0 }}>
                  Thick path followed: <code className="font-mono text-cyan-300">Root (11/21) → Move A (7/10) → A2 (1/6) → A2_b (3/3)</code>.
                  At A2_b, an untried action exists, triggering expansion.
                </p>
              </div>
            )}
            {phaseStep === 2 && (
              <div>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#a855f7', marginBottom: '0.4rem' }}>
                  Phase 2: Expansion (Slide 64 & 66)
                </h5>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
                  A child corresponding to an untried legal action is added under node A2_b (3/3). Its initial statistics
                  are set to <code className="font-mono text-purple-400">0 / 0</code> (0 wins, 0 visits).
                </p>
              </div>
            )}
            {phaseStep === 3 && (
              <div>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#eab308', marginBottom: '0.4rem' }}>
                  Phase 3: Simulation or Rollout (Slide 64 & 66)
                </h5>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
                  From the newly expanded node, a fast simulated game is played to completion using random or heuristic
                  moves. In this example, the rollout completes with outcome:{' '}
                  <strong>{simulationWon ? 'WIN (+1)' : 'LOSS (0)'}</strong>. Node statistics become{' '}
                  <code className="font-mono text-amber-400">{simulationWon ? '1 / 1' : '0 / 1'}</code>.
                </p>
              </div>
            )}
            {phaseStep === 4 && (
              <div>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981', marginBottom: '0.4rem' }}>
                  Phase 4: Backpropagation (Slide 64 & 66)
                </h5>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  The rollout result is propagated backwards along the selected path all the way to the root:
                </p>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                  <li>Every node on the path increments its visit count <code className="font-mono">N ← N + 1</code>.</li>
                  <li>
                    Nodes increment their win count if the outcome was favorable from their perspective. Here, Root becomes{' '}
                    <code className="font-mono text-emerald-400">
                      {simulationWon ? '12/22' : '11/22'}
                    </code>, Move A becomes{' '}
                    <code className="font-mono text-emerald-400">
                      {simulationWon ? '8/11' : '7/11'}
                    </code>.
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Live Tree Sandbox */}
      {activeTab === 'simulator' && (
        <div>
          {/* Controls Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1rem',
              padding: '0.75rem',
              background: 'var(--bg-elevated)',
              borderRadius: '8px',
            }}
          >
            {/* Exploration Constant C Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                Exploration Constant C: <code className="font-mono text-cyan-400">{simExplorationC.toFixed(2)}</code>
              </span>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={simExplorationC}
                onChange={(e) => setSimExplorationC(parseFloat(e.target.value))}
                style={{ width: '130px' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {simExplorationC === 0 ? '(Greedy)' : simExplorationC >= 2 ? '(High Exploration)' : '(Classical UCB1 √2)'}
              </span>
            </div>

            {/* Run Iterations */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={() => setSimIterations((i) => i + 1)}
                className="btn-tactile btn-sm btn-primary"
              >
                +1 Iteration
              </button>
              <button
                onClick={() => setSimIterations((i) => i + 10)}
                className="btn-tactile btn-sm"
              >
                +10
              </button>
              <button
                onClick={() => setSimIterations((i) => i + 50)}
                className="btn-tactile btn-sm"
              >
                +50
              </button>
              <button
                onClick={() => setSimIterations(21)}
                className="btn-tactile btn-sm"
                title="Reset Iterations"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>

          {/* Live UCT Computation Inspector */}
          <div className="card" style={{ padding: '1rem', background: '#0b1120', border: '1px solid #1e293b', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                Live UCT Analysis at Root Children (Parent Visits N = {simIterations})
              </span>
              <span className="badge badge-indigo font-mono" style={{ fontSize: '0.7rem' }}>
                Formula: Q/N + C * √(ln(N_parent)/N)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {[
                { name: 'Move A (Left)', wins: Math.round(simIterations * 0.45), visits: Math.round(simIterations * 0.5) },
                { name: 'Move B (Center)', wins: Math.round(simIterations * 0.05), visits: Math.max(1, Math.round(simIterations * 0.15)) },
                { name: 'Move C (Right)', wins: Math.round(simIterations * 0.35), visits: Math.round(simIterations * 0.35) },
              ].map((child, idx) => {
                const uct = calculateUCT(child.wins, child.visits, simIterations, simExplorationC);
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '6px',
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid var(--border-medium)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.84rem', color: '#f8fafc' }}>{child.name}</strong>
                      <span className="font-mono text-cyan-400" style={{ fontSize: '0.8rem' }}>
                        {child.wins} / {child.visits}
                      </span>
                    </div>
                    {typeof uct === 'object' && (
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        <div>
                          Exploitation (Win Rate):{' '}
                          <span style={{ color: '#38bdf8', fontWeight: 600 }}>{uct.exploitation}</span>
                        </div>
                        <div>
                          Exploration Bonus:{' '}
                          <span style={{ color: '#a855f7', fontWeight: 600 }}>+{uct.exploration}</span>
                        </div>
                        <div style={{ marginTop: '0.25rem', paddingTop: '0.25rem', borderTop: '1px solid #334155', fontWeight: 700, color: '#10b981' }}>
                          Total UCT Score: {uct.total}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Decision Rule */}
            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Info size={14} className="text-cyan-400" />
              <span>
                <strong>Stopping Rule (Slide 64):</strong> When the search budget is exhausted, the agent plays the action
                with the <strong>most visits N(v)</strong> at the root, because visit count is more robust against noise
                than raw win rate.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Alpha-Beta vs MCTS Comparison Matrix (Slide 67) */}
      {activeTab === 'comparison' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-medium)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Dimension</th>
                <th style={{ padding: '0.75rem 1rem', color: '#38bdf8' }}>Alpha-Beta Pruning</th>
                <th style={{ padding: '0.75rem 1rem', color: '#10b981' }}>Monte Carlo Tree Search (MCTS)</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  dim: 'Position Estimate',
                  ab: 'Terminal utilities or hand-crafted evaluation function Eval(s)',
                  mcts: 'Sampled outcomes from rollouts; or learned neural value network',
                },
                {
                  dim: 'Search Shape',
                  ab: 'Fixed depth limit, depth-first exploration with α-β bound pruning',
                  mcts: 'Highly asymmetric tree, deeply concentrated on promising lines',
                },
                {
                  dim: 'Stopping Early',
                  ab: 'Usually combined with Iterative Deepening for time cutoffs',
                  mcts: 'Naturally returns a decision after any number of simulations (anytime)',
                },
                {
                  dim: 'Guarantee',
                  ab: 'Exact optimal play if full minimax tree is searched',
                  mcts: 'UCT converges asymptotically to the optimal action as N → ∞',
                },
                {
                  dim: 'Typical Strength',
                  ab: 'Forced tactical lines & domains with strong evaluation functions (Chess)',
                  mcts: 'Large branching factors & domains where sampling gives useful estimates (Go)',
                },
                {
                  dim: 'Typical Weakness',
                  ab: 'Massive branching factors (b > 200 in Go) or unreliable evaluation functions',
                  mcts: 'Rare but decisive tactical traps that random rollouts seldom stumble upon',
                },
                {
                  dim: 'Modern AI Synergy',
                  ab: 'Deep Blue (IBM RS/6000 + VLSI hardware search + 8000 hand-crafted features)',
                  mcts: 'AlphaGo / AlphaZero (Policy network guides expansion, Value network evaluates rollouts)',
                },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.65rem 1rem', fontWeight: 600, color: '#f8fafc' }}>{row.dim}</td>
                  <td style={{ padding: '0.65rem 1rem', color: 'var(--text-secondary)' }}>{row.ab}</td>
                  <td style={{ padding: '0.65rem 1rem', color: '#e2e8f0', background: 'rgba(16, 185, 129, 0.04)' }}>
                    {row.mcts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
