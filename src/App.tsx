import { useState } from 'react';
import { StudyProvider } from './context/StudyContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { SearchModal } from './components/search/SearchModal';
import { CourseHomePage } from './pages/CourseHomePage';
import { Lesson1Page } from './pages/Lesson1Page';
import { Lesson2Page } from './pages/Lesson2Page';
import { Lesson3Page } from './pages/Lesson3Page';
import { PracticePage } from './pages/PracticePage';
import { GlossaryPage } from './pages/GlossaryPage';
import { ProgressPage } from './pages/ProgressPage';
import './styles/components.css';
import './styles/visualizers.css';

export function AppContent() {
  const [currentView, setCurrentView] = useState<'home' | 'lesson' | 'practice' | 'glossary' | 'progress'>('home');
  const [currentLessonId, setCurrentLessonId] = useState<'lesson-1' | 'lesson-2' | 'lesson-3'>('lesson-1');
  const [currentSectionId, setCurrentSectionId] = useState<string | undefined>(undefined);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleNavigate = (view: string, lessonId?: string, sectionId?: string) => {
    if (view === 'lesson' && lessonId) {
      setCurrentLessonId(lessonId as any);
      setCurrentSectionId(sectionId);
      setCurrentView('lesson');
    } else {
      setCurrentView(view as any);
      setCurrentSectionId(undefined);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        currentLessonId={currentLessonId}
        currentSectionId={currentSectionId}
        onNavigate={handleNavigate}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="main-content">
        <Header
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onNavigate={handleNavigate}
        />

        <main style={{ minHeight: '80vh' }}>
          {currentView === 'home' && <CourseHomePage onNavigate={handleNavigate} />}
          {currentView === 'lesson' && currentLessonId === 'lesson-1' && (
            <Lesson1Page activeSectionId={currentSectionId} />
          )}
          {currentView === 'lesson' && currentLessonId === 'lesson-2' && (
            <Lesson2Page activeSectionId={currentSectionId} />
          )}
          {currentView === 'lesson' && currentLessonId === 'lesson-3' && (
            <Lesson3Page activeSectionId={currentSectionId} />
          )}
          {currentView === 'practice' && <PracticePage onNavigate={handleNavigate} />}
          {currentView === 'glossary' && <GlossaryPage onNavigate={handleNavigate} />}
          {currentView === 'progress' && <ProgressPage onNavigate={handleNavigate} />}
        </main>

        <Footer />
      </div>

      {/* Global Search Modal */}
      <SearchModal onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <StudyProvider>
      <AppContent />
    </StudyProvider>
  );
}
