import { generateBubbleSortSnapshots } from '../algorithms/sorting/bubbleSort';
import { generateMergeSortSnapshots } from '../algorithms/sorting/mergeSort';
import { generateSelectionSortSnapshots } from '../algorithms/sorting/selectionSort';
import { generateInsertionSortSnapshots } from '../algorithms/sorting/insertionSort';
import { generateShellSortSnapshots } from '../algorithms/sorting/shellSort';
import { generateQuickSortSnapshots } from '../algorithms/sorting/quickSort';
import { generateHeapSortSnapshots } from '../algorithms/sorting/heapSort';
import { generateRadixSortSnapshots } from '../algorithms/sorting/radixSort';
import { generateBFSSnapshots } from '../algorithms/pathfinding/bfs';
import { generateDijkstraSnapshots } from '../algorithms/pathfinding/dijkstra';
import { generateAStarSnapshots } from '../algorithms/pathfinding/astar';
import { generateDFSSnapshots } from '../algorithms/pathfinding/dfs';
import { generateGreedyBFSSnapshots } from '../algorithms/pathfinding/greedyBFS';
import { generateBFSGraphSnapshots } from '../algorithms/graph/bfsGraph';
import { generateDFSGraphSnapshots } from '../algorithms/graph/dfsGraph';
import { generateKruskalsSnapshots } from '../algorithms/graph/kruskals';
import { generatePrimsSnapshots } from '../algorithms/graph/prims';
import { generateDijkstraGraphSnapshots } from '../algorithms/graph/dijkstraGraph';
import { generateBellmanFordSnapshots } from '../algorithms/graph/bellmanFord';
import { generateTarjansSnapshots } from '../algorithms/graph/tarjans';
import { generateNQueensSnapshots } from '../algorithms/backtracking/nQueens';
import { generateSudokuSnapshots } from '../algorithms/backtracking/sudoku';
import { generateGraphColoringSnapshots } from '../algorithms/backtracking/graphColoring';

