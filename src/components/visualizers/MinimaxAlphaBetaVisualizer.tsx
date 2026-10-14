import React, { useState, useMemo, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft, Scissors, Zap } from 'lucide-react';

interface TreeNode {
  id: string;
  name: string;
  type: 'max' | 'min' | 'leaf';
  depth: number;
  utility?: number;
  children?: TreeNode[];
  x?: number;
  y?: number;
}

// Canonical Lecture Slide 17/30/34-43 Tree
const CANONICAL_TREE: TreeNode = {
  id: 'A',
  name: 'A',
  type: 'max',
  depth: 0,
  children: [
    {
      id: 'B',
      name: 'B',
      type: 'min',
      depth: 1,
      children: [
        { id: 'b1', name: '3', type: 'leaf', depth: 2, utility: 3 },
        { id: 'b2', name: '12', type: 'leaf', depth: 2, utility: 12 },
        { id: 'b3', name: '8', type: 'leaf', depth: 2, utility: 8 },
      ],
    },
    {
      id: 'C',
      name: 'C',
      type: 'min',
      depth: 1,
      children: [
        { id: 'c1', name: '2', type: 'leaf', depth: 2, utility: 2 },
        { id: 'c2', name: '4', type: 'leaf', depth: 2, utility: 4 },
        { id: 'c3', name: '6', type: 'leaf', depth: 2, utility: 6 },
      ],
    },
    {
      id: 'D',
      name: 'D',
      type: 'min',
      depth: 1,
      children: [
        { id: 'd1', name: '14', type: 'leaf', depth: 2, utility: 14 },
        { id: 'd2', name: '5', type: 'leaf', depth: 2, utility: 5 },
        { id: 'd3', name: '2', type: 'leaf', depth: 2, utility: 2 },
      ],
    },
  ],
};

// Slide 23 Tree
const SLIDE_23_TREE: TreeNode = {
  id: 'R',
  name: 'Root',
  type: 'max',
  depth: 0,
  children: [
    {
      id: 'N1',
      name: 'MIN 1',
      type: 'min',
      depth: 1,
      children: [
        { id: 'l1', name: '99', type: 'leaf', depth: 2, utility: 99 },
        { id: 'l2', name: '1000', type: 'leaf', depth: 2, utility: 1000 },
        { id: 'l3', name: '1000', type: 'leaf', depth: 2, utility: 1000 },
        { id: 'l4', name: '1000', type: 'leaf', depth: 2, utility: 1000 },
      ],
    },
    {
      id: 'N2',
      name: 'MIN 2',
      type: 'min',
      depth: 1,
      children: [
        { id: 'l5', name: '100', type: 'leaf', depth: 2, utility: 100 },
        { id: 'l6', name: '101', type: 'leaf', depth: 2, utility: 101 },
        { id: 'l7', name: '102', type: 'leaf', depth: 2, utility: 102 },
        { id: 'l8', name: '100', type: 'leaf', depth: 2, utility: 100 },
      ],
    },
  ],
};

interface StepState {
  currentNodeId: string;
  activePath: string[];
  evaluatedValues: Record<string, number>;
  alphaValues: Record<string, number>;
  betaValues: Record<string, number>;
  prunedNodeIds: string[];
  message: string;
}

export interface MinimaxAlphaBetaVisualizerProps {
  initialMode?: 'minimax' | 'alphabeta';
}

