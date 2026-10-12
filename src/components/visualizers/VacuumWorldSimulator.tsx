import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ArrowRight, ArrowLeft, Disc, EyeOff, Sparkles } from 'lucide-react';

interface VacuumStateSpec {
  id: number;
  loc: 'A' | 'B';
  dirtA: boolean;
  dirtB: boolean;
  isGoal: boolean;
  label: string;
  x: number;
  y: number;
}

// 8 Discrete States as specified in Lesson 2, Slide 12
const STATES_SPEC: VacuumStateSpec[] = [
  // Row 1: Both Dirty
  { id: 1, loc: 'A', dirtA: true, dirtB: true, isGoal: false, label: 'State 1: [A, Dirty, Dirty]', x: 130, y: 50 },
  { id: 2, loc: 'B', dirtA: true, dirtB: true, isGoal: false, label: 'State 2: [B, Dirty, Dirty]', x: 470, y: 50 },

  // Row 2 Left: A Dirty, B Clean
  { id: 3, loc: 'A', dirtA: true, dirtB: false, isGoal: false, label: 'State 3: [A, Dirty, Clean]', x: 50, y: 170 },
  { id: 4, loc: 'B', dirtA: true, dirtB: false, isGoal: false, label: 'State 4: [B, Dirty, Clean]', x: 230, y: 170 },

  // Row 2 Right: A Clean, B Dirty
  { id: 5, loc: 'A', dirtA: false, dirtB: true, isGoal: false, label: 'State 5: [A, Clean, Dirty]', x: 370, y: 170 },
  { id: 6, loc: 'B', dirtA: false, dirtB: true, isGoal: false, label: 'State 6: [B, Clean, Dirty]', x: 550, y: 170 },

  // Row 3: Both Clean (GOALS)
  { id: 7, loc: 'A', dirtA: false, dirtB: false, isGoal: true, label: 'State 7: [A, Clean, Clean] (GOAL)', x: 130, y: 290 },
  { id: 8, loc: 'B', dirtA: false, dirtB: false, isGoal: true, label: 'State 8: [B, Clean, Clean] (GOAL)', x: 470, y: 290 },
];

