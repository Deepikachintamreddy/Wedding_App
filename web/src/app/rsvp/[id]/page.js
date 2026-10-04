'use client';

import { useState } from 'react';
import { useWeddingStore } from '@/lib/store';
import Monogram from '@/components/Monogram';

export default function PublicRsvpPage({ params }) {
  const store = useWeddingStore();
  const { eventProfile, addGuest } = store;
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Attending',
    meal: 'Beef',
    plusOnes: 0,
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    addGuest({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      group: 'Guests',
      status: formData.status,
      rsvpReceived: true,
      meal: formData.status === 'Attending' ? formData.meal : 'Declined',
      plusOnes: Number(formData.plusOnes) || 0,
      table: 0,
      notes: formData.notes,
    });

    setSubmitted(true);
  };

  const coupleNames = eventProfile?.name || 'Vanessa & Noah';
  const weddingDate = eventProfile?.weddingDate || 'July 15, 2027';
  const venue = eventProfile?.venue || 'The Grand Pavilion at Sunset Cove';

  return (
    <main className="rsvp-portal-layout">
      <div className="container py-12 max-w-xl">
        <div className="card glass-panel p-8 text-center flex-col items-center">
          <Monogram size={72} style={{ marginBottom: '16px' }} />
          <span className="badge badge-gold mb-3">OFFICIAL WEDDING RSVP</span>
          <h1 className="h3 font-heading text-gold mb-2">{coupleNames}</h1>
          <p className="body-sm text-secondary mb-1">📅 {weddingDate}</p>
          <p className="text-xs text-muted mb-6">📍 {venue}</p>

          <div style={{ width: '60px', height: '1.5px', background: '#d4af37', margin: '0 auto 24px' }}></div>

          {submitted ? (
            <div className="py-6 flex-col items-center gap-3">
              <span style={{ fontSize: '3rem' }}>🥂</span>
              <h2 className="h4 font-heading text-gold mb-1">RSVP Successfully Received</h2>
              <p className="body-sm text-secondary">
                {formData.status === 'Attending'
                  ? `Thank you, ${formData.name}! We look forward to celebrating our special day with you.`
                  : `Thank you for letting us know, ${formData.name}. You will be warmly missed!`}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full text-left flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Eleanor Johnson" 
                  className="form-input" 
                />
              </div>

              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="eleanor@example.com" 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 019-1122" 
                    className="form-input" 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Will you be attending?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer body-sm text-primary">
                    <input 
                      type="radio" 
                      name="status" 
                      value="Attending" 
                      checked={formData.status === 'Attending'} 
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                      style={{ accentColor: '#d4af37' }}
                    />
                    Joyfully Accept
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer body-sm text-primary">
                    <input 
                      type="radio" 
                      name="status" 
                      value="Declined" 
                      checked={formData.status === 'Declined'} 
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                      style={{ accentColor: '#d4af37' }}
                    />
                    Regretfully Decline
                  </label>
                </div>
              </div>

              {formData.status === 'Attending' && (
                <>
                  <div className="grid grid-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Dinner Plating Choice</label>
                      <select 
                        value={formData.meal} 
                        onChange={e => setFormData({ ...formData, meal: e.target.value })}
                        className="form-select"
                      >
                        <option value="Beef">Herb-Crusted Filet Mignon</option>
                        <option value="Chicken">Roasted Organic Chicken</option>
                        <option value="Fish">Lavender Halibut</option>
                        <option value="Vegetarian">Seasonal Truffle Risotto (Veg)</option>
                        <option value="Child">Child Meal Platter</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Plus-Ones Accompanying</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="3" 
                        value={formData.plusOnes} 
                        onChange={e => setFormData({ ...formData, plusOnes: e.target.value })}
                        className="form-input" 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dietary Restrictions or Song Requests</label>
                    <textarea 
                      rows="3" 
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Nut allergy, favorite dance track..." 
                      className="form-textarea" 
                    />
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary w-full mt-2">
                Submit RSVP Response
              </button>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        .rsvp-portal-layout {
          background: #0a192f;
          color: #f5f0e8;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .max-w-xl { max-width: 36rem; margin: 0 auto; }
        .py-12 { padding-top: 48px; padding-bottom: 48px; }
        .p-8 { padding: 32px; }
        .flex-col { display: flex; flex-direction: column; }
        .items-center { align-items: center; }
        .w-full { width: 100%; }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); }
        @media (max-width: 600px) { .grid-2 { grid-template-columns: 1fr; } }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .gap-4 { gap: 16px; }
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
        .mb-6 { margin-bottom: 24px; }
        .mt-2 { margin-top: 8px; }
      `}</style>
    </main>
  );
}
