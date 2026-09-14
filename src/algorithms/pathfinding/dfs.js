import { StepTypes } from '../../engine/stepTypes';

const getNeighbors = (node, grid) => {
  const neighbors = [];
  const { row, col } = node;
  const numRows = grid.length;
  const numCols = grid[0].length;
  // Order matters for DFS visualization! Right, Down, Left, Up usually looks good.
  if (col < numCols - 1) neighbors.push(grid[row][col + 1]); // right
  if (row < numRows - 1) neighbors.push(grid[row + 1][col]); // down
  if (col > 0) neighbors.push(grid[row][col - 1]); // left
  if (row > 0) neighbors.push(grid[row - 1][col]); // up
  return neighbors.filter(n => !n.isWall);
};

export function generateDFSSnapshots({ grid, startNode, endNode }) {
  const snapshots = [];
  const visitedNodes = [];
  let pathNodes = [];

  const logicalGrid = grid.map(row => row.map(node => ({ ...node, isVisited: false, previousNode: null })));
  
  const start = logicalGrid[startNode.row][startNode.col];
  const end = logicalGrid[endNode.row][endNode.col];

  const record = (type, currentNodes, message, isEnd = false) => {
    snapshots.push({ type, visitedNodes: [...visitedNodes], currentNodes, pathNodes: isEnd ? [...pathNodes] : [], message });
  };

  record(StepTypes.START, [start], "Starting Depth-First Search (DFS)");

  const stack = [start];
  let found = false;

  while (stack.length > 0) {
    const currentNode = stack.pop();

    if (!currentNode.isVisited) {
      currentNode.isVisited = true;
      visitedNodes.push({ row: currentNode.row, col: currentNode.col });

      record(StepTypes.COMPARE, [{ row: currentNode.row, col: currentNode.col }], `Plunging deep into node at row ${currentNode.row}, col ${currentNode.col}`);

      if (currentNode.row === end.row && currentNode.col === end.col) {
        found = true;
        break;
      }

      const neighbors = getNeighbors(currentNode, logicalGrid);
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited) {
          neighbor.previousNode = currentNode;
          stack.push(neighbor);
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
    record(StepTypes.END, [], `Target found! (Warning: DFS does NOT guarantee the shortest path).`, true);
  } else {
    record(StepTypes.END, [], "No path exists to the target.", true);
  }

  return snapshots;
}
