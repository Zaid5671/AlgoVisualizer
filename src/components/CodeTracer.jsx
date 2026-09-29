import { useEffect, useRef } from 'react';

// Pseudocode panel: the line the current step comes from is highlighted and kept in view.
export function CodeTracer({ activeAlgorithm, snapshot }) {
  const activeRef = useRef(null);
  const pseudocode = activeAlgorithm?.pseudocode;
  const activeLine = snapshot?.activeLine ?? -1;

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [activeLine]);

  return (
    <div className="code-tracer">
      <div className="code-tracer__header">
        <span className="eyebrow">Pseudocode</span>
        <h3>{activeAlgorithm.name}</h3>
      </div>
      <p className="code-tracer__step">{snapshot?.message || 'Press play to start.'}</p>
      {pseudocode ? (
        <>
          <ol className="code-tracer__lines">
            {pseudocode.split('\n').map((line, index) => (
              <li
                key={index}
                ref={index === activeLine ? activeRef : null}
                className={index === activeLine ? 'is-active' : ''}
                aria-current={index === activeLine ? 'step' : undefined}
              >
                <span className="code-tracer__num">{index + 1}</span>
                <span className="code-tracer__code">{line}</span>
              </li>
            ))}
          </ol>
          <p className="code-tracer__note">The highlighted line is the one the current step comes from.</p>
        </>
      ) : (
        <p className="code-tracer__step">No pseudocode is available for this algorithm yet.</p>
      )}
    </div>
  );
}
