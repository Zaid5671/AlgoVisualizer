// Pure helpers for the graph editor: editing, text import/export, presets and
// per-algorithm validation. Nothing here touches React or the DOM.
import { PRESET_GRAPHS, generateGraph } from '../data/presetGraphs';
import { nodeLabel } from '../utils/nodeLabel';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 420;
export const NODE_RADIUS = 20;
export const MAX_NODES = 26; // labels run A..Z

export { nodeLabel };

// ---------------------------------------------------------------------------
// Algorithm capabilities
// ---------------------------------------------------------------------------
const WEIGHTED = new Set(['dijkstraGraph', 'bellmanFord', 'kruskals', 'prims']);
const FORCED_DIRECTED = new Set(['tarjans']);
const FORCED_UNDIRECTED = new Set(['kruskals', 'prims']);
const USES_START = new Set(['bfsGraph', 'dfsGraph', 'dijkstraGraph', 'bellmanFord', 'prims']);

export const algorithmTraits = (algoId) => ({
  weighted: WEIGHTED.has(algoId),
  usesStart: USES_START.has(algoId),
  // null means the user may choose
  forcedDirected: FORCED_DIRECTED.has(algoId) ? true : FORCED_UNDIRECTED.has(algoId) ? false : null,
});

export const effectiveDirected = (algoId, userDirected) => {
  const { forcedDirected } = algorithmTraits(algoId);
  return forcedDirected ?? userDirected;
};

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------
const clone = (graph) => ({
  nodes: graph.nodes.map(n => ({ ...n })),
  edges: graph.edges.map(e => ({ ...e })),
});

const edgeId = (u, v) => `e-${u}-${v}-${Math.random().toString(36).slice(2, 7)}`;

export const PRESETS = [
  { id: 'grid8', label: 'Classic (8 nodes)', build: () => clone(PRESET_GRAPHS[8]) },
  { id: 'pentagon5', label: 'Pentagon (5 nodes)', build: () => clone(PRESET_GRAPHS[5]) },
  { id: 'large12', label: 'Large (12 nodes)', build: () => clone(PRESET_GRAPHS[12]) },
  {
    id: 'negative',
    label: 'Negative weights',
    hint: 'Good for Bellman-Ford',
    build: () => ({
      nodes: [
        { id: 0, x: 120, y: 210 }, { id: 1, x: 300, y: 100 }, { id: 2, x: 300, y: 320 },
        { id: 3, x: 500, y: 100 }, { id: 4, x: 500, y: 320 }, { id: 5, x: 680, y: 210 },
      ],
      edges: [
        { id: 'e-0-1', source: 0, target: 1, weight: 6 },
        { id: 'e-0-2', source: 0, target: 2, weight: 4 },
        { id: 'e-1-3', source: 1, target: 3, weight: 5 },
        { id: 'e-2-1', source: 2, target: 1, weight: -2 },
        { id: 'e-2-4', source: 2, target: 4, weight: 3 },
        { id: 'e-4-3', source: 4, target: 3, weight: -1 },
        { id: 'e-3-5', source: 3, target: 5, weight: 3 },
        { id: 'e-4-5', source: 4, target: 5, weight: 7 },
      ],
    }),
  },
  {
    id: 'scc',
    label: 'Directed cycles',
    hint: "Good for Tarjan's SCC",
    build: () => ({
      nodes: [
        { id: 0, x: 140, y: 110 }, { id: 1, x: 300, y: 110 }, { id: 2, x: 220, y: 290 },
        { id: 3, x: 480, y: 110 }, { id: 4, x: 640, y: 110 }, { id: 5, x: 560, y: 290 },
        { id: 6, x: 400, y: 330 },
      ],
      edges: [
        { id: 'e-0-1', source: 0, target: 1, weight: 1 },
        { id: 'e-1-2', source: 1, target: 2, weight: 1 },
        { id: 'e-2-0', source: 2, target: 0, weight: 1 },
        { id: 'e-1-3', source: 1, target: 3, weight: 1 },
        { id: 'e-3-4', source: 3, target: 4, weight: 1 },
        { id: 'e-4-5', source: 4, target: 5, weight: 1 },
        { id: 'e-5-3', source: 5, target: 3, weight: 1 },
        { id: 'e-5-6', source: 5, target: 6, weight: 1 },
      ],
    }),
  },
];

