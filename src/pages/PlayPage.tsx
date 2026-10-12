/**
 * Cognitia Chase: Learn & Play Page
 */

import React from 'react';
import { CognitiaChaseGame } from '../game/components/CognitiaChaseGame';
import { CoordinateStamp } from '../components/common/InstrumentControls';

interface PlayPageProps {
  onNavigate: (view: string, lessonId?: string, sectionId?: string) => void;
}

export const PlayPage: React.FC<PlayPageProps> = ({ onNavigate }) => {
  return (
    <div className="page-wrapper animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <CoordinateStamp
        sectionCode="SYS:04 // LEARN_AND_PLAY"
        statusText="ARCADE_SIMULATOR_ACTIVE"
        coords="UCLM // COGNITIA_CHASE // FIXED_60HZ"
      />

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem' }}>
        <button
          onClick={() => onNavigate('home')}
          className="btn-tactile btn-sm"
          style={{ padding: '0.2rem 0.6rem', fontSize: '0.78rem' }}
        >
          ← Course Home
        </button>
        <span style={{ color: 'var(--lab-text-muted)' }}>/</span>
        <span style={{ color: 'var(--lab-accent-lime)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          Learn &amp; Play (Cognitia Chase: Maze Agents)
        </span>
      </div>

      <CognitiaChaseGame />
    </div>
  );
};
