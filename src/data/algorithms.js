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
    description: 'A simple comparison-based sort that repeatedly passes through the list and swaps adjacent elements that are out of order. It is stable and sorts in place, and it can stop after a single O(n) pass when the input is already sorted.',
    properties: [
      "It only ever swaps two neighbouring elements at a time.",
      "If the list is already sorted, it notices after one pass and stops.",
      "It needs no extra memory, because it sorts the array where it is.",
      "It is too slow for large lists and is mainly used for teaching."
    ],
    applications: [
      "Teaching comparison sorting",
      "Small or nearly sorted lists",
      "Stable ordering of records"
    ],
    video: "https://www.youtube.com/results?search_query=bubble+sort+time+complexity",
        complexityDetails: {
      best: "O(n) - When the array is already sorted, Bubble Sort only makes a single pass through the array. The 'swapped' flag remains false, allowing it to break out of the outer loop immediately, resulting in a linear time complexity.",
      avg: "O(n²) - On average, each element needs to swap past roughly half the elements. It requires two nested loops to traverse the array, leading to a quadratic number of comparisons and swaps.",
      worst: "O(n²) - When the array is reverse sorted, every single element must bubble all the way to the end, resulting in the maximum number of comparisons and swaps.",
      space: "O(1) - Bubble sort only requires a single extra variable to hold the element during a swap. It sorts the array in-place without needing proportional additional memory."
    },
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
    description: 'An in-place comparison sort that splits the array into a sorted prefix and an unsorted suffix. On each pass it selects the minimum of the unsorted part and swaps it to the end of the prefix. It makes at most n − 1 swaps but is not stable.',
    properties: [
      "It always scans the whole unsorted part, even when the list is already sorted.",
      "It makes very few swaps, at most one per position.",
      "It needs no extra memory.",
      "It is useful when moving data is much more costly than comparing it."
    ],
    applications: ["Small datasets", "Memory-constrained systems", "Teaching basic sorting"],
    video: "https://www.youtube.com/results?search_query=selection+sort+algorithm",
        complexityDetails: {
      best: "O(n²) - Selection Sort always scans the entire remaining unsorted array to find the minimum element, even if the array is already sorted.",
      avg: "O(n²) - Requires two nested loops to traverse the array, leading to a quadratic number of comparisons regardless of the input distribution.",
      worst: "O(n²) - The time taken is always the same; it must make n(n-1)/2 comparisons to find the minimums.",
      space: "O(1) - It sorts the array in-place, requiring only a constant amount of extra memory for the minimum index."
    },
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
    description: 'Builds the sorted output one element at a time by inserting each new element into its correct position among those already sorted. It is stable, sorts in place, and runs in near-linear time on small or nearly sorted inputs.',
    properties: [
      "It works like sorting a hand of playing cards, inserting one card at a time.",
      "It is very fast on lists that are already almost sorted.",
      "It can sort new items as they arrive, without waiting for the whole list.",
      "Fast sorting functions in real programming languages use it for small sections of data."
    ],
    applications: ["Small datasets", "Nearly sorted data", "Online sorting"],
    video: "https://www.youtube.com/results?search_query=insertion+sort+algorithm",
        complexityDetails: {
      best: "O(n) - When the array is already sorted, the inner loop immediately terminates because the element is greater than the one before it.",
      avg: "O(n²) - On average, each element must be compared and shifted past half of the already sorted elements.",
      worst: "O(n²) - When the array is reverse sorted, every element must be shifted all the way to the beginning of the array.",
      space: "O(1) - Elements are shifted in-place, requiring only a single variable to hold the current key."
    },
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
    description: 'A generalization of Insertion Sort that first compares and swaps elements a fixed gap apart, then shrinks the gap until it reaches 1. Moving elements across long distances early on greatly reduces the work left for the final insertion pass.',
    properties: [
      "It first sorts elements that are far apart, then closes the gap step by step.",
      "This app halves the gap each round: n/2, n/4, … down to 1.",
      "Moving elements over long distances early leaves very little work for the final round.",
      "It needs no extra memory, so it suits devices with little RAM."
    ],
    applications: ["Medium-sized datasets", "Embedded systems", "Optimized insertion sort variants"],
    video: "https://www.youtube.com/results?search_query=shell+sort+algorithm",
        complexityDetails: {
      best: "O(n log n) - The best case highly depends on the gap sequence used, but generally occurs when the array is already sorted.",
      avg: "O(n(log n)²) - The average complexity is mathematically difficult to determine exactly and depends heavily on the chosen gap sequence.",
      worst: "O(n²) - With a poor gap sequence (like powers of 2), elements in odd/even positions don't mix until the final gap=1 pass, degrading to quadratic time.",
      space: "O(1) - Like insertion sort, it sorts the array in-place with a few variables for gaps and keys."
    },
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
    description: 'A divide-and-conquer sort that recursively splits the array in half, sorts each half, and merges the two sorted halves. It is stable and runs in O(n log n) time on every input, at the cost of O(n) extra space.',
    properties: [
      "It takes the same O(n log n) time whatever the input looks like.",
      "It needs extra memory the same size as the array to merge the halves.",
      "Equal elements keep their original order, which matters when sorting records by more than one field.",
      "It is used to sort huge files that don't fit in memory, and to sort linked lists."
    ],
    applications: ["Large datasets", "External sorting", "Stable sorting requirements"],
    video: "https://www.youtube.com/results?search_query=merge+sort+algorithm",
        complexityDetails: {
      best: "O(n log n) - Merge Sort strictly divides the array in half and merges them. The depth of the recursive tree is always log n, and merging takes linear time at each level.",
      avg: "O(n log n) - It consistently takes O(n log n) comparisons and operations regardless of the input distribution.",
      worst: "O(n log n) - Even in the worst case, the array is halved and merged with the same structural efficiency.",
      space: "O(n) - Unlike in-place sorts, Merge Sort requires an auxiliary array of size n to merge the divided halves."
    },
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
    description: 'A divide-and-conquer sort that picks a pivot, partitions the array into elements smaller and larger than it, and recursively sorts each part. It averages O(n log n) and is one of the fastest sorts in practice, though poor pivot choices can push it to O(n²).',
    properties: [
      "It is usually the fastest sorting algorithm in practice.",
      "This app always uses the last element as the pivot, so an already-sorted list becomes its slowest case, O(n²).",
      "It needs almost no extra memory.",
      "The built-in sort functions of C and C++ are based on it."
    ],
    applications: ["General-purpose sorting", "Language standard libraries", "Large, randomized datasets"],
    video: "https://www.youtube.com/results?search_query=quick+sort+algorithm",
        complexityDetails: {
      best: "O(n log n) - Occurs when the pivot consistently divides the array into two nearly equal halves, keeping the recursion tree depth at log n.",
      avg: "O(n log n) - On average, the pivot divides the array reasonably well. Even a 90/10 split results in an O(n log n) time complexity.",
      worst: "O(n²) - Occurs when the pivot is consistently the smallest or largest element (e.g., already sorted array with a naive pivot strategy), creating a skewed recursion tree of depth n.",
      space: "O(log n) - The space complexity is driven by the call stack during recursion. A balanced tree depth is log n."
    },
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
    description: 'An in-place comparison sort that arranges the array into a binary max-heap, then repeatedly moves the maximum to the end and restores the heap. It guarantees O(n log n) time with O(1) extra space but is not stable.',
    properties: [
      "It always finishes in O(n log n) time, with no slow worst case.",
      "It needs no extra memory.",
      "It is usually a little slower than Quick Sort in practice, because it jumps around in memory.",
      "It is used as a safety fallback when Quick Sort starts running slowly."
    ],
    applications: ["Priority queues", "Systems with memory constraints", "Guaranteed O(n log n) needs"],
    video: "https://www.youtube.com/results?search_query=heap+sort+algorithm",
        complexityDetails: {
      best: "O(n log n) - Building the heap takes O(n), and extracting the maximum n times takes O(log n) each time.",
      avg: "O(n log n) - It consistently performs heapify operations which take logarithmic time for each of the n elements.",
      worst: "O(n log n) - Heap Sort guarantees O(n log n) performance because a binary heap is always balanced.",
      space: "O(1) - The array is transformed into a heap in-place, requiring no auxiliary arrays."
    },
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
    description: 'A non-comparative integer sort that processes keys one digit at a time, from least to most significant, using a stable bucket pass for each digit. It runs in O(d·(n + k)) time, where d is the number of digits and k is the base.',
    properties: [
      "It never compares two numbers directly. It groups them by their digits instead.",
      "This app sorts one digit at a time, from the ones place upward, in base 10.",
      "It works only on whole, non-negative numbers.",
      "It is very fast for sorting things like IDs, phone numbers or dates."
    ],
    applications: ["Sorting large integers", "String sorting", "Fixed-length keys"],
    video: "https://www.youtube.com/results?search_query=radix+sort+algorithm",
        complexityDetails: {
      best: "O(nk) - Radix Sort does not compare elements. It simply processes k digits (or bits) of n elements.",
      avg: "O(nk) - The time strictly depends on n (number of elements) and k (number of digits in the maximum number).",
      worst: "O(nk) - It performs the exact same bucket distributions regardless of the initial order.",
      space: "O(n + k) - Requires additional arrays to hold the count (size k) and output distribution (size n)."
    },
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
    description: 'An uninformed search that expands the grid level by level, visiting every cell at distance d before any cell at distance d + 1. On an unweighted grid it is guaranteed to find the shortest path.',
    properties: [
      "It is ideal when every move has the same cost.",
      "Once a cell is reached for the first time, there is no need to find another longer route to it.",
      "It explores all positions at the same distance before moving farther away from the start."
    ],
    applications: ["Shortest path in unweighted grids", "Peer-to-peer networks", "Social network connections"],
    video: "https://www.youtube.com/results?search_query=breadth+first+search",
        complexityDetails: {
      best: "O(1) - If the start node is adjacent to the end node (or is the end node itself), it finds it immediately.",
      avg: "O(V + E) - Explores vertices and edges broadly. In a dense grid, it processes each node and its neighbors.",
      worst: "O(V + E) - If the target is unreachable or at the very end, it must explore every vertex (V) and edge (E).",
      space: "O(V) - The queue can grow to hold the entire perimeter (frontier) of the search, which is proportional to V in the worst case."
    },
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
    description: 'A shortest-path algorithm that always expands the unvisited node with the smallest known distance from the start. It is guaranteed to find the optimal path when all edge weights are non-negative. On an unweighted grid it explores in the same order as BFS.',
    properties: [
      "It always expands the cell that is cheapest to reach so far.",
      "It takes mud into account, where each mud cell costs 5, and always finds the cheapest path.",
      "It searches in every direction, because it doesn't know where the target is.",
      "It is used in road maps and in routing data across the internet."
    ],
    applications: ["GPS routing", "Network routing protocols", "Mapping applications"],
    video: "https://www.youtube.com/results?search_query=dijkstra+algorithm",
        complexityDetails: {
      best: "O(1) - Finds the target immediately if it is the starting node.",
      avg: "O(E log V) - With a priority queue, each extraction takes O(log V), and it does this for every edge E.",
      worst: "O(E log V) - Without heuristics, it exhaustively searches in all directions until it hits the target.",
      space: "O(V) - Must store the shortest distance to all vertices and maintain the priority queue."
    },
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
    description: 'An informed search that ranks nodes by f(n) = g(n) + h(n): the actual cost from the start plus a heuristic estimate of the remaining cost to the target. With an admissible heuristic it finds the shortest path while typically exploring far fewer nodes than Dijkstra.',
    properties: [
      "It combines the distance already travelled with a guess of the distance left to the target.",
      "This app guesses using Manhattan distance: rows apart plus columns apart.",
      "It always finds the cheapest path, while usually checking far fewer cells than Dijkstra.",
      "It is the standard pathfinding method in video games, robots and GPS apps."
    ],
    applications: ["Game AI pathfinding", "Robot navigation", "Real-time routing"],
    video: "https://www.youtube.com/results?search_query=a+star+pathfinding",
        complexityDetails: {
      best: "O(1) - Finds the target immediately if it is the starting node.",
      avg: "O(E) - A good heuristic dramatically reduces the search space, focusing straight towards the target.",
      worst: "O(E) - If the heuristic is useless (or blocked by walls), it degrades into exploring everything, similar to Dijkstra.",
      space: "O(V) - Stores the G and H costs for all explored nodes in the open/closed sets."
    },
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
    description: 'An uninformed search that follows each branch as far as it can before backtracking to the most recent unexplored option. It uses little memory but gives no guarantee that the path it finds is the shortest.',
    properties: [
      "It follows one direction as far as it can, then backs up and tries another.",
      "It will find a path if one exists, but usually not the shortest.",
      "It ignores mud.",
      "It is used to generate mazes and to check whether two points are connected at all."
    ],
    applications: ["Maze generation and solving", "Topological sorting", "Cycle detection"],
    video: "https://www.youtube.com/results?search_query=depth+first+search",
        complexityDetails: {
      best: "O(1) - Finds the target immediately if it happens to be down the very first branch explored.",
      avg: "O(V + E) - Plunges blindly and may explore large sections of the graph unnecessarily.",
      worst: "O(V + E) - Must visit every node and edge if the target is unreachable or at the bottom of the last branch.",
      space: "O(V) - The call stack (or explicit stack) can grow as deep as the total number of vertices in a linear graph."
    },
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
    description: 'An informed search that always expands the node whose heuristic estimate to the target is lowest, ignoring the distance already travelled. It is often very fast but does not guarantee the shortest path.',
    properties: [
      "It always moves toward whichever cell looks closest to the target.",
      "It ignores how far it has already travelled.",
      "It is often the fastest to reach the target, but walls can lead it into long detours.",
      "It is used when a quick answer matters more than the best answer, as in simple game AI."
    ],
    applications: [
      "Fast game AI pathfinding",
      "Real-time robot navigation",
      "Quick rough solutions to puzzles"
    ],
    video: "https://www.youtube.com/results?search_query=greedy+best+first+search",
        complexityDetails: {
      best: "O(1) - Finds the target immediately if it is the starting node.",
      avg: "O(E log V) - Extremely fast in open spaces as it blindly follows the heuristic straight to the target.",
      worst: "O(E log V) - Can get trapped in dead ends (like a C-shaped wall) and be forced to backtrack heavily.",
      space: "O(V) - Must store the priority queue of discovered nodes."
    },
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
    description: 'Traverses a graph level by level from a source vertex, using a FIFO queue to visit all neighbours at depth d before moving on to depth d + 1. It runs in O(V + E) time and gives the shortest path, by edge count, to every reachable vertex.',
    properties: [
      "It visits all nodes one edge away, then all nodes two edges away, and so on.",
      "It finds the path with the fewest edges to every node.",
      "It ignores edge weights.",
      "It is used for \"degrees of separation\" in social networks and in web crawlers."
    ],
    applications: ["Finding shortest path in unweighted graphs", "Web crawlers", "Bipartite graph checking"],
    video: "https://www.youtube.com/results?search_query=bfs+graph",
        complexityDetails: {
      best: "O(1) - Immediately finds the target if it is directly connected to the start node.",
      avg: "O(V + E) - Systematically explores layer by layer, visiting every reachable vertex and edge.",
      worst: "O(V + E) - If the graph is disconnected or the target is distant, it traverses everything.",
      space: "O(V) - The queue stores all nodes at the current depth level."
    },
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
    description: 'Traverses a graph by following each path as deep as possible before backtracking, using a stack or recursion. It runs in O(V + E) time and underpins cycle detection, topological sorting, and connectivity analysis.',
    properties: [
      "It goes as deep as possible along one branch before backing up.",
      "It is not meant for finding shortest paths.",
      "Many other graph algorithms are built on top of it.",
      "It is used to detect cycles, order tasks that depend on each other, and find connected groups of nodes."
    ],
    applications: ["Finding connected components", "Solving puzzles with single solutions", "Path finding in complex networks"],
    video: "https://www.youtube.com/results?search_query=dfs+graph",
        complexityDetails: {
      best: "O(1) - Immediately finds the target if it is the first neighbor explored.",
      avg: "O(V + E) - Explores deep down paths, backtracking when necessary.",
      worst: "O(V + E) - Visits all vertices and edges in the connected component.",
      space: "O(V) - The recursion call stack can reach a depth of V in a completely linear graph."
    },
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
    description: 'A greedy algorithm that builds a Minimum Spanning Tree by considering edges in ascending order of weight and accepting each one that does not form a cycle. A Disjoint Set Union structure detects cycles efficiently, giving O(E log E) overall.',
    properties: [
      "It looks at all edges from cheapest to most expensive.",
      "It skips any edge that would create a loop, using a structure called Union-Find to check quickly.",
      "It still works when the graph is split into separate parts.",
      "It suits graphs with relatively few edges."
    ],
    applications: [
      "Designing cable, road or power networks",
      "Grouping similar data points (clustering)",
      "Planning delivery routes"
    ],
    video: "https://www.youtube.com/results?search_query=kruskal+algorithm+minimum+spanning+tree",
        complexityDetails: {
      best: "O(E log E) - Sorting the edges dominates the runtime. It always takes O(E log E) to sort them.",
      avg: "O(E log E) - Edge sorting and disjoint-set union-find operations dominate the complexity.",
      worst: "O(E log E) - Same as average, though union-find is nearly O(1) thanks to path compression.",
      space: "O(V) - Requires O(V) space to maintain the disjoint-set data structure for cycle detection."
    },
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
    description: 'A greedy algorithm that grows a Minimum Spanning Tree from a single starting vertex, each time adding the lowest-weight edge that connects the tree to a vertex outside it. With a binary-heap priority queue it runs in O(E log V).',
    properties: [
      "It starts from one node and grows a single tree outward.",
      "At each step it adds the cheapest edge that reaches a new node.",
      "It needs every node to be connected.",
      "It suits graphs where nodes have many edges."
    ],
    applications: ["Designing robust computer networks", "Road network planning", "Minimizing wire usage"],
    video: "https://www.youtube.com/results?search_query=prims+algorithm",
        complexityDetails: {
      best: "O(E log V) - With a binary heap priority queue, extracting the minimum edge takes logarithmic time.",
      avg: "O(E log V) - Processes each edge and updates priority queue values.",
      worst: "O(E log V) - Always explores outward step-by-step until all vertices are spanned.",
      space: "O(V) - Stores the priority queue and tracks which vertices are already in the MST."
    },
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
    description: 'Computes single-source shortest paths in a weighted graph by repeatedly finalizing the closest unvisited vertex and relaxing its outgoing edges. It is correct only when all edge weights are non-negative.',
    properties: [
      "It finds the shortest distance from the start to every other node.",
      "Once a node is finalized, its distance never changes again.",
      "It can give wrong answers if any edge has a negative weight.",
      "It is used in GPS navigation and internet routing."
    ],
    applications: ["Internet routing (OSPF)", "Flight agenda planning", "Telecommunication networks"],
    video: "https://www.youtube.com/results?search_query=dijkstra+graph",
        complexityDetails: {
      best: "O(1) - Finds the target immediately if it's the start node.",
      avg: "O(E log V) - Extracts minimum distances from the priority queue and updates neighbor edges.",
      worst: "O(E log V) - Must relax all edges and extract all vertices.",
      space: "O(V) - Stores the priority queue and distance arrays."
    },
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
    description: 'Computes single-source shortest paths by relaxing every edge |V| − 1 times. Unlike Dijkstra, it handles negative edge weights, and one extra pass detects negative-weight cycles. It runs in O(V·E) time.',
    properties: [
      "It works even when some edges have negative weights.",
      "It can detect a negative loop, where distances could keep decreasing forever, and this app reports one if it exists.",
      "It is slower than Dijkstra, because it checks every edge again and again.",
      "In this app, a negative weight on an undirected edge counts as a negative loop, because you can go back and forth along it.",
      "It is used to spot currency-exchange profit loops and in some network routing."
    ],
    applications: ["Distance-vector routing protocols", "Arbitrage opportunities in finance", "Graphs with negative weights"],
    video: "https://www.youtube.com/results?search_query=bellman+ford+algorithm",
        complexityDetails: {
      best: "O(E) - Can terminate early if a full pass over all edges yields no distance updates.",
      avg: "O(V * E) - Iterates over all E edges, V-1 times, to guarantee shortest paths even with negative weights.",
      worst: "O(V * E) - Runs the full V-1 iterations plus one final pass to detect negative cycles.",
      space: "O(V) - Needs an array of size V to track the shortest distance to each node."
    },
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
    description: 'Finds all Strongly Connected Components of a directed graph in a single depth-first traversal by tracking each vertex\'s discovery index and low-link value. It runs in linear O(V + E) time.',
    properties: [
      "It works only on graphs with one-way (directed) edges.",
      "It finds every group of nodes that can all reach each other.",
      "It does this in a single pass over the graph.",
      "It is used to find circular dependencies, for example between software modules."
    ],
    applications: ["Analyzing social networks", "Resolving dependencies in build systems", "Finding strongly connected components"],
    video: "https://www.youtube.com/results?search_query=tarjans+algorithm",
        complexityDetails: {
      best: "O(V + E) - Processes every node and edge exactly once during a single DFS traversal.",
      avg: "O(V + E) - The low-link values and stack state are updated efficiently in linear time.",
      worst: "O(V + E) - Performance is consistently linear with respect to the size of the graph.",
      space: "O(V) - Requires a stack to hold nodes in the current SCC being explored, plus tracking arrays."
    },
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
    description: 'Places N queens on an N×N chessboard so that no two share a row, column, or diagonal. Queens are placed one row at a time, and the solver backtracks as soon as a placement leads to a conflict.',
    properties: [
      "No two queens may share a row, a column or a diagonal.",
      "It abandons a placement as soon as two queens attack each other.",
      "Every board size has a solution except 2×2 and 3×3.",
      "The same approach is used in scheduling and seating problems."
    ],
    applications: ["Constraint satisfaction problems", "Combinatorial optimization", "Classic backtracking education"],
    video: "https://www.youtube.com/results?search_query=n+queens+problem",
        complexityDetails: {
      best: "O(1) - A solution is theoretically found immediately if the first configuration works.",
      avg: "O(N!) - The first row has N choices, second has at most N-1, etc. Pruning heavily reduces branches.",
      worst: "O(N!) - If tasked with finding ALL solutions, it must explore the entire pruned decision tree.",
      space: "O(N) - The recursive call stack depth is exactly N, plus O(N) arrays to track column conflicts."
    },
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
    description: 'Fills a 9×9 grid so that every row, column, and 3×3 box contains the digits 1–9 exactly once. It works as a constraint-satisfaction search: it tries candidate digits in empty cells and backtracks whenever a constraint is violated.',
    properties: [
      "It fills the empty cells in order, trying digits 1 to 9 in each.",
      "When a digit leads to a dead end, it erases it and tries the next one.",
      "A well-made Sudoku has exactly one solution.",
      "The same technique is used in timetable and resource-planning software."
    ],
    applications: ["Logic puzzle generation", "Constraint programming", "Automated scheduling"],
    video: "https://www.youtube.com/results?search_query=sudoku+backtracking",
        complexityDetails: {
      best: "O(1) - The puzzle is already solved or requires very few guesses.",
      avg: "O(9^(EmptyCells)) - Exponential branching for every empty cell, though constraint checking prunes this.",
      worst: "O(9^(EmptyCells)) - A deliberately designed 'hard' Sudoku can force nearly every combination.",
      space: "O(EmptyCells) - The recursion depth is equal to the number of empty cells to fill."
    },
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
    description: 'Assigns one of m colors to each vertex so that no two adjacent vertices share a color. Vertices are colored one at a time, and the solver backtracks whenever no valid color remains for the current vertex.',
    properties: [
      "It tries to colour every node with at most m colours, so that connected nodes never share a colour.",
      "The fewest colours a graph needs is called its chromatic number.",
      "For 3 or more colours, no known method is fast on every graph, so the solver may need to try many combinations.",
      "It is used for exam timetabling, assigning radio frequencies, and making maps."
    ],
    applications: ["Register allocation in compilers", "Scheduling and timetabling", "Frequency assignment in mobile networks"],
    video: "https://www.youtube.com/results?search_query=graph+coloring+algorithm",
        complexityDetails: {
      best: "O(1) - A valid coloring is found on the very first branch (e.g., no connected edges).",
      avg: "O(m^V) - Tries up to m colors for each of the V vertices. Constraints prune many invalid paths.",
      worst: "O(m^V) - An uncolorable graph forces the algorithm to exhaustively check every combination.",
      space: "O(V) - The recursive stack goes V deep to assign colors to all vertices."
    },
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
