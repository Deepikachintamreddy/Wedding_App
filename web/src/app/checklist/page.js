'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWeddingStore } from '@/lib/store';
import { formatDate, daysUntil, calculateProgress, getCategoryColor, getCategoryIcon } from '@/lib/utils';

export default function ChecklistPage() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, eventProfile, tasks, loading, addTask, updateTask, deleteTask } = store;

  const [activeFilter, setActiveFilter] = useState('all'); // all, month, upcoming, completed, waiting
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    category: 'Planner',
    dueDate: '',
    notes: '',
    assignedTo: 'Both',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

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

  // Calculate statistics
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = calculateProgress(completedCount, totalCount);

  // Filters logic
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'completed') return task.completed;
    if (task.completed && activeFilter !== 'all') return false;
    
    if (activeFilter === 'month') {
      const days = daysUntil(task.dueDate);
      return days >= 0 && days <= 30;
    }
    if (activeFilter === 'upcoming') {
      const days = daysUntil(task.dueDate);
      return days > 30;
    }
    if (activeFilter === 'partner') {
      return task.assignedTo === 'Partner' || task.assignedTo === 'Partner B' || task.assignedTo === 'Partner A';
    }
    if (activeFilter === 'planner') {
      return task.assignedTo === 'Planner' || task.assignedTo === 'OVAimagination';
    }
    return true;
  });

  // Sort tasks by due date
  const sortedTasks = [...filteredTasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const handleToggleTask = (id, currentVal) => {
    updateTask(id, { completed: !currentVal });
  };

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      category: 'Planner',
      dueDate: '',
      notes: '',
      assignedTo: 'Both',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      category: task.category,
      dueDate: task.dueDate,
      notes: task.notes || '',
      assignedTo: task.assignedTo || 'Both',
    });
    setModalOpen(true);
  };

  const handleTaskFormSubmit = (e) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.dueDate) return;

    const daysLeft = daysUntil(taskForm.dueDate);
    let period = 'Upcoming';
    if (daysLeft < 0) period = 'Overdue';
    else if (daysLeft <= 30) period = 'This Month';
    else if (daysLeft > 365) period = '12+ Months';
    else if (daysLeft > 180) period = '9 Months';
    else if (daysLeft > 90) period = '6 Months';
    else period = '3 Months';

    if (editingTask) {
      updateTask(editingTask.id, {
        ...taskForm,
        period,
      });
    } else {
      addTask({
        ...taskForm,
        period,
      });
    }

    setModalOpen(false);
  };

  const handleDeleteTask = (id, title) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteTask(id);
    }
  };

  return (
    <main className="checklist-layout">
      <div className="navbar-spacer"></div>

      <div className="container py-8 max-w-4xl">
        {/* Checklist Header */}
        <div className="flex-between mb-6 flex-wrap gap-4">
          <div>
            <div className="flex-start items-center gap-2 mb-1">
              <span className="badge badge-gold">Master Roadmap</span>
              <span className="badge badge-secondary">{eventProfile?.coupleNames || user.name}</span>
            </div>
            <h1 className="h2 font-heading text-gold mb-1">Wedding Checklist</h1>
            <p className="body-sm text-secondary">
              Track milestones, assign collaborator duties, and sync directly with OVAimagination Concierge.
            </p>
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="btn btn-primary"
          >
            ＋ Add Custom Milestone
          </button>
        </div>

        {/* Progress Bar */}
        <div className="card glass-panel p-6 mb-6 border-gold">
          <div className="flex-between mb-2">
            <span className="body-sm text-primary font-bold">Milestone Completion</span>
            <span className="body-sm text-gold font-bold">{progress}% completed ({completedCount}/{totalCount})</span>
          </div>
          <div className="progress-bar-bg w-full">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="tabs mb-6 flex bg-secondary p-1 rounded-lg border border-divider">
          {[
            { id: 'all', label: '📂 All Tasks' },
            { id: 'month', label: '⏰ This Month' },
            { id: 'upcoming', label: '📅 Upcoming' },
            { id: 'partner', label: '💍 Partner Tasks' },
            { id: 'planner', label: '📋 Planner Tasks' },
            { id: 'completed', label: '✓ Completed' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`tab flex-1 py-3 px-3 text-center text-xs sm:text-sm font-bold rounded-md transition cursor-pointer ${
                activeFilter === tab.id ? 'bg-gold text-dark' : 'text-muted hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="tasks-list-container flex-col gap-4">
          {sortedTasks.length > 0 ? (
            sortedTasks.map(task => {
              const isOverdue = daysUntil(task.dueDate) < 0 && !task.completed;
              const isExpanded = expandedTaskId === task.id;
              
              return (
                <div 
                  key={task.id} 
                  className={`card glass-panel task-card-item transition ${task.completed ? 'task-completed-style' : ''} ${
                    isOverdue ? 'task-overdue-style' : ''
                  }`}
                >
                  <div className="flex-between p-4 items-center">
                    <div className="flex-start items-center gap-3 flex-1">
                      <input 
                        type="checkbox" 
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id, task.completed)}
                        className="task-checkbox"
                        aria-label={`Mark completed: ${task.title}`}
                      />
                      <div className="flex-col flex-1">
                        <span 
                          onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                          className={`task-title text-primary font-bold body-sm cursor-pointer hover:text-gold ${
                            task.completed ? 'line-through text-muted' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                        
                        <div className="flex-start gap-2 items-center mt-1 flex-wrap">
                          <span 
                            className="category-dot" 
                            style={{ backgroundColor: getCategoryColor(task.category) }}
                          ></span>
                          <span className="text-xs text-muted">
                            {getCategoryIcon(task.category)} {task.category}
                          </span>
                          <span className="text-xs text-muted">•</span>
                          <span className={`text-xs ${isOverdue ? 'text-danger font-bold' : 'text-muted'}`}>
                            {isOverdue ? `⚠️ Overdue (${formatDate(task.dueDate)})` : `Due: ${formatDate(task.dueDate)}`}
                          </span>
                          <span className="text-xs text-muted">•</span>
                          <span className="badge badge-secondary text-xs">
                            👤 {task.assignedTo || 'Both'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-start items-center gap-2">
                      <button 
                        onClick={() => handleOpenEditModal(task)}
                        className="btn btn-ghost btn-sm text-secondary"
                        aria-label={`Edit task ${task.title}`}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        className="btn btn-ghost btn-sm text-secondary"
                        aria-label={`View details for ${task.title}`}
                      >
                        {isExpanded ? '▲' : '▼'}
                      </button>
                      <button 
                        onClick={() => handleDeleteTask(task.id, task.title)}
                        className="btn btn-ghost btn-sm text-danger"
                        aria-label={`Delete task ${task.title}`}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Expanded Task Notes */}
                  {isExpanded && (
                    <div className="task-notes-expanded p-4 border-t bg-secondary-opaque">
                      <h4 className="overline mb-2">Planning & Concierge Notes</h4>
                      <p className="body-sm text-secondary mb-3 whitespace-pre-line">
                        {task.notes || 'No custom notes provided. Ask your Elysian AI Concierge for recommendations!'}
                      </p>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t">
                        <span className="text-xs text-muted">Period: {task.period || 'Scheduled'}</span>
                        <Link 
                          href={`/ai-chat?q=${encodeURIComponent(`How should we plan: ${task.title}`)}`}
                          className="btn btn-secondary btn-sm"
                        >
                          🤖 Consult AI Concierge
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="card glass-panel p-8 text-center">
              <span style={{ fontSize: '2.5rem' }}>📭</span>
              <p className="body-sm text-secondary mt-2">No tasks found in this view.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Task Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-gold font-heading">{editingTask ? 'Edit Milestone' : 'Add Custom Milestone'}</h3>
              <button onClick={() => setModalOpen(false)} className="modal-close" aria-label="Close modal">×</button>
            </div>
            <form onSubmit={handleTaskFormSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Milestone Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Schedule floral centerpiece mockup session"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="grid grid-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select 
                      value={taskForm.category}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, category: e.target.value }))}
                      className="form-select"
                    >
                      {['Planner', 'Venue', 'Catering', 'Photography', 'Videography', 'Florals', 'Music', 'Attire', 'Hair & Makeup', 'Invitations', 'Bakery', 'Rings', 'Decor', 'Misc'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Due Date</label>
                    <input 
                      type="date" 
                      required
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Assignee / Responsibility</label>
                  <select 
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="form-select"
                  >
                    <option value="Both">Both of us</option>
                    <option value="Partner A">Partner A</option>
                    <option value="Partner B">Partner B</option>
                    <option value="Planner">Planner (OVAimagination)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes & Constraints</label>
                  <textarea 
                    placeholder="Provide specific notes, vendor names, or checklist details..."
                    value={taskForm.notes}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="form-textarea"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">{editingTask ? 'Save Changes' : 'Create Milestone'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .checklist-layout {
          background: transparent;
          color: #f5f0e8;
          min-height: 100vh;
        }
        .navbar-spacer {
          height: 80px;
        }
        .max-w-4xl {
          max-width: 56rem;
          margin: 0 auto;
        }
        .border-gold {
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
        }
        .progress-bar-bg {
          height: 10px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 5px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #D4AF37 0%, #F59E0B 100%);
          border-radius: 5px;
          transition: width 0.4s ease;
        }
        .bg-secondary {
          background: rgba(10, 25, 47, 0.6);
        }
        .bg-secondary-opaque {
          background: rgba(5, 13, 26, 0.5);
        }
        .border-divider {
          border-color: rgba(212, 175, 55, 0.15);
        }
        .tab.bg-gold {
          background: #D4AF37;
          color: #050D1A;
        }
        @media (max-width: 600px) {
          .tabs {
            overflow-x: auto;
            white-space: nowrap;
            display: flex;
            scrollbar-width: none;
          }
          .tabs::-webkit-scrollbar {
            display: none;
          }
          .tab {
            flex: 0 0 auto !important;
            padding: 8px 12px !important;
          }
        }
        .task-card-item {
          border-left: 3px solid #D4AF37;
          transition: all 0.3s ease;
        }
        .task-card-item:hover {
          transform: translateX(4px);
        }
        .task-completed-style {
          border-left-color: #10B981 !important;
          opacity: 0.75;
        }
        .task-overdue-style {
          border-left-color: #EF4444 !important;
          background: radial-gradient(circle at left, rgba(239, 68, 68, 0.08) 0%, transparent 50%);
        }
        .task-checkbox {
          width: 20px;
          height: 20px;
          accent-color: #D4AF37;
          cursor: pointer;
        }
        .category-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .task-notes-expanded {
          border-top: 1px solid rgba(212, 175, 55, 0.1);
        }
        .line-through {
          text-decoration: line-through;
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
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
        .mb-6 { margin-bottom: 24px; }
        .mt-1 { margin-top: 4px; }
        .mt-3 { margin-top: 12px; }
        .pt-3 { padding-top: 12px; }
        .py-8 { padding-top: 32px; padding-bottom: 32px; }
        .p-4 { padding: 16px; }
        .p-6 { padding: 24px; }
        .flex-col { display: flex; flex-direction: column; }
        .flex-between { display: flex; align-items: center; justify-content: space-between; }
        .flex-start { display: flex; align-items: center; justify-content: flex-start; }
        .flex-wrap { flex-wrap: wrap; }
        .gap-2 { gap: 8px; }
        .gap-4 { gap: 16px; }
        .font-bold { font-weight: 700; }
        .w-full { width: 100%; }
      `}</style>
    </main>
  );
}
