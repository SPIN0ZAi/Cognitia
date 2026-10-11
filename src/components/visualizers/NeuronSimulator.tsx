import { useState } from 'react';
import { Cpu } from 'lucide-react';

export const NeuronSimulator: React.FC = () => {
  const [x1, setX1] = useState<0 | 1>(1);
  const [x2, setX2] = useState<0 | 1>(1);
  const [w1, setW1] = useState(1);
  const [w2, setW2] = useState(1);
  const [threshold, setThreshold] = useState(2); // theta

  const sum = x1 * w1 + x2 * w2;
  const isFired = sum >= threshold;

  const setGatePreset = (gate: 'AND' | 'OR') => {
    if (gate === 'AND') {
      setW1(1);
      setW2(1);
      setThreshold(2);
    } else {
      setW1(1);
      setW2(1);
      setThreshold(1);
    }
  };

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Cpu size={18} className="text-cyan-400" />
            1943 McCulloch & Pitts Artificial Neuron Simulator (Lesson 1, Slide 18)
          </div>
          <div className="visualizer-subtitle">
            Dendrite Inputs, Synaptic Summation ($\sum$) and All-or-None Threshold Activation
          </div>
        </div>

        <div className="visualizer-controls">
          <button onClick={() => setGatePreset('AND')} className="btn-tactile btn-sm">
            Preset: Logical AND ($\theta=2$)
          </button>
          <button onClick={() => setGatePreset('OR')} className="btn-tactile btn-sm">
            Preset: Logical OR ($\theta=1$)
          </button>
        </div>
      </div>

      <div className="visualizer-body">
        {/* Schematic Circuit Diagram */}
        <div
          style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem 1.5rem',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '650px',
            margin: '0 auto',
          }}
        >
          {/* Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                Dendrite $x_1$:
              </div>
              <button
                onClick={() => setX1(x1 === 1 ? 0 : 1)}
                className={`btn-tactile ${x1 === 1 ? 'btn-primary' : ''}`}
                style={{ width: '65px' }}
              >
                {x1}
              </button>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                Dendrite $x_2$:
              </div>
              <button
                onClick={() => setX2(x2 === 1 ? 0 : 1)}
                className={`btn-tactile ${x2 === 1 ? 'btn-primary' : ''}`}
                style={{ width: '65px' }}
              >
                {x2}
              </button>
            </div>
          </div>

          <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>&rarr;</div>

          {/* Summation Node */}
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: '#1e293b',
              border: '2px solid #38bdf8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.2)',
            }}
          >
            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>&Sigma;</div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
              {sum}
            </div>
          </div>

          <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>&rarr;</div>

          {/* Threshold Gate */}
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: '#1e293b',
              border: `2px solid ${isFired ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isFired ? '0 0 16px rgba(16, 185, 129, 0.3)' : 'none',
            }}
          >
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>&ge; &theta;</div>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
              &theta; = {threshold}
            </div>
          </div>

          <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>&rarr;</div>

          {/* Axon Output */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              Axon Output $y$:
            </div>
            <div
              style={{
                width: '65px',
                height: '45px',
                borderRadius: '8px',
                background: isFired ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                border: `2px solid ${isFired ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: isFired ? '#34d399' : '#fb7185',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {isFired ? '1' : '0'}
            </div>
          </div>
        </div>

        {/* Status description */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem' }}>
          Condition: <span className="font-mono">{sum} &ge; {threshold}</span> &implies;{' '}
          <strong style={{ color: isFired ? '#34d399' : '#fb7185' }}>
            {isFired ? 'Action Potential Fired (y = 1)' : 'Below Threshold (y = 0)'}
          </strong>
        </div>
      </div>
    </div>
  );
};
