import { BookOpen } from 'lucide-react';

// Plain-language guide to a graph practice screen. Sample nodes and edges use the same
// classes as GraphCanvas, so they look exactly like what's on the canvas.

function SampleNode({ className = '', fill, label = 'B', badge }) {
  return (
    <svg className="key-graph-sample" viewBox="-26 -24 52 56" aria-hidden="true">
      <g className={`graph-node ${className}`}>
        <circle r="18" style={fill ? { fill } : undefined} />
        <text className="graph-node__label" textAnchor="middle" dy="5">{label}</text>
        {badge && (
          <g className="graph-node__badge" transform="translate(0, 27)">
            <rect x="-14" y="-8" width="28" height="15" rx="7" />
            <text textAnchor="middle" dy="4">{badge}</text>
          </g>
        )}
      </g>
    </svg>
  );
}

function SampleEdge({ className = '' }) {
  return (
    <svg className="key-graph-sample key-graph-sample--edge" viewBox="0 0 52 20" aria-hidden="true">
      <g className={`graph-edge ${className}`}>
        <line className="graph-edge__line" x1="4" y1="10" x2="48" y2="10" />
      </g>
    </svg>
  );
}

const Term = ({ sample, children }) => (
  <div><dt>{sample}</dt><dd>{children}</dd></div>
);

const START = <Term sample={<SampleNode className="is-start" label="A" />}><strong>Start node</strong> (pink ring): where the algorithm begins.</Term>;

const CONTENT = {
  bfsGraph: (
    <>
      {START}
      <Term sample={<SampleNode className="is-frontier" badge="d2" />}><strong>In the queue</strong> (dashed outline): found, but not visited yet. <strong>d2</strong> = depth 2, meaning two edges away from the start.</Term>
      <Term sample={<SampleNode className="is-visited" />}><strong>Visited</strong>: taken out of the queue. Its unvisited neighbours were added to the back of the queue.</Term>
      <Term sample={<SampleNode className="is-active" />}><strong>Current</strong>: the node visited most recently.</Term>
      <Term sample={<SampleEdge className="is-visited" />}><strong>Tree edge</strong>: the edge through which a node was first found.</Term>
      <Term sample={<span className="key-word">Queue</span>}>First in, first out, like a line at a shop. That's why BFS explores in rings: every depth-1 node, then every depth-2 node, and so on.</Term>
    </>
  ),
  dfsGraph: (
    <>
      {START}
      <Term sample={<SampleNode className="is-onstack" />}><strong>On the stack</strong>: the path DFS is currently walking along.</Term>
      <Term sample={<SampleNode className="is-active" />}><strong>Current</strong>: the deepest node on the path. DFS moves on from here.</Term>
      <Term sample={<SampleNode className="is-frontier" />}><strong>Can go next</strong> (dashed outline): unvisited neighbours of the current node.</Term>
      <Term sample={<SampleNode className="is-visited" />}><strong>Visited</strong>: already explored. DFS never visits a node twice.</Term>
      <Term sample={<span className="key-word">Backtrack</span>}>When the current node has no unvisited neighbours, DFS steps back to the previous node on the path and tries from there.</Term>
    </>
  ),
  dijkstraGraph: (
    <>
      {START}
      <Term sample={<SampleNode className="is-frontier" badge="7" />}><strong>Tentative distance</strong> (number under the node): the shortest route found <em>so far</em>. It can still go down. ∞ means no route found yet.</Term>
      <Term sample={<SampleNode className="is-visited" badge="5" />}><strong>Finalised</strong>: this distance is the true shortest one and will never change.</Term>
      <Term sample={<SampleEdge className="is-active" />}><strong>Relaxed edge</strong> (pink): after finalising a node, Dijkstra checks each edge out of it. If node A is 3 away and edge A–B weighs 2, then B can be reached in 5. If 5 beats B's current number, B is updated. That check is called <em>relaxing</em> the edge.</Term>
      <Term sample={<SampleEdge className="is-visited" />}><strong>Shortest-path edge</strong>: the last step on the best route to a finalised node.</Term>
    </>
  ),
  bellmanFord: (
    <>
      {START}
      <Term sample={<SampleNode badge="∞" />}><strong>Distance</strong> (number under the node): the shortest route found so far. ∞ means unreachable so far.</Term>
      <Term sample={<span className="key-word">Pass</span>}>One sweep through <em>every</em> edge, in the listed order. Bellman-Ford needs at most (number of nodes − 1) passes, and stops early if a pass changes nothing.</Term>
      <Term sample={<span className="key-word">Relax</span>}>For edge u → v with weight w: if dist[u] + w is smaller than dist[v], set dist[v] to it. Unlike Dijkstra, this works even with negative weights.</Term>
      <Term sample={<span className="key-word">Negative cycle</span>}>A loop whose weights add up to less than 0. Going round it again always makes a path cheaper, so there is no shortest path. The final check detects it.</Term>
    </>
  ),
  kruskals: (
    <>
      <Term sample={<span className="key-word">MST</span>}><strong>Minimum spanning tree</strong>: a set of edges that connects every node, has no loops, and has the smallest possible total weight.</Term>
      <Term sample={<SampleNode fill="#d6e6ff" />}><strong>Same colour = already connected</strong> by the edges you've added so far. White nodes aren't connected to anything yet.</Term>
      <Term sample={<SampleEdge className="is-active" />}><strong>Current edge</strong> (pink): the cheapest edge not decided yet.</Term>
      <Term sample={<SampleEdge className="is-visited" />}><strong>Tree edge</strong>: added to the MST.</Term>
      <Term sample={<SampleEdge className="is-rejected" />}><strong>Rejected</strong>: both ends were already connected, so adding it would make a <em>cycle</em> (a loop).</Term>
    </>
  ),
  prims: (
    <>
      <Term sample={<span className="key-word">MST</span>}><strong>Minimum spanning tree</strong>: edges that connect every node with no loops and the smallest possible total weight.</Term>
      {START}
      <Term sample={<SampleNode className="is-tree" />}><strong>In the tree</strong>: nodes already connected. The tree starts as just the start node.</Term>
      <Term sample={<SampleEdge className="is-candidate" />}><strong>Crossing edge</strong> (dashed blue): one end in the tree, one end outside. Prim always adds the cheapest one, which pulls one new node into the tree.</Term>
      <Term sample={<SampleEdge className="is-visited" />}><strong>Tree edge</strong>: already added.</Term>
    </>
  ),
  tarjans: (
    <>
      <Term sample={<span className="key-word">Arrows</span>}>Edges are one-way: A → B lets you go from A to B, but not back.</Term>
      <Term sample={<span className="key-word">SCC</span>}><strong>Strongly connected component</strong>: a group of nodes where every node can reach every other by following arrows. For example A → B → C → A is one SCC.</Term>
      <Term sample={<SampleNode fill="#d9f2dc" />}><strong>Paint colour</strong>: nodes with the same colour are your guess for one SCC.</Term>
      <Term sample={<span className="key-word">Tip</span>}>Look for loops of arrows. A node that isn't part of any loop is an SCC on its own.</Term>
    </>
  ),
};

export function GraphKey({ algoId, defaultOpen = true }) {
  return (
    <details className="grid-key" open={defaultOpen}>
      <summary><BookOpen size={15} /> How to read this graph</summary>
      <div className="grid-key__body grid-key__body--single">
        <dl className="grid-key__terms grid-key__terms--graph">{CONTENT[algoId]}</dl>
      </div>
    </details>
  );
}
