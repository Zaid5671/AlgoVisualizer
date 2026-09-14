import { useState, useEffect, useRef } from 'react';
import { PlaybackEngine } from './PlaybackEngine';

export function usePlayback(generator, inputData) {
  // Use a ref so the engine instance persists across re-renders
  const engineRef = useRef(new PlaybackEngine());
  const engine = engineRef.current;

  // React state just to trigger re-renders
  const [playbackState, setPlaybackState] = useState(engine.getCurrentState());

  useEffect(() => {
    // Subscribe to engine changes
    const unsubscribe = engine.subscribe(setPlaybackState);
    return unsubscribe;
  }, [engine]);

  // Handle data or algorithm changes
  useEffect(() => {
    const hasData = Array.isArray(inputData) ? inputData.length > 0 : !!inputData;
    
    if (generator && hasData) {
      // Small timeout to prevent blocking the main thread during heavy generation
      const timeoutId = setTimeout(() => {
        const snapshots = generator(inputData);
        engine.loadSnapshots(snapshots);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [engine, generator, inputData]);

  return {
    state: playbackState,
    actions: {
      play: () => engine.play(),
      pause: () => engine.pause(),
      stepForward: () => engine.stepForward(),
      stepBack: () => engine.stepBack(),
      reset: () => engine.reset(),
      seek: (index) => engine.seek(index),
      setSpeed: (speed) => engine.setSpeed(speed),
    }
  };
}
