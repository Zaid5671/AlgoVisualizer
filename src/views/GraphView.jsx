import { useState, useEffect, useMemo, useRef } from 'react';
import { PlaybackControls } from '../components/PlaybackControls';
import { usePlayback } from '../engine/usePlayback';
import { StepTypes } from '../engine/stepTypes';
import { Code2, Info, X, Plus } from 'lucide-react';
import { Pseudocode } from '../components/Pseudocode';
import { ChatbotWidget } from '../components/ChatbotWidget';
import { PRESET_GRAPHS, generateGraph } from '../data/presetGraphs';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const NODE_RADIUS = 20;

export function GraphView({ activeAlgorithm, onStep }) {
  const isDirected = activeAlgorithm.id === 'tarjans';
  const isWeighted = ['dijkstraGraph', 'bellmanFord', 'kruskals', 'prims'].includes(activeAlgorithm.id);
  
  const [graphData, setGraphData] = useState(() => {
    const init = JSON.parse(JSON.stringify(generateGraph(8)));
    if (isDirected) init.edges.forEach(e => e.isDirected = true);
    return init;
  });
  
  const [showPseudocode, setShowPseudocode] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  
  const [mode, setMode] = useState('watch'); // 'watch' | 'practice'
  const [practiceStep, setPracticeStep] = useState(0);
  const [practiceError, setPracticeError] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configNodes, setConfigNodes] = useState(5);
  const [configEdges, setConfigEdges] = useState("");
  
  const svgRef = useRef(null);

  // Pre-fill config modal when opened
  useEffect(() => {
    if (showConfigModal) {
      setConfigNodes(graphData.nodes.length);
      const edgeStrs = graphData.edges.map(e => {
        const src = String.fromCharCode(65 + e.source);
        const tgt = String.fromCharCode(65 + e.target);
        return isWeighted ? `${src}-${tgt}-${e.weight}` : `${src}-${tgt}`;
      });
      setConfigEdges(edgeStrs.join('\n'));
    }
  }, [showConfigModal, graphData, isWeighted]);

  // Re-sync directed edges when algorithm changes, but preserve user's graph structure
  useEffect(() => {
    setGraphData(prev => ({
      ...prev,
      edges: prev.edges.map(e => ({ ...e, isDirected }))
    }));
    setDraggingNodeId(null);
    setPracticeStep(0);
    setPracticeError(null);
  }, [isDirected, activeAlgorithm.id]);

  const inputEdges = useMemo(() => graphData.edges, [graphData.edges]); 
  const inputData = useMemo(() => ({ 
    nodes: graphData.nodes.map(n => n.id), 
    edges: inputEdges, 
    startNodeId: graphData.nodes.length > 0 ? graphData.nodes[0].id : 0 
  }), [inputEdges, graphData.nodes]);
  
  const playback = usePlayback(activeAlgorithm.generator, inputData);
  const { snapshot, snapshots, currentIndex } = playback.state;

  useEffect(() => {
    if (snapshot && typeof onStep === 'function') {
      onStep(snapshot);
    }
  }, [snapshot, onStep]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'practice') {
      playback.actions.pause();
      setPracticeStep(0);
      setPracticeError(null);
      setShowTutorial(true);
    } else {
      playback.actions.reset();
    }
  };

  const applyConfig = () => {
    const nodes = [];
    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;
    const radius = Math.min(cx, cy) - 50;
    
    // Validate node count
    const numNodes = Math.max(1, Math.min(26, configNodes));

    for (let i = 0; i < numNodes; i++) {
       const existing = graphData.nodes.find(n => n.id === i);
       if (existing) {
         nodes.push(existing); // preserve positions
       } else {
         const angle = (2 * Math.PI * i) / numNodes - Math.PI / 2;
         nodes.push({
           id: i,
           x: cx + radius * Math.cos(angle),
           y: cy + radius * Math.sin(angle)
         });
       }
    }

    const edges = [];
    const lines = configEdges.split('\n').map(l => l.trim().toUpperCase()).filter(l => l);
    lines.forEach((line, idx) => {
       const parts = line.split(/[\s,-]+/);
       if (parts.length >= 2) {
          const uChar = parts[0].charCodeAt(0) - 65;
          const vChar = parts[1].charCodeAt(0) - 65;
          if (uChar >= 0 && uChar < numNodes && vChar >= 0 && vChar < numNodes && uChar !== vChar) {
             let weight = 1;
             if (isWeighted && parts[2]) {
                weight = Number.isNaN(parseInt(parts[2])) ? 1 : parseInt(parts[2]);
             }
             // Avoid duplicate edges
             const exists = edges.some(e => (e.source === uChar && e.target === vChar) || (!isDirected && e.source === vChar && e.target === uChar));
             if (!exists) {
               edges.push({
                  id: `e-${uChar}-${vChar}-${idx}`,
                  source: uChar,
                  target: vChar,
                  weight,
                  isDirected
               });
             }
          }
       }
    });

    setGraphData({ nodes, edges });
    setShowConfigModal(false);
    playback.actions.reset();
  };

  // Compute expected node clicks for Practice Mode
  const expectedClicks = useMemo(() => {
    if (!snapshots) return [];
    const sequence = [];
    let currentVisited = new Set();
    const startNode = inputData.startNodeId;
    currentVisited.add(startNode);

    for (let i = 0; i < snapshots.length; i++) {
      const s = snapshots[i];
      if (s.visitedNodes) {
        for (const node of s.visitedNodes) {
          if (!currentVisited.has(node)) {
            currentVisited.add(node);
            sequence.push({ snapshotIndex: i, nodeId: node });
          }
        }
      }
    }
    return sequence;
  }, [snapshots, inputData.startNodeId]);

  const isPracticeComplete = practiceStep >= expectedClicks.length;

  let practiceDisplaySnapshot = null;
  if (mode === 'practice') {
    if (practiceStep === 0) {
      practiceDisplaySnapshot = snapshots[0];
    } else if (isPracticeComplete) {
      practiceDisplaySnapshot = snapshots[snapshots.length - 1];
    } else {
      practiceDisplaySnapshot = snapshots[expectedClicks[practiceStep - 1]?.snapshotIndex || 0];
    }
  }

  const currentDisplay = mode === 'watch' ? snapshot : practiceDisplaySnapshot;

  const handleNodeMouseDown = (id, e) => {
    if (mode === 'practice') {
      if (isPracticeComplete) return;
      const expectedNodeId = expectedClicks[practiceStep].nodeId;
      if (id === expectedNodeId) {
        setPracticeStep(prev => prev + 1);
        setPracticeError(null);
      } else {
        const label = id < 26 ? String.fromCharCode(65 + id) : id;
        setPracticeError(`Wrong move! ${activeAlgorithm.name} wouldn't visit node ${label} next.`);
      }
      return;
    }
    
    // Watch mode dragging
    setDraggingNodeId(id);
  };

  const handleMouseMove = (e) => {
    if (draggingNodeId === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setGraphData(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === draggingNodeId ? { ...n, x, y } : n)
    }));
  };

  const handleMouseUp = () => setDraggingNodeId(null);

  if (!snapshot && graphData.nodes.length > 0) return <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading...</div>;

  const isNodeVisited = (id) => currentDisplay?.visitedNodes?.includes(id);
  const isNodeActive = (id) => currentDisplay?.activeNodes?.includes(id);
  const isEdgeActive = (id) => currentDisplay?.activeEdges?.includes(id);
  const isEdgeVisited = (id) => currentDisplay?.visitedEdges?.includes(id);

  const getLabel = (id) => id < 26 ? String.fromCharCode(65 + id) : id.toString();

  return (
    <div className="sorting-view" style={{ position: 'relative', display: 'flex', width: '100%', minHeight: '100%', alignItems: 'stretch' }}>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'visible', position: 'relative' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', background: 'white', padding: '4px', borderRadius: '999px', border: '1px solid var(--border-color)', width: 'fit-content', flexWrap: 'wrap' }}>
           <button 
             onClick={() => handleModeChange('watch')}
             style={{ padding: '0.4rem 1.2rem', borderRadius: '999px', border: 'none', background: mode === 'watch' ? 'var(--accent-yellow)' : 'transparent', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
           >
             watch
           </button>
           <button 
             onClick={() => handleModeChange('practice')}
             style={{ padding: '0.4rem 1.2rem', borderRadius: '999px', border: 'none', background: mode === 'practice' ? 'var(--accent-yellow)' : 'transparent', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
           >
             practice it yourself
           </button>
           <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 8px' }}></div>
           <button 
             onClick={() => setShowConfigModal(true)}
             style={{ padding: '0.4rem 1.2rem', borderRadius: '999px', border: 'none', background: 'transparent', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: 'var(--text-muted)' }}
           >
             - configure graph manually
           </button>
        </div>

        <div className="card-box" style={{ display: 'flex', justifyContent: 'center', minHeight: '400px', overflow: 'hidden', padding: 0 }}>
          <svg 
            ref={svgRef}
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', minHeight: '400px' }}
          >
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
              </marker>
              <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-pink)" />
              </marker>
            </defs>

            {graphData.edges.map(edge => {
              const sourceNode = graphData.nodes.find(n => n.id === edge.source);
              const targetNode = graphData.nodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const active = isEdgeActive(edge.id);
              const visited = isEdgeVisited(edge.id);
              
              let strokeColor = '#ddd';
              let strokeWidth = 2;
              let marker = isDirected ? "url(#arrowhead)" : "";

              if (active) { strokeColor = 'var(--accent-pink)'; strokeWidth = 3; marker = isDirected ? "url(#arrowhead-active)" : ""; }
              else if (visited) { strokeColor = '#888'; strokeWidth = 3; }

              const midX = (sourceNode.x + targetNode.x) / 2;
              const midY = (sourceNode.y + targetNode.y) / 2;

              return (
                <g key={edge.id}>
                  <line 
                    x1={sourceNode.x} y1={sourceNode.y} 
                    x2={targetNode.x} y2={targetNode.y} 
                    stroke={strokeColor} strokeWidth={strokeWidth} 
                    markerEnd={marker}
                  />
                  {isWeighted && edge.weight !== undefined && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect x="-12" y="-10" width="24" height="20" fill="white" rx="4" />
                      <text textAnchor="middle" dy="4" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="#666" fontWeight="bold">
                        {edge.weight}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {graphData.nodes.map(node => {
              const isStart = node.id === inputData.startNodeId;
              const visited = isNodeVisited(node.id);
              const active = isNodeActive(node.id);
              
              let bgColor = 'white';
              let borderColor = '#ccc';
              
              if (active) { bgColor = '#fff1ed'; borderColor = 'var(--accent-pink)'; }
              else if (visited) { bgColor = '#f0f0f0'; borderColor = '#888'; }
              if (isStart) { borderColor = 'var(--accent-pink)'; }

              return (
                <g 
                  key={node.id} 
                  transform={`translate(${node.x}, ${node.y})`} 
                  onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                  style={{ cursor: mode === 'practice' ? 'pointer' : 'grab' }}
                >
                  <circle r={NODE_RADIUS} fill={bgColor} stroke={borderColor} strokeWidth="3" />
                  <text textAnchor="middle" dy="5" fontSize="14" fontFamily="Inter, sans-serif" fontWeight="600" fill="#333">
                    {getLabel(node.id)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {mode === 'watch' && <PlaybackControls playback={playback} />}
        
        <div className="operations-log card-box">
          <div className="log-header">
             <span className="mono-text bold">operations log</span>
             <div className="log-stats">
               <span>visited nodes {currentDisplay?.visitedNodes?.length || 0}</span>
             </div>
          </div>
          <span className="log-message">
            {mode === 'watch' ? (currentDisplay?.message || "press play to begin observation -") : "Practice Mode Active. Distance table auto-updates on correct picks."}
          </span>
        </div>

        {showConfigModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '500px', boxShadow: 'var(--ink-shadow-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontFamily: 'Inter, sans-serif' }}>Configure Graph Manually</h3>
                  <button onClick={() => setShowConfigModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Number of Nodes (Max 26):</label>
                  <input type="number" min="1" max="26" value={configNodes} onChange={e => setConfigNodes(parseInt(e.target.value) || 1)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontFamily: 'Inter, sans-serif' }} />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Edges {isWeighted ? "(Format: Source-Target-Weight)" : "(Format: Source-Target)"}
                  </label>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', marginTop: 0 }}>
                    Enter one edge per line. Example: {isWeighted ? "A-B-5 or A, B, 5" : "A-B or A, B"}
                  </p>
                  <textarea 
                    rows={8} 
                    value={configEdges} 
                    onChange={e => setConfigEdges(e.target.value)} 
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem', resize: 'vertical' }} 
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => setShowConfigModal(false)}
                    style={{ flex: 1, padding: '0.8rem', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={applyConfig}
                    style={{ flex: 1, padding: '0.8rem', background: 'var(--accent-pink)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Render Graph
                  </button>
                </div>
             </div>
          </div>
        )}

        {mode === 'practice' && showTutorial && (
          <div onClick={() => setShowTutorial(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <div style={{ background: 'white', padding: '2rem 3rem', borderRadius: '16px', boxShadow: 'var(--ink-shadow-lg)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                Click the unvisited node {activeAlgorithm.name} should explore next!
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>click anywhere to start</p>
            </div>
          </div>
        )}

        {practiceError && (
          <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'white', border: '2px solid var(--accent-pink)', padding: '1rem', borderRadius: '12px', boxShadow: 'var(--ink-shadow-lg)', maxWidth: '300px', zIndex: 100, display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Info color="var(--accent-pink)" size={24} style={{ flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'var(--text-color)', lineHeight: 1.4 }}>
                {practiceError}
              </p>
            </div>
          </div>
        )}

      </div>
      <ChatbotWidget activeAlgorithm={activeAlgorithm} snapshot={snapshot} offsetRight="2rem" />
    </div>
  );
}
