import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ComplexityModal({ isOpen, onClose, type, complexity, description }) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowAnimation(false);
      const timer = setTimeout(() => setShowAnimation(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, complexity]);

  if (!isOpen) return null;

  const curves = [
    { label: 'O(1)', color: '#4CAF50', d: 'M 20 330 L 480 330', textX: 488, textY: 334, align: 'start' },
    { label: 'O(log n)', color: '#8BC34A', d: 'M 20 340 Q 150 250 480 230', textX: 488, textY: 234, align: 'start' },
    { label: 'O(n)', color: '#FFEB3B', d: 'M 20 340 L 480 110', textX: 488, textY: 114, align: 'start' },
    { label: 'O(n log n)', color: '#FFC107', d: 'M 20 340 Q 280 200 300 30', textX: 300, textY: 18, align: 'middle' },
    { label: 'O(n²)', color: '#FF9800', d: 'M 20 340 Q 250 340 210 30', textX: 210, textY: 18, align: 'middle' },
    { label: 'O(2^n)', color: '#F44336', d: 'M 20 340 Q 150 340 120 30', textX: 120, textY: 18, align: 'middle' },
  ];

  const isMatch = (curveLabel) => {
    const c = complexity.toLowerCase().replace(/\s/g, ''); // strip spaces and lowercase
    
    if (curveLabel === 'O(1)') {
      return c === 'o(1)';
    }
    if (curveLabel === 'O(2^n)') {
      return c.includes('^') || c.includes('!');
    }
    if (curveLabel === 'O(n²)') {
      return c.includes('²') || c.includes('*');
    }
    if (curveLabel === 'O(n log n)') {
      return c.includes('log') && (c.includes('n') || c.includes('e') || c.includes('v'));
    }
    if (curveLabel === 'O(log n)') {
      return c.includes('log') && !c.match(/[nev].*log/);
    }
    if (curveLabel === 'O(n)') {
      // Anything that is not O(1), exponential, quadratic, or logarithmic falls into Linear (O(n))
      return c !== 'o(1)' && !c.includes('^') && !c.includes('!') && !c.includes('²') && !c.includes('*') && !c.includes('log');
    }
    return false;
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: '650px', backgroundColor: 'white', border: '1px solid var(--border-color)',
          borderRadius: '16px', padding: '2rem', boxShadow: 'var(--ink-shadow-lg)',
          position: 'relative', fontFamily: 'Inter, sans-serif'
        }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <h2 style={{ margin: '0 0 1rem 0', fontWeight: 'bold' }}>
          {type.toUpperCase()} <span style={{ color: 'var(--text-muted)' }}>— {complexity}</span>
        </h2>

        <div style={{ 
          height: '360px', backgroundColor: '#f9fafb', borderRadius: '12px',
          border: '1px solid var(--border-color)', position: 'relative', marginBottom: '1.5rem',
          overflow: 'hidden'
        }}>
          <svg width="100%" height="100%" viewBox="0 0 550 360">
            {/* Grid Lines */}
            <line x1="20" y1="340" x2="480" y2="340" stroke="#ddd" strokeWidth="2" />
            <line x1="20" y1="30" x2="20" y2="340" stroke="#ddd" strokeWidth="2" />
            
            <text x="230" y="355" fontSize="12" fill="#888">Elements (n)</text>
            <text x="12" y="150" fontSize="12" fill="#888" transform="rotate(-90 12 150)">Operations (N)</text>

            {curves.map((curve, idx) => {
              const active = isMatch(curve.label);
              return (
                <g key={idx}>
                  <path 
                    d={curve.d} 
                    fill="none" 
                    stroke={active ? 'var(--accent-pink)' : curve.color} 
                    strokeWidth={active ? 5 : 2}
                    strokeDasharray="1500"
                    strokeDashoffset={showAnimation ? "0" : "1500"}
                    style={{ 
                      opacity: active ? 1 : 0.25, 
                      transition: active ? 'stroke-dashoffset 1.5s ease-out' : 'none'
                    }}
                  />
                  <text 
                    x={curve.textX} 
                    y={curve.textY} 
                    fontSize="13" 
                    fontWeight={active ? 'bold' : 'normal'} 
                    fill={active ? 'var(--accent-pink)' : '#999'}
                    textAnchor={curve.align}
                    style={{
                      opacity: active ? 1 : 0.6,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {curve.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ backgroundColor: 'var(--accent-yellow)', padding: '1rem', borderRadius: '12px' }}>
          <p style={{ margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
            {description || "Description not available for this algorithm yet."}
          </p>
        </div>

      </div>
    </div>
  );
}