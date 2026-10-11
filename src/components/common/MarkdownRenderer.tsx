import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#f8fafc',
                marginTop: '1.75rem',
                marginBottom: '0.85rem',
                letterSpacing: '-0.02em',
                lineHeight: 1.3,
              }}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: '#f1f5f9',
                marginTop: '1.5rem',
                marginBottom: '0.75rem',
                letterSpacing: '-0.01em',
                lineHeight: 1.35,
              }}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: '#e2e8f0',
                marginTop: '1.25rem',
                marginBottom: '0.6rem',
                lineHeight: 1.4,
              }}
            >
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4
              style={{
                fontSize: '0.98rem',
                fontWeight: 600,
                color: '#cbd5e1',
                marginTop: '1rem',
                marginBottom: '0.5rem',
              }}
            >
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p
              style={{
                fontSize: '0.92rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.75,
                marginBottom: '1rem',
              }}
            >
              {children}
            </p>
          ),
          blockquote: ({ children }) => (
            <blockquote
              style={{
                margin: '1.25rem 0',
                padding: '0.85rem 1.25rem',
                background: 'rgba(56, 189, 248, 0.06)',
                borderLeft: '3px solid var(--accent-cyan)',
                borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                fontStyle: 'normal',
                color: '#e0f2fe',
                fontSize: '0.92rem',
                lineHeight: 1.7,
              }}
            >
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul
              style={{
                paddingLeft: '1.5rem',
                marginBottom: '1.1rem',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
              }}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              style={{
                paddingLeft: '1.5rem',
                marginBottom: '1.1rem',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
              }}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li
              style={{
                marginBottom: '0.4rem',
              }}
            >
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong style={{ fontWeight: 700, color: '#f8fafc' }}>{children}</strong>
          ),
          em: ({ children }) => (
            <em style={{ fontStyle: 'italic', color: '#93c5fd' }}>{children}</em>
          ),
          code: ({ inline, className: codeClass, children, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className="font-mono"
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--accent-cyan)',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    fontSize: '0.85em',
                  }}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre
                style={{
                  background: '#090d16',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  overflowX: 'auto',
                  margin: '1.25rem 0',
                  fontSize: '0.84rem',
                  lineHeight: 1.6,
                }}
              >
                <code className={`font-mono ${codeClass || ''}`} style={{ color: '#e2e8f0' }} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          table: ({ children }) => (
            <div style={{ overflowX: 'auto', margin: '1.5rem 0' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.85rem',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-medium)' }}>
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th
              style={{
                padding: '0.65rem 0.85rem',
                textAlign: 'left',
                fontWeight: 600,
                color: '#f8fafc',
                borderRight: '1px solid var(--border-subtle)',
              }}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              style={{
                padding: '0.6rem 0.85rem',
                borderBottom: '1px solid var(--border-subtle)',
                borderRight: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              {children}
            </td>
          ),
          hr: () => (
            <hr
              style={{
                border: 'none',
                borderTop: '1px solid var(--border-subtle)',
                margin: '2rem 0',
              }}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
