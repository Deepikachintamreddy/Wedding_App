'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import Monogram from '@/components/Monogram';

const FEATURES = [
  { icon: '✨', title: 'AI Wedding Concierge', desc: 'Context-grounded planning assistant trained in luxury coordination by OVAimagination Events.' },
  { icon: '✅', title: 'Milestone Roadmap', desc: 'Auto-calculated checklist tailored to your wedding countdown — never miss a critical vendor deadline.' },
  { icon: '💰', title: 'Reconciled Budget Tracker', desc: 'Separate planned allocations, contracted totals, deposits paid, and remaining unallocated cushions in real-time.' },
  { icon: '👥', title: 'Guest List & Live RSVPs', desc: 'Instant digital RSVP tracking, dietary preferences, table seating charts, and plus-one limits made effortless.' },
  { icon: '💒', title: 'Vetted Vendor Directory', desc: 'Browse, compare proposals, and book certified specialists with verified contracts and pricing transparency.' },
  { icon: '✉️', title: 'Digital Invitation Builder', desc: 'Curated luxury wedding website templates with audio atmospheres, dress code guides, and direct guest syncing.' },
];

const STEPS = [
  { num: 1, title: 'Set Your Wedding Vision', desc: 'Specify your wedding date, budget ceiling, location, and aesthetic styling in under two minutes.' },
  { num: 2, title: 'Receive Your Tailored Master Plan', desc: 'Elysian instantly generates your customized checklist, budget allocation framework, and countdown milestones.' },
  { num: 3, title: 'Assemble Your Creative Team', desc: 'Explore curated vendor partners vetted by OVAimagination Events and log contracts directly into your financial ledger.' },
  { num: 4, title: 'Coordinate Guests & Invitations', desc: 'Publish a bespoke digital invitation website, capture live RSVPs, and organize reception table seating effortlessly.' },
  { num: 5, title: 'Experience Seamless Day-Of Coordination', desc: 'Collaborate with your partner, planner, and vendors while the AI Concierge keeps every detail on schedule.' },
];

const FAQS = [
  { question: "What is Elysian Concierge?", answer: "Elysian Concierge is a luxury digital wedding planning suite developed in partnership with professional coordinators at OVAimagination Events. It combines intelligent milestone tracking, reconciled budget management, digital invitation publishing, and verified AI planning guidance in one private workspace." },
  { question: "How does the pricing model work?", answer: "We offer a Free Tier with 15 monthly AI concierge credits and standard planning tools. Couples can also upgrade to our popular Event Pass ($99 one-time payment) for unlimited AI conversations, digital invitation publishing, and seating chart management until their wedding day — with zero recurring monthly bills." },
  { question: "Can I use Elysian Concierge alongside a human wedding planner?", answer: "Yes! Many couples invite their OVAimagination coordinator or independent planner as a collaborator directly into their Elysian workspace to share task progress, approve floor plans, and review vendor payment milestones." },
  { question: "How does digital RSVP collection work?", answer: "When you customize and publish an Elysian digital invitation template, a unique RSVP portal is automatically generated. When guests submit their attendance and meal choices, the responses instantly populate your Guest Manager in real time." },
];

function FaqItem({ faq }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`${styles.faqItem} ${isOpen ? styles.open : ''}`}>
      <button 
        className={styles.faqQuestion} 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {faq.question}
        <span className={styles.faqIcon}>{isOpen ? '−' : '+'}</span>
      </button>
      <div className={styles.faqAnswer}>
        {faq.answer}
      </div>
    </div>
  );
}

const PRICING = [
  {
    tier: 'Free Tier',
    price: '$0',
    interval: 'Complimentary forever',
    features: ['15 AI concierge credits / month', 'Master checklist & roadmap', 'Basic budget ceiling tracker', 'Vetted vendor directory browsing', 'Standard invitation website template', 'Standard support desk'],
    cta: 'Start Planning Free',
    featured: false,
    href: '/auth',
  },
  {
    tier: 'Event Pass',
    price: '$99',
    interval: 'One-time payment • No subscriptions',
    features: ['Unlimited AI Concierge conversations', 'Unlimited custom tasks & assignees', 'Complete reconciled budget & contract tracker', 'Full guest manager with digital RSVP syncing', 'Day-of hourly schedule builder & PDF export', 'All luxury wedding website templates & audio players', 'Multi-collaborator partner access', 'Post-event data access & exports'],
    cta: 'Get Event Pass ($99)',
    featured: true,
    badge: 'Most Popular',
    href: '/auth',
  },
  {
    tier: 'Concierge Plus',
    price: '$199',
    interval: 'One-time payment • Premium planning',
    features: ['Everything in Event Pass', '1-on-1 virtual consultation with OVAimagination Events', 'Priority concierge email & phone support', 'Custom vendor contract negotiation checklist', 'Emergency rain backup and rehearsal templates', 'Unlimited high-res photo gallery storage', 'Lifetime plan & archive access'],
    cta: 'Select Concierge Plus',
    featured: false,
    href: '/auth',
  },
];

