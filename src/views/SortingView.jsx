import { useState, useEffect } from 'react';
import { PlaybackControls } from '../components/PlaybackControls';
import { usePlayback } from '../engine/usePlayback';
import { StepTypes } from '../engine/stepTypes';
import { Code2, Info } from 'lucide-react';
import { ChatbotWidget } from '../components/ChatbotWidget';

export function SortingView({ activeAlgorithm, onStep }) {
  const [arraySize, setArraySize] = useState(14);
  const [customArrayStr, setCustomArrayStr] = useState('');
  const [initialArray, setInitialArray] = useState([]);
  const [logFilter, setLogFilter] = useState('all');
    
  // Practice Mode State
  const [mode, setMode] = useState('watch'); // 'watch' | 'practice'
  const [practiceStep, setPracticeStep] = useState(0);
  const [practiceError, setPracticeError] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState(null);

  // Generate random array on size change
  useEffect(() => {
    setInitialArray(Array.from({length: arraySize}, () => Math.floor(Math.random() * 85) + 10));
    setPracticeStep(0);
    setPracticeError(null);
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
        setPracticeStep(0);
        setPracticeError(null);
      }
    } catch (e) {
      console.error("Invalid array input");
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'practice') {
      playback.actions.pause();
      setPracticeStep(0);
      setPracticeError(null);
      setShowTutorial(true);
    }
  };

  if (!snapshot) return <div>Loading...</div>;

  const maxVal = Math.max(...initialArray, 100);

  // --- PRACTICE MODE LOGIC ---
  const expectedSwaps = snapshots.filter(s => s.type === StepTypes.SWAP);
  const isPracticeComplete = practiceStep >= expectedSwaps.length;
  
  // The array to display in practice mode is the array AFTER the previous successful swap
  let practiceDisplaySnapshot = null;
  if (mode === 'practice') {
    if (practiceStep === 0) {
      // Find the first snapshot before any swaps to get initial settled states if any
      practiceDisplaySnapshot = snapshots[0]; 
    } else if (isPracticeComplete) {
      practiceDisplaySnapshot = snapshots[snapshots.length - 1];
    } else {
      practiceDisplaySnapshot = expectedSwaps[practiceStep - 1];
    }
  }

  const currentDisplay = mode === 'watch' ? snapshot : practiceDisplaySnapshot;
  const currentArray = currentDisplay ? currentDisplay.array : initialArray;
  const settledIndices = currentDisplay?.settledIndices || [];

  const handleDragStart = (e, idx) => {
    if (mode !== 'practice' || isPracticeComplete) {
      e.preventDefault();
      return;
    }
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, targetIdx) => {
    if (mode !== 'practice' || draggedIdx === null || isPracticeComplete) return;
    
    const currentExpected = expectedSwaps[practiceStep];
    if (!currentExpected) return;

    const expectedIndices = currentExpected.activeIndices;
    
    const isCorrect = (draggedIdx === expectedIndices[0] && targetIdx === expectedIndices[1]) ||
                      (draggedIdx === expectedIndices[1] && targetIdx === expectedIndices[0]);

    if (isCorrect) {
      setPracticeStep(prev => prev + 1);
      setPracticeError(null);
    } else {
      setPracticeError(`Wrong move! ${activeAlgorithm.name} expects you to swap elements at index ${expectedIndices[0]} and ${expectedIndices[1]} next.`);
    }
    setDraggedIdx(null);
  };

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
      minHeight: '100%', 
      alignItems: 'stretch' 
    }}>
      
      {/* LEFT COLUMN: Visualizer (flex: 1) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'visible', position: 'relative' }}>
        
        {/* MODE TOGGLE */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', background: 'white', padding: '4px', borderRadius: '999px', border: '1px solid var(--border-color)', width: 'fit-content' }}>
           <button 
             onClick={() => handleModeChange('watch')}
             style={{
               padding: '0.4rem 1.2rem',
               borderRadius: '999px',
               border: 'none',
               background: mode === 'watch' ? 'var(--accent-yellow)' : 'transparent',
               fontWeight: 600,
               cursor: 'pointer',
               fontFamily: 'Inter, sans-serif'
             }}
           >
             watch
           </button>
           <button 
             onClick={() => handleModeChange('practice')}
             style={{
               padding: '0.4rem 1.2rem',
               borderRadius: '999px',
               border: 'none',
               background: mode === 'practice' ? 'var(--accent-yellow)' : 'transparent',
               fontWeight: 600,
               cursor: 'pointer',
               fontFamily: 'Inter, sans-serif'
             }}
           >
             practice it yourself
           </button>
        </div>

        {mode === 'practice' && (
          <div style={{ marginBottom: '1rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
             SWAP {practiceStep} / {expectedSwaps.length} <span style={{ background: '#fff9e6', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px', color: 'black' }}>your turn</span>
          </div>
        )}

        <div className="bar-chart-container card-box" style={{ margin: 0, minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            <div className="bar-chart">
              {currentArray.map((val, idx) => {
                let stateClass = 'default';
                
                if (mode === 'watch') {
                  if (snapshot.activeIndices?.includes(idx)) {
                     stateClass = snapshot.type === StepTypes.COMPARE ? 'comparing' : 'swapping';
                  } else if (snapshot.settledIndices?.includes(idx)) {
                     stateClass = 'settled';
                  }
                } else {
                  if (settledIndices.includes(idx)) {
                    stateClass = 'settled';
                  }
                  // Optionally highlight expected active in practice mode if they struggle? We let them guess.
                }

                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      height: '100%',
                      display: 'flex',
                      alignItems: 'flex-end',
                      cursor: mode === 'practice' && !isPracticeComplete ? 'grab' : 'default',
                      opacity: draggedIdx === idx ? 0.5 : 1
                    }}
                    draggable={mode === 'practice' && !isPracticeComplete}
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={() => setDraggedIdx(null)}
                  >
                    <div 
                      className={`bar bar-${stateClass}`}
                      style={{ 
                        height: `${(val / maxVal) * 100}%`,
                        width: '100%'
                      }}
                    >
                      <span className="bar-value">{val}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sorting-controls card-box">
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

          
          
          {mode === 'watch' && (
            <PlaybackControls playback={playback} activeAlgorithm={activeAlgorithm} />
          )}
          
          <div className="log-filters">
            <span className="mono-text" style={{ color: '#999', marginRight: '0.5rem' }}>SHOW IN LOG:</span>
            <button className={`log-filter-btn ${logFilter === 'all' ? 'active' : ''}`} onClick={() => setLogFilter('all')}>all</button>
            <button className={`log-filter-btn ${logFilter === 'compare' ? 'active' : ''}`} onClick={() => setLogFilter('compare')}>compare</button>
            <button className={`log-filter-btn ${logFilter === 'swap' ? 'active' : ''}`} onClick={() => setLogFilter('swap')}>swap</button>
          </div>

          <div className="operations-log card-box">
            <div className="log-header">
               <span className="mono-text bold">operations log</span>
               {mode === 'watch' && (
                 <div className="log-stats">
                   <span>comparisons {comparisons}</span>
                   <span className="swaps">swaps {swaps}</span>
                 </div>
               )}
            </div>
            <span className="log-message">
              {mode === 'watch' ? (currentLogMessage || "press play to begin observation -") : "Practice Mode Active"}
            </span>
          </div>

          {/* TUTORIAL OVERLAY */}
          {mode === 'practice' && showTutorial && (
            <div 
              onClick={() => setShowTutorial(false)}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(2px)',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <div style={{
                background: 'white',
                padding: '2rem 3rem',
                borderRadius: '16px',
                boxShadow: 'var(--ink-shadow-lg)',
                border: '1px solid var(--border-color)',
                textAlign: 'center'
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '8px', marginBottom: '1rem', height: '100px', paddingBottom: '10px' }}>
                  <div className="tutorial-bar-left" style={{ width: '30px', height: '60px', background: 'var(--accent-pink)', borderRadius: '4px' }}></div>
                  <div className="tutorial-bar-right" style={{ width: '30px', height: '80px', background: 'var(--accent-blue)', borderRadius: '4px' }}></div>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                  drag a bar onto another to swap
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>click anywhere to start</p>
              </div>
            </div>
          )}

          {/* ERROR TOAST */}
          {practiceError && (
            <div style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              background: 'white',
              border: '2px solid var(--accent-pink)',
              padding: '1rem',
              borderRadius: '12px',
              boxShadow: 'var(--ink-shadow-lg)',
              maxWidth: '300px',
              zIndex: 100,
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
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

      {/* Dynamically push chatbot if right panel is open */}
      <ChatbotWidget 
        activeAlgorithm={activeAlgorithm} 
        snapshot={snapshot} 
        offsetRight="2rem"
      />

    </div>
  );
}
