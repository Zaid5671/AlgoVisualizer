import { useRef, useState } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT, NODE_RADIUS, nodeLabel } from '../../graph/graphModel';

const DRAG_THRESHOLD = 4; // px in SVG units before a press counts as a drag rather than a click
const PARALLEL_OFFSET = 8; // separates A→B and B→A in directed graphs

// Converts a pointer event to SVG viewBox coordinates, regardless of how the SVG is scaled.
const toSvgPoint = (svg, evt) => {
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  const ctm = svg.getScreenCTM();
  return ctm ? pt.matrixTransform(ctm.inverse()) : { x: 0, y: 0 };
};

// Straight segment between two node centres, trimmed to the node borders and
// optionally shifted sideways (for opposite-direction edge pairs).
const edgeGeometry = (a, b, offset, trimEnd) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const ox = -uy * offset;
  const oy = ux * offset;
  return {
    x1: a.x + ux * NODE_RADIUS + ox,
    y1: a.y + uy * NODE_RADIUS + oy,
    x2: b.x - ux * (NODE_RADIUS + trimEnd) + ox,
    y2: b.y - uy * (NODE_RADIUS + trimEnd) + oy,
    mx: (a.x + b.x) / 2 + ox * 1.6,
    my: (a.y + b.y) / 2 + oy * 1.6,
  };
};

/**
 * Interactive SVG graph.
 *
 * tool: 'move' | 'node' | 'edge' | 'delete' — only used when `editable`.
 * display: the current algorithm snapshot (activeNodes, visitedNodes, activeEdges, visitedEdges).
 * onNodeActivate / onEdgeActivate: called on click when not editable (practice mode).
 * Practice decorations (all optional):
 *   nodeClassOf(id) / edgeClassOf(id) -> extra classes
 *   nodeBadgeOf(id) -> short text shown under a node (e.g. a distance)
 *   nodeFillOf(id)  -> fill colour (e.g. component colours)
 */
