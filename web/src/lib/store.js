'use client';

import { useState, useEffect } from 'react';
import { MOCK_TASKS, MOCK_VENDORS, MOCK_GUESTS, MOCK_BUDGET, MOCK_TIMELINE } from './mockData';
import { api } from './api';

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
  // Do not auto-seed any mock couple data in local storage.
  // The application now starts as a clean slate, and user data is initialized dynamically
  // when they sign up and complete onboarding.
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

  const loadFromLocalStorage = () => {
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

  const loadData = async () => {
    if (api.isAuthenticated()) {
      try {
        const [user, tasks, vendors, guests, budget, timeline] = await Promise.all([
          api.getProfile(),
          api.getTasks(),
          api.getVendors(),
          api.getGuests(),
          api.getBudget(),
          api.getTimeline()
        ]);
        
        setState({
          user,
          tasks,
          vendors,
          guests,
          budget,
          timeline,
          loading: false,
        });

        // Sync local storage as a cache
        localStorage.setItem('wedding_user', JSON.stringify(user));
        localStorage.setItem('wedding_tasks', JSON.stringify(tasks));
        localStorage.setItem('wedding_vendors', JSON.stringify(vendors));
        localStorage.setItem('wedding_guests', JSON.stringify(guests));
        localStorage.setItem('wedding_budget', JSON.stringify(budget));
        localStorage.setItem('wedding_timeline', JSON.stringify(timeline));
      } catch (error) {
        console.error('API load error, falling back to cache:', error);
        loadFromLocalStorage();
      }
    } else {
      loadFromLocalStorage();
    }
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
  const updateUser = async (userData) => {
    if (api.isAuthenticated()) {
      try {
        const newUser = await api.updateProfile(userData);
        setState(prev => ({ ...prev, user: newUser }));
        setStorageItem('wedding_user', newUser);
      } catch (err) {
        console.error('API update user error:', err);
      }
    } else {
      const currentUser = getStorageItem('wedding_user', {});
      const newUser = { ...currentUser, ...userData };
      setStorageItem('wedding_user', newUser);
    }
  };

  const deductAiCredit = async () => {
    if (api.isAuthenticated()) {
      try {
        const success = await api.deductCredit();
        if (success) {
          const profile = await api.getProfile();
          setState(prev => ({ ...prev, user: profile }));
          setStorageItem('wedding_user', profile);
          return true;
        }
        return false;
      } catch (err) {
        console.error(err);
        return false;
      }
    } else {
      const user = getStorageItem('wedding_user', null);
      if (user && user.aiCredits > 0) {
        updateUser({ aiCredits: user.aiCredits - 1 });
        return true;
      }
      return false;
    }
  };

  const addAiCredits = async (amount) => {
    if (api.isAuthenticated()) {
      try {
        const res = await api.addCredits(amount);
        if (res.success) {
          const profile = await api.getProfile();
          setState(prev => ({ ...prev, user: profile }));
          setStorageItem('wedding_user', profile);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      const user = getStorageItem('wedding_user', null);
      if (user) {
        updateUser({ aiCredits: (user.aiCredits || 0) + amount });
      }
    }
  };

  // Task methods
  const addTask = async (task) => {
    if (api.isAuthenticated()) {
      try {
        const newTask = await api.createTask(task);
        setState(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
        // Trigger update to cache
        setStorageItem('wedding_tasks', [newTask, ...state.tasks]);
      } catch (err) {
        console.error(err);
      }
    } else {
      const tasks = getStorageItem('wedding_tasks', []);
      const newTask = { id: `t_${Date.now()}`, completed: false, ...task };
      setStorageItem('wedding_tasks', [newTask, ...tasks]);
    }
  };

  const updateTask = async (id, updatedFields) => {
    if (api.isAuthenticated()) {
      try {
        const updated = await api.updateTask(id, updatedFields);
        setState(prev => {
          const newTasks = prev.tasks.map(t => t.id === id ? updated : t);
          localStorage.setItem('wedding_tasks', JSON.stringify(newTasks));
          return { ...prev, tasks: newTasks };
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      const tasks = getStorageItem('wedding_tasks', []);
      const updated = tasks.map(t => t.id === id ? { ...t, ...updatedFields } : t);
      setStorageItem('wedding_tasks', updated);
    }
  };

  const deleteTask = async (id) => {
    if (api.isAuthenticated()) {
      try {
        await api.deleteTask(id);
        setState(prev => {
          const newTasks = prev.tasks.filter(t => t.id !== id);
          localStorage.setItem('wedding_tasks', JSON.stringify(newTasks));
          return { ...prev, tasks: newTasks };
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      const tasks = getStorageItem('wedding_tasks', []);
      setStorageItem('wedding_tasks', tasks.filter(t => t.id !== id));
    }
  };

  // Vendor methods
  const addVendor = async (vendor) => {
    if (api.isAuthenticated()) {
      try {
        const newVendor = await api.createVendor(vendor);
        setState(prev => ({ ...prev, vendors: [...prev.vendors, newVendor] }));
        
        // Refresh budget as adding vendor might add payments/actuals
        const budget = await api.getBudget();
        setState(prev => ({ ...prev, budget }));
        
        // Trigger update to cache
        setStorageItem('wedding_vendors', [...state.vendors, newVendor]);
        setStorageItem('wedding_budget', budget);
      } catch (err) {
        console.error(err);
      }
    } else {
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
    }
  };

  const updateVendor = async (id, updatedFields) => {
    if (api.isAuthenticated()) {
      try {
        const updated = await api.updateVendor(id, updatedFields);
        setState(prev => {
          const newVendors = prev.vendors.map(v => v.id === id ? updated : v);
          localStorage.setItem('wedding_vendors', JSON.stringify(newVendors));
          return { ...prev, vendors: newVendors };
        });
        
        // Refresh budget actuals sync
        const budget = await api.getBudget();
        setState(prev => ({ ...prev, budget }));
        localStorage.setItem('wedding_budget', JSON.stringify(budget));
      } catch (err) {
        console.error(err);
      }
    } else {
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
    }
  };

  const deleteVendor = async (id) => {
    if (api.isAuthenticated()) {
      try {
        await api.deleteVendor(id);
        setState(prev => {
          const newVendors = prev.vendors.filter(v => v.id !== id);
          localStorage.setItem('wedding_vendors', JSON.stringify(newVendors));
          return { ...prev, vendors: newVendors };
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      const vendors = getStorageItem('wedding_vendors', []);
      setStorageItem('wedding_vendors', vendors.filter(v => v.id !== id));
    }
  };

  // Guest methods
  const addGuest = async (guest) => {
    if (api.isAuthenticated()) {
      try {
        const newGuest = await api.createGuest(guest);
        setState(prev => ({ ...prev, guests: [...prev.guests, newGuest] }));
        setStorageItem('wedding_guests', [...state.guests, newGuest]);
      } catch (err) {
        console.error(err);
      }
    } else {
      const guests = getStorageItem('wedding_guests', []);
      const newGuest = { id: `g_${Date.now()}`, plusOnes: 0, rsvpReceived: guest.status !== 'Pending', meal: 'Pending', table: 0, ...guest };
      setStorageItem('wedding_guests', [...guests, newGuest]);
    }
  };

  const updateGuest = async (id, updatedFields) => {
    if (api.isAuthenticated()) {
      try {
        const updated = await api.updateGuest(id, updatedFields);
        setState(prev => {
          const newGuests = prev.guests.map(g => g.id === id ? updated : g);
          localStorage.setItem('wedding_guests', JSON.stringify(newGuests));
          return { ...prev, guests: newGuests };
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      const guests = getStorageItem('wedding_guests', []);
      const updated = guests.map(g => g.id === id ? { ...g, ...updatedFields } : g);
      setStorageItem('wedding_guests', updated);
    }
  };

  const deleteGuest = async (id) => {
    if (api.isAuthenticated()) {
      try {
        await api.deleteGuest(id);
        setState(prev => {
          const newGuests = prev.guests.filter(g => g.id !== id);
          localStorage.setItem('wedding_guests', JSON.stringify(newGuests));
          return { ...prev, guests: newGuests };
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      const guests = getStorageItem('wedding_guests', []);
      setStorageItem('wedding_guests', guests.filter(g => g.id !== id));
    }
  };

  // Budget methods
  const updateBudgetTotal = async (newTotal) => {
    if (api.isAuthenticated()) {
      try {
        const updated = await api.updateBudgetTotal(newTotal);
        setState(prev => ({ ...prev, budget: updated }));
        setStorageItem('wedding_budget', updated);
      } catch (err) {
        console.error(err);
      }
    } else {
      const budget = getStorageItem('wedding_budget', { total: 0, categories: [], payments: [] });
      setStorageItem('wedding_budget', { ...budget, total: newTotal });
    }
  };

  const updateBudgetCategory = async (catName, updatedFields) => {
    if (api.isAuthenticated()) {
      try {
        const updated = await api.updateBudgetCategory(catName, updatedFields);
        setState(prev => ({ ...prev, budget: updated }));
        setStorageItem('wedding_budget', updated);
      } catch (err) {
        console.error(err);
      }
    } else {
      const budget = getStorageItem('wedding_budget', { total: 0, categories: [], payments: [] });
      const updatedCats = budget.categories.map(cat => cat.name === catName ? { ...cat, ...updatedFields } : cat);
      setStorageItem('wedding_budget', { ...budget, categories: updatedCats });
    }
  };

  const addBudgetPayment = async (payment) => {
    if (api.isAuthenticated()) {
      try {
        const newPayment = await api.addBudgetPayment(payment);
        setState(prev => {
          const updated = { ...prev.budget, payments: [newPayment, ...prev.budget.payments] };
          localStorage.setItem('wedding_budget', JSON.stringify(updated));
          return { ...prev, budget: updated };
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      const budget = getStorageItem('wedding_budget', { total: 0, categories: [], payments: [] });
      const newPayment = { id: `p_${Date.now()}`, ...payment };
      setStorageItem('wedding_budget', { ...budget, payments: [newPayment, ...budget.payments] });
    }
  };

  const updateBudgetPayment = async (id, updatedFields) => {
    if (api.isAuthenticated()) {
      try {
        const updatedPayment = await api.updateBudgetPayment(id, updatedFields);
        setState(prev => {
          const updatedPayments = prev.budget.payments.map(p => p.id === id ? updatedPayment : p);
          const updated = { ...prev.budget, payments: updatedPayments };
          localStorage.setItem('wedding_budget', JSON.stringify(updated));
          return { ...prev, budget: updated };
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      const budget = getStorageItem('wedding_budget', { total: 0, categories: [], payments: [] });
      const updated = budget.payments.map(p => p.id === id ? { ...p, ...updatedFields } : p);
      setStorageItem('wedding_budget', { ...budget, payments: updated });
    }
  };

  const deleteBudgetPayment = async (id) => {
    if (api.isAuthenticated()) {
      try {
        await api.deleteBudgetPayment(id);
        setState(prev => {
          const updatedPayments = prev.budget.payments.filter(p => p.id !== id);
          const updated = { ...prev.budget, payments: updatedPayments };
          localStorage.setItem('wedding_budget', JSON.stringify(updated));
          return { ...prev, budget: updated };
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      const budget = getStorageItem('wedding_budget', { total: 0, categories: [], payments: [] });
      setStorageItem('wedding_budget', { ...budget, payments: budget.payments.filter(p => p.id !== id) });
    }
  };

  // Timeline methods
  const addTimelineEvent = async (event) => {
    if (api.isAuthenticated()) {
      try {
        const newEvent = await api.createTimelineEvent(event);
        // Get sorted list from API
        const timeline = await api.getTimeline();
        setState(prev => ({ ...prev, timeline }));
        setStorageItem('wedding_timeline', timeline);
      } catch (err) {
        console.error(err);
      }
    } else {
      const timeline = getStorageItem('wedding_timeline', []);
      const newEvent = { id: `tl_${Date.now()}`, status: 'Pending', ...event };
      setStorageItem('wedding_timeline', [...timeline, newEvent]);
    }
  };

  const updateTimelineEvent = async (id, updatedFields) => {
    if (api.isAuthenticated()) {
      try {
        await api.updateTimelineEvent(id, updatedFields);
        const timeline = await api.getTimeline();
        setState(prev => ({ ...prev, timeline }));
        setStorageItem('wedding_timeline', timeline);
      } catch (err) {
        console.error(err);
      }
    } else {
      const timeline = getStorageItem('wedding_timeline', []);
      const updated = timeline.map(e => e.id === id ? { ...e, ...updatedFields } : e);
      setStorageItem('wedding_timeline', updated);
    }
  };

  const deleteTimelineEvent = async (id) => {
    if (api.isAuthenticated()) {
      try {
        await api.deleteTimelineEvent(id);
        setState(prev => {
          const newTimeline = prev.timeline.filter(e => e.id !== id);
          localStorage.setItem('wedding_timeline', JSON.stringify(newTimeline));
          return { ...prev, timeline: newTimeline };
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      const timeline = getStorageItem('wedding_timeline', []);
      setStorageItem('wedding_timeline', timeline.filter(e => e.id !== id));
    }
  };

  // Reset store
  const resetStore = () => {
    if (!isBrowser) return;
    api.logout();
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
