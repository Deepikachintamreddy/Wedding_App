'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeddingStore } from '@/lib/store';

export default function VendorsPage() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, vendors, loading, addVendor, updateVendor, deleteVendor } = store;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  
  const [newVendor, setNewVendor] = useState({
    name: '',
    category: 'Venue',
    rating: 5.0,
    reviewsCount: 1,
    costRange: '$$$',
    location: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    contractPrice: '',
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

  // Filter vendors
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          vendor.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || vendor.category === activeCategory;
    const matchesStatus = activeStatusFilter === 'all' || vendor.status === activeStatusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleStatusChange = (id, newStatus) => {
    updateVendor(id, { status: newStatus });
    if (selectedVendor && selectedVendor.id === id) {
      setSelectedVendor(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newVendor.name || !newVendor.location) return;

    addVendor({
      ...newVendor,
      contractPrice: Number(newVendor.contractPrice) || 0,
      paidAmount: 0,
      nextPaymentDate: null,
    });

    setNewVendor({
      name: '',
      category: 'Venue',
      rating: 5.0,
      reviewsCount: 1,
      costRange: '$$$',
      location: '',
      contactName: '',
      email: '',
      phone: '',
      website: '',
      contractPrice: '',
      notes: '',
    });
    setAddModalOpen(false);
  };

  const handleRemoveVendor = (id) => {
    if (confirm('Are you sure you want to remove this vendor?')) {
      deleteVendor(id);
      setDetailModalOpen(false);
    }
  };

  return (
    <main className="vendors-layout">
      <div className="navbar-spacer"></div>

      <div className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="flex-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="h2 font-heading text-gold mb-1">Vetted Vendors</h1>
            <p className="body-sm text-secondary">
              Discover and select trusted specialists. Vetted recommendations by **OVAimagination Events**.
            </p>
          </div>
          <button 
            onClick={() => setAddModalOpen(true)}
            className="btn btn-primary"
          >
            ＋ Add Custom Vendor
          </button>
        </div>

        {/* Search & Status Filters */}
        <div className="card glass-panel p-4 mb-6 flex-between gap-4 flex-wrap">
          <input 
            type="text"
            placeholder="🔍 Search vendors by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input flex-1"
          />
          <div className="flex gap-3">
            <select 
              value={activeStatusFilter} 
              onChange={(e) => setActiveStatusFilter(e.target.value)}
              className="form-select flex-shrink-0"
              style={{ width: '180px' }}
            >
              <option value="all">🗳️ All Statuses</option>
              <option value="Booked">✓ Booked</option>
              <option value="Shortlisted">❤️ Shortlisted</option>
              <option value="Contacted">💬 Contacted</option>
            </select>
          </div>
        </div>

        {/* Category Filters */}
        <div className="tabs mb-8 flex bg-secondary p-1 rounded-lg border border-divider overflow-x-auto flex-wrap gap-1">
          {[
            { id: 'all', label: '📂 All Categories' },
            { id: 'Planner', label: '📋 Planners' },
            { id: 'Venue', label: '🏛️ Venues' },
            { id: 'Photography', label: '📸 Photography' },
            { id: 'Videography', label: '🎥 Videography' },
            { id: 'Catering', label: '🍽️ Catering' },
            { id: 'Music', label: '🎵 Music / DJ' },
            { id: 'Florals', label: '💐 Florists' },
            { id: 'Attire', label: '👗 Attire' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`tab px-4 py-2 text-sm font-bold rounded-md transition cursor-pointer ${
                activeCategory === tab.id ? 'bg-gold text-dark' : 'text-muted hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Vendors Grid */}
        <div className="vendors-grid">
          {filteredVendors.length > 0 ? (
            filteredVendors.map(vendor => (
              <div 
                key={vendor.id} 
                className="card glass-panel flex-col vendor-card justify-between"
              >
                <div className="p-5">
                  <div className="flex-between items-center mb-3">
                    <span className="badge badge-gold badge-sm">{vendor.category}</span>
                    <button 
                      onClick={() => handleStatusChange(vendor.id, vendor.status === 'Shortlisted' ? 'Contacted' : 'Shortlisted')}
                      className="heart-btn text-gold"
                      title={vendor.status === 'Shortlisted' ? 'Remove from shortlist' : 'Shortlist vendor'}
                    >
                      {vendor.status === 'Shortlisted' ? '❤️' : '♡'}
                    </button>
                  </div>
                  
                  <h3 
                    onClick={() => {
                      setSelectedVendor(vendor);
                      setDetailModalOpen(true);
                    }}
                    className="h5 font-heading text-gold hover:underline cursor-pointer mb-2"
                  >
                    {vendor.name}
                  </h3>
                  
                  <p className="text-xs text-muted mb-2">📍 {vendor.location}</p>
                  
                  <div className="flex-start items-center gap-2 mb-3">
                    <span className="rating-star">⭐ {vendor.rating.toFixed(1)}</span>
                    <span className="text-xs text-muted">({vendor.reviewsCount} reviews)</span>
                    <span className="text-xs text-muted">•</span>
                    <span className="text-xs text-gold font-bold">{vendor.costRange}</span>
                  </div>

                  <p className="text-xs text-secondary italic mb-0 line-clamp-3">
                    {vendor.notes || 'Premium partner recommended by our events team.'}
                  </p>
                </div>

                <div className="card-footer p-4 border-t flex-between items-center bg-secondary">
                  <span className={`badge ${
                    vendor.status === 'Booked' ? 'badge-success' : 
                    vendor.status === 'Shortlisted' ? 'badge-gold' : 'badge-secondary'
                  }`}>
                    {vendor.status}
                  </span>
                  
                  <button 
                    onClick={() => {
                      setSelectedVendor(vendor);
                      setDetailModalOpen(true);
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="card glass-panel p-8 text-center" style={{ gridColumn: '1 / -1' }}>
              <span style={{ fontSize: '2.5rem' }}>💒</span>
              <p className="body-sm text-secondary mt-2">No vendors found matching selection filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Vendor Details Modal */}
      {selectedVendor && detailModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-gold font-heading">{selectedVendor.name} Details</h3>
              <button onClick={() => setDetailModalOpen(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <div className="flex-start items-center gap-2 mb-4">
                <span className="badge badge-gold">{selectedVendor.category}</span>
                <span className="rating-star">⭐ {selectedVendor.rating.toFixed(1)} ({selectedVendor.reviewsCount} reviews)</span>
                <span className="badge badge-secondary">{selectedVendor.costRange}</span>
              </div>

              <div className="contact-details p-4 bg-secondary rounded-lg mb-4 flex-col gap-2 border border-divider">
                <h4 className="overline mb-2">Vetted Contact Details</h4>
                <p className="body-sm text-secondary mb-0"><strong>Contact Person:</strong> {selectedVendor.contactName || 'Olivia Vance'}</p>
                <p className="body-sm text-secondary mb-0"><strong>Email:</strong> {selectedVendor.email || 'events@VND.com'}</p>
                <p className="body-sm text-secondary mb-0"><strong>Phone:</strong> {selectedVendor.phone || '(555) 019-2834'}</p>
                {selectedVendor.website && (
                  <p className="body-sm text-secondary mb-0">
                    <strong>Website:</strong>{' '}
                    <a href={selectedVendor.website} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                      {selectedVendor.website}
                    </a>
                  </p>
                )}
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Booking Status</label>
                <select 
                  value={selectedVendor.status} 
                  onChange={(e) => handleStatusChange(selectedVendor.id, e.target.value)}
                  className="form-select"
                >
                  <option value="Shortlisted">❤️ Shortlisted</option>
                  <option value="Contacted">💬 Contacted</option>
                  <option value="Booked">✓ Booked (Contract Signed)</option>
                </select>
              </div>

              {selectedVendor.status === 'Booked' && (
                <div className="form-group mb-4">
                  <label className="form-label">Contract Amount ($)</label>
                  <input 
                    type="number" 
                    value={selectedVendor.contractPrice || 0}
                    onChange={(e) => updateVendor(selectedVendor.id, { contractPrice: Number(e.target.value) })}
                    className="form-input"
                    placeholder="Enter final pricing"
                  />
                  <p className="form-hint">
                    Updating this pricing logs transaction entries and adjusts actual spent values in your **Budget**.
                  </p>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Attached Styling Notes</label>
                <textarea 
                  value={selectedVendor.notes || ''}
                  onChange={(e) => updateVendor(selectedVendor.id, { notes: e.target.value })}
                  className="form-textarea"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                onClick={() => handleRemoveVendor(selectedVendor.id)} 
                className="btn btn-danger btn-sm mr-auto"
              >
                Delete Vendor
              </button>
              <button onClick={() => setDetailModalOpen(false)} className="btn btn-primary btn-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Vendor Modal */}
      {addModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-gold font-heading">Add Custom Vendor</h3>
              <button onClick={() => setAddModalOpen(false)} className="modal-close">×</button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Vendor Business Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Luminary Photography"
                    value={newVendor.name}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="grid grid-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select 
                      value={newVendor.category}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, category: e.target.value }))}
                      className="form-select"
                    >
                      {['Planner', 'Venue', 'Catering', 'Photography', 'Videography', 'Florals', 'Music', 'Attire', 'Hair & Makeup', 'Invitations', 'Bakery', 'Rings', 'Decor', 'Misc'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cost Tier</label>
                    <select 
                      value={newVendor.costRange}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, costRange: e.target.value }))}
                      className="form-select"
                    >
                      <option value="$">$ Budget-friendly</option>
                      <option value="$$">$$ Moderate</option>
                      <option value="$$$">$$$ Premium</option>
                      <option value="$$$$">$$$$ Luxury</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location / Studio Address</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Beverly Hills, CA"
                    value={newVendor.location}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, location: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="grid grid-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Primary Contact Person</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Sarah Connor"
                      value={newVendor.contactName}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, contactName: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. studio@vendor.com"
                      value={newVendor.email}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, email: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="grid grid-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="text" 
                      placeholder="(555) 012-3456"
                      value={newVendor.phone}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, phone: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Website URL</label>
                    <input 
                      type="text" 
                      placeholder="https://vendor.com"
                      value={newVendor.website}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, website: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Contract Price ($) (optional)</label>
                  <input 
                    type="number" 
                    placeholder="5000"
                    value={newVendor.contractPrice}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, contractPrice: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Private Styling Notes</label>
                  <textarea 
                    placeholder="Pricing structures, wedding day details, package details..."
                    value={newVendor.notes}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, notes: e.target.value }))}
                    className="form-textarea"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setAddModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Log Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .vendors-layout {
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
        .vendors-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 900px) {
          .vendors-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .vendors-grid {
            grid-template-columns: 1fr;
          }
        }
        .vendor-card {
          transition: all 0.3s ease;
        }
        .vendor-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(201, 169, 110, 0.12);
          border-color: rgba(201, 169, 110, 0.3);
        }
        .heart-btn {
          background: none;
          border: none;
          font-size: 1.3rem;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .heart-btn:hover {
          transform: scale(1.15);
        }
        .rating-star {
          font-size: 0.85rem;
          color: #f59e0b;
        }
        .border-t {
          border-top: 1px solid rgba(201, 169, 110, 0.08);
        }
        .bg-secondary {
          background: rgba(26, 26, 46, 0.5);
        }
        .border-divider {
          border-color: rgba(201, 169, 110, 0.1);
        }
        .inline-select {
          background: rgba(13, 13, 26, 0.5);
          border: 1px solid rgba(201, 169, 110, 0.15);
          color: #f5f0e8;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          outline: none;
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
        .mb-0 { margin-bottom: 0; }
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-6 { margin-bottom: 24px; }
        .mb-8 { margin-bottom: 32px; }
        .mt-2 { margin-top: 8px; }
        .py-8 { padding-top: 32px; padding-bottom: 32px; }
        .p-4 { padding: 16px; }
        .p-5 { padding: 20px; }
        .flex-col { display: flex; flex-direction: column; }
        .flex-between { display: flex; align-items: center; justify-content: space-between; }
        .flex-start { display: flex; align-items: center; justify-content: flex-start; }
        .flex-wrap { flex-wrap: wrap; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .gap-4 { gap: 16px; }
        .font-bold { font-weight: 700; }
        .w-full { width: 100%; }
        .mr-auto { margin-right: auto; }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </main>
  );
}
