import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const getApiBase = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':').shift();
    return `http://${ip}:5000/api`;
  }
  return 'http://localhost:5000/api';
};

const API_BASE = getApiBase();
console.log('[API] Resolved backend base URL to:', API_BASE);

const getHeaders = async () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  try {
    const token = await AsyncStorage.getItem('wedding_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('[API] Error reading token from AsyncStorage', err);
  }
  return headers;
};

export const api = {
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('wedding_token');
      return !!token;
    } catch {
      return false;
    }
  },

  // Auth operations
  async register(data: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Registration failed');
    
    if (result.token) {
      await AsyncStorage.setItem('wedding_token', result.token);
      await AsyncStorage.setItem('wedding_user', JSON.stringify(result.user));
    }
    return result;
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Login failed');
    
    if (result.token) {
      await AsyncStorage.setItem('wedding_token', result.token);
      await AsyncStorage.setItem('wedding_user', JSON.stringify(result.user));
    }
    return result;
  },

  async logout() {
    await AsyncStorage.removeItem('wedding_token');
    await AsyncStorage.removeItem('wedding_user');
    await AsyncStorage.removeItem('wedding_tasks');
    await AsyncStorage.removeItem('wedding_vendors');
    await AsyncStorage.removeItem('wedding_guests');
    await AsyncStorage.removeItem('wedding_budget');
    await AsyncStorage.removeItem('wedding_timeline');
    await AsyncStorage.removeItem('wedding_direct_messages');
  },

  async getProfile() {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/auth/me`, { headers });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async updateProfile(data: any) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update profile');
    }
    return res.json();
  },

  async deductCredit() {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/user/deduct-credit`, {
      method: 'POST',
      headers,
    });
    if (!res.ok) return false;
    const result = await res.json();
    return result.success;
  },

  async addCredits(amount: number) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/user/add-credits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error('Failed to add credits');
    return res.json();
  },

  // Task operations
  async getTasks() {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/tasks`, { headers });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async createTask(task: any) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  async updateTask(id: string, updatedFields: any) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updatedFields),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  async deleteTask(id: string) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error('Failed to delete task');
    return res.json();
  },

  // Vendor operations
  async getVendors() {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/vendors`, { headers });
    if (!res.ok) throw new Error('Failed to fetch vendors');
    return res.json();
  },

  async createVendor(vendor: any) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/vendors`, {
      method: 'POST',
      headers,
      body: JSON.stringify(vendor),
    });
    if (!res.ok) throw new Error('Failed to create vendor');
    return res.json();
  },

  async updateVendor(id: string, updatedFields: any) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/vendors/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updatedFields),
    });
    if (!res.ok) throw new Error('Failed to update vendor');
    return res.json();
  },

  async deleteVendor(id: string) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/vendors/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error('Failed to delete vendor');
    return res.json();
  },

  // Guest operations
  async getGuests() {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/guests`, { headers });
    if (!res.ok) throw new Error('Failed to fetch guests');
    return res.json();
  },

  async createGuest(guest: any) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/guests`, {
      method: 'POST',
      headers,
      body: JSON.stringify(guest),
    });
    if (!res.ok) throw new Error('Failed to create guest');
    return res.json();
  },

  async updateGuest(id: string, updatedFields: any) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/guests/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updatedFields),
    });
    if (!res.ok) throw new Error('Failed to update guest');
    return res.json();
  },

  async deleteGuest(id: string) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/guests/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error('Failed to delete guest');
    return res.json();
  },

  // Budget operations
  async getBudget() {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/budget`, { headers });
    if (!res.ok) throw new Error('Failed to fetch budget');
    return res.json();
  },

  async updateBudgetTotal(total: number) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/budget/total`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ total }),
    });
    if (!res.ok) throw new Error('Failed to update budget total');
    return res.json();
  },

  async updateBudgetCategory(name: string, updatedFields: any) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/budget/categories/${name}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updatedFields),
    });
    if (!res.ok) throw new Error('Failed to update budget category');
    return res.json();
  },

  async addBudgetPayment(payment: any) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/budget/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payment),
    });
    if (!res.ok) throw new Error('Failed to create payment');
    return res.json();
  },

  async updateBudgetPayment(id: string, updatedFields: any) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/budget/payments/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updatedFields),
    });
    if (!res.ok) throw new Error('Failed to update payment');
    return res.json();
  },

  async deleteBudgetPayment(id: string) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/budget/payments/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error('Failed to delete payment');
    return res.json();
  },

  // Timeline operations
  async getTimeline() {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/timeline`, { headers });
    if (!res.ok) throw new Error('Failed to fetch timeline');
    return res.json();
  },

  async createTimelineEvent(event: any) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/timeline`, {
      method: 'POST',
      headers,
      body: JSON.stringify(event),
    });
    if (!res.ok) throw new Error('Failed to create timeline event');
    return res.json();
  },

  async updateTimelineEvent(id: string, updatedFields: any) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/timeline/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updatedFields),
    });
    if (!res.ok) throw new Error('Failed to update timeline event');
    return res.json();
  },

  async deleteTimelineEvent(id: string) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/timeline/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error('Failed to delete timeline event');
    return res.json();
  },

  // Messaging operations
  async getMessages() {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/messages`, { headers });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  async sendMessage(chatId: string, senderId: string, senderName: string, text: string) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ chatId, senderId, senderName, text }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  // AI Chat
  async sendAiChat(message: string) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to communicate with AI Concierge');
    return result;
  }
};