const TESTIMONIALS = [
  { quote: 'Elysian Concierge and OVAimagination saved our sanity. We planned our 150-guest Malibu wedding with total confidence and stayed right on budget.', name: 'Vanessa & Noah S.', date: 'Married July 2026 • Malibu, CA', image: '/couple1.png' },
  { quote: 'The reconciled budget tracker is unmatched. We knew exactly what was contracted versus paid down to the dollar. Truly a luxury experience.', name: 'Sophia & Liam K.', date: 'Married June 2026 • Pasadena, CA', image: '/couple2.png' },
  { quote: 'The AI vow drafting tool gave me the exact poetic structure I needed. Our guests were raving about our digital invitation website!', name: 'Sarah & David M.', date: 'Married Sept 2026 • Santa Monica, CA', image: '/couple3.png' },
];

export default function LandingPage() {
  const [visibleFeatures, setVisibleFeatures] = useState(new Set());
  const [visibleSteps, setVisibleSteps] = useState(new Set());
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const featureRefs = useRef([]);
  const stepRefs = useRef([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = entry.target.getAttribute('data-idx');
            const type = entry.target.getAttribute('data-type');
            if (type === 'feature') {
              setVisibleFeatures((prev) => new Set([...prev, idx]));
            } else if (type === 'step') {
              setVisibleSteps((prev) => new Set([...prev, idx]));
            }
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    featureRefs.current.forEach((el) => el && observer.observe(el));
    stepRefs.current.forEach((el) => el && observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.landingPage}>
      {/* ====== HERO ====== */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />

        <div className={styles.floatingRings}>
          <div className={`${styles.ring} ${styles.ring1}`} />
          <div className={`${styles.ring} ${styles.ring2}`} />
          <div className={`${styles.ring} ${styles.ring3}`} />
          <div className={`${styles.ring} ${styles.ring4}`} />
        </div>

        <div className={styles.particles}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.particle} />
          ))}
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroGlassCard}>
            <div className={styles.heroEyebrow}>
              <Monogram size={32} style={{ marginRight: '8px' }} /> 
              ELYSIAN WEDDINGS & CONCIERGE
            </div>
            <h1 className={styles.headline}>
              Your Dream Wedding, <span className={styles.headlineGold}>Flawlessly Orchestrated</span>.
            </h1>
            <p className={styles.subheadline}>
              A luxury digital planning suite created in partnership with <strong>OVAimagination Events</strong>.
            </p>
            <p className={styles.heroDescription}>
              Reconciled budgets, milestone roadmaps, live RSVP websites, and verified AI guidance — designed for extraordinary wedding celebrations.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/auth" className={styles.ctaPrimary}>
                Begin Your Journey <span>→</span>
              </Link>
              <Link href="/demo" className={styles.ctaOutline}>
                Try Interactive Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FEATURES ====== */}
      <section className={styles.features} id="features">
        <div className={styles.featuresInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>Elysian Platform</div>
            <h2 className={styles.sectionTitle}>Curated Precision for Every Milestone</h2>
            <p className={styles.sectionSubtitle}>
              Six unified coordination modules designed to eliminate planning stress and elevate your celebration.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                ref={(el) => (featureRefs.current[i] = el)}
                data-idx={i}
                data-type="feature"
                className={`${styles.featureCard} ${visibleFeatures.has(String(i)) ? styles.visible : ''}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className={styles.howItWorks} id="how-it-works">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionEyebrow}>Coordination Journey</div>
          <h2 className={styles.sectionTitle}>Five Steps from Engagement to &ldquo;I Do&rdquo;</h2>
          <p className={styles.sectionSubtitle}>
            Clarity without chaos. Grounded in professional coordination procedures.
          </p>
        </div>

        <div className={styles.stepsContainer}>
          <div className={styles.stepsLine} />
          {STEPS.map((s, i) => (
            <div
              key={i}
              ref={(el) => (stepRefs.current[i] = el)}
              data-idx={i}
              data-type="step"
              className={`${styles.step} ${visibleSteps.has(String(i)) ? styles.visible : ''}`}
              style={{ transitionDelay: `${i * 180}ms` }}
            >
              <div className={styles.stepNumber}>{s.num}</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====== PRICING ====== */}
      <section className={styles.pricing} id="pricing">
        <div className={styles.pricingInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>Transparent Pricing</div>
            <h2 className={styles.sectionTitle}>Single-Event Pricing, Zero Recurring Subscriptions</h2>
            <p className={styles.sectionSubtitle}>
              Wedding planning has a clear date. Pay once and keep full access until your celebration concludes.
            </p>
          </div>

          <div className={styles.pricingGrid}>
            {PRICING.map((plan, i) => (
              <div
                key={i}
                className={`${styles.pricingCard} ${plan.featured ? styles.pricingCardFeatured : ''}`}
              >
                {plan.badge && <div className={styles.pricingBadge}>{plan.badge}</div>}
                <div className={styles.pricingTier}>{plan.tier}</div>
                <div className={styles.pricingPrice}>{plan.price}</div>
                <div className={styles.pricingInterval}>{plan.interval}</div>
                <ul className={styles.pricingFeatures}>
                  {plan.features.map((feat, j) => (
                    <li key={j}>{feat}</li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`${styles.pricingCta} ${plan.featured ? styles.pricingCtaPrimary : styles.pricingCtaOutline}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== TESTIMONIALS ====== */}
      <section className={styles.testimonials} id="testimonials">
        <div className={styles.testimonialsInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>Client Stories</div>
            <h2 className={styles.sectionTitle}>Trusted by Couples Celebrating in Style</h2>
          </div>

          <div className={styles.slideshowContainer}>
            <button 
              className={`${styles.slideBtn} ${styles.slideBtnLeft}`}
              onClick={() => setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
              aria-label="Previous Testimonial"
            >
              ←
            </button>

            <div className={styles.slideshowViewport}>
              {TESTIMONIALS.map((t, idx) => {
                const isActive = idx === activeTestimonial;
                return (
                  <div 
                    key={idx} 
                    className={`${styles.testimonialSlide} ${isActive ? styles.slideActive : styles.slideInactive}`}
                  >
                    <div className={styles.couplePhotoWrapper}>
                      <img src={t.image} alt={t.name} className={styles.couplePhoto} />
                      <div className={styles.photoFrameOverlay} />
                    </div>

                    <div className={styles.messageBubble}>
                      <div className={styles.bubbleArrow} />
                      <div className={styles.testimonialStars}>★★★★★</div>
                      <p className={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</p>
                      <div className={styles.testimonialAuthorInfo}>
                        <div className={styles.testimonialName}>{t.name}</div>
                        <div className={styles.testimonialDate}>{t.date}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              className={`${styles.slideBtn} ${styles.slideBtnRight}`}
              onClick={() => setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length)}
              aria-label="Next Testimonial"
            >
              →
            </button>
          </div>

          <div className={styles.dotsContainer}>
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                className={`${styles.dot} ${idx === activeTestimonial ? styles.dotActive : ''}`}
                onClick={() => setActiveTestimonial(idx)}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ====== FAQ ====== */}
      <section id="faq" className={styles.faqSection}>
        <div className={styles.faqContainer}>
          <div className={styles.faqHeader}>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <p className={styles.sectionDesc}>Everything you need to know about Elysian Concierge.</p>
          </div>
          <div className={styles.faqList}>
            {FAQS.map((faq, i) => (
              <FaqItem key={i} faq={faq} />
            ))}
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div>
              <div className={styles.footerBrand}>
                <Monogram size={44} style={{ marginRight: '8px' }} />
                <span>Elysian Concierge</span>
              </div>
              <p className={styles.footerDesc}>
                Luxury wedding planning suite and verified AI concierge. Partnered with OVAimagination Events for extraordinary wedding celebrations.
              </p>
              <div className={styles.footerSocials}>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="LinkedIn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
              </div>
            </div>
            <div>
              <div className={styles.footerColTitle}>Planning Suite</div>
              <ul className={styles.footerLinks}>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing & Event Pass</a></li>
                <li><a href="#how-it-works">Coordination Journey</a></li>
                <li><Link href="/demo">Try Interactive Demo</Link></li>
                <li><Link href="/templates">Invitation Templates</Link></li>
              </ul>
            </div>
            <div>
              <div className={styles.footerColTitle}>Support & Company</div>
              <ul className={styles.footerLinks}>
                <li><Link href="/contact">Concierge Support</Link></li>
                <li><Link href="/ai-disclaimer">AI Technology & Safety</Link></li>
                <li><Link href="/vendor-terms">Vendor Partner Standards</Link></li>
                <li><Link href="/data-deletion">Data Sovereignty & Export</Link></li>
              </ul>
            </div>
            <div>
              <div className={styles.footerColTitle}>Legal Policies</div>
              <ul className={styles.footerLinks}>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/cookie-policy">Cookie Policy</Link></li>
                <li><Link href="/refund-policy">Refund & Cancellation</Link></li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p className={styles.copyright}>
              &copy; {new Date().getFullYear()} Elysian Concierge. In partnership with OVAimagination Events. All rights reserved.
            </p>
            <div className={styles.footerBottomLinks}>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/cookie-policy">Cookies</Link>
              <Link href="/refund-policy">Refunds</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
