import { useState, useEffect, useMemo } from 'react';
import { MousePointer2, CirclePlus, Spline, Eraser, FileText, Shuffle, Trash2, Info, AlertTriangle, Flag, CheckCircle2 } from 'lucide-react';
import { PlaybackControls } from '../components/PlaybackControls';
import { usePlayback } from '../engine/usePlayback';
import { ChatbotWidget } from '../components/ChatbotWidget';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Legend } from '../components/ui/Legend';
import { OperationsLog } from '../components/OperationsLog';
import { GraphCanvas } from '../components/graph/GraphCanvas';
import { GraphTextEditor } from '../components/graph/GraphTextEditor';
import {
  PRESETS, randomGraph, emptyGraph, nodeLabel, algorithmTraits, effectiveDirected,
  addNode, moveNode, removeNode, addEdge, removeEdge, setEdgeWeight,
  validateGraph, structureKey, MAX_NODES,
} from '../graph/graphModel';

const MODES = [
  { value: 'watch', label: 'watch' },
  { value: 'practice', label: 'practice it yourself' },
];

const TOOLS = [
  { value: 'move', label: <><MousePointer2 size={14} /> Move</>, hint: 'Drag nodes to rearrange. Click a node or edge to inspect it.' },
  { value: 'node', label: <><CirclePlus size={14} /> Node</>, hint: 'Click empty space to add a node.' },
  { value: 'edge', label: <><Spline size={14} /> Edge</>, hint: 'Click a node, then another node, to connect them.' },
  { value: 'delete', label: <><Eraser size={14} /> Delete</>, hint: 'Click a node or edge to remove it.' },
];

const LEGEND = [
  { label: 'start', color: 'var(--pink)' },
  { label: 'current', color: 'var(--yellow)' },
  { label: 'visited', color: 'var(--blue)' },
  { label: 'tree / chosen edge', color: 'var(--ink)' },
];

const initialGraph = () => PRESETS[0].build();

function WeightInput({ edge, onCommit }) {
  const [value, setValue] = useState(String(edge.weight));
  const commit = () => {
    const n = parseInt(value, 10);
    if (Number.isNaN(n)) setValue(String(edge.weight));
    else onCommit(n);
  };
  return (
    <input
      className="text-input text-input--sm"
      value={value}
      inputMode="numeric"
      aria-label="Edge weight"
      onChange={e => setValue(e.target.value.replace(/[^\d-]/g, ''))}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
    />
  );
}

