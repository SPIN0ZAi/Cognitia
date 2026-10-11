import { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, BookMarked, HelpCircle } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { LESSON_1_DATA } from '../../data/lesson1Data';
import { LESSON_2_DATA } from '../../data/lesson2Data';
import { LESSON_3_DATA } from '../../data/lesson3Data';
import { GLOSSARY_DATA } from '../../data/glossaryData';
import { PRACTICE_QUESTIONS } from '../../data/practiceData';

interface SearchResult {
  id: string;
  type: 'section' | 'glossary' | 'question';
  title: string;
  snippet: string;
  lessonId?: string;
  sectionId?: string;
  slideNote?: string;
}

export const SearchModal: React.FC<{
  onNavigate: (view: string, lessonId?: string, sectionId?: string) => void;
}> = ({ onNavigate }) => {
  const { activeSearchOpen, setActiveSearchOpen } = useStudy();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Global Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setActiveSearchOpen(true);
      } else if (e.key === 'Escape' && activeSearchOpen) {
        setActiveSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSearchOpen]);

  // Focus input when opened
  useEffect(() => {
    if (activeSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [activeSearchOpen]);

  // Execute fuzzy search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const hits: SearchResult[] = [];
    const lessons = [LESSON_1_DATA, LESSON_2_DATA, LESSON_3_DATA];

    // Search Lessons & Sections
    lessons.forEach((l) => {
      l.chapters.forEach((ch) => {
        ch.sections.forEach((sec) => {
          if (
            sec.title.toLowerCase().includes(q) ||
            sec.summary.toLowerCase().includes(q) ||
            sec.content.toLowerCase().includes(q)
          ) {
            hits.push({
              id: `sec-${l.id}-${sec.id}`,
              type: 'section',
              title: `${l.title.split(':')[0]}: ${sec.title}`,
              snippet: sec.summary,
              lessonId: l.id,
              sectionId: sec.id,
              slideNote: sec.slideRef ? `Slide ${sec.slideRef.slideNumber}` : undefined,
            });
          }
        });
      });
    });

    // Search Glossary
    GLOSSARY_DATA.forEach((item) => {
      if (
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        (item.termEs && item.termEs.toLowerCase().includes(q))
      ) {
        hits.push({
          id: `glos-${item.id}`,
          type: 'glossary',
          title: `Glossary: ${item.term} (${item.termEs || ''})`,
          snippet: item.definition,
          lessonId: item.relatedLessonId,
          sectionId: item.relatedSectionId,
          slideNote: item.slideRef ? `Slide ${item.slideRef.slideNumber}` : undefined,
        });
      }
    });

    // Search Practice Questions
    PRACTICE_QUESTIONS.forEach((qItem) => {
      if (
        qItem.question.toLowerCase().includes(q) ||
        qItem.explanation.toLowerCase().includes(q)
      ) {
        hits.push({
          id: `q-${qItem.id}`,
          type: 'question',
          title: `Practice Exam Question (${qItem.difficulty})`,
          snippet: qItem.question,
          slideNote: qItem.slideRef ? `Slide ${qItem.slideRef.slideNumber}` : undefined,
        });
      }
    });

    setResults(hits.slice(0, 15));
  }, [query]);

  if (!activeSearchOpen) return null;

  const handleSelect = (r: SearchResult) => {
    setActiveSearchOpen(false);
    if (r.type === 'section' && r.lessonId && r.sectionId) {
      onNavigate('lesson', r.lessonId, r.sectionId);
    } else if (r.type === 'glossary') {
      onNavigate('glossary');
    } else if (r.type === 'question') {
      onNavigate('practice');
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setActiveSearchOpen(false)}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <Search size={18} className="text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search definitions, theorems, formulas, algorithms (e.g. A*, Manhattan, PEAS)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={() => setActiveSearchOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="search-results-list">
          {query.trim() && results.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No matches found for "{query}".
            </div>
          ) : results.length > 0 ? (
            results.map((r) => (
              <div
                key={r.id}
                onClick={() => handleSelect(r)}
                className="search-result-item"
              >
                <div className="search-result-header">
                  <span className="search-result-title">
                    {r.type === 'section' ? (
                      <BookOpen size={13} style={{ display: 'inline', marginRight: '6px' }} />
                    ) : r.type === 'glossary' ? (
                      <BookMarked size={13} style={{ display: 'inline', marginRight: '6px' }} />
                    ) : (
                      <HelpCircle size={13} style={{ display: 'inline', marginRight: '6px' }} />
                    )}
                    {r.title}
                  </span>
                  {r.slideNote && <span className="slide-citation">{r.slideNote}</span>}
                </div>
                <div className="search-result-snippet">{r.snippet}</div>
              </div>
            ))
          ) : (
            <div style={{ padding: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <strong>Popular topics:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                {['A* search', 'Admissibility', 'Consistency', 'BFS vs UCS', '8-Puzzle', 'PEAS taxi', 'Turing test', 'NIST AI RMF'].map(
                  (term) => (
                    <span
                      key={term}
                      onClick={() => setQuery(term)}
                      className="badge badge-cyan"
                      style={{ cursor: 'pointer' }}
                    >
                      {term}
                    </span>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
