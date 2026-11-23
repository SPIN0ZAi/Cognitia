/**
 * Cognitia Router Types
 */

export type ViewType = 'home' | 'lesson' | 'practice' | 'exam' | 'glossary' | 'progress' | 'play';
export type LessonIdType =
  | 'lesson-1'
  | 'lesson-2'
  | 'lesson-3'
  | 'lesson-4'
  | 'lesson-5'
  | 'lesson-6'
  | 'lesson-7'
  | 'lesson-8'
  | 'lesson-9'
  | 'lesson-10';

export interface RouteState {
  view: ViewType;
  lessonId?: LessonIdType;
  sectionId?: string;
  depth?: number;
  isRootAnchor?: boolean;
}

export interface NavigateOptions {
  replace?: boolean;
  forceScrollTop?: boolean;
}
