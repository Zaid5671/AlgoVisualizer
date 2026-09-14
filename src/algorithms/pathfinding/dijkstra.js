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

export function generateDijkstraSnapshots({ grid, startNode, endNode }) {
  const snapshots = [];
  const visitedNodes = [];
  let pathNodes = [];

  const logicalGrid = grid.map(row => row.map(node => ({ 
    ...node, 
    distance: Infinity, 
    isVisited: false, 
    previousNode: null 
  })));
  
  const start = logicalGrid[startNode.row][startNode.col];
  const end = logicalGrid[endNode.row][endNode.col];
  
  start.distance = 0;

  const record = (type, currentNodes, message, isEnd = false) => {
    snapshots.push({ type, visitedNodes: [...visitedNodes], currentNodes, pathNodes: isEnd ? [...pathNodes] : [], message });
  };

  record(StepTypes.START, [start], "Starting Dijkstra's Algorithm");

  // Keep a list of all nodes to act as our unvisited set
  const unvisitedNodes = [];
  for (const row of logicalGrid) {
    for (const node of row) {
      if (!node.isWall) unvisitedNodes.push(node);
    }
  }

  let found = false;

  while (unvisitedNodes.length > 0) {
    // Sort by distance to simulate a priority queue
    unvisitedNodes.sort((a, b) => a.distance - b.distance);
    const closestNode = unvisitedNodes.shift();

    // If the closest node is at a distance of infinity, we are trapped
    if (closestNode.distance === Infinity) break;

    closestNode.isVisited = true;
    visitedNodes.push({ row: closestNode.row, col: closestNode.col });

    record(StepTypes.COMPARE, [{ row: closestNode.row, col: closestNode.col }], `Exploring node with shortest known distance: ${closestNode.distance}`);

    if (closestNode.row === end.row && closestNode.col === end.col) {
      found = true;
      break;
    }

    const neighbors = getNeighbors(closestNode, logicalGrid);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        // Distance is current node's distance + neighbor's weight (1 for empty, 5 for mud)
        const newDistance = closestNode.distance + neighbor.weight;
        if (newDistance < neighbor.distance) {
          neighbor.distance = newDistance;
          neighbor.previousNode = closestNode;
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
    record(StepTypes.END, [], `Target found! The shortest path is ${pathNodes.length - 1} steps.`, true);
  } else {
    record(StepTypes.END, [], "No path exists to the target.", true);
  }

  return snapshots;
}
