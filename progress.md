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

### Step 3a — Practice mode: shared setup + Sorting pilot
- Practice engine `src/practice/sortingPractice.js` (pure): builds a list of rounds per algorithm, mirroring the implementations in `src/algorithms/sorting`.
  - Bubble / Selection / Insertion / Shell: **arrange** rounds. Rearrange the bars to match the end of each pass (or gap pass), then Check.
  - Merge: pick the next value (left or right front) for the merged run; ties accept either, with a stability note.
  - Quick (Lomuto, last-element pivot): click the pivot's final position; with duplicates, any valid slot is accepted.
  - Heap: during sift-down, pick the child to swap with or "no swap".
  - Radix (LSD): click the bucket for each value's current digit.
- Generic session hook `src/practice/usePracticeSession.js`: rounds, three-level hint ladder (nudge → show where → show me), undo, restart, mistake and hint counters, completion. Reusable for other categories.
- UI `components/practice/SortingPractice.jsx` plus a reusable `components/sorting/BarChart.jsx` (drag **or** click-two to swap, so it works on touch screens). Summary screen at the end.
- Practice uses at most the first 8 values, so merge and heap sort stay around 15–20 decisions.
- Error messages no longer give the answer away. The "show where" hint for arrange rounds highlights the next useful swap.
- Fixed: single-index "swaps" in Insertion, Shell, Merge and Radix are now a `WRITE` step type (`engine/stepTypes.js`), with their own log filter and counter.
- `SortingView` now uses the shared `BarChart` and `OperationsLog` (leftover de-duplication done).
- Tests: 9 Playwright tests pass, including bubble sort pass-by-pass with click-to-swap and the quick sort pivot question with the hint ladder. Every algorithm's practice rounds were also checked on 300 random arrays (duplicates, sorted, single value).

## Next steps

### Step 3b — Practice mode for the other categories
Reuse `usePracticeSession`. Shared goals:
- Accept **any** valid move (ties count), not just the one the code happens to take.
- Hints in three levels (nudge → highlight → show the move); error messages must not give away the answer.
- Undo, reset, mistake counter, completion summary.
- Click-to-select as an alternative to drag, so it works on touch screens.

Per algorithm:
| Algorithm | Practice question |
|---|---|
| Grid pathfinding | Which cell is expanded next? (ties accepted; show g/h/f for A*) |
| Graph BFS / DFS | Pick the next node, with a queue/stack panel |
| Dijkstra | Distance table; pick the unvisited node with the smallest distance |
| Bellman-Ford | Fill in distances after each iteration |
| Kruskal / Prim | Pick the next edge; Kruskal also "reject: makes a cycle" |
| Tarjan | Group nodes into SCCs |
| N-Queens / Sudoku / Coloring | Place / fill / color, with a separate Backtrack action |

Known bugs this step must fix:
- Backtracking algorithms use `SWAP` for both placing and removing; `PLACE` / `REMOVE` exist in `stepTypes.js` but are unused.
- Graph practice claims a "distance table" that doesn't exist; Kruskal, Prim, Bellman-Ford and Tarjan all get the same "click next node" question.
- Grid pathfinding practice requires clicking every compared cell in exact order.

### Step 4 — Migrate remaining views
- Pathfinding and Backtracking views still use inline styles; move them onto the shared components (stage, toolbar, legend, `OperationsLog`).

### Leftovers
- **Revoke the Gemini API key** that is hard-coded in `project fyp/feature-enhancements.js` and pushed to GitHub (`Mohammed-Afshaan/SPIT-Algo-Visualiser`).
- ~~Delete `project fyp`~~ Done (the folder and zip are gone; the GitHub repo is the only copy).
- Possible polish: a small tree diagram next to the bars in heap sort practice.
- Tailwind `content` in `tailwind.config.js` only covers `LandingPage.jsx`, so Tailwind classes in `QuizModal` and `ChatbotWidget` are never generated.
- Pre-existing lint warnings (unused imports, duplicate `style` prop in `PathfindingView.jsx`).
