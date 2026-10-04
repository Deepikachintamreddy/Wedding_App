'use client';

import Link from 'next/link';

export default function CookiePolicyPage() {
  return (
    <main className="legal-page-layout">
      <div className="navbar-spacer"></div>
      <div className="container py-12 max-w-4xl">
        <div className="legal-header mb-8">
          <span className="badge badge-gold mb-2">PRIVACY & COOKIES</span>
          <h1 className="h2 font-heading text-gold mb-2">Cookie Policy</h1>
          <p className="text-xs text-muted">Effective Date: October 2026 | Version 2.4</p>
        </div>

        <div className="card glass-panel p-8 flex-col gap-6 body-sm text-secondary">
          <section>
            <h2 className="h4 font-heading text-primary mb-2">1. What Are Cookies?</h2>
            <p>
              Cookies and local browser storage are small text files and tokens stored on your device that enable Elysian Concierge to remember your authenticated session, active event workspace preferences, theme aesthetics, and countdown timers.
            </p>
          </section>

          <section>
            <h2 className="h4 font-heading text-primary mb-2">2. Types of Cookies We Use</h2>
            <ul style={{ paddingLeft: '24px', listStyle: 'disc' }}>
              <li><strong>Strictly Necessary:</strong> Essential for secure session authentication, role-based access control, and workspace state persistence.</li>
              <li><strong>Functional & Preference:</strong> Stores user theme preferences, music background volume settings, and mobile preview viewports.</li>
              <li><strong>Analytics:</strong> Aggregated, anonymized performance metrics to ensure fast response times across our digital invitation builders.</li>
            </ul>
          </section>

          <section>
            <h2 className="h4 font-heading text-primary mb-2">3. Managing Cookie Preferences</h2>
            <p>
              You can modify your browser settings to decline non-essential cookies. However, disabling essential session tokens will require you to log in upon each visit to your wedding dashboard.
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
