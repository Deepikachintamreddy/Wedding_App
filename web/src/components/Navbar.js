'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Navbar.module.css';
import Monogram from './Monogram';

const NAV_LINKS = {
  couple: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Invitations', href: '/templates' },
    { label: 'Mood Board', href: '/moodboard' },
    { label: 'Checklist', href: '/checklist' },
    { label: 'Budget', href: '/budget' },
    { label: 'Guests', href: '/guests' },
    { label: 'Vendors', href: '/vendors' },
    { label: 'Timeline', href: '/timeline' },
  ],
  planner: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Timeline', href: '/timeline' },
    { label: 'Checklist', href: '/checklist' },
    { label: 'Vendors', href: '/vendors' },
    { label: 'Budget', href: '/budget' },
  ],
  vendor: [
    { label: 'Portal', href: '/vendor-portal' },
    { label: 'Directory', href: '/vendors' },
  ],
  admin: [
    { label: 'Admin Console', href: '/admin' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Vendors', href: '/vendors' },
  ],
  guest: [
    { label: 'Features', href: '/#features' },
    { label: 'Templates', href: '/templates' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'FAQ', href: '/#faq' },
    { label: 'Interactive Demo', href: '/demo' },
  ],
};

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  // Load user from localStorage
  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = localStorage.getItem('elysian_user') || localStorage.getItem('wedding_user');
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    loadUser();

    window.addEventListener('storage', loadUser);
    window.addEventListener('elysian_store_update', loadUser);
    window.addEventListener('user-login', loadUser);
    return () => {
      window.removeEventListener('storage', loadUser);
      window.removeEventListener('elysian_store_update', loadUser);
      window.removeEventListener('user-login', loadUser);
    };
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const role = user?.role || 'guest';
  const links = NAV_LINKS[role] || NAV_LINKS.guest;
  const aiCredits = user?.eventPassActive || user?.role === 'admin' ? 'Unlimited' : (user?.aiCredits ?? 15);

  const getInitials = (name) => {
    if (!name) return 'EC';
    return name.split(/[\s&]+/).filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    localStorage.removeItem('elysian_user');
    localStorage.removeItem('elysian_event_profile');
    localStorage.removeItem('wedding_user');
    localStorage.removeItem('wedding_profile');
    setUser(null);
    setDropdownOpen(false);
    window.dispatchEvent(new Event('elysian_store_update'));
    router.push('/');
  };

  // Don't show navbar on auth, onboarding, or public rsvp routes
  if (pathname === '/auth' || pathname === '/onboarding' || pathname.startsWith('/rsvp/')) {
    return null;
  }

  return (
    <>
      {/* Demo Mode Notice Banner if user is currently experiencing isolated Demo */}
      {user?.isDemo && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '32px',
            background: 'linear-gradient(90deg, #aa7c11 0%, #d4af37 50%, #aa7c11 100%)',
            color: '#0a192f',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            gap: '12px'
          }}
        >
          <span>✨ DEMO WORKSPACE: Sample Event (Vanessa & Noah)</span>
          <Link 
            href="/auth"
            style={{
              background: '#0a192f',
              color: '#f5f0e8',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              textDecoration: 'none'
            }}
          >
            Create Your Account →
          </Link>
        </div>
      )}

      <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`} style={user?.isDemo ? { top: '32px' } : {}}>
        <div className={styles.navInner}>
          {/* Brand */}
          <Link href="/" className={styles.brand} aria-label="Elysian Concierge Home">
            <Monogram size={38} className={styles.brandIcon} style={{ marginRight: '6px' }} />
            <span style={{ letterSpacing: '0.5px' }}>Elysian <span style={{ fontWeight: 400, color: '#f5f0e8', fontSize: '1.1rem' }}>Concierge</span></span>
          </Link>

          {/* Desktop nav links */}
          <ul className={styles.navLinks}>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`${styles.navLink} ${pathname === link.href ? styles.navLinkActive : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right section */}
          <div className={styles.navRight}>
            {user ? (
              <>
                {/* AI Credits */}
                <Link href="/ai-chat" className={styles.aiCredits} title="AI Concierge Credits Balance">
                  <span className={styles.creditsIcon}>✨</span>
                  <span className={styles.creditsCount}>{aiCredits}</span>
                  <span>{user.eventPassActive ? '' : 'credits'}</span>
                </Link>

                {/* User dropdown */}
                <div className={styles.userMenu} ref={dropdownRef}>
                  <button
                    className={styles.userButton}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    aria-label={`User Menu for ${user.name}`}
                    aria-expanded={dropdownOpen}
                  >
                    <div className={styles.avatar}>{getInitials(user.name)}</div>
                    <span className={styles.userName}>{user.name}</span>
                    <span className={`${styles.dropdownArrow} ${dropdownOpen ? styles.dropdownArrowOpen : ''}`}>
                      ▼
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div className={styles.dropdown}>
                      <Link href="/settings" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                        ⚙️ Workspace Settings
                      </Link>
                      <Link href="/ai-chat" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                        🤖 AI Concierge
                      </Link>
                      <Link href="/contact" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                        💌 Concierge Support
                      </Link>
                      <div className={styles.dropdownDivider} />
                      <button
                        className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                        onClick={handleLogout}
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.authButtons}>
                <Link href="/demo" className={styles.loginBtn}>Try Demo</Link>
                <Link href="/auth" className={styles.loginBtn}>Sign In</Link>
                <Link href="/auth" className={styles.getStartedBtn}>Begin Planning</Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className={styles.mobileDrawer}>
          <ul className={styles.mobileNavLinks}>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`${styles.mobileNavLink} ${pathname === link.href ? styles.mobileNavLinkActive : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {user ? (
            <div className={styles.mobileUserSection}>
              <div className={styles.mobileCredits}>
                <span>✨</span>
                <span style={{ color: '#d4af37', fontWeight: 600 }}>{aiCredits}</span>
                <span>AI credits remaining</span>
              </div>
              <Link href="/settings" className={styles.mobileNavLink}>
                ⚙️ Workspace Settings
              </Link>
              <Link href="/ai-chat" className={styles.mobileNavLink}>
                🤖 AI Concierge
              </Link>
              <Link href="/contact" className={styles.mobileNavLink}>
                💌 Concierge Support
              </Link>
              <button
                className={styles.mobileNavLink}
                style={{ color: '#ef4444', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%', font: 'inherit' }}
                onClick={handleLogout}
              >
                🚪 Sign Out
              </button>
            </div>
          ) : (
            <div className={styles.mobileAuthBtns}>
              <Link href="/demo" className={styles.mobileNavLink}>Try Interactive Demo</Link>
              <Link href="/auth" className={styles.mobileNavLink}>Sign In</Link>
              <Link href="/auth" className={styles.getStartedBtn} style={{ textAlign: 'center', display: 'block' }}>
                Begin Planning
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
