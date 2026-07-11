'use client';

import { useState, useEffect } from 'react';
import { MOCK_TASKS, MOCK_VENDORS, MOCK_GUESTS, MOCK_BUDGET, MOCK_TIMELINE } from './mockData';

// Initial state helpers
const isBrowser = typeof window !== 'undefined';

function getStorageItem(key, defaultValue) {
  if (!isBrowser) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading localStorage', error);
    return defaultValue;
  }
}

function setStorageItem(key, value) {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('wedding_store_update'));
  } catch (error) {
    console.error('Error writing localStorage', error);
  }
}

export function initializeStore() {
  if (!isBrowser) return;
  
  if (!localStorage.getItem('wedding_user')) {
    setStorageItem('wedding_user', {
      name: 'Vanessa & Noah',
      email: 'vanessa.noah@love.com',
      role: 'couple',
      weddingDate: '2027-07-15',
      location: 'Malibu, CA',
      budget: 50000,
      theme: 'Rose Gold & Navy',
      onboardingComplete: true,
      aiCredits: 15,
    });
  }
  
  if (!localStorage.getItem('wedding_tasks')) {
    setStorageItem('wedding_tasks', MOCK_TASKS);
  }
  
  if (!localStorage.getItem('wedding_vendors')) {
    setStorageItem('wedding_vendors', MOCK_VENDORS);
  }
  
  if (!localStorage.getItem('wedding_guests')) {
    setStorageItem('wedding_guests', MOCK_GUESTS);
  }
  
  if (!localStorage.getItem('wedding_budget')) {
    setStorageItem('wedding_budget', MOCK_BUDGET);
  }
  
  if (!localStorage.getItem('wedding_timeline')) {
    setStorageItem('wedding_timeline', MOCK_TIMELINE);
  }
}

