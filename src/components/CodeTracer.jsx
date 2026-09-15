import React from 'react';

export function CodeTracer({ activeAlgorithm, snapshot }) {
  const pseudocode = activeAlgorithm?.pseudocode;
  if (!pseudocode) return (
    <div style={{ padding: '1rem', color: '#666', fontFamily: 'monospace' }}>
      No pseudocode available for this algorithm.
    </div>
  );

  const lines = pseudocode.split('\n');
  const activeLine = snapshot?.activeLine ?? -1;

  return (
    <div style={{
      backgroundColor: 'black',
      color: 'white',
      fontFamily: 'monospace',
      padding: '1rem',
      borderRadius: '0px',
      overflowX: 'auto',
      minWidth: '250px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        borderBottom: '2px solid #333',
        paddingBottom: '0.5rem',
        marginBottom: '0.5rem',
        color: 'var(--accent-yellow)',
        fontWeight: 'bold',
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>{'<>'} {activeAlgorithm.name}</span>
        <span style={{ color: '#666', fontSize: '0.7rem' }}>
          {snapshot ? `STEP ${snapshot.currentIndex || 0}` : 'READY'}
        </span>
      </div>
      
      <div style={{ 
        color: '#aaa', 
        fontSize: '0.75rem', 
        marginBottom: '1rem', 
        minHeight: '1.2rem',
        fontStyle: 'italic' 
      }}>
        {snapshot?.message || 'Waiting to start...'}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.95rem' }}>
        {lines.map((line, index) => {
          const isActive = index === activeLine;
          return (
            <div 
              key={index}
              style={{
                display: 'flex',
                backgroundColor: isActive ? 'var(--accent-yellow)' : 'transparent',
                color: isActive ? 'black' : '#ccc',
                padding: '2px 8px',
                fontWeight: isActive ? 'bold' : 'normal',
                transition: 'all 0.1s ease',
                whiteSpace: 'pre'
              }}
            >
              <span style={{ 
                opacity: isActive ? 1 : 0.5, 
                marginRight: '1rem',
                userSelect: 'none'
              }}>
                {String(index).padStart(2, '0')}
              </span>
              <span>{line}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
