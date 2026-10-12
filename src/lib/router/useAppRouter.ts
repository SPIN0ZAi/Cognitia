/**
 * Cognitia Unified Application Router Hook
 * 
 * Manages view state synchronized with the browser HTML5 History API.
 * Intercepts and handles popstate so browser Back and Forward buttons navigate
 * seamlessly between application pages without exiting the website.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ViewType, LessonIdType, RouteState, NavigateOptions } from './types';
import { parseLocation, buildUrl, getRouteTitle } from './router';

export function useAppRouter() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [currentLessonId, setCurrentLessonId] = useState<LessonIdType>('lesson-1');
  const [currentSectionId, setCurrentSectionId] = useState<string | undefined>(undefined);
  const isInitializedRef = useRef(false);

  // Initialize router state on mount
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const initial = parseLocation();
    setCurrentView(initial.view);
    if (initial.lessonId) setCurrentLessonId(initial.lessonId);
    setCurrentSectionId(initial.sectionId);
    document.title = getRouteTitle(initial);

    // History stack protection:
    // If there is no previous session history, anchor the root state so hitting
    // the browser Back button will never leave the website.
    if (!window.history.state) {
      // 1. Prime the root anchor
      window.history.replaceState({ view: 'home', isRootAnchor: true }, '', '/');

      // 2. If user arrived on a specific sub-page directly (e.g. /play or /lessons/lesson-2),
      // push that target on top of the root anchor.
      if (initial.view !== 'home' || initial.sectionId) {
        const initialUrl = buildUrl(initial.view, initial.lessonId, initial.sectionId);
        window.history.pushState(
          {
            view: initial.view,
            lessonId: initial.lessonId,
            sectionId: initial.sectionId,
          },
          '',
          initialUrl
        );
      }
    }

    // Scroll to section if specified
    if (initial.sectionId) {
      setTimeout(() => {
        const el = document.getElementById(initial.sectionId!);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }, []);

  // Listen to browser Back and Forward navigation events
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = (e.state as RouteState | null) || parseLocation();

      // Catch the root anchor: if the user pressed Back from Home, keep them on Home safely
      if (state.isRootAnchor) {
        setCurrentView('home');
        setCurrentSectionId(undefined);
        document.title = getRouteTitle({ view: 'home' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Re-arm state so the tab stays protected inside Cognitia
        window.history.pushState({ view: 'home' }, '', '/');
        return;
      }

      setCurrentView(state.view || 'home');
      if (state.lessonId) {
        setCurrentLessonId(state.lessonId);
      }
      setCurrentSectionId(state.sectionId);
      document.title = getRouteTitle(state);

      if (state.sectionId) {
        setTimeout(() => {
          const el = document.getElementById(state.sectionId!);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Imperative navigation handler called by Sidebar, Header, Cards, Links, etc.
  const handleNavigate = useCallback(
    (
      view: string,
      lessonId?: string,
      sectionId?: string,
      options?: NavigateOptions
    ) => {
      const targetView: ViewType = (view as ViewType) || 'home';
      const targetLessonId: LessonIdType = (lessonId as LessonIdType) || 'lesson-1';
      const targetSectionId = sectionId;

      const targetUrl = buildUrl(targetView, targetLessonId, targetSectionId);
      const newState: RouteState = {
        view: targetView,
        lessonId: targetView === 'lesson' ? targetLessonId : undefined,
        sectionId: targetSectionId,
      };

      if (options?.replace) {
        window.history.replaceState(newState, '', targetUrl);
      } else {
        window.history.pushState(newState, '', targetUrl);
      }

      setCurrentView(targetView);
      if (targetView === 'lesson') {
        setCurrentLessonId(targetLessonId);
      }
      setCurrentSectionId(targetSectionId);
      document.title = getRouteTitle(newState);

      if (targetSectionId) {
        setTimeout(() => {
          const el = document.getElementById(targetSectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 80);
      } else if (options?.forceScrollTop !== false) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    []
  );

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  return {
    currentView,
    currentLessonId,
    currentSectionId,
    handleNavigate,
    goBack,
  };
}
