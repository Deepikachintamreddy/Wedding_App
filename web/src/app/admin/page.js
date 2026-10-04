'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeddingStore } from '@/lib/store';
import Monogram from '@/components/Monogram';

const INITIAL_PENDING_VENDORS = [
  { id: 'pv1', name: 'Velvet & Lace Couture Florals', contact: 'Julianne Cox', category: 'Florals', location: 'Malibu, CA', email: 'hello@velvetlace.example.com' },
  { id: 'pv2', name: 'Coastal Michelin Catering', contact: 'David Fisher', category: 'Catering', location: 'Santa Barbara, CA', email: 'info@coastalcatering.example.com' },
  { id: 'pv3', name: 'Symphony Strings Ensemble', contact: 'Maestro Evans', category: 'Music', location: 'Los Angeles, CA', email: 'bookings@symphonystrings.example.com' },
];

const INITIAL_COUPLES = [
  { id: 'c1', name: 'Eleanor Vance & Liam Thorne', budget: '$65,000', location: 'Malibu, CA', plan: 'Event Pass', joinDate: '2026-05-20' },
  { id: 'c2', name: 'Sophia Chen & Julian Rossi', budget: '$45,000', location: 'Lake Como, IT', plan: 'Concierge Plus', joinDate: '2026-05-22' },
  { id: 'c3', name: 'Aria Winters & Marcus Sterling', budget: '$85,000', location: 'Beverly Hills, CA', plan: 'Free Explorer', joinDate: '2026-05-25' },
];

const INITIAL_REQUESTS = [
  { id: 'req1', coupleName: 'Eleanor Vance & Liam Thorne', requestType: 'Concierge Coordination', message: 'Looking for a dedicated day-of lead planner from OVAimagination Events.', date: '2026-05-26' },
  { id: 'req2', coupleName: 'Sophia Chen & Julian Rossi', requestType: 'Bespoke Venue Sourcing', message: 'Seeking cliffside estates with private helicopter landing permissions.', date: '2026-05-26' },
];

