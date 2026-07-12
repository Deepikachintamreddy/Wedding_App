'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const FEATURES = [
  { icon: '🤖', title: 'Smart Wedding Planner', desc: 'Ask anything about your wedding and get personalized, expert-level answers in seconds.' },
  { icon: '✅', title: 'Smart Checklist', desc: 'Auto-generated timeline tailored to your wedding date — never miss a milestone.' },
  { icon: '💰', title: 'Budget Tracker', desc: 'Category breakdowns, payment tracking, and real-time overspend alerts to stay on target.' },
  { icon: '👥', title: 'Guest Manager', desc: 'RSVP tracking, meal preferences, seating groups, and plus-one management made easy.' },
  { icon: '💒', title: 'Vendor Directory', desc: 'Find, compare, and book trusted local vendors with real reviews and pricing.' },
  { icon: '✉️', title: 'Custom Websites & Invites', desc: 'Browse curated luxury website templates, customize details, and generate RSVP links for your guest list.' },
];

const STEPS = [
  { num: 1, title: 'Tell Us About Your Wedding', desc: 'Set your date, budget, style preferences, and guest count. Our onboarding takes less than two minutes.' },
  { num: 2, title: 'Get Your Personalized Plan', desc: 'Elysian instantly generates your custom checklist, budget breakdown, and dynamic planning timeline.' },
  { num: 3, title: 'Build Your Dream Team', desc: 'Browse our curated directory, compare reviews, and securely book the perfect vendors for your special day.' },
  { num: 4, title: 'Manage Your Guests', desc: 'Send beautiful digital invitations, track real-time RSVPs, and organize seating charts effortlessly.' },
  { num: 5, title: 'Plan With Confidence', desc: 'Track your progress, chat with your digital concierge anytime, and enjoy a stress-free wedding journey.' },
];

const FAQS = [
  { question: "What exactly is the Elysian Wedding Concierge?", answer: "Elysian is a luxury wedding planning platform powered by advanced technology. It acts as your personal wedding planner, helping you track budgets, manage guests, create timelines, and answer all your wedding-related questions instantly." },
  { question: "Is Elysian actually free to use?", answer: "Yes! Our core features, including the personalized checklist, budget tracker, and virtual assistant, are completely free. We also offer a Premium tier with advanced features like digital invitations and a dedicated vendor directory." },
  { question: "Can I use Elysian if I already have a human wedding planner?", answer: "Absolutely. Many couples use Elysian alongside a traditional planner to stay organized, manage their own tasks, and have 24/7 access to instant advice for the smaller details." },
  { question: "How does the digital invitation builder work?", answer: "Our Premium tier includes access to luxury digital invitation templates. You can customize them with your wedding details, send them to your guest list via email or SMS, and track RSVPs directly within your Elysian dashboard." },
];

function FaqItem({ faq }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`${styles.faqItem} ${isOpen ? styles.open : ''}`}>
      <button className={styles.faqQuestion} onClick={() => setIsOpen(!isOpen)}>
        {faq.question}
        <span className={styles.faqIcon}>+</span>
      </button>
      <div className={styles.faqAnswer}>
        {faq.answer}
      </div>
    </div>
  );
}

const PRICING = [
  {
    tier: 'Free',
    price: '$0',
    interval: 'Free forever',
    features: ['15 concierge credits per month', 'Up to 20 checklist tasks', 'Basic budget overview', 'Vendor browsing', 'Standard wedding website template', 'Community support'],
    cta: 'Start Free',
    featured: false,
  },
  {
    tier: 'Event Pass',
    price: '$99',
    interval: 'One-time payment',
    features: ['Unlimited concierge conversations', 'Unlimited checklist tasks', 'Full budget tracker with categories', 'Complete guest list manager', 'Timeline builder', 'Smart vendor matching', 'Premium custom wedding websites & digital invites', 'Export & share plans'],
    cta: 'Get Event Pass',
    featured: true,
    badge: 'Best Value',
  },
  {
    tier: 'Forever + Concierge',
    price: '$199',
    interval: 'One-time payment',
    features: ['Everything in Event Pass', 'Elysian planning consultation', 'Priority email support', 'Day-of coordinator tools', 'Vendor negotiation templates', 'Premium theme library', 'Lifetime plan access'],
    cta: 'Go Premium',
    featured: false,
  },
];

