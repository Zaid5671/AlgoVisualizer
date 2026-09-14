import { Code2, X } from 'lucide-react';

export function Pseudocode({ code, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="pseudocode-modal" style={{
      position: 'absolute', zIndex: 50,
      bottom: '100px', left: '4rem',
      backgroundColor: 'white',
      border: '3px solid var(--border-color)',
      borderRadius: '8px',
      padding: '1rem',
      boxShadow: '4px 4px 0px var(--border-color)',
      width: '400px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px dashed var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
        <span className="mono-text bold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Code2 size={16} /> PSEUDOCODE
        </span>
        <button onClick={onClose} className="btn-icon" style={{ padding: '0.2rem' }}>
          <X size={16} />
        </button>
      </div>
      <pre style={{ 
        fontFamily: 'JetBrains Mono, monospace', 
        fontSize: '0.8rem', 
        whiteSpace: 'pre-wrap',
        color: '#444'
      }}>
        {code}
      </pre>
    </div>
  );
}