export const MinimaxAlphaBetaVisualizer: React.FC<MinimaxAlphaBetaVisualizerProps> = ({
  initialMode = 'alphabeta',
}) => {
  const [treePreset, setTreePreset] = useState<'canonical' | 'slide23'>('canonical');
  const [pruningEnabled, setPruningEnabled] = useState<boolean>(initialMode === 'alphabeta');
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const activeTree = treePreset === 'canonical' ? CANONICAL_TREE : SLIDE_23_TREE;

  // Generate trace steps dynamically based on pruningEnabled
  const traceSteps = useMemo<StepState[]>(() => {
    const steps: StepState[] = [];
    const evaluated: Record<string, number> = {};
    const alphas: Record<string, number> = {};
    const betas: Record<string, number> = {};
    const pruned: string[] = [];

    const recordStep = (nodeId: string, path: string[], msg: string) => {
      steps.push({
        currentNodeId: nodeId,
        activePath: [...path],
        evaluatedValues: { ...evaluated },
        alphaValues: { ...alphas },
        betaValues: { ...betas },
        prunedNodeIds: [...pruned],
        message: msg,
      });
    };

    function traverse(node: TreeNode, path: string[], alpha: number, beta: number): number {
      alphas[node.id] = alpha;
      betas[node.id] = beta;
      const currentPath = [...path, node.id];

      if (node.type === 'leaf') {
        const val = node.utility ?? 0;
        evaluated[node.id] = val;
        recordStep(
          node.id,
          currentPath,
          `Evaluated terminal leaf ${node.name}: utility = ${val}.`
        );
        return val;
      }

      if (node.type === 'max') {
        let v = -Infinity;
        recordStep(
          node.id,
          currentPath,
          `Exploring MAX node ${node.name} with [α = ${alpha === -Infinity ? '-∞' : alpha}, β = ${beta === Infinity ? '+∞' : beta}].`
        );

        for (const child of node.children || []) {
          const childVal = traverse(child, currentPath, alpha, beta);
          v = Math.max(v, childVal);
          evaluated[node.id] = v;
          alpha = Math.max(alpha, v);
          alphas[node.id] = alpha;

          if (pruningEnabled && alpha >= beta) {
            // Prune remaining siblings
            const remaining = (node.children || []).slice(
              (node.children || []).indexOf(child) + 1
            );
            remaining.forEach((rem) => {
              pruned.push(rem.id);
              if (rem.children) rem.children.forEach((c) => pruned.push(c.id));
            });
            recordStep(
              node.id,
              currentPath,
              `CUTOFF at MAX node ${node.name}! α (${alpha}) ≥ β (${beta}). Pruning remaining children.`
            );
            return v;
          }
        }
        recordStep(
          node.id,
          currentPath,
          `MAX node ${node.name} finished with backed-up value = ${v}.`
        );
        return v;
      } else {
        // MIN node
        let v = Infinity;
        recordStep(
          node.id,
          currentPath,
          `Exploring MIN node ${node.name} with [α = ${alpha === -Infinity ? '-∞' : alpha}, β = ${beta === Infinity ? '+∞' : beta}].`
        );

        for (const child of node.children || []) {
          const childVal = traverse(child, currentPath, alpha, beta);
          v = Math.min(v, childVal);
          evaluated[node.id] = v;
          beta = Math.min(beta, v);
          betas[node.id] = beta;

          if (pruningEnabled && alpha >= beta) {
            // Prune remaining siblings
            const remaining = (node.children || []).slice(
              (node.children || []).indexOf(child) + 1
            );
            remaining.forEach((rem) => {
              pruned.push(rem.id);
              if (rem.children) rem.children.forEach((c) => pruned.push(c.id));
            });
            recordStep(
              node.id,
              currentPath,
              `CUTOFF at MIN node ${node.name}! α (${alpha}) ≥ β (${beta}). Pruning remaining branches.`
            );
            return v;
          }
        }
        recordStep(
          node.id,
          currentPath,
          `MIN node ${node.name} finished with backed-up value = ${v}.`
        );
        return v;
      }
    }

    recordStep(activeTree.id, [activeTree.id], 'Initialization: Start search at root.');
    traverse(activeTree, [], -Infinity, Infinity);
    recordStep(activeTree.id, [activeTree.id], 'Search complete: Optimal root decision identified.');

    return steps;
  }, [activeTree, pruningEnabled]);

  // Handle Play / Pause autoplay loop
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIdx((prev: number) => {
          if (prev >= traceSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, traceSteps.length]);

  const activeStep = traceSteps[Math.min(currentStepIdx, traceSteps.length - 1)] || traceSteps[0];

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentStepIdx((prev: number) => Math.min(traceSteps.length - 1, prev + 1));
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    setCurrentStepIdx((prev: number) => Math.max(0, prev - 1));
  };

  // Node coordinate positions for rendering SVG
  const nodePositions = useMemo<Record<string, { x: number; y: number }>>(() => {
    if (treePreset === 'canonical') {
      return {
        A: { x: 300, y: 50 },
        B: { x: 100, y: 150 },
        C: { x: 300, y: 150 },
        D: { x: 500, y: 150 },
        b1: { x: 50, y: 250 },
        b2: { x: 100, y: 250 },
        b3: { x: 150, y: 250 },
        c1: { x: 250, y: 250 },
        c2: { x: 300, y: 250 },
        c3: { x: 350, y: 250 },
        d1: { x: 450, y: 250 },
        d2: { x: 500, y: 250 },
        d3: { x: 550, y: 250 },
      } as Record<string, { x: number; y: number }>;
    } else {
      // Slide 23 tree
      return {
        R: { x: 300, y: 50 },
        N1: { x: 160, y: 150 },
        N2: { x: 440, y: 150 },
        l1: { x: 80, y: 250 },
        l2: { x: 130, y: 250 },
        l3: { x: 180, y: 250 },
        l4: { x: 230, y: 250 },
        l5: { x: 370, y: 250 },
        l6: { x: 420, y: 250 },
        l7: { x: 470, y: 250 },
        l8: { x: 520, y: 250 },
      } as Record<string, { x: number; y: number }>;
    }
  }, [treePreset]);

  // Edges
  const edges = useMemo(() => {
    const list: { from: string; to: string }[] = [];
    function collect(node: TreeNode) {
      if (node.children) {
        node.children.forEach((c) => {
          list.push({ from: node.id, to: c.id });
          collect(c);
        });
      }
    }
    collect(activeTree);
    return list;
  }, [activeTree]);

  return (
    <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)' }}>
      {/* Visualizer Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-indigo font-mono" style={{ fontSize: '0.7rem' }}>
              INTERACTIVE LABORATORY
            </span>
            <span className="badge badge-cyan font-mono" style={{ fontSize: '0.7rem' }}>
              SLIDES 17 & 30–44
            </span>
          </div>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
            Minimax & Alpha-Beta Pruning Explorer
          </h4>
        </div>

        {/* Controls: Presets & Pruning Toggle */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="btn-group" style={{ display: 'flex', background: 'var(--bg-card)', padding: '0.2rem', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => {
                setTreePreset('canonical');
                handleReset();
              }}
              className={`btn-tactile btn-sm ${treePreset === 'canonical' ? 'btn-primary' : ''}`}
              style={{ fontSize: '0.75rem' }}
            >
              Canonical Slide 17/30 Tree
            </button>
            <button
              onClick={() => {
                setTreePreset('slide23');
                handleReset();
              }}
              className={`btn-tactile btn-sm ${treePreset === 'slide23' ? 'btn-primary' : ''}`}
              style={{ fontSize: '0.75rem' }}
            >
              Slide 23 (99/100) Tree
            </button>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', color: '#94a3b8' }}>
            <input
              type="checkbox"
              checked={pruningEnabled}
              onChange={(e) => {
                setPruningEnabled(e.target.checked);
                handleReset();
              }}
            />
            <Scissors size={14} color={pruningEnabled ? '#f43f5e' : '#64748b'} />
            <span style={{ fontWeight: 600, color: pruningEnabled ? '#f43f5e' : '#94a3b8' }}>
              α-β Pruning {pruningEnabled ? 'ON' : 'OFF'}
            </span>
          </label>
        </div>
      </div>

      {/* SVG Canvas for Tree */}
      <div style={{ position: 'relative', background: '#030712', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid #1e293b', overflowX: 'auto' }}>
        <svg viewBox="0 0 600 290" style={{ width: '100%', minWidth: '550px', height: 'auto', display: 'block' }}>
          {/* Level Markers on Left */}
          <text x="15" y="55" fill="#38bdf8" fontSize="12" fontWeight="700" fontFamily="monospace">MAX △</text>
          <text x="15" y="155" fill="#f43f5e" fontSize="12" fontWeight="700" fontFamily="monospace">MIN ▽</text>
          <text x="15" y="255" fill="#a855f7" fontSize="12" fontWeight="700" fontFamily="monospace">LEAF</text>

          {/* Edges */}
          {edges.map(({ from, to }: { from: string; to: string }) => {
            const pFrom = nodePositions[from];
            const pTo = nodePositions[to];
            if (!pFrom || !pTo) return null;

            const isPruned = activeStep.prunedNodeIds.includes(to);
            const isActivePath = activeStep.activePath.includes(from) && activeStep.activePath.includes(to);

            return (
              <line
                key={`${from}->${to}`}
                x1={pFrom.x}
                y1={pFrom.y + 12}
                x2={pTo.x}
                y2={pTo.y - 12}
                stroke={isPruned ? '#ef4444' : isActivePath ? '#38bdf8' : '#334155'}
                strokeWidth={isActivePath ? 3 : isPruned ? 1.5 : 1.5}
                strokeDasharray={isPruned ? '4,4' : undefined}
                opacity={isPruned ? 0.35 : 1}
              />
            );
          })}

          {/* Nodes */}
          {Object.entries(nodePositions).map(([id, pos]: [string, { x: number; y: number }]) => {
            const isCurrent = activeStep.currentNodeId === id;
            const isPruned = activeStep.prunedNodeIds.includes(id);
            const val = activeStep.evaluatedValues[id];
            const alpha = activeStep.alphaValues[id];
            const beta = activeStep.betaValues[id];

            const isMax = id === 'A' || id === 'R';
            const isMin = id === 'B' || id === 'C' || id === 'D' || id === 'N1' || id === 'N2';
            const isLeaf = !isMax && !isMin;

            return (
              <g key={id} transform={`translate(${pos.x}, ${pos.y})`}>
                {/* Node Shape */}
                {isMax && (
                  <polygon
                    points="0,-16 16,14 -16,14"
                    fill={isCurrent ? '#38bdf8' : val !== undefined ? '#0284c7' : '#0f172a'}
                    stroke={isCurrent ? '#ffffff' : '#38bdf8'}
                    strokeWidth={isCurrent ? 2.5 : 1.5}
                  />
                )}
                {isMin && (
                  <polygon
                    points="0,16 16,-14 -16,-14"
                    fill={isCurrent ? '#f43f5e' : val !== undefined ? '#be123c' : '#0f172a'}
                    stroke={isCurrent ? '#ffffff' : '#f43f5e'}
                    strokeWidth={isCurrent ? 2.5 : 1.5}
                  />
                )}
                {isLeaf && (
                  <circle
                    r="13"
                    fill={isPruned ? '#1e293b' : isCurrent ? '#a855f7' : val !== undefined ? '#7e22ce' : '#0f172a'}
                    stroke={isPruned ? '#ef4444' : isCurrent ? '#ffffff' : '#a855f7'}
                    strokeWidth={isCurrent ? 2.5 : 1.5}
                    opacity={isPruned ? 0.4 : 1}
                  />
                )}

                {/* Node Label / Value */}
                <text
                  x="0"
                  y={isLeaf ? 4 : isMax ? 7 : -1}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {isLeaf ? id.toUpperCase() : val !== undefined ? val : id}
                </text>

                {/* Leaf Raw Utility value underneath */}
                {isLeaf && (
                  <text x="0" y="24" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontFamily="monospace">
                    {val !== undefined ? val : '?'}
                  </text>
                )}

                {/* Alpha / Beta interval labels next to internal nodes */}
                {(isMax || isMin) && (
                  <text
                    x={isMax ? 24 : 20}
                    y={isMax ? 2 : 0}
                    fill={alpha !== undefined || beta !== undefined ? '#38bdf8' : '#64748b'}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    [{alpha === undefined || alpha === -Infinity ? '-∞' : alpha}, {beta === undefined || beta === Infinity ? '+∞' : beta}]
                  </text>
                )}

                {/* Pruned Scissors Stamp */}
                {isPruned && (
                  <g transform="translate(-8, -8)">
                    <line x1="0" y1="0" x2="16" y2="16" stroke="#ef4444" strokeWidth="2.5" />
                    <line x1="16" y1="0" x2="0" y2="16" stroke="#ef4444" strokeWidth="2.5" />
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Live Step Explanation Bar */}
        <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: '#0b0f19', borderRadius: 'var(--radius-sm)', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Zap size={16} color="var(--lab-accent-cyan)" />
          <div style={{ flex: 1, fontSize: '0.85rem', color: '#f1f5f9', fontFamily: 'var(--font-mono)' }}>
            {activeStep.message}
          </div>
          <span className="badge badge-indigo font-mono" style={{ fontSize: '0.65rem' }}>
            STEP {currentStepIdx + 1} / {traceSteps.length}
          </span>
        </div>
      </div>

      {/* Playback Controls & Metrics */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={handleReset} className="btn-tactile btn-sm" title="Reset to Start">
            <RotateCcw size={14} />
          </button>
          <button onClick={handleStepBack} disabled={currentStepIdx === 0} className="btn-tactile btn-sm" title="Step Back">
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`btn-tactile btn-sm ${isPlaying ? 'btn-amber' : 'btn-primary'}`}
            style={{ minWidth: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button onClick={handleStepForward} disabled={currentStepIdx >= traceSteps.length - 1} className="btn-tactile btn-sm" title="Step Forward">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Pruning Stats Counter */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
          <span>
            Evaluated Leaves: <strong style={{ color: '#38bdf8' }}>{Object.keys(activeStep.evaluatedValues).filter(k => k.startsWith('b') || k.startsWith('c') || k.startsWith('d') || k.startsWith('l')).length}</strong>
          </span>
          <span>
            Pruned Nodes: <strong style={{ color: '#ef4444' }}>{activeStep.prunedNodeIds.length}</strong>
          </span>
          {pruningEnabled && activeStep.prunedNodeIds.length > 0 && (
            <span className="badge badge-emerald font-mono" style={{ fontSize: '0.65rem' }}>
              {Math.round((activeStep.prunedNodeIds.length / (activeStep.prunedNodeIds.length + Object.keys(activeStep.evaluatedValues).length)) * 100)}% COMPUTATION SAVED
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
