import { StepTypes } from '../../engine/stepTypes';

export function generateBFSGraphSnapshots({ nodes, edges, startNodeId }) {
  const snapshots = [];
  const visitedNodes = [];
  const visitedEdges = [];
  
  const record = (type, activeNodes = [], activeEdges = [], message, activeLine) => {
    snapshots.push({
      type,
      visitedNodes: [...visitedNodes],
      visitedEdges: [...visitedEdges],
      activeNodes,
      activeEdges,
      message,
      activeLine
    });
  };

  record(StepTypes.START, [startNodeId], [], "Starting Breadth-First Search on Graph", 0);

  const queue = [startNodeId];
  const visited = new Set([startNodeId]);
  visitedNodes.push(startNodeId);

  while (queue.length > 0) {
    const currentId = queue.shift();
    record(StepTypes.COMPARE, [currentId], [], `Exploring node ${currentId}`, 3);

    // Find all edges connected to currentId
    const adjacentEdges = edges.filter(e => e.source === currentId || (!e.isDirected && e.target === currentId));

    for (const edge of adjacentEdges) {
      const neighborId = edge.source === currentId ? edge.target : edge.source;
      
      record(StepTypes.COMPARE, [currentId, neighborId], [edge.id], `Checking edge to neighbor ${neighborId}`, 4);

      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        visitedNodes.push(neighborId);
        visitedEdges.push(edge.id);
        queue.push(neighborId);
        
        record(StepTypes.SWAP, [neighborId], [edge.id], `Discovered unvisited node ${neighborId}, adding to queue`, 8);
      } else {
        record(StepTypes.COMPARE, [neighborId], [], `Node ${neighborId} is already visited`, 6);
      }
    }
  }

  record(StepTypes.END, [], [], "BFS Traversal Complete!", -1);

  return snapshots;
}