export const VacuumWorldSimulator: React.FC = () => {
  // Current known state
  const [robotLocation, setRobotLocation] = useState<'A' | 'B'>('A');
  const [dirtA, setDirtA] = useState(true);
  const [dirtB, setDirtB] = useState(true);
  const [totalCost, setTotalCost] = useState(0);
  const [actionHistory, setActionHistory] = useState<string[]>([]);

  // Simulation mode: 'reflex' | 'manual' | 'belief'
  const [mode, setMode] = useState<'reflex' | 'manual' | 'belief'>('reflex');
  const [isRunning, setIsRunning] = useState(false);
  const [speedMs, setSpeedMs] = useState(800);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Belief state mode: set of possible states {1..8}
  const [beliefSet, setBeliefSet] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8]);
  const [blindStepIndex, setBlindStepIndex] = useState(0);

  // Compute state ID 1..8
  const getCurrentStateId = (loc: 'A' | 'B' = robotLocation, dA: boolean = dirtA, dB: boolean = dirtB): number => {
    if (loc === 'A') {
      if (dA && dB) return 1;
      if (dA && !dB) return 3;
      if (!dA && dB) return 5;
      return 7;
    } else {
      if (dA && dB) return 2;
      if (dA && !dB) return 4;
      if (!dA && dB) return 6;
      return 8;
    }
  };

  const currentStateId = getCurrentStateId();
  const isGoal = !dirtA && !dirtB;

  // Set physical state directly from state ID
  const setStateFromId = (id: number) => {
    const s = STATES_SPEC.find((st) => st.id === id);
    if (!s) return;
    setRobotLocation(s.loc);
    setDirtA(s.dirtA);
    setDirtB(s.dirtB);
    setActionHistory((prev) => [...prev, `Selected ${s.label}`]);
  };

  // Perform an action
  const applyAction = (action: 'Left' | 'Right' | 'Suck' | 'NoOp') => {
    if (action === 'NoOp') {
      setActionHistory((prev) => [...prev, 'Action: NoOp (Cost +0)']);
      return;
    }

    if (action === 'Left') {
      setRobotLocation('A');
      setTotalCost((prev) => prev + 1);
      setActionHistory((prev) => [...prev, 'Action: Left (Cost +1)']);
    } else if (action === 'Right') {
      setRobotLocation('B');
      setTotalCost((prev) => prev + 1);
      setActionHistory((prev) => [...prev, 'Action: Right (Cost +1)']);
    } else if (action === 'Suck') {
      if (robotLocation === 'A') setDirtA(false);
      else setDirtB(false);
      setTotalCost((prev) => prev + 1);
      setActionHistory((prev) => [...prev, `Action: Suck at Room ${robotLocation} (Cost +1)`]);
    }

    // If in belief state mode, update belief set transitions
    if (mode === 'belief') {
      updateBeliefState(action);
    }
  };

  // Transition function for a specific state under an action
  const transitionState = (stateId: number, action: 'Left' | 'Right' | 'Suck'): number => {
    const st = STATES_SPEC.find((s) => s.id === stateId);
    if (!st) return stateId;
    let nextLoc = st.loc;
    let nextDA = st.dirtA;
    let nextDB = st.dirtB;

    if (action === 'Left') nextLoc = 'A';
    if (action === 'Right') nextLoc = 'B';
    if (action === 'Suck') {
      if (st.loc === 'A') nextDA = false;
      if (st.loc === 'B') nextDB = false;
    }
    return getCurrentStateId(nextLoc, nextDA, nextDB);
  };

  // Update belief set according to action
  const updateBeliefState = (action: 'Left' | 'Right' | 'Suck') => {
    const nextSet = Array.from(new Set(beliefSet.map((sId) => transitionState(sId, action)))).sort((a, b) => a - b);
    setBeliefSet(nextSet);
  };

  // Reflex Agent Step (Lesson 2, Slide 6)
  const runReflexStep = () => {
    const isCurrentDirty = robotLocation === 'A' ? dirtA : dirtB;
    if (isCurrentDirty) {
      applyAction('Suck');
    } else if (robotLocation === 'A') {
      applyAction('Right');
    } else {
      applyAction('Left');
    }
  };

  // Timer loop for auto reflex execution
  useEffect(() => {
    if (isRunning) {
      if (isGoal) {
        setIsRunning(false);
        setActionHistory((prev) => [...prev, 'Goal state reached! Both rooms clean. Stopping.']);
        return;
      }
      timerRef.current = setInterval(() => {
        runReflexStep();
      }, speedMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, dirtA, dirtB, robotLocation, speedMs]);

  // Reset simulator
  const reset = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setRobotLocation('A');
    setDirtA(true);
    setDirtB(true);
    setTotalCost(0);
    setActionHistory(['Reset to initial State 1 [A, Dirty, Dirty]']);
    setBeliefSet([1, 2, 3, 4, 5, 6, 7, 8]);
    setBlindStepIndex(0);
  };

  // Precomputed 4-step sequence for Unknown Initial State (Eyes Closed Solver)
  const BLIND_SEQUENCE: ('Right' | 'Suck' | 'Left' | 'Suck')[] = ['Right', 'Suck', 'Left', 'Suck'];

  const stepBlindSequence = () => {
    if (blindStepIndex < BLIND_SEQUENCE.length) {
      const act = BLIND_SEQUENCE[blindStepIndex];
      applyAction(act);
      setBlindStepIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="visualizer-container">
      {/* Header */}
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Sparkles size={18} className="text-cyan-400" />
            Full 8-State Vacuum World & Reflex Agent (Lesson 2, Slides 6 & 12)
          </div>
          <div className="visualizer-subtitle">
            Complete State Space Transition Graph {'{1..8}'}, Reflex Program &amp; Unknown Initial State Search
          </div>
        </div>

        <div className="visualizer-controls">
          {mode === 'reflex' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Speed:</span>
                <button
                  type="button"
                  onClick={() => setSpeedMs(1200)}
                  className={`btn-tactile btn-sm ${speedMs === 1200 ? 'btn-primary' : ''}`}
                  style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                >
                  0.5x
                </button>
                <button
                  type="button"
                  onClick={() => setSpeedMs(800)}
                  className={`btn-tactile btn-sm ${speedMs === 800 ? 'btn-primary' : ''}`}
                  style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                >
                  1x
                </button>
                <button
                  type="button"
                  onClick={() => setSpeedMs(400)}
                  className={`btn-tactile btn-sm ${speedMs === 400 ? 'btn-primary' : ''}`}
                  style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                >
                  2x
                </button>
              </div>
              <button
                onClick={() => setIsRunning(!isRunning)}
                disabled={isGoal}
                className={`btn-tactile ${isRunning ? 'btn-amber' : 'btn-primary'}`}
              >
                {isRunning ? <Pause size={14} /> : <Play size={14} />}
                {isRunning ? 'Pause' : 'Run Reflex Agent'}
              </button>
              <button onClick={runReflexStep} disabled={isRunning || isGoal} className="btn-tactile">
                Step Reflex
              </button>
            </>
          )}

          {mode === 'belief' && (
            <button
              onClick={stepBlindSequence}
              disabled={blindStepIndex >= BLIND_SEQUENCE.length}
              className="btn-tactile btn-amber"
            >
              Step Eyes-Closed Plan ({blindStepIndex}/4)
            </button>
          )}

          <button onClick={reset} className="btn-tactile">
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      <div className="visualizer-body">
        {/* Mode Selector Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.25rem',
            padding: '0.4rem',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={() => {
              setMode('reflex');
              setIsRunning(false);
            }}
            className={`btn-tactile btn-sm ${mode === 'reflex' ? 'btn-primary' : ''}`}
            style={{ flex: 1 }}
          >
            Reflex Agent Mode (Slide 6)
          </button>
          <button
            onClick={() => {
              setMode('manual');
              setIsRunning(false);
            }}
            className={`btn-tactile btn-sm ${mode === 'manual' ? 'btn-primary' : ''}`}
            style={{ flex: 1 }}
          >
            Manual Actions Mode
          </button>
          <button
            onClick={() => {
              setMode('belief');
              setIsRunning(false);
              setBeliefSet([1, 2, 3, 4, 5, 6, 7, 8]);
              setBlindStepIndex(0);
            }}
            className={`btn-tactile btn-sm ${mode === 'belief' ? 'btn-amber' : ''}`}
            style={{ flex: 1 }}
          >
            Unknown Initial State / Belief States (Slide 12)
          </button>
        </div>

        {/* Dual Layout: Physical Grid + 8-State Space Transition Graph */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Left Column: Physical Environment & Controls */}
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#f8fafc' }}>
              Physical Environment (Rooms A & B)
            </div>

            <div className="vacuum-grid" style={{ margin: '0 0 1rem 0' }}>
              {/* Room A */}
              <div className={`vacuum-room ${robotLocation === 'A' ? 'has-robot' : ''}`} style={{ minHeight: '170px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <strong style={{ fontSize: '1rem', color: '#38bdf8' }}>Square A</strong>
                  <button
                    onClick={() => setDirtA(!dirtA)}
                    className={`dirt-indicator ${dirtA ? 'dirty' : 'clean'}`}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {dirtA ? 'Dirty' : 'Clean'}
                  </button>
                </div>

                <div style={{ margin: '1rem 0', minHeight: '50px', display: 'flex', alignItems: 'center' }}>
                  {robotLocation === 'A' ? (
                    <div style={{ fontSize: '2.5rem' }}>🤖</div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Empty</div>
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Percept: [{robotLocation === 'A' ? 'A' : 'Other'}, {dirtA ? 'Dirty' : 'Clean'}]
                </div>
              </div>

              {/* Room B */}
              <div className={`vacuum-room ${robotLocation === 'B' ? 'has-robot' : ''}`} style={{ minHeight: '170px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <strong style={{ fontSize: '1rem', color: '#38bdf8' }}>Square B</strong>
                  <button
                    onClick={() => setDirtB(!dirtB)}
                    className={`dirt-indicator ${dirtB ? 'dirty' : 'clean'}`}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {dirtB ? 'Dirty' : 'Clean'}
                  </button>
                </div>

                <div style={{ margin: '1rem 0', minHeight: '50px', display: 'flex', alignItems: 'center' }}>
                  {robotLocation === 'B' ? (
                    <div style={{ fontSize: '2.5rem' }}>🤖</div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Empty</div>
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Percept: [{robotLocation === 'B' ? 'B' : 'Other'}, {dirtB ? 'Dirty' : 'Clean'}]
                </div>
              </div>
            </div>

            {/* Manual Action Controls */}
            {mode === 'manual' && (
              <div className="card" style={{ padding: '0.85rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Execute Action:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                  <button onClick={() => applyAction('Left')} className="btn-tactile btn-sm">
                    <ArrowLeft size={13} /> Left
                  </button>
                  <button onClick={() => applyAction('Right')} className="btn-tactile btn-sm">
                    <ArrowRight size={13} /> Right
                  </button>
                  <button onClick={() => applyAction('Suck')} className="btn-tactile btn-sm btn-cyan">
                    <Disc size={13} /> Suck
                  </button>
                  <button onClick={() => applyAction('NoOp')} className="btn-tactile btn-sm">
                    NoOp
                  </button>
                </div>
              </div>
            )}

            {/* Slide 6 Reflex Agent Program Box */}
            {mode === 'reflex' && (
              <div className="card" style={{ padding: '0.85rem', marginBottom: '1rem', background: '#090d16' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Reflex Program (Slide 6):
                </div>
                <pre style={{ fontSize: '0.78rem', margin: 0, fontFamily: 'var(--font-mono)', lineHeight: 1.5, color: '#e2e8f0' }}>
                  {`action ReflexVacuumAgent(location, status) {
  if (status == Dirty) return Suck;
  else if (location == A) return Right;
  else return Left;
}`}
                </pre>
              </div>
            )}

            {/* Slide 12 Unknown Initial State Explanation */}
            {mode === 'belief' && (
              <div className="card" style={{ padding: '0.85rem', marginBottom: '1rem', background: 'rgba(234, 179, 8, 0.08)', borderLeft: '3px solid var(--accent-amber)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fef08a', marginBottom: '0.35rem' }}>
                  <EyeOff size={14} style={{ display: 'inline', marginRight: '0.3rem' }} />
                  Unknown Initial State (Belief States):
                </div>
                <p style={{ fontSize: '0.78rem', color: '#fef08a', lineHeight: 1.5, margin: 0 }}>
                  Current Belief Set: <strong>{'{ ' + beliefSet.join(', ') + ' }'}</strong> ({beliefSet.length} possible states).
                  <br />
                  A rational sensorless agent searches over <em>sets of states</em>. The fixed sequence <code>[Right, Suck, Left, Suck]</code> contracts the belief set until reaching Goal state 7 with certainty!
                </p>
              </div>
            )}

            {/* Telemetry info */}
            <div className="card" style={{ padding: '0.85rem' }}>
              <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Current Discrete State:</span>
                  <span className="font-mono text-cyan-400 font-bold">State {currentStateId} of 8</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Goal Achieved?:</span>
                  <span className={`font-mono font-bold ${isGoal ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isGoal ? 'YES (State 7 or 8)' : 'NO (Dirty tiles)'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Path Cost (Additive):</span>
                  <span className="font-mono text-cyan-400 font-bold">{totalCost}</span>
                </div>
                {actionHistory.length > 0 && (
                  <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block', marginBottom: '0.25rem' }}>
                      Recent Action Trace:
                    </span>
                    <div style={{ maxHeight: '70px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      {actionHistory.slice(-4).reverse().map((act, idx) => (
                        <span key={idx} className="font-mono text-cyan-300" style={{ fontSize: '0.7rem' }}>
                          • {act}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Full 8-State Space Transition Graph (Slide 12) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>
                8-State Space Transition Graph (Slide 12)
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Click node to set state
              </span>
            </div>

            {/* SVG Transition Graph */}
            <div
              style={{
                background: '#070a12',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                overflowX: 'auto',
              }}
            >
              <svg viewBox="0 0 680 370" style={{ width: '100%', minWidth: '550px', height: 'auto', display: 'block' }}>
                <defs>
                  <marker id="arrowL" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <polygon points="0 0, 6 3, 0 6" fill="#38bdf8" />
                  </marker>
                  <marker id="arrowR" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <polygon points="0 0, 6 3, 0 6" fill="#38bdf8" />
                  </marker>
                  <marker id="arrowS" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <polygon points="0 0, 6 3, 0 6" fill="#a855f7" />
                  </marker>
                </defs>

                {/* Transition Edges */}
                {/* Horizontal R (1 -> 2) & L (2 -> 1) */}
                <path d="M 195 70 L 405 70" stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#arrowR)" />
                <path d="M 405 85 L 195 85" stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#arrowL)" />
                <text x="300" y="65" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="700">R</text>
                <text x="300" y="97" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="700">L</text>

                {/* Vertical Suck 1 -> 5 */}
                <path d="M 180 105 L 370 170" stroke="#a855f7" strokeWidth="1.5" markerEnd="url(#arrowS)" />
                <text x="250" y="130" fill="#c084fc" fontSize="10" fontWeight="700">S</text>

                {/* Vertical Suck 2 -> 4 */}
                <path d="M 470 105 L 280 170" stroke="#a855f7" strokeWidth="1.5" markerEnd="url(#arrowS)" />
                <text x="390" y="130" fill="#c084fc" fontSize="10" fontWeight="700">S</text>

                {/* Horizontal R & L (3 <-> 4) */}
                <path d="M 115 190 L 165 190" stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#arrowR)" />
                <path d="M 165 205 L 115 205" stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#arrowL)" />
                <text x="140" y="185" textAnchor="middle" fill="#38bdf8" fontSize="9">R</text>
                <text x="140" y="215" textAnchor="middle" fill="#38bdf8" fontSize="9">L</text>

                {/* Horizontal R & L (5 <-> 6) */}
                <path d="M 435 190 L 485 190" stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#arrowR)" />
                <path d="M 485 205 L 435 205" stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#arrowL)" />
                <text x="460" y="185" textAnchor="middle" fill="#38bdf8" fontSize="9">R</text>
                <text x="460" y="215" textAnchor="middle" fill="#38bdf8" fontSize="9">L</text>

                {/* Suck from 3 -> 7 */}
                <path d="M 100 225 L 140 290" stroke="#a855f7" strokeWidth="1.5" markerEnd="url(#arrowS)" />
                <text x="110" y="260" fill="#c084fc" fontSize="10" fontWeight="700">S</text>

                {/* Suck from 6 -> 8 */}
                <path d="M 560 225 L 520 290" stroke="#a855f7" strokeWidth="1.5" markerEnd="url(#arrowS)" />
                <text x="550" y="260" fill="#c084fc" fontSize="10" fontWeight="700">S</text>

                {/* Horizontal R & L (7 <-> 8 GOALS) */}
                <path d="M 195 310 L 405 310" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrowR)" />
                <path d="M 405 325 L 195 325" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrowL)" />
                <text x="300" y="305" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="700">R</text>
                <text x="300" y="337" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="700">L</text>

                {/* 8 State Node Cards */}
                {STATES_SPEC.map((s) => {
                  const isCurrent = currentStateId === s.id;
                  const inBelief = mode === 'belief' && beliefSet.includes(s.id);

                  return (
                    <g
                      key={s.id}
                      onClick={() => setStateFromId(s.id)}
                      transform={`translate(${s.x}, ${s.y})`}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Box border */}
                      <rect
                        width="70"
                        height="55"
                        rx="6"
                        fill={isCurrent ? '#0c4a6e' : inBelief ? '#451a03' : '#0f172a'}
                        stroke={
                          isCurrent
                            ? '#38bdf8'
                            : inBelief
                            ? '#f59e0b'
                            : s.isGoal
                            ? '#10b981'
                            : 'rgba(255, 255, 255, 0.15)'
                        }
                        strokeWidth={isCurrent || inBelief ? '2.5' : s.isGoal ? '2' : '1'}
                      />

                      {/* State number label */}
                      <text x="8" y="15" fill={s.isGoal ? '#34d399' : '#94a3b8'} fontSize="10" fontWeight="700">
                        #{s.id} {s.isGoal ? '★' : ''}
                      </text>

                      {/* 2-room mini board */}
                      <rect x="8" y="22" width="26" height="26" rx="2" fill={s.loc === 'A' ? 'rgba(56, 189, 248, 0.2)' : '#1e293b'} stroke="#475569" strokeWidth="1" />
                      <rect x="36" y="22" width="26" height="26" rx="2" fill={s.loc === 'B' ? 'rgba(56, 189, 248, 0.2)' : '#1e293b'} stroke="#475569" strokeWidth="1" />

                      {/* Robot location marker */}
                      {s.loc === 'A' && (
                        <text x="21" y="39" textAnchor="middle" fontSize="12">🤖</text>
                      )}
                      {s.loc === 'B' && (
                        <text x="49" y="39" textAnchor="middle" fontSize="12">🤖</text>
                      )}

                      {/* Dirt specks */}
                      {s.dirtA && <circle cx="14" cy="42" r="3" fill="#fbbf24" />}
                      {s.dirtB && <circle cx="42" cy="42" r="3" fill="#fbbf24" />}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Academic Reference Callout */}
            <div className="callout callout-theorem" style={{ marginTop: '0.85rem', fontSize: '0.78rem' }}>
              <strong>Lesson 2 Slide 12 Takeaway:</strong>
              <br />
              The 2-room vacuum world has exactly $2 \\times 2^2 = 8$ discrete states. In deterministic environments, actions deterministically transition the world between these 8 states. When the initial state is unknown, the search space becomes the power set of states ($2^8 = 256$ possible belief states).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
