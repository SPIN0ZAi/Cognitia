import React, { useEffect } from 'react';
import { LESSON_9_DATA } from '../data/lesson9Data';
import { useStudy } from '../context/StudyContext';
import { Bookmark, CheckCircle2 } from 'lucide-react';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';
import { MLParadigmsExplorer } from '../components/visualizers/MLParadigmsExplorer';
import { OverfittingUnderfittingLab } from '../components/visualizers/OverfittingUnderfittingLab';

export const Lesson9Page: React.FC<{ activeSectionId?: string }> = ({ activeSectionId }) => {
  const { progress, markSectionComplete, toggleBookmark, isBookmarked, setLastVisited } = useStudy();

  useEffect(() => {
    setLastVisited('lesson-9', activeSectionId || 'classical-vs-ml');
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
          <span className="badge badge-amber font-mono">Lesson 9</span>
          <span className="slide-citation">{LESSON_9_DATA.slideCount} Slides</span>
          <span className="badge badge-indigo">UCLM 2026/2027</span>
        </div>

        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          {LESSON_9_DATA.title}
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          {LESSON_9_DATA.subtitle}
        </p>

        <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface)' }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--lab-accent-amber)' }}>
            Course Learning Objectives
          </div>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            {LESSON_9_DATA.learningObjectives.map((obj: string, i: number) => (
              <li key={i} style={{ marginBottom: '0.35rem' }}>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chapters & Content */}
      {LESSON_9_DATA.chapters.map((chapter) => (
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
              <span className="badge badge-amber font-mono" style={{ marginRight: '0.5rem' }}>
                Chapter {chapter.number}
              </span>
              <h2 style={{ display: 'inline', fontSize: '1.35rem', fontWeight: 700 }}>
                {chapter.title}
              </h2>
            </div>
            <span className="slide-citation">{chapter.slideRange}</span>
          </div>

          {/* Sections */}
          {chapter.sections.map((sec) => {
            const isCompleted = !!progress.completedSections[`lesson-9:${sec.id}`];
            const savedBookmark = isBookmarked('lesson-9', sec.id);

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
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      {sec.title}
                    </h3>
                    {sec.slideRef && (
                      <span className="slide-citation">
                        Slides: {sec.slideRef.slideNumber}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() =>
                        toggleBookmark({
                          id: `lesson-9:${sec.id}`,
                          lessonId: 'lesson-9',
                          sectionId: sec.id,
                          title: sec.title,
                          previewText: sec.summary,
                        })
                      }
                      title="Bookmark this section"
                      style={{ padding: '0.4rem 0.6rem' }}
                    >
                      <Bookmark
                        size={15}
                        fill={savedBookmark ? 'var(--lab-accent-amber)' : 'none'}
                        color={savedBookmark ? 'var(--lab-accent-amber)' : 'currentColor'}
                      />
                    </button>
                    <button
                      className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => markSectionComplete('lesson-9', sec.id)}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      <CheckCircle2 size={15} style={{ marginRight: '0.35rem' }} />
                      {isCompleted ? 'Completed' : 'Mark Done'}
                    </button>
                  </div>
                </div>

                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.92rem' }}>
                  <MarkdownRenderer content={sec.content} />
                </div>

                {sec.keyTakeaways && sec.keyTakeaways.length > 0 && (
                  <div
                    style={{
                      marginTop: '1.5rem',
                      padding: '1rem',
                      background: 'rgba(56, 189, 248, 0.05)',
                      border: '1px solid rgba(56, 189, 248, 0.15)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--accent-cyan)', marginBottom: '0.4rem' }}>
                      Key Takeaways
                    </div>
                    <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {sec.keyTakeaways.map((point: string, i: number) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}

          {/* Injected Laboratories */}
          {chapter.number === 1 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <MLParadigmsExplorer />
            </div>
          )}

          {chapter.number === 2 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <OverfittingUnderfittingLab />
            </div>
          )}
        </section>
      ))}
    </div>
  );
};
