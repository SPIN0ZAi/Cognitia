import React, { useState, useRef } from 'react';
import {
  Trash2,
  ArrowRight,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Gamepad2,
  Shield,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { LESSON_1_DATA } from '../data/lesson1Data';
import { LESSON_2_DATA } from '../data/lesson2Data';
import { LESSON_3_DATA } from '../data/lesson3Data';
import { LESSON_4_DATA } from '../data/lesson4Data';
import { PRACTICE_QUESTIONS } from '../data/practiceData';

export const ProgressPage: React.FC<{
  onNavigate: (view: string, lessonId?: string, sectionId?: string) => void;
}> = ({ onNavigate }) => {
  const {
    storageData,
    progress,
    combinedProgress,
    isStorageBlocked,
    toggleBookmark,
    resetProgress,
    exportJSON,
    importJSON,
  } = useStudy();

  const lessons = [LESSON_1_DATA, LESSON_2_DATA, LESSON_3_DATA, LESSON_4_DATA];
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [importStatus, setImportStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

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

  // Export JSON file download
  const handleExport = () => {
    const jsonStr = exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cognitia-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import JSON file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const ok = importJSON(text);
        if (ok) {
          setImportStatus({
            success: true,
            message: 'Progress successfully restored from backup file!',
          });
        } else {
          setImportStatus({
            success: false,
            message: 'Invalid or corrupt progress file format. Could not restore.',
          });
        }
      } catch (err) {
        setImportStatus({
          success: false,
          message: 'Error parsing backup file. Please verify the JSON file.',
        });
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ paddingBottom: '3.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge badge-emerald font-mono">LEARNING ANALYTICS</span>
          <span className="badge badge-cyan font-mono">
            {isStorageBlocked ? 'IN-MEMORY FALLBACK (BLOCKED)' : 'STORAGE ENGINE // COGNITIA:V1'}
          </span>
        </div>

        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem', color: '#F1F5F9' }}>
          Academic Progress &amp; Persistent Storage
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--lab-text-secondary)', maxWidth: '720px' }}>
          Comprehensive telemetry tracking reading mastery, exam performance, interactive simulation runs, and Learn &amp; Play achievements across sessions.
        </p>
      </div>

      {/* Storage Blocked Warning (if in Private Mode) */}
      {isStorageBlocked && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1rem 1.25rem',
            background: 'rgba(245, 158, 11, 0.1)',
            borderLeft: '4px solid #F59E0B',
            borderRadius: '6px',
            fontSize: '0.86rem',
            color: '#FDE68A',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
          }}
        >
          <AlertTriangle size={18} color="#F59E0B" />
          <span>
            Browser storage is currently restricted (e.g. Private Browsing mode). Progress is active in-memory for this session. Use the <strong>Export Progress</strong> feature below before closing if you wish to save your records.
          </span>
        </div>
      )}

      {/* Combined Academic Progress Meter (Weighted: 40% Reading, 25% Quiz, 20% Sim, 15% Game) */}
      <section
        className="card"
        style={{
          padding: '1.75rem',
          marginBottom: '2.5rem',
          background: 'linear-gradient(180deg, rgba(14, 20, 32, 0.95) 0%, rgba(6, 8, 13, 0.98) 100%)',
          border: '1px solid var(--lab-border-active)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#C6F277' }}>
              ACADEMIC MASTERY INDEX // COMBINED WEIGHTED MODEL
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F1F5F9', margin: '0.2rem 0 0 0' }}>
              Overall Course Progress: {combinedProgress.totalPercentage}%
            </h2>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
            40% Reading · 25% Quizzes · 20% Simulators · 15% Arcade
          </span>
        </div>

        {/* Multi-segment Combined Progress Bar */}
        <div
          style={{
            height: '12px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            overflow: 'hidden',
            marginBottom: '1.25rem',
          }}
        >
          <div
            style={{
              width: `${combinedProgress.totalPercentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #78D5E8 0%, #C6F277 100%)',
              boxShadow: '0 0 12px rgba(198, 242, 119, 0.4)',
              transition: 'width 0.5s ease',
            }}
          />
        </div>

        {/* 4 Pillars Breakdown Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
          <div style={{ padding: '0.85rem', background: '#080c14', borderRadius: '8px', border: '1px solid #162436' }}>
            <div style={{ fontSize: '0.7rem', color: '#78D5E8', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              1. READING (40%)
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F1F5F9', margin: '0.2rem 0' }}>
              {combinedProgress.readingScore.toFixed(0)}%
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
              Weighted: +{((combinedProgress.readingScore * 0.40)).toFixed(1)}%
            </div>
          </div>

          <div style={{ padding: '0.85rem', background: '#080c14', borderRadius: '8px', border: '1px solid #162436' }}>
            <div style={{ fontSize: '0.7rem', color: '#C6F277', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              2. QUIZZES (25%)
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F1F5F9', margin: '0.2rem 0' }}>
              {combinedProgress.quizScore.toFixed(0)}%
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
              Weighted: +{((combinedProgress.quizScore * 0.25)).toFixed(1)}%
            </div>
          </div>

          <div style={{ padding: '0.85rem', background: '#080c14', borderRadius: '8px', border: '1px solid #162436' }}>
            <div style={{ fontSize: '0.7rem', color: '#E9B777', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              3. SIMULATORS (20%)
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F1F5F9', margin: '0.2rem 0' }}>
              {combinedProgress.simulatorScore.toFixed(0)}%
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
              Weighted: +{((combinedProgress.simulatorScore * 0.20)).toFixed(1)}%
            </div>
          </div>

          <div style={{ padding: '0.85rem', background: '#080c14', borderRadius: '8px', border: '1px solid #162436' }}>
            <div style={{ fontSize: '0.7rem', color: '#F43F5E', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              4. ARCADE (15%)
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F1F5F9', margin: '0.2rem 0' }}>
              {combinedProgress.gameScore.toFixed(0)}%
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
              Weighted: +{((combinedProgress.gameScore * 0.15)).toFixed(1)}%
            </div>
          </div>
        </div>
      </section>

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
                  flexWrap: 'wrap',
                  gap: '0.5rem',
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
                    background: 'var(--lab-accent-cyan)',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Practice Exam Accuracy & Learn & Play Achievements */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {/* Practice Questions Card */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F1F5F9', marginBottom: '0.5rem' }}>
            Practice Exam Performance
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--lab-text-secondary)', marginBottom: '1rem' }}>
            Results across the 20 slide-sourced practice questions.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Answered:</span>
            <strong style={{ color: '#F1F5F9' }}>{totalAnswered} / {PRACTICE_QUESTIONS.length}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Correct Answers:</span>
            <strong style={{ color: '#C6F277' }}>{totalCorrect}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Accuracy Rate:</span>
            <strong style={{ color: '#78D5E8' }}>{quizAccuracy}%</strong>
          </div>

          <button onClick={() => onNavigate('practice')} className="btn-tactile btn-sm" style={{ width: '100%' }}>
            <span>Go to Practice Exam</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Learn & Play Arcade Stats */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Gamepad2 size={18} color="#C6F277" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
              Cognitia Chase Arcade
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--lab-text-secondary)', marginBottom: '1rem' }}>
            High scores and milestones achieved in the maze-chase laboratory.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Arcade High Score:</span>
            <strong style={{ color: '#C6F277', fontFamily: 'var(--font-mono)' }}>
              {(storageData.game.highScoreArcade || 0).toLocaleString()} pts
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Campaign Level:</span>
            <strong style={{ color: '#78D5E8' }}>Level {storageData.game.unlockedLevels || 1} of 6</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Achievements Unlocked:</span>
            <strong style={{ color: '#E9B777' }}>{Object.keys(storageData.game.achievements).length}</strong>
          </div>

          <button onClick={() => onNavigate('play')} className="btn-tactile btn-primary btn-sm" style={{ width: '100%' }}>
            <span>Launch Cognitia Chase</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </section>

      {/* Bookmarks Section */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#f8fafc' }}>
          Saved Topic Bookmarks ({progress.bookmarks.length})
        </h2>

        {progress.bookmarks.length === 0 ? (
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No bookmarks saved yet. Click the bookmark icon on any lesson section to save it here for quick access.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {progress.bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="card"
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#f8fafc', display: 'block' }}>
                    {bm.title || bm.sectionId}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Lesson: {bm.lessonId} · Saved on {new Date(bm.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => onNavigate('lesson', bm.lessonId, bm.sectionId)}
                    className="btn-tactile btn-sm"
                  >
                    <span>Jump</span>
                    <ArrowRight size={13} />
                  </button>
                  <button
                    onClick={() => toggleBookmark(bm)}
                    className="btn-tactile btn-sm"
                    title="Remove Bookmark"
                  >
                    <Trash2 size={13} style={{ color: '#fb7185' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Student Data Privacy & Device Transfer Deck */}
      <section
        className="card"
        style={{
          padding: '1.5rem',
          background: '#070a12',
          border: '1px solid #1c2738',
          borderRadius: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Shield size={18} color="#78D5E8" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
            Student Data Sovereignty &amp; Privacy Deck
          </h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--lab-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          <strong>Functional Browser Storage (EU / Spain):</strong> Your progress, attempt histories, and preferences are saved exclusively in this browser under the <code>cognitia:v1</code> key. No tracking cookies, no personal identifiers, and zero external network transmission. To move your progress to another device or browser, use Export/Import below.
        </p>

        {importStatus && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              marginBottom: '1rem',
              background: importStatus.success ? 'rgba(198, 242, 119, 0.1)' : 'rgba(244, 63, 94, 0.1)',
              border: `1px solid ${importStatus.success ? '#C6F277' : '#F43F5E'}`,
              color: importStatus.success ? '#C6F277' : '#FCA5A5',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {importStatus.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{importStatus.message}</span>
          </div>
        )}

        {/* Data Buttons Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={handleExport}
            className="btn-tactile btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Download size={14} />
            <span>Export Progress (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-tactile btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Upload size={14} />
            <span>Import Progress Backup</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to completely reset all course progress, bookmarks, and scores? This action cannot be undone.')) {
                resetProgress();
                setImportStatus({
                  success: true,
                  message: 'All progress reset to clean default state.',
                });
              }
            }}
            className="btn-tactile btn-sm"
            style={{ color: '#fb7185', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RotateCcw size={14} />
            <span>Reset All Progress</span>
          </button>
        </div>
      </section>
    </div>
  );
};
