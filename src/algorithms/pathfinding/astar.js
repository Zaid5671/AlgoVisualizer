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

// Manhattan distance heuristic
const manhattanDistance = (nodeA, nodeB) => {
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
};

export function generateAStarSnapshots({ grid, startNode, endNode }) {
  const snapshots = [];
  const visitedNodes = [];
  let pathNodes = [];

  const logicalGrid = grid.map(row => row.map(node => ({ 
    ...node, 
    g: Infinity, // Distance from start
    f: Infinity, // g + heuristic
    isVisited: false, 
    previousNode: null 
  })));
  
  const start = logicalGrid[startNode.row][startNode.col];
  const end = logicalGrid[endNode.row][endNode.col];
  
  start.g = 0;
  start.f = manhattanDistance(start, end);

  const record = (type, currentNodes, message, isEnd = false, activeLine) => {
    snapshots.push({ type, visitedNodes: [...visitedNodes], currentNodes, pathNodes: isEnd ? [...pathNodes] : [], message, activeLine });
  };

  record(StepTypes.START, [start], "Starting A* Search (Heuristic: Manhattan Distance)", false, 0);

  const unvisitedNodes = [];
  for (const row of logicalGrid) {
    for (const node of row) {
      if (!node.isWall) unvisitedNodes.push(node);
    }
  }

  let found = false;

  while (unvisitedNodes.length > 0) {
    // Sort by f-score (g + heuristic)
    unvisitedNodes.sort((a, b) => a.f - b.f);
    const closestNode = unvisitedNodes.shift();

    // If f is infinity, we're trapped
    if (closestNode.f === Infinity) break;

    closestNode.isVisited = true;
    visitedNodes.push({ row: closestNode.row, col: closestNode.col });

    record(StepTypes.COMPARE, [{ row: closestNode.row, col: closestNode.col }], `Exploring node with lowest f-score: ${closestNode.f} (Distance: ${closestNode.g}, Heuristic: ${closestNode.f - closestNode.g})`, false, 4);

    if (closestNode.row === end.row && closestNode.col === end.col) {
      found = true;
      record(StepTypes.COMPARE, [{ row: closestNode.row, col: closestNode.col }], `Target found!`, false, 5);
      break;
    }

    const neighbors = getNeighbors(closestNode, logicalGrid);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        const tentativeG = closestNode.g + neighbor.weight;
        if (tentativeG < neighbor.g) {
          neighbor.previousNode = closestNode;
          neighbor.g = tentativeG;
          neighbor.f = neighbor.g + manhattanDistance(neighbor, end);
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
    record(StepTypes.END, [], `Target found! The shortest path is ${pathNodes.length - 1} steps.`, true, -1);
  } else {
    record(StepTypes.END, [], "No path exists to the target.", true, -1);
  }

  return snapshots;
}
