import { useState, useEffect, useRef } from 'react';
import { Info, Shuffle, CheckCircle2 } from 'lucide-react';
import { PlaybackControls } from '../components/PlaybackControls';
import { usePlayback } from '../engine/usePlayback';
import { StepTypes } from '../engine/stepTypes';
import { ChatbotWidget } from '../components/ChatbotWidget';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Legend } from '../components/ui/Legend';

const MIN_SIZE = 5;
const MAX_SIZE = 50;
const MAX_VALUE = 999;
// Above this many bars the value labels overlap, so they move to a hover tooltip.
const DENSE_THRESHOLD = 24;
const LOG_LIMIT = 200;

const MODES = [
  { value: 'watch', label: 'watch' },
  { value: 'practice', label: 'practice it yourself' },
];

const LOG_FILTERS = ['all', 'compare', 'swap'];

const LEGEND = [
  { label: 'comparing', color: 'var(--state-comparing)' },
  { label: 'swapping', color: 'var(--state-swapping)' },
  { label: 'pivot / anchor', color: 'var(--state-pivot)' },
  { label: 'settled', color: 'var(--state-settled)' },
];

const randomArray = (size) => Array.from({ length: size }, () => Math.floor(Math.random() * 85) + 10);

const barStateFor = (snapshot, idx) => {
  if (snapshot.activeIndices?.includes(idx)) {
    if (snapshot.type === StepTypes.COMPARE) return 'comparing';
    if (snapshot.type === StepTypes.PIVOT) return 'pivot';
    return 'swapping';
  }
  if (snapshot.settledIndices?.includes(idx)) return 'settled';
  return 'default';
};

