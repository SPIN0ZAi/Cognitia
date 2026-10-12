/**
 * Cognitia Chase: Mobile Touch D-Pad & Control Deck
 * Responsive virtual directional pad designed for mobile touch screens
 */

import React from 'react';
import type { Direction } from '../engine/types';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface TouchControlsProps {
  onDirection: (dir: Direction) => void;
  activeDir?: Direction;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onDirection,
  activeDir,
}) => {
  const btnStyle = (dir: Direction): React.CSSProperties => {
    const isActive = activeDir === dir;
    return {
      width: '52px',
      height: '52px',
      borderRadius: '12px',
      background: isActive ? 'rgba(120, 213, 232, 0.25)' : 'rgba(15, 23, 42, 0.75)',
      border: `1.5px solid ${isActive ? '#78D5E8' : 'rgba(148, 163, 184, 0.2)'}`,
      color: isActive ? '#78D5E8' : '#F1F5F9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      touchAction: 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      boxShadow: isActive ? '0 0 12px rgba(120, 213, 232, 0.3)' : '0 4px 6px rgba(0,0,0,0.4)',
      cursor: 'pointer',
      transition: 'all 0.1s ease',
    };
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        padding: '0.5rem',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      {/* Up */}
      <button
        style={btnStyle('up')}
        onTouchStart={(e) => {
          e.preventDefault();
          onDirection('up');
        }}
        onClick={() => onDirection('up')}
        aria-label="Move Up"
      >
        <ArrowUp size={24} />
      </button>

      {/* Middle row: Left, Center, Right */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <button
          style={btnStyle('left')}
          onTouchStart={(e) => {
            e.preventDefault();
            onDirection('left');
          }}
          onClick={() => onDirection('left')}
          aria-label="Move Left"
        >
          <ArrowLeft size={24} />
        </button>

        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(6, 9, 14, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#78D5E8' }} />
        </div>

        <button
          style={btnStyle('right')}
          onTouchStart={(e) => {
            e.preventDefault();
            onDirection('right');
          }}
          onClick={() => onDirection('right')}
          aria-label="Move Right"
        >
          <ArrowRight size={24} />
        </button>
      </div>

      {/* Down */}
      <button
        style={btnStyle('down')}
        onTouchStart={(e) => {
          e.preventDefault();
          onDirection('down');
        }}
        onClick={() => onDirection('down')}
        aria-label="Move Down"
      >
        <ArrowDown size={24} />
      </button>
    </div>
  );
};
