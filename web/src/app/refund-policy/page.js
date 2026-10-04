'use client';

import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <main className="legal-page-layout">
      <div className="navbar-spacer"></div>
      <div className="container py-12 max-w-4xl">
        <div className="legal-header mb-8">
          <span className="badge badge-gold mb-2">COMMERCIAL TERMS</span>
          <h1 className="h2 font-heading text-gold mb-2">Refund & Cancellation Policy</h1>
          <p className="text-xs text-muted">Effective Date: October 2026 | Version 2.4</p>
        </div>

        <div className="card glass-panel p-8 flex-col gap-6 body-sm text-secondary">
          <section>
            <h2 className="h4 font-heading text-primary mb-2">1. 14-Day Money-Back Guarantee</h2>
            <p>
              We want you to be completely delighted with your wedding planning experience. If you purchase an <strong>Event Pass ($99)</strong> or <strong>Concierge Plus ($199)</strong> and find that it does not suit your planning needs, you may request a full refund within <strong>14 calendar days</strong> of purchase, provided that personalized human coordinator consultations have not yet been conducted.
            </p>
          </section>

          <section>
            <h2 className="h4 font-heading text-primary mb-2">2. Data Preservation on Refund</h2>
            <p>
              If a refund is processed, your account will smoothly revert to the <strong>Free Tier</strong>. Your existing tasks, guest list, budget logs, and custom notes will remain intact and will never be deleted or held hostage.
            </p>
          </section>

          <section>
            <h2 className="h4 font-heading text-primary mb-2">3. How to Request a Refund</h2>
            <p>
              To initiate a refund, simply visit our <Link href="/contact" className="text-gold underline">Contact Support</Link> page or email support@elysianconcierge.com with your account email and order reference. Refunds are credited back to your original payment method within 3 to 5 business days.
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
