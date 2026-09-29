// Stepper engine for grid pathfinding practice (see usePracticeSession).
//
// Search phase: "which cell does the algorithm expand next?" Any cell that ties for the
// algorithm's priority is accepted, and the run continues from the learner's choice.
// Trace phase (BFS / Dijkstra / A*): click back from the target to the start along a
// shortest path. DFS and Greedy just reveal their path, since it comes from parent links
// the learner can't see.
//
// Rules mirror src/algorithms/pathfinding: 4-neighbourhood in the order up, down, left,
// right; mud costs 5 only for Dijkstra and A*; A* and Greedy use Manhattan distance.

export const key = (r, c) => `${r},${c}`;
export const parseKey = (k) => k.split(',').map(Number);
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const MUD_COST = 5;

const WEIGHTED = new Set(['dijkstra', 'astar']);
const TRACEABLE = new Set(['bfs', 'dijkstra', 'astar']);

// ---------------------------------------------------------------------------
// Preset grids: '.' open, '#' wall, '~' mud, 'S' start, 'T' target
// ---------------------------------------------------------------------------
export const PRACTICE_PRESETS = [
  {
    id: 'gap',
    label: 'Wall with a gap',
    rows: [
      '.........',
      '....#....',
      '.S..#..T.',
      '....#....',
      '.........',
    ],
  },
  {
    id: 'corridors',
    label: 'Corridors',
    rows: [
      'S...#.....',
      '.##.#.###.',
      '.#..#...#.',
      '.#.####.#.',
      '.#......#T',
      '...####...',
    ],
  },
  {
    id: 'mud',
    label: 'Mud patch',
    rows: [
      '.........',
      '..~~~~...',
      'S.~~~~..T',
      '..~~~~...',
      '.........',
    ],
  },
  {
    id: 'trap',
    label: 'U-shaped trap',
    rows: [
      '..........',
      '..#####...',
      '......#...',
      '.S....#.T.',
      '......#...',
      '..#####...',
    ],
  },
];

const DEFAULT_PRESET = { bfs: 'corridors', dfs: 'gap', dijkstra: 'mud', astar: 'mud', greedyBFS: 'trap' };
export const defaultPresetFor = (algoId) => DEFAULT_PRESET[algoId] || 'gap';

