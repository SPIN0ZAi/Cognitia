/**
 * Cognitia Chase: Interactive Micro-Lesson & Gating Quiz Modal
 */

import React, { useState } from 'react';
import type { CampaignLevelConfig } from '../engine/types';
import { CheckCircle2, XCircle, ArrowRight, Award, BookOpen, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MicroLessonModalProps {
  levelConfig: CampaignLevelConfig;
  isOpen: boolean;
  onPassQuiz: () => void;
  onClose: () => void;
}

export const MicroLessonModal: React.FC<MicroLessonModalProps> = ({
  levelConfig,
  isOpen,
  onPassQuiz,
  onClose,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ = levelConfig.quizQuestions[currentQuestionIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;

    const correct = selectedOption === currentQ.correctIndex;
    setIsCorrect(correct);
    setIsAnswerSubmitted(true);

    if (correct) {
      setScore((s) => s + 1);
      try {
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
      } catch (e) {
        // ignore
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 < levelConfig.quizQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setIsCorrect(false);
    } else {
      setIsFinished(true);
      onPassQuiz();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="card animate-fade-in"
        style={{
          maxWidth: '620px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#070a12',
          border: '1px solid #1a273b',
          borderRadius: '12px',
          padding: '1.75rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 30px rgba(120, 213, 232, 0.15)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
          <div
            style={{
              padding: '0.45rem',
              borderRadius: '8px',
              background: 'rgba(120, 213, 232, 0.12)',
              border: '1px solid rgba(120, 213, 232, 0.25)',
              color: '#78D5E8',
            }}
          >
            <BookOpen size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#F1F5F9', fontWeight: 700 }}>
              {levelConfig.title}
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#78D5E8', fontFamily: 'var(--font-mono)' }}>
              {levelConfig.subtitle}
            </span>
          </div>
        </div>

        {/* Micro-Lesson Brief */}
        <div
          style={{
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid #142030',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            fontSize: '0.86rem',
            lineHeight: 1.6,
            color: '#CBD5E1',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#C6F277', fontWeight: 700, marginBottom: '0.4rem' }}>
            <Lightbulb size={16} />
            <span>ALGORITHM BRIEFING:</span>
          </div>
          {levelConfig.description}
        </div>

        {/* Gating Quiz Section */}
        {!isFinished ? (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: '#64748B',
              }}
            >
              <span>CHECKPOINT QUIZ (QUESTION {currentQuestionIndex + 1} OF {levelConfig.quizQuestions.length})</span>
              <span>SCORE: {score}/{currentQuestionIndex + (isAnswerSubmitted && isCorrect ? 1 : 0)}</span>
            </div>

            <div style={{ fontSize: '0.94rem', fontWeight: 600, color: '#F8FAFC', marginBottom: '1rem' }}>
              {currentQ.question}
            </div>

            {/* Multiple Choice Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                let bg = 'rgba(255, 255, 255, 0.02)';
                let border = '#162335';
                let textColor = '#CBD5E1';

                if (isAnswerSubmitted) {
                  if (idx === currentQ.correctIndex) {
                    bg = 'rgba(198, 242, 119, 0.15)';
                    border = '#C6F277';
                    textColor = '#C6F277';
                  } else if (isSelected && !isCorrect) {
                    bg = 'rgba(244, 63, 94, 0.15)';
                    border = '#F43F5E';
                    textColor = '#F43F5E';
                  }
                } else if (isSelected) {
                  bg = 'rgba(120, 213, 232, 0.15)';
                  border = '#78D5E8';
                  textColor = '#78D5E8';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswerSubmitted}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      background: bg,
                      border: `1px solid ${border}`,
                      color: textColor,
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      cursor: isAnswerSubmitted ? 'default' : 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: `1px solid ${border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation Readout */}
            {isAnswerSubmitted && (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '6px',
                  background: isCorrect ? 'rgba(198, 242, 119, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                  border: `1px solid ${isCorrect ? '#C6F277' : '#F43F5E'}`,
                  marginBottom: '1.25rem',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  color: isCorrect ? '#C6F277' : '#FCA5A5',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                  {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  <span>{isCorrect ? 'EXCELLENT UNDERSTANDING!' : 'CONCEPT CLARIFICATION:'}</span>
                </div>
                {currentQ.explanation}
              </div>
            )}

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              {!isAnswerSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null}
                  className="btn-tactile btn-primary"
                  style={{ opacity: selectedOption === null ? 0.5 : 1 }}
                >
                  Verify Answer
                </button>
              ) : (
                <button onClick={handleNext} className="btn-tactile btn-primary">
                  {currentQuestionIndex + 1 < levelConfig.quizQuestions.length ? 'Next Question' : 'Complete Briefing'}
                  <ArrowRight size={16} style={{ marginLeft: '0.4rem' }} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <Award size={48} color="#C6F277" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ color: '#F1F5F9', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              Briefing Complete!
            </h4>
            <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              You answered all checkpoint questions. You are ready to outsmart the algorithm!
            </p>
            <button onClick={onClose} className="btn-tactile btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
              Enter Labyrinth
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
