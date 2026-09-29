# Redesign plan

What is left to build, in order, with enough detail to implement each phase without re-deriving decisions.
Finished work is recorded in [progress.md](progress.md); this file describes what comes next.
When a phase is done, move its summary to progress.md and mark it done in the table below.

## Phases

| # | Phase | Status |
|---|---|---|
| 1 | Design system, app shell, Sorting view | ✅ done |
| 2 | Graph builder | ✅ done |
| 3a | Practice mode: shared setup + Sorting | ✅ done |
| 3b | Pathfinding: practice mode + view migration | ⏭ next |
| 3c | Graph: practice mode | planned |
| 3d | Backtracking: practice mode + view migration | planned |
| 5 | Polish, cleanup, merge and deploy | planned |

The old step 4 ("migrate the remaining views") is folded into 3b and 3d. The practice UI lives inside those views, so each view is rebuilt once, together with its practice mode.

---

## Practice mode principles (apply to every phase)

1. **Accept any valid move.** Ties are correct answers. The session follows the learner's choice, not the implementation's fixed neighbour order.
2. **Never give the answer away in an error.** Errors say *what to look at*; the answer only comes from the hint ladder.
3. **Hint ladder:** Hint (text nudge) → Show where (highlight) → Show me (apply the move, counted as a hint).
4. **Undo, Restart, mistake and hint counters, summary screen.** Provided by `usePracticeSession`.
5. **Keep sessions short:** about 40 decisions at most. Use smaller inputs and a "skip ahead" action for repetitive stretches.
6. **Click-first interactions.** Everything must work by clicking (touch screens); drag is optional.
7. **Show the numbers the algorithm uses** (queue, stack, distances, g/h/f) so the learner decides with the same information.

## Architecture