export function parsePreset(preset) {
  let start = null;
  let target = null;
  const grid = preset.rows.map((line, row) =>
    [...line].map((ch, col) => {
      if (ch === 'S') start = { row, col };
      if (ch === 'T') target = { row, col };
      return { row, col, isWall: ch === '#', weight: ch === '~' ? MUD_COST : 1 };
    }),
  );
  return { grid, start, target };
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------
export function createPathfindingEngine(algoId, { grid, start, target }) {
  const rows = grid.length;
  const cols = grid[0].length;
  const weighted = WEIGHTED.has(algoId);
  const traceable = TRACEABLE.has(algoId);
  const startKey = key(start.row, start.col);
  const targetKey = key(target.row, target.col);

  const cost = (k) => {
    const [r, c] = parseKey(k);
    return weighted ? grid[r][c].weight : 1;
  };
  const h = (k) => {
    const [r, c] = parseKey(k);
    return Math.abs(r - target.row) + Math.abs(c - target.col);
  };
  const neighbours = (k) => {
    const [r, c] = parseKey(k);
    return DIRS
      .map(([dr, dc]) => [r + dr, c + dc])
      .filter(([nr, nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols && !grid[nr][nc].isWall)
      .map(([nr, nc]) => key(nr, nc));
  };

  const priority = (cell) => {
    if (algoId === 'bfs') return cell.depth;
    if (algoId === 'dijkstra') return cell.g;
    if (algoId === 'astar') return cell.g + cell.h;
    return cell.h; // greedyBFS
  };

  const frontierKeys = (state) => Object.keys(state.cells).filter(k => state.cells[k].status === 'frontier');

  // DFS: unvisited open neighbours of the cell on top of the path.
  const dfsCandidates = (state) => {
    const top = state.path[state.path.length - 1];
    return top ? neighbours(top).filter(n => state.cells[n]?.status !== 'visited') : [];
  };

  const searchValid = (state) => {
    if (algoId === 'dfs') return dfsCandidates(state);
    const frontier = frontierKeys(state);
    if (frontier.length === 0) return [];
    const best = Math.min(...frontier.map(k => priority(state.cells[k])));
    return frontier.filter(k => priority(state.cells[k]) === best);
  };

  const traceValid = (state) => {
    const head = state.trace[state.trace.length - 1];
    const headCell = state.cells[head];
    return neighbours(head).filter(n => {
      const cell = state.cells[n];
      if (!cell || cell.status !== 'visited') return false;
      return algoId === 'bfs' ? cell.depth === headCell.depth - 1 : cell.g + cost(head) === headCell.g;
    });
  };

  const followParents = (state, from) => {
    const path = [];
    for (let k = from; k !== null && k !== undefined; k = state.cells[k].parent) path.unshift(k);
    return path;
  };

  const finish = (state, found) => ({
    ...state,
    phase: 'done',
    found,
    finalPath: found ? followParents(state, targetKey) : [],
  });

  const expand = (prev, k) => {
    const state = { ...prev, cells: { ...prev.cells }, expanded: [...prev.expanded, k], path: [...prev.path] };
    let counter = prev.counter;

    if (!state.cells[k]) {
      // Only DFS expands cells it hasn't recorded yet (its "frontier" is computed on the fly).
      const parent = state.path[state.path.length - 1] ?? null;
      state.cells[k] = { depth: parent ? state.cells[parent].depth + 1 : 0, g: 0, h: h(k), parent, order: counter++ };
    }
    state.cells[k] = { ...state.cells[k], status: 'visited' };

    if (k === targetKey) {
      state.counter = counter;
      return traceable ? { ...state, phase: 'trace', trace: [targetKey] } : finish(state, true);
    }

    const cell = state.cells[k];
    for (const n of neighbours(k)) {
      const existing = state.cells[n];
      if (existing?.status === 'visited') continue;
      if (algoId === 'dfs') continue;
      if (weighted) {
        const g = cell.g + cost(n);
        if (!existing || g < existing.g) {
          state.cells[n] = { depth: cell.depth + 1, g, h: h(n), parent: k, order: existing?.order ?? counter++, status: 'frontier' };
        }
      } else if (!existing) {
        state.cells[n] = { depth: cell.depth + 1, g: cell.depth + 1, h: h(n), parent: k, order: counter++, status: 'frontier' };
      }
    }
    state.counter = counter;

    if (algoId === 'dfs') {
      state.path.push(k);
      // Back up past dead ends so the top of the path always has somewhere to go.
      while (state.path.length && dfsCandidates(state).length === 0) state.path.pop();
      return state.path.length ? state : finish(state, false);
    }
    return frontierKeys(state).length ? state : finish(state, false);
  };

  const applyRaw = (state, answer) => {
    if (state.phase === 'search') return expand(state, answer);
    if (state.phase === 'trace') {
      const trace = [...state.trace, answer];
      return answer === startKey
        ? { ...state, trace, phase: 'done', found: true, finalPath: [...trace].reverse() }
        : { ...state, trace };
    }
    return state;
  };

  // The implementation's own choice: lowest priority, ties by discovery order (FIFO);
  // DFS pops the last neighbour it pushed (right, then left, down, up).
  const autoRaw = (state) => {
    if (state.phase === 'trace') return state.cells[state.trace[state.trace.length - 1]].parent;
    const valid = searchValid(state);
    if (algoId === 'dfs') return valid[valid.length - 1];
    return valid.reduce((a, b) => (state.cells[a].order <= state.cells[b].order ? a : b));
  };

  // Moves with only one possible cell are applied automatically, so every question is a real decision.
  const settle = (state) => {
    let s = state;
    while (s.phase === 'search') {
      const valid = searchValid(s);
      const onlyChoice = valid.length === 1 && (algoId === 'dfs' || frontierKeys(s).length === 1);
      if (!onlyChoice) break;
      s = expand(s, valid[0]);
    }
    return s;
  };

  const init = () => {
    const state = {
      phase: 'search',
      cells: { [startKey]: { depth: 0, g: 0, h: h(startKey), parent: null, order: 0, status: 'frontier' } },
      counter: 1,
      expanded: [],
      path: [],
      trace: [],
      found: false,
      finalPath: [],
    };
    // Expanding the start is always forced, and DFS needs it on its path before it can move.
    return settle(expand(state, startKey));
  };

  const NUDGES = {
    bfs: 'BFS expands cells in the order it discovered them: every cell at distance d before any cell at distance d + 1. Frontier cells show their distance.',
    dfs: 'DFS keeps going deeper from the most recent cell, and only backs up when that cell has no unvisited neighbours left.',
    dijkstra: 'Dijkstra always expands the frontier cell with the smallest cost so far (g). Entering mud costs 5.',
    astar: 'A* ranks frontier cells by f = g + h: the cost so far plus the estimated distance to the target. The smallest f wins.',
    greedyBFS: 'Greedy best-first only looks at h, the Manhattan distance to the target, and ignores how far it has already travelled.',
  };
  const MISTAKES = {
    bfs: 'Not yet. BFS finishes the closer layer first, so compare the distance labels.',
    dfs: 'DFS continues from the most recent cell that still has an unvisited neighbour.',
    dijkstra: 'Not the cheapest. Compare the g values on the frontier.',
    astar: 'Not the best f. Compare f = g + h on the frontier.',
    greedyBFS: 'Greedy picks the frontier cell with the smallest h.',
  };
  const VERB = { bfs: 'BFS', dfs: 'DFS', dijkstra: 'Dijkstra', astar: 'A*', greedyBFS: 'Greedy best-first' };

  const question = (state) => {
    if (state.phase === 'done') return null;

    if (state.phase === 'search') {
      const valid = searchValid(state);
      const clickable = algoId === 'dfs' ? valid : frontierKeys(state);
      return {
        kind: 'expand',
        valid,
        clickable,
        prompt: `Which cell does ${VERB[algoId]} ${algoId === 'dfs' ? 'move to' : 'expand'} next?`,
        nudge: NUDGES[algoId],
        accepts: (k) => valid.includes(k),
        mistake: (k) => (clickable.includes(k) || algoId === 'dfs' ? MISTAKES[algoId] : 'Only outlined frontier cells can be expanded next.'),
      };
    }

    const head = state.trace[state.trace.length - 1];
    const valid = traceValid(state);
    return {
      kind: 'trace',
      head,
      valid,
      clickable: neighbours(head),
      prompt: state.trace.length === 1
        ? 'Target found! Now trace the shortest path back: click the cell the path came from.'
        : 'Keep tracing back towards the start.',
      nudge: algoId === 'bfs'
        ? "Step to a neighbour whose distance is exactly one less than this cell's."
        : "Step to a visited neighbour whose g, plus the cost of entering this cell, equals this cell's g.",
      accepts: (k) => valid.includes(k),
      mistake: (k) => (neighbours(head).includes(k) ? "That neighbour isn't one step back along a shortest path." : 'Pick a neighbour of the highlighted cell.'),
    };
  };

  return {
    algoId,
    weighted,
    traceable,
    startKey,
    targetKey,
    grid,
    init,
    question,
    apply: (state, answer) => settle(applyRaw(state, answer)),
    auto: autoRaw,
    // Cells the implementation itself expands before reaching the target (for the summary).
    referenceExpansions: () => {
      let s = init();
      while (s.phase === 'search') s = settle(applyRaw(s, autoRaw(s)));
      return s.expanded.length;
    },
  };
}
