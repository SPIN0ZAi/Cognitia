import { useState } from 'react';
import type { QuizQuestion } from '../../types/course';
import { useStudy } from '../../context/StudyContext';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const QuizEngine: React.FC<{ questions: QuizQuestion[] }> = ({ questions }) => {
  const { progress, recordQuizResult } = useStudy();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQ = questions[currentIndex];
  const savedResult = progress.quizScores[currentQ?.id];

  const handleSelect = (idx: number) => {
    if (showExplanation || savedResult?.answered) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    const isCorrect = idx === currentQ.correctAnswer;
    recordQuizResult(currentQ.id, isCorrect, idx);

    if (isCorrect) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  // Compute total score
  const answeredTotal = Object.keys(progress.quizScores).length;
  const correctTotal = Object.values(progress.quizScores).filter((s) => s.correct).length;

  return (
    <div>
      {/* Quiz Header Score Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          padding: '0.85rem 1.25rem',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-cyan font-mono">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="badge badge-amber font-mono">{currentQ.difficulty}</span>
          <span className="slide-citation">
            {currentQ.lessonId.toUpperCase()} · Slide {currentQ.slideRef.slideNumber}
          </span>
        </div>

        <div style={{ fontSize: '0.85rem' }}>
          Overall Score: <strong className="font-mono text-emerald-400">{correctTotal}</strong> /{' '}
          <span className="font-mono">{answeredTotal}</span> answered
        </div>
      </div>

      {/* Main Question Card */}
      <div className="quiz-card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', lineHeight: 1.5 }}>
          {currentQ.question}
        </h3>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {currentQ.options?.map((opt, idx) => {
            const isUserChosen =
              selectedOption === idx || (savedResult && savedResult.selected === idx);
            const isCorrectAnswer = idx === currentQ.correctAnswer;
            const isRevealed = showExplanation || savedResult?.answered;

            let btnClass = 'quiz-option-btn';
            if (isRevealed) {
              if (isCorrectAnswer) btnClass += ' correct';
              else if (isUserChosen && !isCorrectAnswer) btnClass += ' wrong';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={btnClass}
                disabled={isRevealed}
              >
                <span
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    flexShrink: 0,
                  }}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span style={{ flex: 1 }}>{opt}</span>
                {isRevealed && isCorrectAnswer && (
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                )}
                {isRevealed && isUserChosen && !isCorrectAnswer && (
                  <XCircle size={16} className="text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Box */}
        {(showExplanation || savedResult?.answered) && (
          <div className="quiz-explanation-box">
            <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: '#f8fafc' }}>
              Detailed Academic Explanation:
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>{currentQ.explanation}</p>
          </div>
        )}

        {/* Pagination */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="btn-tactile btn-sm"
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className="btn-tactile btn-primary btn-sm"
          >
            <span>Next Question</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
