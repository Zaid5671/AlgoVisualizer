import { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { Modal } from './ui/Modal';
import { QUIZ_BANK } from '../data/quizBank';

const TOPICS = [
  { id: 'sorting', label: 'Sorting' },
  { id: 'pathfinding', label: 'Pathfinding' },
  { id: 'graph', label: 'Graphs' },
  { id: 'backtracking', label: 'Backtracking' },
];

const resultMessage = (pct) => {
  if (pct === 100) return 'Perfect score.';
  if (pct >= 80) return 'Excellent work.';
  if (pct >= 60) return 'Good, with a little room to improve. Read the explanations for the ones you missed.';
  return 'Keep practising. Watching the algorithms again and trying practice mode will help.';
};

export function QuizModal({ onClose }) {
  const [topic, setTopic] = useState(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);

  const questions = topic ? QUIZ_BANK[topic] : [];
  const question = questions[index];
  const answered = selected !== null;

  const start = (id) => {
    setTopic(id);
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  };

  const choose = (i) => {
    if (answered) return;
    setSelected(i);
    if (i === question.a) setScore(s => s + 1);
  };

  const next = () => {
    if (index < questions.length - 1) {
      setIndex(i => i + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };

  const topicLabel = TOPICS.find(t => t.id === topic)?.label;

  const renderTopics = () => (
    <div className="quiz">
      <p className="quiz__intro">Pick a topic. Each question has one correct answer and an explanation.</p>
      <div className="quiz__topics">
        {TOPICS.map(t => (
          <button key={t.id} className="quiz-topic" onClick={() => start(t.id)}>
            <span className="quiz-topic__name">{t.label}</span>
            <span className="chip">{QUIZ_BANK[t.id].length} questions</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderQuestion = () => {
    const correct = selected === question.a;
    return (
      <div className="quiz">
        <div className="quiz__meta">
          <span className="eyebrow">{topicLabel}</span>
          <span className="eyebrow">Question {index + 1} of {questions.length}</span>
        </div>
        <div className="quiz__progress" aria-hidden="true"><span style={{ width: `${(index / questions.length) * 100}%` }} /></div>

        <h4 className="quiz__question">{question.q}</h4>

        <div className="quiz__options" role="group" aria-label="Answers">
          {question.o.map((option, i) => {
            const state = !answered ? '' : i === question.a ? 'is-correct' : i === selected ? 'is-wrong' : 'is-faded';
            return (
              <button key={i} className={`quiz-option ${state}`} onClick={() => choose(i)} disabled={answered} aria-pressed={selected === i}>
                <span>{option}</span>
                {state === 'is-correct' && <CheckCircle2 size={18} aria-label="correct answer" />}
                {state === 'is-wrong' && <XCircle size={18} aria-label="your answer, incorrect" />}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className={`quiz__explain ${correct ? 'is-correct' : 'is-wrong'}`} role="status">
            <strong>{correct ? 'Correct.' : 'Not quite.'}</strong>
            <p>{question.e}</p>
          </div>
        )}
      </div>
    );
  };

  const renderResults = () => {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="quiz quiz--results">
        <div className="quiz__score" style={{ '--pct': `${pct}%` }}>
          <span>{score}<small>/{questions.length}</small></span>
        </div>
        <h4>{topicLabel} quiz complete</h4>
        <p>{resultMessage(pct)}</p>
      </div>
    );
  };

  let footer = null;
  if (topic && !finished && answered) {
    footer = (
      <button className="btn btn--primary" onClick={next} autoFocus>
        {index < questions.length - 1 ? 'Next question' : 'See results'} <ArrowRight size={15} />
      </button>
    );
  } else if (topic && finished) {
    footer = (
      <>
        <button className="btn" onClick={() => setTopic(null)}>Other topics</button>
        <button className="btn" onClick={() => start(topic)}><RotateCcw size={14} /> Try again</button>
        <button className="btn btn--dark" onClick={onClose}>Close</button>
      </>
    );
  } else if (topic) {
    footer = <button className="btn btn--ghost" onClick={() => setTopic(null)}>Back to topics</button>;
  }

  return (
    <Modal title={topic ? `${topicLabel} quiz` : 'Quiz'} onClose={onClose} width={620} footer={footer}>
      {!topic ? renderTopics() : finished ? renderResults() : renderQuestion()}
    </Modal>
  );
}
