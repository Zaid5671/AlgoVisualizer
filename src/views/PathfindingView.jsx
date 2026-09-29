import { useState, useEffect, useMemo } from 'react';
import { BrickWall, Waves, Eraser, Flag, Target, Shuffle, Trash2, AlertTriangle } from 'lucide-react';
import { PlaybackControls } from '../components/PlaybackControls';
import { usePlayback } from '../engine/usePlayback';
import { StepTypes } from '../engine/stepTypes';
import { ChatbotWidget } from '../components/ChatbotWidget';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Legend } from '../components/ui/Legend';
import { OperationsLog } from '../components/OperationsLog';
import { PathGrid } from '../components/pathfinding/PathGrid';
import { PathfindingPractice } from '../components/practice/PathfindingPractice';
import { PRACTICE_PRESETS, defaultPresetFor } from '../practice/pathfindingPractice';

const MODES = [
  { value: 'watch', label: 'watch' },
  { value: 'practice', label: 'practice it yourself' },
];

const WEIGHTED = new Set(['dijkstra', 'astar']);
const MUD_COST = 5;
const RANDOM_WALL_DENSITY = 0.28;

const createGrid = (rows, cols) =>
  Array.from({ length: rows }, (_, row) => Array.from({ length: cols }, (_, col) => ({ row, col, isWall: false, weight: 1 })));

const defaultEndpoints = (rows, cols) => ({
  start: { row: Math.floor(rows / 2), col: Math.floor(cols * 0.15) },
  target: { row: Math.floor(rows / 2), col: Math.floor(cols * 0.85) },
});

const sameCell = (a, r, c) => a.row === r && a.col === c;

