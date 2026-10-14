import {
  createDefaultStorage,
  migrateLegacyData,
  validateAndSanitize,
  calculateOverallProgress,
  exportProgressAsJSON,
  importProgressFromJSON,
} from './storageManager';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log('--- Testing Cognitia Storage Manager ---');

// Test 1: Default storage initialization
const def = createDefaultStorage();
assert(def.version === 1, 'Version should be 1');
assert(def.game.unlockedLevels === 1, 'Unlocked levels should start at 1');
assert(Object.keys(def.game.achievements).length >= 5, 'Should have initial achievements');
assert(def.telemetry.visitStreak >= 1, 'Visit streak should start at 1');
console.log('✔ Test 1 Passed: Default storage initialized properly');

// Test 2: Legacy migration
const legacy = {
  completedSections: {
    'lesson-1:what-is-ai': true,
    'lesson-2:problem-formulation': true,
  },
  quizScores: {
    'q1': { answered: true, correct: true, selected: 0 },
  },
  lastVisited: {
    lessonId: 'lesson-2',
    sectionId: 'problem-formulation',
  },
  bookmarks: [
    { id: 'b1', lessonId: 'lesson-1', sectionId: 'what-is-ai', title: 'What is AI', timestamp: 12345, previewText: 'Intro' },
  ],
};

const migrated = migrateLegacyData(legacy);
assert(migrated.study.completedSections['lesson-1:what-is-ai'] === true, 'Migrated completed section');
assert(migrated.study.completedSections['lesson-2:problem-formulation'] === true, 'Migrated second section');
assert(migrated.study.quizScores['q1'].correct === true, 'Migrated quiz scores');
assert(migrated.study.lastVisited?.lessonId === 'lesson-2', 'Migrated last visited');
assert(migrated.study.bookmarks.length === 1, 'Migrated bookmarks');
assert(migrated.game.unlockedLevels === 1, 'Default game initialized on legacy migration');
console.log('✔ Test 2 Passed: Legacy storage safely migrated with 0 data loss');

// Test 3: Corrupt JSON recovery & sanitization
const corrupt = {
  version: 999,
  study: 'not-an-object',
  game: null,
  preferences: { gameSpeed: 'fast' },
};
const recovered = validateAndSanitize(corrupt);
assert(recovered.version === 1, 'Version recovered to 1');
assert(typeof recovered.study.completedSections === 'object', 'Study sections recovered to object');
assert(recovered.game.unlockedLevels === 1, 'Game recovered to level 1');
assert(recovered.preferences.gameSpeed === 1.0, 'Invalid speed defaulted to 1.0');
console.log('✔ Test 3 Passed: Corrupt data recovered gracefully without crash');

// Test 4: Combined progress model
const sampleProgress = createDefaultStorage();
// 16 sections out of 32 = 50%
for (let i = 0; i < 16; i++) {
  sampleProgress.study.completedSections[`s-${i}`] = true;
}
// 15 quiz answers correct = 100%
for (let i = 0; i < 15; i++) {
  sampleProgress.study.quizScores[`q-${i}`] = { answered: true, correct: true, selected: 0, timestamp: Date.now() };
}
// 5 simulators used = 100%
sampleProgress.study.simulatorUsage = { romania: { runs: 2, lastUsed: 1, algorithmsTried: [] }, eight_puzzle: { runs: 1, lastUsed: 1, algorithmsTried: [] }, vacuum: { runs: 1, lastUsed: 1, algorithmsTried: [] }, water_jugs: { runs: 1, lastUsed: 1, algorithmsTried: [] }, missionaries: { runs: 1, lastUsed: 1, algorithmsTried: [] } };
// Game level 5 = 100%
sampleProgress.game.unlockedLevels = 5;

const metrics = calculateOverallProgress(sampleProgress);
// 0.40 * 50% + 0.25 * 100% + 0.20 * 100% + 0.15 * 100% = 20 + 25 + 20 + 15 = 80%
assert(metrics.readingPct === 50, 'Reading percentage 50%');
assert(metrics.quizPct === 100, 'Quiz percentage 100%');
assert(metrics.simulatorPct === 100, 'Simulator percentage 100%');
assert(metrics.gamePct === 100, 'Game percentage 100%');
assert(metrics.overall === 80, `Expected 80% overall, got ${metrics.overall}%`);
console.log('✔ Test 4 Passed: Combined academic progress model calculated accurately');

// Test 5: Export and Import roundtrip
const json = exportProgressAsJSON(sampleProgress);
const imported = importProgressFromJSON(json);
assert(imported.study.completedSections['s-0'] === true, 'Imported section match');
assert(imported.game.unlockedLevels === 5, 'Imported game level match');
console.log('✔ Test 5 Passed: Export and Import JSON round-trip verified');

console.log('\nAll Storage Manager Unit Tests Passed Successfully!');
