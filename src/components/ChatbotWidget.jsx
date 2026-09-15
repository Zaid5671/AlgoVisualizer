import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export function ChatbotWidget({ activeAlgorithm, snapshot, offsetRight = '2rem' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 500, height: 650 });
  const [isResizing, setIsResizing] = useState(false);

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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const rightEdge = window.innerWidth - 32; // ~2rem offset
      const bottomEdge = window.innerHeight - 32; // ~2rem offset
      
      setDimensions(prev => {
        let newWidth = prev.width;
        let newHeight = prev.height;
        
        if (isResizing === 'left' || isResizing === 'both') {
          newWidth = Math.max(350, rightEdge - e.clientX);
        }
        if (isResizing === 'top' || isResizing === 'both') {
          newHeight = Math.max(400, bottomEdge - e.clientY);
        }
        return { width: newWidth, height: newHeight };
      });
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isResizing === 'both' ? 'nwse-resize' : isResizing === 'top' ? 'ns-resize' : 'ew-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

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

      const isLocalDev = import.meta.env.DEV; // Vite provides this to detect local 'npm run dev'
      
      let data = null;

      if (isLocalDev) {
        // LOCAL DEV: Fall back to direct frontend fetch for easy local testing without a backend server
        const localApiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!localApiKey) {
          throw new Error("Local Dev Error: VITE_GEMINI_API_KEY is missing from your .env file.");
        }

        const modelsToTry = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash-lite', 'gemini-3.5-flash'];
        let lastError = null;

        for (const model of modelsToTry) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${localApiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: requestBody,
              signal: controller.signal
            });

            clearTimeout(timeoutId);
            const json = await response.json();
            if (json.error) throw new Error(json.error.message);
            
            data = json;
            break;
          } catch (err) {
            lastError = err;
          }
        }
        if (!data) throw new Error(lastError ? lastError.message : "All fallback models failed.");

      } else {
        // PRODUCTION: Use the secure Vercel serverless proxy
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message || 'Unknown server error');
        }
      }

      if (!data.candidates || data.candidates.length === 0) {
         throw new Error("No response received from AI models.");
      }

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

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '2rem', right: offsetRight, zIndex: 100,
          backgroundColor: 'black', color: 'white', border: '3px solid var(--border-color)',
          borderRadius: '50%', width: '60px', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '4px 4px 0px var(--border-color)', cursor: 'pointer',
          transition: 'right 0.2s ease'
        }}
      >
        <MessageSquare size={28} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: '2rem', right: offsetRight, zIndex: 100,
      backgroundColor: '#f4f4f0', border: '3px solid black',
      width: `${dimensions.width}px`, height: `${dimensions.height}px`,
      display: 'flex', flexDirection: 'column',
      boxShadow: '8px 8px 0px black',
      transition: isResizing ? 'none' : 'right 0.2s ease',
      fontFamily: 'JetBrains Mono, monospace'
    }}>
      {/* Top Resize Edge */}
      <div 
        onMouseDown={(e) => { e.preventDefault(); setIsResizing('top'); }}
        style={{
          position: 'absolute', top: '-5px', left: 0, right: 0, height: '10px',
          cursor: 'ns-resize', zIndex: 10
        }}
      />
      {/* Left Resize Edge */}
      <div 
        onMouseDown={(e) => { e.preventDefault(); setIsResizing('left'); }}
        style={{
          position: 'absolute', top: 0, left: '-5px', bottom: 0, width: '10px',
          cursor: 'ew-resize', zIndex: 10
        }}
      />
      {/* Top-Left Resize Corner */}
      <div 
        onMouseDown={(e) => { e.preventDefault(); setIsResizing('both'); }}
        style={{
          position: 'absolute', top: '-5px', left: '-5px', width: '15px', height: '15px',
          cursor: 'nwse-resize', zIndex: 11
        }}
      >
        <div style={{ 
          position: 'absolute', top: '5px', left: '5px', 
          width: '8px', height: '8px', 
          backgroundColor: 'black', clipPath: 'polygon(0 0, 100% 0, 0 100%)' 
        }} />
      </div>

      {/* Header */}
      <div style={{ 
        backgroundColor: '#e6e6e6', padding: '0.75rem 1rem', 
        borderBottom: '3px solid black', display: 'flex', 
        justifyContent: 'space-between', alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '14px', height: '14px', backgroundColor: 'var(--accent-green)', borderRadius: '50%', border: '2px solid black' }}></div>
          <span style={{ fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '0.5px' }}>SPECIMEN_AI_TUTOR // RUNTIME_SESSION_042</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#666' }}>[ONLINE]</span>
          <button onClick={() => setIsOpen(false)} style={{ padding: '0', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: '#fcf9f2' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            
            {/* Meta Header */}
            <div style={{ marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#333' }}>
              {msg.role === 'user' ? (
                `CANDIDATE // INQUIRY [${msg.lineLabel}]`
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ backgroundColor: 'black', color: 'white', padding: '2px 5px', fontSize: '0.7rem' }}>AI</span>
                  <span>SPECIMEN AI TUTOR @ {msg.stepLabel}</span>
                </div>
              )}
            </div>

            {/* Message Bubble */}
            <div className="markdown-body" style={{ 
              backgroundColor: 'white',
              border: '3px solid black',
              padding: '1rem 1.25rem', 
              maxWidth: '90%',
              fontSize: '0.9rem', lineHeight: '1.6',
              boxShadow: msg.role === 'user' ? '4px 4px 0px rgba(0,0,0,1)' : 'none',
              borderLeft: msg.role === 'assistant' ? '6px solid black' : '3px solid black',
              borderBottom: msg.role === 'assistant' ? '6px solid black' : '3px solid black' // subtle heavy bottom border for AI
            }}>
               <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.content}</ReactMarkdown>
            </div>

          </div>
        ))}
        {isTyping && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                <span style={{ backgroundColor: 'black', color: 'white', padding: '2px 5px', fontSize: '0.7rem' }}>AI</span>
                <span>SPECIMEN AI TUTOR IS TYPING...</span>
             </div>
             <div style={{ border: '3px solid black', borderLeft: '6px solid black', padding: '1rem 1.25rem', backgroundColor: 'white' }}>
               <span className="mono-text" style={{ fontSize: '1rem', fontWeight: 'bold' }}>...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '1.25rem', borderTop: '4px solid black', display: 'flex', gap: '1rem', backgroundColor: '#e6e6e6' }}>
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question..."
          style={{ 
            flex: 1, padding: '0.75rem 1rem', border: '3px solid black', 
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem',
            outline: 'none', boxShadow: 'inset 2px 2px 0px rgba(0,0,0,0.05)'
          }}
        />
        <button onClick={handleSend} style={{ 
          backgroundColor: 'black', color: 'white', border: '3px solid black', 
          padding: '0 1.5rem', cursor: 'pointer', fontWeight: 'bold',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem'
        }}>
          ASK <Send size={16} />
        </button>
      </div>
    </div>
  );
}
