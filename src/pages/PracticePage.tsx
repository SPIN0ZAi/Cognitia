import React, { useState } from 'react';
import { PRACTICE_QUESTIONS } from '../data/practiceData';
import { QuizEngine } from '../components/practice/QuizEngine';
import { Filter, Compass, BookOpen } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { RomaniaSearchChallenge } from '../components/visualizers/RomaniaSearchChallenge';

export const PracticePage: React.FC<{
  onNavigate?: (view: string, lessonId?: string, sectionId?: string) => void;
}> = () => {
  const { progress } = useStudy();
  const [selectedLesson, setSelectedLesson] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [practiceTab, setPracticeTab] = useState<'quiz' | 'romania'>('quiz');

  const filteredQuestions = PRACTICE_QUESTIONS.filter((q: any) => {
    if (selectedLesson !== 'all' && q.lessonId !== selectedLesson) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const totalAnswered = Object.keys(progress.quizScores).length;
  const totalCorrect = Object.values(progress.quizScores).filter((s: any) => s.correct).length;
  const scorePercent = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-amber font-mono">Exam Preparation</span>
          <span className="badge badge-cyan font-mono">{PRACTICE_QUESTIONS.length} Questions</span>
          <span className="slide-citation">ESII Albacete · UCLM</span>
        </div>

        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Practice & Revision Center
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          University exam-level multiple choice questions, formal proofs, and numerical calculations derived directly from the lecture materials, featuring step-by-step academic explanations.
        </p>

        {/* Performance Overview Banner */}
        <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Questions Answered</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
              {totalAnswered} / {PRACTICE_QUESTIONS.length}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accuracy Rate</div>
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: scorePercent >= 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
              }}
            >
              {scorePercent}%
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Correct Answers</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
              {totalCorrect}
            </div>
          </div>
        </div>

        {/* Practice Mode Tabs */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            padding: '0.4rem',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem',
          }}
        >
          <button
            onClick={() => setPracticeTab('quiz')}
            className={`btn-tactile btn-sm ${practiceTab === 'quiz' ? 'btn-primary' : ''}`}
            style={{ flex: '1 1 240px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            <BookOpen size={14} />
            <span>Multiple Choice &amp; Calculation Questions</span>
          </button>
          <button
            onClick={() => setPracticeTab('romania')}
            className={`btn-tactile btn-sm ${practiceTab === 'romania' ? 'btn-amber' : ''}`}
            style={{ flex: '1 1 240px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            <Compass size={14} />
            <span>Romania Route Search Exam Trainer</span>
          </button>
        </div>

        {/* Filters Bar (Only in Quiz Tab) */}
        {practiceTab === 'quiz' && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '1rem',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              alignItems: 'center',
              marginBottom: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={15} className="text-cyan-400" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filter by Lesson:</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {[
                { id: 'all', label: 'All Lessons' },
                { id: 'lesson-1', label: 'Lesson 1 (Intro & Ethics)' },
                { id: 'lesson-2', label: 'Lesson 2 (Uninformed Search)' },
                { id: 'lesson-3', label: 'Lesson 3 (Heuristic Search)' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedLesson(f.id)}
                  className={`btn-tactile btn-sm ${selectedLesson === f.id ? 'btn-primary' : ''}`}
                  style={{ fontSize: '0.75rem' }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
              {['all', 'Foundation', 'Intermediate', 'Exam-Level'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`btn-tactile btn-sm ${selectedDifficulty === diff ? 'btn-amber' : ''}`}
                  style={{ fontSize: '0.72rem' }}
                >
                  {diff === 'all' ? 'All Tiers' : diff}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {practiceTab === 'romania' ? (
        <RomaniaSearchChallenge />
      ) : filteredQuestions.length > 0 ? (
        <QuizEngine questions={filteredQuestions} />
      ) : (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No questions match the selected filter combination.
        </div>
      )}
    </div>
  );
};
