import { StepTypes } from '../../engine/stepTypes';

// Helpers
const getNeighbors = (node, grid) => {
  const neighbors = [];
  const { row, col } = node;
  const numRows = grid.length;
  const numCols = grid[0].length;
  
  if (row > 0) neighbors.push(grid[row - 1][col]); // up
  if (row < numRows - 1) neighbors.push(grid[row + 1][col]); // down
  if (col > 0) neighbors.push(grid[row][col - 1]); // left
  if (col < numCols - 1) neighbors.push(grid[row][col + 1]); // right
  
  return neighbors.filter(neighbor => !neighbor.isWall);
};

export function generateBFSSnapshots({ grid, startNode, endNode }) {
  const snapshots = [];
  const visitedNodes = [];
  let pathNodes = [];

  // Create a clean copy of the grid for pathfinding logic (not for snapshots)
  const logicalGrid = grid.map(row => row.map(node => ({ ...node, isVisited: false, previousNode: null })));
  
  const start = logicalGrid[startNode.row][startNode.col];
  const end = logicalGrid[endNode.row][endNode.col];

  const record = (type, currentNodes, message, isEnd = false, activeLine) => {
    snapshots.push({
      type,
      visitedNodes: [...visitedNodes],
      currentNodes,
      pathNodes: isEnd ? [...pathNodes] : [],
      message,
      activeLine
    });
  };

  record(StepTypes.START, [start], "Starting Breadth-First Search (BFS)", false, 0);

  const queue = [start];
  start.isVisited = true;

  let found = false;

  while (queue.length > 0) {
    const currentNode = queue.shift();
    visitedNodes.push({ row: currentNode.row, col: currentNode.col });

    record(StepTypes.COMPARE, [{ row: currentNode.row, col: currentNode.col }], `Exploring node at row ${currentNode.row}, col ${currentNode.col}`, false, 3);

    if (currentNode.row === end.row && currentNode.col === end.col) {
      found = true;
      record(StepTypes.COMPARE, [{ row: currentNode.row, col: currentNode.col }], `Target found!`, false, 4);
      break;
    }

    const neighbors = getNeighbors(currentNode, logicalGrid);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        neighbor.isVisited = true;
        neighbor.previousNode = currentNode;
        queue.push(neighbor);
      }
    }
  }

  // Backtrack to find the shortest path
  if (found) {
    let curr = end;
    while (curr !== null) {
      pathNodes.unshift({ row: curr.row, col: curr.col }); // Insert at beginning
      curr = curr.previousNode;
    }
    record(StepTypes.END, [], `Target found! The shortest path is ${pathNodes.length - 1} steps.`, true, -1);
  } else {
    record(StepTypes.END, [], "No path exists to the target.", true, -1);
  }

  return snapshots;
}
