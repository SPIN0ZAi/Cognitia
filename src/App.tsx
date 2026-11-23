import { useState } from 'react';
import { useAppRouter } from './lib/router/useAppRouter';
import { StudyProvider } from './context/StudyContext';
import { LabThemeProvider } from './context/LabThemeContext';
import { LivingFieldCanvas } from './components/common/LivingFieldCanvas';
import { MagneticCursor } from './components/common/MagneticCursor';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { SearchModal } from './components/search/SearchModal';
import { CourseHomePage } from './pages/CourseHomePage';
import { Lesson1Page } from './pages/Lesson1Page';
import { Lesson2Page } from './pages/Lesson2Page';
import { Lesson3Page } from './pages/Lesson3Page';
import { Lesson4Page } from './pages/Lesson4Page';
import { Lesson5Page } from './pages/Lesson5Page';
import { Lesson6Page } from './pages/Lesson6Page';
import { Lesson7Page } from './pages/Lesson7Page';
import { Lesson8Page } from './pages/Lesson8Page';
import { Lesson9Page } from './pages/Lesson9Page';
import { Lesson10Page } from './pages/Lesson10Page';
import { ExamPage } from './pages/ExamPage';
import { PracticePage } from './pages/PracticePage';
import { GlossaryPage } from './pages/GlossaryPage';
import { ProgressPage } from './pages/ProgressPage';
import { PlayPage } from './pages/PlayPage';
import './styles/components.css';
import './styles/visualizers.css';

export function AppContent() {
  const {
    currentView,
    currentLessonId,
    currentSectionId,
    handleNavigate,
  } = useAppRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Persistent Algorithmic Living Canvas Layer */}
      <LivingFieldCanvas />

      {/* Precision Instrument Magnetic Cursor */}
      <MagneticCursor />

      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        currentLessonId={currentLessonId}
        currentSectionId={currentSectionId}
        onNavigate={handleNavigate}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Mobile Drawer Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Container */}
      <div className="main-content">
        <Header
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onNavigate={handleNavigate}
        />

        <main style={{ minHeight: '80vh', position: 'relative', zIndex: 2 }}>
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
          {currentView === 'lesson' && currentLessonId === 'lesson-4' && (
            <Lesson4Page activeSectionId={currentSectionId} />
          )}
          {currentView === 'lesson' && currentLessonId === 'lesson-5' && (
            <Lesson5Page activeSectionId={currentSectionId} />
          )}
          {currentView === 'lesson' && currentLessonId === 'lesson-6' && (
            <Lesson6Page activeSectionId={currentSectionId} />
          )}
          {currentView === 'lesson' && currentLessonId === 'lesson-7' && (
            <Lesson7Page activeSectionId={currentSectionId} />
          )}
          {currentView === 'lesson' && currentLessonId === 'lesson-8' && (
            <Lesson8Page activeSectionId={currentSectionId} />
          )}
          {currentView === 'lesson' && currentLessonId === 'lesson-9' && (
            <Lesson9Page activeSectionId={currentSectionId} />
          )}
          {currentView === 'lesson' && currentLessonId === 'lesson-10' && (
            <Lesson10Page activeSectionId={currentSectionId} />
          )}
          {currentView === 'exam' && <ExamPage />}
          {currentView === 'practice' && <PracticePage onNavigate={handleNavigate} />}
          {currentView === 'glossary' && <GlossaryPage onNavigate={handleNavigate} />}
          {currentView === 'progress' && <ProgressPage onNavigate={handleNavigate} />}
          {currentView === 'play' && <PlayPage onNavigate={handleNavigate} />}
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
      <LabThemeProvider>
        <AppContent />
      </LabThemeProvider>
    </StudyProvider>
  );
}

