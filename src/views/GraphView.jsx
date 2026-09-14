import { useState, useEffect, useMemo, useRef } from 'react';
import { PlaybackControls } from '../components/PlaybackControls';
import { usePlayback } from '../engine/usePlayback';
import { StepTypes } from '../engine/stepTypes';
import { Code2 } from 'lucide-react';
import { Pseudocode } from '../components/Pseudocode';
import { ChatbotWidget } from '../components/ChatbotWidget';
import { PRESET_GRAPHS } from '../data/presetGraphs';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const NODE_RADIUS = 20;

export function GraphView({ activeAlgorithm }) {
  const isDirected = activeAlgorithm.id === 'tarjans';
  
  const [nodeCount, setNodeCount] = useState(8);
  const [graphData, setGraphData] = useState(() => JSON.parse(JSON.stringify(PRESET_GRAPHS[8])));
  
  const [showPseudocode, setShowPseudocode] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  
  // New States for Editing
  const [editMode, setEditMode] = useState('drag'); // 'drag' or 'edge'
  const [selectedNodeForEdge, setSelectedNodeForEdge] = useState(null);
  
  // Custom Prompt State
  const [editingEdgeId, setEditingEdgeId] = useState(null);
  const [editingEdgeWeight, setEditingEdgeWeight] = useState("");
  const [weightError, setWeightError] = useState(null);
  
  const svgRef = useRef(null);

  // When nodeCount or algorithm changes, load the corresponding preset graph and reset UI
  useEffect(() => {
    // Deep copy to allow independent dragging
    const newGraph = JSON.parse(JSON.stringify(PRESET_GRAPHS[nodeCount]));
    if (isDirected) {
      newGraph.edges.forEach(e => e.isDirected = true);
    }
    setGraphData(newGraph);
    
    // Reset all interactive states
    setEditMode('drag');
    setSelectedNodeForEdge(null);
    setEditingEdgeId(null);
    setEditingEdgeWeight("");
    setWeightError(null);
    setDraggingNodeId(null);
    
  }, [nodeCount, isDirected, activeAlgorithm.id]);

  // CRITICAL: We only pass edges to inputData. Dragging nodes updates x/y, 
  // but doesn't change the edge array reference unless we add/remove edges.
  const inputEdges = useMemo(() => graphData.edges, [graphData.edges]); 
  
  const inputData = useMemo(() => ({ 
    nodes: graphData.nodes.map(n => n.id), 
    edges: inputEdges, 
    startNodeId: 0 
  }), [inputEdges, graphData.nodes.length]);
  
  const playback = usePlayback(activeAlgorithm.generator, inputData);
  const { snapshot } = playback.state;

  // --- Interaction Logic ---
  const handleNodeMouseDown = (id, e) => {
    if (editMode === 'drag') {
      setDraggingNodeId(id);
    } else if (editMode === 'edge') {
      if (selectedNodeForEdge === null) {
        setSelectedNodeForEdge(id);
      } else if (selectedNodeForEdge === id) {
        setSelectedNodeForEdge(null); // Cancel selection
      } else {
        // Toggle Edge
        setGraphData(prev => {
          const newEdges = [...prev.edges];
          const existingEdgeIndex = newEdges.findIndex(e => 
            (e.source === selectedNodeForEdge && e.target === id) || 
            (!isDirected && e.source === id && e.target === selectedNodeForEdge)
          );
          
          if (existingEdgeIndex >= 0) {
            newEdges.splice(existingEdgeIndex, 1); // Remove it
          } else {
            newEdges.push({
              id: `e-${selectedNodeForEdge}-${id}-${Date.now()}`,
              source: selectedNodeForEdge,
              target: id,
              weight: 1,
              isDirected
            });
          }
          return { ...prev, edges: newEdges };
        });
        setSelectedNodeForEdge(null);
        playback.actions.reset(); // Reset playback since topology changed
      }
    }
  };

  const handleEdgeWeightClick = (edgeId, e, currentWeight) => {
    e.stopPropagation(); // Prevent drag from triggering
    setEditingEdgeId(edgeId);
    setEditingEdgeWeight(currentWeight.toString());
    setWeightError(null);
  };

  const handleWeightSubmit = (e) => {
    e.preventDefault();
    const weight = parseInt(editingEdgeWeight, 10);
    if (isNaN(weight)) {
      setWeightError("Invalid input. Please enter a valid integer.");
      return;
    }

    if (activeAlgorithm.id !== 'bellmanFord' && weight < 0) {
      setWeightError("Only Bellman-Ford supports negative edge weights!");
      return;
    }

    setGraphData(prev => {
      const newEdges = prev.edges.map(edge => {
        if (edge.id === editingEdgeId) {
          return { ...edge, weight }; 
        }
        return edge;
      });
      return { ...prev, edges: newEdges };
    });
    setEditingEdgeId(null);
    playback.actions.reset(); // Reset playback since weights changed
  };

  const handleMouseMove = (e) => {
    if (draggingNodeId === null || editMode !== 'drag' || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setGraphData(prev => {
      const newNodes = prev.nodes.map(n => n.id === draggingNodeId ? { ...n, x, y } : n);
      return { ...prev, nodes: newNodes };
    });
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };
  // ----------------------

  if (!snapshot) return <div>Loading...</div>;

  const isNodeVisited = (id) => snapshot.visitedNodes?.includes(id);
  const isNodeActive = (id) => snapshot.activeNodes?.includes(id);
  const isEdgeActive = (id) => snapshot.activeEdges?.includes(id);
  const isEdgeVisited = (id) => snapshot.visitedEdges?.includes(id);

  return (
    <div className="sorting-view" style={{ position: 'relative' }}>
      
      <div className="sorting-controls" style={{ justifyContent: 'space-between', marginBottom: '1rem', padding: '0 2rem' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <span className="mono-text" style={{ fontSize: '0.9rem' }}>Nodes: {nodeCount}</span>
           <input 
             type="range" 
             min="5" 
             max="12" 
             step="1" 
             value={nodeCount}
             onChange={(e) => {
               const val = parseInt(e.target.value);
               let closest = 5;
               if (val >= 10) closest = 12;
               else if (val >= 7) closest = 8;
               
               if (closest !== nodeCount) {
                 setNodeCount(closest);
                 playback.actions.reset();
               }
             }}
             style={{ cursor: 'pointer' }}
           />
         </div>

         <div style={{ display: 'flex', gap: '0.5rem' }}>
           <button 
             className="btn-use-this" 
             style={{ opacity: editMode === 'drag' ? 1 : 0.5, borderColor: 'black' }} 
             onClick={() => { setEditMode('drag'); setSelectedNodeForEdge(null); }}
           >Drag Nodes</button>
           <button 
             className="btn-use-this" 
             style={{ opacity: editMode === 'edge' ? 1 : 0.5, borderColor: 'black' }}
             onClick={() => setEditMode('edge')}
           >Add/Remove Edges</button>
         </div>
      </div>
      
      <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#666', marginTop: '-0.5rem' }}>
        {editMode === 'drag' ? "Click and drag nodes to untangle." : "Click two nodes to connect/disconnect them. Click an edge's weight to change it."}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0 2rem 0' }}>
        <svg 
          ref={svgRef}
          width={CANVAS_WIDTH} 
          height={CANVAS_HEIGHT} 
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ 
            backgroundColor: 'white', 
            border: '2px solid var(--border-color)',
            boxShadow: '4px 4px 0px rgba(0,0,0,0.1)'
          }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
            </marker>
            <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-pink)" />
            </marker>
          </defs>

          {/* Render Edges */}
          {graphData.edges.map(edge => {
            const sourceNode = graphData.nodes.find(n => n.id === edge.source);
            const targetNode = graphData.nodes.find(n => n.id === edge.target);
            
            // Fallback in case state gets weird during transitions
            if (!sourceNode || !targetNode) return null;

            const active = isEdgeActive(edge.id);
            const visited = isEdgeVisited(edge.id);
            
            let strokeColor = '#ddd';
            let strokeWidth = 2;
            let marker = isDirected ? "url(#arrowhead)" : "";

            if (active) {
              strokeColor = 'var(--accent-pink)';
              strokeWidth = 4;
              if (isDirected) marker = "url(#arrowhead-active)";
            } else if (visited) {
              strokeColor = 'var(--accent-blue)';
              strokeWidth = 3;
            }

            const midX = (sourceNode.x + targetNode.x) / 2;
            const midY = (sourceNode.y + targetNode.y) / 2;

            return (
              <g key={edge.id}>
                <line 
                  x1={sourceNode.x} 
                  y1={sourceNode.y} 
                  x2={targetNode.x} 
                  y2={targetNode.y} 
                  stroke={strokeColor} 
                  strokeWidth={strokeWidth}
                  markerEnd={marker}
                />
                <circle 
                  cx={midX} cy={midY} r={12} 
                  fill={editMode === 'edge' ? '#f0f0f0' : 'white'} 
                  stroke={strokeColor} 
                  style={{ cursor: editMode === 'edge' ? 'pointer' : 'default' }}
                  onClick={(e) => editMode === 'edge' && handleEdgeWeightClick(edge.id, e, edge.weight)}
                />
                <text 
                  x={midX} y={midY} 
                  textAnchor="middle" dy="4" 
                  fontSize="12" fontWeight="bold" fill="#333"
                  style={{ pointerEvents: 'none' }}
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {/* Render Nodes */}
          {graphData.nodes.map(node => {
            const active = isNodeActive(node.id);
            const visited = isNodeVisited(node.id);
            const isStart = node.id === inputData.startNodeId;
            const isSelectedForEdge = node.id === selectedNodeForEdge;

            let fill = 'white';
            if (isStart) fill = 'var(--accent-green)';
            if (visited) fill = 'rgba(144, 193, 227, 0.5)';
            if (active) fill = 'var(--accent-yellow)';
            if (isSelectedForEdge) fill = 'var(--accent-pink)'; // Highlight when clicked for edge

            return (
              <g 
                key={node.id} 
                onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                style={{ cursor: editMode === 'drag' ? (draggingNodeId ? 'grabbing' : 'grab') : 'crosshair' }}
              >
                <circle 
                  cx={node.x} 
                  cy={node.y} 
                  r={NODE_RADIUS} 
                  fill={fill} 
                  stroke={isSelectedForEdge ? 'black' : 'black'} 
                  strokeWidth={isSelectedForEdge ? "4" : "2"}
                  strokeDasharray={isSelectedForEdge ? "4" : "0"}
                />
                <text x={node.x} y={node.y} textAnchor="middle" dy="5" fontSize="14" fontWeight="bold" style={{ pointerEvents: 'none' }}>
                  {node.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <button className="btn-pseudocode" onClick={() => setShowPseudocode(!showPseudocode)} style={{ top: '650px' }}>
        <Code2 size={16} /> show pseudocode
      </button>

      <Pseudocode isOpen={showPseudocode} onClose={() => setShowPseudocode(false)} code={activeAlgorithm.pseudocode} />

      <PlaybackControls playback={playback} />
      
      <div className="operations-log">
        <div className="log-header">
           <span className="mono-text bold">operations log</span>
           <div className="log-stats">
             <span>nodes visited {snapshot.visitedNodes?.length || 0}</span>
           </div>
        </div>
        <span className="log-message">
          {snapshot.message || "press play to begin observation —"}
        </span>
      </div>

      <ChatbotWidget activeAlgorithm={activeAlgorithm} snapshot={snapshot} />

      {/* Custom Weight Prompt Modal */}
      {editingEdgeId && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.7)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
        }}>
          <form 
            onSubmit={handleWeightSubmit}
            style={{
              backgroundColor: 'var(--accent-yellow)',
              border: '4px solid black',
              padding: '2rem',
              boxShadow: '8px 8px 0px black',
              display: 'flex', flexDirection: 'column', gap: '1rem',
              alignItems: 'center'
            }}
          >
            <h3 style={{ margin: 0, fontFamily: 'monospace' }}>enter edge weight</h3>
            
            {weightError && (
              <div style={{ 
                backgroundColor: 'var(--accent-pink)', 
                border: '2px solid black', 
                padding: '0.5rem 1rem', 
                fontSize: '0.9rem',
                fontWeight: 'bold',
                maxWidth: '250px',
                textAlign: 'center'
              }}>
                {weightError}
              </div>
            )}

            <input 
              autoFocus
              type="number"
              value={editingEdgeWeight}
              onChange={(e) => {
                setEditingEdgeWeight(e.target.value);
                setWeightError(null);
              }}
              style={{
                padding: '0.5rem',
                border: '2px solid black',
                fontSize: '1.5rem',
                width: '100px',
                textAlign: 'center',
                fontFamily: 'monospace'
              }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="btn-use-this" style={{ backgroundColor: 'white' }} onClick={() => setEditingEdgeId(null)}>cancel</button>
              <button type="submit" className="btn-use-this">save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
