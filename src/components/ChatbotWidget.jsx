import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export function ChatbotWidget({ activeAlgorithm, snapshot }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your AI assistant. I can see exactly what the algorithm is doing right now. Ask me anything!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error: VITE_GEMINI_API_KEY not found in .env file." }]);
      setIsTyping(false);
      return;
    }

    try {
      const contextPrompt = snapshot 
        ? `You are a helpful AI Tutor in an Algorithm Visualizer app.
The user is currently studying: ${activeAlgorithm.name}.
The visualizer is currently paused at this exact step: "${snapshot.message}".
The current step type is: ${snapshot.type}.
Time Complexity - Best: ${activeAlgorithm.complexity.best}, Avg: ${activeAlgorithm.complexity.avg}, Worst: ${activeAlgorithm.complexity.worst}.

Answer the user's question concisely and helpfully, using the context of the current step to guide them.
User Question: ${input}`
        : `You are a helpful AI Tutor in an Algorithm Visualizer app. The user is looking at ${activeAlgorithm.name} but hasn't started the visualization yet. Answer their question concisely: ${input}`;

      const requestBody = JSON.stringify({
        contents: [{ parts: [{ text: contextPrompt }] }]
      });

      // Updated to Gemini 3 family based on available models
      const modelsToTry = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash-lite'];
      let data = null;
      let lastError = null;

      for (const model of modelsToTry) {
        try {
          // Add a 6-second timeout so we don't wait forever for overloaded models
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: requestBody,
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          const json = await response.json();
          
          if (json.error) {
            throw new Error(json.error.message);
          }

          data = json;
          break; // Success! Stop trying other models.
        } catch (err) {
          console.warn(`Model ${model} failed:`, err.message);
          lastError = err;
          // Loop will continue to the next model
        }
      }

      if (!data) {
        throw new Error(lastError ? lastError.message : "All fallback models failed.");
      }

      const botReply = data.candidates[0].content.parts[0].text;
      setMessages(prev => [...prev, { role: 'assistant', content: botReply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: `API Error: ${error.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100,
          backgroundColor: 'var(--accent-yellow)', border: '3px solid var(--border-color)',
          borderRadius: '50%', width: '60px', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '4px 4px 0px var(--border-color)', cursor: 'pointer'
        }}
      >
        <MessageSquare size={28} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100,
      backgroundColor: 'white', border: '3px solid var(--border-color)',
      borderRadius: '12px', width: '350px', height: '500px',
      display: 'flex', flexDirection: 'column',
      boxShadow: '8px 8px 0px var(--border-color)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'var(--accent-yellow)', padding: '1rem', 
        borderBottom: '3px solid var(--border-color)', display: 'flex', 
        justifyContent: 'space-between', alignItems: 'center' 
      }}>
        <span style={{ fontFamily: 'Kalam', fontWeight: 'bold', fontSize: '1.2rem' }}>AI Tutor</span>
        <button onClick={() => setIsOpen(false)} className="btn-icon" style={{ padding: '0.2rem', backgroundColor: 'transparent', border: 'none' }}>
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#fcf9f2' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            backgroundColor: msg.role === 'user' ? 'var(--accent-pink)' : 'white',
            border: '2px solid var(--border-color)',
            padding: '0.8rem', borderRadius: '8px', maxWidth: '85%',
            fontFamily: 'JetBrains Mono', fontSize: '0.8rem', lineHeight: '1.4'
          }}>
            {msg.content}
          </div>
        ))}
        {isTyping && (
          <div style={{ alignSelf: 'flex-start', backgroundColor: 'white', border: '2px solid var(--border-color)', padding: '0.5rem', borderRadius: '8px' }}>
             <span className="mono-text">thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '1rem', borderTop: '3px solid var(--border-color)', display: 'flex', gap: '0.5rem', backgroundColor: 'white' }}>
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question..."
          style={{ 
            flex: 1, padding: '0.5rem', border: '2px solid var(--border-color)', 
            borderRadius: '6px', fontFamily: 'JetBrains Mono', fontSize: '0.8rem' 
          }}
        />
        <button onClick={handleSend} style={{ 
          backgroundColor: 'var(--accent-green)', border: '2px solid var(--border-color)', 
          borderRadius: '6px', padding: '0.5rem', cursor: 'pointer' 
        }}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
