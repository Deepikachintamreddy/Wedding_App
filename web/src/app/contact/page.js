'use client';

import { useState } from 'react';

export default function ContactSupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="contact-page-layout">
      <div className="navbar-spacer"></div>
      <div className="container py-12 max-w-4xl">
        <div className="contact-header mb-8 text-center">
          <span className="badge badge-gold mb-2">CONCIERGE DESK</span>
          <h1 className="h2 font-heading text-gold mb-2">Contact & Support</h1>
          <p className="body-sm text-secondary">
            Our coordination team and support specialists are here to assist with your wedding planning journey.
          </p>
        </div>

        <div className="grid grid-2 gap-8">
          {/* Support Information Card */}
          <div className="card glass-panel p-6 flex-col justify-between">
            <div>
              <h2 className="h4 font-heading text-gold mb-4">Direct Channels</h2>
              <div className="flex-col gap-4 body-sm text-secondary mb-6">
                <div>
                  <span className="text-primary font-bold block">💍 Couple Support:</span>
                  <span>support@elysianconcierge.com</span>
                </div>
                <div>
                  <span className="text-primary font-bold block">⚜️ Planning Partner (OVAimagination):</span>
                  <span>hello@ovaimagination.com</span>
                </div>
                <div>
                  <span className="text-primary font-bold block">🏛️ Vendor Partner Desk:</span>
                  <span>partners@elysianconcierge.com</span>
                </div>
                <div>
                  <span className="text-primary font-bold block">📍 Concierge Studio:</span>
                  <span>Malibu & Los Angeles, CA</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-secondary rounded-lg border border-divider">
              <span className="text-xs text-gold font-bold block mb-1">Response Guarantee:</span>
              <span className="text-xs text-muted">Event Pass and Concierge Plus holders receive priority assistance within 4 business hours.</span>
            </div>
          </div>

          {/* Contact & Support Form */}
          <div className="card glass-panel p-6">
            {submitted ? (
              <div className="text-center py-8 flex-col items-center gap-3">
                <span style={{ fontSize: '3rem' }}>💌</span>
                <h3 className="h4 font-heading text-gold mb-1">Message Received</h3>
                <p className="body-sm text-secondary mb-4">
                  Thank you for reaching out! A member of our concierge support team will contact you at <strong>{form.email}</strong> shortly.
                </p>
                <button onClick={() => setSubmitted(false)} className="btn btn-secondary btn-sm">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex-col gap-4">
                <h2 className="h4 font-heading text-gold mb-2">Send a Message</h2>
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input 
                    type="text" 
                    required 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    className="form-input" 
                    placeholder="Sarah Jenkins"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={form.email} 
                    onChange={e => setForm({ ...form, email: e.target.value })} 
                    className="form-input" 
                    placeholder="sarah@example.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Inquiry Topic</label>
                  <select 
                    value={form.subject} 
                    onChange={e => setForm({ ...form, subject: e.target.value })} 
                    className="form-select"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Event Pass Upgrade">Event Pass & Billing Support</option>
                    <option value="Planner Matchmaking">OVAimagination Planner Matchmaking</option>
                    <option value="Vendor Verification">Vendor Application / Directory</option>
                    <option value="Technical Issue">Technical Assistance / Bug Report</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Message Details</label>
                  <textarea 
                    required 
                    rows="4" 
                    value={form.message} 
                    onChange={e => setForm({ ...form, message: e.target.value })} 
                    className="form-textarea" 
                    placeholder="How can our concierge team assist you?"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full">
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-page-layout { background: transparent; color: #f5f0e8; min-height: 100vh; }
        .navbar-spacer { height: 80px; }
        .max-w-4xl { max-width: 56rem; margin: 0 auto; }
        .py-12 { padding-top: 48px; padding-bottom: 48px; }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); }
        @media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr; } }
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-6 { margin-bottom: 24px; }
        .mb-8 { margin-bottom: 32px; }
        .p-6 { padding: 24px; }
        .p-4 { padding: 16px; }
        .flex-col { display: flex; flex-direction: column; }
        .gap-4 { gap: 16px; }
        .gap-8 { gap: 32px; }
        .bg-secondary { background: rgba(26, 26, 46, 0.6); }
        .border-divider { border-color: rgba(201, 169, 110, 0.1); }
      `}</style>
    </main>
  );
}
