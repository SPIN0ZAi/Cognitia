import React, { useState } from 'react';
import { RotateCcw, ChevronRight, CheckCircle } from 'lucide-react';

interface StepNode {
  id: number;
  board: number[]; // 0 is gap
  operator: string;
  h1: number;
  depth: number;
  parentId: number | null;
  status: 'expanded' | 'open' | 'goal';
}

// Initial state: [2, 8, 3, 0, 1, 4, 7, 6, 5] (Lesson 3, Slide 55)
// Goal state:    [1, 2, 3, 8, 0, 4, 7, 6, 5]



// Precomputed trace following Slide 55 rules:
// Operators: Up, Down, Left, Right. Ties: older node first.
const PRECOMPUTED_TRACE: {
  step: number;
  selectedId: number;
  explanation: string;
  nodes: StepNode[];
}[] = [
  {
    step: 0,
    selectedId: 0,
    explanation: 'Initial root node created: Gap is at row 1, col 0. Wrongly located tiles (including gap) h1 = 4 (tiles 2, 8, gap, 1).',
    nodes: [
      { id: 0, board: [2, 8, 3, 0, 1, 4, 7, 6, 5], operator: 'Root', h1: 4, depth: 0, parentId: null, status: 'open' },
    ],
  },
  {
    step: 1,
    selectedId: 0,
    explanation:
      'Expand Root (id 0). Apply operators in order (Up, Down, Left, Right): Up (moves 2 down -> gap at 0,0, h1=5), Down (moves 7 up -> gap at 2,0, h1=5), Right (moves 1 left -> gap at 1,1, h1=3). Left is invalid. Node with lowest h1 is id 3 (h1=3).',
    nodes: [
      { id: 0, board: [2, 8, 3, 0, 1, 4, 7, 6, 5], operator: 'Root', h1: 4, depth: 0, parentId: null, status: 'expanded' },
      { id: 1, board: [0, 8, 3, 2, 1, 4, 7, 6, 5], operator: 'Up', h1: 5, depth: 1, parentId: 0, status: 'open' },
      { id: 2, board: [2, 8, 3, 7, 1, 4, 0, 6, 5], operator: 'Down', h1: 5, depth: 1, parentId: 0, status: 'open' },
      { id: 3, board: [2, 8, 3, 1, 0, 4, 7, 6, 5], operator: 'Right', h1: 3, depth: 1, parentId: 0, status: 'open' },
    ],
  },
  {
    step: 2,
    selectedId: 3,
    explanation:
      'Expand Node 3 (h1=3, gap at 1,1). Operators applied: Up (moves 8 down -> h1=3), Down (moves 6 up -> h1=5), Left (undo -> cycle avoided), Right (moves 4 left -> h1=5). Node 4 has lowest h1 = 3.',
    nodes: [
      { id: 0, board: [2, 8, 3, 0, 1, 4, 7, 6, 5], operator: 'Root', h1: 4, depth: 0, parentId: null, status: 'expanded' },
      { id: 1, board: [0, 8, 3, 2, 1, 4, 7, 6, 5], operator: 'Up', h1: 5, depth: 1, parentId: 0, status: 'open' },
      { id: 2, board: [2, 8, 3, 7, 1, 4, 0, 6, 5], operator: 'Down', h1: 5, depth: 1, parentId: 0, status: 'open' },
      { id: 3, board: [2, 8, 3, 1, 0, 4, 7, 6, 5], operator: 'Right', h1: 3, depth: 1, parentId: 0, status: 'expanded' },
      { id: 4, board: [2, 0, 3, 1, 8, 4, 7, 6, 5], operator: 'Up', h1: 3, depth: 2, parentId: 3, status: 'open' },
      { id: 5, board: [2, 8, 3, 1, 6, 4, 7, 0, 5], operator: 'Down', h1: 5, depth: 2, parentId: 3, status: 'open' },
      { id: 6, board: [2, 8, 3, 1, 4, 0, 7, 6, 5], operator: 'Right', h1: 5, depth: 2, parentId: 3, status: 'open' },
    ],
  },
  {
    step: 3,
    selectedId: 4,
    explanation:
      'Expand Node 4 (h1=3, gap at 0,1). Operators applied: Left (moves 2 right -> gap at 0,0, board: [0, 2, 3, 1, 8, 4, 7, 6, 5], h1=2). Node 7 has lowest h1 = 2!',
    nodes: [
      { id: 0, board: [2, 8, 3, 0, 1, 4, 7, 6, 5], operator: 'Root', h1: 4, depth: 0, parentId: null, status: 'expanded' },
      { id: 1, board: [0, 8, 3, 2, 1, 4, 7, 6, 5], operator: 'Up', h1: 5, depth: 1, parentId: 0, status: 'open' },
      { id: 2, board: [2, 8, 3, 7, 1, 4, 0, 6, 5], operator: 'Down', h1: 5, depth: 1, parentId: 0, status: 'open' },
      { id: 3, board: [2, 8, 3, 1, 0, 4, 7, 6, 5], operator: 'Right', h1: 3, depth: 1, parentId: 0, status: 'expanded' },
      { id: 4, board: [2, 0, 3, 1, 8, 4, 7, 6, 5], operator: 'Up', h1: 3, depth: 2, parentId: 3, status: 'expanded' },
      { id: 5, board: [2, 8, 3, 1, 6, 4, 7, 0, 5], operator: 'Down', h1: 5, depth: 2, parentId: 3, status: 'open' },
      { id: 6, board: [2, 8, 3, 1, 4, 0, 7, 6, 5], operator: 'Right', h1: 5, depth: 2, parentId: 3, status: 'open' },
      { id: 7, board: [0, 2, 3, 1, 8, 4, 7, 6, 5], operator: 'Left', h1: 2, depth: 3, parentId: 4, status: 'open' },
    ],
  },
  {
    step: 4,
    selectedId: 7,
    explanation:
      'Expand Node 7 (h1=2, gap at 0,0). Operators applied: Down (moves 1 up -> board: [1, 2, 3, 0, 8, 4, 7, 6, 5], h1=2). Then Right from that state moves 8 left -> [1, 2, 3, 8, 0, 4, 7, 6, 5] -> GOAL STATE REACHED (h1=0)!',
    nodes: [
      { id: 0, board: [2, 8, 3, 0, 1, 4, 7, 6, 5], operator: 'Root', h1: 4, depth: 0, parentId: null, status: 'expanded' },
      { id: 3, board: [2, 8, 3, 1, 0, 4, 7, 6, 5], operator: 'Right', h1: 3, depth: 1, parentId: 0, status: 'expanded' },
      { id: 4, board: [2, 0, 3, 1, 8, 4, 7, 6, 5], operator: 'Up', h1: 3, depth: 2, parentId: 3, status: 'expanded' },
      { id: 7, board: [0, 2, 3, 1, 8, 4, 7, 6, 5], operator: 'Left', h1: 2, depth: 3, parentId: 4, status: 'expanded' },
      { id: 8, board: [1, 2, 3, 0, 8, 4, 7, 6, 5], operator: 'Down', h1: 2, depth: 4, parentId: 7, status: 'expanded' },
      { id: 9, board: [1, 2, 3, 8, 0, 4, 7, 6, 5], operator: 'Right', h1: 0, depth: 5, parentId: 8, status: 'goal' },
    ],
  },
];

