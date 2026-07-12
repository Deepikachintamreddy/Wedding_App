'use client';

import { useState, useEffect, useRef } from 'react';
import { useWeddingStore } from '@/lib/store';
import { getAiResponse } from '@/lib/aiService';
import Link from 'next/link';

export default function FloatingChatBot() {
  const store = useWeddingStore();
  const { user, loading, deductAiCredit } = store;
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize welcome message when user changes or chat opens
  useEffect(() => {
    const userName = user ? user.name : 'there';
    const welcomeText = user 
      ? `### 🌸 Welcome back, **${userName}**!
I'm your **VND Wedding Concierge**. How is your wedding planning going today? 

Ask me anything about:
- 💰 **Budget** calculations
- 📋 **Checklist** timelines
- 👥 **Guest** list RSVPs
- ✍️ Writing **vows or speeches**!`
      : `### 🧭 Welcome to the **VND Wedding Concierge**!
I'm your digital wedding planning assistant. 

*💡 Tip: [Sign In / Register](/auth) to link your budget, custom checklist, and get personalized recommendations!*

How can I help you plan your special day today?`;

    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const creditsRemaining = user ? (user.aiCredits ?? 15) : 0;
    
    // Call AI Response
    try {
      const response = await getAiResponse(textToSend, creditsRemaining);
      setIsTyping(false);

      const aiMsg = {
        id: `msg_${Date.now() + 1}`,
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages(prev => [...prev, aiMsg]);

      // Deduct credit if successful and user is authenticated and not on Event Pass/Admin
      if (user && response.creditsUsed && user.role !== 'admin' && !user.eventPassActive) {
        deductAiCredit();
      }
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `msg_${Date.now() + 1}`,
          sender: 'ai',
          text: `### ⚠️ Connection Error\nSorry, I couldn't reach the planning server. Please check your connection and try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputText);
    }
  };

  // Convert raw message text into HTML with simple markdown
  const formatMessageText = (text) => {
    if (!text) return '';
    let formatted = text;

    formatted = formatted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    formatted = formatted.replace(/^### (.*$)/gim, '<h4 class="chat-h4">$1</h4>');
    formatted = formatted.replace(/^## (.*$)/gim, '<h3 class="chat-h3">$1</h3>');
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/^\s*-\s+(.*$)/gim, '<li class="chat-li">$1</li>');
    formatted = formatted.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="chat-ol-li">$1</li>');
    formatted = formatted.replace(/\n/g, '<br />');

    return formatted;
  };

  if (loading) return null;

  return (
    <div className="floating-chat-container">
      {/* Chat bubble icon button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`chat-bubble-trigger ${isOpen ? 'active' : ''}`}
        aria-label="Toggle AI Concierge Chat"
      >
        {isOpen ? (
          <span className="close-icon">×</span>
        ) : (
          <span className="bot-icon">🤖</span>
        )}
      </button>

      {/* Expanded chat window */}
      {isOpen && (
        <div className="chat-window-card glass-panel">
          {/* Header */}
          <div className="chat-window-header">
            <div className="header-info">
              <span className="bot-avatar">🤖</span>
              <div>
                <h4 className="header-title">VND AI Concierge</h4>
                <p className="header-status">Online • 24/7 Planning Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="header-close-btn">&times;</button>
          </div>

          {/* Messages Stream */}
          <div className="chat-window-messages">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`chat-message-row ${msg.sender === 'user' ? 'msg-user' : 'msg-ai'}`}
              >
                <div className="chat-message-bubble">
                  <div 
                    dangerouslySetInnerHTML={{ __html: formatMessageText(msg.text) }} 
                    className="chat-message-content"
                  />
                  <div className="chat-message-meta">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message-row msg-ai">
                <div className="chat-message-bubble typing">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Credits remaining indicator (if logged in) */}
          {user && (
            <div className="credits-bar">
              {user.eventPassActive ? '🎟️ Event Pass: Unlimited Chats' : `⚡ ${user.aiCredits ?? 15} Credits Remaining`}
            </div>
          )}

          {/* Input Bar */}
          <div className="chat-window-input-bar">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask anything about your wedding..."
              className="chat-window-input"
            />
            <button 
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim()}
              className="chat-window-send"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .floating-chat-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          font-family: inherit;
        }

        .chat-bubble-trigger {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c9a96e 0%, #a38146 100%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          outline: none;
        }

        .chat-bubble-trigger:hover {
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 6px 24px rgba(201, 169, 110, 0.3);
        }

        .chat-bubble-trigger.active {
          background: #1a1a2e;
          border-color: rgba(201, 169, 110, 0.4);
        }

        .bot-icon {
          font-size: 28px;
        }

        .close-icon {
          font-size: 32px;
          color: #c9a96e;
          line-height: 1;
        }

        .chat-window-card {
          position: absolute;
          bottom: 76px;
          right: 0;
          width: 370px;
          height: 480px;
          border-radius: 16px;
          background: rgba(13, 13, 26, 0.96);
          border: 1px solid rgba(201, 169, 110, 0.25);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(16px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .chat-window-header {
          padding: 16px;
          background: rgba(201, 169, 110, 0.08);
          border-bottom: 1px solid rgba(201, 169, 110, 0.15);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .bot-avatar {
          font-size: 24px;
        }

        .header-title {
          font-size: 14px;
          font-weight: 600;
          color: #c9a96e;
          margin: 0;
        }

        .header-status {
          font-size: 11px;
          color: rgba(245, 240, 232, 0.6);
          margin: 0;
        }

        .header-close-btn {
          background: transparent;
          border: none;
          color: rgba(245, 240, 232, 0.6);
          font-size: 20px;
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s;
        }

        .header-close-btn:hover {
          color: #c9a96e;
        }

        .chat-window-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: rgba(26, 26, 46, 0.3);
        }

        .chat-message-row {
          display: flex;
          width: 100%;
        }

        .msg-user {
          justify-content: flex-end;
        }

        .msg-ai {
          justify-content: flex-start;
        }

        .chat-message-bubble {
          max-width: 85%;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.5;
        }

        .msg-user .chat-message-bubble {
          background: #c9a96e;
          color: #0d0d1a;
          border-bottom-right-radius: 2px;
        }

        .msg-ai .chat-message-bubble {
          background: rgba(201, 169, 110, 0.08);
          border: 1px solid rgba(201, 169, 110, 0.15);
          color: #f5f0e8;
          border-bottom-left-radius: 2px;
        }

        .chat-message-meta {
          font-size: 9px;
          color: rgba(0, 0, 0, 0.4);
          margin-top: 4px;
          text-align: right;
        }

        .msg-ai .chat-message-meta {
          color: rgba(245, 240, 232, 0.4);
        }

        .chat-window-input-bar {
          padding: 12px;
          background: rgba(13, 13, 26, 0.8);
          border-top: 1px solid rgba(201, 169, 110, 0.15);
          display: flex;
          gap: 8px;
        }

        .chat-window-input {
          flex: 1;
          background: rgba(26, 26, 46, 0.8);
          border: 1px solid rgba(201, 169, 110, 0.2);
          border-radius: 8px;
          color: #f5f0e8;
          padding: 8px 12px;
          font-size: 13px;
          outline: none;
        }

        .chat-window-input:focus {
          border-color: #c9a96e;
        }

        .chat-window-send {
          background: #c9a96e;
          color: #0d0d1a;
          border: none;
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .chat-window-send:hover {
          background: #e2c58f;
        }

        .chat-window-send:disabled {
          background: rgba(201, 169, 110, 0.3);
          color: rgba(13, 13, 26, 0.4);
          cursor: not-allowed;
        }

        .credits-bar {
          font-size: 10px;
          padding: 4px 16px;
          background: rgba(201, 169, 110, 0.05);
          color: #c9a96e;
          border-top: 1px solid rgba(201, 169, 110, 0.08);
          text-align: center;
        }

        .typing-dots {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 0;
        }

        .typing-dots span {
          width: 6px;
          height: 6px;
          background: #c9a96e;
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        :global(.chat-h4) {
          color: #c9a96e;
          font-size: 13px;
          font-weight: 600;
          margin-top: 6px;
          margin-bottom: 4px;
        }

        :global(.chat-li) {
          margin-left: 12px;
          font-size: 12px;
          margin-bottom: 2px;
        }

        :global(.chat-ol-li) {
          margin-left: 14px;
          font-size: 12px;
          margin-bottom: 2px;
        }
      `}</style>
    </div>
  );
}
