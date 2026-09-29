import { useState } from 'react';
import { Check, AlertTriangle, Plus, Ban } from 'lucide-react';
import { GraphCanvas } from '../graph/GraphCanvas';
import { GraphKey } from '../graph/GraphKey';
import { PracticeShell } from './PracticeShell';
import { usePracticeSession } from '../../practice/usePracticeSession';
import { createGraphEngine, practiceBlocker, formatDist, INF } from '../../practice/graphPractice';
import { nodeLabel as L } from '../../utils/nodeLabel';

// Colours for Kruskal components and Tarjan groups.
const GROUP_COLORS = ['#ffd6de', '#d6e6ff', '#d9f2dc', '#fff0c2', '#e8dcff', '#ffe0cc', '#d4f1f1', '#f0d9ff'];

const INTRO = {
  bfsGraph: 'Visit nodes the way BFS does: always take the next node from the front of the queue.',
  dfsGraph: 'Travel the way DFS does: keep going deeper, and back up only when a node has no unvisited neighbours.',
  dijkstraGraph: 'Finalise nodes the way Dijkstra does: always the unfinished node with the smallest distance.',
  bellmanFord: "Run Bellman-Ford pass by pass: relax every edge in order, then fill in the new distances.",
  kruskals: 'Build a minimum spanning tree from the cheapest edges up, skipping any edge that would make a cycle.',
  prims: 'Grow a minimum spanning tree from the start node, always adding the cheapest edge that reaches a new node.',
  tarjans: 'Find the strongly connected components: groups where every node can reach every other.',
};

const edgeName = (e, directed) => `${L(e.source)}${directed ? '→' : '–'}${L(e.target)}`;

function Panel({ title, help, children }) {
  return (
    <aside className="practice-panel">
      <span className="eyebrow">{title}</span>
      {help && <p className="practice-panel__help">{help}</p>}
      {children}
    </aside>
  );
}

