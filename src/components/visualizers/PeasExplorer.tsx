import React, { useState } from 'react';
import { Shield, Globe, Zap, Eye, CheckCircle2, Sliders } from 'lucide-react';

interface TaskSpec {
  id: string;
  name: string;
  slideRef: string;
  peas: {
    p: string[];
    e: string[];
    a: string[];
    s: string[];
  };
  taxonomy: {
    observable: 'Fully' | 'Partially';
    deterministic: 'Deterministic' | 'Stochastic';
    episodic: 'Episodic' | 'Sequential';
    dynamic: 'Static' | 'Dynamic';
    discrete: 'Discrete' | 'Continuous';
    agents: 'Single-agent' | 'Multi-agent';
  };
  designImplication: string;
}

const TASKS: TaskSpec[] = [
  {
    id: 'taxi',
    name: 'Automated Taxi Driver',
    slideRef: 'Lesson 2 Slide 7',
    peas: {
      p: ['Safety (zero collisions)', 'Reach destination', 'Maximize profits / fuel efficiency', 'Obey traffic legality', 'Passenger comfort'],
      e: ['Streets & freeways', 'Traffic & other vehicles', 'Pedestrians & cyclists', 'Weather conditions & road surface'],
      a: ['Steering wheel', 'Accelerator pedal', 'Braking hydraulics', 'Horn', 'Dashboard display / audio speaker'],
      s: ['Cameras (360° visual)', 'Microphones', 'LiDAR / Sonar', 'Accelerometers', 'Engine gauges', 'GPS & digital maps'],
    },
    taxonomy: {
      observable: 'Partially',
      deterministic: 'Stochastic',
      episodic: 'Sequential',
      dynamic: 'Dynamic',
      discrete: 'Continuous',
      agents: 'Multi-agent',
    },
    designImplication:
      'The hardest possible environment class! Requires continuous sensor fusion, probabilistic belief states, motion planning search, and adversarial game-theoretic reasoning against other human drivers.',
  },
  {
    id: 'vacuum',
    name: 'Vacuum-Cleaner World (2 Rooms)',
    slideRef: 'Lesson 2 Slide 6 & 12',
    peas: {
      p: ['Cleanliness (No dirt remaining)', 'Minimize energy/actions (1 cost per movement)', 'Avoid unnecessary suction steps'],
      e: ['Two rooms: Room A and Room B', 'Dirt status on each room (Clean or Dirty)'],
      a: ['Move Left', 'Move Right', 'Suck dirt', 'NoOp (idle)'],
      s: ['Location sensor (determines whether agent is in A or B)', 'Dirt sensor (detects if current tile is Dirty)'],
    },
    taxonomy: {
      observable: 'Fully',
      deterministic: 'Deterministic',
      episodic: 'Sequential',
      dynamic: 'Static',
      discrete: 'Discrete',
      agents: 'Single-agent',
    },
    designImplication:
      'A benign, discrete environment. With full observability, a simple reflex agent program (Slide 6) achieves rational behavior without needing to maintain complex past history.',
  },
  {
    id: 'medical',
    name: 'Medical Diagnostic Decision System',
    slideRef: 'Lesson 1 Slide 30 / Lesson 2',
    peas: {
      p: ['Healthy patient outcome', 'Minimize healthcare costs', 'Avoid misdiagnoses', 'Minimize diagnostic delay'],
      e: ['Patient symptoms', 'Laboratory test results', 'Hospital staff & pharmacy'],
      a: ['Display diagnostic questions', 'Order lab tests', 'Prescribe medications', 'Refer to specialist'],
      s: ['Keyboard / EHR input', 'Vital signs monitors', 'Lab assay telemetry'],
    },
    taxonomy: {
      observable: 'Partially',
      deterministic: 'Stochastic',
      episodic: 'Sequential',
      dynamic: 'Dynamic',
      discrete: 'Continuous',
      agents: 'Single-agent',
    },
    designImplication:
      'Requires reasoning under uncertainty, utility theory (Slide 15), and expert knowledge-based inference (like MYCIN) to weigh costs against diagnostic accuracy.',
  },
  {
    id: 'eight-puzzle',
    name: '8-Puzzle Game Solver',
    slideRef: 'Lesson 2 Slide 15 & 25',
    peas: {
      p: ['Achieve ascending order [1..8]', 'Minimize number of tile moves (step cost 1)'],
      e: ['3x3 grid board with 8 numbered tiles and 1 empty gap'],
      a: ['Move blank Left', 'Move blank Right', 'Move blank Up', 'Move blank Down'],
      s: ['Board matrix reader (exact coordinates of all 9 tiles)'],
    },
    taxonomy: {
      observable: 'Fully',
      deterministic: 'Deterministic',
      episodic: 'Sequential',
      dynamic: 'Static',
      discrete: 'Discrete',
      agents: 'Single-agent',
    },
    designImplication:
      'The classical search problem! Fully deterministic and static state space allows offline problem solving (Slide 9): execute solution sequence with eyes closed once computed.',
  },
];

