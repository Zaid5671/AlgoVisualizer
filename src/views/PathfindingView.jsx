import { useState, useEffect, useMemo } from 'react';
import { PlaybackControls } from '../components/PlaybackControls';
import { usePlayback } from '../engine/usePlayback';
import { StepTypes } from '../engine/stepTypes';
import { Code2 } from 'lucide-react';
import { Pseudocode } from '../components/Pseudocode';
import { ChatbotWidget } from '../components/ChatbotWidget';

const NUM_ROWS = 20;
const NUM_COLS = 40;
const DEFAULT_START = { row: 10, col: 5 };
const DEFAULT_END = { row: 10, col: 35 };

const createInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < NUM_ROWS; row++) {
    const currentRow = [];
    for (let col = 0; col < NUM_COLS; col++) {
      currentRow.push({
        row,
        col,
        isWall: false,
        weight: 1
      });
    }
    grid.push(currentRow);
  }
  return grid;
};

export function PathfindingView({ activeAlgorithm, onStep }) {
  const [grid, setGrid] = useState(() => createInitialGrid());
  const [startNode, setStartNode] = useState(DEFAULT_START);
  const [endNode, setEndNode] = useState(DEFAULT_END);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  
  const [drawMode, setDrawMode] = useState('wall');
  const [dragAction, setDragAction] = useState(null); // 'DRAW_WALL', 'DRAW_MUD', 'ERASE'
  
  const [showPseudocode, setShowPseudocode] = useState(false);
  
  const supportsWeights = activeAlgorithm.id === 'dijkstra' || activeAlgorithm.id === 'astar';

  // Clear mud if we switch to an algorithm that doesn't support it
  useEffect(() => {
    if (!supportsWeights) {
      setDrawMode('wall');
      setGrid(prev => prev.map(row => row.map(node => ({ ...node, weight: 1 }))));
    }
  }, [supportsWeights]);

  const clearGrid = (keepWalls = false) => {
    setGrid(prev => prev.map(row => 
      row.map(node => ({
        ...node,
        isWall: keepWalls ? node.isWall : false,
        weight: keepWalls ? node.weight : 1
      }))
    ));
    playback.actions.reset();
  };

  // Package data for the generator (memoized to prevent infinite re-renders)
  const inputData = useMemo(() => ({ grid, startNode, endNode }), [grid, startNode, endNode]);
  const playback = usePlayback(activeAlgorithm.generator, inputData);

  const { snapshot, currentIndex, isPlaying } = playback.state;

  useEffect(() => {
    if (snapshot && typeof onStep === 'function') {
      onStep(snapshot);
    }
  }, [snapshot, onStep]);

  const applyDragAction = (row, col, action) => {
    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[row] = [...newGrid[row]];
      const node = { ...newGrid[row][col] };
      
      if (action === 'ERASE') {
        node.isWall = false;
        node.weight = 1;
      } else if (action === 'DRAW_WALL') {
        node.isWall = true;
        node.weight = 1;
      } else if (action === 'DRAW_MUD') {
        node.isWall = false;
        node.weight = 5;
      }
      
      newGrid[row][col] = node;
      return newGrid;
    });
  };

  // Grid interaction handlers
  const handleMouseDown = (row, col) => {
    if (isPlaying || currentIndex > 0) return; // Disable editing during playback
    if ((row === startNode.row && col === startNode.col) || (row === endNode.row && col === endNode.col)) return;
    
    const isCurrentlyWall = grid[row][col].isWall;
    const isCurrentlyMud = grid[row][col].weight > 1;
    const isCurrentlyEmpty = !isCurrentlyWall && !isCurrentlyMud;

    let action;
    if (isCurrentlyEmpty) {
      action = drawMode === 'mud' ? 'DRAW_MUD' : 'DRAW_WALL';
    } else {
      action = 'ERASE';
    }
    
    setDragAction(action);
    applyDragAction(row, col, action);
    setMouseIsPressed(true);
  };

  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed || isPlaying || currentIndex > 0) return;
    if ((row === startNode.row && col === startNode.col) || (row === endNode.row && col === endNode.col)) return;
    applyDragAction(row, col, dragAction);
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
  };

  const clearWalls = () => {
    setGrid(createInitialGrid());
    playback.actions.reset();
  };

  if (!snapshot) return <div>Loading...</div>;

  // Check if a node is visited, path, or current based on the snapshot
  const isVisited = (r, c) => snapshot.visitedNodes?.some(n => n.row === r && n.col === c);
  const isPath = (r, c) => snapshot.pathNodes?.some(n => n.row === r && n.col === c);
  const isCurrent = (r, c) => snapshot.currentNodes?.some(n => n.row === r && n.col === c);

  return (
    <div className="sorting-view" style={{ position: 'relative' }}>
      
      <div className="sorting-controls" style={{ justifyContent: 'center', marginBottom: '1rem', gap: '1rem' }}>
         <button className="btn-use-this" onClick={clearWalls}>Clear Grid</button>
         
         <div style={{ display: 'flex', gap: '0.5rem' }}>
           <button 
             className="btn-use-this" 
             style={{ opacity: drawMode === 'wall' ? 1 : 0.5, borderColor: 'black', fontWeight: 'bold' }} 
             onClick={() => setDrawMode('wall')}
           >Draw Walls</button>
           {supportsWeights && (
             <button 
               className="btn-use-this" 
               style={{ opacity: drawMode === 'mud' ? 1 : 0.5, borderColor: 'black', fontWeight: 'bold', backgroundColor: '#a0785a', color: 'white' }}
               onClick={() => setDrawMode('mud')}
             >Draw Mud (Cost: 5)</button>
           )}
         </div>
      </div>

      <div className="grid-container" onMouseLeave={handleMouseUp}>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx} className="grid-row">
                {row.map((node, nodeIdx) => {
                  const { row, col, isWall, weight } = node;
                  const isStart = row === startNode.row && col === startNode.col;
                  const isEnd = row === endNode.row && col === endNode.col;
                  
                  let extraClass = '';
                  if (isStart) extraClass = 'node-start';
                  else if (isEnd) extraClass = 'node-end';
                  else if (isWall) extraClass = 'node-wall';
                  else if (weight > 1) extraClass = 'node-mud';
                  else if (isPath(row, col)) extraClass = 'node-path';
                  else if (isCurrent(row, col)) extraClass = 'node-current';
                  else if (isVisited(row, col)) extraClass = 'node-visited';

                  return (
                    <div
                      key={`${row}-${col}`}
                      id={`node-${row}-${col}`}
                      className={`node ${extraClass}`}
                      onMouseDown={() => handleMouseDown(row, col)}
                      onMouseEnter={() => handleMouseEnter(row, col)}
                      onMouseUp={handleMouseUp}
                    ></div>
                  );
                })}
              </div>
            );
          })}
        </div>
        
        {/* Unreachable Edge Case Overlay */}
        {snapshot.type === StepTypes.END && (!snapshot.pathNodes || snapshot.pathNodes.length === 0) && (
          <div style={{
            position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
            backgroundColor: 'var(--accent-pink)', border: '4px solid black',
            padding: '1rem 2rem', boxShadow: '8px 8px 0px black', zIndex: 10
          }}>
            <h2 style={{ margin: 0 }}>NO PATH FOUND!</h2>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>The target is completely blocked.</p>
          </div>
        )}
      </div>

      <div className="sorting-controls" style={{ marginTop: '1rem' }}>
        <div className="legend">
          <span className="legend-item"><span className="dot node-start"></span> Start Node</span>
          <span className="legend-item"><span className="dot node-end"></span> Target Node</span>
          <span className="legend-item"><span className="dot node-wall" style={{borderRadius: 0}}></span> Wall</span>
          <span className="legend-item"><span className="dot node-visited" style={{borderRadius: 0}}></span> Visited</span>
          <span className="legend-item"><span className="dot node-path" style={{borderRadius: 0}}></span> Shortest Path</span>
        </div>
      </div>

      <button className="btn-pseudocode" onClick={() => setShowPseudocode(!showPseudocode)} style={{ top: '650px' }}>
        <Code2 size={16} /> show pseudocode
      </button>

      <Pseudocode 
        isOpen={showPseudocode} 
        onClose={() => setShowPseudocode(false)} 
        code={activeAlgorithm.pseudocode} 
      />

      <PlaybackControls playback={playback} />
      
      <div className="operations-log">
        <div className="log-header">
           <span className="mono-text bold">operations log</span>
           <div className="log-stats">
             <span>visited {snapshot.visitedNodes?.length || 0}</span>
             <span className="swaps">path length {snapshot.pathNodes?.length || 0}</span>
           </div>
        </div>
        <span className="log-message">
          {snapshot.message || "press play to begin observation —"}
        </span>
      </div>

      <ChatbotWidget activeAlgorithm={activeAlgorithm} snapshot={snapshot} />
    </div>
  );
}
