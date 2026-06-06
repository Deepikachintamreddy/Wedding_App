import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_TASKS, MOCK_VENDORS, MOCK_GUESTS, MOCK_BUDGET, MOCK_TIMELINE, MOCK_DIRECT_MESSAGES, Task, Vendor, Guest, Budget, TimelineEvent, Payment, DirectMessage } from './mockData';

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

  const loadAllData = async () => {
    setLoading(true);
    try {
      const storedUser = await loadItem<User | null>('wedding_user', null);
      
      if (!storedUser) {
        // First initialization — pre-populate databases, but keep user as null to trigger sign up/log in screen
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
    const updated = user ? { ...user, ...userData } : (userData as User);
    setUserState(updated);
    await saveItem('wedding_user', updated);
  };

  const deductAiCredit = async () => {
    if (user && user.aiCredits > 0) {
      await updateUser({ aiCredits: user.aiCredits - 1 });
      return true;
    }
    return false;
  };

  const addAiCredits = async (amount: number) => {
    if (user) {
      await updateUser({ aiCredits: (user.aiCredits || 0) + amount });
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      id: `t_${Date.now()}`,
      completed: false,
      ...task,
    };
    const updated = [newTask, ...tasks];
    setTasksState(updated);
    await saveItem('wedding_tasks', updated);
  };

  const updateTask = async (id: string, updatedFields: Partial<Task>) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, ...updatedFields } : t));
    setTasksState(updated);
    await saveItem('wedding_tasks', updated);
  };

  const deleteTask = async (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasksState(updated);
    await saveItem('wedding_tasks', updated);
  };

  const addVendor = async (vendor: Omit<Vendor, 'id' | 'status'>) => {
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
  };

  const updateVendor = async (id: string, updatedFields: Partial<Vendor>) => {
    const updated = vendors.map((v) => (v.id === id ? { ...v, ...updatedFields } : v));
    setVendorsState(updated);
    await saveItem('wedding_vendors', updated);

    // Sync budget totals
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
  };

  const deleteVendor = async (id: string) => {
    const updated = vendors.filter((v) => v.id !== id);
    setVendorsState(updated);
    await saveItem('wedding_vendors', updated);
  };

  const addGuest = async (guest: Omit<Guest, 'id' | 'rsvpReceived' | 'meal' | 'table'>) => {
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
  };

  const updateGuest = async (id: string, updatedFields: Partial<Guest>) => {
    const updated = guests.map((g) => (g.id === id ? { ...g, ...updatedFields } : g));
    setGuestsState(updated);
    await saveItem('wedding_guests', updated);
  };

  const deleteGuest = async (id: string) => {
    const updated = guests.filter((g) => g.id !== id);
    setGuestsState(updated);
    await saveItem('wedding_guests', updated);
  };

  const updateBudgetTotal = async (newTotal: number) => {
    const updated = { ...budget, total: newTotal };
    setBudgetState(updated);
    await saveItem('wedding_budget', updated);
  };

  const addBudgetPayment = async (payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      id: `p_${Date.now()}`,
      ...payment,
    };
    const updated = { ...budget, payments: [newPayment, ...budget.payments] };
    setBudgetState(updated);
    await saveItem('wedding_budget', updated);
  };

  const updateBudgetPayment = async (id: string, updatedFields: Partial<Payment>) => {
    const updatedPayments = budget.payments.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
    const updated = { ...budget, payments: updatedPayments };
    setBudgetState(updated);
    await saveItem('wedding_budget', updated);
  };

  const deleteBudgetPayment = async (id: string) => {
    const updatedPayments = budget.payments.filter((p) => p.id !== id);
    const updated = { ...budget, payments: updatedPayments };
    setBudgetState(updated);
    await saveItem('wedding_budget', updated);
  };

  const addTimelineEvent = async (event: Omit<TimelineEvent, 'id' | 'status'>) => {
    const newEvent: TimelineEvent = {
      id: `tl_${Date.now()}`,
      status: 'Pending',
      ...event,
    };
    const updated = [...timeline, newEvent];
    setTimelineState(updated);
    await saveItem('wedding_timeline', updated);
  };

  const updateTimelineEvent = async (id: string, updatedFields: Partial<TimelineEvent>) => {
    const updated = timeline.map((e) => (e.id === id ? { ...e, ...updatedFields } : e));
    setTimelineState(updated);
    await saveItem('wedding_timeline', updated);
  };

  const deleteTimelineEvent = async (id: string) => {
    const updated = timeline.filter((e) => e.id !== id);
    setTimelineState(updated);
    await saveItem('wedding_timeline', updated);
  };

  const sendDirectMessage = async (chatId: string, senderId: string, senderName: string, text: string) => {
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
  };

  const resetStore = async () => {
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
