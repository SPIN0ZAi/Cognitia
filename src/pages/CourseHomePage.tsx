import React from 'react';
import {
  BookOpen,
  ArrowRight,
  Compass,
  Sparkles,
  HelpCircle,
  Bookmark,
  ShieldCheck,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { LESSON_1_DATA } from '../data/lesson1Data';
import { LESSON_2_DATA } from '../data/lesson2Data';
import { LESSON_3_DATA } from '../data/lesson3Data';

export const CourseHomePage: React.FC<{
  onNavigate: (view: string, lessonId?: string, sectionId?: string) => void;
}> = ({ onNavigate }) => {
  const { progress } = useStudy();
  const lessons = [LESSON_1_DATA, LESSON_2_DATA, LESSON_3_DATA];

  // Calculate total completed sections
  let totalSections = 0;
  lessons.forEach((l) =>
    l.chapters.forEach((ch: any) => {
      totalSections += ch.sections.length;
    })
  );
  const completedSections = Object.values(progress.completedSections).filter(Boolean).length;
  const progressPercent = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

  return (
    <div className="page-wrapper">
      {/* Course Hero Banner */}
      <section
        style={{
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-xl)',
          background:
            'radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.12), rgba(15, 21, 35, 0.95))',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg)',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
          <span className="badge badge-cyan">UCLM 2026/2027</span>
          <span className="badge badge-indigo">Degree in Computer Science</span>
          <span className="slide-citation">ESII Albacete</span>
        </div>

        <h1
          style={{
            fontSize: '2.3rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            marginBottom: '0.75rem',
            background: 'linear-gradient(135deg, #f8fafc, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Intelligent Systems
        </h1>

        <p
          style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            maxWidth: '720px',
            lineHeight: 1.6,
            marginBottom: '1.75rem',
          }}
        >
          An interactive, academically rigorous university learning platform covering foundations of artificial intelligence, state space representation, uninformed search strategies, and heuristic informed algorithms with formal mathematical proofs and tactile simulations.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center' }}>
          {progress.lastVisited && (
            <button
              onClick={() =>
                onNavigate(
                  'lesson',
                  progress.lastVisited?.lessonId,
                  progress.lastVisited?.sectionId
                )
              }
              className="btn-tactile btn-primary"
            >
              <BookOpen size={15} />
              <span>Resume Study Session</span>
              <ArrowRight size={14} />
            </button>
          )}

          <button onClick={() => onNavigate('practice')} className="btn-tactile">
            <HelpCircle size={15} />
            <span>Practice Exam Questions</span>
          </button>

          <button onClick={() => onNavigate('glossary')} className="btn-tactile">
            <Bookmark size={15} />
            <span>Search Glossary</span>
          </button>
        </div>
      </section>

      {/* Course Progress Snapshot */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>
              Your Course Completion Status
            </span>
            <span className="badge badge-emerald font-mono">{progressPercent}% Completed</span>
          </div>

          <div
            style={{
              height: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '0.5rem',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #06b6d4, #10b981)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>{completedSections} of {totalSections} syllabus sections completed</span>
            <span>{progress.bookmarks.length} saved bookmarks</span>
          </div>
        </div>
      </section>

      {/* The Three Authoritative Lessons */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem', color: '#f8fafc' }}>
          Authoritative Course Lessons (UCLM)
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {lessons.map((lesson) => {
            return (
              <div
                key={lesson.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.5rem',
                  cursor: 'pointer',
                }}
                onClick={() => onNavigate('lesson', lesson.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-cyan font-mono">Lesson {lesson.number}</span>
                    <span className="slide-citation">{lesson.slideCount} Slides</span>
                  </div>
                  <span className="badge badge-indigo">ESII Albacete</span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem', color: '#f8fafc' }}>
                  {lesson.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {lesson.subtitle}
                </p>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {lesson.overview}
                </p>

                {/* Chapters Preview */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                  {lesson.chapters.map((ch: any) => (
                    <span
                      key={ch.id}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        background: 'rgba(255, 255, 255, 0.04)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      Ch {ch.number}: {ch.title}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Authors: {lesson.authors.join(', ')}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      color: '#38bdf8',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    <span>Open Lesson</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Simulators Hub */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem', color: '#f8fafc' }}>
          Interactive Algorithmic Laboratories
        </h2>

        <div className="grid-3">
          <div
            className="card"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('lesson', 'lesson-2', 'example-romania-formulation')}
          >
            <Compass size={24} className="text-cyan-400" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>
              Romania Route Search Engine
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Interactive graph search comparing BFS, UCS, DFS, DLS, Greedy Best-First, and A* step-by-step.
            </p>
          </div>

          <div
            className="card"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('lesson', 'lesson-3', 'eight-puzzle-heuristics-and-dominance')}
          >
            <Sparkles size={24} className="text-amber-400" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>
              8-Puzzle Heuristic Lab
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Slide tiles interactively, inspect live $h_1$ and $h_2$ Manhattan values, and verify dominance.
            </p>
          </div>

          <div
            className="card"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('lesson', 'lesson-3', 'admissibility-and-proof-of-optimality')}
          >
            <ShieldCheck size={24} className="text-emerald-400" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>
              A* Optimality Proof Explorer
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Step-by-step interactive deductive verification of A* tree optimality from Slide 37.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
