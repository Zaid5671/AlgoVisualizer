import { StepTypes } from '../../engine/stepTypes';

export function generateDFSGraphSnapshots({ nodes, edges, startNodeId }) {
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

  record(StepTypes.START, [startNodeId], [], "Starting Depth-First Search on Graph");

  const visited = new Set();
  const stack = [startNodeId];

  while (stack.length > 0) {
    const currentId = stack.pop();

    if (!visited.has(currentId)) {
      visited.add(currentId);
      visitedNodes.push(currentId);
      record(StepTypes.COMPARE, [currentId], [], `Exploring node ${currentId}`);

      const adjacentEdges = edges.filter(e => e.source === currentId || (!e.isDirected && e.target === currentId));

      for (const edge of adjacentEdges) {
        const neighborId = edge.source === currentId ? edge.target : edge.source;
        
        record(StepTypes.COMPARE, [currentId, neighborId], [edge.id], `Looking at edge to neighbor ${neighborId}`);

        if (!visited.has(neighborId)) {
          visitedEdges.push(edge.id);
          stack.push(neighborId);
          record(StepTypes.SWAP, [neighborId], [edge.id], `Unvisited neighbor found, pushing ${neighborId} to stack`);
        } else {
          record(StepTypes.COMPARE, [neighborId], [], `Neighbor ${neighborId} already visited, backtracking`);
        }
      }
    }
  }

  record(StepTypes.END, [], [], "DFS Traversal Complete!");

  return snapshots;
}