export function GraphView({ activeAlgorithm, onStep }) {
  const traits = algorithmTraits(activeAlgorithm.id);

  const [graph, setGraph] = useState(initialGraph);
  const [userDirected, setUserDirected] = useState(false);
  const [startChoice, setStartChoice] = useState(0);
  const [tool, setTool] = useState('move');
  const [selection, setSelection] = useState(null);
  const [showTextEditor, setShowTextEditor] = useState(false);

  const [mode, setMode] = useState('watch');
  const [practiceStep, setPracticeStep] = useState(0);
  const [practiceError, setPracticeError] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const directed = effectiveDirected(activeAlgorithm.id, userDirected);
  // If the chosen start node was deleted, fall back to the first remaining node.
  const startNodeId = graph.nodes.some(n => n.id === startChoice) ? startChoice : (graph.nodes[0]?.id ?? 0);

  // Restart practice when the algorithm changes (graph is kept so algorithms can be compared).
  const [practiceAlgoId, setPracticeAlgoId] = useState(activeAlgorithm.id);
  if (practiceAlgoId !== activeAlgorithm.id) {
    setPracticeAlgoId(activeAlgorithm.id);
    setPracticeStep(0);
    setPracticeError(null);
  }

  // Only structural changes rebuild the algorithm input; dragging nodes doesn't restart playback.
  const key = structureKey(graph, startNodeId, directed);
  const inputData = useMemo(() => {
    if (graph.nodes.length === 0) return null;
    return {
      nodes: graph.nodes.map(n => n.id),
      edges: graph.edges.map(e => ({ ...e, isDirected: directed })),
      startNodeId,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const playback = usePlayback(activeAlgorithm.generator, inputData);
  const { snapshot, snapshots, currentIndex } = playback.state;

  useEffect(() => {
    if (snapshot && typeof onStep === 'function') onStep(snapshot);
  }, [snapshot, onStep]);

  // Delete/Backspace removes the selection, Escape clears it.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || mode !== 'watch') return;
      if (e.key === 'Escape') setSelection(null);
      if ((e.key === 'Delete' || e.key === 'Backspace') && selection) {
        e.preventDefault();
        setGraph(g => (selection.type === 'node' ? removeNode(g, selection.id) : removeEdge(g, selection.id)));
        setSelection(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selection, mode]);

  const replaceGraph = (next) => {
    setGraph(next);
    setSelection(null);
    setPracticeStep(0);
    setPracticeError(null);
  };

  const handleCanvasChange = (action) => {
    switch (action.type) {
      case 'moveNode':
        setGraph(g => moveNode(g, action.id, action.x, action.y));
        break;
      case 'addNode':
        setGraph(g => addNode(g, action.x, action.y));
        break;
      case 'removeNode':
        setGraph(g => removeNode(g, action.id));
        setSelection(null);
        break;
      case 'addEdge': {
        const weight = traits.weighted ? Math.floor(Math.random() * 9) + 1 : 1;
        setGraph(g => addEdge(g, action.source, action.target, weight, directed));
        break;
      }
      case 'removeEdge':
        setGraph(g => removeEdge(g, action.id));
        setSelection(null);
        break;
      default:
        break;
    }
  };

  const handlePreset = (presetId) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    replaceGraph(preset.build());
    if (presetId === 'negative' || presetId === 'scc') setUserDirected(true);
    setStartChoice(0);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setSelection(null);
    setPracticeStep(0);
    setPracticeError(null);
    if (newMode === 'practice') {
      playback.actions.pause();
      setShowTutorial(true);
    } else {
      playback.actions.reset();
    }
  };

  // --- PRACTICE MODE (redesign planned; logic unchanged) ---
  const expectedClicks = useMemo(() => {
    if (!snapshots) return [];
    const sequence = [];
    const seen = new Set([startNodeId]);
    snapshots.forEach((s, i) => {
      for (const node of s.visitedNodes || []) {
        if (!seen.has(node)) {
          seen.add(node);
          sequence.push({ snapshotIndex: i, nodeId: node });
        }
      }
    });
    return sequence;
  }, [snapshots, startNodeId]);

  const isPracticeComplete = practiceStep >= expectedClicks.length;

  let practiceDisplay = null;
  if (mode === 'practice' && snapshots.length > 0) {
    if (practiceStep === 0) practiceDisplay = snapshots[0];
    else if (isPracticeComplete) practiceDisplay = snapshots[snapshots.length - 1];
    else practiceDisplay = snapshots[expectedClicks[practiceStep - 1]?.snapshotIndex || 0];
  }

  const hasGraph = graph.nodes.length > 0;
  const display = !hasGraph ? null : mode === 'watch' ? snapshot : practiceDisplay;

  const handlePracticeClick = (id) => {
    if (isPracticeComplete) return;
    if (id === expectedClicks[practiceStep].nodeId) {
      setPracticeStep(s => s + 1);
      setPracticeError(null);
    } else {
      setPracticeError(`Wrong move! ${activeAlgorithm.name} wouldn't visit node ${nodeLabel(id)} next.`);
    }
  };

  const issues = validateGraph(graph, activeAlgorithm.id, startNodeId, directed);
  const editable = mode === 'watch';
  const toolHint = TOOLS.find(t => t.value === tool)?.hint;

  const selectedNode = selection?.type === 'node' ? graph.nodes.find(n => n.id === selection.id) : null;
  const selectedEdge = selection?.type === 'edge' ? graph.edges.find(e => e.id === selection.id) : null;

  return (
    <>
      <div className="view-toolbar">
        <SegmentedControl options={MODES} value={mode} onChange={handleModeChange} ariaLabel="Mode" />
        {editable && (
          <div className="view-toolbar__group">
            <select className="text-input text-input--select" value="" onChange={e => handlePreset(e.target.value)} aria-label="Load a preset graph">
              <option value="" disabled>Load preset…</option>
              {PRESETS.map(p => <option key={p.id} value={p.id}>{p.label}{p.hint ? ` — ${p.hint}` : ''}</option>)}
            </select>
            <button className="btn btn--sm" onClick={() => replaceGraph(randomGraph())}><Shuffle size={14} /> random</button>
            <button className="btn btn--sm" onClick={() => { replaceGraph(emptyGraph()); setTool('node'); }}><Trash2 size={14} /> clear</button>
            <button className="btn btn--sm" onClick={() => setShowTextEditor(true)}><FileText size={14} /> edit as text</button>
          </div>
        )}
      </div>

      <section className="stage">
        <div className="stage__header">
          {editable ? (
            <div className="graph-tools">
              <SegmentedControl options={TOOLS} value={tool} onChange={setTool} ariaLabel="Editing tool" />
              <label className={`switch ${traits.forcedDirected !== null ? 'is-locked' : ''}`} title={traits.forcedDirected !== null ? `${activeAlgorithm.name} requires ${traits.forcedDirected ? 'a directed' : 'an undirected'} graph` : 'Treat edges as one-way'}>
                <input
                  type="checkbox"
                  checked={directed}
                  disabled={traits.forcedDirected !== null}
                  onChange={e => setUserDirected(e.target.checked)}
                />
                <span className="switch__track" />
                directed
              </label>
            </div>
          ) : (
            <span className="status-pill">
              VISIT <strong>{Math.min(practiceStep, expectedClicks.length)} / {expectedClicks.length}</strong>
              {isPracticeComplete ? <span className="tag tag--done">done</span> : <span className="tag">your turn</span>}
            </span>
          )}

          {editable && selectedNode && (
            <div className="inspector">
              <span className="inspector__title">Node {nodeLabel(selectedNode.id)}</span>
              {traits.usesStart && (
                <button className="btn btn--sm" disabled={selectedNode.id === startNodeId} onClick={() => setStartChoice(selectedNode.id)}>
                  <Flag size={13} /> {selectedNode.id === startNodeId ? 'start node' : 'set as start'}
                </button>
              )}
              <button className="btn btn--sm" onClick={() => { setGraph(g => removeNode(g, selectedNode.id)); setSelection(null); }}>
                <Trash2 size={13} /> delete
              </button>
            </div>
          )}
          {editable && selectedEdge && (
            <div className="inspector">
              <span className="inspector__title">
                Edge {nodeLabel(selectedEdge.source)}{directed ? '→' : '–'}{nodeLabel(selectedEdge.target)}
              </span>
              {traits.weighted && (
                <label className="inspector__field">
                  weight
                  <WeightInput key={selectedEdge.id} edge={selectedEdge} onCommit={w => setGraph(g => setEdgeWeight(g, selectedEdge.id, w))} />
                </label>
              )}
              <button className="btn btn--sm" onClick={() => { setGraph(g => removeEdge(g, selectedEdge.id)); setSelection(null); }}>
                <Trash2 size={13} /> delete
              </button>
            </div>
          )}
        </div>

        <GraphCanvas
          graph={graph}
          directed={directed}
          weighted={traits.weighted}
          startNodeId={traits.usesStart ? startNodeId : null}
          display={display}
          editable={editable}
          tool={tool}
          selection={selection}
          onSelect={setSelection}
          onChange={handleCanvasChange}
          onNodeActivate={handlePracticeClick}
          emptyHint={tool === 'node' ? 'Click anywhere to add a node' : 'Empty graph: pick a preset or use the Node tool'}
        />

        {editable && issues.length > 0 && (
          <ul className="graph-issues">
            {issues.map(issue => (
              <li key={issue.text} className={`graph-issue graph-issue--${issue.level}`}>
                {issue.level === 'warn' ? <AlertTriangle size={15} /> : <Info size={15} />}
                {issue.text}
              </li>
            ))}
          </ul>
        )}

        {mode === 'practice' && practiceError && (
          <div className="practice-feedback practice-feedback--error" role="alert">
            <Info size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{practiceError}</span>
          </div>
        )}
        {mode === 'practice' && isPracticeComplete && expectedClicks.length > 0 && (
          <div className="practice-feedback practice-feedback--success" role="status">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} /> Done! You visited every reachable node in {activeAlgorithm.name} order.
            </span>
            <button className="btn btn--sm" onClick={() => { setPracticeStep(0); setPracticeError(null); }}>try again</button>
          </div>
        )}

        <div className="stage__footer">
          <Legend items={LEGEND} />
          {editable && <span className="stage__hint">{toolHint} {graph.nodes.length}/{MAX_NODES} nodes.</span>}
        </div>

        {mode === 'practice' && showTutorial && (
          <div className="stage-overlay" onClick={() => setShowTutorial(false)}>
            <div className="stage-overlay__card">
              <p>Click the unvisited node {activeAlgorithm.name} should explore next</p>
              <p>click anywhere to start</p>
            </div>
          </div>
        )}
      </section>

      {mode === 'watch' && hasGraph && <PlaybackControls playback={playback} activeAlgorithm={activeAlgorithm} />}

      {mode === 'watch' ? (
        <OperationsLog
          snapshots={hasGraph ? snapshots : []}
          currentIndex={currentIndex}
          stats={[{ label: 'visited nodes', value: display?.visitedNodes?.length || 0 }]}
        />
      ) : (
        <OperationsLog>
          <span className="log-message">Practice mode: click nodes in the order {activeAlgorithm.name} visits them.</span>
        </OperationsLog>
      )}

      {showTextEditor && (
        <GraphTextEditor
          graph={graph}
          weighted={traits.weighted}
          directed={directed}
          onApply={(next) => { replaceGraph(next); setShowTextEditor(false); }}
          onClose={() => setShowTextEditor(false)}
        />
      )}

      <ChatbotWidget activeAlgorithm={activeAlgorithm} snapshot={snapshot} offsetRight="2rem" />
    </>
  );
}
