'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useWeddingStore } from '@/lib/store';
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
    { label: 'Vows & Speeches', href: '/vows-speech' },
  ],
  vendor: [
    { label: 'Dashboard', href: '/vendor-portal' },
    { label: 'Profile', href: '/vendor-portal/profile' },
    { label: 'Inquiries', href: '/vendor-portal/inquiries' },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Vendors', href: '/admin/vendors' },
    { label: 'Revenue', href: '/admin/revenue' },
  ],
  guest: [
    { label: 'Features', href: '/#features' },
    { label: 'Templates', href: '/templates' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'FAQ', href: '/#faq' },
  ],
};

export default function Navbar() {
  const store = useWeddingStore();
  const { user } = store;
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [cachedUser, setCachedUser] = useState(null);
  const dropdownRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  // Keep authenticated state in sync with api/token changes
  useEffect(() => {
    setAuthenticated(api.isAuthenticated());
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wedding_user');
      if (stored) {
        try {
          setCachedUser(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      } else {
        setCachedUser(null);
      }
    }
  }, [user]);

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

  const activeUser = user || cachedUser;
  const role = authenticated ? (activeUser?.role || 'couple') : 'guest';
  const links = NAV_LINKS[role] || NAV_LINKS.guest;
  const aiCredits = activeUser?.aiCredits ?? 15;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    api.logout();
    setDropdownOpen(false);
    setAuthenticated(false);
    window.dispatchEvent(new Event('wedding_store_update'));
    router.push('/');
  };

  // Don't show navbar on auth or onboarding pages
  if (pathname === '/auth' || pathname === '/onboarding') {
    return null;
  }

  return (
    <>
      <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
        <div className={styles.navInner}>
          {/* Brand */}
          <Link href="/" className={styles.brand}>
            <Monogram size={64} className={styles.brandIcon} style={{ marginRight: '4px' }} /> VND
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
            {authenticated && activeUser ? (
              <>
                {/* AI Credits */}
                <div className={styles.aiCredits}>
                  <span className={styles.creditsIcon}>✨</span>
                  <span className={styles.creditsCount}>{aiCredits}</span>
                  <span>credits</span>
                </div>

                {/* User dropdown */}
                <div className={styles.userMenu} ref={dropdownRef}>
                  <button
                    className={styles.userButton}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div className={styles.avatar}>{getInitials(activeUser.name)}</div>
                    <span className={styles.userName}>{activeUser.name}</span>
                    <span className={`${styles.dropdownArrow} ${dropdownOpen ? styles.dropdownArrowOpen : ''}`}>
                      ▼
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div className={styles.dropdown}>
                      <Link href="/settings" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                        ⚙️ Settings
                      </Link>
                      <Link href="/ai-chat" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                        🤖 AI Chat
                      </Link>
                      <div className={styles.dropdownDivider} />
                      <button
                        className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                        onClick={handleLogout}
                      >
                        🚪 Log Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.authButtons}>
                <Link href="/auth" className={styles.loginBtn}>Log In</Link>
                <Link href="/auth" className={styles.getStartedBtn}>Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
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

          {authenticated && user ? (
            <div className={styles.mobileUserSection}>
              <div className={styles.mobileCredits}>
                <span>✨</span>
                <span style={{ color: '#c9a96e', fontWeight: 600 }}>{aiCredits}</span>
                <span>AI credits remaining</span>
              </div>
              <Link href="/settings" className={styles.mobileNavLink}>
                ⚙️ Settings
              </Link>
              <Link href="/ai-chat" className={styles.mobileNavLink}>
                🤖 AI Chat
              </Link>
              <button
                className={styles.mobileNavLink}
                style={{ color: '#e74c3c', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%', font: 'inherit' }}
                onClick={handleLogout}
              >
                🚪 Log Out
              </button>
            </div>
          ) : (
            <div className={styles.mobileAuthBtns}>
              <Link href="/auth" className={styles.mobileNavLink}>Log In</Link>
              <Link href="/auth" className={styles.getStartedBtn} style={{ textAlign: 'center', display: 'block' }}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
