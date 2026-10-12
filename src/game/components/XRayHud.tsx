/**
 * Cognitia Chase: X-Ray Telemetry HUD
 * 
 * Signature feature: Floating real-time HUD displaying the active algorithm's
 * search evaluation metrics (g, h, f, nodes expanded, calculation time).
 */

import React from 'react';
import type { GhostEntity, GhostPersonality } from '../engine/types';
import { GHOST_PROFILES } from '../engine/GhostAI';
import { Eye } from 'lucide-react';

interface XRayHudProps {
  ghosts: GhostEntity[];
  activePersonality: GhostPersonality;
  onSelectPersonality: (personality: GhostPersonality) => void;
  heuristicType: 'manhattan' | 'euclidean' | 'inadmissible';
  onSelectHeuristic?: (h: 'manhattan' | 'euclidean' | 'inadmissible') => void;
  isGhostLab?: boolean;
}

export const XRayHud: React.FC<XRayHudProps> = ({
  ghosts,
  activePersonality,
  onSelectPersonality,
  heuristicType,
  onSelectHeuristic,
  isGhostLab = false,
}) => {
  const activeGhost = ghosts.find((g) => g.personality === activePersonality) || ghosts[0];
  if (!activeGhost) return null;

  const t = activeGhost.telemetry;
  const profile = GHOST_PROFILES[activeGhost.personality];

  // Mathematical formula indicator
  let formulaText = 'f(n) = g(n) + h(n)';
  if (activeGhost.personality === 'bfs') formulaText = 'FIFO Layer Ring Queue (Hop-Count)';
  else if (activeGhost.personality === 'ucs') formulaText = 'Priority Queue on g(n)';
  else if (activeGhost.personality === 'dfs') formulaText = 'LIFO Branch Stack (Deepest First)';
  else if (activeGhost.personality === 'greedy') formulaText = 'Priority Queue on h(n)';

  return (
    <div
      style={{
        background: 'rgba(6, 9, 14, 0.92)',
        border: `1px solid ${profile.color}`,
        borderRadius: '8px',
        padding: '0.85rem 1rem',
        backdropFilter: 'blur(8px)',
        boxShadow: `0 0 15px ${profile.color}22`,
        color: '#F1F5F9',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {/* Top Header: Ghost Algorithm Selector */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          borderBottom: '1px solid #1c2738',
          paddingBottom: '0.65rem',
          marginBottom: '0.65rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Eye size={16} color={profile.color} />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', color: profile.color }}>
            LIVE X-RAY SEARCH RADAR
          </span>
        </div>

        {/* Algorithm Tabs */}
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {ghosts.map((g) => {
            const isSelected = g.personality === activePersonality;
            return (
              <button
                key={g.id}
                onClick={() => onSelectPersonality(g.personality)}
                style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  background: isSelected ? `${g.color}33` : '#0d1522',
                  border: `1px solid ${isSelected ? g.color : '#233249'}`,
                  color: isSelected ? g.color : '#94A3B8',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 700 : 500,
                  transition: 'all 0.15s ease',
                }}
              >
                {g.personality.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Identity & Formula Readout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
        <div>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: profile.color }}>
            {profile.name}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748B', marginLeft: '0.5rem' }}>
            [{profile.codename}]
          </span>
        </div>
        <span
          style={{
            fontSize: '0.7rem',
            padding: '0.15rem 0.4rem',
            borderRadius: '3px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#CBD5E1',
          }}
        >
          {formulaText}
        </span>
      </div>

      {/* Telemetry Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))',
          gap: '0.5rem',
          background: 'rgba(0,0,0,0.3)',
          padding: '0.5rem',
          borderRadius: '6px',
          border: '1px solid #141f2e',
        }}
      >
        <div>
          <div style={{ fontSize: '0.62rem', color: '#64748B' }}>PATH COST g(n)</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#78D5E8' }}>
            {t.currentG.toFixed(1)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.62rem', color: '#64748B' }}>HEURISTIC h(n)</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F59E0B' }}>
            {t.currentH.toFixed(1)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.62rem', color: '#64748B' }}>EVAL f(n)</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#C6F277' }}>
            {t.currentF.toFixed(1)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.62rem', color: '#64748B' }}>EXPANDED</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F1F5F9' }}>
            {t.nodesExpanded}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.62rem', color: '#64748B' }}>FRONTIER</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: profile.color }}>
            {t.frontierTiles.length}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.62rem', color: '#64748B' }}>TIME</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#94A3B8' }}>
            {t.calculationTimeMs}ms
          </div>
        </div>
      </div>

      {/* Ghost Lab Heuristic Selector */}
      {isGhostLab && onSelectHeuristic && (
        <div style={{ marginTop: '0.6rem', borderTop: '1px solid #1c2738', paddingTop: '0.5rem' }}>
          <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginBottom: '0.35rem' }}>
            HEURISTIC EXPERIMENT SELECTION:
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {(['manhattan', 'euclidean', 'inadmissible'] as const).map((h) => {
              const isHActive = heuristicType === h;
              return (
                <button
                  key={h}
                  onClick={() => onSelectHeuristic(h)}
                  style={{
                    fontSize: '0.68rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: isHActive ? 'rgba(198, 242, 119, 0.15)' : '#0d1522',
                    border: `1px solid ${isHActive ? '#C6F277' : '#233249'}`,
                    color: isHActive ? '#C6F277' : '#94A3B8',
                    cursor: 'pointer',
                    fontWeight: isHActive ? 700 : 500,
                  }}
                >
                  {h === 'manhattan'
                    ? 'Manhattan (Admissible)'
                    : h === 'euclidean'
                    ? 'Euclidean (Admissible)'
                    : '3x Manhattan (INADMISSIBLE)'}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
