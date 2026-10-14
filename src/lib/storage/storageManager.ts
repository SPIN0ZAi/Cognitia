import {
  type CognitiaStorageV1,
  INITIAL_ACHIEVEMENTS,
} from './types';

export const STORAGE_KEY_V1 = 'cognitia:v1';
export const LEGACY_STORAGE_KEY = 'cognitia_study_progress_v1';

let inMemoryFallbackState: CognitiaStorageV1 | null = null;
let isStorageBlocked = false;
let writeDebounceTimer: any = null;
const subscribers = new Set<(data: CognitiaStorageV1) => void>();

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createDefaultStorage(): CognitiaStorageV1 {
  const today = getTodayDateString();
  const now = Date.now();

  return {
    version: 1,
    updatedAt: now,
    study: {
      completedSections: {},
      quizScores: {},
      lastVisited: {
        lessonId: 'lesson-1',
        sectionId: 'what-is-ai',
        timestamp: now,
      },
      bookmarks: [],
      simulatorUsage: {},
      examAttempts: [],
    },
    game: {
      unlockedLevels: 1,
      levelStars: {},
      levelScores: {},
      highScoreArcade: 0,
      survivalBestSeconds: 0,
      achievements: { ...INITIAL_ACHIEVEMENTS },
      campaignQuizResults: {},
      ghostLabExperiments: 0,
      beTheAgentAttempts: [],
    },
    preferences: {
      calmMode: false,
      reducedMotionOverride: false,
      audioFeedback: true,
      gameAudio: true,
      gameSpeed: 1.0,
      xrayDefault: true,
      crtScanlines: true,
    },
    telemetry: {
      firstVisitTimestamp: now,
      lastVisitTimestamp: now,
      visitStreak: 1,
      totalSessions: 1,
      lastVisitDateStr: today,
    },
  };
}

/**
 * Migrates legacy `cognitia_study_progress_v1` into the new versioned `CognitiaStorageV1` schema
 */
export function migrateLegacyData(legacyData: any): CognitiaStorageV1 {
  const base = createDefaultStorage();

  if (!legacyData || typeof legacyData !== 'object') {
    return base;
  }

  // Migrate completed sections
  if (legacyData.completedSections && typeof legacyData.completedSections === 'object') {
    base.study.completedSections = { ...legacyData.completedSections };
  }

  // Migrate quiz scores
  if (legacyData.quizScores && typeof legacyData.quizScores === 'object') {
    const migratedScores: Record<string, any> = {};
    for (const [key, val] of Object.entries(legacyData.quizScores)) {
      if (val && typeof val === 'object') {
        migratedScores[key] = {
          answered: (val as any).answered ?? true,
          correct: (val as any).correct ?? false,
          selected: (val as any).selected ?? null,
          timestamp: (val as any).timestamp || Date.now(),
        };
      }
    }
    base.study.quizScores = migratedScores;
  }

  // Migrate last visited
  if (legacyData.lastVisited && typeof legacyData.lastVisited === 'object') {
    base.study.lastVisited = {
      lessonId: legacyData.lastVisited.lessonId || 'lesson-1',
      sectionId: legacyData.lastVisited.sectionId || 'what-is-ai',
      scrollPosition: legacyData.lastVisited.scrollPosition,
      timestamp: legacyData.lastVisited.timestamp || Date.now(),
    };
  }

  // Migrate bookmarks
  if (Array.isArray(legacyData.bookmarks)) {
    base.study.bookmarks = legacyData.bookmarks.filter(
      (b: any) => b && typeof b === 'object' && b.id && b.lessonId && b.sectionId
    );
  }

  base.updatedAt = Date.now();
  return base;
}

/**
 * Validates and deeply sanitizes loaded storage object to prevent crashes
 */
