'use client';

import { useState, useEffect } from 'react';
import { 
  DEFAULT_EVENT_PROFILE, 
  MOCK_TASKS, 
  MOCK_VENDORS, 
  MOCK_GUESTS, 
  MOCK_BUDGET, 
  MOCK_TIMELINE, 
  MOCK_MISSIONS, 
  MOCK_AUDIT_LOG 
} from './mockData';

const isBrowser = typeof window !== 'undefined';

function getStorageItem(key, defaultValue) {
  if (!isBrowser) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading localStorage key:', key, error);
    return defaultValue;
  }
}

function setStorageItem(key, value) {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('elysian_store_update'));
  } catch (error) {
    console.error('Error writing localStorage key:', key, error);
  }
}

export function initializeStore(forceDemo = false) {
  if (!isBrowser) return;

  if (forceDemo) {
    setStorageItem('elysian_user', {
      id: 'usr_demo_01',
      name: 'Vanessa Hayes & Noah Sterling',
      partnerA: 'Vanessa Hayes',
      partnerB: 'Noah Sterling',
      email: 'vanessa.noah@example.com',
      role: 'couple',
      weddingDate: '2027-07-15',
      ceremonyTime: '04:00 PM',
      receptionTime: '06:00 PM',
      timeZone: 'America/Los_Angeles',
      location: 'Malibu, CA',
      venue: 'The Grand Pavilion at Sunset Cove',
      budget: 50000,
      theme: 'Champagne Gold & Midnight Navy',
      onboardingComplete: true,
      aiCredits: 15,
      eventPassActive: true,
      isDemo: true,
      celebrationsEnabled: true,
      reminders: {
        email: true,
        push: true,
        sms: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      },
      collaborators: [
        { id: 'collab_1', name: 'Olivia Vance (Planner)', email: 'olivia@ovaimagination.com', role: 'planner', status: 'Active' },
        { id: 'collab_2', name: 'Noah Sterling (Partner)', email: 'noah@example.com', role: 'couple', status: 'Active' },
      ],
      policyAcceptedDate: '2026-05-01T10:00:00Z',
      policyVersion: '1.0',
    });

    setStorageItem('elysian_event_profile', DEFAULT_EVENT_PROFILE);
    setStorageItem('elysian_tasks', MOCK_TASKS);
    setStorageItem('elysian_vendors', MOCK_VENDORS);
    setStorageItem('elysian_guests', MOCK_GUESTS);
    setStorageItem('elysian_budget', MOCK_BUDGET);
    setStorageItem('elysian_timeline', MOCK_TIMELINE);
    setStorageItem('elysian_missions', MOCK_MISSIONS);
    setStorageItem('elysian_audit_log', MOCK_AUDIT_LOG);
    return;
  }

  // Normal initialization — if no user exists, do not force Vanessa & Noah onto unauthenticated visitors.
  // Instead leave empty until login, demo click, or sign up.
}

