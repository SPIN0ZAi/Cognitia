import React from 'react';
import { ExamSimulator } from '../components/exam/ExamSimulator';
import { GraduationCap, BookOpen, Clock, ShieldCheck } from 'lucide-react';

export const ExamPage: React.FC = () => {
  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-emerald font-mono">Exam Center</span>
          <span className="slide-citation">All Lessons 1–10</span>
          <span className="badge badge-indigo">UCLM Official Syllabus 2026/2027</span>
        </div>

        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Intelligent Systems Official Examination Simulator
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Test your conceptual understanding, algorithm tracing, and mathematical calculations under realistic exam conditions.
        </p>

        {/* Feature Highlights Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="card" style={{ padding: '1rem', background: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
              <GraduationCap size={16} />
              <span>Real Course Questions</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Curated directly from UCLM slides, midterm tests, and official professor exercise sheets.
            </p>
          </div>

          <div className="card" style={{ padding: '1rem', background: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
              <Clock size={16} />
              <span>Timed Pressure Mode</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Optional 90-second per question countdown simulating the speed required on official multiple-choice tests.
            </p>
          </div>

          <div className="card" style={{ padding: '1rem', background: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-1">
              <BookOpen size={16} />
              <span>3-Tier Progressive Hints</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Reveal hints one by one when stuck: conceptual reminder, relevant formula, and mathematical setup.
            </p>
          </div>

          <div className="card" style={{ padding: '1rem', background: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
              <ShieldCheck size={16} />
              <span>Topic Weakness Diagnosis</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Immediate grade report with breakdown by lesson and detailed explanations of why wrong choices fail.
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Component */}
      <div style={{ marginBottom: '3.5rem' }}>
        <ExamSimulator />
      </div>
    </div>
  );
};
