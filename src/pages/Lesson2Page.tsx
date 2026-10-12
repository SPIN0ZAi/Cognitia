import React, { useEffect } from 'react';
import { LESSON_2_DATA } from '../data/lesson2Data';
import { useStudy } from '../context/StudyContext';
import { Bookmark, CheckCircle2 } from 'lucide-react';
import { VacuumWorldSimulator } from '../components/visualizers/VacuumWorldSimulator';
import { RomaniaGraphVisualizer } from '../components/visualizers/RomaniaGraphVisualizer';
import { MissionariesVisualizer } from '../components/visualizers/MissionariesVisualizer';
import { WaterJugsVisualizer } from '../components/visualizers/WaterJugsVisualizer';
import { EightQueensVisualizer } from '../components/visualizers/EightQueensVisualizer';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';
import { AgentDiagram } from '../components/diagrams/AgentDiagram';
import { PeasExplorer } from '../components/visualizers/PeasExplorer';

export const Lesson2Page: React.FC<{ activeSectionId?: string }> = ({ activeSectionId }) => {
  const { progress, markSectionComplete, toggleBookmark, isBookmarked, setLastVisited } = useStudy();

  useEffect(() => {
    setLastVisited('lesson-2', activeSectionId || 'agent-function-model');
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
          <span className="badge badge-cyan font-mono">Lesson 2</span>
          <span className="slide-citation">{LESSON_2_DATA.slideCount} Slides</span>
          <span className="badge badge-indigo">UCLM 2026/2027</span>
        </div>

        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          {LESSON_2_DATA.title}
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          {LESSON_2_DATA.subtitle}
        </p>

        <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface)' }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>
            Course Learning Objectives
          </div>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            {LESSON_2_DATA.learningObjectives.map((obj: string, i: number) => (
              <li key={i} style={{ marginBottom: '0.35rem' }}>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chapters & Content */}
      {LESSON_2_DATA.chapters.map((chapter: any) => (
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
            const isCompleted = !!progress.completedSections[`lesson-2:${sec.id}`];
            const savedBookmark = isBookmarked('lesson-2', sec.id);

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
                        Lesson 2 · Slide {sec.slideRef.slideNumber}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() =>
                        toggleBookmark({
                          id: `lesson-2:${sec.id}`,
                          lessonId: 'lesson-2',
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
                      onClick={() => markSectionComplete('lesson-2', sec.id)}
                      className={`btn-tactile btn-sm ${isCompleted ? 'btn-emerald' : ''}`}
                    >
                      <CheckCircle2 size={14} />
                      <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
                    </button>
                  </div>
                </div>

                <MarkdownRenderer content={sec.content} />

                {/* Interactive SVG Agent-Environment Diagram */}
                {sec.id === 'agent-function-model' && (
                  <AgentDiagram />
                )}

                {/* Vacuum World Simulator in Section 2 */}
                {sec.id === 'vacuum-cleaner-world' && (
                  <div style={{ marginTop: '2rem' }}>
                    <VacuumWorldSimulator />
                  </div>
                )}

                {/* Interactive PEAS Task Specification Explorer */}
                {sec.id === 'peas-specification' && (
                  <PeasExplorer />
                )}

                {/* Romania Graph Visualizer in Search Strategies Chapter */}
                {sec.id === 'breadth-first-search' && (
                  <div style={{ marginTop: '2rem' }}>
                    <RomaniaGraphVisualizer />
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

      {/* Three Proposed Problems from Lecture Slides 78–80 */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          Three Proposed Lecture Problems (Slides 78–80)
        </h2>

        {/* Problem 1: Missionaries and Cannibals */}
        <div style={{ marginBottom: '2.5rem' }}>
          <MissionariesVisualizer />
        </div>

        {/* Problem 2: The Water Jugs */}
        <div style={{ marginBottom: '2.5rem' }}>
          <WaterJugsVisualizer />
        </div>

        {/* Problem 3: 8-Queens Problem */}
        <div style={{ marginBottom: '2.5rem' }}>
          <EightQueensVisualizer />
        </div>
      </section>
    </div>
  );
};
