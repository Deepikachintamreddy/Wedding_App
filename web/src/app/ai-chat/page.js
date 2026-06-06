'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWeddingStore } from '@/lib/store';
import { getAiResponse } from '@/lib/aiService';

const SUGGESTIONS = [
  { label: '💰 Budget strategy', text: 'How should I split my wedding budget?' },
  { label: '✍️ Help write vows', text: 'Write a romantic wedding vow draft.' },
  { label: '🏛️ Venue choosing tips', text: 'What should I ask when booking a venue?' },
  { label: '🎟️ Event Pass pricing', text: 'Tell me about the Event Pass pricing.' },
  { label: '🎵 DJ vs Band guide', text: 'Should I book a DJ or a live band?' },
  { label: '⏱️ Day-of schedule outline', text: 'What does a typical day-of timeline look like?' },
];

export default function AiChatPage() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, loading, deductAiCredit, addTask } = store;

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `### 🧭 Welcome to the Elysian Wedding Concierge!
I am your personal AI assistant, trained in luxury wedding coordination by **OVAimagination Events**.

You can ask me questions about your planning process, budget strategy, or vendor bookings. I can also help you write vows or speeches!

**Try clicking one of the suggested prompts below to get started!**`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [taskToSave, setTaskToSave] = useState({ title: '', category: 'Planner', notes: '' });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (loading || !user) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', background: '#0d0d1a' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(201, 169, 110, 0.15)', borderTopColor: '#c9a96e', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style jsx>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .flex-center { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #0d0d1a; }
        `}</style>
      </div>
    );
  }

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const creditsRemaining = user.aiCredits ?? 15;
    
    // Call AI Response
    const response = await getAiResponse(textToSend, creditsRemaining);

    setIsTyping(false);

    // Add AI Response
    const aiMsg = {
      id: `msg_${Date.now() + 1}`,
      sender: 'ai',
      text: response.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, aiMsg]);

    // Deduct credit if successful and user is not on Event Pass/Admin
    if (response.creditsUsed && user.role !== 'admin' && !user.eventPassActive) {
      deductAiCredit();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputText);
    }
  };

  // Convert raw message text into HTML with simple markdown (bold, lists, titles)
  const formatMessageText = (text) => {
    if (!text) return '';
    let formatted = text;

    // Escape HTML tags to prevent XSS
    formatted = formatted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Titles (e.g. ### Title)
    formatted = formatted.replace(/^### (.*$)/gim, '<h3 class="chat-h3">$1</h3>');
    formatted = formatted.replace(/^## (.*$)/gim, '<h2 class="chat-h2">$1</h2>');

    // Bold (e.g. **bold**)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic (e.g. *italic*)
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Bullet points (e.g. - item or 1. item)
    formatted = formatted.replace(/^\s*-\s+(.*$)/gim, '<li class="chat-li">$1</li>');
    formatted = formatted.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="chat-ol-li">$1</li>');

    // Line breaks
    formatted = formatted.replace(/\n/g, '<br />');

    return formatted;
  };

  const triggerSaveModal = (text) => {
    // Attempt to extract title from the first 50 chars of the text
    const cleanTitle = text
      .replace(/[#*_-]/g, '')
      .split('\n')[0]
      .substring(0, 60)
      .trim();

    setTaskToSave({
      title: `Review suggestions: ${cleanTitle}`,
      category: 'Planner',
      notes: text.substring(0, 300) + (text.length > 300 ? '...' : ''),
    });
    setSaveModalOpen(true);
  };

  const handleSaveTask = () => {
    addTask({
      title: taskToSave.title,
      category: taskToSave.category,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week out
      notes: taskToSave.notes,
      period: 'Upcoming',
      assignedTo: 'Both',
    });
    setSaveModalOpen(false);
    alert('Task successfully saved to your Checklist!');
  };

  return (
    <main className="chat-layout">
      <div className="navbar-spacer"></div>

      <div className="container py-6 flex-col chat-container-box">
        {/* Chat Header */}
        <div className="chat-header card glass-panel p-4 flex-between mb-4">
          <div className="flex-start items-center gap-3">
            <span style={{ fontSize: '2rem' }}>🤖</span>
            <div>
              <h1 className="h4 font-heading text-gold mb-0">Elysian AI Concierge</h1>
              <p className="caption text-muted mb-0">Partnered with OVAimagination Events</p>
            </div>
          </div>
          <div className="credits-display flex-col items-end">
            <div className="flex-start items-center gap-2">
              <span className="badge badge-gold">
                {user.eventPassActive ? 'Event Pass: Unlimited' : `${user.aiCredits ?? 15} Credits Remaining`}
              </span>
            </div>
            {!user.eventPassActive && (
              <span className="text-xs text-muted mt-1">Deducts 1 credit per message</span>
            )}
          </div>
        </div>

        {/* Messages Stream */}
        <div className="messages-stream card glass-panel p-4 mb-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`message-row flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div 
                className={`message-bubble ${
                  msg.sender === 'user' ? 'bubble-user' : 'bubble-ai'
                } p-4 max-w-xl`}
              >
                <div 
                  dangerouslySetInnerHTML={{ __html: formatMessageText(msg.text) }} 
                  className="bubble-content body-sm"
                />
                
                <div className="flex-between items-center mt-3 border-t pt-2 text-xs text-muted">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'ai' && msg.id !== 'welcome' && (
                    <button 
                      onClick={() => triggerSaveModal(msg.text)}
                      className="save-task-btn text-gold hover:underline font-bold"
                    >
                      💾 Add to Checklist
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message-row flex justify-start mb-4">
              <div className="message-bubble bubble-ai p-4">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div className="suggestions-row mb-4">
            <span className="text-xs text-muted block mb-2">Suggested Topics:</span>
            <div className="chips-container flex-start gap-2 flex-wrap">
              {SUGGESTIONS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => handleSendMessage(chip.text)}
                  className="chip-btn badge badge-secondary hover:badge-gold cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="chat-input-bar flex gap-3">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={!user.eventPassActive && (user.aiCredits ?? 0) <= 0}
            placeholder={
              !user.eventPassActive && (user.aiCredits ?? 0) <= 0 
                ? 'Out of credits. Please purchase Event Pass to continue chatting.' 
                : 'Ask anything about your wedding planning...'
            }
            className="chat-input flex-1"
          />
          <button 
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim() || (!user.eventPassActive && (user.aiCredits ?? 0) <= 0)}
            className="btn btn-primary"
          >
            Send
          </button>
        </div>
      </div>

      {/* Save to Checklist Modal */}
      {saveModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-gold font-heading">Add Suggestion to Checklist</h3>
              <button onClick={() => setSaveModalOpen(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input 
                  type="text" 
                  value={taskToSave.title}
                  onChange={(e) => setTaskToSave(prev => ({ ...prev, title: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  value={taskToSave.category}
                  onChange={(e) => setTaskToSave(prev => ({ ...prev, category: e.target.value }))}
                  className="form-select"
                >
                  {['Planner', 'Venue', 'Catering', 'Photography', 'Videography', 'Florals', 'Music', 'Attire', 'Hair & Makeup', 'Invitations', 'Bakery', 'Rings', 'Decor', 'Misc'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Attached Guide Notes</label>
                <textarea 
                  value={taskToSave.notes}
                  onChange={(e) => setTaskToSave(prev => ({ ...prev, notes: e.target.value }))}
                  className="form-textarea"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setSaveModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
              <button onClick={handleSaveTask} className="btn btn-primary btn-sm">Save Task</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .chat-layout {
          background: transparent;
          color: #f5f0e8;
          min-height: 100vh;
        }
        .navbar-spacer {
          height: 80px;
        }
        .chat-container-box {
          height: calc(100vh - 120px);
          max-width: 800px !important;
          margin: 0 auto;
        }
        .messages-stream {
          flex: 1;
          overflow-y: auto;
          background: rgba(26, 26, 46, 0.4);
          max-height: calc(100vh - 300px);
        }
        .message-bubble {
          border-radius: 16px;
          line-height: 1.5;
        }
        .bubble-user {
          background: #c9a96e;
          color: #0d0d1a;
          border-bottom-right-radius: 4px;
        }
        .bubble-user .text-muted {
          color: rgba(13, 13, 26, 0.6) !important;
        }
        .bubble-user .border-t {
          border-top-color: rgba(13, 13, 26, 0.15) !important;
        }
        .bubble-ai {
          background: rgba(201, 169, 110, 0.08);
          border: 1px solid rgba(201, 169, 110, 0.15);
          color: #f5f0e8;
          border-bottom-left-radius: 4px;
        }
        .bubble-ai .border-t {
          border-top-color: rgba(201, 169, 110, 0.1) !important;
        }
        .chat-input {
          background: rgba(26, 26, 46, 0.8);
          border: 1px solid rgba(201, 169, 110, 0.2);
          border-radius: 12px;
          color: #f5f0e8;
          padding: 14px 16px;
          outline: none;
          font-family: inherit;
        }
        .chat-input:focus {
          border-color: #c9a96e;
        }
        .chip-btn {
          border: 1px solid rgba(201, 169, 110, 0.15);
          padding: 8px 12px;
          border-radius: 99px;
          font-size: 0.8rem;
          background: rgba(201, 169, 110, 0.04);
          transition: all 0.3s ease;
        }
        .chip-btn:hover {
          background: rgba(201, 169, 110, 0.12);
          border-color: #c9a96e;
        }
        .chips-container {
          display: flex;
          flex-wrap: wrap;
        }
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #c9a96e;
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        
        :global(.chat-h3) {
          color: #c9a96e;
          font-family: var(--font-heading);
          font-size: 1.15rem;
          margin-top: 10px;
          margin-bottom: 6px;
        }
        :global(.chat-h2) {
          color: #c9a96e;
          font-family: var(--font-heading);
          font-size: 1.3rem;
          margin-top: 14px;
          margin-bottom: 8px;
        }
        :global(.chat-li) {
          list-style: square outside;
          margin-left: 16px;
          font-size: 0.85rem;
          margin-bottom: 4px;
        }
        :global(.chat-ol-li) {
          list-style: decimal outside;
          margin-left: 18px;
          font-size: 0.85rem;
          margin-bottom: 4px;
        }
        .mb-0 { margin-bottom: 0; }
        .mb-4 { margin-bottom: 16px; }
        .py-6 { padding-top: 24px; padding-bottom: 24px; }
        .p-4 { padding: 16px; }
        .mt-3 { margin-top: 12px; }
        .pt-2 { padding-top: 8px; }
        .border-t { border-top: 1px solid rgba(201, 169, 110, 0.1); }
        .flex-col { display: flex; flex-direction: column; }
        .flex-between { display: flex; align-items: center; justify-content: space-between; }
        .flex-start { display: flex; align-items: center; justify-content: flex-start; }
        .flex-wrap { flex-wrap: wrap; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .max-w-xl { max-width: 36rem; }
        .justify-end { justify-content: flex-end; }
        .justify-start { justify-content: flex-start; }
      `}</style>
    </main>
  );
}
