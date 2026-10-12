import { useState } from 'react';
import { History } from 'lucide-react';
import { CoordinateStamp } from '../common/InstrumentControls';
import { useLabTheme } from '../../context/LabThemeContext';

interface TimelineEvent {
  year: string;
  title: string;
  people?: string;
  category: 'Origins' | 'Early AI' | 'Winter & Revival' | 'Deep Learning' | 'GenAI & Agents';
  eventType: 'theory' | 'breakthrough' | 'winter' | 'system' | 'foundation';
  description: string;
  quote?: string;
  slideRef: number;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: '300 BC',
    title: 'Syllogisms & Formal Logic',
    people: 'Aristotle',
    category: 'Origins',
    eventType: 'theory',
    description: 'First formal system for codifying deductive rational reasoning through categorical syllogisms.',
    quote: 'A syllogism is discourse in which, certain things being stated, something other than what is stated follows of necessity.',
    slideRef: 18,
  },
  {
    year: '1837',
    title: 'Propositional & Boolean Algebra',
    people: 'George Boole',
    category: 'Origins',
    eventType: 'theory',
    description: 'Reduced logical human reasoning to binary algebraic manipulation: 1 and 0, AND, OR, NOT operations.',
    slideRef: 18,
  },
  {
    year: '1943',
    title: 'First Model of Artificial Neuron',
    people: 'Warren McCulloch & Walter Pitts',
    category: 'Origins',
    eventType: 'breakthrough',
    description: 'Modeled dendrites, cell summation, and all-or-none axon firing threshold logic.',
    quote: 'A logical calculus of the ideas immanent in nervous activity.',
    slideRef: 18,
  },
  {
    year: '1950',
    title: 'Computing Machinery & Intelligence (Turing Test)',
    people: 'Alan Turing',
    category: 'Early AI',
    eventType: 'foundation',
    description: 'Introduced the imitation game, machine learning from experience, genetic algorithms, and the Turing Test.',
    quote: 'We may hope that machines will eventually compete with men in all purely intellectual fields.',
    slideRef: 19,
  },
  {
    year: '1956',
    title: 'Dartmouth Summer Conference: Birth of AI',
    people: 'John McCarthy, Marvin Minsky, Claude Shannon, Nathaniel Rochester',
    category: 'Early AI',
    eventType: 'breakthrough',
    description: 'Coined the term "Artificial Intelligence" and established AI as an autonomous scientific discipline.',
    quote: 'Every aspect of learning or any other feature of intelligence can in principle be so precisely described that a machine can be made to simulate it.',
    slideRef: 19,
  },
  {
    year: '1959',
    title: 'First Adaptive Neural Network (ADALINE)',
    people: 'Bernard Widrow & Ted Hoff',
    category: 'Early AI',
    eventType: 'system',
    description: 'First physical neural network with adaptive weights applied to an industrial telecommunications echo filter.',
    slideRef: 19,
  },
  {
    year: '1964',
    title: 'ELIZA: First Conversational Psychotherapist',
    people: 'Joseph Weizenbaum (MIT)',
    category: 'Early AI',
    eventType: 'system',
    description: 'Simulated Rogerian psychotherapist via pattern matching and keyword substitution script rules.',
    slideRef: 19,
  },
  {
    year: '1967',
    title: 'DENDRAL: First Knowledge-Based Expert System',
    people: 'Edward Feigenbaum, Bruce Buchanan, Joshua Lederberg',
    category: 'Early AI',
    eventType: 'system',
    description: 'Inferred complex molecular structures from chemical mass spectrometry data using domain heuristics.',
    slideRef: 19,
  },
  {
    year: '1979',
    title: 'MYCIN: Medical Diagnosis System',
    people: 'Edward Shortliffe (Stanford)',
    category: 'Early AI',
    eventType: 'system',
    description: 'Diagnosed bacteremia and meningitis (~600 rules) incorporating certainty factors for uncertain reasoning.',
    slideRef: 19,
  },
  {
    year: '1980–88',
    title: 'Industrial Expert Systems Boom',
    people: 'Commercial AI Industry',
    category: 'Winter & Revival',
    eventType: 'system',
    description: 'Corporations deployed rule-based inference engines; global commercial boom in specialized LISP machines.',
    slideRef: 20,
  },
  {
    year: '1986',
    title: 'Backpropagation Multi-Layer Revival',
    people: 'David Rumelhart, Geoffrey Hinton, Ronald Williams',
    category: 'Winter & Revival',
    eventType: 'breakthrough',
    description: 'Revived connectionism and overcome Minsky’s XOR perceptron limitation via gradient descent backprop.',
    slideRef: 20,
  },
  {
    year: '1988–93',
    title: 'The Second AI Winter: Brittleness & Collapse',
    category: 'Winter & Revival',
    eventType: 'winter',
    description: 'High maintenance costs and brittle symbolic rule bases led to commercial collapse and massive DARPA funding cuts.',
    quote: 'The knowledge acquisition bottleneck and combinatorial explosion proved insurmountable for hand-coded rules.',
    slideRef: 20,
  },
  {
    year: '1995',
    title: 'Agent-Based AI: Modern Rationality',
    people: 'Stuart Russell & Peter Norvig',
    category: 'Winter & Revival',
    eventType: 'foundation',
    description: 'Unified the entire discipline under the rational agent paradigm: perceptions, actions, environment, goals.',
    slideRef: 20,
  },
  {
    year: '1997',
    title: 'Deep Blue Defeats Garry Kasparov',
    people: 'IBM Research',
    category: 'Winter & Revival',
    eventType: 'breakthrough',
    description: 'Specialized parallel hardware evaluates 200M positions/sec using alpha-beta minimax search to beat the world chess champion.',
    slideRef: 20,
  },
  {
    year: '2002',
    title: 'Roomba (iRobot) Domestic Autonomy',
    people: 'Rodney Brooks / iRobot',
    category: 'Deep Learning',
    eventType: 'system',
    description: 'Subsumption and behavior-based reactive agents bring commercial autonomous robotics to millions of homes.',
    slideRef: 21,
  },
  {
    year: '2011',
    title: 'Watson Wins Jeopardy! & Mobile Assistants',
    people: 'IBM Research, Apple Siri',
    category: 'Deep Learning',
    eventType: 'system',
    description: 'DeepQA natural language processing triumphs over grand champions on live television; smartphones get voice agents.',
    slideRef: 21,
  },
  {
    year: '2012',
    title: 'AlexNet ImageNet Breakthrough',
    people: 'Alex Krizhevsky, Ilya Sutskever, Geoffrey Hinton',
    category: 'Deep Learning',
    eventType: 'breakthrough',
    description: 'Deep Convolutional Neural Networks running on parallel GPUs crush error rates, initiating the modern deep learning era.',
    slideRef: 21,
  },
  {
    year: '2016',
    title: 'AlphaGo Defeats Lee Sedol',
    people: 'Google DeepMind',
    category: 'Deep Learning',
    eventType: 'breakthrough',
    description: 'Overcame the immense 10^170 Go game complexity using Deep Reinforcement Learning and Monte Carlo Tree Search.',
    slideRef: 22,
  },
  {
    year: '2017',
    title: 'The Transformer Architecture',
    people: 'Ashish Vaswani et al. (Google Brain)',
    category: 'GenAI & Agents',
    eventType: 'foundation',
    description: '"Attention Is All You Need" replaces recurrence, scaling self-attention to unlock contemporary foundation models.',
    slideRef: 22,
  },
  {
    year: '2020–22',
    title: 'GPT-3 & ChatGPT Launch',
    people: 'OpenAI',
    category: 'GenAI & Agents',
    eventType: 'breakthrough',
    description: 'Emergent zero-shot and few-shot reasoning in large autoregressive models brings conversational AI to the general public.',
    slideRef: 22,
  },
  {
    year: '2025–26',
    title: 'Inference Reasoning & Autonomous Tool Agents',
    category: 'GenAI & Agents',
    eventType: 'foundation',
    description: 'System 2 inference compute scaling, self-reflective chain-of-thought, tool-calling agents, and embodied intelligence.',
    slideRef: 23,
  },
];

