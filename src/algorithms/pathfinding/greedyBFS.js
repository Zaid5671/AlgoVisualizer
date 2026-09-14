import { StepTypes } from '../../engine/stepTypes';

const getNeighbors = (node, grid) => {
  const neighbors = [];
  const { row, col } = node;
  const numRows = grid.length;
  const numCols = grid[0].length;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < numRows - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < numCols - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter(n => !n.isWall);
};

const manhattanDistance = (nodeA, nodeB) => {
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
};

export function generateGreedyBFSSnapshots({ grid, startNode, endNode }) {
  const snapshots = [];
  const visitedNodes = [];
  let pathNodes = [];

  const logicalGrid = grid.map(row => row.map(node => ({ 
    ...node, 
    h: Infinity,
    isVisited: false, 
    previousNode: null 
  })));
  
  const start = logicalGrid[startNode.row][startNode.col];
  const end = logicalGrid[endNode.row][endNode.col];
  
  start.h = manhattanDistance(start, end);

  const record = (type, currentNodes, message, isEnd = false) => {
    snapshots.push({ type, visitedNodes: [...visitedNodes], currentNodes, pathNodes: isEnd ? [...pathNodes] : [], message });
  };

  record(StepTypes.START, [start], "Starting Greedy Best-First Search");

  const unvisitedNodes = [];
  for (const row of logicalGrid) {
    for (const node of row) {
      if (!node.isWall) unvisitedNodes.push(node);
    }
  }

  let found = false;

  while (unvisitedNodes.length > 0) {
    unvisitedNodes.sort((a, b) => a.h - b.h);
    const closestNode = unvisitedNodes.shift();

    if (closestNode.h === Infinity) break;

    closestNode.isVisited = true;
    visitedNodes.push({ row: closestNode.row, col: closestNode.col });

    record(StepTypes.COMPARE, [{ row: closestNode.row, col: closestNode.col }], `Moving to node that looks closest to target (Heuristic: ${closestNode.h})`);

    if (closestNode.row === end.row && closestNode.col === end.col) {
      found = true;
      break;
    }

    const neighbors = getNeighbors(closestNode, logicalGrid);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        // Only set previous node if we haven't seen it yet, to prevent loops
        if (neighbor.h === Infinity) {
          neighbor.previousNode = closestNode;
          neighbor.h = manhattanDistance(neighbor, end);
        }
      }
    }
  }

  if (found) {
    let curr = end;
    while (curr !== null) {
      pathNodes.unshift({ row: curr.row, col: curr.col });
      curr = curr.previousNode;
    }
    record(StepTypes.END, [], `Target found! (Warning: May not be the absolute shortest path).`, true);
  } else {
    record(StepTypes.END, [], "No path exists to the target.", true);
  }

  return snapshots;
}
