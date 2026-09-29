import { StepTypes } from '../../engine/stepTypes';
import { nodeLabel } from '../../utils/nodeLabel';

export function generateGraphColoringSnapshots({ nodes, edges, m }) {
  // m is the number of colors allowed (e.g. 3)
  const snapshots = [];
  const colorAssignment = {}; // map of nodeId -> colorIndex (0, 1, 2...)
  
  const record = (type, activeNodes = [], message, activeLine) => {
    snapshots.push({
      type,
      colors: { ...colorAssignment },
      activeNodes,
      message,
      activeLine
    });
  };

  record(StepTypes.START, [], `Starting m-Coloring Problem with m = ${m} colors`, 0);

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
      record(StepTypes.COMPARE, [currentNode], `Testing colour ${c + 1} on node ${nodeLabel(currentNode)}`, 1);

      if (isSafe(currentNode, c)) {
        colorAssignment[currentNode] = c;
        record(StepTypes.PLACE, [currentNode], `Safe! Assigned colour ${c + 1} to node ${nodeLabel(currentNode)}`, 3);

        if (solveColoringUtil(nodeIndex + 1)) return true;

        // Backtrack
        delete colorAssignment[currentNode];
        record(StepTypes.REMOVE, [currentNode], `Dead end reached. Backtracking. Erased the colour from node ${nodeLabel(currentNode)}`, 5);
      } else {
        record(StepTypes.COMPARE, [currentNode], `Conflict! Colour ${c + 1} is already used by a neighbour of ${nodeLabel(currentNode)}.`, 1);
      }
    }

    return false;
  };

  if (solveColoringUtil(0)) {
    record(StepTypes.END, [], `Successfully colored the graph using ${m} colors!`, 4);
  } else {
    record(StepTypes.END, [], `No solution exists to color this graph with only ${m} colors.`, 8);
  }

  return snapshots;
}
