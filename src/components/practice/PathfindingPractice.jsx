import { useState } from 'react';
import { PathGrid } from '../pathfinding/PathGrid';
import { PathfindingKey } from '../pathfinding/PathfindingKey';
import { PracticeShell } from './PracticeShell';
import { usePracticeSession } from '../../practice/usePracticeSession';
import { createPathfindingEngine, parsePreset, parseKey, PRACTICE_PRESETS } from '../../practice/pathfindingPractice';

const INTRO = {
  bfs: 'Expand cells the way BFS does, layer by layer. Frontier cells are outlined and show their distance from the start.',
  dfs: 'Move the way DFS does: always deeper from the latest cell, backing up only when stuck. The stack is shown on the right.',
  dijkstra: 'Expand the cheapest frontier cell each time. Frontier cells show g, the cost so far; mud costs 5 to enter.',
  astar: 'Expand the frontier cell with the smallest f = g + h. Each frontier cell shows f, with g + h underneath.',
  greedyBFS: 'Expand the frontier cell that looks closest to the target: the smallest h. Watch where that leads.',
};

const PANEL_TITLE = { bfs: 'Queue (front → back)', dfs: 'Stack (bottom → top)', dijkstra: 'Frontier (g)', astar: 'Frontier (f = g + h)', greedyBFS: 'Frontier (h)' };
const PANEL_HELP = {
  bfs: 'Cells waiting to be expanded, in the order they were found. d = distance from S.',
  dfs: 'The current path from S. DFS moves on from the top and pops cells off when it gets stuck.',
  dijkstra: 'Every frontier cell, in the order found, with its cost so far (g). Find the smallest.',
  astar: 'Every frontier cell, in the order found, with its f = g + h. Find the smallest.',
  greedyBFS: 'Every frontier cell, in the order found, with h (distance guess to T). Find the smallest.',
};

const cellName = (k) => {
  const [r, c] = parseKey(k);
  return `r${r} c${c}`;
};

function priorityText(algoId, cell) {
  if (algoId === 'bfs') return `d ${cell.depth}`;
  if (algoId === 'dijkstra') return `g ${cell.g}`;
  if (algoId === 'astar') return `f ${cell.g + cell.h}`;
  if (algoId === 'greedyBFS') return `h ${cell.h}`;
  return null;
}

function SidePanel({ algoId, state, valid, hintLevel }) {
  const hint = hintLevel >= 2 ? new Set(valid) : new Set();
  let items;
  if (algoId === 'dfs') {
    items = state.path.map(k => ({ k, text: cellName(k) }));
  } else {
    items = Object.entries(state.cells)
      .filter(([, c]) => c.status === 'frontier')
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([k, c]) => ({ k, text: `${cellName(k)} · ${priorityText(algoId, c)}` }));
  }
  return (
    <aside className="practice-panel">
      <span className="eyebrow">{PANEL_TITLE[algoId]}</span>
      <p className="practice-panel__help">{PANEL_HELP[algoId]}</p>
      <div className="practice-panel__items">
        {items.length === 0 ? <span className="merge-board__empty">empty</span> : items.map(({ k, text }) => (
          <span key={k} className={`value-chip value-chip--mono ${hint.has(k) ? 'is-hint' : ''}`}>{text}</span>
        ))}
      </div>
      <p className="practice-panel__help">r = row, c = column, counting from 0 at the top-left.</p>
    </aside>
  );
}