export const ALGORITHMS = {
// ... preserving existing ALGORITHMS ...
  bubbleSort: {
    id: 'bubbleSort',
    name: 'Bubble Sort',
    category: 'Sorting',
    description: 'Repeatedly steps through the list, swapping adjacent elements that are out of order. Stable. Best case hits O(n) when the array is already sorted and a pass makes zero swaps.',
    complexity: {
      best: 'O(n)',
      avg: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)'
    },
    generator: generateBubbleSortSnapshots,
    pseudocode: `for (let i = 0; i < N; i++) {
  let swapped = false;
  for (let j = 0; j < N - i - 1; j++) {
    if (arr[j] > arr[j + 1]) {
      swap(arr[j], arr[j + 1]);
      swapped = true;
    }
  }
  if (!swapped) break;
}`
  },
  selectionSort: {
    id: 'selectionSort',
    name: 'Selection Sort',
    category: 'Sorting',
    description: 'Divides the array into a sorted and unsorted region. Repeatedly selects the smallest element from the unsorted region and swaps it into the sorted region. Not stable.',
    complexity: {
      best: 'O(n²)',
      avg: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)'
    },
    generator: generateSelectionSortSnapshots,
    pseudocode: `for (let i = 0; i < N - 1; i++) {
  let minIndex = i;
  for (let j = i + 1; j < N; j++) {
    if (arr[j] < arr[minIndex]) {
      minIndex = j;
    }
  }
  if (minIndex !== i) {
    swap(arr[i], arr[minIndex]);
  }
}`
  },
  insertionSort: {
    id: 'insertionSort',
    name: 'Insertion Sort',
    category: 'Sorting',
    description: 'Builds the sorted array one element at a time by picking the next element and inserting it into its correct position among the already sorted elements. Stable.',
    complexity: {
      best: 'O(n)',
      avg: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)'
    },
    generator: generateInsertionSortSnapshots,
    pseudocode: `for (let i = 1; i < N; i++) {
  let key = arr[i];
  let j = i - 1;
  while (j >= 0 && arr[j] > key) {
    arr[j + 1] = arr[j];
    j--;
  }
  arr[j + 1] = key;
}`
  },
  shellSort: {
    id: 'shellSort',
    name: 'Shell Sort',
    category: 'Sorting',
    description: 'An optimization of Insertion Sort that allows the exchange of items that are far apart. It sorts elements at a specific interval, gradually reducing the interval (gap) until it reaches 1.',
    complexity: {
      best: 'O(n log n)',
      avg: 'O(n(log n)²)',
      worst: 'O(n²)',
      space: 'O(1)'
    },
    generator: generateShellSortSnapshots,
    pseudocode: `for (let gap = floor(N / 2); gap > 0; gap = floor(gap / 2)) {
  for (let i = gap; i < N; i++) {
    let temp = arr[i];
    let j = i;
    while (j >= gap && arr[j - gap] > temp) {
      arr[j] = arr[j - gap];
      j -= gap;
    }
    arr[j] = temp;
  }
}`
  },
  mergeSort: {
    id: 'mergeSort',
    name: 'Merge Sort',
    category: 'Sorting',
    description: 'Divides the array into halves, recursively sorts them, and then merges the sorted halves. Stable. Guarantees O(n log n) performance regardless of the input distribution.',
    complexity: {
      best: 'O(n log n)',
      avg: 'O(n log n)',
      worst: 'O(n log n)',
      space: 'O(n)'
    },
    generator: generateMergeSortSnapshots,
    pseudocode: `function mergeSort(arr, left, right) {
  if (left >= right) return;
  let mid = floor((left + right) / 2);
  mergeSort(arr, left, mid);
  mergeSort(arr, mid + 1, right);
  merge(arr, left, mid, right);
}

function merge(arr, left, mid, right) {
  let temp = [];
  let i = left, j = mid + 1;
  while (i <= mid && j <= right) {
    if (arr[i] <= arr[j]) temp.push(arr[i++]);
    else temp.push(arr[j++]);
  }
  while (i <= mid) temp.push(arr[i++]);
  while (j <= right) temp.push(arr[j++]);
  copy(temp, arr, left, right);
}`
  },
  quickSort: {
    id: 'quickSort',
    name: 'Quick Sort',
    category: 'Sorting',
    description: 'Picks an element as pivot and partitions the given array around the picked pivot. Highly efficient in practice.',
    complexity: {
      best: 'O(n log n)',
      avg: 'O(n log n)',
      worst: 'O(n²)',
      space: 'O(log n)'
    },
    generator: generateQuickSortSnapshots,
    pseudocode: `function quickSort(arr, low, high) {
  if (low >= high) return;
  let pivotIndex = partition(arr, low, high);
  quickSort(arr, low, pivotIndex - 1);
  quickSort(arr, pivotIndex + 1, high);
}

function partition(arr, low, high) {
  let pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      swap(arr[i], arr[j]);
    }
  }
  swap(arr[i + 1], arr[high]);
  return i + 1;
}`
  },
  heapSort: {
    id: 'heapSort',
    name: 'Heap Sort',
    category: 'Sorting',
    description: 'A comparison-based sorting technique based on Binary Heap data structure. It builds a max-heap and repeatedly extracts the maximum element.',
    complexity: {
      best: 'O(n log n)',
      avg: 'O(n log n)',
      worst: 'O(n log n)',
      space: 'O(1)'
    },
    generator: generateHeapSortSnapshots,
    pseudocode: `for (let i = floor(N / 2) - 1; i >= 0; i--) {
  heapify(arr, N, i);
}
for (let i = N - 1; i > 0; i--) {
  swap(arr[0], arr[i]);
  heapify(arr, i, 0);
}

function heapify(arr, size, rootIndex) {
  let largest = rootIndex;
  let left = 2 * rootIndex + 1;
  let right = 2 * rootIndex + 2;
  if (left < size && arr[left] > arr[largest]) largest = left;
  if (right < size && arr[right] > arr[largest]) largest = right;
  if (largest !== rootIndex) {
    swap(arr[rootIndex], arr[largest]);
    heapify(arr, size, largest);
  }
}`
  },
  radixSort: {
    id: 'radixSort',
    name: 'Radix Sort',
    category: 'Sorting',
    description: 'A non-comparative sorting algorithm. It avoids comparison by creating and distributing elements into buckets according to their radix (digits).',
    complexity: {
      best: 'O(nk)',
      avg: 'O(nk)',
      worst: 'O(nk)',
      space: 'O(n + k)'
    },
    generator: generateRadixSortSnapshots,
    pseudocode: `let max = getMax(arr);
for (let exp = 1; floor(max / exp) > 0; exp *= 10) {
  let output = new Array(N);
  let count = new Array(10).fill(0);
  for (let i = 0; i < N; i++) {
    let digit = floor(arr[i] / exp) % 10;
    count[digit]++;
  }
  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1];
  }
  for (let i = N - 1; i >= 0; i--) {
    let digit = floor(arr[i] / exp) % 10;
    output[count[digit] - 1] = arr[i];
    count[digit]--;
  }
  for (let i = 0; i < N; i++) arr[i] = output[i];
}`
  },
  bfs: {
    id: 'bfs',
    name: 'Breadth-First Search',
    category: 'Pathfinding',
    description: 'Explores equally in all directions. Guarantees the shortest path on an unweighted grid.',
    complexity: {
      best: 'O(1)',
      avg: 'O(V + E)',
      worst: 'O(V + E)',
      space: 'O(V)'
    },
    generator: generateBFSSnapshots,
    pseudocode: `queue.enqueue(startNode);
startNode.isVisited = true;
while (!queue.isEmpty()) {
  let currentNode = queue.dequeue();
  if (currentNode === endNode) return backtrackPath(currentNode);
  for (let neighbor of getNeighbors(currentNode)) {
    if (!neighbor.isVisited && !neighbor.isWall) {
      neighbor.isVisited = true;
      neighbor.previousNode = currentNode;
      queue.enqueue(neighbor);
    }
  }
}`
  },
  dijkstra: {
    id: 'dijkstra',
    name: 'Dijkstra\'s Algorithm',
    category: 'Pathfinding',
    description: 'The father of pathfinding. Explores based on distance. Because our initial grid will be unweighted (just walls and empty space), Dijkstra will visibly behave exactly like BFS. This is an excellent educational demonstration of how they are mathematically equivalent without weights!',
    complexity: {
      best: 'O(1)',
      avg: 'O(E log V)',
      worst: 'O(E log V)',
      space: 'O(V)'
    },
    generator: generateDijkstraSnapshots,
    pseudocode: `for (let node of grid) node.distance = Infinity;
startNode.distance = 0;
while (unvisitedNodes.length > 0) {
  let currentNode = getClosestNode(unvisitedNodes);
  if (currentNode === endNode) return backtrackPath(currentNode);
  for (let neighbor of getNeighbors(currentNode)) {
    if (!neighbor.isWall && !neighbor.isVisited) {
      let newDist = currentNode.distance + neighbor.weight;
      if (newDist < neighbor.distance) {
        neighbor.distance = newDist;
        neighbor.previousNode = currentNode;
      }
    }
  }
}`
  },
  astar: {
    id: 'astar',
    name: 'A* Search',
    category: 'Pathfinding',
    description: 'The industry standard. Uses a heuristic (guessing the distance to the target) to prioritize promising nodes. Its speed depends heavily on the heuristic and the grid complexity.',
    complexity: {
      best: 'O(1)',
      avg: 'O(E)',
      worst: 'O(E)',
      space: 'O(V)'
    },
    generator: generateAStarSnapshots,
    pseudocode: `for (let node of grid) { node.g = Infinity; node.f = Infinity; }
startNode.g = 0;
startNode.f = heuristic(startNode, endNode);
while (openSet.length > 0) {
  let currentNode = getLowestFNode(openSet);
  if (currentNode === endNode) return backtrackPath(currentNode);
  for (let neighbor of getNeighbors(currentNode)) {
    if (neighbor.isWall || neighbor.isClosed) continue;
    let tempG = currentNode.g + neighbor.weight;
    if (tempG < neighbor.g) {
      neighbor.previousNode = currentNode;
      neighbor.g = tempG;
      neighbor.f = tempG + heuristic(neighbor, endNode);
      if (!openSet.includes(neighbor)) openSet.push(neighbor);
    }
  }
}`
  },
  dfs: {
    id: 'dfs',
    name: 'Depth-First Search',
    category: 'Pathfinding',
    description: 'A terrible algorithm for pathfinding, but amazing to visualize because it blindly plunges down one path until it hits a dead end, then backtracks.',
    complexity: {
      best: 'O(1)',
      avg: 'O(V + E)',
      worst: 'O(V + E)',
      space: 'O(V)'
    },
    generator: generateDFSSnapshots,
    pseudocode: `stack.push(startNode);
while (!stack.isEmpty()) {
  let currentNode = stack.pop();
  if (!currentNode.isVisited) {
    currentNode.isVisited = true;
    if (currentNode === endNode) return backtrackPath(currentNode);
    for (let neighbor of getNeighbors(currentNode)) {
      if (!neighbor.isVisited && !neighbor.isWall) {
        neighbor.previousNode = currentNode;
        stack.push(neighbor);
      }
    }
  }
}`
  },
  greedyBFS: {
    id: 'greedyBFS',
    name: 'Greedy Best-First',
    category: 'Pathfinding',
    description: 'A faster version of A* that relies *only* on the heuristic. It is blazing fast but doesn\'t guarantee the shortest path.',
    complexity: {
      best: 'O(1)',
      avg: 'O(E log V)',
      worst: 'O(E log V)',
      space: 'O(V)'
    },
    generator: generateGreedyBFSSnapshots,
    pseudocode: `startNode.h = heuristic(startNode, endNode);
while (unvisitedNodes.length > 0) {
  let currentNode = getLowestHNode(unvisitedNodes);
  if (currentNode === endNode) return backtrackPath(currentNode);
  for (let neighbor of getNeighbors(currentNode)) {
    if (!neighbor.isWall && !neighbor.isVisited) {
      if (neighbor.h === Infinity) {
        neighbor.h = heuristic(neighbor, endNode);
        neighbor.previousNode = currentNode;
      }
    }
  }
}`
  },
  bfsGraph: {
    id: 'bfsGraph',
    name: 'Breadth-First Search (Graph)',
    category: 'Graph',
    description: 'Explores an abstract graph equally in all directions, radiating outwards from the start node.',
    complexity: { best: 'O(1)', avg: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)' },
    generator: generateBFSGraphSnapshots,
    pseudocode: `queue.enqueue(startNode);
startNode.isVisited = true;
while (!queue.isEmpty()) {
  let currentNode = queue.dequeue();
  for (let edge of getConnectedEdges(currentNode)) {
    let neighbor = edge.target;
    if (!neighbor.isVisited) {
      neighbor.isVisited = true;
      queue.enqueue(neighbor);
    }
  }
}`
  },
  dfsGraph: {
    id: 'dfsGraph',
    name: 'Depth-First Search (Graph)',
    category: 'Graph',
    description: 'Plunges deep into a graph along a single path until it hits a dead end, then backtracks.',
    complexity: { best: 'O(1)', avg: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)' },
    generator: generateDFSGraphSnapshots,
    pseudocode: `stack.push(startNode);
while (!stack.isEmpty()) {
  let currentNode = stack.pop();
  if (!currentNode.isVisited) {
    currentNode.isVisited = true;
    for (let neighbor of getNeighbors(currentNode)) {
      if (!neighbor.isVisited) stack.push(neighbor);
    }
  }
}`
  },
  kruskals: {
    id: 'kruskals',
    name: 'Kruskal\'s MST',
    category: 'Graph',
    description: 'Finds a Minimum Spanning Tree by globally sorting all edges from cheapest to most expensive, adding them one by one as long as they don\'t create a loop.',
    complexity: { best: 'O(E log E)', avg: 'O(E log E)', worst: 'O(E log E)', space: 'O(V)' },
    generator: generateKruskalsSnapshots,
    pseudocode: `let sortedEdges = edges.sort((a, b) => a.weight - b.weight);
for (let edge of sortedEdges) {
  if (!createsCycle(edge.source, edge.target)) {
    addToMST(edge);
    union(edge.source, edge.target);
  }
}`
  },
  prims: {
    id: 'prims',
    name: 'Prim\'s MST',
    category: 'Graph',
    description: 'Finds a Minimum Spanning Tree by starting at a single node and growing the tree outward, always picking the cheapest edge that connects the tree to a new node.',
    complexity: { best: 'O(E log V)', avg: 'O(E log V)', worst: 'O(E log V)', space: 'O(V)' },
    generator: generatePrimsSnapshots,
    pseudocode: `visited.add(startNode);
while (visited.size < nodes.length) {
  let cheapestEdge = getCheapestOutwardEdge(visited);
  if (!cheapestEdge) break;
  visited.add(cheapestEdge.target);
  addToMST(cheapestEdge);
}`
  },
  dijkstraGraph: {
    id: 'dijkstraGraph',
    name: 'Dijkstra\'s Algorithm',
    category: 'Graph',
    description: 'Calculates the shortest path from the start node to all other reachable nodes. Cannot handle negative edge weights.',
    complexity: { best: 'O(1)', avg: 'O(E log V)', worst: 'O(E log V)', space: 'O(V)' },
    generator: generateDijkstraGraphSnapshots,
    pseudocode: `for (let node of nodes) distances[node] = Infinity;
distances[startNode] = 0;
while (unvisitedNodes.length > 0) {
  let currentNode = getLowestDistanceNode(unvisitedNodes);
  for (let edge of getNeighbors(currentNode)) {
    let newDist = distances[currentNode] + edge.weight;
    if (newDist < distances[edge.target]) {
      distances[edge.target] = newDist;
    }
  }
}`
  },
  bellmanFord: {
    id: 'bellmanFord',
    name: 'Bellman-Ford',
    category: 'Graph',
    description: 'Calculates shortest paths like Dijkstra, but can handle negative edge weights by relaxing all edges |V| - 1 times.',
    complexity: { best: 'O(E)', avg: 'O(V * E)', worst: 'O(V * E)', space: 'O(V)' },
    generator: generateBellmanFordSnapshots,
    pseudocode: `for (let node of nodes) distances[node] = Infinity;
distances[startNode] = 0;
for (let i = 1; i < V; i++) {
  for (let edge of allEdges) {
    if (distances[edge.source] + edge.weight < distances[edge.target]) {
      distances[edge.target] = distances[edge.source] + edge.weight;
    }
  }
}
for (let edge of allEdges) {
  if (distances[edge.source] + edge.weight < distances[edge.target]) {
    throw Error("Negative cycle detected!");
  }
}`
  },
  tarjans: {
    id: 'tarjans',
    name: 'Tarjan\'s SCC',
    category: 'Graph',
    description: 'Finds Strongly Connected Components (clusters where every node can reach every other node) using a single DFS pass with low-link values.',
    complexity: { best: 'O(V + E)', avg: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)' },
    generator: generateTarjansSnapshots,
    pseudocode: `function dfs(node) {
  node.id = node.low = id++;
  stack.push(node);
  for (let neighbor of getNeighbors(node)) {
    if (!neighbor.visited) {
      dfs(neighbor);
      node.low = Math.min(node.low, neighbor.low);
    } else if (stack.includes(neighbor)) {
      node.low = Math.min(node.low, neighbor.id);
    }
  }
  if (node.id === node.low) {
    popFromStackUntil(node);
  }
}`
  },
  nQueens: {
    id: 'nQueens',
    name: 'N-Queens',
    category: 'Backtracking',
    description: 'Places N queens on an NxN chessboard so that no two queens threaten each other. Demonstrates classic backtracking by exploring paths and undoing bad placements.',
    complexity: { best: 'O(1)', avg: 'O(N!)', worst: 'O(N!)', space: 'O(N)' },
    generator: generateNQueensSnapshots,
    pseudocode: `for (let row = 0; row < N; row++) {
  if (isSafe(row, col)) {
    board[row][col] = "Q";
    if (solve(col + 1)) {
      return true;
    }
    board[row][col] = ".";
  }
}
return false;`
  },
  sudoku: {
    id: 'sudoku',
    name: 'Sudoku Solver',
    category: 'Backtracking',
    description: 'Solves a 9x9 Sudoku grid by trying digits 1-9 in empty cells. If a digit causes a conflict later, it backtracks and tries the next digit.',
    complexity: { best: 'O(1)', avg: 'O(9^(EmptyCells))', worst: 'O(9^(EmptyCells))', space: 'O(EmptyCells)' },
    generator: generateSudokuSnapshots,
    pseudocode: `if (noEmptyCells) return true;
for (let num = 1; num <= 9; num++) {
  if (isSafe(row, col, num)) {
    board[row][col] = num;
    if (solve()) return true;
    board[row][col] = Empty;
  }
}
return false;`
  },
  graphColoring: {
    id: 'graphColoring',
    name: 'Graph m-Coloring',
    category: 'Backtracking',
    description: 'Assigns up to m colors to graph nodes such that no two connected nodes share the same color. If it hits a dead end, it backtracks to try different color combinations.',
    complexity: { best: 'O(1)', avg: 'O(m^V)', worst: 'O(m^V)', space: 'O(V)' },
    generator: generateGraphColoringSnapshots,
    pseudocode: `if (nodeIndex === N) return true;
for (let color = 0; color < m; color++) {
  if (isSafe(node, color)) {
    colors[node] = color;
    if (solve(nodeIndex + 1)) return true;
    colors[node] = null;
  }
}
return false;`
  }
};
