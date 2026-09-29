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

The detailed plan for everything left is in **[plan.md](plan.md)**. In short:

1. **3b — Pathfinding** (next): practice mode ("which cell is expanded next?", ties accepted, g/h/f labels, skip ahead, trace the path) and a rebuilt Pathfinding view.
2. **3c — Graph practice:** queue/stack for BFS/DFS, a real distance table for Dijkstra, pass-by-pass table for Bellman-Ford, edge picking for Kruskal/Prim, SCC grouping for Tarjan.
3. **3d — Backtracking:** fix `PLACE`/`REMOVE` step types, practice with a Backtrack action, rebuilt view.
4. **5 — Polish:** restyle quiz/chatbot/modals, mobile and accessibility passes, lint cleanup, README, merge to `main` and deploy.

Still open outside the code: **revoke the Gemini API key** that was hard-coded in the old project fyp repo (`Mohammed-Afshaan/SPIT-Algo-Visualiser`). The local `project fyp` folder and zip have been deleted.
