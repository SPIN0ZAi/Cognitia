import React from 'react';
import {
  ArrowRight,
  Compass,
  Sparkles,
  HelpCircle,
  Bookmark,
  ShieldCheck,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  Gamepad2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { LESSON_1_DATA } from '../data/lesson1Data';
import { LESSON_2_DATA } from '../data/lesson2Data';
import { LESSON_3_DATA } from '../data/lesson3Data';
import {
  TactileButton,
  StatusLed,
  CoordinateStamp,
} from '../components/common/InstrumentControls';
import { AttractModeCanvas } from '../game/components/AttractModeCanvas';

export const CourseHomePage: React.FC<{
  onNavigate: (view: string, lessonId?: string, sectionId?: string) => void;
}> = ({ onNavigate }) => {
  const { progress, combinedProgress } = useStudy();
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

  // Check if all sections in a lesson are finished
  const isLessonComplete = (lessonId: string) => {
    const l = lessons.find((item) => item.id === lessonId);
    if (!l) return false;
    return l.chapters.every((ch) =>
      ch.sections.every((sec: any) => progress.completedSections[`${lessonId}:${sec.id}`])
    );
  };

  // Determine Next Recommended Step
  const getNextRecommendedStep = () => {
    if (!isLessonComplete('lesson-1')) {
      return {
        lessonId: 'lesson-1',
        sectionId: 'definition-and-misconceptions',
        title: 'Lesson 1: Foundations of AI & Rational Agent Typology',
        badge: 'MISSION 01',
        desc: 'Begin with Russell & Norvig definitions, Dartmouth history, and the PEAS environmental taxonomy.',
      };
    } else if (!isLessonComplete('lesson-2')) {
      return {
        lessonId: 'lesson-2',
        sectionId: 'agent-function-model',
        title: 'Lesson 2: Problem Solving & Uninformed Graph Search',
        badge: 'MISSION 02',
        desc: 'Master state formulation, BFS, UCS, DFS, and the 8-state Vacuum World transition model.',
      };
    } else {
      return {
        lessonId: 'lesson-3',
        sectionId: 'why-heuristics',
        title: 'Lesson 3: Informed Heuristics & A* Search Optimality',
        badge: 'MISSION 03',
        desc: 'Explore Manhattan heuristics, admissibility proofs, and Romania route optimization.',
      };
    }
  };

  const getLastVisitedDetails = () => {
    if (!progress.lastVisited) return null;
    const l = lessons.find((item) => item.id === progress.lastVisited?.lessonId);
    if (!l) return null;
    let secTitle = 'Active Topic';
    for (const ch of l.chapters) {
      const s = ch.sections.find((sec: any) => sec.id === progress.lastVisited?.sectionId);
      if (s) {
        secTitle = s.title;
        break;
      }
    }
    return {
      lessonName: l.title.split(':')[0],
      sectionName: secTitle,
      lessonId: l.id,
      sectionId: progress.lastVisited.sectionId,
    };
  };

  const nextStep = getNextRecommendedStep();
  const lastVisitedDetails = getLastVisitedDetails();

  return (
    <div className="page-wrapper" style={{ position: 'relative', zIndex: 2 }}>
      {/* Top Laboratory Status Stamp */}
      <CoordinateStamp
        sectionCode="SYS:00 // COGNITIA_CORE"
        statusText="LABORATORY_ACTIVE"
        coords="UCLM // ESII_ALBACETE // 38.9943°N 1.8585°W"
      />

      {/* Hero Mission Control Banner */}
      <section
        style={{
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(180deg, rgba(14, 20, 32, 0.95) 0%, rgba(6, 8, 13, 0.98) 100%)',
          border: '1px solid var(--lab-border-active)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative technical crosshairs in corners */}
        <div style={{ position: 'absolute', top: 12, right: 14, color: 'var(--lab-text-hairline)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
          [ + ] EXPANSION_RADAR_ON
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span className="badge badge-cyan font-mono">UCLM DEGREE IN COMPUTER SCIENCE</span>
          <span className="badge badge-lime font-mono">ACADEMIC YEAR 2026/2027</span>
          <StatusLed status="active" label="Neural Engine Ready" />
        </div>

        <h1
          className="font-hero"
          style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '1rem',
            color: '#F1F5F9',
          }}
        >
          Intelligent Systems
        </h1>

        <p
          style={{
            fontSize: '1.05rem',
            color: 'var(--lab-text-secondary)',
            maxWidth: '740px',
            lineHeight: 1.65,
            marginBottom: '2rem',
          }}
        >
          An interactive, mathematically authoritative computational instrument for mastering artificial intelligence, state space formulations, uninformed graph algorithms, and admissible heuristic search.
        </p>

        {/* Interactive Course Constellation Graph (Vector Visual Map of Course) */}
        <div
          style={{
            background: 'rgba(6, 8, 13, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--lab-accent-cyan)' }}>
              COURSE TOPOLOGY MAP // INTERACTIVE CONSTELLATION
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--lab-text-muted)', fontFamily: 'var(--font-mono)' }}>
              CLICK NODE TO ENTER LESSON
            </span>
          </div>

          <svg viewBox="0 0 760 140" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <linearGradient id="linkGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#78D5E8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#C6F277" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="linkGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C6F277" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#E9B777" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Connecting Channels */}
            <line x1="140" y1="70" x2="380" y2="70" stroke="url(#linkGrad1)" strokeWidth="2.5" strokeDasharray="6 4" />
            <line x1="380" y1="70" x2="620" y2="70" stroke="url(#linkGrad2)" strokeWidth="2.5" strokeDasharray="6 4" />

            {/* Node 1: Lesson 1 */}
            <g
              transform="translate(140, 70)"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('lesson', 'lesson-1')}
            >
              <circle r="36" fill="#0b131e" stroke="#78D5E8" strokeWidth="2" />
              <circle r="44" fill="none" stroke="#78D5E8" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
              <text textAnchor="middle" y="-6" fill="#78D5E8" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)">
                LESSON 01
              </text>
              <text textAnchor="middle" y="14" fill="#F1F5F9" fontSize="10" fontWeight="600" fontFamily="var(--font-sans)">
                Intro & Ethics
              </text>
            </g>

            {/* Node 2: Lesson 2 */}
            <g
              transform="translate(380, 70)"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('lesson', 'lesson-2')}
            >
              <circle r="36" fill="#0f1910" stroke="#C6F277" strokeWidth="2" />
              <circle r="44" fill="none" stroke="#C6F277" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
              <text textAnchor="middle" y="-6" fill="#C6F277" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)">
                LESSON 02
              </text>
              <text textAnchor="middle" y="14" fill="#F1F5F9" fontSize="10" fontWeight="600" fontFamily="var(--font-sans)">
                Uninformed Search
              </text>
            </g>

            {/* Node 3: Lesson 3 */}
            <g
              transform="translate(620, 70)"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('lesson', 'lesson-3')}
            >
              <circle r="36" fill="#1e160a" stroke="#E9B777" strokeWidth="2" />
              <circle r="44" fill="none" stroke="#E9B777" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
              <text textAnchor="middle" y="-6" fill="#E9B777" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)">
                LESSON 03
              </text>
              <text textAnchor="middle" y="14" fill="#F1F5F9" fontSize="10" fontWeight="600" fontFamily="var(--font-sans)">
                Informed & A*
              </text>
            </g>
          </svg>
        </div>

        {/* Action Controls Transport Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center' }}>
          {progress.lastVisited ? (
            <TactileButton
              variant="cyan"
              size="lg"
              ledStatus="active"
              onClick={() =>
                onNavigate(
                  'lesson',
                  progress.lastVisited?.lessonId,
                  progress.lastVisited?.sectionId
                )
              }
              cursorLabel="RESUME_SESSION"
            >
              Resume Active Study Session
              <ArrowRight size={14} />
            </TactileButton>
          ) : (
            <TactileButton
              variant="lime"
              size="lg"
              ledStatus="active"
              onClick={() => onNavigate('lesson', nextStep.lessonId, nextStep.sectionId)}
              cursorLabel="BEGIN_COURSE"
            >
              Start Course ({nextStep.badge})
              <ArrowRight size={14} />
            </TactileButton>
          )}

          <TactileButton
            variant="secondary"
            size="md"
            onClick={() => onNavigate('practice')}
            icon={<HelpCircle size={14} />}
            cursorLabel="PRACTICE_EXAM"
          >
            Exam Trainer & Practice
          </TactileButton>

          <TactileButton
            variant="secondary"
            size="md"
            onClick={() => onNavigate('play')}
            icon={<Gamepad2 size={14} />}
            cursorLabel="LEARN_AND_PLAY"
          >
            Learn &amp; Play Arcade
          </TactileButton>

          <TactileButton
            variant="secondary"
            size="md"
            onClick={() => onNavigate('glossary')}
            icon={<Bookmark size={14} />}
            cursorLabel="AI_GLOSSARY"
          >
            Academic Glossary
          </TactileButton>
        </div>
      </section>

      {/* Prominent Welcome Back Experience */}
      {lastVisitedDetails && completedSections > 0 ? (
        <section
          className="card animate-fade-in"
          style={{
            marginBottom: '2rem',
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(90deg, rgba(120, 213, 232, 0.08) 0%, rgba(6, 9, 14, 0.95) 100%)',
            borderLeft: '4px solid var(--lab-accent-cyan)',
            borderTop: '1px solid #1c2b3e',
            borderRight: '1px solid #1c2b3e',
            borderBottom: '1px solid #1c2b3e',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-cyan font-mono">WELCOME BACK</span>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                OVERALL WEIGHTED PROGRESS: {combinedProgress.totalPercentage}%
              </span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
              Continue: {lastVisitedDetails.lessonName} · <span style={{ color: '#78D5E8' }}>"{lastVisitedDetails.sectionName}"</span>
            </h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--lab-text-muted)', marginTop: '0.25rem' }}>
              Reading: {progressPercent}% · Quizzes: {combinedProgress.quizScore.toFixed(0)}% · Simulators: {combinedProgress.simulatorScore.toFixed(0)}% · Arcade: {combinedProgress.gameScore.toFixed(0)}%
            </div>
          </div>

          <TactileButton
            variant="cyan"
            size="md"
            onClick={() => onNavigate('lesson', lastVisitedDetails.lessonId, lastVisitedDetails.sectionId)}
            cursorLabel="JUMP_SECTION"
          >
            Resume Section
            <ArrowRight size={14} />
          </TactileButton>
        </section>
      ) : (
        <section
          className="card animate-fade-in"
          style={{
            marginBottom: '2rem',
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(90deg, rgba(198, 242, 119, 0.08) 0%, rgba(6, 9, 14, 0.95) 100%)',
            borderLeft: '4px solid var(--lab-accent-lime)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-lime font-mono">INITIAL ENROLLMENT</span>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                ESII ALBACETE // UCLM
              </span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
              Welcome to Cognitia Computational Laboratory!
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--lab-text-secondary)', margin: '0.25rem 0 0 0' }}>
              Begin your master trajectory with Lesson 1: Foundations of Artificial Intelligence &amp; Rational Agents.
            </p>
          </div>

          <TactileButton
            variant="lime"
            size="md"
            onClick={() => onNavigate('lesson', 'lesson-1', 'definition-and-misconceptions')}
            cursorLabel="BEGIN_JOURNEY"
          >
            Start Course
            <ArrowRight size={14} />
          </TactileButton>
        </section>
      )}

      {/* Telemetry Dashboard: Next Recommended Mission + Progress Metrics */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {/* Next Recommended Mission Card */}
        <div
          className="card"
          style={{
            borderLeft: '4px solid var(--lab-accent-lime)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="badge badge-lime font-mono">{nextStep.badge} // RECOMMENDED</span>
              <StatusLed status="active" label="Priority Route" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F1F5F9', marginBottom: '0.4rem' }}>
              {nextStep.title}
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--lab-text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {nextStep.desc}
            </p>
          </div>

          <TactileButton
            variant="lime"
            size="sm"
            onClick={() => onNavigate('lesson', nextStep.lessonId, nextStep.sectionId)}
            cursorLabel="EXECUTE_STEP"
          >
            Launch Step
            <ArrowRight size={13} />
          </TactileButton>
        </div>

        {/* Radial Telemetry & Mastery Metrics */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#F1F5F9', fontFamily: 'var(--font-mono)' }}>
                TELEMETRY // SYLLABUS COMPLETION
              </span>
              <span className="badge badge-cyan font-mono">{progressPercent}%</span>
            </div>

            {/* Glowing Metric Progress Track */}
            <div
              style={{
                height: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #78D5E8, #C6F277)',
                  boxShadow: '0 0 10px rgba(198, 242, 119, 0.5)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
              <div style={{ background: '#080c13', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--lab-border-subtle)' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#C6F277', fontFamily: 'var(--font-mono)' }}>
                  {completedSections}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--lab-text-muted)' }}>SECTIONS DONE</div>
              </div>
              <div style={{ background: '#080c13', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--lab-border-subtle)' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#78D5E8', fontFamily: 'var(--font-mono)' }}>
                  8
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--lab-text-muted)' }}>SIMULATORS</div>
              </div>
              <div style={{ background: '#080c13', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--lab-border-subtle)' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#E9B777', fontFamily: 'var(--font-mono)' }}>
                  {progress.bookmarks.length}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--lab-text-muted)' }}>BOOKMARKS</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: 'var(--lab-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Target Exam: UCLM Final Assessment</span>
            <span>Total Units: 3 Modules</span>
          </div>
        </div>
      </section>

      {/* Learn & Play Arcade Cabinet Featured Showcase */}
      <section
        style={{
          marginBottom: '3rem',
          padding: '1.75rem',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(8, 14, 24, 0.95) 0%, rgba(4, 7, 13, 0.98) 100%)',
          border: '1px solid rgba(120, 213, 232, 0.25)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7), 0 0 25px rgba(120, 213, 232, 0.1)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.75rem', alignItems: 'center' }}>
          {/* Left Column: Headline and Educational Mechanics */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <span className="badge badge-lime font-mono" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Gamepad2 size={13} /> LEARN &amp; PLAY
              </span>
              <span className="badge badge-cyan font-mono">MAZE-CHASE INSTRUMENT</span>
            </div>

            <h2
              className="font-display"
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 800,
                color: '#F1F5F9',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                marginBottom: '0.75rem',
              }}
            >
              Learn. Play. Outsmart the algorithm.
            </h2>

            <p style={{ fontSize: '0.9rem', color: 'var(--lab-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              The classic maze-chase reimagined as an interactive graph search laboratory: you are an autonomous cybernetic probe, and the enemies are the course’s real search algorithms hunting you in real time. Watch BFS expand in concentric rings, outrun Greedy in dead-end traps, and witness A* calculate optimal paths with live X-Ray vector radar.
            </p>

            {/* 5 Algorithm Enemy Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(120, 213, 232, 0.15)', border: '1px solid #78D5E8', color: '#78D5E8', fontFamily: 'var(--font-mono)' }}>
                The Wave (BFS)
              </span>
              <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #F59E0B', color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>
                The Miser (UCS)
              </span>
              <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #A855F7', color: '#A855F7', fontFamily: 'var(--font-mono)' }}>
                The Plunger (DFS)
              </span>
              <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid #F43F5E', color: '#F43F5E', fontFamily: 'var(--font-mono)' }}>
                The Gambler (Greedy)
              </span>
              <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(198, 242, 119, 0.15)', border: '1px solid #C6F277', color: '#C6F277', fontFamily: 'var(--font-mono)' }}>
                The Strategist (A*)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => onNavigate('play')}
                className="btn-tactile btn-primary"
                style={{
                  padding: '0.65rem 1.5rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  background: '#C6F277',
                  color: '#06090e',
                  boxShadow: '0 0 20px rgba(198, 242, 119, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Gamepad2 size={18} />
                PLAY COGNITIA CHASE ▶
              </button>
            </div>
          </div>

          {/* Right Column: Animated Attract Mode Mini Arcade Preview */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <AttractModeCanvas onStartPlay={() => onNavigate('play')} />
          </div>
        </div>
      </section>

      {/* The Three Authoritative Course Modules */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F1F5F9' }}>
            Course Curriculum &amp; Modules
          </h2>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--lab-text-muted)' }}>
            AUTHORED BY UCLM FACULTY
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {lessons.map((lesson) => {
            const isCompleted = isLessonComplete(lesson.id);
            return (
              <div
                key={lesson.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  borderLeft: isCompleted ? '4px solid var(--lab-accent-lime)' : '4px solid var(--lab-accent-cyan)',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => onNavigate('lesson', lesson.id)}
                data-cursor-label="ENTER_MODULE"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-cyan font-mono">MODULE 0{lesson.number}</span>
                    <span className="slide-citation">{lesson.slideCount} Slides</span>
                    {isCompleted && (
                      <span className="badge badge-lime font-mono" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <CheckCircle2 size={11} /> COMPLETED
                      </span>
                    )}
                  </div>
                  <span className="slide-citation">ESII ALBACETE</span>
                </div>

                <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem', color: '#F1F5F9' }}>
                  {lesson.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--lab-accent-amber)', marginBottom: '0.85rem', fontWeight: 500 }}>
                  {lesson.subtitle}
                </p>

                <p style={{ fontSize: '0.88rem', color: 'var(--lab-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {lesson.overview}
                </p>

                {/* Chapters Technical Grid */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                  {lesson.chapters.map((ch: any) => (
                    <span
                      key={ch.id}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        border: '1px solid var(--lab-border-subtle)',
                        color: 'var(--lab-text-secondary)',
                      }}
                    >
                      CH {ch.number}: {ch.title}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--lab-border-subtle)' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--lab-text-muted)' }}>
                    Lecturers: {lesson.authors.join(', ')}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: 'var(--lab-accent-cyan)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    <span>Launch Module</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Algorithmic Laboratories Grid */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F1F5F9' }}>
            Laboratory Scientific Instruments
          </h2>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--lab-accent-lime)' }}>
            8 INTERACTIVE SIMULATORS
          </span>
        </div>

        <div className="grid-3">
          {/* Romania Route Search */}
          <div
            className="card"
            style={{ cursor: 'pointer', borderTop: '2px solid var(--lab-accent-cyan)' }}
            onClick={() => onNavigate('lesson', 'lesson-2', 'example-romania-formulation')}
            data-cursor-label="ROMANIA_RADAR"
          >
            <Compass size={22} className="text-cyan-400" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: '0.35rem', color: '#F1F5F9' }}>
              Romania Route Search Engine
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--lab-text-secondary)', lineHeight: 1.5 }}>
              Topographical map pathfinding comparing BFS, UCS, DFS, DLS, Greedy Best-First, and A* with priority queue inspector.
            </p>
          </div>

          {/* 8-Puzzle Mechanical Lab */}
          <div
            className="card"
            style={{ cursor: 'pointer', borderTop: '2px solid var(--lab-accent-amber)' }}
            onClick={() => onNavigate('lesson', 'lesson-3', 'eight-puzzle-heuristics-and-dominance')}
            data-cursor-label="8PUZZLE_LAB"
          >
            <Sparkles size={22} className="text-amber-400" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: '0.35rem', color: '#F1F5F9' }}>
              8-Puzzle Heuristic Laboratory
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--lab-text-secondary)', lineHeight: 1.5 }}>
              Tile slider with real-time $h_1$ (Misplaced) and $h_2$ (Manhattan) distance vectors and dominance verification.
            </p>
          </div>

          {/* A* Proof Explorer */}
          <div
            className="card"
            style={{ cursor: 'pointer', borderTop: '2px solid var(--lab-accent-lime)' }}
            onClick={() => onNavigate('lesson', 'lesson-3', 'admissibility-and-proof-of-optimality')}
            data-cursor-label="PROOF_EXPLORER"
          >
            <ShieldCheck size={22} className="text-emerald-400" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: '0.35rem', color: '#F1F5F9' }}>
              A* Optimality Proof Explorer
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--lab-text-secondary)', lineHeight: 1.5 }}>
              Step-by-step deductive theorem verification proving f(n) &le; C* &lt; f(G&#8322;) for admissible heuristics.
            </p>
          </div>

          {/* Full Vacuum World 8-States */}
          <div
            className="card"
            style={{ cursor: 'pointer', borderTop: '2px solid var(--lab-accent-cyan)' }}
            onClick={() => onNavigate('lesson', 'lesson-2', 'vacuum-cleaner-world')}
            data-cursor-label="VACUUM_WORLD"
          >
            <Cpu size={22} className="text-cyan-400" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: '0.35rem', color: '#F1F5F9' }}>
              Full 8-State Vacuum World
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--lab-text-secondary)', lineHeight: 1.5 }}>
              Slide 12 transition space graph with 8 discrete states, Slide 6 reflex agent program, and belief state search.
            </p>
          </div>

          {/* Water Jugs & River Crossing */}
          <div
            className="card"
            style={{ cursor: 'pointer', borderTop: '2px solid #818cf8' }}
            onClick={() => onNavigate('lesson', 'lesson-2', 'classical-toy-problems-matrix')}
            data-cursor-label="TOY_PROBLEMS"
          >
            <Layers size={22} className="text-indigo-400" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: '0.35rem', color: '#F1F5F9' }}>
              Water Jugs & River Crossing
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--lab-text-secondary)', lineHeight: 1.5 }}>
              4L/3L Diophantine fluid simulator and Missionaries & Cannibals state constraint visualizer.
            </p>
          </div>

          {/* Effective Branching Factor */}
          <div
            className="card"
            style={{ cursor: 'pointer', borderTop: '2px solid var(--lab-accent-lime)' }}
            onClick={() => onNavigate('lesson', 'lesson-3', 'effective-branching-factor-calculator')}
            data-cursor-label="BRANCHING_LAB"
          >
            <Activity size={22} className="text-lime-400" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: '0.35rem', color: '#F1F5F9' }}>
              Branching Factor Calculator ($b^*$)
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--lab-text-secondary)', lineHeight: 1.5 }}>
              Numerical solver for $N = 1 + b^* + (b^*)^2 + \dots + (b^*)^d$ measuring heuristic pruning efficiency.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
