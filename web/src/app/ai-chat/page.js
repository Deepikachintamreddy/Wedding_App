'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWeddingStore } from '@/lib/store';
import { getAiResponse } from '@/lib/aiService';
import Monogram from '@/components/Monogram';

const SUGGESTIONS = [
  { label: '💰 Budget Allocation Strategy', text: 'How should I allocate my wedding budget across key categories?' },
  { label: '✍️ Draft Romantic Vows', text: 'Write a heartfelt, romantic wedding vow draft.' },
  { label: '🏛️ Malibu & Coastal Venues', text: 'What questions should I ask when touring luxury wedding venues?' },
  { label: '🎟️ Event Pass Benefits', text: 'What is included with the Elysian Event Pass?' },
  { label: '🎵 Curating Live Band vs DJ', text: 'Should we hire a live brass swing band or an editorial club DJ?' },
  { label: '⏱️ Day-Of Master Schedule', text: 'What is the ideal timeline breakdown for an evening wedding ceremony?' },
];

export default function AiChatPage() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, eventProfile, loading, deductAiCredit, addTask, addBudgetPayment, updateVendor } = store;

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `### 🧭 Welcome to the Elysian AI Concierge
I am your dedicated digital planning assistant, curated with knowledge from **OVAimagination Events**.

I can provide personalized styling recommendations, draft custom vows, breakdown budget allocations, and structure day-of timelines.

**Select a prompt below or ask any planning question to begin!**`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      proposedAction: null
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [taskToSave, setTaskToSave] = useState({ title: '', category: 'Planner', notes: '' });
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);
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
      <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--color-navy-dark, #050d1a)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212, 175, 55, 0.2)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style jsx>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .flex-center { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
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

    const creditsRemaining = user.aiCredits ?? 20;
    
    // Call AI Response with context
    const response = await getAiResponse(textToSend, creditsRemaining, {
      user,
      eventProfile,
      tasks: store.tasks,
      budget: store.budget,
      vendors: store.vendors
    });

    setIsTyping(false);

    // Add AI Response with proposed action
    const aiMsg = {
      id: `msg_${Date.now() + 1}`,
      sender: 'ai',
      text: response.text,
      proposedAction: response.proposedAction,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, aiMsg]);

    // Deduct credit if applicable
    if (response.creditsUsed && user.role !== 'admin' && !user.eventPassActive) {
      deductAiCredit();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputText);
    }
  };

  const handleApplyProposedAction = (action) => {
    if (!action) return;
    if (action.type === 'ADD_CHECKLIST_TASK') {
      addTask({
        title: action.payload.title,
        category: action.payload.category || 'Planner',
        dueDate: action.payload.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        notes: action.payload.notes || 'Created via Elysian AI Concierge approval',
        period: 'Upcoming',
        assignedTo: 'Both'
      });
      setActionSuccessMsg(`Added "${action.payload.title}" to your master checklist!`);
    } else if (action.type === 'LOG_BUDGET_PAYMENT') {
      addBudgetPayment({
        vendorName: action.payload.vendorName,
        category: action.payload.category || 'Planner',
        amount: Number(action.payload.amount) || 1000,
        date: new Date().toISOString().split('T')[0],
        status: 'Paid',
        method: 'Credit Card'
      });
      setActionSuccessMsg(`Logged payment of $${action.payload.amount} for ${action.payload.vendorName}!`);
    }
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Convert raw message text into HTML with safe markdown
  const formatMessageText = (text) => {
    if (!text) return '';
    let formatted = text;

    formatted = formatted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    formatted = formatted.replace(/^### (.*$)/gim, '<h3 class="chat-h3">$1</h3>');
    formatted = formatted.replace(/^## (.*$)/gim, '<h2 class="chat-h2">$1</h2>');
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/^\s*-\s+(.*$)/gim, '<li class="chat-li">$1</li>');
    formatted = formatted.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="chat-ol-li">$1</li>');
    formatted = formatted.replace(/\n/g, '<br />');

    return formatted;
  };

  const triggerSaveModal = (text) => {
    const cleanTitle = text
      .replace(/[#*_-]/g, '')
      .split('\n')[0]
      .substring(0, 60)
      .trim();

    setTaskToSave({
      title: `Action: ${cleanTitle}`,
      category: 'Planner',
      notes: text.substring(0, 300) + (text.length > 300 ? '...' : ''),
    });
    setSaveModalOpen(true);
  };

  const handleSaveTask = () => {
    addTask({
      title: taskToSave.title,
      category: taskToSave.category,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: taskToSave.notes,
      period: 'Upcoming',
      assignedTo: 'Both',
    });
    setSaveModalOpen(false);
    setActionSuccessMsg('Milestone added to your Master Checklist!');
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  return (
    <main className="chat-layout">
      <div className="navbar-spacer"></div>

      <div className="container py-6 flex-col chat-container-box">
        {/* Chat Header */}
        <div className="chat-header card glass-panel p-4 flex-between mb-4 border-gold">
          <div className="flex-start items-center gap-3">
            <Monogram size={36} variant="gold" />
            <div>
              <div className="flex-start items-center gap-2">
                <h1 className="h4 font-heading text-gold mb-0">Elysian AI Concierge</h1>
                <span className="badge badge-gold text-xs">OVAimagination Verified</span>
              </div>
              <p className="caption text-muted mb-0">
                AI Advisory Service &bull; <Link href="/ai-disclaimer" className="text-secondary hover:underline">Read AI Disclaimer</Link>
              </p>
            </div>
          </div>
          <div className="credits-display flex-col items-end">
            <div className="flex-start items-center gap-2">
              <span className="badge badge-gold">
                {user.eventPassActive ? 'Event Pass: Unlimited' : `${user.aiCredits ?? 20} Credits Remaining`}
              </span>
            </div>
            {!user.eventPassActive && (
              <span className="text-xs text-muted mt-1">1 credit per message</span>
            )}
          </div>
        </div>

        {/* Action Success Toast */}
        {actionSuccessMsg && (
          <div className="badge badge-success p-3 mb-3 text-center block">
            ✓ {actionSuccessMsg}
          </div>
        )}

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

                {/* Step 15: Proposed Action Confirmation Card */}
                {msg.proposedAction && (
                  <div className="proposed-action-card mt-3 p-3 rounded-lg">
                    <div className="flex-between items-center mb-2">
                      <span className="overline text-gold text-xs">🤖 Proposed Workspace Change</span>
                      <span className="badge badge-secondary text-xs">{msg.proposedAction.type}</span>
                    </div>
                    <p className="text-xs text-primary mb-3">
                      {msg.proposedAction.description}
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApplyProposedAction(msg.proposedAction)}
                        className="btn btn-primary btn-sm flex-1"
                      >
                        ✓ Approve & Apply to Plan
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex-between items-center mt-3 border-t pt-2 text-xs text-muted">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'ai' && msg.id !== 'welcome' && (
                    <button 
                      onClick={() => triggerSaveModal(msg.text)}
                      className="save-task-btn text-gold hover:underline font-bold"
                      aria-label="Save response as task"
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
            <span className="text-xs text-muted block mb-2">Suggested Curated Topics:</span>
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
                ? 'Out of credits. Upgrade to Event Pass ($99) for unlimited concierge assistance.' 
                : 'Ask anything regarding your wedding timeline, vows, or vendor plans...'
            }
            className="chat-input flex-1"
            aria-label="Chat with AI Concierge"
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
        <div className="modal-overlay" onClick={() => setSaveModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-gold font-heading">Add Suggestion to Checklist</h3>
              <button onClick={() => setSaveModalOpen(false)} className="modal-close" aria-label="Close modal">×</button>
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
              <button onClick={handleSaveTask} className="btn btn-primary btn-sm">Save Milestone</button>
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
        .border-gold {
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
        }
        .chat-container-box {
          height: calc(100vh - 120px);
          max-width: 860px !important;
          margin: 0 auto;
        }
        .messages-stream {
          flex: 1;
          overflow-y: auto;
          background: rgba(10, 25, 47, 0.6);
          max-height: calc(100vh - 300px);
        }
        .message-bubble {
          border-radius: 16px;
          line-height: 1.5;
        }
        .bubble-user {
          background: #D4AF37;
          color: #050D1A;
          border-bottom-right-radius: 4px;
        }
        .bubble-user .text-muted {
          color: rgba(5, 13, 26, 0.7) !important;
        }
        .bubble-user .border-t {
          border-top-color: rgba(5, 13, 26, 0.15) !important;
        }
        .bubble-ai {
          background: rgba(10, 25, 47, 0.85);
          border: 1px solid rgba(212, 175, 55, 0.2);
          color: #f5f0e8;
          border-bottom-left-radius: 4px;
        }
        .bubble-ai .border-t {
          border-top-color: rgba(212, 175, 55, 0.1) !important;
        }
        .proposed-action-card {
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.3);
        }
        .chat-input {
          background: rgba(10, 25, 47, 0.8);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 12px;
          color: #f5f0e8;
          padding: 14px 16px;
          outline: none;
          font-family: inherit;
        }
        .chat-input:focus {
          border-color: #D4AF37;
        }
        .chip-btn {
          border: 1px solid rgba(212, 175, 55, 0.2);
          padding: 8px 12px;
          border-radius: 99px;
          font-size: 0.8rem;
          background: rgba(212, 175, 55, 0.05);
          transition: all 0.3s ease;
        }
        .chip-btn:hover {
          background: rgba(212, 175, 55, 0.15);
          border-color: #D4AF37;
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
          background: #D4AF37;
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
          color: #D4AF37;
          font-family: var(--font-heading);
          font-size: 1.15rem;
          margin-top: 10px;
          margin-bottom: 6px;
        }
        :global(.chat-h2) {
          color: #D4AF37;
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
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
        .mb-4 { margin-bottom: 16px; }
        .py-6 { padding-top: 24px; padding-bottom: 24px; }
        .p-3 { padding: 12px; }
        .p-4 { padding: 16px; }
        .mt-1 { margin-top: 4px; }
        .mt-3 { margin-top: 12px; }
        .pt-2 { padding-top: 8px; }
        .border-t { border-top: 1px solid rgba(212, 175, 55, 0.1); }
        .flex-col { display: flex; flex-direction: column; }
        .flex-between { display: flex; align-items: center; justify-content: space-between; }
        .flex-start { display: flex; align-items: center; justify-content: flex-start; }
        .flex-wrap { flex-wrap: wrap; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .max-w-xl { max-width: 38rem; }
        .justify-end { justify-content: flex-end; }
        .justify-start { justify-content: flex-start; }
        .block { display: block; }
      `}</style>
    </main>
  );
}
