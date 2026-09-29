// Color key for a visualization. Each item: { label, color } where color is any CSS color.
export function Legend({ items }) {
  return (
    <div className="legend">
      {items.map(item => (
        <span key={item.label} className="legend-item">
          <span className="dot" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
