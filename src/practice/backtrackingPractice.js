// Stepper engine for backtracking practice (see usePracticeSession).
//
// All three problems share one shape: fill "slots" in a fixed order (N-Queens: columns,
// Sudoku: empty cells in reading order, colouring: nodes in list order). In the current
// slot the learner either places any value that is safe and hasn't been tried in this
// slot yet, or presses Backtrack when no such value is left. That mirrors the
// implementations in src/algorithms/backtracking, which try values in ascending order;
// the implementation's own choice (the smallest untried safe value) is always accepted.
import { nodeLabel as L } from '../utils/nodeLabel.js';

export const BACKTRACK = 'backtrack';

// ---------------------------------------------------------------------------
// Problems: slots, domain, safety check, explanation of a clash
// ---------------------------------------------------------------------------
export function queensProblem(n) {
  return {
    kind: 'queens',
    n,
    slots: Array.from({ length: n }, (_, col) => col),
    domain: () => Array.from({ length: n }, (_, row) => row),
    // assignment[col] = row of the queen in that column
    conflict: (assignment, col, row) => {
      for (let c = 0; c < assignment.length; c++) {
        const r = assignment[c];
        if (r === row) return `Row ${row} already has a queen (column ${c}).`;
        if (Math.abs(r - row) === Math.abs(c - col)) return `The queen at row ${r}, column ${c} attacks this square diagonally.`;
      }
      return null;
    },
    slotName: (col) => `column ${col}`,
    placePrompt: (col) => `Place a queen in column ${col}: click a safe square.`,
    valueName: (row) => `row ${row}`,
  };
}

export function sudokuProblem(board) {
  const empties = [];
  board.forEach((row, r) => row.forEach((v, c) => { if (v === 0) empties.push([r, c]); }));
  const valueAt = (assignment, r, c) => {
    if (board[r][c] !== 0) return board[r][c];
    const i = empties.findIndex(([er, ec]) => er === r && ec === c);
    return i < assignment.length ? assignment[i] : 0;
  };
  return {
    kind: 'sudoku',
    board,
    empties,
    slots: empties.map((_, i) => i),
    domain: () => [1, 2, 3, 4, 5, 6, 7, 8, 9],
    valueAt,
    conflict: (assignment, slot, digit) => {
      const [row, col] = empties[slot];
      for (let x = 0; x < 9; x++) if (x !== col && valueAt(assignment, row, x) === digit) return `Row ${row} already has a ${digit}.`;
      for (let x = 0; x < 9; x++) if (x !== row && valueAt(assignment, x, col) === digit) return `Column ${col} already has a ${digit}.`;
      const br = row - (row % 3);
      const bc = col - (col % 3);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
        const r = br + i;
        const c = bc + j;
        if ((r !== row || c !== col) && valueAt(assignment, r, c) === digit) return `This 3×3 box already has a ${digit}.`;
      }
      return null;
    },
    slotName: (slot) => `row ${empties[slot][0]}, column ${empties[slot][1]}`,
    placePrompt: (slot) => `Fill the highlighted cell (row ${empties[slot][0]}, column ${empties[slot][1]}) with a digit that fits.`,
    valueName: (d) => String(d),
  };
}

export function coloringProblem(nodes, edges, m) {
  const order = nodes.map(n => n.id);
  const neighbours = (id) => edges.filter(e => e.source === id || e.target === id).map(e => (e.source === id ? e.target : e.source));
  return {
    kind: 'coloring',
    m,
    order,
    slots: order.map((_, i) => i),
    domain: () => Array.from({ length: m }, (_, c) => c),
    colourOf: (assignment, id) => { const i = order.indexOf(id); return i < assignment.length ? assignment[i] : undefined; },
    conflict: (assignment, slot, colour) => {
      const id = order[slot];
      const clash = neighbours(id).find(nb => { const i = order.indexOf(nb); return i < assignment.length && assignment[i] === colour; });
      return clash !== undefined ? `Neighbour ${L(clash)} already has colour ${colour + 1}. Connected nodes must differ.` : null;
    },
    slotName: (slot) => `node ${L(order[slot])}`,
    placePrompt: (slot) => `Colour node ${L(order[slot])} (yellow ring) with a colour none of its neighbours use.`,
    valueName: (c) => `colour ${c + 1}`,
  };
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------
export function createBacktrackingEngine(problem) {
  const total = problem.slots.length;

  // Safe values not yet tried in the current slot, in the implementation's order.
  const options = (s) => problem.domain().filter(v => !s.tried[s.depth].includes(v) && !problem.conflict(s.assignment, problem.slots[s.depth], v));

  const NUDGE = {
    queens: 'Try each row of this column from the top. A square is safe when no queen already on the board shares its row or a diagonal. If no row is safe, the queen in the previous column has to move: backtrack.',
    sudoku: "The highlighted cell needs a digit that isn't already in its row, its column or its 3×3 box. If none of the digits you haven't tried here fit, an earlier guess was wrong: backtrack.",
    coloring: "Give this node a colour that none of its already-coloured neighbours use. If every colour you haven't tried clashes, an earlier choice was wrong: backtrack.",
  };

  return {
    problem,
    init: () => ({ depth: 0, assignment: [], tried: [[]], backtracks: 0, placements: 0, finished: total === 0, solved: total === 0 }),
    question: (s) => {
      if (s.finished) return null;
      const slot = problem.slots[s.depth];
      const safe = options(s);
      const mustBacktrack = safe.length === 0;
      return {
        kind: 'place',
        slot,
        valid: mustBacktrack ? [BACKTRACK] : safe,
        mustBacktrack,
        prompt: mustBacktrack
          ? `Nothing fits in ${problem.slotName(slot)} any more. What now?`
          : problem.placePrompt(slot),
        nudge: NUDGE[problem.kind],
        accepts: (a) => (mustBacktrack ? a === BACKTRACK : safe.includes(a)),
        mistake: (a) => {
          if (a === BACKTRACK) return `Not yet: there is still a safe option in ${problem.slotName(slot)}. Only backtrack when nothing fits.`;
          if (s.tried[s.depth].includes(a)) return `You already tried ${problem.valueName(a)} here and it led to a dead end.`;
          return problem.conflict(s.assignment, slot, a) || 'That move isn\'t allowed here.';
        },
      };
    },
    apply: (s, a) => {
      if (a === BACKTRACK) {
        if (s.depth === 0) return { ...s, finished: true, solved: false };
        const depth = s.depth - 1;
        return {
          ...s,
          depth,
          assignment: s.assignment.slice(0, depth),
          tried: s.tried.slice(0, depth + 1),
          backtracks: s.backtracks + 1,
          lastRemoved: problem.slots[depth],
        };
      }
      const tried = s.tried.map((t, i) => (i === s.depth ? [...t, a] : t));
      const assignment = [...s.assignment, a];
      const depth = s.depth + 1;
      const solved = depth === total;
      return { ...s, depth, assignment, tried: solved ? tried : [...tried, []], placements: s.placements + 1, finished: solved, solved, lastRemoved: null };
    },
    auto: (s) => { const o = options(s); return o.length ? o[0] : BACKTRACK; },
  };
}
