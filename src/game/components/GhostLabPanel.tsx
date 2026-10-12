/**
 * Cognitia Chase: Ghost Lab Sandbox & Heuristic Laboratory
 * 
 * Side-by-side comparison of 2 search algorithms on identical maze conditions.
 * Features heuristic experiments (Manhattan vs Euclidean vs Inadmissible 3x Manhattan)
 * proving why A* can find non-optimal paths with an inadmissible heuristic.
 */

import React, { useState } from 'react';
import type { SearchAlgorithmType } from '../../lib/search/GraphSearch';
import { runSearch } from '../../lib/search/GraphSearch';
import type { MazeMap } from '../engine/MazeMap';
import type { GridCoord } from '../engine/types';
import { FlaskConical, Play } from 'lucide-react';

interface GhostLabPanelProps {
  maze: MazeMap;
  startCoord: GridCoord;
  goalCoord: GridCoord;
}

export const GhostLabPanel: React.FC<GhostLabPanelProps> = ({
  maze,
  startCoord,
  goalCoord,
}) => {
  const [algoA, setAlgoA] = useState<SearchAlgorithmType>('astar');
  const [algoB, setAlgoB] = useState<SearchAlgorithmType>('astar');
  const [heurA, setHeurA] = useState<'manhattan' | 'euclidean' | 'inadmissible'>('manhattan');
  const [heurB, setHeurB] = useState<'manhattan' | 'euclidean' | 'inadmissible'>('inadmissible');

  const [resultA, setResultA] = useState<any>(null);
  const [resultB, setResultB] = useState<any>(null);
  const [hasRun, setHasRun] = useState(false);

  const runComparison = () => {
    // Problem A
    const probA = maze.createSearchProblem(startCoord, goalCoord, heurA);
    const t0A = performance.now();
    const resA = runSearch(probA, algoA, { isGraphMode: true });
    const timeA = Math.max(0.1, Number((performance.now() - t0A).toFixed(2)));

    // Problem B
    const probB = maze.createSearchProblem(startCoord, goalCoord, heurB);
    const t0B = performance.now();
    const resB = runSearch(probB, algoB, { isGraphMode: true });
    const timeB = Math.max(0.1, Number((performance.now() - t0B).toFixed(2)));

    setResultA({ ...resA, time: timeA });
    setResultB({ ...resB, time: timeB });
    setHasRun(true);
  };

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FlaskConical size={20} color="#C6F277" />
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#C6F277' }}>
            GHOST LAB // DUAL-ALGORITHM BENCHMARK & HEURISTIC LAB
          </span>
        </div>
        <button onClick={runComparison} className="btn-tactile btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Play size={14} /> Run Dual Benchmark
        </button>
      </div>

      {/* Dual Selector Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Column A */}
        <div style={{ padding: '0.85rem', background: '#0b111c', border: '1px solid #19263a', borderRadius: '6px' }}>
          <div style={{ fontSize: '0.74rem', color: '#78D5E8', fontWeight: 700, marginBottom: '0.5rem' }}>
            CONTENDER A
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <select
              value={algoA}
              onChange={(e) => setAlgoA(e.target.value as any)}
              style={{
                width: '100%',
                background: '#06090e',
                border: '1px solid #1e2d42',
                color: '#F1F5F9',
                padding: '0.35rem',
                borderRadius: '4px',
                fontSize: '0.78rem',
              }}
            >
              <option value="astar">A* Search (Optimal)</option>
              <option value="bfs">Breadth-First Search (BFS)</option>
              <option value="ucs">Uniform-Cost Search (UCS)</option>
              <option value="greedy">Greedy Best-First</option>
              <option value="dfs">Depth-First Search (DFS)</option>
            </select>
          </div>
          {(algoA === 'astar' || algoA === 'greedy') && (
            <div>
              <span style={{ fontSize: '0.68rem', color: '#64748B' }}>HEURISTIC:</span>
              <select
                value={heurA}
                onChange={(e) => setHeurA(e.target.value as any)}
                style={{
                  width: '100%',
                  marginTop: '0.2rem',
                  background: '#06090e',
                  border: '1px solid #1e2d42',
                  color: '#C6F277',
                  padding: '0.35rem',
                  borderRadius: '4px',
                  fontSize: '0.76rem',
                }}
              >
                <option value="manhattan">Manhattan Distance (Admissible)</option>
                <option value="euclidean">Euclidean Distance (Admissible)</option>
                <option value="inadmissible">3x Manhattan (INADMISSIBLE)</option>
              </select>
            </div>
          )}
        </div>

        {/* Column B */}
        <div style={{ padding: '0.85rem', background: '#0b111c', border: '1px solid #19263a', borderRadius: '6px' }}>
          <div style={{ fontSize: '0.74rem', color: '#F59E0B', fontWeight: 700, marginBottom: '0.5rem' }}>
            CONTENDER B
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <select
              value={algoB}
              onChange={(e) => setAlgoB(e.target.value as any)}
              style={{
                width: '100%',
                background: '#06090e',
                border: '1px solid #1e2d42',
                color: '#F1F5F9',
                padding: '0.35rem',
                borderRadius: '4px',
                fontSize: '0.78rem',
              }}
            >
              <option value="astar">A* Search</option>
              <option value="greedy">Greedy Best-First</option>
              <option value="bfs">Breadth-First Search (BFS)</option>
              <option value="ucs">Uniform-Cost Search (UCS)</option>
              <option value="dfs">Depth-First Search (DFS)</option>
            </select>
          </div>
          {(algoB === 'astar' || algoB === 'greedy') && (
            <div>
              <span style={{ fontSize: '0.68rem', color: '#64748B' }}>HEURISTIC:</span>
              <select
                value={heurB}
                onChange={(e) => setHeurB(e.target.value as any)}
                style={{
                  width: '100%',
                  marginTop: '0.2rem',
                  background: '#06090e',
                  border: '1px solid #1e2d42',
                  color: heurB === 'inadmissible' ? '#F43F5E' : '#C6F277',
                  padding: '0.35rem',
                  borderRadius: '4px',
                  fontSize: '0.76rem',
                }}
              >
                <option value="inadmissible">3x Manhattan (INADMISSIBLE Overestimate)</option>
                <option value="manhattan">Manhattan Distance (Admissible)</option>
                <option value="euclidean">Euclidean Distance (Admissible)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results Comparison Grid */}
      {hasRun && resultA && resultB && (
        <div style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.35)', borderRadius: '6px', border: '1px solid #162436' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.65rem', color: '#64748B' }}>PATH COST:</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: resultA.totalCost <= resultB.totalCost ? '#C6F277' : '#F43F5E' }}>
                A: {resultA.totalCost.toFixed(1)} vs B: {resultB.totalCost.toFixed(1)}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.65rem', color: '#64748B' }}>NODES EXPANDED:</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#78D5E8' }}>
                A: {resultA.nodesExpanded} vs B: {resultB.nodesExpanded}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.65rem', color: '#64748B' }}>PATH STEPS:</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#CBD5E1' }}>
                A: {resultA.path.length} vs B: {resultB.path.length}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.65rem', color: '#64748B' }}>CPU TIME:</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#94A3B8' }}>
                A: {resultA.time}ms vs B: {resultB.time}ms
              </div>
            </div>
          </div>

          {/* Academic Insight Callout */}
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '4px',
              background: 'rgba(120, 213, 232, 0.08)',
              borderLeft: '3px solid #78D5E8',
              fontSize: '0.78rem',
              lineHeight: 1.5,
              color: '#CBD5E1',
            }}
          >
            {heurB === 'inadmissible' && algoB === 'astar' && resultB.totalCost > resultA.totalCost ? (
              <span style={{ color: '#FCA5A5' }}>
                <strong style={{ color: '#F43F5E' }}>Suboptimality Observed!</strong> Notice that with the inadmissible heuristic (3x Manhattan), A* expanded fewer nodes ({resultB.nodesExpanded} vs {resultA.nodesExpanded}) because it was aggressively greedy, but it returned a sub-optimal path costing {resultB.totalCost.toFixed(1)} vs the true optimal cost of {resultA.totalCost.toFixed(1)}! This directly proves Slide 22 on admissibility.
              </span>
            ) : (
              <span>
                <strong>Academic Analysis:</strong> Both contenders evaluated identically situated graphs. Notice the trade-off between search efficiency (number of nodes expanded) and final solution optimality.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
