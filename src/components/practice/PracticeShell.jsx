import { Lightbulb, Undo2, RotateCcw, CheckCircle2, XCircle, Info, FastForward, Trophy } from 'lucide-react';
import { MAX_HINT_LEVEL } from '../../practice/usePracticeSession';

const HINT_LABELS = ['Hint', 'Show where', 'Show me'];
const FEEDBACK_ICONS = { error: XCircle, success: CheckCircle2, info: Info };

/**
 * Shared frame for every practice mode.
 *
 * session       - return value of usePracticeSession
 * status        - short label for the header (e.g. "Pass 2"), shown while in progress
 * intro         - one-line explanation shown before the first move
 * primaryAction - optional extra button (e.g. Check), rendered first in the action bar
 * canSkip       - show "Skip 5" (let the algorithm make its own moves)
 * footnote      - small text on the right of the action bar
 * summary       - { title, body, extra } rendered when the session is done
 * onWatch       - "watch it instead" handler on the summary screen
 */
export function PracticeShell({ session, status, intro, children, primaryAction, canSkip, footnote, summary, onWatch }) {
  const { round, done, steps, hintLevel, mistakes, hintsUsed, skipped, feedback, canUndo, actions } = session;
  const FeedbackIcon = feedback ? FEEDBACK_ICONS[feedback.tone] : null;

  return (
    <section className="stage practice">
      <div className="stage__header">
        <span className="status-pill">
          {done
            ? <span className="tag tag--done">complete</span>
            : <>STEP <strong>{steps + 1}</strong> {status && <span className="tag">{status}</span>}</>}
        </span>
        <span className="practice-score">
          <span title="Mistakes"><XCircle size={14} /> {mistakes}</span>
          <span title="Hints used"><Lightbulb size={14} /> {hintsUsed}</span>
          {skipped > 0 && <span title="Steps skipped"><FastForward size={14} /> {skipped}</span>}
        </span>
      </div>

      {done ? (
        <div className="practice-summary">
          <Trophy size={28} />
          <h3>{summary.title}</h3>
          <p>
            {summary.body}{' '}
            You made <strong>{mistakes} mistake{mistakes === 1 ? '' : 's'}</strong> and used{' '}
            <strong>{hintsUsed} hint{hintsUsed === 1 ? '' : 's'}</strong>
            {skipped > 0 ? `, and skipped ${skipped} step${skipped === 1 ? '' : 's'}` : ''}.
            {mistakes === 0 && hintsUsed === 0 && skipped === 0 ? ' Flawless!' : ''}
          </p>
          {summary.extra}
          <div className="practice-summary__actions">
            <button className="btn btn--primary" onClick={actions.restart}><RotateCcw size={14} /> practice again</button>
            {onWatch && <button className="btn" onClick={onWatch}>watch it instead</button>}
          </div>
        </div>
      ) : (
        <>
          <div className="practice-prompt">
            {intro && steps === 0 && !canUndo && <p className="practice-prompt__intro">{intro}</p>}
            <p className="practice-prompt__question">{round.prompt}</p>
            {hintLevel >= 1 && <p className="practice-prompt__nudge"><Lightbulb size={14} /> {round.nudge}</p>}
          </div>

          {children}

          {feedback && (
            <div className={`practice-feedback practice-feedback--${feedback.tone}`} role={feedback.tone === 'error' ? 'alert' : 'status'}>
              <FeedbackIcon size={18} style={{ flexShrink: 0 }} />
              <span>{feedback.text}</span>
            </div>
          )}

          <div className="stage__footer">
            <div className="practice-actions">
              {primaryAction}
              <button className="btn" onClick={actions.hint}>
                <Lightbulb size={14} /> {HINT_LABELS[Math.min(hintLevel, MAX_HINT_LEVEL)]}
              </button>
              {canSkip && <button className="btn" onClick={() => actions.skip(5)} title="Let the algorithm make its next 5 moves"><FastForward size={14} /> Skip 5</button>}
              <button className="btn" onClick={actions.undo} disabled={!canUndo}><Undo2 size={14} /> Undo</button>
              <button className="btn btn--ghost" onClick={actions.restart}><RotateCcw size={14} /> Restart</button>
            </div>
            {footnote && <span className="stage__hint">{footnote}</span>}
          </div>
        </>
      )}
    </section>
  );
}
