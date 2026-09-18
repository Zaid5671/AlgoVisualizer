import { useState, useMemo, useEffect } from 'react';
import { PlaybackControls } from '../components/PlaybackControls';
import { usePlayback } from '../engine/usePlayback';
import { StepTypes } from '../engine/stepTypes';
import { Code2, Info } from 'lucide-react';
import { ChatbotWidget } from '../components/ChatbotWidget';
import { BACKTRACKING_PUZZLES } from '../data/backtrackingPuzzles';
import { PRESET_GRAPHS } from '../data/presetGraphs';

export function BacktrackingView({ activeAlgorithm, onStep }) {
    const [mode, setMode] = useState('watch'); // 'watch' | 'practice'
  const [practiceStep, setPracticeStep] = useState(0);
  const [practiceError, setPracticeError] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const [selectedColor, setSelectedColor] = useState(0); // 0, 1, 2, or null(erase)
  const [nQueensSize, setNQueensSize] = useState(BACKTRACKING_PUZZLES.nQueens);
  const [sudokuPreFill, setSudokuPreFill] = useState(0); // 0 to 51 (number of empty cells)

  const inputData = useMemo(() => {
    if (activeAlgorithm.id === 'nQueens') return { boardSize: nQueensSize };
    else if (activeAlgorithm.id === 'sudoku') {
      const board = BACKTRACKING_PUZZLES.sudoku.map(row => [...row]);
      for (let i = 0; i < sudokuPreFill; i++) {
        const {r, c} = BACKTRACKING_PUZZLES.sudokuFillSequence[i];
        board[r][c] = BACKTRACKING_PUZZLES.sudokuSolved[r][c];
      }
      return { initialBoard: board };
    }
    else if (activeAlgorithm.id === 'graphColoring') return { nodes: PRESET_GRAPHS[8].nodes, edges: PRESET_GRAPHS[8].edges, m: 3 };
    return {};
  }, [activeAlgorithm.id, nQueensSize, sudokuPreFill]);

  const playback = usePlayback(activeAlgorithm.generator, inputData);
  const { snapshot, snapshots } = playback.state;

  useEffect(() => {
    if (snapshot && typeof onStep === 'function') onStep(snapshot);
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

  const expectedSwaps = useMemo(() => {
    if (!snapshots) return [];
    return snapshots.filter(s => s.type === StepTypes.SWAP);
  }, [snapshots]);

  const isPracticeComplete = practiceStep >= expectedSwaps.length;

  let practiceDisplaySnapshot = null;
  if (mode === 'practice') {
    if (practiceStep === 0) practiceDisplaySnapshot = snapshots[0];
    else if (isPracticeComplete) practiceDisplaySnapshot = snapshots[snapshots.length - 1];
    else practiceDisplaySnapshot = expectedSwaps[practiceStep - 1];
  }

  const currentDisplay = mode === 'watch' ? snapshot : practiceDisplaySnapshot;

    // Prevent crashes during algorithm switching when the snapshot is stale
    const isStale = (activeAlgorithm.id === 'sudoku' && (!currentDisplay?.board || currentDisplay.board.length !== 9)) ||
                    (activeAlgorithm.id === 'nQueens' && (!currentDisplay?.board || currentDisplay.board.length !== nQueensSize)) ||
                    (activeAlgorithm.id === 'graphColoring' && !currentDisplay?.colors) || !snapshot;

  // Also defensively add optional chaining to activeCells array lookups to prevent any other edge case crashes


  const handleNQueensClick = (r, c) => {
    if (mode !== 'practice' || isPracticeComplete) return;
    const expected = expectedSwaps[practiceStep];
    if (expected.activeCells[0].r === r && expected.activeCells[0].c === c) {
      setPracticeStep(prev => prev + 1);
      setPracticeError(null);
    } else {
      setPracticeError(`Wrong move! Based on backtracking, the algorithm evaluates row ${expected.activeCells[0].r}, col ${expected.activeCells[0].c} next.`);
    }
  };

  const handleSudokuInput = (r, c, val) => {
    if (mode !== 'practice' || isPracticeComplete) return;
    const expected = expectedSwaps[practiceStep];
    const expectedR = expected.activeCells[0].r;
    const expectedC = expected.activeCells[0].c;
    const expectedVal = expected.board[expectedR][expectedC]; // Value after swap

    if (r === expectedR && c === expectedC && val === expectedVal) {
      setPracticeStep(prev => prev + 1);
      setPracticeError(null);
    } else {
      const action = expectedVal === 0 ? "backtrack (erase)" : `guess ${expectedVal}`;
      setPracticeError(`Wrong move! The algorithm would ${action} at row ${expectedR}, col ${expectedC} next.`);
    }
  };

  const handleGraphColoringClick = (nodeId) => {
    if (mode !== 'practice' || isPracticeComplete) return;
    const expected = expectedSwaps[practiceStep];
    const expectedNode = expected.activeNodes[0];
    const expectedColor = expected.colors[expectedNode];
    
    if (nodeId === expectedNode && selectedColor === (expectedColor === undefined ? null : expectedColor)) {
      setPracticeStep(prev => prev + 1);
      setPracticeError(null);
    } else {
      const action = expectedColor === undefined ? "erase the color from" : `apply color ${expectedColor} to`;
      setPracticeError(`Wrong move! The algorithm would ${action} node ${expectedNode} next.`);
    }
  };

  const renderBoard = () => {
    if (isStale) return <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ opacity: 0.5 }} className="mono-text">Recomputing algorithmic states...</span></div>;

    if (activeAlgorithm.id === 'nQueens') {
      const boardSize = currentDisplay.board.length;
      return (
        <div style={{ display: 'grid', width: '100%', maxWidth: '500px', aspectRatio: '1 / 1', gridTemplateColumns: `repeat(${boardSize}, 1fr)`, gridTemplateRows: `repeat(${boardSize}, 1fr)`, border: '2px solid rgba(0,0,0,0.05)', boxShadow: 'var(--ink-shadow-sm)', borderRadius: '12px', overflow: 'hidden', margin: '0 auto' }}>
          {currentDisplay.board.map((row, r) => 
            row.map((cell, c) => {
              const isBlack = (r + c) % 2 === 1;
              const isActive = mode === 'watch' && currentDisplay.activeCells?.some(ac => ac.r === r && ac.c === c);
              let bgColor = isBlack ? '#e3d6a8' : '#fcf8ed';
              if (isActive) bgColor = 'var(--accent-yellow)';

              // In practice mode, we can optionally highlight the cell the algorithm is currently at, but backtracking usually implies the user must figure it out. We will highlight the previous one to help them know where they are.
              const isLastMove = mode === 'practice' && practiceStep > 0 && !isPracticeComplete && expectedSwaps[practiceStep-1]?.activeCells?.[0]?.r === r && expectedSwaps[practiceStep-1]?.activeCells?.[0]?.c === c;
              if (isLastMove) bgColor = '#dcfce7'; // light green

              return (
                <div key={`${r}-${c}`} onClick={() => handleNQueensClick(r, c)} style={{ backgroundColor: bgColor, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem', cursor: mode === 'practice' ? 'pointer' : 'default' }}>
                  {cell === 1 ? '♛' : ''}
                </div>
              );
            })
          )}
        </div>
      );
    } else if (activeAlgorithm.id === 'sudoku') {
      return (
        <div style={{ display: 'grid', width: '100%', maxWidth: '450px', maxHeight: '450px', aspectRatio: '1 / 1', gridTemplateColumns: 'repeat(9, 1fr)', gridTemplateRows: 'repeat(9, 1fr)', border: '2px solid var(--text-color)', backgroundColor: 'var(--text-color)', gap: '1px', boxShadow: 'var(--ink-shadow-sm)', borderRadius: '4px', overflow: 'hidden' }}>
          {currentDisplay.board.map((row, r) => 
            row.map((cell, c) => {
              const isActive = mode === 'watch' && currentDisplay.activeCells?.some(ac => ac.r === r && ac.c === c);
              const isExpectedCell = mode === 'practice' && !isPracticeComplete && expectedSwaps[practiceStep]?.activeCells?.[0]?.r === r && expectedSwaps[practiceStep]?.activeCells?.[0]?.c === c;
              
              const borderBottom = (r === 2 || r === 5) ? '2px solid var(--text-color)' : 'none';
              const borderRight = (c === 2 || c === 5) ? '2px solid var(--text-color)' : 'none';
              
              let bgColor = 'white';
              if (isActive) bgColor = 'var(--accent-pink)';
              if (isExpectedCell) bgColor = '#fff9e6'; // highlight where they should type

              const isInitial = inputData.initialBoard[r][c] !== 0;

              return (
                <div key={`${r}-${c}`} style={{ boxSizing: 'border-box', backgroundColor: bgColor, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem', fontWeight: isInitial ? 'bold' : 'normal', color: isActive ? 'white' : 'black', borderBottom, borderRight }}>
                  {isInitial ? cell : (
                    <input 
                      type="text"
                      maxLength="1"
                      value={cell !== 0 ? cell : ''}
                      readOnly={mode !== 'practice'}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        handleSudokuInput(r, c, val);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' || e.key === 'Delete') {
                          handleSudokuInput(r, c, 0);
                        }
                      }}
                      style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', textAlign: 'center', fontSize: '1.2rem', outline: 'none', cursor: mode === 'practice' ? 'text' : 'default', fontWeight: '500' }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      );
    } else if (activeAlgorithm.id === 'graphColoring') {
      const colors = ['#ff4d4d', '#4dff4d', '#4d4dff'];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          {mode === 'practice' && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              {colors.map((c, i) => (
                <div key={i} onClick={() => setSelectedColor(i)} style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: c, border: selectedColor === i ? '3px solid black' : '2px solid transparent', cursor: 'pointer', boxShadow: 'var(--ink-shadow-sm)' }}></div>
              ))}
              <div onClick={() => setSelectedColor(null)} style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'white', border: selectedColor === null ? '3px solid black' : '2px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>X</div>
            </div>
          )}
          <svg width={800} height={400} style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--ink-shadow-sm)' }}>
            {inputData.edges.map(edge => {
              const sourceNode = inputData.nodes.find(n => n.id === edge.source);
              const targetNode = inputData.nodes.find(n => n.id === edge.target);
              return <line key={edge.id} x1={sourceNode.x} y1={sourceNode.y} x2={targetNode.x} y2={targetNode.y} stroke="#e5e7eb" strokeWidth="3" />;
            })}
            {inputData.nodes.map(node => {
              const colorIndex = currentDisplay.colors?.[node.id];
              const isActive = mode === 'watch' && currentDisplay.activeNodes?.includes(node.id);
              let fill = 'white';
              if (colorIndex !== undefined) fill = colors[colorIndex];
              
              return (
                <g key={node.id} onClick={() => handleGraphColoringClick(node.id)} style={{ cursor: mode === 'practice' ? 'pointer' : 'default' }}>
                  <circle cx={node.x} cy={node.y} r={22} fill={fill} stroke={isActive ? 'black' : 'var(--border-color)'} strokeWidth={isActive ? "3" : "2"} />
                  <text x={node.x} y={node.y} textAnchor="middle" dy="5" fontSize="14" fontWeight="600" fill="#333">{node.id}</text>
                </g>
              );
            })}
          </svg>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="sorting-view" style={{ position: 'relative', display: 'flex', width: '100%', minHeight: '100%', alignItems: 'stretch' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'visible', position: 'relative' }}>
        
        <div className="card-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '4px', borderRadius: '999px', border: '1px solid var(--border-color)', width: 'fit-content' }}>
             <button onClick={() => handleModeChange('watch')} style={{ padding: '0.4rem 1.2rem', borderRadius: '999px', border: 'none', background: mode === 'watch' ? 'var(--accent-yellow)' : 'transparent', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>watch</button>
             <button onClick={() => handleModeChange('practice')} style={{ padding: '0.4rem 1.2rem', borderRadius: '999px', border: 'none', background: mode === 'practice' ? 'var(--accent-yellow)' : 'transparent', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>practice it yourself</button>
          </div>
          {activeAlgorithm.id === 'nQueens' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'white', padding: '0.4rem 1rem', borderRadius: '999px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Board: {nQueensSize}x{nQueensSize}</span>
              <input type="range" min="4" max="9" value={nQueensSize} onChange={(e) => {
                setNQueensSize(Number(e.target.value));
                playback.actions.reset();
                setPracticeStep(0);
                setPracticeError(null);
              }} style={{ width: '80px', cursor: 'pointer' }} />
            </div>
          )}
          {activeAlgorithm.id === 'sudoku' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'white', padding: '0.4rem 1rem', borderRadius: '999px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pre-filled Cells: {30 + sudokuPreFill}</span>
              <input type="range" min="0" max={BACKTRACKING_PUZZLES.sudokuFillSequence.length} value={sudokuPreFill} onChange={(e) => {
                setSudokuPreFill(Number(e.target.value));
                playback.actions.reset();
                setPracticeStep(0);
                setPracticeError(null);
              }} style={{ width: '120px', cursor: 'pointer' }} />
            </div>
          )}
        </div>

        {mode === 'practice' && (
          <div style={{ marginBottom: '1rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
             MOVE {practiceStep} / {expectedSwaps.length} <span style={{ background: '#fff9e6', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px', color: 'black' }}>your turn</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
          {renderBoard()}
        </div>

        {mode === 'watch' && <PlaybackControls playback={playback} activeAlgorithm={activeAlgorithm} />}
        
        <div className="operations-log card-box">
          <div className="log-header">
             <span className="mono-text bold">operations log</span>
          </div>
          <span className="log-message">
            {mode === 'watch' ? (currentDisplay?.message || "press play to begin observation —") : "Practice Mode Active. Perform the next algorithmic step."}
          </span>
        </div>

        {mode === 'practice' && showTutorial && (
          <div onClick={() => setShowTutorial(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <div style={{ background: 'white', padding: '2rem 3rem', borderRadius: '16px', boxShadow: 'var(--ink-shadow-lg)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                Follow the backtracking logic exactly!
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
