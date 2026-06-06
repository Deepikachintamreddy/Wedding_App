'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeddingStore } from '@/lib/store';
import { capitalize } from '@/lib/utils';

export default function GuestListPage() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, guests, loading, addGuest, updateGuest, deleteGuest } = store;

  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: '',
    group: "Bride's Family",
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
      <div className="flex-center" style={{ minHeight: '100vh', background: '#0d0d1a' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(201, 169, 110, 0.15)', borderTopColor: '#c9a96e', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style jsx>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .flex-center { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #0d0d1a; }
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
                          guest.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = groupFilter === 'all' || guest.group === groupFilter;
    const matchesStatus = statusFilter === 'all' || guest.status === statusFilter;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  const handleStatusChange = (id, newStatus) => {
    const meal = newStatus === 'Declined' ? 'Declined' : (newStatus === 'Pending' ? 'Pending' : 'Beef');
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
      group: "Bride's Family",
      status: 'Pending',
      meal: 'Pending',
      table: 0,
      plusOnes: 0,
      notes: '',
    });
    setModalOpen(false);
  };

  const handleDeleteGuest = (id) => {
    if (confirm('Are you sure you want to remove this guest?')) {
      deleteGuest(id);
    }
  };

  const handleExport = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Name,Group,Email,Phone,RSVP Status,Meal Preference,Table Number,Plus Ones,Notes\n';
    guests.forEach(g => {
      csvContent += `"${g.name}","${g.group}","${g.email}","${g.phone}","${g.status}","${g.meal}",${g.table},${g.plusOnes || 0},"${g.notes || ''}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'wedding_guest_list.csv');
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
            <h1 className="h2 font-heading text-gold mb-1">Guest List & RSVPs</h1>
            <p className="body-sm text-secondary">
              Manage invitations, table seating, and dinner menus. Setup managed by **OVAimagination Events**.
            </p>
          </div>
          <div className="flex gap-3">
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
            <span className="overline text-muted mb-1">Confirmed attending</span>
            <span className="stat-number text-success font-heading">{attendingCount} <span className="text-xs font-body text-secondary">+{totalPlusOnes} plus-ones</span></span>
          </div>
          <div className="card glass-panel p-5 text-center flex-col justify-center">
            <span className="overline text-muted mb-1">Total Seats Booked</span>
            <span className="stat-number text-gold font-heading">{totalSeats} <span className="text-xs font-body text-secondary">chairs</span></span>
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
          />
          <div className="flex gap-3 flex-wrap">
            <select 
              value={groupFilter} 
              onChange={(e) => setGroupFilter(e.target.value)}
              className="form-select flex-shrink-0"
              style={{ width: '180px' }}
            >
              <option value="all">📁 All Groups</option>
              <option value="Bride's Family">Bride's Family</option>
              <option value="Groom's Family">Groom's Family</option>
              <option value="Friends">Friends</option>
              <option value="Coworkers">Coworkers</option>
            </select>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select flex-shrink-0"
              style={{ width: '180px' }}
            >
              <option value="all">🗳️ All RSVPs</option>
              <option value="Attending">Attending</option>
              <option value="Pending">Pending</option>
              <option value="Declined">Declined</option>
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
                <th>Meal Choice</th>
                <th>Table</th>
                <th>Plus-ones</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.length > 0 ? (
                filteredGuests.map(guest => (
                  <tr key={guest.id} className="table-row-item border-b">
                    <td className="font-bold text-primary">
                      {guest.name}
                      <span className="text-xs text-muted block font-normal">{guest.email || 'No email'}</span>
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
                        >
                          <option value="Beef">🥩 Beef</option>
                          <option value="Chicken">🐔 Chicken</option>
                          <option value="Fish">🐟 Fish</option>
                          <option value="Vegetarian">🥗 Vegetarian</option>
                          <option value="Child">👶 Child</option>
                          <option value="Pending">Pending Choice</option>
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
                          value={guest.table} 
                          onChange={(e) => handleTableChange(guest.id, e.target.value)}
                          className="table-number-input"
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
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-sm font-bold">{guest.plusOnes || 0}</span>
                          <button 
                            onClick={() => updateGuest(guest.id, { plusOnes: (guest.plusOnes || 0) + 1 })}
                            className="plus-minus-btn"
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
                        onClick={() => handleDeleteGuest(guest.id)}
                        className="btn btn-ghost btn-sm text-danger"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <span style={{ fontSize: '2rem' }}>👥</span>
                    <p className="body-sm text-secondary mt-2">No guests found matching search filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Guest Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-gold font-heading">Add Guest Entry</h3>
              <button onClick={() => setModalOpen(false)} className="modal-close">×</button>
            </div>
            <form onSubmit={handleGuestSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. John Doe"
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
                      placeholder="e.g. john@doe.com"
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
                      <option value="Bride's Family">Bride's Family</option>
                      <option value="Groom's Family">Groom's Family</option>
                      <option value="Friends">Friends</option>
                      <option value="Coworkers">Coworkers</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">RSVP Status</label>
                    <select 
                      value={newGuest.status}
                      onChange={(e) => setNewGuest(prev => ({ ...prev, status: e.target.value }))}
                      className="form-select"
                    >
                      <option value="Pending">⏰ Pending Response</option>
                      <option value="Attending">✓ Attending</option>
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
                  <label className="form-label">Notes & Diet Restrictions</label>
                  <textarea 
                    placeholder="Vegan diet, wheelchair accessibility, etc..."
                    value={newGuest.notes}
                    onChange={(e) => setNewGuest(prev => ({ ...prev, notes: e.target.value }))}
                    className="form-textarea"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Insert Guest</button>
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
          background: rgba(26, 26, 46, 0.8);
          border: 1px solid rgba(201, 169, 110, 0.2);
          border-radius: 12px;
          color: #f5f0e8;
          padding: 12px 16px;
          outline: none;
          min-width: 280px;
        }
        .search-input:focus {
          border-color: #c9a96e;
        }
        .guest-table {
          border-collapse: collapse;
          text-align: left;
        }
        .guest-table th {
          padding: 16px;
          font-size: 0.85rem;
          color: #a0937d;
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
          border-bottom: 1px solid rgba(201, 169, 110, 0.08);
        }
        .inline-select {
          background: rgba(13, 13, 26, 0.5);
          border: 1px solid rgba(201, 169, 110, 0.15);
          color: #f5f0e8;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          outline: none;
          cursor: pointer;
        }
        .select-success {
          border-color: #4ade80;
          color: #4ade80;
          background: rgba(74, 222, 128, 0.05);
        }
        .select-warning {
          border-color: #f59e0b;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.05);
        }
        .select-danger {
          border-color: #ef4444;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }
        .table-number-input {
          background: rgba(13, 13, 26, 0.5);
          border: 1px solid rgba(201, 169, 110, 0.15);
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
          border: 1px solid rgba(201, 169, 110, 0.2);
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
          background: rgba(201, 169, 110, 0.15);
          border-color: #c9a96e;
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
