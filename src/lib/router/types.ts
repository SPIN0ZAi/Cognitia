/**
 * Cognitia Router Types
 */

export type ViewType = 'home' | 'lesson' | 'practice' | 'glossary' | 'progress' | 'play';
export type LessonIdType = 'lesson-1' | 'lesson-2' | 'lesson-3' | 'lesson-4';

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
