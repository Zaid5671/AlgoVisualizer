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
| 3b | Pathfinding: practice mode + view migration | ✅ done |
| 3c | Graph: practice mode | ✅ done |
| 3d | Backtracking: practice mode + view migration | ✅ done |
| 4 | Landing page redesign | ✅ done |
| 5 | Polish, cleanup, merge and deploy | ✅ done |
| 6 | Colour scheme | ⏸ waiting for a decision |

The old step 4 ("migrate the remaining views") was folded into 3b and 3d; step 4 is now the landing page. The practice UI lives inside those views, so each view is rebuilt once, together with its practice mode.

---

## Practice mode principles (apply to every phase)

1. **Accept any valid move.** Ties are correct answers. The session follows the learner's choice, not the implementation's fixed neighbour order.
2. **Never give the answer away in an error.** Errors say *what to look at*; the answer only comes from the hint ladder.
3. **Hint ladder:** Hint (text nudge) → Show where (highlight) → Show me (apply the move, counted as a hint).
4. **Undo, Restart, mistake and hint counters, summary screen.** Provided by `usePracticeSession`.
5. **Keep sessions short:** about 40 decisions at most. Use smaller inputs and a "skip ahead" action for repetitive stretches.
6. **Click-first interactions.** Everything must work by clicking (touch screens); drag is optional.
7. **Show the numbers the algorithm uses** (queue, stack, distances, g/h/f) so the learner decides with the same information.
8. **Explain every term, colour and number on screen.** Assume the learner doesn't know words like "frontier", "relax" or "SCC". Each practice mode gets a "How to read this" guide with sample visuals (like `PathfindingKey`), numbers are self-labelled where possible (e.g. `g2+h10`), and side panels say what they hold.

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

## 4 — Landing page ✅

Built; see progress.md. Agreed decisions, which still apply when the page is edited:
- **Audience:** students learning DSA. Plain language, no invented stats or fake tech labels; every claim must be true of the app.
- **Same design system as the app** (tokens, Inter, pink accent). Tailwind was removed; styles live in `src/styles/landing.css`.
- **Structure:** header → hero (live Bubble Sort demo using the real `BarChart` and generator) → Watch / Practice / Check → 4 topic cards with algorithm chips → practice-mode spotlight (alternating screenshot and text) → features grid → suggested learning order → team → final call to action → footer.
- **Screenshots are generated, not hand-made:** `npm run screenshots` (with the dev server running) rewrites `public/landing/*.png` from the live app, so they stay current after UI changes.
- **AI tutor** is featured modestly: one card in the features grid with an honest caveat, not a hero section.
- **Team:** names with circular photos, all from `src/data/site.js`. A placeholder photo is used until real headshots are provided.
- **Repo link:** `REPO_URL` in `src/data/site.js`; the footer link appears when it is set.
- **Deep links:** `/algorithm?algo=<key>` opens one algorithm and `&mode=practice` opens it in practice mode.

---

## 3b — Pathfinding ✅

Built as specified below; see progress.md. Decisions made while building:
- **DFS practice uses recursive-DFS rules:** any unvisited neighbour of the deepest cell on the current path is accepted. Dead ends pop automatically. The implementation's own choice (last neighbour pushed) is always among the accepted answers.
- **DFS and Greedy don't have a trace round.** Their path comes from parent links the learner can't see, so it is revealed on the summary screen with a "not guaranteed shortest" note.
- **Moves with only one possible cell are applied automatically**, so every question is a real decision.
- **Skip 5 stops when the question type changes** (search → trace), so it never traces the path for you.
- **Practice grids are 5–6 × 9–10 presets:** Wall with a gap, Corridors, Mud patch, U-shaped trap. Defaults: BFS → Corridors, DFS → Gap, Dijkstra / A* → Mud, Greedy → Trap. Without skipping, BFS and Dijkstra still take about 40–55 clicks; Skip 5 keeps them under about 40.
- **`PracticeShell` was extracted** and Sorting practice moved onto it. `usePracticeSession` is now the stepper hook; Sorting wraps its precomputed rounds with `createSortingEngine`.

Original spec:

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

## 3c — Graph practice ✅

Built as specified below; see progress.md. Decisions made while building:
- **Bellman-Ford accepts both correct pass results:** in-place updates in the listed edge order (what the implementation does) and the textbook "previous pass only" version. The run continues from whichever table the learner entered.
- **Kruskal stops once the tree has V − 1 edges,** since every remaining edge would be rejected. Prim, Dijkstra, BFS and DFS auto-apply moves with only one option.
- **Tarjan practice is a single "paint the SCCs" round** with a colour palette. Disc/low-link values aren't practised (possible future extension).
- **Practice runs on the graph from the graph editor** (editing is disabled during practice). Unsuitable graphs (fewer than 2 nodes, no edges, negative weights for Dijkstra) show a blocker with a "load the classic graph" button.
- **A "How to read this graph" guide** (`GraphKey`) explains the terms for each algorithm with sample nodes and edges (principle 8).