- **Pure practice engine per category** in `src/practice/<category>Practice.js`: no React, fully testable with plain Node.
- **Two session models:**
  - *Precomputed rounds* (Sorting). The learner's answer can't change later rounds.
  - *Stepper* (Pathfinding, Graph, Backtracking). Ties mean the learner's choice changes the rest of the run. The engine exposes
    `init(input) → state`, `question(state) → round | null` (null = finished), `apply(state, answer) → state`, and `auto(state)` (the implementation's own choice, used by Show me and Skip ahead).
  - **Extend `usePracticeSession` to support the stepper model.** History becomes a stack of engine states, so Undo works the same way. Precomputed rounds become a trivial stepper, so both models share one hook.
- **UI per category** in `src/components/practice/<Category>Practice.jsx`, reusing `Legend`, `SegmentedControl`, the stage/prompt/feedback styles and the summary layout from `SortingPractice`. Extract a shared `PracticeShell` component (header with score, prompt, feedback, action bar, summary) during 3b, and switch `SortingPractice` to use it.
- **Verification for each phase:**
  - A Node property check over many random inputs: the implementation's own choice is always accepted, following `auto` reaches the same result as watch mode, and every accepted tie still leads to a valid finish.
  - Playwright tests for one full, deterministic run and for the hint ladder.
  - Screenshots of each practice screen at desktop and mobile widths.

---

## 3b — Pathfinding (next)

### View migration
Rebuild `src/views/PathfindingView.jsx` on the shared components: view toolbar, stage card, `Legend`, `PlaybackControls`, `OperationsLog`.
- A drawing toolbar as a `SegmentedControl`: Wall / Mud (weight 5) / Erase / Move start / Move target; plus Clear walls, Clear all, and maze presets (random scatter, simple maze).
- Grid size controls kept, restyled. Fix the duplicate `style` prop (lint warning) and the remaining inline styles.
- Log messages use "row r, col c" consistently.

### Practice
Uses a smaller grid (about 8 × 14) seeded from the current walls when they fit, otherwise a preset.

**Main question:** "Which cell does the algorithm expand next?" Only frontier cells are clickable; they are outlined on the grid.

| Algorithm | Valid answers (ties accepted) | Side panel / labels |
|---|---|---|
| BFS | any frontier cell with the smallest distance (current layer) | queue panel; distance label on frontier cells |
| DFS | any unvisited open neighbour of the cell on top of the stack; dead ends pop automatically | stack panel (path from start) |
| Dijkstra | any frontier cell with the smallest cost g (mud costs 5) | g on frontier cells |
| A* | any frontier cell with the smallest f = g + h (Manhattan h) | g, h, f on frontier cells |
| Greedy best-first | any frontier cell with the smallest h | h on frontier cells; a note on why it can pick bad routes |

- **Skip ahead:** applies the algorithm's own next 5 choices (not counted as hints).
- **Final round, trace the path:** once the target is expanded, click cells from the target back to the start. Any neighbour that is a valid predecessor on a shortest path (for BFS / Dijkstra / A*), or the recorded parent (for DFS / Greedy), is accepted.
- **Summary:** cells expanded, path length and cost, mistakes, hints. Compare with the number of cells the algorithm itself expanded.
- **Hints:** nudge ("BFS always expands the oldest cell in the queue"), show where (highlight the valid cells), show me (apply the implementation's choice).

**Acceptance:**
- No session needs more than about 40 clicks with Skip ahead available.
- Every algorithm finishes when the target is reachable. When it isn't, the summary explains why.
- The old requirement to click every compared cell in exact order is gone.

**Files:** `src/practice/pathfindingPractice.js`, `src/components/practice/PathfindingPractice.jsx`, `src/components/practice/PracticeShell.jsx`, a rewritten `src/views/PathfindingView.jsx`, and tests.

---

## 3c — Graph practice

Runs on the graph from the graph editor. If the graph is unsuitable (for example empty, or negative weights for Dijkstra), practice shows the validation message and a "load a suitable preset" button instead of starting.

| Algorithm | Question | Panel |
|---|---|---|
| BFS | pick the next node to visit; any node in the queue at the smallest depth | queue |
| DFS | pick an unvisited neighbour of the node on top of the stack; dead ends pop automatically | stack |
| Dijkstra | pick the unvisited node with the smallest tentative distance (ties accepted); relaxations are applied and animated in the table | **distance table** (node, dist, previous, status) |
| Bellman-Ford | after each pass, fill in the distance table; Check compares it with the pass result. A final question: "negative cycle, yes or no?" | editable distance table |
| Kruskal | edges are listed in sorted order; for each edge choose **Add** or **Reject (makes a cycle)** | sorted edge list, component colours on nodes |
| Prim | click the cheapest edge crossing from the tree to the rest (ties accepted) | tree / non-tree colouring, candidate edges highlighted |
| Tarjan | colour the nodes into strongly connected components, then Check | component palette |

- Remove the fake "Distance table auto-updates" message; the real table replaces it.
- **Summary:** traversal order, or MST total weight / shortest distances / SCC list, plus mistakes and hints.

**Files:** `src/practice/graphPractice.js`, `src/components/practice/GraphPractice.jsx`, and changes to `GraphView.jsx` to swap out the old practice code.

---

## 3d — Backtracking: practice + view migration

### Fix recording first
The generators in `src/algorithms/backtracking/` record both "place" and "remove" as `SWAP`. Switch them to `PLACE` / `REMOVE` (already defined in `engine/stepTypes.js`) and update the view's colouring and log filters to match.

### View migration
Rebuild `src/views/BacktrackingView.jsx` on the shared components. Board size / puzzle pickers go in the view toolbar; the log uses `OperationsLog` with place / remove filters.

### Practice
| Algorithm | Question | Notes |
|---|---|---|
| N-Queens | place a queen in the current row on any safe square, or press **Backtrack** when none is safe | the "Show where" hint shades attacked squares; boards of 4–6 by default |
| Sudoku | fill the next empty cell with any digit that doesn't clash, or **Backtrack** when none fits | uses near-complete puzzles (about 6–10 blanks) so sessions stay short |
| Graph colouring | give the next node any colour not used by a neighbour, or **Backtrack** | m colours shown as a palette |

- Pressing Backtrack when a valid move still exists counts as a mistake. Placing an unsafe piece is a mistake, with an explanation of which constraint it breaks.
- **Summary:** the solution, how many backtracks were needed, mistakes and hints.

**Files:** `src/practice/backtrackingPractice.js`, `src/components/practice/BacktrackingPractice.jsx`, a rewritten `src/views/BacktrackingView.jsx`, and generator step-type fixes.

---

## 5 — Polish, cleanup, merge and deploy

- **Tailwind:** add `QuizModal.jsx` and `ChatbotWidget.jsx` to `content` in `tailwind.config.js`, or restyle them with the shared components (preferred, since Tailwind is scoped to the landing page).
- **Restyle** the quiz modal, chatbot widget, complexity modal, About modal and code tracer panel onto the design tokens.
- **Mobile pass** over every view (toolbars wrap, grid and graph fit a 390px width, practice actions reachable).
- **Accessibility pass:** focus states, aria labels on icon buttons, keyboard access for practice choices.
- **Lint:** clear the remaining pre-existing warnings (unused imports and parameters, set-state-in-effect).
- **README:** update features and screenshots; document practice mode and the graph editor.
- **Merge** `ui-redesign` into `main`, then deploy to Vercel and smoke-test the chatbot (`/api/chat`) in production.
- **Security:** make sure the Gemini key exposed by the old project fyp repo has been revoked.

## Open questions
- Should practice record progress (for example best scores per algorithm) in `localStorage`? Not planned yet.
- Heap sort practice could show a small tree diagram next to the bars. Nice to have, not scheduled.
