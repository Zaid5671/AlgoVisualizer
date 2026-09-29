import { useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Code2 } from 'lucide-react';
import { Pseudocode } from './Pseudocode';
import { SegmentedControl } from './ui/SegmentedControl';

const SPEEDS = [0.5, 1, 2, 4].map(s => ({ value: s, label: `${s}x` }));

const isTypingTarget = (el) =>
  el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);

export function PlaybackControls({ playback, activeAlgorithm }) {
  const { state, actions } = playback;
  const [showPseudocode, setShowPseudocode] = useState(false);
  const lastIndex = Math.max(0, state.totalSteps - 1);

  // Keyboard shortcuts: Space = play/pause, ←/→ = step
  useEffect(() => {
    const onKeyDown = (e) => {
      if (isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (state.isPlaying) actions.pause();
        else if (!state.isFinished) actions.play();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        actions.stepForward();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        actions.stepBack();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state.isPlaying, state.isFinished, actions]);

  return (
    <div className="playback">
      <div className="playback__transport">
        <button onClick={actions.reset} className="btn-icon" aria-label="Reset" title="Reset">
          <RotateCcw size={16} strokeWidth={2.5} />
        </button>
        <button onClick={actions.stepBack} disabled={state.currentIndex === 0} className="btn-icon" aria-label="Step back" title="Step back (←)">
          <SkipBack size={16} strokeWidth={2.5} />
        </button>
        <button
          onClick={state.isPlaying ? actions.pause : actions.play}
          disabled={state.isFinished}
          className="btn-icon btn-play"
          aria-label={state.isPlaying ? 'Pause' : 'Play'}
          title={state.isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {state.isPlaying ? <Pause size={18} strokeWidth={2.5} fill="white" /> : <Play size={18} strokeWidth={2.5} fill="white" />}
        </button>
        <button onClick={actions.stepForward} disabled={state.isFinished} className="btn-icon" aria-label="Step forward" title="Step forward (→)">
          <SkipForward size={16} strokeWidth={2.5} />
        </button>
      </div>

      <div className="playback__scrubber">
        <span className="playback__counter">{state.currentIndex} / {lastIndex}</span>
        <input
          type="range"
          min="0"
          max={lastIndex}
          value={state.currentIndex}
          onChange={(e) => actions.seek(parseInt(e.target.value))}
          className="slider"
          aria-label="Timeline"
        />
      </div>

      <div className="playback__speed">
        <span className="eyebrow">speed</span>
        <SegmentedControl options={SPEEDS} value={state.speed} onChange={actions.setSpeed} variant="mono" ariaLabel="Playback speed" />
      </div>

      {activeAlgorithm?.pseudocode && (
        <button className="btn btn--sm btn-pseudocode" onClick={() => setShowPseudocode(!showPseudocode)}>
          <Code2 size={14} /> {showPseudocode ? 'hide' : 'show'} pseudocode
        </button>
      )}

      {activeAlgorithm?.pseudocode && (
        <Pseudocode
          isOpen={showPseudocode}
          onClose={() => setShowPseudocode(false)}
          code={activeAlgorithm.pseudocode}
        />
      )}

      <span className="playback__hint">space = play / pause · ← → = step</span>
    </div>
  );
}
