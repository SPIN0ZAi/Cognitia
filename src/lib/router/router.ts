/**
 * Cognitia Unified Router Utilities
 * 
 * Provides deterministic URL parsing, URL building, and document title generation
 * for full HTML5 History API integration and browser back/forward navigation.
 */

import type { RouteState, ViewType, LessonIdType } from './types';

/**
 * Parses raw pathname and hash into structured RouteState.
 * Supports both clean HTML5 paths (/lessons/lesson-1) and hash routes (#/lessons/lesson-1).
 */
export function parseLocation(
  pathname: string = typeof window !== 'undefined' ? window.location.pathname : '/',
  hash: string = typeof window !== 'undefined' ? window.location.hash : ''
): RouteState {
  let target = pathname || '/';

  // Support hash routing fallback if hash starts with '#/'
  if (hash.startsWith('#/')) {
    target = hash.slice(1); // e.g. '/play' or '/lessons/lesson-2'
  }

  // Remove leading and trailing slashes
  const clean = target.replace(/^\/+|\/+$/g, '');

  // Extract hash anchor for section scrolling (if not a route hash)
  let sectionFromHash: string | undefined = undefined;
  if (hash && !hash.startsWith('#/')) {
    sectionFromHash = hash.replace(/^#/, '') || undefined;
  }

  if (!clean || clean === 'home') {
    return { view: 'home' };
  }

  if (clean.startsWith('lessons/') || clean.startsWith('lesson/')) {
    const parts = clean.split('/');
    let lessonId: LessonIdType = 'lesson-1';
    const rawLesson = (parts[1] || '').toLowerCase();

    if (rawLesson === '2' || rawLesson === 'lesson-2') {
      lessonId = 'lesson-2';
    } else if (rawLesson === '3' || rawLesson === 'lesson-3') {
      lessonId = 'lesson-3';
    } else {
      lessonId = 'lesson-1';
    }

    const sectionId = parts[2] || sectionFromHash;
    return {
      view: 'lesson',
      lessonId,
      sectionId: sectionId ? decodeURIComponent(sectionId) : undefined,
    };
  }

  if (clean === 'practice') {
    return { view: 'practice' };
  }

  if (clean === 'glossary') {
    return { view: 'glossary' };
  }

  if (clean === 'progress') {
    return { view: 'progress' };
  }

  if (clean === 'play' || clean === 'chase') {
    return { view: 'play' };
  }

  // Fallback to home for unrecognized paths
  return { view: 'home' };
}

/**
 * Builds canonical URL path for a given route state.
 */
export function buildUrl(
  view: ViewType | string,
  lessonId?: LessonIdType | string,
  sectionId?: string
): string {
  switch (view) {
    case 'home':
      return '/';
    case 'lesson': {
      const lid = lessonId || 'lesson-1';
      let url = `/lessons/${lid}`;
      if (sectionId) {
        url += `#${encodeURIComponent(sectionId)}`;
      }
      return url;
    }
    case 'practice':
      return '/practice';
    case 'glossary':
      return '/glossary';
    case 'progress':
      return '/progress';
    case 'play':
      return '/play';
    default:
      return '/';
  }
}

/**
 * Returns formatted page title for browser tabs and history.
 */
export function getRouteTitle(state: RouteState): string {
  switch (state.view) {
    case 'home':
      return 'Cognitia — Intelligent Systems Platform';
    case 'lesson':
      if (state.lessonId === 'lesson-1') {
        return 'Lesson 1: Introduction to AI & Rational Agents — Cognitia';
      }
      if (state.lessonId === 'lesson-2') {
        return 'Lesson 2: Intelligent Agents & Problem Formulation — Cognitia';
      }
      if (state.lessonId === 'lesson-3') {
        return 'Lesson 3: Informed Search & Heuristic Evaluation — Cognitia';
      }
      return 'Lesson — Cognitia';
    case 'practice':
      return 'Practice & Examination Simulator — Cognitia';
    case 'glossary':
      return 'AI Glossary & Formal Taxonomy — Cognitia';
    case 'progress':
      return 'Academic Progress & Study Mastery — Cognitia';
    case 'play':
      return 'Cognitia Chase: Maze Agents — Learn & Play';
    default:
      return 'Cognitia — Intelligent Systems Platform';
  }
}
