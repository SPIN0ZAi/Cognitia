import React from 'react';
import { useStudy } from '../context/StudyContext';
import { LESSON_1_DATA } from '../data/lesson1Data';
import { LESSON_2_DATA } from '../data/lesson2Data';
import { LESSON_3_DATA } from '../data/lesson3Data';
import { PRACTICE_QUESTIONS } from '../data/practiceData';
import { Trash2, ArrowRight, RotateCcw } from 'lucide-react';

export const ProgressPage: React.FC<{
  onNavigate: (view: string, lessonId?: string, sectionId?: string) => void;
}> = ({ onNavigate }) => {
  const { progress, toggleBookmark, resetProgress } = useStudy();
  const lessons = [LESSON_1_DATA, LESSON_2_DATA, LESSON_3_DATA];

  // Calculate stats for each lesson
  const lessonStats = lessons.map((l) => {
    let total = 0;
    let completed = 0;
    l.chapters.forEach((ch: any) => {
      ch.sections.forEach((sec: any) => {
        total++;
        if (progress.completedSections[`${l.id}:${sec.id}`]) {
          completed++;
        }
      });
    });
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { id: l.id, title: l.title, number: l.number, total, completed, pct };
  });

  const totalAnswered = Object.keys(progress.quizScores).length;
  const totalCorrect = Object.values(progress.quizScores).filter((s: any) => s.correct).length;
  const quizAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-emerald font-mono">Learning Analytics</span>
          <span className="badge badge-cyan font-mono">Local Storage Persistence</span>
        </div>

        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Study Progress & Saved Bookmarks
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
          Track completed lesson syllabus modules, test results across practice questions, and jump directly to bookmarked topics.
        </p>
      </div>

      {/* Lesson Syllabus Progress Bars */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#f8fafc' }}>
          Lesson Syllabus Completion
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {lessonStats.map((stat) => (
            <div key={stat.id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.65rem',
                }}
              >
                <div>
                  <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>
                    Lesson {stat.number}: {stat.title.split(':')[0]}
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    ({stat.completed} / {stat.total} sections)
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-emerald font-mono">{stat.pct}%</span>
                  <button
                    onClick={() => onNavigate('lesson', stat.id)}
                    className="btn-tactile btn-sm"
                  >
                    <span>Open</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${stat.pct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #06b6d4, #10b981)',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quiz Performance Stats */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#f8fafc' }}>
          Practice Exam Performance
        </h2>

        <div className="grid-3">
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Questions Answered</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
              {totalAnswered} / {PRACTICE_QUESTIONS.length}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Correct Answers</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
              {totalCorrect}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accuracy Percentage</div>
            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: quizAccuracy >= 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
              }}
            >
              {quizAccuracy}%
            </div>
          </div>
        </div>
      </section>

      {/* Bookmarks Section */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
            Saved Bookmarks ({progress.bookmarks.length})
          </h2>
        </div>

        {progress.bookmarks.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No saved bookmarks yet. While reading any lesson section, click the bookmark icon to save key theorems, proofs, or definitions for fast revision!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {progress.bookmarks.map((bm: any) => (
              <div
                key={bm.id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#f8fafc' }}>
                    {bm.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {bm.previewText}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => onNavigate('lesson', bm.lessonId, bm.sectionId)}
                    className="btn-tactile btn-sm btn-primary"
                  >
                    <span>Jump to Section</span>
                    <ArrowRight size={13} />
                  </button>
                  <button
                    onClick={() => toggleBookmark(bm)}
                    className="btn-tactile btn-sm"
                    title="Remove Bookmark"
                  >
                    <Trash2 size={13} className="text-rose-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Local Storage Notice & Reset */}
      <section style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            💡 Your learning progress and quiz answers are automatically saved to your browser’s local storage.
          </div>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all progress and bookmarks?')) {
                resetProgress();
              }
            }}
            className="btn-tactile btn-sm"
            style={{ color: '#fb7185' }}
          >
            <RotateCcw size={13} />
            <span>Reset All Progress</span>
          </button>
        </div>
      </section>
    </div>
  );
};
