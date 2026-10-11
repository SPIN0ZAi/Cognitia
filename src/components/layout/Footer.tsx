import { Compass, Code } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-sidebar)',
        padding: '3rem 1.5rem',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <div className="brand-icon" style={{ width: '26px', height: '26px' }}>
                <Compass size={15} />
              </div>
              <strong style={{ fontSize: '1.05rem', color: '#f8fafc' }}>Cognitia</strong>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '420px', lineHeight: 1.5 }}>
              Interactive Learning Platform for Intelligent Systems (Degree in Computer Science). Designed for deep conceptual understanding and rigorous academic examination preparation.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Academic Institution</span>
            <span style={{ color: 'var(--text-muted)' }}>Escuela Superior de Ingeniería Informática de Albacete</span>
            <span style={{ color: 'var(--text-muted)' }}>Universidad de Castilla-La Mancha (UCLM) · 2026/2027</span>
            <span style={{ color: 'var(--text-muted)' }}>
              Profs: M. Julia Flores · José A. Gámez · Ismael G. Varea
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Target Deployment</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a
                href="https://github.com/SPIN0ZAi/Cognitia.git"
                target="_blank"
                rel="noreferrer"
                className="btn-tactile btn-sm"
              >
                <Code size={13} />
                <span>SPIN0ZAi/Cognitia</span>
              </a>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <span>
            © Course Material: L. de la Ossa, J. Flores, J.A. Gámez, I. García Varea, J.M. Puerta. Preserved for educational fidelity.
          </span>
          <span>Deployed on Vercel · Built with React & TypeScript</span>
        </div>
      </div>
    </footer>
  );
};
