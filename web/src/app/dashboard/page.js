'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWeddingStore } from '@/lib/store';
import { 
  formatDate, 
  daysUntil, 
  formatCurrency, 
  calculateBudgetSummary, 
  calculateBudgetHealth, 
  calculateProgressScore,
  getTimeGreeting 
} from '@/lib/utils';
import Monogram from '@/components/Monogram';

export default function DashboardPage() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, eventProfile, tasks, vendors, guests, budget, timeline, missions, loading } = store;
  
  // Mounted check to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  const [celebrationModal, setCelebrationModal] = useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Live ticking countdown state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const targetDate = eventProfile?.weddingDate || user?.weddingDate || '2027-07-15';

  useEffect(() => {
    if (!targetDate) return;
    const calculate = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--color-navy-dark, #050d1a)' }}>
        <div style={{ width: '45px', height: '45px', border: '3px solid rgba(212, 175, 55, 0.2)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <span style={{ color: '#D4AF37', fontSize: '0.9rem', letterSpacing: '0.05em' }}>Loading Elysian Workspace...</span>
        <style jsx global>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .flex-center { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
        `}</style>
      </div>
    );
  }

  // Calculate statistics & weighted progress score
  const daysRemaining = daysUntil(targetDate);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const nextTask = tasks.find(t => !t.completed);

  // Weighted Progress Score (Step 23)
  const progressData = calculateProgressScore(store);

  // Corrected Budget Model (Step 10)
  const budgetSummary = calculateBudgetSummary(budget);
  const budgetHealth = calculateBudgetHealth(budgetSummary.contracted, budgetSummary.total);
  
  // Guest counts
  const totalGuests = guests.length;
  const attendingGuests = guests.filter(g => g.status === 'Attending').length;
  const pendingGuests = guests.filter(g => g.status === 'Pending').length;
  const declinedGuests = guests.filter(g => g.status === 'Declined').length;

  const handleTaskToggle = (taskId, completed) => {
    store.updateTask(taskId, { completed });
    if (completed) {
      setCelebrationModal({
        title: 'Milestone Completed!',
        message: 'Magnificent progress! Your wedding checklist has been updated.',
        badge: '✨ Task Concluded'
      });
    }
  };

  const handleCompleteMission = (missionId) => {
    store.completeMission(missionId);
    setCelebrationModal({
      title: 'Mission Accomplished! 🎯',
      message: 'You have earned +5 AI Concierge credits for completing your weekly planning goal.',
      badge: '+5 Credits Added'
    });
  };

  const getGreetingName = () => {
    if (eventProfile?.partnerA && eventProfile?.partnerB) {
      return `${eventProfile.partnerA} & ${eventProfile.partnerB}`;
    }
    return user.name || 'Valued Couple';
  };

  const getGreetingMessage = () => {
    const greeting = isMounted ? getTimeGreeting() : 'Welcome';
    const coupleName = getGreetingName();
    if (daysRemaining < 0) {
      return `${greeting}, ${coupleName}! Congratulations on your wedding celebration!`;
    }
    if (daysRemaining === 0) {
      return `💍 Today is the day, ${coupleName}! Happy Wedding Day!`;
    }
    if (daysRemaining < 30) {
      return `⏰ ${greeting}, ${coupleName}! Just ${daysRemaining} days remaining! Time for final vendor run-throughs.`;
    }
    return `${greeting}, ${coupleName}! You are ${daysRemaining} days away from your dream wedding.`;
  };

  const padZero = (num) => String(num).padStart(2, '0');

  // Filter active missions
  const activeMissions = (missions || []).filter(m => !m.snoozed);

  return (
    <main className="dashboard-layout">
      {/* Offsets the fixed navbar */}
      <div className="navbar-spacer"></div>

      {/* Celebration Modal */}
      {celebrationModal && (
        <div className="modal-backdrop" onClick={() => setCelebrationModal(null)}>
          <div className="celebration-card" onClick={(e) => e.stopPropagation()}>
            <div className="celebration-icon">🥂</div>
            <span className="badge badge-gold mb-3">{celebrationModal.badge}</span>
            <h3 className="h3 font-heading text-gold mb-2">{celebrationModal.title}</h3>
            <p className="body-sm text-secondary mb-6">{celebrationModal.message}</p>
            <button 
              className="btn btn-primary w-full"
              onClick={() => setCelebrationModal(null)}
            >
              Continue Planning
            </button>
          </div>
        </div>
      )}

      <div className="container py-8">
        {/* Context-aware Greeting Header */}
        <div className="dashboard-header mb-8">
          <div className="header-badge mb-3">
            <span className="badge badge-gold">💍 {eventProfile?.theme || user.theme || 'Elegant Navy & Gold'}</span>
            <span className="badge badge-secondary ml-2">📍 {eventProfile?.location || user.location || 'Malibu, CA'}</span>
            {user.isDemo && <span className="badge badge-warning ml-2">⚡ Interactive Demo Workspace</span>}
          </div>
          <h1 className="h2 font-heading text-gold mb-2">{getGreetingMessage()}</h1>
          <p className="body-sm text-secondary">
            Planning Partner:{' '}
            <span className="text-gold font-bold">{eventProfile?.plannerPartner || 'OVAimagination Events'}</span>
            {' '}&bull; AI Concierge Credits: <span className="text-gold font-bold">{user.aiCredits || 20}</span>
          </p>
        </div>

        {/* Step 23: Wedding Progress Score Banner */}
        <div className="card glass-panel p-6 mb-8 border-gold">
          <div className="progress-score-header flex-between mb-4">
            <div>
              <div className="flex-start items-center gap-3">
                <span className="overline">Wedding Progress Score</span>
                <span className="badge badge-gold font-bold">{progressData?.score || 0}% Complete</span>
              </div>
              <h2 className="h4 font-heading text-gold mt-1">Weighted Planning Readiness</h2>
            </div>
            <div className="next-best-action-badge">
              <span className="text-xs text-muted block">Next Best Action:</span>
              <span className="text-xs text-gold font-bold">{progressData?.nextAction || 'Continue planning your milestones'}</span>
            </div>
          </div>

          <div className="progress-bar-bg w-full mb-6">
            <div className="progress-bar-fill" style={{ width: `${progressData?.score || 0}%` }}></div>
          </div>

          {/* Breakdown of 5 core drivers */}
          <div className="drivers-grid">
            {(progressData?.breakdown || []).map((item) => (
              <div key={item.driver || item.name} className="driver-item">
                <div className="flex-between text-xs mb-1">
                  <span className="text-secondary">{item.driver || item.name} ({item.weight}%)</span>
                  <span className={item.current === item.max ? 'text-success font-bold' : 'text-gold'}>
                    {item.current} / {item.max} pts
                  </span>
                </div>
                <div className="sub-progress-bar">
                  <div 
                    className="sub-progress-fill" 
                    style={{ width: `${(item.current / item.max) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Dashboard Grid */}
        <div className="dashboard-grid">
          
          {/* Tile 1: Countdown Timer */}
          <div className="card glass-panel flex-col p-6">
            <div className="tile-title mb-4">
              <span className="overline">Celebration Countdown</span>
              <span className="badge badge-secondary">{formatDate(targetDate)}</span>
            </div>
            
            <div className="countdown-display flex-center mb-6">
              <div className="countdown-unit">
                <span className="countdown-number text-gold font-heading">{isMounted ? timeLeft.days : Math.max(0, daysRemaining)}</span>
                <span className="countdown-label">DAYS</span>
              </div>
              <span className="countdown-colon">:</span>
              <div className="countdown-unit">
                <span className="countdown-number text-gold font-heading">{isMounted ? padZero(timeLeft.hours) : '00'}</span>
                <span className="countdown-label">HOURS</span>
              </div>
              <span className="countdown-colon">:</span>
              <div className="countdown-unit">
                <span className="countdown-number text-gold font-heading">{isMounted ? padZero(timeLeft.minutes) : '00'}</span>
                <span className="countdown-label">MINUTES</span>
              </div>
              <span className="countdown-colon text-rose-gold">:</span>
              <div className="countdown-unit text-rose-gold">
                <span className="countdown-number text-rose-gold font-heading">{isMounted ? padZero(timeLeft.seconds) : '00'}</span>
                <span className="countdown-label text-rose-gold">SECONDS</span>
              </div>
            </div>
            
            <div className="progress-section w-full">
              <div className="flex-between mb-2">
                <span className="body-sm text-secondary">Checklist Tasks Finished</span>
                <span className="body-sm text-gold font-bold">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </span>
              </div>
              <div className="progress-bar-bg w-full">
                <div className="progress-bar-fill" style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}></div>
              </div>
              <div className="flex-between text-xs text-muted mt-2">
                <span>{completedTasks} completed</span>
                <span>{totalTasks} total tasks</span>
              </div>
            </div>
          </div>

          {/* Tile 2: Next Urgent Task */}
          <div className="card glass-panel flex-col p-6 justify-between">
            <div>
              <div className="tile-title mb-4">
                <span className="overline">Next Planning Step</span>
                {nextTask && <span className="badge badge-gold badge-sm">{nextTask.category}</span>}
              </div>
              {nextTask ? (
                <div className="next-task-card mt-2">
                  <div className="flex-start items-start gap-3">
                    <input 
                      type="checkbox" 
                      className="task-checkbox mt-1" 
                      checked={false} 
                      onChange={() => handleTaskToggle(nextTask.id, true)} 
                      aria-label={`Mark task completed: ${nextTask.title}`}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 className="h5 text-primary mb-1 font-body font-bold">{nextTask.title}</h3>
                      <p className="text-xs text-muted mb-2">Due date: {formatDate(nextTask.dueDate)} &bull; Assigned to: {nextTask.assignedTo || 'Both'}</p>
                      {nextTask.notes && (
                        <div className="notes-box p-3 bg-secondary rounded-md text-xs text-secondary mb-3">
                          💡 {nextTask.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state py-8 text-center">
                  <span style={{ fontSize: '2rem' }}>🎉</span>
                  <p className="body-sm text-primary mt-2">All tasks completed! You are completely on track.</p>
                </div>
              )}
            </div>
            
            <div className="action-row mt-6">
              <Link href="/checklist" className="btn btn-outline btn-sm w-full text-center">
                Open Master Checklist →
              </Link>
            </div>
          </div>

          {/* Tile 3: Step 10 Corrected Budget Snapshot */}
          <div className="card glass-panel flex-col p-6 justify-between">
            <div>
              <div className="tile-title mb-4">
                <span className="overline">Budget Snapshot</span>
                <span className={`badge ml-2 ${
                  budgetHealth === 'safe' ? 'badge-success' : budgetHealth === 'watch' ? 'badge-warning' : 'badge-danger'
                }`}>
                  Health: {budgetHealth.toUpperCase()}
                </span>
              </div>
              
              <div className="budget-metrics mt-2">
                <div className="metric-row flex-between py-2 border-b">
                  <span className="body-sm text-secondary">Target Budget Limit</span>
                  <span className="body-sm text-primary font-bold">{formatCurrency(budgetSummary.total)}</span>
                </div>
                <div className="metric-row flex-between py-2 border-b">
                  <span className="body-sm text-secondary">Total Contracted / Booked</span>
                  <span className="body-sm text-gold font-bold">{formatCurrency(budgetSummary.contracted)}</span>
                </div>
                <div className="metric-row flex-between py-2 border-b">
                  <span className="body-sm text-secondary">Total Paid to Vendors</span>
                  <span className="body-sm text-success font-bold">{formatCurrency(budgetSummary.paid)}</span>
                </div>
                <div className="metric-row flex-between py-2 border-b">
                  <span className="body-sm text-secondary">Outstanding Vendor Balance</span>
                  <span className="body-sm text-rose-gold font-bold">{formatCurrency(budgetSummary.outstanding)}</span>
                </div>
                <div className="metric-row flex-between py-2">
                  <span className="body-sm text-secondary">Unallocated Buffer</span>
                  <span className="body-sm text-success font-bold">{formatCurrency(budgetSummary.unallocated)}</span>
                </div>
              </div>

              <div className="budget-bar-section mt-4">
                <div className="progress-bar-bg w-full">
                  <div 
                    className={`progress-bar-fill ${
                      budgetHealth === 'safe' ? 'bg-success' : budgetHealth === 'watch' ? 'bg-warning' : 'bg-danger'
                    }`} 
                    style={{ width: `${Math.min(100, (budgetSummary.contracted / (budgetSummary.total || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="action-row mt-6">
              <Link href="/budget" className="btn btn-outline btn-sm w-full text-center">
                Manage Budget Allocations →
              </Link>
            </div>
          </div>

          {/* Tile 4: Guest List Status */}
          <div className="card glass-panel flex-col p-6 justify-between">
            <div>
              <div className="tile-title mb-4">
                <span className="overline">Guest RSVP Tracker</span>
                <span className="badge badge-secondary">{totalGuests} Invited</span>
              </div>
              
              <div className="guest-breakdown flex-around py-4">
                <div className="stat-box text-center">
                  <span className="stat-number text-success font-heading">{attendingGuests}</span>
                  <span className="caption text-muted">Confirmed</span>
                </div>
                <div className="stat-box text-center">
                  <span className="stat-number text-warning font-heading">{pendingGuests}</span>
                  <span className="caption text-muted">Pending</span>
                </div>
                <div className="stat-box text-center">
                  <span className="stat-number text-rose-gold font-heading">{declinedGuests}</span>
                  <span className="caption text-muted">Declined</span>
                </div>
              </div>
              
              <p className="text-xs text-muted text-center mt-2">
                RSVP Confirmation Rate: {totalGuests > 0 ? Math.round((attendingGuests / totalGuests) * 100) : 0}%
              </p>
            </div>

            <div className="action-row mt-6">
              <Link href="/guests" className="btn btn-outline btn-sm w-full text-center">
                Manage Guest List & RSVPs →
              </Link>
            </div>
          </div>
        </div>

        {/* Step 24: Weekly Planning Missions Section */}
        <div className="missions-section mt-8 mb-8">
          <div className="flex-between mb-4">
            <div>
              <span className="overline">Step 24 Feature</span>
              <h2 className="h4 font-heading text-gold">Weekly Planning Missions</h2>
            </div>
            <span className="badge badge-gold">Complete to earn +5 AI Credits</span>
          </div>

          <div className="missions-grid">
            {activeMissions.length > 0 ? (
              activeMissions.map((mission) => (
                <div key={mission.id} className={`card glass-panel p-5 mission-card ${mission.completed ? 'mission-done' : ''}`}>
                  <div className="flex-between mb-2">
                    <span className="badge badge-secondary text-xs">{mission.dueDate}</span>
                    <span className="text-xs text-gold font-bold">+{mission.reward} AI Credits</span>
                  </div>
                  <h3 className="h5 text-primary mb-2 font-heading">{mission.title}</h3>
                  <p className="body-sm text-secondary mb-4">{mission.desc}</p>
                  
                  <div className="flex-between items-center mt-auto">
                    {mission.completed ? (
                      <span className="badge badge-success">✓ Completed (+5 Credits Awarded)</span>
                    ) : (
                      <>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleCompleteMission(mission.id)}
                        >
                          Mark Complete (+5)
                        </button>
                        <button 
                          className="btn btn-ghost btn-sm text-muted"
                          onClick={() => store.snoozeMission(mission.id)}
                        >
                          Snooze
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="card glass-panel p-6 text-center w-full">
                <p className="body-sm text-secondary">All weekly missions cleared! New personalized missions appear every Monday.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Planning Actions Grid */}
        <div className="quick-actions-section mt-8 mb-8">
          <h2 className="h4 font-heading text-gold mb-4">Concierge Planning Suite</h2>
          <div className="actions-grid">
            <Link href="/ai-chat" className="action-card card glass-panel p-4 flex-center text-center">
              <span className="action-icon">🤖</span>
              <span className="action-label text-gold font-bold">Ask AI Concierge</span>
              <span className="action-desc text-xs text-secondary">Instant expert guidance</span>
            </Link>
            <Link href="/templates" className="action-card card glass-panel p-4 flex-center text-center">
              <span className="action-icon">💌</span>
              <span className="action-label text-gold font-bold">Invitation & RSVP</span>
              <span className="action-desc text-xs text-secondary">Custom digital suites</span>
            </Link>
            <Link href="/timeline" className="action-card card glass-panel p-4 flex-center text-center">
              <span className="action-icon">⏰</span>
              <span className="action-label text-gold font-bold">Master Timeline</span>
              <span className="action-desc text-xs text-secondary">Day-of event run-sheet</span>
            </Link>
            <Link href="/vendors" className="action-card card glass-panel p-4 flex-center text-center">
              <span className="action-icon">💒</span>
              <span className="action-label text-gold font-bold">Curated Vendors</span>
              <span className="action-desc text-xs text-secondary">Verified OVA partners</span>
            </Link>
          </div>
        </div>

        {/* Premium Upgrade CTA (Single Event Pass / Concierge Plus) */}
        {!user.eventPassActive && (
          <div className="upgrade-banner card glass-panel p-8 mt-8 flex-between items-center bg-gold-tint border-gold">
            <div className="upgrade-info max-w-2xl">
              <span className="badge badge-gold mb-2">SIMPLIFIED SINGLE-EVENT PRICING</span>
              <h2 className="h3 font-heading text-gold mb-2">Upgrade to the Elysian Event Pass</h2>
              <p className="body-sm text-secondary mb-0">
                Wedding planning is a milestone, not a monthly software subscription. Unlock **Unlimited AI Concierge Requests**, vendor contract sync, PDF exports, and collaborative reviewer seats for a one-time payment of **$99**. Zero recurring charges.
              </p>
            </div>
            <button 
              onClick={() => {
                store.updateUser({ eventPassActive: true, aiCredits: 9999 });
                setCelebrationModal({
                  title: 'Elysian Event Pass Active!',
                  message: 'You have unlocked unlimited AI Concierge chats and collaborative planning tools!',
                  badge: '🌟 Full Access'
                });
              }} 
              className="btn btn-primary btn-lg"
            >
              Activate Event Pass ($99)
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .dashboard-layout {
          background: transparent;
          color: #f5f0e8;
          min-height: 100vh;
        }
        .navbar-spacer {
          height: 80px;
        }
        .border-gold {
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
        .drivers-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .drivers-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .drivers-grid {
            grid-template-columns: 1fr;
          }
        }
        .sub-progress-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 2px;
          overflow: hidden;
        }
        .sub-progress-fill {
          height: 100%;
          background: #D4AF37;
          border-radius: 2px;
        }
        .tile-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .countdown-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 20px 10px;
          border-radius: 16px;
          background: rgba(10, 25, 47, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.2);
        }
        .countdown-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 60px;
        }
        .countdown-number {
          font-size: 2.2rem;
          line-height: 1.1;
          font-weight: 700;
        }
        .countdown-label {
          font-size: 0.65rem;
          color: #D4AF37;
          letter-spacing: 1.5px;
          margin-top: 6px;
          font-weight: 600;
        }
        .countdown-colon {
          font-size: 2rem;
          color: #D4AF37;
          margin-top: -18px;
          font-weight: 300;
          user-select: none;
        }
        .text-rose-gold {
          color: #F6AD55 !important;
        }
        .progress-bar-bg {
          height: 8px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #D4AF37 0%, #F59E0B 100%);
          border-radius: 4px;
          transition: width 0.4s ease;
        }
        .progress-bar-fill.bg-success {
          background: #10B981;
        }
        .progress-bar-fill.bg-warning {
          background: #F59E0B;
        }
        .progress-bar-fill.bg-danger {
          background: #EF4444;
        }
        .notes-box {
          border-left: 2.5px solid #D4AF37;
        }
        .bg-secondary {
          background: rgba(26, 32, 44, 0.6);
        }
        .task-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #D4AF37;
          cursor: pointer;
        }
        .border-b {
          border-bottom: 1px solid rgba(212, 175, 55, 0.1);
        }
        .guest-breakdown {
          display: flex;
          justify-content: space-around;
        }
        .stat-number {
          font-size: 2rem;
          display: block;
          color: #D4AF37;
        }
        .missions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px) {
          .missions-grid {
            grid-template-columns: 1fr;
          }
        }
        .mission-card {
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(212, 175, 55, 0.2);
        }
        .mission-done {
          border-color: rgba(16, 185, 129, 0.4);
          background: rgba(16, 185, 129, 0.04);
        }
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px) {
          .actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .actions-grid {
            grid-template-columns: 1fr;
          }
        }
        .action-card {
          cursor: pointer;
          transition: all 0.3s ease;
          gap: 6px;
        }
        .action-card:hover {
          transform: translateY(-3px);
          border-color: #D4AF37;
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.15);
        }
        .action-icon {
          font-size: 1.8rem;
          margin-bottom: 8px;
        }
        .bg-gold-tint {
          background: radial-gradient(circle at 10% 10%, rgba(212, 175, 55, 0.12) 0%, transparent 60%);
        }
        @media (max-width: 768px) {
          .upgrade-banner {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
        }
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(5, 13, 26, 0.85);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .celebration-card {
          background: #0A192F;
          border: 1px solid rgba(212, 175, 55, 0.4);
          border-radius: 16px;
          padding: 32px;
          max-width: 420px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
        }
        .celebration-icon {
          font-size: 3rem;
          margin-bottom: 12px;
        }
        .ml-2 { margin-left: 8px; }
        .mt-1 { margin-top: 4px; }
        .mt-2 { margin-top: 8px; }
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-6 { margin-bottom: 24px; }
        .mt-4 { margin-top: 16px; }
        .mt-6 { margin-top: 24px; }
        .mb-8 { margin-bottom: 32px; }
        .mt-8 { margin-top: 32px; }
        .py-8 { padding-top: 32px; padding-bottom: 32px; }
        .p-4 { padding: 16px; }
        .p-5 { padding: 20px; }
        .p-6 { padding: 24px; }
        .p-8 { padding: 32px; }
        .py-2 { padding-top: 8px; padding-bottom: 8px; }
        .py-4 { padding-top: 16px; padding-bottom: 16px; }
        .p-3 { padding: 12px; }
        .flex-col { display: flex; flex-direction: column; }
        .flex-between { display: flex; align-items: center; justify-content: space-between; }
        .flex-start { display: flex; align-items: flex-start; }
        .flex-around { display: flex; align-items: center; justify-content: space-around; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .font-bold { font-weight: 700; }
        .w-full { width: 100%; }
        .max-w-2xl { max-width: 42rem; }
        .block { display: block; }
      `}</style>
    </main>
  );
}