export const PeasExplorer: React.FC = () => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('taxi');

  const task = TASKS.find((t) => t.id === selectedTaskId) || TASKS[0];

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
            <span className="badge badge-amber font-mono">PEAS Framework & Taxonomy</span>
            <span className="badge badge-cyan">{task.slideRef}</span>
          </div>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.4rem' }}>
            Interactive Task Environment Specification
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            To design a rational agent, we must formally define PEAS: Performance, Environment, Actuators, and Sensors.
          </p>
        </div>

        {/* Task Selector Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {TASKS.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTaskId(t.id)}
              className={`btn-tactile btn-sm ${selectedTaskId === t.id ? 'btn-primary' : ''}`}
            >
              {t.name.split('(')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 4 PEAS Component Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Performance */}
        <div
          className="card"
          style={{
            padding: '1rem',
            background: 'rgba(234, 179, 8, 0.04)',
            borderLeft: '3px solid var(--accent-amber)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <Shield size={16} className="text-amber-400" />
            <strong style={{ fontSize: '0.88rem', color: '#fef08a' }}>Performance (P)</strong>
          </div>
          <ul style={{ paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {task.peas.p.map((item, i) => (
              <li key={i} style={{ marginBottom: '0.25rem' }}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Environment */}
        <div
          className="card"
          style={{
            padding: '1rem',
            background: 'rgba(56, 189, 248, 0.04)',
            borderLeft: '3px solid var(--accent-cyan)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <Globe size={16} className="text-cyan-400" />
            <strong style={{ fontSize: '0.88rem', color: '#bae6fd' }}>Environment (E)</strong>
          </div>
          <ul style={{ paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {task.peas.e.map((item, i) => (
              <li key={i} style={{ marginBottom: '0.25rem' }}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Actuators */}
        <div
          className="card"
          style={{
            padding: '1rem',
            background: 'rgba(16, 185, 129, 0.04)',
            borderLeft: '3px solid var(--accent-emerald)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <Zap size={16} className="text-emerald-400" />
            <strong style={{ fontSize: '0.88rem', color: '#a7f3d0' }}>Actuators (A)</strong>
          </div>
          <ul style={{ paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {task.peas.a.map((item, i) => (
              <li key={i} style={{ marginBottom: '0.25rem' }}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Sensors */}
        <div
          className="card"
          style={{
            padding: '1rem',
            background: 'rgba(168, 85, 247, 0.04)',
            borderLeft: '3px solid #a855f7',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <Eye size={16} className="text-purple-400" />
            <strong style={{ fontSize: '0.88rem', color: '#e9d5ff' }}>Sensors (S)</strong>
          </div>
          <ul style={{ paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {task.peas.s.map((item, i) => (
              <li key={i} style={{ marginBottom: '0.25rem' }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 6 Dimensions Environment Classification Matrix */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Sliders size={16} className="text-indigo-400" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>
            Environment Classification (Slide 7 Properties)
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.6rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ background: '#090d16', padding: '0.6rem', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Observability</div>
            <div className={`badge ${task.taxonomy.observable === 'Fully' ? 'badge-emerald' : 'badge-amber'}`} style={{ marginTop: '0.3rem' }}>
              {task.taxonomy.observable}
            </div>
          </div>

          <div style={{ background: '#090d16', padding: '0.6rem', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Determinism</div>
            <div className={`badge ${task.taxonomy.deterministic === 'Deterministic' ? 'badge-emerald' : 'badge-amber'}`} style={{ marginTop: '0.3rem' }}>
              {task.taxonomy.deterministic}
            </div>
          </div>

          <div style={{ background: '#090d16', padding: '0.6rem', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ephemerality</div>
            <div className={`badge ${task.taxonomy.episodic === 'Episodic' ? 'badge-emerald' : 'badge-indigo'}`} style={{ marginTop: '0.3rem' }}>
              {task.taxonomy.episodic}
            </div>
          </div>

          <div style={{ background: '#090d16', padding: '0.6rem', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Dynamism</div>
            <div className={`badge ${task.taxonomy.dynamic === 'Static' ? 'badge-emerald' : 'badge-rose'}`} style={{ marginTop: '0.3rem' }}>
              {task.taxonomy.dynamic}
            </div>
          </div>

          <div style={{ background: '#090d16', padding: '0.6rem', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Continuity</div>
            <div className={`badge ${task.taxonomy.discrete === 'Discrete' ? 'badge-emerald' : 'badge-indigo'}`} style={{ marginTop: '0.3rem' }}>
              {task.taxonomy.discrete}
            </div>
          </div>

          <div style={{ background: '#090d16', padding: '0.6rem', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Agents</div>
            <div className={`badge ${task.taxonomy.agents === 'Single-agent' ? 'badge-emerald' : 'badge-cyan'}`} style={{ marginTop: '0.3rem' }}>
              {task.taxonomy.agents}
            </div>
          </div>
        </div>

        {/* Design Implication Callout */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '6px' }}>
          <CheckCircle2 size={16} className="text-cyan-400 shrink-0" style={{ marginTop: '0.15rem' }} />
          <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
            <strong style={{ color: '#38bdf8' }}>Architectural Consequence: </strong>
            {task.designImplication}
          </div>
        </div>
      </div>
    </div>
  );
};
