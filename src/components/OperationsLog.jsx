import { useEffect, useRef, useState } from 'react';

const LOG_LIMIT = 200;

// Scrollable history of step messages up to the current playback position.
// `filters` is an optional list of step types (e.g. ['compare', 'swap']) offered as chips,
// `stats` an optional list of { label, value, tone } shown in the header.
export function OperationsLog({ snapshots, currentIndex, filters, stats, placeholder = 'press play to begin observation', children }) {
  const [filter, setFilter] = useState('all');
  const listRef = useRef(null);

  // Keep the newest entry in view (scrolls the log box only, not the page).
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [currentIndex, filter]);

  const entries = (snapshots || [])
    .slice(0, currentIndex + 1)
    .map((s, step) => ({ step, type: s.type, message: s.message }))
    .filter(entry => entry.message && (filter === 'all' || entry.type === filter))
    .slice(-LOG_LIMIT);

  return (
    <section className="operations-log">
      <div className="log-header">
        <span className="log-header__title">Operations log</span>
        {(stats || filters) && (
          <div className="log-header__tools">
            {stats && (
              <div className="log-stats">
                {stats.map(s => (
                  <span key={s.label} className={s.tone || ''}>{s.label} {s.value}</span>
                ))}
              </div>
            )}
            {filters && (
              <div className="log-filters" role="group" aria-label="Log filter">
                {['all', ...filters].map(f => (
                  <button key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {children ?? (
        <ol className="log-list" ref={listRef}>
          {entries.length === 0 && <li className="log-entry"><span /><span /><span>{placeholder}</span></li>}
          {entries.map(entry => (
            <li key={entry.step} className={`log-entry ${entry.step === currentIndex ? 'is-current' : ''}`}>
              <span className="log-entry__step">#{entry.step}</span>
              <span className={`log-entry__type log-entry__type--${entry.type}`}>{entry.type}</span>
              <span>{entry.message}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
