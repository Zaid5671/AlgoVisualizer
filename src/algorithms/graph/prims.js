import { StepTypes } from '../../engine/stepTypes';

export function generatePrimsSnapshots({ nodes, edges, startNodeId }) {
  const snapshots = [];
  const visitedNodes = new Set();
  const visitedEdges = [];
  
  const record = (type, activeNodes = [], activeEdges = [], message) => {
    snapshots.push({
      type,
      visitedNodes: Array.from(visitedNodes),
      visitedEdges: [...visitedEdges],
      activeNodes,
      activeEdges,
      message
    });
  };

  record(StepTypes.START, [startNodeId], [], "Starting Prim's Minimum Spanning Tree (MST)");

  visitedNodes.add(startNodeId);
  let totalCost = 0;

  // We need to loop until all nodes in the connected component are visited
  let edgesAdded = 0;
  // Actually, we should just loop until we can't find any valid edges
  
  while (true) {
    let cheapestEdge = null;
    let newNeighbor = null;

    // Find all edges that connect a VISITED node to an UNVISITED node
    const candidateEdges = [];
    
    for (const edge of edges) {
      const sourceVisited = visitedNodes.has(edge.source);
      const targetVisited = visitedNodes.has(edge.target);
      
      // Xor equivalent for boolean: (a && !b) || (!a && b)
      if ((sourceVisited && !targetVisited) || (!sourceVisited && targetVisited && !edge.isDirected)) {
        candidateEdges.push(edge);
      }
    }

    if (candidateEdges.length === 0) {
      break; // No more reachable unvisited nodes
    }

    // Find the cheapest one
    candidateEdges.sort((a, b) => a.weight - b.weight);
    cheapestEdge = candidateEdges[0];
    newNeighbor = visitedNodes.has(cheapestEdge.source) ? cheapestEdge.target : cheapestEdge.source;

    record(StepTypes.COMPARE, [newNeighbor], [cheapestEdge.id], `Evaluating cheapest outward edge (Weight: ${cheapestEdge.weight})`);

    visitedNodes.add(newNeighbor);
    visitedEdges.push(cheapestEdge.id);
    totalCost += cheapestEdge.weight;

    record(StepTypes.SWAP, [newNeighbor], [cheapestEdge.id], `Added node ${newNeighbor} to the growing tree!`);
  }

  record(StepTypes.END, [], [], `Prim's MST Complete! Total cost: ${totalCost}`);

  return snapshots;
}
