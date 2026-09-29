import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pause, Play, Shuffle, ArrowRight } from 'lucide-react';
import { BarChart } from '../sorting/BarChart';
import { Legend } from '../ui/Legend';
import { StepTypes } from '../../engine/stepTypes';
import { generateBubbleSortSnapshots } from '../../algorithms/sorting/bubbleSort';

// A small, self-running Bubble Sort using the real algorithm and bar chart from the app.

const STEP_MS = 550;
const LEGEND = [
  { label: 'being compared', color: 'var(--state-comparing)' },
  { label: 'being swapped', color: 'var(--state-swapping)' },
  { label: 'in its final place', color: 'var(--state-settled)' },
];

const randomArray = () => Array.from({ length: 9 }, () => Math.floor(Math.random() * 80) + 15);
const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function HeroDemo() {
  const [array, setArray] = useState(randomArray);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());

  const snapshots = useMemo(() => generateBubbleSortSnapshots(array), [array]);
  const last = snapshots.length - 1;
  const snapshot = snapshots[Math.min(index, last)];

  // Settled bars are only listed on "settled" steps, so carry them forward.
  const settled = useMemo(() => {
    const set = new Set();
    for (let i = 0; i <= Math.min(index, last); i++) snapshots[i].settledIndices?.forEach(s => set.add(s));
    if (index >= last) snapshot.array.forEach((_, i) => set.add(i));
    return set;
  }, [snapshots, index, last, snapshot]);

  useEffect(() => {
    if (!playing) return undefined;
    const id = setTimeout(() => {
      if (index < last) setIndex(index + 1);
      else { setArray(randomArray()); setIndex(0); } // start again with new numbers
    }, index < last ? STEP_MS : 2500);
    return () => clearTimeout(id);
  }, [playing, index, last]);

  const stateOf = (i) => {
    if (snapshot.activeIndices?.includes(i)) return snapshot.type === StepTypes.COMPARE ? 'comparing' : 'swapping';
    return settled.has(i) ? 'settled' : 'default';
  };

  const shuffle = () => { setArray(randomArray()); setIndex(0); };

  return (
    <figure className="hero-demo" aria-label="Live Bubble Sort demo">
      <div className="hero-demo__top">
        <span className="hero-demo__title"><span className="live-dot" aria-hidden="true" /> Bubble Sort, running live</span>
        <div className="hero-demo__controls">
          <button className="btn-icon" onClick={() => setPlaying(p => !p)} aria-label={playing ? 'Pause' : 'Play'} title={playing ? 'Pause' : 'Play'}>
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button className="btn-icon" onClick={shuffle} aria-label="New numbers" title="New numbers"><Shuffle size={15} /></button>
        </div>
      </div>
      <p className="hero-demo__message" aria-live="polite">{snapshot.message}</p>
      <BarChart values={snapshot.array} stateOf={stateOf} height={190} />
      <figcaption className="hero-demo__caption">
        <Legend items={LEGEND} />
        <p>Bubble Sort compares neighbours and swaps them when the left one is bigger, so the largest value "bubbles" to the end on every pass.</p>
        <Link to="/algorithm?algo=bubbleSort" className="text-link">Open it in the visualizer <ArrowRight size={14} /></Link>
      </figcaption>
    </figure>
  );
}
