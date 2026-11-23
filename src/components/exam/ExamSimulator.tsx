import React, { useState, useEffect } from 'react';
import { PRACTICE_QUESTIONS } from '../../data/practiceData';
import type { QuizQuestion } from '../../types/course';
import { Clock, Flag, CheckCircle2, XCircle, ArrowRight, ArrowLeft, RotateCcw, HelpCircle, Award } from 'lucide-react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

interface ExamConfig {
  lessonIds: string[];
  difficulty: 'All' | 'Foundation' | 'Intermediate' | 'Exam-Level';
  questionCount: number;
  isTimed: boolean;
  timePerQuestionSeconds: number;
}

export const ExamSimulator: React.FC = () => {
  const [config, setConfig] = useState<ExamConfig>({
    lessonIds: ['lesson-5', 'lesson-6', 'lesson-7', 'lesson-8', 'lesson-9', 'lesson-10'],
    difficulty: 'All',
    questionCount: 10,
    isTimed: true,
    timePerQuestionSeconds: 90,
  });

  const [examActive, setExamActive] = useState<boolean>(false);
  const [examFinished, setExamFinished] = useState<boolean>(false);
  const [examQuestions, setExamQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});
  const [flagged, setFlagged] = useState<{ [qId: string]: boolean }>({});
  const [revealedHints, setRevealedHints] = useState<{ [qId: string]: number }>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  // Filter and start exam
  const handleStartExam = () => {
    let pool = PRACTICE_QUESTIONS.filter((q) => config.lessonIds.includes(q.lessonId));
    if (config.difficulty !== 'All') {
      pool = pool.filter((q) => q.difficulty === config.difficulty);
    }

    if (pool.length === 0) {
      pool = PRACTICE_QUESTIONS;
    }

    // Shuffle and slice to questionCount
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(config.questionCount, pool.length));

    setExamQuestions(shuffled);
    setCurrentIdx(0);
    setUserAnswers({});
    setFlagged({});
    setRevealedHints({});
    setSecondsRemaining(shuffled.length * config.timePerQuestionSeconds);
    setExamActive(true);
    setExamFinished(false);
  };

  // Timer effect
  useEffect(() => {
    if (examActive && !examFinished && config.isTimed) {
      if (secondsRemaining <= 0) {
        setExamFinished(true);
        return;
      }
      const timer = setInterval(() => {
        setSecondsRemaining((s) => s - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examActive, examFinished, config.isTimed, secondsRemaining]);

  const toggleLesson = (id: string) => {
    setConfig((prev) => {
      const exists = prev.lessonIds.includes(id);
      if (exists && prev.lessonIds.length > 1) {
        return { ...prev, lessonIds: prev.lessonIds.filter((l) => l !== id) };
      } else if (!exists) {
        return { ...prev, lessonIds: [...prev.lessonIds, id] };
      }
      return prev;
    });
  };

  const handleSelectAnswer = (optIdx: number) => {
    const q = examQuestions[currentIdx];
    setUserAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
  };

  const toggleFlag = () => {
    const q = examQuestions[currentIdx];
    setFlagged((prev) => ({ ...prev, [q.id]: !prev[q.id] }));
  };

  const revealNextHint = () => {
    const q = examQuestions[currentIdx];
    const current = revealedHints[q.id] || 0;
    if (q.hints && current < q.hints.length) {
      setRevealedHints((prev) => ({ ...prev, [q.id]: current + 1 }));
    }
  };

  // Score calculation
  const calculateResults = () => {
    let correct = 0;
    const lessonScores: { [lId: string]: { correct: number; total: number } } = {};

    examQuestions.forEach((q) => {
      if (!lessonScores[q.lessonId]) {
        lessonScores[q.lessonId] = { correct: 0, total: 0 };
      }
      lessonScores[q.lessonId].total += 1;

      if (userAnswers[q.id] === q.correctAnswer) {
        correct += 1;
        lessonScores[q.lessonId].correct += 1;
      }
    });

    const percentage = examQuestions.length > 0 ? (correct / examQuestions.length) * 10 : 0;
    let grade = 'Suspenso';
    let gradeColor = 'text-rose-400';
    if (percentage >= 9.0) {
      grade = 'Matrícula de Honor';
      gradeColor = 'text-amber-400';
    } else if (percentage >= 8.5) {
      grade = 'Sobresaliente';
      gradeColor = 'text-emerald-400';
    } else if (percentage >= 7.0) {
      grade = 'Notable';
      gradeColor = 'text-cyan-400';
    } else if (percentage >= 5.0) {
      grade = 'Aprobado';
      gradeColor = 'text-blue-400';
    }

    return { correct, total: examQuestions.length, percentage, grade, gradeColor, lessonScores };
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 1. CONFIGURATION VIEW
  if (!examActive) {
    return (
      <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-8 shadow-2xl space-y-8 max-w-4xl mx-auto">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Official University Simulator
            </span>
            <span className="text-xs text-slate-500 font-mono">UCLM 42321 • Sistemas Inteligentes</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Intelligent Systems Exam Simulator & Readiness Engine
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Simulate realistic exam conditions with time pressure, 3-tier progressive hints, official UCLM grading, and deep topic mastery diagnostics.
          </p>
        </div>

        {/* Lesson Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            1. Select Syllabus Lessons to Test:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              const id = `lesson-${num}`;
              const isSelected = config.lessonIds.includes(id);
              return (
                <button
                  key={num}
                  onClick={() => toggleLesson(id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <div className="text-xs font-mono">Lesson {num}</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {num === 1
                      ? 'Intro'
                      : num === 2
                      ? 'Search'
                      : num === 3
                      ? 'Heuristics'
                      : num === 4
                      ? 'Games'
                      : num === 5
                      ? 'RL'
                      : num === 6
                      ? 'Comb Opt'
                      : num === 7
                      ? 'Local Search'
                      : num === 8
                      ? 'Genetic Alg'
                      : num === 9
                      ? 'ML Found'
                      : 'Classif'}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setConfig((c) => ({ ...c, lessonIds: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'] }))}
              className="text-cyan-400 hover:underline"
            >
              Midterm Preset (Lessons 1–4)
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={() =>
                setConfig((c) => ({
                  ...c,
                  lessonIds: ['lesson-5', 'lesson-6', 'lesson-7', 'lesson-8', 'lesson-9', 'lesson-10'],
                }))
              }
              className="text-cyan-400 hover:underline"
            >
              Final Exam Preset (Lessons 5–10)
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={() =>
                setConfig((c) => ({
                  ...c,
                  lessonIds: [
                    'lesson-1',
                    'lesson-2',
                    'lesson-3',
                    'lesson-4',
                    'lesson-5',
                    'lesson-6',
                    'lesson-7',
                    'lesson-8',
                    'lesson-9',
                    'lesson-10',
                  ],
                }))
              }
              className="text-cyan-400 hover:underline"
            >
              All 10 Lessons
            </button>
          </div>
        </div>

        {/* Difficulty & Count */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              2. Difficulty Filter:
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {(['All', 'Foundation', 'Intermediate', 'Exam-Level'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setConfig((c) => ({ ...c, difficulty: diff }))}
                  className={`py-1.5 text-xs rounded-lg font-medium transition-all ${
                    config.difficulty === diff ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              3. Question Count:
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  onClick={() => setConfig((c) => ({ ...c, questionCount: num }))}
                  className={`py-1.5 text-xs rounded-lg font-mono font-bold transition-all ${
                    config.questionCount === num ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  {num} Q
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              4. Exam Timer:
            </label>
            <button
              onClick={() => setConfig((c) => ({ ...c, isTimed: !c.isTimed }))}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-between ${
                config.isTimed
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <span>{config.isTimed ? 'Timed (90s / Q)' : 'Untimed Practice'}</span>
              <Clock size={16} />
            </button>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartExam}
          className="w-full py-4 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold text-base shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <span>Begin Examination Simulator</span>
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  // 2. EXAM FINISHED / RESULTS VIEW
  if (examFinished) {
    const { correct, total, percentage, grade, gradeColor, lessonScores } = calculateResults();

    return (
      <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-8 shadow-2xl space-y-8 max-w-4xl mx-auto">
        {/* Results Header */}
        <div className="text-center space-y-2 border-b border-slate-800 pb-6">
          <div className="inline-flex p-3 rounded-full bg-slate-900 border border-slate-800 mb-2">
            <Award size={36} className="text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Examination Session Complete</h2>
          <div className="flex items-center justify-center gap-4 text-xs font-mono">
            <span>Score: <strong className="text-white font-bold">{correct} / {total}</strong> correct</span>
            <span>Grade: <strong className={`text-lg font-bold ${gradeColor}`}>{percentage.toFixed(1)} / 10 ({grade})</strong></span>
          </div>
        </div>

        {/* Lesson-by-Lesson Mastery Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Syllabus Topic Mastery Diagnosis
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(lessonScores).map(([lId, stats]) => {
              const pass = (stats.correct / stats.total) >= 0.7;
              return (
                <div key={lId} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white capitalize">{lId.replace('-', ' ')}</span>
                    <span className="block text-slate-500 font-mono text-[11px]">{stats.correct} of {stats.total} correct</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    pass ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {Math.round((stats.correct / stats.total) * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Detailed Solution Review & Professor Explanations
          </h4>
          <div className="space-y-4">
            {examQuestions.map((q, qIdx) => {
              const userAns = userAnswers[q.id];
              const isCorrect = userAns === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-xl border text-xs leading-relaxed space-y-3 ${
                    isCorrect
                      ? 'bg-slate-950 border-emerald-500/30'
                      : 'bg-slate-950 border-rose-500/40'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                        Q{qIdx + 1}.
                      </span>
                      <span className="font-bold text-white">{q.question}</span>
                    </div>
                    {isCorrect ? (
                      <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle size={18} className="text-rose-400 flex-shrink-0" />
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-1.5 pl-4">
                    {(q.options || []).map((opt, oIdx) => {
                      const isUserChoice = userAns === oIdx;
                      const isCorrectChoice = q.correctAnswer === oIdx;

                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-lg border flex items-center justify-between ${
                            isCorrectChoice
                              ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200 font-semibold'
                              : isUserChoice
                              ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                              : 'bg-slate-900/40 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span>{opt}</span>
                          {isCorrectChoice && <span className="text-[10px] text-emerald-400 font-mono font-bold">CORRECT</span>}
                          {isUserChoice && !isCorrectChoice && (
                            <span className="text-[10px] text-rose-400 font-mono font-bold">YOUR CHOICE</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Official Explanation */}
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">
                    <strong className="text-cyan-400 block mb-1">Academic Explanation:</strong>
                    <MarkdownRenderer content={q.explanation} />
                    {q.slideRef && (
                      <span className="text-[10px] text-slate-500 font-mono block mt-2">
                        Official Syllabus: {q.slideRef.lessonId} (Slide {q.slideRef.slideNumber})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Retry / Return Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => setExamActive(false)}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            <span>Configure New Exam</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. EXAM IN PROGRESS VIEW
  const q = examQuestions[currentIdx];
  const userAns = userAnswers[q?.id];
  const isFlagged = flagged[q?.id];
  const hintsCount = revealedHints[q?.id] || 0;

  return (
    <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-w-4xl mx-auto">
      {/* Active Exam Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-mono text-cyan-400">
            Question {currentIdx + 1} of {examQuestions.length}
          </span>
          <span className="text-slate-500 text-xs ml-2 font-mono">
            [{q.difficulty}] • {q.lessonId}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {config.isTimed && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-bold border ${
                secondsRemaining < 60
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-slate-900 text-amber-300 border-slate-800'
              }`}
            >
              <Clock size={14} />
              <span>{formatTime(secondsRemaining)}</span>
            </div>
          )}

          <button
            onClick={toggleFlag}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${
              isFlagged
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Flag size={14} fill={isFlagged ? 'currentColor' : 'none'} />
            <span>Flag</span>
          </button>

          <button
            onClick={() => setExamFinished(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
          >
            Submit Exam
          </button>
        </div>
      </div>

      {/* Question Card */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed tracking-tight">
          {q.question}
        </h3>

        {/* Options */}
        <div className="space-y-2.5">
          {(q.options || []).map((opt, oIdx) => {
            const isSelected = userAns === oIdx;
            return (
              <button
                key={oIdx}
                onClick={() => handleSelectAnswer(oIdx)}
                className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 mt-0.5 ${
                    isSelected ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-slate-700 text-slate-500'
                  }`}
                >
                  {String.fromCharCode(65 + oIdx)}
                </span>
                <span className="leading-relaxed">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-Tier Progressive Hints */}
      {q.hints && q.hints.length > 0 && (
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-mono">Progressive Academic Hints:</span>
            {hintsCount < q.hints.length && (
              <button
                onClick={revealNextHint}
                className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <HelpCircle size={13} />
                <span>Reveal Hint {hintsCount + 1} of {q.hints.length}</span>
              </button>
            )}
          </div>

          {hintsCount > 0 ? (
            <div className="space-y-1.5 pt-1">
              {q.hints.slice(0, hintsCount).map((hint, hIdx) => (
                <div key={hIdx} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs text-amber-200/90 leading-relaxed font-mono">
                  💡 Hint {hIdx + 1}: {hint}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-slate-500">Need guidance? Reveal hints one by one without penalty.</div>
          )}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 disabled:opacity-30 flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          <span>Previous</span>
        </button>

        {/* Quick Question Dots */}
        <div className="hidden sm:flex items-center gap-1">
          {examQuestions.map((eq, idx) => (
            <button
              key={eq.id}
              onClick={() => setCurrentIdx(idx)}
              className={`w-6 h-6 rounded text-[10px] font-mono font-bold transition-all ${
                currentIdx === idx
                  ? 'bg-cyan-500 text-slate-950'
                  : userAnswers[eq.id] !== undefined
                  ? 'bg-slate-800 text-slate-300 border border-slate-700'
                  : 'bg-slate-950 text-slate-600'
              } ${flagged[eq.id] ? 'ring-1 ring-amber-400' : ''}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {currentIdx < examQuestions.length - 1 ? (
          <button
            onClick={() => setCurrentIdx((i) => Math.min(examQuestions.length - 1, i + 1))}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 flex items-center gap-1.5 shadow-md shadow-cyan-500/10"
          >
            <span>Next</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={() => setExamFinished(true)}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
          >
            <span>Finish & Submit</span>
            <CheckCircle2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
