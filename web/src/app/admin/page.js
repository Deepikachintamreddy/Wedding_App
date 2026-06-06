'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeddingStore } from '@/lib/store';

const INITIAL_PENDING_VENDORS = [
  { id: 'pv1', name: 'Velvet & Lace Florals', contact: 'Julianne Cox', category: 'Florals', location: 'Seattle, WA', email: 'hello@velvetlace.com' },
  { id: 'pv2', name: 'Coastal Catering Co.', contact: 'David Fisher', category: 'Catering', location: 'San Diego, CA', email: 'info@coastalcatering.com' },
  { id: 'pv3', name: 'Epic Beats Entertainment', contact: 'DJ Spark', category: 'Music', location: 'Los Angeles, CA', email: 'bookings@epicbeats.com' },
];

const INITIAL_COUPLES = [
  { id: 'c1', name: 'Sarah & David', budget: '$50,000', location: 'Malibu, CA', plan: 'Event Pass', joinDate: '2026-05-20' },
  { id: 'c2', name: 'Emma & John', budget: '$35,000', location: 'Pasadena, CA', plan: 'Monthly', joinDate: '2026-05-22' },
  { id: 'c3', name: 'Sophia & Liam', budget: '$75,000', location: 'Santa Monica, CA', plan: 'Free Tier', joinDate: '2026-05-25' },
];

const INITIAL_REQUESTS = [
  { id: 'req1', coupleName: 'Sarah & David', requestType: 'Coordination Assistance', message: 'Looking for a day-of coordinator recommendation from OVAimagination Events.', date: '2026-05-26' },
  { id: 'req2', coupleName: 'Emma & John', requestType: 'Venue Matching', message: 'Need help finding an ocean view venue that allows external catering.', date: '2026-05-26' },
];

export default function AdminPage() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, loading } = store;

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
      <div className="flex-center" style={{ minHeight: '100vh', background: '#0d0d1a' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(201, 169, 110, 0.15)', borderTopColor: '#c9a96e', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style jsx>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .flex-center { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #0d0d1a; }
        `}</style>
      </div>
    );
  }

  const handleApproveVendor = (id, name) => {
    setPendingVendors(prev => prev.filter(v => v.id !== id));
    alert(`Vendor "${name}" approved successfully! They have been added to the public directory.`);
  };

  const handleRejectVendor = (id, name) => {
    if (confirm(`Are you sure you want to reject vendor "${name}" application?`)) {
      setPendingVendors(prev => prev.filter(v => v.id !== id));
    }
  };

  const handleResolveRequest = (id) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    alert('Request marked as resolved and planner contacted.');
  };

  return (
    <main className="admin-layout">
      <div className="navbar-spacer"></div>

      <div className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="admin-header mb-8">
          <span className="badge badge-gold mb-2">SYSTEM CONSOLE</span>
          <h1 className="h2 font-heading text-gold mb-1">Elysian Admin Panel</h1>
          <p className="body-sm text-secondary">
            Oversee registrations, manage coordinator upgrades, and approve vendor listings.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid mb-8">
          <div className="card glass-panel p-5 text-center flex-col justify-center">
            <span className="overline text-muted mb-1">Total Active Couples</span>
            <span className="stat-number text-gold font-heading">{couples.length + 42}</span>
          </div>
          <div className="card glass-panel p-5 text-center flex-col justify-center">
            <span className="overline text-muted mb-1">Subscribed / Event Pass</span>
            <span className="stat-number text-success font-heading">24 <span className="text-xs text-secondary font-body">users</span></span>
          </div>
          <div className="card glass-panel p-5 text-center flex-col justify-center">
            <span className="overline text-muted mb-1">Active Vetted Vendors</span>
            <span className="stat-number text-gold font-heading">154</span>
          </div>
          <div className="card glass-panel p-5 text-center flex-col justify-center">
            <span className="overline text-muted mb-1">Estimated MRR</span>
            <span className="stat-number text-gold font-heading">$2,480</span>
          </div>
        </div>

        {/* Dynamic Queue Sections */}
        <div className="admin-queues-grid">
          {/* Section 1: Vendor Approvals */}
          <div className="flex-col gap-4">
            <h2 className="h4 font-heading text-gold mb-2">Pending Vendor Directory Approvals ({pendingVendors.length})</h2>
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
                        ✓ Approve
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
                  <p className="body-sm text-secondary mt-2">Vendor queue is empty. Good job!</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Planner/Coordinator Requests */}
          <div className="flex-col gap-4">
            <h2 className="h4 font-heading text-gold mb-2">Elysian Planner Matching Requests ({requests.length})</h2>
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
                      Mark Resolved
                    </button>
                  </div>
                ))
              ) : (
                <div className="card glass-panel p-8 text-center">
                  <span style={{ fontSize: '2rem' }}>💌</span>
                  <p className="body-sm text-secondary mt-2">No pending planner match requests right now.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Registered Couples List */}
        <div className="couples-management-section mt-8">
          <h2 className="h4 font-heading text-gold mb-4">Active Couples Database</h2>
          <div className="card glass-panel overflow-x-auto">
            <table className="admin-table w-full">
              <thead>
                <tr className="border-b">
                  <th>Couple Name</th>
                  <th>Join Date</th>
                  <th>Location</th>
                  <th>Declared Budget</th>
                  <th>Plan Tier</th>
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
                      <span className={`badge ${c.plan === 'Event Pass' ? 'badge-success' : c.plan === 'Monthly' ? 'badge-gold' : 'badge-secondary'}`}>
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
          font-size: 2rem;
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
          background: rgba(26, 26, 46, 0.6);
        }
        .border-b {
          border-bottom: 1px solid rgba(201, 169, 110, 0.08);
        }
        .admin-table {
          border-collapse: collapse;
          text-align: left;
        }
        .admin-table th {
          padding: 16px;
          font-size: 0.85rem;
          color: #a0937d;
          font-weight: 600;
          text-transform: uppercase;
        }
        .admin-table td {
          padding: 16px;
          font-size: 0.9rem;
        }
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-8 { margin-bottom: 32px; }
        .mt-2 { margin-top: 8px; }
        .py-8 { padding-top: 32px; padding-bottom: 32px; }
        .p-5 { padding: 20px; }
        .p-3 { padding: 12px; }
        .flex-col { display: flex; flex-direction: column; }
        .flex-between { display: flex; align-items: center; justify-content: space-between; }
        .flex-start { display: flex; align-items: center; justify-content: flex-start; }
        .gap-2 { gap: 8px; }
        .gap-4 { gap: 16px; }
        .font-bold { font-weight: 700; }
        .w-full { width: 100%; }
        .flex-shrink-0 { flex-shrink: 0; }
      `}</style>
    </main>
  );
}
