import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Bot } from 'lucide-react';

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'Halo! Ada yang bisa kami bantu seputar top up atau Gamora Arcade?', sender: 'cs', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMsg = {
      id: Date.now(),
      text: message,
      sender: 'user',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setMessages(prev => [...prev, newMsg]);
    setMessage('');

    // Simulate CS response
    setTimeout(() => {
      const replyMsg = {
        id: Date.now() + 1,
        text: 'Baik, mohon tunggu sebentar. Kami sedang mengecek pertanyaan Anda.',
        sender: 'cs',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 1500);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        className={`live-chat-fab ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare size={24} color="white" />
        <span className="live-chat-badge">1</span>
      </button>

      {/* Chat Window */}
      <div className={`live-chat-window ${isOpen ? 'active' : ''}`}>
        <div className="live-chat-header">
          <div className="live-chat-header-info">
            <div className="cs-avatar">
              <Bot size={20} color="white" />
              <span className="status-dot"></span>
            </div>
            <div>
              <h4>Gamora Support</h4>
              <p>Membalas dalam beberapa menit</p>
            </div>
          </div>
          <button className="close-chat-btn" onClick={() => setIsOpen(false)}>
            <X size={20} color="white" />
          </button>
        </div>

        <div className="live-chat-body">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.sender}`}>
              <div className="chat-bubble">
                {msg.text}
                <span className="chat-time">{msg.time}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="live-chat-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Ketik pesan Anda..." 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" disabled={!message.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
};

export default LiveChat;
