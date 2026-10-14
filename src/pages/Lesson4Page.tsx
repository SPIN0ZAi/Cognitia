import React, { useEffect } from 'react';
import { LESSON_4_DATA } from '../data/lesson4Data';
import { useStudy } from '../context/StudyContext';
import { Bookmark, CheckCircle2 } from 'lucide-react';
import { MinimaxAlphaBetaVisualizer } from '../components/visualizers/MinimaxAlphaBetaVisualizer';
import { TicTacToeMinimaxVisualizer } from '../components/visualizers/TicTacToeMinimaxVisualizer';
import { NimGameVisualizer } from '../components/visualizers/NimGameVisualizer';
import { ExpectiminimaxVisualizer } from '../components/visualizers/ExpectiminimaxVisualizer';
import { MCTSVisualizer } from '../components/visualizers/MCTSVisualizer';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';

export const Lesson4Page: React.FC<{ activeSectionId?: string }> = ({ activeSectionId }) => {
  const { progress, markSectionComplete, toggleBookmark, isBookmarked, setLastVisited } = useStudy();

  useEffect(() => {
    setLastVisited('lesson-4', activeSectionId || 'competitive-environments-and-contingent-strategies');
    if (activeSectionId) {
      const el = document.getElementById(activeSectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSectionId]);

  return (
    <div className="page-wrapper">
      {/* Lesson Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-purple font-mono">Lesson 4</span>
          <span className="slide-citation">{LESSON_4_DATA.slideCount} Slides</span>
          <span className="badge badge-indigo">UCLM 2026/2027</span>
        </div>

        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          {LESSON_4_DATA.title}
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          {LESSON_4_DATA.subtitle}
        </p>

        <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface)' }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--accent-purple)' }}>
            Course Learning Objectives
          </div>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            {LESSON_4_DATA.learningObjectives.map((obj: string, i: number) => (
              <li key={i} style={{ marginBottom: '0.35rem' }}>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chapters & Content */}
      {LESSON_4_DATA.chapters.map((chapter: any) => (
        <section key={chapter.id} style={{ marginBottom: '3.5rem' }}>
          <div
            style={{
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border-medium)',
              marginBottom: '1.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div>
              <span className="badge badge-indigo font-mono" style={{ marginRight: '0.5rem' }}>
                Chapter {chapter.number}
              </span>
              <h2 style={{ display: 'inline', fontSize: '1.35rem', fontWeight: 700 }}>
                {chapter.title}
              </h2>
            </div>
            <span className="slide-citation">{chapter.slideRange}</span>
          </div>

          {/* Sections */}
          {chapter.sections.map((sec: any) => {
            const isCompleted = !!progress.completedSections[`lesson-4:${sec.id}`];
            const savedBookmark = isBookmarked('lesson-4', sec.id);

            return (
              <article
                key={sec.id}
                id={sec.id}
                className="card"
                style={{
                  marginBottom: '2rem',
                  padding: '2rem',
                  borderLeft: isCompleted ? '3px solid var(--accent-emerald)' : undefined,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                      {sec.title}
                    </h3>
                    {sec.slideRef && (
                      <span className="slide-citation" style={{ marginTop: '0.25rem', display: 'inline-block' }}>
                        Lesson 4 · Slide {sec.slideRef.slideNumber}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() =>
                        toggleBookmark({
                          id: `lesson-4:${sec.id}`,
                          lessonId: 'lesson-4',
                          sectionId: sec.id,
                          title: sec.title,
                          previewText: sec.summary,
                        })
                      }
                      className="btn-tactile btn-sm"
                      title={savedBookmark ? 'Remove Bookmark' : 'Save Section Bookmark'}
                    >
                      <Bookmark size={14} className={savedBookmark ? 'text-amber-400 fill-amber-400' : ''} />
                    </button>

                    <button
                      onClick={() => markSectionComplete('lesson-4', sec.id)}
                      className={`btn-tactile btn-sm ${isCompleted ? 'btn-emerald' : ''}`}
                    >
                      <CheckCircle2 size={14} />
                      <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
                    </button>
                  </div>
                </div>

                <MarkdownRenderer content={sec.content} />

                {/* Minimax Tree Trace Visualizer */}
                {sec.id === 'minimax-pseudocode-and-trace' && (
                  <div style={{ marginTop: '2rem' }}>
                    <MinimaxAlphaBetaVisualizer initialMode="minimax" />
                  </div>
                )}

                {/* Alpha-Beta Pruning Interactive Trace */}
                {sec.id === 'step-by-step-alphabeta-trace' && (
                  <div style={{ marginTop: '2rem' }}>
                    <MinimaxAlphaBetaVisualizer initialMode="alphabeta" />
                  </div>
                )}

                {/* Stochastic Expectiminimax Visualizer */}
                {sec.id === 'values-matter-theorem' && (
                  <div style={{ marginTop: '2rem' }}>
                    <ExpectiminimaxVisualizer />
                  </div>
                )}

                {/* UCLM Proposed Problem 1: Tic-Tac-Toe Line-Counting Evaluation */}
                {sec.id === 'exam-problem-1-tictactoe-alphabeta' && (
                  <div style={{ marginTop: '2rem' }}>
                    <TicTacToeMinimaxVisualizer />
                  </div>
                )}

                {/* UCLM Proposed Problem 2: NIM Matchstick Game */}
                {sec.id === 'exam-problem-2-nim-matchstick-game' && (
                  <div style={{ marginTop: '2rem' }}>
                    <NimGameVisualizer />
                  </div>
                )}

                {/* Monte Carlo Tree Search (MCTS) Interactive Visualizer */}
                {sec.id === 'four-phases-of-mcts' && (
                  <div style={{ marginTop: '2rem' }}>
                    <MCTSVisualizer />
                  </div>
                )}

                {/* Key Takeaways */}
                {sec.keyTakeaways && sec.keyTakeaways.length > 0 && (
                  <div className="callout callout-source" style={{ marginTop: '1.5rem' }}>
                    <strong style={{ fontSize: '0.85rem' }}>Key Academic Takeaways:</strong>
                    <ul style={{ paddingLeft: '1.25rem', marginTop: '0.4rem', fontSize: '0.82rem' }}>
                      {sec.keyTakeaways.map((takeaway: string, i: number) => (
                        <li key={i}>{takeaway}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      ))}

      {/* Proposed Exercises Practice Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          Lesson 4 Proposed Exam Exercises (Slides 61–62)
        </h2>

        {/* Exercise 1: Tic-Tac-Toe */}
        <div style={{ marginBottom: '2.5rem' }}>
          <TicTacToeMinimaxVisualizer />
        </div>

        {/* Exercise 2: NIM Matchstick Game */}
        <div style={{ marginBottom: '1.5rem' }}>
          <NimGameVisualizer />
        </div>
      </section>
    </div>
  );
};