export function GraphCanvas({
  graph, directed, weighted, startNodeId, display,
  editable, tool, selection, onSelect, onChange, onNodeActivate, onEdgeActivate, emptyHint,
  nodeClassOf, edgeClassOf, nodeBadgeOf, nodeFillOf,
}) {
  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const [pendingSource, setPendingSource] = useState(null);
  const [cursor, setCursor] = useState(null);

  const nodeById = new Map(graph.nodes.map(n => [n.id, n]));
  const activeNodes = new Set(display?.activeNodes || []);
  const visitedNodes = new Set(display?.visitedNodes || []);
  const activeEdges = new Set(display?.activeEdges || []);
  const visitedEdges = new Set(display?.visitedEdges || []);

  // A pending edge source only makes sense while the Edge tool is active.
  const activeSource = editable && tool === 'edge' ? pendingSource : null;

  const handleNodeDown = (e, node) => {
    e.stopPropagation();
    if (!editable) {
      onNodeActivate?.(node.id);
      return;
    }
    if (tool === 'delete') {
      onChange({ type: 'removeNode', id: node.id });
      return;
    }
    if (tool === 'edge') {
      if (activeSource === null) setPendingSource(node.id);
      else if (activeSource === node.id) setPendingSource(null);
      else {
        onChange({ type: 'addEdge', source: activeSource, target: node.id });
        setPendingSource(null);
      }
      return;
    }
    // 'move' and 'node' tools: press-and-drag moves; a click selects.
    const p = toSvgPoint(svgRef.current, e);
    dragRef.current = { id: node.id, dx: node.x - p.x, dy: node.y - p.y, startX: p.x, startY: p.y, moved: false };
    svgRef.current.setPointerCapture?.(e.pointerId);
  };

  const handleEdgeDown = (e, edge) => {
    e.stopPropagation();
    if (!editable) {
      onEdgeActivate?.(edge.id);
      return;
    }
    if (tool === 'delete') onChange({ type: 'removeEdge', id: edge.id });
    else onSelect({ type: 'edge', id: edge.id });
  };

  const handleBackgroundDown = (e) => {
    if (!editable) return;
    if (tool === 'node') {
      const p = toSvgPoint(svgRef.current, e);
      onChange({ type: 'addNode', x: p.x, y: p.y });
    } else if (tool === 'edge') {
      setPendingSource(null);
    } else {
      onSelect(null);
    }
  };

  const handlePointerMove = (e) => {
    if (!svgRef.current) return;
    const p = toSvgPoint(svgRef.current, e);
    if (activeSource !== null) setCursor(p);

    const drag = dragRef.current;
    if (!drag) return;
    if (!drag.moved && Math.hypot(p.x - drag.startX, p.y - drag.startY) < DRAG_THRESHOLD) return;
    drag.moved = true;
    onChange({ type: 'moveNode', id: drag.id, x: p.x + drag.dx, y: p.y + drag.dy });
  };

  const handlePointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag && !drag.moved) onSelect({ type: 'node', id: drag.id });
  };

  const isSelected = (type, id) => selection?.type === type && selection.id === id;
  const hasReverse = (edge) => directed && graph.edges.some(o => o.source === edge.target && o.target === edge.source);
  const pendingNode = activeSource !== null ? nodeById.get(activeSource) : null;

  return (
    <div className={`graph-canvas tool-${editable ? tool : 'none'}`}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        onPointerDown={handleBackgroundDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => setCursor(null)}
      >
        <defs>
          {['default', 'visited', 'active', 'selected'].map(kind => (
            <marker key={kind} id={`arrow-${kind}`} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M0,0 L10,4 L0,8 Z" className={`graph-arrow graph-arrow--${kind}`} />
            </marker>
          ))}
        </defs>

        {graph.edges.map(edge => {
          const a = nodeById.get(edge.source);
          const b = nodeById.get(edge.target);
          if (!a || !b) return null;
          const state = isSelected('edge', edge.id) ? 'selected'
            : activeEdges.has(edge.id) ? 'active'
            : visitedEdges.has(edge.id) ? 'visited' : 'default';
          const g = edgeGeometry(a, b, hasReverse(edge) ? PARALLEL_OFFSET : 0, directed ? 2 : 0);

          return (
            <g key={edge.id} className={`graph-edge is-${state} ${edgeClassOf?.(edge.id) || ''}`} onPointerDown={(e) => handleEdgeDown(e, edge)}>
              <line className="graph-edge__hit" x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} />
              <line
                className="graph-edge__line"
                x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2}
                markerEnd={directed ? `url(#arrow-${state})` : undefined}
              />
              {weighted && (
                <g className="graph-edge__weight" transform={`translate(${g.mx}, ${g.my})`}>
                  <rect x="-13" y="-10" width="26" height="20" rx="5" />
                  <text textAnchor="middle" dy="4">{edge.weight}</text>
                </g>
              )}
            </g>
          );
        })}

        {pendingNode && cursor && (
          <line className="graph-rubber-band" x1={pendingNode.x} y1={pendingNode.y} x2={cursor.x} y2={cursor.y} />
        )}

        {graph.nodes.map(node => {
          const isStart = node.id === startNodeId;
          const classes = [
            'graph-node',
            activeNodes.has(node.id) && 'is-active',
            !activeNodes.has(node.id) && visitedNodes.has(node.id) && 'is-visited',
            isStart && 'is-start',
            isSelected('node', node.id) && 'is-selected',
            activeSource === node.id && 'is-pending',
            nodeClassOf?.(node.id),
          ].filter(Boolean).join(' ');
          const fill = nodeFillOf?.(node.id);
          const badge = nodeBadgeOf?.(node.id);

          return (
            <g key={node.id} className={classes} transform={`translate(${node.x}, ${node.y})`} onPointerDown={(e) => handleNodeDown(e, node)}>
              {isStart && <text className="graph-node__tag" textAnchor="middle" y={-NODE_RADIUS - 8}>START</text>}
              <circle r={NODE_RADIUS} style={fill ? { fill } : undefined} />
              <text className="graph-node__label" textAnchor="middle" dy="5">{nodeLabel(node.id)}</text>
              {badge !== undefined && badge !== null && (
                <g className="graph-node__badge" transform={`translate(0, ${NODE_RADIUS + 13})`}>
                  <rect x="-15" y="-9" width="30" height="17" rx="8" />
                  <text textAnchor="middle" dy="4">{badge}</text>
                </g>
              )}
            </g>
          );
        })}

        {graph.nodes.length === 0 && (
          <text className="graph-empty" x={CANVAS_WIDTH / 2} y={CANVAS_HEIGHT / 2} textAnchor="middle">
            {emptyHint}
          </text>
        )}
      </svg>
    </div>
  );
}
