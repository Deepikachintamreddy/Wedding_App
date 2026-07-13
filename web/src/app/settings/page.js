'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeddingStore } from '@/lib/store';

export default function SettingsPage() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, loading, updateUser, resetStore } = store;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    weddingDate: '',
    location: '',
    budget: 50000,
    theme: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        weddingDate: user.weddingDate || '2027-07-15',
        location: user.location || 'Malibu, CA',
        budget: user.budget || 50000,
        theme: user.theme || 'Elegant Navy & Gold',
      });
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

  const handleSave = (e) => {
    e.preventDefault();
    updateUser(formData);
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    if (confirm('🚨 Warning: This will delete all customized checklist, budget, vendor, and guest list changes. Are you sure you want to reset all workspace data?')) {
      resetStore();
      alert('Workspace reset successful!');
      router.push('/dashboard');
    }
  };

  const handleActivateEventPass = () => {
    updateUser({ eventPassActive: true, aiCredits: 9999 });
    alert('Premium Event Pass activated! You now have unlimited AI Concierge credits.');
  };

  return (
    <main className="settings-layout">
      <div className="navbar-spacer"></div>

      <div className="container py-8 max-w-3xl">
        <div className="settings-header mb-8">
          <span className="overline">WORKSPACE SETTINGS</span>
          <h1 className="h2 font-heading text-gold mb-1">VND Account Preferences</h1>
          <p className="body-sm text-secondary">
            Manage your personal profile, customize event metrics, or reset application databases.
          </p>
        </div>

        <div className="flex-col gap-8">
          {/* Section 1: Subscription Tier Card */}
          <div className="card glass-panel p-6 bg-gold-tint relative">
            <h2 className="h4 font-heading text-gold mb-2">Subscription & Licensing</h2>
            <p className="body-sm text-secondary mb-4">
              Your planning suite is currently operating under:
            </p>
            <div className="flex-between mb-4 border-b pb-4 items-center">
              <div>
                <span className="badge badge-gold badge-lg font-bold">
                  {user.eventPassActive ? '👑 Event Pass Active (Unlimited)' : '⚡ Complimentary Free Tier'}
                </span>
                {!user.eventPassActive && (
                  <p className="text-xs text-muted mt-2 mb-0">Complimentary 15 monthly AI credits. Upgrades clear all limitations.</p>
                )}
              </div>
              {!user.eventPassActive && (
                <button 
                  onClick={handleActivateEventPass}
                  className="btn btn-primary"
                >
                  Activate Pass ($99)
                </button>
              )}
            </div>
            <p className="text-xs text-muted mb-0">
              OVAimagination Events recommends the **Event Pass ($99)** for seamless collaborative wedding timelines.
            </p>
          </div>

          {/* Section 2: Edit Profile Form */}
          <div className="card glass-panel p-6">
            <h2 className="h4 font-heading text-gold mb-6">Wedding Profile</h2>
            <form onSubmit={handleSave} className="flex-col gap-4">
              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Names Displayed</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    disabled
                    value={formData.email}
                    className="form-input text-muted"
                  />
                </div>
              </div>
              
              {user.role === 'couple' && (
                <>
                  <div className="grid grid-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Wedding Date</label>
                      <input 
                        type="date" 
                        value={formData.weddingDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, weddingDate: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Wedding Location</label>
                      <input 
                        type="text" 
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="grid grid-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Budget Ceiling ($)</label>
                      <input 
                        type="number" 
                        value={formData.budget}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Design Styling Aesthetic</label>
                      <select 
                        value={formData.theme}
                        onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                        className="form-select"
                      >
                        <option value="Elegant Navy & Gold">Elegant Navy & Gold</option>
                        <option value="Modern Minimalist">Modern Minimalist</option>
                        <option value="Rustic Chic">Rustic Chic</option>
                        <option value="Coastal Romance">Coastal Romance</option>
                        <option value="Vintage Glamour">Vintage Glamour</option>
                        <option value="Creative DIY">Creative DIY</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex justify-end mt-4">
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>

          {/* Section 3: Reset Workspace Database */}
          <div className="card glass-panel p-6 border-danger">
            <h2 className="h4 font-heading text-danger mb-2">Danger Zone</h2>
            <p className="body-sm text-secondary mb-4">
              Carefully manage system databases. Actions here cannot be undone.
            </p>
            <div className="flex-between items-center bg-danger-tint p-4 rounded-lg border border-danger-tint">
              <div>
                <span className="body-sm font-bold text-primary block">Reset Wedding Workspace</span>
                <span className="text-xs text-muted">Clear all custom modifications, budgets, tasks, vendors, and guests database.</span>
              </div>
              <button 
                onClick={handleReset}
                className="btn btn-danger"
              >
                Clear Database
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-layout {
          background: transparent;
          color: #f5f0e8;
          min-height: 100vh;
        }
        .navbar-spacer {
          height: 80px;
        }
        .max-w-3xl {
          max-width: 48rem;
          margin: 0 auto;
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
        .border-b {
          border-bottom: 1px solid rgba(201, 169, 110, 0.08);
        }
        .pb-4 {
          padding-bottom: 16px;
        }
        .border-danger {
          border-color: #ef4444;
        }
        .bg-danger-tint {
          background: rgba(239, 68, 68, 0.04);
        }
        .border-danger-tint {
          border-color: rgba(239, 68, 68, 0.1);
        }
        .bg-gold-tint {
          background: radial-gradient(circle at 10% 10%, rgba(201, 169, 110, 0.12) 0%, transparent 60%);
        }
        .mb-0 { margin-bottom: 0; }
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-6 { margin-bottom: 24px; }
        .mb-8 { margin-bottom: 32px; }
        .mt-2 { margin-top: 8px; }
        .mt-4 { margin-top: 16px; }
        .py-8 { padding-top: 32px; padding-bottom: 32px; }
        .p-6 { padding: 24px; }
        .flex-col { display: flex; flex-direction: column; }
        .flex-between { display: flex; align-items: center; justify-content: space-between; }
        .gap-4 { gap: 16px; }
        .gap-8 { gap: 32px; }
        .font-bold { font-weight: 700; }
        .text-muted { color: var(--color-text-muted) !important; }
      `}</style>
    </main>
  );
}
