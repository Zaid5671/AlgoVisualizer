// Pill-shaped single-choice toggle, e.g. watch / practice or playback speed.
export function SegmentedControl({ options, value, onChange, variant, ariaLabel }) {
  return (
    <div className={`segmented ${variant ? `segmented--${variant}` : ''}`} role="group" aria-label={ariaLabel}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={value === opt.value ? 'active' : ''}
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
