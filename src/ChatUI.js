import React, { useState, useEffect } from 'react';
import './index.css';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export default function ChatUI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = 'https://4dee-103-184-238-209.ngrok-free.app/api/chat';

  useEffect(() => {
    const container = document.querySelector("#chat-scroll");
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  const sendMessage = async (messageOverride = null) => {
    let userMsg = messageOverride !== null ? messageOverride : input;
    userMsg = userMsg?.trim?.();
    if (!userMsg || typeof userMsg !== 'string') {
      setError("You can't send an empty message.");
      return;
    }

    setError(null);
    setLoading(true);

    const updatedMessages =
      editingIndex !== null
        ? messages.map((msg, i) =>
            i === editingIndex ? { ...msg, content: userMsg } : msg
          )
        : [...messages, { role: 'user', content: userMsg }];

    const safeMessages = updatedMessages.filter(
      (msg) => msg && typeof msg.content === 'string' && msg.content.trim() !== ''
    );

    setMessages(safeMessages);
    setInput('');
    setEditingIndex(null);

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: safeMessages })
      });

      const data = await response.json();
      if (data.reply) {
        setMessages([...safeMessages, { role: 'assistant', content: data.reply }]);
      } else {
        console.error('❌ No reply returned from backend:', data);
      }
    } catch (err) {
      console.error('❌ Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const regenerateMessage = async (index) => {
    const truncatedMessages = messages.slice(0, index);
    const valid = truncatedMessages.every(
      (msg) => msg.role && typeof msg.content === 'string' && msg.content.trim() !== ''
    );

    if (!valid) {
      console.warn('❌ Invalid message history — regeneration aborted.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: truncatedMessages })
      });

      const data = await response.json();
      const newMessages = [...truncatedMessages, { role: 'assistant', content: data.reply }];
      setMessages(newMessages);
    } catch (err) {
      console.error('❌ Regeneration fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index) => {
    setInput(messages[index].content);
    setEditingIndex(index);
  };

  return (
    <div className="chat-ui">
      <div className="chat-header">GT3 💬</div>
      <div id="chat-scroll" className="chat-body">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-bubble ${msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`}
          >
            <div
              className="chat-content"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(marked.parse(msg.content)),
              }}
            />
            <div className="chat-actions">
              {msg.role === 'assistant' && (
                <button onClick={() => regenerateMessage(index)}>♻️</button>
              )}
              {msg.role === 'user' && (
                <button onClick={() => handleEdit(index)}>✏️</button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-bubble assistant-bubble thinking-bubble">
            <div className="dot-flash">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="chat-input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say something..."
        />
        <button onClick={() => sendMessage()} disabled={!input.trim()}>
          {editingIndex !== null ? 'Update' : 'Send'}
        </button>
      </div>
    </div>
  );
}
