import { StepTypes } from '../../engine/stepTypes';

export function generateTarjansSnapshots({ nodes, edges }) {
  const snapshots = [];
  const visitedNodes = new Set();
  const visitedEdges = [];
  
  const record = (type, activeNodes = [], activeEdges = [], message, activeLine) => {
    snapshots.push({
      type,
      visitedNodes: Array.from(visitedNodes),
      visitedEdges: [...visitedEdges],
      activeNodes,
      activeEdges,
      message,
      activeLine
    });
  };

  record(StepTypes.START, [], [], "Starting Tarjan's Strongly Connected Components (SCC) Algorithm", 0);

  let idCounter = 0;
  const ids = {};
  const low = {};
  const onStack = {};
  const stack = [];
  let sccCount = 0;

  // Initialize
  nodes.forEach(n => {
    ids[n] = -1;
    low[n] = -1;
    onStack[n] = false;
  });

  const dfs = (at) => {
    stack.push(at);
    onStack[at] = true;
    ids[at] = low[at] = idCounter++;
    visitedNodes.add(at);

    record(StepTypes.COMPARE, [at], [], `Visiting node ${at}. Assigned ID and Low-Link: ${ids[at]}`, 1);

    // Visit all neighbors (directed edges only)
    const outEdges = edges.filter(e => e.source === at);

    for (const edge of outEdges) {
      const to = edge.target;
      visitedEdges.push(edge.id);
      
      record(StepTypes.COMPARE, [at, to], [edge.id], `Traversing directed edge to ${to}`, 3);

      if (ids[to] === -1) {
        dfs(to);
        low[at] = Math.min(low[at], low[to]);
        record(StepTypes.SWAP, [at], [edge.id], `Backtracking to ${at}. Updated Low-Link to ${low[at]}`, 6);
      } else if (onStack[to]) {
        low[at] = Math.min(low[at], ids[to]);
        record(StepTypes.SWAP, [at], [edge.id], `Node ${to} is on stack! Cycle found. Updated Low-Link of ${at} to ${low[at]}`, 8);
      }
    }

    // After visiting all neighbors, if we're the root of an SCC
    if (ids[at] === low[at]) {
      record(StepTypes.COMPARE, [at], [], `Node ${at} is the root of an SCC (ID == Low-Link). Popping stack!`, 11);
      let sccNodes = [];
      while (true) {
        const node = stack.pop();
        onStack[node] = false;
        sccNodes.push(node);
        if (node === at) break;
      }
      sccCount++;
      record(StepTypes.SWAP, sccNodes, [], `Found Strongly Connected Component #${sccCount}: [${sccNodes.join(', ')}]`, 12);
    }
  };

  for (const node of nodes) {
    if (ids[node] === -1) {
      dfs(node);
    }
  }

  record(StepTypes.END, [], [], `Tarjan's Complete! Found ${sccCount} Strongly Connected Components.`, -1);

  return snapshots;
}
