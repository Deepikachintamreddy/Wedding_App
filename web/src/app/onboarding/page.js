'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Monogram from '@/components/Monogram';
import styles from './page.module.css';

const STEPS = [
  { num: 1, label: 'Couple Profile' },
  { num: 2, label: 'Date & City' },
  { num: 3, label: 'Target Budget' },
  { num: 4, label: 'Aesthetic & Style' },
  { num: 5, label: 'Creating Workspace' },
];

const STYLE_OPTIONS = [
  { emoji: '✨', name: 'Elegant Navy & Champagne Gold', desc: 'Regal, timeless, and sophisticated luxury design.' },
  { emoji: '🌿', name: 'Modern Minimalist', desc: 'Clean lines, monochromatic textures, and contemporary spaces.' },
  { emoji: '🪵', name: 'Rustic Chic', desc: 'Warm wood tones, wild organic florals, and candlelight.' },
  { emoji: '🌊', name: 'Coastal Romance', desc: 'Soft ocean hues, breezy linens, and relaxed elegance.' },
  { emoji: '🕯️', name: 'Vintage Glamour', desc: 'Art deco, crystal chandeliers, and historic charm.' },
  { emoji: '🎨', name: 'Bespoke Contemporary', desc: 'Bold palette, curated art pieces, and architectural florals.' },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    partnerA: '',
    partnerB: '',
    weddingDate: '2027-07-15',
    location: 'Malibu, CA',
    budget: 50000,
    theme: 'Elegant Navy & Champagne Gold',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  // Load initial user or profile details if available
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('elysian_user') || localStorage.getItem('wedding_user');
      const storedProfile = localStorage.getItem('elysian_event_profile') || localStorage.getItem('wedding_event_profile');
      
      let profile = {};
      if (storedProfile) {
        profile = JSON.parse(storedProfile);
      }

      if (storedUser) {
        const user = JSON.parse(storedUser);
        const nameParts = (profile.partnerA && profile.partnerB) 
          ? [profile.partnerA, profile.partnerB] 
          : (user.name ? user.name.split('&') : ['', '']);
        
        setFormData((prev) => ({
          ...prev,
          partnerA: profile.partnerA || nameParts[0]?.trim() || user.name || '',
          partnerB: profile.partnerB || nameParts[1]?.trim() || '',
          weddingDate: profile.weddingDate || user.weddingDate || '2027-07-15',
          location: profile.location || user.location || 'Malibu, CA',
          budget: profile.budget || user.budget || 50000,
          theme: profile.theme || user.theme || 'Elegant Navy & Champagne Gold',
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
      
      setTimeout(() => {
        setIsGenerating(false);
        const coupleName = `${formData.partnerA.trim()} & ${formData.partnerB.trim()}`;
        const totalBudget = Number(formData.budget);

        const user = {
          name: coupleName,
          email: 'couple@example.com',
          role: 'couple',
          weddingDate: formData.weddingDate,
          location: formData.location,
          budget: totalBudget,
          theme: formData.theme,
          onboardingComplete: true,
          aiCredits: 20,
          isDemo: false
        };

        const eventProfile = {
          coupleNames: coupleName,
          partnerA: formData.partnerA.trim(),
          partnerB: formData.partnerB.trim(),
          weddingDate: formData.weddingDate,
          location: formData.location,
          venueName: 'Pending Venue Selection',
          guestCount: 120,
          budget: totalBudget,
          theme: formData.theme,
          primaryColor: '#0A192F',
          secondaryColor: '#D4AF37',
          countdownTarget: formData.weddingDate,
          plannerPartner: 'OVAimagination Events',
          collaborators: [
            { name: formData.partnerB.trim(), role: 'Partner', email: 'partner@example.com', status: 'Accepted' },
            { name: 'OVAimagination Concierge Team', role: 'Planner', email: 'concierge@ovaimagination.com', status: 'Accepted' }
          ]
        };
        
        localStorage.setItem('elysian_user', JSON.stringify(user));
        localStorage.setItem('elysian_event_profile', JSON.stringify(eventProfile));
        
        // Generate custom budget breakdown
        const customBudget = {
          total: totalBudget,
          categories: [
            { name: 'Venue', planned: Math.round(totalBudget * 0.35), contracted: 0, paid: 0, color: '#0A192F' },
            { name: 'Catering & Bar', planned: Math.round(totalBudget * 0.22), contracted: 0, paid: 0, color: '#D4AF37' },
            { name: 'Planner & Concierge', planned: Math.round(totalBudget * 0.10), contracted: 0, paid: 0, color: '#4A5568' },
            { name: 'Photography & Film', planned: Math.round(totalBudget * 0.10), contracted: 0, paid: 0, color: '#805AD5' },
            { name: 'Florals & Decor', planned: Math.round(totalBudget * 0.10), contracted: 0, paid: 0, color: '#319795' },
            { name: 'Music & Entertainment', planned: Math.round(totalBudget * 0.05), contracted: 0, paid: 0, color: '#DD6B20' },
            { name: 'Attire & Beauty', planned: Math.round(totalBudget * 0.05), contracted: 0, paid: 0, color: '#D53F8C' },
            { name: 'Stationery & Misc', planned: Math.round(totalBudget * 0.03), contracted: 0, paid: 0, color: '#718096' },
          ],
          payments: []
        };
        localStorage.setItem('elysian_budget', JSON.stringify(customBudget));

        // Generate custom checklist tasks
        const baseTasks = [
          { id: 't1', title: `Lock in the final budget target of $${totalBudget.toLocaleString()}`, category: 'Planner', period: '12+ Months', completed: true, dueDate: '2026-06-15', notes: `Target styling: ${formData.theme}`, assignedTo: 'Both' },
          { id: 't2', title: 'Compile preliminary guest list (approx 120 guests)', category: 'Invitations', period: '12+ Months', completed: false, dueDate: '2026-06-25', notes: 'Initial target from onboarding', assignedTo: 'Both' },
          { id: 't3', title: `Research and tour wedding venues in ${formData.location}`, category: 'Venue', period: '12+ Months', completed: false, dueDate: '2026-07-15', notes: '', assignedTo: 'Both' },
          { id: 't4', title: 'Schedule wedding styling consultation with OVAimagination Events', category: 'Planner', period: '12+ Months', completed: false, dueDate: '2026-07-25', notes: '', assignedTo: 'Both' },
          { id: 't5', title: 'Announce wedding dates to wedding party & immediate family', category: 'Misc', period: '9 Months', completed: false, dueDate: '2026-09-01', notes: '', assignedTo: 'Both' },
          { id: 't6', title: 'Book Photographer & Videographer for couple portraits', category: 'Photography', period: '9 Months', completed: false, dueDate: '2026-09-15', notes: '', assignedTo: 'Partner A' },
          { id: 't7', title: `Curate moodboard and styling matching ${formData.theme}`, category: 'Decor', period: '6 Months', completed: false, dueDate: '2027-01-10', notes: '', assignedTo: 'Partner A' },
          { id: 't8', title: 'Send out digital invitations and launch RSVP portal', category: 'Invitations', period: '6 Months', completed: false, dueDate: '2027-01-20', notes: '', assignedTo: 'Both' },
          { id: 't9', title: 'Schedule cake tasting & catering menu walkthrough', category: 'Catering', period: '3 Months', completed: false, dueDate: '2027-04-10', notes: '', assignedTo: 'Both' },
          { id: 't10', title: 'Apply for official marriage license', category: 'Misc', period: '1 Month', completed: false, dueDate: '2027-06-15', notes: '', assignedTo: 'Both' },
          { id: 't11', title: 'Conduct final run-through with coordinator and florist', category: 'Planner', period: '1 Month', completed: false, dueDate: '2027-06-25', notes: '', assignedTo: 'Both' },
          { id: 't12', title: 'Write heartfelt personal wedding vows', category: 'Officiant', period: '1 Month', completed: false, dueDate: '2027-07-01', notes: 'Elysian AI Concierge can help draft romantic lines', assignedTo: 'Both' },
          { id: 't13', title: 'Hand over wedding rings and vendor contacts to Best Man / Maid of Honor', category: 'Rings', period: 'Day-Of', completed: false, dueDate: formData.weddingDate, notes: '', assignedTo: 'Partner B' },
          { id: 't14', title: 'Celebrate your bespoke Elysian Wedding!', category: 'Misc', period: 'Day-Of', completed: false, dueDate: formData.weddingDate, notes: '', assignedTo: 'Both' }
        ];
        localStorage.setItem('elysian_tasks', JSON.stringify(baseTasks));

        // Initial Weekly Planning Missions
        const initialMissions = [
          {
            id: 'm1',
            title: 'Finalize Your Top 3 Venue Priorities',
            desc: `Compare available ceremony and reception spaces in ${formData.location}.`,
            reward: 5,
            dueDate: 'In 3 days',
            completed: false,
            snoozed: false
          },
          {
            id: 'm2',
            title: 'Invite Your Partner or Wedding Planner',
            desc: 'Collaborate together in real-time on budget, timeline, and RSVPs.',
            reward: 5,
            dueDate: 'This week',
            completed: false,
            snoozed: false
          },
          {
            id: 'm3',
            title: 'Review Initial Budget Allocations',
            desc: 'Adjust target percentages across Venue, Catering, and Entertainment.',
            reward: 5,
            dueDate: 'This week',
            completed: false,
            snoozed: false
          }
        ];
        localStorage.setItem('elysian_missions', JSON.stringify(initialMissions));
        
        window.dispatchEvent(new Event('elysian_store_update'));
        router.push('/dashboard');
      }, 2000);
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
      <Link href="/" className={styles.brand} aria-label="Elysian Concierge Home">
        <Monogram size={38} variant="gold" />
        <span style={{ marginLeft: '10px', fontWeight: 600, letterSpacing: '0.05em' }}>ELYSIAN CONCIERGE</span>
      </Link>

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
                Tell us about you and your partner. We will tailor your luxury planning workspace and invitations.
              </p>
              
              <div className={styles.partnersRow}>
                <div className={`${styles.inputGroup} ${styles.partnerField}`}>
                  <label className={styles.label}>Partner 1 Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.partnerA}
                    onChange={(e) => handleInputChange('partnerA', e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.heartDeco} aria-hidden="true">&</div>
                <div className={`${styles.inputGroup} ${styles.partnerField}`}>
                  <label className={styles.label}>Partner 2 Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. David Smith"
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
                When and where will you celebrate? You can fine-tune these details at any time.
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
                <label className={styles.label}>Celebration City / Destination</label>
                <input 
                  type="text" 
                  placeholder="e.g. Malibu, CA or Lake Como, Italy"
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
                We will distribute this target budget across typical luxury wedding categories.
              </p>

              <div className={styles.sliderGroup}>
                <div className={styles.sliderValue}>
                  ${Number(formData.budget).toLocaleString()}
                </div>
                <input 
                  type="range" 
                  min="5000" 
                  max="250000" 
                  step="5000"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', Number(e.target.value))}
                  className={styles.slider}
                  aria-label="Target Budget Slider"
                />
                <div className={styles.sliderLabels}>
                  <span>$5,000</span>
                  <span>$100,000</span>
                  <span>$250,000+</span>
                </div>
              </div>

              <div className={styles.budgetDivider}>or select a standard budget tier</div>

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
                Note: Planners at OVAimagination Events recommend $40k – $80k for a bespoke boutique wedding experience.
              </p>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <div className={styles.stepIcon}>✨</div>
              <h2 className={styles.stepTitle}>Select Your Wedding Aesthetic</h2>
              <p className={styles.stepSubtitle}>
                This sets your moodboard palette, invitation templates, and concierge style recommendations.
              </p>

              <div className={styles.styleGrid}>
                {STYLE_OPTIONS.map((opt) => (
                  <div 
                    key={opt.name}
                    className={`${styles.styleCard} ${formData.theme === opt.name ? styles.styleCardActive : ''}`}
                    onClick={() => handleInputChange('theme', opt.name)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleInputChange('theme', opt.name); }}
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
              <h2 className={styles.stepTitle}>Crafting Your Elysian Workspace...</h2>
              <p className={styles.stepSubtitle}>
                Elysian AI Concierge and OVAimagination are building your customized checklist, timeline milestones, and budget trackers.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '40px' }}>
                <div style={{ width: '50px', height: '50px', border: '3px solid rgba(212, 175, 55, 0.2)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <span style={{ fontSize: '0.9rem', color: '#D4AF37', marginTop: '10px' }}>
                  Distributing budget across 8 key wedding categories...
                </span>
              </div>
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
                {currentStep === 4 ? 'Launch Workspace' : 'Continue'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
