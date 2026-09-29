import { useState } from 'react';
import { activateOnKey } from '../../utils/keyboard';

// Above this many bars the value labels overlap, so they move to a hover tooltip.
const DENSE_THRESHOLD = 24;

/**
 * Bar chart for array values.
 *
 * stateOf(idx)  -> 'default' | 'comparing' | 'swapping' | 'pivot' | 'settled'
 * markOf(idx)   -> optional extra classes: 'selected', 'hint', 'dim', 'focus', 'target'
 * onBarClick    -> makes bars clickable
 * onSwap(i, j)  -> enables drag-a-bar-onto-another swapping
 * labelOf(idx)  -> optional small label under a bar (e.g. index)
 */
export function BarChart({ values, stateOf, markOf, onBarClick, onSwap, labelOf, height }) {
  const [draggedIdx, setDraggedIdx] = useState(null);
  const maxVal = Math.max(...values, 100);
  const isDense = values.length > DENSE_THRESHOLD;
  const interactive = Boolean(onBarClick || onSwap);

  return (
    <div
      className={`bar-chart ${isDense ? 'is-dense' : ''} ${interactive ? 'is-interactive' : ''} ${labelOf ? 'has-labels' : ''}`}
      style={height ? { height } : undefined}
    >
      {values.map((val, idx) => {
        const state = stateOf ? stateOf(idx) : 'default';
        const marks = markOf ? markOf(idx) : '';
        return (
          <div
            key={idx}
            className={`bar-slot ${marks} ${draggedIdx === idx ? 'is-dragging' : ''}`}
            title={isDense ? String(val) : undefined}
            onClick={onBarClick ? () => onBarClick(idx) : undefined}
            role={onBarClick ? 'button' : undefined}
            tabIndex={onBarClick ? 0 : undefined}
            aria-label={onBarClick ? `position ${idx}, value ${val}` : undefined}
            aria-pressed={onBarClick ? marks.includes('selected') : undefined}
            onKeyDown={onBarClick ? activateOnKey(() => onBarClick(idx)) : undefined}
            draggable={Boolean(onSwap)}
            onDragStart={onSwap ? (e) => { setDraggedIdx(idx); e.dataTransfer.effectAllowed = 'move'; } : undefined}
            onDragOver={onSwap ? (e) => e.preventDefault() : undefined}
            onDrop={onSwap ? (e) => { e.preventDefault(); if (draggedIdx !== null && draggedIdx !== idx) onSwap(draggedIdx, idx); setDraggedIdx(null); } : undefined}
            onDragEnd={onSwap ? () => setDraggedIdx(null) : undefined}
          >
            <div className={`bar bar-${state}`} style={{ height: `${(val / maxVal) * 100}%` }}>
              <span className="bar-value">{val}</span>
            </div>
            {labelOf && <span className="bar-label">{labelOf(idx)}</span>}
          </div>
        );
      })}
    </div>
  );
}
