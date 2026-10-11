import {
  Home,
  BookOpen,
  HelpCircle,
  BookMarked,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { LESSON_1_DATA } from '../../data/lesson1Data';
import { LESSON_2_DATA } from '../../data/lesson2Data';
import { LESSON_3_DATA } from '../../data/lesson3Data';

interface SidebarProps {
  currentView: string;
  currentLessonId?: string;
  currentSectionId?: string;
  onNavigate: (view: string, lessonId?: string, sectionId?: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  currentLessonId,
  currentSectionId,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { progress } = useStudy();
  const lessons = [LESSON_1_DATA, LESSON_2_DATA, LESSON_3_DATA];

  const handleItemClick = (view: string, lessonId?: string, sectionId?: string) => {
    onNavigate(view, lessonId, sectionId);
    onCloseMobile();
  };

  return (
    <aside className={`site-sidebar ${isOpenMobile ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-course-tag">Sistemas Inteligentes</div>
        <div className="sidebar-course-name">Interactive Platform</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          ESII Albacete · UCLM 2026/27
        </div>
      </div>

      {/* Main Core Links */}
      <div className="sidebar-nav-section">
        <div className="sidebar-section-title">Navigation</div>

        <button
          onClick={() => handleItemClick('home')}
          className={`sidebar-nav-item ${currentView === 'home' ? 'active' : ''}`}
          style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Home size={15} />
            <span>Course Home</span>
          </span>
        </button>

        <button
          onClick={() => handleItemClick('practice')}
          className={`sidebar-nav-item ${currentView === 'practice' ? 'active' : ''}`}
          style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={15} />
            <span>Exam Practice & Quizzes</span>
          </span>
        </button>

        <button
          onClick={() => handleItemClick('glossary')}
          className={`sidebar-nav-item ${currentView === 'glossary' ? 'active' : ''}`}
          style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookMarked size={15} />
            <span>Technical Glossary</span>
          </span>
        </button>

        <button
          onClick={() => handleItemClick('progress')}
          className={`sidebar-nav-item ${currentView === 'progress' ? 'active' : ''}`}
          style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={15} />
            <span>Study Progress</span>
          </span>
          <span className="badge badge-cyan font-mono" style={{ fontSize: '0.65rem' }}>
            {Object.values(progress.completedSections).filter(Boolean).length} done
          </span>
        </button>
      </div>

      {/* Authoritative Lessons */}
      <div className="sidebar-nav-section" style={{ flex: 1 }}>
        <div className="sidebar-section-title">Lecture Material</div>

        {lessons.map((lesson) => {
          const isActiveLesson = currentView === 'lesson' && currentLessonId === lesson.id;

          // Count completed sections in this lesson
          let totalSecs = 0;
          let completedSecs = 0;
          lesson.chapters.forEach((ch) => {
            ch.sections.forEach((sec) => {
              totalSecs++;
              if (progress.completedSections[`${lesson.id}:${sec.id}`]) {
                completedSecs++;
              }
            });
          });

          return (
            <div key={lesson.id} style={{ marginBottom: '0.5rem' }}>
              <button
                onClick={() => handleItemClick('lesson', lesson.id)}
                className={`sidebar-nav-item ${isActiveLesson ? 'active' : ''}`}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                  <BookOpen size={14} className="shrink-0" />
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 600 }}>Lesson {lesson.number}: </span>
                    <span style={{ fontSize: '0.8rem' }}>{lesson.title.split(':')[0]}</span>
                  </div>
                </div>
                {completedSecs > 0 && (
                  <span
                    className="font-mono text-emerald-400"
                    style={{ fontSize: '0.68rem', fontWeight: 600 }}
                  >
                    {completedSecs}/{totalSecs}
                  </span>
                )}
              </button>

              {/* Collapsible Subsections if active lesson */}
              {isActiveLesson && (
                <div className="sidebar-subnav">
                  {lesson.chapters.map((ch) => (
                    <div key={ch.id} style={{ marginBottom: '0.35rem' }}>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          padding: '0.2rem 0.5rem',
                          fontFamily: 'var(--font-mono)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {ch.title}
                      </div>

                      {ch.sections.map((sec) => {
                        const isDone = !!progress.completedSections[`${lesson.id}:${sec.id}`];
                        const isCurrentSec = currentSectionId === sec.id;

                        return (
                          <a
                            key={sec.id}
                            href={`#${sec.id}`}
                            onClick={() => handleItemClick('lesson', lesson.id, sec.id)}
                            className={`sidebar-subitem ${isDone ? 'completed' : ''}`}
                            style={{
                              color: isCurrentSec ? '#38bdf8' : isDone ? '#34d399' : undefined,
                              fontWeight: isCurrentSec ? 600 : undefined,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {sec.title}
                            </span>
                            {isDone && <CheckCircle2 size={11} className="text-emerald-400" />}
                          </a>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
