import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_TASKS, MOCK_VENDORS, MOCK_GUESTS, MOCK_BUDGET, MOCK_TIMELINE, MOCK_DIRECT_MESSAGES, Task, Vendor, Guest, Budget, TimelineEvent, Payment, DirectMessage } from './mockData';
import { api } from './api';

interface User {
  name: string;
  email: string;
  role: string;
  weddingDate: string;
  location: string;
  budget: number;
  theme: string;
  onboardingComplete: boolean;
  aiCredits: number;
  eventPassActive?: boolean;
  vendorCategory?: string; // e.g. "Photography", "Catering"
  businesses?: Array<{
    category: string;
    name: string;
    rate: number;
    website: string;
    notes: string;
  }>;
}

interface WeddingStoreContextType {
  user: User | null;
  tasks: Task[];
  vendors: Vendor[];
  guests: Guest[];
  budget: Budget;
  timeline: TimelineEvent[];
  loading: boolean;
  updateUser: (userData: Partial<User>) => Promise<void>;
  deductAiCredit: () => Promise<boolean>;
  addAiCredits: (amount: number) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => Promise<void>;
  updateTask: (id: string, updatedFields: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addVendor: (vendor: Omit<Vendor, 'id' | 'status'>) => Promise<void>;
  updateVendor: (id: string, updatedFields: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  addGuest: (guest: Omit<Guest, 'id' | 'rsvpReceived' | 'meal' | 'table'>) => Promise<void>;
  updateGuest: (id: string, updatedFields: Partial<Guest>) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;
  updateBudgetTotal: (newTotal: number) => Promise<void>;
  addBudgetPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
  updateBudgetPayment: (id: string, updatedFields: Partial<Payment>) => Promise<void>;
  deleteBudgetPayment: (id: string) => Promise<void>;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'status'>) => Promise<void>;
  updateTimelineEvent: (id: string, updatedFields: Partial<TimelineEvent>) => Promise<void>;
  deleteTimelineEvent: (id: string) => Promise<void>;
  directMessages: DirectMessage[];
  sendDirectMessage: (chatId: string, senderId: string, senderName: string, text: string) => Promise<void>;
  resetStore: () => Promise<void>;
  loadAllData: () => Promise<void>;
}

const WeddingStoreContext = createContext<WeddingStoreContextType | undefined>(undefined);

export const WeddingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [vendors, setVendorsState] = useState<Vendor[]>([]);
  const [guests, setGuestsState] = useState<Guest[]>([]);
  const [budget, setBudgetState] = useState<Budget>({ total: 0, categories: [], payments: [] });
  const [timeline, setTimelineState] = useState<TimelineEvent[]>([]);
  const [directMessages, setDirectMessagesState] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to load item from AsyncStorage
  const loadItem = async <T,>(key: string, defaultValue: T): Promise<T> => {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Helper to save item to AsyncStorage
  const saveItem = async <T,>(key: string, value: T): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('AsyncStorage error:', error);
    }
  };

  const loadFromLocalStorage = async () => {
    const storedUser = await loadItem<User | null>('wedding_user', null);
    if (!storedUser) {
      // First initialization — pre-populate databases, but keep user as null to trigger auth screen
      await saveItem('wedding_tasks', MOCK_TASKS);
      await saveItem('wedding_vendors', MOCK_VENDORS);
      await saveItem('wedding_guests', MOCK_GUESTS);
      await saveItem('wedding_budget', MOCK_BUDGET);
      await saveItem('wedding_timeline', MOCK_TIMELINE);
      await saveItem('wedding_direct_messages', MOCK_DIRECT_MESSAGES);

      setUserState(null);
      setTasksState(MOCK_TASKS);
      setVendorsState(MOCK_VENDORS);
      setGuestsState(MOCK_GUESTS);
      setBudgetState(MOCK_BUDGET);
      setTimelineState(MOCK_TIMELINE);
      setDirectMessagesState(MOCK_DIRECT_MESSAGES);
    } else {
      setUserState(storedUser);
      setTasksState(await loadItem<Task[]>('wedding_tasks', []));
      setVendorsState(await loadItem<Vendor[]>('wedding_vendors', []));
      setGuestsState(await loadItem<Guest[]>('wedding_guests', []));
      setBudgetState(await loadItem<Budget>('wedding_budget', { total: 0, categories: [], payments: [] }));
      setTimelineState(await loadItem<TimelineEvent[]>('wedding_timeline', []));
      setDirectMessagesState(await loadItem<DirectMessage[]>('wedding_direct_messages', []));
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const authenticated = await api.isAuthenticated();
      if (authenticated) {
        try {
          const [profile, apiTasks, apiVendors, apiGuests, apiBudget, apiTimeline, apiMsgs] = await Promise.all([
            api.getProfile(),
            api.getTasks(),
            api.getVendors(),
            api.getGuests(),
            api.getBudget(),
            api.getTimeline(),
            api.getMessages()
          ]);

          setUserState(profile);
          setTasksState(apiTasks);
          setVendorsState(apiVendors);
          setGuestsState(apiGuests);
          setBudgetState(apiBudget);
          setTimelineState(apiTimeline);
          setDirectMessagesState(apiMsgs);

          // Sync cache
          await saveItem('wedding_user', profile);
          await saveItem('wedding_tasks', apiTasks);
          await saveItem('wedding_vendors', apiVendors);
          await saveItem('wedding_guests', apiGuests);
          await saveItem('wedding_budget', apiBudget);
          await saveItem('wedding_timeline', apiTimeline);
          await saveItem('wedding_direct_messages', apiMsgs);
        } catch (apiError) {
          console.error('[Store] API load error, falling back to local cache:', apiError);
          await loadFromLocalStorage();
        }
      } else {
        await loadFromLocalStorage();
      }
    } catch (e) {
      console.error('Load all data error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const updateUser = async (userData: Partial<User>) => {
    const authenticated = await api.isAuthenticated();
    if (authenticated) {
      try {
        const updatedProfile = await api.updateProfile(userData);
        setUserState(updatedProfile);
        await saveItem('wedding_user', updatedProfile);
      } catch (err) {
        console.error('[Store] API profile update failed:', err);
      }
    } else {
      const updated = user ? { ...user, ...userData } : (userData as User);
      setUserState(updated);
      await saveItem('wedding_user', updated);
    }
  };

  const deductAiCredit = async () => {
    const authenticated = await api.isAuthenticated();
    if (authenticated) {
      try {
        const success = await api.deductCredit();
        if (success) {
          const updatedProfile = await api.getProfile();
          setUserState(updatedProfile);
          await saveItem('wedding_user', updatedProfile);
          return true;
        }
        return false;
      } catch (err) {
        console.error('[Store] API deduct credit failed:', err);
        return false;
      }
    } else {
      if (user && user.aiCredits > 0) {
        await updateUser({ aiCredits: user.aiCredits - 1 });
        return true;
      }
      return false;
    }
  };

  const addAiCredits = async (amount: number) => {
    const authenticated = await api.isAuthenticated();
    if (authenticated) {
      try {
        const res = await api.addCredits(amount);
        if (res.success) {
          const updatedProfile = await api.getProfile();
          setUserState(updatedProfile);
          await saveItem('wedding_user', updatedProfile);
        }
      } catch (err) {
        console.error('[Store] API add credits failed:', err);
      }
    } else {
      if (user) {
        await updateUser({ aiCredits: (user.aiCredits || 0) + amount });
      }
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'completed'>) => {
    const authenticated = await api.isAuthenticated();
    if (authenticated) {
      try {
        const newTask = await api.createTask(task);
        const updated = [newTask, ...tasks];
        setTasksState(updated);
        await saveItem('wedding_tasks', updated);
      } catch (err) {
        console.error('[Store] API create task failed:', err);
      }
    } else {
      const newTask: Task = {
        id: `t_${Date.now()}`,
        completed: false,
        ...task,
      };
      const updated = [newTask, ...tasks];
      setTasksState(updated);
      await saveItem('wedding_tasks', updated);
    }
  };

  const updateTask = async (id: string, updatedFields: Partial<Task>) => {
    const authenticated = await api.isAuthenticated();
    if (authenticated) {
      try {
        const updatedTask = await api.updateTask(id, updatedFields);
        const updated = tasks.map((t) => (t.id === id ? updatedTask : t));
        setTasksState(updated);
        await saveItem('wedding_tasks', updated);
      } catch (err) {
        console.error('[Store] API update task failed:', err);
      }
    } else {
      const updated = tasks.map((t) => (t.id === id ? { ...t, ...updatedFields } : t));
      setTasksState(updated);
      await saveItem('wedding_tasks', updated);
    }
  };

  const deleteTask = async (id: string) => {
    const authenticated = await api.isAuthenticated();
    if (authenticated) {
      try {
        await api.deleteTask(id);
        const updated = tasks.filter((t) => t.id !== id);
        setTasksState(updated);
        await saveItem('wedding_tasks', updated);
      } catch (err) {
        console.error('[Store] API delete task failed:', err);
      }
    } else {
      const updated = tasks.filter((t) => t.id !== id);
      setTasksState(updated);
      await saveItem('wedding_tasks', updated);
    }
  };

  const addVendor = async (vendor: Omit<Vendor, 'id' | 'status'>) => {
    const authenticated = await api.isAuthenticated();
    if (authenticated) {
      try {
        const newVendor = await api.createVendor(vendor);
        const updated = [...vendors, newVendor];
        setVendorsState(updated);
        await saveItem('wedding_vendors', updated);

        // Fetch refreshed budget in case backend auto-created payments or syncs
        const updatedBudget = await api.getBudget();
        setBudgetState(updatedBudget);
        await saveItem('wedding_budget', updatedBudget);
      } catch (err) {
        console.error('[Store] API create vendor failed:', err);
      }
    } else {
      const newVendor: Vendor = {
        id: `v_${Date.now()}`,
        status: 'Shortlisted',
        ...vendor,
      };
      const updated = [...vendors, newVendor];
      setVendorsState(updated);
      await saveItem('wedding_vendors', updated);

      if (vendor.contractPrice && vendor.contractPrice > 0) {
        await addBudgetPayment({
          vendorName: vendor.name,
          category: vendor.category,
          amount: vendor.contractPrice / 2,
          date: new Date().toISOString().split('T')[0],
          status: 'Upcoming',
          method: 'Credit Card',
        });
      }
    }
  };

  const updateVendor = async (id: string, updatedFields: Partial<Vendor>) => {
    const authenticated = await api.isAuthenticated();
    if (authenticated) {
      try {
        const updatedVendor = await api.updateVendor(id, updatedFields);
        const updated = vendors.map((v) => (v.id === id ? updatedVendor : v));
        setVendorsState(updated);
        await saveItem('wedding_vendors', updated);

        // Sync budget
        const updatedBudget = await api.getBudget();
        setBudgetState(updatedBudget);
        await saveItem('wedding_budget', updatedBudget);
      } catch (err) {
        console.error('[Store] API update vendor failed:', err);
      }
    } else {
      const updated = vendors.map((v) => (v.id === id ? { ...v, ...updatedFields } : v));
      setVendorsState(updated);
      await saveItem('wedding_vendors', updated);

      // Sync budget totals locally
      if (updatedFields.contractPrice !== undefined || updatedFields.category !== undefined) {
        const vendor = vendors.find((v) => v.id === id);
        const category = updatedFields.category || vendor?.category;
        if (category) {
          const bookedInCat = updated.filter((v) => v.category === category && v.status === 'Booked');
          const totalActual = bookedInCat.reduce((sum, v) => sum + (v.contractPrice || 0), 0);
          
          const updatedCats = budget.categories.map((cat) => {
            if (cat.name === category) {
              return { ...cat, actual: totalActual || cat.estimated };
            }
            return cat;
          });
          const updatedBudget = { ...budget, categories: updatedCats };
          setBudgetState(updatedBudget);
          await saveItem('wedding_budget', updatedBudget);
        }
      }
    }
  };

  const deleteVendor = async (id: string) => {
    const authenticated = await api.isAuthenticated();
    if (authenticated) {
      try {
        await api.deleteVendor(id);
        const updated = vendors.filter((v) => v.id !== id);
        setVendorsState(updated);
        await saveItem('wedding_vendors', updated);
      } catch (err) {
        console.error('[Store] API delete vendor failed:', err);
      }
    } else {
      const updated = vendors.filter((v) => v.id !== id);
      setVendorsState(updated);
      await saveItem('wedding_vendors', updated);
    }
  };

  const addGuest = async (guest: Omit<Guest, 'id' | 'rsvpReceived' | 'meal' | 'table'>) => {
    const authenticated = await api.isAuthenticated();
    if (authenticated) {
      try {
        const newGuest = await api.createGuest(guest);
        const updated = [...guests, newGuest];
        setGuestsState(updated);
        await saveItem('wedding_guests', updated);
      } catch (err) {
        console.error('[Store] API create guest failed:', err);
      }
    } else {
      const newGuest: Guest = {
        id: `g_${Date.now()}`,
        rsvpReceived: guest.status !== 'Pending',
        meal: 'Pending',
        table: 0,
        ...guest,
      };
      const updated = [...guests, newGuest];
      setGuestsState(updated);
      await saveItem('wedding_guests', updated);
    }
  };

  const updateGuest = async (id: string, updatedFields: Partial<Guest>) => {
    const authenticated = await api.isAuthenticated();
    if (authenticated) {
      try {
        const updatedGuest = await api.updateGuest(id, updatedFields);
        const updated = guests.map((g) => (g.id === id ? updatedGuest : g));
        setGuestsState(updated);
        await saveItem('wedding_guests', updated);
      } catch (err) {
        console.error('[Store] API update guest failed:', err);
      }
    } else {
      const updated = guests.map((g) => (g.id === id ? { ...g, ...updatedFields } : g));
      setGuestsState(updated);
      await saveItem('wedding_guests', updated);
    }
  };

  const deleteGuest = async (id: string) => {
    const authenticated = await api.isAuthenticated();
    if (authenticated) {
      try {
        await api.deleteGuest(id);
        const updated = guests.filter((g) => g.id !== id);
        setGuestsState(updated);
        await saveItem('wedding_guests', updated);
      } catch (err) {
        console.error('[Store] API delete guest failed:', err);
      }
    } else {
      const updated = guests.filter((g) => g.id !== id);
      setGuestsState(updated);
      await saveItem('wedding_guests', updated);
    }
  };

  const updateBudgetTotal = async (newTotal: number) => {
    const authenticated = await api.isAuthenticated();
    if (authenticated) {
      try {
        const updatedBudget = await api.updateBudgetTotal(newTotal);
        setBudgetState(updatedBudget);
        await saveItem('wedding_budget', updatedBudget);
      } catch (err) {
        console.error('[Store] API update budget total failed:', err);
      }
    } else {
      const updated = { ...budget, total: newTotal };
      setBudgetState(updated);
      await saveItem('wedding_budget', updated);
    }
  };

  const addBudgetPayment = async (payment: Omit<Payment, 'id'>) => {
    const authenticated = await api.isAuthenticated();
    if (authenticated) {
      try {
        const newPayment = await api.addBudgetPayment(payment);
        const updated = { ...budget, payments: [newPayment, ...budget.payments] };
        setBudgetState(updated);
        await saveItem('wedding_budget', updated);
      } catch (err) {
        console.error('[Store] API add budget payment failed:', err);
      }
    } else {
      const newPayment: Payment = {
        id: `p_${Date.now()}`,
        ...payment,
      };
      const updated = { ...budget, payments: [newPayment, ...budget.payments] };
      setBudgetState(updated);
      await saveItem('wedding_budget', updated);
    }
  };

  const updateBudgetPayment = async (id: string, updatedFields: Partial<Payment>) => {
    const authenticated = await api.isAuthenticated();
    if (authenticated) {
      try {
        const updatedPayment = await api.updateBudgetPayment(id, updatedFields);
        const updatedPayments = budget.payments.map((p) => (p.id === id ? updatedPayment : p));
        const updated = { ...budget, payments: updatedPayments };
        setBudgetState(updated);
        await saveItem('wedding_budget', updated);
      } catch (err) {
        console.error('[Store] API update budget payment failed:', err);
      }
    } else {
      const updatedPayments = budget.payments.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
      const updated = { ...budget, payments: updatedPayments };
      setBudgetState(updated);
      await saveItem('wedding_budget', updated);
    }
  };

  const deleteBudgetPayment = async (id: string) => {
    const authenticated = await api.isAuthenticated();
    if (authenticated) {
      try {
        await api.deleteBudgetPayment(id);
        const updatedPayments = budget.payments.filter((p) => p.id !== id);
        const updated = { ...budget, payments: updatedPayments };
        setBudgetState(updated);
        await saveItem('wedding_budget', updated);
      } catch (err) {
        console.error('[Store] API delete budget payment failed:', err);
      }
    } else {
      const updatedPayments = budget.payments.filter((p) => p.id !== id);
      const updated = { ...budget, payments: updatedPayments };
      setBudgetState(updated);
      await saveItem('wedding_budget', updated);
    }
  };

  const addTimelineEvent = async (event: Omit<TimelineEvent, 'id' | 'status'>) => {
    const authenticated = await api.isAuthenticated();
    if (authenticated) {
      try {
        const newEvent = await api.createTimelineEvent(event);
        const updated = [...timeline, newEvent];
        // API returns sorted, but let's append and then reload if needed
        setTimelineState(updated);
        await saveItem('wedding_timeline', updated);

        // Fetch refreshed sorted timeline
        const sortedTimeline = await api.getTimeline();
        setTimelineState(sortedTimeline);
        await saveItem('wedding_timeline', sortedTimeline);
      } catch (err) {
        console.error('[Store] API create timeline event failed:', err);
      }
    } else {
      const newEvent: TimelineEvent = {
        id: `tl_${Date.now()}`,
        status: 'Pending',
        ...event,
      };
      const updated = [...timeline, newEvent];
      setTimelineState(updated);
      await saveItem('wedding_timeline', updated);
    }
  };

  const updateTimelineEvent = async (id: string, updatedFields: Partial<TimelineEvent>) => {
    const authenticated = await api.isAuthenticated();
    if (authenticated) {
      try {
        const updatedEvent = await api.updateTimelineEvent(id, updatedFields);
        const updated = timeline.map((e) => (e.id === id ? updatedEvent : e));
        setTimelineState(updated);
        await saveItem('wedding_timeline', updated);
      } catch (err) {
        console.error('[Store] API update timeline event failed:', err);
      }
    } else {
      const updated = timeline.map((e) => (e.id === id ? { ...e, ...updatedFields } : e));
      setTimelineState(updated);
      await saveItem('wedding_timeline', updated);
    }
  };

  const deleteTimelineEvent = async (id: string) => {
    const authenticated = await api.isAuthenticated();
    if (authenticated) {
      try {
        await api.deleteTimelineEvent(id);
        const updated = timeline.filter((e) => e.id !== id);
        setTimelineState(updated);
        await saveItem('wedding_timeline', updated);
      } catch (err) {
        console.error('[Store] API delete timeline event failed:', err);
      }
    } else {
      const updated = timeline.filter((e) => e.id !== id);
      setTimelineState(updated);
      await saveItem('wedding_timeline', updated);
    }
  };

  const sendDirectMessage = async (chatId: string, senderId: string, senderName: string, text: string) => {
    const authenticated = await api.isAuthenticated();
    if (authenticated) {
      try {
        const newMsg = await api.sendMessage(chatId, senderId, senderName, text);
        const updated = [...directMessages, newMsg];
        setDirectMessagesState(updated);
        await saveItem('wedding_direct_messages', updated);
      } catch (err) {
        console.error('[Store] API send message failed:', err);
      }
    } else {
      const newMsg: DirectMessage = {
        id: `msg_dm_${Date.now()}`,
        chatId,
        senderId,
        senderName,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const updated = [...directMessages, newMsg];
      setDirectMessagesState(updated);
      await saveItem('wedding_direct_messages', updated);
    }
  };

  const resetStore = async () => {
    await api.logout();
    await AsyncStorage.clear();
    await loadAllData();
  };

  return (
    <WeddingStoreContext.Provider
      value={{
        user,
        tasks,
        vendors,
        guests,
        budget,
        timeline,
        loading,
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
        addBudgetPayment,
        updateBudgetPayment,
        deleteBudgetPayment,
        addTimelineEvent,
        updateTimelineEvent,
        deleteTimelineEvent,
        directMessages,
        sendDirectMessage,
        resetStore,
        loadAllData
      }}
    >
      {children}
    </WeddingStoreContext.Provider>
  );
};

export const useWeddingStore = () => {
  const context = useContext(WeddingStoreContext);
  if (context === undefined) {
    throw new Error('useWeddingStore must be used within a WeddingProvider');
  }
  return context;
};
