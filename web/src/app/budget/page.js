'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeddingStore } from '@/lib/store';
import { 
  formatCurrency, 
  calculateBudgetSummary, 
  calculateBudgetHealth, 
  getCategoryColor, 
  getCategoryIcon 
} from '@/lib/utils';

export default function BudgetPage() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, eventProfile, budget, loading, updateBudgetTotal, addBudgetPayment, updateBudgetPayment, deleteBudgetPayment, updateBudgetCategory } = store;

  const [editBudgetOpen, setEditBudgetOpen] = useState(false);
  const [newBudgetTotal, setNewBudgetTotal] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', planned: 0, contracted: 0 });

  const [paymentForm, setPaymentForm] = useState({
    vendorName: '',
    category: 'Venue',
    amount: '',
    date: '',
    status: 'Upcoming',
    method: 'Credit Card',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user) {
      setNewBudgetTotal(budget?.total || 50000);
    }
  }, [user, loading, router, budget?.total]);

  if (loading || !user) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--color-navy-dark, #050d1a)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212, 175, 55, 0.2)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style jsx>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .flex-center { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
        `}</style>
      </div>
    );
  }

  // Step 10: Corrected Budget Model Breakdown
  const summary = calculateBudgetSummary(budget);
  const health = calculateBudgetHealth(summary.contracted, summary.total);
  const categories = budget?.categories || [];
  const payments = budget?.payments || [];

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
      category: 'Venue',
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
    if (confirm('Are you sure you want to delete this payment record?')) {
      deleteBudgetPayment(paymentId);
    }
  };

  const handleEditCategoryOpen = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      planned: cat.planned || cat.estimated || 0,
      contracted: cat.contracted || cat.actual || 0,
    });
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      updateBudgetCategory(editingCategory.name, {
        planned: Number(categoryForm.planned),
        contracted: Number(categoryForm.contracted),
      });
    }
    setCategoryModalOpen(false);
  };

  return (
    <main className="budget-layout">
      <div className="navbar-spacer"></div>

      <div className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="flex-between mb-6 flex-wrap gap-4">
          <div>
            <div className="flex-start items-center gap-2 mb-1">
              <span className="badge badge-gold">Step 10 Model Reconciled</span>
              <span className="badge badge-secondary">{eventProfile?.coupleNames || user.name}</span>
            </div>
            <h1 className="h2 font-heading text-gold mb-1">Elysian Budget Suite</h1>
            <p className="body-sm text-secondary">
              Strict accounting separation: Target Allocations, Signed Contracts, and Paid Invoices.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setEditBudgetOpen(true)}
              className="btn btn-secondary"
            >
              ⚙️ Adjust Target Limit
            </button>
            <button 
              onClick={() => setModalOpen(true)}
              className="btn btn-primary"
            >
              ＋ Log Payment
            </button>
          </div>
        </div>

        {/* 5-Metric Corrected Budget Summary Grid (Step 10) */}
        <div className="budget-metrics-grid mb-8">
          {/* Metric 1: Total Target Budget */}
          <div className="card glass-panel p-5 text-center">
            <span className="overline text-muted mb-1">1. Target Budget</span>
            <span className="stat-number text-gold font-heading">{formatCurrency(summary.total)}</span>
            <span className="caption text-secondary mt-1">Total planned ceiling</span>
          </div>

          {/* Metric 2: Total Contracted */}
          <div className="card glass-panel p-5 text-center">
            <span className="overline text-muted mb-1">2. Signed Contracts</span>
            <span className="stat-number text-warning font-heading">{formatCurrency(summary.contracted)}</span>
            <span className="caption text-secondary mt-1">Committed to vendors</span>
          </div>

          {/* Metric 3: Paid To Date */}
          <div className="card glass-panel p-5 text-center">
            <span className="overline text-muted mb-1">3. Paid to Date</span>
            <span className="stat-number text-success font-heading">{formatCurrency(summary.paid)}</span>
            <span className="caption text-secondary mt-1">Cash out of account</span>
          </div>

          {/* Metric 4: Outstanding Balance */}
          <div className="card glass-panel p-5 text-center">
            <span className="overline text-muted mb-1">4. Outstanding Due</span>
            <span className="stat-number text-rose-gold font-heading">{formatCurrency(summary.outstanding)}</span>
            <span className="caption text-secondary mt-1">Contracted minus paid</span>
          </div>

          {/* Metric 5: Unallocated Buffer */}
          <div className="card glass-panel p-5 text-center">
            <span className="overline text-muted mb-1">5. Unallocated Buffer</span>
            <span className={`stat-number font-heading ${summary.unallocated < 0 ? 'text-danger' : 'text-primary'}`}>
              {formatCurrency(summary.unallocated)}
            </span>
            <span className="caption text-secondary mt-1">Available to commit</span>
          </div>
        </div>

        {/* Budget Health Overview Banner */}
        <div className="card glass-panel p-6 mb-8 border-gold">
          <div className="flex-between items-center mb-3">
            <div>
              <span className="overline">Budget Commitment Health</span>
              <h3 className="h4 font-heading text-gold">
                {summary.contracted > summary.total ? '⚠️ Over Target Limit' : '✓ Spending Within Target Parameters'}
              </h3>
            </div>
            <span className={`badge ${
              health === 'safe' ? 'badge-success' : health === 'watch' ? 'badge-warning' : 'badge-danger'
            }`}>
              Health: {health.toUpperCase()}
            </span>
          </div>
          <div className="progress-bar-bg w-full mb-3">
            <div 
              className={`progress-bar-fill ${
                health === 'safe' ? 'bg-success' : health === 'watch' ? 'bg-warning' : 'bg-danger'
              }`} 
              style={{ width: `${Math.min(100, (summary.contracted / (summary.total || 1)) * 100)}%` }}
            ></div>
          </div>
          <div className="flex-between text-xs text-muted">
            <span>{formatCurrency(summary.contracted)} contracted ({Math.round((summary.contracted / (summary.total || 1)) * 100)}% of ceiling)</span>
            <span>{formatCurrency(summary.unallocated)} remaining uncommitted</span>
          </div>
        </div>

        {/* Main Content: Category Allocations vs Payment Logs */}
        <div className="budget-content-grid">
          {/* Category Allocations with Over-Budget Alerts */}
          <div className="categories-box">
            <div className="flex-between items-center mb-4">
              <h2 className="h4 font-heading text-gold mb-0">Category Breakdown</h2>
              <span className="text-xs text-muted">Click to edit target</span>
            </div>

            <div className="categories-grid flex-col gap-4">
              {categories.map(cat => {
                const planned = cat.planned || cat.estimated || 0;
                const contracted = cat.contracted || cat.actual || 0;
                const paid = cat.paid || 0;
                const isOverBudget = contracted > planned;
                const percentage = planned > 0 ? Math.round((contracted / planned) * 100) : 0;
                
                return (
                  <div 
                    key={cat.name} 
                    className={`card glass-panel p-4 flex-col cat-card ${isOverBudget ? 'card-overbudget' : ''}`}
                    onClick={() => handleEditCategoryOpen(cat)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleEditCategoryOpen(cat); }}
                  >
                    <div className="flex-between mb-2 items-center">
                      <div className="flex-start items-center gap-3">
                        <span className="cat-icon-decor" style={{ color: getCategoryColor(cat.name) }}>
                          {getCategoryIcon(cat.name)}
                        </span>
                        <div>
                          <div className="flex-start items-center gap-2">
                            <h3 className="body-sm font-bold text-primary mb-0">{cat.name}</h3>
                            {isOverBudget && <span className="badge badge-danger text-xs">Over Target</span>}
                          </div>
                          <span className="text-xs text-muted">
                            Target Plan: {formatCurrency(planned)} &bull; Paid: {formatCurrency(paid)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`body-sm font-bold block ${isOverBudget ? 'text-danger' : 'text-gold'}`}>
                          {formatCurrency(contracted)}
                        </span>
                        <span className="text-xs text-muted">{percentage}% contracted</span>
                      </div>
                    </div>

                    <div className="progress-bar-bg w-full">
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          width: `${Math.min(100, percentage)}%`,
                          backgroundColor: isOverBudget ? '#EF4444' : getCategoryColor(cat.name) 
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Logs List */}
          <div className="payments-box">
            <div className="flex-between items-center mb-4">
              <h2 className="h4 font-heading text-gold mb-0">Payment Ledger</h2>
              <span className="text-xs text-muted">{payments.length} transactions</span>
            </div>

            <div className="payments-list flex-col gap-3">
              {payments.length > 0 ? (
                payments.map(pay => (
                  <div key={pay.id} className="card glass-panel p-4 flex-between items-center">
                    <div className="flex-start items-center gap-3 flex-1">
                      <button 
                        onClick={() => handleStatusToggle(pay.id, pay.status)}
                        className={`status-circle-btn flex-center ${pay.status === 'Paid' ? 'paid-icon' : 'unpaid-icon'}`}
                        title={pay.status === 'Paid' ? 'Mark unpaid' : 'Mark paid'}
                        aria-label={`Toggle payment status for ${pay.vendorName}`}
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
                        title="Delete payment record"
                        aria-label={`Delete payment for ${pay.vendorName}`}
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
                  <button 
                    onClick={() => setModalOpen(true)}
                    className="btn btn-outline btn-sm mt-3"
                  >
                    Log First Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Adjust Total Budget Modal */}
      {editBudgetOpen && (
        <div className="modal-overlay" onClick={() => setEditBudgetOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-gold font-heading">Adjust Target Budget Limit</h3>
              <button onClick={() => setEditBudgetOpen(false)} className="modal-close" aria-label="Close modal">×</button>
            </div>
            <form onSubmit={handleEditBudgetSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Total Target Ceiling ($)</label>
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
                    Updates your overarching wedding budget ceiling.
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setEditBudgetOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Limit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {categoryModalOpen && (
        <div className="modal-overlay" onClick={() => setCategoryModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-gold font-heading">Edit Category: {categoryForm.name}</h3>
              <button onClick={() => setCategoryModalOpen(false)} className="modal-close" aria-label="Close modal">×</button>
            </div>
            <form onSubmit={handleCategorySubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Target Planned Allocation ($)</label>
                  <input 
                    type="number" 
                    required
                    value={categoryForm.planned}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, planned: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Signed Contracted Total ($)</label>
                  <input 
                    type="number" 
                    required
                    value={categoryForm.contracted}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, contracted: e.target.value }))}
                    className="form-input"
                  />
                  <p className="form-hint">
                    Reflects total committed vendor contracts for this category.
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setCategoryModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Payment Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-gold font-heading">Log Wedding Payment</h3>
              <button onClick={() => setModalOpen(false)} className="modal-close" aria-label="Close modal">×</button>
            </div>
            <form onSubmit={handlePaymentSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Payee / Vendor Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Marcus Sterling Photography"
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
                      {['Venue', 'Catering & Bar', 'Planner & Concierge', 'Photography & Film', 'Florals & Decor', 'Music & Entertainment', 'Attire & Beauty', 'Stationery & Misc'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount ($)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="2500"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="grid grid-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Payment Date</label>
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
                    <option value="Upcoming">⏰ Upcoming (Scheduled Installment)</option>
                    <option value="Paid">✓ Paid Off</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Transaction</button>
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
        .max-w-6xl {
          max-width: 72rem;
          margin: 0 auto;
        }
        .border-gold {
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
        }
        .budget-metrics-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) {
          .budget-metrics-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 640px) {
          .budget-metrics-grid {
            grid-template-columns: 1fr;
          }
        }
        .stat-number {
          font-size: 1.8rem;
          display: block;
        }
        .text-rose-gold {
          color: #F6AD55 !important;
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
          background: linear-gradient(90deg, #D4AF37 0%, #F59E0B 100%);
          border-radius: 4px;
          transition: width 0.4s ease;
        }
        .progress-bar-fill.bg-success { background: #10B981; }
        .progress-bar-fill.bg-warning { background: #F59E0B; }
        .progress-bar-fill.bg-danger { background: #EF4444; }
        
        .budget-content-grid {
          display: grid;
          grid-template-columns: 5fr 4fr;
          gap: 32px;
        }
        @media (max-width: 900px) {
          .budget-content-grid {
            grid-template-columns: 1fr;
          }
        }
        .cat-card {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .cat-card:hover {
          border-color: #D4AF37;
          transform: translateY(-2px);
        }
        .card-overbudget {
          border-left: 3px solid #EF4444 !important;
        }
        .cat-icon-decor {
          font-size: 1.5rem;
        }
        .status-circle-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid rgba(212, 175, 55, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .paid-icon {
          background: rgba(16, 185, 129, 0.15);
          color: #10B981;
          border-color: #10B981;
        }
        .unpaid-icon {
          background: rgba(245, 158, 11, 0.1);
          color: #F59E0B;
          border-color: #F59E0B;
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
        .mt-3 { margin-top: 12px; }
        .py-8 { padding-top: 32px; padding-bottom: 32px; }
        .p-4 { padding: 16px; }
        .p-5 { padding: 20px; }
        .p-6 { padding: 24px; }
        .p-8 { padding: 32px; }
        .flex-col { display: flex; flex-direction: column; }
        .flex-between { display: flex; align-items: center; justify-content: space-between; }
        .flex-start { display: flex; align-items: center; justify-content: flex-start; }
        .flex-center { display: flex; align-items: center; justify-content: center; }
        .flex-wrap { flex-wrap: wrap; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .gap-4 { gap: 16px; }
        .font-bold { font-weight: 700; }
        .w-full { width: 100%; }
        .block { display: block; }
      `}</style>
    </main>
  );
}
