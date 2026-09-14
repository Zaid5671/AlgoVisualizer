import { StepTypes } from '../../engine/stepTypes';

export function generateBFSGraphSnapshots({ nodes, edges, startNodeId }) {
  const snapshots = [];
  const visitedNodes = [];
  const visitedEdges = [];
  
  const record = (type, activeNodes = [], activeEdges = [], message) => {
    snapshots.push({
      type,
      visitedNodes: [...visitedNodes],
      visitedEdges: [...visitedEdges],
      activeNodes,
      activeEdges,
      message
    });
  };

  record(StepTypes.START, [startNodeId], [], "Starting Breadth-First Search on Graph");

  const queue = [startNodeId];
  const visited = new Set([startNodeId]);
  visitedNodes.push(startNodeId);

  while (queue.length > 0) {
    const currentId = queue.shift();
    record(StepTypes.COMPARE, [currentId], [], `Exploring node ${currentId}`);

    // Find all edges connected to currentId
    const adjacentEdges = edges.filter(e => e.source === currentId || (!e.isDirected && e.target === currentId));

    for (const edge of adjacentEdges) {
      const neighborId = edge.source === currentId ? edge.target : edge.source;
      
      record(StepTypes.COMPARE, [currentId, neighborId], [edge.id], `Checking edge to neighbor ${neighborId}`);

      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        visitedNodes.push(neighborId);
        visitedEdges.push(edge.id);
        queue.push(neighborId);
        
        record(StepTypes.SWAP, [neighborId], [edge.id], `Discovered unvisited node ${neighborId}, adding to queue`);
      } else {
        record(StepTypes.COMPARE, [neighborId], [], `Node ${neighborId} is already visited`);
      }
    }
  }

  record(StepTypes.END, [], [], "BFS Traversal Complete!");

  return snapshots;
}
