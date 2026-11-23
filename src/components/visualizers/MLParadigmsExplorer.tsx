import React, { useState } from 'react';

interface TaskCard {
  id: number;
  title: string;
  description: string;
  correctParadigm: 'supervised' | 'unsupervised' | 'rl';
  explanation: string;
}

export const MLParadigmsExplorer: React.FC = () => {
  const tasks: TaskCard[] = [
    {
      id: 1,
      title: 'Email Spam Filter',
      description: 'Given 50,000 emails labeled by users as "Spam" or "Ham", predict whether new incoming emails are spam.',
      correctParadigm: 'supervised',
      explanation: 'Supervised Learning: Each training email is paired with an explicit ground-truth class label (Spam/Ham).',
    },
    {
      id: 2,
      title: 'E-Commerce Customer Segmentation',
      description: 'Group 100,000 shoppers into 6 behavioral clusters based on purchasing history, without any predefined categories.',
      correctParadigm: 'unsupervised',
      explanation: 'Unsupervised Learning: No target labels exist; the algorithm discovers latent groupings based on feature similarity.',
    },
    {
      id: 3,
      title: 'Autonomous Drone Obstacle Avoidance',
      description: 'A drone learns to navigate dense forest winds by receiving positive rewards (+10) for forward velocity and large penalties (-100) for collisions.',
      correctParadigm: 'rl',
      explanation: 'Reinforcement Learning: An active agent acts sequentially in an environment and learns an optimal policy through scalar reward feedback.',
    },
    {
      id: 4,
      title: 'House Price Estimation',
      description: 'Predict the continuous market price of a residential house given square meters, number of bedrooms, and neighborhood crime rate from historical sales.',
      correctParadigm: 'supervised',
      explanation: 'Supervised Learning (Regression): Continuous target labels (selling price in euros) are provided for each home profile.',
    },
    {
      id: 5,
      title: 'Financial Transaction Fraud Detection (Novelty)',
      description: 'Monitor millions of credit card transactions to detect abnormal, never-before-seen patterns that deviate statistically from normal baseline activity.',
      correctParadigm: 'unsupervised',
      explanation: 'Unsupervised Learning (Anomaly / Outlier Detection): Models the normal data density p(x) without explicit fraud labels.',
    },
    {
      id: 6,
      title: 'Chess Engine Move Optimization (AlphaZero)',
      description: 'An AI plays millions of games against itself, receiving +1 for a win, -1 for a loss, and 0 for a draw, optimizing its opening and endgame strategies.',
      correctParadigm: 'rl',
      explanation: 'Reinforcement Learning: Self-play trial-and-error with delayed sparse terminal rewards.',
    },
  ];

  const [activeTaskIdx, setActiveTaskIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [id: number]: 'supervised' | 'unsupervised' | 'rl' }>({});
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  const currentTask = tasks[activeTaskIdx];
  const currentAnswer = selectedAnswers[currentTask.id];

  const handleSelect = (paradigm: 'supervised' | 'unsupervised' | 'rl') => {
    setSelectedAnswers((prev) => ({ ...prev, [currentTask.id]: paradigm }));
    setShowFeedback(true);
  };

  const isCorrect = currentAnswer === currentTask.correctParadigm;

  return (
    <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Interactive Laboratory 9.1
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Machine Learning Paradigm Sorting Challenge
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Slide 9–18: Classify real-world tasks into Supervised, Unsupervised, or Reinforcement Learning.
          </p>
        </div>

        {/* Task navigation */}
        <div className="flex items-center gap-1.5">
          {tasks.map((t, idx) => {
            const ans = selectedAnswers[t.id];
            const correct = ans === t.correctParadigm;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTaskIdx(idx);
                  setShowFeedback(!!selectedAnswers[t.id]);
                }}
                className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeTaskIdx === idx
                    ? 'ring-2 ring-cyan-400 bg-slate-800 text-white'
                    : ans !== undefined
                    ? correct
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task Card */}
      <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center text-xs font-mono text-slate-500">
          <span>Case Study {activeTaskIdx + 1} of {tasks.length}</span>
          <span>Target: Identify correct learning paradigm</span>
        </div>

        <h4 className="text-lg font-bold text-white tracking-tight">{currentTask.title}</h4>
        <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-lg border border-slate-800">
          {currentTask.description}
        </p>

        {/* Paradigm Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => handleSelect('supervised')}
            className={`p-4 rounded-xl border text-left transition-all ${
              currentAnswer === 'supervised'
                ? currentTask.correctParadigm === 'supervised'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500 text-rose-200'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:border-cyan-500/50'
            }`}
          >
            <div className="font-bold text-sm mb-1 text-cyan-400">Supervised Learning</div>
            <div className="text-xs text-slate-400">Explicit labeled target pairs (x, y)</div>
          </button>

          <button
            onClick={() => handleSelect('unsupervised')}
            className={`p-4 rounded-xl border text-left transition-all ${
              currentAnswer === 'unsupervised'
                ? currentTask.correctParadigm === 'unsupervised'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500 text-rose-200'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:border-purple-500/50'
            }`}
          >
            <div className="font-bold text-sm mb-1 text-purple-400">Unsupervised Learning</div>
            <div className="text-xs text-slate-400">Unlabeled data; discovering latent structure / clusters</div>
          </button>

          <button
            onClick={() => handleSelect('rl')}
            className={`p-4 rounded-xl border text-left transition-all ${
              currentAnswer === 'rl'
                ? currentTask.correctParadigm === 'rl'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500 text-rose-200'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:border-amber-500/50'
            }`}
          >
            <div className="font-bold text-sm mb-1 text-amber-400">Reinforcement Learning</div>
            <div className="text-xs text-slate-400">Active agent, sequential actions, scalar rewards r</div>
          </button>
        </div>

        {/* Feedback Banner */}
        {showFeedback && (
          <div
            className={`p-4 rounded-xl border text-xs leading-relaxed transition-all ${
              isCorrect
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="font-bold mb-1">
              {isCorrect ? 'Correct Decision!' : `Incorrect: The correct paradigm is ${currentTask.correctParadigm.toUpperCase()}`}
            </div>
            <div>{currentTask.explanation}</div>
          </div>
        )}
      </div>
    </div>
  );
};