export function useWeddingStore() {
  const [state, setState] = useState({
    user: null,
    eventProfile: null,
    tasks: [],
    vendors: [],
    guests: [],
    budget: { total: 0, categories: [], payments: [] },
    timeline: [],
    missions: [],
    auditLog: [],
    activeMilestone: null,
    loading: true,
  });

  const loadData = () => {
    setState({
      user: getStorageItem('elysian_user', null),
      eventProfile: getStorageItem('elysian_event_profile', DEFAULT_EVENT_PROFILE),
      tasks: getStorageItem('elysian_tasks', []),
      vendors: getStorageItem('elysian_vendors', []),
      guests: getStorageItem('elysian_guests', []),
      budget: getStorageItem('elysian_budget', { total: 0, categories: [], payments: [] }),
      timeline: getStorageItem('elysian_timeline', []),
      missions: getStorageItem('elysian_missions', []),
      auditLog: getStorageItem('elysian_audit_log', []),
      activeMilestone: null,
      loading: false,
    });
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    if (isBrowser) {
      window.addEventListener('elysian_store_update', handleUpdate);
      window.addEventListener('storage', handleUpdate);
    }

    return () => {
      if (isBrowser) {
        window.removeEventListener('elysian_store_update', handleUpdate);
        window.removeEventListener('storage', handleUpdate);
      }
    };
  }, []);

  // --- Audit Log Helper ---
  const addAuditLog = (action, details) => {
    const logs = getStorageItem('elysian_audit_log', []);
    const currentUser = getStorageItem('elysian_user', { name: 'System' });
    const newLog = {
      id: `aud_${Date.now()}`,
      action,
      user: currentUser.name || 'User',
      timestamp: new Date().toISOString(),
      details: details || '',
    };
    setStorageItem('elysian_audit_log', [newLog, ...logs]);
  };

  // --- User & Central Event Profile ---
  const updateUser = (userData) => {
    const currentUser = getStorageItem('elysian_user', {});
    const newUser = { ...currentUser, ...userData };
    setStorageItem('elysian_user', newUser);

    // Sync central event profile fields
    const currentProfile = getStorageItem('elysian_event_profile', DEFAULT_EVENT_PROFILE);
    const newProfile = {
      ...currentProfile,
      name: newUser.name || currentProfile.name,
      weddingDate: newUser.weddingDate || currentProfile.weddingDate,
      location: newUser.location || currentProfile.location,
      budget: newUser.budget !== undefined ? newUser.budget : currentProfile.budget,
      theme: newUser.theme || currentProfile.theme,
    };
    setStorageItem('elysian_event_profile', newProfile);

    // If budget ceiling changed, sync total in budget store
    if (userData.budget !== undefined) {
      const budget = getStorageItem('elysian_budget', { total: 0, categories: [], payments: [] });
      setStorageItem('elysian_budget', { ...budget, total: Number(userData.budget) });
    }

    addAuditLog('User Profile Updated', `Updated fields: ${Object.keys(userData).join(', ')}`);
  };

  const updateEventProfile = (profileData) => {
    const current = getStorageItem('elysian_event_profile', DEFAULT_EVENT_PROFILE);
    const updated = { ...current, ...profileData };
    setStorageItem('elysian_event_profile', updated);

    // Sync user model
    const user = getStorageItem('elysian_user', {});
    setStorageItem('elysian_user', {
      ...user,
      name: updated.name,
      weddingDate: updated.weddingDate,
      location: updated.location,
      budget: updated.budget,
      theme: updated.theme,
    });

    addAuditLog('Central Event Profile Updated', `Event: ${updated.name}, Date: ${updated.weddingDate}`);
  };

  // --- AI Credits ---
  const deductAiCredit = () => {
    const user = getStorageItem('elysian_user', null);
    if (!user) return false;
    if (user.eventPassActive || user.role === 'admin') return true;
    if (user.aiCredits > 0) {
      const newCredits = user.aiCredits - 1;
      updateUser({ aiCredits: newCredits });
      return true;
    }
    return false;
  };

  const addAiCredits = (amount) => {
    const user = getStorageItem('elysian_user', null);
    if (user) {
      updateUser({ aiCredits: (user.aiCredits || 0) + amount });
    }
  };

  // --- Task Methods (Checklist CRUD) ---
  const addTask = (task) => {
    const tasks = getStorageItem('elysian_tasks', []);
    const newTask = {
      id: `t_${Date.now()}`,
      completed: false,
      statusTag: 'In Progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: state.user?.name || 'Couple',
      ...task,
    };
    setStorageItem('elysian_tasks', [newTask, ...tasks]);
    addAuditLog('Task Added', `Added task: "${newTask.title}"`);
  };

  const updateTask = (id, updatedFields) => {
    const tasks = getStorageItem('elysian_tasks', []);
    const updated = tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            ...updatedFields,
            updatedAt: new Date().toISOString(),
            statusTag: updatedFields.completed ? 'Completed' : (updatedFields.statusTag || t.statusTag),
          }
        : t
    );
    setStorageItem('elysian_tasks', updated);
  };

  const deleteTask = (id) => {
    const tasks = getStorageItem('elysian_tasks', []);
    const target = tasks.find((t) => t.id === id);
    setStorageItem('elysian_tasks', tasks.filter((t) => t.id !== id));
    if (target) {
      addAuditLog('Task Deleted', `Removed task: "${target.title}"`);
    }
  };

  // --- Vendor Methods (Vendors CRUD) ---
  const addVendor = (vendor) => {
    const vendors = getStorageItem('elysian_vendors', []);
    const newVendor = {
      id: `v_${Date.now()}`,
      status: 'Shortlisted',
      contractPrice: Number(vendor.contractPrice) || 0,
      paidAmount: 0,
      nextPaymentDate: null,
      createdAt: new Date().toISOString(),
      ...vendor,
    };
    setStorageItem('elysian_vendors', [...vendors, newVendor]);
    addAuditLog('Vendor Added', `Added vendor: ${newVendor.name} (${newVendor.category})`);
  };

  const updateVendor = (id, updatedFields) => {
    const vendors = getStorageItem('elysian_vendors', []);
    const updated = vendors.map((v) => (v.id === id ? { ...v, ...updatedFields } : v));
    setStorageItem('elysian_vendors', updated);

    // Sync contract pricing with budget categories
    if (updatedFields.contractPrice !== undefined || updatedFields.status !== undefined) {
      const vendor = vendors.find((v) => v.id === id);
      const category = updatedFields.category || vendor?.category;
      if (category) {
        const budget = getStorageItem('elysian_budget', { total: 0, categories: [], payments: [] });
        const bookedInCat = updated.filter((v) => v.category === category && v.status === 'Booked');
        const totalContracted = bookedInCat.reduce((sum, v) => sum + (Number(v.contractPrice) || 0), 0);
        
        const updatedCats = budget.categories.map((cat) => {
          if (cat.name === category) {
            return { ...cat, contracted: totalContracted || cat.planned };
          }
          return cat;
        });
        setStorageItem('elysian_budget', { ...budget, categories: updatedCats });
      }
    }
  };

  const deleteVendor = (id) => {
    const vendors = getStorageItem('elysian_vendors', []);
    const target = vendors.find((v) => v.id === id);
    setStorageItem('elysian_vendors', vendors.filter((v) => v.id !== id));
    if (target) {
      addAuditLog('Vendor Deleted', `Removed vendor: ${target.name}`);
    }
  };

  // --- Guest Methods (Guests CRUD & RSVP Sync) ---
  const addGuest = (guest) => {
    const guests = getStorageItem('elysian_guests', []);
    const newGuest = {
      id: `g_${Date.now()}`,
      plusOnes: 0,
      rsvpReceived: guest.status !== 'Pending',
      meal: 'Pending',
      table: 0,
      createdAt: new Date().toISOString(),
      ...guest,
    };
    setStorageItem('elysian_guests', [...guests, newGuest]);
    addAuditLog('Guest Added', `Added guest: ${newGuest.name} (${newGuest.group})`);
  };

  const updateGuest = (id, updatedFields) => {
    const guests = getStorageItem('elysian_guests', []);
    const updated = guests.map((g) => (g.id === id ? { ...g, ...updatedFields } : g));
    setStorageItem('elysian_guests', updated);
  };

  const deleteGuest = (id) => {
    const guests = getStorageItem('elysian_guests', []);
    const target = guests.find((g) => g.id === id);
    setStorageItem('elysian_guests', guests.filter((g) => g.id !== id));
    if (target) {
      addAuditLog('Guest Deleted', `Removed guest: ${target.name}`);
    }
  };

  const importGuests = (guestArray) => {
    const existing = getStorageItem('elysian_guests', []);
    const formatted = guestArray.map((g, idx) => ({
      id: `g_imp_${Date.now()}_${idx}`,
      name: g.name || 'Unnamed Guest',
      group: g.group || 'Friends',
      email: g.email || '',
      phone: g.phone || '',
      status: g.status || 'Pending',
      rsvpReceived: g.status === 'Attending' || g.status === 'Declined',
      meal: g.meal || 'Pending',
      table: Number(g.table) || 0,
      plusOnes: Number(g.plusOnes) || 0,
      notes: g.notes || '',
      createdAt: new Date().toISOString(),
    }));
    setStorageItem('elysian_guests', [...existing, ...formatted]);
    addAuditLog('Batch Guests Imported', `Imported ${formatted.length} guest records via CSV`);
  };

  // --- Budget Methods (Correct Budget Model CRUD) ---
  const updateBudgetTotal = (newTotal) => {
    const budget = getStorageItem('elysian_budget', { total: 0, categories: [], payments: [] });
    setStorageItem('elysian_budget', { ...budget, total: Number(newTotal) });
    updateUser({ budget: Number(newTotal) });
    addAuditLog('Budget Total Adjusted', `Ceiling set to $${Number(newTotal).toLocaleString()}`);
  };

  const updateBudgetCategory = (catName, updatedFields) => {
    const budget = getStorageItem('elysian_budget', { total: 0, categories: [], payments: [] });
    const updatedCats = budget.categories.map((cat) =>
      cat.name === catName ? { ...cat, ...updatedFields } : cat
    );
    setStorageItem('elysian_budget', { ...budget, categories: updatedCats });
  };

  const addBudgetPayment = (payment) => {
    const budget = getStorageItem('elysian_budget', { total: 0, categories: [], payments: [] });
    const newPayment = {
      id: `p_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...payment,
    };
    setStorageItem('elysian_budget', { ...budget, payments: [newPayment, ...budget.payments] });
    addAuditLog('Payment Logged', `Logged payment of $${newPayment.amount} to ${newPayment.vendorName}`);
  };

  const updateBudgetPayment = (id, updatedFields) => {
    const budget = getStorageItem('elysian_budget', { total: 0, categories: [], payments: [] });
    const updated = budget.payments.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
    setStorageItem('elysian_budget', { ...budget, payments: updated });
  };

  const deleteBudgetPayment = (id) => {
    const budget = getStorageItem('elysian_budget', { total: 0, categories: [], payments: [] });
    setStorageItem('elysian_budget', { ...budget, payments: budget.payments.filter((p) => p.id !== id) });
    addAuditLog('Payment Deleted', `Payment ID ${id} deleted`);
  };

  // --- Timeline Methods (Timeline CRUD) ---
  const addTimelineEvent = (event) => {
    const timeline = getStorageItem('elysian_timeline', []);
    const newEvent = {
      id: `tl_${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      ...event,
    };
    setStorageItem('elysian_timeline', [...timeline, newEvent]);
    addAuditLog('Timeline Event Added', `Added schedule: "${newEvent.time} - ${newEvent.title}"`);
  };

  const updateTimelineEvent = (id, updatedFields) => {
    const timeline = getStorageItem('elysian_timeline', []);
    const updated = timeline.map((e) => (e.id === id ? { ...e, ...updatedFields } : e));
    setStorageItem('elysian_timeline', updated);
  };

  const deleteTimelineEvent = (id) => {
    const timeline = getStorageItem('elysian_timeline', []);
    setStorageItem('elysian_timeline', timeline.filter((e) => e.id !== id));
  };

  const reorderTimelineEvents = (newOrderedList) => {
    setStorageItem('elysian_timeline', newOrderedList);
  };

  // --- Planning Missions (Step 24) ---
  const completeMission = (missionId) => {
    const missions = getStorageItem('elysian_missions', []);
    const target = missions.find((m) => m.id === missionId);
    if (!target) return;

    const updated = missions.map((m) => (m.id === missionId ? { ...m, completed: true } : m));
    setStorageItem('elysian_missions', updated);

    // Reward bonus AI credits
    addAiCredits(5);
    addAuditLog('Mission Completed', `Completed mission: "${target.title}". Earned +5 AI Credits!`);
  };

  const snoozeMission = (missionId) => {
    const missions = getStorageItem('elysian_missions', []);
    const updated = missions.map((m) => (m.id === missionId ? { ...m, snoozed: true } : m));
    setStorageItem('elysian_missions', updated);
  };

  // --- Collaborative Partners & Planners (Step 26) ---
  const inviteCollaborator = (name, email, role = 'collaborator') => {
    const user = getStorageItem('elysian_user', {});
    const currentCollabs = user.collaborators || [];
    const newCollab = {
      id: `collab_${Date.now()}`,
      name,
      email,
      role,
      status: 'Pending Acceptance',
      invitedAt: new Date().toISOString(),
    };
    updateUser({ collaborators: [...currentCollabs, newCollab] });
    addAuditLog('Collaborator Invited', `Invited ${name} (${email}) as ${role}`);
  };

  const removeCollaborator = (collabId) => {
    const user = getStorageItem('elysian_user', {});
    const currentCollabs = user.collaborators || [];
    updateUser({ collaborators: currentCollabs.filter((c) => c.id !== collabId) });
  };

  // --- Reset & Demo Modes ---
  const startDemoMode = () => {
    initializeStore(true);
    loadData();
  };

  const resetStore = () => {
    if (!isBrowser) return;
    localStorage.removeItem('elysian_user');
    localStorage.removeItem('elysian_event_profile');
    localStorage.removeItem('elysian_tasks');
    localStorage.removeItem('elysian_vendors');
    localStorage.removeItem('elysian_guests');
    localStorage.removeItem('elysian_budget');
    localStorage.removeItem('elysian_timeline');
    localStorage.removeItem('elysian_missions');
    localStorage.removeItem('elysian_audit_log');
    
    // Also remove legacy VND keys if any exist
    localStorage.removeItem('wedding_user');
    localStorage.removeItem('wedding_profile');
    localStorage.removeItem('wedding_tasks');
    localStorage.removeItem('wedding_vendors');
    localStorage.removeItem('wedding_guests');
    localStorage.removeItem('wedding_budget');
    localStorage.removeItem('wedding_timeline');

    loadData();
  };

  return {
    ...state,
    updateUser,
    updateEventProfile,
    deductAiCredit,
    addAiCredits,
    addTask,
    updateTask,
    deleteTask,
    addVendor,
    updateVendor,
    deleteVendor,
    addGuest,
    updateGuest,
    deleteGuest,
    importGuests,
    updateBudgetTotal,
    updateBudgetCategory,
    addBudgetPayment,
    updateBudgetPayment,
    deleteBudgetPayment,
    addTimelineEvent,
    updateTimelineEvent,
    deleteTimelineEvent,
    reorderTimelineEvents,
    completeMission,
    snoozeMission,
    inviteCollaborator,
    removeCollaborator,
    startDemoMode,
    resetStore,
  };
}
