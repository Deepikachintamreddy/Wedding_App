'use client';

import Link from 'next/link';

export default function AiDisclaimerPage() {
  return (
    <main className="legal-page-layout">
      <div className="navbar-spacer"></div>
      <div className="container py-12 max-w-4xl">
        <div className="legal-header mb-8">
          <span className="badge badge-gold mb-2">AI SAFETY & TRANSPARENCY</span>
          <h1 className="h2 font-heading text-gold mb-2">AI Concierge Disclaimer & Guidelines</h1>
          <p className="text-xs text-muted">Effective Date: October 2026 | Version 2.4</p>
        </div>

        <div className="card glass-panel p-8 flex-col gap-6 body-sm text-secondary">
          <section>
            <h2 className="h4 font-heading text-primary mb-2">1. Nature of the AI Concierge</h2>
            <p>
              The Elysian AI Concierge is a generative AI decision-support tool designed to provide wedding coordination guidance, budget framework estimates, timeline suggestions, speech drafts, and planning reminders grounded in reference materials curated by <strong>OVAimagination Events</strong>.
            </p>
          </section>

          <section>
            <h2 className="h4 font-heading text-primary mb-2">2. Planning Estimates vs. Legally Binding Contracts</h2>
            <p>
              All pricing frameworks, percentage breakdowns, and schedule suggestions provided by the AI are planning estimates intended for general guidance. They do not constitute verified vendor quotes or legally binding commitments until confirmed in writing by a specific venue or vendor partner.
            </p>
          </section>

          <section>
            <h2 className="h4 font-heading text-primary mb-2">3. Legal and Marriage License Advice</h2>
            <p>
              Information regarding marriage licenses, officiant ordination, and municipal recording requirements is provided for general informational purposes. Couples must verify local marriage laws with their specific county clerk or municipal registrar.
            </p>
          </section>

          <section>
            <h2 className="h4 font-heading text-primary mb-2">4. User Approval Required for Actions</h2>
            <p>
              The AI Concierge cannot independently modify your workspace data, book vendors, send external messages, or execute financial charges. All AI proposed actions (such as adding tasks or updating budgets) require your explicit confirmation and review before taking effect.
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