export function SortingView({ activeAlgorithm, onStep }) {
  const [arraySize, setArraySize] = useState(14);
  const [initialArray, setInitialArray] = useState(() => randomArray(14));
  const [customArrayStr, setCustomArrayStr] = useState('');
  const [customError, setCustomError] = useState(null);
  const [logFilter, setLogFilter] = useState('all');

  // Practice mode state
  const [mode, setMode] = useState('watch');
  const [practiceStep, setPracticeStep] = useState(0);
  const [practiceError, setPracticeError] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState(null);

  const logListRef = useRef(null);

  const resetPractice = () => {
    setPracticeStep(0);
    setPracticeError(null);
  };

  // Switching algorithm keeps the same array (so algorithms can be compared on identical input)
  // but restarts any practice run.
  const [practiceAlgoId, setPracticeAlgoId] = useState(activeAlgorithm.id);
  if (practiceAlgoId !== activeAlgorithm.id) {
    setPracticeAlgoId(activeAlgorithm.id);
    resetPractice();
  }

  const playback = usePlayback(activeAlgorithm.generator, initialArray);
  const { snapshot, snapshots, currentIndex } = playback.state;

  useEffect(() => {
    if (onStep && snapshot) onStep(snapshot);
  }, [snapshot, onStep]);

  // Keep the newest log entry in view (scrolls the log box only, not the page).
  useEffect(() => {
    const list = logListRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [currentIndex, logFilter]);

  const loadArray = (arr) => {
    setInitialArray(arr);
    resetPractice();
  };

  const handleSizeChange = (size) => {
    setArraySize(size);
    loadArray(randomArray(size));
  };

  const handleCustomArraySubmit = (e) => {
    e.preventDefault();
    const parts = customArrayStr.split(',').map(s => s.trim()).filter(Boolean);
    const nums = parts.map(Number);

    if (nums.length < 2) return setCustomError('Enter at least 2 numbers, separated by commas.');
    if (nums.length > MAX_SIZE) return setCustomError(`Use at most ${MAX_SIZE} numbers.`);
    if (nums.some(n => !Number.isInteger(n) || n < 0 || n > MAX_VALUE)) {
      return setCustomError(`Only whole numbers from 0 to ${MAX_VALUE} are supported.`);
    }

    setCustomError(null);
    setArraySize(nums.length);
    loadArray(nums);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    resetPractice();
    if (newMode === 'practice') {
      playback.actions.pause();
      setShowTutorial(true);
    }
  };

  if (!snapshot) return <div className="stage" style={{ minHeight: 420 }} />;

  const maxVal = Math.max(...initialArray, 100);

  // --- PRACTICE MODE ---
  const expectedSwaps = snapshots.filter(s => s.type === StepTypes.SWAP);
  const isPracticeComplete = practiceStep >= expectedSwaps.length;

  let practiceDisplaySnapshot = null;
  if (mode === 'practice') {
    if (practiceStep === 0) practiceDisplaySnapshot = snapshots[0];
    else if (isPracticeComplete) practiceDisplaySnapshot = snapshots[snapshots.length - 1];
    else practiceDisplaySnapshot = expectedSwaps[practiceStep - 1];
  }

  const currentDisplay = mode === 'watch' ? snapshot : practiceDisplaySnapshot;
  const currentArray = currentDisplay ? currentDisplay.array : initialArray;
  const canDrag = mode === 'practice' && !isPracticeComplete;

  const handleDragStart = (e, idx) => {
    if (!canDrag) {
      e.preventDefault();
      return;
    }
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, targetIdx) => {
    if (!canDrag || draggedIdx === null) return;

    const expectedIndices = expectedSwaps[practiceStep]?.activeIndices;
    if (!expectedIndices) return;

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

  // --- STATS + LOG ---
  let comparisons = 0;
  let swaps = 0;
  for (let i = 0; i <= currentIndex; i++) {
    if (snapshots[i]?.type === StepTypes.COMPARE) comparisons++;
    if (snapshots[i]?.type === StepTypes.SWAP) swaps++;
  }

  const logEntries = snapshots
    .slice(0, currentIndex + 1)
    .map((s, step) => ({ step, type: s.type, message: s.message }))
    .filter(entry => entry.message && (logFilter === 'all' || entry.type === logFilter))
    .slice(-LOG_LIMIT);

  const isDense = currentArray.length > DENSE_THRESHOLD;

  return (
    <>
      <div className="view-toolbar">
        <SegmentedControl options={MODES} value={mode} onChange={handleModeChange} ariaLabel="Mode" />
        <div className="view-toolbar__group">
          <label className="array-size-control">
            <span className="eyebrow">array size</span>
            <input
              type="range"
              min={MIN_SIZE}
              max={MAX_SIZE}
              value={arraySize}
              onChange={(e) => handleSizeChange(parseInt(e.target.value))}
              className="slider"
            />
            <span className="array-size-control__value">{arraySize}</span>
          </label>
          <button className="btn btn--sm" onClick={() => loadArray(randomArray(arraySize))}>
            <Shuffle size={14} /> shuffle
          </button>
        </div>
      </div>

      <section className="stage">
        <div className="stage__header">
          {mode === 'practice' ? (
            <span className="status-pill">
              SWAP <strong>{Math.min(practiceStep, expectedSwaps.length)} / {expectedSwaps.length}</strong>
              {isPracticeComplete
                ? <span className="tag tag--done">done</span>
                : <span className="tag">your turn</span>}
            </span>
          ) : (
            <span className="status-pill">{snapshot.message || 'press play to begin'}</span>
          )}
        </div>

        <div className={`bar-chart ${isDense ? 'is-dense' : ''} ${canDrag ? 'is-practice' : ''}`}>
          {currentArray.map((val, idx) => {
            const state = mode === 'watch'
              ? barStateFor(snapshot, idx)
              : (currentDisplay?.settledIndices?.includes(idx) ? 'settled' : 'default');

            return (
              <div
                key={idx}
                className={`bar-slot ${draggedIdx === idx ? 'is-dragging' : ''}`}
                title={isDense ? String(val) : undefined}
                draggable={canDrag}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={() => setDraggedIdx(null)}
              >
                <div className={`bar bar-${state}`} style={{ height: `${(val / maxVal) * 100}%` }}>
                  <span className="bar-value">{val}</span>
                </div>
              </div>
            );
          })}
        </div>

        {mode === 'practice' && practiceError && (
          <div className="practice-feedback practice-feedback--error" role="alert">
            <Info size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{practiceError}</span>
          </div>
        )}

        {mode === 'practice' && isPracticeComplete && (
          <div className="practice-feedback practice-feedback--success" role="status">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} /> Sorted! You made all {expectedSwaps.length} swaps correctly.
            </span>
            <button className="btn btn--sm" onClick={resetPractice}>try again</button>
          </div>
        )}

        <div className="stage__footer">
          <Legend items={LEGEND} />
        </div>

        {mode === 'practice' && showTutorial && (
          <div className="stage-overlay" onClick={() => setShowTutorial(false)}>
            <div className="stage-overlay__card">
              <div className="tutorial-bars">
                <div className="tutorial-bar-left" />
                <div className="tutorial-bar-right" />
              </div>
              <p>drag a bar onto another to swap</p>
              <p>click anywhere to start</p>
            </div>
          </div>
        )}
      </section>

      {mode === 'watch' && <PlaybackControls playback={playback} activeAlgorithm={activeAlgorithm} />}

      <form className="custom-array-form" onSubmit={handleCustomArraySubmit}>
        <span className="custom-array-form__label">Got your own numbers?</span>
        <input
          type="text"
          placeholder="e.g. 42, 8, 15, 23, 4"
          value={customArrayStr}
          onChange={(e) => setCustomArrayStr(e.target.value)}
          className="text-input custom-array-input"
        />
        {customError && <span className="custom-array-form__error">{customError}</span>}
        <button type="submit" className="btn btn--dark btn-use-this">use this</button>
      </form>

      <section className="operations-log">
        <div className="log-header">
          <span className="log-header__title">Operations log</span>
          {mode === 'watch' && (
            <div className="log-header__tools">
              <div className="log-stats">
                <span>comparisons {comparisons}</span>
                <span className="swaps">swaps {swaps}</span>
              </div>
              <div className="log-filters" role="group" aria-label="Log filter">
                {LOG_FILTERS.map(f => (
                  <button key={f} className={`chip ${logFilter === f ? 'active' : ''}`} onClick={() => setLogFilter(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {mode === 'watch' ? (
          <ol className="log-list" ref={logListRef}>
            {logEntries.length === 0 && <li className="log-entry"><span /><span /><span>press play to begin observation</span></li>}
            {logEntries.map(entry => (
              <li key={entry.step} className={`log-entry ${entry.step === currentIndex ? 'is-current' : ''}`}>
                <span className="log-entry__step">#{entry.step}</span>
                <span className={`log-entry__type log-entry__type--${entry.type}`}>{entry.type}</span>
                <span>{entry.message}</span>
              </li>
            ))}
          </ol>
        ) : (
          <span className="log-message">Practice mode: drag one bar onto another to make the next swap {activeAlgorithm.name} would make.</span>
        )}
      </section>

      <ChatbotWidget activeAlgorithm={activeAlgorithm} snapshot={snapshot} offsetRight="2rem" />
    </>
  );
}
