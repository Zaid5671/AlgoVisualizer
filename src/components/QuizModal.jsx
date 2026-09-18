import React, { useState } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { QUIZ_BANK } from '../data/quizBank';

export function QuizModal({ onClose }) {
  const [activeTopic, setActiveTopic] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const topics = [
    { id: 'sorting', label: 'Sorting Algorithms', count: QUIZ_BANK.sorting.length },
    { id: 'pathfinding', label: 'Pathfinding Algorithms', count: QUIZ_BANK.pathfinding.length },
    { id: 'graph', label: 'Graph Algorithms', count: QUIZ_BANK.graph.length },
    { id: 'backtracking', label: 'Backtracking', count: QUIZ_BANK.backtracking.length }
  ];

  const handleStartQuiz = (topicId) => {
    setActiveTopic(topicId);
    setCurrentQuestionIdx(0);
    setScore(0);
    setSelectedOption(null);
    setIsFinished(false);
  };

  const handleOptionClick = (idx) => {
    if (selectedOption !== null) return; // Prevent double clicking
    
    setSelectedOption(idx);
    const isCorrect = idx === QUIZ_BANK[activeTopic][currentQuestionIdx].a;
    if (isCorrect) {
      setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < QUIZ_BANK[activeTopic].length - 1) {
      setCurrentQuestionIdx(i => i + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  };

  const renderTopicSelection = () => (
    <div className="quiz-content">
      <h2 style={{ fontFamily: 'Inter, sans-serif', marginBottom: '1.5rem', textAlign: 'center' }}>Algorithm Lab Quizzes</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center' }}>Test your knowledge across different algorithmic paradigms.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {topics.map(topic => (
          <button 
            key={topic.id}
            onClick={() => handleStartQuiz(topic.id)}
            style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1.2rem 1.5rem', background: '#ffffff', border: '1px solid #efefef',
              borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s ease',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)', fontFamily: 'Inter, sans-serif', fontSize: '1.1rem'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-yellow)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#efefef'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'; }}
          >
            <span style={{ fontWeight: 600 }}>{topic.label}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', background: '#f5f5f5', padding: '0.3rem 0.8rem', borderRadius: '999px' }}>
              {topic.count} questions
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderActiveQuiz = () => {
    const qData = QUIZ_BANK[activeTopic][currentQuestionIdx];
    const isAnswered = selectedOption !== null;
    const isCorrect = selectedOption === qData.a;

    return (
      <div className="quiz-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>
          <span style={{ textTransform: 'uppercase' }}>{activeTopic} QUIZ</span>
          <span>Question {currentQuestionIdx + 1} / {QUIZ_BANK[activeTopic].length}</span>
        </div>

        <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.3rem', lineHeight: 1.5, marginBottom: '2rem' }}>
          {qData.q}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
          {qData.o.map((opt, idx) => {
            let bgColor = '#ffffff';
            let borderColor = '#efefef';
            let icon = null;

            if (isAnswered) {
              if (idx === qData.a) {
                bgColor = 'var(--accent-green)';
                borderColor = '#38a169'; // darker green
                icon = <CheckCircle size={20} color="#22543d" />;
              } else if (idx === selectedOption) {
                bgColor = 'var(--accent-pink)';
                borderColor = '#e53e3e'; // darker red
                icon = <XCircle size={20} color="#742a2a" />;
              } else {
                bgColor = '#f9f9f9';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={isAnswered}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem 1.5rem', background: bgColor, border: `2px solid ${borderColor}`,
                  borderRadius: '12px', cursor: isAnswered ? 'default' : 'pointer', transition: 'all 0.2s ease',
                  textAlign: 'left', fontFamily: 'Inter, sans-serif', fontSize: '1rem',
                  color: isAnswered && idx !== qData.a && idx !== selectedOption ? '#a0a0a0' : 'var(--text-color)'
                }}
                onMouseEnter={e => { if(!isAnswered) { e.currentTarget.style.borderColor = 'var(--accent-yellow)'; e.currentTarget.style.background = '#fffaf0'; } }}
                onMouseLeave={e => { if(!isAnswered) { e.currentTarget.style.borderColor = '#efefef'; e.currentTarget.style.background = '#ffffff'; } }}
              >
                <span>{opt}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ 
              padding: '1.2rem', borderRadius: '12px', marginBottom: '1.5rem',
              background: isCorrect ? '#f0fff4' : '#fff5f5',
              border: `1px solid ${isCorrect ? '#c6f6d5' : '#fed7d7'}`
            }}>
              <p style={{ margin: 0, fontWeight: 600, color: isCorrect ? '#22543d' : '#742a2a', marginBottom: '0.5rem' }}>
                {isCorrect ? 'Correct!' : 'Incorrect.'}
              </p>
              <p style={{ margin: 0, lineHeight: 1.5, color: 'var(--text-color)', fontSize: '0.95rem' }}>
                {qData.e}
              </p>
            </div>
            
            <button 
              onClick={handleNextQuestion}
              style={{
                width: '100%', padding: '1rem', background: 'var(--accent-yellow)', border: '2px solid black',
                borderRadius: '999px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif',
                fontSize: '1.1rem', boxShadow: '4px 4px 0 black', transition: 'transform 0.1s'
              }}
              onMouseDown={e => { e.currentTarget.style.transform = 'translate(2px, 2px)'; e.currentTarget.style.boxShadow = '2px 2px 0 black'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0 black'; }}
            >
              {currentQuestionIdx < QUIZ_BANK[activeTopic].length - 1 ? 'Next Question' : 'See Results'}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderResults = () => {
    const percentage = Math.round((score / QUIZ_BANK[activeTopic].length) * 100);
    let message = "Keep practicing!";
    if (percentage === 100) message = "Perfect Score! You're a master.";
    else if (percentage >= 80) message = "Excellent work!";
    else if (percentage >= 60) message = "Good job, but there's room for improvement.";

    return (
      <div className="quiz-content" style={{ textAlign: 'center', padding: '2rem 0' }}>
        <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', marginBottom: '1rem' }}>Quiz Complete</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>{message}</p>
        
        <div style={{ 
          width: '150px', height: '150px', borderRadius: '50%', border: '8px solid var(--accent-yellow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 3rem',
          fontSize: '2.5rem', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-color)'
        }}>
          {score}/{QUIZ_BANK[activeTopic].length}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => setActiveTopic(null)}
            style={{
              padding: '0.8rem 1.5rem', background: '#ffffff', border: '2px solid #efefef',
              borderRadius: '999px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif'
            }}
          >
            Back to Topics
          </button>
          <button 
            onClick={onClose}
            style={{
              padding: '0.8rem 1.5rem', background: 'var(--accent-yellow)', border: '2px solid black',
              borderRadius: '999px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif',
              boxShadow: '2px 2px 0 black'
            }}
          >
            Close Quiz
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff9ee', // matching FYP paper background
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        width: '100%', maxWidth: '700px',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        position: 'relative',
        padding: '3rem'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '1.5rem', right: '1.5rem',
            background: 'white', border: '1px solid #efefef', borderRadius: '50%',
            width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
          }}
        >
          <X size={18} />
        </button>

        {!activeTopic ? renderTopicSelection() : isFinished ? renderResults() : renderActiveQuiz()}

      </div>
    </div>
  );
}

// Trigger HMR
