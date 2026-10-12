/**
 * Cognitia Chase: "Be The Agent" Mode Panel
 * Reverses the roles: The student navigates to goal, then the system benchmarks
 * the student's cost against the true A* optimal cost and BFS step path.
 */

import React from 'react';
import { Trophy, AlertTriangle, Compass } from 'lucide-react';

interface BeTheAgentPanelProps {
  playerCost: number;
  playerSteps: number;
  goalReached: boolean;
  optimalCost: number;
  optimalSteps: number;
  bfsCost: number;
  bfsSteps: number;
  onReset: () => void;
}

export const BeTheAgentPanel: React.FC<BeTheAgentPanelProps> = ({
  playerCost,
  playerSteps,
  goalReached,
  optimalCost,
  optimalSteps,
  bfsCost,
  bfsSteps,
  onReset,
}) => {
  const isOptimal = goalReached && Math.abs(playerCost - optimalCost) < 0.01;
  const excessCost = Math.max(0, playerCost - optimalCost);

  return (
    <div
      style={{
        background: '#070a12',
        border: '1px solid #1c2738',
        borderRadius: '10px',
        padding: '1.25rem',
        marginTop: '1rem',
        fontFamily: 'var(--font-mono)',
        color: '#F1F5F9',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Compass size={20} color="#78D5E8" />
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#78D5E8' }}>
            BE THE AGENT // EFFICIENCY SCORER
          </span>
        </div>
        <button onClick={onReset} className="btn-tactile btn-sm">
          Reset Trial
        </button>
      </div>

      <div style={{ fontSize: '0.84rem', color: '#94A3B8', marginBottom: '1rem', lineHeight: 1.5 }}>
        Navigate through the labyrinth to the target beacon using keyboard arrows or touch D-pad. Watch your step: Mud tiles cost 3.0 km, while Ice tiles cost only 0.5 km!
      </div>

      {/* Live Cost HUD */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem',
          background: 'rgba(0,0,0,0.3)',
          padding: '0.75rem',
          borderRadius: '6px',
          border: '1px solid #162436',
          marginBottom: '1rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.65rem', color: '#64748B' }}>ACCUMULATED COST g(n)</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#C6F277' }}>
            {playerCost.toFixed(1)} km
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.65rem', color: '#64748B' }}>TOTAL ACTIONS (STEPS)</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#78D5E8' }}>
            {playerSteps}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.65rem', color: '#64748B' }}>STATUS</span>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: goalReached ? '#C6F277' : '#F59E0B' }}>
            {goalReached ? 'GOAL REACHED!' : 'EN ROUTE'}
          </div>
        </div>
      </div>

      {/* Benchmark Readout upon Goal Reached */}
      {goalReached && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '8px',
            background: isOptimal ? 'rgba(198, 242, 119, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: `1px solid ${isOptimal ? '#C6F277' : '#F59E0B'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
            {isOptimal ? <Trophy size={20} color="#C6F277" /> : <AlertTriangle size={20} color="#F59E0B" />}
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: isOptimal ? '#C6F277' : '#F59E0B' }}>
              {isOptimal ? '100% MATHEMATICAL OPTIMALITY ACHIEVED!' : `SUBOPTIMAL PATH (+${excessCost.toFixed(1)} km)`}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>YOUR PATH:</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F1F5F9' }}>
                Cost: {playerCost.toFixed(1)} ({playerSteps} steps)
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>A* OPTIMAL PATH:</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#C6F277' }}>
                Cost: {optimalCost.toFixed(1)} ({optimalSteps} steps)
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>BFS (SHORTEST STEPS):</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#78D5E8' }}>
                Cost: {bfsCost.toFixed(1)} ({bfsSteps} steps)
              </div>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.5, color: '#CBD5E1' }}>
            {isOptimal
              ? 'Outstanding! You correctly navigated around high-friction mud obstacles and leveraged superconductor ice corridors to match the theoretical minimum cost found by A*.'
              : 'Notice: You took a route that required higher cumulative cost than the A* optimum. Try using the low-cost ice corridors or avoiding the heavy mud patches.'}
          </p>
        </div>
      )}
    </div>
  );
};