export function validateAndSanitize(data: any): CognitiaStorageV1 {
  if (!data || typeof data !== 'object') {
    return createDefaultStorage();
  }

  const base = createDefaultStorage();

  const study = data.study && typeof data.study === 'object' ? data.study : {};
  const game = data.game && typeof data.game === 'object' ? data.game : {};
  const preferences = data.preferences && typeof data.preferences === 'object' ? data.preferences : {};
  const telemetry = data.telemetry && typeof data.telemetry === 'object' ? data.telemetry : {};

  // Calculate visit streak
  const today = getTodayDateString();
  let currentStreak = typeof telemetry.visitStreak === 'number' ? telemetry.visitStreak : 1;
  const lastDate = telemetry.lastVisitDateStr || '';

  if (lastDate && lastDate !== today) {
    const lastTime = new Date(lastDate).getTime();
    const todayTime = new Date(today).getTime();
    const diffDays = Math.round((todayTime - lastTime) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      currentStreak += 1;
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  }

  return {
    version: 1,
    updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
    study: {
      completedSections: study.completedSections && typeof study.completedSections === 'object' ? study.completedSections : {},
      quizScores: study.quizScores && typeof study.quizScores === 'object' ? study.quizScores : {},
      lastVisited: study.lastVisited && typeof study.lastVisited === 'object' ? {
        lessonId: study.lastVisited.lessonId || 'lesson-1',
        sectionId: study.lastVisited.sectionId || 'what-is-ai',
        scrollPosition: typeof study.lastVisited.scrollPosition === 'number' ? study.lastVisited.scrollPosition : undefined,
        timestamp: typeof study.lastVisited.timestamp === 'number' ? study.lastVisited.timestamp : Date.now(),
      } : base.study.lastVisited,
      bookmarks: Array.isArray(study.bookmarks) ? study.bookmarks : [],
      simulatorUsage: study.simulatorUsage && typeof study.simulatorUsage === 'object' ? study.simulatorUsage : {},
      examAttempts: Array.isArray(study.examAttempts) ? study.examAttempts : [],
    },
    game: {
      unlockedLevels: Math.max(1, Math.min(5, typeof game.unlockedLevels === 'number' ? game.unlockedLevels : 1)),
      levelStars: game.levelStars && typeof game.levelStars === 'object' ? game.levelStars : {},
      levelScores: game.levelScores && typeof game.levelScores === 'object' ? game.levelScores : {},
      highScoreArcade: typeof game.highScoreArcade === 'number' ? game.highScoreArcade : 0,
      survivalBestSeconds: typeof game.survivalBestSeconds === 'number' ? game.survivalBestSeconds : 0,
      achievements: {
        ...INITIAL_ACHIEVEMENTS,
        ...(game.achievements && typeof game.achievements === 'object' ? game.achievements : {}),
      },
      campaignQuizResults: game.campaignQuizResults && typeof game.campaignQuizResults === 'object' ? game.campaignQuizResults : {},
      ghostLabExperiments: typeof game.ghostLabExperiments === 'number' ? game.ghostLabExperiments : 0,
      beTheAgentAttempts: Array.isArray(game.beTheAgentAttempts) ? game.beTheAgentAttempts : [],
    },
    preferences: {
      calmMode: Boolean(preferences.calmMode),
      reducedMotionOverride: Boolean(preferences.reducedMotionOverride),
      audioFeedback: preferences.audioFeedback !== undefined ? Boolean(preferences.audioFeedback) : true,
      gameAudio: preferences.gameAudio !== undefined ? Boolean(preferences.gameAudio) : true,
      gameSpeed: typeof preferences.gameSpeed === 'number' ? Math.max(0.5, Math.min(2.0, preferences.gameSpeed)) : 1.0,
      xrayDefault: preferences.xrayDefault !== undefined ? Boolean(preferences.xrayDefault) : true,
      crtScanlines: preferences.crtScanlines !== undefined ? Boolean(preferences.crtScanlines) : true,
    },
    telemetry: {
      firstVisitTimestamp: typeof telemetry.firstVisitTimestamp === 'number' ? telemetry.firstVisitTimestamp : Date.now(),
      lastVisitTimestamp: Date.now(),
      visitStreak: currentStreak,
      totalSessions: (typeof telemetry.totalSessions === 'number' ? telemetry.totalSessions : 0) + 1,
      lastVisitDateStr: today,
    },
  };
}

function hasLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

/**
 * Loads storage safely with automatic migration and in-memory fallback
 */
export function loadStorage(): { data: CognitiaStorageV1; isBlocked: boolean; isMigrated: boolean } {
  if (!hasLocalStorage()) {
    isStorageBlocked = true;
    const defaultData = inMemoryFallbackState || createDefaultStorage();
    inMemoryFallbackState = defaultData;
    return { data: defaultData, isBlocked: true, isMigrated: false };
  }

  // 1. Try reading active V1 storage key
  try {
    const rawV1 = localStorage.getItem(STORAGE_KEY_V1);
    if (rawV1) {
      const parsed = JSON.parse(rawV1);
      const sanitized = validateAndSanitize(parsed);
      inMemoryFallbackState = sanitized;
      return { data: sanitized, isBlocked: false, isMigrated: false };
    }

    // 2. Check for legacy storage key to migrate
    const rawLegacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (rawLegacy) {
      const legacyParsed = JSON.parse(rawLegacy);
      const migrated = migrateLegacyData(legacyParsed);
      inMemoryFallbackState = migrated;
      // Persist migrated format to new key
      try {
        localStorage.setItem(STORAGE_KEY_V1, JSON.stringify(migrated));
      } catch (e) {
        // storage quota or blocked
      }
      return { data: migrated, isBlocked: false, isMigrated: true };
    }
  } catch (err) {
    console.warn('[Cognitia Storage] LocalStorage is blocked or inaccessible; using in-memory state fallback.', err);
    isStorageBlocked = true;
  }

  // 3. Fallback to default
  const defaultData = inMemoryFallbackState || createDefaultStorage();
  inMemoryFallbackState = defaultData;
  return { data: defaultData, isBlocked: isStorageBlocked, isMigrated: false };
}

/**
 * Debounced save to prevent high-frequency write thrashing
 */
export function saveStorage(data: CognitiaStorageV1, immediate: boolean = false): void {
  inMemoryFallbackState = data;
  data.updatedAt = Date.now();

  const persist = () => {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY_V1, serialized);
      isStorageBlocked = false;
    } catch (err) {
      console.warn('[Cognitia Storage] Failed to write to localStorage; persisting in memory.', err);
      isStorageBlocked = true;
    }
    // Notify in-process subscribers
    subscribers.forEach((sub) => sub(data));
  };

  if (immediate) {
    if (writeDebounceTimer) clearTimeout(writeDebounceTimer);
    persist();
  } else {
    if (writeDebounceTimer) clearTimeout(writeDebounceTimer);
    writeDebounceTimer = setTimeout(persist, 250);
  }
}

