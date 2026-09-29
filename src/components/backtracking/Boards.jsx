// Board visuals shared by watch and practice mode for backtracking problems.

/**
 * N-Queens chessboard.
 * queenAt(r, c) -> true when a queen stands there
 * cellClass(r, c) -> extra classes ('is-active', 'is-attacked', 'is-choosable', 'is-hint', 'is-column')
 */
export function QueensBoard({ n, queenAt, cellClass, onCellClick }) {
  return (
    <div className="queens-board" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      {Array.from({ length: n * n }, (_, i) => {
        const r = Math.floor(i / n);
        const c = i % n;
        return (
          <button
            key={i}
            type="button"
            className={`queens-cell ${(r + c) % 2 ? 'is-dark' : ''} ${cellClass ? cellClass(r, c) : ''}`}
            onClick={onCellClick ? () => onCellClick(r, c) : undefined}
            tabIndex={onCellClick ? 0 : -1}
            aria-label={`row ${r}, column ${c}${queenAt(r, c) ? ', queen' : ''}`}
          >
            {queenAt(r, c) && <span className="queens-cell__queen">♛</span>}
          </button>
        );
      })}
    </div>
  );
}

/**
 * 9×9 Sudoku grid.
 * valueAt(r, c) -> digit or 0; isGiven(r, c) -> part of the original puzzle
 * cellClass(r, c) -> extra classes ('is-active', 'is-current', 'is-hint', 'is-placed')
 */
export function SudokuBoard({ valueAt, isGiven, cellClass, onCellClick }) {
  return (
    <div className="sudoku-board">
      {Array.from({ length: 81 }, (_, i) => {
        const r = Math.floor(i / 9);
        const c = i % 9;
        const v = valueAt(r, c);
        const classes = [
          'sudoku-cell',
          isGiven(r, c) && 'is-given',
          c % 3 === 2 && c < 8 && 'box-right',
          r % 3 === 2 && r < 8 && 'box-bottom',
          cellClass ? cellClass(r, c) : '',
        ].filter(Boolean).join(' ');
        return (
          <div key={i} className={classes} onClick={onCellClick ? () => onCellClick(r, c) : undefined}>
            {v !== 0 ? v : ''}
          </div>
        );
      })}
    </div>
  );
}
