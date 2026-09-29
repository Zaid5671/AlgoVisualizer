import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const FAB_SIZE = window.innerWidth <= 768 ? 48 : 56;
const MIN_W = 300;
const MIN_H = 400;
const RESIZE_EDGES = ['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];
const isPhone = () => window.innerWidth <= 768;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Follows the pointer until it is released. Returns true from onEnd's caller if it barely moved (a click).
function trackPointer(e, onMove, onEnd) {
  e.preventDefault();
  const startX = e.clientX;
  const startY = e.clientY;
  let moved = false;
  const move = (ev) => {
    if (Math.abs(ev.clientX - startX) > 4 || Math.abs(ev.clientY - startY) > 4) moved = true;
    onMove(ev.clientX - startX, ev.clientY - startY);
  };
  const up = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    onEnd?.(moved);
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
}

export function ChatbotWidget({ activeAlgorithm, snapshot }) {
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState({ width: 420, height: 560 });
  const [fabPos, setFabPos] = useState(() => ({ x: window.innerWidth - FAB_SIZE - 24, y: window.innerHeight - FAB_SIZE - 24 }));
  const [windowPos, setWindowPos] = useState({ x: 0, y: 0 });
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi! Ask me anything about **${activeAlgorithm.name}**. I can see the step you're on.` },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, isTyping]);
  useEffect(() => { if (isOpen) inputRef.current?.focus(); }, [isOpen]);

  const open = () => {
    setWindowPos({
      x: clamp(fabPos.x + FAB_SIZE - size.width, 16, window.innerWidth - size.width - 16),
      y: clamp(fabPos.y + FAB_SIZE - size.height, 16, window.innerHeight - size.height - 16),
    });
    setIsOpen(true);
  };

  const onFabPointerDown = (e) => {
    const start = fabPos;
    trackPointer(e, (dx, dy) => setFabPos({
      x: clamp(start.x + dx, 0, window.innerWidth - FAB_SIZE),
      y: clamp(start.y + dy, 0, window.innerHeight - FAB_SIZE),
    }), (moved) => { if (!moved) open(); });
  };

  const onHeaderPointerDown = (e) => {
    if (isPhone() || e.target.closest('button')) return;
    const start = windowPos;
    trackPointer(e, (dx, dy) => setWindowPos({
      x: clamp(start.x + dx, 0, window.innerWidth - 80),
      y: clamp(start.y + dy, 0, window.innerHeight - 60),
    }));
  };

  const onResizePointerDown = (e, edge) => {
    e.stopPropagation();
    const startSize = size;
    const startPos = windowPos;
    trackPointer(e, (dx, dy) => {
      let { width, height } = startSize;
      let { x, y } = startPos;
      if (edge.includes('right')) width = Math.max(MIN_W, startSize.width + dx);
      if (edge.includes('bottom')) height = Math.max(MIN_H, startSize.height + dy);
      if (edge.includes('left')) { width = Math.max(MIN_W, startSize.width - dx); x = startPos.x + (startSize.width - width); }
      if (edge.includes('top')) { height = Math.max(MIN_H, startSize.height - dy); y = startPos.y + (startSize.height - height); }
      setSize({ width, height });
      setWindowPos({ x, y });
    });
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isTyping) return;
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setInput('');
    setIsTyping(true);

    const stepContext = snapshot ? `The step shown right now is: "${snapshot.message}" (step type: ${snapshot.type}).` : 'The visualization has not started yet.';
    const prompt = `You are a helpful tutor inside an algorithm visualizer for students learning data structures and algorithms.
The student is studying ${activeAlgorithm.name}. ${stepContext}
Time complexity: best ${activeAlgorithm.complexity.best}, average ${activeAlgorithm.complexity.avg}, worst ${activeAlgorithm.complexity.worst}.
Answer concisely and clearly in Markdown, using the current step as context where it helps.
Question: ${question}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || 'the server returned an error');
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply) throw new Error('the tutor sent an empty answer');
      setMessages(prev => [...prev, { role: 'assistant', content: reply, about: snapshot?.message }]);
    } catch (error) {
      const reason = error.name === 'AbortError' ? 'it took too long to answer' : error.message;
      setMessages(prev => [...prev, { role: 'assistant', error: true, content: `The tutor couldn't answer (${reason}). Check your connection and try again.` }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        className="chat-fab"
        style={{ left: fabPos.x, top: fabPos.y }}
        onPointerDown={onFabPointerDown}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
        aria-label="Ask the AI tutor"
        title="Ask the AI tutor (drag to move)"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <section
      className="chat-window"
      style={isPhone() ? undefined : { left: windowPos.x, top: windowPos.y, width: size.width, height: size.height }}
      aria-label="AI tutor"
      onKeyDown={(e) => { if (e.key === 'Escape') setIsOpen(false); }}
    >
      {!isPhone() && RESIZE_EDGES.map(edge => (
        <div key={edge} className={`chat-resize chat-resize--${edge}`} onPointerDown={(e) => onResizePointerDown(e, edge)} aria-hidden="true" />
      ))}
      <div className="chat-window__inner">
        <header className="chat-window__header" onPointerDown={onHeaderPointerDown}>
          <span className="chat-window__title"><span className="live-dot" aria-hidden="true" /> AI tutor</span>
          <span className="chat-window__context">{activeAlgorithm.name}</span>
          <button className="btn-icon" onClick={() => setIsOpen(false)} aria-label="Close tutor"><X size={16} /></button>
        </header>

        <div className="chat-window__messages" aria-live="polite">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg chat-msg--${msg.role} ${msg.error ? 'is-error' : ''}`}>
              <span className="chat-msg__who">{msg.role === 'user' ? 'You' : 'Tutor'}</span>
              <div className="chat-msg__bubble markdown-body">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.content}</ReactMarkdown>
              </div>
              {msg.about && <span className="chat-msg__about">about the step: {msg.about}</span>}
            </div>
          ))}
          {isTyping && (
            <div className="chat-msg chat-msg--assistant">
              <span className="chat-msg__who">Tutor</span>
              <div className="chat-msg__bubble chat-typing" aria-label="The tutor is typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form className="chat-window__input" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
          <input
            ref={inputRef}
            type="text"
            className="text-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about this step…"
            aria-label="Your question"
          />
          <button type="submit" className="btn-icon btn-play" disabled={!input.trim() || isTyping} aria-label="Send"><Send size={16} /></button>
        </form>
        <p className="chat-window__note">Answers are AI-generated and can be wrong.</p>
      </div>
    </section>
  );
}
