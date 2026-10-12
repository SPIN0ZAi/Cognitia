import React, { useState } from 'react';
import { Eye, Zap, Cpu, Globe, Play, Car, Paintbrush } from 'lucide-react';

interface ComponentDetail {
  title: string;
  role: string;
  math: string;
  examples: {
    taxi: string;
    vacuum: string;
  };
  details: string;
}

const DETAILS: Record<'env' | 'sensors' | 'brain' | 'actuators', ComponentDetail> = {
  env: {
    title: 'The Environment',
    role: 'The external context or world with which the agent interacts.',
    math: 'State space S = {s_1, s_2, ...}',
    examples: {
      taxi: 'Roads, traffic, pedestrians, weather conditions, customer requests.',
      vacuum: 'Two-room grid [Room A, Room B] with dirty or clean states.',
    },
    details:
      'The environment determines the nature of the AI task. It can be fully or partially observable, deterministic or stochastic, static or dynamic, discrete or continuous, single-agent or multi-agent.',
  },
  sensors: {
    title: 'Sensors (Percepts Generator)',
    role: 'Hardware or software mechanisms through which the agent receives percepts.',
    math: 'Percept p in P, Percept sequence P*',
    examples: {
      taxi: 'Video cameras, LiDAR/sonar, speedometer, GPS, engine sensors, microphone.',
      vacuum: 'Dirt sensor, bump detector, location sensor [A or B].',
    },
    details:
      'Sensors convert raw physical signals into structured percepts. The agent function maps the entire percept sequence (history) P* up to the current time, not just the single latest percept.',
  },
  brain: {
    title: 'Agent Program & Architecture',
    role: 'The computational core executing the agent function f.',
    math: 'f : P* -> A   |   Agent = Architecture + Program',
    examples: {
      taxi: 'Motion planner, object detector, trajectory optimizer maximizing safety and speed.',
      vacuum: 'Reflex logic: if status == dirty then Suck else if loc == A then Right else Left.',
    },
    details:
      'The agent function f is an abstract mathematical concept. The agent program is the concrete algorithm executed on the physical computing architecture (processors, memory, buses).',
  },
  actuators: {
    title: 'Actuators (Action Executors)',
    role: 'Mechanisms through which the agent executes actions upon the environment.',
    math: 'Action a in A (Available Actions)',
    examples: {
      taxi: 'Steering wheel, accelerator, brake hydraulics, horn, passenger display.',
      vacuum: 'Wheels/drive motors, vacuum suction motor, status indicator LED.',
    },
    details:
      'Actions change the current state of the environment into a new state according to the transition model, producing the next set of percepts for the sensors.',
  },
};

