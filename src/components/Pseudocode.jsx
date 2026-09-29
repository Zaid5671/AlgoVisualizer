import { Code2, X } from 'lucide-react';

export function Pseudocode({ code, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="pseudocode-modal">
      <div className="pseudocode-modal__header">
        <span className="mono-text bold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Code2 size={14} /> pseudocode
        </span>
        <button onClick={onClose} className="btn-icon" style={{ width: 28, height: 28 }} aria-label="Close pseudocode">
          <X size={14} />
        </button>
      </div>
      <pre>{code}</pre>
    </div>
  );
}
