import { useState, useMemo } from 'react';
import { PlaybackControls } from '../components/PlaybackControls';
import { usePlayback } from '../engine/usePlayback';
import { Code2 } from 'lucide-react';
import { Pseudocode } from '../components/Pseudocode';
import { ChatbotWidget } from '../components/ChatbotWidget';
import { BACKTRACKING_PUZZLES } from '../data/backtrackingPuzzles';
import { PRESET_GRAPHS } from '../data/presetGraphs';

export function BacktrackingView({ activeAlgorithm }) {
  const [showPseudocode, setShowPseudocode] = useState(false);

  // Setup inputData based on algorithm
  const inputData = useMemo(() => {
    if (activeAlgorithm.id === 'nQueens') {
      return { boardSize: BACKTRACKING_PUZZLES.nQueens };
    } else if (activeAlgorithm.id === 'sudoku') {
      return { initialBoard: BACKTRACKING_PUZZLES.sudoku };
    } else if (activeAlgorithm.id === 'graphColoring') {
      // Use the 8-node preset graph for coloring, and allow 3 colors
      return { 
        nodes: PRESET_GRAPHS[8].nodes, 
        edges: PRESET_GRAPHS[8].edges,
        m: 3 
      };
    }
    return {};
  }, [activeAlgorithm.id]);

  const playback = usePlayback(activeAlgorithm.generator, inputData);
  const { snapshot } = playback.state;

  if (!snapshot) return <div>Loading...</div>;

  const renderBoard = () => {
    if (activeAlgorithm.id === 'nQueens') {
      return renderNQueens(snapshot);
    } else if (activeAlgorithm.id === 'sudoku') {
      return renderSudoku(snapshot);
    } else if (activeAlgorithm.id === 'graphColoring') {
      return renderGraphColoring(snapshot, inputData);
    }
    return null;
  };

  return (
    <div className="sorting-view" style={{ position: 'relative' }}>
      
      <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0', minHeight: '400px' }}>
        {renderBoard()}
      </div>

      <button className="btn-pseudocode" onClick={() => setShowPseudocode(!showPseudocode)} style={{ top: '650px' }}>
        <Code2 size={16} /> show pseudocode
      </button>

      <Pseudocode isOpen={showPseudocode} onClose={() => setShowPseudocode(false)} code={activeAlgorithm.pseudocode} />

      <PlaybackControls playback={playback} />
      
      <div className="operations-log">
        <div className="log-header">
           <span className="mono-text bold">operations log</span>
        </div>
        <span className="log-message">
          {snapshot.message || "press play to begin observation —"}
        </span>
      </div>

      <ChatbotWidget activeAlgorithm={activeAlgorithm} snapshot={snapshot} />
    </div>
  );
}

// Sub-renderers
function renderNQueens(snapshot) {
  if (!snapshot.board) return null;
  const boardSize = snapshot.board.length;
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${boardSize}, 50px)`,
      gridTemplateRows: `repeat(${boardSize}, 50px)`,
      border: '4px solid black',
      boxShadow: '8px 8px 0px rgba(0,0,0,0.1)'
    }}>
      {snapshot.board.map((row, r) => 
        row.map((cell, c) => {
          const isBlack = (r + c) % 2 === 1;
          const isActive = snapshot.activeCells?.some(ac => ac.r === r && ac.c === c);
          
          let bgColor = isBlack ? '#ccc' : '#fff';
          if (isActive) bgColor = 'var(--accent-yellow)';

          return (
            <div key={`${r}-${c}`} style={{
              backgroundColor: bgColor,
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontSize: '2rem'
            }}>
              {cell === 1 ? '♛' : ''}
            </div>
          );
        })
      )}
    </div>
  );
}

function renderSudoku(snapshot) {
  if (!snapshot.board) return null;
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(9, 40px)',
      gridTemplateRows: 'repeat(9, 40px)',
      border: '4px solid black',
      boxShadow: '8px 8px 0px rgba(0,0,0,0.1)',
      backgroundColor: 'black', // Used for thick grid lines
      gap: '1px' // Thin lines between all cells
    }}>
      {snapshot.board.map((row, r) => 
        row.map((cell, c) => {
          const isActive = snapshot.activeCells?.some(ac => ac.r === r && ac.c === c);
          
          // Thicker borders for 3x3 blocks
          const borderBottom = (r === 2 || r === 5) ? '3px solid black' : 'none';
          const borderRight = (c === 2 || c === 5) ? '3px solid black' : 'none';
          
          let bgColor = 'white';
          if (isActive) bgColor = 'var(--accent-pink)';

          return (
            <div key={`${r}-${c}`} style={{
              backgroundColor: bgColor,
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontSize: '1.2rem',
              fontWeight: cell !== 0 ? 'bold' : 'normal',
              color: isActive ? 'white' : 'black',
              borderBottom,
              borderRight
            }}>
              {cell !== 0 ? cell : ''}
            </div>
          );
        })
      )}
    </div>
  );
}

function renderGraphColoring(snapshot, inputData) {
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;
  const colors = ['#ff4d4d', '#4dff4d', '#4d4dff']; // Red, Green, Blue

  return (
    <svg 
      width={CANVAS_WIDTH} 
      height={CANVAS_HEIGHT} 
      style={{ 
        backgroundColor: 'white', 
        border: '2px solid var(--border-color)',
        boxShadow: '4px 4px 0px rgba(0,0,0,0.1)'
      }}
    >
      {/* Edges */}
      {inputData.edges.map(edge => {
        const sourceNode = inputData.nodes.find(n => n.id === edge.source);
        const targetNode = inputData.nodes.find(n => n.id === edge.target);
        
        return (
          <line 
            key={edge.id}
            x1={sourceNode.x} 
            y1={sourceNode.y} 
            x2={targetNode.x} 
            y2={targetNode.y} 
            stroke="#ddd" 
            strokeWidth="2"
          />
        );
      })}

      {/* Nodes */}
      {inputData.nodes.map(node => {
        const colorIndex = snapshot.colors?.[node.id];
        const isActive = snapshot.activeNodes?.includes(node.id);
        
        let fill = 'white';
        if (colorIndex !== undefined) fill = colors[colorIndex];
        
        return (
          <g key={node.id}>
            <circle 
              cx={node.x} 
              cy={node.y} 
              r={20} 
              fill={fill} 
              stroke={isActive ? 'black' : 'black'} 
              strokeWidth={isActive ? "4" : "2"}
              strokeDasharray={isActive ? "4" : "0"}
            />
            <text x={node.x} y={node.y} textAnchor="middle" dy="5" fontSize="14" fontWeight="bold">
              {node.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
