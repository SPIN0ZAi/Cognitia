/**
 * Cognitia Chase: "Why Does It Work?" Academic Heuristic Insight Modal
 * 
 * Explains the direct mathematical connection between classic 1980 arcade ghost AI
 * and Lesson 3's Informed Search (heuristics, greedy lookahead, A* comparison).
 */

import React from 'react';
import { X, Sparkles, ShieldAlert, Cpu } from 'lucide-react';

interface HeuristicInsightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HeuristicInsightModal: React.FC<HeuristicInsightModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '85vh',
          overflowY: 'auto',
          background: 'var(--lab-bg-surface)',
          border: '1.5px solid #213550',
          borderRadius: '16px',
          padding: '1.75rem',
          color: '#F8FAFC',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(120, 213, 232, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                padding: '0.55rem',
                borderRadius: '10px',
                background: 'rgba(120, 213, 232, 0.15)',
                border: '1px solid rgba(120, 213, 232, 0.3)',
                color: '#78D5E8',
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#78D5E8', letterSpacing: '0.05em' }}>
                LESSON 3 ACADEMIC BRIDGE
              </div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#F8FAFC' }}>
                Why Does It Work? The Heuristic Engine
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-tactile btn-sm"
            style={{ padding: '0.35rem 0.6rem', color: '#94A3B8' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Core Mathematical Concept */}
        <div
          style={{
            padding: '1rem',
            background: '#070c16',
            border: '1px solid #162438',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.84rem',
            lineHeight: 1.6,
          }}
        >
          <div style={{ color: '#C6F277', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Cpu size={16} /> 1-Step Lookahead Greedy Local Search
          </div>
          <p style={{ margin: '0 0 0.5rem 0', color: '#CBD5E1' }}>
            In 1980, running a full global A* graph search on a 3.072 MHz Z80 processor for 4 ghosts was computationally impossible.
            Instead, Toru Iwatani’s team designed a <strong>greedy 1-step lookahead informed search</strong>:
          </p>
          <div
            style={{
              padding: '0.6rem',
              background: '#03060a',
              borderRadius: '6px',
              border: '1px solid #1a2c42',
              textAlign: 'center',
              color: '#F8FAFC',
              fontWeight: 700,
            }}
          >
            h(n) = (n<sub>x</sub> - T<sub>x</sub>)² + (n<sub>y</sub> - T<sub>y</sub>)² &nbsp; | &nbsp; Action = argmin<sub>n</sub> h(n)
          </div>
          <p style={{ margin: '0.5rem 0 0 0', color: '#94A3B8', fontSize: '0.78rem' }}>
            At every tile intersection, the ghost evaluates adjacent walkable tiles and greedily chooses the neighbor tile that minimizes Euclidean distance to its active target tile T.
          </p>
        </div>

        {/* Ghost Targeting Breakdown Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
          {/* Blinky */}
          <div style={{ padding: '0.85rem', background: '#0a0d18', border: '1px solid #231620', borderRadius: '8px' }}>
            <div style={{ color: '#FF2A4A', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.3rem' }}>
              🔴 Blinky (Shadow) — Direct Target
            </div>
            <div style={{ fontSize: '0.78rem', color: '#CBD5E1', lineHeight: 1.5 }}>
              Target: <code style={{ color: '#C6F277' }}>T = (P<sub>x</sub>, P<sub>y</sub>)</code>
              <br />
              Direct gradient descent on the player’s exact coordinate. Accelerated by <em>Cruise Elroy</em> thresholds when few pellets remain.
            </div>
          </div>

          {/* Pinky */}
          <div style={{ padding: '0.85rem', background: '#0a0d18', border: '1px solid #2a1628', borderRadius: '8px' }}>
            <div style={{ color: '#FF7AC6', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.3rem' }}>
              🌸 Pinky (Speedy) — 4-Ahead Ambush
            </div>
            <div style={{ fontSize: '0.78rem', color: '#CBD5E1', lineHeight: 1.5 }}>
              Target: <code style={{ color: '#C6F277' }}>T = P + 4·d</code>
              <br />
              Anticipatory search. <strong>The 16-bit UP Bug:</strong> when Pac-Man moves Up, the vector overflow offsets 4 tiles Up AND 4 tiles Left!
            </div>
          </div>

          {/* Inky */}
          <div style={{ padding: '0.85rem', background: '#0a0d18', border: '1px solid #142838', borderRadius: '8px' }}>
            <div style={{ color: '#00F0FF', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.3rem' }}>
              🔷 Inky (Bashful) — 2x Vector Flanking
            </div>
            <div style={{ fontSize: '0.78rem', color: '#CBD5E1', lineHeight: 1.5 }}>
              Target: <code style={{ color: '#C6F277' }}>T = B + 2·((P + 2·d) - B)</code>
              <br />
              Collaborative multi-agent search. Doubles the vector from Blinky through the player to create pincer ambush routes.
            </div>
          </div>

          {/* Clyde */}
          <div style={{ padding: '0.85rem', background: '#0a0d18', border: '1px solid #2a2216', borderRadius: '8px' }}>
            <div style={{ color: '#FF9F1C', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.3rem' }}>
              🟠 Clyde (Pokey) — Distance 8 Threshold
            </div>
            <div style={{ fontSize: '0.78rem', color: '#CBD5E1', lineHeight: 1.5 }}>
              Target: <code style={{ color: '#C6F277' }}>dist ≥ 8 ? Player : (0, 31)</code>
              <br />
              Piecewise heuristic function. Chases like Blinky when far; cowers and flees to the bottom-left corner when near.
            </div>
          </div>
        </div>

        {/* Why A* is Better (Academic Takeaway) */}
        <div
          style={{
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '10px',
            fontSize: '0.82rem',
            lineHeight: 1.6,
          }}
        >
          <div style={{ color: '#F87171', fontWeight: 700, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldAlert size={16} /> Why Classic Ghosts Get Tricked (The Limit of Greedy Heuristics)
          </div>
          <p style={{ margin: 0, color: '#E2E8F0' }}>
            Because classic ghosts only evaluate the immediate 1-step lookahead without tracking accumulated path cost <code style={{ color: '#C6F277' }}>g(n)</code> or maintaining a closed explored set, they can easily get stuck on concave walls or looped into circular corridors!
            <br />
            Switching to <strong>Algorithm Mode (A*)</strong> solves this completely: A* balances <code style={{ color: '#C6F277' }}>f(n) = g(n) + h(n)</code> with a consistent heuristic, guaranteeing provably optimal shortest-path pursuit without ever getting trapped.
          </p>
        </div>
      </div>
    </div>
  );
};