export const AgentDiagram: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<'env' | 'sensors' | 'brain' | 'actuators'>('sensors');
  const [isCycling, setIsCycling] = useState(false);
  const [cycleStep, setCycleStep] = useState<number>(0);

  const triggerCycle = () => {
    if (isCycling) return;
    setIsCycling(true);
    setCycleStep(1);

    setTimeout(() => setCycleStep(2), 700);
    setTimeout(() => setCycleStep(3), 1400);
    setTimeout(() => setCycleStep(4), 2100);
    setTimeout(() => {
      setIsCycling(false);
      setCycleStep(0);
    }, 2800);
  };

  const currentDetail = DETAILS[selectedNode];

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #090e17 0%, #06090f 100%)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        margin: '2rem 0',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
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
            <span className="badge badge-cyan font-mono">Formal Diagram · Lesson 2 Slide 5</span>
            <span className="badge badge-emerald">Interactive Visual</span>
          </div>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.4rem' }}>
            The Agent–Environment Interaction Model
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Click any component to inspect its mathematical role, or trigger the perception-action cycle.
          </p>
        </div>

        <button
          onClick={triggerCycle}
          disabled={isCycling}
          className="btn-tactile btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Play size={13} className={isCycling ? 'animate-spin' : ''} />
          <span>{isCycling ? 'Simulating Cycle...' : 'Simulate Percept Cycle'}</span>
        </button>
      </div>

      {/* SVG Interactive Architecture Diagram */}
      <div style={{ width: '100%', overflowX: 'auto', padding: '0.5rem 0' }}>
        <svg
          viewBox="0 0 920 340"
          style={{ width: '100%', minWidth: '700px', height: 'auto', display: 'block' }}
        >
          <defs>
            <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>

            <linearGradient id="emeraldGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            <linearGradient id="boxGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <marker id="arrowCyan" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill="#38bdf8" />
            </marker>

            <marker id="arrowEmerald" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill="#10b981" />
            </marker>
          </defs>

          {/* ENVIRONMENT BOX (Left) */}
          <g
            onClick={() => setSelectedNode('env')}
            style={{ cursor: 'pointer' }}
            transform="translate(40, 50)"
          >
            <rect
              width="210"
              height="240"
              rx="12"
              fill="url(#boxGrad)"
              stroke={selectedNode === 'env' ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)'}
              strokeWidth={selectedNode === 'env' ? '2.5' : '1.5'}
              filter="drop-shadow(0 4px 12px rgba(0,0,0,0.5))"
            />
            <rect
              x="0"
              y="0"
              width="210"
              height="38"
              rx="12"
              fill="rgba(56, 189, 248, 0.12)"
            />
            <circle cx="28" cy="20" r="10" fill="#0284c7" />
            <text x="28" y="24" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">E</text>
            <text x="46" y="24" fill="#38bdf8" fontSize="13" fontWeight="700">ENVIRONMENT</text>

            <text x="105" y="115" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="600">
              External World
            </text>
            <text x="105" y="140" textAnchor="middle" fill="var(--text-muted)" fontSize="11">
              Physical or Virtual State S
            </text>
            <text x="105" y="165" textAnchor="middle" fill="#94a3b8" fontSize="11">
              Provides percepts via physics
            </text>
            <text x="105" y="185" textAnchor="middle" fill="#94a3b8" fontSize="11">
              Receives agent actions
            </text>

            <rect
              x="20"
              y="205"
              width="170"
              height="24"
              rx="4"
              fill={selectedNode === 'env' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.03)'}
              stroke="rgba(56, 189, 248, 0.3)"
            />
            <text x="105" y="221" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="600">
              Click to inspect Environment
            </text>
          </g>

          {/* AGENT BOUNDARY CONTAINER (Right) */}
          <g transform="translate(480, 25)">
            <rect
              width="390"
              height="290"
              rx="16"
              fill="rgba(15, 23, 42, 0.5)"
              stroke="#6366f1"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <rect x="20" y="-12" width="110" height="24" rx="4" fill="#4338ca" />
            <text x="75" y="4" textAnchor="middle" fill="#e0e7ff" fontSize="12" fontWeight="700">
              AGENT SYSTEM
            </text>

            {/* SENSORS BOX (Top inside Agent) */}
            <g
              onClick={() => setSelectedNode('sensors')}
              style={{ cursor: 'pointer' }}
              transform="translate(25, 30)"
            >
              <rect
                width="340"
                height="65"
                rx="8"
                fill="url(#boxGrad)"
                stroke={selectedNode === 'sensors' ? '#38bdf8' : 'rgba(56, 189, 248, 0.5)'}
                strokeWidth={selectedNode === 'sensors' ? '2.5' : '1.5'}
              />
              <text x="20" y="32" fill="#38bdf8" fontSize="14" fontWeight="700">
                SENSORS
              </text>
              <text x="20" y="50" fill="var(--text-muted)" fontSize="11">
                Converts physical environment states into percepts P
              </text>
              <circle
                cx="315"
                cy="32"
                r="14"
                fill={cycleStep === 1 || cycleStep === 2 ? '#38bdf8' : 'rgba(56, 189, 248, 0.2)'}
              />
              <text x="315" y="36" textAnchor="middle" fill="#fff" fontSize="12">
                P*
              </text>
            </g>

            {/* BRAIN / AGENT PROGRAM (Center inside Agent) */}
            <g
              onClick={() => setSelectedNode('brain')}
              style={{ cursor: 'pointer' }}
              transform="translate(25, 115)"
            >
              <rect
                width="340"
                height="65"
                rx="8"
                fill="url(#boxGrad)"
                stroke={selectedNode === 'brain' ? '#a855f7' : 'rgba(168, 85, 247, 0.5)'}
                strokeWidth={selectedNode === 'brain' ? '2.5' : '1.5'}
              />
              <text x="20" y="30" fill="#c084fc" fontSize="14" fontWeight="700">
                AGENT PROGRAM / FUNCTION
              </text>
              <text x="20" y="48" fill="#e9d5ff" fontSize="12" fontFamily="var(--font-mono)">
                f : P* → A  (Evaluates Percept History)
              </text>
              <circle
                cx="315"
                cy="32"
                r="14"
                fill={cycleStep === 2 || cycleStep === 3 ? '#a855f7' : 'rgba(168, 85, 247, 0.2)'}
              />
              <text x="315" y="36" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
                f
              </text>
            </g>

            {/* ACTUATORS BOX (Bottom inside Agent) */}
            <g
              onClick={() => setSelectedNode('actuators')}
              style={{ cursor: 'pointer' }}
              transform="translate(25, 200)"
            >
              <rect
                width="340"
                height="65"
                rx="8"
                fill="url(#boxGrad)"
                stroke={selectedNode === 'actuators' ? '#10b981' : 'rgba(16, 185, 129, 0.5)'}
                strokeWidth={selectedNode === 'actuators' ? '2.5' : '1.5'}
              />
              <text x="20" y="32" fill="#34d399" fontSize="14" fontWeight="700">
                ACTUATORS
              </text>
              <text x="20" y="50" fill="var(--text-muted)" fontSize="11">
                Executes chosen action sequence A back into environment
              </text>
              <circle
                cx="315"
                cy="32"
                r="14"
                fill={cycleStep === 3 || cycleStep === 4 ? '#10b981' : 'rgba(16, 185, 129, 0.2)'}
              />
              <text x="315" y="36" textAnchor="middle" fill="#fff" fontSize="12">
                A
              </text>
            </g>

            {/* Internal Flow Connectors */}
            <line x1="195" y1="95" x2="195" y2="115" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="195" y1="180" x2="195" y2="200" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />
          </g>

          {/* PERCEPTS ARROW (Top: Env -> Sensors) */}
          <path
            d="M 250 85 L 500 85"
            stroke="#38bdf8"
            strokeWidth="3.5"
            fill="none"
            markerEnd="url(#arrowCyan)"
            strokeDasharray={isCycling ? '6 4' : 'none'}
          />
          <rect x="330" y="60" width="105" height="24" rx="4" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1" />
          <text x="382" y="76" textAnchor="middle" fill="#e0f2fe" fontSize="12" fontWeight="700">
            percepts (P*)
          </text>

          {/* Animated pulse for percept */}
          {(cycleStep === 1 || isCycling) && (
            <circle cx="380" cy="85" r="7" fill="#38bdf8">
              <animate attributeName="cx" from="260" to="500" dur="1.2s" repeatCount="indefinite" />
            </circle>
          )}

          {/* ACTIONS ARROW (Bottom: Actuators -> Env) */}
          <path
            d="M 505 255 L 260 255"
            stroke="#10b981"
            strokeWidth="3.5"
            fill="none"
            markerEnd="url(#arrowEmerald)"
            strokeDasharray={isCycling ? '6 4' : 'none'}
          />
          <rect x="335" y="265" width="95" height="24" rx="4" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
          <text x="382" y="281" textAnchor="middle" fill="#d1fae5" fontSize="12" fontWeight="700">
            actions (A)
          </text>

          {/* Animated pulse for action */}
          {(cycleStep === 4 || isCycling) && (
            <circle cx="380" cy="255" r="7" fill="#10b981">
              <animate attributeName="cx" from="500" to="260" dur="1.2s" repeatCount="indefinite" />
            </circle>
          )}
        </svg>
      </div>

      {/* Interactive Detail Inspector Panel */}
      <div
        className="card"
        style={{
          marginTop: '1.25rem',
          padding: '1.25rem',
          background: 'rgba(15, 23, 42, 0.7)',
          borderLeft: `4px solid ${
            selectedNode === 'env'
              ? '#38bdf8'
              : selectedNode === 'sensors'
              ? '#0284c7'
              : selectedNode === 'brain'
              ? '#a855f7'
              : '#10b981'
          }`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {selectedNode === 'env' && <Globe size={18} className="text-cyan-400" />}
            {selectedNode === 'sensors' && <Eye size={18} className="text-blue-400" />}
            {selectedNode === 'brain' && <Cpu size={18} className="text-purple-400" />}
            {selectedNode === 'actuators' && <Zap size={18} className="text-emerald-400" />}
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              {currentDetail.title}
            </span>
          </div>

          <span className="font-mono badge badge-indigo" style={{ fontSize: '0.75rem' }}>
            {currentDetail.math}
          </span>
        </div>

        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
          {currentDetail.details}
        </p>

        {/* Concrete Lecture Examples Comparison */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '0.75rem',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
              <Car size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.2rem" }} /> Automated Taxi Example (Slide 7):
            </span>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {currentDetail.examples.taxi}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
              <Paintbrush size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.2rem" }} /> Vacuum-Cleaner World Example (Slide 6):
            </span>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {currentDetail.examples.vacuum}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