// React Custom Hook to use the store
export function useWeddingStore() {
  const [state, setState] = useState({
    user: null,
    tasks: [],
    vendors: [],
    guests: [],
    budget: { total: 0, categories: [], payments: [] },
    timeline: [],
    loading: true,
  });

  const loadData = () => {
    setState({
      user: getStorageItem('wedding_user', null),
      tasks: getStorageItem('wedding_tasks', []),
      vendors: getStorageItem('wedding_vendors', []),
      guests: getStorageItem('wedding_guests', []),
      budget: getStorageItem('wedding_budget', { total: 0, categories: [], payments: [] }),
      timeline: getStorageItem('wedding_timeline', []),
      loading: false,
    });
  };

  useEffect(() => {
    // Initial load
    initializeStore();
    loadData();

    // Listen to updates
    const handleUpdate = () => {
      loadData();
    };

    if (isBrowser) {
      window.addEventListener('wedding_store_update', handleUpdate);
      window.addEventListener('storage', handleUpdate); // sync between tabs
    }

    return () => {
      if (isBrowser) {
        window.removeEventListener('wedding_store_update', handleUpdate);
        window.removeEventListener('storage', handleUpdate);
      }
    };
  }, []);

  // Update operations
  const updateUser = (userData) => {
    const currentUser = getStorageItem('wedding_user', {});
    const newUser = { ...currentUser, ...userData };
    setStorageItem('wedding_user', newUser);
  };

  const deductAiCredit = () => {
    const user = getStorageItem('wedding_user', null);
    if (user && user.aiCredits > 0) {
      updateUser({ aiCredits: user.aiCredits - 1 });
      return true;
    }
    return false;
  };

  const addAiCredits = (amount) => {
    const user = getStorageItem('wedding_user', null);
    if (user) {
      updateUser({ aiCredits: (user.aiCredits || 0) + amount });
    }
  };

  // Task methods
  const addTask = (task) => {
    const tasks = getStorageItem('wedding_tasks', []);
    const newTask = { id: `t_${Date.now()}`, completed: false, ...task };
    setStorageItem('wedding_tasks', [newTask, ...tasks]);
  };

  const updateTask = (id, updatedFields) => {
    const tasks = getStorageItem('wedding_tasks', []);
    const updated = tasks.map(t => t.id === id ? { ...t, ...updatedFields } : t);
    setStorageItem('wedding_tasks', updated);
  };

  const deleteTask = (id) => {
    const tasks = getStorageItem('wedding_tasks', []);
    setStorageItem('wedding_tasks', tasks.filter(t => t.id !== id));
  };

  // Vendor methods
  const addVendor = (vendor) => {
    const vendors = getStorageItem('wedding_vendors', []);
    const newVendor = { id: `v_${Date.now()}`, status: 'Shortlisted', ...vendor };
    setStorageItem('wedding_vendors', [...vendors, newVendor]);
    
    // Add to budget categories if needed
    if (vendor.contractPrice > 0) {
      addBudgetPayment({
        vendorName: vendor.name,
        category: vendor.category,
        amount: vendor.contractPrice / 2, // half down
        date: new Date().toISOString().split('T')[0],
        status: 'Upcoming',
        method: 'Credit Card'
      });
    }
  };

  const updateVendor = (id, updatedFields) => {
    const vendors = getStorageItem('wedding_vendors', []);
    const updated = vendors.map(v => v.id === id ? { ...v, ...updatedFields } : v);
    setStorageItem('wedding_vendors', updated);

    // Sync vendor pricing with budget actuals
    if (updatedFields.contractPrice !== undefined || updatedFields.category !== undefined) {
      const vendor = vendors.find(v => v.id === id);
      const category = updatedFields.category || vendor.category;
      const price = updatedFields.contractPrice !== undefined ? updatedFields.contractPrice : vendor.contractPrice;
      
      const budget = getStorageItem('wedding_budget', { total: 0, categories: [], payments: [] });
      const updatedCats = budget.categories.map(cat => {
        if (cat.name === category) {
          // Recalculate based on all booked vendors in this category
          const bookedInCat = updated.filter(v => v.category === category && v.status === 'Booked');
          const totalActual = bookedInCat.reduce((sum, v) => sum + (v.contractPrice || 0), 0);
          return { ...cat, actual: totalActual || cat.estimated };
        }
        return cat;
      });
      setStorageItem('wedding_budget', { ...budget, categories: updatedCats });
    }
  };

  const deleteVendor = (id) => {
    const vendors = getStorageItem('wedding_vendors', []);
    setStorageItem('wedding_vendors', vendors.filter(v => v.id !== id));
  };

  // Guest methods
  const addGuest = (guest) => {
    const guests = getStorageItem('wedding_guests', []);
    const newGuest = { id: `g_${Date.now()}`, plusOnes: 0, rsvpReceived: guest.status !== 'Pending', meal: 'Pending', table: 0, ...guest };
    setStorageItem('wedding_guests', [...guests, newGuest]);
  };

  const updateGuest = (id, updatedFields) => {
    const guests = getStorageItem('wedding_guests', []);
    const updated = guests.map(g => g.id === id ? { ...g, ...updatedFields } : g);
    setStorageItem('wedding_guests', updated);
  };

  const deleteGuest = (id) => {
    const guests = getStorageItem('wedding_guests', []);
    setStorageItem('wedding_guests', guests.filter(g => g.id !== id));
  };

  // Budget methods
  const updateBudgetTotal = (newTotal) => {
    const budget = getStorageItem('wedding_budget', { total: 0, categories: [], payments: [] });
    setStorageItem('wedding_budget', { ...budget, total: newTotal });
  };

  const updateBudgetCategory = (catName, updatedFields) => {
    const budget = getStorageItem('wedding_budget', { total: 0, categories: [], payments: [] });
    const updatedCats = budget.categories.map(cat => cat.name === catName ? { ...cat, ...updatedFields } : cat);
    setStorageItem('wedding_budget', { ...budget, categories: updatedCats });
  };

  const addBudgetPayment = (payment) => {
    const budget = getStorageItem('wedding_budget', { total: 0, categories: [], payments: [] });
    const newPayment = { id: `p_${Date.now()}`, ...payment };
    setStorageItem('wedding_budget', { ...budget, payments: [newPayment, ...budget.payments] });
  };

  const updateBudgetPayment = (id, updatedFields) => {
    const budget = getStorageItem('wedding_budget', { total: 0, categories: [], payments: [] });
    const updated = budget.payments.map(p => p.id === id ? { ...p, ...updatedFields } : p);
    setStorageItem('wedding_budget', { ...budget, payments: updated });
  };

  const deleteBudgetPayment = (id) => {
    const budget = getStorageItem('wedding_budget', { total: 0, categories: [], payments: [] });
    setStorageItem('wedding_budget', { ...budget, payments: budget.payments.filter(p => p.id !== id) });
  };

  // Timeline methods
  const addTimelineEvent = (event) => {
    const timeline = getStorageItem('wedding_timeline', []);
    const newEvent = { id: `tl_${Date.now()}`, status: 'Pending', ...event };
    setStorageItem('wedding_timeline', [...timeline, newEvent]);
  };

  const updateTimelineEvent = (id, updatedFields) => {
    const timeline = getStorageItem('wedding_timeline', []);
    const updated = timeline.map(e => e.id === id ? { ...e, ...updatedFields } : e);
    setStorageItem('wedding_timeline', updated);
  };

  const deleteTimelineEvent = (id) => {
    const timeline = getStorageItem('wedding_timeline', []);
    setStorageItem('wedding_timeline', timeline.filter(e => e.id !== id));
  };

  // Reset store
  const resetStore = () => {
    if (!isBrowser) return;
    localStorage.removeItem('wedding_user');
    localStorage.removeItem('wedding_tasks');
    localStorage.removeItem('wedding_vendors');
    localStorage.removeItem('wedding_guests');
    localStorage.removeItem('wedding_budget');
    localStorage.removeItem('wedding_timeline');
    initializeStore();
    loadData();
  };

  return {
    ...state,
    updateUser,
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
    updateBudgetTotal,
    updateBudgetCategory,
    addBudgetPayment,
    updateBudgetPayment,
    deleteBudgetPayment,
    addTimelineEvent,
    updateTimelineEvent,
    deleteTimelineEvent,
    resetStore,
  };
}