export function PathfindingView({ activeAlgorithm, onStep }) {
  const weighted = WEIGHTED.has(activeAlgorithm.id);

  const [size, setSize] = useState({ rows: 18, cols: 34 });
  const [grid, setGrid] = useState(() => createGrid(18, 34));
  const [committedGrid, setCommittedGrid] = useState(grid);
  const [{ start, target }, setEndpoints] = useState(() => defaultEndpoints(18, 34));
  const [tool, setTool] = useState('wall');
  const [paintAction, setPaintAction] = useState(null); // 'wall' | 'mud' | 'erase'

  const [mode, setMode] = useState('watch');
  const [presetId, setPresetId] = useState(() => defaultPresetFor(activeAlgorithm.id));

  // Each algorithm starts practice on the preset that shows it off best.
  const [presetAlgoId, setPresetAlgoId] = useState(activeAlgorithm.id);
  if (presetAlgoId !== activeAlgorithm.id) {
    setPresetAlgoId(activeAlgorithm.id);
    setPresetId(defaultPresetFor(activeAlgorithm.id));
  }
  // The Mud tool only exists for weighted algorithms.
  const activeTool = tool === 'mud' && !weighted ? 'wall' : tool;

  // Drawing updates `grid` live; the algorithm only re-runs when a stroke ends.
  const inputData = useMemo(() => ({ grid: committedGrid, startNode: start, endNode: target }), [committedGrid, start, target]);
  const playback = usePlayback(activeAlgorithm.generator, inputData);
  const { snapshot, snapshots, currentIndex } = playback.state;

  useEffect(() => {
    if (snapshot && typeof onStep === 'function') onStep(snapshot);
  }, [snapshot, onStep]);

  const commit = (next) => {
    setGrid(next);
    setCommittedGrid(next);
  };

  const setCell = (g, r, c, patch) => {
    const next = g.map(row => row.slice());
    next[r][c] = { ...next[r][c], ...patch };
    return next;
  };

  const paintCell = (r, c, action) => {
    if (sameCell(start, r, c) || sameCell(target, r, c)) return;
    const patch = action === 'wall' ? { isWall: true, weight: 1 } : action === 'mud' ? { isWall: false, weight: MUD_COST } : { isWall: false, weight: 1 };
    setGrid(g => setCell(g, r, c, patch));
  };

  const handlePaintStart = (r, c) => {
    if (activeTool === 'start' || activeTool === 'target') {
      if (sameCell(activeTool === 'start' ? target : start, r, c)) return;
      commit(setCell(grid, r, c, { isWall: false }));
      setEndpoints(prev => ({ ...prev, [activeTool]: { row: r, col: c } }));
      return;
    }
    const cell = grid[r][c];
    // Starting a stroke on a cell that already has this material erases instead (toggle).
    const already = (activeTool === 'wall' && cell.isWall) || (activeTool === 'mud' && cell.weight > 1);
    const action = activeTool === 'erase' || already ? 'erase' : activeTool;
    setPaintAction(action);
    paintCell(r, c, action);
  };

  const handlePaint = (r, c) => {
    if (paintAction) paintCell(r, c, paintAction);
  };

  const handlePaintEnd = () => {
    setPaintAction(null);
    setCommittedGrid(grid);
  };

  const resize = (rows, cols) => {
    setSize({ rows, cols });
    commit(createGrid(rows, cols));
    setEndpoints(defaultEndpoints(rows, cols));
  };

  const clearWalls = () => commit(createGrid(size.rows, size.cols));

  const randomWalls = () => {
    const next = createGrid(size.rows, size.cols).map(row =>
      row.map(cell => (sameCell(start, cell.row, cell.col) || sameCell(target, cell.row, cell.col) || Math.random() >= RANDOM_WALL_DENSITY
        ? cell
        : { ...cell, isWall: true })),
    );
    commit(next);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'practice') playback.actions.pause();
  };

  const tools = [
    { value: 'wall', label: <><BrickWall size={14} /> Wall</> },
    ...(weighted ? [{ value: 'mud', label: <><Waves size={14} /> Mud</> }] : []),
    { value: 'erase', label: <><Eraser size={14} /> Erase</> },
    { value: 'start', label: <><Flag size={14} /> Start</> },
    { value: 'target', label: <><Target size={14} /> Target</> },
  ];

  const legend = [
    { label: 'start', color: 'var(--pink)' },
    { label: 'target', color: 'var(--purple)' },
    { label: 'wall', color: '#2c2c2c' },
    ...(weighted ? [{ label: `mud (costs ${MUD_COST})`, color: '#a0785a' }] : []),
    { label: 'visited', color: '#9cc3e6' },
    { label: 'current', color: 'var(--yellow)' },
    { label: 'path', color: 'var(--green)' },
  ];

  // Look-ups for the current snapshot (watch mode).
  const cellSet = (list) => new Set((list || []).map(n => `${n.row},${n.col}`));
  const visited = cellSet(snapshot?.visitedNodes);
  const current = cellSet(snapshot?.currentNodes);
  const path = cellSet(snapshot?.pathNodes);
  const watchStateOf = (r, c) => {
    const k = `${r},${c}`;
    if (path.has(k)) return 'path';
    if (current.has(k)) return 'current';
    if (visited.has(k)) return 'visited';
    return '';
  };

  const noPath = snapshot?.type === StepTypes.END && !(snapshot.pathNodes?.length);
  const pathLength = snapshot?.pathNodes?.length ? snapshot.pathNodes.length - 1 : 0;

  return (
    <>
      <div className="view-toolbar">
        <SegmentedControl options={MODES} value={mode} onChange={handleModeChange} ariaLabel="Mode" />
        {mode === 'watch' ? (
          <div className="view-toolbar__group">
            <label className="array-size-control">
              <span className="eyebrow">rows</span>
              <input type="range" min="8" max="30" value={size.rows} onChange={e => resize(Number(e.target.value), size.cols)} className="slider" style={{ width: 90 }} />
              <span className="array-size-control__value">{size.rows}</span>
            </label>
            <label className="array-size-control">
              <span className="eyebrow">cols</span>
              <input type="range" min="10" max="50" value={size.cols} onChange={e => resize(size.rows, Number(e.target.value))} className="slider" style={{ width: 90 }} />
              <span className="array-size-control__value">{size.cols}</span>
            </label>
          </div>
        ) : (
          <div className="view-toolbar__group">
            <span className="eyebrow">practice grid</span>
            <select className="text-input text-input--select" value={presetId} onChange={e => setPresetId(e.target.value)} aria-label="Practice grid">
              {PRACTICE_PRESETS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
        )}
      </div>

      {mode === 'practice' ? (
        <PathfindingPractice algorithm={activeAlgorithm} presetId={presetId} onWatch={() => handleModeChange('watch')} />
      ) : (
        <section className="stage">
          <div className="stage__header">
            <SegmentedControl options={tools} value={activeTool} onChange={setTool} ariaLabel="Drawing tool" />
            <div className="view-toolbar__group">
              <button className="btn btn--sm" onClick={randomWalls}><Shuffle size={14} /> random walls</button>
              <button className="btn btn--sm" onClick={clearWalls}><Trash2 size={14} /> clear</button>
            </div>
          </div>

          <span className="status-pill">{snapshot?.message || 'press play to begin'}</span>

          <PathGrid
            grid={grid}
            start={start}
            target={target}
            stateOf={watchStateOf}
            onPaintStart={handlePaintStart}
            onPaint={handlePaint}
            onPaintEnd={handlePaintEnd}
          />

          {noPath && (
            <div className="graph-issue graph-issue--warn" role="status">
              <AlertTriangle size={15} /> No path found: the target is completely walled off.
            </div>
          )}

          <div className="stage__footer">
            <Legend items={legend} />
            <span className="stage__hint">
              {activeTool === 'start' || activeTool === 'target' ? `Click a cell to move the ${activeTool}.` : 'Click or drag across cells to draw; start on a filled cell to erase.'}
              {!weighted && committedGrid.some(row => row.some(c => c.weight > 1)) ? ` ${activeAlgorithm.name} ignores mud.` : ''}
            </span>
          </div>
        </section>
      )}

      {mode === 'watch' && <PlaybackControls playback={playback} activeAlgorithm={activeAlgorithm} />}

      {mode === 'watch' && (
        <OperationsLog
          snapshots={snapshots}
          currentIndex={currentIndex}
          stats={[
            { label: 'visited', value: snapshot?.visitedNodes?.length || 0 },
            { label: 'path length', value: pathLength, tone: 'swaps' },
          ]}
        />
      )}

      <ChatbotWidget activeAlgorithm={activeAlgorithm} snapshot={snapshot} offsetRight="2rem" />
    </>
  );
}