## 3d — Backtracking ✅

Built as specified below; see progress.md. Decisions made while building:
- **N-Queens fills columns left to right** (not rows), because that's what the implementation does.
- **One generic engine for all three problems:** ordered slots, then place any safe value not yet tried in the current slot, or Backtrack. Values that led to a dead end are remembered per slot (shown as ✗ / struck through), so the search always ends. The implementation's own choice (the smallest untried safe value) is always accepted.
- **Practice sizes:** N-Queens 4–6 (default 4, which needs real backtracking), Sudoku 3–14 empty cells (default 8), colouring 2–4 colours on the classic 8-node graph.
- **Proving there's no solution counts as finishing.** Backtracking out of the first slot ends with "No solution exists".

Original 3c spec:

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

## 5 — Polish, cleanup, merge and deploy (in progress)

Done (see progress.md): restyled the quiz, complexity, About, code tracer and tutor onto the design tokens; mobile pass; accessibility pass; lint at zero warnings; new README.

Still to do:
- ~~Merge `ui-redesign` into `main`~~ done (fast-forward, pushed).
- ~~Deploy~~ done: live at https://zaid-algorithms.vercel.app, auto-deploys from `main`; tutor tested in production.
- **Security:** the Gemini key exposed in the old project fyp repo (`Mohammed-Afshaan/SPIT-Algo-Visualiser`) is a different key from this app's; its owner should delete it in Google AI Studio.
- **Later, with phase 6:** after the colour decision, retake the landing screenshots and README images (`npm run screenshots`).

## 6 — Colour scheme ⏸ (waiting for a decision)

**Problem.** The interface and the visualizations share colours with different meanings:
- **pink** is both the brand/buttons and "swapping" / "start" / "rejected";
- **yellow** is the selected tool, the practice question box, "current" and the hint highlight;
- **blue** is both the selected speed and "comparing" / "frontier";
- grids and boards are beige.

This works against principle 8 (explain every colour). The current pink (`#ff385c`) is also Airbnb's exact brand colour, and white text on it fails WCAG AA (3.5 : 1).

**Agreed direction (colour not chosen yet):**
- **Interface colours:** one brand colour, only for things you can press (main buttons, links, the play button). Everything else is neutral. Selected controls (tool, speed, mode tab) are **dark**, not yellow or blue. The practice question box is neutral grey.
- **Algorithm colours:** a separate set, used only inside bars, grids, graphs and boards, with the same meaning in all four topics:

  | Meaning | Colour | Examples |
  |---|---|---|
  | Not looked at yet | light grey | unsorted bars, empty cells, unvisited nodes |
  | Being looked at | blue | comparing, frontier, queue |
  | Current step | amber | current cell or node, pivot |
  | Changing | orange-red | swapping, writing |
  | Done / final | green | settled, path, finalised, MST |
  | Removed / rejected | red, plus ✗ or a dashed line | backtrack, rejected edge |
  | Start / target | dark-outlined cell with S / T (target may be purple) | never filled dark, or they look like walls |

- **Hints** use a dashed outline plus a 💡 badge, not a colour, so they can't be confused with algorithm state.
- **Grids and boards** become light grey instead of beige; mud stays brown.
- **Never rely on colour alone:** keep ✗ marks, dashes and labels (red vs green is hard for colour-blind users). Use amber for fills, never for text.

**Brand colour options** (preview: [docs/colour-preview.html](docs/colour-preview.html), open it in a browser):

| Option | Hex | White-text contrast | Consequence for the algorithm colours |
|---|---|---|---|
| Current pink | `#ff385c` | 3.5 : 1 (fails AA) | none, but the mixed meanings stay |
| Raspberry | `#d6336c` | 4.6 : 1 | smallest change |
| **Indigo** (recommended) | `#4f46e5` | 6.3 : 1 | "being looked at" becomes sky blue `#0ea5e9`; target becomes dark-outlined instead of purple |
| Teal | `#0f766e` | 5.5 : 1 | "done" becomes lime green `#5c940d` |

**Once the team decides:**
- update `src/styles/tokens.css` with separate `--brand-*` and `--algo-*` tokens;
- move every view onto the new tokens: segmented controls, speed buttons, practice prompt, hint styles, grid and board colours, legends and the "How to read this" guides;
- update the landing page accent;
- regenerate the landing screenshots (`npm run screenshots`);
- re-run the Playwright tests and screenshot every view.

---

## Open questions
- Should practice record progress (for example best scores per algorithm) in `localStorage`? Not planned yet.
- Heap sort practice could show a small tree diagram next to the bars. Nice to have, not scheduled.
