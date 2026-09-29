import { useState } from 'react';
import { Check } from 'lucide-react';
import { BarChart } from '../sorting/BarChart';
import { createSortingEngine, nextHelpfulSwap, PRACTICE_INTRO } from '../../practice/sortingPractice';
import { usePracticeSession } from '../../practice/usePracticeSession';
import { PracticeShell } from './PracticeShell';

export const PRACTICE_MAX_VALUES = 8;

function Chip({ value, tone, onClick, disabled, highlight }) {
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      className={`value-chip ${tone ? `value-chip--${tone}` : ''} ${highlight ? 'is-hint' : ''}`}
      onClick={onClick}
      disabled={onClick ? disabled : undefined}
    >
      {value}
    </Tag>
  );
}

// ---------------------------------------------------------------------------
// Per-kind visuals
// ---------------------------------------------------------------------------
function ArrangeVisual({ round, work, hintLevel, settled, onSwap }) {
  const [selected, setSelected] = useState(null);
  const wrong = hintLevel >= 2 ? new Set(nextHelpfulSwap(work, round.target)) : new Set();

  const handleClick = (idx) => {
    if (selected === null) setSelected(idx);
    else if (selected === idx) setSelected(null);
    else { onSwap(selected, idx); setSelected(null); }
  };

  return (
    <BarChart
      values={work}
      stateOf={(idx) => (settled.includes(idx) ? 'settled' : round.focus?.includes(idx) && work[idx] === round.start[idx] ? 'pivot' : 'default')}
      markOf={(idx) => [selected === idx && 'is-selected', wrong.has(idx) && 'is-hint'].filter(Boolean).join(' ')}
      labelOf={(idx) => (round.gap ? `g${(idx % round.gap) + 1}` : idx)}
      onBarClick={handleClick}
      onSwap={(i, j) => { onSwap(i, j); setSelected(null); }}
    />
  );
}

function MergeVisual({ round, hintLevel, onChoose }) {
  const [lo, hi] = round.range;
  const hint = hintLevel >= 2 ? round.highlightAnswer : null;
  return (
    <>
      <BarChart
        values={round.array}
        stateOf={(idx) => (idx >= lo && idx < lo + round.merged.length ? 'settled' : 'default')}
        markOf={(idx) => (idx < lo || idx > hi ? 'is-dim' : '')}
        labelOf={(idx) => idx}
        height={220}
      />
      <div className="merge-board">
        <div className="merge-board__row">
          <span className="eyebrow">left run</span>
          <div className="merge-board__chips">
            {round.left.map((v, i) => (
              <Chip key={i} value={v} tone={i === 0 ? 'blue' : null} onClick={i === 0 ? () => onChoose('left') : undefined} highlight={i === 0 && hint === 'left'} />
            ))}
          </div>
        </div>
        <div className="merge-board__row">
          <span className="eyebrow">right run</span>
          <div className="merge-board__chips">
            {round.right.map((v, i) => (
              <Chip key={i} value={v} tone={i === 0 ? 'purple' : null} onClick={i === 0 ? () => onChoose('right') : undefined} highlight={i === 0 && hint === 'right'} />
            ))}
          </div>
        </div>
        <div className="merge-board__row">
          <span className="eyebrow">merged</span>
          <div className="merge-board__chips">
            {round.merged.length === 0 ? <span className="merge-board__empty">empty</span> : round.merged.map((v, i) => <Chip key={i} value={v} tone="green" />)}
            <span className="value-chip value-chip--slot">?</span>
          </div>
        </div>
      </div>
    </>
  );
}

function PivotVisual({ round, hintLevel, onChoose }) {
  const [lo, hi] = round.range;
  const hint = hintLevel >= 2 ? new Set(round.highlightIndices) : new Set();
  return (
    <BarChart
      values={round.array}
      stateOf={(idx) => (idx === round.pivotIndex ? 'pivot' : round.settled.includes(idx) ? 'settled' : 'default')}
      markOf={(idx) => [(idx < lo || idx > hi) && 'is-dim', idx >= lo && idx <= hi && 'is-target', hint.has(idx) && 'is-hint'].filter(Boolean).join(' ')}
      labelOf={(idx) => idx}
      onBarClick={(idx) => { if (idx >= lo && idx <= hi) onChoose(idx); }}
    />
  );
}

