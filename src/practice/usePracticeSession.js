import { useState } from 'react';

// Hint levels: 0 none, 1 nudge text, 2 highlight the answer, then "show me" applies it.
export const MAX_HINT_LEVEL = 2;

/**
 * Generic practice session over a list of rounds (see src/practice/sortingPractice.js).
 *
 * Rounds with kind 'arrange' keep a working copy of the array (`work`) that the learner
 * edits and then checks against `round.target`. All other rounds are single-choice and
 * are answered with `choose(answer)`, validated by `round.accepts(answer)`.
 */
export function usePracticeSession(rounds) {
  const initialWork = rounds[0]?.kind === 'arrange' ? rounds[0].start : null;

  const [index, setIndex] = useState(0);
  const [work, setWork] = useState(initialWork);
  const [hintLevel, setHintLevel] = useState(0);
  const [history, setHistory] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [feedback, setFeedback] = useState(null); // { tone: 'error' | 'success', text }

  const round = rounds[index] ?? null;
  const done = index >= rounds.length;

  const snapshot = () => ({ index, work, hintLevel });
  const pushHistory = () => setHistory(h => [...h, snapshot()]);

  const advance = (successText) => {
    pushHistory();
    const next = rounds[index + 1];
    setIndex(index + 1);
    setWork(next?.kind === 'arrange' ? next.start : null);
    setHintLevel(0);
    setFeedback({ tone: 'success', text: successText });
  };

  const successMessage = (usedShowMe) => {
    const base = usedShowMe ? 'Here is the answer. Study it, then carry on.' : 'Correct!';
    return round?.tieNote ? `${base} ${round.tieNote}` : base;
  };

  const swapBars = (i, j) => {
    if (done || round.kind !== 'arrange' || i === j) return;
    pushHistory();
    const next = [...work];
    [next[i], next[j]] = [next[j], next[i]];
    setWork(next);
    setFeedback(null);
  };

  const check = () => {
    if (done || round.kind !== 'arrange') return;
    const wrong = work.filter((v, i) => v !== round.target[i]).length;
    if (wrong === 0) {
      advance(round.isNoop ? 'Correct! No swaps were needed, so the algorithm can stop here.' : successMessage(false));
    } else {
      setMistakes(m => m + 1);
      setFeedback({ tone: 'error', text: `${round.mistake} (${wrong} bar${wrong === 1 ? ' is' : 's are'} out of place.)` });
    }
  };

  const choose = (answer) => {
    if (done || round.kind === 'arrange') return;
    if (round.accepts(answer)) {
      advance(successMessage(false));
    } else {
      setMistakes(m => m + 1);
      setFeedback({ tone: 'error', text: round.mistake });
    }
  };

  const hint = () => {
    if (done) return;
    setHintsUsed(h => h + 1);
    if (hintLevel < MAX_HINT_LEVEL) {
      setHintLevel(hintLevel + 1);
      return;
    }
    // "Show me": apply the correct answer for this round.
    if (round.kind === 'arrange') {
      pushHistory();
      setWork(round.target);
      setFeedback({ tone: 'success', text: 'This is how the pass ends. Press Check to continue.' });
      setHintLevel(0);
    } else {
      advance(successMessage(true));
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setIndex(prev.index);
    setWork(prev.work);
    setHintLevel(prev.hintLevel);
    setFeedback(null);
  };

  const restart = () => {
    setIndex(0);
    setWork(initialWork);
    setHintLevel(0);
    setHistory([]);
    setMistakes(0);
    setHintsUsed(0);
    setFeedback(null);
  };

  return {
    round, index, total: rounds.length, done, work, hintLevel, mistakes, hintsUsed, feedback,
    canUndo: history.length > 0,
    actions: { swapBars, check, choose, hint, undo, restart },
  };
}
