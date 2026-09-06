'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

const VENDOR_CATEGORIES = [
  { id: 'Wedding Planners & Coordinators', name: '📋 Planners & Coordinators' },
  { id: 'Venues', name: '🏛️ Venues' },
  { id: 'Caterers', name: '🍽️ Caterers' },
  { id: 'Photographers', name: '📸 Photographers' },
  { id: 'Videographers', name: '🎥 Videographers' },
  { id: 'Florists', name: '💐 Florists' },
  { id: 'DJs', name: '🎵 DJs' },
  { id: 'Live Bands & Musicians', name: '🎸 Live Bands & Musicians' },
  { id: 'Makeup Artists', name: '💄 Makeup Artists' },
  { id: 'Hairstylists', name: '💈 Hairstylists' },
  { id: 'Decor & Rental Companies', name: '✨ Decor & Rental' },
  { id: 'Wedding Cake Bakers', name: '🎂 Cake Bakers' },
  { id: 'Bartending Services', name: '🍷 Bartending' },
  { id: 'Bridal Boutiques', name: '👗 Bridal Boutiques' },
  { id: 'Tuxedo & Suit Rentals', name: '🤵 Tuxedo Rentals' },
  { id: 'Transportation Services', name: '🚗 Transportation' },
  { id: 'Officiants', name: '⛪ Officiants' },
  { id: 'Content Creators', name: '📱 Content Creators' },
  { id: 'Stationery & Invitation Designers', name: '✉️ Stationery & Invitations' },
  { id: 'Lighting & Production Companies', name: '💡 Lighting & Production' },
  { id: 'More', name: '➕ More Option' },
];

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('signup'); // 'signup' or 'login'
  const [role, setRole] = useState('couple'); // 'couple' or 'vendor' or 'admin'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    partnerName: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Multi-business state
  const [selectedCategories, setSelectedCategories] = useState(['Wedding Planners & Coordinators']);
  const [businessesDetails, setBusinessesDetails] = useState({
    'Wedding Planners & Coordinators': { name: '', rate: '', website: '', notes: '' }
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error
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
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (activeTab === 'signup') {
      if (!formData.name) newErrors.name = 'Full name is required';
      
      if (role === 'couple' && !formData.partnerName) {
        newErrors.partnerName = "Partner's name is required";
      }

      if (role === 'vendor') {
        selectedCategories.forEach((catId) => {
          if (!businessesDetails[catId]?.name?.trim()) {
            newErrors[`business_name_${catId}`] = `Business name is required for ${catId}`;
          }
        });
      }

      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the Terms & Conditions';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API Request
    setTimeout(() => {
      setIsLoading(false);
      
      const businessesArray = selectedCategories.map((catId) => ({
        category: catId,
        name: businessesDetails[catId]?.name || formData.name + ' ' + catId,
        rate: Number(businessesDetails[catId]?.rate) || 3500,
        website: businessesDetails[catId]?.website || '',
        notes: businessesDetails[catId]?.notes || '',
      }));

      // Setup user details
      const user = {
        name: role === 'couple' 
          ? `${formData.name} & ${formData.partnerName || 'Partner'}` 
          : (role === 'vendor' ? (businessesArray[0]?.name || formData.name) : formData.name || 'Admin User'),
        email: formData.email,
        role: role,
        weddingDate: role === 'couple' ? '2027-07-15' : null,
        location: role === 'couple' ? 'Malibu, CA' : null,
        budget: role === 'couple' ? 50000 : null,
        theme: role === 'couple' ? 'Elegant Navy & Gold' : null,
        aiCredits: role === 'admin' ? 9999 : (role === 'vendor' ? 100 : 15),
        onboardingComplete: activeTab === 'login', // if log in, skip onboarding
        vendorCategory: role === 'vendor' ? selectedCategories[0] : null,
        businesses: role === 'vendor' ? businessesArray : null,
      };

      localStorage.setItem('wedding_user', JSON.stringify(user));
      // Trigger update for Navbar
      window.dispatchEvent(new Event('wedding_store_update'));

      if (activeTab === 'signup') {
        if (role === 'couple') {
          router.push('/onboarding');
        } else if (role === 'vendor') {
          router.push('/vendor-portal');
        } else {
          router.push('/admin');
        }
      } else {
        // Logging in
        if (role === 'couple') {
          router.push('/dashboard');
        } else if (role === 'vendor') {
          router.push('/vendor-portal');
        } else {
          router.push('/admin');
        }
      }
    }, 1200);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user = {
        name: 'Alex & Jordan',
        email: 'alex.jordan@gmail.com',
        role: 'couple',
        weddingDate: '2027-07-15',
        location: 'Malibu, CA',
        budget: 50000,
        theme: 'Elegant Navy & Gold',
        aiCredits: 15,
        onboardingComplete: false,
      };
      localStorage.setItem('wedding_user', JSON.stringify(user));
      window.dispatchEvent(new Event('wedding_store_update'));
      router.push('/onboarding');
    }, 1000);
  };

  return (
    <div className={styles.authPage}>
      {/* Left panel - Branding and Features */}
      <div className={styles.leftPanel}>
        <div className={styles.leftRing + ' ' + styles.leftRing1}></div>
        <div className={styles.leftRing + ' ' + styles.leftRing2}></div>
        <div className={styles.leftRing + ' ' + styles.leftRing3}></div>
        
        <div className={styles.leftContent}>
          <Link href="/" className={styles.leftBrand}>VND</Link>
          <h2 className={styles.leftTagline}>Elevate Your Wedding Planning Experience</h2>
          <p className={styles.leftSubtext}>
            Connect with AI-guided tools, manage checklists, coordinate budgets, and collaborate with vendors in one elegant dark-navy & gold suite.
          </p>

          <div className={styles.leftFeatures}>
            <div className={styles.leftFeature}>
              <span className={styles.leftFeatureIcon}>✨</span>
              <span>AI Wedding Concierge powered by expert knowledge</span>
            </div>
            <div className={styles.leftFeature}>
              <span className={styles.leftFeatureIcon}>📊</span>
              <span>Visual Budget Health & Payment Trackers</span>
            </div>
            <div className={styles.leftFeature}>
              <span className={styles.leftFeatureIcon}>📋</span>
              <span>Intelligent checklists tailored to your wedding date</span>
            </div>
            <div className={styles.leftFeature}>
              <span className={styles.leftFeatureIcon}>🤝</span>
              <span>Direct matchmaking with OVAimagination vetted vendors</span>
            </div>
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
                ? 'Join VND to start planning your dream wedding' 
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
              Log In
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Role selector on Sign Up */}
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
                    🏛️ Vendor
                  </button>
                  <button 
                    type="button"
                    className={`${styles.roleButton} ${role === 'admin' ? styles.roleButtonActive : ''}`}
                    onClick={() => setRole('admin')}
                  >
                    🛡️ Admin
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'signup' && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Full Name</label>
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
                  placeholder="David Smith"
                  value={formData.partnerName}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.partnerName ? styles.inputError : ''}`}
                />
                {errors.partnerName && <span className={styles.errorText}>{errors.partnerName}</span>}
              </div>
            )}

            {activeTab === 'signup' && role === 'vendor' && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Select Your Business Categories (Select multiple if applicable)</label>
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
                    <label className={styles.label}>Business Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Dream Planners LLC"
                      value={details.name}
                      onChange={(e) => handleBusinessDetailChange(catId, 'name', e.target.value)}
                      className={`${styles.input} ${nameError ? styles.inputError : ''}`}
                    />
                    {nameError && <span className={styles.errorText}>{nameError}</span>}
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Starting Rate ($)</label>
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
                      placeholder="e.g. www.dreamplanners.com"
                      value={details.website}
                      onChange={(e) => handleBusinessDetailChange(catId, 'website', e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Service Description & Notes</label>
                    <textarea 
                      placeholder="e.g. Custom styling, timeline coordination."
                      value={details.notes}
                      onChange={(e) => handleBusinessDetailChange(catId, 'notes', e.target.value)}
                      className={styles.input}
                      style={{ minHeight: '60px', fontFamily: 'inherit', resize: 'vertical' }}
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
                placeholder="sarah.david@love.com"
                value={formData.email}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              />
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Password</label>
              <input 
                type="password" 
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              />
              {errors.password && <span className={styles.errorText}>{errors.password}</span>}
            </div>

            {activeTab === 'login' && (
              <a className={styles.forgotLink}>Forgot Password?</a>
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
                  I agree to the <Link href="/terms">Terms of Service</Link> and{' '}
                  <Link href="/privacy">Privacy Policy</Link>
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
              {isLoading ? 'Processing...' : (activeTab === 'signup' ? 'Get Started' : 'Log In')}
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
              <span className={styles.googleIcon}><svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg></span>
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
              {activeTab === 'signup' ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
