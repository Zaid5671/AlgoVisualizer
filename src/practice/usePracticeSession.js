import { useState } from 'react';

// Hint levels: 0 none, 1 nudge text, 2 highlight the answer; pressing again = "show me".
export const MAX_HINT_LEVEL = 2;

/**
 * Generic practice session driven by a "stepper" engine:
 *
 *   engine.init()                 -> initial state
 *   engine.question(state)        -> current round, or null when finished
 *   engine.apply(state, answer)   -> next state (only called with accepted answers)
 *   engine.auto(state)            -> the implementation's own answer (used by "show me" and "skip")
 *   engine.reveal?(state)         -> optional: state showing the answer without advancing
 *                                    (sorting "arrange" rounds show the pass result, then the learner checks)
 *   engine.edit?(state, action)   -> optional: state after a free edit (e.g. swapping two bars)
 *
 * A round needs: accepts(answer), mistake (string or answer => string), nudge.
 * Optional: successNote (appended to "Correct!").
 *
 * Because the engine follows the learner's accepted answer, ties are handled naturally:
 * any accepted answer continues the run from that choice.
 */
export function usePracticeSession(engine) {
  const [state, setState] = useState(() => engine.init());
  const [hintLevel, setHintLevel] = useState(0);
  const [history, setHistory] = useState([]);
  const [steps, setSteps] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [feedback, setFeedback] = useState(null); // { tone: 'error' | 'success' | 'info', text }

  const round = engine.question(state);
  const done = round === null;

  const commit = (next, { advanced = 0, message = null, resetHint = true } = {}) => {
    setHistory(h => [...h, { state, hintLevel, steps }]);
    setState(next);
    if (advanced) setSteps(s => s + advanced);
    if (resetHint) setHintLevel(0);
    setFeedback(message);
  };

  const successText = (shown) => {
    const base = shown ? 'Here is the answer. Study it, then carry on.' : 'Correct!';
    return round?.successNote ? `${base} ${round.successNote}` : base;
  };

  const choose = (answer) => {
    if (done) return;
    if (round.accepts(answer)) {
      commit(engine.apply(state, answer), { advanced: 1, message: { tone: 'success', text: successText(false) } });
    } else {
      setMistakes(m => m + 1);
      const text = typeof round.mistake === 'function' ? round.mistake(answer) : round.mistake;
      setFeedback({ tone: 'error', text });
    }
  };

  const edit = (action) => {
    if (done || !engine.edit) return;
    commit(engine.edit(state, action), { resetHint: false });
  };

  const hint = () => {
    if (done) return;
    setHintsUsed(h => h + 1);
    if (hintLevel < MAX_HINT_LEVEL) {
      setHintLevel(hintLevel + 1);
      return;
    }
    const revealed = engine.reveal?.(state);
    if (revealed) {
      commit(revealed, { message: { tone: 'info', text: round.revealNote || 'This is the answer. Check it to continue.' } });
    } else {
      commit(engine.apply(state, engine.auto(state)), { advanced: 1, message: { tone: 'info', text: successText(true) } });
    }
  };

  // Let the algorithm make its own next `count` moves (not counted as hints).
  // Stops early when the kind of question changes (e.g. search -> trace), so a new phase is never skipped into.
  const skip = (count = 5) => {
    if (done) return;
    let next = state;
    let moved = 0;
    while (moved < count && engine.question(next)?.kind === round.kind) {
      next = engine.apply(next, engine.auto(next));
      moved++;
    }
    setSkipped(s => s + moved);
    commit(next, { advanced: moved, message: { tone: 'info', text: `Skipped ${moved} step${moved === 1 ? '' : 's'}; the algorithm made its own choices.` } });
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setState(prev.state);
    setHintLevel(prev.hintLevel);
    setSteps(prev.steps);
    setFeedback(null);
  };

  const restart = () => {
    setState(engine.init());
    setHintLevel(0);
    setHistory([]);
    setSteps(0);
    setMistakes(0);
    setHintsUsed(0);
    setSkipped(0);
    setFeedback(null);
  };

  return {
    state, round, done, steps, hintLevel, mistakes, hintsUsed, skipped, feedback,
    canUndo: history.length > 0,
    actions: { choose, edit, hint, skip, undo, restart },
  };
}
