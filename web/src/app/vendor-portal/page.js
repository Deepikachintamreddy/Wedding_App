'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeddingStore } from '@/lib/store';

const INITIAL_INQUIRIES = [
  { id: 'inq1', coupleNames: 'Vanessa & Noah', date: '2026-05-25', message: 'Hello! We love your photography style. Do you have availability for July 15th, 2027 in Malibu, CA? We have a budget of $3,800 allocated.', status: 'Unread' },
  { id: 'inq2', coupleNames: 'Emma & John', date: '2026-05-24', message: 'Hi, can you send over your detailed pricing sheet and a sample full wedding gallery?', status: 'Replied' },
];

export default function VendorPortalPage() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, loading } = store;

  const [inquiries, setInquiries] = useState(INITIAL_INQUIRIES);
  const [activeTab, setActiveTab] = useState('inquiries'); // inquiries, profile, billing
  const [activeBusinessIndex, setActiveBusinessIndex] = useState(0);

  const [profileData, setProfileData] = useState({
    businessName: 'Golden Hour Studios',
    contactPerson: 'Chloe Bennett',
    email: 'chloe@goldenhourstudios.com',
    phone: '(555) 018-7241',
    location: 'Pasadena, CA',
    website: 'https://goldenhourstudios.com',
    priceRange: '$$$',
    basePrice: 3800,
    services: 'Wedding photography, engagement sessions, custom albums, dual photographers.',
    bio: 'Golden Hour Studios specializes in natural light wedding photojournalism. We capture raw, authentic emotions and beautiful golden light portraits that tell your unique love story for generations.',
  });
  
  const [isFeatured, setIsFeatured] = useState(false);

  // Sync profile details when switching businesses or when user loads
  useEffect(() => {
    if (!loading && (!user || user.role !== 'vendor')) {
      router.push('/auth');
    } else if (user) {
      if (user.businesses && user.businesses.length > 0) {
        const activeBiz = user.businesses[activeBusinessIndex] || user.businesses[0];
        setProfileData(prev => ({
          ...prev,
          businessName: activeBiz.name || user.name || prev.businessName,
          basePrice: activeBiz.rate || prev.basePrice,
          website: activeBiz.website || prev.website,
          services: activeBiz.category || prev.services,
          bio: activeBiz.notes || prev.bio,
          email: user.email || prev.email,
        }));
      } else {
        setProfileData(prev => ({
          ...prev,
          businessName: user.name || prev.businessName,
          email: user.email || prev.email,
        }));
      }
    }
  }, [user, loading, router, activeBusinessIndex]);

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

  const handleProfileSave = (e) => {
    e.preventDefault();

    if (user.businesses && user.businesses.length > 0) {
      const updatedBusinesses = [...user.businesses];
      updatedBusinesses[activeBusinessIndex] = {
        ...updatedBusinesses[activeBusinessIndex],
        name: profileData.businessName,
        rate: Number(profileData.basePrice),
        website: profileData.website,
        notes: profileData.bio,
      };
      
      store.updateUser({
        name: updatedBusinesses[0]?.name || user.name,
        businesses: updatedBusinesses
      });
    }

    alert('Directory details updated and saved successfully! These updates will be displayed on couples directories.');
  };

  const handleInquiryReply = (id, coupleName) => {
    const replyText = prompt(`Type your message reply to ${coupleName}:`);
    if (replyText) {
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: 'Replied' } : inq));
      alert(`Message successfully sent to ${coupleName}! We will notify you when they respond.`);
    }
  };

  const handleDismissInquiry = (id) => {
    if (confirm('Are you sure you want to dismiss this inquiry?')) {
      setInquiries(prev => prev.filter(inq => inq.id !== id));
    }
  };

  const hasMultipleBiz = user.businesses && user.businesses.length > 1;

  return (
    <main className="vendor-portal-layout">
      <div className="navbar-spacer"></div>

      <div className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="vendor-header mb-8 flex-between items-end">
          <div>
            <span className="badge badge-gold mb-2">PARTNER SUITE</span>
            <h1 className="h2 font-heading text-gold mb-1">{profileData.businessName} Portal</h1>
            <p className="body-sm text-secondary">
              Manage incoming couple inquiries, analyze profile conversions, and update services directory.
            </p>
          </div>

          {/* Business Selector (visible if vendor has multiple businesses) */}
          {hasMultipleBiz && (
            <div className="business-selector-box flex-col gap-1">
              <label className="text-xs text-muted" style={{ fontWeight: 600 }}>Active Business Profile:</label>
              <select
                value={activeBusinessIndex}
                onChange={(e) => setActiveBusinessIndex(Number(e.target.value))}
                className="biz-dropdown"
              >
                {user.businesses.map((biz, idx) => (
                  <option key={idx} value={idx}>
                    {biz.name} ({biz.category})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Analytics Grid */}
        <div className="stats-grid mb-8">
          <div className="card glass-panel p-5 text-center flex-col justify-center">
            <span className="overline text-muted mb-1">Monthly Profile Views</span>
            <span className="stat-number text-gold font-heading">
              {activeBusinessIndex === 0 ? '342' : activeBusinessIndex === 1 ? '194' : '88'} <span className="text-xs text-secondary font-body">views</span>
            </span>
          </div>
          <div className="card glass-panel p-5 text-center flex-col justify-center">
            <span className="overline text-muted mb-1">Total Bookings</span>
            <span className="stat-number text-success font-heading">
              {activeBusinessIndex === 0 ? '12' : activeBusinessIndex === 1 ? '4' : '2'} <span className="text-xs text-secondary font-body">booked</span>
            </span>
          </div>
          <div className="card glass-panel p-5 text-center flex-col justify-center">
            <span className="overline text-muted mb-1">Conversion Rate</span>
            <span className="stat-number text-gold font-heading">
              {activeBusinessIndex === 0 ? '8.4%' : activeBusinessIndex === 1 ? '5.2%' : '4.0%'} <span className="text-xs text-secondary font-body">high</span>
            </span>
          </div>
          <div className="card glass-panel p-5 text-center flex-col justify-center">
            <span className="overline text-muted mb-1">Inquiry Reply Time</span>
            <span className="stat-number text-gold font-heading">&lt; 3h <span className="text-xs text-secondary font-body">fast</span></span>
          </div>
        </div>

        {/* Tabs Control */}
        <div className="tabs mb-8 flex bg-secondary p-1 rounded-lg border border-divider">
          {[
            { id: 'inquiries', label: `📥 Inquiries (${inquiries.filter(i => i.status === 'Unread').length})` },
            { id: 'profile', label: '💼 Directory Profile' },
            { id: 'billing', label: '💰 Featured Listings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab flex-1 py-3 px-4 text-center text-sm font-bold rounded-md transition cursor-pointer ${
                activeTab === tab.id ? 'bg-gold text-dark' : 'text-muted hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === 'inquiries' && (
          <div className="inquiries-container flex-col gap-4">
            {inquiries.length > 0 ? (
              inquiries.map(inq => (
                <div key={inq.id} className="card glass-panel p-6 flex-between items-start gap-4">
                  <div className="flex-col flex-1">
                    <div className="flex-between items-center mb-2">
                      <h3 className="body-sm font-bold text-primary mb-0">Inquiry from: {inq.coupleNames}</h3>
                      <div className="flex-start items-center gap-2">
                        <span className="text-xs text-muted">{inq.date}</span>
                        <span className={`badge badge-sm ${inq.status === 'Unread' ? 'badge-warning' : 'badge-success'}`}>
                          {inq.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-secondary italic mb-0 bg-secondary p-3 rounded-md border border-divider">
                      💬 "{inq.message}"
                    </p>
                  </div>
                  
                  <div className="flex-col gap-2 flex-shrink-0" style={{ width: '120px' }}>
                    <button 
                      onClick={() => handleInquiryReply(inq.id, inq.coupleNames)}
                      className="btn btn-primary btn-sm w-full text-center"
                    >
                      Reply
                    </button>
                    <button 
                      onClick={() => handleDismissInquiry(inq.id)}
                      className="btn btn-ghost btn-sm w-full text-danger text-center"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="card glass-panel p-8 text-center">
                <span style={{ fontSize: '2.5rem' }}>📭</span>
                <p className="body-sm text-secondary mt-2">No active inquiries in your inbox.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="card glass-panel p-6">
            <h2 className="h4 font-heading text-gold mb-6">Directory Information for {profileData.businessName}</h2>
            <form onSubmit={handleProfileSave} className="flex-col gap-4">
              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Business Display Name</label>
                  <input 
                    type="text" 
                    value={profileData.businessName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, businessName: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Full Name</label>
                  <input 
                    type="text" 
                    value={profileData.contactPerson}
                    onChange={(e) => setProfileData(prev => ({ ...prev, contactPerson: e.target.value }))}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Studio Location</label>
                  <input 
                    type="text" 
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Website URL</label>
                  <input 
                    type="text" 
                    value={profileData.website}
                    onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input 
                    type="text" 
                    value={profileData.services}
                    disabled
                    className="form-input"
                    style={{ opacity: 0.7, background: 'rgba(255,255,255,0.03)' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Starting Price ($)</label>
                  <input 
                    type="number" 
                    value={profileData.basePrice}
                    onChange={(e) => setProfileData(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Business Bio Description & Notes</label>
                <textarea 
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  className="form-textarea"
                  style={{ minHeight: '120px' }}
                />
              </div>
              <div className="flex justify-end mt-4">
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="card glass-panel p-6 flex-col">
            <h2 className="h4 font-heading text-gold mb-4">Promote Your Studio Listing</h2>
            <p className="body-sm text-secondary mb-6">
              Upgrade your directory visibility. Sponsored cards get featured first in couples searches, leading to **5x higher inquiry rates**.
            </p>

            <div className="featured-pricing-grid flex-col gap-6">
              <div className="featured-tier card glass-panel p-6 flex-between items-center bg-gold-tint">
                <div className="tier-info">
                  <span className="badge badge-gold mb-2">HOT SELLER</span>
                  <h3 className="h5 font-heading text-gold mb-1">Elysian Vetted Sponsor Program ({profileData.businessName})</h3>
                  <p className="text-xs text-secondary mb-0">
                    Get pinned on page 1 of your category directory, get verified badges, and direct AI matcher referrals.
                  </p>
                </div>
                <div className="flex-col items-center flex-shrink-0" style={{ gap: '10px' }}>
                  <span className="price-label text-gold font-heading" style={{ fontSize: '1.8rem' }}>
                    {isFeatured ? '$49 / mo' : '$49 / mo'}
                  </span>
                  <button 
                    onClick={() => {
                      setIsFeatured(!isFeatured);
                      alert(isFeatured ? "Featured plan deactivated." : "Thank you! Your business is now a Featured Elysian Vetted Sponsor!");
                    }} 
                    className="btn btn-primary btn-sm"
                  >
                    {isFeatured ? '✓ Active Sponsor' : 'Activate Plan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .vendor-portal-layout {
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
        .bg-secondary {
          background: rgba(26, 26, 46, 0.6);
        }
        .border-divider {
          border-color: rgba(201, 169, 110, 0.1);
        }
        .tab.bg-gold {
          background: #c9a96e;
          color: #0d0d1a;
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
        .bg-gold-tint {
          background: radial-gradient(circle at 10% 10%, rgba(201, 169, 110, 0.12) 0%, transparent 60%);
        }
        .biz-dropdown {
          padding: 8px 14px;
          background: #0d0d1a;
          color: #f5f0e8;
          border: 1px solid rgba(201, 169, 110, 0.25);
          border-radius: 8px;
          outline: none;
          font-family: inherit;
          font-weight: 600;
          cursor: pointer;
        }
        .biz-dropdown:focus {
          border-color: #c9a96e;
        }
        .mb-0 { margin-bottom: 0; }
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-6 { margin-bottom: 24px; }
        .mb-8 { margin-bottom: 32px; }
        .mt-4 { margin-top: 16px; }
        .py-8 { padding-top: 32px; padding-bottom: 32px; }
        .p-6 { padding: 24px; }
        .p-5 { padding: 20px; }
        .p-3 { padding: 12px; }
        .flex-col { display: flex; flex-direction: column; }
        .flex-between { display: flex; align-items: center; justify-content: space-between; }
        .flex-start { display: flex; align-items: center; justify-content: flex-start; }
        .gap-1 { gap: 4px; }
        .gap-2 { gap: 8px; }
        .gap-4 { gap: 16px; }
        .gap-6 { gap: 24px; }
        .font-bold { font-weight: 700; }
        .w-full { width: 100%; }
        .flex-shrink-0 { flex-shrink: 0; }
        .items-end { align-items: flex-end; }
      `}</style>
    </main>
  );
}
