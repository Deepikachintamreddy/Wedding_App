'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeddingStore } from '@/lib/store';
import { MOCK_TIMELINE } from '@/lib/mockData';
import Monogram from '@/components/Monogram';

export default function TimelinePage() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, eventProfile, timeline, loading, addTimelineEvent, updateTimelineEvent, deleteTimelineEvent } = store;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [eventForm, setEventForm] = useState({
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
      <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--color-navy-dark, #050d1a)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212, 175, 55, 0.2)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style jsx>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .flex-center { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
        `}</style>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setEventForm({
      time: '02:00 PM',
      title: '',
      location: eventProfile?.venueName || 'Main Salon',
      desc: '',
      assignee: 'Both',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (event) => {
    setEditingEvent(event);
    setEventForm({
      time: event.time,
      title: event.title,
      location: event.location,
      desc: event.desc || '',
      assignee: event.assignee || 'Both',
    });
    setModalOpen(true);
  };

  const handleEventSubmit = (e) => {
    e.preventDefault();
    if (!eventForm.time || !eventForm.title || !eventForm.location) return;

    if (editingEvent) {
      updateTimelineEvent(editingEvent.id, eventForm);
    } else {
      addTimelineEvent(eventForm);
    }

    setModalOpen(false);
  };

  const handleStatusToggle = (eventId, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    updateTimelineEvent(eventId, { status: nextStatus });
  };

  const handleDeleteEvent = (eventId, title) => {
    if (confirm(`Are you sure you want to remove "${title}" from the master timeline?`)) {
      deleteTimelineEvent(eventId);
    }
  };

  const handleAiSuggest = () => {
    setIsSuggesting(true);
    setTimeout(() => {
      localStorage.setItem('elysian_timeline', JSON.stringify(MOCK_TIMELINE));
      window.dispatchEvent(new Event('elysian_store_update'));
      setIsSuggesting(false);
      alert('Master timeline populated with standard luxury wedding schedule curated by OVAimagination Events!');
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  // Sort timeline events chronologically
  const parseTimeToMinutes = (timeString) => {
    if (!timeString) return 0;
    const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
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
            <div className="flex-start items-center gap-2 mb-1">
              <span className="badge badge-gold">Master Run-Sheet</span>
              <span className="badge badge-secondary">{eventProfile?.coupleNames || user.name}</span>
            </div>
            <h1 className="h2 font-heading text-gold mb-1">Day-of Master Timeline</h1>
            <p className="body-sm text-secondary">
              Minute-by-minute schedule for vendors, coordinators, and wedding party. Coordinated with **OVAimagination Events**.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button 
              onClick={handleAiSuggest}
              disabled={isSuggesting}
              className="btn btn-secondary"
            >
              {isSuggesting ? 'Crafting Schedule...' : '🤖 Curate Luxury Schedule'}
            </button>
            <button 
              onClick={handlePrint}
              className="btn btn-secondary"
            >
              🖨️ Export Run-Sheet PDF
            </button>
            <button 
              onClick={handleOpenAdd}
              className="btn btn-primary"
            >
              ＋ Add Schedule Item
            </button>
          </div>
        </div>

        {/* Printable View Header */}
        <div className="print-header only-print mb-8">
          <div className="text-center">
            <h2 className="text-gold" style={{ fontSize: '1.5rem', letterSpacing: '2px', fontWeight: 700 }}>ELYSIAN WEDDINGS &bull; MASTER TIMELINE</h2>
            <h1 className="h1 font-heading text-primary mt-2">{eventProfile?.coupleNames || user.name}'s Wedding Day Schedule</h1>
            <p className="body-sm text-secondary">
              Date: {eventProfile?.weddingDate || user.weddingDate} &bull; Location: {eventProfile?.location || user.location} &bull; Planning Partner: OVAimagination Events
            </p>
            <div style={{ width: '80px', height: '1.5px', background: '#D4AF37', margin: '16px auto' }}></div>
          </div>
        </div>

        {/* Timeline Event List */}
        <div className="timeline-trail flex-col">
          {sortedTimeline.length > 0 ? (
            sortedTimeline.map((event, index) => {
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
                      aria-label={`Toggle status for ${event.title}`}
                    >
                      {event.status === 'Completed' ? '✓' : ''}
                    </div>
                    {!isLast && <div className="trail-vertical-line"></div>}
                  </div>

                  {/* Event Details Card */}
                  <div className="card glass-panel flex-1 p-5 mb-6 flex-between items-start gap-4 border-gold-hover">
                    <div className="flex-col flex-1">
                      <div className="flex-start items-center gap-3 mb-2 flex-wrap">
                        <span className="event-time font-heading text-gold text-lg font-bold">{event.time}</span>
                        <span className="badge badge-secondary">{event.location}</span>
                        <span className="badge badge-gold badge-sm">Lead: {event.assignee || 'Both'}</span>
                      </div>
                      
                      <h3 className="h5 text-primary font-body font-bold mb-2">{event.title}</h3>
                      
                      <p className="body-sm text-secondary mb-0">
                        {event.desc || 'No specific notes recorded.'}
                      </p>
                    </div>

                    <div className="flex-start gap-2 no-print">
                      <button 
                        onClick={() => handleOpenEdit(event)}
                        className="btn btn-ghost btn-sm text-secondary"
                        aria-label={`Edit ${event.title}`}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleStatusToggle(event.id, event.status)}
                        className={`btn btn-sm ${event.status === 'Completed' ? 'btn-ghost text-success' : 'btn-outline'}`}
                        aria-label={`Toggle completion for ${event.title}`}
                      >
                        {event.status === 'Completed' ? '✓ Done' : 'Complete'}
                      </button>
                      <button 
                        onClick={() => handleDeleteEvent(event.id, event.title)}
                        className="btn btn-ghost btn-sm text-danger"
                        aria-label={`Delete ${event.title}`}
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
              <p className="body-sm text-secondary mt-2">No timeline events scheduled yet. Click "Curate Luxury Schedule" to import the verified template!</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Event Modal */}
      {modalOpen && (
        <div className="modal-overlay no-print" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-gold font-heading">{editingEvent ? 'Edit Schedule Item' : 'Add Schedule Item'}</h3>
              <button onClick={() => setModalOpen(false)} className="modal-close" aria-label="Close modal">×</button>
            </div>
            <form onSubmit={handleEventSubmit}>
              <div className="modal-body">
                <div className="grid grid-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Event Time</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 04:30 PM"
                      value={eventForm.time}
                      onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assignee / Lead</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Officiant & Couple"
                      value={eventForm.assignee}
                      onChange={(e) => setEventForm(prev => ({ ...prev, assignee: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Event Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Grand Entrance & Champagne Toast"
                    value={eventForm.title}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location / Space</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Grand Ballroom Terrace"
                    value={eventForm.location}
                    onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description & Logistics Notes</label>
                  <textarea 
                    placeholder="e.g. Sound engineer cues fanfare music. Caterer pours vintage champagne."
                    value={eventForm.desc}
                    onChange={(e) => setEventForm(prev => ({ ...prev, desc: e.target.value }))}
                    className="form-textarea"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">{editingEvent ? 'Save Changes' : 'Create Schedule Item'}</button>
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
          border: 2px solid #D4AF37;
          background: #0A192F;
          z-index: 10;
          transition: all 0.3s ease;
        }
        .dot-completed {
          background: #10B981;
          border-color: #10B981;
          color: #0A192F;
          font-weight: 700;
        }
        .dot-pending {
          background: #0A192F;
          border-color: #D4AF37;
        }
        .trail-vertical-line {
          width: 2px;
          position: absolute;
          top: 24px;
          bottom: -24px;
          background: rgba(212, 175, 55, 0.2);
          z-index: 1;
        }
        .event-time {
          font-size: 1.1rem;
        }
        .border-gold-hover:hover {
          border-color: #D4AF37;
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
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .gap-4 { gap: 16px; }
        .gap-6 { gap: 24px; }
        .font-bold { font-weight: 700; }
        .w-full { width: 100%; }
      `}</style>
    </main>
  );
}
