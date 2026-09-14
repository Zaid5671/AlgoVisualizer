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
    pseudocode: `// Loop until a full pass happens without any swaps
do
  swapped = false
  // Iterate through the unsorted portion of the array
  for i = 1 to indexOfLastUnsortedElement-1
    // If the left element is heavier, they are out of order
    if leftElement > rightElement
      swap(leftElement, rightElement) // Push the heavier element to the right
      swapped = true
while swapped`
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
    pseudocode: `// Repeat for every position in the array
for i = 0 to array.length - 1
  // Assume the current position holds the minimum value
  minIndex = i
  
  // Scan the rest of the array to find the true minimum
  for j = i + 1 to array.length - 1
    if array[j] < array[minIndex]
      minIndex = j // Found a new minimum
      
  // If we found a smaller element, swap it into its final place
  if minIndex != i
    swap(array[i], array[minIndex])`
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
    pseudocode: `// Start from the second element (the first is trivially sorted)
for i = 1 to array.length - 1
  key = array[i] // The card we want to insert
  j = i - 1
  
  // Shift all elements in the sorted portion that are larger than the key
  while j >= 0 and array[j] > key
    array[j + 1] = array[j] // Shift right
    j = j - 1
    
  // Insert the key into its correct sorted position
  array[j + 1] = key`
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
    pseudocode: `// Start with a large gap, then reduce it
for gap = array.length / 2 down to 1
  // Perform a gapped insertion sort
  for i = gap to array.length - 1
    temp = array[i]
    j = i
    
    // Shift earlier gap-sorted elements up until the correct location is found
    while j >= gap and array[j - gap] > temp
      array[j] = array[j - gap]
      j = j - gap
      
    // Put temp in its correct location
    array[j] = temp`
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
    pseudocode: `// 1. DIVIDE: Break array down into arrays of size 1
split each element into partitions of size 1

// 2. CONQUER: Repeatedly merge adjacent partitions
recursively merge adjacent partitions
  // Look at the first element of both left and right partitions
  for i = leftPartIdx to rightPartIdx
    // Take the smaller element and put it into the new sorted array
    if leftPartHeadValue <= rightPartHeadValue
      copy leftPartHeadValue
    else: 
      copy rightPartHeadValue
      Increase InvIdx`
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
    pseudocode: `// 1. CHOOSE PIVOT (usually the last element)
pivot = array[high]
i = low - 1

// 2. PARTITION ARRAY
for j = low to high - 1
  // If current element is smaller than pivot
  if array[j] < pivot
    i++
    swap(array[i], array[j]) // Move smaller elements to the left
    
swap(array[i + 1], array[high]) // Place pivot in its correct sorted position

// 3. RECURSE on the left and right sub-arrays
quickSort(array, low, pivotIndex - 1)
quickSort(array, pivotIndex + 1, high)`
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
    pseudocode: `// 1. BUILD MAX HEAP
for i = Math.floor(n / 2) - 1 down to 0
  heapify(array, n, i)

// 2. EXTRACT ELEMENTS
for i = n - 1 down to 1
  // Move current root (maximum) to the end
  swap(array[0], array[i])
  
  // Call max heapify on the reduced heap
  heapify(array, i, 0)`
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
    pseudocode: `// Find the maximum number to know number of digits
max = getMax(array)

// Do counting sort for every digit. exp is 10^i where i is current digit number
for exp = 1 to max/exp > 0
  // Initialize count array and output array
  count = array of size 10 filled with 0s
  
  // Count occurrences of each digit
  for i = 0 to n - 1
    digit = (array[i] / exp) % 10
    count[digit]++
    
  // Place elements in buckets
  for i = n - 1 down to 0
    output[count[digit] - 1] = array[i]
    
  // Copy back to original array
  copy output to array`
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
    pseudocode: `// 1. Initialize a Queue with the Start Node
queue.enqueue(startNode)
startNode.isVisited = true

// 2. Explore while queue is not empty
while !queue.isEmpty()
  currentNode = queue.dequeue()
  
  // 3. Check if we reached the target
  if currentNode == endNode
    return backtrackPath(currentNode)
    
  // 4. Explore all valid, unvisited neighbors
  for neighbor in getNeighbors(currentNode)
    if !neighbor.isVisited and !neighbor.isWall
      neighbor.isVisited = true
      neighbor.previousNode = currentNode
      queue.enqueue(neighbor)`
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
    pseudocode: `// 1. Set all distances to infinity, start node to 0
for each node in grid
  node.distance = infinity
startNode.distance = 0

// 2. Explore unvisited nodes
while unvisited nodes remain
  // Sort to find the closest node (Priority Queue)
  currentNode = node with lowest distance
  
  if currentNode == endNode
    return backtrackPath(currentNode)
    
  // 3. Update distances to neighbors
  for neighbor in getNeighbors(currentNode)
    if !neighbor.isWall and !neighbor.isVisited
      newDistance = currentNode.distance + neighbor.weight // 1 for empty, 5 for mud
      if newDistance < neighbor.distance
        neighbor.distance = newDistance
        neighbor.previousNode = currentNode`
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
    pseudocode: `// 1. Initialize g (distance) and f (g + heuristic)
startNode.g = 0
startNode.f = heuristic(startNode, endNode)

while unvisited nodes remain
  // Pick node with lowest f-score
  currentNode = node with lowest f
  
  if currentNode == endNode
    return backtrackPath(currentNode)
    
  for neighbor in getNeighbors(currentNode)
    if !neighbor.isWall and !neighbor.isVisited
      // tentative_g is the distance from start to neighbor
      tentative_g = currentNode.g + neighbor.weight
      
      if tentative_g < neighbor.g
        neighbor.g = tentative_g
        neighbor.f = neighbor.g + heuristic(neighbor, endNode)
        neighbor.previousNode = currentNode`
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
    pseudocode: `// 1. Initialize a Stack with the Start Node
stack.push(startNode)

// 2. Explore while stack is not empty
while !stack.isEmpty()
  currentNode = stack.pop()
  
  if !currentNode.isVisited
    currentNode.isVisited = true
    
    if currentNode == endNode
      return backtrackPath(currentNode) // Does NOT guarantee shortest path
      
    // 3. Push unvisited neighbors onto the stack
    for neighbor in getNeighbors(currentNode)
      if !neighbor.isVisited and !neighbor.isWall
        neighbor.previousNode = currentNode
        stack.push(neighbor)`
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
    pseudocode: `// 1. Initialize h (heuristic)
startNode.h = heuristic(startNode, endNode)

while unvisited nodes remain
  // Pick node that looks closest to the target
  currentNode = node with lowest h
  
  if currentNode == endNode
    return backtrackPath(currentNode) // Does NOT guarantee shortest path
    
  for neighbor in getNeighbors(currentNode)
    if !neighbor.isWall and !neighbor.isVisited
      if neighbor.h is infinity
        neighbor.h = heuristic(neighbor, endNode)
        neighbor.previousNode = currentNode`
  },
  bfsGraph: {
    id: 'bfsGraph',
    name: 'Breadth-First Search (Graph)',
    category: 'Graph',
    description: 'Explores an abstract graph equally in all directions, radiating outwards from the start node.',
    complexity: { best: 'O(1)', avg: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)' },
    generator: generateBFSGraphSnapshots,
    pseudocode: `// 1. Initialize a Queue with the Start Node\nqueue.enqueue(startNode)\nstartNode.isVisited = true\n\n// 2. Explore while queue is not empty\nwhile !queue.isEmpty()\n  currentNode = queue.dequeue()\n  \n  // 3. Explore all connected edges\n  for edge of getConnectedEdges(currentNode)\n    neighbor = edge.target\n    if !neighbor.isVisited\n      neighbor.isVisited = true\n      queue.enqueue(neighbor)`
  },
  dfsGraph: {
    id: 'dfsGraph',
    name: 'Depth-First Search (Graph)',
    category: 'Graph',
    description: 'Plunges deep into a graph along a single path until it hits a dead end, then backtracks.',
    complexity: { best: 'O(1)', avg: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)' },
    generator: generateDFSGraphSnapshots,
    pseudocode: `// 1. Initialize a Stack with Start Node\nstack.push(startNode)\n\n// 2. Explore while stack is not empty\nwhile !stack.isEmpty()\n  currentNode = stack.pop()\n  if !currentNode.isVisited\n    currentNode.isVisited = true\n    // 3. Push unvisited neighbors\n    for neighbor of getNeighbors(currentNode)\n      if !neighbor.isVisited\n        stack.push(neighbor)`
  },
  kruskals: {
    id: 'kruskals',
    name: 'Kruskal\'s MST',
    category: 'Graph',
    description: 'Finds a Minimum Spanning Tree by globally sorting all edges from cheapest to most expensive, adding them one by one as long as they don\'t create a loop.',
    complexity: { best: 'O(E log E)', avg: 'O(E log E)', worst: 'O(E log E)', space: 'O(V)' },
    generator: generateKruskalsSnapshots,
    pseudocode: `// 1. Sort all edges by weight\nsortedEdges = edges.sortBy(weight)\n\n// 2. Iterate through sorted edges\nfor edge of sortedEdges\n  // 3. Check if it creates a cycle (Union-Find)\n  if !createsCycle(edge.source, edge.target)\n    add to MST\n    union(edge.source, edge.target)`
  },
  prims: {
    id: 'prims',
    name: 'Prim\'s MST',
    category: 'Graph',
    description: 'Finds a Minimum Spanning Tree by starting at a single node and growing the tree outward, always picking the cheapest edge that connects the tree to a new node.',
    complexity: { best: 'O(E log V)', avg: 'O(E log V)', worst: 'O(E log V)', space: 'O(V)' },
    generator: generatePrimsSnapshots,
    pseudocode: `// 1. Start with a single node\nvisited.add(startNode)\n\n// 2. Loop until all nodes visited\nwhile (visited.size < nodes.length)\n  // 3. Find cheapest edge leaving the visited set\n  cheapestEdge = getCheapestOutwardEdge(visited)\n  visited.add(cheapestEdge.target)\n  addToMST(cheapestEdge)`
  },
  dijkstraGraph: {
    id: 'dijkstraGraph',
    name: 'Dijkstra\'s Algorithm',
    category: 'Graph',
    description: 'Calculates the shortest path from the start node to all other reachable nodes. Cannot handle negative edge weights.',
    complexity: { best: 'O(1)', avg: 'O(E log V)', worst: 'O(E log V)', space: 'O(V)' },
    generator: generateDijkstraGraphSnapshots,
    pseudocode: `// 1. Initialize distances to infinity\ndistances = { node: infinity... }\ndistances[startNode] = 0\n\n// 2. Explore unvisited nodes\nwhile unvisited nodes remain\n  currentNode = node with lowest distance\n  \n  // 3. Update distances to neighbors\n  for edge of getNeighbors(currentNode)\n    newDistance = distances[currentNode] + edge.weight\n    if newDistance < distances[edge.target]\n      distances[edge.target] = newDistance`
  },
  bellmanFord: {
    id: 'bellmanFord',
    name: 'Bellman-Ford',
    category: 'Graph',
    description: 'Calculates shortest paths like Dijkstra, but can handle negative edge weights by relaxing all edges |V| - 1 times.',
    complexity: { best: 'O(E)', avg: 'O(V * E)', worst: 'O(V * E)', space: 'O(V)' },
    generator: generateBellmanFordSnapshots,
    pseudocode: `// 1. Initialize distances to infinity\ndistances = { node: infinity... }\ndistances[startNode] = 0\n\n// 2. Relax all edges |V| - 1 times\nfor i from 1 to |V| - 1\n  for edge of allEdges\n    if distances[edge.source] + edge.weight < distances[edge.target]\n      distances[edge.target] = distances[edge.source] + edge.weight\n\n// 3. Check for negative cycles\nfor edge of allEdges\n  if distances[edge.source] + edge.weight < distances[edge.target]\n    ERROR: Negative cycle detected!`
  },
  tarjans: {
    id: 'tarjans',
    name: 'Tarjan\'s SCC',
    category: 'Graph',
    description: 'Finds Strongly Connected Components (clusters where every node can reach every other node) using a single DFS pass with low-link values.',
    complexity: { best: 'O(V + E)', avg: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)' },
    generator: generateTarjansSnapshots,
    pseudocode: `// 1. DFS traversal tracking IDs and Low-Links\ndef dfs(node):\n  node.id = node.low = id++\n  stack.push(node)\n  \n  // 2. Explore neighbors\n  for neighbor of node.neighbors\n    if neighbor not visited\n      dfs(neighbor)\n      node.low = min(node.low, neighbor.low)\n    else if neighbor on stack (back edge)\n      node.low = min(node.low, neighbor.id)\n      \n  // 3. Pop SCC if root found\n  if node.id == node.low\n    pop from stack until node is popped`
  },
  nQueens: {
    id: 'nQueens',
    name: 'N-Queens',
    category: 'Backtracking',
    description: 'Places N queens on an NxN chessboard so that no two queens threaten each other. Demonstrates classic backtracking by exploring paths and undoing bad placements.',
    complexity: { best: 'O(1)', avg: 'O(N!)', worst: 'O(N!)', space: 'O(N)' },
    generator: generateNQueensSnapshots,
    pseudocode: `// 1. Try placing a queen in current column\nfor row from 0 to N-1\n  if isSafe(row, col)\n    board[row][col] = Queen\n    \n    // 2. Recursively solve for next column\n    if solve(col + 1) == true\n      return true\n      \n    // 3. Backtrack! (Undo choice)\n    board[row][col] = Empty\n\nreturn false`
  },
  sudoku: {
    id: 'sudoku',
    name: 'Sudoku Solver',
    category: 'Backtracking',
    description: 'Solves a 9x9 Sudoku grid by trying digits 1-9 in empty cells. If a digit causes a conflict later, it backtracks and tries the next digit.',
    complexity: { best: 'O(1)', avg: 'O(9^(EmptyCells))', worst: 'O(9^(EmptyCells))', space: 'O(EmptyCells)' },
    generator: generateSudokuSnapshots,
    pseudocode: `// 1. Find next empty cell\nif no empty cells\n  return true // Solved!\n\n// 2. Try digits 1 through 9\nfor num from 1 to 9\n  if isSafe(row, col, num)\n    board[row][col] = num\n    \n    if solve() == true\n      return true\n      \n    // 3. Backtrack!\n    board[row][col] = Empty\n\nreturn false`
  },
  graphColoring: {
    id: 'graphColoring',
    name: 'Graph m-Coloring',
    category: 'Backtracking',
    description: 'Assigns up to m colors to graph nodes such that no two connected nodes share the same color. If it hits a dead end, it backtracks to try different color combinations.',
    complexity: { best: 'O(1)', avg: 'O(m^V)', worst: 'O(m^V)', space: 'O(V)' },
    generator: generateGraphColoringSnapshots,
    pseudocode: `// 1. Base case: all nodes colored\nif nodeIndex == N\n  return true\n\n// 2. Try all possible m colors for current node\nfor color from 0 to m-1\n  if isSafe(node, color)\n    colorAssignment[node] = color\n    \n    if solve(nodeIndex + 1) == true\n      return true\n      \n    // 3. Backtrack!\n    remove colorAssignment[node]\n\nreturn false`
  }
};
