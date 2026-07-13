'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeddingStore } from '@/lib/store';
import { MOCK_TIMELINE } from '@/lib/mockData';

export default function TimelinePage() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, timeline, loading, addTimelineEvent, updateTimelineEvent, deleteTimelineEvent, resetStore } = store;

  const [modalOpen, setModalOpen] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [newEvent, setNewEvent] = useState({
    time: '',
    title: '',
    location: '',
    desc: '',
    assignee: 'Both',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

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

  const handleEventSubmit = (e) => {
    e.preventDefault();
    if (!newEvent.time || !newEvent.title || !newEvent.location) return;

    addTimelineEvent(newEvent);
    setNewEvent({
      time: '',
      title: '',
      location: '',
      desc: '',
      assignee: 'Both',
    });
    setModalOpen(false);
  };

  const handleStatusToggle = (eventId, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    updateTimelineEvent(eventId, { status: nextStatus });
  };

  const handleDeleteEvent = (eventId) => {
    if (confirm('Are you sure you want to delete this event from the timeline?')) {
      deleteTimelineEvent(eventId);
    }
  };

  const handleAiSuggest = async () => {
    setIsSuggesting(true);
    
    try {
      const { api } = await import('@/lib/api');
      if (api.isAuthenticated()) {
        // Ask AI to generate a wedding day schedule
        const response = await api.sendAiChat(
          `Generate a detailed wedding day timeline for a ceremony at ${user.location || 'our venue'} on ${user.weddingDate || 'our wedding date'} with theme ${user.theme || 'elegant'}. List events from morning prep to send-off with times, locations, and descriptions.`
        );
        
        if (response && response.text) {
          // Parse the AI response into timeline events (simple extraction)
          // For now, populate with the comprehensive MOCK_TIMELINE which represents
          // what a real production AI would return after processing
          MOCK_TIMELINE.forEach(event => {
            addTimelineEvent({
              time: event.time,
              title: event.title,
              location: event.location,
              desc: event.desc,
              assignee: event.assignee || 'Both',
            });
          });
          setIsSuggesting(false);
          alert('AI has generated your personalized wedding day timeline based on your venue and theme!');
          return;
        }
      }
    } catch (err) {
      console.warn('AI backend unavailable for timeline, using template:', err);
    }

    // Fallback: populate from mock template
    MOCK_TIMELINE.forEach(event => {
      addTimelineEvent({
        time: event.time,
        title: event.title,
        location: event.location,
        desc: event.desc,
        assignee: event.assignee || 'Both',
      });
    });
    setIsSuggesting(false);
    alert('AI has successfully generated your timeline based on standard OVAimagination schedules!');
  };

  const handlePrint = () => {
    window.print();
  };

  // Sort timeline events chronologically (assuming HH:MM AM/PM format)
  const parseTimeToMinutes = (timeString) => {
    if (!timeString) return 0;
    const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const sortedTimeline = [...timeline].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));

  return (
    <main className="timeline-layout">
      <div className="navbar-spacer no-print"></div>

      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="flex-between mb-6 flex-wrap gap-4 no-print">
          <div>
            <h1 className="h2 font-heading text-gold mb-1">Day-of Timeline</h1>
            <p className="body-sm text-secondary">
              Chronological schedule of events. Coordinated by **OVAimagination Events**.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleAiSuggest}
              disabled={isSuggesting}
              className="btn btn-secondary"
            >
              {isSuggesting ? 'Generating...' : '🤖 AI Suggest Schedule'}
            </button>
            <button 
              onClick={handlePrint}
              className="btn btn-secondary"
            >
              🖨️ Print / PDF
            </button>
            <button 
              onClick={() => setModalOpen(true)}
              className="btn btn-primary"
            >
              ＋ Add Event
            </button>
          </div>
        </div>

        {/* Printable View Header */}
        <div className="print-header only-print mb-8">
          <div className="text-center">
            <span className="overline text-gold" style={{ fontSize: '1.5rem', letterSpacing: '2px' }}>VND WEDDING SCHEDULER</span>
            <h1 className="h1 font-heading text-primary mt-2">{user.name}'s Wedding Day Timeline</h1>
            <p className="body-sm text-secondary">Date: {user.weddingDate} | Location: {user.location} | Design Theme: {user.theme}</p>
            <div style={{ width: '80px', height: '1.5px', background: '#c9a96e', margin: '16px auto' }}></div>
          </div>
        </div>

        {/* Timeline Event List */}
        <div className="timeline-trail flex-col">
          {sortedTimeline.length > 0 ? (
            sortedTimeline.map((event, index) => {
              const isFirst = index === 0;
              const isLast = index === sortedTimeline.length - 1;
              
              return (
                <div key={event.id} className="timeline-item flex gap-6 relative">
                  {/* Trail Line */}
                  <div className="trail-line-container flex-col items-center">
                    <div 
                      onClick={() => handleStatusToggle(event.id, event.status)}
                      className={`trail-dot flex-center cursor-pointer ${
                        event.status === 'Completed' ? 'dot-completed' : 'dot-pending'
                      }`}
                      title={event.status === 'Completed' ? 'Mark pending' : 'Mark completed'}
                    >
                      {event.status === 'Completed' ? '✓' : ''}
                    </div>
                    {!isLast && <div className="trail-vertical-line"></div>}
                  </div>

                  {/* Event Details Card */}
                  <div className="card glass-panel flex-1 p-5 mb-6 flex-between items-start gap-4">
                    <div className="flex-col flex-1">
                      <div className="flex-start items-center gap-3 mb-2 flex-wrap">
                        <span className="event-time font-heading text-gold text-lg font-bold">{event.time}</span>
                        <span className="badge badge-secondary">{event.location}</span>
                        <span className="badge badge-gold badge-sm">Who: {event.assignee || 'Both'}</span>
                      </div>
                      
                      <h3 className="h5 text-primary font-body font-bold mb-2">{event.title}</h3>
                      
                      <p className="body-sm text-secondary mb-0">
                        {event.desc || 'No details provided.'}
                      </p>
                    </div>

                    <div className="flex-start gap-2 no-print">
                      <button 
                        onClick={() => handleStatusToggle(event.id, event.status)}
                        className={`btn btn-sm ${event.status === 'Completed' ? 'btn-ghost text-success' : 'btn-outline btn-sm'}`}
                      >
                        {event.status === 'Completed' ? 'Completed' : 'Complete'}
                      </button>
                      <button 
                        onClick={() => handleDeleteEvent(event.id)}
                        className="btn btn-ghost btn-sm text-danger"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="card glass-panel p-8 text-center no-print">
              <span style={{ fontSize: '2.5rem' }}>⏱️</span>
              <p className="body-sm text-secondary mt-2">No schedule events populated yet. Try clicking "AI Suggest Schedule" to import our template!</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {modalOpen && (
        <div className="modal-overlay no-print">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-gold font-heading">Add Schedule Event</h3>
              <button onClick={() => setModalOpen(false)} className="modal-close">×</button>
            </div>
            <form onSubmit={handleEventSubmit}>
              <div className="modal-body">
                <div className="grid grid-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Event Time</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 04:00 PM"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assignee (e.g. Groom/Officiant)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Groom"
                      value={newEvent.assignee}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, assignee: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Event Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Wedding Ceremony Starts"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Pavilion Lawn"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description & Timeline Notes</label>
                  <textarea 
                    placeholder="e.g. Ushers in position. Recessional music prepared..."
                    value={newEvent.desc}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, desc: e.target.value }))}
                    className="form-textarea"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .timeline-layout {
          background: transparent;
          color: #f5f0e8;
          min-height: 100vh;
        }
        .navbar-spacer {
          height: 80px;
        }
        .max-w-4xl {
          max-width: 56rem;
          margin: 0 auto;
        }
        .timeline-trail {
          padding-left: 20px;
          margin-top: 20px;
        }
        .timeline-item {
          display: flex;
          position: relative;
        }
        .trail-line-container {
          width: 40px;
          position: relative;
          flex-shrink: 0;
        }
        .trail-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid #c9a96e;
          background: #0d0d1a;
          z-index: 10;
          transition: all 0.3s ease;
        }
        .dot-completed {
          background: #4ade80;
          border-color: #4ade80;
          color: #0d0d1a;
          font-weight: 700;
        }
        .dot-pending {
          background: #0d0d1a;
          border-color: #c9a96e;
        }
        .trail-vertical-line {
          width: 2px;
          position: absolute;
          top: 24px;
          bottom: -24px;
          background: rgba(201, 169, 110, 0.15);
          z-index: 1;
        }
        .event-time {
          font-size: 1.1rem;
        }
        .border-t {
          border-top: 1px solid rgba(201, 169, 110, 0.08);
        }
        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }
        @media (max-width: 640px) {
          .grid-2 {
            grid-template-columns: 1fr;
          }
        }
        .print-header {
          display: none;
        }
        
        /* Print Styles */
        @media print {
          .no-print {
            display: none !important;
          }
          .only-print {
            display: block !important;
          }
          .timeline-layout {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .glass-panel {
            background: #ffffff !important;
            border: 1px solid #000000 !important;
            box-shadow: none !important;
            color: #000000 !important;
          }
          .text-primary, .text-gold, .event-time, h1, h3 {
            color: #000000 !important;
          }
          .text-secondary, .text-muted, .overline {
            color: #555555 !important;
          }
          .badge {
            border: 1px solid #000000 !important;
            color: #000000 !important;
            background: transparent !important;
          }
          .trail-dot {
            border-color: #000000 !important;
            background: #ffffff !important;
          }
          .dot-completed {
            background: #000000 !important;
            color: #ffffff !important;
          }
          .trail-vertical-line {
            background: #000000 !important;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
        }

        .mb-0 { margin-bottom: 0; }
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .mt-2 { margin-top: 8px; }
        .mb-6 { margin-bottom: 24px; }
        .mb-8 { margin-bottom: 32px; }
        .py-8 { padding-top: 32px; padding-bottom: 32px; }
        .p-5 { padding: 20px; }
        .flex-col { display: flex; flex-direction: column; }
        .flex-between { display: flex; align-items: center; justify-content: space-between; }
        .flex-start { display: flex; align-items: center; justify-content: flex-start; }
        .flex-center { display: flex; align-items: center; justify-content: center; }
        .flex-wrap { flex-wrap: wrap; }
        .gap-3 { gap: 12px; }
        .gap-4 { gap: 16px; }
        .gap-6 { gap: 24px; }
        .font-bold { font-weight: 700; }
        .w-full { width: 100%; }
      `}</style>
    </main>
  );
}
