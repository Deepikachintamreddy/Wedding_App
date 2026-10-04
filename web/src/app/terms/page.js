'use client';

import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <main className="legal-page-layout">
      <div className="navbar-spacer"></div>
      <div className="container py-12 max-w-4xl">
        <div className="legal-header mb-8">
          <span className="badge badge-gold mb-2">USER AGREEMENT</span>
          <h1 className="h2 font-heading text-gold mb-2">Terms of Service</h1>
          <p className="text-xs text-muted">Effective Date: October 2026 | Version 2.4</p>
        </div>

        <div className="card glass-panel p-8 flex-col gap-6 body-sm text-secondary">
          <section>
            <h2 className="h4 font-heading text-primary mb-2">1. Agreement to Terms</h2>
            <p>
              By registering an account, accessing the Elysian Concierge digital wedding planning suite, or purchasing an Event Pass, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.
            </p>
          </section>

          <section>
            <h2 className="h4 font-heading text-primary mb-2">2. Accounts and Security</h2>
            <p>
              You must provide accurate information during registration. You are responsible for maintaining the confidentiality of your credentials and for all activities occurring under your account. Administrative privileges are granted on an invitation-only basis and are prohibited from public registration.
            </p>
          </section>

          <section>
            <h2 className="h4 font-heading text-primary mb-2">3. Subscription Tiers & Entitlements</h2>
            <p>
              Elysian Concierge offers Free, Event Pass ($99 one-time), and Concierge Plus ($199 one-time) access tiers:
            </p>
            <ul style={{ paddingLeft: '24px', listStyle: 'disc' }}>
              <li><strong>Free Tier:</strong> Includes 15 monthly AI credits, standard checklist, budget overview, and directory browsing.</li>
              <li><strong>Event Pass ($99):</strong> Unlocks unlimited AI conversations, complete budget tracker with contract synchronization, seating charts, and export tools until your wedding date.</li>
              <li><strong>Concierge Plus ($199):</strong> Extends Event Pass with personalized 1-on-1 coordination consultation with OVAimagination Events planners.</li>
            </ul>
          </section>

          <section>
            <h2 className="h4 font-heading text-primary mb-2">4. User Content & Guest Communications</h2>
            <p>
              You retain all intellectual property rights to your wedding content, photos, invitations, vows, and guest communications. You agree not to use the digital invitation builder or messaging features to transmit spam or illegal content.
            </p>
          </section>

          <section>
            <h2 className="h4 font-heading text-primary mb-2">5. Vendor Directory Disclaimer</h2>
            <p>
              While Elysian Concierge and OVAimagination Events review vendor listings for quality and professional standing, contracts signed between couples and vendors are direct legal agreements between those two parties. Elysian Concierge is not a party to third-party vendor contracts.
            </p>
          </section>

          <section>
            <h2 className="h4 font-heading text-primary mb-2">6. Governing Law & Dispute Resolution</h2>
            <p>
              These Terms shall be governed by the laws of the State of California. For any inquiries or disputes, please reach out to our team via the <Link href="/contact" className="text-gold underline">Contact Portal</Link>.
            </p>
          </section>
        </div>
      </div>

      <style jsx>{`
        .legal-page-layout {
          background: transparent;
          color: #f5f0e8;
          min-height: 100vh;
        }
        .navbar-spacer {
          height: 80px;
        }
        .max-w-4xl {
          max-width: 56rem;
          margin: 0 auto;
        }
        .py-12 {
          padding-top: 48px;
          padding-bottom: 48px;
        }
        .mb-2 { margin-bottom: 8px; }
        .mb-8 { margin-bottom: 32px; }
        .flex-col { display: flex; flex-direction: column; }
        .gap-6 { gap: 24px; }
      `}</style>
    </main>
  );
}
