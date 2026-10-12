import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { useLabTheme } from '../../context/LabThemeContext';

interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'lime' | 'cyan' | 'amber' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  ledStatus?: 'active' | 'idle' | 'warning' | 'off';
  cursorLabel?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  ledStatus,
  cursorLabel,
  icon,
  children,
  onClick,
  disabled,
  className = '',
  style,
  ...rest
}) => {
  const { playClick } = useLabTheme();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      playClick(variant === 'primary' || variant === 'lime' ? 'heavy' : 'soft');
      onClick?.(e);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'lime':
        return {
          background: 'linear-gradient(180deg, #182713 0%, #0e170c 100%)',
          border: '1px solid #4d7c1e',
          color: '#C6F277',
          boxShadow: '0 2px 0 #070d05, inset 0 1px 0 rgba(198, 242, 119, 0.25)',
        };
      case 'cyan':
        return {
          background: 'linear-gradient(180deg, #10252e 0%, #09171e 100%)',
          border: '1px solid #1f6b80',
          color: '#78D5E8',
          boxShadow: '0 2px 0 #050d12, inset 0 1px 0 rgba(120, 213, 232, 0.25)',
        };
      case 'amber':
        return {
          background: 'linear-gradient(180deg, #2b1f11 0%, #171108 100%)',
          border: '1px solid #85571c',
          color: '#E9B777',
          boxShadow: '0 2px 0 #0e0a05, inset 0 1px 0 rgba(233, 183, 119, 0.25)',
        };
      case 'primary':
        return {
          background: 'linear-gradient(180deg, #132437 0%, #0d1724 100%)',
          border: '1px solid #234c75',
          color: '#F1F5F9',
          boxShadow: '0 2px 0 #070c12, inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        };
      case 'danger':
        return {
          background: 'linear-gradient(180deg, #2b1116 0%, #17090c 100%)',
          border: '1px solid #85222f',
          color: '#f87171',
          boxShadow: '0 2px 0 #0e0507, inset 0 1px 0 rgba(248, 113, 113, 0.25)',
        };
      default:
        return {
          background: 'linear-gradient(180deg, #141b27 0%, #0c1017 100%)',
          border: '1px solid #243044',
          color: '#E2E8F0',
          boxShadow: '0 2px 0 #06090e, inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '0.35rem 0.65rem', fontSize: '0.74rem', gap: '0.35rem' };
      case 'lg':
        return { padding: '0.65rem 1.25rem', fontSize: '0.92rem', gap: '0.6rem' };
      default:
        return { padding: '0.5rem 0.95rem', fontSize: '0.82rem', gap: '0.45rem' };
    }
  };

  return (
    <button
      {...rest}
      disabled={disabled}
      onClick={handleClick}
      data-cursor-label={cursorLabel}
      className={`tactile-instrument-btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        letterSpacing: '0.02em',
        borderRadius: '6px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'all 0.1s ease-in-out',
        position: 'relative',
        userSelect: 'none',
        outline: 'none',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
    >
      {ledStatus && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor:
              ledStatus === 'active'
                ? '#C6F277'
                : ledStatus === 'warning'
                ? '#E9B777'
                : ledStatus === 'idle'
                ? '#78D5E8'
                : '#334155',
            boxShadow:
              ledStatus !== 'off'
                ? `0 0 6px ${
                    ledStatus === 'active'
                      ? '#C6F277'
                      : ledStatus === 'warning'
                      ? '#E9B777'
                      : '#78D5E8'
                  }`
                : 'none',
            marginRight: '0.15rem',
          }}
        />
      )}
      {icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      {children}
    </button>
  );
};

export const StatusLed: React.FC<{
  status?: 'active' | 'idle' | 'warning' | 'danger';
  label?: string;
}> = ({ status = 'active', label }) => {
  const getColor = () => {
    switch (status) {
      case 'active':
        return '#C6F277';
      case 'warning':
        return '#E9B777';
      case 'danger':
        return '#F87171';
      default:
        return '#78D5E8';
    }
  };

  const col = getColor();

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: col,
          boxShadow: `0 0 8px ${col}`,
          animation: status === 'active' ? 'ledBreathe 2s infinite ease-in-out' : 'none',
        }}
      />
      {label && (
        <span
          style={{
            fontSize: '0.68rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--lab-text-muted, #94A3B8)',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export const CoordinateStamp: React.FC<{
  sectionCode?: string;
  statusText?: string;
  coords?: string;
}> = ({
  sectionCode = 'SYS:01',
  statusText = 'ALGO_FIELD_READY',
  coords = '45.9432°N 24.9668°E',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.66rem',
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        letterSpacing: '0.08em',
        color: 'var(--lab-text-hairline, #526077)',
        borderBottom: '1px solid var(--lab-border-subtle, rgba(255,255,255,0.06))',
        paddingBottom: '0.35rem',
        marginBottom: '0.75rem',
        textTransform: 'uppercase',
      }}
    >
      <span>{sectionCode} // {statusText}</span>
      <span>{coords}</span>
    </div>
  );
};

export interface TransportDeckProps {
  isPlaying: boolean;
  onPlayToggle: () => void;
  onStepForward?: () => void;
  onStepBackward?: () => void;
  onReset: () => void;
  speedMs: number;
  onSpeedChange: (speedMs: number) => void;
  canStepForward?: boolean;
  canStepBackward?: boolean;
  stepCount?: number;
  maxSteps?: number;
}

export const TransportDeck: React.FC<TransportDeckProps> = ({
  isPlaying,
  onPlayToggle,
  onStepForward,
  onStepBackward,
  onReset,
  speedMs,
  onSpeedChange,
  canStepForward = true,
  canStepBackward = false,
  stepCount = 0,
  maxSteps,
}) => {
  const { playClick } = useLabTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '0.65rem 0.85rem',
        background: 'linear-gradient(180deg, #0d131e 0%, #080c13 100%)',
        border: '1px solid #1f2b3e',
        borderRadius: '8px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {/* Playback Transport Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        {onStepBackward && (
          <TactileButton
            size="sm"
            onClick={onStepBackward}
            disabled={!canStepBackward || isPlaying}
            icon={<SkipBack size={13} />}
            cursorLabel="STEP_BACK"
            title="Step Backward"
          />
        )}

        <TactileButton
          size="sm"
          variant={isPlaying ? 'amber' : 'lime'}
          ledStatus={isPlaying ? 'active' : 'idle'}
          onClick={onPlayToggle}
          icon={isPlaying ? <Pause size={13} /> : <Play size={13} />}
          cursorLabel={isPlaying ? 'PAUSE_ENGINE' : 'RUN_ENGINE'}
        >
          {isPlaying ? 'Pause' : 'Execute'}
        </TactileButton>

        {onStepForward && (
          <TactileButton
            size="sm"
            onClick={onStepForward}
            disabled={!canStepForward || isPlaying}
            icon={<SkipForward size={13} />}
            cursorLabel="STEP_FWD"
            title="Step Forward"
          >
            Step
          </TactileButton>
        )}

        <TactileButton
          size="sm"
          onClick={onReset}
          icon={<RotateCcw size={12} />}
          cursorLabel="RESET_WORLD"
          title="Reset Simulation"
        />
      </div>

      {/* Step Counter Telemetry */}
      {maxSteps !== undefined && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--lab-text-muted, #94A3B8)',
          }}
        >
          <span>CYCLE:</span>
          <span style={{ color: '#C6F277', fontWeight: 700 }}>
            {stepCount.toString().padStart(2, '0')}
          </span>
          <span>/</span>
          <span>{maxSteps.toString().padStart(2, '0')}</span>
        </div>
      )}

      {/* Detented Speed Selector Switch */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.2rem',
          background: '#070a10',
          padding: '0.2rem',
          borderRadius: '5px',
          border: '1px solid #1a2434',
        }}
      >
        <span
          style={{
            fontSize: '0.66rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--lab-text-muted)',
            padding: '0 0.35rem',
            fontWeight: 700,
          }}
        >
          SPD:
        </span>
        {[
          { label: '0.5x', ms: 1200 },
          { label: '1.0x', ms: 750 },
          { label: '2.0x', ms: 350 },
          { label: '4.0x', ms: 120 },
        ].map((s) => {
          const isActive = speedMs === s.ms;
          return (
            <button
              key={s.label}
              type="button"
              onClick={() => {
                playClick('toggle');
                onSpeedChange(s.ms);
              }}
              style={{
                background: isActive ? '#1c283c' : 'transparent',
                border: isActive ? '1px solid #38bdf8' : '1px solid transparent',
                color: isActive ? '#78D5E8' : 'var(--lab-text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                fontWeight: isActive ? 700 : 500,
                padding: '0.2rem 0.45rem',
                borderRadius: '3px',
                cursor: 'pointer',
                transition: 'all 0.1s ease',
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const PseudocodeViewer: React.FC<{
  title?: string;
  lines: string[];
  activeLineIndex?: number;
}> = ({ title = 'ALGORITHM PSEUDOCODE', lines, activeLineIndex = -1 }) => {
  return (
    <div
      style={{
        background: '#070a11',
        border: '1px solid #1b2638',
        borderRadius: '6px',
        overflow: 'hidden',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.74rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.35rem 0.65rem',
          background: '#0b111a',
          borderBottom: '1px solid #162030',
          fontSize: '0.66rem',
          fontWeight: 700,
          color: '#78D5E8',
          letterSpacing: '0.06em',
        }}
      >
        <span>{title}</span>
        <span style={{ color: 'var(--lab-text-hairline)' }}>
          LINE: {activeLineIndex >= 0 ? activeLineIndex + 1 : 'IDLE'}
        </span>
      </div>
      <div style={{ padding: '0.45rem 0', maxHeight: '160px', overflowY: 'auto' }}>
        {lines.map((line, idx) => {
          const isActive = idx === activeLineIndex;
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.15rem 0.65rem',
                backgroundColor: isActive ? 'rgba(120, 213, 232, 0.12)' : 'transparent',
                borderLeft: isActive ? '3px solid #78D5E8' : '3px solid transparent',
                color: isActive ? '#F1F5F9' : '#8898aa',
                lineHeight: 1.5,
              }}
            >
              <span
                style={{
                  width: '24px',
                  color: isActive ? '#78D5E8' : '#3e4e63',
                  userSelect: 'none',
                  fontSize: '0.66rem',
                }}
              >
                {(idx + 1).toString().padStart(2, '0')}
              </span>
              <span style={{ whiteSpace: 'pre', fontWeight: isActive ? 600 : 400 }}>
                {line}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
