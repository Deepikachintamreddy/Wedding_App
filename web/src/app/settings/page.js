'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWeddingStore } from '@/lib/store';
import Monogram from '@/components/Monogram';

export default function SettingsPage() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, eventProfile, loading, updateUser, setEventProfile, inviteCollaborator, resetStore } = store;

  const [formData, setFormData] = useState({
    partnerA: '',
    partnerB: '',
    email: '',
    weddingDate: '2027-07-15',
    location: 'Malibu, CA',
    venueName: 'Sunset Cove Estate',
    guestCount: 120,
    budget: 50000,
    theme: 'Elegant Navy & Gold',
  });

  const [collaboratorForm, setCollaboratorForm] = useState({
    name: '',
    email: '',
    role: 'Partner',
  });

  const [reminderPrefs, setReminderPrefs] = useState({
    emailDigest: true,
    upcomingTaskAlerts: true,
    weeklyMissionsSummary: true,
    quietHours: true
  });

  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user) {
      const names = eventProfile?.coupleNames ? eventProfile.coupleNames.split('&') : (user.name ? user.name.split('&') : ['', '']);
      setFormData({
        partnerA: eventProfile?.partnerA || names[0]?.trim() || user.name || '',
        partnerB: eventProfile?.partnerB || names[1]?.trim() || '',
        email: user.email || 'couple@example.com',
        weddingDate: eventProfile?.weddingDate || user.weddingDate || '2027-07-15',
        location: eventProfile?.location || user.location || 'Malibu, CA',
        venueName: eventProfile?.venueName || 'Pending Venue Selection',
        guestCount: eventProfile?.guestCount || 120,
        budget: eventProfile?.budget || user.budget || 50000,
        theme: eventProfile?.theme || user.theme || 'Elegant Navy & Gold',
      });
    }
  }, [user, eventProfile, loading, router]);

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

  const handleProfileSave = (e) => {
    e.preventDefault();
    const coupleNames = `${formData.partnerA.trim()} & ${formData.partnerB.trim()}`;
    
    updateUser({
      name: coupleNames,
      weddingDate: formData.weddingDate,
      location: formData.location,
      budget: Number(formData.budget),
      theme: formData.theme,
    });

    setEventProfile({
      coupleNames,
      partnerA: formData.partnerA.trim(),
      partnerB: formData.partnerB.trim(),
      weddingDate: formData.weddingDate,
      location: formData.location,
      venueName: formData.venueName.trim(),
      guestCount: Number(formData.guestCount),
      budget: Number(formData.budget),
      theme: formData.theme,
    });

    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleInviteCollaborator = (e) => {
    e.preventDefault();
    if (!collaboratorForm.name || !collaboratorForm.email) return;

    inviteCollaborator({
      name: collaboratorForm.name,
      email: collaboratorForm.email,
      role: collaboratorForm.role,
      status: 'Pending',
    });

    setCollaboratorForm({ name: '', email: '', role: 'Partner' });
    setInviteSuccess(true);
    setTimeout(() => setInviteSuccess(false), 3500);
  };

  const handleReset = () => {
    if (confirm('🚨 Warning: This will reset your workspace data and restore defaults. Are you sure you want to proceed?')) {
      resetStore();
      alert('Workspace reset complete!');
      router.push('/dashboard');
    }
  };

  const handleActivateEventPass = () => {
    updateUser({ eventPassActive: true, aiCredits: 9999 });
    alert('Elysian Event Pass activated! Unlimited AI Concierge assistance and collaboration tools are now unlocked.');
  };

  const collaborators = eventProfile?.collaborators || [
    { name: formData.partnerB || 'Partner', role: 'Partner', email: 'partner@example.com', status: 'Accepted' },
    { name: 'OVAimagination Concierge', role: 'Planner', email: 'concierge@ovaimagination.com', status: 'Accepted' }
  ];

  return (
    <main className="settings-layout">
      <div className="navbar-spacer"></div>

      <div className="container py-8 max-w-4xl">
        <div className="settings-header mb-8">
          <div className="flex-start items-center gap-2 mb-1">
            <Monogram size={28} variant="gold" />
            <span className="overline">WORKSPACE SETTINGS</span>
          </div>
          <h1 className="h2 font-heading text-gold mb-1">Elysian Concierge Preferences</h1>
          <p className="body-sm text-secondary">
            Manage your synchronized event profile, invite partners & planners, and set automated reminder channels.
          </p>
        </div>

        {profileSuccess && (
          <div className="badge badge-success p-3 mb-6 block text-center">
            ✓ Central Event Profile updated and synchronized across all planning modules!
          </div>
        )}

        <div className="flex-col gap-8">
          {/* Section 1: Subscription Tier Card */}
          <div className="card glass-panel p-6 bg-gold-tint relative border-gold">
            <h2 className="h4 font-heading text-gold mb-2">License & Membership</h2>
            <p className="body-sm text-secondary mb-4">
              Your planning suite is operating under:
            </p>
            <div className="flex-between mb-4 border-b pb-4 items-center flex-wrap gap-4">
              <div>
                <span className="badge badge-gold badge-lg font-bold">
                  {user.eventPassActive ? '👑 Elysian Event Pass (Unlimited Access)' : '⚡ Complimentary Explorer Tier'}
                </span>
                {!user.eventPassActive && (
                  <p className="text-xs text-muted mt-2 mb-0">Complimentary 20 AI credits. Upgrade for unlimited concierge queries & full export suite.</p>
                )}
              </div>
              {!user.eventPassActive && (
                <button 
                  onClick={handleActivateEventPass}
                  className="btn btn-primary"
                >
                  Activate Event Pass ($99)
                </button>
              )}
            </div>
            <p className="text-xs text-muted mb-0">
              OVAimagination Events recommends the **Event Pass ($99 single payment)** for complete timeline run-sheets and collaborative partner seats.
            </p>
          </div>

          {/* Section 2: Central Event Profile Sync (Step 7) */}
          <div className="card glass-panel p-6">
            <div className="flex-between mb-4 items-center">
              <div>
                <span className="badge badge-gold text-xs">Step 7 Sync</span>
                <h2 className="h4 font-heading text-gold mt-1">Central Event Profile</h2>
              </div>
              <span className="text-xs text-muted">Auto-syncs Dashboard, Budget, & Invitations</span>
            </div>

            <form onSubmit={handleProfileSave} className="flex-col gap-4">
              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Partner 1 Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.partnerA}
                    onChange={(e) => setFormData(prev => ({ ...prev, partnerA: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Partner 2 Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.partnerB}
                    onChange={(e) => setFormData(prev => ({ ...prev, partnerB: e.target.value }))}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Primary Account Email</label>
                  <input 
                    type="email" 
                    disabled
                    value={formData.email}
                    className="form-input text-muted"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Wedding Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.weddingDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, weddingDate: e.target.value }))}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Celebration Destination / City</label>
                  <input 
                    type="text" 
                    required
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmed Venue Name</label>
                  <input 
                    type="text" 
                    value={formData.venueName}
                    onChange={(e) => setFormData(prev => ({ ...prev, venueName: e.target.value }))}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Target Guest Count</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    max="1000"
                    value={formData.guestCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, guestCount: Number(e.target.value) }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Budget Ceiling ($)</label>
                  <input 
                    type="number" 
                    required
                    min="5000"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Aesthetic & Styling Palette</label>
                <select 
                  value={formData.theme}
                  onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                  className="form-select"
                >
                  <option value="Elegant Navy & Champagne Gold">✨ Elegant Navy & Champagne Gold</option>
                  <option value="Modern Minimalist">🌿 Modern Minimalist</option>
                  <option value="Rustic Chic">🪵 Rustic Chic</option>
                  <option value="Coastal Romance">🌊 Coastal Romance</option>
                  <option value="Vintage Glamour">🕯️ Vintage Glamour</option>
                  <option value="Bespoke Contemporary">🎨 Bespoke Contemporary</option>
                </select>
              </div>
              
              <div className="flex justify-end mt-4">
                <button type="submit" className="btn btn-primary">Save Central Event Profile</button>
              </div>
            </form>
          </div>

          {/* Section 3: Collaborators & Reviewers (Step 26) */}
          <div className="card glass-panel p-6">
            <div className="flex-between mb-4 items-center">
              <div>
                <span className="badge badge-gold text-xs">Step 26 Collaboration</span>
                <h2 className="h4 font-heading text-gold mt-1">Partner & Planner Collaborators</h2>
              </div>
            </div>
            <p className="body-sm text-secondary mb-4">
              Invite your partner, wedding planner, or coordinator to manage tasks, review contracts, and approve changes in real-time.
            </p>

            {inviteSuccess && (
              <div className="badge badge-success p-3 mb-4 block text-center">
                ✓ Invitation sent! Collaborator has been granted workspace permissions.
              </div>
            )}

            <div className="collaborators-list flex-col gap-3 mb-6">
              {collaborators.map((c, idx) => (
                <div key={idx} className="flex-between p-3 bg-secondary rounded-lg border border-divider items-center">
                  <div className="flex-start items-center gap-3">
                    <span style={{ fontSize: '1.4rem' }}>{c.role === 'Partner' ? '💍' : c.role === 'Planner' ? '📋' : '👤'}</span>
                    <div>
                      <span className="body-sm font-bold text-primary block">{c.name}</span>
                      <span className="text-xs text-muted">{c.email} &bull; Role: <strong>{c.role}</strong></span>
                    </div>
                  </div>
                  <span className="badge badge-gold text-xs">{c.status || 'Active'}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleInviteCollaborator} className="bg-secondary p-4 rounded-lg border border-divider">
              <h4 className="overline mb-3">Invite New Collaborator</h4>
              <div className="grid grid-3 gap-3">
                <input 
                  type="text" 
                  required
                  placeholder="Collaborator Name"
                  value={collaboratorForm.name}
                  onChange={(e) => setCollaboratorForm(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                />
                <input 
                  type="email" 
                  required
                  placeholder="collaborator@example.com"
                  value={collaboratorForm.email}
                  onChange={(e) => setCollaboratorForm(prev => ({ ...prev, email: e.target.value }))}
                  className="form-input"
                />
                <select 
                  value={collaboratorForm.role}
                  onChange={(e) => setCollaboratorForm(prev => ({ ...prev, role: e.target.value }))}
                  className="form-select"
                >
                  <option value="Partner">Partner (Full Access)</option>
                  <option value="Planner">Planner / Coordinator</option>
                  <option value="Collaborator">Family Collaborator</option>
                  <option value="Viewer">Viewer (Read-Only)</option>
                </select>
              </div>
              <div className="flex justify-end mt-3">
                <button type="submit" className="btn btn-secondary btn-sm">
                  ＋ Send Invitation
                </button>
              </div>
            </form>
          </div>

          {/* Section 4: Controlled Automated Reminders (Step 27) */}
          <div className="card glass-panel p-6">
            <h2 className="h4 font-heading text-gold mb-2">Automated Notifications & Reminders</h2>
            <p className="body-sm text-secondary mb-4">
              Configure cadence and quiet hours to prevent notification fatigue.
            </p>

            <div className="flex-col gap-3">
              <label className="flex-start items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={reminderPrefs.emailDigest} 
                  onChange={(e) => setReminderPrefs(prev => ({ ...prev, emailDigest: e.target.checked }))}
                  className="task-checkbox"
                />
                <div>
                  <span className="body-sm font-bold text-primary block">Weekly Planning Summary Digest</span>
                  <span className="text-xs text-muted">Sent every Monday morning with weekly milestones.</span>
                </div>
              </label>

              <label className="flex-start items-center gap-3 cursor-pointer mt-2">
                <input 
                  type="checkbox" 
                  checked={reminderPrefs.upcomingTaskAlerts} 
                  onChange={(e) => setReminderPrefs(prev => ({ ...prev, upcomingTaskAlerts: e.target.checked }))}
                  className="task-checkbox"
                />
                <div>
                  <span className="body-sm font-bold text-primary block">Upcoming Task Due-Date Reminders</span>
                  <span className="text-xs text-muted">Alerts sent 3 days before task milestone target.</span>
                </div>
              </label>

              <label className="flex-start items-center gap-3 cursor-pointer mt-2">
                <input 
                  type="checkbox" 
                  checked={reminderPrefs.quietHours} 
                  onChange={(e) => setReminderPrefs(prev => ({ ...prev, quietHours: e.target.checked }))}
                  className="task-checkbox"
                />
                <div>
                  <span className="body-sm font-bold text-primary block">Enforce Quiet Hours (9:00 PM – 8:00 AM)</span>
                  <span className="text-xs text-muted">All non-critical push notifications held until morning.</span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 5: Reset Workspace Database */}
          <div className="card glass-panel p-6 border-danger">
            <h2 className="h4 font-heading text-danger mb-2">Workspace Controls</h2>
            <p className="body-sm text-secondary mb-4">
              Reset all customized checklist tasks, budgets, vendor records, and guest lists back to default sample state.
            </p>
            <div className="flex-between items-center bg-danger-tint p-4 rounded-lg border border-danger-tint">
              <div>
                <span className="body-sm font-bold text-primary block">Reset Wedding Workspace</span>
                <span className="text-xs text-muted">Clear all local storage entries and restart onboarding.</span>
              </div>
              <button 
                onClick={handleReset}
                className="btn btn-danger"
              >
                Reset Workspace
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
        .max-w-4xl {
          max-width: 56rem;
          margin: 0 auto;
        }
        .border-gold {
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }
        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }
        @media (max-width: 768px) {
          .grid-2, .grid-3 {
            grid-template-columns: 1fr;
          }
        }
        .border-b {
          border-bottom: 1px solid rgba(212, 175, 55, 0.1);
        }
        .border-divider {
          border-color: rgba(212, 175, 55, 0.15);
        }
        .bg-secondary {
          background: rgba(10, 25, 47, 0.6);
        }
        .pb-4 {
          padding-bottom: 16px;
        }
        .border-danger {
          border-color: #EF4444;
        }
        .bg-danger-tint {
          background: rgba(239, 68, 68, 0.05);
        }
        .border-danger-tint {
          border-color: rgba(239, 68, 68, 0.15);
        }
        .bg-gold-tint {
          background: radial-gradient(circle at 10% 10%, rgba(212, 175, 55, 0.12) 0%, transparent 60%);
        }
        .task-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #D4AF37;
          cursor: pointer;
        }
        .mb-0 { margin-bottom: 0; }
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-6 { margin-bottom: 24px; }
        .mb-8 { margin-bottom: 32px; }
        .mt-1 { margin-top: 4px; }
        .mt-2 { margin-top: 8px; }
        .mt-3 { margin-top: 12px; }
        .mt-4 { margin-top: 16px; }
        .py-8 { padding-top: 32px; padding-bottom: 32px; }
        .p-3 { padding: 12px; }
        .p-4 { padding: 16px; }
        .p-6 { padding: 24px; }
        .flex-col { display: flex; flex-direction: column; }
        .flex-between { display: flex; align-items: center; justify-content: space-between; }
        .flex-start { display: flex; align-items: center; justify-content: flex-start; }
        .gap-3 { gap: 12px; }
        .gap-4 { gap: 16px; }
        .gap-8 { gap: 32px; }
        .font-bold { font-weight: 700; }
        .block { display: block; }
      `}</style>
    </main>
  );
}
