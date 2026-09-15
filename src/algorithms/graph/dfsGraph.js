import { StepTypes } from '../../engine/stepTypes';

export function generateDFSGraphSnapshots({ nodes, edges, startNodeId }) {
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

  record(StepTypes.START, [startNodeId], [], "Starting Depth-First Search on Graph", 0);

  const visited = new Set();
  const stack = [startNodeId];

  while (stack.length > 0) {
    const currentId = stack.pop();

    if (!visited.has(currentId)) {
      visited.add(currentId);
      visitedNodes.push(currentId);
      record(StepTypes.COMPARE, [currentId], [], `Exploring node ${currentId}`, 2);

      const adjacentEdges = edges.filter(e => e.source === currentId || (!e.isDirected && e.target === currentId));

      for (const edge of adjacentEdges) {
        const neighborId = edge.source === currentId ? edge.target : edge.source;
        
        record(StepTypes.COMPARE, [currentId, neighborId], [edge.id], `Looking at edge to neighbor ${neighborId}`, 5);

        if (!visited.has(neighborId)) {
          visitedEdges.push(edge.id);
          stack.push(neighborId);
          record(StepTypes.SWAP, [neighborId], [edge.id], `Unvisited neighbor found, pushing ${neighborId} to stack`, 6);
        } else {
          record(StepTypes.COMPARE, [neighborId], [], `Neighbor ${neighborId} already visited, backtracking`, 6);
        }
      }
    }
  }

  record(StepTypes.END, [], [], "DFS Traversal Complete!", -1);

  return snapshots;
}
