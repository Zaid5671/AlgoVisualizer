// Stepper engines for graph practice (see usePracticeSession).
//
// Every engine follows the learner's accepted answer, so ties are allowed:
//   BFS         pick the next node to visit: any queued node at the smallest depth
//   DFS         pick an unvisited neighbour of the deepest node that still has one
//   Dijkstra    pick the unfinished node with the smallest tentative distance
//   Bellman-Ford fill in the distance table after each pass, then answer "negative cycle?"
//   Kruskal     for each edge in sorted order: add it, or reject it because it makes a cycle
//   Prim        pick the cheapest edge leaving the tree
//   Tarjan      colour the nodes into strongly connected components
//
// Adjacency, tie-breaking and pass order mirror src/algorithms/graph so that the
// implementation's own choice (`auto`) is always one of the accepted answers.
import { nodeLabel as L } from '../utils/nodeLabel.js';

export const INF = null; // unreachable distance

export const formatDist = (d) => (d === INF ? '∞' : String(d));

// Why practice can't run on this graph (or null when it can).
export function practiceBlocker(algoId, graph) {
  if (graph.nodes.length < 2) return 'Practice needs a graph with at least 2 nodes.';
  if (graph.edges.length === 0) return 'Practice needs at least one edge.';
  if (algoId === 'dijkstraGraph' && graph.edges.some(e => e.weight < 0)) {
    return "Dijkstra's algorithm can't handle negative edge weights, so there's no single right answer to practise. Load a graph without negative weights, or switch to Bellman-Ford.";
  }
  return null;
}

