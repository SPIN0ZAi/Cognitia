import React, { useState } from 'react';
import { Cpu, CheckCircle2, XCircle, HelpCircle, ShieldCheck } from 'lucide-react';

interface Job {
  id: number;
  name: string;
  time: number;
}

const JOBS: Job[] = [
  { id: 0, name: 'J0', time: 8 },
  { id: 1, name: 'J1', time: 7 },
  { id: 2, name: 'J2', time: 6 },
  { id: 3, name: 'J3', time: 5 },
  { id: 4, name: 'J4', time: 4 },
];

export const TwoProcessorBalancingSolver: React.FC = () => {
  // Binary assignment vector c: c[i] = 0 for P0, 1 for P1
  const [assignment, setAssignment] = useState<number[]>([0, 1, 0, 1, 0]); // c(1) preset
  const [symmetryLock, setSymmetryLock] = useState<boolean>(false);

  // Student calculation inputs for Slide 55 questions
  const [ansC1, setAnsC1] = useState<string>('');
  const [ansC2, setAnsC2] = useState<string>('');
  const [ansTotalConfigs, setAnsTotalConfigs] = useState<string>('');
  const [ansOptimalScore, setAnsOptimalScore] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isAllCorrect, setIsAllCorrect] = useState<boolean | null>(null);

  // Toggle job processor assignment
  const toggleJob = (index: number) => {
    if (symmetryLock && index === 0) return; // Locked by symmetry
    setAssignment((prev) => {
      const next = [...prev];
      next[index] = next[index] === 0 ? 1 : 0;
      return next;
    });
  };

  // Compute workloads
  const l0 = JOBS.reduce((acc, job, i) => acc + (assignment[i] === 0 ? job.time : 0), 0);
  const l1 = JOBS.reduce((acc, job, i) => acc + (assignment[i] === 1 ? job.time : 0), 0);
  const objective = Math.abs(l0 - l1);

  const checkExamAnswers = () => {
    const okC1 = parseInt(ansC1) === 6;
    const okC2 = parseInt(ansC2) === 10;
    const okTotal = parseInt(ansTotalConfigs) === 32;
    const okOpt = parseInt(ansOptimalScore) === 0;

    if (okC1 && okC2 && okTotal && okOpt) {
      setIsAllCorrect(true);
      setFeedback('All 4 answers are 100% correct! You have mastered the mathematical formalization of Lesson 6.');
    } else {
      setIsAllCorrect(false);
      setFeedback(
        `Check your calculations: c(1)=(0,1,0,1,0) has L0=18, L1=12 (|18-12|=6). c(2)=(0,0,1,0,1) has L0=20, L1=10 (|20-10|=10). Total binary configurations = 2^5 = 32. Optimal score = 0 (15 on each processor).`
      );
    }
  };

  return (
    <div className="card" style={{ padding: '1.75rem', border: '1px solid var(--lab-border-active)' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
        <Cpu size={22} color="var(--lab-accent-amber)" />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-amber font-mono">OFFICIAL UCLM PROPOSED EXERCISE</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Slides 54–55 · Processor Balancing</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.2rem' }}>
            Balancing Jobs Between Two Identical Processors
          </h3>
        </div>
      </div>

      {/* Problem Statement */}
      <div
        style={{
          background: 'var(--lab-bg-surface)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.82rem',
          marginBottom: '1.5rem',
          lineHeight: '1.5',
        }}
      >
        Five independent jobs with processing times <strong>J0=8, J1=7, J2=6, J3=5, J4=4</strong> (total = 30) must be assigned to processors $P_0$ and $P_1$.
        The objective is to minimize workload difference:
        <div style={{ marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>
          {"$$L_0(c) = \\sum_{i=0}^4 t_i(1 - c_i), \\qquad L_1(c) = \\sum_{i=0}^4 t_i c_i, \\qquad f(c) = |L_0(c) - L_1(c)|$$"}
        </div>
      </div>

      {/* Interactive Job Assignment Strip */}
      <div
        style={{
          background: 'var(--lab-bg-obsidian)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--lab-border-active)',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Click jobs to toggle processor assignment (c_i &isin; &#123;0, 1&#125;):
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setAssignment([0, 1, 0, 1, 0])}
              className="btn-tactile btn-xs"
              title="Set to Preset c(1)"
            >
              Preset c(1)
            </button>
            <button
              onClick={() => setAssignment([0, 0, 1, 0, 1])}
              className="btn-tactile btn-xs"
              title="Set to Preset c(2)"
            >
              Preset c(2)
            </button>
            <button
              onClick={() => setAssignment([0, 0, 1, 1, 1])}
              className="btn-tactile btn-xs btn-emerald"
              title="Set to Optimal Solution"
            >
              Preset Optimal c*
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {JOBS.map((job, idx) => {
            const isP1 = assignment[idx] === 1;
            const isLocked = symmetryLock && idx === 0;

            return (
              <button
                key={job.id}
                onClick={() => toggleJob(idx)}
                disabled={isLocked}
                className="btn-tactile"
                style={{
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: isP1 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  border: isP1 ? '1px solid var(--accent-cyan)' : '1px solid var(--lab-accent-amber)',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.name} (t={job.time})</div>
                <strong style={{ fontSize: '1.1rem', marginTop: '0.2rem', color: isP1 ? 'var(--accent-cyan)' : 'var(--lab-accent-amber)' }}>
                  {isP1 ? 'P1 (c=1)' : 'P0 (c=0)'}
                </strong>
                {isLocked && <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Locked J0=P0</span>}
              </button>
            );
          })}
        </div>

        {/* Live Dual Workload Gauges */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '1rem', alignItems: 'center' }}>
          {/* P0 */}
          <div style={{ padding: '0.75rem', background: 'var(--lab-bg-surface)', borderRadius: '6px', border: '1px solid var(--lab-border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              <span>Processor P0 Workload L0:</span>
              <strong className="font-mono">{l0} units</strong>
            </div>
            <div style={{ height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${(l0 / 30) * 100}%`, height: '100%', background: 'var(--lab-accent-amber)', transition: 'width 0.2s' }} />
            </div>
          </div>

          {/* P1 */}
          <div style={{ padding: '0.75rem', background: 'var(--lab-bg-surface)', borderRadius: '6px', border: '1px solid var(--lab-border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              <span>Processor P1 Workload L1:</span>
              <strong className="font-mono">{l1} units</strong>
            </div>
            <div style={{ height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${(l1 / 30) * 100}%`, height: '100%', background: 'var(--accent-cyan)', transition: 'width 0.2s' }} />
            </div>
          </div>

          {/* Objective f(c) */}
          <div style={{ textAlign: 'center', padding: '0.75rem', background: objective === 0 ? 'rgba(16, 185, 129, 0.2)' : 'var(--lab-bg-surface)', borderRadius: '6px', border: `1px solid ${objective === 0 ? 'var(--accent-emerald)' : 'var(--border-subtle)'}` }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Difference f(c):</div>
            <strong style={{ fontSize: '1.4rem', fontFamily: 'var(--font-mono)', color: objective === 0 ? 'var(--accent-emerald)' : 'var(--text-primary)' }}>
              {objective}
            </strong>
          </div>
        </div>
      </div>

      {/* Symmetry Reduction Toggle Card */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          background: 'var(--lab-bg-surface)',
          marginBottom: '1.5rem',
          border: '1px solid var(--lab-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <strong style={{ fontSize: '0.9rem', color: 'var(--lab-accent-cyan)' }}>
              Question 6: Complement Symmetry Breaking
            </strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {"Any configuration c and its complement c̄ = (1 - c0, ..., 1 - c4) represent the exact same workload partition, merely swapping processor names."}
              {" Fixing c0 = 0 permanently removes this duplicate symmetry!"}
            </p>
          </div>

          <button
            onClick={() => {
              setSymmetryLock(!symmetryLock);
              if (!symmetryLock) {
                // Force J0 to 0
                setAssignment((prev) => [0, prev[1], prev[2], prev[3], prev[4]]);
              }
            }}
            className={`btn-tactile btn-sm ${symmetryLock ? 'btn-primary' : ''}`}
          >
            <ShieldCheck size={14} />
            <span>{symmetryLock ? 'Symmetry Fixed (c0 = 0) [16 States]' : 'Allow Symmetries [32 States]'}</span>
          </button>
        </div>
      </div>

      {/* Self-Test Practice Questions (Slide 55) */}
      <div className="card" style={{ padding: '1.25rem', background: 'var(--lab-bg-surface)', border: '1px solid var(--lab-accent-amber)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
          <HelpCircle size={16} color="var(--lab-accent-amber)" />
          <strong style={{ fontSize: '0.9rem' }}>Official Slide 55 Exam Verification Questions</strong>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>
              Q3: Evaluate f(c(1)) for c(1)=(0,1,0,1,0):
            </label>
            <input
              type="number"
              placeholder="e.g. 6"
              value={ansC1}
              onChange={(e) => setAnsC1(e.target.value)}
              className="input-field"
              style={{ width: '100%', padding: '0.4rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>
              Q3: Evaluate f(c(2)) for c(2)=(0,0,1,0,1):
            </label>
            <input
              type="number"
              placeholder="e.g. 10"
              value={ansC2}
              onChange={(e) => setAnsC2(e.target.value)}
              className="input-field"
              style={{ width: '100%', padding: '0.4rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>
              Q4: Total binary configurations:
            </label>
            <input
              type="number"
              placeholder="e.g. 32"
              value={ansTotalConfigs}
              onChange={(e) => setAnsTotalConfigs(e.target.value)}
              className="input-field"
              style={{ width: '100%', padding: '0.4rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>
              Q5: Optimal objective value f(c*):
            </label>
            <input
              type="number"
              placeholder="e.g. 0"
              value={ansOptimalScore}
              onChange={(e) => setAnsOptimalScore(e.target.value)}
              className="input-field"
              style={{ width: '100%', padding: '0.4rem' }}
            />
          </div>
        </div>

        <button onClick={checkExamAnswers} className="btn-tactile btn-sm btn-amber">
          Verify My Answers
        </button>

        {feedback && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: isAllCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${isAllCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {isAllCorrect ? <CheckCircle2 size={16} color="var(--accent-emerald)" /> : <XCircle size={16} color="var(--accent-rose)" />}
            <span>{feedback}</span>
          </div>
        )}
      </div>
    </div>
  );
};
