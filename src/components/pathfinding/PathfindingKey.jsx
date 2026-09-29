import { BookOpen } from 'lucide-react';

// Plain-language guide to the grid: what each cell colour means and what the numbers are.
// Sample cells reuse the real .path-cell classes so they look exactly like the grid.

function Sample({ className, children }) {
  return (
    <span className={`path-cell key-sample ${className}`}>
      {children && <span className="path-cell__label">{children}</span>}
    </span>
  );
}

const NUMBERS = {
  bfs: {
    sample: '3',
    title: 'Number = distance from the start',
    text: 'How many steps it takes to reach this cell from S. BFS always expands the frontier cell with the smallest distance, so it spreads out in rings.',
  },
  dijkstra: {
    sample: '7',
    title: 'Number = cost so far (g)',
    text: 'The cheapest total cost found so far to reach this cell from S. Entering a normal cell costs 1; entering mud costs 5. Dijkstra always expands the smallest cost next.',
  },
  astar: {
    sample: <><b>12</b><small>g2+h10</small></>,
    title: 'Big number f = g + h',
    text: null,
  },
  greedyBFS: {
    sample: '4',
    title: 'Number = h, the guessed distance to T',
    text: 'Rows apart plus columns apart from the target, ignoring walls. Greedy only looks at this number, so it heads straight for T even if walls force a long detour.',
  },
  dfs: {
    sample: null,
    title: 'No numbers',
    text: 'DFS doesn\'t rank cells. It keeps walking from the latest cell into any unvisited neighbour, and only backs up when it gets stuck.',
  },
};

export function PathfindingKey({ algoId, practice, defaultOpen = true }) {
  const numbers = NUMBERS[algoId];

  return (
    <details className="grid-key" open={defaultOpen}>
      <summary><BookOpen size={15} /> How to read this grid</summary>

      <div className="grid-key__body">
        <dl className="grid-key__terms">
          <div><dt><Sample className="is-start" /><Sample className="is-target" /></dt><dd><strong>S</strong> is the start and <strong>T</strong> the target. <strong>Black</strong> cells are walls{algoId === 'dijkstra' || algoId === 'astar' ? '; brown cells are mud (cost 5 to enter)' : ''}.</dd></div>
          {practice && (
            <div><dt><Sample className="frontier">{numbers.sample && typeof numbers.sample === 'string' ? numbers.sample : null}</Sample></dt><dd><strong>Frontier</strong> (outlined): cells the algorithm has discovered, next to somewhere it has been, but hasn't explored yet. <em>The next move is always one of these.</em></dd></div>
          )}
          <div><dt><Sample className="visited" /></dt><dd><strong>Visited</strong>: already expanded. A cell is never expanded twice.</dd></div>
          {algoId === 'dfs' && practice && <div><dt><Sample className="on-stack" /></dt><dd><strong>On the stack</strong>: the current path from S. DFS backs up along it when stuck.</dd></div>}
          <div><dt><Sample className="current" /></dt><dd><strong>Current</strong>: the cell expanded most recently.</dd></div>
          <div><dt><Sample className="path" /></dt><dd><strong>Path</strong>: the route found from S to T.</dd></div>
          {practice && <div className="grid-key__wide"><dt className="grid-key__verb">Expand</dt><dd>= pick a frontier cell, mark it visited, then add its open neighbours (up, down, left, right) to the frontier.</dd></div>}
        </dl>

        {practice && (
          <div className="grid-key__numbers">
            <span className="eyebrow">the numbers</span>
            <div className="grid-key__number-row">
              {numbers.sample && <Sample className="frontier key-sample--lg">{numbers.sample}</Sample>}
              <div>
                <p className="grid-key__number-title">{numbers.title}</p>
                {algoId === 'astar' ? (
                  <ul className="grid-key__list">
                    <li><strong>g</strong> = cost so far: steps taken from S to reach this cell (mud counts 5).</li>
                    <li><strong>h</strong> = guess of the steps still needed to reach T: rows apart + columns apart, ignoring walls.</li>
                    <li><strong>f</strong> = g + h, the estimated length of the whole route through this cell. A* expands the <strong>smallest f</strong> next.</li>
                  </ul>
                ) : (
                  <p className="grid-key__text">{numbers.text}</p>
                )}
                {(algoId === 'bfs' || algoId === 'dijkstra' || algoId === 'astar') && (
                  <p className="grid-key__text grid-key__text--muted">
                    Visited cells keep their {algoId === 'bfs' ? 'distance' : 'g'} in small grey text. You'll use it at the end to trace the path back: each step back must {algoId === 'bfs' ? 'have a distance one less' : 'match the cost exactly'}.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </details>
  );
}
