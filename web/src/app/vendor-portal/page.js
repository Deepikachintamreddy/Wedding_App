'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeddingStore } from '@/lib/store';
import Monogram from '@/components/Monogram';

const INITIAL_INQUIRIES = [
  { id: 'inq1', coupleNames: 'Eleanor Vance & Liam Thorne', date: '2026-05-25', message: 'Hello! We love your editorial style. Are you available for July 15th, 2027 in Malibu, CA? We have a contracted budget allocation of $5,500.', status: 'Unread' },
  { id: 'inq2', coupleNames: 'Sophia Chen & Julian Rossi', date: '2026-05-24', message: 'Hi! Could you share your complete destination wedding brochure and dual-camera coverage options?', status: 'Replied' },
];

export default function VendorPortalPage() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, loading } = store;

  const [inquiries, setInquiries] = useState(INITIAL_INQUIRIES);
  const [activeTab, setActiveTab] = useState('inquiries');
  const [activeBusinessIndex, setActiveBusinessIndex] = useState(0);

  const [profileData, setProfileData] = useState({
    businessName: 'Luminary Photography & Cinema',
    contactPerson: 'Marcus Sterling',
    email: 'marcus@luminary.example.com',
    phone: '(555) 018-7241',
    location: 'Malibu, CA',
    website: 'https://luminarycinema.example.com',
    priceRange: '$$$$',
    basePrice: 5500,
    services: 'Fine art wedding photography, drone cinematography, archival linen albums.',
    bio: 'Luminary Photography & Cinema captures authentic, timeless moments using natural light and editorial film compositions. Verified partner of OVAimagination Events.',
  });
  
  const [isFeatured, setIsFeatured] = useState(false);

  // Sync profile details
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

    alert('Partner listing updated and synchronized across all Elysian couple directories!');
  };

  const handleInquiryReply = (id, coupleNames) => {
    const replyText = prompt(`Compose message reply to ${coupleNames}:`);
    if (replyText) {
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: 'Replied' } : inq));
      alert(`Message successfully delivered to ${coupleNames}! A notification was sent to their Elysian Concierge inbox.`);
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
        <div className="vendor-header mb-8 flex-between items-end flex-wrap gap-4">
          <div>
            <div className="flex-start items-center gap-2 mb-2">
              <Monogram size={30} variant="gold" />
              <span className="badge badge-gold">VERIFIED PARTNER PORTAL</span>
            </div>
            <h1 className="h2 font-heading text-gold mb-1">{profileData.businessName}</h1>
            <p className="body-sm text-secondary">
              Review couple inquiries, update pricing packages, and manage Elysian Concierge directory presence.
            </p>
          </div>

          {/* Business Selector (if multi-business vendor) */}
          {hasMultipleBiz && (
            <div className="business-selector-box flex-col gap-1">
              <label className="text-xs text-muted" style={{ fontWeight: 600 }}>Active Business Profile:</label>
              <select
                value={activeBusinessIndex}
                onChange={(e) => setActiveBusinessIndex(Number(e.target.value))}
                className="biz-dropdown"
                aria-label="Switch active business profile"
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
            <span className="overline text-muted mb-1">Monthly Profile Impressions</span>
            <span className="stat-number text-gold font-heading">
              {activeBusinessIndex === 0 ? '482' : '210'} <span className="text-xs text-secondary font-body">views</span>
            </span>
          </div>
          <div className="card glass-panel p-5 text-center flex-col justify-center">
            <span className="overline text-muted mb-1">Direct Contract Bookings</span>
            <span className="stat-number text-success font-heading">
              {activeBusinessIndex === 0 ? '16' : '6'} <span className="text-xs text-secondary font-body">booked</span>
            </span>
          </div>
          <div className="card glass-panel p-5 text-center flex-col justify-center">
            <span className="overline text-muted mb-1">Directory Conversion</span>
            <span className="stat-number text-gold font-heading">
              9.2% <span className="text-xs text-secondary font-body">high</span>
            </span>
          </div>
          <div className="card glass-panel p-5 text-center flex-col justify-center">
            <span className="overline text-muted mb-1">Average Response Speed</span>
            <span className="stat-number text-gold font-heading">&lt; 2h <span className="text-xs text-secondary font-body">fast</span></span>
          </div>
        </div>

        {/* Tabs Control */}
        <div className="tabs mb-8 flex bg-secondary p-1 rounded-lg border border-divider">
          {[
            { id: 'inquiries', label: `📥 Inquiries (${inquiries.filter(i => i.status === 'Unread').length})` },
            { id: 'profile', label: '💼 Directory Profile' },
            { id: 'billing', label: '⭐ Featured Sponsor Listing' }
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
                  
                  <div className="flex-col gap-2 flex-shrink-0" style={{ width: '130px' }}>
                    <button 
                      onClick={() => handleInquiryReply(inq.id, inq.coupleNames)}
                      className="btn btn-primary btn-sm w-full text-center"
                    >
                      Reply to Couple
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
          <div className="card glass-panel p-6 border-gold">
            <h2 className="h4 font-heading text-gold mb-6">Directory Profile: {profileData.businessName}</h2>
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
                  <label className="form-label">Primary Contact Person</label>
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
                  <label className="form-label">Studio Location / Region</label>
                  <input 
                    type="text" 
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Official Website URL</label>
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
                  <label className="form-label">Starting Package Price ($)</label>
                  <input 
                    type="number" 
                    value={profileData.basePrice}
                    onChange={(e) => setProfileData(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Business Bio & Service Description</label>
                <textarea 
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  className="form-textarea"
                  style={{ minHeight: '120px' }}
                />
              </div>
              <div className="flex justify-end mt-4">
                <button type="submit" className="btn btn-primary">Save Profile Changes</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="card glass-panel p-6 flex-col border-gold">
            <h2 className="h4 font-heading text-gold mb-2">Elysian Vetted Partner Sponsorship</h2>
            <p className="body-sm text-secondary mb-6">
              Boost your directory ranking. Featured partners appear prominently in couple search results and AI Concierge recommendations.
            </p>

            <div className="featured-pricing-grid flex-col gap-6">
              <div className="featured-tier card glass-panel p-6 flex-between items-center bg-gold-tint border-gold">
                <div className="tier-info">
                  <span className="badge badge-gold mb-2">EXCLUSIVE PLACEMENT</span>
                  <h3 className="h5 font-heading text-gold mb-1">Elysian Verified Sponsor ({profileData.businessName})</h3>
                  <p className="text-xs text-secondary mb-0">
                    Guaranteed top-row positioning, gold badge indicator, and direct referrals from OVAimagination Events planners.
                  </p>
                </div>
                <div className="flex-col items-center flex-shrink-0" style={{ gap: '10px' }}>
                  <span className="price-label text-gold font-heading" style={{ fontSize: '1.8rem' }}>
                    $49 / mo
                  </span>
                  <button 
                    onClick={() => {
                      setIsFeatured(!isFeatured);
                      alert(isFeatured ? "Featured sponsor plan paused." : "Thank you! Your business is now an active Elysian Verified Sponsor!");
                    }} 
                    className="btn btn-primary btn-sm"
                  >
                    {isFeatured ? '✓ Active Sponsor' : 'Activate Sponsorship'}
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
        .border-gold {
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
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
        .bg-secondary {
          background: rgba(10, 25, 47, 0.6);
        }
        .border-divider {
          border-color: rgba(212, 175, 55, 0.15);
        }
        .tab.bg-gold {
          background: #D4AF37;
          color: #050D1A;
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
          background: radial-gradient(circle at 10% 10%, rgba(212, 175, 55, 0.12) 0%, transparent 60%);
        }
        .biz-dropdown {
          padding: 8px 14px;
          background: #0A192F;
          color: #f5f0e8;
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 8px;
          outline: none;
          font-family: inherit;
          font-weight: 600;
          cursor: pointer;
        }
        .biz-dropdown:focus {
          border-color: #D4AF37;
        }
        .mb-0 { margin-bottom: 0; }
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
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
