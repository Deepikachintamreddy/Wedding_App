'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <main className="legal-page-layout">
      <div className="navbar-spacer"></div>
      <div className="container py-12 max-w-4xl">
        <div className="legal-header mb-8">
          <span className="badge badge-gold mb-2">LEGAL COMPLIANCE</span>
          <h1 className="h2 font-heading text-gold mb-2">Privacy Policy</h1>
          <p className="text-xs text-muted">Last Updated: October 2026 | Version 2.4</p>
        </div>

        <div className="card glass-panel p-8 flex-col gap-6 body-sm text-secondary">
          <section>
            <h2 className="h4 font-heading text-primary mb-2">1. Overview & Scope</h2>
            <p>
              Elysian Concierge and Elysian Weddings (operated in partnership with OVAimagination Events, &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respect your privacy and are committed to protecting the personal data of our couples, guests, planners, and vendor partners. This Privacy Policy details how we collect, process, store, and safeguard your information when you use our platform.
            </p>
          </section>

          <section>
            <h2 className="h4 font-heading text-primary mb-2">2. Information We Collect</h2>
            <p>We collect information you provide directly to us, including:</p>
            <ul style={{ paddingLeft: '24px', listStyle: 'disc' }}>
              <li><strong>Account & Event Details:</strong> Names of partners, wedding date, venue location, budget ceiling, aesthetic styling preferences, and contact information (email, phone).</li>
              <li><strong>Guest List & RSVP Data:</strong> Guest names, contact details, attendance status, dietary requirements, table seating, and plus-one allocations.</li>
              <li><strong>Vendor & Financial Records:</strong> Contract pricing, payment transaction logs, invoices, and payment method categories.</li>
              <li><strong>Communications & AI Queries:</strong> Questions, vow drafts, speech requests, and customer support inquiries.</li>
            </ul>
          </section>

          <section>
            <h2 className="h4 font-heading text-primary mb-2">3. How We Use Your Data</h2>
            <p>
              We process your data strictly to deliver and personalize your wedding planning workspace, including generating tailored checklists, calculating financial allocations, facilitating guest RSVP management, and providing context-grounded AI recommendations. We never sell your personal information or guest records to third-party data brokers.
            </p>
          </section>

          <section>
            <h2 className="h4 font-heading text-primary mb-2">4. Data Isolation & Security</h2>
            <p>
              All customer event records are strictly partitioned by unique user and event identifiers. Logged-out users or unauthorized parties are prevented from viewing or modifying private event data. All data in transit is encrypted using industry-standard HTTPS / TLS.
            </p>
          </section>

          <section>
            <h2 className="h4 font-heading text-primary mb-2">5. Data Retention, Export & Deletion</h2>
            <p>
              You maintain full ownership of your planning data. You may at any time export your complete guest, budget, and task records in CSV/JSON format or request complete account deletion via our <Link href="/data-deletion" className="text-gold underline">Data Deletion Portal</Link>.
            </p>
          </section>

          <section>
            <h2 className="h4 font-heading text-primary mb-2">6. Contact Our Data Protection Officer</h2>
            <p>
              If you have questions regarding this policy or wish to exercise your privacy rights under GDPR, CCPA, or applicable data protection laws, please reach out via our <Link href="/contact" className="text-gold underline">Support Center</Link> or email privacy@elysianconcierge.com.
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
