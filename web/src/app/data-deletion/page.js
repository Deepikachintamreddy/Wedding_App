'use client';

import { useState } from 'react';
import { useWeddingStore } from '@/lib/store';

export default function DataDeletionPage() {
  const store = useWeddingStore();
  const { user, tasks, budget, guests, vendors, timeline, resetStore } = store;
  const [deleted, setDeleted] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');

  const handleExportData = () => {
    const exportPayload = {
      userProfile: user,
      tasks,
      budget,
      guests,
      vendors,
      timeline,
      exportedAt: new Date().toISOString(),
      platform: 'Elysian Concierge',
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `elysian_wedding_data_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDeleteAccount = (e) => {
    e.preventDefault();
    if (confirmEmail.trim().toLowerCase() !== (user?.email || '').toLowerCase()) {
      alert('Email does not match your active account email. Please re-enter to confirm.');
      return;
    }

    if (confirm('🚨 Irreversible Action: Are you absolutely sure you want to permanently delete your Elysian Concierge workspace and all associated guest, budget, and task records?')) {
      resetStore();
      setDeleted(true);
    }
  };

  return (
    <main className="deletion-page-layout">
      <div className="navbar-spacer"></div>
      <div className="container py-12 max-w-3xl">
        <div className="deletion-header mb-8">
          <span className="badge badge-gold mb-2">DATA SOVEREIGNTY</span>
          <h1 className="h2 font-heading text-gold mb-2">Data Export & Account Deletion</h1>
          <p className="body-sm text-secondary">
            You maintain full ownership of your wedding data. Export complete JSON/CSV records or permanently erase your workspace.
          </p>
        </div>

        <div className="flex-col gap-8">
          {/* Export Card */}
          <div className="card glass-panel p-6">
            <h2 className="h4 font-heading text-gold mb-2">📦 Export Complete Planning Data</h2>
            <p className="body-sm text-secondary mb-4">
              Download an archive of all your guest lists, budget payments, checklist progress, vendor contacts, and day-of schedules in standard JSON format.
            </p>
            <button onClick={handleExportData} className="btn btn-secondary">
              Download Data Archive (.JSON)
            </button>
          </div>

          {/* Permanent Deletion Card */}
          <div className="card glass-panel p-6 border-danger">
            <h2 className="h4 font-heading text-danger mb-2">🗑️ Permanent Account & Data Deletion</h2>
            <p className="body-sm text-secondary mb-4">
              Deleting your account permanently erases all personal event workspaces, invitations, and financial transaction histories from our servers. This action cannot be reversed.
            </p>

            {deleted ? (
              <div className="p-4 bg-success-tint rounded-lg border border-success">
                <span className="text-success font-bold block mb-1">Account & Workspace Erased</span>
                <span className="body-sm text-secondary">All local storage tokens and workspace records have been purged. You may now close this window or return to the home page.</span>
              </div>
            ) : (
              <form onSubmit={handleDeleteAccount} className="flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Type your account email (<strong>{user?.email || 'your email'}</strong>) to confirm deletion:</label>
                  <input 
                    type="email" 
                    required 
                    value={confirmEmail} 
                    onChange={e => setConfirmEmail(e.target.value)} 
                    className="form-input" 
                    placeholder="Enter email to confirm"
                  />
                </div>
                <button type="submit" className="btn btn-danger">
                  Permanently Delete My Workspace
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .deletion-page-layout { background: transparent; color: #f5f0e8; min-height: 100vh; }
        .navbar-spacer { height: 80px; }
        .max-w-3xl { max-width: 48rem; margin: 0 auto; }
        .py-12 { padding-top: 48px; padding-bottom: 48px; }
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-8 { margin-bottom: 32px; }
        .p-6 { padding: 24px; }
        .p-4 { padding: 16px; }
        .flex-col { display: flex; flex-direction: column; }
        .gap-4 { gap: 16px; }
        .gap-8 { gap: 32px; }
        .border-danger { border-color: #ef4444; }
        .bg-success-tint { background: rgba(74, 222, 128, 0.08); }
        .border-success { border-color: #4ade80; }
      `}</style>
    </main>
  );
}
