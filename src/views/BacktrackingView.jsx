import { useState, useMemo, useEffect } from 'react';
import { PlaybackControls } from '../components/PlaybackControls';
import { usePlayback } from '../engine/usePlayback';
import { StepTypes } from '../engine/stepTypes';
import { ChatbotWidget } from '../components/ChatbotWidget';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Legend } from '../components/ui/Legend';
import { OperationsLog } from '../components/OperationsLog';
import { GraphCanvas } from '../components/graph/GraphCanvas';
import { QueensBoard, SudokuBoard } from '../components/backtracking/Boards';
import { COLOURING_COLORS } from '../components/backtracking/colors';
import { BacktrackingKey } from '../components/backtracking/BacktrackingKey';
import { BacktrackingPractice } from '../components/practice/BacktrackingPractice';
import { BACKTRACKING_PUZZLES } from '../data/backtrackingPuzzles';
import { PRESET_GRAPHS } from '../data/presetGraphs';

const MODES = [
  { value: 'watch', label: 'watch' },
  { value: 'practice', label: 'practice it yourself' },
];

const COLORING_GRAPH = PRESET_GRAPHS[8];
const SUDOKU_TOTAL_BLANKS = BACKTRACKING_PUZZLES.sudokuFillSequence.length;

// Board with only `blanks` empty cells: the rest of the fill sequence is pre-filled from the solution.
const sudokuWithBlanks = (blanks) => {
  const board = BACKTRACKING_PUZZLES.sudoku.map(row => [...row]);
  for (let i = 0; i < SUDOKU_TOTAL_BLANKS - blanks; i++) {
    const { r, c } = BACKTRACKING_PUZZLES.sudokuFillSequence[i];
    board[r][c] = BACKTRACKING_PUZZLES.sudokuSolved[r][c];
  }
  return board;
};

const STEP_LEGEND = [
  { label: 'trying', color: 'var(--yellow)' },
  { label: 'placed', color: 'var(--green)' },
  { label: 'removed (backtrack)', color: 'var(--pink)' },
];

const stepClass = (type) => (type === StepTypes.PLACE ? 'is-step-place' : type === StepTypes.REMOVE ? 'is-step-remove' : 'is-step-try');

function RangeControl({ label, value, min, max, onChange, suffix }) {
  return (
    <label className="array-size-control">
      <span className="eyebrow">{label}</span>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className="slider" style={{ width: 110 }} />
      <span className="array-size-control__value">{value}{suffix}</span>
    </label>
  );
}

