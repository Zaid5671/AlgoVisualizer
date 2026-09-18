import React from 'react';

export function AlgorithmInfo({ activeAlgorithm }) {
  if (!activeAlgorithm || !activeAlgorithm.applications) {
    return null; // Fallback if data is missing for other algorithms initially
  }

  return (
    <section className="feature-info-grid" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
      gap: '16px', 
      margin: '24px 0' 
    }}>
      <article className="feature-info-card" style={cardStyle}>
        <h3 style={headerStyle}>Description</h3>
        <p style={textStyle}>{activeAlgorithm.description}</p>
      </article>
      
      <article className="feature-info-card" style={cardStyle}>
        <h3 style={headerStyle}>Applications</h3>
        <ul style={{ ...textStyle, margin: 0, paddingLeft: '18px' }}>
          {activeAlgorithm.applications.map((app, idx) => (
            <li key={idx} style={{ marginBottom: '4px' }}>{app}</li>
          ))}
        </ul>
      </article>
      
      <article className="feature-info-card" style={cardStyle}>
        <h3 style={headerStyle}>Time complexity</h3>
        <p style={textStyle}>
          Watch a short visual explanation of {activeAlgorithm.name.toLowerCase()} and its Big O behavior.
        </p>
        <a 
          className="feature-video-link" 
          href={activeAlgorithm.video} 
          target="_blank" 
          rel="noreferrer"
          style={{
            color: 'var(--accent-pink)',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-block',
            marginTop: '8px'
          }}
          onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
          onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
        >
          Watch video
        </a>
      </article>
    </section>
  );
}

const cardStyle = {
  minHeight: '170px',
  padding: '20px',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  backgroundColor: '#fff',
  boxShadow: 'var(--ink-shadow-sm)'
};

const headerStyle = {
  margin: '0 0 10px',
  color: 'var(--text-color)',
  fontSize: '16px',
  fontWeight: '600',
  fontFamily: 'Inter, system-ui, sans-serif'
};

const textStyle = {
  color: 'var(--text-muted)',
  lineHeight: '1.55',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '0.95rem'
};
