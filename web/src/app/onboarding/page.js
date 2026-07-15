'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import styles from './page.module.css';

const STEPS = [
  { num: 1, label: 'Profile' },
  { num: 2, label: 'Date & Location' },
  { num: 3, label: 'Budget' },
  { num: 4, label: 'Theme Style' },
  { num: 5, label: 'Generating Plan' },
];

const STYLE_OPTIONS = [
  { emoji: '✨', name: 'Elegant Navy & Gold', desc: 'Regal, premium, and sophisticated design.' },
  { emoji: '🌿', name: 'Modern Minimalist', desc: 'Clean lines, monochromatic, and sleek.' },
  { emoji: '🪵', name: 'Rustic Chic', desc: 'Warm wood tones, wild florals, and organic.' },
  { emoji: '🌊', name: 'Coastal Romance', desc: 'Soft pastel tones, sandy hues, and relaxed.' },
  { emoji: '🕯️', name: 'Vintage Glamour', desc: 'Art deco, candlelit, and historic feel.' },
  { emoji: '🎨', name: 'Creative DIY', desc: 'Colorful, hand-crafted, and personal details.' },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    partnerA: '',
    partnerB: '',
    weddingDate: '2027-07-15',
    location: 'Malibu, CA',
    budget: 50000,
    theme: 'Elegant Navy & Gold',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  // Load initial user details
  useEffect(() => {
    try {
      const stored = localStorage.getItem('wedding_user');
      if (stored) {
        const user = JSON.parse(stored);
        const nameParts = user.name ? user.name.split('&') : ['', ''];
        setFormData((prev) => ({
          ...prev,
          partnerA: nameParts[0]?.trim() || user.name || '',
          partnerB: nameParts[1]?.trim() || '',
          weddingDate: user.weddingDate || '2027-07-15',
          location: user.location || 'Malibu, CA',
          budget: user.budget || 50000,
          theme: user.theme || 'Elegant Navy & Gold',
        }));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep === 4) {
      setCurrentStep(5);
      setIsGenerating(true);
      
      const onboardingData = {
        name: `${formData.partnerA} & ${formData.partnerB}`,
        role: 'couple',
        weddingDate: formData.weddingDate,
        location: formData.location,
        budget: Number(formData.budget),
        theme: formData.theme,
        onboardingComplete: true,
      };

      if (api.isAuthenticated()) {
        api.updateProfile(onboardingData)
          .then(() => {
            setIsGenerating(false);
            window.dispatchEvent(new Event('wedding_store_update'));
            router.push('/dashboard');
          })
          .catch((err) => {
            console.error('Onboarding update error:', err);
            setIsGenerating(false);
            router.push('/dashboard');
          });
      } else {
        // Simulate generating checklist and budget breakdown
        setTimeout(() => {
          setIsGenerating(false);
          const user = {
            ...onboardingData,
            aiCredits: 15,
          };
          
          localStorage.setItem('wedding_user', JSON.stringify(user));

          // Helper to get relative due dates based on selected wedding date
          const getRelativeDateStr = (daysBefore) => {
            try {
              const wDate = new Date(formData.weddingDate);
              wDate.setDate(wDate.getDate() - daysBefore);
              return wDate.toISOString().split('T')[0];
            } catch {
              return formData.weddingDate;
            }
          };

          // Generate custom budget breakdown (actual starts at 0, no pre-entered payments)
          const totalBudget = Number(formData.budget);
          const customBudget = {
            total: totalBudget,
            categories: [
              { name: 'Venue', estimated: Math.round(totalBudget * 0.36), actual: 0, color: '#6366f1' },
              { name: 'Catering', estimated: Math.round(totalBudget * 0.20), actual: 0, color: '#f59e0b' },
              { name: 'Planner', estimated: Math.round(totalBudget * 0.10), actual: 0, color: '#e2c992' },
              { name: 'Photography', estimated: Math.round(totalBudget * 0.08), actual: 0, color: '#ec4899' },
              { name: 'Florals', estimated: Math.round(totalBudget * 0.10), actual: 0, color: '#10b981' },
              { name: 'Music', estimated: Math.round(totalBudget * 0.05), actual: 0, color: '#3b82f6' },
              { name: 'Attire', estimated: Math.round(totalBudget * 0.08), actual: 0, color: '#f472b6' },
              { name: 'Misc', estimated: Math.round(totalBudget * 0.03), actual: 0, color: '#94a3b8' },
            ],
            payments: []
          };
          localStorage.setItem('wedding_budget', JSON.stringify(customBudget));

          // Clear guest-specific vendors and guests for custom onboarding
          localStorage.setItem('wedding_vendors', JSON.stringify([]));
          localStorage.setItem('wedding_guests', JSON.stringify([]));

          // Set up custom checklist tasks with relative due dates
          const baseTasks = [
            { id: 't1', title: `Lock in the final budget of $${formData.budget.toLocaleString()}`, category: 'Planner', period: '12+ Months', completed: true, dueDate: getRelativeDateStr(365), notes: `Target styling: ${formData.theme}`, assignedTo: 'Both' },
            { id: 't2', title: 'Compile drafts for guest count', category: 'Invitations', period: '12+ Months', completed: false, dueDate: getRelativeDateStr(350), notes: 'Initial target: 150 guests', assignedTo: 'Both' },
            { id: 't3', title: `Research and book a venue in ${formData.location}`, category: 'Venue', period: '12+ Months', completed: false, dueDate: getRelativeDateStr(330), notes: '', assignedTo: 'Both' },
            { id: 't4', title: 'Schedule wedding consultation with planners', category: 'Planner', period: '12+ Months', completed: false, dueDate: getRelativeDateStr(320), notes: '', assignedTo: 'Both' },
            { id: 't5', title: 'Announce wedding to immediate families & wedding party', category: 'Misc', period: '9 Months', completed: false, dueDate: getRelativeDateStr(270), notes: '', assignedTo: 'Both' },
            { id: 't6', title: 'Book Photographer & Videographer for couple shoots', category: 'Photography', period: '9 Months', completed: false, dueDate: getRelativeDateStr(250), notes: '', assignedTo: 'Bride' },
            { id: 't7', title: `Design styling mockups matching ${formData.theme}`, category: 'Decor', period: '6 Months', completed: false, dueDate: getRelativeDateStr(180), notes: '', assignedTo: 'Bride' },
            { id: 't8', title: 'Design and print wedding invitations', category: 'Invitations', period: '6 Months', completed: false, dueDate: getRelativeDateStr(170), notes: '', assignedTo: 'Both' },
            { id: 't9', title: 'Order the wedding cake', category: 'Bakery', period: '3 Months', completed: false, dueDate: getRelativeDateStr(90), notes: '', assignedTo: 'Bride' },
            { id: 't10', title: 'Apply for marriage license', category: 'Misc', period: '1 Month', completed: false, dueDate: getRelativeDateStr(30), notes: '', assignedTo: 'Both' },
            { id: 't11', title: 'Have final styling walk-through with florist and coordinator', category: 'Planner', period: '1 Month', completed: false, dueDate: getRelativeDateStr(25), notes: '', assignedTo: 'Both' },
            { id: 't12', title: 'Write personal wedding vows', category: 'Officiant', period: '1 Month', completed: false, dueDate: getRelativeDateStr(7), notes: 'VND AI can help generate these!', assignedTo: 'Both' },
            { id: 't13', title: 'Deliver rings & signed marriage license to Best Man', category: 'Rings', period: 'Day-Of', completed: false, dueDate: formData.weddingDate, notes: '', assignedTo: 'Groom' },
            { id: 't14', title: 'Relax and celebrate!', category: 'Misc', period: 'Day-Of', completed: false, dueDate: formData.weddingDate, notes: '', assignedTo: 'Both' }
          ];
          localStorage.setItem('wedding_tasks', JSON.stringify(baseTasks));

          // Set up timeline template (with status Pending)
          const baseTimeline = [
            { id: 'tl1', time: '08:00 AM', title: 'Hair and Makeup Starts', location: 'Bridal Suite', desc: 'Bridesmaids and mother of the bride first.', status: 'Pending' },
            { id: 'tl2', time: '10:00 AM', title: 'Groomsmen Getting Ready', location: 'Groom Suite', desc: 'Groom and groomsmen dress.', status: 'Pending' },
            { id: 'tl3', time: '12:30 PM', title: 'First Look & Couple Portraits', location: 'Grand Garden', desc: 'Private first look.', status: 'Pending' },
            { id: 'tl4', time: '01:30 PM', title: 'Wedding Party & Family Photos', location: 'Grand Garden', desc: 'Family and wedding party portraits.', status: 'Pending' },
            { id: 'tl5', time: '03:30 PM', title: 'Groom & Guests Arrival', location: 'Pavilion Lawn', desc: 'Ushers stand in position.', status: 'Pending' },
            { id: 'tl6', time: '04:00 PM', title: 'Wedding Ceremony', location: 'Pavilion Lawn', desc: 'Processional starts. Recessional at 04:35 PM.', status: 'Pending' },
            { id: 'tl7', time: '04:40 PM', title: 'Cocktail Hour', location: 'Ocean View Terrace', desc: 'Guests enjoy appetizers and drinks.', status: 'Pending' },
            { id: 'tl8', time: '05:45 PM', title: 'Grand Entrance & First Dance', location: 'Gold Ballroom', desc: 'Grand entrance of bride/groom.', status: 'Pending' },
            { id: 'tl9', time: '06:00 PM', title: 'Dinner Service & Speeches', location: 'Gold Ballroom', desc: 'Plated dinner served and toasts given.', status: 'Pending' },
            { id: 'tl10', time: '08:00 PM', title: 'Dance Floor Opens & Cake Cutting', location: 'Gold Ballroom', desc: 'Cake cut at 08:30 PM.', status: 'Pending' },
            { id: 'tl11', time: '11:00 PM', title: 'Grand Send-off', location: 'Front Portico', desc: 'Guests line up for sparkler exit.', status: 'Pending' },
          ];
          localStorage.setItem('wedding_timeline', JSON.stringify(baseTimeline));
          
          window.dispatchEvent(new Event('wedding_store_update'));
          router.push('/dashboard');
        }, 2500);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const getProgressWidth = () => {
    return `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`;
  };

  return (
    <div className={styles.onboardingPage}>
      <Link href="/" className={styles.brand}>VND</Link>

      {/* Progress Steps */}
      <div className={styles.progressContainer}>
        <div className={styles.progressSteps}>
          <div className={styles.progressLine}>
            <div 
              className={styles.progressLineFill} 
              style={{ width: getProgressWidth() }}
            ></div>
          </div>
          {STEPS.map((step) => {
            const isActive = currentStep === step.num;
            const isDone = currentStep > step.num;
            return (
              <div key={step.num} className={styles.progressStep}>
                <div 
                  className={`${styles.progressDot} ${
                    isActive ? styles.progressDotActive : ''
                  } ${isDone ? styles.progressDotDone : ''}`}
                >
                  {isDone ? '✓' : step.num}
                </div>
                <span 
                  className={`${styles.progressLabel} ${
                    isActive ? styles.progressLabelActive : ''
                  } ${isDone ? styles.progressLabelDone : ''}`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Steps Content */}
      <div className={styles.stepWrapper}>
        <div className={styles.stepContent}>
          {currentStep === 1 && (
            <div>
              <div className={styles.stepIcon}>💍</div>
              <h2 className={styles.stepTitle}>Let's start with your names</h2>
              <p className={styles.stepSubtitle}>
                Tell us about you and your partner. We will customize your planning workspace.
              </p>
              
              <div className={styles.partnersRow}>
                <div className={`${styles.inputGroup} ${styles.partnerField}`}>
                  <label className={styles.label}>Your Name</label>
                  <input 
                    type="text" 
                    placeholder="Sarah Jenkins"
                    value={formData.partnerA}
                    onChange={(e) => handleInputChange('partnerA', e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.heartDeco}>❤️</div>
                <div className={`${styles.inputGroup} ${styles.partnerField}`}>
                  <label className={styles.label}>Your Partner's Name</label>
                  <input 
                    type="text" 
                    placeholder="David Smith"
                    value={formData.partnerB}
                    onChange={(e) => handleInputChange('partnerB', e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className={styles.stepIcon}>📅</div>
              <h2 className={styles.stepTitle}>Date and Location</h2>
              <p className={styles.stepSubtitle}>
                When and where is the big day? (Don't worry, you can change this later).
              </p>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Wedding Date</label>
                <input 
                  type="date" 
                  value={formData.weddingDate}
                  onChange={(e) => handleInputChange('weddingDate', e.target.value)}
                  className={`${styles.input} ${styles.dateInput}`}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Wedding Location</label>
                <input 
                  type="text" 
                  placeholder="Malibu, CA"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <div className={styles.stepIcon}>💰</div>
              <h2 className={styles.stepTitle}>Set Your Wedding Budget</h2>
              <p className={styles.stepSubtitle}>
                We will distribute this budget automatically across typical wedding categories.
              </p>

              <div className={styles.sliderGroup}>
                <div className={styles.sliderValue}>
                  ${Number(formData.budget).toLocaleString()}
                </div>
                <input 
                  type="range" 
                  min="5000" 
                  max="200000" 
                  step="5000"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', Number(e.target.value))}
                  className={styles.slider}
                />
                <div className={styles.sliderLabels}>
                  <span>$5,000</span>
                  <span>$100,000</span>
                  <span>$200,000+</span>
                </div>
              </div>

              <div className={styles.budgetDivider}>or select a standard budget</div>

              <div className={styles.budgetGrid}>
                {[25000, 50000, 75000, 100000, 150000].map((preset) => (
                  <button 
                    key={preset}
                    type="button"
                    className={`${styles.budgetBtn} ${formData.budget === preset ? styles.budgetBtnActive : ''}`}
                    onClick={() => handleInputChange('budget', preset)}
                  >
                    ${preset.toLocaleString()}
                  </button>
                ))}
              </div>
              <p className={styles.budgetNote}>
                Note: Planners at OVAimagination recommend $30k - $70k for a luxury beach or ballroom boutique wedding in Malibu.
              </p>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <div className={styles.stepIcon}>✨</div>
              <h2 className={styles.stepTitle}>Select Your Wedding Aesthetic</h2>
              <p className={styles.stepSubtitle}>
                This sets your design system accent color and tailored theme styling guidelines.
              </p>

              <div className={styles.styleGrid}>
                {STYLE_OPTIONS.map((opt) => (
                  <div 
                    key={opt.name}
                    className={`${styles.styleCard} ${formData.theme === opt.name ? styles.styleCardActive : ''}`}
                    onClick={() => handleInputChange('theme', opt.name)}
                  >
                    <span className={styles.styleEmoji}>{opt.emoji}</span>
                    <h3 className={styles.styleName}>{opt.name}</h3>
                    <p className={styles.styleDesc}>{opt.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className={styles.stepIcon}>⚙️</div>
              <h2 className={styles.stepTitle}>Creating Your Dream Plan...</h2>
              <p className={styles.stepSubtitle}>
                VND AI and OVAimagination are building your customized checklist, timeline schedule, and budget trackers.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '40px' }}>
                <div style={{ width: '50px', height: '50px', border: '3px solid rgba(201, 169, 110, 0.15)', borderTopColor: '#c9a96e', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <span style={{ fontSize: '0.9rem', color: '#a0937d', animation: 'pulse 1.5s infinite', marginTop: '10px' }}>
                  Distributing budget across 8 categories...
                </span>
              </div>
              
              <style jsx global>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
                @keyframes pulse {
                  0%, 100% { opacity: 0.6; }
                  50% { opacity: 1; }
                }
              `}</style>
            </div>
          )}

          {/* Navigation Controls */}
          {currentStep < 5 && (
            <div className={styles.navigation}>
              {currentStep > 1 ? (
                <button 
                  type="button" 
                  className={styles.backBtn}
                  onClick={handleBack}
                >
                  Back
                </button>
              ) : (
                <div style={{ width: '1px' }}></div>
              )}
              
              <button 
                type="button" 
                className={styles.nextBtn}
                onClick={handleNext}
                disabled={currentStep === 1 && (!formData.partnerA || !formData.partnerB)}
              >
                {currentStep === 4 ? 'Generate Workspace' : 'Continue'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