function HeapVisual({ round, hintLevel, onChoose }) {
  const hint = hintLevel >= 2 ? new Set(round.highlightIndices) : new Set();
  return (
    <>
      <BarChart
        values={round.array}
        stateOf={(idx) => (idx === round.node ? 'pivot' : round.children.includes(idx) ? 'comparing' : round.settled.includes(idx) ? 'settled' : 'default')}
        markOf={(idx) => [idx >= round.heapSize && !round.settled.includes(idx) && 'is-dim', round.children.includes(idx) && 'is-target', hint.has(idx) && 'is-hint'].filter(Boolean).join(' ')}
        labelOf={(idx) => idx}
        onBarClick={(idx) => { if (round.children.includes(idx)) onChoose(idx); }}
      />
      <div className="practice-choices">
        <span className="practice-choices__label">
          Parent <strong>{round.array[round.node]}</strong> at {round.node} · children {round.children.map(c => `${round.array[c]} at ${c}`).join(', ')}
        </span>
        <button className={`btn btn--sm ${hintLevel >= 2 && round.answer === 'stop' ? 'is-hint' : ''}`} onClick={() => onChoose('stop')}>
          No swap: heap is OK here
        </button>
      </div>
    </>
  );
}

function BucketVisual({ round, hintLevel, onChoose }) {
  return (
    <>
      <div className="bucket-queue">
        <span className="eyebrow">to place</span>
        <div className="merge-board__chips">
          {round.array.map((v, i) => (
            <Chip key={i} value={v} tone={i === round.current ? 'yellow' : null} />
          )).slice(round.current)}
        </div>
      </div>
      <div className="bucket-grid">
        {round.buckets.map((items, digit) => (
          <button
            key={digit}
            className={`bucket ${hintLevel >= 2 && round.answer === digit ? 'is-hint' : ''}`}
            onClick={() => onChoose(digit)}
            aria-label={`Bucket ${digit}`}
          >
            <span className="bucket__items">
              {items.map((v, i) => <span key={i} className="bucket__item">{v}</span>)}
            </span>
            <span className="bucket__digit">{digit}</span>
          </button>
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------

export function SortingPractice({ algorithm, values, onWatch }) {
  const practiceValues = values.slice(0, PRACTICE_MAX_VALUES);
  // The parent keys this component by algorithm and values, so the engine is built once.
  const [engine] = useState(() => createSortingEngine(algorithm.id, practiceValues));
  const session = usePracticeSession(engine);
  const { state, round, hintLevel, actions } = session;
  const { rounds } = engine;

  // Positions settled by earlier arrange rounds (e.g. the sorted tail in bubble sort).
  const settled = round?.kind === 'arrange' && state.index > 0 ? rounds[state.index - 1].settledAfter || [] : [];
  const trimmed = values.length > PRACTICE_MAX_VALUES;
  const finalValues = [...practiceValues].sort((a, b) => a - b);

  return (
    <PracticeShell
      session={session}
      status={round ? `${round.title} · ${state.index + 1}/${rounds.length}` : null}
      intro={PRACTICE_INTRO[algorithm.id]}
      primaryAction={round?.kind === 'arrange' && (
        <button className="btn btn--primary" onClick={() => actions.choose(state.work)}><Check size={14} /> Check</button>
      )}
      footnote={round && `${round.kind === 'arrange' ? 'Drag a bar onto another, or click two bars, to swap them.' : 'Click your answer.'}${trimmed ? ` Practice uses the first ${PRACTICE_MAX_VALUES} values.` : ''}`}
      summary={{
        title: rounds.length === 0 ? 'Nothing to practice for this input' : 'Sorted!',
        body: rounds.length > 0 ? `You finished ${rounds.length} round${rounds.length === 1 ? '' : 's'} of ${algorithm.name}.` : '',
        extra: <BarChart values={finalValues} stateOf={() => 'settled'} height={160} />,
      }}
      onWatch={onWatch}
    >
      {round?.kind === 'arrange' && (
        <ArrangeVisual key={state.index} round={round} work={state.work} hintLevel={hintLevel} settled={settled} onSwap={(i, j) => actions.edit({ i, j })} />
      )}
      {round?.kind === 'merge' && <MergeVisual round={round} hintLevel={hintLevel} onChoose={actions.choose} />}
      {round?.kind === 'pivot' && <PivotVisual round={round} hintLevel={hintLevel} onChoose={actions.choose} />}
      {round?.kind === 'heap' && <HeapVisual round={round} hintLevel={hintLevel} onChoose={actions.choose} />}
      {round?.kind === 'bucket' && <BucketVisual round={round} hintLevel={hintLevel} onChoose={actions.choose} />}
    </PracticeShell>
  );
}
