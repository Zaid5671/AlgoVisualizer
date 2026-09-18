import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export function ChatbotWidget({ activeAlgorithm, snapshot, offsetRight = '2rem' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 450, height: 600 });
  
  // position is for the FAB. windowPos is for the opened chat window.
  const [position, setPosition] = useState({ x: -1, y: -1 });
  const [windowPos, setWindowPos] = useState({ x: -1, y: -1 });
  
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hi! I'm your AI assistant. I can see exactly what the algorithm is doing right now. Ask me anything!",
      stepLabel: "INIT"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Initialize position to bottom right once mounted
  useEffect(() => {
    setPosition({
      x: window.innerWidth - 90,
      y: window.innerHeight - 90
    });
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Bulletproof dragging for the FAB button
  const handleFabMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPos = { ...position };
    let hasDragged = false;

    const onMouseMove = (moveEvent) => {
      hasDragged = true;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 60, initialPos.x + (moveEvent.clientX - startX))),
        y: Math.max(0, Math.min(window.innerHeight - 60, initialPos.y + (moveEvent.clientY - startY)))
      });
    };

    const onMouseUp = (upEvent) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      if (!hasDragged || (Math.abs(upEvent.clientX - startX) < 5 && Math.abs(upEvent.clientY - startY) < 5)) {
        setWindowPos({
          x: Math.max(20, Math.min(position.x, window.innerWidth - dimensions.width - 20)),
          y: Math.max(20, Math.min(position.y, window.innerHeight - dimensions.height - 20))
        });
        setIsOpen(true);
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Bulletproof dragging for the window header
  const handleHeaderMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPos = { ...windowPos };
      
    const onMouseMove = (moveEvent) => {
      setWindowPos({
        x: Math.max(0, Math.min(window.innerWidth - 60, initialPos.x + (moveEvent.clientX - startX))),
        y: Math.max(0, Math.min(window.innerHeight - 60, initialPos.y + (moveEvent.clientY - startY)))
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // OS-Style Edge Resizing (All 4 edges and corners)
  const startResize = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    
    // Captured from closure at the exact moment of click
    const initialDim = { ...dimensions };
    const initialPos = { ...windowPos };

    const onMouseMove = (moveEvent) => {
      let newWidth = initialDim.width;
      let newHeight = initialDim.height;
      let newX = initialPos.x;
      let newY = initialPos.y;

      if (direction.includes('right')) {
        newWidth = Math.max(300, initialDim.width + (moveEvent.clientX - startX));
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(400, initialDim.height + (moveEvent.clientY - startY));
      }
      if (direction.includes('left')) {
        const delta = moveEvent.clientX - startX;
        newWidth = Math.max(300, initialDim.width - delta);
        if (initialDim.width - delta > 300) newX = initialPos.x + delta;
      }
      if (direction.includes('top')) {
        const delta = moveEvent.clientY - startY;
        newHeight = Math.max(400, initialDim.height - delta);
        if (initialDim.height - delta > 400) newY = initialPos.y + delta;
      }

      setDimensions({ width: newWidth, height: newHeight });
      setWindowPos({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const activeLine = snapshot?.activeLine ?? -1;
    const userMsg = { 
      role: 'user', 
      content: input,
      lineLabel: activeLine !== -1 ? `LINE ${activeLine}` : 'GENERAL'
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const contextPrompt = snapshot 
        ? `You are a helpful AI Tutor in an Algorithm Visualizer app.
The user is currently studying: ${activeAlgorithm.name}.
The visualizer is currently paused at this exact step: "${snapshot.message}".
The current step type is: ${snapshot.type}.
Time Complexity - Best: ${activeAlgorithm.complexity.best}, Avg: ${activeAlgorithm.complexity.avg}, Worst: ${activeAlgorithm.complexity.worst}.

Answer the user's question concisely and helpfully, using the context of the current step to guide them. Format your answer nicely in Markdown.
User Question: ${input}`
        : `You are a helpful AI Tutor in an Algorithm Visualizer app. The user is looking at ${activeAlgorithm.name} but hasn't started the visualization yet. Answer their question concisely in Markdown: ${input}`;

      const requestBody = JSON.stringify({
        contents: [{ parts: [{ text: contextPrompt }] }]
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (data.error) throw new Error(data.error.message || 'Unknown server error');
      if (!data.candidates || data.candidates.length === 0) throw new Error("No response received from AI models.");

      const botReply = data.candidates[0].content.parts[0].text;
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: botReply,
        stepLabel: snapshot ? `STEP ${snapshot.currentIndex ?? 'N/A'}` : 'GENERAL' 
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: `API Error: ${error.message}`, stepLabel: 'ERR' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (position.x === -1) return null; // Wait for mount

  if (!isOpen) {
    return (
      <button 
        onMouseDown={handleFabMouseDown}
        style={{
          position: 'fixed', left: `${position.x}px`, top: `${position.y}px`, zIndex: 100,
          backgroundColor: 'var(--accent-pink)', color: 'white', border: 'none',
          borderRadius: '50%', width: '60px', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--ink-shadow-lg)', cursor: 'grab'
        }}
      >
        <MessageSquare size={28} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', left: `${windowPos.x}px`, top: `${windowPos.y}px`, zIndex: 100,
      backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: '16px',
      width: `${dimensions.width}px`, height: `${dimensions.height}px`,
      display: 'flex', flexDirection: 'column',
      boxShadow: 'var(--ink-shadow-lg)',
      fontFamily: 'Inter, sans-serif'
    }}>

      {/* OS-STYLE RESIZE EDGES */}
      <div onMouseDown={(e) => startResize(e, 'right')} style={{ position: 'absolute', top: 0, right: '-5px', bottom: 0, width: '10px', cursor: 'ew-resize', zIndex: 10 }} />
      <div onMouseDown={(e) => startResize(e, 'left')} style={{ position: 'absolute', top: 0, left: '-5px', bottom: 0, width: '10px', cursor: 'ew-resize', zIndex: 10 }} />
      <div onMouseDown={(e) => startResize(e, 'bottom')} style={{ position: 'absolute', bottom: '-5px', left: 0, right: 0, height: '10px', cursor: 'ns-resize', zIndex: 10 }} />
      <div onMouseDown={(e) => startResize(e, 'top')} style={{ position: 'absolute', top: '-5px', left: 0, right: 0, height: '10px', cursor: 'ns-resize', zIndex: 10 }} />
      
      <div onMouseDown={(e) => startResize(e, 'bottom-right')} style={{ position: 'absolute', bottom: '-5px', right: '-5px', width: '15px', height: '15px', cursor: 'nwse-resize', zIndex: 11 }} />
      <div onMouseDown={(e) => startResize(e, 'bottom-left')} style={{ position: 'absolute', bottom: '-5px', left: '-5px', width: '15px', height: '15px', cursor: 'nesw-resize', zIndex: 11 }} />
      <div onMouseDown={(e) => startResize(e, 'top-right')} style={{ position: 'absolute', top: '-5px', right: '-5px', width: '15px', height: '15px', cursor: 'nesw-resize', zIndex: 11 }} />
      <div onMouseDown={(e) => startResize(e, 'top-left')} style={{ position: 'absolute', top: '-5px', left: '-5px', width: '15px', height: '15px', cursor: 'nwse-resize', zIndex: 11 }} />

      {/* Inner Container to clip content while allowing outer resize handles to bleed out */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '16px' }}>
        
        {/* Header (Draggable Area) */}
        <div 
          onMouseDown={handleHeaderMouseDown}
          style={{ 
            backgroundColor: '#f8f9fa', padding: '1rem', 
            borderBottom: '1px solid var(--border-color)', display: 'flex', 
            justifyContent: 'space-between', alignItems: 'center',
            cursor: 'grab'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--accent-green)', borderRadius: '50%' }}></div>
            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>AI Tutor</span>
          </div>
          <button 
            onMouseDown={(e) => e.stopPropagation()} 
            onClick={() => setIsOpen(false)} 
            style={{ padding: '0', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: '#666' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'white' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              
              <div style={{ marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: '500', color: '#888' }}>
                {msg.role === 'user' ? 'You' : `Tutor @ ${msg.stepLabel}`}
              </div>

              <div className="markdown-body" style={{ 
                backgroundColor: msg.role === 'user' ? 'var(--accent-yellow)' : '#f3f4f6',
                padding: '1rem 1.25rem', 
                borderRadius: msg.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                maxWidth: '90%',
                fontSize: '0.95rem', lineHeight: '1.5',
                color: '#111'
              }}>
                 <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.content}</ReactMarkdown>
              </div>

            </div>
          ))}
          {isTyping && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
               <div style={{ marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: '500', color: '#888' }}>Tutor is typing...</div>
               <div style={{ padding: '1rem 1.25rem', backgroundColor: '#f3f4f6', borderRadius: '16px 16px 16px 0' }}>
                 <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>...</span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', backgroundColor: 'white' }}>
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            style={{ 
              flex: 1, padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: '999px',
              fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
              outline: 'none', backgroundColor: '#f9fafb'
            }}
          />
          <button onClick={handleSend} style={{ 
            backgroundColor: 'var(--accent-pink)', color: 'white', border: 'none', borderRadius: '50%',
            width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0
          }}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
