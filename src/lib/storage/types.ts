/**
 * Cognitia Unified Storage Architecture (v1)
 * 100% Client-Side, Functional, Privacy-Centric Browser Persistence
 */

export interface BookmarkItem {
  id: string;
  lessonId: string;
  sectionId: string;
  title: string;
  timestamp: number;
  previewText: string;
}

export interface QuizScoreEntry {
  answered: boolean;
  correct: boolean;
  selected: any;
  timestamp: number;
}

export interface ExamAttemptEntry {
  timestamp: number;
  score: number;
  total: number;
  percentage: number;
  lessonFilter?: string;
}

export interface SimulatorUsageEntry {
  runs: number;
  lastUsed: number;
  algorithmsTried: string[];
}

export interface AchievementEntry {
  unlocked: boolean;
  unlockedAt: number;
  title: string;
  description: string;
}

export interface BeTheAgentAttempt {
  levelId: string;
  studentCost: number;
  optimalCost: number;
  nodesExpandedByOptimal: number;
  efficiencyPercent: number;
  timestamp: number;
}

export interface CombinedProgressSummary {
  totalPercentage: number;
  readingScore: number;
  quizScore: number;
  simulatorScore: number;
  gameScore: number;
}

export interface CognitiaStorageV1 {
  version: 1;
  updatedAt: number;

  study: {
    completedSections: Record<string, boolean>; // `${lessonId}:${sectionId}`
    quizScores: Record<string, QuizScoreEntry>; // `${questionId}`
    lastVisited: {
      lessonId: string;
      sectionId: string;
      scrollPosition?: number;
      timestamp: number;
    } | null;
    bookmarks: BookmarkItem[];
    simulatorUsage: Record<string, SimulatorUsageEntry>; // `romania`, `eight_puzzle`, etc.
    examAttempts: ExamAttemptEntry[];
  };

  game: {
    unlockedLevels: number; // 1 to 5
    levelStars: Record<number, number>; // level -> 1..3 stars
    levelScores: Record<number, number>;
    highScoreArcade: number;
    survivalBestSeconds: number;
    achievements: Record<string, AchievementEntry>;
    campaignQuizResults: Record<number, { passed: boolean; score: number; attempts: number }>;
    ghostLabExperiments: number;
    beTheAgentAttempts: BeTheAgentAttempt[];
  };

  preferences: {
    calmMode: boolean;
    reducedMotionOverride: boolean;
    audioFeedback: boolean;
    gameAudio: boolean;
    gameSpeed: number; // 0.5 (slow) to 1.5 (fast)
    xrayDefault: boolean;
    crtScanlines: boolean;
  };

  telemetry: {
    firstVisitTimestamp: number;
    lastVisitTimestamp: number;
    visitStreak: number;
    totalSessions: number;
    lastVisitDateStr: string; // YYYY-MM-DD
  };
}

export const INITIAL_ACHIEVEMENTS: Record<string, AchievementEntry> = {
  first_wave: {
    unlocked: false,
    unlockedAt: 0,
    title: 'Wave Breaker',
    description: 'Outsmart the BFS enemy on Level 1 by exploiting step limits.',
  },
  cost_efficient: {
    unlocked: false,
    unlockedAt: 0,
    title: 'The Frugal Path',
    description: 'Bait The Miser (UCS) into expensive mud tiles while taking the pavement.',
  },
  deep_diversion: {
    unlocked: false,
    unlockedAt: 0,
    title: 'Labyrinth Trap',
    description: 'Lure The Plunger (DFS) into a 15-tile dead-end corridor.',
  },
  greedy_bluff: {
    unlocked: false,
    unlockedAt: 0,
    title: 'Heuristic Illusion',
    description: 'Fool The Gambler (Greedy) by positioning near a wall with lower straight-line distance.',
  },
  astar_survivor: {
    unlocked: false,
    unlockedAt: 0,
    title: 'Master of Admissibility',
    description: 'Complete Level 5 against The Strategist (A*) and pass the optimality quiz.',
  },
  agent_perfection: {
    unlocked: false,
    unlockedAt: 0,
    title: 'Optimal Rational Agent',
    description: 'Match the mathematical optimal path cost exactly in "Be the Agent" mode.',
  },
  xray_analyst: {
    unlocked: false,
    unlockedAt: 0,
    title: 'X-Ray Diagnostician',
    description: 'Inspect live search frontiers and node expansions across 10 game rounds.',
  },
};