// generateGraph returns the fixed presets for 5, 8 and 12 nodes, so random graphs use other sizes.
const RANDOM_SIZES = [6, 7, 9, 10];
export const randomGraph = () =>
  clone(generateGraph(RANDOM_SIZES[Math.floor(Math.random() * RANDOM_SIZES.length)]));

export const emptyGraph = () => ({ nodes: [], edges: [] });

// ---------------------------------------------------------------------------
// Editing (all return a new graph)
// ---------------------------------------------------------------------------
const clampPoint = (x, y) => ({
  x: Math.max(NODE_RADIUS + 4, Math.min(CANVAS_WIDTH - NODE_RADIUS - 4, x)),
  y: Math.max(NODE_RADIUS + 4, Math.min(CANVAS_HEIGHT - NODE_RADIUS - 4, y)),
});

export const nextNodeId = (graph) => {
  const used = new Set(graph.nodes.map(n => n.id));
  for (let i = 0; i < MAX_NODES; i++) if (!used.has(i)) return i;
  return null;
};

export const addNode = (graph, x, y) => {
  const id = nextNodeId(graph);
  if (id === null) return graph;
  return { ...graph, nodes: [...graph.nodes, { id, ...clampPoint(x, y) }] };
};

export const moveNode = (graph, id, x, y) => ({
  ...graph,
  nodes: graph.nodes.map(n => (n.id === id ? { ...n, ...clampPoint(x, y) } : n)),
});

export const removeNode = (graph, id) => ({
  nodes: graph.nodes.filter(n => n.id !== id),
  edges: graph.edges.filter(e => e.source !== id && e.target !== id),
});

export const findEdge = (graph, u, v, directed) =>
  graph.edges.find(e => (e.source === u && e.target === v) || (!directed && e.source === v && e.target === u));

export const addEdge = (graph, u, v, weight, directed) => {
  if (u === v || findEdge(graph, u, v, directed)) return graph;
  return { ...graph, edges: [...graph.edges, { id: edgeId(u, v), source: u, target: v, weight }] };
};

export const removeEdge = (graph, id) => ({ ...graph, edges: graph.edges.filter(e => e.id !== id) });

export const setEdgeWeight = (graph, id, weight) => ({
  ...graph,
  edges: graph.edges.map(e => (e.id === id ? { ...e, weight } : e)),
});

// ---------------------------------------------------------------------------
// Text import / export  ("A-B-5", "A B -3", "A,B,2", "A->B")
// ---------------------------------------------------------------------------
const EDGE_LINE = /^([A-Z])\s*(?:->|[-,\s])\s*([A-Z])(?:\s*[-,\s:]\s*(-?\d+))?$/;

export const serializeEdges = (graph, weighted) =>
  graph.edges
    .map(e => `${nodeLabel(e.source)}-${nodeLabel(e.target)}${weighted ? `-${e.weight}` : ''}`)
    .join('\n');

