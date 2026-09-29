import { Modal } from './ui/Modal';

// Growth curves, drawn roughly to shape (not to scale) so the classes can be compared at a glance.
const CURVES = [
  { label: 'O(1)', d: 'M 40 300 L 470 300', textX: 478, textY: 304, align: 'start' },
  { label: 'O(log n)', d: 'M 40 310 Q 170 225 470 205', textX: 478, textY: 209, align: 'start' },
  { label: 'O(n)', d: 'M 40 310 L 470 90', textX: 478, textY: 94, align: 'start' },
  { label: 'O(n log n)', d: 'M 40 310 Q 300 180 320 30', textX: 320, textY: 20, align: 'middle' },
  { label: 'O(n²)', d: 'M 40 310 Q 270 310 230 30', textX: 230, textY: 20, align: 'middle' },
  { label: 'O(2ⁿ)', d: 'M 40 310 Q 170 310 140 30', textX: 140, textY: 20, align: 'middle' },
];

const MEANING = {
  'O(1)': 'The work stays the same no matter how big the input is.',
  'O(log n)': 'The work grows very slowly: doubling the input adds only one more step.',
  'O(n)': 'The work grows in step with the input: twice the input, twice the work.',
  'O(n log n)': 'A little more than linear. This is as fast as sorting by comparing values can be.',
  'O(n²)': 'Twice the input means about four times the work. Fine for small inputs, slow for large ones.',
  'O(2ⁿ)': 'The work explodes as the input grows. Only practical for small inputs.',
};

const normalise = (s) => s.toLowerCase().replace(/\s/g, '').replace('ⁿ', '^n');

// Which curve a complexity string such as "O(n log n)" or "O(V + E)" belongs to.
const curveFor = (complexity) => {
  const c = complexity.toLowerCase().replace(/\s/g, '');
  if (c === 'o(1)') return 'O(1)';
  if (c.includes('^') || c.includes('!')) return 'O(2ⁿ)';
  if (c.includes('²') || c.includes('*')) return 'O(n²)';
  if (c.includes('log')) return /[nev].*log/.test(c) ? 'O(n log n)' : 'O(log n)';
  return 'O(n)';
};

export function ComplexityModal({ isOpen, onClose, type, complexity, description }) {
  if (!isOpen) return null;
  const active = curveFor(complexity);

  return (
    <Modal title={`${type}: ${complexity}`} onClose={onClose} width={640}>
      <div className="cx-modal">
        <figure className="cx-chart">
          <svg viewBox="0 0 560 340" role="img" aria-label={`Growth curves; ${active} is highlighted`}>
            <line x1="40" y1="310" x2="470" y2="310" className="cx-axis" />
            <line x1="40" y1="20" x2="40" y2="310" className="cx-axis" />
            <text x="255" y="332" className="cx-axis-label" textAnchor="middle">input size (n) →</text>
            <text x="22" y="165" className="cx-axis-label" textAnchor="middle" transform="rotate(-90 22 165)">work done →</text>
            {CURVES.map(curve => {
              const isActive = curve.label === active;
              return (
                <g key={curve.label} className={isActive ? 'is-active' : ''}>
                  <path key={isActive ? complexity : 'static'} d={curve.d} className="cx-curve" />
                  <text x={curve.textX} y={curve.textY} textAnchor={curve.align} className="cx-curve-label">{curve.label}</text>
                </g>
              );
            })}
          </svg>
          <figcaption>
            <strong>{active}</strong>: {MEANING[active]}
            {normalise(active) !== normalise(complexity) && ` ${complexity} is shown on the closest standard curve.`}
          </figcaption>
        </figure>
        <p className="cx-modal__desc">{description || 'No explanation is available for this algorithm yet.'}</p>
      </div>
    </Modal>
  );
}
