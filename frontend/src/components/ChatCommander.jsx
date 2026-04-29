import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, X, Maximize2 } from 'lucide-react';
import { chatApi } from '../services/api';

export default function ChatCommander() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: '🤖 **ChainQuake AI Commander** ready.\n\nAsk me about system health, risks, or city-specific data.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await chatApi.send(msg);
      setMessages(prev => [...prev, { role: 'bot', text: res.data.response || 'No response.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: '⚠️ Error connecting to AI engine.' }]);
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{
        position: 'fixed', bottom: 20, right: 20, width: 56, height: 56,
        borderRadius: '50%', border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
        boxShadow: '0 8px 30px rgba(59,130,246,0.4)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        transition: 'var(--transition)',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <MessageSquare size={24} color="white" />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, width: 380, height: 500,
      borderRadius: 'var(--radius-xl)', overflow: 'hidden', zIndex: 1000,
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bot size={18} color="var(--accent-blue)" />
          <span style={{ fontSize: 13, fontWeight: 700 }}>AI Commander</span>
          <div className="pulse-dot" style={{ background: 'var(--accent-green)' }} />
        </div>
        <button onClick={() => setOpen(false)} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
          padding: 4, display: 'flex',
        }}><X size={16} /></button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', gap: 8, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            {msg.role === 'bot' && (
              <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: 'var(--accent-blue-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={14} color="var(--accent-blue)" />
              </div>
            )}
            <div style={{
              maxWidth: '80%', padding: '10px 14px', borderRadius: 12,
              fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, var(--accent-blue), #2563eb)' : 'var(--bg-surface)',
              color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
              border: msg.role === 'bot' ? '1px solid var(--border)' : 'none',
            }}>{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent-blue-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={14} color="var(--accent-blue)" />
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--bg-surface)',
              border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
              Analyzing...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8,
      }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask about risks, health, cities..."
          style={{
            flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '10px 14px', color: 'var(--text-primary)',
            fontSize: 12, outline: 'none', fontFamily: 'inherit',
          }}
        />
        <button onClick={send} disabled={loading} style={{
          background: 'linear-gradient(135deg, var(--accent-blue), #2563eb)',
          border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Send size={16} color="white" />
        </button>
      </div>
    </div>
  );
}
