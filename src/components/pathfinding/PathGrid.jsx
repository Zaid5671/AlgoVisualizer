import { useRef, useState } from 'react';

/**
 * Square-cell grid for pathfinding.
 *
 * grid          rows of { row, col, isWall, weight }
 * start, target { row, col }
 * stateOf(r,c)  -> extra classes for the cell ('visited', 'current', 'path', 'frontier', 'valid', 'head', …)
 * labelOf(r,c)  -> optional small text inside the cell (e.g. g/h/f)
 * onPaintStart(r,c), onPaint(r,c), onPaintEnd()  -> drawing; works for mouse and touch
 * onCellClick(r,c) -> used instead of painting (practice mode)
 * size          'lg' uses bigger cells with room for labels
 */
export function PathGrid({ grid, start, target, stateOf, labelOf, onPaintStart, onPaint, onPaintEnd, onCellClick, size }) {
  const paintingRef = useRef(false);
  const lastRef = useRef(null);
  const cols = grid[0]?.length || 0;
  const rows = grid.length;
  // Keyboard: one tab stop for the whole grid; arrow keys move between cells, Enter or Space picks one.
  const [focus, setFocus] = useState({ r: start.row, c: start.col });
  const gridRef = useRef(null);

  const handleKeyDown = (e) => {
    const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (moves[e.key]) {
      e.preventDefault();
      const r = Math.max(0, Math.min(rows - 1, focus.r + moves[e.key][0]));
      const c = Math.max(0, Math.min(cols - 1, focus.c + moves[e.key][1]));
      setFocus({ r, c });
      gridRef.current?.querySelector(`[data-cell="${r},${c}"]`)?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCellClick(focus.r, focus.c);
    }
  };

  const cellFromPoint = (x, y) => {
    const el = document.elementFromPoint(x, y)?.closest?.('[data-cell]');
    if (!el) return null;
    const [r, c] = el.dataset.cell.split(',').map(Number);
    return { r, c };
  };

  const handlePointerDown = (e) => {
    const hit = cellFromPoint(e.clientX, e.clientY);
    if (!hit) return;
    if (onCellClick) {
      onCellClick(hit.r, hit.c);
      return;
    }
    if (!onPaintStart) return;
    e.preventDefault();
    paintingRef.current = true;
    lastRef.current = `${hit.r},${hit.c}`;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    onPaintStart(hit.r, hit.c);
  };

  const handlePointerMove = (e) => {
    if (!paintingRef.current) return;
    const hit = cellFromPoint(e.clientX, e.clientY);
    if (!hit) return;
    const k = `${hit.r},${hit.c}`;
    if (k === lastRef.current) return;
    lastRef.current = k;
    onPaint?.(hit.r, hit.c);
  };

  const stopPainting = () => {
    if (!paintingRef.current) return;
    paintingRef.current = false;
    lastRef.current = null;
    onPaintEnd?.();
  };

  return (
    <div
      ref={gridRef}
      role={onCellClick ? 'grid' : undefined}
      aria-label={onCellClick ? 'Grid: use the arrow keys to move, Enter to choose a cell' : undefined}
      onKeyDown={onCellClick ? handleKeyDown : undefined}
      className={`path-grid ${size === 'lg' ? 'path-grid--lg' : ''} ${onCellClick ? 'is-clickable' : ''}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopPainting}
      onPointerCancel={stopPainting}
    >
      {grid.flat().map(({ row, col, isWall, weight }) => {
        const isStart = row === start.row && col === start.col;
        const isTarget = row === target.row && col === target.col;
        const base = isStart ? 'is-start' : isTarget ? 'is-target' : isWall ? 'is-wall' : weight > 1 ? 'is-mud' : '';
        const extra = stateOf ? stateOf(row, col) : '';
        const label = labelOf ? labelOf(row, col) : null;
        return (
          <div
            key={`${row},${col}`}
            data-cell={`${row},${col}`}
            className={`path-cell ${base} ${extra}`}
            {...(onCellClick ? {
              role: 'gridcell',
              tabIndex: focus.r === row && focus.c === col ? 0 : -1,
              'aria-label': `row ${row}, column ${col}${isStart ? ', start' : isTarget ? ', target' : isWall ? ', wall' : ''}${extra ? `, ${extra.trim()}` : ''}${label !== null && label !== undefined ? `, ${label}` : ''}`,
              onFocus: () => setFocus({ r: row, c: col }),
            } : {})}
          >
            {isStart && <span className="path-cell__icon" aria-label="start">S</span>}
            {isTarget && <span className="path-cell__icon" aria-label="target">T</span>}
            {!isStart && !isTarget && label !== null && label !== undefined && <span className="path-cell__label">{label}</span>}
          </div>
        );
      })}
    </div>
  );
}
