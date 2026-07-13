'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeddingStore } from '@/lib/store';
import { formatCurrency, calculateBudgetHealth, getCategoryColor, getCategoryIcon } from '@/lib/utils';

export default function BudgetPage() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, budget, loading, updateBudgetTotal, addBudgetPayment, updateBudgetPayment, deleteBudgetPayment } = store;

  const [editBudgetOpen, setEditBudgetOpen] = useState(false);
  const [newBudgetTotal, setNewBudgetTotal] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    vendorName: '',
    category: 'Venue',
    amount: '',
    date: '',
    status: 'Upcoming',
    method: 'Credit Card',
  });

  const [optimizerOpen, setOptimizerOpen] = useState(false);
  const [priorities, setPriorities] = useState({
    'Venue & Catering': 3,
    'Photography & Videography': 3,
    'Planner/Coordinator': 3,
    'Attire & Beauty': 3,
    'Florals & Decor': 3,
    'Entertainment': 3,
    'Invitations & Rings': 3
  });
  const [optimizedResult, setOptimizedResult] = useState(null);
  const [optimizing, setOptimizing] = useState(false);

  const handleRunOptimization = async (e) => {
    e.preventDefault();
    setOptimizing(true);
    try {
      const { api } = await import('@/lib/api');
      const res = await api.optimizeBudget(Number(newBudgetTotal), priorities, false);
      setOptimizedResult(res);
    } catch (err) {
      console.error('Optimization failed:', err);
      alert('Failed to calculate optimizations.');
    } finally {
      setOptimizing(false);
    }
  };

  const handleApplyOptimization = async () => {
    if (!optimizedResult) return;
    try {
      const { api } = await import('@/lib/api');
      await api.optimizeBudget(Number(newBudgetTotal), priorities, true);
      alert('Budget optimized allocations successfully applied!');
      window.location.reload();
    } catch (err) {
      console.error('Failed to apply optimization:', err);
      alert('Failed to apply allocations.');
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user) {
      setNewBudgetTotal(budget.total || 50000);
    }
  }, [user, loading, router, budget.total]);

  if (loading || !user) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', background: '#0d0d1a' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(201, 169, 110, 0.15)', borderTopColor: '#c9a96e', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style jsx>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .flex-center { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #0d0d1a; }
        `}</style>
      </div>
    );
  }

  const budgetTotal = budget.total || 0;
  const categories = budget.categories || [];
  const payments = budget.payments || [];

  // Spent includes all actual amounts in categories
  const totalSpent = categories.reduce((sum, c) => sum + (c.actual || 0), 0);
  const totalEstimated = categories.reduce((sum, c) => sum + (c.estimated || 0), 0);
  const remainingBuffer = Math.max(0, budgetTotal - totalSpent);
  const health = calculateBudgetHealth(totalSpent, budgetTotal);

  // Payments calculations
  const totalPaid = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalUpcoming = payments.filter(p => p.status === 'Upcoming').reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleEditBudgetSubmit = (e) => {
    e.preventDefault();
    updateBudgetTotal(Number(newBudgetTotal));
    setEditBudgetOpen(false);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!paymentForm.vendorName || !paymentForm.amount || !paymentForm.date) return;

    addBudgetPayment({
      vendorName: paymentForm.vendorName,
      category: paymentForm.category,
      amount: Number(paymentForm.amount),
      date: paymentForm.date,
      status: paymentForm.status,
      method: paymentForm.method,
    });

    setPaymentForm({
      vendorName: '',
      category: selectedCategory || 'Venue',
      amount: '',
      date: '',
      status: 'Upcoming',
      method: 'Credit Card',
    });
    setModalOpen(false);
  };

  const handleStatusToggle = (paymentId, currentStatus) => {
    const nextStatus = currentStatus === 'Paid' ? 'Upcoming' : 'Paid';
    updateBudgetPayment(paymentId, { status: nextStatus });
  };

  const handleDeletePayment = (paymentId) => {
    if (confirm('Are you sure you want to delete this payment entry?')) {
      deleteBudgetPayment(paymentId);
    }
  };

  return (
    <main className="budget-layout">
      <div className="navbar-spacer"></div>

      <div className="container py-8 max-w-5xl">
        {/* Header */}
        <div className="flex-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="h2 font-heading text-gold mb-1">Budget Tracker</h1>
            <p className="body-sm text-secondary">
              Track styling estimates and payment logs. Vetted targets by **OVAimagination Events**.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setEditBudgetOpen(true)}
              className="btn btn-secondary"
            >
              ⚙️ Adjust Limit
            </button>
            <button 
              onClick={() => setOptimizerOpen(true)}
              className="btn btn-secondary text-gold"
              style={{ borderColor: 'rgba(201, 169, 110, 0.4)' }}
            >
              ✨ AI Optimizer
            </button>
            <button 
              onClick={() => {
                setSelectedCategory(null);
                setModalOpen(true);
              }}
              className="btn btn-primary"
            >
              ＋ Log Payment
            </button>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="budget-summary-grid mb-8">
          {/* Card 1: Total Budget Limit */}
          <div className="card glass-panel p-6 flex-col text-center justify-center">
            <span className="overline text-muted mb-2">Total Budget Limit</span>
            <span className="stat-number text-gold font-heading">{formatCurrency(budgetTotal)}</span>
          </div>

          {/* Card 2: Total Spent / Allocated */}
          <div className="card glass-panel p-6 flex-col text-center justify-center relative">
            <span className="overline text-muted mb-2">Allocated & Spent</span>
            <span className="stat-number text-warning font-heading">{formatCurrency(totalSpent)}</span>
            <span className={`badge absolute-badge ${
              health === 'safe' ? 'badge-success' : health === 'watch' ? 'badge-warning' : 'badge-danger'
            }`}>
              {health.toUpperCase()}
            </span>
          </div>

          {/* Card 3: Remaining Buffer */}
          <div className="card glass-panel p-6 flex-col text-center justify-center">
            <span className="overline text-muted mb-2">Remaining Buffer</span>
            <span className="stat-number text-success font-heading">{formatCurrency(remainingBuffer)}</span>
          </div>
        </div>

        {/* Cash Flow Progress Cards */}
        <div className="grid grid-2 mb-8 gap-6">
          <div className="card glass-panel p-5">
            <h3 className="h6 font-body font-bold text-primary mb-3">Invoice Cash Flow</h3>
            <div className="flex-between py-2 border-b">
              <span className="body-sm text-secondary">Total Paid Off</span>
              <span className="body-sm text-success font-bold">{formatCurrency(totalPaid)}</span>
            </div>
            <div className="flex-between py-2">
              <span className="body-sm text-secondary">Total Outstanding</span>
              <span className="body-sm text-warning font-bold">{formatCurrency(totalUpcoming)}</span>
            </div>
          </div>

          <div className="card glass-panel p-5 flex-col justify-center">
            <h3 className="h6 font-body font-bold text-primary mb-2">Budget Allocation Health</h3>
            <div className="progress-bar-bg w-full mb-3">
              <div 
                className={`progress-bar-fill ${
                  health === 'safe' ? 'bg-success' : health === 'watch' ? 'bg-warning' : 'bg-danger'
                }`} 
                style={{ width: `${Math.min(100, (totalSpent / (budgetTotal || 1)) * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted mb-0">
              Your actual vendor contracts consume **{Math.round((totalSpent / (budgetTotal || 1)) * 100)}%** of your total ceiling.
            </p>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="budget-content-grid">
          {/* Categories Grid */}
          <div className="categories-box">
            <h2 className="h4 font-heading text-gold mb-4">Category Estimates</h2>
            <div className="categories-grid flex-col gap-4">
              {categories.map(cat => {
                const catSpentPct = Math.round((cat.actual / (cat.estimated || 1)) * 100);
                const isOver = cat.actual > cat.estimated;
                
                return (
                  <div key={cat.name} className="card glass-panel p-4 flex-col">
                    <div className="flex-between mb-3 items-center">
                      <div className="flex-start items-center gap-3">
                        <span className="cat-icon-decor" style={{ color: getCategoryColor(cat.name) }}>
                          {getCategoryIcon(cat.name)}
                        </span>
                        <div>
                          <h3 className="body-sm font-bold text-primary mb-0">{cat.name}</h3>
                          <span className="text-xs text-muted">Est: {formatCurrency(cat.estimated)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`body-sm font-bold block ${isOver ? 'text-danger' : 'text-primary'}`}>
                          {formatCurrency(cat.actual)}
                        </span>
                        <span className="text-xs text-muted">{catSpentPct}% of est</span>
                      </div>
                    </div>

                    <div className="progress-bar-bg w-full">
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          width: `${Math.min(100, catSpentPct)}%`,
                          backgroundColor: getCategoryColor(cat.name) 
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payments Logs */}
          <div className="payments-box">
            <h2 className="h4 font-heading text-gold mb-4">Payment Logs</h2>
            <div className="payments-list flex-col gap-3">
              {payments.length > 0 ? (
                payments.map(pay => (
                  <div key={pay.id} className="card glass-panel p-4 flex-between items-center">
                    <div className="flex-start items-center gap-3 flex-1">
                      <button 
                        onClick={() => handleStatusToggle(pay.id, pay.status)}
                        className={`status-circle-btn flex-center ${pay.status === 'Paid' ? 'paid-icon' : 'unpaid-icon'}`}
                        title={pay.status === 'Paid' ? 'Mark unpaid' : 'Mark paid'}
                      >
                        {pay.status === 'Paid' ? '✓' : '⏰'}
                      </button>
                      <div className="flex-col">
                        <span className="body-sm font-bold text-primary">{pay.vendorName}</span>
                        <div className="flex-start gap-2 items-center text-xs text-muted mt-1">
                          <span>{getCategoryIcon(pay.category)} {pay.category}</span>
                          <span>•</span>
                          <span>{pay.method}</span>
                          <span>•</span>
                          <span>{pay.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-start items-center gap-3">
                      <span className={`body-sm font-bold ${pay.status === 'Paid' ? 'text-success' : 'text-warning'}`}>
                        {formatCurrency(pay.amount)}
                      </span>
                      <button 
                        onClick={() => handleDeletePayment(pay.id)}
                        className="btn btn-ghost btn-sm text-danger"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card glass-panel p-8 text-center">
                  <span style={{ fontSize: '2rem' }}>💸</span>
                  <p className="body-sm text-secondary mt-2">No payments logged yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Adjust Total Budget Modal */}
      {editBudgetOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-gold font-heading">Adjust Budget Ceiling</h3>
              <button onClick={() => setEditBudgetOpen(false)} className="modal-close">×</button>
            </div>
            <form onSubmit={handleEditBudgetSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Total Budget Ceiling ($)</label>
                  <input 
                    type="number" 
                    required
                    min="1000"
                    max="1000000"
                    placeholder="e.g. 50000"
                    value={newBudgetTotal}
                    onChange={(e) => setNewBudgetTotal(e.target.value)}
                    className="form-input"
                  />
                  <p className="form-hint">
                    This updates your total ceiling. The category estimations will retain their percentage allocations.
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setEditBudgetOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Update Ceiling</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Payment Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-gold font-heading">Log Wedding Payment</h3>
              <button onClick={() => setModalOpen(false)} className="modal-close">×</button>
            </div>
            <form onSubmit={handlePaymentSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Payee / Vendor Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Marcus Sterling"
                    value={paymentForm.vendorName}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, vendorName: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="grid grid-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select 
                      value={paymentForm.category}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, category: e.target.value }))}
                      className="form-select"
                    >
                      {['Venue', 'Catering', 'Planner', 'Photography', 'Videography', 'Florals', 'Music', 'Attire', 'Hair & Makeup', 'Invitations', 'Bakery', 'Rings', 'Decor', 'Misc'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount Paid ($)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="2000"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="grid grid-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Date of Payment</label>
                    <input 
                      type="date" 
                      required
                      value={paymentForm.date}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select 
                      value={paymentForm.method}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, method: e.target.value }))}
                      className="form-select"
                    >
                      {['Credit Card', 'Wire Transfer', 'Check', 'Venmo', 'PayPal', 'Cash'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select 
                    value={paymentForm.status}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, status: e.target.value }))}
                    className="form-select"
                  >
                    <option value="Upcoming">⏰ Upcoming (Scheduled)</option>
                    <option value="Paid">✓ Paid Off</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Log Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Budget Optimizer Modal */}
      {optimizerOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header">
              <h3 className="text-gold font-heading">✨ AI Budget Allocation Optimizer</h3>
              <button onClick={() => { setOptimizerOpen(false); setOptimizedResult(null); }} className="modal-close">×</button>
            </div>
            <form onSubmit={handleRunOptimization}>
              <div className="modal-body">
                <p className="body-sm text-secondary mb-4">
                  Set priority levels for different categories. Our Python ML optimization microservice will dynamically recalculate your budget targets, maintaining a 10% safety cushion.
                </p>

                <div className="flex-col gap-3 mb-6" style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '8px' }}>
                  {Object.keys(priorities).map(category => (
                    <div key={category} className="flex-between items-center p-3 rounded-lg border border-divider" style={{ background: 'rgba(26, 26, 46, 0.4)', gap: '10px' }}>
                      <span className="body-sm text-primary font-bold">{category}</span>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(rank => (
                          <button
                            key={rank}
                            type="button"
                            onClick={() => setPriorities(prev => ({ ...prev, [category]: rank }))}
                            className="btn btn-sm"
                            style={{
                              padding: '4px 10px',
                              background: priorities[category] === rank ? '#c9a96e' : 'rgba(255, 255, 255, 0.05)',
                              color: priorities[category] === rank ? '#0d0d1a' : '#f5f0e8',
                              border: 'none',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            {rank}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="form-group mb-4">
                  <label className="form-label">Total Optimization Ceiling ($)</label>
                  <input
                    type="number"
                    required
                    value={newBudgetTotal}
                    onChange={(e) => setNewBudgetTotal(e.target.value)}
                    className="form-input"
                  />
                </div>

                {optimizedResult && (
                  <div className="bg-secondary p-4 rounded-lg border border-divider mb-4" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                    <h4 className="text-success font-heading mb-3" style={{ fontSize: '1rem' }}>✓ Optimization Calculated Successfully!</h4>
                    <div className="flex-between text-secondary mb-2" style={{ fontSize: '0.85rem' }}>
                      <span>Safety Cushion Reserved (10%):</span>
                      <span className="font-bold text-success">${optimizedResult.safety_cushion.toLocaleString()}</span>
                    </div>
                    <div className="flex-between text-secondary mb-4" style={{ fontSize: '0.85rem' }}>
                      <span>Net Allocatable Amount:</span>
                      <span className="font-bold text-primary">${optimizedResult.allocatable_amount.toLocaleString()}</span>
                    </div>

                    <div className="flex-col gap-2" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                      {Object.entries(optimizedResult.allocations).map(([catName, details]) => (
                        <div key={catName} className="flex-between py-1 border-b" style={{ fontSize: '0.8rem', borderBottomColor: 'rgba(255, 255, 255, 0.05)' }}>
                          <span className="text-secondary">{catName} Target:</span>
                          <span className="text-primary font-bold">
                            ${details.target.toLocaleString()} 
                            <span className="text-muted font-normal ml-2" style={{ fontSize: '0.7rem' }}>
                              (${details.range_min.toLocaleString()} - ${details.range_max.toLocaleString()})
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => { setOptimizerOpen(false); setOptimizedResult(null); }} className="btn btn-secondary btn-sm">Cancel</button>
                {optimizedResult ? (
                  <button type="button" onClick={handleApplyOptimization} className="btn btn-primary btn-sm text-gold">Apply Allocations</button>
                ) : (
                  <button type="submit" disabled={optimizing} className="btn btn-primary btn-sm">
                    {optimizing ? 'Calculating Math Models...' : 'Calculate Allocations'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .budget-layout {
          background: transparent;
          color: #f5f0e8;
          min-height: 100vh;
        }
        .navbar-spacer {
          height: 80px;
        }
        .max-w-5xl {
          max-width: 64rem;
          margin: 0 auto;
        }
        .budget-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 768px) {
          .budget-summary-grid {
            grid-template-columns: 1fr;
          }
        }
        .stat-number {
          font-size: 2.2rem;
          display: block;
        }
        .absolute-badge {
          top: 12px;
          right: 12px;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }
        @media (max-width: 640px) {
          .grid-2 {
            grid-template-columns: 1fr;
          }
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
        .progress-bar-fill.bg-success { background: #4ade80; }
        .progress-bar-fill.bg-warning { background: #f59e0b; }
        .progress-bar-fill.bg-danger { background: #ef4444; }
        
        .border-b {
          border-bottom: 1px solid rgba(201, 169, 110, 0.08);
        }
        .budget-content-grid {
          display: grid;
          grid-template-columns: 4fr 5fr;
          gap: 32px;
        }
        @media (max-width: 900px) {
          .budget-content-grid {
            grid-template-columns: 1fr;
          }
        }
        .cat-icon-decor {
          font-size: 1.5rem;
        }
        .status-circle-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid rgba(201, 169, 110, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .paid-icon {
          background: rgba(74, 222, 128, 0.15);
          color: #4ade80;
          border-color: #4ade80;
        }
        .unpaid-icon {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          border-color: #f59e0b;
        }
        .status-circle-btn:hover {
          filter: brightness(1.2);
          transform: scale(1.05);
        }
        .mb-0 { margin-bottom: 0; }
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-6 { margin-bottom: 24px; }
        .mb-8 { margin-bottom: 32px; }
        .mt-1 { margin-top: 4px; }
        .mt-2 { margin-top: 8px; }
        .py-8 { padding-top: 32px; padding-bottom: 32px; }
        .py-2 { padding-top: 8px; padding-bottom: 8px; }
        .p-4 { padding: 16px; }
        .p-5 { padding: 20px; }
        .p-6 { padding: 24px; }
        .flex-col { display: flex; flex-direction: column; }
        .flex-between { display: flex; align-items: center; justify-content: space-between; }
        .flex-start { display: flex; align-items: center; justify-content: flex-start; }
        .flex-center { display: flex; align-items: center; justify-content: center; }
        .flex-wrap { flex-wrap: wrap; }
        .gap-3 { gap: 12px; }
        .gap-4 { gap: 16px; }
        .gap-6 { gap: 24px; }
        .font-bold { font-weight: 700; }
        .w-full { width: 100%; }
        .relative { position: relative; }
      `}</style>
    </main>
  );
}
