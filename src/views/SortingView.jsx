import { useState, useEffect } from 'react';
import { Shuffle } from 'lucide-react';
import { PlaybackControls } from '../components/PlaybackControls';
import { usePlayback } from '../engine/usePlayback';
import { StepTypes } from '../engine/stepTypes';
import { ChatbotWidget } from '../components/ChatbotWidget';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Legend } from '../components/ui/Legend';
import { OperationsLog } from '../components/OperationsLog';
import { BarChart } from '../components/sorting/BarChart';
import { SortingPractice } from '../components/practice/SortingPractice';

const MIN_SIZE = 5;
const MAX_SIZE = 50;
const MAX_VALUE = 999;

const MODES = [
  { value: 'watch', label: 'watch' },
  { value: 'practice', label: 'practice it yourself' },
];

const LEGEND = [
  { label: 'comparing', color: 'var(--state-comparing)' },
  { label: 'swapping / writing', color: 'var(--state-swapping)' },
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

export function SortingView({ activeAlgorithm, onStep, initialMode = 'watch' }) {
  const [arraySize, setArraySize] = useState(14);
  const [initialArray, setInitialArray] = useState(() => randomArray(14));
  const [customArrayStr, setCustomArrayStr] = useState('');
  const [customError, setCustomError] = useState(null);
  const [mode, setMode] = useState(initialMode);

  // Switching algorithm keeps the same array so algorithms can be compared on identical input.
  const playback = usePlayback(activeAlgorithm.generator, initialArray);
  const { snapshot, snapshots, currentIndex } = playback.state;

  useEffect(() => {
    if (onStep && snapshot) onStep(snapshot);
  }, [snapshot, onStep]);

  const handleSizeChange = (size) => {
    setArraySize(size);
    setInitialArray(randomArray(size));
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
    setInitialArray(nums);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'practice') playback.actions.pause();
  };

  if (!snapshot) return <div className="stage" style={{ minHeight: 420 }} />;

  let comparisons = 0;
  let swaps = 0;
  let writes = 0;
  for (let i = 0; i <= currentIndex; i++) {
    const type = snapshots[i]?.type;
    if (type === StepTypes.COMPARE) comparisons++;
    else if (type === StepTypes.SWAP) swaps++;
    else if (type === StepTypes.WRITE) writes++;
  }

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
          <button className="btn btn--sm" onClick={() => setInitialArray(randomArray(arraySize))}>
            <Shuffle size={14} /> shuffle
          </button>
        </div>
      </div>

      {mode === 'practice' ? (
        <SortingPractice
          key={`${activeAlgorithm.id}:${initialArray.join(',')}`}
          algorithm={activeAlgorithm}
          values={initialArray}
          onWatch={() => handleModeChange('watch')}
        />
      ) : (
        <section className="stage">
          <div className="stage__header">
            <span className="status-pill">{snapshot.message || 'press play to begin'}</span>
          </div>
          <BarChart values={snapshot.array || initialArray} stateOf={(idx) => barStateFor(snapshot, idx)} />
          <div className="stage__footer">
            <Legend items={LEGEND} />
          </div>
        </section>
      )}

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

      {mode === 'watch' && (
        <OperationsLog
          snapshots={snapshots}
          currentIndex={currentIndex}
          filters={['compare', 'swap', 'write']}
          stats={[
            { label: 'comparisons', value: comparisons },
            { label: 'swaps', value: swaps, tone: 'swaps' },
            ...(writes > 0 ? [{ label: 'writes', value: writes, tone: 'swaps' }] : []),
          ]}
        />
      )}

      <ChatbotWidget activeAlgorithm={activeAlgorithm} snapshot={snapshot} offsetRight="2rem" />
    </>
  );
}
