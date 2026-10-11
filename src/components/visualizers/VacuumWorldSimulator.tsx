import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

export const VacuumWorldSimulator: React.FC = () => {
  const [robotLocation, setRobotLocation] = useState<'A' | 'B'>('A');
  const [dirtA, setDirtA] = useState(true);
  const [dirtB, setDirtB] = useState(true);
  const [actionHistory, setActionHistory] = useState<string[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reflex agent program from Lesson 2, Slide 6:
  // if (status == dirty) then Suck
  // else if location == A then return Right
  // else return Left
  const runReflexStep = () => {
    const isCurrentDirty = robotLocation === 'A' ? dirtA : dirtB;

    if (isCurrentDirty) {
      if (robotLocation === 'A') setDirtA(false);
      else setDirtB(false);
      setActionHistory((prev) => [...prev, `Suck at ${robotLocation} (Cost +1)`]);
      setTotalCost((prev) => prev + 1);
    } else {
      if (robotLocation === 'A') {
        setRobotLocation('B');
        setActionHistory((prev) => [...prev, 'Move Right to B (Cost +1)']);
        setTotalCost((prev) => prev + 1);
      } else {
        setRobotLocation('A');
        setActionHistory((prev) => [...prev, 'Move Left to A (Cost +1)']);
        setTotalCost((prev) => prev + 1);
      }
    }
  };

  useEffect(() => {
    if (isRunning) {
      // Check if cleaned
      if (!dirtA && !dirtB) {
        setIsRunning(false);
        setActionHistory((prev) => [...prev, 'Goal state reached! Both rooms clean. NoOp.']);
        return;
      }
      timerRef.current = setInterval(() => {
        runReflexStep();
      }, 700);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, dirtA, dirtB, robotLocation]);

  const reset = () => {
    setIsRunning(false);
    setRobotLocation('A');
    setDirtA(true);
    setDirtB(true);
    setActionHistory([]);
    setTotalCost(0);
  };

  // State number 1..8 calculation according to Lesson 2, Slide 12
  // States 1-4: robot at A, [D,D], [D,C], [C,D], [C,C]
  // States 5-8: robot at B, [D,D], [D,C], [C,D], [C,C]
  const getStateId = () => {
    const atA = robotLocation === 'A';
    if (atA) {
      if (dirtA && dirtB) return 1;
      if (dirtA && !dirtB) return 3;
      if (!dirtA && dirtB) return 5;
      return 7;
    } else {
      if (dirtA && dirtB) return 2;
      if (dirtA && !dirtB) return 4;
      if (!dirtA && dirtB) return 6;
      return 8;
    }
  };

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Sparkles size={18} className="text-cyan-400" />
            Vacuum World Reflex Agent Simulator (Lesson 2, Slide 6 & 12)
          </div>
          <div className="visualizer-subtitle">
            8-State Transition Space, Percept Mapping & Reflex Action Loop
          </div>
        </div>

        <div className="visualizer-controls">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`btn-tactile ${isRunning ? 'btn-amber' : 'btn-primary'}`}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
            {isRunning ? 'Pause' : 'Run Agent'}
          </button>
          <button onClick={runReflexStep} disabled={isRunning} className="btn-tactile">
            Step
          </button>
          <button onClick={reset} className="btn-tactile">
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      <div className="visualizer-body">
        <div className="vacuum-grid">
          {/* Room A */}
          <div className={`vacuum-room ${robotLocation === 'A' ? 'has-robot' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <strong style={{ fontSize: '1.1rem' }}>Square A</strong>
              <button
                onClick={() => setDirtA(!dirtA)}
                className={`dirt-indicator ${dirtA ? 'dirty' : 'clean'}`}
                style={{ cursor: 'pointer', border: 'none' }}
              >
                {dirtA ? 'Dirty' : 'Clean'}
              </button>
            </div>

            <div style={{ margin: '1.5rem 0', minHeight: '60px', display: 'flex', alignItems: 'center' }}>
              {robotLocation === 'A' ? (
                <div style={{ fontSize: '2.5rem' }}>🤖</div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Empty</div>
              )}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Percept: [{robotLocation === 'A' ? 'A' : 'Other'}, {dirtA ? 'Dirty' : 'Clean'}]
            </div>
          </div>

          {/* Room B */}
          <div className={`vacuum-room ${robotLocation === 'B' ? 'has-robot' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <strong style={{ fontSize: '1.1rem' }}>Square B</strong>
              <button
                onClick={() => setDirtB(!dirtB)}
                className={`dirt-indicator ${dirtB ? 'dirty' : 'clean'}`}
                style={{ cursor: 'pointer', border: 'none' }}
              >
                {dirtB ? 'Dirty' : 'Clean'}
              </button>
            </div>

            <div style={{ margin: '1.5rem 0', minHeight: '60px', display: 'flex', alignItems: 'center' }}>
              {robotLocation === 'B' ? (
                <div style={{ fontSize: '2.5rem' }}>🤖</div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Empty</div>
              )}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Percept: [{robotLocation === 'B' ? 'B' : 'Other'}, {dirtB ? 'Dirty' : 'Clean'}]
            </div>
          </div>
        </div>

        {/* Telemetry and Action Log */}
        <div className="grid-2" style={{ marginTop: '1.25rem' }}>
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>
              State Space Telemetry (Slide 12)
            </div>
            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div>Current Discrete State: <strong className="font-mono text-amber-400">State {getStateId()} of 8</strong></div>
              <div>Goal State?: <span className="font-mono">{!dirtA && !dirtB ? 'YES (Goal 7 or 8)' : 'NO (Dirty)'}</span></div>
              <div>Accumulated Path Cost: <strong className="font-mono text-cyan-400">{totalCost}</strong></div>
            </div>
          </div>

          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Agent Action History
            </div>
            <div style={{ maxHeight: '110px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              {actionHistory.length === 0 ? (
                <span style={{ color: 'var(--text-muted)' }}>No actions taken yet.</span>
              ) : (
                actionHistory.map((act, i) => <div key={i}>• {act}</div>)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
