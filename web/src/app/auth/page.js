'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import Monogram from '@/components/Monogram';

const VENDOR_CATEGORIES = [
  { id: 'Planners & Coordinators', name: '📋 Planners & Coordinators' },
  { id: 'Venues', name: '🏛️ Venues' },
  { id: 'Caterers', name: '🍽️ Caterers' },
  { id: 'Photographers', name: '📸 Photographers' },
  { id: 'Videographers', name: '🎥 Videographers' },
  { id: 'Florists', name: '💐 Florists' },
  { id: 'DJs & Entertainment', name: '🎵 DJs & Entertainment' },
  { id: 'Live Musicians', name: '🎸 Live Musicians' },
  { id: 'Hair & Makeup Artists', name: '💄 Hair & Makeup Artists' },
  { id: 'Decor & Rental Companies', name: '✨ Decor & Rental' },
  { id: 'Cake & Confectionery Bakers', name: '🎂 Cake Bakers' },
  { id: 'Bridal Couture & Boutiques', name: '👗 Bridal Boutiques' },
  { id: 'Suiting & Tuxedos', name: '🤵 Tuxedo & Suiting' },
  { id: 'Officiants', name: '⛪ Officiants' },
  { id: 'Fine Stationery & Paper Goods', name: '✉️ Stationery & Invites' },
];

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('signup'); // 'signup' or 'login'
  const [role, setRole] = useState('couple'); // 'couple', 'vendor', 'planner' (Admin removed from public registration per Step 2)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    partnerName: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Password Reset & Verification Modals (Step 12)
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Vendor multi-category state
  const [selectedCategories, setSelectedCategories] = useState(['Planners & Coordinators']);
  const [businessesDetails, setBusinessesDetails] = useState({
    'Planners & Coordinators': { name: '', rate: '', website: '', notes: '' }
  });

  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBusinessDetailChange = (catId, field, value) => {
    setBusinessesDetails((prev) => ({
      ...prev,
      [catId]: {
        ...prev[catId],
        [field]: value
      }
    }));
  };

  const toggleCategory = (catId) => {
    let updated;
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length === 1) return;
      updated = selectedCategories.filter(id => id !== catId);
    } else {
      updated = [...selectedCategories, catId];
    }
    setSelectedCategories(updated);
    setBusinessesDetails((prev) => {
      const details = { ...prev };
      updated.forEach((id) => {
        if (!details[id]) {
          details[id] = { name: '', rate: '', website: '', notes: '' };
        }
      });
      return details;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email format is invalid';

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters with letters & numbers';
    }

    if (activeTab === 'signup') {
      if (!formData.name.trim()) newErrors.name = 'Full name is required';
      
      if (role === 'couple' && !formData.partnerName.trim()) {
        newErrors.partnerName = "Partner's full name is required";
      }

      if (role === 'vendor') {
        selectedCategories.forEach((catId) => {
          if (!businessesDetails[catId]?.name?.trim()) {
            newErrors[`business_name_${catId}`] = `Business name is required for ${catId}`;
          }
        });
      }

      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the Terms of Service and Privacy Policy';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      
      const businessesArray = selectedCategories.map((catId) => ({
        category: catId,
        name: businessesDetails[catId]?.name || formData.name + ' ' + catId,
        rate: Number(businessesDetails[catId]?.rate) || 3500,
        website: businessesDetails[catId]?.website || '',
        notes: businessesDetails[catId]?.notes || '',
      }));

      // Create new customer account with clean profile
      const user = {
        id: `usr_${Date.now()}`,
        name: role === 'couple' 
          ? `${formData.name} & ${formData.partnerName || 'Partner'}` 
          : (role === 'vendor' ? (businessesArray[0]?.name || formData.name) : formData.name),
        partnerA: formData.name,
        partnerB: formData.partnerName || '',
        email: formData.email,
        role: role,
        weddingDate: role === 'couple' ? '2027-07-15' : null,
        location: role === 'couple' ? 'Malibu, CA' : null,
        budget: role === 'couple' ? 50000 : null,
        theme: role === 'couple' ? 'Champagne Gold & Midnight Navy' : null,
        aiCredits: role === 'vendor' ? 100 : 15,
        eventPassActive: false,
        onboardingComplete: activeTab === 'login',
        isDemo: false,
        policyAcceptedDate: new Date().toISOString(),
        policyVersion: '2.4',
        vendorCategory: role === 'vendor' ? selectedCategories[0] : null,
        businesses: role === 'vendor' ? businessesArray : null,
        celebrationsEnabled: true,
        reminders: {
          email: true,
          push: true,
          sms: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
        }
      };

      localStorage.setItem('elysian_user', JSON.stringify(user));
      window.dispatchEvent(new Event('elysian_store_update'));

      if (activeTab === 'signup') {
        if (role === 'couple') {
          router.push('/onboarding');
        } else if (role === 'vendor') {
          router.push('/vendor-portal');
        } else {
          router.push('/dashboard');
        }
      } else {
        if (role === 'vendor') {
          router.push('/vendor-portal');
        } else {
          router.push('/dashboard');
        }
      }
    }, 1000);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user = {
        id: `usr_g_${Date.now()}`,
        name: 'Sarah Hayes & David Sterling',
        partnerA: 'Sarah Hayes',
        partnerB: 'David Sterling',
        email: 'sarah.david@example.com',
        role: 'couple',
        weddingDate: '2027-07-15',
        location: 'Malibu, CA',
        budget: 50000,
        theme: 'Champagne Gold & Midnight Navy',
        aiCredits: 15,
        eventPassActive: false,
        onboardingComplete: false,
        isDemo: false,
        policyAcceptedDate: new Date().toISOString(),
        policyVersion: '2.4',
      };
      localStorage.setItem('elysian_user', JSON.stringify(user));
      window.dispatchEvent(new Event('elysian_store_update'));
      router.push('/onboarding');
    }, 900);
  };

  const handleSendPasswordReset = (e) => {
    e.preventDefault();
    if (!resetEmail || !/\S+@\S+\.\S+/.test(resetEmail)) {
      alert('Please enter a valid email address.');
      return;
    }
    setResetSent(true);
  };

  return (
    <div className={styles.authPage}>
      {/* Left panel - Branding and Features */}
      <div className={styles.leftPanel}>
        <div className={styles.leftRing + ' ' + styles.leftRing1}></div>
        <div className={styles.leftRing + ' ' + styles.leftRing2}></div>
        <div className={styles.leftRing + ' ' + styles.leftRing3}></div>
        
        <div className={styles.leftContent}>
          <Link href="/" className={styles.leftBrand}>
            <Monogram size={48} style={{ marginRight: '8px' }} />
            <span>Elysian Concierge</span>
          </Link>
          <h2 className={styles.leftTagline}>Elevate Your Wedding Planning Experience</h2>
          <p className={styles.leftSubtext}>
            Plan with verified AI guidance, reconciled budgets, live RSVP websites, and curated vendor matching in partnership with <strong>OVAimagination Events</strong>.
          </p>

          <div className={styles.leftFeatures}>
            <div className={styles.leftFeature}>
              <span className={styles.leftFeatureIcon}>✨</span>
              <span>AI Wedding Concierge grounded in verified planning knowledge</span>
            </div>
            <div className={styles.leftFeature}>
              <span className={styles.leftFeatureIcon}>📊</span>
              <span>Reconciled Budget Ledger & Milestone Tracking</span>
            </div>
            <div className={styles.leftFeature}>
              <span className={styles.leftFeatureIcon}>📋</span>
              <span>Dynamic milestones recalculated when your event date shifts</span>
            </div>
            <div className={styles.leftFeature}>
              <span className={styles.leftFeatureIcon}>🤝</span>
              <span>Curated specialist directory verified by OVAimagination Events</span>
            </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            <Link 
              href="/demo" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: '#d4af37', 
                textDecoration: 'none', 
                fontSize: '0.9rem', 
                fontWeight: 600,
                background: 'rgba(212, 175, 55, 0.1)',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(212, 175, 55, 0.25)'
              }}
            >
              <span>🔍 Explore Interactive Demo Workspace →</span>
            </Link>
          </div>
        </div>
        <div className={styles.leftDecoLine}></div>
      </div>

      {/* Right panel - Form */}
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>
              {activeTab === 'signup' ? 'Create Your Account' : 'Welcome Back'}
            </h1>
            <p className={styles.formSubtitle}>
              {activeTab === 'signup' 
                ? 'Join Elysian Concierge to begin planning your wedding' 
                : 'Sign in to access your wedding workspace'}
            </p>
          </div>

          {/* Sign Up / Login Tabs */}
          <div className={styles.tabs}>
            <button 
              type="button" 
              className={`${styles.tab} ${activeTab === 'signup' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </button>
            <button 
              type="button" 
              className={`${styles.tab} ${activeTab === 'login' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Sign In
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Role selector on Sign Up (Step 2: Admin removed from public registration) */}
            {activeTab === 'signup' && (
              <div className={styles.roleSelector}>
                <span className={styles.label}>I am planning as a:</span>
                <div className={styles.roleButtons}>
                  <button 
                    type="button"
                    className={`${styles.roleButton} ${role === 'couple' ? styles.roleButtonActive : ''}`}
                    onClick={() => setRole('couple')}
                  >
                    💍 Couple
                  </button>
                  <button 
                    type="button"
                    className={`${styles.roleButton} ${role === 'vendor' ? styles.roleButtonActive : ''}`}
                    onClick={() => setRole('vendor')}
                  >
                    🏛️ Vendor Partner
                  </button>
                  <button 
                    type="button"
                    className={`${styles.roleButton} ${role === 'planner' ? styles.roleButtonActive : ''}`}
                    onClick={() => setRole('planner')}
                  >
                    📋 Planner Coordinator
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'signup' && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Your Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Sarah Jenkins"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                />
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </div>
            )}

            {activeTab === 'signup' && role === 'couple' && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Partner's Full Name</label>
                <input 
                  type="text" 
                  name="partnerName"
                  placeholder="David Sterling"
                  value={formData.partnerName}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.partnerName ? styles.inputError : ''}`}
                />
                {errors.partnerName && <span className={styles.errorText}>{errors.partnerName}</span>}
              </div>
            )}

            {activeTab === 'signup' && role === 'vendor' && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Select Your Business Categories</label>
                <div className={styles.categoryGrid}>
                  {VENDOR_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    return (
                      <div 
                        key={cat.id} 
                        onClick={() => toggleCategory(cat.id)}
                        className={`${styles.categoryTag} ${isSelected ? styles.categoryTagActive : ''}`}
                      >
                        {cat.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'signup' && role === 'vendor' && selectedCategories.map((catId) => {
              const details = businessesDetails[catId] || { name: '', rate: '', website: '', notes: '' };
              const nameError = errors[`business_name_${catId}`];
              return (
                <div key={catId} className={styles.businessCard}>
                  <div className={styles.businessCardHeader}>💼 {catId} Details</div>
                  
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Business Display Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Luminary Studios LLC"
                      value={details.name}
                      onChange={(e) => handleBusinessDetailChange(catId, 'name', e.target.value)}
                      className={`${styles.input} ${nameError ? styles.inputError : ''}`}
                    />
                    {nameError && <span className={styles.errorText}>{nameError}</span>}
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Starting Package Rate ($)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 3500"
                      value={details.rate}
                      onChange={(e) => handleBusinessDetailChange(catId, 'rate', e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Website URL</label>
                    <input 
                      type="text" 
                      placeholder="https://luminarystudios.com"
                      value={details.website}
                      onChange={(e) => handleBusinessDetailChange(catId, 'website', e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>
              );
            })}

            <div className={styles.inputGroup}>
              <label className={styles.label}>Email Address</label>
              <input 
                type="email" 
                name="email"
                placeholder="sarah.david@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              />
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Password (minimum 8 characters)</label>
              <input 
                type="password" 
                name="password"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              />
              {errors.password && <span className={styles.errorText}>{errors.password}</span>}
            </div>

            {activeTab === 'login' && (
              <button 
                type="button" 
                onClick={() => {
                  setResetSent(false);
                  setResetModalOpen(true);
                }}
                className={styles.forgotLink}
                style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'right' }}
              >
                Forgot Password?
              </button>
            )}

            {activeTab === 'signup' && (
              <div className={styles.checkboxRow}>
                <input 
                  type="checkbox" 
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <label htmlFor="agreeToTerms" className={styles.checkboxLabel}>
                  I agree to the <Link href="/terms" target="_blank">Terms of Service</Link> and{' '}
                  <Link href="/privacy" target="_blank">Privacy Policy</Link>
                </label>
              </div>
            )}
            {errors.agreeToTerms && (
              <span className={styles.errorText} style={{ marginTop: '-12px' }}>
                {errors.agreeToTerms}
              </span>
            )}

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (activeTab === 'signup' ? 'Create My Workspace' : 'Sign In')}
            </button>

            <div className={styles.divider}>
              <div className={styles.dividerLine}></div>
              <span className={styles.dividerText}>or</span>
              <div className={styles.dividerLine}></div>
            </div>

            <button 
              type="button" 
              onClick={handleGoogleLogin} 
              className={styles.googleBtn}
              disabled={isLoading}
            >
              <span className={styles.googleIcon}>
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              </span>
              Continue with Google
            </button>
          </form>

          <p className={styles.switchText}>
            {activeTab === 'signup' ? 'Already have an account?' : "Don't have an account?"}
            <button 
              type="button" 
              className={styles.switchLink}
              onClick={() => {
                setActiveTab(activeTab === 'signup' ? 'login' : 'signup');
                setErrors({});
              }}
            >
              {activeTab === 'signup' ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>

      {/* Password Reset Modal (Step 12) */}
      {resetModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 25, 47, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '16px'
        }}>
          <div style={{
            background: '#0d1b2a',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '420px',
            width: '100%',
            color: '#f5f0e8',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: '#d4af37', margin: 0, fontSize: '1.25rem' }}>
                Reset Password
              </h3>
              <button 
                onClick={() => setResetModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#a0937d', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            {resetSent ? (
              <div>
                <p style={{ fontSize: '0.9rem', color: '#4ade80', marginBottom: '16px' }}>
                  ✓ A single-use, secure password recovery link has been dispatched to <strong>{resetEmail}</strong> (valid for 15 minutes).
                </p>
                <button 
                  onClick={() => setResetModalOpen(false)} 
                  className={styles.submitBtn}
                  style={{ width: '100%' }}
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendPasswordReset}>
                <p style={{ fontSize: '0.85rem', color: '#a0937d', marginBottom: '16px' }}>
                  Enter your registered account email. We will send an expiring single-use reset link.
                </p>
                <div style={{ marginBottom: '16px' }}>
                  <input 
                    type="email" 
                    required 
                    placeholder="sarah@example.com"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    className={styles.input}
                  />
                </div>
                <button type="submit" className={styles.submitBtn} style={{ width: '100%' }}>
                  Send Recovery Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
