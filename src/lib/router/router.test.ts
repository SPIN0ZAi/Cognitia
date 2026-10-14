/**
 * Unit Tests for Cognitia Router Utilities
 */

import { parseLocation, buildUrl, getRouteTitle } from './router';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`[FAIL] ${msg}`);
  }
  console.log(`[PASS] ${msg}`);
}

console.log('--- Testing Cognitia Router Module ---');

// 1. Root / Home parsing
assert(parseLocation('/', '').view === 'home', 'Parses root "/" as home');
assert(parseLocation('/home', '').view === 'home', 'Parses "/home" as home');
assert(parseLocation('', '').view === 'home', 'Parses empty path as home');

// 2. Lesson routes parsing
const l1 = parseLocation('/lessons/lesson-1', '');
assert(l1.view === 'lesson' && l1.lessonId === 'lesson-1', 'Parses "/lessons/lesson-1"');

const l2 = parseLocation('/lessons/lesson-2', '');
assert(l2.view === 'lesson' && l2.lessonId === 'lesson-2', 'Parses "/lessons/lesson-2"');

const l3 = parseLocation('/lessons/lesson-3', '');
assert(l3.view === 'lesson' && l3.lessonId === 'lesson-3', 'Parses "/lessons/lesson-3"');

const l4 = parseLocation('/lessons/lesson-4', '');
assert(l4.view === 'lesson' && l4.lessonId === 'lesson-4', 'Parses "/lessons/lesson-4"');

const lAlias = parseLocation('/lesson/2', '');
assert(lAlias.view === 'lesson' && lAlias.lessonId === 'lesson-2', 'Parses alias "/lesson/2"');

const lAlias4 = parseLocation('/lesson/4', '');
assert(lAlias4.view === 'lesson' && lAlias4.lessonId === 'lesson-4', 'Parses alias "/lesson/4"');

const lSec = parseLocation('/lessons/lesson-2', '#vacuum-cleaner-world');
assert(
  lSec.view === 'lesson' && lSec.lessonId === 'lesson-2' && lSec.sectionId === 'vacuum-cleaner-world',
  'Parses lesson route with section hash'
);

// 3. Other views
assert(parseLocation('/practice', '').view === 'practice', 'Parses "/practice"');
assert(parseLocation('/glossary', '').view === 'glossary', 'Parses "/glossary"');
assert(parseLocation('/progress', '').view === 'progress', 'Parses "/progress"');
assert(parseLocation('/play', '').view === 'play', 'Parses "/play"');
assert(parseLocation('/chase', '').view === 'play', 'Parses alias "/chase"');

// 4. Hash fallback routes
assert(parseLocation('/', '#/play').view === 'play', 'Parses hash route "#/play"');
assert(parseLocation('/', '#/lessons/lesson-3').lessonId === 'lesson-3', 'Parses hash route "#/lessons/lesson-3"');

// 5. URL Building
assert(buildUrl('home') === '/', 'buildUrl("home") returns "/"');
assert(buildUrl('lesson', 'lesson-2') === '/lessons/lesson-2', 'buildUrl("lesson", "lesson-2")');
assert(
  buildUrl('lesson', 'lesson-2', 'state-space') === '/lessons/lesson-2#state-space',
  'buildUrl with section anchor'
);
assert(buildUrl('play') === '/play', 'buildUrl("play") returns "/play"');
assert(buildUrl('progress') === '/progress', 'buildUrl("progress") returns "/progress"');

// 6. Titles
assert(getRouteTitle({ view: 'home' }).includes('Cognitia'), 'Home title contains Cognitia');
assert(getRouteTitle({ view: 'play' }).includes('Cognitia Chase'), 'Play title contains Cognitia Chase');
assert(getRouteTitle({ view: 'lesson', lessonId: 'lesson-1' }).includes('Lesson 1'), 'Lesson 1 title contains Lesson 1');
assert(getRouteTitle({ view: 'lesson', lessonId: 'lesson-4' }).includes('Lesson 4'), 'Lesson 4 title contains Lesson 4');

console.log('All Router tests passed successfully!');
