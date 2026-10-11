import { Search, Compass, BookOpen, Menu, Bookmark } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNavigate: (view: string, lessonId?: string, sectionId?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onNavigate }) => {
  const { progress, setActiveSearchOpen } = useStudy();

  const bookmarkCount = progress.bookmarks.length;

  return (
    <header className="site-header">
      <div className="header-brand">
        <button
          onClick={onToggleSidebar}
          className="btn-tactile btn-sm"
          style={{ display: 'none' }}
          id="mobile-menu-btn"
          aria-label="Toggle Navigation"
        >
          <Menu size={16} />
        </button>

        <div
          onClick={() => onNavigate('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
        >
          <div className="brand-icon">
            <Compass size={18} />
          </div>
          <div>
            <span className="brand-title">Cognitia</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
              Intelligent Systems
            </span>
          </div>
        </div>

        <span className="brand-meta" style={{ display: 'none' }}>
          UCLM 2026/2027
        </span>
      </div>

      <div className="header-actions">
        {/* Quick Search Trigger */}
        <button
          onClick={() => setActiveSearchOpen(true)}
          className="search-trigger-btn"
          title="Search Course Content (Ctrl + K)"
        >
          <Search size={14} />
          <span>Search topics, theorems...</span>
          <span className="kbd-shortcut">⌘K</span>
        </button>

        {/* Bookmarks Quick Link */}
        <button
          onClick={() => onNavigate('progress')}
          className="btn-tactile btn-sm"
          title="View Saved Bookmarks"
        >
          <Bookmark size={13} className={bookmarkCount > 0 ? 'text-amber-400' : ''} />
          <span>{bookmarkCount}</span>
        </button>

        {/* Resume Last Visited Study Section */}
        {progress.lastVisited && (
          <button
            onClick={() =>
              onNavigate(
                'lesson',
                progress.lastVisited?.lessonId,
                progress.lastVisited?.sectionId
              )
            }
            className="btn-tactile btn-primary btn-sm"
          >
            <BookOpen size={13} />
            <span>Resume</span>
          </button>
        )}
      </div>
    </header>
  );
};
