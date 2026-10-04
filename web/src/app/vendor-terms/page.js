'use client';

import Link from 'next/link';

export default function VendorTermsPage() {
  return (
    <main className="legal-page-layout">
      <div className="navbar-spacer"></div>
      <div className="container py-12 max-w-4xl">
        <div className="legal-header mb-8">
          <span className="badge badge-gold mb-2">PARTNER STANDARDS</span>
          <h1 className="h2 font-heading text-gold mb-2">Vendor Partner Terms & Standards</h1>
          <p className="text-xs text-muted">Effective Date: October 2026 | Version 2.4</p>
        </div>

        <div className="card glass-panel p-8 flex-col gap-6 body-sm text-secondary">
          <section>
            <h2 className="h4 font-heading text-primary mb-2">1. Directory Eligibility & Vetting</h2>
            <p>
              Vendors applying to be listed in the Elysian Concierge directory must maintain active business licenses, valid Certificate of Insurance (COI) policies, and a demonstrated track record of luxury event execution verified by <strong>OVAimagination Events</strong>.
            </p>
          </section>

          <section>
            <h2 className="h4 font-heading text-primary mb-2">2. Inquiry Response Times</h2>
            <p>
              To maintain a premium concierge standard for couples, vendor partners agree to respond to incoming inquiries within <strong>48 hours</strong>. Repeated unresponsiveness may result in temporary directory delisting.
            </p>
          </section>

          <section>
            <h2 className="h4 font-heading text-primary mb-2">3. Accurate Pricing & Transparency</h2>
            <p>
              Vendor pricing tiers and starting rates displayed in the portal must reflect genuine estimates. No deceptive pricing, bait-and-switch quotes, or unauthorized booking fees are permitted.
            </p>
          </section>

          <section>
            <h2 className="h4 font-heading text-primary mb-2">4. Direct Client Contracts</h2>
            <p>
              All contracts executed between couples and vendors are direct legal agreements between those independent parties. Vendor partners agree to uphold all contractual deliverables with the highest professional care.
            </p>
          </section>
        </div>
      </div>

      <style jsx>{`
        .legal-page-layout { background: transparent; color: #f5f0e8; min-height: 100vh; }
        .navbar-spacer { height: 80px; }
        .max-w-4xl { max-width: 56rem; margin: 0 auto; }
        .py-12 { padding-top: 48px; padding-bottom: 48px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-8 { margin-bottom: 32px; }
        .flex-col { display: flex; flex-direction: column; }
        .gap-6 { gap: 24px; }
      `}</style>
    </main>
  );
}