const ERAS = [
  { id: 'All', label: 'Complete Epoch (300 BC – 2026)' },
  { id: 'Origins', label: '1. Foundations & Pre-History' },
  { id: 'Early AI', label: '2. The Dartmouth Golden Age' },
  { id: 'Winter & Revival', label: '3. Winter & Agent Renaissance' },
  { id: 'Deep Learning', label: '4. Deep Connectionist Revolution' },
  { id: 'GenAI & Agents', label: '5. Transformers & Modern Agents' },
];

export const AITimeline: React.FC = () => {
  const { playClick } = useLabTheme();
  const [activeEra, setActiveEra] = useState<string>('All');
  const [selectedEventIndex, setSelectedEventIndex] = useState<number>(0);

  const filtered =
    activeEra === 'All'
      ? TIMELINE_EVENTS
      : TIMELINE_EVENTS.filter((e) => e.category === activeEra);

  const selectedEvent = filtered[selectedEventIndex] || filtered[0] || TIMELINE_EVENTS[0];

  const getBadgeForType = (type: TimelineEvent['eventType']) => {
    switch (type) {
      case 'breakthrough':
        return <span className="badge badge-lime font-mono">⚡ BREAKTHROUGH</span>;
      case 'winter':
        return <span className="badge badge-rose font-mono">❄️ AI WINTER</span>;
      case 'foundation':
        return <span className="badge badge-cyan font-mono">🏛️ FOUNDATION</span>;
      case 'system':
        return <span className="badge badge-amber font-mono">🤖 APPLIED SYSTEM</span>;
      default:
        return <span className="badge badge-indigo font-mono">📐 FORMAL THEORY</span>;
    }
  };

  return (
    <div className="visualizer-container" style={{ background: 'var(--lab-bg-surface)', border: '1px solid var(--lab-border-subtle)' }}>
      {/* Top Coordinate Stamp */}
      <CoordinateStamp
        sectionCode="HIST:01 // CHRONO_ATLAS"
        statusText={`ERA_${activeEra.toUpperCase()}_ENGAGED`}
        coords="300_BC_TO_2026_AD // 21_LANDMARKS"
      />

      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#F1F5F9' }}>
            <History size={19} className="text-cyan-400" />
            Archival Chrono-Atlas: The Evolution of Artificial Intelligence
          </div>
          <div className="visualizer-subtitle" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
            From Classical Syllogisms &amp; Dartmouth 1956 to Deep Learning &amp; Autonomous Rational Agents (Lesson 1)
          </div>
        </div>
      </div>

      <div className="visualizer-body">
        {/* Era Segmented Navigation Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.4rem',
            marginBottom: '1.5rem',
            padding: '0.4rem',
            background: '#070a10',
            borderRadius: '6px',
            border: '1px solid var(--lab-border-subtle)',
          }}
        >
          {ERAS.map((era) => {
            const isActive = activeEra === era.id;
            return (
              <button
                key={era.id}
                onClick={() => {
                  playClick('toggle');
                  setActiveEra(era.id);
                  setSelectedEventIndex(0);
                }}
                className={`btn-tactile btn-sm ${isActive ? 'btn-primary' : ''}`}
                style={{
                  fontSize: '0.73rem',
                  padding: '0.3rem 0.65rem',
                  fontFamily: 'var(--font-mono)',
                  flexGrow: 1,
                }}
              >
                {era.label}
              </button>
            );
          })}
        </div>

        {/* Chronological Archival Stage (Dual View: Featured Landmark + Scrubbable Timeline Rail) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1rem' }}>
          {/* Featured Historical Document / Landmark Card */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              background:
                selectedEvent.category === 'Origins' || selectedEvent.category === 'Early AI'
                  ? 'linear-gradient(135deg, rgba(235, 229, 216, 0.04) 0%, #0d121b 100%)'
                  : 'linear-gradient(135deg, #0e1522 0%, #080c14 100%)',
              border: '1px solid var(--lab-border-subtle)',
              borderLeft:
                selectedEvent.eventType === 'winter'
                  ? '4px solid #f87171'
                  : selectedEvent.eventType === 'breakthrough'
                  ? '4px solid #C6F277'
                  : '4px solid #78D5E8',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--lab-accent-cyan)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {selectedEvent.year}
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  {getBadgeForType(selectedEvent.eventType)}
                  <span className="slide-citation">Slide {selectedEvent.slideRef}</span>
                </div>
              </div>

              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 700, color: '#F1F5F9', marginBottom: '0.4rem' }}>
                {selectedEvent.title}
              </h3>

              {selectedEvent.people && (
                <div style={{ fontSize: '0.82rem', color: 'var(--lab-accent-amber)', fontFamily: 'var(--font-mono)', marginBottom: '0.85rem', fontWeight: 600 }}>
                  Principals: {selectedEvent.people}
                </div>
              )}

              <p style={{ fontSize: '0.92rem', color: 'var(--lab-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                {selectedEvent.description}
              </p>

              {/* Archival Quotation in Editorial Serif */}
              {selectedEvent.quote && (
                <div
                  className="archival-quote"
                  style={{
                    margin: '1rem 0 0 0',
                    fontSize: '0.94rem',
                    color: 'var(--lab-parchment)',
                    background: 'rgba(235, 229, 216, 0.05)',
                  }}
                >
                  &ldquo;{selectedEvent.quote}&rdquo;
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--lab-border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--lab-text-muted)' }}>
              <span>Historical Classification: {selectedEvent.category}</span>
              <span>UCLM AI Syllabus Ch. 2</span>
            </div>
          </div>

          {/* Interactive Scrubbable Chrono Rail (All Milestones in Active Era) */}
          <div
            style={{
              maxHeight: '440px',
              overflowY: 'auto',
              paddingRight: '0.4rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {filtered.map((evt, idx) => {
              const isSelected = selectedEvent.title === evt.title;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    playClick('soft');
                    setSelectedEventIndex(idx);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    background: isSelected ? 'rgba(120, 213, 232, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? '1px solid #78D5E8' : '1px solid #162030',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                  data-cursor-label={`INSPECT_${evt.year}`}
                >
                  <div
                    style={{
                      minWidth: '65px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: isSelected ? '#C6F277' : 'var(--lab-accent-cyan)',
                    }}
                  >
                    {evt.year}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {evt.title}
                    </div>
                    {evt.people && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--lab-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {evt.people}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.66rem', color: 'var(--lab-text-hairline)', fontFamily: 'var(--font-mono)' }}>
                    P.{evt.slideRef}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
