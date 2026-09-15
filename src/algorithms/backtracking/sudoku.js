import { StepTypes } from '../../engine/stepTypes';

export function generateSudokuSnapshots({ initialBoard }) {
  const snapshots = [];
  
  // Deep copy the input board
  const board = initialBoard.map(row => [...row]);
  
  const record = (type, activeCells = [], message, activeLine) => {
    snapshots.push({
      type,
      board: board.map(row => [...row]),
      activeCells, // array of {r, c} objects
      message,
      activeLine
    });
  };

  record(StepTypes.START, [], "Starting Sudoku Solver", 0);

  const isSafe = (row, col, num) => {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num) return false;
    }
    // Check col
    for (let x = 0; x < 9; x++) {
      if (board[x][col] === num) return false;
    }
    // Check 3x3 box
    const startRow = row - row % 3;
    const startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i + startRow][j + startCol] === num) return false;
      }
    }
    return true;
  };

  const solveSudokuUtil = () => {
    let row = -1;
    let col = -1;
    let isEmpty = true;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === 0) {
          row = i;
          col = j;
          isEmpty = false;
          break;
        }
      }
      if (!isEmpty) break;
    }

    if (isEmpty) return true; // No empty space left

    for (let num = 1; num <= 9; num++) {
      record(StepTypes.COMPARE, [{ r: row, c: col }], `Testing number ${num} at row ${row}, col ${col}`, 1);

      if (isSafe(row, col, num)) {
        board[row][col] = num;
        record(StepTypes.SWAP, [{ r: row, c: col }], `Valid! Placed ${num} at row ${row}, col ${col}`, 3);

        if (solveSudokuUtil()) return true;

        // Backtrack
        board[row][col] = 0;
        record(StepTypes.SWAP, [{ r: row, c: col }], `Dead end. Backtracking from row ${row}, col ${col}. Erased ${num}.`, 5);
      }
    }
    return false;
  };

  if (solveSudokuUtil()) {
    record(StepTypes.END, [], "Sudoku Solved!", -1);
  } else {
    record(StepTypes.END, [], "No solution exists for this Sudoku!", 8);
  }

  return snapshots;
}