export function BacktrackingView({ activeAlgorithm, onStep, initialMode = 'watch' }) {
  const algoId = activeAlgorithm.id;
  const [mode, setMode] = useState(initialMode);
  const [queensN, setQueensN] = useState(BACKTRACKING_PUZZLES.nQueens);
  const [sudokuBlanks, setSudokuBlanks] = useState(SUDOKU_TOTAL_BLANKS);
  const [colors, setColors] = useState(3);
  const [practiceQueensN, setPracticeQueensN] = useState(4);
  const [practiceBlanks, setPracticeBlanks] = useState(8);

  const inputData = useMemo(() => {
    if (algoId === 'nQueens') return { boardSize: queensN };
    if (algoId === 'sudoku') return { initialBoard: sudokuWithBlanks(sudokuBlanks) };
    return { nodes: COLORING_GRAPH.nodes, edges: COLORING_GRAPH.edges, m: colors };
  }, [algoId, queensN, sudokuBlanks, colors]);

  const playback = usePlayback(activeAlgorithm.generator, inputData);
  const { snapshot, snapshots, currentIndex } = playback.state;

  useEffect(() => {
    if (snapshot && typeof onStep === 'function') onStep(snapshot);
  }, [snapshot, onStep]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'practice') playback.actions.pause();
  };

  // Snapshots from the previous algorithm can linger for one render while the new ones generate.
  const stale = !snapshot
    || (algoId === 'nQueens' && snapshot.board?.length !== queensN)
    || (algoId === 'sudoku' && snapshot.board?.length !== 9)
    || (algoId === 'graphColoring' && !snapshot.colors);

  let placements = 0;
  let backtracks = 0;
  for (let i = 0; i <= currentIndex; i++) {
    if (snapshots[i]?.type === StepTypes.PLACE) placements++;
    if (snapshots[i]?.type === StepTypes.REMOVE) backtracks++;
  }

  const renderWatchBoard = () => {
    if (stale) return <div className="stage-placeholder">Preparing the board…</div>;
    const active = snapshot.activeCells || [];
    const isActive = (r, c) => active.some(a => a.r === r && a.c === c);
    const activeClass = stepClass(snapshot.type);

    if (algoId === 'nQueens') {
      return (
        <QueensBoard
          n={queensN}
          queenAt={(r, c) => snapshot.board[r][c] === 1}
          cellClass={(r, c) => (isActive(r, c) ? activeClass : '')}
        />
      );
    }
    if (algoId === 'sudoku') {
      return (
        <SudokuBoard
          valueAt={(r, c) => snapshot.board[r][c]}
          isGiven={(r, c) => inputData.initialBoard[r][c] !== 0}
          cellClass={(r, c) => [isActive(r, c) && activeClass, inputData.initialBoard[r][c] === 0 && snapshot.board[r][c] !== 0 && 'is-placed'].filter(Boolean).join(' ')}
        />
      );
    }
    return (
      <GraphCanvas
        graph={COLORING_GRAPH}
        directed={false}
        weighted={false}
        startNodeId={null}
        display={{ activeNodes: snapshot.activeNodes || [] }}
        editable={false}
        nodeFillOf={(id) => (snapshot.colors[id] !== undefined ? COLOURING_COLORS[snapshot.colors[id]] : undefined)}
      />
    );
  };

  const practiceSetup = algoId === 'nQueens'
    ? { n: practiceQueensN }
    : algoId === 'sudoku' ? { board: sudokuWithBlanks(practiceBlanks) } : { graph: COLORING_GRAPH, m: colors };
  const practiceKey = algoId === 'nQueens' ? practiceQueensN : algoId === 'sudoku' ? practiceBlanks : colors;

  const legend = algoId === 'graphColoring'
    ? [...COLOURING_COLORS.slice(0, colors).map((c, i) => ({ label: `colour ${i + 1}`, color: c })), { label: 'current node', color: 'var(--yellow)' }]
    : STEP_LEGEND;

  return (
    <>
      <div className="view-toolbar">
        <SegmentedControl options={MODES} value={mode} onChange={handleModeChange} ariaLabel="Mode" />
        <div className="view-toolbar__group">
          {algoId === 'nQueens' && mode === 'watch' && <RangeControl label="board" value={queensN} min={4} max={9} onChange={setQueensN} suffix={`×${queensN}`} />}
          {algoId === 'nQueens' && mode === 'practice' && <RangeControl label="board" value={practiceQueensN} min={4} max={6} onChange={setPracticeQueensN} suffix={`×${practiceQueensN}`} />}
          {algoId === 'sudoku' && mode === 'watch' && <RangeControl label="empty cells" value={sudokuBlanks} min={1} max={SUDOKU_TOTAL_BLANKS} onChange={setSudokuBlanks} />}
          {algoId === 'sudoku' && mode === 'practice' && <RangeControl label="empty cells" value={practiceBlanks} min={3} max={14} onChange={setPracticeBlanks} />}
          {algoId === 'graphColoring' && <RangeControl label="colours" value={colors} min={2} max={4} onChange={setColors} />}
        </div>
      </div>

      {mode === 'practice' ? (
        <BacktrackingPractice algorithm={activeAlgorithm} setup={practiceSetup} setupKey={practiceKey} onWatch={() => handleModeChange('watch')} />
      ) : (
        <section className="stage">
          <div className="stage__header">
            <span className="status-pill">{snapshot?.message || 'press play to begin'}</span>
          </div>
          <div className="board-frame">{renderWatchBoard()}</div>
          <div className="stage__footer">
            <Legend items={legend} />
          </div>
          <BacktrackingKey algoId={algoId} defaultOpen={false} />
        </section>
      )}

      {mode === 'watch' && <PlaybackControls playback={playback} activeAlgorithm={activeAlgorithm} />}

      {mode === 'watch' && (
        <OperationsLog
          snapshots={stale ? [] : snapshots}
          currentIndex={currentIndex}
          filters={['place', 'remove']}
          stats={[
            { label: 'placements', value: placements },
            { label: 'backtracks', value: backtracks, tone: 'swaps' },
          ]}
        />
      )}

      <ChatbotWidget activeAlgorithm={activeAlgorithm} snapshot={snapshot} offsetRight="2rem" />
    </>
  );
}
