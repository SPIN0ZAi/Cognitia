import { useState } from 'react';
import { History } from 'lucide-react';

interface TimelineEvent {
  year: string;
  title: string;
  people?: string;
  category: 'Origins' | 'Early AI' | 'Winter & Revival' | 'Deep Learning' | 'GenAI & Agents';
  description: string;
  slideRef: number;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: '300 BC',
    title: 'Syllogisms & Formal Logic',
    people: 'Aristotle',
    category: 'Origins',
    description: 'First formal system for codifying deductive rational reasoning.',
    slideRef: 18,
  },
  {
    year: '1837',
    title: 'Propositional & Boolean Logic',
    people: 'George Boole',
    category: 'Origins',
    description: 'Reduced logical reasoning to binary algebraic manipulation.',
    slideRef: 18,
  },
  {
    year: '1943',
    title: 'First Model of Artificial Neuron',
    people: 'Warren McCulloch & Walter Pitts',
    category: 'Origins',
    description: 'Modeled dendrites, cell summation, and threshold axon output.',
    slideRef: 18,
  },
  {
    year: '1950',
    title: 'Computing Machinery & Intelligence (Turing Test)',
    people: 'Alan Turing',
    category: 'Early AI',
    description: 'Introduced the imitation game, machine learning, and genetic algorithms.',
    slideRef: 19,
  },
  {
    year: '1956',
    title: 'Dartmouth Conference: Birth of AI',
    people: 'John McCarthy, M. Minsky, C. Shannon, N. Rochester',
    category: 'Early AI',
    description: 'Coined the term "Artificial Intelligence" and established it as a scientific discipline.',
    slideRef: 19,
  },
  {
    year: '1959',
    title: 'First Artificial Neural Network (ADALINE)',
    people: 'Bernard Widrow & Ted Hoff',
    category: 'Early AI',
    description: 'First neural network applied to an industrial telecommunications filter.',
    slideRef: 19,
  },
  {
    year: '1964',
    title: 'ELIZA: Natural Language Psychotherapist',
    people: 'Joseph Weizenbaum',
    category: 'Early AI',
    description: 'First conversational pattern-matching chatbot precursor.',
    slideRef: 19,
  },
  {
    year: '1967',
    title: 'DENDRAL: First Expert System (KBS)',
    people: 'Edward Feigenbaum et al.',
    category: 'Early AI',
    description: 'Inferred molecular structures from chemical mass spectrometry data.',
    slideRef: 19,
  },
  {
    year: '1979',
    title: 'MYCIN: Medical Diagnosis KBS',
    people: 'Edward Shortliffe',
    category: 'Early AI',
    description: 'Competitive with human specialists for infectious blood diseases (~600 rules).',
    slideRef: 19,
  },
  {
    year: '1980–88',
    title: 'Industrial Expert Systems Boom',
    people: 'Commercial Industry',
    category: 'Winter & Revival',
    description: 'Corporations deployed rule-based systems; massive investment in LISP machines.',
    slideRef: 20,
  },
  {
    year: '1986',
    title: 'Backpropagation Revival',
    people: 'Rumelhart, Hinton, Williams',
    category: 'Winter & Revival',
    description: 'Revived multi-layer neural networks via gradient descent backpropagation.',
    slideRef: 20,
  },
  {
    year: '1988–93',
    title: 'The AI Winter',
    category: 'Winter & Revival',
    description: 'High maintenance costs and brittle symbolic rule bases led to massive funding cuts.',
    slideRef: 20,
  },
  {
    year: '1995',
    title: 'Agent-Based Artificial Intelligence',
    people: 'Stuart Russell & Peter Norvig',
    category: 'Winter & Revival',
    description: 'Unified the discipline under the rational agent paradigm.',
    slideRef: 20,
  },
  {
    year: '1997',
    title: 'Deep Blue Beats Garry Kasparov',
    people: 'IBM Research',
    category: 'Winter & Revival',
    description: 'Specialized alpha-beta search hardware evaluates 200M positions/sec to win in chess.',
    slideRef: 20,
  },
  {
    year: '2002',
    title: 'Roomba (iRobot)',
    category: 'Deep Learning',
    description: 'Autonomous behavior-based robotics enters millions of everyday homes.',
    slideRef: 21,
  },
  {
    year: '2011',
    title: 'Watson Wins Jeopardy! & Virtual Assistants Launch',
    people: 'IBM, Apple (Siri), Google',
    category: 'Deep Learning',
    description: 'IBM Watson defeats human champions; Siri and voice assistants enter smartphones.',
    slideRef: 21,
  },
  {
    year: '2012',
    title: 'AlexNet Wins ImageNet',
    people: 'Krizhevsky, Sutskever, Hinton',
    category: 'Deep Learning',
    description: 'Watershed moment: Deep Convolutional Networks on GPUs crush computer vision records.',
    slideRef: 21,
  },
  {
    year: '2016',
    title: 'AlphaGo Defeats Lee Sedol',
    people: 'DeepMind',
    category: 'Deep Learning',
    description: 'Mastered Go using deep reinforcement learning and Monte Carlo Tree Search.',
    slideRef: 22,
  },
  {
    year: '2017',
    title: 'The Transformer Architecture',
    people: 'Vaswani et al. (Google Brain)',
    category: 'GenAI & Agents',
    description: '"Attention Is All You Need" replaces recurrence, underpinning modern LLMs.',
    slideRef: 22,
  },
  {
    year: '2020–22',
    title: 'GPT-3 & ChatGPT Launch',
    people: 'OpenAI',
    category: 'GenAI & Agents',
    description: 'Large language models bring conversational foundation models to a mass audience.',
    slideRef: 22,
  },
  {
    year: '2025–26',
    title: 'Reasoning Models & Agentic AI',
    category: 'GenAI & Agents',
    description: 'Inference test-time compute, autonomous tool use, self-reflection, and physical embodied AI.',
    slideRef: 23,
  },
];

export const AITimeline: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filtered =
    activeFilter === 'All'
      ? TIMELINE_EVENTS
      : TIMELINE_EVENTS.filter((e) => e.category === activeFilter);

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <History size={18} className="text-cyan-400" />
            Evolution of Artificial Intelligence: 300 BC to 2026 (Lesson 1)
          </div>
          <div className="visualizer-subtitle">
            Historical Cycles, Symbolic Booms, AI Winters & The Modern Generative Wave
          </div>
        </div>

        <div className="visualizer-controls">
          {['All', 'Origins', 'Early AI', 'Winter & Revival', 'Deep Learning', 'GenAI & Agents'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`btn-tactile btn-sm ${activeFilter === cat ? 'btn-primary' : ''}`}
              style={{ fontSize: '0.72rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="visualizer-body" style={{ maxHeight: '480px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filtered.map((evt, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '1rem',
                padding: '0.9rem 1.1rem',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--border-subtle)',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  minWidth: '85px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--accent-cyan)',
                }}
              >
                {evt.year}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.92rem', color: '#f8fafc' }}>{evt.title}</strong>
                  <span className="slide-citation">Slide {evt.slideRef}</span>
                </div>
                {evt.people && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', margin: '0.15rem 0' }}>
                    {evt.people}
                  </div>
                )}
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {evt.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
