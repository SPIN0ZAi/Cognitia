import React, { useState } from 'react';
import { GLOSSARY_DATA } from '../data/glossaryData';
import { Search, ArrowUpRight } from 'lucide-react';

export const GlossaryPage: React.FC<{
  onNavigate: (view: string, lessonId?: string, sectionId?: string) => void;
}> = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Foundation', 'Uninformed Search', 'Informed Search', 'Ethics & Governance'];

  const filtered = GLOSSARY_DATA.filter((item: any) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.term.toLowerCase().includes(q) ||
      (item.termEs && item.termEs.toLowerCase().includes(q)) ||
      item.definition.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-cyan font-mono">Academic Glossary</span>
          <span className="badge badge-indigo font-mono">{GLOSSARY_DATA.length} Terms</span>
          <span className="slide-citation">ESII Albacete · UCLM</span>
        </div>

        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Technical Glossary of Intelligent Systems
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Authoritative definitions, formal mathematical notations, concrete examples, and common confusions derived from the course lectures.
        </p>

        {/* Search & Category Filter */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            padding: '1.25rem',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-medium)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
            <Search size={18} className="text-cyan-400" />
            <input
              type="text"
              className="search-input"
              placeholder="Search terms, Spanish equivalents, mathematical notation..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '0.6rem 0.85rem',
                color: '#fff',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>
              Categories:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn-tactile btn-sm ${selectedCategory === cat ? 'btn-primary' : ''}`}
                style={{ fontSize: '0.75rem' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Term Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filtered.map((item: any) => (
          <article key={item.id} className="card" style={{ padding: '1.75rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.75rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                  {item.term}
                  {item.termEs && (
                    <span
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 400,
                        color: 'var(--text-muted)',
                        marginLeft: '0.5rem',
                      }}
                    >
                      ({item.termEs})
                    </span>
                  )}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-indigo font-mono">{item.category}</span>
                <span className="slide-citation">
                  {item.slideRef.lessonId.toUpperCase()} · Slide {item.slideRef.slideNumber}
                </span>
              </div>
            </div>

            {/* Formal Math Notation */}
            {item.formalNotation && (
              <div
                className="math-block"
                style={{
                  padding: '0.6rem 1rem',
                  fontSize: '0.9rem',
                  color: 'var(--text-highlight)',
                  marginBottom: '0.75rem',
                }}
              >
                {item.formalNotation}
              </div>
            )}

            {/* Definition */}
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              {item.definition}
            </p>

            {/* Example */}
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--accent-cyan)' }}>Concrete Example: </strong>
              {item.example}
            </div>

            {/* Common Confusion */}
            {item.commonConfusion && (
              <div
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(245, 158, 11, 0.08)',
                  borderLeft: '3px solid var(--accent-amber)',
                  marginBottom: '1rem',
                }}
              >
                <strong style={{ color: '#fbbf24' }}>Common Misconception: </strong>
                {item.commonConfusion}
              </div>
            )}

            {/* Deep link button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
              <button
                onClick={() => onNavigate('lesson', item.relatedLessonId, item.relatedSectionId)}
                className="btn-tactile btn-sm"
              >
                <span>Read in {item.relatedLessonId.replace('-', ' ').toUpperCase()}</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No glossary terms found matching "{query}".
          </div>
        )}
      </div>
    </div>
  );
};