function GraphSession({ algorithm, graph, directed, weighted, startNodeId, onWatch }) {
  const algoId = algorithm.id;
  const [engine] = useState(() => createGraphEngine(algoId, { graph, directed, startNodeId }));
  const session = usePracticeSession(engine);
  const { state, round, hintLevel, actions, done } = session;
  const [paint, setPaint] = useState(0); // Tarjan: selected colour

  const edgeById = new Map(graph.edges.map(e => [e.id, e]));
  const hint = new Set(hintLevel >= 2 && round?.valid ? round.valid : []);
  const clickable = new Set(round?.clickable || []);

  // ---- canvas decorations per algorithm ----
  let display = {};
  let nodeClassOf = () => '';
  let edgeClassOf = () => '';
  let nodeBadgeOf = () => null;
  let nodeFillOf = () => undefined;
  let onNode;
  let onEdge;

  if (algoId === 'bfsGraph' || algoId === 'dfsGraph') {
    const top = algoId === 'dfsGraph' ? state.path[state.path.length - 1] : state.current;
    const queued = algoId === 'bfsGraph' ? new Map(state.queue.map(q => [q.id, q.depth])) : new Map();
    const onPath = new Set(algoId === 'dfsGraph' ? state.path : []);
    display = { visitedNodes: state.visited, activeNodes: top !== undefined && top !== null ? [top] : [], visitedEdges: state.treeEdges };
    nodeClassOf = (id) => [
      (queued.has(id) || (algoId === 'dfsGraph' && clickable.has(id))) && 'is-frontier',
      onPath.has(id) && id !== top && 'is-onstack',
      clickable.has(id) && 'is-choosable',
      hint.has(id) && 'is-hint',
    ].filter(Boolean).join(' ');
    nodeBadgeOf = (id) => (queued.has(id) ? `d${queued.get(id)}` : null);
    onNode = (id) => actions.choose(id);
  }

  if (algoId === 'dijkstraGraph') {
    const doneSet = new Set(state.done);
    display = {
      visitedNodes: state.done,
      activeNodes: state.current !== null ? [state.current] : [],
      visitedEdges: state.done.map(id => state.prevEdge[id]).filter(Boolean),
      activeEdges: state.relaxed.map(r => r.edgeId),
    };
    nodeClassOf = (id) => [
      !doneSet.has(id) && state.dist[id] !== INF && 'is-frontier',
      clickable.has(id) && 'is-choosable',
      hint.has(id) && 'is-hint',
    ].filter(Boolean).join(' ');
    nodeBadgeOf = (id) => formatDist(state.dist[id]);
    onNode = (id) => actions.choose(id);
  }

  if (algoId === 'bellmanFord') {
    display = { visitedEdges: Object.values(state.prev), activeNodes: state.lastChanged || [] };
    nodeBadgeOf = (id) => formatDist(state.dist[id]);
  }

  if (algoId === 'kruskals') {
    const sizes = {};
    Object.values(state.comp).forEach(c => { sizes[c] = (sizes[c] || 0) + 1; });
    const compIndex = {};
    Object.keys(sizes).filter(c => sizes[c] > 1).forEach((c, i) => { compIndex[c] = i; });
    display = { visitedEdges: state.treeEdges, activeEdges: round ? [round.edgeId] : [] };
    nodeFillOf = (id) => (compIndex[state.comp[id]] !== undefined ? GROUP_COLORS[compIndex[state.comp[id]] % GROUP_COLORS.length] : undefined);
    edgeClassOf = (id) => (state.rejected.includes(id) ? 'is-rejected' : '');
  }

  if (algoId === 'prims') {
    display = { visitedEdges: state.treeEdges };
    nodeClassOf = (id) => (state.inTree.includes(id) ? 'is-tree' : '');
    edgeClassOf = (id) => [clickable.has(id) && 'is-candidate', hint.has(id) && 'is-hint'].filter(Boolean).join(' ');
    onEdge = (id) => actions.choose(id);
  }

  if (algoId === 'tarjans') {
    const misplaced = new Set(hintLevel >= 2 && round ? round.misplaced(state.work) : []);
    nodeFillOf = (id) => (state.work[id] !== undefined ? GROUP_COLORS[state.work[id] % GROUP_COLORS.length] : undefined);
    nodeClassOf = (id) => [round && 'is-choosable', misplaced.has(id) && 'is-hint'].filter(Boolean).join(' ');
    onNode = (id) => actions.edit({ node: id, group: paint });
    if (done) display = {};
  }

  const canvas = (interactive) => (
    <GraphCanvas
      graph={graph}
      directed={directed}
      weighted={weighted}
      startNodeId={['kruskals', 'tarjans'].includes(algoId) ? null : startNodeId}
      display={display}
      editable={false}
      onNodeActivate={interactive ? onNode : undefined}
      onEdgeActivate={interactive ? onEdge : undefined}
      nodeClassOf={nodeClassOf}
      edgeClassOf={edgeClassOf}
      nodeBadgeOf={nodeBadgeOf}
      nodeFillOf={nodeFillOf}
    />
  );

  // ---- side panels ----
  let panel = null;
  if (algoId === 'bfsGraph') {
    panel = (
      <Panel title="Queue (front → back)" help="Nodes found but not visited yet, in the order they were found. d = depth: edges away from the start.">
        <div className="practice-panel__items">
          {state.queue.length === 0 ? <span className="merge-board__empty">empty</span> : state.queue.map(q => (
            <span key={q.id} className={`value-chip value-chip--mono ${hint.has(q.id) ? 'is-hint' : ''}`}>{L(q.id)} · d{q.depth}</span>
          ))}
        </div>
        <p className="practice-panel__help">Visit order so far: {state.visited.map(L).join(' → ') || '—'}</p>
      </Panel>
    );
  } else if (algoId === 'dfsGraph') {
    panel = (
      <Panel title="Stack (bottom → top)" help="The current path from the start. DFS explores from the top, and pops nodes off when they have nowhere left to go.">
        <div className="practice-panel__items">
          {state.path.map(id => <span key={id} className="value-chip value-chip--mono">{L(id)}</span>)}
        </div>
        <p className="practice-panel__help">Visit order so far: {state.visited.map(L).join(' → ')}</p>
      </Panel>
    );
  } else if (algoId === 'dijkstraGraph') {
    const relaxedNodes = new Set(state.relaxed.map(r => r.node));
    panel = (
      <Panel title="Distance table" help="Best distance found so far from the start. ✓ = finalised (can't improve any more).">
        <table className="dist-table">
          <thead><tr><th>Node</th><th>Dist</th><th>Via</th><th /></tr></thead>
          <tbody>
            {graph.nodes.map(n => {
              const prev = state.prevEdge[n.id] ? edgeById.get(state.prevEdge[n.id]) : null;
              const via = prev ? L(prev.source === n.id ? prev.target : prev.source) : '—';
              return (
                <tr key={n.id} className={[state.done.includes(n.id) && 'is-done', relaxedNodes.has(n.id) && 'is-updated', hint.has(n.id) && 'is-hint'].filter(Boolean).join(' ')}>
                  <td>{L(n.id)}</td><td>{formatDist(state.dist[n.id])}</td><td>{via}</td><td>{state.done.includes(n.id) ? '✓' : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {state.relaxed.length > 0 && (
          <p className="practice-panel__help">
            Finalising {L(state.current)} improved: {state.relaxed.map(r => `${L(r.node)} ${formatDist(r.from)} → ${r.to}`).join(', ')}
          </p>
        )}
      </Panel>
    );
  } else if (algoId === 'bellmanFord') {
    const expected = round?.kind === 'table' ? round.expected : null;
    panel = (
      <Panel title={round?.kind === 'table' ? `Distances after pass ${round.pass}` : 'Distances'} help="Type a number, or leave ∞ if the node still can't be reached. Negative numbers are allowed.">
        <table className="dist-table">
          <thead><tr><th>Node</th><th>Before</th><th>After</th></tr></thead>
          <tbody>
            {graph.nodes.map(n => {
              const wrong = hintLevel >= 2 && expected && String(state.work[n.id]).trim() !== formatDist(expected[n.id]);
              return (
                <tr key={n.id} className={wrong ? 'is-hint' : ''}>
                  <td>{L(n.id)}</td>
                  <td>{formatDist(state.dist[n.id])}</td>
                  <td>
                    {round?.kind === 'table' ? (
                      <input
                        className="text-input text-input--cell"
                        value={state.work[n.id] ?? ''}
                        aria-label={`Distance to ${L(n.id)}`}
                        onChange={e => actions.edit({ node: n.id, value: e.target.value })}
                      />
                    ) : formatDist(state.dist[n.id])}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <span className="eyebrow">edge order</span>
        <div className="practice-panel__items">
          {graph.edges.map(e => <span key={e.id} className="value-chip value-chip--mono">{edgeName(e, directed)} ({e.weight})</span>)}
        </div>
      </Panel>
    );
  } else if (algoId === 'kruskals') {
    const sorted = engine.sortedEdges;
    panel = (
      <Panel title="Edges, cheapest first" help="Kruskal looks at each edge once, in this order.">
        <ol className="edge-list">
          {sorted.map((e, i) => {
            const status = state.treeEdges.includes(e.id) ? 'added' : state.rejected.includes(e.id) ? 'rejected' : i === state.index && round ? 'current' : 'upcoming';
            return (
              <li key={e.id} className={`edge-list__item is-${status}`}>
                <span>{edgeName(e, false)}</span><span>{e.weight}</span>
                <span className="edge-list__status">{status === 'added' ? '✓ added' : status === 'rejected' ? '✗ cycle' : status === 'current' ? '← now' : ''}</span>
              </li>
            );
          })}
        </ol>
      </Panel>
    );
  } else if (algoId === 'prims') {
    const crossing = graph.edges.filter(e => state.inTree.includes(e.source) !== state.inTree.includes(e.target));
    panel = (
      <Panel title="Edges leaving the tree" help="Edges with one end in the tree (green) and one end outside. These are the only edges Prim can add next.">
        <div className="practice-panel__items">
          {crossing.length === 0 ? <span className="merge-board__empty">none</span> : crossing.map(e => (
            <span key={e.id} className={`value-chip value-chip--mono ${hint.has(e.id) ? 'is-hint' : ''}`}>{edgeName(e, false)} · {e.weight}</span>
          ))}
        </div>
        <p className="practice-panel__help">Tree weight so far: {state.treeEdges.reduce((t, id) => t + edgeById.get(id).weight, 0)}</p>
      </Panel>
    );
  } else if (algoId === 'tarjans') {
    panel = (
      <Panel title="Paint with" help="Pick a colour, then click nodes to paint them. Use a different colour for each component.">
        <div className="palette">
          {GROUP_COLORS.slice(0, Math.max(3, Math.min(GROUP_COLORS.length, graph.nodes.length))).map((c, i) => (
            <button key={c} className={`palette__swatch ${paint === i ? 'is-active' : ''}`} style={{ background: c }} onClick={() => setPaint(i)} aria-label={`Colour ${i + 1}`} />
          ))}
        </div>
      </Panel>
    );
  }

  // ---- choice buttons for non-click questions ----
  let choices = null;
  if (round?.kind === 'addReject') {
    choices = (
      <div className="practice-choices practice-choices--start">
        <button className={`btn ${hintLevel >= 2 && round.answer === 'add' ? 'is-hint' : ''}`} onClick={() => actions.choose('add')}><Plus size={14} /> Add to tree</button>
        <button className={`btn ${hintLevel >= 2 && round.answer === 'reject' ? 'is-hint' : ''}`} onClick={() => actions.choose('reject')}><Ban size={14} /> Reject: makes a cycle</button>
      </div>
    );
  }
  if (round?.kind === 'yesNo') {
    choices = (
      <div className="practice-choices practice-choices--start">
        {round.options.map(o => (
          <button key={String(o.value)} className={`btn ${hintLevel >= 2 && round.answer === o.value ? 'is-hint' : ''}`} onClick={() => actions.choose(o.value)}>{o.label}</button>
        ))}
      </div>
    );
  }

  const primaryAction = (round?.kind === 'table' || round?.kind === 'group') && (
    <button className="btn btn--primary" onClick={() => actions.choose(state.work)}><Check size={14} /> Check</button>
  );

  const footnote = !round ? null
    : round.kind === 'pickNode' ? 'Click a node.'
    : round.kind === 'pickEdge' ? 'Click an edge (the dashed blue ones).'
    : round.kind === 'group' ? 'Paint every node, then press Check.'
    : round.kind === 'table' ? 'Edit the "After" column, then press Check.'
    : 'Choose an answer.';

  const summary = done ? buildSummary(algoId, engine.result(state), graph, edgeById, canvas(false)) : null;

  return (
    <>
      <PracticeShell
        session={session}
        status={round ? INTRO_STATUS[algoId](state, round) : null}
        intro={INTRO[algoId]}
        primaryAction={primaryAction}
        footnote={footnote}
        summary={summary}
        onWatch={onWatch}
      >
        <div className="practice-split">
          <div className="practice-split__main">
            {canvas(true)}
            {choices}
          </div>
          {panel}
        </div>
      </PracticeShell>
      {!done && <GraphKey algoId={algoId} practice />}
    </>
  );
}

const INTRO_STATUS = {
  bfsGraph: (s) => `${s.visited.length} visited`,
  dfsGraph: (s) => `${s.visited.length} visited`,
  dijkstraGraph: (s) => `${s.done.length} finalised`,
  bellmanFord: (s, r) => (r.kind === 'table' ? `pass ${r.pass}` : 'negative cycle?'),
  kruskals: (s) => `${s.treeEdges.length} edges in tree`,
  prims: (s) => `${s.treeEdges.length} edges in tree`,
  tarjans: () => 'group the nodes',
};

function buildSummary(algoId, result, graph, edgeById, finalCanvas) {
  const extra = <div className="practice-summary__graph">{finalCanvas}</div>;
  if (algoId === 'bfsGraph' || algoId === 'dfsGraph') {
    const unreached = graph.nodes.length - result.order.length;
    return {
      title: 'Traversal complete!',
      body: `Visit order: ${result.order.map(L).join(' → ')}.${unreached ? ` ${unreached} node${unreached === 1 ? " isn't" : "s aren't"} reachable from the start.` : ''}`,
      extra,
    };
  }
  if (algoId === 'dijkstraGraph' || algoId === 'bellmanFord') {
    const list = graph.nodes.map(n => `${L(n.id)}: ${formatDist(result.dist[n.id])}`).join(', ');
    return {
      title: result.negativeCycle ? 'Negative cycle found!' : 'Shortest distances found!',
      body: result.negativeCycle
        ? 'Some distances could keep shrinking forever, so "shortest path" has no answer for nodes affected by the cycle.'
        : `Distances from the start: ${list}.`,
      extra,
    };
  }
  if (algoId === 'kruskals' || algoId === 'prims') {
    return {
      title: 'Minimum spanning tree built!',
      body: `Tree edges: ${result.treeEdges.map(id => { const e = edgeById.get(id); return `${L(e.source)}–${L(e.target)} (${e.weight})`; }).join(', ')}. Total weight: ${result.total}.`,
      extra,
    };
  }
  return {
    title: 'Components found!',
    body: `Strongly connected components: ${result.sccs.map(g => `{${g.map(L).sort().join(', ')}}`).join(' ')}.`,
    extra,
  };
}

export function GraphPractice({ algorithm, graph, directed, weighted, startNodeId, graphKey, onWatch, onLoadPreset }) {
  const blocker = practiceBlocker(algorithm.id, graph);
  if (blocker) {
    return (
      <section className="stage practice">
        <div className="graph-issue graph-issue--warn"><AlertTriangle size={15} /> {blocker}</div>
        <div className="practice-actions">
          <button className="btn btn--primary" onClick={onLoadPreset}>Load the classic graph</button>
          <button className="btn" onClick={onWatch}>Back to watch mode</button>
        </div>
      </section>
    );
  }
  return (
    <GraphSession
      key={`${algorithm.id}:${graphKey}`}
      algorithm={algorithm}
      graph={graph}
      directed={directed}
      weighted={weighted}
      startNodeId={startNodeId}
      onWatch={onWatch}
    />
  );
}
