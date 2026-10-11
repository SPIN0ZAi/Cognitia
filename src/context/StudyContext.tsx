import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { BookmarkItem, StudyProgress } from '../types/course';

interface StudyContextType {
  progress: StudyProgress;
  markSectionComplete: (lessonId: string, sectionId: string) => void;
  toggleBookmark: (item: Omit<BookmarkItem, 'timestamp'>) => void;
  isBookmarked: (lessonId: string, sectionId: string) => boolean;
  recordQuizResult: (questionId: string, correct: boolean, selected: any) => void;
  setLastVisited: (lessonId: string, sectionId: string) => void;
  resetProgress: () => void;
  activeSearchOpen: boolean;
  setActiveSearchOpen: (open: boolean) => void;
}

const STORAGE_KEY = 'cognitia_study_progress_v1';

const defaultProgress: StudyProgress = {
  completedSections: {},
  quizScores: {},
  lastVisited: {
    lessonId: 'lesson-1',
    sectionId: 'what-is-ai',
    timestamp: Date.now(),
  },
  bookmarks: [],
};

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider = ({ children }: { children: ReactNode }) => {
  const [progress, setProgress] = useState<StudyProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load study progress from localStorage', e);
    }
    return defaultProgress;
  });

  const [activeSearchOpen, setActiveSearchOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to save study progress to localStorage', e);
    }
  }, [progress]);

  const markSectionComplete = (lessonId: string, sectionId: string) => {
    const key = `${lessonId}:${sectionId}`;
    setProgress((prev) => ({
      ...prev,
      completedSections: {
        ...prev.completedSections,
        [key]: !prev.completedSections[key],
      },
    }));
  };

  const toggleBookmark = (item: Omit<BookmarkItem, 'timestamp'>) => {
    setProgress((prev) => {
      const exists = prev.bookmarks.some((b) => b.id === item.id);
      if (exists) {
        return {
          ...prev,
          bookmarks: prev.bookmarks.filter((b) => b.id !== item.id),
        };
      } else {
        return {
          ...prev,
          bookmarks: [...prev.bookmarks, { ...item, timestamp: Date.now() }],
        };
      }
    });
  };

  const isBookmarked = (lessonId: string, sectionId: string) => {
    return progress.bookmarks.some(
      (b) => b.lessonId === lessonId && b.sectionId === sectionId
    );
  };

  const recordQuizResult = (questionId: string, correct: boolean, selected: any) => {
    setProgress((prev) => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [questionId]: {
          answered: true,
          correct,
          selected,
        },
      },
    }));
  };

  const setLastVisited = (lessonId: string, sectionId: string) => {
    setProgress((prev) => ({
      ...prev,
      lastVisited: {
        lessonId,
        sectionId,
        timestamp: Date.now(),
      },
    }));
  };

  const resetProgress = () => {
    setProgress(defaultProgress);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  return (
    <StudyContext.Provider
      value={{
        progress,
        markSectionComplete,
        toggleBookmark,
        isBookmarked,
        recordQuizResult,
        setLastVisited,
        resetProgress,
        activeSearchOpen,
        setActiveSearchOpen,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