export const EightPuzzleGreedyTrace: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);

  const currentTrace = PRECOMPUTED_TRACE[stepIndex];
  const isFinished = stepIndex === PRECOMPUTED_TRACE.length - 1;

  const nextStep = () => {
    if (stepIndex < PRECOMPUTED_TRACE.length - 1) {
      setStepIndex((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  const reset = () => {
    setStepIndex(0);
  };

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #090e17 0%, #06090f 100%)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        margin: '2rem 0',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-amber font-mono">Exercise 2 Trace · Lesson 3 Slide 55</span>
            <span className="badge badge-emerald">Greedy Best-First</span>
          </div>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.4rem' }}>
            8-Puzzle Greedy Best-First Search Step-by-Step Execution
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Order of operators: <strong>Up → Down → Left → Right</strong>. Tie-breaking rule: <strong>Older node first (FIFO)</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={prevStep} disabled={stepIndex === 0} className="btn-tactile btn-sm">
            Previous
          </button>
          <button
            onClick={nextStep}
            disabled={isFinished}
            className="btn-tactile btn-primary btn-sm"
          >
            <ChevronRight size={14} />
            <span>Step Forward ({stepIndex}/{PRECOMPUTED_TRACE.length - 1})</span>
          </button>
          <button onClick={reset} className="btn-tactile btn-sm">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Explanation Banner */}
      <div
        style={{
          padding: '0.85rem 1.1rem',
          background: 'rgba(234, 179, 8, 0.08)',
          borderLeft: '4px solid var(--accent-amber)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.86rem',
          color: '#fef08a',
          marginBottom: '1.5rem',
          lineHeight: 1.6,
        }}
      >
        <strong>Step {currentTrace.step}: </strong> {currentTrace.explanation}
      </div>

      {/* Grid of Nodes in Frontier & Expanded Tree */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        {currentTrace.nodes.map((node) => {
          const isSelected = node.id === currentTrace.selectedId;
          const isGoal = node.status === 'goal';

          return (
            <div
              key={node.id}
              className="card"
              style={{
                padding: '0.85rem',
                border: isGoal
                  ? '2px solid var(--accent-emerald)'
                  : isSelected
                  ? '2px solid var(--accent-cyan)'
                  : '1px solid var(--border-medium)',
                background: isGoal
                  ? 'rgba(16, 185, 129, 0.1)'
                  : isSelected
                  ? 'rgba(56, 189, 248, 0.08)'
                  : 'var(--bg-card)',
                boxShadow: isSelected ? '0 0 15px rgba(56, 189, 248, 0.25)' : undefined,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
                  Node {node.id}
                </span>
                <span
                  className={`badge ${
                    isGoal
                      ? 'badge-emerald'
                      : node.status === 'expanded'
                      ? 'badge-indigo'
                      : 'badge-amber'
                  }`}
                  style={{ fontSize: '0.68rem' }}
                >
                  {isGoal ? 'GOAL' : node.status}
                </span>
              </div>

              {/* 3x3 Mini Board */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '2px',
                  background: '#090d16',
                  padding: '4px',
                  borderRadius: '4px',
                  width: '90px',
                  margin: '0 auto 0.6rem auto',
                }}
              >
                {node.board.map((tile, i) => (
                  <div
                    key={i}
                    style={{
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: tile === 0 ? 'transparent' : 'rgba(30, 41, 59, 0.9)',
                      border: tile === 0 ? '1px dashed rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '2px',
                      color: tile === 0 ? 'transparent' : '#f8fafc',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {tile === 0 ? '' : tile}
                  </div>
                ))}
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.4rem',
                }}
              >
                <span>Op: <strong style={{ color: '#e2e8f0' }}>{node.operator}</strong></span>
                <span className="font-mono" style={{ color: isGoal ? '#34d399' : '#38bdf8', fontWeight: 700 }}>
                  h1 = {node.h1}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Goal Banner */}
      {isFinished && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--accent-emerald)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <CheckCircle size={20} className="text-emerald-400 shrink-0" />
          <div style={{ fontSize: '0.85rem', color: '#a7f3d0' }}>
            <strong>Goal reached in 5 expansions! </strong>
            Optimal greedy path: <code>Root (id 0) → Right (id 3) → Up (id 4) → Left (id 7) → Down (id 8) → Right (id 9, Goal)</code>.
            Because $h_1$ reached 0, the search terminates without expanding further candidate branches.
          </div>
        </div>
      )}
    </div>
  );
};
