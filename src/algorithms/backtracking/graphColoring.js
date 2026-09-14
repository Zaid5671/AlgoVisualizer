import { StepTypes } from '../../engine/stepTypes';

export function generateGraphColoringSnapshots({ nodes, edges, m }) {
  // m is the number of colors allowed (e.g. 3)
  const snapshots = [];
  const colorAssignment = {}; // map of nodeId -> colorIndex (0, 1, 2...)
  
  const record = (type, activeNodes = [], message) => {
    snapshots.push({
      type,
      colors: { ...colorAssignment },
      activeNodes,
      message
    });
  };

  record(StepTypes.START, [], `Starting m-Coloring Problem with m = ${m} colors`);

  const isSafe = (nodeId, colorIndex) => {
    // Find all adjacent nodes
    const adjacentEdges = edges.filter(e => e.source === nodeId || e.target === nodeId);
    for (const edge of adjacentEdges) {
      const neighborId = edge.source === nodeId ? edge.target : edge.source;
      if (colorAssignment[neighborId] === colorIndex) {
        return false;
      }
    }
    return true;
  };

  const solveColoringUtil = (nodeIndex) => {
    if (nodeIndex >= nodes.length) return true; // All nodes colored

    const currentNode = nodes[nodeIndex].id;

    for (let c = 0; c < m; c++) {
      record(StepTypes.COMPARE, [currentNode], `Testing color ${c} on node ${currentNode}`);

      if (isSafe(currentNode, c)) {
        colorAssignment[currentNode] = c;
        record(StepTypes.SWAP, [currentNode], `Safe! Assigned color ${c} to node ${currentNode}`);

        if (solveColoringUtil(nodeIndex + 1)) return true;

        // Backtrack
        delete colorAssignment[currentNode];
        record(StepTypes.SWAP, [currentNode], `Dead end reached. Backtracking. Erased color from node ${currentNode}`);
      } else {
        record(StepTypes.COMPARE, [currentNode], `Conflict! Color ${c} is already used by a neighbor.`);
      }
    }

    return false;
  };

  if (solveColoringUtil(0)) {
    record(StepTypes.END, [], `Successfully colored the graph using ${m} colors!`);
  } else {
    record(StepTypes.END, [], `No solution exists to color this graph with only ${m} colors.`);
  }

  return snapshots;
}
