import { useState, useEffect, useMemo } from 'react';
import { PlaybackControls } from '../components/PlaybackControls';
import { usePlayback } from '../engine/usePlayback';
import { StepTypes } from '../engine/stepTypes';
import { Code2, Info, Play, Square } from 'lucide-react';
import { Pseudocode } from '../components/Pseudocode';
import { ChatbotWidget } from '../components/ChatbotWidget';

const createInitialGrid = (rows, cols) => {
  const grid = [];
  for (let row = 0; row < rows; row++) {
    const currentRow = [];
    for (let col = 0; col < cols; col++) {
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
  const [numRows, setNumRows] = useState(20);
  const [numCols, setNumCols] = useState(35);
  
  const [grid, setGrid] = useState(() => createInitialGrid(20, 40));
  const [startNode, setStartNode] = useState({ row: 10, col: 5 });
  const [endNode, setEndNode] = useState({ row: 10, col: 35 });
  
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [drawMode, setDrawMode] = useState('wall');
  const [dragAction, setDragAction] = useState(null); // 'DRAW_WALL', 'DRAW_MUD', 'ERASE'
  
  const [showPseudocode, setShowPseudocode] = useState(false);
  
  const [mode, setMode] = useState('watch'); // 'watch' | 'practice'
  const [practiceStep, setPracticeStep] = useState(0);
  const [practiceError, setPracticeError] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const supportsWeights = activeAlgorithm.id === 'dijkstra' || activeAlgorithm.id === 'astar';

  useEffect(() => {
    if (!supportsWeights) {
      setDrawMode('wall');
      setGrid(prev => prev.map(row => row.map(node => ({ ...node, weight: 1 }))));
    }
  }, [supportsWeights]);

  const updateGridSize = (newRows, newCols) => {
    setNumRows(newRows);
    setNumCols(newCols);
    setGrid(createInitialGrid(newRows, newCols));
    
    // Recalculate start and end to be centered and away from edges
    const newStartRow = Math.floor(newRows / 2);
    const newStartCol = Math.floor(newCols * 0.1);
    const newEndRow = Math.floor(newRows / 2);
    const newEndCol = Math.floor(newCols * 0.9);
    
    setStartNode({ row: newStartRow, col: newStartCol });
    setEndNode({ row: newEndRow, col: newEndCol });
    
    playback.actions.reset();
    setPracticeStep(0);
    setPracticeError(null);
  };

  const clearGrid = (keepWalls = false) => {
    setGrid(prev => prev.map(row => 
      row.map(node => ({
        ...node,
        isWall: keepWalls ? node.isWall : false,
        weight: keepWalls ? node.weight : 1
      }))
    ));
    playback.actions.reset();
    setPracticeStep(0);
    setPracticeError(null);
  };

  const inputData = useMemo(() => ({ grid, startNode, endNode }), [grid, startNode, endNode]);
  const playback = usePlayback(activeAlgorithm.generator, inputData);
  const { snapshot, snapshots, currentIndex, isPlaying } = playback.state;

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
    }
  };

  const expectedClicks = useMemo(() => {
    if (!snapshots) return [];
    return snapshots.filter(s => s.type === StepTypes.COMPARE && s.currentNodes?.length > 0);
  }, [snapshots]);

  const isPracticeComplete = practiceStep >= expectedClicks.length;
  
  let practiceDisplaySnapshot = null;
  if (mode === 'practice') {
    if (practiceStep === 0) {
      practiceDisplaySnapshot = snapshots[0];
    } else if (isPracticeComplete) {
      practiceDisplaySnapshot = snapshots[snapshots.length - 1];
    } else {
      practiceDisplaySnapshot = expectedClicks[practiceStep - 1];
    }
  }

  const currentDisplay = mode === 'watch' ? snapshot : practiceDisplaySnapshot;

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

  const handleMouseDown = (row, col) => {
    if (mode === 'practice') {
      if (isPracticeComplete) return;
      const currentExpected = expectedClicks[practiceStep].currentNodes[0];
      if (currentExpected.row === row && currentExpected.col === col) {
        setPracticeStep(prev => prev + 1);
        setPracticeError(null);
      } else {
        setPracticeError(`Wrong move! Based on ${activeAlgorithm.name} rules, you should evaluate the cell at Row ${currentExpected.row}, Col ${currentExpected.col} next.`);
      }
      return;
    }

    if (isPlaying || currentIndex > 0) return;
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
    if (mode === 'practice') return;
    if (!mouseIsPressed || isPlaying || currentIndex > 0) return;
    if ((row === startNode.row && col === startNode.col) || (row === endNode.row && col === endNode.col)) return;
    applyDragAction(row, col, dragAction);
  };

  const handleMouseUp = () => {
    if (mode === 'practice') return;
    setMouseIsPressed(false);
  };

  if (!snapshot) return <div>Loading...</div>;

  const isVisited = (r, c) => currentDisplay?.visitedNodes?.some(n => n.row === r && n.col === c);
  const isPath = (r, c) => currentDisplay?.pathNodes?.some(n => n.row === r && n.col === c);
  const isCurrent = (r, c) => currentDisplay?.currentNodes?.some(n => n.row === r && n.col === c);

  return (
    <div className="sorting-view" style={{ position: 'relative', display: 'flex', width: '100%', minHeight: '100%', alignItems: 'stretch' }}>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', overflow: 'visible', position: 'relative' }}>
        
        <div className="card-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '4px', borderRadius: '999px', border: '1px solid var(--border-color)', width: 'fit-content' }}>
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
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'white', padding: '0.4rem 1rem', borderRadius: '999px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rows: {numRows}</span>
            <input type="range" min="10" max="30" value={numRows} onChange={(e) => updateGridSize(Number(e.target.value), numCols)} style={{ width: '80px', cursor: 'pointer' }} />
            <div style={{ width: '1px', height: '16px', background: 'var(--border-color)', margin: '0 4px' }}></div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cols: {numCols}</span>
            <input type="range" min="10" max="50" value={numCols} onChange={(e) => updateGridSize(numRows, Number(e.target.value))} style={{ width: '80px', cursor: 'pointer' }} />
          </div>

        </div>

        {mode === 'practice' && (
          <div style={{ marginBottom: '1rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
             STEP {practiceStep} / {expectedClicks.length} <span style={{ background: '#fff9e6', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px', color: 'black' }}>your turn</span>
          </div>
        )}

        <div className="sorting-controls card-box" style={{ justifyContent: 'center', gap: '1rem', padding: '0.5rem 1rem' }}>
           <button className="btn-use-this" onClick={() => clearGrid(false)}>Clear Grid</button>
           
           <div style={{ display: 'flex', gap: '0.5rem', opacity: mode === 'practice' ? 0.3 : 1, pointerEvents: mode === 'practice' ? 'none' : 'auto' }}>
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

        <div className="grid-container card-box" onMouseLeave={handleMouseUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}>
          <div className="pathfinding-grid" style={{ width: '96%', maxWidth: '1100px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {grid.map((row, rowIdx) => {
              return (
                <div key={rowIdx} className="grid-row" style={{ display: 'flex', flex: 1, gap: '1px' }}>
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
                        className={`node ${extraClass}`} style={{ flex: 1, aspectRatio: '1/1', width: 'auto', height: 'auto' }}
                        onMouseDown={() => handleMouseDown(row, col)}
                        onMouseEnter={() => handleMouseEnter(row, col)}
                        onMouseUp={handleMouseUp}
                        style={{ cursor: mode === 'practice' ? 'crosshair' : 'default', flex: 1, aspectRatio: '1 / 1', width: 'auto', height: 'auto', minWidth: 0, minHeight: 0 }}
                      >
                        {isStart && <Play size={10} fill="black" color="black" style={{ opacity: 0.7 }} />}
                        {isEnd && <Square size={8} fill="black" color="black" style={{ opacity: 0.7 }} />}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          
          {/* Unreachable Edge Case Overlay */}
          {currentDisplay?.type === StepTypes.END && (!currentDisplay.pathNodes || currentDisplay.pathNodes.length === 0) && (
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

        <div className="sorting-controls card-box" style={{ marginTop: 0, width: 'fit-content', padding: '0.5rem 1rem' }}>
          <div className="legend">
            <span className="legend-item"><span className="dot node-start"></span> Start Node</span>
            <span className="legend-item"><span className="dot node-end"></span> Target Node</span>
            <span className="legend-item"><span className="dot node-wall" style={{borderRadius: 4}}></span> Wall</span>
            <span className="legend-item"><span className="dot node-visited" style={{borderRadius: 4}}></span> Visited</span>
            <span className="legend-item"><span className="dot node-path" style={{borderRadius: 4}}></span> Shortest Path</span>
          </div>
        </div>

        <button className="btn-pseudocode" onClick={() => setShowPseudocode(!showPseudocode)} style={{ marginTop: '1rem' }}>
          <Code2 size={16} /> show pseudocode
        </button>

        <Pseudocode 
          isOpen={showPseudocode} 
          onClose={() => setShowPseudocode(false)} 
          code={activeAlgorithm.pseudocode} 
        />

        {mode === 'watch' && (
          <PlaybackControls playback={playback} />
        )}
        
        <div className="operations-log card-box" style={{ padding: '0.5rem 1rem' }}>
          <div className="log-header">
             <span className="mono-text bold">operations log</span>
             <div className="log-stats">
               <span>visited {currentDisplay?.visitedNodes?.length || 0}</span>
               <span className="swaps">path length {currentDisplay?.pathNodes?.length || 0}</span>
             </div>
          </div>
          <span className="log-message">
            {mode === 'watch' ? (currentDisplay?.message || "press play to begin observation —") : "Practice Mode Active"}
          </span>
        </div>

        {/* TUTORIAL OVERLAY */}
        {mode === 'practice' && showTutorial && (
          <div 
            onClick={() => setShowTutorial(false)}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)',
              zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
          >
            <div style={{
              background: 'white', padding: '2rem 3rem', borderRadius: '16px',
              boxShadow: 'var(--ink-shadow-lg)', border: '1px solid var(--border-color)', textAlign: 'center'
            }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                Click the exact cell {activeAlgorithm.name} would evaluate next!
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>click anywhere to start</p>
            </div>
          </div>
        )}

        {/* ERROR TOAST */}
        {practiceError && (
          <div style={{
            position: 'fixed', bottom: '2rem', right: '2rem', background: 'white',
            border: '2px solid var(--accent-pink)', padding: '1rem', borderRadius: '12px',
            boxShadow: 'var(--ink-shadow-lg)', maxWidth: '300px', zIndex: 100, display: 'flex',
            gap: '12px', alignItems: 'flex-start'
          }}>
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