// Returns { graph, errors }. Existing node positions are kept where possible.
export const parseEdgeList = (text, nodeCount, previous, directed) => {
  const count = Math.max(1, Math.min(MAX_NODES, nodeCount | 0));
  const errors = [];

  const nodes = [];
  const cx = CANVAS_WIDTH / 2;
  const cy = CANVAS_HEIGHT / 2;
  const radius = Math.min(cx, cy) - 50;
  for (let i = 0; i < count; i++) {
    const existing = previous.nodes.find(n => n.id === i);
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    nodes.push(existing ? { ...existing } : { id: i, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
  }

  let graph = { nodes, edges: [] };
  text.split('\n').forEach((raw, idx) => {
    const line = raw.trim().toUpperCase();
    if (!line) return;
    const m = line.match(EDGE_LINE);
    if (!m) {
      errors.push(`Line ${idx + 1}: "${raw.trim()}" isn't an edge. Use A-B or A-B-5.`);
      return;
    }
    const u = m[1].charCodeAt(0) - 65;
    const v = m[2].charCodeAt(0) - 65;
    if (u >= count || v >= count) {
      errors.push(`Line ${idx + 1}: node ${u >= count ? m[1] : m[2]} doesn't exist (only ${nodeLabel(0)}–${nodeLabel(count - 1)}).`);
      return;
    }
    if (u === v) {
      errors.push(`Line ${idx + 1}: self-loops (${m[1]}-${m[2]}) aren't supported.`);
      return;
    }
    if (findEdge(graph, u, v, directed)) {
      errors.push(`Line ${idx + 1}: duplicate edge ${m[1]}-${m[2]}.`);
      return;
    }
    graph = addEdge(graph, u, v, m[3] !== undefined ? parseInt(m[3], 10) : 1, directed);
  });

  return { graph, errors };
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
const reachableFrom = (graph, start, directed) => {
  const seen = new Set([start]);
  const stack = [start];
  while (stack.length) {
    const u = stack.pop();
    for (const e of graph.edges) {
      const next = e.source === u ? e.target : (!directed && e.target === u ? e.source : null);
      if (next !== null && !seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return seen;
};

// Returns a list of { level: 'warn' | 'info', text } messages about how well
// the current graph suits the selected algorithm.
export const validateGraph = (graph, algoId, startNodeId, directed) => {
  const issues = [];
  const traits = algorithmTraits(algoId);

  if (graph.nodes.length === 0) {
    return [{ level: 'warn', text: 'The graph is empty. Pick a preset or add nodes with the Node tool.' }];
  }
  if (graph.edges.length === 0) {
    issues.push({ level: 'warn', text: 'There are no edges yet. Use the Edge tool to connect nodes.' });
  }

  const hasNegative = graph.edges.some(e => e.weight < 0);
  if (algoId === 'dijkstraGraph' && hasNegative) {
    issues.push({ level: 'warn', text: "Dijkstra's algorithm assumes non-negative weights, so results may be wrong here. Try Bellman-Ford." });
  }
  if ((algoId === 'kruskals' || algoId === 'prims') && hasNegative) {
    issues.push({ level: 'info', text: 'Negative weights are fine for a minimum spanning tree.' });
  }

  if (traits.usesStart || algoId === 'kruskals') {
    const start = traits.usesStart ? startNodeId : graph.nodes[0].id;
    const reach = reachableFrom(graph, start, algoId === 'kruskals' ? false : directed);
    const unreachable = graph.nodes.filter(n => !reach.has(n.id)).map(n => nodeLabel(n.id));
    if (unreachable.length > 0) {
      const list = unreachable.join(', ');
      if (algoId === 'kruskals') issues.push({ level: 'info', text: `The graph is disconnected (${list}), so Kruskal builds a spanning forest.` });
      else if (algoId === 'prims') issues.push({ level: 'warn', text: `Prim only spans the start node's component. ${list} won't be included.` });
      else issues.push({ level: 'info', text: `${list} can't be reached from start node ${nodeLabel(start)}.` });
    }
  }

  return issues;
};

// A key that changes only when the graph's structure changes (not when nodes are dragged),
// so moving nodes around doesn't restart the algorithm.
export const structureKey = (graph, startNodeId, directed) =>
  [
    directed ? 'D' : 'U',
    startNodeId,
    graph.nodes.map(n => n.id).join(','),
    graph.edges.map(e => `${e.id}:${e.source}>${e.target}:${e.weight}`).join('|'),
  ].join('#');
