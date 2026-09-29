import { useState } from 'react';
import { Undo2 } from 'lucide-react';
import { QueensBoard, SudokuBoard } from '../backtracking/Boards';
import { COLOURING_COLORS } from '../backtracking/colors';
import { BacktrackingKey } from '../backtracking/BacktrackingKey';
import { GraphCanvas } from '../graph/GraphCanvas';
import { PracticeShell } from './PracticeShell';
import { usePracticeSession } from '../../practice/usePracticeSession';
import { createBacktrackingEngine, queensProblem, sudokuProblem, coloringProblem, BACKTRACK } from '../../practice/backtrackingPractice';
import { nodeLabel as L } from '../../utils/nodeLabel';

const INTRO = {
  nQueens: 'Place one queen per column, left to right, so that no two queens attack each other. When a column has no safe square, backtrack.',
  sudoku: 'Fill the empty cells in reading order. When nothing fits the highlighted cell, backtrack to your previous guess.',
  graphColoring: 'Colour the nodes in order so that connected nodes never share a colour. When every colour clashes, backtrack.',
};

function buildProblem(algoId, setup) {
  if (algoId === 'nQueens') return queensProblem(setup.n);
  if (algoId === 'sudoku') return sudokuProblem(setup.board);
  return coloringProblem(setup.graph.nodes, setup.graph.edges, setup.m);
}

function BacktrackingSession({ algorithm, setup, onWatch }) {
  const algoId = algorithm.id;
  const [engine] = useState(() => createBacktrackingEngine(buildProblem(algoId, setup)));
  const session = usePracticeSession(engine);
  const { state, round, hintLevel, actions, done } = session;
  const problem = engine.problem;

  const tried = done ? [] : state.tried[state.depth] || [];
  const valid = new Set(hintLevel >= 2 && round && !round.mustBacktrack ? round.valid : []);
  const slot = round?.slot;
  const backtrackHint = hintLevel >= 2 && round?.mustBacktrack;

  const backtrackButton = round && (
    <button className={`btn ${backtrackHint ? 'is-hint' : ''}`} onClick={() => actions.choose(BACKTRACK)}>
      <Undo2 size={14} /> Backtrack
    </button>
  );

  let board = null;
  let choices = null;
  let panelItems = [];

  if (problem.kind === 'queens') {
    const n = problem.n;
    const queenAt = (r, c) => c < state.assignment.length && state.assignment[c] === r;
    const attacked = (r, c) => Boolean(problem.conflict(state.assignment.slice(0, c), c, r));
    board = (
      <QueensBoard
        n={n}
        queenAt={queenAt}
        cellClass={(r, c) => [
          c === slot && 'is-column',
          c === slot && 'is-choosable',
          c === slot && tried.includes(r) && 'is-tried',
          hintLevel >= 2 && c === slot && attacked(r, c) && 'is-attacked',
          c === slot && valid.has(r) && 'is-hint',
        ].filter(Boolean).join(' ')}
        onCellClick={round ? (r, c) => { if (c === slot) actions.choose(r); } : undefined}
      />
    );
    choices = <div className="practice-choices practice-choices--start">{backtrackButton}</div>;
    panelItems = state.assignment.map((row, col) => `col ${col} → row ${row}`);
  }

  if (problem.kind === 'sudoku') {
    const current = slot !== undefined ? problem.empties[slot] : null;
    board = (
      <SudokuBoard
        valueAt={(r, c) => problem.valueAt(state.assignment, r, c)}
        isGiven={(r, c) => problem.board[r][c] !== 0}
        cellClass={(r, c) => [
          current && current[0] === r && current[1] === c && 'is-current',
          problem.board[r][c] === 0 && problem.valueAt(state.assignment, r, c) !== 0 && 'is-placed',
        ].filter(Boolean).join(' ')}
      />
    );
    choices = round && (
      <div className="digit-pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
          <button key={d} className={`digit-pad__key ${tried.includes(d) ? 'is-tried' : ''} ${valid.has(d) ? 'is-hint' : ''}`} onClick={() => actions.choose(d)}>{d}</button>
        ))}
        {backtrackButton}
      </div>
    );
    panelItems = state.assignment.map((d, i) => `r${problem.empties[i][0]} c${problem.empties[i][1]} = ${d}`);
  }

  if (problem.kind === 'coloring') {
    const currentId = slot !== undefined ? problem.order[slot] : null;
    board = (
      <GraphCanvas
        graph={setup.graph}
        directed={false}
        weighted={false}
        startNodeId={null}
        display={{ activeNodes: currentId !== null ? [currentId] : [] }}
        editable={false}
        nodeFillOf={(id) => { const c = problem.colourOf(state.assignment, id); return c !== undefined ? COLOURING_COLORS[c] : undefined; }}
      />
    );
    choices = round && (
      <div className="practice-choices practice-choices--start">
        {Array.from({ length: problem.m }, (_, c) => (
          <button
            key={c}
            className={`btn colour-choice ${tried.includes(c) ? 'is-tried' : ''} ${valid.has(c) ? 'is-hint' : ''}`}
            onClick={() => actions.choose(c)}
          >
            <span className="colour-choice__dot" style={{ background: COLOURING_COLORS[c] }} /> colour {c + 1}
          </button>
        ))}
        {backtrackButton}
      </div>
    );
    panelItems = state.assignment.map((c, i) => `${L(problem.order[i])} → colour ${c + 1}`);
  }

  const panel = (
    <aside className="practice-panel">
      <span className="eyebrow">choices so far</span>
      <p className="practice-panel__help">Each choice you've kept, oldest first. Backtracking removes the newest one.</p>
      <div className="practice-panel__items">
        {panelItems.length === 0 ? <span className="merge-board__empty">none yet</span> : panelItems.map(t => <span key={t} className="value-chip value-chip--mono">{t}</span>)}
      </div>
      {tried.length > 0 && round && (
        <p className="practice-panel__help">
          Already tried in {problem.slotName(slot)} (dead ends): {tried.map(v => problem.valueName(v)).join(', ')}
        </p>
      )}
      <p className="practice-panel__help">Placements: {state.placements} · Backtracks: {state.backtracks}</p>
    </aside>
  );

  const summary = done ? {
    title: state.solved ? 'Solved!' : 'No solution exists',
    body: state.solved
      ? `${algorithm.name} solved with ${state.placements} placements and ${state.backtracks} backtrack${state.backtracks === 1 ? '' : 's'}.`
      : 'Every option was tried and backtracked, so this puzzle has no solution. That is a valid answer too.',
    extra: <div className="practice-summary__graph">{board}</div>,
  } : null;

  const status = round ? `${problem.slotName(slot)} · ${state.depth}/${problem.slots.length} filled` : null;

  return (
    <>
      <PracticeShell
        session={session}
        status={status}
        intro={INTRO[algoId]}
        canSkip
        footnote={round ? (problem.kind === 'queens' ? 'Click a square in the highlighted column, or Backtrack.' : 'Pick a value, or Backtrack.') : null}
        summary={summary}
        onWatch={onWatch}
      >
        <div className="practice-split">
          <div className="practice-split__main">
            {board}
            {choices}
          </div>
          {panel}
        </div>
      </PracticeShell>
      {!done && <BacktrackingKey algoId={algoId} practice />}
    </>
  );
}

export function BacktrackingPractice({ algorithm, setup, setupKey, onWatch }) {
  return <BacktrackingSession key={`${algorithm.id}:${setupKey}`} algorithm={algorithm} setup={setup} onWatch={onWatch} />;
}
