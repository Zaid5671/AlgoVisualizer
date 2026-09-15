import { useState, useEffect } from 'react';
import { PlaybackControls } from '../components/PlaybackControls';
import { usePlayback } from '../engine/usePlayback';
import { StepTypes } from '../engine/stepTypes';
import { Code2 } from 'lucide-react';
import { Pseudocode } from '../components/Pseudocode';
import { ChatbotWidget } from '../components/ChatbotWidget';

export function SortingView({ activeAlgorithm, onStep }) {
  const [arraySize, setArraySize] = useState(14);
  const [customArrayStr, setCustomArrayStr] = useState('');
  const [initialArray, setInitialArray] = useState([]);
  const [logFilter, setLogFilter] = useState('all');
  const [showPseudocode, setShowPseudocode] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(350); // Kept to avoid breaking existing state usage, even though unused
  
  // Generate random array on size change
  useEffect(() => {
    setInitialArray(Array.from({length: arraySize}, () => Math.floor(Math.random() * 85) + 10));
  }, [arraySize, activeAlgorithm.id]);

  // Hook handles running generator and feeding engine
  const playback = usePlayback(activeAlgorithm.generator, initialArray);
  const { snapshot, snapshots, currentIndex } = playback.state;

  // Sync snapshot with parent
  useEffect(() => {
    if (onStep && snapshot) {
      onStep(snapshot);
    }
  }, [snapshot, onStep]);

  const handleCustomArraySubmit = (e) => {
    e.preventDefault();
    try {
      const arr = customArrayStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (arr.length > 0) {
        setInitialArray(arr);
        setArraySize(arr.length);
      }
    } catch (e) {
      console.error("Invalid array input");
    }
  };

  if (!snapshot) return <div>Loading...</div>;

  const maxVal = Math.max(...initialArray, 100);

  // Count stats up to current index
  let comparisons = 0;
  let swaps = 0;
  for (let i = 0; i <= currentIndex; i++) {
    if (snapshots[i]?.type === StepTypes.COMPARE) comparisons++;
    if (snapshots[i]?.type === StepTypes.SWAP) swaps++;
  }

  // Filter logs
  let currentLogMessage = snapshot.message;
  if (logFilter !== 'all') {
    if ((logFilter === 'compare' && snapshot.type !== StepTypes.COMPARE) ||
        (logFilter === 'swap' && snapshot.type !== StepTypes.SWAP)) {
      currentLogMessage = "...";
    }
  }

  return (
    <div className="sorting-view" style={{ 
      position: 'relative', 
      display: 'flex', 
      width: '100%', 
      height: '100%', 
      alignItems: 'stretch' 
    }}>
      
      {/* LEFT COLUMN: Visualizer (flex: 1) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        <div className="bar-chart-container" style={{ margin: 0, minHeight: '300px' }}>
            <div className="bar-chart">
              {snapshot.array.map((val, idx) => {
                let stateClass = 'default';
                if (snapshot.activeIndices?.includes(idx)) {
                   stateClass = snapshot.type === StepTypes.COMPARE ? 'comparing' : 'swapping';
                } else if (snapshot.settledIndices?.includes(idx)) {
                   stateClass = 'settled';
                }

                return (
                  <div 
                    key={idx} 
                    className={`bar bar-${stateClass}`}
                    style={{ height: `${(val / maxVal) * 100}%` }}
                  >
                    <span className="bar-value">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sorting-controls">
            <div className="legend">
              <span className="legend-item"><span className="dot comparing"></span> comparing</span>
              <span className="legend-item"><span className="dot swapping"></span> swapping</span>
              <span className="legend-item"><span className="dot pivot"></span> pivot / anchor</span>
              <span className="legend-item"><span className="dot settled"></span> settled</span>
            </div>
            
            <div className="array-size-control">
               <span className="mono-text" style={{ color: '#999' }}>ARRAY SIZE</span>
               <input 
                 type="range" min="5" max="50" 
                 value={arraySize} 
                 onChange={(e) => setArraySize(parseInt(e.target.value))}
                 className="slider"
                 style={{ width: '100px' }}
               />
               <span className="mono-text" style={{ color: '#666' }}>{arraySize}</span>
            </div>
          </div>

          <form className="custom-array-form" onSubmit={handleCustomArraySubmit}>
            <span className="mono-text bold">got your own numbers?</span>
            <input 
              type="text" 
              placeholder="e.g. 42, 8, 15, 23, 4"
              value={customArrayStr}
              onChange={(e) => setCustomArrayStr(e.target.value)}
              className="custom-array-input"
            />
            <button type="submit" className="btn-use-this">use this</button>
          </form>

          {activeAlgorithm.id !== 'bubbleSort' && (
            <button className="btn-pseudocode" onClick={() => setShowPseudocode(!showPseudocode)}>
              <Code2 size={16} /> show pseudocode
            </button>
          )}

          <Pseudocode 
            isOpen={showPseudocode} 
            onClose={() => setShowPseudocode(false)} 
            code={activeAlgorithm.pseudocode} 
          />

          <PlaybackControls playback={playback} />
          
          <div className="log-filters">
            <span className="mono-text" style={{ color: '#999', marginRight: '0.5rem' }}>SHOW IN LOG:</span>
            <button className={`log-filter-btn ${logFilter === 'all' ? 'active' : ''}`} onClick={() => setLogFilter('all')}>all</button>
            <button className={`log-filter-btn ${logFilter === 'compare' ? 'active' : ''}`} onClick={() => setLogFilter('compare')}>compare</button>
            <button className={`log-filter-btn ${logFilter === 'swap' ? 'active' : ''}`} onClick={() => setLogFilter('swap')}>swap</button>
          </div>

          <div className="operations-log">
            <div className="log-header">
               <span className="mono-text bold">operations log</span>
               <div className="log-stats">
                 <span>comparisons {comparisons}</span>
                 <span className="swaps">swaps {swaps}</span>
               </div>
            </div>
            <span className="log-message">
              {currentLogMessage || "press play to begin observation -"}
            </span>
        </div>

      </div>

      {/* Dynamically push chatbot if right panel is open */}
      <ChatbotWidget 
        activeAlgorithm={activeAlgorithm} 
        snapshot={snapshot} 
        offsetRight="2rem"
      />

    </div>
  );
}
