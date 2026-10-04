'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWeddingStore } from '@/lib/store';
import { capitalize } from '@/lib/utils';

export default function GuestListPage() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, eventProfile, guests, loading, addGuest, updateGuest, deleteGuest } = store;

  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvRawText, setCsvRawText] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: '',
    group: "Partner A's Family",
    status: 'Pending',
    meal: 'Pending',
    table: 0,
    plusOnes: 0,
    notes: '',
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

  // Calculate statistics
  const totalCount = guests.length;
  const attendingCount = guests.filter(g => g.status === 'Attending').length;
  const pendingCount = guests.filter(g => g.status === 'Pending').length;
  const declinedCount = guests.filter(g => g.status === 'Declined').length;
  const totalPlusOnes = guests.filter(g => g.status === 'Attending').reduce((sum, g) => sum + (g.plusOnes || 0), 0);
  const totalSeats = attendingCount + totalPlusOnes;

  // Filter logic
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (guest.email && guest.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGroup = groupFilter === 'all' || guest.group === groupFilter;
    const matchesStatus = statusFilter === 'all' || guest.status === statusFilter;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  const handleStatusChange = (id, newStatus) => {
    const meal = newStatus === 'Declined' ? 'Declined' : (newStatus === 'Pending' ? 'Pending' : 'Prime Filet Mignon');
    updateGuest(id, { 
      status: newStatus, 
      rsvpReceived: newStatus !== 'Pending',
      meal
    });
  };

  const handleMealChange = (id, mealVal) => {
    updateGuest(id, { meal: mealVal });
  };

  const handleTableChange = (id, tableVal) => {
    updateGuest(id, { table: Number(tableVal) });
  };

  const handleGuestSubmit = (e) => {
    e.preventDefault();
    if (!newGuest.name) return;

    addGuest(newGuest);
    setNewGuest({
      name: '',
      email: '',
      phone: '',
      group: "Partner A's Family",
      status: 'Pending',
      meal: 'Pending',
      table: 0,
      plusOnes: 0,
      notes: '',
    });
    setModalOpen(false);
  };

  const handleBatchCsvSubmit = (e) => {
    e.preventDefault();
    if (!csvRawText.trim()) return;

    const lines = csvRawText.trim().split('\n');
    let importedCount = 0;

    lines.forEach((line) => {
      const parts = line.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 1 && parts[0] && parts[0].toLowerCase() !== 'name') {
        const name = parts[0];
        const group = parts[1] || 'Friends';
        const email = parts[2] || '';
        const plusOnes = parseInt(parts[3], 10) || 0;

        addGuest({
          name,
          group,
          email,
          phone: '',
          status: 'Pending',
          meal: 'Pending',
          table: 0,
          plusOnes,
          notes: 'Imported via CSV batch',
        });
        importedCount++;
      }
    });

    setCsvRawText('');
    setCsvModalOpen(false);
    alert(`Successfully imported ${importedCount} guests into your Elysian workspace!`);
  };

  const handleDeleteGuest = (id, name) => {
    if (confirm(`Are you sure you want to remove ${name} from your guest list?`)) {
      deleteGuest(id);
    }
  };

  const handleCopyRsvpLink = (guestId) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const rsvpUrl = `${origin}/rsvp/${guestId}`;
    navigator.clipboard.writeText(rsvpUrl);
    setCopiedId(guestId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleExport = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Name,Group,Email,Phone,RSVP Status,Meal Preference,Table Number,Plus Ones,Notes\n';
    guests.forEach(g => {
      csvContent += `"${g.name}","${g.group}","${g.email || ''}","${g.phone || ''}","${g.status}","${g.meal}",${g.table || 0},${g.plusOnes || 0},"${g.notes || ''}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'elysian_wedding_guest_list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="guest-layout">
      <div className="navbar-spacer"></div>

      <div className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="flex-between mb-6 flex-wrap gap-4">
          <div>
            <div className="flex-start items-center gap-2 mb-1">
              <span className="badge badge-gold">Elysian RSVP Suite</span>
              <span className="badge badge-secondary">{eventProfile?.coupleNames || user.name}</span>
            </div>
            <h1 className="h2 font-heading text-gold mb-1">Guest List & RSVPs</h1>
            <p className="body-sm text-secondary">
              Real-time attendance tracking, dietary requirements, and digital RSVP link generation.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button 
              onClick={() => setCsvModalOpen(true)}
              className="btn btn-secondary animate-hover"
            >
              📥 Import CSV
            </button>
            <button 
              onClick={handleExport}
              className="btn btn-secondary animate-hover"
            >
              📤 Export CSV
            </button>
            <button 
              onClick={() => setModalOpen(true)}
              className="btn btn-primary"
            >
              ＋ Add Guest
            </button>
          </div>
        </div>

        {/* RSVP Stats Tiles */}
        <div className="stats-grid mb-8">
          <div className="card glass-panel p-5 text-center flex-col justify-center">
            <span className="overline text-muted mb-1">Total Invited</span>
            <span className="stat-number text-gold font-heading">{totalCount} <span className="text-xs font-body text-secondary">guests</span></span>
          </div>
          <div className="card glass-panel p-5 text-center flex-col justify-center">
            <span className="overline text-muted mb-1">Confirmed Attending</span>
            <span className="stat-number text-success font-heading">{attendingCount} <span className="text-xs font-body text-secondary">+{totalPlusOnes} plus-ones</span></span>
          </div>
          <div className="card glass-panel p-5 text-center flex-col justify-center">
            <span className="overline text-muted mb-1">Total Plated Seats</span>
            <span className="stat-number text-gold font-heading">{totalSeats} <span className="text-xs font-body text-secondary">seats</span></span>
          </div>
          <div className="card glass-panel p-5 text-center flex-col justify-center">
            <span className="overline text-muted mb-1">Pending Responses</span>
            <span className="stat-number text-warning font-heading">{pendingCount} <span className="text-xs font-body text-secondary">waiting</span></span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="card glass-panel p-4 mb-6 flex-between gap-4 flex-wrap">
          <input 
            type="text"
            placeholder="🔍 Search guests by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input flex-1"
            aria-label="Search guests"
          />
          <div className="flex gap-3 flex-wrap">
            <select 
              value={groupFilter} 
              onChange={(e) => setGroupFilter(e.target.value)}
              className="form-select flex-shrink-0"
              style={{ width: '180px' }}
              aria-label="Filter by guest group"
            >
              <option value="all">📁 All Groups</option>
              <option value="Partner A's Family">Partner A's Family</option>
              <option value="Partner B's Family">Partner B's Family</option>
              <option value="Wedding Party">Wedding Party</option>
              <option value="Mutual Friends">Mutual Friends</option>
              <option value="Colleagues">Colleagues</option>
            </select>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select flex-shrink-0"
              style={{ width: '180px' }}
              aria-label="Filter by RSVP status"
            >
              <option value="all">🗳️ All RSVPs</option>
              <option value="Attending">✓ Attending</option>
              <option value="Pending">⏰ Pending</option>
              <option value="Declined">× Declined</option>
            </select>
          </div>
        </div>

        {/* Guest Table */}
        <div className="card glass-panel overflow-x-auto">
          <table className="guest-table w-full">
            <thead>
              <tr className="border-b">
                <th>Guest Name</th>
                <th>Group</th>
                <th>RSVP Status</th>
                <th>Meal Selection</th>
                <th>Table</th>
                <th>Plus-ones</th>
                <th>Direct RSVP Link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.length > 0 ? (
                filteredGuests.map(guest => (
                  <tr key={guest.id} className="table-row-item border-b">
                    <td className="font-bold text-primary">
                      {guest.name}
                      <span className="text-xs text-muted block font-normal">{guest.email || 'No email provided'}</span>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{guest.group}</span>
                    </td>
                    <td>
                      <select 
                        value={guest.status} 
                        onChange={(e) => handleStatusChange(guest.id, e.target.value)}
                        className={`inline-select font-bold ${
                          guest.status === 'Attending' ? 'select-success' : 
                          guest.status === 'Pending' ? 'select-warning' : 'select-danger'
                        }`}
                        aria-label={`RSVP Status for ${guest.name}`}
                      >
                        <option value="Attending">✓ Attending</option>
                        <option value="Pending">⏰ Pending</option>
                        <option value="Declined">× Declined</option>
                      </select>
                    </td>
                    <td>
                      {guest.status === 'Attending' ? (
                        <select 
                          value={guest.meal} 
                          onChange={(e) => handleMealChange(guest.id, e.target.value)}
                          className="inline-select"
                          aria-label={`Meal choice for ${guest.name}`}
                        >
                          <option value="Prime Filet Mignon">🥩 Prime Filet Mignon</option>
                          <option value="Herb-Crusted Sea Bass">🐟 Herb-Crusted Sea Bass</option>
                          <option value="Truffle Wild Mushroom Risotto">🥗 Truffle Risotto (V)</option>
                          <option value="Child Plate">👶 Child Portion</option>
                          <option value="Pending">Pending Selection</option>
                        </select>
                      ) : (
                        <span className="text-xs text-muted italic">—</span>
                      )}
                    </td>
                    <td>
                      {guest.status === 'Attending' ? (
                        <input 
                          type="number" 
                          min="0"
                          max="50"
                          value={guest.table || 0} 
                          onChange={(e) => handleTableChange(guest.id, e.target.value)}
                          className="table-number-input"
                          aria-label={`Table assignment for ${guest.name}`}
                        />
                      ) : (
                        <span className="text-xs text-muted italic">—</span>
                      )}
                    </td>
                    <td>
                      {guest.status === 'Attending' ? (
                        <div className="flex-start items-center gap-1">
                          <button 
                            onClick={() => updateGuest(guest.id, { plusOnes: Math.max(0, (guest.plusOnes || 0) - 1) })}
                            className="plus-minus-btn"
                            aria-label={`Decrease plus ones for ${guest.name}`}
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-sm font-bold">{guest.plusOnes || 0}</span>
                          <button 
                            onClick={() => updateGuest(guest.id, { plusOnes: (guest.plusOnes || 0) + 1 })}
                            className="plus-minus-btn"
                            aria-label={`Increase plus ones for ${guest.name}`}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted italic">—</span>
                      )}
                    </td>
                    <td>
                      <button 
                        onClick={() => handleCopyRsvpLink(guest.id)}
                        className={`btn btn-sm ${copiedId === guest.id ? 'btn-success' : 'btn-outline'}`}
                        aria-label={`Copy personal RSVP link for ${guest.name}`}
                        title="Copy direct guest link"
                      >
                        {copiedId === guest.id ? '✓ Copied' : '🔗 Copy Link'}
                      </button>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleDeleteGuest(guest.id, guest.name)}
                        className="btn btn-ghost btn-sm text-danger"
                        aria-label={`Delete ${guest.name}`}
                        title={`Delete ${guest.name}`}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <span style={{ fontSize: '2rem' }}>👥</span>
                    <p className="body-sm text-secondary mt-2">No guests found matching search filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Single Guest Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-gold font-heading">Add Guest to Suite</h3>
              <button onClick={() => setModalOpen(false)} className="modal-close" aria-label="Close modal">×</button>
            </div>
            <form onSubmit={handleGuestSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Lord Eleanor Johnson"
                    value={newGuest.name}
                    onChange={(e) => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="grid grid-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. eleanor@example.com"
                      value={newGuest.email}
                      onChange={(e) => setNewGuest(prev => ({ ...prev, email: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="text" 
                      placeholder="(555) 012-3456"
                      value={newGuest.phone}
                      onChange={(e) => setNewGuest(prev => ({ ...prev, phone: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="grid grid-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Relation Group</label>
                    <select 
                      value={newGuest.group}
                      onChange={(e) => setNewGuest(prev => ({ ...prev, group: e.target.value }))}
                      className="form-select"
                    >
                      <option value="Partner A's Family">Partner A's Family</option>
                      <option value="Partner B's Family">Partner B's Family</option>
                      <option value="Wedding Party">Wedding Party</option>
                      <option value="Mutual Friends">Mutual Friends</option>
                      <option value="Colleagues">Colleagues</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initial RSVP Status</label>
                    <select 
                      value={newGuest.status}
                      onChange={(e) => setNewGuest(prev => ({ ...prev, status: e.target.value }))}
                      className="form-select"
                    >
                      <option value="Pending">⏰ Pending Response</option>
                      <option value="Attending">✓ Confirmed Attending</option>
                      <option value="Declined">× Declined</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Table Number (optional)</label>
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      value={newGuest.table}
                      onChange={(e) => setNewGuest(prev => ({ ...prev, table: Number(e.target.value) }))}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Allowed Plus-ones</label>
                    <input 
                      type="number" 
                      min="0"
                      max="5"
                      value={newGuest.plusOnes}
                      onChange={(e) => setNewGuest(prev => ({ ...prev, plusOnes: Number(e.target.value) }))}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Dietary & Accessibility Notes</label>
                  <textarea 
                    placeholder="Gluten-free, vegan, ramp access required, etc..."
                    value={newGuest.notes}
                    onChange={(e) => setNewGuest(prev => ({ ...prev, notes: e.target.value }))}
                    className="form-textarea"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Guest</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Batch Import Modal */}
      {csvModalOpen && (
        <div className="modal-overlay" onClick={() => setCsvModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-gold font-heading">Batch CSV Import</h3>
              <button onClick={() => setCsvModalOpen(false)} className="modal-close" aria-label="Close modal">×</button>
            </div>
            <form onSubmit={handleBatchCsvSubmit}>
              <div className="modal-body">
                <p className="body-sm text-secondary mb-3">
                  Paste comma-separated rows in the following format: <br/>
                  <code style={{ color: '#D4AF37' }}>Name, Group, Email, PlusOnes</code>
                </p>
                <textarea 
                  required
                  rows={8}
                  placeholder={`Eleanor Vance, Partner A's Family, eleanor@example.com, 1\nLiam Thorne, Mutual Friends, liam@example.com, 0\nSophia Chen, Wedding Party, sophia@example.com, 1`}
                  value={csvRawText}
                  onChange={(e) => setCsvRawText(e.target.value)}
                  className="form-textarea w-full"
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setCsvModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Import All Rows</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .guest-layout {
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
        .search-input {
          background: rgba(10, 25, 47, 0.8);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 12px;
          color: #f5f0e8;
          padding: 12px 16px;
          outline: none;
          min-width: 280px;
        }
        .search-input:focus {
          border-color: #D4AF37;
        }
        .guest-table {
          border-collapse: collapse;
          text-align: left;
        }
        .guest-table th {
          padding: 16px;
          font-size: 0.85rem;
          color: #D4AF37;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .guest-table td {
          padding: 16px;
          font-size: 0.9rem;
          vertical-align: middle;
        }
        .table-row-item {
          transition: background 0.3s ease;
        }
        .table-row-item:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .border-b {
          border-bottom: 1px solid rgba(212, 175, 55, 0.1);
        }
        .inline-select {
          background: rgba(10, 25, 47, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.2);
          color: #f5f0e8;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          outline: none;
          cursor: pointer;
        }
        .select-success {
          border-color: #10B981;
          color: #10B981;
          background: rgba(16, 185, 129, 0.1);
        }
        .select-warning {
          border-color: #F59E0B;
          color: #F59E0B;
          background: rgba(245, 158, 11, 0.1);
        }
        .select-danger {
          border-color: #EF4444;
          color: #EF4444;
          background: rgba(239, 68, 68, 0.1);
        }
        .table-number-input {
          background: rgba(10, 25, 47, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.2);
          color: #f5f0e8;
          width: 60px;
          padding: 6px 8px;
          border-radius: 8px;
          text-align: center;
          outline: none;
        }
        .plus-minus-btn {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid rgba(212, 175, 55, 0.3);
          background: rgba(255, 255, 255, 0.05);
          cursor: pointer;
          color: #f5f0e8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          transition: all 0.3s ease;
        }
        .plus-minus-btn:hover {
          background: rgba(212, 175, 55, 0.2);
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
        .py-8 { padding-top: 32px; padding-bottom: 32px; }
        .p-5 { padding: 20px; }
        .p-4 { padding: 16px; }
        .mt-2 { margin-top: 8px; }
        .mt-1 { margin-top: 4px; }
        .mb-1 { margin-bottom: 4px; }
        .mb-3 { margin-bottom: 12px; }
        .mb-6 { margin-bottom: 24px; }
        .mb-8 { margin-bottom: 32px; }
        .flex-col { display: flex; flex-direction: column; }
        .flex-between { display: flex; align-items: center; justify-content: space-between; }
        .flex-start { display: flex; align-items: center; justify-content: flex-start; }
        .flex-wrap { flex-wrap: wrap; }
        .gap-1 { gap: 4px; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .gap-4 { gap: 16px; }
        .font-bold { font-weight: 700; }
        .w-full { width: 100%; }
        .w-6 { width: 24px; }
      `}</style>
    </main>
  );
}
