'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWeddingStore } from '@/lib/store';
import { 
  formatDate, 
  daysUntil, 
  formatCurrency, 
  calculateBudgetHealth, 
  calculateProgress,
  getTimeGreeting 
} from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, tasks, vendors, guests, budget, timeline, loading } = store;
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mounted check to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Live ticking countdown state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!user || !user.weddingDate) return;
    const calculate = () => {
      const difference = +new Date(user.weddingDate) - +new Date();
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
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', background: '#0d0d1a' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(201, 169, 110, 0.15)', borderTopColor: '#c9a96e', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style jsx global>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .flex-center { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
        `}</style>
      </div>
    );
  }

  // Calculate statistics
  const daysRemaining = daysUntil(user.weddingDate);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const taskProgress = calculateProgress(completedTasks, totalTasks);
  const nextTask = tasks.find(t => !t.completed);

  // Budget calculations
  const budgetTotal = budget.total || 0;
  // Spent includes all booked vendor prices and paid payments
  const totalSpent = budget.categories?.reduce((sum, c) => sum + (c.actual || 0), 0) || 0;
  const budgetRemaining = Math.max(0, budgetTotal - totalSpent);
  const budgetHealth = calculateBudgetHealth(totalSpent, budgetTotal);
  
  // Guest counts
  const totalGuests = guests.length;
  const attendingGuests = guests.filter(g => g.status === 'Attending').length;
  const pendingGuests = guests.filter(g => g.status === 'Pending').length;

  const handleTaskToggle = (taskId, completed) => {
    store.updateTask(taskId, { completed });
  };

  const getGreetingMessage = () => {
    const greeting = isMounted ? getTimeGreeting() : 'Hello';
    if (daysRemaining < 0) {
      return `${greeting}, ${user.name.split('&')[0].trim()}! Congratulations on your wedding!`;
    }
    if (daysRemaining === 0) {
      return `❤️ Today is the day, ${user.name.split('&')[0].trim()}! Happy Wedding Day!`;
    }
    if (daysRemaining < 30) {
      return `⏰ ${greeting}, ${user.name.split('&')[0].trim()}! Just ${daysRemaining} days left! Time to finalize vendor arrival schedules.`;
    }
    return `${greeting}, ${user.name.split('&')[0].trim()}! You have ${daysRemaining} days until your dream wedding.`;
  };

  const padZero = (num) => String(num).padStart(2, '0');

  return (
    <main className="dashboard-layout">
      {/* Offsets the fixed navbar */}
      <div className="navbar-spacer"></div>

      <div className="container py-8">
        {/* Context-aware Greeting Header */}
        <div className="dashboard-header mb-8">
          <div className="header-badge mb-3">
            <span className="badge badge-gold">💍 {user.theme || 'Elegant Navy & Gold'}</span>
            <span className="badge badge-secondary ml-2">📍 {user.location || 'Malibu, CA'}</span>
          </div>
          <h1 className="h2 font-heading text-gold mb-2">{getGreetingMessage()}</h1>
          <p className="body-sm text-secondary">
            Here is the status of your wedding plans. You are planning with{' '}
            <span className="text-gold font-bold">OVAimagination Events</span>.
          </p>
        </div>

        {/* Core Dashboard Grid */}
        <div className="dashboard-grid">
          
          {/* Tile 1: Countdown & Progress */}
          <div className="card glass-panel flex-col p-6">
            <div className="tile-title mb-4">
              <span className="overline">Wedding Countdown</span>
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
                <span className="body-sm text-secondary">Checklist Completion</span>
                <span className="body-sm text-gold font-bold">{taskProgress}%</span>
              </div>
              <div className="progress-bar-bg w-full">
                <div className="progress-bar-fill" style={{ width: `${taskProgress}%` }}></div>
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
              </div>
              {nextTask ? (
                <div className="next-task-card mt-2">
                  <div className="flex-start items-start gap-3">
                    <input 
                      type="checkbox" 
                      className="task-checkbox mt-1" 
                      checked={false} 
                      onChange={() => handleTaskToggle(nextTask.id, true)} 
                    />
                    <div>
                      <h3 className="h5 text-primary mb-2 font-body font-bold">{nextTask.title}</h3>
                      <p className="text-xs text-muted mb-3">Due by: {formatDate(nextTask.dueDate)}</p>
                      {nextTask.notes && (
                        <div className="notes-box p-3 bg-secondary rounded-md text-xs text-secondary mb-3">
                          💡 {nextTask.notes}
                        </div>
                      )}
                      <span className="badge badge-gold badge-sm">{nextTask.category}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state py-8 text-center">
                  <span style={{ fontSize: '2rem' }}>🎉</span>
                  <p className="body-sm text-primary mt-2">All tasks completed! You are ahead of schedule.</p>
                </div>
              )}
            </div>
            
            <div className="action-row mt-6">
              <Link href="/checklist" className="btn btn-outline btn-sm w-full text-center">
                Go to Checklist →
              </Link>
            </div>
          </div>

          {/* Tile 3: Budget Snapshot */}
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
                  <span className="body-sm text-secondary">Total Budget Limit</span>
                  <span className="body-sm text-primary font-bold">{formatCurrency(budgetTotal)}</span>
                </div>
                <div className="metric-row flex-between py-2 border-b">
                  <span className="body-sm text-secondary">Allocated & Spent</span>
                  <span className="body-sm text-warning font-bold">{formatCurrency(totalSpent)}</span>
                </div>
                <div className="metric-row flex-between py-2">
                  <span className="body-sm text-secondary">Remaining Buffer</span>
                  <span className="body-sm text-success font-bold">{formatCurrency(budgetRemaining)}</span>
                </div>
              </div>

              <div className="budget-bar-section mt-4">
                <div className="progress-bar-bg w-full">
                  <div 
                    className={`progress-bar-fill ${
                      budgetHealth === 'safe' ? 'bg-success' : budgetHealth === 'watch' ? 'bg-warning' : 'bg-danger'
                    }`} 
                    style={{ width: `${Math.min(100, (totalSpent / (budgetTotal || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="action-row mt-6">
              <Link href="/budget" className="btn btn-outline btn-sm w-full text-center">
                Manage Budget →
              </Link>
            </div>
          </div>

          {/* Tile 4: Guest List Summary */}
          <div className="card glass-panel flex-col p-6 justify-between">
            <div>
              <div className="tile-title mb-4">
                <span className="overline">Guest List Status</span>
              </div>
              
              <div className="guest-breakdown flex-around py-4">
                <div className="stat-box text-center">
                  <span className="stat-number text-primary font-heading">{totalGuests}</span>
                  <span className="caption text-muted">Total RSVP</span>
                </div>
                <div className="stat-box text-center">
                  <span className="stat-number text-success font-heading">{attendingGuests}</span>
                  <span className="caption text-muted">Confirmed</span>
                </div>
                <div className="stat-box text-center">
                  <span className="stat-number text-warning font-heading">{pendingGuests}</span>
                  <span className="caption text-muted">Pending</span>
                </div>
              </div>
              
              <p className="text-xs text-muted text-center mt-2">
                RSVP rate is {calculateProgress(attendingGuests, totalGuests)}% of invitees.
              </p>
            </div>

            <div className="action-row mt-6">
              <Link href="/guests" className="btn btn-outline btn-sm w-full text-center">
                Manage Guest List →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="quick-actions-section mt-8 mb-8">
          <h2 className="h4 font-heading text-gold mb-4">Quick Planning Actions</h2>
          <div className="actions-grid">
            <Link href="/ai-chat" className="action-card card glass-panel p-4 flex-center text-center">
              <span className="action-icon">🤖</span>
              <span className="action-label text-gold font-bold">Ask AI Concierge</span>
              <span className="action-desc text-xs text-secondary">Get instant planning answers</span>
            </Link>
            <Link href="/checklist" className="action-card card glass-panel p-4 flex-center text-center">
              <span className="action-icon">✅</span>
              <span className="action-label text-gold font-bold">Add Custom Task</span>
              <span className="action-desc text-xs text-secondary">Insert unique milestones</span>
            </Link>
            <Link href="/budget" className="action-card card glass-panel p-4 flex-center text-center">
              <span className="action-icon">💸</span>
              <span className="action-label text-gold font-bold">Log New Payment</span>
              <span className="action-desc text-xs text-secondary">Track vendor installments</span>
            </Link>
            <Link href="/vendors" className="action-card card glass-panel p-4 flex-center text-center">
              <span className="action-icon">💒</span>
              <span className="action-label text-gold font-bold">Browse Vendors</span>
              <span className="action-desc text-xs text-secondary">Vetted partners list</span>
            </Link>
          </div>
        </div>

        {/* Premium Upgrade CTA (Event Pass / Token Options) */}
        {!user.eventPassActive && (
          <div className="upgrade-banner card glass-panel p-8 mt-8 flex-between items-center bg-gold-tint">
            <div className="upgrade-info max-w-2xl">
              <span className="badge badge-gold mb-2">LIMITED TIME</span>
              <h2 className="h3 font-heading text-gold mb-2">Activate the VND Event Pass</h2>
              <p className="body-sm text-secondary mb-0">
                Planning doesn't fit into monthly boxes. Get **Unlimited AI Chats**, premium PDF & Excel exports, and collaborative vendor tools for a one-time fee of **$99**. Zero monthly bills.
              </p>
            </div>
            <button 
              onClick={() => {
                store.updateUser({ eventPassActive: true, aiCredits: 9999 });
                alert("Thank you! Your Event Pass has been activated. You now have unlimited AI credits!");
              }} 
              className="btn btn-primary btn-lg"
            >
              Get Event Pass ($99)
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
          background: rgba(13, 13, 26, 0.4);
          border: 1px solid rgba(201, 169, 110, 0.15);
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
          color: #a0937d;
          letter-spacing: 1.5px;
          margin-top: 6px;
          font-weight: 600;
        }
        .countdown-colon {
          font-size: 2rem;
          color: #a0937d;
          margin-top: -18px;
          font-weight: 300;
          user-select: none;
        }
        .text-rose-gold {
          color: #ff7b7b !important;
        }
        .progress-bar-bg {
          height: 8px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #c9a96e 0%, #b8944f 100%);
          border-radius: 4px;
          transition: width 0.4s ease;
        }
        .progress-bar-fill.bg-success {
          background: #4ade80;
        }
        .progress-bar-fill.bg-warning {
          background: #f59e0b;
        }
        .progress-bar-fill.bg-danger {
          background: #ef4444;
        }
        .notes-box {
          border-left: 2.5px solid #c9a96e;
        }
        .bg-secondary {
          background: rgba(26, 26, 46, 0.6);
        }
        .task-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #c9a96e;
          cursor: pointer;
        }
        .border-b {
          border-bottom: 1px solid rgba(201, 169, 110, 0.08);
        }
        .guest-breakdown {
          display: flex;
          justify-content: space-around;
        }
        .stat-number {
          font-size: 2rem;
          display: block;
          color: #c9a96e;
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
          border-color: #c9a96e;
          box-shadow: 0 4px 16px rgba(201, 169, 110, 0.15);
        }
        .action-icon {
          font-size: 1.8rem;
          margin-bottom: 8px;
        }
        .bg-gold-tint {
          background: radial-gradient(circle at 10% 10%, rgba(201, 169, 110, 0.12) 0%, transparent 60%);
        }
        @media (max-width: 768px) {
          .upgrade-banner {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
        }
        .ml-2 { margin-left: 8px; }
        .mt-2 { margin-top: 8px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
        .mb-4 { margin-bottom: 16px; }
        .mt-4 { margin-top: 16px; }
        .mt-6 { margin-top: 24px; }
        .mb-8 { margin-bottom: 32px; }
        .mt-8 { margin-top: 32px; }
        .py-8 { padding-top: 32px; padding-bottom: 32px; }
        .p-6 { padding: 24px; }
        .p-8 { padding: 32px; }
        .p-4 { padding: 16px; }
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
        .max-w-2xl { max-w: 42rem; }
      `}</style>
    </main>
  );
}
