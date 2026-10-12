import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { BookmarkItem, StudyProgress } from '../types/course';
import type { CognitiaStorageV1, CombinedProgressSummary } from '../lib/storage/types';
import {
  loadStorage,
  saveStorage,
  resetStorage,
  exportProgressJSON,
  importProgressFromJSON,
  initCrossTabSync,
  calculateCombinedProgress,
} from '../lib/storage/storageManager';

interface StudyContextType {
  storageData: CognitiaStorageV1;
  progress: StudyProgress;
  combinedProgress: CombinedProgressSummary;
  isStorageBlocked: boolean;
  isMigrated: boolean;
  markSectionComplete: (lessonId: string, sectionId: string) => void;
  toggleBookmark: (item: Omit<BookmarkItem, 'timestamp'>) => void;
  isBookmarked: (lessonId: string, sectionId: string) => boolean;
  recordQuizResult: (questionId: string, correct: boolean, selected: any) => void;
  setLastVisited: (lessonId: string, sectionId: string) => void;
  recordSimulatorRun: (simulatorId: string, algo?: string) => void;
  resetProgress: () => void;
  exportJSON: () => string;
  importJSON: (jsonStr: string) => boolean;
  activeSearchOpen: boolean;
  setActiveSearchOpen: (open: boolean) => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider = ({ children }: { children: ReactNode }) => {
  const [initResult] = useState(() => loadStorage());
  const [storageData, setStorageData] = useState<CognitiaStorageV1>(initResult.data);
  const [isStorageBlocked] = useState<boolean>(initResult.isBlocked);
  const [isMigrated] = useState<boolean>(initResult.isMigrated);
  const [activeSearchOpen, setActiveSearchOpen] = useState(false);

  // Cross-tab synchronization
  useEffect(() => {
    const cleanup = initCrossTabSync((synced: CognitiaStorageV1) => {
      setStorageData(synced);
    });
    return cleanup;
  }, []);

  // Sync to localStorage with debounce
  useEffect(() => {
    saveStorage(storageData);
  }, [storageData]);

  const markSectionComplete = (lessonId: string, sectionId: string) => {
    const key = `${lessonId}:${sectionId}`;
    setStorageData((prev) => {
      const nextCompleted = {
        ...prev.study.completedSections,
        [key]: !prev.study.completedSections[key],
      };
      return {
        ...prev,
        study: {
          ...prev.study,
          completedSections: nextCompleted,
        },
      };
    });
  };

  const toggleBookmark = (item: Omit<BookmarkItem, 'timestamp'>) => {
    setStorageData((prev) => {
      const exists = prev.study.bookmarks.some((b) => b.id === item.id);
      let nextBookmarks: BookmarkItem[];
      if (exists) {
        nextBookmarks = prev.study.bookmarks.filter((b) => b.id !== item.id);
      } else {
        nextBookmarks = [...prev.study.bookmarks, { ...item, timestamp: Date.now() }];
      }
      return {
        ...prev,
        study: {
          ...prev.study,
          bookmarks: nextBookmarks,
        },
      };
    });
  };

  const isBookmarked = (lessonId: string, sectionId: string) => {
    return storageData.study.bookmarks.some(
      (b) => b.lessonId === lessonId && b.sectionId === sectionId
    );
  };

  const recordQuizResult = (questionId: string, correct: boolean, selected: any) => {
    setStorageData((prev) => ({
      ...prev,
      study: {
        ...prev.study,
        quizScores: {
          ...prev.study.quizScores,
          [questionId]: {
            answered: true,
            correct,
            selected,
            timestamp: Date.now(),
          },
        },
      },
    }));
  };

  const setLastVisited = (lessonId: string, sectionId: string) => {
    setStorageData((prev) => ({
      ...prev,
      study: {
        ...prev.study,
        lastVisited: {
          lessonId,
          sectionId,
          timestamp: Date.now(),
        },
      },
    }));
  };

  const recordSimulatorRun = (simulatorId: string, algo?: string) => {
    setStorageData((prev) => {
      const sim = prev.study.simulatorUsage[simulatorId] || {
        runs: 0,
        algorithmsTried: [],
        lastUsed: 0,
      };
      const algos = new Set(sim.algorithmsTried);
      if (algo) algos.add(algo);

      return {
        ...prev,
        study: {
          ...prev.study,
          simulatorUsage: {
            ...prev.study.simulatorUsage,
            [simulatorId]: {
              runs: sim.runs + 1,
              algorithmsTried: Array.from(algos),
              lastUsed: Date.now(),
            },
          },
        },
      };
    });
  };

  const resetProgress = () => {
    const fresh = resetStorage();
    setStorageData(fresh);
  };

  const exportJSON = () => {
    return exportProgressJSON(storageData);
  };

  const importJSON = (jsonStr: string): boolean => {
    try {
      const res = importProgressFromJSON(jsonStr);
      if (res) {
        setStorageData(res);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const combinedProgress = calculateCombinedProgress(storageData);

  return (
    <StudyContext.Provider
      value={{
        storageData,
        progress: storageData.study,
        combinedProgress,
        isStorageBlocked,
        isMigrated,
        markSectionComplete,
        toggleBookmark,
        isBookmarked,
        recordQuizResult,
        setLastVisited,
        recordSimulatorRun,
        resetProgress,
        exportJSON,
        importJSON,
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