export function createGraphEngine(algoId, { graph, directed, startNodeId }) {
  const nodeIds = graph.nodes.map(n => n.id);
  const edges = graph.edges;
  const edgeById = new Map(edges.map(e => [e.id, e]));

  // Outgoing edges of u in edge-list order (both directions when undirected).
  const incident = (u) => edges
    .filter(e => e.source === u || (!directed && e.target === u))
    .map(e => ({ edge: e, v: e.source === u ? e.target : e.source }));

  const engines = { bfsGraph: bfs, dfsGraph: dfs, dijkstraGraph: dijkstra, bellmanFord, kruskals: kruskal, prims: prim, tarjans: tarjan };
  const make = engines[algoId];
  const core = make();

  // Rounds marked `forced` (only one possible answer) are applied automatically.
  const settle = (state) => {
    let s = state;
    for (let guard = 0; guard < 500; guard++) {
      const q = core.question(s);
      if (!q || !q.forced) break;
      s = core.apply(s, core.auto(s));
    }
    return s;
  };

  return {
    algoId,
    init: () => settle(core.init()),
    question: core.question,
    apply: (state, answer) => settle(core.apply(state, answer)),
    auto: core.auto,
    reveal: core.reveal,
    edit: core.edit,
    result: core.result,
    sortedEdges: core.sorted, // Kruskal only
  };

  // -------------------------------------------------------------------------
  function bfs() {
    return {
      init: () => ({ queue: [{ id: startNodeId, depth: 0 }], discovered: [startNodeId], visited: [], treeEdges: [], current: null }),
      question: (s) => {
        if (s.queue.length === 0) return null;
        const minDepth = Math.min(...s.queue.map(q => q.depth));
        const valid = s.queue.filter(q => q.depth === minDepth).map(q => q.id);
        const queued = s.queue.map(q => q.id);
        return {
          kind: 'pickNode',
          valid,
          clickable: queued,
          forced: s.queue.length === 1,
          prompt: 'Which node does BFS take out of the queue and visit next?',
          nudge: 'BFS visits nodes in the order they joined the queue, so every node at depth d is visited before any node at depth d + 1. The depth of each queued node is shown in the queue panel.',
          accepts: (id) => valid.includes(id),
          mistake: (id) => (queued.includes(id)
            ? 'Not yet. BFS finishes the shallower layer first, so compare the depths in the queue.'
            : 'Only nodes waiting in the queue (outlined) can be visited next.'),
        };
      },
      apply: (s, id) => {
        const item = s.queue.find(q => q.id === id);
        const queue = s.queue.filter(q => q.id !== id);
        const discovered = [...s.discovered];
        const treeEdges = [...s.treeEdges];
        for (const { edge, v } of incident(id)) {
          if (!discovered.includes(v)) {
            discovered.push(v);
            queue.push({ id: v, depth: item.depth + 1 });
            treeEdges.push(edge.id);
          }
        }
        return { queue, discovered, visited: [...s.visited, id], treeEdges, current: id };
      },
      auto: (s) => {
        const minDepth = Math.min(...s.queue.map(q => q.depth));
        return s.queue.find(q => q.depth === minDepth).id;
      },
      result: (s) => ({ order: s.visited, treeEdges: s.treeEdges }),
    };
  }

  // -------------------------------------------------------------------------
  function dfs() {
    const candidates = (s) => {
      const top = s.path[s.path.length - 1];
      if (top === undefined) return [];
      const seen = new Set();
      return incident(top).filter(({ v }) => !s.visited.includes(v) && !seen.has(v) && seen.add(v));
    };
    // Back up past nodes that have nowhere left to go.
    const normalize = (s) => {
      const path = [...s.path];
      while (path.length && candidates({ ...s, path }).length === 0) path.pop();
      return { ...s, path };
    };
    return {
      init: () => normalize({ path: [startNodeId], visited: [startNodeId], treeEdges: [], current: startNodeId }),
      question: (s) => {
        const options = candidates(s);
        if (options.length === 0) return null;
        const valid = options.map(o => o.v);
        const top = s.path[s.path.length - 1];
        return {
          kind: 'pickNode',
          valid,
          clickable: valid,
          forced: valid.length === 1,
          prompt: `DFS is at ${L(top)}. Which node does it go to next?`,
          nudge: `DFS always goes deeper from the latest node that still has an unvisited neighbour, which is ${L(top)} right now.`,
          accepts: (id) => valid.includes(id),
          mistake: () => `DFS continues from ${L(top)}: pick one of its unvisited neighbours.`,
        };
      },
      apply: (s, id) => {
        const { edge } = candidates(s).find(o => o.v === id);
        return normalize({ path: [...s.path, id], visited: [...s.visited, id], treeEdges: [...s.treeEdges, edge.id], current: id });
      },
      // The implementation pushes neighbours in order and pops the last one pushed.
      auto: (s) => { const o = candidates(s); return o[o.length - 1].v; },
      result: (s) => ({ order: s.visited, treeEdges: s.treeEdges }),
    };
  }

  // -------------------------------------------------------------------------
  function dijkstra() {
    const pending = (s) => nodeIds.filter(id => !s.done.includes(id) && s.dist[id] !== INF);
    return {
      init: () => ({
        dist: Object.fromEntries(nodeIds.map(id => [id, id === startNodeId ? 0 : INF])),
        prevEdge: {},
        done: [],
        current: null,
        relaxed: [],
      }),
      question: (s) => {
        const open = pending(s);
        if (open.length === 0) return null;
        const best = Math.min(...open.map(id => s.dist[id]));
        const valid = open.filter(id => s.dist[id] === best);
        return {
          kind: 'pickNode',
          valid,
          clickable: open,
          forced: open.length === 1,
          prompt: 'Which node does Dijkstra finalise next?',
          nudge: "Look at the distance table: among the nodes that aren't finalised yet, pick the one with the smallest distance. Its distance can't get any shorter.",
          accepts: (id) => valid.includes(id),
          mistake: (id) => (open.includes(id)
            ? 'Not the smallest. Compare the tentative distances of the nodes not yet finalised.'
            : s.done.includes(id) ? 'That node is already finalised.' : "That node's distance is still ∞: no path to it has been found yet."),
        };
      },
      apply: (s, id) => {
        const dist = { ...s.dist };
        const prevEdge = { ...s.prevEdge };
        const relaxed = [];
        for (const { edge, v } of incident(id)) {
          if (s.done.includes(v) || v === id) continue;
          const alt = dist[id] + edge.weight;
          if (dist[v] === INF || alt < dist[v]) {
            relaxed.push({ node: v, edgeId: edge.id, from: dist[v], to: alt });
            dist[v] = alt;
            prevEdge[v] = edge.id;
          }
        }
        return { dist, prevEdge, done: [...s.done, id], current: id, relaxed };
      },
      // The implementation scans nodes in order and keeps the first strictly smaller distance.
      auto: (s) => {
        const open = pending(s);
        const best = Math.min(...open.map(id => s.dist[id]));
        return open.find(id => s.dist[id] === best);
      },
      result: (s) => ({ dist: s.dist, treeEdges: s.done.map(id => s.prevEdge[id]).filter(Boolean) }),
    };
  }

  // -------------------------------------------------------------------------
  function bellmanFord() {
    const maxPasses = nodeIds.length - 1;

    // One pass exactly like the implementation: edges in list order, updating in place.
    const passInPlace = (dist) => {
      const d = { ...dist };
      const prev = {};
      for (const e of edges) {
        if (d[e.source] !== INF && (d[e.target] === INF || d[e.source] + e.weight < d[e.target])) {
          d[e.target] = d[e.source] + e.weight;
          prev[e.target] = e.id;
        }
        if (!directed && d[e.target] !== INF && (d[e.source] === INF || d[e.target] + e.weight < d[e.source])) {
          d[e.source] = d[e.target] + e.weight;
          prev[e.source] = e.id;
        }
      }
      return { dist: d, prev };
    };
    // The textbook variant that only uses distances from the previous pass. Also correct.
    const passFromPrevious = (dist) => {
      const d = { ...dist };
      const relax = (u, v, w) => {
        if (dist[u] !== INF && (d[v] === INF || dist[u] + w < d[v])) d[v] = dist[u] + w;
      };
      for (const e of edges) {
        relax(e.source, e.target, e.weight);
        if (!directed) relax(e.target, e.source, e.weight);
      }
      return d;
    };
    const parse = (work) => Object.fromEntries(nodeIds.map(id => {
      const raw = String(work[id] ?? '').trim();
      return [id, raw === '' || raw === '∞' || raw.toLowerCase() === 'inf' ? INF : Number(raw)];
    }));
    const same = (a, b) => nodeIds.every(id => a[id] === b[id]);
    const toWork = (dist) => Object.fromEntries(nodeIds.map(id => [id, formatDist(dist[id])]));
    const hasNegativeCycle = (dist) => edges.some(e =>
      (dist[e.source] !== INF && (dist[e.target] === INF || dist[e.source] + e.weight < dist[e.target])) ||
      (!directed && dist[e.target] !== INF && (dist[e.source] === INF || dist[e.target] + e.weight < dist[e.source])));

    return {
      init: () => {
        const dist = Object.fromEntries(nodeIds.map(id => [id, id === startNodeId ? 0 : INF]));
        return { phase: maxPasses > 0 ? 'pass' : 'cycle', pass: 1, dist, work: toWork(dist), prev: {}, answeredCycle: null };
      },
      question: (s) => {
        if (s.phase === 'done') return null;
        if (s.phase === 'cycle') {
          const answer = hasNegativeCycle(s.dist);
          return {
            kind: 'yesNo',
            options: [{ value: true, label: 'Yes, a negative cycle' }, { value: false, label: 'No negative cycle' }],
            prompt: 'Final check: if one more pass could still lower a distance, the graph has a negative cycle. Does it?',
            nudge: 'Try relaxing each edge once more. If any distance would still go down, a loop of negative total weight keeps making paths cheaper forever.',
            accepts: (a) => a === answer,
            answer,
            mistake: 'Not quite. Check every edge once more: could dist[u] + w still beat dist[v] anywhere?',
          };
        }
        const inPlace = passInPlace(s.dist).dist;
        const fromPrev = passFromPrevious(s.dist);
        return {
          kind: 'table',
          pass: s.pass,
          expected: inPlace,
          prompt: `Pass ${s.pass} of at most ${maxPasses}: relax every edge once, in the order listed. What are the distances afterwards?`,
          nudge: `For each edge u → v with weight w${directed ? '' : ' (both directions, since the graph is undirected)'}: if dist[u] + w is smaller than dist[v], set dist[v] = dist[u] + w. Distances you update can be used straight away by later edges in the same pass.`,
          accepts: (work) => { const d = parse(work); return same(d, inPlace) || same(d, fromPrev); },
          mistake: (work) => {
            const d = parse(work);
            const wrong = nodeIds.filter(id => d[id] !== inPlace[id]).length;
            return `${wrong} distance${wrong === 1 ? " doesn't" : "s don't"} match what this pass produces. Walk through the edges in order again.`;
          },
          successNote: same(inPlace, s.dist) ? 'Nothing changed in this pass, so Bellman-Ford can stop early.' : null,
        };
      },
      apply: (s, answer) => {
        if (s.phase === 'cycle') return { ...s, phase: 'done', answeredCycle: answer };
        // Continue from the learner's accepted table (either valid variant).
        const next = parse(answer);
        const { prev } = passInPlace(s.dist);
        const unchanged = same(next, s.dist);
        const last = s.pass >= maxPasses;
        return {
          ...s,
          phase: unchanged || last ? 'cycle' : 'pass',
          pass: s.pass + 1,
          dist: next,
          prev: { ...s.prev, ...prev },
          work: toWork(next),
          lastChanged: nodeIds.filter(id => next[id] !== s.dist[id]),
        };
      },
      auto: (s) => (s.phase === 'cycle' ? hasNegativeCycle(s.dist) : toWork(passInPlace(s.dist).dist)),
      reveal: (s) => (s.phase === 'pass' ? { ...s, work: toWork(passInPlace(s.dist).dist) } : null),
      edit: (s, { node, value }) => ({ ...s, work: { ...s.work, [node]: value } }),
      result: (s) => ({ dist: s.dist, negativeCycle: hasNegativeCycle(s.dist), treeEdges: Object.values(s.prev) }),
    };
  }

  // -------------------------------------------------------------------------
  function kruskal() {
    const sorted = [...edges].sort((a, b) => a.weight - b.weight); // stable, like the implementation
    return {
      init: () => ({ index: 0, comp: Object.fromEntries(nodeIds.map(id => [id, id])), treeEdges: [], rejected: [] }),
      question: (s) => {
        if (s.index >= sorted.length || s.treeEdges.length === nodeIds.length - 1) return null;
        const e = sorted[s.index];
        const makesCycle = s.comp[e.source] === s.comp[e.target];
        return {
          kind: 'addReject',
          edgeId: e.id,
          prompt: `Next cheapest edge: ${L(e.source)}–${L(e.target)} (weight ${e.weight}). Add it to the tree, or reject it?`,
          nudge: 'Nodes with the same colour are already connected by edges you added. An edge between two same-coloured nodes would close a loop (a cycle), so Kruskal rejects it. Otherwise it adds it.',
          accepts: (a) => a === (makesCycle ? 'reject' : 'add'),
          answer: makesCycle ? 'reject' : 'add',
          mistake: makesCycle
            ? `${L(e.source)} and ${L(e.target)} are already connected (same colour), so this edge would create a cycle.`
            : `${L(e.source)} and ${L(e.target)} aren't connected yet (different colours), so this edge can't create a cycle.`,
        };
      },
      apply: (s, a) => {
        const e = sorted[s.index];
        if (a === 'reject') return { ...s, index: s.index + 1, rejected: [...s.rejected, e.id] };
        const from = s.comp[e.target];
        const to = s.comp[e.source];
        const comp = Object.fromEntries(Object.entries(s.comp).map(([id, c]) => [id, c === from ? to : c]));
        return { ...s, index: s.index + 1, comp, treeEdges: [...s.treeEdges, e.id] };
      },
      auto: (s) => { const e = sorted[s.index]; return s.comp[e.source] === s.comp[e.target] ? 'reject' : 'add'; },
      result: (s) => ({ treeEdges: s.treeEdges, total: s.treeEdges.reduce((t, id) => t + edgeById.get(id).weight, 0) }),
      sorted,
    };
  }

  // -------------------------------------------------------------------------
  function prim() {
    const crossing = (s) => edges.filter(e => s.inTree.includes(e.source) !== s.inTree.includes(e.target));
    return {
      init: () => ({ inTree: [startNodeId], treeEdges: [] }),
      question: (s) => {
        const options = crossing(s);
        if (options.length === 0) return null;
        const best = Math.min(...options.map(e => e.weight));
        const valid = options.filter(e => e.weight === best).map(e => e.id);
        return {
          kind: 'pickEdge',
          valid,
          clickable: options.map(e => e.id),
          forced: options.length === 1,
          prompt: 'Which edge does Prim add to the tree next? Click it.',
          nudge: 'Look only at edges with one end in the tree (green nodes) and the other end outside it. Prim always takes the cheapest of those.',
          accepts: (id) => valid.includes(id),
          mistake: (id) => (options.some(e => e.id === id)
            ? 'There is a cheaper edge leaving the tree.'
            : "That edge doesn't connect the tree to a new node."),
        };
      },
      apply: (s, id) => {
        const e = edgeById.get(id);
        const added = s.inTree.includes(e.source) ? e.target : e.source;
        return { inTree: [...s.inTree, added], treeEdges: [...s.treeEdges, id] };
      },
      // The implementation stably sorts crossing edges by weight and takes the first.
      auto: (s) => { const o = crossing(s); const best = Math.min(...o.map(e => e.weight)); return o.find(e => e.weight === best).id; },
      result: (s) => ({ treeEdges: s.treeEdges, total: s.treeEdges.reduce((t, id) => t + edgeById.get(id).weight, 0) }),
    };
  }

  // -------------------------------------------------------------------------
  function tarjan() {
    const sccs = computeSccs(nodeIds, edges);
    const sccOf = new Map();
    sccs.forEach((group, i) => group.forEach(id => sccOf.set(id, i)));
    // A node is placed correctly when its group-mates are exactly its SCC-mates.
    const misplaced = (work) => nodeIds.filter(id => {
      if (work[id] === undefined || work[id] === null) return true;
      const mine = nodeIds.filter(o => work[o] === work[id]).sort().join(',');
      return mine !== [...sccs[sccOf.get(id)]].sort().join(',');
    });
    const answerWork = () => Object.fromEntries(nodeIds.map(id => [id, sccOf.get(id)]));

    return {
      init: () => ({ work: {}, finished: false }),
      question: (s) => {
        if (s.finished) return null;
        return {
          kind: 'group',
          prompt: 'Colour the nodes so that each colour is one strongly connected component. Pick a colour, then click nodes.',
          nudge: 'Two nodes belong together when each can reach the other by following arrows. A node that is on no cycle is a component on its own.',
          accepts: (work) => misplaced(work).length === 0,
          mistake: (work) => {
            const n = misplaced(work).length;
            return `${n} node${n === 1 ? ' is' : 's are'} not grouped correctly yet (unpainted nodes count too).`;
          },
          misplaced,
          revealNote: 'These are the components. Press Check to continue.',
        };
      },
      apply: (s) => ({ ...s, finished: true }),
      auto: () => answerWork(),
      reveal: (s) => ({ ...s, work: answerWork() }),
      edit: (s, { node, group }) => ({ ...s, work: { ...s.work, [node]: group } }),
      result: () => ({ sccs }),
    };
  }
}

// Tarjan's algorithm, same traversal order as the implementation.
export function computeSccs(nodeIds, edges) {
  let counter = 0;
  const ids = {};
  const low = {};
  const onStack = {};
  const stack = [];
  const result = [];
  const visit = (at) => {
    stack.push(at);
    onStack[at] = true;
    ids[at] = low[at] = counter++;
    for (const e of edges.filter(x => x.source === at)) {
      const to = e.target;
      if (ids[to] === undefined) {
        visit(to);
        low[at] = Math.min(low[at], low[to]);
      } else if (onStack[to]) {
        low[at] = Math.min(low[at], ids[to]);
      }
    }
    if (ids[at] === low[at]) {
      const group = [];
      for (;;) {
        const n = stack.pop();
        onStack[n] = false;
        group.push(n);
        if (n === at) break;
      }
      result.push(group);
    }
  };
  nodeIds.forEach(id => { if (ids[id] === undefined) visit(id); });
  return result;
}