/**
 * Subscribes to storage changes (handles cross-tab and in-tab updates)
 */
export function subscribeToStorage(callback: (data: CognitiaStorageV1) => void): () => void {
  subscribers.add(callback);

  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY_V1 && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        const sanitized = validateAndSanitize(parsed);
        inMemoryFallbackState = sanitized;
        callback(sanitized);
      } catch (e) {
        console.warn('[Cognitia Storage] Cross-tab storage parse error', e);
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageEvent);
  }

  return () => {
    subscribers.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageEvent);
    }
  };
}

/**
 * Exports current progress as formatted JSON string
 */
export function exportProgressAsJSON(data: CognitiaStorageV1): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Imports and validates JSON backup file
 */
export function importProgressFromJSON(jsonString: string): CognitiaStorageV1 {
  const parsed = JSON.parse(jsonString);
  const sanitized = validateAndSanitize(parsed);
  saveStorage(sanitized, true);
  return sanitized;
}

/**
 * Resets storage cleanly
 */
export function resetStorage(): CognitiaStorageV1 {
  const fresh = createDefaultStorage();
  inMemoryFallbackState = fresh;
  try {
    localStorage.removeItem(STORAGE_KEY_V1);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (e) {
    // ignore
  }
  subscribers.forEach((sub) => sub(fresh));
  return fresh;
}

/**
 * Academic Combined Progress Model:
 * 40% Course Readings (sections completed)
 * 25% Formal Quizzes & Exam Questions
 * 20% Interactive Simulators Engaged
 * 15% Learn & Play Game Levels & Challenges
 */
export function calculateOverallProgress(data: CognitiaStorageV1): {
  overall: number;
  readingPct: number;
  quizPct: number;
  simulatorPct: number;
  gamePct: number;
} {
  // Total sections across 4 lectures = 32 (Lesson 1-3: 14, Lesson 4: 18)
  const TOTAL_SECTIONS = 32;
  const completedSectionCount = Object.values(data.study.completedSections).filter(Boolean).length;
  const readingPct = Math.min(100, Math.round((completedSectionCount / TOTAL_SECTIONS) * 100));

  // 15 Practice Exam Questions
  const TOTAL_QUIZ_QUESTIONS = 15;
  const completedQuizCount = Object.values(data.study.quizScores).filter((s) => s.answered && s.correct).length;
  const quizPct = Math.min(100, Math.round((completedQuizCount / TOTAL_QUIZ_QUESTIONS) * 100));

  // 5 Main Simulators: Romania, 8-Puzzle, Vacuum, Water Jugs, Missionaries
  const TOTAL_SIMULATORS = 5;
  const usedSimulatorCount = Object.keys(data.study.simulatorUsage).length;
  const simulatorPct = Math.min(100, Math.round((usedSimulatorCount / TOTAL_SIMULATORS) * 100));

  // 5 Game Campaign Levels
  const TOTAL_GAME_LEVELS = 5;
  const unlockedGameLevels = data.game.unlockedLevels;
  const gamePct = Math.min(100, Math.round(((unlockedGameLevels - 1) / (TOTAL_GAME_LEVELS - 1 || 1)) * 100));

  const overall = Math.round(
    0.4 * readingPct +
    0.25 * quizPct +
    0.2 * simulatorPct +
    0.15 * gamePct
  );

  return {
    overall: Math.min(100, overall),
    readingPct,
    quizPct,
    simulatorPct,
    gamePct,
  };
}

export function calculateCombinedProgress(data: CognitiaStorageV1): {
  totalPercentage: number;
  readingScore: number;
  quizScore: number;
  simulatorScore: number;
  gameScore: number;
} {
  const p = calculateOverallProgress(data);
  return {
    totalPercentage: p.overall,
    readingScore: p.readingPct,
    quizScore: p.quizPct,
    simulatorScore: p.simulatorPct,
    gameScore: p.gamePct,
  };
}

export const exportProgressJSON = exportProgressAsJSON;
export const initCrossTabSync = subscribeToStorage;

export function recordGameScore(score: number, level: number = 1): void {
  const loaded = loadStorage().data;
  const currentHigh = loaded.game.highScoreArcade || 0;
  if (score > currentHigh) {
    loaded.game.highScoreArcade = score;
  }
  loaded.game.levelScores[level] = Math.max(loaded.game.levelScores[level] || 0, score);
  if (level >= loaded.game.unlockedLevels && level < 6) {
    loaded.game.unlockedLevels = level + 1;
  }
  saveStorage(loaded);
}

export function unlockGameAchievement(achievementId: string): void {
  const loaded = loadStorage().data;
  if (!loaded.game.achievements[achievementId]) {
    loaded.game.achievements[achievementId] = {
      unlocked: true,
      unlockedAt: Date.now(),
      title: achievementId,
      description: 'Milestone reached in Cognitia Chase.',
    };
    saveStorage(loaded);
  }
}