const TESTIMONIALS = [
  { quote: 'This app literally saved our sanity. We planned our entire 150-guest wedding in 4 months without a planner. The curated suggestions were spot-on!', name: 'Sarah & James K.', date: 'Married Oct 2025', image: '/couple1.png' },
  { quote: 'The budget tracker alone is worth it. We came in $2K under budget and never felt stressed about money. Cannot recommend enough.', name: 'Maria & David L.', date: 'Married June 2025', image: '/couple2.png' },
  { quote: 'I used the vow writer as a starting point and my partner was in tears. The checklist kept us on track even when life got crazy.', name: 'Alex & Jordan P.', date: 'Married Dec 2025', image: '/couple3.png' },
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
            <div className={styles.heroEyebrow}><img src="/logo.png" alt="Elysian Logo" width={36} height={36} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px', objectFit: 'contain' }} /> PLAN YOUR WEDDING</div>
            <h1 className={styles.headline}>
              Your Dream Wedding, <span className={styles.headlineGold}>Effortlessly Planned</span>.
            </h1>
            <p className={styles.subheadline}>Experience premium digital coordination for your special day.</p>
            <p className={styles.heroDescription}>
              Everything you need to orchestrate a beautifully curated wedding — without the traditional planner price tag.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/auth" className={styles.ctaPrimary}>
                Begin Your Journey <span>→</span>
              </Link>
              <button
                className={styles.ctaOutline}
                onClick={() => scrollToSection('features')}
              >
                Explore Details ↓
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FEATURES ====== */}
      <section className={styles.features} id="features">
        <div className={styles.featuresInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>Features</div>
            <h2 className={styles.sectionTitle}>Everything You Need, One App</h2>
            <p className={styles.sectionSubtitle}>
              Six powerful tools designed to take the stress out of wedding planning and bring back the joy.
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
          <div className={styles.sectionEyebrow}>How It Works</div>
          <h2 className={styles.sectionTitle}>Five Steps to Your Dream Wedding</h2>
          <p className={styles.sectionSubtitle}>
            No overwhelm. No spreadsheets. Just a clear path from &ldquo;we&rsquo;re engaged!&rdquo; to &ldquo;I do.&rdquo;
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
              style={{ transitionDelay: `${i * 200}ms` }}
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
            <div className={styles.sectionEyebrow}>Pricing</div>
            <h2 className={styles.sectionTitle}>Simple, Transparent Pricing</h2>
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
                  href="/auth"
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
            <div className={styles.sectionEyebrow}>Testimonials</div>
            <h2 className={styles.sectionTitle}>Trusted by Couples Planning Their Perfect Day</h2>
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
            <p className={styles.sectionDesc}>Everything you need to know about Elysian.</p>
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
              <div className={styles.footerBrand}><img src="/logo.png" alt="VND Logo" width={48} height={48} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px', objectFit: 'contain' }} /> VND</div>
              <p className={styles.footerDesc}>
                VND Wedding Concierge — luxury wedding planning tools for every couple, at every budget.
              </p>
              <div className={styles.footerSocials}>
                <a href="#" className={styles.socialIcon} aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="#" className={styles.socialIcon} aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="#" className={styles.socialIcon} aria-label="LinkedIn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
              </div>
            </div>
            <div>
              <div className={styles.footerColTitle}>Product</div>
              <ul className={styles.footerLinks}>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#testimonials">Reviews</a></li>
              </ul>
            </div>
            <div>
              <div className={styles.footerColTitle}>Company</div>
              <ul className={styles.footerLinks}>
                <li><a href="#">About</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <div className={styles.footerColTitle}>Legal</div>
              <ul className={styles.footerLinks}>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>

            <div className={styles.footerBottomLinks}>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
