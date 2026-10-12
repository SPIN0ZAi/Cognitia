import { Search, Compass, BookOpen, Menu, Bookmark, Volume2, VolumeX, Eye, Sparkles } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { useLabTheme } from '../../context/LabThemeContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNavigate: (view: string, lessonId?: string, sectionId?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onNavigate }) => {
  const { progress, setActiveSearchOpen } = useStudy();
  const { calmMode, toggleCalmMode, audioFeedback, toggleAudioFeedback } = useLabTheme();

  const bookmarkCount = progress.bookmarks.length;

  return (
    <header className="site-header" style={{ backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--lab-border-subtle)' }}>
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
          <div className="brand-icon" style={{ background: 'linear-gradient(135deg, #10252e, #09171e)', border: '1px solid #1f6b80', color: '#78D5E8' }}>
            <Compass size={18} />
          </div>
          <div>
            <span className="brand-title" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', fontSize: '1.1rem' }}>
              Cognitia
            </span>
            <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--lab-accent-lime)', marginLeft: '0.5rem', fontWeight: 600 }}>
              LAB://2026.UCLM
            </span>
          </div>
        </div>
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

        {/* Audio Haptics Relay Switch */}
        <button
          onClick={toggleAudioFeedback}
          className={`btn-tactile btn-sm ${audioFeedback ? 'btn-primary' : ''}`}
          title={audioFeedback ? 'Mute Laboratory Audio' : 'Enable Laboratory Audio Haptics'}
          data-cursor-label="AUDIO_SWITCH"
        >
          {audioFeedback ? <Volume2 size={13} className="text-cyan-400" /> : <VolumeX size={13} />}
          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>{audioFeedback ? 'SFX ON' : 'SFX'}</span>
        </button>

        {/* Calm Mode Switch (Low-Motion & Static Background) */}
        <button
          onClick={toggleCalmMode}
          className={`btn-tactile btn-sm ${calmMode ? 'btn-amber' : ''}`}
          title={calmMode ? 'Switch to Living Lab Spectacle' : 'Switch to Calm Study Mode (Reduced Motion)'}
          data-cursor-label="CALM_MODE"
        >
          {calmMode ? <Eye size={13} className="text-amber-400" /> : <Sparkles size={13} className="text-lime-400" />}
          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>{calmMode ? 'CALM' : 'LIVING'}</span>
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
