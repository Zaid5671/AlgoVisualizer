# Redesign progress

UI and feature redesign of SPIT Algo Visualizer. All work is on the **`ui-redesign`** branch; `main` is untouched.

## How to run and test

```bash
npm run dev                      # http://localhost:5173 (chatbot needs `vercel dev` instead)
npx vite build                   # production build check
npx playwright test              # E2E tests; playwright.config.js points at :3000 (vercel dev)
```

To run the tests against the Vite dev server, temporarily change `baseURL` in `playwright.config.js` to `http://localhost:5173`.

## Decisions

- **AlgorithmVisualizer is the codebase.** `project fyp` was a compiled build with a DOM-patching layer and no source; it is only a design reference and can be deleted (backup: `project fyp.zip`).
- **Our own design, not a copy of project fyp.** Airbnb-style look: white surfaces, Inter + JetBrains Mono, pink `#ff385c` accent, soft 10–16px radii.
- **Keep the engine, replace the UI.** `src/algorithms`, `src/engine`, `src/data` and `api/` stay; views and components are rebuilt on shared components and design tokens.
- All colors, fonts, radii and shadows come from `src/styles/tokens.css`. Legacy variable names (`--accent-pink` etc.) are aliased there for views not yet migrated.

## Done

### Step 1 — Design system, app shell, Sorting view (`b8229a6`)
- Design tokens (`src/styles/tokens.css`) and a rewritten `src/index.css`.
- Shared components: `ui/SegmentedControl`, `ui/Legend`.
- New header: title, description, clickable complexity strip, Code toggle. Info cards moved to a "Learn more" section below the visualizer, so the visualizer is above the fold.
- Sidebar: real buttons, CSS classes instead of JS hover handlers, short names, closed by default on mobile.
- Playback bar: one compact row, Space = play/pause, ←/→ = step, pseudocode popover.
- Sorting view: stage card, scrollable filterable operations log, shuffle button, pivot color shown, dense arrays hide value labels.
- Fixed: custom arrays were silently replaced by random arrays when the size changed.

### Step 2 — Graph builder (`89437b3`)
- Visual editor (`components/graph/GraphCanvas.jsx`): Move / Node / Edge / Delete tools, inspector to set start node, edit weights (negatives allowed) and delete. Delete/Backspace/Escape shortcuts.
- Graph logic in `src/graph/graphModel.js` (pure functions): editing, presets, text import/export, per-algorithm validation, `structureKey`.
- Presets: Classic, Pentagon, Large, Negative weights, Directed cycles; plus random and clear.
- Directed toggle; locked on for Tarjan, locked off for Kruskal/Prim.
- Warnings: Dijkstra with negative weights, unreachable nodes, disconnected MST.
- "Edit as text" (`components/graph/GraphTextEditor.jsx`) reports per-line errors and accepts `A-B--3`.
- Fixed: node dragging used screen pixels instead of SVG coordinates (nodes jumped ~2×); nodes could leave the canvas; drag selected label text; dragging restarted playback.
- Graph algorithm log messages now use letters (`utils/nodeLabel.js`) matching the canvas.
- Shared `ui/Modal` and `OperationsLog` components. Playwright tests added for drag accuracy, text import and the editing tools (7 tests pass).

## Next steps

### Step 3 — Practice mode redesign (in progress next)
Shared practice setup for all categories:
- Accept **any** valid move (ties count), not just the one the code happens to take.
- Hints in three levels (nudge → highlight → show the move); error messages must not give away the answer.
- Undo, reset, mistake counter, completion summary.
- Click-to-select as an alternative to drag, so it works on touch screens.

Per algorithm:
| Algorithm | Practice question |
|---|---|
| Bubble, Selection, Insertion, Shell | Pass by pass: rearrange bars to match the end of pass N, then Check / Show me how |
| Merge | Which element goes next into the merged run? |
| Quick | Pick the pivot's final position / partition |
| Heap | During sift-down, which child to swap with? |
| Radix | Drop each number into its digit bucket |
| Grid pathfinding | Which cell is expanded next? (ties accepted; show g/h/f for A*) |
| Graph BFS / DFS | Pick the next node, with a queue/stack panel |
| Dijkstra | Distance table; pick the unvisited node with the smallest distance |
| Bellman-Ford | Fill in distances after each iteration |
| Kruskal / Prim | Pick the next edge; Kruskal also "reject: makes a cycle" |
| Tarjan | Group nodes into SCCs |
| N-Queens / Sudoku / Coloring | Place / fill / color, with a separate Backtrack action |

Known bugs this step must fix:
- Insertion, Shell, Merge and Radix sort record some `SWAP` steps with a single index, so their practice mode can never be completed. Needs proper step types (e.g. overwrite/insert).
- Backtracking algorithms use `SWAP` for both placing and removing; `PLACE` / `REMOVE` exist in `stepTypes.js` but are unused.
- Graph practice claims a "distance table" that doesn't exist; Kruskal, Prim, Bellman-Ford and Tarjan all get the same "click next node" question.
- Grid pathfinding practice requires clicking every compared cell in exact order.

### Step 4 — Migrate remaining views
- Pathfinding and Backtracking views still use inline styles; move them onto the shared components (stage, toolbar, legend, `OperationsLog`).

### Leftovers
- **Revoke the Gemini API key** that is hard-coded in `project fyp/feature-enhancements.js` and pushed to GitHub (`Mohammed-Afshaan/SPIT-Algo-Visualiser`).
- Delete `project fyp` (read-only `.git` files block Explorer; clear them with `attrib -r ... /s /d` first).
- `SortingView` still has its own copy of the log; switch it to `OperationsLog`.
- Tailwind `content` in `tailwind.config.js` only covers `LandingPage.jsx`, so Tailwind classes in `QuizModal` and `ChatbotWidget` are never generated.
- Pre-existing lint warnings (unused imports, duplicate `style` prop in `PathfindingView.jsx`).
