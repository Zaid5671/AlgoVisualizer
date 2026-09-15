import { StepTypes } from '../../engine/stepTypes';

export function generateDijkstraGraphSnapshots({ nodes, edges, startNodeId }) {
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

  record(StepTypes.START, [startNodeId], [], "Starting Dijkstra's Algorithm", 0);

  const distances = {};
  const previousEdge = {};
  nodes.forEach(n => distances[n] = Infinity);
  distances[startNodeId] = 0;

  const unvisited = new Set(nodes);

  while (unvisited.size > 0) {
    // Find unvisited node with lowest distance
    let currentId = null;
    let minDistance = Infinity;
    for (const node of unvisited) {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        currentId = node;
      }
    }

    if (currentId === null) break; // Remaining nodes are unreachable

    unvisited.delete(currentId);
    visitedNodes.add(currentId);
    if (previousEdge[currentId]) {
      visitedEdges.push(previousEdge[currentId]);
    }

    record(StepTypes.COMPARE, [currentId], previousEdge[currentId] ? [previousEdge[currentId]] : [], `Locked in shortest path to node ${currentId} (Cost: ${distances[currentId]})`, 3);

    // Find neighbors
    const adjacentEdges = edges.filter(e => e.source === currentId || (!e.isDirected && e.target === currentId));
    
    for (const edge of adjacentEdges) {
      const neighborId = edge.source === currentId ? edge.target : edge.source;
      
      if (unvisited.has(neighborId)) {
        record(StepTypes.COMPARE, [currentId, neighborId], [edge.id], `Checking edge to ${neighborId} (Weight: ${edge.weight})`, 4);
        
        const altDistance = distances[currentId] + edge.weight;
        if (altDistance < distances[neighborId]) {
          distances[neighborId] = altDistance;
          previousEdge[neighborId] = edge.id;
          record(StepTypes.SWAP, [neighborId], [edge.id], `Found cheaper path to ${neighborId}! (New Cost: ${altDistance})`, 7);
        }
      }
    }
  }

  record(StepTypes.END, [], [], "Dijkstra's Traversal Complete!", -1);

  return snapshots;
}