export default function AdminPage() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, auditLog, loading } = store;

  const [pendingVendors, setPendingVendors] = useState(INITIAL_PENDING_VENDORS);
  const [couples, setCouples] = useState(INITIAL_COUPLES);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
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

  const handleApproveVendor = (id, name) => {
    setPendingVendors(prev => prev.filter(v => v.id !== id));
    alert(`Vendor "${name}" approved successfully! They are now verified in the Elysian Concierge directory.`);
  };

  const handleRejectVendor = (id, name) => {
    if (confirm(`Are you sure you want to reject vendor application for "${name}"?`)) {
      setPendingVendors(prev => prev.filter(v => v.id !== id));
    }
  };

  const handleResolveRequest = (id) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    alert('Concierge matching request resolved. Assigned to OVAimagination Events senior team.');
  };

  return (
    <main className="admin-layout">
      <div className="navbar-spacer"></div>

      <div className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="admin-header mb-8">
          <div className="flex-start items-center gap-3 mb-2">
            <Monogram size={32} variant="gold" />
            <span className="badge badge-gold">INTERNAL CONSOLE &bull; INVITATION-ONLY</span>
          </div>
          <h1 className="h2 font-heading text-gold mb-1">Elysian Concierge Administrator Suite</h1>
          <p className="body-sm text-secondary">
            System auditing, vendor vetting queue, concierge matching requests, and customer workspace overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid mb-8">
          <div className="card glass-panel p-5 text-center flex-col justify-center">
            <span className="overline text-muted mb-1">Active Planning Workspaces</span>
            <span className="stat-number text-gold font-heading">{couples.length + 58}</span>
          </div>
          <div className="card glass-panel p-5 text-center flex-col justify-center">
            <span className="overline text-muted mb-1">Event Pass Holders</span>
            <span className="stat-number text-success font-heading">41 <span className="text-xs text-secondary font-body">couples</span></span>
          </div>
          <div className="card glass-panel p-5 text-center flex-col justify-center">
            <span className="overline text-muted mb-1">Verified Vendor Network</span>
            <span className="stat-number text-gold font-heading">184</span>
          </div>
          <div className="card glass-panel p-5 text-center flex-col justify-center">
            <span className="overline text-muted mb-1">Planning Partner</span>
            <span className="stat-number text-gold font-heading" style={{ fontSize: '1.2rem' }}>OVAimagination</span>
          </div>
        </div>

        {/* Dynamic Queue Sections */}
        <div className="admin-queues-grid mb-8">
          {/* Section 1: Vendor Approvals */}
          <div className="flex-col gap-4">
            <h2 className="h4 font-heading text-gold mb-2">Vendor Verification Queue ({pendingVendors.length})</h2>
            <div className="pending-vendors-list flex-col gap-4">
              {pendingVendors.length > 0 ? (
                pendingVendors.map(vendor => (
                  <div key={vendor.id} className="card glass-panel p-5 flex-between items-center">
                    <div className="flex-col flex-1">
                      <div className="flex-start items-center gap-2 mb-1">
                        <span className="badge badge-gold badge-sm">{vendor.category}</span>
                        <span className="text-xs text-muted">📍 {vendor.location}</span>
                      </div>
                      <h3 className="body-sm font-bold text-primary mb-1">{vendor.name}</h3>
                      <p className="text-xs text-muted mb-0">Contact: {vendor.contact} ({vendor.email})</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApproveVendor(vendor.id, vendor.name)}
                        className="btn btn-primary btn-sm"
                      >
                        ✓ Verify
                      </button>
                      <button 
                        onClick={() => handleRejectVendor(vendor.id, vendor.name)}
                        className="btn btn-secondary btn-sm text-danger"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card glass-panel p-8 text-center">
                  <span style={{ fontSize: '2rem' }}>🎉</span>
                  <p className="body-sm text-secondary mt-2">All vendor verification applications cleared!</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Concierge Matching Requests */}
          <div className="flex-col gap-4">
            <h2 className="h4 font-heading text-gold mb-2">Concierge Match Requests ({requests.length})</h2>
            <div className="planner-requests-list flex-col gap-4">
              {requests.length > 0 ? (
                requests.map(req => (
                  <div key={req.id} className="card glass-panel p-5 flex-between items-start gap-4">
                    <div className="flex-col flex-1">
                      <div className="flex-between items-center mb-2">
                        <span className="body-sm font-bold text-gold">{req.coupleName}</span>
                        <span className="text-xs text-muted">{req.date}</span>
                      </div>
                      <span className="badge badge-secondary badge-sm mb-2">{req.requestType}</span>
                      <p className="text-xs text-secondary italic mb-0 bg-secondary p-3 rounded-md">
                        💬 "{req.message}"
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => handleResolveRequest(req.id)}
                      className="btn btn-outline btn-sm flex-shrink-0"
                    >
                      Mark Assigned
                    </button>
                  </div>
                ))
              ) : (
                <div className="card glass-panel p-8 text-center">
                  <span style={{ fontSize: '2rem' }}>💌</span>
                  <p className="body-sm text-secondary mt-2">No pending concierge requests.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: System Audit Log Viewer (Step 4 Security) */}
        <div className="audit-log-section mb-8">
          <div className="flex-between items-center mb-4">
            <h2 className="h4 font-heading text-gold mb-0">System Audit & Access Log</h2>
            <span className="badge badge-secondary text-xs">Immutable Ledger</span>
          </div>
          <div className="card glass-panel overflow-x-auto">
            <table className="admin-table w-full">
              <thead>
                <tr className="border-b">
                  <th>Timestamp</th>
                  <th>Action Event</th>
                  <th>Actor / User</th>
                  <th>Module</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(auditLog || []).slice(0, 10).map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="text-xs text-muted font-mono">{log.timestamp}</td>
                    <td className="font-bold text-primary text-xs">{log.action}</td>
                    <td className="text-xs text-secondary">{log.actor}</td>
                    <td><span className="badge badge-secondary text-xs">{log.module}</span></td>
                    <td><span className="badge badge-success text-xs">{log.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Registered Couples Database */}
        <div className="couples-management-section">
          <h2 className="h4 font-heading text-gold mb-4">Couples Workspace Directory</h2>
          <div className="card glass-panel overflow-x-auto">
            <table className="admin-table w-full">
              <thead>
                <tr className="border-b">
                  <th>Couple Names</th>
                  <th>Onboarding Date</th>
                  <th>Location</th>
                  <th>Target Budget</th>
                  <th>Licensing Tier</th>
                </tr>
              </thead>
              <tbody>
                {couples.map(c => (
                  <tr key={c.id} className="border-b">
                    <td className="font-bold text-primary">{c.name}</td>
                    <td className="text-secondary">{c.joinDate}</td>
                    <td className="text-secondary">{c.location}</td>
                    <td className="text-gold font-bold">{c.budget}</td>
                    <td>
                      <span className={`badge ${c.plan === 'Event Pass' || c.plan === 'Concierge Plus' ? 'badge-success' : 'badge-secondary'}`}>
                        {c.plan}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-layout {
          background: transparent;
          color: #f5f0e8;
          min-height: 100vh;
        }
        .navbar-spacer {
          height: 80px;
        }
        .max-w-6xl {
          max-width: 76rem;
          margin: 0 auto;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
        .stat-number {
          font-size: 1.8rem;
          display: block;
        }
        .admin-queues-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
        }
        @media (max-width: 900px) {
          .admin-queues-grid {
            grid-template-columns: 1fr;
          }
        }
        .bg-secondary {
          background: rgba(10, 25, 47, 0.6);
        }
        .border-b {
          border-bottom: 1px solid rgba(212, 175, 55, 0.1);
        }
        .admin-table {
          border-collapse: collapse;
          text-align: left;
        }
        .admin-table th {
          padding: 14px 16px;
          font-size: 0.8rem;
          color: #D4AF37;
          font-weight: 600;
          text-transform: uppercase;
        }
        .admin-table td {
          padding: 14px 16px;
          font-size: 0.85rem;
        }
        .mb-0 { margin-bottom: 0; }
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-8 { margin-bottom: 32px; }
        .py-8 { padding-top: 32px; padding-bottom: 32px; }
        .p-5 { padding: 20px; }
        .p-3 { padding: 12px; }
        .flex-col { display: flex; flex-direction: column; }
        .flex-between { display: flex; align-items: center; justify-content: space-between; }
        .flex-start { display: flex; align-items: center; justify-content: flex-start; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .gap-4 { gap: 16px; }
        .font-bold { font-weight: 700; }
        .w-full { width: 100%; }
        .flex-shrink-0 { flex-shrink: 0; }
      `}</style>
    </main>
  );
}
