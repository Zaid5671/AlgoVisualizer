import { Play, Pause, SkipBack, SkipForward, RotateCcw, VolumeX } from 'lucide-react';

export function PlaybackControls({ playback }) {
  const { state, actions } = playback;
  
  return (
    <div className="playback-controls">
      <div className="controls-group">
        <button onClick={actions.reset} className="btn-icon">
          <RotateCcw size={18} strokeWidth={2.5} />
        </button>
        <button onClick={actions.stepBack} disabled={state.currentIndex === 0} className="btn-icon">
          <SkipBack size={18} strokeWidth={2.5} color="#ccc" />
        </button>
        <button onClick={state.isPlaying ? actions.pause : actions.play} disabled={state.isFinished} className="btn-icon btn-play">
          {state.isPlaying ? <Pause size={18} strokeWidth={2.5} color="white" /> : <Play size={18} strokeWidth={2.5} color="white" fill="white" />}
        </button>
        <button onClick={actions.stepForward} disabled={state.isFinished} className="btn-icon">
          <SkipForward size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="scrubber-group">
        <span className="mono-text" style={{ color: '#999', fontSize: '0.65rem' }}>{state.currentIndex} / {state.totalSteps > 0 ? state.totalSteps - 1 : 0}</span>
        <input 
          type="range" 
          min="0" 
          max={Math.max(0, state.totalSteps - 1)} 
          value={state.currentIndex}
          onChange={(e) => actions.seek(parseInt(e.target.value))}
          className="slider"
        />
      </div>

      <div className="speed-group">
        <span className="mono-text" style={{ color: '#999', marginRight: '4px' }}>SPEED</span>
        {[0.5, 1, 2, 4].map(s => (
          <button 
            key={s} 
            onClick={() => actions.setSpeed(s)}
            className={`btn-speed ${state.speed === s ? 'active' : ''}`}
          >
            {s}x
          </button>
        ))}
      </div>

      <div className="controls-group" style={{ marginLeft: '0.5rem' }}>
        <button className="btn-icon">
          <VolumeX size={18} strokeWidth={2.5} />
        </button>
        <button className="btn-shuffle" onClick={actions.reset}>
          shuffle array
        </button>
        <span className="help-text" style={{ marginLeft: '0.5rem' }}>SPACE = PLAY  ·  → = STEP</span>
      </div>
    </div>
  );
}
