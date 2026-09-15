# Specimen: AlgoTracker

**Specimen** is a highly interactive, neo-brutalist Algorithm Visualizer. It provides a "lil algorithm lab" environment where developers and students can observe complex algorithms executing step-by-step in real-time. 

Unlike static visualizers, Specimen allows you to dynamically interact with the data *while* the algorithms are running—such as drawing walls in a maze, dragging graph nodes around, or changing edge weights on the fly.

![Specimen UI](src/assets/hero.png) 
*(Note: To add images here or elsewhere in this file, copy your image into the `src/assets/` directory (e.g. `my-image.png`), then update the markdown link to point to it like this: `![Description](src/assets/my-image.png)`)*

---

## Key Features

- **🎨 Neo-Brutalist UI Design:** A clean, high-contrast interface designed for maximum readability, featuring a beautiful custom landing page.
- **🔍 Global Code Tracer:** A dedicated right sidebar tracks the exact line of execution through the source code in real-time, visualizing recursive call stacks and active variables at every single step!
- **⏱️ Custom Playback Engine:** Play, pause, rewind, or scrub through algorithms step-by-step using a custom React hook built on ES6 Generators.
- **🕹️ Interactive Data Structures:** Drag-and-drop graph nodes, draw walls/mud on grids, and edit edge weights in real-time without breaking the playback state.
- **🧠 Integrated AI Chatbot:** Ask questions about the currently running algorithm and get context-aware answers based on the algorithm's exact current state.
- **📖 Live Pseudocode:** Follow along with the algorithm's logic as it executes.

---

## Supported Algorithms (23 Total)

| Category | Algorithms | Visualization Type |
| :--- | :--- | :--- |
| **Sorting** | Bubble Sort, Quick Sort, Merge Sort, Heap Sort, Radix Sort, Insertion Sort, Selection Sort, Shell Sort | Array Bar Chart |
| **Pathfinding** | Dijkstra, A*, Breadth-First Search (BFS), Depth-First Search (DFS), Greedy Best-First | 2D Interactive Grid (with Walls & Weighted Mud) |
| **Graph Traversals**| BFS, DFS, Kruskal's MST, Prim's MST, Dijkstra, Bellman-Ford, Tarjan's SCC | Draggable SVG Network Graph |
| **Backtracking** | N-Queens, Sudoku Solver, Graph m-Coloring | Chessboard, 9x9 Grid, SVG Graph |

---

## Tech Stack

- **Framework:** React (Vite)
- **Routing:** React Router v6
- **Styling:** Tailwind CSS v3 & Pure CSS (CSS variables, Flexbox, Grid)
- **Icons:** Lucide-React
- **Visualization:** Native DOM Elements & SVG

---

## Architecture & Project Structure

The project is built around a strict separation of concerns between **Mathematical Data Generation** and **UI Rendering**.

```text
src/
├── algorithms/       # ES6 Generator functions containing pure math/logic
│   ├── sorting/      
│   ├── pathfinding/  
│   ├── graph/        
│   └── backtracking/ 
├── components/       # Reusable UI components (Sidebar, PlaybackControls, ChatbotWidget, CodeTracer)
├── data/             # Central registries (algorithms.js, presetGraphs.js, backtrackingPuzzles.js)
├── engine/           # The core Playback Engine (usePlayback.js, stepTypes.js)
├── views/            # Major visual layouts (LandingPage, GraphView, PathfindingView, SortingView, BacktrackingView)
└── App.jsx           # Main router and layout shell
```

---

## How the Playback System Works

At the heart of the application is a custom execution engine (`usePlayback.js`). 

Instead of writing algorithms with `setTimeout` or `requestAnimationFrame`, every algorithm is written as an **ES6 Generator Function** (`function*`).

1. The generator executes a single step of the algorithm.
2. It calls `yield { type: StepTypes.COMPARE, activeNodes: [...], codeLine: 4, variables: {...}, message: "..." }`.
3. The React hook captures this snapshot and stores it in an array.
4. The UI simply renders whatever snapshot is currently selected by the timeline scrubber, updating the Code Tracer and visualizers instantly.

This architecture ensures that algorithms can be executed asynchronously (preventing UI freezes) while allowing the user to seamlessly scrub backward and forward through time.

---

## AI Chatbot Functionality

The app includes a `<ChatbotWidget />` that lives in the bottom-right corner. It is aware of the `activeAlgorithm` and the current `snapshot` of the playback engine. You can ask it questions like *"Why did it just check that node?"* or *"What is the time complexity of this algorithm?"* and it will provide an answer based on the exact step you are currently viewing.

---

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/Zaid5671/AlgoTracker.git
cd AlgoTracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## Usage Instructions

1. **Select an Algorithm:** Use the beautiful Landing Page or the left sidebar to navigate categories and select a specific algorithm.
2. **Track the Code:** Toggle the right sidebar open to watch the live Code Tracer highlight the exact line of execution and show variable values as the algorithm runs.
3. **Interact with the Environment:** 
   - *Pathfinding:* Click and drag on the grid to draw walls (impassable) or mud (high cost).
   - *Graphs:* Click and drag nodes to reorganize the web. Use the "Add/Remove Edges" toggle to build custom networks, or click an edge's weight to change it.
4. **Control Time:** Use the Playback Controls at the bottom of the screen to Play, Pause, Step Forward/Backward, or adjust the execution speed.

---

## Future Improvements

- Add support for custom graph sizes and randomized weights.
- Implement user-uploaded Sudoku puzzles.
- Add Maze Generation algorithms (Recursive Division, Prim's Maze).
- Mobile responsiveness for smaller viewports.

---

*Built by Zaid.*
