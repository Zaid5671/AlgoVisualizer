import { StepTypes } from '../../engine/stepTypes';

export function generateBellmanFordSnapshots({ nodes, edges, startNodeId }) {
  const snapshots = [];
  const visitedNodes = new Set();
  let activeEdgesToRender = []; // Used to show the final shortest path tree
  
  const record = (type, activeNodes = [], activeEdges = [], message) => {
    snapshots.push({
      type,
      visitedNodes: Array.from(visitedNodes),
      visitedEdges: [...activeEdgesToRender],
      activeNodes,
      activeEdges,
      message
    });
  };

  record(StepTypes.START, [startNodeId], [], "Starting Bellman-Ford Algorithm");

  const distances = {};
  const previousEdge = {};
  nodes.forEach(n => distances[n] = Infinity);
  distances[startNodeId] = 0;
  visitedNodes.add(startNodeId);

  // Relax all edges |V| - 1 times
  const vMinusOne = nodes.length - 1;
  for (let i = 1; i <= vMinusOne; i++) {
    let anyChanges = false;
    
    // We treat undirected edges as two directed edges for Bellman-Ford
    for (const edge of edges) {
      // Forward direction
      record(StepTypes.COMPARE, [edge.source, edge.target], [edge.id], `Pass ${i}: Relaxing edge from ${edge.source} to ${edge.target} (Weight ${edge.weight})`);
      
      if (distances[edge.source] !== Infinity && distances[edge.source] + edge.weight < distances[edge.target]) {
        distances[edge.target] = distances[edge.source] + edge.weight;
        previousEdge[edge.target] = edge.id;
        visitedNodes.add(edge.target);
        anyChanges = true;
        record(StepTypes.SWAP, [edge.target], [edge.id], `Updated distance to node ${edge.target} (New Cost: ${distances[edge.target]})`);
      }

      // Backward direction (if undirected)
      if (!edge.isDirected) {
        record(StepTypes.COMPARE, [edge.target, edge.source], [edge.id], `Pass ${i}: Relaxing edge from ${edge.target} to ${edge.source} (Weight ${edge.weight})`);
        if (distances[edge.target] !== Infinity && distances[edge.target] + edge.weight < distances[edge.source]) {
          distances[edge.source] = distances[edge.target] + edge.weight;
          previousEdge[edge.source] = edge.id;
          visitedNodes.add(edge.source);
          anyChanges = true;
          record(StepTypes.SWAP, [edge.source], [edge.id], `Updated distance to node ${edge.source} (New Cost: ${distances[edge.source]})`);
        }
      }
    }

    if (!anyChanges) {
      record(StepTypes.COMPARE, [], [], `Pass ${i} had no changes. We can early exit!`);
      break;
    }
  }

  // Update visitedEdges to show the final tree
  activeEdgesToRender = Object.values(previousEdge);

  // Check for negative-weight cycles
  let hasNegativeCycle = false;
  for (const edge of edges) {
    if (distances[edge.source] !== Infinity && distances[edge.source] + edge.weight < distances[edge.target]) {
      hasNegativeCycle = true;
      break;
    }
    if (!edge.isDirected && distances[edge.target] !== Infinity && distances[edge.target] + edge.weight < distances[edge.source]) {
      hasNegativeCycle = true;
      break;
    }
  }

  if (hasNegativeCycle) {
    record(StepTypes.END, [], [], "WARNING: Negative-weight cycle detected! Shortest paths are undefined.");
  } else {
    record(StepTypes.END, [], [], "Bellman-Ford Complete! Shortest paths found.");
  }

  return snapshots;
}
