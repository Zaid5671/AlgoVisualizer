import { StepTypes } from '../../engine/stepTypes';

export function generateNQueensSnapshots({ boardSize }) {
  const snapshots = [];
  const board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(0));
  
  const record = (type, activeCells = [], message, activeLine) => {
    // Deep copy board
    const currentBoard = board.map(row => [...row]);
    snapshots.push({
      type,
      board: currentBoard,
      activeCells, // array of {r, c} objects
      message,
      activeLine
    });
  };

  record(StepTypes.START, [], `Starting N-Queens Solver for ${boardSize}x${boardSize} board`, 0);

  const isSafe = (row, col) => {
    // Check this row on left side
    for (let i = 0; i < col; i++) {
      if (board[row][i] === 1) return false;
    }
    // Check upper diagonal on left side
    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 1) return false;
    }
    // Check lower diagonal on left side
    for (let i = row, j = col; j >= 0 && i < boardSize; i++, j--) {
      if (board[i][j] === 1) return false;
    }
    return true;
  };

  const solveNQUtil = (col) => {
    if (col >= boardSize) return true; // All queens placed

    for (let i = 0; i < boardSize; i++) {
      record(StepTypes.COMPARE, [{ r: i, c: col }], `Checking if Queen can be placed at row ${i}, col ${col}`, 1);

      if (isSafe(i, col)) {
        // Place queen
        board[i][col] = 1;
        record(StepTypes.SWAP, [{ r: i, c: col }], `Safe! Placed Queen at row ${i}, col ${col}`, 2);

        if (solveNQUtil(col + 1)) return true;

        // Backtrack
        board[i][col] = 0;
        record(StepTypes.SWAP, [{ r: i, c: col }], `Dead end reached! Backtracking. Removed Queen from row ${i}, col ${col}`, 6);
      } else {
        record(StepTypes.COMPARE, [{ r: i, c: col }], `Collision detected at row ${i}, col ${col}.`, 1);
      }
    }
    return false;
  };

  if (solveNQUtil(0)) {
    record(StepTypes.END, [], `Successfully placed all ${boardSize} Queens!`, 4);
  } else {
    record(StepTypes.END, [], `No solution exists for ${boardSize} Queens!`, 9);
  }

  return snapshots;
}