function PathfindingSession({ algorithm, presetId, onWatch }) {
  const [input] = useState(() => parsePreset(PRACTICE_PRESETS.find(p => p.id === presetId)));
  const [engine] = useState(() => createPathfindingEngine(algorithm.id, input));
  const session = usePracticeSession(engine);
  const { state, round, hintLevel, actions } = session;
  const algoId = algorithm.id;

  const valid = new Set(round?.valid || []);
  const clickable = new Set(round?.clickable || []);
  const onPath = new Set(algoId === 'dfs' ? state.path : []);
  const trace = new Set(state.trace);
  const finalPath = new Set(state.finalPath);
  const current = state.expanded[state.expanded.length - 1];

  const stateOf = (r, c) => {
    const k = `${r},${c}`;
    const cell = state.cells[k];
    const classes = [];
    if (finalPath.has(k) || trace.has(k)) classes.push('path');
    else if (cell?.status === 'visited') classes.push(onPath.has(k) ? 'on-stack' : 'visited');
    else if (round?.kind === 'expand' && (cell?.status === 'frontier' || (algoId === 'dfs' && clickable.has(k)))) classes.push('frontier');
    if (round?.kind === 'trace' && k === round.head) classes.push('head');
    if (round?.kind === 'expand' && k === current) classes.push('current');
    if (round && clickable.has(k)) classes.push('choosable');
    if (hintLevel >= 2 && valid.has(k)) classes.push('hint');
    return classes.join(' ');
  };

  const labelOf = (r, c) => {
    const cell = state.cells[`${r},${c}`];
    if (!cell || algoId === 'dfs') return null;
    if (cell.status === 'frontier') {
      if (algoId === 'astar') return <><b>{cell.g + cell.h}</b><small>g{cell.g}+h{cell.h}</small></>;
      if (algoId === 'bfs') return cell.depth;
      if (algoId === 'dijkstra') return cell.g;
      return cell.h;
    }
    // Visited cells keep their final number so the path can be traced back.
    if (algoId === 'bfs') return <small>{cell.depth}</small>;
    if (algoId === 'dijkstra' || algoId === 'astar') return <small>{cell.g}</small>;
    return null;
  };

  const handleClick = (r, c) => {
    if (!round) return;
    const k = `${r},${c}`;
    actions.choose(k);
  };

  // Only built once finished: referenceExpansions() replays the whole search.
  const summary = !session.done ? null : (() => {
    if (!state.found) {
      return { title: 'No path', body: 'Every reachable cell was explored and the target was never reached, so no path exists.' };
    }
    const steps = state.finalPath.length - 1;
    const cost = engine.weighted
      ? state.finalPath.slice(1).reduce((sum, k) => { const [r, c] = parseKey(k); return sum + input.grid[r][c].weight; }, 0)
      : steps;
    const reference = engine.referenceExpansions();
    const pathText = engine.weighted ? `a path of ${steps} steps costing ${cost}` : `a path of ${steps} steps`;
    const caveat = algoId === 'dfs' || algoId === 'greedyBFS' ? ` ${algorithm.name} doesn't guarantee the shortest path, so compare it with BFS or A*.` : '';
    return {
      title: 'Target reached!',
      body: `${algorithm.name} found ${pathText} after expanding ${state.expanded.length} cells (the algorithm's own tie-breaking expands ${reference}).${caveat}`,
      extra: (
        <div className="practice-summary__grid">
          <PathGrid grid={input.grid} start={input.start} target={input.target} stateOf={stateOf} size="lg" />
        </div>
      ),
    };
  })();

  const status = !round ? null : round.kind === 'trace' ? 'trace the path' : `${state.expanded.length} expanded`;

  return (
    <>
      <PracticeShell
        session={session}
        status={status}
        intro={INTRO[algoId]}
        canSkip={round?.kind !== 'trace'}
        footnote={round ? (round.kind === 'trace' ? 'Click a neighbour of the highlighted cell.' : 'Click an outlined cell. Skip 5 lets the algorithm move for you.') : null}
        summary={summary}
        onWatch={onWatch}
      >
        <div className="practice-split">
          <PathGrid grid={input.grid} start={input.start} target={input.target} stateOf={stateOf} labelOf={labelOf} onCellClick={handleClick} size="lg" />
          {round?.kind !== 'trace' && <SidePanel algoId={algoId} state={state} valid={round?.valid || []} hintLevel={hintLevel} />}
        </div>
      </PracticeShell>
      {!session.done && <PathfindingKey algoId={algoId} practice />}
    </>
  );
}

export function PathfindingPractice({ algorithm, presetId, onWatch }) {
  return <PathfindingSession key={`${algorithm.id}:${presetId}`} algorithm={algorithm} presetId={presetId} onWatch={onWatch} />;
}
